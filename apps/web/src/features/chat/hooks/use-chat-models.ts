"use client";

import { useQuery } from "@tanstack/react-query";
import { getChatModels } from "../api";
import { DEFAULT_MODEL_ID, FALLBACK_CHAT_MODELS } from "../constants";
import { chatKeys } from "../keys";

export { DEFAULT_MODEL_ID, FALLBACK_CHAT_MODELS };

export function useChatModels() {
  return useQuery({
    queryKey: chatKeys.models(),
    queryFn: ({ signal }) => getChatModels(signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
