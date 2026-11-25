"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiAddLine,
  RiCloseLine,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiMagicLine,
  RiRobot2Line,
  RiSettings4Line,
  RiSideBarFill,
} from "@remixicon/react";
import {
  BoardAvatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  LogoIcon,
  SettingsModal,
  SidebarCollapsible,
  ThemeToggle,
  cx,
  useMediaQuery,
} from "@repo/ui";
import { toast } from "sonner";
import { panelSurfaceClassName } from "../panel";
import { filterProjects } from "./sidebar-data";
import { useDashboardProjects } from "./sidebar-data-provider";
import { SidebarNavItem, type NavAction } from "./sidebar-nav-item";
import { ProjectNode } from "./project-node";
import { QuickSearch } from "./quick-search";
import { useHotkey } from "@/app/(dashboard)/_hooks/use-hotkey";
import { NewProjectDialog } from "@/app/(dashboard)/_components/new-project/new-project-dialog";
import { useCurrentUser, useLogout } from "@/features/auth";

function getUserDisplay(user: { name: string | null; email: string } | null) {
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const email = user?.email ?? "";
  const parts = name.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return { name, email, initials };
}

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
    deleteProject,
  } = useDashboardProjects();

  const router = useRouter();
  const { user } = useCurrentUser();
  const logoutMutation = useLogout();
  const {
    name: userName,
    email: userEmail,
    initials: userInitials,
  } = getUserDisplay(user);

  const [collapsedState, setCollapsedState] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const collapsed = mobile ? false : collapsedState;

  const openSearch = useCallback(() => {
    setCollapsedState(false);
    setSearchActive(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setQuery("");
  }, []);

  const handleSearchHotkey = useCallback(
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
  const handleNavigateSession = useCallback(() => {
    if (mobile) onClose?.();
  }, [mobile, onClose]);

  const visibleProjects = useMemo(
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
    {
      label: "Settings",
      icon: RiSettings4Line,
      onClick: () => setSettingsOpen(true),
    },
  ];

  const handleSignOut = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign out"
      );
    }
  }, [logoutMutation, router]);

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
            <Link
              href="/dashboard"
              aria-label="Outbox Home"
              className={cx(
                "inline-flex items-center rounded-lg transition-colors hover:opacity-90",
                collapsed ? "justify-center p-1" : "gap-2 px-1 py-0.5"
              )}
            >
              <LogoIcon className="size-6 shrink-0" aria-hidden />
              <SidebarCollapsible collapsed={collapsed}>
                <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Outbox
                </span>
              </SidebarCollapsible>
            </Link>
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
                  className="shrink-0 text-xs font-medium text-accent-600 underline underline-offset-2 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
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
                  onNavigateSession={handleNavigateSession}
                  onDeleteSession={deleteChat}
                  onDeleteProject={deleteProject}
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={userName}
                title={collapsed ? userName : undefined}
                className={cx(
                  "flex cursor-pointer items-center overflow-hidden outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-accent-500/60 focus-visible:ring-offset-2",
                  collapsed
                    ? "size-9 justify-center rounded-full"
                    : "w-full justify-between gap-2 rounded-xl bg-zinc-100/80 px-2.5 py-2 hover:bg-zinc-200/60 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
                )}
              >
                <span
                  className={cx(
                    "flex min-w-0 items-center",
                    collapsed ? "justify-center" : "gap-2.5"
                  )}
                >
                  <BoardAvatar
                    size="md"
                    color="blue"
                    initials={userInitials}
                    className="bg-linear-to-b from-accent-500 to-accent-600 text-xs font-semibold text-white"
                  />
                  <SidebarCollapsible collapsed={collapsed}>
                    <span className="flex min-w-0 flex-col items-start text-left">
                      <span className="max-w-36 truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {userName}
                      </span>
                      {userEmail && (
                        <span className="max-w-36 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {userEmail}
                        </span>
                      )}
                    </span>
                  </SidebarCollapsible>
                </span>
                <SidebarCollapsible collapsed={collapsed}>
                  <RiExpandUpDownLine
                    className="size-4 shrink-0 text-zinc-400"
                    aria-hidden
                  />
                </SidebarCollapsible>
              </button>
            }
          />
          <DropdownMenuContent
            align="end"
            side={mobile || !isDesktopViewport ? "top" : "right"}
            sideOffset={8}
            className="w-56 min-w-52 rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="px-2 py-1.5">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {userName}
              </p>
              {userEmail && (
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {userEmail}
                </p>
              )}
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => setSettingsOpen(true)}
              className="cursor-pointer gap-2 rounded-lg text-xs text-zinc-700 focus:bg-zinc-100 dark:text-zinc-300 dark:focus:bg-zinc-800"
            >
              <RiSettings4Line className="size-3.5" aria-hidden />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={logoutMutation.isPending}
              onClick={() => void handleSignOut()}
              className="cursor-pointer gap-2 rounded-lg text-xs text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50 dark:focus:text-red-400"
            >
              <RiLogoutBoxRLine className="size-3.5" aria-hidden />
              <span>
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
