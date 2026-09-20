import { z } from "zod";
import type { UseChatOptions } from "@tanstack/ai-react";
import { isApiError } from "@/lib/api";

const citationSourceSchema = z
  .object({
    citation: z.number().int().positive(),
    document_id: z.string().uuid(),
    document_name: z.string(),
    chunk_index: z.number().int().nonnegative(),
    score: z.number(),
  })
  .strict();

const metadataSchema = z
  .object({
    conversationId: z.string().uuid(),
    sourceCount: z.number().int().nonnegative(),
  })
  .strict();

const citationsSchema = z
  .object({
    sources: z.array(citationSourceSchema),
  })
  .strict();

export type ChatMetadataEvent = z.infer<typeof metadataSchema>;
export type ChatCitationsEvent = z.infer<typeof citationsSchema>;
export type ChatStreamChunk = Parameters<
  NonNullable<UseChatOptions["onChunk"]>
>[0];

export type AgUiRunPhase =
  | "awaiting-start"
  | "active"
  | "stopping"
  | "terminal";

export type AgUiRunTerminal =
  | { type: "finished" }
  | { type: "error"; code?: string };

export interface AgUiRunFence {
  conversationId: string;
  epoch: number;
  phase: AgUiRunPhase;
  runId?: string;
  sourceCount?: number;
  metadataSeen: boolean;
  citationsSeen: boolean;
  terminal?: AgUiRunTerminal;
}

export type RunEventResult = "accepted" | "ignored" | "protocol-error";
export type CustomEventResult =
  | { type: "accepted" }
  | { type: "citations"; sources: ChatCitationsEvent["sources"] }
  | { type: "protocol-error" };

export type ChatFailureKind =
  | "validation"
  | "authentication"
  | "authorization"
  | "not-found"
  | "timeout"
  | "output-limit"
  | "provider"
  | "persistence"
  | "transport"
  | "protocol"
  | "internal"
  | "unexpected";

export interface ChatFailure {
  kind: ChatFailureKind;
  message: string;
  reconcile: boolean;
}

export function parseMetadataEvent(data: unknown) {
  return metadataSchema.safeParse(data);
}

export function parseCitationsEvent(data: unknown) {
  return citationsSchema.safeParse(data);
}

export function observeRunEvent(
  run: AgUiRunFence,
  chunk: ChatStreamChunk
): RunEventResult {
  if (run.phase === "stopping" || run.phase === "terminal") return "ignored";

  if (chunk.type === "RUN_STARTED") {
    if (
      run.phase !== "awaiting-start" ||
      chunk.threadId !== run.conversationId ||
      typeof chunk.runId !== "string" ||
      chunk.runId.length === 0
    ) {
      return "protocol-error";
    }

    run.runId = chunk.runId;
    run.phase = "active";
    return "accepted";
  }

  if (chunk.type === "RUN_FINISHED") {
    if (
      run.phase !== "active" ||
      !run.runId ||
      chunk.runId !== run.runId ||
      chunk.threadId !== run.conversationId ||
      !run.metadataSeen ||
      !run.citationsSeen
    ) {
      run.terminal = { type: "error", code: "PROTOCOL_ERROR" };
      run.phase = "terminal";
      return "protocol-error";
    }

    run.terminal = { type: "finished" };
    run.phase = "terminal";
    return "accepted";
  }

  if (chunk.type === "RUN_ERROR") {
    if (run.phase !== "active") return "protocol-error";

    run.terminal = {
      type: "error",
      ...(typeof chunk.code === "string" ? { code: chunk.code } : {}),
    };
    run.phase = "terminal";
    return "accepted";
  }

  return "ignored";
}

export function observeCustomEvent(
  run: AgUiRunFence,
  eventType: string,
  data: unknown
): CustomEventResult {
  if (run.phase !== "active") return { type: "protocol-error" };

  if (eventType === "metadata") {
    const parsed = parseMetadataEvent(data);
    if (
      !parsed.success ||
      run.metadataSeen ||
      parsed.data.conversationId !== run.conversationId
    ) {
      return { type: "protocol-error" };
    }

    run.metadataSeen = true;
    run.sourceCount = parsed.data.sourceCount;
    return { type: "accepted" };
  }

  if (eventType === "citations") {
    const parsed = parseCitationsEvent(data);
    if (
      !parsed.success ||
      !run.metadataSeen ||
      run.citationsSeen ||
      parsed.data.sources.length !== run.sourceCount
    ) {
      return { type: "protocol-error" };
    }

    run.citationsSeen = true;
    return { type: "citations", sources: parsed.data.sources };
  }

  return { type: "protocol-error" };
}

export function protocolFailure(): ChatFailure {
  return {
    kind: "protocol",
    message: "The assistant returned an invalid response. Please try again.",
    reconcile: true,
  };
}

export function classifyChatFailure(options: {
  code?: string;
  error?: unknown;
  streamStarted: boolean;
}): ChatFailure {
  switch (options.code) {
    case "TTFT_TIMEOUT":
    case "IDLE_TIMEOUT":
    case "TOTAL_TIMEOUT":
      return {
        kind: "timeout",
        message: "The assistant response timed out. Please try again.",
        reconcile: true,
      };
    case "OUTPUT_LIMIT":
      return {
        kind: "output-limit",
        message: "The assistant response exceeded the output limit.",
        reconcile: true,
      };
    case "PROVIDER_ERROR":
      return {
        kind: "provider",
        message: "The assistant is temporarily unavailable. Please try again.",
        reconcile: true,
      };
    case "PERSISTENCE_ERROR":
      return {
        kind: "persistence",
        message: "The assistant response could not be saved.",
        reconcile: true,
      };
    case "conversation_not_found":
      return {
        kind: "not-found",
        message: "This conversation is no longer available.",
        reconcile: options.streamStarted,
      };
    case "INTERNAL_ERROR":
      return {
        kind: "internal",
        message: "Something went wrong while generating the response.",
        reconcile: true,
      };
    case "PROTOCOL_ERROR":
      return protocolFailure();
  }

  if (isApiError(options.error)) {
    if (options.error.status === 400 || options.error.status === 422) {
      return {
        kind: "validation",
        message: "That message could not be sent. Check it and try again.",
        reconcile: false,
      };
    }
    if (options.error.status === 401) {
      return {
        kind: "authentication",
        message: "Your session has expired. Please sign in again.",
        reconcile: false,
      };
    }
    if (options.error.status === 403) {
      return {
        kind: "authorization",
        message: "You do not have access to this conversation.",
        reconcile: false,
      };
    }
    if (options.error.status === 404) {
      return {
        kind: "not-found",
        message: "This conversation is no longer available.",
        reconcile: options.streamStarted,
      };
    }
    if (options.error.status >= 500) {
      return {
        kind: "internal",
        message: "Something went wrong while generating the response.",
        reconcile: true,
      };
    }
  }

  if (options.error instanceof TypeError) {
    return {
      kind: "transport",
      message: "The connection was lost. Check your network and try again.",
      reconcile: true,
    };
  }

  return {
    kind: "unexpected",
    message: "Something went wrong while generating the response.",
    reconcile: true,
  };
}
