"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiCloseLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiLoader4Line,
} from "@remixicon/react";
import {
  BoardButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  cx,
} from "@repo/ui";
import { DocumentUploadDropzone } from "./document-upload-dropzone";
import { useKnowledgeBaseDocuments } from "@/features/documents";
import type { Document, DocumentStatus } from "@/features/documents/types";
import { formatRelativeTime } from "@/utils/date";
import { formatFileSize } from "@/utils/file";

export interface KnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  knowledgeBaseId: string;
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case "ready":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          Ready
        </span>
      );
    case "processing":
    case "pending":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
          <RiLoader4Line
            className="size-3 animate-spin text-amber-600 dark:text-amber-400"
            aria-hidden
          />
          {status === "pending" ? "Pending" : "Processing"}
        </span>
      );
    case "uploading":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500/10 px-2 py-0.5 text-[11px] font-medium text-accent-700 dark:bg-accent-500/15 dark:text-accent-400">
          <RiLoader4Line
            className="size-3 animate-spin text-accent-600 dark:text-accent-400"
            aria-hidden
          />
          Uploading
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
          <RiErrorWarningLine
            className="size-3 text-rose-600 dark:text-rose-400"
            aria-hidden
          />
          Failed
        </span>
      );
  }
}

function DocumentListSkeleton() {
  return (
    <ul
      aria-label="Loading documents"
      className="divide-y divide-zinc-100 dark:divide-zinc-800/70"
    >
      {[0, 1, 2].map((item) => (
        <li
          key={item}
          className="flex items-center justify-between gap-3 py-2.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="size-4 shrink-0 animate-pulse rounded bg-zinc-200/80 dark:bg-zinc-800" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3.5 w-44 animate-pulse rounded bg-zinc-200/80 dark:bg-zinc-800" />
              <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
          </div>
          <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </li>
      ))}
    </ul>
  );
}

function DocumentList({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useKnowledgeBaseDocuments(knowledgeBaseId);
  const documents = data?.results ?? [];

  return (
    <div className="w-full min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Documents
        </h3>
        {!isLoading && !isError && (
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {documents.length}
          </span>
        )}
      </div>

      {isLoading && <DocumentListSkeleton />}

      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-rose-200/80 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <span className="truncate">
            Failed to load documents:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="shrink-0 cursor-pointer font-medium underline underline-offset-2 hover:text-rose-900 dark:hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && documents.length === 0 && (
        <p className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          No documents indexed yet.
        </p>
      )}

      {!isLoading && !isError && documents.length > 0 && (
        <ul className="scrollbar-thin max-h-64 w-full min-w-0 divide-y divide-zinc-100 overflow-y-auto pr-1 sm:max-h-72 dark:divide-zinc-800/70">
          {documents.map((doc: Document) => {
            const relativeTime = formatRelativeTime(doc.created_at);
            const timeDisplay =
              relativeTime === "now" ? "Just now" : `${relativeTime} ago`;

            return (
              <li
                key={doc.id}
                className="flex w-full min-w-0 flex-col gap-1 py-2.5"
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <RiFileTextLine
                      className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100"
                        title={doc.filename}
                      >
                        {doc.filename}
                      </p>
                      <p className="truncate text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                        {formatFileSize(doc.file_size)} &middot; {timeDisplay}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={doc.status} />
                </div>

                {doc.last_error && doc.status === "failed" && (
                  <p className="pl-6.5 text-[11px] text-rose-600 wrap-anywhere dark:text-rose-400">
                    {doc.last_error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function KnowledgeBaseDialog({
  open,
  onOpenChange,
  projectName,
  knowledgeBaseId,
}: KnowledgeBaseDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    if (!isUploading) {
      setConfirmingClose(false);
    }
  }, [isUploading]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isUploading) {
        setConfirmingClose(true);
        return;
      }
      setConfirmingClose(false);
      onOpenChange(nextOpen);
    },
    [isUploading, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cx(
          "max-h-[88vh] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl outline-none sm:max-w-lg",
          "dark:border-zinc-800 dark:bg-zinc-900",
          "text-zinc-900 dark:text-zinc-100"
        )}
      >
        {/* Header */}
        <div className="flex w-full min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-0.5">
            <DialogTitle className="truncate text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Knowledge Base
            </DialogTitle>
            <DialogDescription className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              PDF sources for {projectName}
            </DialogDescription>
          </div>
          <BoardButton
            variant="ghost"
            size="small"
            iconOnly
            aria-label="Close dialog"
            onClick={() => handleOpenChange(false)}
            className="-mr-1.5 -mt-1 shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <RiCloseLine className="size-4" />
          </BoardButton>
        </div>

        {/* Close Confirmation Alert */}
        {confirmingClose && (
          <div
            role="alert"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <div className="flex min-w-0 items-center gap-2">
              <RiErrorWarningLine
                className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <span>Upload in progress. Closing will cancel the upload.</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <BoardButton
                variant="ghost"
                size="xs"
                onClick={() => setConfirmingClose(false)}
              >
                Keep uploading
              </BoardButton>
              <BoardButton
                variant="danger"
                size="xs"
                onClick={() => {
                  setConfirmingClose(false);
                  onOpenChange(false);
                }}
              >
                Cancel &amp; close
              </BoardButton>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-5 w-full min-w-0 space-y-6">
          <DocumentUploadDropzone
            knowledgeBaseId={knowledgeBaseId}
            onUploadingChange={setIsUploading}
          />

          <DocumentList knowledgeBaseId={knowledgeBaseId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
