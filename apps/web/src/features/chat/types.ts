import type {
  FeedbackRating,
  MessageSource,
} from "@/features/conversations/types";

export type { FeedbackRating };

export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus =
  | "sending"
  | "streaming"
  | "complete"
  | "cancelled"
  | "error";

export type ChatSource = MessageSource;

export interface MessageResponse {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  updated_at: string;
  sources: ChatSource[];
  feedback: FeedbackRating | null;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status?: MessageStatus;
  conversationId?: string;
  sources: ChatSource[];
  /** Undefined until the message appears in saved history. */
  feedback?: FeedbackRating | null;
}

export interface ChatUsage {
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
}

export interface ChatStreamMetadata {
  conversation_id: string;
  source_count: number;
}

export interface ChatStreamToken {
  delta: string;
}

export interface ChatStreamComplete {
  assistant_message: MessageResponse;
  model: string;
  finish_reason: string;
  usage: ChatUsage | null;
}

export interface ChatStreamError {
  code: string;
  message: string;
}

export interface ChatRequest {
  content: string;
}

export type ChatStreamEvent =
  | { event: "metadata"; data: ChatStreamMetadata }
  | { event: "citations"; data: ChatSource[] }
  | { event: "token"; data: ChatStreamToken }
  | { event: "complete"; data: ChatStreamComplete }
  | { event: "error"; data: ChatStreamError };
