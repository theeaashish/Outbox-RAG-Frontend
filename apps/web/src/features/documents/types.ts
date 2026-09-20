export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

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
