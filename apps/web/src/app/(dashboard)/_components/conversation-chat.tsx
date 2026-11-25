"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { LogoIcon, cx } from "@repo/ui";
import { toast } from "sonner";
import {
  AiChatComposer,
  DEFAULT_EFFORT,
  type ChatModelOption,
  type ComposerMode,
  type ComposerStatus,
  type ComposerSubmitData,
  type Model,
} from "@/components/ai-chat";
import { promptForRetry } from "@/app/(dashboard)/_components/assistant-turn";
import { ConversationTranscript } from "@/app/(dashboard)/_components/transcript";
import { useDashboardProjects } from "@/app/(dashboard)/_components/sidebar/sidebar-data-provider";
import { useChatComposer } from "@/app/(dashboard)/_hooks/use-chat-composer";
import { useChatScroll } from "@/app/(dashboard)/_hooks/use-chat-scroll";
import {
  useConversationChatHistory,
  type Message,
} from "@/features/conversations";
import { useKnowledgeBaseDocuments } from "@/features/documents";
import {
  DEFAULT_MODEL,
  FALLBACK_CHAT_MODELS,
  formatChatModelOption,
  type ChatMessage,
} from "@/features/chat";

interface ProjectSummary {
  id: string;
  name: string;
  knowledgeBaseId?: string;
}

const STARTER_PROMPTS = [
  "Summarize the key concepts",
  "What are the main takeaways?",
  "List the key topics covered",
] as const;

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
  availableModels?: readonly ChatModelOption[];
  isLoadingModels?: boolean;
}

const noop = () => undefined;
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
  availableModels: FALLBACK_CHAT_MODELS.map(formatChatModelOption),
  isLoadingModels: false,
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
        isLoadingHistory
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
  isLoadingHistory = false,
}: {
  conversationId?: string;
  messages: ChatMessage[];
  composer: ChatSurfaceComposer;
  project?: ProjectSummary;
  isLoadingHistory?: boolean;
}) {
  const { scrollContainerRef, contentRef, scrollToBottom, isAtBottom } =
    useChatScroll();
  const { openKnowledgeBase } = useDashboardProjects();
  const kbQuery = useKnowledgeBaseDocuments(project?.knowledgeBaseId);

  const handleSubmit = useCallback(
    (data: ComposerSubmitData) => {
      composer.submit(data);
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    },
    [composer, scrollToBottom]
  );

  const handleStarterSelect = useCallback(
    (prompt: string) => {
      if (composer.disabled) return;
      handleSubmit({
        text: prompt,
        model: composer.model,
        effort: composer.effort,
        mode: composer.mode,
        attachments: [],
      });
    },
    [
      composer.disabled,
      composer.effort,
      composer.mode,
      composer.model,
      handleSubmit,
    ]
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

  const composerElement = (
    <AiChatComposer
      value={composer.draft}
      onChange={composer.setDraft}
      model={composer.model}
      effort={composer.effort}
      onModelChange={composer.setModel}
      onEffortChange={composer.setEffort}
      mode={composer.mode}
      onModeChange={composer.setMode}
      models={composer.availableModels}
      modelSelectorDisabled={composer.disabled || composer.isLoadingModels}
      effortSelectorDisabled
      modeSelectorDisabled
      status={composer.status}
      onSubmit={handleSubmit}
      onCancel={composer.cancel}
      project={project}
      contextUsage={undefined}
      disabled={composer.disabled}
    />
  );

  const showEmptyWelcome = !isLoadingHistory && messages.length === 0;

  if (showEmptyWelcome) {
    const documents = kbQuery.data?.results ?? [];
    const readyCount = documents.filter((d) => d.status === "ready").length;
    const hasKb = Boolean(project?.knowledgeBaseId);
    const hasLoadedDocs = hasKb && kbQuery.isSuccess;

    const openProjectKb = () => {
      if (!project?.knowledgeBaseId) return;
      openKnowledgeBase({
        name: project.name,
        knowledgeBaseId: project.knowledgeBaseId,
        projectId: project.id,
      });
    };

    const heading = !conversationId
      ? "Select a chat to get started"
      : project?.name
        ? `Ask anything about ${project.name}`
        : "What would you like to know?";

    return (
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center">
          <LogoIcon className="mb-4 size-8" aria-hidden="true" />

          <h1 className="text-center text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
            {heading}
          </h1>

          <p className="mt-1.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {!conversationId ? (
              "Pick a conversation from the sidebar or start a new chat."
            ) : hasLoadedDocs && readyCount > 0 ? (
              <>
                <span className="tabular-nums">{readyCount}</span>{" "}
                {readyCount === 1 ? "PDF indexed" : "PDFs indexed"} and ready
                for citations.{" "}
                <button
                  type="button"
                  onClick={openProjectKb}
                  className="cursor-pointer font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
                >
                  Manage sources
                </button>
              </>
            ) : hasLoadedDocs && documents.length > 0 ? (
              <>
                <span className="tabular-nums">{documents.length}</span>{" "}
                {documents.length === 1 ? "document" : "documents"} in knowledge
                base.{" "}
                <button
                  type="button"
                  onClick={openProjectKb}
                  className="cursor-pointer font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
                >
                  View status
                </button>
              </>
            ) : hasLoadedDocs ? (
              <>
                No PDFs indexed yet.{" "}
                <button
                  type="button"
                  onClick={openProjectKb}
                  className="cursor-pointer font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
                >
                  Upload PDFs
                </button>
              </>
            ) : (
              "Ask questions grounded in your project documents."
            )}
          </p>

          <div className="mt-6 w-full">{composerElement}</div>

          {conversationId && !composer.disabled && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleStarterSelect(prompt)}
                  className="cursor-pointer rounded-full border border-zinc-200/90 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-2xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
            isLoadingHistory ? "justify-center" : "justify-start"
          )}
        >
          {isLoadingHistory ? (
            <div className="space-y-3 py-8" aria-label="Loading conversation">
              <div className="ml-auto h-9 w-56 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800/70" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/70" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/70" />
            </div>
          ) : (
            <ConversationTranscript
              conversationId={conversationId}
              messages={messages}
              runInFlight={runInFlight}
              onRetry={
                composer.disabled || runInFlight ? undefined : handleRetry
              }
            />
          )}
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

        <div className="mx-auto w-full max-w-2xl">{composerElement}</div>
      </div>
    </div>
  );
}
