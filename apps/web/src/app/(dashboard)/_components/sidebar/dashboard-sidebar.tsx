"use client";

import * as React from "react";
import {
  RiAddLine,
  RiCloseLine,
  RiCustomerServiceLine,
  RiMagicLine,
  RiRobot2Line,
  RiSettings4Line,
  RiSideBarFill,
} from "@remixicon/react";
import {
  DashboardTeamMenu,
  DashboardUserMenu,
  SettingsModal,
  SidebarCollapsible,
  ThemeToggle,
  cx,
  useMediaQuery,
} from "@repo/ui";
import { panelSurfaceClassName } from "../panel";
import { filterProjects } from "./sidebar-data";
import { useDashboardProjects } from "./sidebar-data-provider";
import { SidebarNavItem, type NavAction } from "./sidebar-nav-item";
import { ProjectNode } from "./project-node";
import { QuickSearch } from "./quick-search";
import { useHotkey } from "@/app/(dashboard)/_hooks/use-hotkey";
import { NewProjectDialog } from "@/app/(dashboard)/_components/new-project/new-project-dialog";

export interface DashboardSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  className?: string;
}

export function DashboardSidebar({
  mobile = false,
  onClose,
  className,
}: DashboardSidebarProps) {
  const {
    projects,
    projectsLoading,
    projectsError,
    retryProjects,
    activeSessionId,
    toggleProject,
    createChat,
    deleteChat,
    selectSession,
  } = useDashboardProjects();

  const [collapsedState, setCollapsedState] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [searchActive, setSearchActive] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const collapsed = mobile ? false : collapsedState;

  const openSearch = React.useCallback(() => {
    setCollapsedState(false);
    setSearchActive(true);
  }, []);

  const closeSearch = React.useCallback(() => {
    setSearchActive(false);
    setQuery("");
  }, []);

  const handleSearchHotkey = React.useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      event.preventDefault();
      openSearch();
    },
    [openSearch]
  );

  // The desktop instance stays mounted (CSS-hidden) below md, so the hotkey
  // must also be viewport-gated — a bare `!mobile` lets ⌘L move focus into
  // the invisible sidebar on narrow windows. And only the desktop instance
  // binds the hotkey; don't double-bind in the drawer.
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");
  useHotkey(
    { key: "l", metaOrCtrl: true, enabled: !mobile && isDesktopViewport },
    handleSearchHotkey
  );

  // Close the mobile drawer after picking a chat — expected drawer UX.
  const handleSelectSession = React.useCallback(
    (sessionId: string | null) => {
      selectSession(sessionId);
      if (mobile) onClose?.();
    },
    [selectSession, mobile, onClose]
  );

  const visibleProjects = React.useMemo(
    () => filterProjects(projects, query),
    [projects, query]
  );

  const primaryActions: NavAction[] = [
    {
      label: "New Project",
      icon: RiAddLine,
      onClick: () => setNewProjectOpen(true),
    },
    { label: "Automations", icon: RiRobot2Line },
    { label: "Customize", icon: RiMagicLine },
  ];

  const secondaryActions: NavAction[] = [
    { label: "Support", icon: RiCustomerServiceLine },
    {
      label: "Settings",
      icon: RiSettings4Line,
      onClick: () => setSettingsOpen(true),
    },
  ];

  return (
    <aside
      className={cx(
        "flex h-full shrink-0 select-none flex-col justify-between overflow-hidden transition-[width] duration-300 ease-in-out",
        panelSurfaceClassName,
        collapsed ? "w-15 px-2.75 py-3" : "w-65 p-3",
        className
      )}
    >
      <div
        className={cx(
          "-m-2 flex min-h-0 w-[calc(100%+16px)] flex-col gap-3 overflow-y-auto p-2 scrollbar-none [&::-webkit-scrollbar]:hidden",
          collapsed && "items-center"
        )}
      >
        <div
          className={cx(
            "flex w-full items-center",
            collapsed
              ? "flex-col-reverse justify-center gap-2.5"
              : "justify-between"
          )}
        >
          <div
            className={cx(
              "min-w-0 overflow-hidden",
              collapsed ? "flex w-9 items-center justify-center" : "flex-1"
            )}
          >
            <DashboardUserMenu
              collapsed={collapsed}
              avatarClassName="bg-zinc-200 font-semibold text-zinc-800"
            />
          </div>

          {mobile ? (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <RiCloseLine className="size-5" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsedState((value) => !value)}
              className={cx(
                "cursor-pointer text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200",
                collapsed && "flex size-9 items-center justify-center"
              )}
            >
              <RiSideBarFill
                className={cx(
                  "size-5 transition-transform duration-300 ease-in-out",
                  !collapsed && "-scale-x-100"
                )}
                aria-hidden
              />
            </button>
          )}
        </div>

        <QuickSearch
          collapsed={collapsed}
          active={searchActive}
          query={query}
          inputRef={searchInputRef}
          onActivate={openSearch}
          onClose={closeSearch}
          onQueryChange={setQuery}
        />

        <nav
          aria-label="Primary"
          className={cx(
            "flex w-full flex-col gap-0.5",
            collapsed && "items-center"
          )}
        >
          {primaryActions.map((action) => (
            <SidebarNavItem
              key={action.label}
              {...action}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div
          className={cx(
            "flex w-full flex-col gap-1 pt-1",
            collapsed && "items-center"
          )}
        >
          <SidebarCollapsible collapsed={collapsed}>
            <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Projects
            </span>
          </SidebarCollapsible>

          <div
            className={cx(
              "flex w-full flex-col gap-0.5",
              collapsed && "items-center"
            )}
          >
            {!collapsed && projectsLoading && (
              <p className="px-2 py-1 text-xs text-zinc-400">
                Loading projects...
              </p>
            )}
            {!collapsed && projectsError && (
              <div className="flex items-center gap-2 px-2 py-1">
                <p className="min-w-0 flex-1 text-xs text-red-500" role="alert">
                  {projectsError.message}
                </p>
                <button
                  type="button"
                  onClick={retryProjects}
                  className="shrink-0 text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                >
                  Retry
                </button>
              </div>
            )}
            {!projectsLoading &&
              !projectsError &&
              visibleProjects.map((project) => (
                <ProjectNode
                  key={project.id}
                  project={project}
                  collapsed={collapsed}
                  activeSessionId={activeSessionId}
                  onToggle={toggleProject}
                  onNewChat={createChat}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={deleteChat}
                />
              ))}
            {!collapsed &&
              !projectsLoading &&
              !projectsError &&
              visibleProjects.length === 0 && (
                <p className="px-2 py-1 text-xs text-zinc-400">
                  No matches for &ldquo;{query}&rdquo;.
                </p>
              )}
          </div>
        </div>
      </div>

      <div
        className={cx(
          "flex shrink-0 flex-col gap-2.5 pt-2",
          collapsed ? "w-full items-center" : "w-full"
        )}
      >
        <ThemeToggle
          collapsed={collapsed}
          appearance={collapsed ? undefined : "sidebar-segmented"}
        />

        <nav
          aria-label="Secondary"
          className={cx(
            "flex w-full flex-col gap-0.5",
            collapsed && "items-center"
          )}
        >
          {secondaryActions.map((action) => (
            <SidebarNavItem
              key={action.label}
              {...action}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <DashboardTeamMenu collapsed={collapsed} />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
      />
    </aside>
  );
}
