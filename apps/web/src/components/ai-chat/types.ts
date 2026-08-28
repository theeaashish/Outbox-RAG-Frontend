import type { Model } from "./constants";

export const COMPOSER_STATUSES = [
  "idle",
  "submitting",
  "streaming",
  "cancelling",
  "error",
] as const;

export type ComposerStatus = (typeof COMPOSER_STATUSES)[number];

export type ComposerMode = "chat" | "plan" | "agent";

export type AttachmentStatus = "uploading" | "ready" | "error";

export interface ComposerAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: AttachmentStatus;
}

export interface ComposerSubmitData {
  text: string;
  model: Model;
  effort: number;
  mode: ComposerMode;
  attachments: ComposerAttachment[];
}

