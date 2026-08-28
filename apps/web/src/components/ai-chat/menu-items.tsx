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
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:pointer-events-none"
    >
      {icon}
      <span className="shrink-0 text-[15px] font-medium text-zinc-900">
        {title}
      </span>
      {desc ? (
        <span className="truncate text-[15px] font-normal text-zinc-500">
          {desc}
        </span>
      ) : null}
    </button>
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

export function Radio({ checked }: { checked: boolean }) {
  return checked ? (
    <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 border-orange-500 bg-white">
      <span className="size-1.5 rounded-full bg-orange-500" />
    </span>
  ) : (
    <span className="size-4.5 shrink-0 rounded-full border-[1.5px] border-zinc-300 bg-white" />
  );
}
