import type { QueryClient } from "@tanstack/react-query";

import { conversationKeys } from "./keys";
import type { Conversation, ConversationCursorPage } from "./types";

export const DEFAULT_CONVERSATION_TITLE = "New chat";

function isConversationLike(value: unknown): value is Conversation {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string"
  );
}

function isCursorPageLike(value: unknown): value is ConversationCursorPage {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray(value.items)
  );
}

function updateConversationItems(
  items: readonly Conversation[],
  conversationId: string,
  normalizedTitle: string
): { found: boolean; changed: boolean; nextItems: Conversation[] } {
  let found = false;
  let changed = false;

  const nextItems = items.map((item) => {
    if (!isConversationLike(item) || item.id !== conversationId) {
      return item;
    }
    found = true;
    if (item.title === normalizedTitle) {
      return item;
    }
    changed = true;
    return { ...item, title: normalizedTitle };
  });

  return { found, changed, nextItems };
}

export function formatConversationTitle(
  title: string | null | undefined
): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_CONVERSATION_TITLE;
}

export function applyConversationTitleToCache(
  queryClient: QueryClient,
  payload: { conversationId: string; title: string }
): void {
  const normalizedTitle = payload.title.trim();
  if (!normalizedTitle) {
    return;
  }

  queryClient.setQueryData<Conversation>(
    conversationKeys.detail(payload.conversationId),
    (current) => {
      if (!current || current.title === normalizedTitle) {
        return current;
      }
      return { ...current, title: normalizedTitle };
    }
  );

  let foundInList = false;
  const listQueries = queryClient.getQueriesData<unknown>({
    queryKey: conversationKeys.lists(),
  });

  for (const [queryKey, data] of listQueries) {
    if (!data) {
      continue;
    }

    if (Array.isArray(data)) {
      const { found, changed, nextItems } = updateConversationItems(
        data,
        payload.conversationId,
        normalizedTitle
      );
      if (!found) {
        continue;
      }
      foundInList = true;
      if (changed) {
        queryClient.setQueryData<Conversation[]>(queryKey, nextItems);
      }
      continue;
    }

    if (isCursorPageLike(data)) {
      const { found, changed, nextItems } = updateConversationItems(
        data.items,
        payload.conversationId,
        normalizedTitle
      );
      if (!found) {
        continue;
      }
      foundInList = true;
      if (changed) {
        queryClient.setQueryData<ConversationCursorPage>(queryKey, {
          ...data,
          items: nextItems,
        });
      }
    }
  }

  if (!foundInList) {
    void queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  }
}
