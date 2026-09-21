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
  conversationId: string,
  activeAssistantId?: string | null
): ChatMessage[] {
  return messages.flatMap((message) => {
    const content = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.content)
      .join("");

    const isStreaming = Boolean(
      activeAssistantId && message.id === activeAssistantId
    );

    // TanStack creates an empty runtime assistant before tokens arrive.
    // If it is actively streaming, keep it so presentation can render typing dots.
    // If it is not streaming and empty (e.g. pre-token error), filter it out.
    if (message.role === "assistant" && content.length === 0 && !isStreaming) {
      return [];
    }

    return [
      {
        id: message.id,
        role: message.role,
        content,
        createdAt: (message.createdAt ?? new Date()).toISOString(),
        status: isStreaming ? ("streaming" as const) : ("complete" as const),
        conversationId,
      },
    ];
  });
}
