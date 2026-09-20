"use client";

import {
  RiFolder6Line,
  RiMoreFill,
  RiShareForwardLine,
} from "@remixicon/react";
import {
  DashboardHeader,
  HeaderAction,
} from "@/app/(dashboard)/_components/dashboard-header";
import { ConversationChat } from "@/app/(dashboard)/_components/conversation-chat";
import { useDashboardProjects } from "@/app/(dashboard)/_components/sidebar/sidebar-data-provider";

export default function DashboardPage() {
  const { projects, activeSessionId } = useDashboardProjects();
  const activeProject = projects.find((project) =>
    project.sessions?.some((session) => session.id === activeSessionId)
  );
  const activeSession = activeProject?.sessions?.find(
    (session) => session.id === activeSessionId
  );
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

      <ConversationChat
        key={activeSessionId ?? "no-conversation"}
        conversationId={activeSessionId ?? undefined}
        project={
          activeProject
            ? { id: activeProject.id, name: activeProject.name }
            : undefined
        }
      />
    </div>
  );
}
