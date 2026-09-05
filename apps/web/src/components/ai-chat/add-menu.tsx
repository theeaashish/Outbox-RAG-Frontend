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

import {
  BoardButton,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
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
  const [open, setOpen] = React.useState(false);

  const handleAction = (callback?: () => void) => {
    setOpen(false);
    callback?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <BoardButton
            variant="secondary"
            size="small"
            iconOnly
            disabled={disabled}
            aria-label={open ? "Close add menu" : "Open add menu"}
            className="rounded-full border-0 bg-zinc-100/90 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
        className={cn(popoverSurfaceClassName, "w-80 max-w-[calc(100vw-2rem)]")}
      >
        <p className={cn(menuHeadingClassName, "pt-2")}>Add</p>

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
