"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  BoardButton,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import { EFFORT_LEVELS, MODELS, type Model } from "./constants";
import { EffortSlider } from "./effort-slider";
import { MenuDivider } from "./menu-items";
import { MenuRadioGroup } from "./menu-radio-group";
import {
  menuHeadingClassName,
  popoverSurfaceClassName,
} from "./popover-surface";

export interface ModelMenuProps {
  model: Model;
  effort: number;
  onModelChange: (model: Model) => void;
  onEffortChange: (effort: number) => void;
  disabled?: boolean;
}

const MODEL_OPTIONS = MODELS.map((model) => ({ value: model, label: model }));
const MAX_EFFORT_INDEX = EFFORT_LEVELS.length - 1;

export function ModelMenu({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled = false,
}: ModelMenuProps) {
  const [open, setOpen] = React.useState(false);

  // Defensive clamp — effort arrives from props and drives a display lookup.
  const safeEffort = Math.min(Math.max(effort, 0), MAX_EFFORT_INDEX);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <BoardButton
            variant="ghost"
            size="small"
            disabled={disabled}
            className={cn(
              "rounded-full px-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-zinc-400 dark:hover:text-zinc-100",
              open &&
                "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            )}
          />
        }
      >
        <span className="inline-flex items-center gap-1">
          <span>{model}</span>
          <ChevronDown
            className={cn(
              "size-3 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
              open && "rotate-180"
            )}
          />
        </span>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className={cn(popoverSurfaceClassName, "w-72")}
      >
        <p className={cn(menuHeadingClassName, "pt-2")}>Models</p>

        <MenuRadioGroup
          label="Models"
          options={MODEL_OPTIONS}
          value={model}
          onChange={(next) => {
            onModelChange(next);
            setOpen(false);
          }}
        />

        <MenuDivider className="my-2" />

        <div className="px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Effort
            </span>
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {EFFORT_LEVELS[safeEffort]}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Faster</span>
            <span>Smarter</span>
          </div>

          <EffortSlider
            className="mt-1"
            value={safeEffort}
            onChange={onEffortChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
