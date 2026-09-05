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
        "flex cursor-pointer items-center rounded-xl text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
        collapsed
          ? "size-9 justify-center p-0"
          : "w-full gap-2 px-2 py-1.5 text-left"
      )}
    >
      <Icon className="size-4 shrink-0 text-zinc-500" />
      <SidebarCollapsible collapsed={collapsed}>
        <span className="whitespace-nowrap">{label}</span>
      </SidebarCollapsible>
    </button>
  );
}
