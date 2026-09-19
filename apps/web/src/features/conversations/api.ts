import { apiClient } from "@/lib/api";
import type {
  Conversation,
  ConversationCursorPage,
  MessageCursorPage,
} from "./types";

const V1_CONVERSATIONS_PATH = "/api/v1/conversations";
const V2_CONVERSATIONS_PATH = "/api/v2/knowledge-bases";
const V2_MESSAGES_PATH = "/api/v2/conversations";

export function createProjectConversation(
  projectId: string,
  options: { signal?: AbortSignal } = {}
): Promise<Conversation> {
  return apiClient.post<Conversation>(
    `/api/v1/projects/${projectId}/conversations`,
    undefined,
    options
  );
}

export function listConversations(
  knowledgeBaseId: string,
  options: {
    signal?: AbortSignal;
    pageSize?: number;
    after?: string | null;
    before?: string | null;
  } = {}
): Promise<ConversationCursorPage> {
  return apiClient.get<ConversationCursorPage>(
    `${V2_CONVERSATIONS_PATH}/${knowledgeBaseId}/conversations`,
    {
      signal: options.signal,
      params: {
        page_size: options.pageSize,
        after: options.after,
        before: options.before,
      },
    }
  );
}

export function getConversation(
  conversationId: string,
  options: { signal?: AbortSignal } = {}
): Promise<Conversation> {
  return apiClient.get<Conversation>(
    `${V1_CONVERSATIONS_PATH}/${conversationId}`,
    options
  );
}

export function listMessages(
  conversationId: string,
  options: {
    signal?: AbortSignal;
    pageSize?: number;
    after?: string | null;
    before?: string | null;
  } = {}
): Promise<MessageCursorPage> {
  return apiClient.get<MessageCursorPage>(
    `${V2_MESSAGES_PATH}/${conversationId}/messages`,
    {
      signal: options.signal,
      params: {
        page_size: options.pageSize,
        after: options.after,
        before: options.before,
      },
    }
  );
}

export function deleteConversation(
  conversationId: string,
  options: { signal?: AbortSignal } = {}
): Promise<void> {
  return apiClient.delete<void>(
    `${V1_CONVERSATIONS_PATH}/${conversationId}`,
    options
  );
}

