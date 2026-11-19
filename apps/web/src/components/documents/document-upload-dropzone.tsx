"use client";

import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFilePdfLine,
  RiLoader4Line,
  RiRefreshLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { BoardButton, cx } from "@repo/ui";
import type { Document, UploadPhase } from "@/features/documents/types";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { formatFileSize, MAX_DOCUMENT_FILE_SIZE_MB } from "@/utils/file";

export interface DocumentUploadDropzoneProps {
  knowledgeBaseId: string;
  className?: string;
  onUploadSuccess?: (document: Document) => void;
  onUploadError?: (error: Error) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const STAGE_LABELS: Partial<Record<UploadPhase, string>> = {
  initiating: "Preparing upload...",
  uploading: "Uploading to storage...",
  finalizing: "Verifying & finalizing...",
};

export function DocumentUploadDropzone({
  knowledgeBaseId,
  className,
  onUploadSuccess,
  onUploadError,
  onUploadingChange,
}: DocumentUploadDropzoneProps) {
  const uploader = useDocumentUpload(knowledgeBaseId, {
    onSuccess: onUploadSuccess,
    onError: onUploadError,
  });
  const { file, phase, progress, error, document, isProcessingFailed } =
    uploader;

  useEffect(() => {
    onUploadingChange?.(uploader.isUploading);
    return () => {
      onUploadingChange?.(false);
    };
  }, [onUploadingChange, uploader.isUploading]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: { "application/pdf": [".pdf"] },
      multiple: false,
      disabled: uploader.isUploading || phase === "processing",
      onDrop: (accepted, rejected) => {
        const hasTooManyFiles =
          rejected.some((r) =>
            r.errors.some((e) => e.code === "too-many-files")
          ) || accepted.length + rejected.length > 1;

        if (hasTooManyFiles) {
          uploader.rejectSelection(
            "Only a single PDF file can be uploaded at a time. Please drop one file."
          );
          return;
        }

        const picked = accepted[0] ?? rejected[0]?.file;
        if (picked) uploader.selectFile(picked);
      },
    });

  const sizeBytes = file?.size ?? document?.file_size;
  const displayFilename =
    uploader.isValidationError && !file
      ? "File not accepted"
      : (file?.name ?? document?.filename ?? "Document.pdf");
  const displaySize =
    sizeBytes != null ? formatFileSize(sizeBytes) : "PDF document";

  const canRemove =
    !uploader.isUploading &&
    phase !== "processing" &&
    (phase === "selected" || phase === "error" || uploader.isValidationError);

  return (
    <div className={cx("w-full min-w-0", className)}>
      {phase === "idle" ? (
        <div
          {...getRootProps()}
          className={cx(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed py-7 px-4 text-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500",
            isDragReject
              ? "border-rose-400 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20"
              : isDragActive
                ? "border-zinc-900 bg-zinc-100/70 ring-2 ring-zinc-900/10 scale-[0.99] dark:border-zinc-100 dark:bg-zinc-800/60 dark:ring-zinc-100/10"
                : "border-zinc-200/90 bg-zinc-50/40 hover:border-zinc-400 hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/20 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
          )}
        >
          <input {...getInputProps()} />

          <div
            className={cx(
              "mb-2.5 flex size-10 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105",
              isDragReject
                ? "border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950 dark:text-rose-400"
                : isDragActive
                  ? "border-zinc-300 bg-zinc-200 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-zinc-200/80 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            )}
          >
            <RiUploadCloud2Line className="size-5" aria-hidden />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {isDragReject ? (
                <span className="text-rose-600 dark:text-rose-400">
                  Only PDF files are supported
                </span>
              ) : isDragActive ? (
                "Drop your PDF file here"
              ) : (
                <>
                  Drop a PDF here, or{" "}
                  <span className="font-semibold text-zinc-900 underline underline-offset-2 dark:text-white">
                    browse
                  </span>
                </>
              )}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Single PDF document &bull; Up to {MAX_DOCUMENT_FILE_SIZE_MB} MB
            </p>
          </div>
        </div>
      ) : (
        <div
          aria-live="polite"
          className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-4 transition-all dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          {/* File Card Header */}
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cx(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs font-bold text-[10px] tracking-tight uppercase",
                  phase === "completed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : phase === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                      : "border-rose-200/80 bg-rose-50/80 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
                )}
              >
                {phase === "completed" ? (
                  <RiCheckLine className="size-5" aria-hidden />
                ) : phase === "error" ? (
                  <RiErrorWarningLine className="size-5" aria-hidden />
                ) : (
                  <RiFilePdfLine className="size-5" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  title={displayFilename}
                >
                  {displayFilename}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>{displaySize}</span>
                  <span>&bull;</span>
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">
                    {phase === "selected" && "Ready to upload"}
                    {phase === "initiating" && "Preparing..."}
                    {phase === "uploading" && `Uploading ${progress}%`}
                    {phase === "finalizing" && "Finalizing..."}
                    {phase === "processing" && "Indexing..."}
                    {phase === "completed" && "Ready"}
                    {phase === "error" && "Failed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Quick Remove / Dismiss */}
            {canRemove && (
              <button
                type="button"
                onClick={uploader.reset}
                aria-label="Remove selected file"
                title="Remove file"
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500"
              >
                <RiCloseLine className="size-4" aria-hidden />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploader.isUploading && (
            <UploadProgressBar phase={phase} progress={progress} file={file} />
          )}

          {/* Processing Banner */}
          {phase === "processing" && (
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-200/70 bg-amber-50/50 p-2.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              <RiLoader4Line className="size-4 shrink-0 animate-spin text-amber-600 dark:text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Indexing document...</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                  Background worker is parsing and chunking text for retrieval.
                </p>
              </div>
            </div>
          )}

          {/* Completed Banner */}
          {phase === "completed" && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              <RiCheckLine className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="font-medium">
                Document indexed and available for citations.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {phase === "error" && error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-rose-200/80 bg-rose-50/60 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <RiErrorWarningLine className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-medium">
                  {uploader.isValidationError
                    ? "File not accepted"
                    : isProcessingFailed
                      ? "Processing failed"
                      : "Upload failed"}
                </p>
                <p className="text-[11px] leading-relaxed text-rose-700/90 dark:text-rose-300/90 wrap-anywhere">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {(uploader.canUpload ||
            uploader.canRetry ||
            uploader.canCancel ||
            uploader.isValidationError ||
            phase === "completed" ||
            isProcessingFailed) && (
            <div className="flex items-center justify-between border-t border-zinc-200/70 pt-3 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                {uploader.canUpload && (
                  <BoardButton
                    variant="primary"
                    size="small"
                    onClick={() => void uploader.upload()}
                  >
                    Upload PDF
                  </BoardButton>
                )}

                {uploader.canRetry && (
                  <BoardButton
                    variant="primary"
                    size="small"
                    onClick={() => void uploader.upload()}
                    leadingIcon={RiRefreshLine}
                  >
                    Retry upload
                  </BoardButton>
                )}

                {uploader.canCancel && (
                  <BoardButton
                    variant="ghost"
                    size="small"
                    onClick={uploader.cancel}
                  >
                    Cancel
                  </BoardButton>
                )}

                {uploader.isValidationError && (
                  <BoardButton
                    variant="secondary"
                    size="small"
                    onClick={uploader.reset}
                  >
                    Choose another file
                  </BoardButton>
                )}

                {(phase === "completed" || isProcessingFailed) && (
                  <BoardButton
                    variant="secondary"
                    size="small"
                    onClick={uploader.reset}
                  >
                    Upload another PDF
                  </BoardButton>
                )}
              </div>

              {(uploader.canUpload || uploader.canRetry) && (
                <BoardButton
                  variant="ghost"
                  size="small"
                  onClick={uploader.reset}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Remove
                </BoardButton>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UploadProgressBar({
  phase,
  progress,
  file,
}: {
  phase: UploadPhase;
  progress: number;
  file: File | null;
}) {
  const width =
    phase === "initiating" ? 10 : phase === "finalizing" ? 100 : progress;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 pt-0.5">
      <div className="flex w-full min-w-0 items-center justify-between text-[11px]">
        <div className="flex min-w-0 items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-400">
          <RiLoader4Line
            className="size-3 shrink-0 animate-spin text-zinc-500"
            aria-hidden
          />
          <span className="truncate">{STAGE_LABELS[phase]}</span>
        </div>
        {phase === "uploading" && (
          <span className="shrink-0 tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
            {progress}%
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="File upload progress"
        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800"
      >
        <div
          className="h-full bg-zinc-900 transition-all duration-200 ease-out dark:bg-zinc-100"
          style={{ width: `${width}%` }}
        />
      </div>

      {phase === "uploading" && file && (
        <div className="flex items-center justify-between text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
          <span>Direct-to-storage</span>
          <span>
            {formatFileSize(Math.round((progress / 100) * file.size))} of{" "}
            {formatFileSize(file.size)}
          </span>
        </div>
      )}
    </div>
  );
}
