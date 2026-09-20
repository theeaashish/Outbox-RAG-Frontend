import { fetchServerSentEvents } from "@tanstack/ai-client";
import { ApiError, apiClient, getErrorMessage } from "@/lib/api";

const V2_CHAT_PATH = "/api/v2/conversations";

function getErrorCode(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  const record = data as Record<string, unknown>;
  if (typeof record.code === "string") return record.code;

  if (typeof record.error === "object" && record.error !== null) {
    const error = record.error as Record<string, unknown>;
    return typeof error.code === "string" ? error.code : undefined;
  }

  return undefined;
}

const chatFetch: typeof globalThis.fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.ok) return response;

  const errorResponse = response.clone();
  let data: unknown = null;

  try {
    data = errorResponse.headers
      .get("content-type")
      ?.includes("application/json")
      ? await errorResponse.json()
      : await errorResponse.text();
  } catch {
    data = null;
  }

  const code = getErrorCode(data);
  throw new ApiError({
    message:
      getErrorMessage(data) ??
      `HTTP error ${response.status}: ${response.statusText}`,
    status: response.status,
    statusText: response.statusText,
    data,
    ...(code ? { code } : {}),
  });
};

export function createAgUiChatConnection(conversationId: string) {
  return fetchServerSentEvents(
    apiClient.buildUrl(`${V2_CHAT_PATH}/${conversationId}/messages/stream`),
    {
      credentials: "include",
      fetchClient: chatFetch,
      headers: { Accept: "text/event-stream" },
    }
  );
}
