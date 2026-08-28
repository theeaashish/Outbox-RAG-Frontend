"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { EFFORT_LEVELS, type Model, MODELS } from "./constants";
import { EffortSlider } from "./effort-slider";
import { Radio } from "./menu-items";

export interface ModelMenuProps {
  model: Model;
  effort: number;
  onModelChange: (model: Model) => void;
  onEffortChange: (effort: number) => void;
  disabled?: boolean;
}

export function ModelMenu({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled = false,
}: ModelMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-9 shrink-0 gap-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-700/60 px-3 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/80 dark:hover:bg-zinc-700"
          />
        }
      >
        {model}

        <ChevronDown
          className={cn(
            "size-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-72 gap-0 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]"
      >
        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Models
        </p>

        <div
          role="radiogroup"
          aria-label="Models"
          className="flex flex-col gap-0.5"
        >
          {MODELS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              role="radio"
              aria-checked={candidate === model}
              onClick={() => {
                onModelChange(candidate);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                candidate === model &&
                  "bg-zinc-100 dark:bg-zinc-800/80 font-medium"
              )}
            >
              <span>{candidate}</span>

              <Radio checked={candidate === model} />
            </button>
          ))}
        </div>

        <div className="mx-1 my-2 h-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Effort
            </span>

            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {EFFORT_LEVELS[effort]}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Faster</span>
            <span>Smarter</span>
          </div>

          <EffortSlider
            className="mt-1"
            value={effort}
            onChange={onEffortChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
