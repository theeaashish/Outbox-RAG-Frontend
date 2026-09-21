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

interface ProjectSummary {
  id: string;
  name: string;
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
