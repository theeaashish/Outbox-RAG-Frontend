import { createId } from "./id";
import { formatFileSize, isPdf } from "./file";

export const MAX_KB_FILES = 10;
export const MAX_KB_FILE_SIZE_MB = 20;
export const MAX_KB_FILE_SIZE_BYTES = MAX_KB_FILE_SIZE_MB * 1024 * 1024;

/** Single source for the input's `accept` attribute AND validation. */
export const KB_ACCEPT = "application/pdf,.pdf";

export interface SelectedFile {
  id: string;
  file: File;
}

export interface KbValidationResult {
  accepted: SelectedFile[];
  rejections: string[];
}

/**
 * Filters incoming files against type/size rules and the remaining slot
 * budget. Pure — callers own state and error display.
 */
export function validateKbFiles(
  incoming: File[],
  currentCount: number
): KbValidationResult {
  const rejections: string[] = [];
  const valid: File[] = [];

  for (const file of incoming) {
    if (!isPdf(file)) {
      rejections.push(`"${file.name}" is not a PDF file.`);
      continue;
    }
    if (file.size > MAX_KB_FILE_SIZE_BYTES) {
      rejections.push(
        `"${file.name}" exceeds the ${MAX_KB_FILE_SIZE_MB} MB limit (${formatFileSize(file.size)}).`
      );
      continue;
    }
    valid.push(file);
  }

  const remainingSlots = Math.max(0, MAX_KB_FILES - currentCount);
  if (valid.length > remainingSlots) {
    rejections.push(
      `Knowledge base is limited to ${MAX_KB_FILES} files — added ${remainingSlots} of ${valid.length}.`
    );
  }

  return {
    accepted: valid
      .slice(0, remainingSlots)
      .map((file) => ({ id: createId("kb-file"), file })),
    rejections,
  };
}
