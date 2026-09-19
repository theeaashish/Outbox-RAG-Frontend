"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDocuments, uploadDocument } from "./api";
import { documentKeys } from "./keys";

export function useKnowledgeBaseDocuments(knowledgeBaseId: string | undefined) {
  return useQuery({
    queryKey: knowledgeBaseId
      ? documentKeys.list(knowledgeBaseId)
      : documentKeys.all,
    queryFn: ({ signal }) => listDocuments(knowledgeBaseId!, { signal }),
    enabled: Boolean(knowledgeBaseId),
    refetchInterval: (query) => {
      const documents = query.state.data?.results ?? [];
      return documents.some(
        (document) =>
          document.status === "pending" || document.status === "processing"
      )
        ? 2000
        : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeBaseId, file }: { knowledgeBaseId: string; file: File }) =>
      uploadDocument(knowledgeBaseId, file),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: documentKeys.list(variables.knowledgeBaseId),
      });
    },
  });
}

