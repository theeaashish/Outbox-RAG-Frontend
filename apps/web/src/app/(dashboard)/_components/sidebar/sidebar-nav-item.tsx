import type { ComponentType } from "react";
import { SidebarCollapsible, cx } from "@repo/ui";

export interface NavAction {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export function SidebarNavItem({
  label,
  icon: Icon,
  onClick,
  collapsed,
}: NavAction & { collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cx(
        "flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
        collapsed ? "w-9 justify-center px-0" : "w-full text-left"
      )}
    >
      <Icon className="size-4 shrink-0 text-zinc-500" />
      <SidebarCollapsible collapsed={collapsed}>
        <span className="whitespace-nowrap">{label}</span>
      </SidebarCollapsible>
    </button>
  );
}
