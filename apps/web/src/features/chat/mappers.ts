import type { UIMessage } from "@tanstack/ai-react";
import type { Message } from "@/features/conversations/types";
import type { ChatMessage } from "./types";

export function mapBackendMessagesToUiMessages(
  messages: readonly Message[]
): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text", content: message.content }],
    createdAt: new Date(message.created_at),
  }));
}

export function mapUiMessagesToChatMessages(
  messages: readonly UIMessage[],
  conversationId: string
): ChatMessage[] {
  return messages.flatMap((message) => {
    const content = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.content)
      .join("");

    // TanStack creates an empty runtime assistant on a pre-token RUN_ERROR.
    // It is not an application message and must never reach presentation.
    if (message.role === "assistant" && content.length === 0) {
      return [];
    }

    return [
      {
        id: message.id,
        role: message.role,
        content,
        createdAt: (message.createdAt ?? new Date()).toISOString(),
        status: "complete" as const,
        conversationId,
      },
    ];
  });
}
