"use client";

import { useEffect, type RefObject } from "react";
import { RiSearchLine } from "@remixicon/react";
import { CloseButton, Kbd, SidebarCollapsible, cx } from "@repo/ui";

interface QuickSearchProps {
  collapsed: boolean;
  active: boolean;
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onActivate: () => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
}

export function QuickSearch({
  collapsed,
  active,
  query,
  inputRef,
  onActivate,
  onClose,
  onQueryChange,
}: QuickSearchProps) {
  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active, inputRef]);

  if (active && !collapsed) {
    return (
      <div className="flex w-full items-center gap-2 rounded-xl bg-zinc-100/80 px-2.5 py-1.5 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700">
        <RiSearchLine className="size-4 shrink-0 text-zinc-400" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search projects and chats"
          placeholder="Search projects & chats..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <CloseButton size="2xs" aria-label="Close search" onClick={onClose} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      title={collapsed ? "Quick Search" : undefined}
      className={cx(
        "flex cursor-pointer items-center rounded-xl bg-zinc-100/80 text-zinc-500 transition-colors hover:bg-zinc-200/70 dark:bg-zinc-800/70 dark:text-zinc-400 dark:hover:bg-zinc-800",
        collapsed
          ? "size-9 justify-center p-0"
          : "w-full justify-between p-2 text-left gap-2"
      )}
    >
      <span
        className={cx(
          "flex min-w-0 items-center",
          collapsed ? "justify-center" : "gap-2"
        )}
      >
        <RiSearchLine className="size-4 shrink-0 text-zinc-500" aria-hidden />
        <SidebarCollapsible collapsed={collapsed}>
          <span className="whitespace-nowrap text-xs">Quick Search</span>
        </SidebarCollapsible>
      </span>
      <SidebarCollapsible collapsed={collapsed}>
        <Kbd>⌘L</Kbd>
      </SidebarCollapsible>
    </button>
  );
}
