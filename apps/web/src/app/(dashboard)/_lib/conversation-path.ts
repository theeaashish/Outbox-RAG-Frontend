export function dashboardConversationPath(
  projectId: string,
  conversationId: string
): string {
  return `/dashboard/${projectId}/c/${conversationId}`;
}

export interface DashboardConversationPath {
  projectId: string;
  conversationId: string;
}

const CONVERSATION_PATH_RE =
  /^\/dashboard\/([^/]+)\/c\/([^/]+)\/?$/;

export function parseDashboardConversationPath(
  pathname: string
): DashboardConversationPath | null {
  const match = CONVERSATION_PATH_RE.exec(pathname);
  if (!match) return null;

  const projectId = match[1];
  const conversationId = match[2];
  if (!projectId || !conversationId) return null;

  return { projectId, conversationId };
}
