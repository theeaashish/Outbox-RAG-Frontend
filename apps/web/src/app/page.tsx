"use client";

import * as React from "react";
import { Hero } from "@/app/(marketing)/_components/hero";
import {
  AiChatComposer,
  DEFAULT_MODEL,
  DEFAULT_EFFORT,
  type Model,
  type ComposerMode,
  type ComposerStatus,
  type ComposerAttachment,
  type ComposerSubmitData,
} from "@/components/ai-chat";

export default function Home() {
  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState<Model>(DEFAULT_MODEL);
  const [effort, setEffort] = React.useState(DEFAULT_EFFORT);
  const [mode, setMode] = React.useState<ComposerMode>("agent");
  const [status, setStatus] = React.useState<ComposerStatus>("idle");
  const [attachments] = React.useState<ComposerAttachment[]>([]);

  const handleSubmit = (data: ComposerSubmitData) => {
    console.log("Submitted prompt:", data);
    setDraft("");
    setStatus("streaming");
  };

  const handleCancel = () => {
    console.log("Cancelled generation");
    setStatus("idle");
  };

  return (
    <main>
      <Hero>
        <AiChatComposer
          value={draft}
          onChange={setDraft}
          model={model}
          effort={effort}
          onModelChange={setModel}
          onEffortChange={setEffort}
          mode={mode}
          onModeChange={setMode}
          attachments={attachments}
          status={status}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          branch={{ id: "main", name: "Main" }}
          project={{ id: "project-sea", name: "project-sea" }}
          contextUsage={57}
          onFilesClick={() => console.log("Files clicked")}
          onGoalClick={() => console.log("Goal clicked")}
          onPlanClick={() => console.log("Plan clicked")}
        />
      </Hero>
    </main>
  );
}

