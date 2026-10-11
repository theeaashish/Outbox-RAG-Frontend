"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { cx } from "@repo/ui";
import { toast } from "sonner";
import {
  AiChatComposer,
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  type ComposerMode,
  type ComposerStatus,
  type ComposerSubmitData,
  type Model,
} from "@/components/ai-chat";
import { promptForRetry } from "@/app/(dashboard)/_components/assistant-turn";
import { ConversationTranscript } from "@/app/(dashboard)/_components/transcript";
import { useChatComposer } from "@/app/(dashboard)/_hooks/use-chat-composer";
import { useChatScroll } from "@/app/(dashboard)/_hooks/use-chat-scroll";
import {
  useConversationChatHistory,
  type Message,
} from "@/features/conversations";
import type { ChatMessage } from "@/features/chat";

interface ProjectSummary {
  id: string;
  name: string;
}

interface ConversationChatProps {
  conversationId?: string;
  project?: ProjectSummary;
}

interface ChatSurfaceComposer {
  draft: string;
  setDraft: (value: string) => void;
  model: Model;
  setModel: (model: Model) => void;
  effort: number;
  setEffort: (effort: number) => void;
  mode: ComposerMode;
  setMode: (mode: ComposerMode) => void;
  status: ComposerStatus;
  submit: (data: ComposerSubmitData) => void;
  cancel: () => void;
  disabled: boolean;
}

const noop = () => undefined;
const DEFAULT_BRANCH = { id: "main", name: "Main" } as const;
const inactiveComposer: ChatSurfaceComposer = {
  draft: "",
  setDraft: noop,
  model: DEFAULT_MODEL,
  setModel: noop,
  effort: DEFAULT_EFFORT,
  setEffort: noop,
  mode: "agent",
  setMode: noop,
  status: "idle",
  submit: noop,
  cancel: noop,
  disabled: true,
};

export function ConversationChat({
  conversationId,
  project,
}: ConversationChatProps) {
  if (!conversationId) {
    return (
      <ChatSurface
        messages={[]}
        composer={inactiveComposer}
        project={project}
      />
    );
  }

  return (
    <ConversationHistoryGate
      key={conversationId}
      conversationId={conversationId}
      project={project}
    />
  );
}

function ConversationHistoryGate({
  conversationId,
  project,
}: Required<Pick<ConversationChatProps, "conversationId">> &
  Pick<ConversationChatProps, "project">) {
  const historyQuery = useConversationChatHistory(conversationId);
  const [initialHistory, setInitialHistory] = useState<Message[] | null>(null);

  useEffect(() => {
    if (
      initialHistory === null &&
      historyQuery.isSuccess &&
      historyQuery.isFetchedAfterMount &&
      !historyQuery.isFetching &&
      !historyQuery.isRefetchError
    ) {
      setInitialHistory(historyQuery.data);
    }
  }, [
    historyQuery.data,
    historyQuery.isFetchedAfterMount,
    historyQuery.isFetching,
    historyQuery.isRefetchError,
    historyQuery.isSuccess,
    initialHistory,
  ]);

  useEffect(() => {
    if (initialHistory === null && historyQuery.error) {
      toast.error("Conversation history could not be loaded.");
    }
  }, [historyQuery.error, initialHistory]);

  const refetch = historyQuery.refetch;
  const reconcileHistory = useCallback(async () => {
    const result = await refetch({ cancelRefetch: true });
    if (result.error) throw result.error;
    if (!result.data) throw new Error("Conversation history was unavailable");
    return result.data;
  }, [refetch]);

  if (initialHistory === null) {
    return (
      <ChatSurface
        messages={[]}
        composer={inactiveComposer}
        project={project}
      />
    );
  }

  return (
    <ConversationChatRuntime
      key={conversationId}
      conversationId={conversationId}
      history={historyQuery.data ?? initialHistory}
      reconcileHistory={reconcileHistory}
      project={project}
    />
  );
}

function ConversationChatRuntime({
  conversationId,
  history,
  reconcileHistory,
  project,
}: {
  conversationId: string;
  history: Message[];
  reconcileHistory: () => Promise<Message[]>;
  project?: ProjectSummary;
}) {
  const composer = useChatComposer({
    conversationId,
    history,
    reconcileHistory,
  });

  return (
    <ChatSurface
      conversationId={conversationId}
      messages={composer.messages}
      composer={composer}
      project={project}
    />
  );
}

function ChatSurface({
  conversationId,
  messages,
  composer,
  project,
}: {
  conversationId?: string;
  messages: ChatMessage[];
  composer: ChatSurfaceComposer;
  project?: ProjectSummary;
}) {
  const { scrollContainerRef, contentRef, scrollToBottom, isAtBottom } =
    useChatScroll();

  const handleSubmit = useCallback(
    (data: ComposerSubmitData) => {
      composer.submit(data);
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    },
    [composer, scrollToBottom]
  );

  const runInFlight =
    composer.status === "submitting" ||
    composer.status === "streaming" ||
    composer.status === "cancelling";

  const handleRetry = useCallback(
    (messageId: string) => {
      if (composer.disabled || runInFlight) return;

      const text = promptForRetry(messages, messageId);
      if (!text) return;

      handleSubmit({
        text,
        model: composer.model,
        effort: composer.effort,
        mode: composer.mode,
        attachments: [],
      });
    },
    [
      messages,
      composer.disabled,
      composer.model,
      composer.effort,
      composer.mode,
      runInFlight,
      handleSubmit,
    ]
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Scrollable messages container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-8"
      >
        <div
          ref={contentRef}
          className={cx(
            "mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-4 pb-6",
            messages.length === 0 ? "justify-center" : "justify-start"
          )}
        >
          <ConversationTranscript
            conversationId={conversationId}
            messages={messages}
            runInFlight={runInFlight}
            onRetry={composer.disabled || runInFlight ? undefined : handleRetry}
          />
        </div>
      </div>

      {/* Fixed bottom composer area with anchored scroll button */}
      <div className="relative shrink-0 px-4 pb-4 pt-2 sm:px-8">
        {/* Floating Scroll to Bottom Button anchored directly above composer */}
        {!isAtBottom && messages.length > 0 && (
          <div className="pointer-events-none absolute bottom-full left-0 right-0 z-10 flex justify-center pb-3">
            <button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-zinc-200/80 bg-white/95 text-zinc-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-zinc-900 hover:scale-105 active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-800/95 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>
        )}

        <div className="mx-auto w-full max-w-2xl">
          <AiChatComposer
            value={composer.draft}
            onChange={composer.setDraft}
            model={composer.model}
            effort={composer.effort}
            onModelChange={composer.setModel}
            onEffortChange={composer.setEffort}
            mode={composer.mode}
            onModeChange={composer.setMode}
            modelSelectorDisabled
            effortSelectorDisabled
            modeSelectorDisabled
            status={composer.status}
            onSubmit={handleSubmit}
            onCancel={composer.cancel}
            branch={DEFAULT_BRANCH}
            project={project}
            contextUsage={undefined}
            disabled={composer.disabled}
          />
        </div>
      </div>
    </div>
  );
}
