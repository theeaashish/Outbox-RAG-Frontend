import type { ReactNode } from "react";
import { DashboardShell } from "./_components/dashboard-shell";
import { DashboardProjectsProvider } from "./_components/sidebar/sidebar-data-provider";
import { DashboardAuthGuard } from "./dashboard-auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <DashboardProjectsProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProjectsProvider>
    </DashboardAuthGuard>
  );
}
