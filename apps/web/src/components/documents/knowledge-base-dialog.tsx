"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiCloseLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiFilePdfLine,
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
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      );
    case "processing":
    case "pending":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/20">
          <RiLoader4Line className="size-3 animate-spin text-amber-600 dark:text-amber-400" />
          {status === "pending" ? "Pending" : "Processing"}
        </span>
      );
    case "uploading":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-500/20">
          <RiLoader4Line className="size-3 animate-spin text-sky-600 dark:text-sky-400" />
          Uploading
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/20">
          <RiErrorWarningLine className="size-3 text-rose-600 dark:text-rose-400" />
          Failed
        </span>
      );
  }
}

function DocumentList({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useKnowledgeBaseDocuments(knowledgeBaseId);
  const documents = data?.results ?? [];

  return (
    <div className="w-full min-w-0 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
      <div className="mb-2.5 flex w-full min-w-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Documents
          </h3>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {documents.length}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-xs text-zinc-400">
          <RiLoader4Line className="mr-2 size-4 animate-spin" />
          Loading documents...
        </div>
      )}

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
            className="shrink-0 cursor-pointer font-medium underline hover:text-rose-900 dark:hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200/80 py-8 text-center dark:border-zinc-800">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <RiFileList3Line className="size-4" aria-hidden />
          </div>
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            No documents in this knowledge base yet
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            Select or drop a PDF above to stage and index it.
          </p>
        </div>
      )}

      {!isLoading && !isError && documents.length > 0 && (
        <ul className="max-h-64 sm:max-h-72 w-full min-w-0 divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-200/80 bg-white dark:divide-zinc-800/60 dark:border-zinc-800 dark:bg-zinc-950/40">
          {documents.map((doc: Document) => {
            const relativeTime = formatRelativeTime(doc.created_at);
            const timeDisplay =
              relativeTime === "now"
                ? "Added just now"
                : `Added ${relativeTime} ago`;

            return (
              <li
                key={doc.id}
                className="flex w-full min-w-0 flex-col gap-1 p-3 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60"
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                      <RiFilePdfLine className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200"
                        title={doc.filename}
                      >
                        {doc.filename}
                      </p>
                      <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                        {formatFileSize(doc.file_size)} &bull; {timeDisplay}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={doc.status} />
                </div>

                {doc.last_error && doc.status === "failed" && (
                  <p className="mt-1 pl-10.5 text-[11px] text-rose-600 wrap-anywhere dark:text-rose-400">
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
          "max-h-[88vh] w-full max-w-xl overflow-x-hidden overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xl outline-none sm:max-w-xl sm:p-6",
          "dark:border-zinc-800 dark:bg-zinc-900",
          "text-zinc-900 dark:text-zinc-100"
        )}
      >
        {/* Header */}
        <div className="flex w-full min-w-0 items-start justify-between gap-3 border-b border-zinc-200/80 pb-3.5 dark:border-zinc-800">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              <RiFilePdfLine className="size-4.5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Knowledge Base
                </DialogTitle>
                <span className="truncate text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  &mdash; {projectName}
                </span>
              </div>
              <DialogDescription className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Manage PDF reference documents for AI citations.
              </DialogDescription>
            </div>
          </div>
          <BoardButton
            variant="ghost"
            size="small"
            iconOnly
            aria-label="Close dialog"
            onClick={() => handleOpenChange(false)}
            className="shrink-0 -mr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <RiCloseLine className="size-4" />
          </BoardButton>
        </div>

        {/* Close Confirmation Alert */}
        {confirmingClose && (
          <div
            role="alert"
            className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <div className="flex min-w-0 items-center gap-2">
              <RiErrorWarningLine className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">
                Upload in progress. Closing will cancel the upload.
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmingClose(false)}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Keep uploading
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingClose(false);
                  onOpenChange(false);
                }}
                className="cursor-pointer rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                Cancel upload &amp; close
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-4 w-full min-w-0 space-y-4">
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
