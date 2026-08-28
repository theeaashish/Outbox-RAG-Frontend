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
            className="size-9 shrink-0 rounded-full bg-white text-zinc-900 shadow-[0_1px_2px_rgba(16,24,40,0.08),0_0_0_1px_rgba(16,24,40,0.04)] hover:bg-zinc-50"
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
        className="w-100 max-w-[calc(100vw-2rem)] gap-0 rounded-2xl bg-white p-2 shadow-[0_0_0_1px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.25)]"
      >
        <p className="px-3 pb-1 pt-2 text-sm text-zinc-500">Add</p>
        <MenuRow
          icon={<Paperclip className="size-4.5 shrink-0 text-zinc-700" />}
          title="Files and folders"
          onClick={() => handleAction(onFilesClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={<Locate className="size-4.5 shrink-0 text-zinc-700" />}
          title="Goal"
          desc="Set a goal for faster results"
          onClick={() => handleAction(onGoalClick)}
          disabled={disabled}
        />
        <MenuRow
          icon={<SlidersHorizontal className="size-4.5 shrink-0 text-zinc-700" />}
          title="Plan mode"
          desc="Manage complex tasks"
          onClick={() => handleAction(onPlanClick)}
          disabled={disabled}
        />

        <p className="px-3 pb-1 pt-3 text-sm text-zinc-500">Plugins</p>
        <MenuRow
          icon={
            <PluginIcon className="bg-zinc-400">
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
            <PluginIcon className="bg-teal-500">
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


