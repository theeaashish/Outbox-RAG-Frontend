import type { ChatMessage } from "@/features/chat";

/** The latest settled assistant reply that still has the user prompt which produced it. */
export function retryableAssistantMessageId(
  messages: readonly ChatMessage[]
): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "assistant") continue;
    if (message.status === "streaming" || message.content.trim().length === 0) {
      return null;
    }
    return userPromptBefore(messages, index) ? message.id : null;
  }

  return null;
}

/**
 * Text to send when the user asks the latest reply again.
 * There is no replace-message API, so this resubmits that user turn.
 */
export function promptForRetry(
  messages: readonly ChatMessage[],
  messageId: string
): string | null {
  if (retryableAssistantMessageId(messages) !== messageId) return null;

  const index = messages.findIndex((message) => message.id === messageId);
  if (index < 0) return null;
  return userPromptBefore(messages, index);
}

function userPromptBefore(
  messages: readonly ChatMessage[],
  assistantIndex: number
): string | null {
  for (let index = assistantIndex - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") continue;
    return message.content.trim().length > 0 ? message.content : null;
  }

  return null;
}
