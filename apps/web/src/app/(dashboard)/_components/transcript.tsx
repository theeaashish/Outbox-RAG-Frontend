"use client";

import { memo, useCallback, useState } from "react";
import type { ChatMessage } from "@/features/chat";
import { retryableAssistantMessageId } from "./assistant-turn";
import { ChatMarkdown } from "./chat-markdown";
import { MessageActions } from "./message-actions";
import { SourcesDrawer } from "./sources-drawer";

interface ConversationTranscriptProps {
  conversationId?: string;
  messages: ChatMessage[];
  /** True while a turn is being submitted, streamed, or cancelled. */
  runInFlight: boolean;
  /**
   * Called with the latest assistant message id.
   * Omitted when the composer cannot accept another turn.
   */
  onRetry?: (messageId: string) => void;
}

export function ConversationTranscript({
  conversationId,
  messages,
  runInFlight,
  onRetry,
}: ConversationTranscriptProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        Send a message to start this conversation.
      </div>
    );
  }

  const retryMessageId =
    onRetry && !runInFlight ? retryableAssistantMessageId(messages) : null;

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          conversationId={conversationId}
          message={message}
          onRetry={message.id === retryMessageId ? onRetry : undefined}
        />
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  conversationId?: string;
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

const MessageBubble = memo(
  function MessageBubble({
    conversationId,
    message,
    onRetry,
  }: MessageBubbleProps) {
    const assistant = message.role === "assistant";
    const isStreaming = message.status === "streaming";
    const sources = message.sources;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [highlightedCitation, setHighlightedCitation] = useState<
      number | null
    >(null);

    const handleSelectSource = useCallback((citation: number) => {
      setDrawerOpen(true);
      setHighlightedCitation(citation);
    }, []);

    return (
      <div className={assistant ? "w-full" : "flex justify-end"}>
        {assistant ? (
          <div className="w-full text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {message.content ? (
              <ChatMarkdown
                content={message.content}
                sources={sources}
                isStreaming={isStreaming}
                onSelectSource={handleSelectSource}
              />
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1 py-1 text-zinc-400 dark:text-zinc-500">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:200ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:400ms]" />
              </span>
            ) : null}

            {sources.length > 0 ? (
              <SourcesDrawer
                messageId={message.id}
                sources={sources}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                highlightedCitation={highlightedCitation}
              />
            ) : null}

            {!isStreaming && message.content ? (
              <MessageActions
                messageId={message.id}
                conversationId={conversationId}
                rating={message.feedback}
                content={message.content}
                onRetry={onRetry ? () => onRetry(message.id) : undefined}
              />
            ) : null}
          </div>
        ) : (
          <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-zinc-100/90 px-4 py-2.5 text-sm leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            {message.content}
          </div>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.conversationId === next.conversationId &&
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.status === next.message.status &&
    prev.message.role === next.message.role &&
    prev.message.feedback === next.message.feedback &&
    prev.message.sources === next.message.sources &&
    prev.onRetry === next.onRetry
);
