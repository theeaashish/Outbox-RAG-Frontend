"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createId } from "@/utils/id";
import {
  conversationKeys,
  useConversationMessages,
} from "@/features/conversations";
import {
  mapApiMessagesToChatMessages,
  streamChat,
  type ChatMessage,
  type ChatSource,
} from "@/features/chat";
import {
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  type ComposerMode,
  type ComposerStatus,
  type ComposerSubmitData,
  type Model,
} from "@/components/ai-chat";

/** Container hook: owns all composer state so the page stays presentational. */
export function useChatComposer(conversationId?: string) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState<Model>(DEFAULT_MODEL);
  const [effort, setEffort] = useState(DEFAULT_EFFORT);
  const [mode, setMode] = useState<ComposerMode>("agent");
  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const prevConversationIdRef = useRef(conversationId);
  const messagesQuery = useConversationMessages(conversationId);

  // When switching conversations, abort active stream and reset state
  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      abortRef.current?.abort();
      abortRef.current = null;
      setStatus("idle");
      setSources([]);
      setMessages(
        mapApiMessagesToChatMessages(messagesQuery.data?.items, conversationId)
      );
    }
  }, [conversationId, messagesQuery.data]);

  // When query data changes for the same conversation, sync messages only when idle
  useEffect(() => {
    if (status === "idle" && prevConversationIdRef.current === conversationId) {
      setMessages(
        mapApiMessagesToChatMessages(messagesQuery.data?.items, conversationId)
      );
    }
  }, [conversationId, messagesQuery.data, status]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const submit = useCallback(
    async (data: ComposerSubmitData) => {
      if (!conversationId) {
        toast.info("Create or select a chat before sending a message.");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const userMessageId = createId("message");
      const assistantMessageId = createId("message");
      const now = new Date().toISOString();

      setMessages((current) => [
        ...current,
        {
          id: userMessageId,
          role: "user",
          content: data.text,
          createdAt: now,
          status: "complete",
          conversationId,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: now,
          status: "streaming",
          conversationId,
        },
      ]);
      setDraft("");
      setSources([]);
      setStatus("submitting");

      try {
        for await (const event of streamChat(
          conversationId,
          { content: data.text },
          controller.signal
        )) {
          if (event.event === "citations") {
            setSources(event.data);
          } else if (event.event === "token") {
            setStatus("streaming");
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: message.content + event.data.delta,
                      status: "streaming",
                    }
                  : message
              )
            );
          } else if (event.event === "complete") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      id: event.data.assistant_message.id,
                      content: event.data.assistant_message.content,
                      createdAt: event.data.assistant_message.created_at,
                      status: "complete",
                    }
                  : message
              )
            );
            setStatus("idle");
            void queryClient.invalidateQueries({
              queryKey: conversationKeys.messages(conversationId),
            });
          } else if (event.event === "error") {
            throw new Error(event.data.message);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, status: "cancelled" }
                : message
            )
          );
          setStatus("idle");
          return;
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, status: "error" }
              : message
          )
        );
        setStatus("error");
        toast.error(error instanceof Error ? error.message : "Chat failed");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [conversationId, queryClient]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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
    messagesLoading: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
  };
}
