"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BoardButton } from "@repo/ui";
import { toast } from "sonner";
import { DashboardWorkspace } from "@/app/(dashboard)/_components/dashboard-workspace";
import { useConversation } from "@/features/conversations";
import { useProject } from "@/features/projects";
import { isApiError } from "@/lib/api";

interface ConversationRouteGateProps {
  projectId: string;
  conversationId: string;
}

export function ConversationRouteGate({
  projectId,
  conversationId,
}: ConversationRouteGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const projectQuery = useProject(projectId);
  const conversationQuery = useConversation(conversationId);
  const redirectedRef = useRef(false);

  const project = projectQuery.data;
  const conversation = conversationQuery.data;

  const isProjectNotFound =
    isApiError(projectQuery.error) && projectQuery.error.status === 404;
  const isConversationNotFound =
    isApiError(conversationQuery.error) &&
    conversationQuery.error.status === 404;

  const isUnauthorized =
    (isApiError(projectQuery.error) && projectQuery.error.status === 401) ||
    (isApiError(conversationQuery.error) &&
      conversationQuery.error.status === 401);

  const bothLoaded = projectQuery.isSuccess && conversationQuery.isSuccess;
  const kbMismatch =
    bothLoaded &&
    project !== undefined &&
    conversation !== undefined &&
    project.knowledge_base_id !== conversation.knowledge_base_id;

  const hasQueryError =
    (projectQuery.isError && !isProjectNotFound && !isUnauthorized) ||
    (conversationQuery.isError && !isConversationNotFound && !isUnauthorized);

  useEffect(() => {
    redirectedRef.current = false;
  }, [projectId, conversationId]);

  useEffect(() => {
    if (redirectedRef.current) return;

    if (isUnauthorized) {
      redirectedRef.current = true;
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isProjectNotFound) {
      redirectedRef.current = true;
      toast.error("Project not found.");
      router.replace("/dashboard");
      return;
    }

    if (isConversationNotFound) {
      redirectedRef.current = true;
      toast.error("Conversation not found.");
      router.replace("/dashboard");
      return;
    }

    if (kbMismatch) {
      redirectedRef.current = true;
      toast.error("Conversation does not belong to this project.");
      router.replace("/dashboard");
      return;
    }
  }, [
    isUnauthorized,
    isProjectNotFound,
    isConversationNotFound,
    kbMismatch,
    pathname,
    router,
  ]);

  if (isUnauthorized) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Redirecting to login...
      </div>
    );
  }

  if (isProjectNotFound || isConversationNotFound || kbMismatch) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Redirecting...
      </div>
    );
  }

  if (hasQueryError) {
    const queryError = projectQuery.error ?? conversationQuery.error;
    const errorMessage =
      queryError instanceof Error
        ? queryError.message
        : "An error occurred while loading the conversation.";

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Failed to load conversation
        </p>
        <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400">
          {errorMessage}
        </p>
        <BoardButton
          variant="secondary"
          size="small"
          onClick={() => {
            if (projectQuery.isError) {
              void projectQuery.refetch();
            }
            if (conversationQuery.isError) {
              void conversationQuery.refetch();
            }
          }}
        >
          Retry
        </BoardButton>
      </div>
    );
  }

  if (!project || !conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading conversation...
      </div>
    );
  }

  return (
    <DashboardWorkspace
      conversationId={conversationId}
      project={{ id: project.id, name: project.name }}
      sessionTitle="New chat"
    />
  );
}
