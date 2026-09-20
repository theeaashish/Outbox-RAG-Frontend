import { apiClient } from "@/lib/api";
import type {
  Conversation,
  ConversationCursorPage,
  Message,
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

export async function listConversationChatHistory(
  conversationId: string,
  options: { signal?: AbortSignal } = {}
): Promise<Message[]> {
  const newestFirst: Message[] = [];
  const seenCursors = new Set<string>();
  let after: string | null = null;

  while (true) {
    const page = await listMessages(conversationId, {
      signal: options.signal,
      pageSize: 100,
      after,
    });

    newestFirst.push(...page.items);

    const { has_next_page: hasNextPage, next_cursor: nextCursor } =
      page.page_info;

    if (!hasNextPage) {
      if (nextCursor !== null) {
        throw new Error("Message history returned an unexpected next cursor");
      }
      break;
    }

    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error("Message history cursor did not advance");
    }

    seenCursors.add(nextCursor);
    after = nextCursor;
  }

  return newestFirst.reverse();
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
