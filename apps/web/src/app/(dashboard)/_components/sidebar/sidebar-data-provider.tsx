"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils";
import type { ChatSession, ProjectItem } from "./sidebar-data";
import { useDeleteProject, useProjects } from "@/features/projects";
import {
  conversationKeys,
  listConversations,
  useCreateProjectConversation,
  useDeleteConversation,
} from "@/features/conversations";
import {
  dashboardConversationPath,
  parseDashboardConversationPath,
} from "@/app/(dashboard)/_lib/conversation-path";

interface DashboardProjectsContextValue {
  projects: ProjectItem[];
  projectsLoading: boolean;
  projectsError: Error | null;
  retryProjects: () => void;
  activeSessionId: string | null;
  activeProjectId: string | null;
  toggleProject: (projectId: string) => void;
  createChat: (projectId: string) => Promise<void>;
  deleteChat: (projectId: string, sessionId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

const DashboardProjectsContext =
  createContext<DashboardProjectsContextValue | null>(null);

interface DashboardProjectsProviderProps {
  children: ReactNode;
}

export function DashboardProjectsProvider({
  children,
}: DashboardProjectsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const routeIds = useMemo(
    () => parseDashboardConversationPath(pathname),
    [pathname]
  );
  const activeSessionId = routeIds?.conversationId ?? null;
  const activeProjectId = routeIds?.projectId ?? null;

  const {
    data: rawProjects,
    isLoading: projectsLoading,
    error: projectsQueryError,
    refetch: refetchProjects,
  } = useProjects();
  const projectsList = useMemo(() => rawProjects ?? [], [rawProjects]);

  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set()
  );

  // Auto-expand the project that owns the URL conversation.
  useEffect(() => {
    if (!activeProjectId) return;
    setExpandedProjectIds((prev) => {
      if (prev.has(activeProjectId)) return prev;
      return new Set(prev).add(activeProjectId);
    });
  }, [activeProjectId]);

  const createConversationMutation = useCreateProjectConversation();
  const deleteConversationMutation = useDeleteConversation();
  const deleteProjectMutation = useDeleteProject();

  const conversationQueries = useQueries({
    queries: projectsList.map((project) => {
      const isExpanded = expandedProjectIds.has(project.id);
      const isActive = project.id === activeProjectId;
      return {
        queryKey: conversationKeys.list(project.knowledge_base_id),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          listConversations(project.knowledge_base_id, { signal }),
        enabled: Boolean(project.knowledge_base_id) && (isExpanded || isActive),
      };
    }),
  });

  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  const projects = useMemo<ProjectItem[]>(() => {
    return projectsList.map((project, index) => {
      const queryResult = conversationQueries[index]?.data?.items;
      const sessions: ChatSession[] | undefined = queryResult?.map(
        (conversation) => ({
          id: conversation.id,
          title: "New chat",
          time: formatRelativeTime(conversation.created_at),
          href: dashboardConversationPath(project.id, conversation.id),
        })
      );

      return {
        id: project.id,
        name: project.name,
        ...(project.description ? { description: project.description } : {}),
        knowledgeBaseId: project.knowledge_base_id,
        expanded: expandedProjectIds.has(project.id),
        sessions,
      };
    });
  }, [projectsList, conversationQueries, expandedProjectIds]);

  const createChat = useCallback(
    async (projectId: string) => {
      try {
        const conversation =
          await createConversationMutation.mutateAsync(projectId);
        setExpandedProjectIds((prev) => new Set(prev).add(projectId));
        router.push(dashboardConversationPath(projectId, conversation.id));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to create chat"
        );
      }
    },
    [createConversationMutation, router]
  );

  const deleteChat = useCallback(
    async (projectId: string, sessionId: string) => {
      const project = projectsList.find((p) => p.id === projectId);
      const knowledgeBaseId = project?.knowledge_base_id;
      if (!knowledgeBaseId) return;

      try {
        await deleteConversationMutation.mutateAsync({
          conversationId: sessionId,
          knowledgeBaseId,
        });
        if (activeSessionId === sessionId) {
          router.replace("/dashboard");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to delete chat"
        );
      }
    },
    [projectsList, deleteConversationMutation, activeSessionId, router]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        await deleteProjectMutation.mutateAsync({ projectId });
        toast.success("Project deleted successfully");
        if (activeProjectId === projectId) {
          router.replace("/dashboard");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to delete project"
        );
        throw error;
      }
    },
    [deleteProjectMutation, activeProjectId, router]
  );

  const value = useMemo<DashboardProjectsContextValue>(
    () => ({
      projects,
      projectsLoading,
      projectsError:
        projectsQueryError instanceof Error ? projectsQueryError : null,
      retryProjects: () => {
        void refetchProjects();
      },
      activeSessionId,
      activeProjectId,
      toggleProject,
      createChat,
      deleteChat,
      deleteProject,
    }),
    [
      projects,
      projectsLoading,
      projectsQueryError,
      refetchProjects,
      activeSessionId,
      activeProjectId,
      toggleProject,
      createChat,
      deleteChat,
      deleteProject,
    ]
  );

  return (
    <DashboardProjectsContext.Provider value={value}>
      {children}
    </DashboardProjectsContext.Provider>
  );
}

// Required dependency: the sidebar without its provider is a bug, so we throw.
export function useDashboardProjects() {
  const context = useContext(DashboardProjectsContext);
  if (!context) {
    throw new Error(
      "useDashboardProjects must be used within <DashboardProjectsProvider>"
    );
  }
  return context;
}
