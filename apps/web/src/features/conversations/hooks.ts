"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectConversation,
  deleteConversation,
  deleteMessageFeedback,
  getConversation,
  listConversationChatHistory,
  listConversations,
  listMessages,
  setMessageFeedback,
} from "./api";
import { conversationKeys } from "./keys";
import type { FeedbackRating, Message } from "./types";

export function useConversations(knowledgeBaseId: string | undefined) {
  return useQuery({
    queryKey: knowledgeBaseId
      ? conversationKeys.list(knowledgeBaseId)
      : conversationKeys.lists(),
    queryFn: ({ signal }) => listConversations(knowledgeBaseId!, { signal }),
    enabled: Boolean(knowledgeBaseId),
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.detail(conversationId)
      : conversationKeys.all,
    queryFn: ({ signal }) => getConversation(conversationId!, { signal }),
    enabled: Boolean(conversationId),
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.messages(conversationId)
      : conversationKeys.all,
    queryFn: ({ signal }) => listMessages(conversationId!, { signal }),
    enabled: Boolean(conversationId),
  });
}

export function useConversationChatHistory(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.chatHistory(conversationId),
    queryFn: ({ signal }) =>
      listConversationChatHistory(conversationId, { signal }),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateProjectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => createProjectConversation(projectId),
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(conversation.knowledge_base_id),
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
    }: {
      conversationId: string;
      knowledgeBaseId: string;
    }) => deleteConversation(conversationId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(variables.knowledgeBaseId),
      });
    },
  });
}

export function useMessageFeedback(
  conversationId: string | undefined,
  messageId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rating: FeedbackRating | null) => {
      if (rating === null) {
        await deleteMessageFeedback(messageId);
        return null;
      }
      return setMessageFeedback(messageId, rating);
    },
    onSuccess: (feedback) => {
      if (!conversationId) return;

      queryClient.setQueryData<Message[]>(
        conversationKeys.chatHistory(conversationId),
        (history) =>
          history?.map((message) =>
            message.id === messageId
              ? { ...message, feedback: feedback?.rating ?? null }
              : message
          )
      );
    },
    onError: () => {
      toast.error("Failed to update feedback. Please try again.");
    },
    onSettled: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(conversationId),
          refetchType: "none",
        });
      }
    },
  });
}
