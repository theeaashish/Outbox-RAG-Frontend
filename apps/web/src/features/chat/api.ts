import { apiClient } from "@/lib/api";
import { parseSseStream } from "@/lib/sse";
import type { ChatRequest, ChatStreamEvent } from "./types";

const CHAT_PATH = "/api/v1/conversations";

export async function* streamChat(
  conversationId: string,
  request: ChatRequest,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEvent> {
  const response = await apiClient.stream(
    `${CHAT_PATH}/${conversationId}/messages/stream`,
    request,
    { signal, headers: { Accept: "text/event-stream" } }
  );

  if (!response.body) {
    throw new Error("The chat stream did not include a response body");
  }

  for await (const event of parseSseStream(response.body, signal)) {
    if (!event.event || !event.data) continue;

    let data: unknown;
    try {
      data = JSON.parse(event.data);
    } catch {
      throw new Error("Received malformed data from the chat stream");
    }

    yield { event: event.event as ChatStreamEvent["event"], data } as ChatStreamEvent;
  }
}

