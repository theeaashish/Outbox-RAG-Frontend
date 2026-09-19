import type { ChatMessage, ChatSource } from "@/features/chat";

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
    <div className="flex flex-col gap-4">
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

function MessageBubble({ message }: { message: ChatMessage }) {
  const assistant = message.role === "assistant";
  return (
    <div className={assistant ? "flex justify-start" : "flex justify-end"}>
      <p
        className={
          assistant
            ? "max-w-[85%] whitespace-pre-wrap rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            : "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-100/90 px-4 py-3 text-xs leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }
      >
        {message.content || (message.status === "streaming" ? "..." : "")}
      </p>
    </div>
  );
}
