import type { ReactNode } from "react";
import { cx } from "../../../utils/cx";

/**
 * Collapsible text/badge slot for sidebar rails: blurs + fades + shrinks away
 * when the rail closes, and blurs back in on expand. The icons/rows themselves
 * stay pinned in place — only these label/badge slots animate — so nothing
 * jumps to center. `className` merges last-wins, so callers can override the
 * expanded `max-w-40` cap (e.g. `max-w-full`) for wider rails.
 */
export function SidebarCollapsible({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        "max-w-40 opacity-100 blur-0",
        className,
        collapsed && "max-w-0 opacity-0 blur-[3px]"
      )}
    >
      {children}
    </span>
  );
}
