"use client";

import { Fragment, type ReactNode } from "react";
import { RiArrowRightSLine, RiMenuLine } from "@remixicon/react";
import { cx } from "@repo/ui";
import { useDashboardShell } from "./dashboard-shell";

export interface BreadcrumbItem {
  label: string;
  icon?: ReactNode;
  current?: boolean;
}

const actionButtonClassName =
  "flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export function HeaderAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={actionButtonClassName}
    >
      {children}
    </button>
  );
}

export interface DashboardHeaderProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
  /** Overrides the shell's mobile drawer behaviour (useful in previews/tests). */
  onMobileMenuOpen?: () => void;
  className?: string;
}

export function DashboardHeader({
  items,
  actions,
  onMobileMenuOpen,
  className,
}: DashboardHeaderProps) {
  const shell = useDashboardShell();
  const handleOpenMobileMenu = onMobileMenuOpen ?? shell?.openMobileSidebar;

  return (
    <header
      className={cx(
        "flex h-12 w-full shrink-0 select-none items-center justify-between px-4 text-xs",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {handleOpenMobileMenu && (
          <button
            type="button"
            onClick={handleOpenMobileMenu}
            aria-label="Open sidebar"
            className="mr-1 cursor-pointer text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 md:hidden"
          >
            <RiMenuLine className="size-4.5" aria-hidden />
          </button>
        )}

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-zinc-500 dark:text-zinc-400"
        >
          {items.map((item, index) => (
            <Fragment key={`${index}-${item.label}`}>
              {index > 0 && (
                <RiArrowRightSLine
                  className="size-3.5 shrink-0 text-zinc-400"
                  aria-hidden
                />
              )}
              <span
                aria-current={item.current ? "page" : undefined}
                className={cx(
                  "flex min-w-0 items-center gap-1.5 truncate font-medium",
                  item.current
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                {item.icon && (
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </span>
            </Fragment>
          ))}
        </nav>
      </div>

      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
