import { apiClient } from "@/lib/api";
import { isApiError } from "@/lib/api/errors";
import {
  StorageUploadError,
  uploadToStorageViaXhr,
} from "@/lib/storage-upload";
import type {
  Document,
  DocumentListResponse,
  DocumentUploadSession,
  InitiateDocumentUploadRequest,
} from "./types";

const DOCUMENTS_PATH = "/api/v1/knowledge-bases";
export const PDF_CONTENT_TYPE = "application/pdf";

type RequestOptions = { signal?: AbortSignal };

export function listDocuments(
  knowledgeBaseId: string,
  options: RequestOptions = {}
): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents`,
    options
  );
}

export function initiateDocumentUpload(
  knowledgeBaseId: string,
  request: InitiateDocumentUploadRequest,
  options: RequestOptions = {}
): Promise<DocumentUploadSession> {
  return apiClient.post<DocumentUploadSession>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents/upload/initiate`,
    request,
    options
  );
}

export function refreshUploadAuthorization(
  knowledgeBaseId: string,
  documentId: string,
  options: RequestOptions = {}
): Promise<DocumentUploadSession> {
  return apiClient.post<DocumentUploadSession>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents/${documentId}/upload/refresh`,
    undefined,
    options
  );
}

export function completeDocumentUpload(
  knowledgeBaseId: string,
  documentId: string,
  options: RequestOptions = {}
): Promise<Document> {
  return apiClient.post<Document>(
    `${DOCUMENTS_PATH}/${knowledgeBaseId}/documents/${documentId}/complete`,
    undefined,
    options
  );
}

// Progress of one upload, mutated in place so a retry can resume where it stopped
export interface UploadCheckpoint {
  documentId?: string;
  storageDone?: boolean;
}

export type TransferPhase = "initiating" | "uploading" | "finalizing";

export interface UploadDocumentOptions extends RequestOptions {
  checkpoint?: UploadCheckpoint;
  onPhase?: (phase: TransferPhase) => void;
  onProgress?: (percent: number) => void;
}

// The server answering "gone" or "conflict" means the pending document can't be resumed
function isUnresumable(err: unknown): boolean {
  return isApiError(err) && [404, 409, 410].includes(err.status);
}

// Resumes with fresh credentials when a document already exists, otherwise starts a new session
async function getUploadSession(
  knowledgeBaseId: string,
  file: File,
  checkpoint: UploadCheckpoint,
  signal?: AbortSignal
): Promise<DocumentUploadSession> {
  if (checkpoint.documentId) {
    try {
      return await refreshUploadAuthorization(
        knowledgeBaseId,
        checkpoint.documentId,
        { signal }
      );
    } catch (err) {
      if (!isUnresumable(err)) throw err;
      checkpoint.documentId = undefined;
    }
  }

  const session = await initiateDocumentUpload(
    knowledgeBaseId,
    {
      filename: file.name,
      content_type: PDF_CONTENT_TYPE,
      file_size: file.size,
    },
    { signal }
  );
  checkpoint.documentId = session.document_id;
  return session;
}

// initiate -> direct upload to storage -> complete (server verifies and queues indexing)
export async function uploadDocument(
  knowledgeBaseId: string,
  file: File,
  { signal, onPhase, onProgress, checkpoint = {} }: UploadDocumentOptions = {}
): Promise<Document> {
  if (!checkpoint.storageDone) {
    onPhase?.("initiating");
    const session = await getUploadSession(
      knowledgeBaseId,
      file,
      checkpoint,
      signal
    );

    const send = ({ upload }: DocumentUploadSession) =>
      uploadToStorageViaXhr({
        url: upload.url,
        method: upload.method,
        formFields: upload.form_fields,
        headers: upload.headers,
        file,
        signal,
        onProgress,
      });

    onPhase?.("uploading");
    try {
      await send(session);
    } catch (err) {
      if (!(err instanceof StorageUploadError && err.isExpired)) throw err;
      // Presigned policy expired mid-transfer: reset progress and refresh once to retry
      onProgress?.(0);
      await send(
        await refreshUploadAuthorization(knowledgeBaseId, session.document_id, {
          signal,
        })
      );
    }
    checkpoint.storageDone = true;
  }

  const { documentId } = checkpoint;
  if (!documentId) throw new Error("Upload was not initiated.");

  onPhase?.("finalizing");
  try {
    return await completeDocumentUpload(knowledgeBaseId, documentId, {
      signal,
    });
  } catch (err) {
    if (isUnresumable(err)) {
      checkpoint.documentId = undefined;
      checkpoint.storageDone = false;
    }
    throw err;
  }
}
