"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ConversationTranscript } from "@/app/(dashboard)/_components/transcript";
import { useChatComposer } from "@/app/(dashboard)/_hooks/use-chat-composer";
import {
  useConversationChatHistory,
  type Message,
} from "@/features/conversations";
import {
  mapBackendMessagesToUiMessages,
  type ChatMessage,
  type ChatSource,
} from "@/features/chat";

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
        sources={[]}
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
        sources={[]}
        composer={inactiveComposer}
        project={project}
      />
    );
  }

  return (
    <ConversationChatRuntime
      key={conversationId}
      conversationId={conversationId}
      initialHistory={initialHistory}
      reconcileHistory={reconcileHistory}
      project={project}
    />
  );
}

function ConversationChatRuntime({
  conversationId,
  initialHistory,
  reconcileHistory,
  project,
}: {
  conversationId: string;
  initialHistory: Message[];
  reconcileHistory: () => Promise<Message[]>;
  project?: ProjectSummary;
}) {
  const initialMessages = useMemo(
    () => mapBackendMessagesToUiMessages(initialHistory),
    [initialHistory]
  );
  const composer = useChatComposer({
    conversationId,
    initialMessages,
    reconcileHistory,
  });

  return (
    <ChatSurface
      messages={composer.messages}
      sources={composer.sources}
      composer={composer}
      project={project}
    />
  );
}

function ChatSurface({
  messages,
  sources,
  composer,
  project,
}: {
  messages: ChatMessage[];
  sources: ChatSource[];
  composer: ChatSurfaceComposer;
  project?: ProjectSummary;
}) {
  return (
    <div className="relative flex flex-1 flex-col justify-between overflow-y-auto px-4 py-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-4">
        <ConversationTranscript messages={messages} sources={sources} />
      </div>

      <div className="mx-auto w-full max-w-2xl pb-2 pt-4">
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
          onSubmit={composer.submit}
          onCancel={composer.cancel}
          branch={{ id: "main", name: "Main" }}
          project={project}
          contextUsage={undefined}
          disabled={composer.disabled}
        />
      </div>
    </div>
  );
}
