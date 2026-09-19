export const documentKeys = {
  all: ["documents"] as const,
  list: (knowledgeBaseId: string) =>
    [...documentKeys.all, "list", knowledgeBaseId] as const,
};

