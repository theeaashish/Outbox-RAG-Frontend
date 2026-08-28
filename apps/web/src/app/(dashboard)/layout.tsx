import type { ReactNode } from "react";
import { DashboardShell } from "./_components/dashboard-shell";
import { DashboardProjectsProvider } from "./_components/sidebar/sidebar-data-provider";
import { MOCK_ACTIVE_SESSION_ID, MOCK_PROJECTS } from "./_components/fixtures";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProjectsProvider
      initialProjects={MOCK_PROJECTS}
      initialActiveSessionId={MOCK_ACTIVE_SESSION_ID}
    >
      <DashboardShell>{children}</DashboardShell>
    </DashboardProjectsProvider>
  );
}
