"use client";

import { useRef, useState } from "react";
import {
  RiErrorWarningLine,
  RiFilePdfLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { CloseButton, Label, cx } from "@repo/ui";
import {
  formatFileSize,
  KB_ACCEPT,
  MAX_KB_FILES,
  MAX_KB_FILE_SIZE_MB,
  type SelectedFile,
} from "@/utils";

interface KnowledgeBaseUploaderProps {
  files: SelectedFile[];
  error: string | null;
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
  statuses?: Record<string, "uploading" | "uploaded" | "error">;
}

export function KnowledgeBaseUploader({
  files,
  error,
  onFilesSelected,
  onRemove,
  statuses = {},
}: KnowledgeBaseUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="kb-upload-input"
          className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          Knowledge base{" "}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            (optional PDF files)
          </span>
        </Label>
        {files.length > 0 && (
          <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {files.length}/{MAX_KB_FILES} files
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id="kb-upload-input"
        type="file"
        accept={KB_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files?.length) {
            onFilesSelected(Array.from(event.target.files));
          }
          // Allow re-selecting the same file after a failed attempt.
          event.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF knowledge base files"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(event) => {
          // dragLeave fires when crossing into child elements — only clear
          // when the pointer actually left the zone.
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setDragOver(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) {
            onFilesSelected(Array.from(event.dataTransfer.files));
          }
        }}
        className={cx(
          "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center outline-none transition-all",
          "focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500",
          dragOver
            ? "border-zinc-500 bg-zinc-100/80 dark:border-zinc-400 dark:bg-zinc-800/80"
            : "border-zinc-200/90 bg-zinc-50/60 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40"
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-zinc-200/80 group-hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-200">
          <RiUploadCloud2Line className="size-4" aria-hidden />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Drop PDFs here or{" "}
            <span className="text-zinc-900 underline underline-offset-2 dark:text-zinc-100">
              click to browse
            </span>
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            PDF up to {MAX_KB_FILE_SIZE_MB} MB each (max {MAX_KB_FILES} files)
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-1.5 rounded-lg bg-red-50 p-2 text-[11px] text-red-600 dark:bg-red-950/30 dark:text-red-400"
        >
          <RiErrorWarningLine
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden
          />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-1 flex max-h-36 flex-col gap-1.5 overflow-y-auto pr-1">
          {files.map(({ id, file }) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div className="flex min-w-0 items-center gap-2">
                <RiFilePdfLine
                  className="size-4 shrink-0 text-red-500"
                  aria-hidden
                />
                <span className="truncate text-xs text-zinc-800 dark:text-zinc-200">
                  {file.name}
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  ({formatFileSize(file.size)})
                </span>
                {statuses[id] && (
                  <span
                    className={cx(
                      "shrink-0 text-[10px]",
                      statuses[id] === "error"
                        ? "text-red-500"
                        : statuses[id] === "uploaded"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-400"
                    )}
                  >
                    {statuses[id] === "uploading"
                      ? "Uploading..."
                      : statuses[id] === "uploaded"
                        ? "Uploaded"
                        : "Failed"}
                  </span>
                )}
              </div>
              <CloseButton
                size="2xs"
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemove(id)}
                className="shrink-0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
