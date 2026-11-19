export interface StorageUploadOptions {
  url: string;
  method?: "POST" | "PUT" | (string & {});
  formFields?: Record<string, string>;
  headers?: Record<string, string>;
  file: File;
  signal?: AbortSignal;
  timeoutMs?: number;
  onProgress?: (percent: number) => void;
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class StorageUploadError extends Error {
  readonly status: number;
  readonly isExpired: boolean;
  readonly isAborted: boolean;

  constructor(
    message: string,
    status: number,
    options: { isExpired?: boolean; isAborted?: boolean } = {}
  ) {
    super(message);
    this.name = "StorageUploadError";
    this.status = status;
    this.isExpired = options.isExpired ?? false;
    this.isAborted = options.isAborted ?? false;
  }
}

function parseErrorBody(body: string): { code: string; message: string } {
  const trimmed = body.trim();
  if (!trimmed) return { code: "", message: "" };

  // JSON error bodies (e.g., GCS, local proxy, custom gateways)
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        code?: string;
        error?: string | { message?: string; code?: string };
        message?: string;
        detail?: string;
      };
      if (typeof parsed.error === "object" && parsed.error !== null) {
        return {
          code: String(parsed.error.code ?? ""),
          message: String(parsed.error.message ?? ""),
        };
      }
      return {
        code: String(parsed.code ?? ""),
        message: String(
          parsed.message ??
            parsed.detail ??
            (typeof parsed.error === "string" ? parsed.error : "")
        ),
      };
    } catch {
      return { code: "", message: "" };
    }
  }

  // S3 / R2 XML error bodies
  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(trimmed, "application/xml");
      if (!doc.querySelector("parsererror")) {
        return {
          code: doc.querySelector("Code")?.textContent?.trim() ?? "",
          message: doc.querySelector("Message")?.textContent?.trim() ?? "",
        };
      }
    } catch {
      // Fall through
    }
  }

  return { code: "", message: "" };
}

function toStorageError(status: number, body: string): StorageUploadError {
  const { code, message } = parseErrorBody(body);
  const combined = `${code} ${message}`.toLowerCase();

  if ((status === 400 || status === 403) && combined.includes("expired")) {
    return new StorageUploadError("Upload authorization expired.", status, {
      isExpired: true,
    });
  }
  if (
    status === 413 ||
    code === "EntityTooLarge" ||
    /toolarge|too large/.test(combined)
  ) {
    return new StorageUploadError(
      "The file is larger than the storage limit.",
      status
    );
  }
  if (message) {
    return new StorageUploadError(
      `Storage upload rejected: ${message}`,
      status
    );
  }
  return new StorageUploadError(
    `Storage upload failed (HTTP ${status}).`,
    status
  );
}

export function uploadToStorageViaXhr({
  url,
  method = "POST",
  formFields = {},
  headers = {},
  file,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onProgress,
}: StorageUploadOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new StorageUploadError("Upload aborted.", 0, { isAborted: true }));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.timeout = timeoutMs;

    const handleAbort = () => xhr.abort();
    signal?.addEventListener("abort", handleAbort, { once: true });
    xhr.addEventListener("loadend", () => {
      signal?.removeEventListener("abort", handleAbort);
    });

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        // Hold at 99% until storage acknowledges the upload in onload
        const percent = Math.min(
          99,
          Math.round((event.loaded / event.total) * 100)
        );
        onProgress?.(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(toStorageError(xhr.status, xhr.responseText));
      }
    };

    xhr.onerror = () =>
      reject(new StorageUploadError("Network error while uploading.", 0));
    xhr.ontimeout = () =>
      reject(new StorageUploadError("Upload timed out. Please retry.", 0));
    xhr.onabort = () =>
      reject(new StorageUploadError("Upload aborted.", 0, { isAborted: true }));

    const upperMethod = method.toUpperCase();
    xhr.open(upperMethod, url);

    if (upperMethod === "PUT") {
      let hasContentType = false;
      for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === "content-type") hasContentType = true;
        xhr.setRequestHeader(key, value);
      }
      if (!hasContentType) {
        xhr.setRequestHeader("Content-Type", file.type || "application/pdf");
      }
      xhr.send(file);
      return;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() !== "content-type") {
        xhr.setRequestHeader(key, value);
      }
    }

    const body = new FormData();
    for (const [key, value] of Object.entries(formFields)) {
      body.append(key, value);
    }
    // S3 POST policies require the file field to come last
    body.append("file", file, file.name);
    xhr.send(body);
  });
}
