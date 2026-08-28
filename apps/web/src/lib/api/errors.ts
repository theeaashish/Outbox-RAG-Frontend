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
