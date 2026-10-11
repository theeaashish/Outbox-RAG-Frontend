"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiRestartLine,
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from "@remixicon/react";
import { cx } from "@repo/ui";
import { toast } from "sonner";

import { useMessageFeedback } from "@/features/conversations";
import type { FeedbackRating } from "@/features/conversations/types";

interface MessageActionsProps {
  content: string;
  messageId: string;
  conversationId?: string;
  rating?: FeedbackRating | null;
  /** Resubmits the user prompt that produced this reply. */
  onRetry?: () => void;
  className?: string;
}

const ACTION_CLASS =
  "flex size-6.5 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500";

const UP_SELECTED_CLASS =
  "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/80 dark:hover:text-emerald-300";

const DOWN_SELECTED_CLASS =
  "bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/80 dark:hover:text-rose-300";

export function MessageActions({
  content,
  messageId,
  conversationId,
  rating,
  onRetry,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [seenContent, setSeenContent] = useState(content);

  const feedbackMutation = useMessageFeedback(conversationId, messageId);
  const selectedRating = feedbackMutation.isPending
    ? feedbackMutation.variables
    : rating;
  const feedbackDisabled =
    !conversationId || rating === undefined || feedbackMutation.isPending;

  if (seenContent !== content) {
    setSeenContent(content);
    setCopied(false);
  }

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyContent() {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy the response");
    }
  }

  function selectRating(next: FeedbackRating) {
    if (feedbackDisabled) return;
    feedbackMutation.mutate(rating === next ? null : next);
  }

  return (
    <div
      role="group"
      aria-label="Response actions"
      className={cx(
        "mt-2 flex items-center gap-0.5 animate-in fade-in duration-200",
        className
      )}
    >
      <ActionButton
        label={copied ? "Copied" : "Copy response"}
        onClick={() => {
          void copyContent();
        }}
        className={
          copied
            ? "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            : undefined
        }
      >
        {copied ? (
          <RiCheckLine className="size-3.5" aria-hidden />
        ) : (
          <RiFileCopyLine className="size-3.5" aria-hidden />
        )}
      </ActionButton>

      {onRetry ? (
        <ActionButton label="Ask again" onClick={onRetry}>
          <RiRestartLine className="size-3.5" aria-hidden />
        </ActionButton>
      ) : null}

      <ActionButton
        label="Helpful"
        pressed={selectedRating === "up"}
        disabled={feedbackDisabled}
        onClick={() => selectRating("up")}
        className={selectedRating === "up" ? UP_SELECTED_CLASS : undefined}
      >
        {selectedRating === "up" ? (
          <RiThumbUpFill className="size-3.5" aria-hidden />
        ) : (
          <RiThumbUpLine className="size-3.5" aria-hidden />
        )}
      </ActionButton>

      <ActionButton
        label="Not helpful"
        pressed={selectedRating === "down"}
        disabled={feedbackDisabled}
        onClick={() => selectRating("down")}
        className={selectedRating === "down" ? DOWN_SELECTED_CLASS : undefined}
      >
        {selectedRating === "down" ? (
          <RiThumbDownFill className="size-3.5" aria-hidden />
        ) : (
          <RiThumbDownLine className="size-3.5" aria-hidden />
        )}
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  pressed,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx(ACTION_CLASS, className)}
    >
      {children}
    </button>
  );
}
