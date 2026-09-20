"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { RiCloseLine } from "@remixicon/react";
import {
  BoardButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  Label,
  Textarea,
  cx,
} from "@repo/ui";
import { validateKbFiles, type SelectedFile } from "@/utils";
import { KnowledgeBaseUploader } from "./knowledge-base-uploader";
import { useCreateProject, useUpdateProject } from "@/features/projects";
import { useUploadDocument } from "@/features/documents";

export interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  name: string;
  description: string;
}

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;
/**
 * Dialog content mounts asynchronously; an immediate setFocus races the
 * mount and silently no-ops. Small delay is the pragmatic cross-library fix.
 */
const INITIAL_FOCUS_DELAY_MS = 50;
const CONCURRENT_UPLOAD_LIMIT = 3;

const EMPTY_FORM: FormValues = { name: "", description: "" };

export function NewProjectDialog({
  open,
  onOpenChange,
}: NewProjectDialogProps) {
  const {
    error: createProjectError,
    isPending: createProjectPending,
    mutateAsync: createProjectAsync,
    reset: resetCreateProject,
  } = useCreateProject();
  const {
    error: updateProjectError,
    isPending: updateProjectPending,
    mutateAsync: updateProjectAsync,
    reset: resetUpdateProject,
  } = useUpdateProject();
  const { mutateAsync: uploadDocumentAsync } = useUploadDocument();

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadStatuses, setUploadStatuses] = useState<
    Record<string, "uploading" | "uploaded" | "error">
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const lastSavedValuesRef = useRef<{
    name: string;
    description: string | null;
  } | null>(null);

  const isBusy = createProjectPending || updateProjectPending || isUploading;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const descriptionValue = watch("description") ?? "";

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setFocus("name"), INITIAL_FOCUS_DELAY_MS);
      return () => clearTimeout(timer);
    }
    reset(EMPTY_FORM);
    setFiles([]);
    setFileError(null);
    setUploadStatuses({});
    setProjectId(null);
    setKnowledgeBaseId(null);
    lastSavedValuesRef.current = null;
    resetCreateProject();
    resetUpdateProject();
  }, [open, reset, resetCreateProject, resetUpdateProject, setFocus]);

  const handleFilesSelected = (incoming: File[]) => {
    if (isBusy) return;
    const { accepted, rejections } = validateKbFiles(incoming, files.length);
    if (rejections.length > 0) setFileError(rejections.join(" "));
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (id: string) => {
    if (isBusy) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setUploadStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setFileError(null);
  };

  const close = () => {
    if (isBusy) return;
    onOpenChange(false);
  };

  const onSubmit = async (values: FormValues) => {
    const name = values.name.trim();
    if (!name) return;
    const description = values.description.trim() || null;

    setFileError(null);
    setIsUploading(true);

    try {
      let currentProjectId = projectId;
      let currentKbId = knowledgeBaseId;

      if (!currentProjectId || !currentKbId) {
        const project = await createProjectAsync({
          name,
          description: description || undefined,
        });
        currentProjectId = project.id;
        currentKbId = project.knowledge_base_id;
        setProjectId(project.id);
        setKnowledgeBaseId(project.knowledge_base_id);
        lastSavedValuesRef.current = { name, description };
      } else {
        const lastSaved = lastSavedValuesRef.current;
        if (
          !lastSaved ||
          lastSaved.name !== name ||
          lastSaved.description !== description
        ) {
          await updateProjectAsync({
            projectId: currentProjectId,
            input: { name, description },
          });
          lastSavedValuesRef.current = { name, description };
        }
      }

      const pendingFiles = files.filter(
        (selected) => uploadStatuses[selected.id] !== "uploaded"
      );

      let hasUploadFailure = false;

      if (pendingFiles.length > 0) {
        let fileIndex = 0;
        const workerCount = Math.min(
          CONCURRENT_UPLOAD_LIMIT,
          pendingFiles.length
        );

        const workers = Array.from({ length: workerCount }, async () => {
          while (fileIndex < pendingFiles.length) {
            const currentIndex = fileIndex++;
            const selected = pendingFiles[currentIndex];
            if (!selected) continue;

            setUploadStatuses((current) => ({
              ...current,
              [selected.id]: "uploading",
            }));

            try {
              await uploadDocumentAsync({
                knowledgeBaseId: currentKbId!,
                file: selected.file,
              });
              setUploadStatuses((current) => ({
                ...current,
                [selected.id]: "uploaded",
              }));
            } catch {
              hasUploadFailure = true;
              setUploadStatuses((current) => ({
                ...current,
                [selected.id]: "error",
              }));
            }
          }
        });

        await Promise.all(workers);
      }

      if (!hasUploadFailure) {
        setIsUploading(false);
        onOpenChange(false);
      } else {
        setFileError(
          "The project was created, but one or more files could not be uploaded. Retry the failed files."
        );
      }
    } catch {
      // The mutation error is rendered inline and the dialog stays open.
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isBusy) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-labelledby="new-project-dialog-title"
        className={cx(
          "w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl outline-none sm:max-w-lg",
          "dark:border-zinc-800 dark:bg-zinc-900",
          "text-zinc-900 dark:text-zinc-100"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
          <DialogTitle
            id="new-project-dialog-title"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            New project
          </DialogTitle>
          <BoardButton
            variant="ghost"
            size="small"
            iconOnly
            aria-label="Close dialog"
            onClick={close}
            disabled={isBusy}
          >
            <RiCloseLine className="size-4" />
          </BoardButton>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-4"
        >
          {/* Project name */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="project-name"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Project name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="project-name"
              type="text"
              placeholder="e.g. Acme Research Assistant"
              aria-required="true"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "project-name-error" : undefined}
              className="h-8 text-xs"
              {...register("name", {
                required: "Project name is required",
                validate: {
                  notBlank: (v) =>
                    v.trim().length > 0 || "Project name cannot be empty",
                  withinLength: (v) =>
                    v.trim().length <= MAX_NAME_LENGTH ||
                    `Project name must be ${MAX_NAME_LENGTH} characters or less`,
                },
              })}
            />
            {errors.name && (
              <p
                id="project-name-error"
                role="alert"
                className="text-[11px] text-red-600 dark:text-red-400"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="project-description"
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Description{" "}
                <span className="font-normal text-zinc-400 dark:text-zinc-500">
                  (optional)
                </span>
              </Label>
              <span
                className={cx(
                  "text-[11px] tabular-nums",
                  descriptionValue.length > MAX_DESCRIPTION_LENGTH
                    ? "font-medium text-red-500"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="Briefly describe what this project is for..."
              aria-invalid={errors.description ? "true" : undefined}
              aria-describedby={
                errors.description ? "project-description-error" : undefined
              }
              className="resize-none text-xs"
              {...register("description", {
                maxLength: {
                  value: MAX_DESCRIPTION_LENGTH,
                  message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
                },
              })}
            />
            {errors.description && (
              <p
                id="project-description-error"
                role="alert"
                className="text-[11px] text-red-600 dark:text-red-400"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Knowledge base upload */}
          <KnowledgeBaseUploader
            files={files}
            error={fileError}
            onFilesSelected={handleFilesSelected}
            onRemove={removeFile}
            statuses={uploadStatuses}
          />

          {(createProjectError instanceof Error ||
            updateProjectError instanceof Error) && (
            <p
              role="alert"
              className="text-[11px] text-red-600 dark:text-red-400"
            >
              {createProjectError?.message || updateProjectError?.message}
            </p>
          )}

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
            <BoardButton
              variant="secondary"
              size="small"
              type="button"
              onClick={close}
              disabled={isBusy}
            >
              Cancel
            </BoardButton>
            <BoardButton
              variant="primary"
              size="small"
              type="submit"
              disabled={isSubmitting || isBusy}
            >
              Create project
            </BoardButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
