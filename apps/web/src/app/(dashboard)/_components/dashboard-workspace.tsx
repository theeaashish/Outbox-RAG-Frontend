"use client";

import {
  RiFilePdfLine,
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

interface ProjectSummary {
  id: string;
  name: string;
  knowledgeBaseId?: string;
}

interface DashboardWorkspaceProps {
  conversationId?: string;
  project?: ProjectSummary;
  sessionTitle?: string;
}

export function DashboardWorkspace({
  conversationId,
  project,
  sessionTitle,
}: DashboardWorkspaceProps) {
  const { openKnowledgeBase } = useDashboardProjects();
  const projectName = project?.name ?? "Workspace";
  const sessionName =
    sessionTitle ?? (conversationId ? "New chat" : "Select a chat");

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
            {project?.knowledgeBaseId && (
              <button
                type="button"
                onClick={() => {
                  const kbId = project.knowledgeBaseId;
                  if (!kbId) return;
                  openKnowledgeBase({
                    name: project.name,
                    knowledgeBaseId: kbId,
                    projectId: project.id,
                  });
                }}
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/60 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                title="Manage Knowledge Base"
              >
                <RiFilePdfLine className="size-3.5 text-rose-500" aria-hidden />
                <span>Knowledge Base</span>
              </button>
            )}
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
        key={conversationId ?? "no-conversation"}
        conversationId={conversationId}
        project={project}
      />
    </div>
  );
}
