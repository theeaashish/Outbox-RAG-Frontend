import type { CursorPage, CursorPageInfo } from "@/lib/api";
import type { MessageRole } from "@/features/chat/types";

export type { CursorPageInfo, MessageRole };

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
}

export type MessageCursorPage = CursorPage<Message>;

