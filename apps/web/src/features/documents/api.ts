import { apiClient } from "@/lib/api";
import type { Document, DocumentListResponse } from "./types";

const DOCUMENTS_PATH = "/api/v1/knowledge-bases";

export function uploadDocument(
  knowledgeBaseId: string,
  file: File,
  options: { signal?: AbortSignal } = {}
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post<Document>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents`,
    formData,
    options
  );
}

export function listDocuments(
  knowledgeBaseId: string,
  options: { signal?: AbortSignal } = {}
): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents`,
    options
  );
}
