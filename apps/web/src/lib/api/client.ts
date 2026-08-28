import { ApiError } from "./errors";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string | null;
}

export interface ApiClientConfig {
  baseUrl?: string;
  getAuthToken?: () => string | null | Promise<string | null>;
}

export class ApiClient {
  readonly baseUrl: string;
  private readonly getAuthToken?: () => string | null | Promise<string | null>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? (process.env.NEXT_PUBLIC_API_URL || "");
    this.getAuthToken = config.getAuthToken;
  }

  public buildUrl(path: string, params?: RequestOptions["params"]): string {
    const isAbsolute =
      path.startsWith("http://") || path.startsWith("https://");

    let fullUrl: string;
    if (isAbsolute) {
      fullUrl = path;
    } else {
      const cleanBase = this.baseUrl.replace(/\/+$/, "");
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      fullUrl = cleanBase ? `${cleanBase}${cleanPath}` : path;
    }

    if (!params) {
      return fullUrl;
    }

    const hasQueryParams = Object.values(params).some(
      (val) => val !== undefined && val !== null
    );
    if (!hasQueryParams) {
      return fullUrl;
    }

    const isFullUrlAbsolute =
      fullUrl.startsWith("http://") || fullUrl.startsWith("https://");

    if (isFullUrlAbsolute) {
      const url = new URL(fullUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      return url.toString();
    }

    const [basePart, existingQuery] = fullUrl.split("?");
    const searchParams = new URLSearchParams(existingQuery);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${basePart}?${queryString}` : (basePart ?? "");
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, token, headers: customHeaders, ...init } = options;

    const url = this.buildUrl(path, params);
    const headers = new Headers(customHeaders);

    if (
      body !== undefined &&
      !headers.has("Content-Type") &&
      !(body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const authToken = token ?? (await this.getAuthToken?.());
    if (authToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    const requestBody =
      body !== undefined
        ? body instanceof FormData || typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined;

    const response = await fetch(url, {
      ...init,
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        try {
          errorData = await response.text();
        } catch {
          errorData = null;
        }
      }

      const message =
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof (errorData as Record<string, unknown>).message === "string"
          ? (errorData as { message: string }).message
          : `HTTP error ${response.status}: ${response.statusText}`;

      const code =
        typeof errorData === "object" &&
        errorData !== null &&
        "code" in errorData &&
        typeof (errorData as Record<string, unknown>).code === "string"
          ? (errorData as { code: string }).code
          : undefined;

      throw new ApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        code,
      });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
