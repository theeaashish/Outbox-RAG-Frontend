"use client";

import * as React from "react";
import {
  Code,
  FileText,
  Locate,
  Paperclip,
  Plus,
  Presentation,
  Sheet,
  SlidersHorizontal,
} from "lucide-react";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { MenuRow, PluginIcon } from "./menu-items";

export interface AddMenuProps {
  disabled?: boolean;

  onFilesClick?: () => void;
  onGoalClick?: () => void;
  onPlanClick?: () => void;
  onDocumentsClick?: () => void;
  onSpreadsheetsClick?: () => void;
  onPresentationsClick?: () => void;
  onCodeClick?: () => void;
}

/** "+" button that opens the "Add / Plugins" popover. */
export function AddMenu({
  disabled = false,
  onFilesClick,
  onGoalClick,
  onPlanClick,
  onDocumentsClick,
  onSpreadsheetsClick,
  onPresentationsClick,
  onCodeClick,
}: AddMenuProps) {
  const [open, setOpen] = React.useState(false);

  const handleAction = (callback?: () => void) => {
    setOpen(false);
    callback?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            aria-label={open ? "Close add menu" : "Open add menu"}
            className="size-9 shrink-0 rounded-full bg-zinc-100/90 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/80 dark:hover:bg-zinc-700"
          />
        }
      >
        <Plus
          className={cn(
            "size-4 transition-transform duration-200",
            open && "rotate-45"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="w-80 max-w-[calc(100vw-2rem)] gap-0 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]"
      >
        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Add
        </p>
        <MenuRow
          icon={<Paperclip className="size-4 shrink-0" />}
          title="Files and folders"
          onClick={() => handleAction(onFilesClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={<Locate className="size-4 shrink-0" />}
          title="Goal"
          desc="Set a goal for faster results"
          onClick={() => handleAction(onGoalClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={<SlidersHorizontal className="size-4 shrink-0" />}
          title="Plan mode"
          desc="Manage complex tasks"
          onClick={() => handleAction(onPlanClick)}
          disabled={disabled}
        />

        <div className="mx-1 my-1.5 h-px bg-zinc-200 dark:bg-zinc-800" />

        <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Plugins
        </p>
        <MenuRow
          icon={
            <PluginIcon className="bg-zinc-500">
              <FileText className="size-3.5" />
            </PluginIcon>
          }
          title="Documents"
          desc="Create and edit documents"
          onClick={() => handleAction(onDocumentsClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={
            <PluginIcon className="bg-blue-500">
              <Sheet className="size-3.5" />
            </PluginIcon>
          }
          title="Spreadsheets"
          desc="Generate spreadsheets"
          onClick={() => handleAction(onSpreadsheetsClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={
            <PluginIcon className="bg-violet-500">
              <Presentation className="size-3.5" />
            </PluginIcon>
          }
          title="Presentations"
          desc="Create marketing assets"
          onClick={() => handleAction(onPresentationsClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={
            <PluginIcon className="bg-emerald-500">
              <Code className="size-3.5" />
            </PluginIcon>
          }
          title="Code blocks"
          desc="Write and edit existing code"
          onClick={() => handleAction(onCodeClick)}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
