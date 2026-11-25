"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { EFFORT_LEVELS, type Model } from "./constants";
import type { ChatModelOption } from "./types";
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
  onModelChange?: (model: Model) => void;
  onEffortChange?: (effort: number) => void;
  disabled?: boolean;
  modelSelectorDisabled?: boolean;
  effortSelectorDisabled?: boolean;
  models?: readonly ChatModelOption[];
}

const MAX_EFFORT_INDEX = EFFORT_LEVELS.length - 1;

export function ModelMenu({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled = false,
  modelSelectorDisabled = false,
  effortSelectorDisabled = false,
  models = [],
}: ModelMenuProps) {
  const [open, setOpen] = useState(false);

  const safeEffort = Number.isFinite(effort)
    ? Math.min(Math.max(Math.round(effort), 0), MAX_EFFORT_INDEX)
    : 0;

  const canSelectModel =
    !disabled && !modelSelectorDisabled && models.length > 0;
  const canSelectEffort = !disabled && !effortSelectorDisabled;
  const isTriggerDisabled = disabled || (!canSelectModel && !canSelectEffort);

  useEffect(() => {
    if (isTriggerDisabled) setOpen(false);
  }, [isTriggerDisabled]);

  const isOpen = open && !isTriggerDisabled;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(isTriggerDisabled ? false : nextOpen);
    },
    [isTriggerDisabled]
  );

  const selectedModel = useMemo(
    () => models.find((m) => m.id === model),
    [models, model]
  );

  const modelOptions = useMemo(
    () =>
      models.map((m) => ({
        value: m.id,
        label: m.label,
        description: m.description,
        disabled: m.disabled,
      })),
    [models]
  );

  const displayLabel =
    selectedModel?.shortLabel ?? selectedModel?.label ?? model;

  const triggerTitle = disabled
    ? (selectedModel?.label ?? model)
    : isTriggerDisabled
      ? "Model selection is currently unavailable"
      : (selectedModel?.label ?? model);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={isTriggerDisabled}
            title={triggerTitle}
            aria-label={`Model: ${selectedModel?.label ?? model}`}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-full px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-accent-400/60",
              isOpen &&
                "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            )}
          />
        }
      >
        <span className="inline-flex items-center gap-1">
          <span className="max-w-48 truncate">{displayLabel}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
              isOpen && "rotate-180"
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
          options={modelOptions}
          value={model}
          disabled={!canSelectModel}
          emptyLabel="No models available"
          onChange={(next) => {
            if (!canSelectModel) return;
            if (next !== model) onModelChange?.(next);
            setOpen(false);
          }}
        />

        <MenuDivider className="my-2" />

        <div className="px-3 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Effort
            </span>
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {EFFORT_LEVELS[safeEffort]}
              {effortSelectorDisabled && (
                <span className="ml-1 text-[10px] font-normal text-zinc-400">
                  (Unavailable)
                </span>
              )}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Faster</span>
            <span>Smarter</span>
          </div>

          <EffortSlider
            className="mt-1"
            value={safeEffort}
            disabled={!canSelectEffort}
            onChange={(next) => {
              if (!canSelectEffort) return;
              onEffortChange?.(next);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
