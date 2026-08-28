export const MODELS = [
  "Composer 2.5",
  "GPT-5.6 Sol",
  "Fable 5",
  "Sonnet 5",
] as const;

export type Model = (typeof MODELS)[number];

export const EFFORT_LEVELS = [
  "Low",
  "Medium",
  "High",
  "Advanced",
  "Expert",
  "Max",
] as const;

export const DEFAULT_MODEL: Model = "Fable 5";

/** Index into EFFORT_LEVELS — "Medium". */
export const DEFAULT_EFFORT = 1;
