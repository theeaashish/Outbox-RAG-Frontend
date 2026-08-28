import * as React from "react";

import { cn } from "@repo/ui";

export interface MenuRowProps {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function MenuRow({
  icon,
  title,
  desc,
  onClick,
  disabled = false,
}: MenuRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-zinc-800/70 dark:focus-visible:bg-zinc-800/70"
    >
      <span className="text-zinc-600 dark:text-zinc-300">{icon}</span>
      <span className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </span>
      {desc ? (
        <span className="truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">
          {desc}
        </span>
      ) : null}
    </button>
  );
}

export function MenuDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-1 my-1.5 h-px bg-zinc-200 dark:bg-zinc-800", className)}
    />
  );
}

export interface PluginIconProps {
  className?: string;
  children: React.ReactNode;
}

export function PluginIcon({ className, children }: PluginIconProps) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-white",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Decorative radio dot. Selection state is conveyed by the owning row's
 * `aria-checked`, so this must stay hidden from the accessibility tree.
 */
export function Radio({ checked }: { checked: boolean }) {
  return checked ? (
    <span
      aria-hidden="true"
      className="flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 border-orange-500 bg-white dark:bg-zinc-900"
    >
      <span className="size-1.5 rounded-full bg-orange-500" />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="size-4.5 shrink-0 rounded-full border-[1.5px] border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
    />
  );
}
