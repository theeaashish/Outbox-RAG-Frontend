import {
  RiAddLine,
  RiDeleteBinLine,
  RiFolder6Line,
  RiFolderOpenLine,
  RiMoreFill,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarCollapsible,
  cx,
} from "@repo/ui";
import type { ChatSession, ProjectItem } from "./sidebar-data";

interface SessionRowProps {
  session: ChatSession;
  selected: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

function SessionRow({
  session,
  selected,
  onSelect,
  onDelete,
}: SessionRowProps) {
  return (
    <div className="group/chat relative flex items-center">
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "flex h-7 w-full cursor-pointer items-center justify-between rounded-lg px-2 text-left text-xs transition-colors",
          selected
            ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200"
        )}
      >
        <span className="block min-w-0 flex-1 truncate pr-1 text-left">
          {session.title}
        </span>
        <span
          className={cx(
            "shrink-0 text-[10px] tabular-nums transition-opacity duration-150 group-focus-within/chat:opacity-0 group-hover/chat:opacity-0",
            selected
              ? "font-medium text-zinc-700 dark:text-zinc-300"
              : "text-zinc-400"
          )}
        >
          {session.time}
        </span>
      </button>

      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center opacity-0 transition-opacity duration-150 group-focus-within/chat:pointer-events-auto group-focus-within/chat:opacity-100 group-hover/chat:pointer-events-auto group-hover/chat:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Options for ${session.title}`}
                className="flex size-5 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                <RiMoreFill className="size-3.5" aria-hidden />
              </button>
            }
          />
          <DropdownMenuContent align="end" side="right" className="min-w-32">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(session.id)}
              className="cursor-pointer gap-2 text-xs text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50 dark:focus:text-red-400"
            >
              <RiDeleteBinLine className="size-3.5" aria-hidden />
              <span>Delete chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface ProjectNodeProps {
  project: ProjectItem;
  collapsed: boolean;
  activeSessionId: string | null;
  onToggle: (projectId: string) => void;
  onNewChat: (projectId: string) => void;
  onSelectSession: (sessionId: string | null) => void;
  onDeleteSession: (projectId: string, sessionId: string) => void;
}

export function ProjectNode({
  project,
  collapsed,
  activeSessionId,
  onToggle,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ProjectNodeProps) {
  const sessions = project.sessions ?? [];
  const showSessions =
    !collapsed && Boolean(project.expanded) && sessions.length > 0;
  const FolderIcon = project.expanded ? RiFolderOpenLine : RiFolder6Line;

  return (
    <div className="group/project flex flex-col">
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => onToggle(project.id)}
          aria-expanded={Boolean(project.expanded)}
          title={collapsed ? project.name : undefined}
          className={cx(
            "flex h-8 cursor-pointer items-center gap-2 rounded-xl px-2 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
            collapsed ? "w-9 justify-center px-0" : "w-full"
          )}
        >
          <FolderIcon className="size-4 shrink-0 text-zinc-500" aria-hidden />
          <SidebarCollapsible collapsed={collapsed} className="max-w-full">
            <span className="truncate">{project.name}</span>
          </SidebarCollapsible>
        </button>

        {!collapsed && (
          <button
            type="button"
            aria-label={`New chat in ${project.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onNewChat(project.id);
            }}
            className="pointer-events-none absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-zinc-400 opacity-0 transition-opacity duration-150 hover:bg-zinc-200/80 hover:text-zinc-700 focus-visible:opacity-100 group-focus-within/project:pointer-events-auto group-focus-within/project:opacity-100 group-hover/project:pointer-events-auto group-hover/project:opacity-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <RiAddLine className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {showSessions && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              selected={session.id === activeSessionId}
              onSelect={onSelectSession}
              onDelete={(sessionId) => onDeleteSession(project.id, sessionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
