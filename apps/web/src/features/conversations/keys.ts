export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (knowledgeBaseId: string) =>
    [...conversationKeys.lists(), knowledgeBaseId] as const,
  detail: (conversationId: string) =>
    [...conversationKeys.all, "detail", conversationId] as const,
  messages: (conversationId: string) =>
    [...conversationKeys.detail(conversationId), "messages"] as const,
};

