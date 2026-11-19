"use client";

import { useCallback, useEffect, useState } from "react";
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

import { cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { MenuDivider, MenuRow, PluginIcon } from "./menu-items";
import {
  menuHeadingClassName,
  popoverSurfaceClassName,
} from "./popover-surface";

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
  const [open, setOpen] = useState(false);

  // Close and reset state when composer disables so the menu never ghosts back open.
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const isOpen = open && !disabled;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(disabled ? false : nextOpen);
    },
    [disabled]
  );

  const handleAction = (callback?: () => void) => {
    if (disabled || !callback) return;
    setOpen(false);
    callback();
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            aria-label={isOpen ? "Close add menu" : "Open add menu"}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-zinc-100/90 text-zinc-500 shadow-none transition-colors hover:bg-zinc-200/70 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500/70"
          />
        }
      >
        <Plus
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen && "rotate-45"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className={cn(popoverSurfaceClassName, "w-80 max-w-[calc(100vw-2rem)]")}
      >
        <p className={cn(menuHeadingClassName, "pt-2")}>Add</p>

        <MenuRow
          icon={<Paperclip className="size-4 shrink-0" />}
          title="Files and folders"
          onClick={() => handleAction(onFilesClick)}
          disabled={disabled || !onFilesClick}
        />
        <MenuRow
          icon={<Locate className="size-4 shrink-0" />}
          title="Goal"
          desc="Set a goal for faster results"
          onClick={() => handleAction(onGoalClick)}
          disabled={disabled || !onGoalClick}
        />
        <MenuRow
          icon={<SlidersHorizontal className="size-4 shrink-0" />}
          title="Plan mode"
          desc="Manage complex tasks"
          onClick={() => handleAction(onPlanClick)}
          disabled={disabled || !onPlanClick}
        />

        <MenuDivider />

        <p className={cn(menuHeadingClassName, "pt-1.5")}>Plugins</p>

        <MenuRow
          icon={
            <PluginIcon className="bg-zinc-500">
              <FileText className="size-3.5" />
            </PluginIcon>
          }
          title="Documents"
          desc="Create and edit documents"
          onClick={() => handleAction(onDocumentsClick)}
          disabled={disabled || !onDocumentsClick}
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
          disabled={disabled || !onSpreadsheetsClick}
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
          disabled={disabled || !onPresentationsClick}
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
          disabled={disabled || !onCodeClick}
        />
      </PopoverContent>
    </Popover>
  );
}
