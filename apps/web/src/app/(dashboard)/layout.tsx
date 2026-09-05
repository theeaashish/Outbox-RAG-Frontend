import type { ReactNode } from "react";
import { DashboardShell } from "./_components/dashboard-shell";
import { DashboardProjectsProvider } from "./_components/sidebar/sidebar-data-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProjectsProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProjectsProvider>
  );
}
