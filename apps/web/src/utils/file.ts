export const MAX_DOCUMENT_FILE_SIZE_MB = 10;
export const MAX_DOCUMENT_FILE_SIZE_BYTES =
  MAX_DOCUMENT_FILE_SIZE_MB * 1024 * 1024;

export function isPdf(file: File): boolean {
  const name = file.name.trim().toLowerCase();
  if (!name.endsWith(".pdf") || name === ".pdf") return false;
  // Browsers report an empty or legacy MIME type for some PDFs
  return (
    !file.type ||
    file.type === "application/pdf" ||
    file.type === "application/x-pdf"
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
}

export function validateDocumentFile(file: File): string | null {
  if (!isPdf(file)) {
    return `"${file.name}" is not a PDF file. Only PDF files (.pdf) are supported.`;
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_DOCUMENT_FILE_SIZE_MB} MB limit (${formatFileSize(file.size)}).`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty (0 bytes). Empty files cannot be processed.`;
  }
  return null;
}
