"use client";

import * as React from "react";

import { cn } from "@repo/ui";
import { EFFORT_LEVELS } from "./constants";

export interface EffortSliderProps {
  /** Zero-based index into {@link EFFORT_LEVELS}. */
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const MAX_INDEX = EFFORT_LEVELS.length - 1;
const KNOB_WIDTH_PX = 36;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getPercentage(value: number): number {
  if (MAX_INDEX === 0) {
    return 0;
  }

  return (value / MAX_INDEX) * 100;
}

function getStepFromPointer(clientX: number, rect: DOMRect): number {
  if (rect.width <= 0) {
    return 0;
  }

  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);

  return Math.round(ratio * MAX_INDEX);
}

export function EffortSlider({
  value,
  onChange,
  className,
}: EffortSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Defensive normalization because this is a controlled component.
  const safeValue = clamp(value, 0, MAX_INDEX);
  const percentage = getPercentage(safeValue);
  const isMax = safeValue === MAX_INDEX;

  const updateFromPointer = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current;

      if (!track) {
        return;
      }

      const nextValue = getStepFromPointer(
        clientX,
        track.getBoundingClientRect()
      );

      if (nextValue !== safeValue) {
        onChange(nextValue);
      }
    },
    [onChange, safeValue]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Ignore non-primary pointers such as additional mouse buttons.
    if (!event.isPrimary) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);

    updateFromPointer(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !event.isPrimary) {
      return;
    }

    updateFromPointer(event.clientX);
  };

  const endDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextValue: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        nextValue = clamp(safeValue - 1, 0, MAX_INDEX);
        break;

      case "ArrowRight":
      case "ArrowUp":
        nextValue = clamp(safeValue + 1, 0, MAX_INDEX);
        break;

      case "Home":
        nextValue = 0;
        break;

      case "End":
        nextValue = MAX_INDEX;
        break;

      default:
        return;
    }

    event.preventDefault();

    if (nextValue !== safeValue) {
      onChange(nextValue);
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Effort"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={MAX_INDEX}
      aria-valuenow={safeValue}
      aria-valuetext={EFFORT_LEVELS[safeValue]}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDragging}
      onPointerCancel={endDragging}
      className={cn(
        "relative h-8 cursor-pointer select-none touch-none rounded-lg outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#2B7CF6]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
        isDragging && "cursor-grabbing",
        className
      )}
    >
      {/* Track */}
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 overflow-hidden rounded-lg transition-colors duration-200",
          isMax
            ? "bg-linear-to-r from-[#2B7CF6] via-[#52A3FE] to-[#CBE6FF] shadow-xs"
            : "bg-zinc-200/70 dark:bg-zinc-800 ring-1 ring-black/4 dark:ring-white/10"
        )}
      >
        {!isMax && (
          <div
            className={cn(
              "absolute inset-y-0 left-0 bg-zinc-300/80 dark:bg-zinc-700/80",
              !isDragging && "transition-[width] duration-150"
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Ticks */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 transition-opacity duration-150",
          isMax ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      >
        {EFFORT_LEVELS.map((level) => (
          <span
            key={level}
            className="h-3.5 w-px rounded-full bg-zinc-400/60 dark:bg-zinc-600"
          />
        ))}
      </div>

      {/* Knob */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 h-6 w-8 -translate-y-1/2 rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/10 dark:bg-zinc-200 dark:ring-black/20",
          !isDragging && "transition-[left] duration-150"
        )}
        style={{
          left: `calc(2px + (${percentage} / 100) * (100% - ${KNOB_WIDTH_PX}px))`,
        }}
      />
    </div>
  );
}
