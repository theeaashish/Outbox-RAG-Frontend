export type DocumentStatus =
  | "uploading"
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export interface Document {
  id: string;
  knowledge_base_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  status: DocumentStatus;
  last_error: string | null;
  retry_count: number;
  processing_started_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  results: Document[];
}

export interface UploadAuthorization {
  url: string;
  method: string;
  expires_in: number;
  headers: Record<string, string>;
  form_fields: Record<string, string>;
}

export interface InitiateDocumentUploadRequest {
  filename: string;
  content_type: string;
  file_size: number;
}

// Returned by both /upload/initiate and /upload/refresh
export interface DocumentUploadSession {
  document_id: string;
  upload: UploadAuthorization;
}

export type InitiateDocumentUploadResponse = DocumentUploadSession;
export type RefreshUploadAuthorizationResponse = DocumentUploadSession;
export type CompleteDocumentUploadResponse = Document;

export type UploadPhase =
  | "idle"
  | "selected"
  | "initiating"
  | "uploading"
  | "finalizing"
  | "processing"
  | "completed"
  | "error";
