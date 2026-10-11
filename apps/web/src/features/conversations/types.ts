import type { CursorPage, CursorPageInfo } from "@/lib/api";
import type { MessageRole } from "@/features/chat/types";

export type { CursorPageInfo, MessageRole };

export type FeedbackRating = "up" | "down";

export interface MessageSource {
  id?: string;
  citation: number;
  is_cited?: boolean;
  source_order?: number;
  document_id?: string | null;
  document_chunk_id?: string | null;
  document_name: string;
  chunk_index: number;
  score: number;
  page_start?: number | null;
  page_end?: number | null;
}

export interface FeedbackRequest {
  rating: FeedbackRating;
}

export interface MessageFeedbackResponse {
  id: string;
  message_id: string;
  user_id: string;
  rating: FeedbackRating;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  knowledge_base_id: string;
  created_at: string;
  updated_at: string;
}

export type ConversationCursorPage = CursorPage<Conversation>;

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  updated_at: string;
  sources: MessageSource[];
  feedback: FeedbackRating | null;
}

export type MessageCursorPage = CursorPage<Message>;
