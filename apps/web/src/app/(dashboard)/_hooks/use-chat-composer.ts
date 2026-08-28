"use client";

import * as React from "react";
import {
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  type ComposerMode,
  type ComposerStatus,
  type ComposerSubmitData,
  type Model,
} from "@/components/ai-chat";

/** Container hook: owns all composer state so the page stays presentational. */
export function useChatComposer() {
  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState<Model>(DEFAULT_MODEL);
  const [effort, setEffort] = React.useState(DEFAULT_EFFORT);
  const [mode, setMode] = React.useState<ComposerMode>("agent");
  const [status, setStatus] = React.useState<ComposerStatus>("idle");

  const submit = React.useCallback((data: ComposerSubmitData) => {
    // TODO: wire up to the generation API.
    console.info("Submitted prompt:", data);
    setDraft("");
    setStatus("streaming");
  }, []);

  const cancel = React.useCallback(() => {
    console.info("Cancelled generation");
    setStatus("idle");
  }, []);

  return {
    draft,
    setDraft,
    model,
    setModel,
    effort,
    setEffort,
    mode,
    setMode,
    status,
    submit,
    cancel,
  };
}
