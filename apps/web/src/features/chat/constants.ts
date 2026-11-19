import type { ChatModelInfo } from "./types";

export const DEFAULT_MODEL_ID = "openai/gpt-oss-120b";
export const DEFAULT_MODEL = DEFAULT_MODEL_ID;

export const FALLBACK_CHAT_MODELS: ChatModelInfo[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "Groq (openai/gpt-oss-120b)",
    provider: "groq",
    is_default: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini (gemini-3.5-flash-lite)",
    provider: "gemini",
    is_default: false,
  },
];
