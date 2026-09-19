export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;
  readonly code?: string;

  constructor(options: {
    message: string;
    status: number;
    statusText: string;
    data?: unknown;
    code?: string;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
    this.code = options.code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data !== "object" || data === null) return undefined;

  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.detail === "string") return record.detail;
  if (Array.isArray(record.detail)) {
    const messages = record.detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const message = (item as Record<string, unknown>).msg;
          return typeof message === "string" ? message : undefined;
        }
        return undefined;
      })
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) return messages.join("; ");
  }

  if (typeof record.error === "object" && record.error !== null) {
    const error = record.error as Record<string, unknown>;
    if (typeof error.message === "string") return error.message;
  }

  return undefined;
}
