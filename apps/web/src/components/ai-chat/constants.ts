export type Model = string;

export type { ChatModelOption } from "@/features/chat/types";

export const EFFORT_LEVELS = [
  "Low",
  "Medium",
  "High",
  "Advanced",
  "Expert",
  "Max",
] as const;

/** Index into EFFORT_LEVELS — "Medium". */
export const DEFAULT_EFFORT = 1;
