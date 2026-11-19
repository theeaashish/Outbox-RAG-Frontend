import type { UIMessage } from "@tanstack/ai-react";
import type { Message } from "@/features/conversations/types";
import type {
  ChatMessage,
  ChatModelInfo,
  ChatModelOption,
  ChatSource,
} from "./types";

const PROVIDER_LABELS: Record<string, string> = {
  groq: "Groq",
  gemini: "Google Gemini",
  openai: "OpenAI",
};

export function formatChatModelOption(m: ChatModelInfo): ChatModelOption {
  const providerKey = m.provider?.toLowerCase() ?? "";
  const providerLabel =
    PROVIDER_LABELS[providerKey] ??
    (m.provider
      ? m.provider.charAt(0).toUpperCase() + m.provider.slice(1)
      : undefined);

  // If the backend name is formatted as "Provider (model)", extract the model part
  // for a clean label and use the provider label as description to avoid
  // "Groq (openai/...) / Groq" redundancy.
  const parenMatch = m.name.match(/^(.+?)\s*\((.+)\)$/);
  const cleanLabel = parenMatch?.[2] || m.name;

  return {
    id: m.id,
    label: cleanLabel,
    shortLabel: cleanLabel.split("/").pop() ?? cleanLabel,
    description: providerLabel,
  };
}

const NO_SOURCES: ChatSource[] = [];

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
  {
    activeAssistantId,
    activeSources,
    historyByMessageId,
  }: {
    activeAssistantId: string | null;
    activeSources: ChatSource[];
    historyByMessageId: ReadonlyMap<string, Message>;
  }
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
        sources: isStreaming
          ? activeSources
          : (historyByMessageId.get(message.id)?.sources ?? NO_SOURCES),
        feedback: historyByMessageId.get(message.id)?.feedback,
      },
    ];
  });
}
