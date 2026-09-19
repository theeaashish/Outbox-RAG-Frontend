export interface ChatSession {
  id: string;
  title: string;
  time: string;
  href?: string;
}

export interface KnowledgeBaseFile {
  id: string;
  name: string;
  sizeBytes: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  knowledgeBaseId: string;
  knowledgeBase?: KnowledgeBaseFile[];
  expanded?: boolean;
  sessions?: ChatSession[];
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
