"use client";

import * as React from "react";
import { projectsReducer, type ProjectItem } from "./sidebar-data";

interface DashboardProjectsContextValue {
  projects: ProjectItem[];
  activeSessionId: string | null;
  toggleProject: (projectId: string) => void;
  createProject: () => void;
  createChat: (projectId: string) => void;
  deleteChat: (projectId: string, sessionId: string) => void;
  selectSession: (sessionId: string | null) => void;
}

const DashboardProjectsContext =
  React.createContext<DashboardProjectsContextValue | null>(null);

interface DashboardProjectsProviderProps {
  children: React.ReactNode;
  initialProjects: ProjectItem[];
  initialActiveSessionId?: string | null;
  onSelectSession?: (sessionId: string | null) => void;
}

export function DashboardProjectsProvider({
  children,
  initialProjects,
  initialActiveSessionId = null,
  onSelectSession,
}: DashboardProjectsProviderProps) {
  const [state, dispatch] = React.useReducer(projectsReducer, {
    projects: initialProjects,
    activeSessionId: initialActiveSessionId,
  });

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
      activeSessionId: state.activeSessionId,
      toggleProject: (projectId) =>
        dispatch({ type: "toggle-project", projectId }),
      createProject: () => dispatch({ type: "create-project" }),
      createChat: (projectId) => dispatch({ type: "create-chat", projectId }),
      deleteChat: (projectId, sessionId) =>
        dispatch({ type: "delete-chat", projectId, sessionId }),
      selectSession,
    }),
    [state, selectSession]
  );

  return (
    <DashboardProjectsContext.Provider value={value}>
      {children}
    </DashboardProjectsContext.Provider>
  );
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
