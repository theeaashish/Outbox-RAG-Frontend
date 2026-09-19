"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProjectConversation,
  deleteConversation,
  listConversations,
  listMessages,
} from "./api";
import { conversationKeys } from "./keys";

export function useConversations(knowledgeBaseId: string | undefined) {
  return useQuery({
    queryKey: knowledgeBaseId
      ? conversationKeys.list(knowledgeBaseId)
      : conversationKeys.lists(),
    queryFn: ({ signal }) => listConversations(knowledgeBaseId!, { signal }),
    enabled: Boolean(knowledgeBaseId),
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

