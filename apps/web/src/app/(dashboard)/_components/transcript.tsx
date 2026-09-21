import { memo } from "react";
import type { ChatMessage, ChatSource } from "@/features/chat";
import { ChatMarkdown } from "./chat-markdown";

export function ConversationTranscript({
  messages,
  sources,
}: {
  messages: ChatMessage[];
  sources: ChatSource[];
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        Send a message to start this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {sources.length > 0 && (
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">
            Sources
          </p>
          <ul className="flex flex-col gap-1">
            {sources.map((source) => (
              <li key={`${source.document_id}-${source.chunk_index}`}>
                [{source.citation}] {source.document_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const MessageBubble = memo(
  function MessageBubble({ message }: { message: ChatMessage }) {
    const assistant = message.role === "assistant";
    const isStreaming = message.status === "streaming";

    return (
      <div className={assistant ? "w-full" : "flex justify-end"}>
        {assistant ? (
          <div className="w-full text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {message.content ? (
              <ChatMarkdown
                content={message.content}
                isStreaming={isStreaming}
              />
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1 py-1 text-zinc-400 dark:text-zinc-500">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:200ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:400ms]" />
              </span>
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
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.status === next.message.status &&
    prev.message.role === next.message.role
);
