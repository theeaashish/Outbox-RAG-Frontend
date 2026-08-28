import type { ServerSentEvent } from "./types";

/**
 * Parses a single SSE event block (lines separated by CRLF, LF, or CR).
 */
export function parseSseBlock(block: string): ServerSentEvent | null {
  const lines = block.split(/\r\n|\r|\n/);
  let event: string | undefined;
  let id: string | undefined;
  let retry: number | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      // Empty line or SSE comment (e.g. heartbeat)
      continue;
    }

    const colonIndex = line.indexOf(":");
    let field: string;
    let value: string;

    if (colonIndex === -1) {
      field = line;
      value = "";
    } else {
      field = line.slice(0, colonIndex);
      value = line.slice(colonIndex + 1);
      // Per SSE spec: if value starts with a single U+0020 space, strip only that single space
      if (value.startsWith(" ")) {
        value = value.slice(1);
      }
    }

    if (field === "event") {
      event = value.trim();
    } else if (field === "data") {
      dataLines.push(value);
    } else if (field === "id") {
      id = value;
    } else if (field === "retry") {
      const parsedRetry = parseInt(value.trim(), 10);
      if (!Number.isNaN(parsedRetry)) {
        retry = parsedRetry;
      }
    }
  }

  if (dataLines.length === 0 && !event && !id) {
    return null;
  }

  return {
    event,
    id,
    retry,
    data: dataLines.join("\n"),
  };
}

/**
 * Parses an SSE byte stream into an async iterable of parsed `ServerSentEvent` objects.
 * Handles CRLF, LF, and CR event delimiters, multiline data, and active abort signal cancellation.
 */
export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<ServerSentEvent, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const onAbort = () => {
    try {
      void reader.cancel();
    } catch {
      // Ignore cancellation failures if reader is already closed
    }
  };

  if (signal) {
    if (signal.aborted) {
      try {
        await reader.cancel();
      } finally {
        reader.releaseLock();
      }
      return;
    }
    signal.addEventListener("abort", onAbort);
  }

  try {
    while (true) {
      if (signal?.aborted) {
        break;
      }

      let readResult: ReadableStreamReadResult<Uint8Array>;
      try {
        readResult = await reader.read();
      } catch (error) {
        if (signal?.aborted) {
          break;
        }
        throw error;
      }

      if (readResult.done || signal?.aborted) {
        break;
      }

      buffer += decoder.decode(readResult.value, { stream: true });
      const parts = buffer.split(/\r\n\r\n|\n\n|\r\r/);

      // Keep the incomplete last block in buffer
      buffer = parts.pop() ?? "";

      for (const block of parts) {
        const parsed = parseSseBlock(block);
        if (parsed) {
          yield parsed;
        }
      }
    }

    if (!signal?.aborted) {
      buffer += decoder.decode();
      if (buffer.trim().length > 0) {
        const parsed = parseSseBlock(buffer);
        if (parsed) {
          yield parsed;
        }
      }
    }
  } finally {
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
    reader.releaseLock();
  }
}
