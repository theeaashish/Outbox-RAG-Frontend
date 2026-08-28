"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import {
  EFFORT_LEVELS,
  type Model,
  MODELS,
} from "./constants";
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
            className="h-9 shrink-0 gap-1.5 rounded-full bg-[#f1f1f4] px-3 text-sm font-medium text-zinc-800 hover:bg-[#ebebee]"
          />
        }
      >
        {model}

        <ChevronDown
          className={cn(
            "size-3.5 text-zinc-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-72 gap-0 rounded-2xl bg-white p-2 shadow-[0_0_0_1px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.25)]"
      >
        <p className="px-3 pb-1 pt-2 text-sm text-zinc-500">Models</p>

        <div role="radiogroup" aria-label="Models">
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
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] text-zinc-900 transition-colors hover:bg-zinc-100",
                candidate === model && "bg-zinc-100"
              )}
            >
              {candidate}

              <Radio checked={candidate === model} />
            </button>
          ))}
        </div>

        <div className="mx-1 my-2 h-px bg-zinc-200" />

        <div className="px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] text-zinc-600">Effort</span>

            <span className="text-[15px] font-medium text-zinc-900">
              {EFFORT_LEVELS[effort]}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm text-zinc-500">
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

