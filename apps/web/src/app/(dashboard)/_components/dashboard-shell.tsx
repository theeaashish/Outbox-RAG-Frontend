"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@repo/ui";
import { DashboardSidebar } from "./sidebar/dashboard-sidebar";

import { panelSurfaceClassName } from "./panel";
import { useEscapeKey } from "@/app/(dashboard)/_hooks/use-escape-key";
import { useBodyScrollLock } from "@/app/(dashboard)/_hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/app/(dashboard)/_hooks/use-focus-trap";

export interface DashboardShellProps {
  children: ReactNode;
}

interface DashboardShellContextValue {
  openMobileSidebar: () => void;
}

const DashboardShellContext =
  createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const openMobileSidebar = useCallback(
    () => setMobileSidebarOpen(true),
    []
  );
  const closeMobileSidebar = useCallback(
    () => setMobileSidebarOpen(false),
    []
  );
  const contextValue = useMemo(
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
  const drawerRef = useRef<HTMLDivElement>(null);
  useEscapeKey(open, onClose);
  useBodyScrollLock(open);
  useFocusTrap(open, drawerRef);

  if (!open) return null;

  return (
    <div
      ref={drawerRef}
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation sidebar"
      tabIndex={-1}
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
