import type { Message } from "@/features/conversations/types";
import type { ChatMessage } from "./types";

/**
 * Maps newest-first cursor page messages from the API into chronological
 * `ChatMessage` objects for presentation in the conversation transcript.
 */
export function mapApiMessagesToChatMessages(
  items: Message[] = [],
  conversationId?: string
): ChatMessage[] {
  return [...items].reverse().map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    status: "complete" as const,
    conversationId,
  }));
}
