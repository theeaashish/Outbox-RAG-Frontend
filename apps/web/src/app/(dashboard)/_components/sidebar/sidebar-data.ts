export interface ChatSession {
  id: string;
  title: string;
  time: string;
  href?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  expanded?: boolean;
  sessions?: ChatSession[];
}

export interface ProjectsState {
  projects: ProjectItem[];
  activeSessionId: string | null;
}

export type ProjectsAction =
  | { type: "toggle-project"; projectId: string }
  | { type: "create-project" }
  | { type: "create-chat"; projectId: string }
  | { type: "delete-chat"; projectId: string; sessionId: string }
  | { type: "select-session"; sessionId: string | null };

export function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}

export function projectsReducer(
  state: ProjectsState,
  action: ProjectsAction
): ProjectsState {
  switch (action.type) {
    case "toggle-project":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, expanded: !p.expanded } : p
        ),
      };

    case "create-project": {
      const sessionId = createId("chat");
      const project: ProjectItem = {
        id: createId("project"),
        name: `new project ${state.projects.length + 1}`,
        expanded: true,
        sessions: [{ id: sessionId, title: "New chat", time: "now" }],
      };
      return {
        projects: [project, ...state.projects],
        activeSessionId: sessionId,
      };
    }

    case "create-chat": {
      const sessionId = createId("chat");
      return {
        ...state,
        activeSessionId: sessionId,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                expanded: true,
                sessions: [
                  { id: sessionId, title: "New chat", time: "now" },
                  ...(p.sessions ?? []),
                ],
              }
            : p
        ),
      };
    }

    case "delete-chat": {
      return {
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                sessions: (p.sessions ?? []).filter(
                  (s) => s.id !== action.sessionId
                ),
              }
            : p
        ),
        activeSessionId:
          state.activeSessionId === action.sessionId
            ? null
            : state.activeSessionId,
      };
    }

    case "select-session":
      return { ...state, activeSessionId: action.sessionId };

    default: {
      return state;
    }
  }
}

export function filterProjects(
  projects: ProjectItem[],
  query: string
): ProjectItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return projects;
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(trimmed) ||
      project.sessions?.some((session) =>
        session.title.toLowerCase().includes(trimmed)
      )
  );
}
