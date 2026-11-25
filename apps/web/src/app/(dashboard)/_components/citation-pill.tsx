"use client";

import { memo, useState } from "react";
import { RiArrowRightLine, RiFileTextLine } from "@remixicon/react";
import { Popover, PopoverContent, PopoverTrigger, cx } from "@repo/ui";
import type { ChatSource } from "@/features/chat";
import { MatchScoreBadge } from "./sources-drawer";

export interface CitationPillProps {
  citation: number;
  source?: ChatSource;
  onSelectSource?: (citation: number) => void;
}

export const CitationPill = memo(function CitationPill({
  citation,
  source,
  onSelectSource,
}: CitationPillProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        delay={120}
        closeDelay={150}
        className={cx(
          "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-lg text-[10px] font-mono font-medium leading-none align-baseline mx-0.5 select-none transition-all cursor-pointer",
          "bg-accent-50 text-accent-700 ring-1 ring-accent-200/70 hover:bg-accent-100 hover:text-accent-800 active:scale-95",
          "dark:bg-accent-950/60 dark:text-accent-300 dark:ring-accent-800/60 dark:hover:bg-accent-900/80 dark:hover:text-accent-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        )}
        aria-label={`Citation ${citation}${source ? `: ${source.document_name}` : ""}`}
      >
        {citation}
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-72 rounded-xl border border-zinc-200/80 bg-white p-3 text-xs shadow-lg ring-0 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {source ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <RiFileTextLine className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-medium text-zinc-900 dark:text-zinc-100 text-xs"
                  title={source.document_name}
                >
                  {source.document_name}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-medium dark:bg-zinc-800">
                    Chunk {source.chunk_index + 1}
                  </span>
                  {source.page_start != null ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-medium dark:bg-zinc-800">
                      {source.page_end != null &&
                      source.page_end !== source.page_start
                        ? `p. ${source.page_start}–${source.page_end}`
                        : `p. ${source.page_start}`}
                    </span>
                  ) : null}
                  <MatchScoreBadge score={source.score} />
                </div>
              </div>
            </div>

            {onSelectSource ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelectSource(citation);
                }}
                className="mt-0.5 flex w-full cursor-pointer items-center justify-between border-t border-zinc-100 pt-2 text-[11px] font-medium text-zinc-500 transition-colors hover:text-accent-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-accent-400"
              >
                <span>View in sources</span>
                <RiArrowRightLine className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              Citation [{citation}]
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Source details not available for this session.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
