"use client";

import * as React from "react";
import { projectsReducer, type ProjectItem } from "./sidebar-data";
import { useProjects, type Project } from "@/features/projects";

interface DashboardProjectsContextValue {
  projects: ProjectItem[];
  projectsLoading: boolean;
  projectsError: Error | null;
  retryProjects: () => void;
  activeSessionId: string | null;
  toggleProject: (projectId: string) => void;
  createChat: (projectId: string) => void;
  deleteChat: (projectId: string, sessionId: string) => void;
  selectSession: (sessionId: string | null) => void;
}

const DashboardProjectsContext =
  React.createContext<DashboardProjectsContextValue | null>(null);

interface DashboardProjectsProviderProps {
  children: React.ReactNode;
  onSelectSession?: (sessionId: string | null) => void;
}

export function DashboardProjectsProvider({
  children,
  onSelectSession,
}: DashboardProjectsProviderProps) {
  const projectsQuery = useProjects();
  const [state, dispatch] = React.useReducer(projectsReducer, {
    projects: [],
    activeSessionId: null,
  });

  React.useEffect(() => {
    if (!projectsQuery.data) return;
    dispatch({
      type: "sync-projects",
      projects: projectsQuery.data.map(toProjectItem),
    });
  }, [projectsQuery.data]);

  const selectSession = React.useCallback(
    (sessionId: string | null) => {
      dispatch({ type: "select-session", sessionId });
      onSelectSession?.(sessionId);
    },
    [onSelectSession]
  );

  const value = React.useMemo<DashboardProjectsContextValue>(
    () => ({
      projects: state.projects,
      projectsLoading: projectsQuery.isLoading,
      projectsError:
        projectsQuery.error instanceof Error ? projectsQuery.error : null,
      retryProjects: () => {
        void projectsQuery.refetch();
      },
      activeSessionId: state.activeSessionId,
      toggleProject: (projectId) =>
        dispatch({ type: "toggle-project", projectId }),
      createChat: (projectId) => dispatch({ type: "create-chat", projectId }),
      deleteChat: (projectId, sessionId) =>
        dispatch({ type: "delete-chat", projectId, sessionId }),
      selectSession,
    }),
    [state.projects, state.activeSessionId, projectsQuery, selectSession]
  );

  return (
    <DashboardProjectsContext.Provider value={value}>
      {children}
    </DashboardProjectsContext.Provider>
  );
}

function toProjectItem(project: Project): ProjectItem {
  return {
    id: project.id,
    name: project.name,
    ...(project.description ? { description: project.description } : {}),
    knowledgeBaseId: project.knowledge_base_id,
  };
}

// Required dependency: the sidebar without its provider is a bug, so we throw.
export function useDashboardProjects() {
  const context = React.useContext(DashboardProjectsContext);
  if (!context) {
    throw new Error(
      "useDashboardProjects must be used within <DashboardProjectsProvider>"
    );
  }
  return context;
}
