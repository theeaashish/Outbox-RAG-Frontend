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
import { ConversationTranscript } from "@/app/(dashboard)/_components/transcript";
import { useChatComposer } from "@/app/(dashboard)/_hooks/use-chat-composer";
import { useDashboardProjects } from "@/app/(dashboard)/_components/sidebar/sidebar-data-provider";

export default function DashboardPage() {
  const { projects, activeSessionId } = useDashboardProjects();
  const activeProject = projects.find((project) =>
    project.sessions?.some((session) => session.id === activeSessionId)
  );
  const activeSession = activeProject?.sessions?.find(
    (session) => session.id === activeSessionId
  );
  const composer = useChatComposer(activeSessionId ?? undefined);

  const projectName = activeProject?.name ?? "Workspace";
  const sessionName = activeSession?.title ?? "Select a chat";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DashboardHeader
        items={[
          {
            label: projectName,
            icon: <RiFolder6Line className="size-4 text-zinc-400" />,
          },
          { label: sessionName, current: true },
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
          <ConversationTranscript
            messages={composer.messages}
            sources={composer.sources}
          />
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
            modelSelectorDisabled
            effortSelectorDisabled
            modeSelectorDisabled
            status={composer.status}
            onSubmit={composer.submit}
            onCancel={composer.cancel}
            branch={{ id: "main", name: "Main" }}
            project={
              activeProject
                ? { id: activeProject.id, name: activeProject.name }
                : undefined
            }
            contextUsage={undefined}
            disabled={!activeSessionId}
          />
        </div>
      </div>
    </div>
  );
}
