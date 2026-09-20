"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useChat,
  type UIMessage,
} from "@tanstack/ai-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  type ComposerMode,
  type ComposerStatus,
  type ComposerSubmitData,
  type Model,
} from "@/components/ai-chat";
import {
  conversationKeys,
  type Message,
} from "@/features/conversations";
import {
  classifyChatFailure,
  createAgUiChatConnection,
  mapBackendMessagesToUiMessages,
  mapUiMessagesToChatMessages,
  observeCustomEvent,
  observeRunEvent,
  type AgUiRunFence,
  type ChatFailure,
  type ChatSource,
  type ChatStreamChunk,
} from "@/features/chat";

type SettlementPhase = "idle" | "stopping" | "reconciling";

interface ActiveRun extends AgUiRunFence {
  stopRequested: boolean;
  error?: unknown;
  baseMessages: UIMessage[];
}

interface UseChatComposerOptions {
  conversationId: string;
  initialMessages: UIMessage[];
  reconcileHistory: () => Promise<Message[]>;
}

const HISTORY_SYNC_ERROR =
  "Conversation history could not be refreshed. Reopen the conversation before sending another message.";

export function useChatComposer({
  conversationId,
  initialMessages,
  reconcileHistory,
}: UseChatComposerOptions) {
  const queryClient = useQueryClient();
  const connection = useMemo(
    () => createAgUiChatConnection(conversationId),
    [conversationId]
  );
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState<Model>(DEFAULT_MODEL);
  const [effort, setEffort] = useState(DEFAULT_EFFORT);
  const [mode, setMode] = useState<ComposerMode>("agent");
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [failure, setFailure] = useState<ChatFailure | null>(null);
  const [settlement, setSettlement] =
    useState<SettlementPhase>("idle");
  const [syncBlocked, setSyncBlocked] = useState(false);
  const epochRef = useRef(0);
  const activeRunRef = useRef<ActiveRun | null>(null);
  const mountedRef = useRef(true);
  const stopRef = useRef<() => void>(() => undefined);

  const isCurrentRun = useCallback((run: ActiveRun) => {
    const current = activeRunRef.current;
    return (
      current?.conversationId === run.conversationId &&
      current.epoch === run.epoch
    );
  }, []);

  const stopForProtocolFailure = useCallback((run: ActiveRun) => {
    if (!isCurrentRun(run)) return;

    run.phase = "stopping";
    run.terminal = { type: "error", code: "PROTOCOL_ERROR" };
    run.error = new Error("Invalid AG-UI protocol event");
    setSources([]);
    setSettlement("reconciling");
    stopRef.current();
  }, [isCurrentRun]);

  const handleChunk = useCallback(
    (chunk: ChatStreamChunk) => {
      const run = activeRunRef.current;
      if (!run || run.conversationId !== conversationId) return;

      if (observeRunEvent(run, chunk) === "protocol-error") {
        stopForProtocolFailure(run);
      }
    },
    [conversationId, stopForProtocolFailure]
  );

  const handleCustomEvent = useCallback(
    (eventType: string, data: unknown) => {
      const run = activeRunRef.current;
      if (
        !run ||
        run.conversationId !== conversationId ||
        run.phase !== "active"
      ) {
        return;
      }

      const result = observeCustomEvent(run, eventType, data);
      if (result.type === "citations") setSources(result.sources);
      if (result.type === "protocol-error") stopForProtocolFailure(run);
    },
    [conversationId, stopForProtocolFailure]
  );

  const handleError = useCallback((error: Error) => {
    const run = activeRunRef.current;
    if (!run || run.stopRequested) return;
    run.error = error;
  }, []);

  const {
    messages: uiMessages,
    sendMessage,
    stop,
    setMessages,
    status: chatStatus,
  } = useChat({
    connection,
    threadId: conversationId,
    initialMessages,
    queue: "drop",
    onChunk: handleChunk,
    onCustomEvent: handleCustomEvent,
    onError: handleError,
  });

  const messagesRef = useRef(uiMessages);
  messagesRef.current = uiMessages;
  stopRef.current = stop;

  const settleRun = useCallback(
    async (run: ActiveRun) => {
      if (!isCurrentRun(run) || !mountedRef.current) return;

      const stopped = run.stopRequested;
      const finished = run.terminal?.type === "finished" && !stopped;
      const runFailure =
        !finished && !stopped
          ? classifyChatFailure({
              ...(run.terminal?.type === "error" && run.terminal.code
                ? { code: run.terminal.code }
                : {}),
              ...(run.error !== undefined ? { error: run.error } : {}),
              streamStarted: Boolean(run.runId),
            })
          : null;

      if (!finished) setSources([]);

      if (runFailure) {
        setFailure(runFailure);
        toast.error(runFailure.message);
      }

      if (runFailure && !runFailure.reconcile) {
        setMessages(run.baseMessages);
        activeRunRef.current = null;
        setSettlement("idle");
        return;
      }

      setSettlement(stopped ? "stopping" : "reconciling");

      try {
        const canonicalHistory = await reconcileHistory();
        if (!isCurrentRun(run) || !mountedRef.current) return;

        setMessages(mapBackendMessagesToUiMessages(canonicalHistory));
        activeRunRef.current = null;
        setSettlement("idle");

        void queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(conversationId),
          exact: true,
          refetchType: "none",
        });
      } catch {
        if (!isCurrentRun(run) || !mountedRef.current) return;

        activeRunRef.current = null;
        setSyncBlocked(true);
        setFailure({
          kind: "transport",
          message: HISTORY_SYNC_ERROR,
          reconcile: true,
        });
        setSettlement("idle");
        toast.error(HISTORY_SYNC_ERROR);
      }
    },
    [conversationId, isCurrentRun, queryClient, reconcileHistory, setMessages]
  );

  const submit = useCallback(
    async (data: ComposerSubmitData) => {
      if (
        syncBlocked ||
        settlement !== "idle" ||
        activeRunRef.current ||
        chatStatus === "submitted" ||
        chatStatus === "streaming"
      ) {
        return;
      }

      const run: ActiveRun = {
        conversationId,
        epoch: ++epochRef.current,
        phase: "awaiting-start",
        metadataSeen: false,
        citationsSeen: false,
        stopRequested: false,
        baseMessages: messagesRef.current,
      };

      activeRunRef.current = run;
      setDraft("");
      setSources([]);
      setFailure(null);

      try {
        await sendMessage(data.text, { whenBusy: "drop" });
      } catch (error) {
        run.error = error;
      }

      await settleRun(run);
    },
    [
      chatStatus,
      conversationId,
      sendMessage,
      settleRun,
      settlement,
      syncBlocked,
    ]
  );

  const cancel = useCallback(() => {
    const run = activeRunRef.current;
    if (!run || run.phase === "terminal" || run.phase === "stopping") return;

    run.stopRequested = true;
    run.phase = "stopping";
    setSources([]);
    setSettlement("stopping");
    stop();
  }, [stop]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      epochRef.current += 1;
      activeRunRef.current = null;
      stop();
      void queryClient.invalidateQueries({
        queryKey: conversationKeys.chatHistory(conversationId),
        exact: true,
        refetchType: "none",
      });
    };
  }, [conversationId, queryClient, stop]);

  const status: ComposerStatus =
    settlement === "stopping"
      ? "cancelling"
      : settlement === "reconciling"
        ? "idle"
        : chatStatus === "submitted"
          ? "submitting"
          : chatStatus === "streaming"
            ? "streaming"
            : failure
              ? "error"
              : "idle";

  const messages = useMemo(
    () => mapUiMessagesToChatMessages(uiMessages, conversationId),
    [conversationId, uiMessages]
  );

  return {
    draft,
    setDraft,
    model,
    setModel,
    effort,
    setEffort,
    mode,
    setMode,
    status,
    submit,
    cancel,
    messages,
    sources,
    disabled: syncBlocked || settlement !== "idle",
  };
}
