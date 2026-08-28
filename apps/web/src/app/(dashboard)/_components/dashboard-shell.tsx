"use client";

import * as React from "react";
import { cx } from "@repo/ui";
import { DashboardSidebar } from "./sidebar/dashboard-sidebar";

import { panelSurfaceClassName } from "./panel";
import { useEscapeKey } from "@/app/(dashboard)/_hooks/use-escape-key";
import { useBodyScrollLock } from "@/app/(dashboard)/_hooks/use-body-scroll-lock";

export interface DashboardShellProps {
  children: React.ReactNode;
}

interface DashboardShellContextValue {
  openMobileSidebar: () => void;
}

const DashboardShellContext =
  React.createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  return React.useContext(DashboardShellContext);
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const openMobileSidebar = React.useCallback(
    () => setMobileSidebarOpen(true),
    []
  );
  const closeMobileSidebar = React.useCallback(
    () => setMobileSidebarOpen(false),
    []
  );
  const contextValue = React.useMemo(
    () => ({ openMobileSidebar }),
    [openMobileSidebar]
  );

  return (
    <DashboardShellContext.Provider value={contextValue}>
      <div className="flex h-screen w-full gap-2.5 overflow-hidden bg-zinc-100/70 p-2.5 dark:bg-zinc-950 sm:gap-3 sm:p-3">
        {/* Desktop floating sidebar */}
        <div className="hidden h-full md:flex">
          <DashboardSidebar />
        </div>

        <MobileSidebarDrawer
          open={mobileSidebarOpen}
          onClose={closeMobileSidebar}
        />

        {/* Main workspace container */}
        <main
          className={cx(
            "flex min-w-0 flex-1 flex-col overflow-hidden",
            panelSurfaceClassName
          )}
        >
          {children}
        </main>
      </div>
    </DashboardShellContext.Provider>
  );
}

function MobileSidebarDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEscapeKey(open, onClose);
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation sidebar"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 h-full w-full max-w-70 p-3">
        <DashboardSidebar mobile onClose={onClose} />
      </div>
    </div>
  );
}
