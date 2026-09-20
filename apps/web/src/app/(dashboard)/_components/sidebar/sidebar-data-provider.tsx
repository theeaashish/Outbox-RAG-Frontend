"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils";
import type { ChatSession, ProjectItem } from "./sidebar-data";
import { useProjects } from "@/features/projects";
import {
  conversationKeys,
  listConversations,
  useCreateProjectConversation,
  useDeleteConversation,
} from "@/features/conversations";

interface DashboardProjectsContextValue {
  projects: ProjectItem[];
  projectsLoading: boolean;
  projectsError: Error | null;
  retryProjects: () => void;
  activeSessionId: string | null;
  toggleProject: (projectId: string) => void;
  createChat: (projectId: string) => Promise<void>;
  deleteChat: (projectId: string, sessionId: string) => Promise<void>;
  selectSession: (sessionId: string | null) => void;
}

const DashboardProjectsContext =
  createContext<DashboardProjectsContextValue | null>(null);

interface DashboardProjectsProviderProps {
  children: ReactNode;
  onSelectSession?: (sessionId: string | null) => void;
}

export function DashboardProjectsProvider({
  children,
  onSelectSession,
}: DashboardProjectsProviderProps) {
  const queryClient = useQueryClient();
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const createConversationMutation = useCreateProjectConversation();
  const deleteConversationMutation = useDeleteConversation();

  const resolvedActiveProjectId = useMemo(() => {
    if (activeProjectId) return activeProjectId;
    if (!activeSessionId) return null;
    const found = projectsList.find((p) => {
      const cached = queryClient.getQueryData<{
        items?: Array<{ id: string }>;
      }>(conversationKeys.list(p.knowledge_base_id));
      return cached?.items?.some((item) => item.id === activeSessionId);
    });
    return found?.id ?? null;
  }, [activeProjectId, activeSessionId, projectsList, queryClient]);

  const conversationQueries = useQueries({
    queries: projectsList.map((project) => {
      const isExpanded = expandedProjectIds.has(project.id);
      const isActive = project.id === resolvedActiveProjectId;
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
        setActiveSessionId(conversation.id);
        setActiveProjectId(projectId);
        setExpandedProjectIds((prev) => new Set(prev).add(projectId));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to create chat"
        );
      }
    },
    [createConversationMutation]
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
        setActiveSessionId((current) =>
          current === sessionId ? null : current
        );
        setActiveProjectId((current) =>
          current === projectId && activeSessionId === sessionId
            ? null
            : current
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to delete chat"
        );
      }
    },
    [projectsList, deleteConversationMutation, activeSessionId]
  );

  const selectSession = useCallback(
    (sessionId: string | null) => {
      setActiveSessionId(sessionId);
      if (!sessionId) {
        setActiveProjectId(null);
      } else {
        const owner = projectsList.find((p) => {
          const cached = queryClient.getQueryData<{
            items?: Array<{ id: string }>;
          }>(conversationKeys.list(p.knowledge_base_id));
          return cached?.items?.some((item) => item.id === sessionId);
        });
        if (owner) {
          setActiveProjectId(owner.id);
        }
      }
      onSelectSession?.(sessionId);
    },
    [projectsList, queryClient, onSelectSession]
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
      toggleProject,
      createChat,
      deleteChat,
      selectSession,
    }),
    [
      projects,
      projectsLoading,
      projectsQueryError,
      refetchProjects,
      activeSessionId,
      toggleProject,
      createChat,
      deleteChat,
      selectSession,
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
