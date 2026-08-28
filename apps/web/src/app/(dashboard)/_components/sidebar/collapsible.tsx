import type { ReactNode } from "react";
import { cx } from "@repo/ui";

export function Collapsible({
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
        collapsed
          ? "max-w-0 opacity-0 blur-[3px]"
          : "max-w-full opacity-100 blur-0",
        className
      )}
    >
      {children}
    </span>
  );
}
