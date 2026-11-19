"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@repo/ui";
import { Radio } from "./menu-items";

export interface MenuRadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface MenuRadioGroupProps<T extends string> {
  label: string;
  options: readonly MenuRadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
}

/**
 * Radio rows for popover menus with roving tabIndex and arrow-key navigation.
 * Arrow keys move focus so users can browse before confirming with Enter/Space.
 */
export function MenuRadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  emptyLabel = "No options available",
  className,
}: MenuRadioGroupProps<T>) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (options.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
        {emptyLabel}
      </p>
    );
  }

  const enabledIndices = options
    .map((option, idx) => (!disabled && !option.disabled ? idx : -1))
    .filter((idx) => idx !== -1);

  const selectedEnabledIndex = options.findIndex(
    (option) => option.value === value && !disabled && !option.disabled
  );
  const focusableIndex =
    selectedEnabledIndex !== -1
      ? selectedEnabledIndex
      : (enabledIndices[0] ?? -1);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (enabledIndices.length <= 1) return;

    const currentPos = enabledIndices.indexOf(currentIndex);
    if (currentPos === -1) return;

    let nextIndex: number | null | undefined = null;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex =
          enabledIndices[
            (currentPos - 1 + enabledIndices.length) % enabledIndices.length
          ];
        break;
      case "Home":
        nextIndex = enabledIndices[0];
        break;
      case "End":
        nextIndex = enabledIndices[enabledIndices.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    if (nextIndex != null) {
      itemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const itemDisabled = disabled || Boolean(option.disabled);

        return (
          <button
            key={option.value}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={itemDisabled}
            tabIndex={index === focusableIndex ? 0 : -1}
            onClick={() => {
              if (!itemDisabled) onChange(option.value);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400/70 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-100 dark:hover:bg-zinc-800/70 dark:focus-visible:bg-zinc-800/70 dark:focus-visible:ring-zinc-500/70",
              selected && "bg-zinc-100 font-medium dark:bg-zinc-800/80"
            )}
          >
            <div className="flex min-w-0 flex-col gap-0.5 pr-2">
              <span className="truncate" title={option.label}>
                {option.label}
              </span>
              {option.description ? (
                <span className="truncate text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  {option.description}
                </span>
              ) : null}
            </div>
            <Radio checked={selected} />
          </button>
        );
      })}
    </div>
  );
}
