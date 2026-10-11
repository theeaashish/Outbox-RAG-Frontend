"use client";

import { useEffect, useId } from "react";
import { RiArrowDownSLine, RiFileTextLine } from "@remixicon/react";
import { cx } from "@repo/ui";
import type { ChatSource } from "@/features/chat";

interface SourcesDrawerProps {
  messageId: string;
  sources: ChatSource[];
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightedCitation?: number | null;
}

export function SourcesDrawer({
  messageId,
  sources,
  className,
  open,
  onOpenChange,
  highlightedCitation,
}: SourcesDrawerProps) {
  const panelId = useId();

  useEffect(() => {
    if (!open || highlightedCitation == null) return;

    const raf = requestAnimationFrame(() => {
      document
        .getElementById(`source-item-${messageId}-${highlightedCitation}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(raf);
  }, [highlightedCitation, messageId, open]);

  if (sources.length === 0) return null;

  const citedCount = sources.filter((s) => s.is_cited).length;
  const label =
    citedCount > 0 && citedCount < sources.length
      ? `${citedCount} cited · ${sources.length} sources`
      : sources.length === 1
        ? "1 source"
        : `${sources.length} sources`;

  return (
    <div className={cx("mt-2 flex flex-col items-start text-xs", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className="group inline-flex h-6.5 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500"
      >
        <RiFileTextLine
          className="size-3.5 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
          aria-hidden
        />
        <span>{label}</span>
        <RiArrowDownSLine
          className={cx(
            "size-3.5 text-zinc-400 transition-transform duration-200 ease-out group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="Cited sources"
        aria-hidden={!open}
        className={cx(
          "grid w-full transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <ul className="mt-2 flex flex-col gap-1 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            {sources.map((source) => (
              <SourceRow
                key={`${source.citation}-${source.document_id ?? source.document_name}-${source.chunk_index}`}
                messageId={messageId}
                source={source}
                isHighlighted={source.citation === highlightedCitation}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SourceRow({
  messageId,
  source,
  isHighlighted = false,
}: {
  messageId: string;
  source: ChatSource;
  isHighlighted?: boolean;
}) {
  const targetId = `source-item-${messageId}-${source.citation}`;

  const pageText =
    source.page_start != null
      ? source.page_end != null && source.page_end !== source.page_start
        ? `p. ${source.page_start}–${source.page_end}`
        : `p. ${source.page_start}`
      : null;

  return (
    <li
      id={targetId}
      className={cx(
        "flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-xs ring-1 ring-zinc-200/60 dark:bg-zinc-900/80 dark:ring-zinc-800 transition-all duration-300",
        isHighlighted &&
          "ring-2 ring-zinc-900/80 bg-zinc-100/90 dark:ring-zinc-300 dark:bg-zinc-800"
      )}
    >
      <span
        className={cx(
          "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-colors",
          isHighlighted
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        )}
      >
        [{source.citation}]
      </span>
      <span
        className="min-w-0 flex-1 truncate font-medium text-zinc-700 dark:text-zinc-300"
        title={source.document_name}
      >
        {source.document_name}
      </span>
      {source.is_cited ? (
        <span className="shrink-0 rounded bg-emerald-100/80 px-1 py-0.5 text-[9px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Cited
        </span>
      ) : null}
      {pageText ? (
        <span className="shrink-0 rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {pageText}
        </span>
      ) : (
        <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
          Chunk {source.chunk_index + 1}
        </span>
      )}
      <MatchScoreBadge score={source.score} />
    </li>
  );
}

export function MatchScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const match = matchPercent(score);
  if (match === null) return null;

  return (
    <span
      className={cx(
        "shrink-0 rounded-full border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300",
        className
      )}
    >
      {match}% match
    </span>
  );
}

/** Retrieval scores are similarities in the 0–1 range. */
export function matchPercent(score: number): number | null {
  if (!Number.isFinite(score)) return null;
  return Math.min(100, Math.max(0, Math.round(score * 100)));
}
