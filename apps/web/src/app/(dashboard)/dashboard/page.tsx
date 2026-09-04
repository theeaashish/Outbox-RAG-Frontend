"use client";

import {
  RiFolder6Line,
  RiMoreFill,
  RiShareForwardLine,
} from "@remixicon/react";
import { AiChatComposer } from "@/components/ai-chat";
import {
  DashboardHeader,
  HeaderAction,
} from "@/app/(dashboard)/_components/dashboard-header";
import {
  MOCK_PROJECT_ID,
  MOCK_PROJECT_NAME,
  MOCK_PROMPT,
  MOCK_SCENARIO_NAME,
} from "@/app/(dashboard)/_components/fixtures";
import { UserMessage } from "@/app/(dashboard)/_components/transcript";
import { useChatComposer } from "@/app/(dashboard)/_hooks/use-chat-composer";

export default function DashboardPage() {
  const composer = useChatComposer();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DashboardHeader
        items={[
          {
            label: MOCK_PROJECT_NAME,
            icon: <RiFolder6Line className="size-4 text-zinc-400" />,
          },
          { label: MOCK_SCENARIO_NAME, current: true },
        ]}
        actions={
          <>
            <HeaderAction label="Share">
              <RiShareForwardLine className="size-4" aria-hidden />
            </HeaderAction>
            <HeaderAction label="More options">
              <RiMoreFill className="size-4" aria-hidden />
            </HeaderAction>
          </>
        }
      />

      <div className="relative flex flex-1 flex-col justify-between overflow-y-auto px-4 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-4">
          <UserMessage>{MOCK_PROMPT}</UserMessage>
        </div>

        <div className="mx-auto w-full max-w-2xl pb-2 pt-4">
          <AiChatComposer
            value={composer.draft}
            onChange={composer.setDraft}
            model={composer.model}
            effort={composer.effort}
            onModelChange={composer.setModel}
            onEffortChange={composer.setEffort}
            mode={composer.mode}
            onModeChange={composer.setMode}
            status={composer.status}
            onSubmit={composer.submit}
            onCancel={composer.cancel}
            branch={{ id: "main", name: "Main" }}
            project={{ id: MOCK_PROJECT_ID, name: MOCK_PROJECT_NAME }}
            contextUsage={57}
          />
        </div>
      </div>
    </div>
  );
}
