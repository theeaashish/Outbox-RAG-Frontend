"use client";

import {
  useCallback,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ChevronDown,
  Folder,
  GitBranch,
  Infinity as InfinityIcon,
} from "lucide-react";

import { cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { AddMenu, type AddMenuProps } from "./add-menu";
import { ComposerActions } from "./composer-actions";
import { ContextMeter } from "./context-meter";
import { MenuRadioGroup } from "./menu-radio-group";
import {
  menuHeadingClassName,
  popoverSurfaceClassName,
} from "./popover-surface";
import type { Model } from "./constants";
import type {
  ComposerAttachment,
  ComposerMode,
  ComposerStatus,
  ComposerSubmitData,
} from "./types";
import { useComposerAutosize } from "@/hooks/ai-chat/use-composer-autosize";

export interface BranchInfo {
  id: string;
  name: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
}

export interface AiChatComposerProps extends AddMenuProps {
  value: string;
  onChange: (value: string) => void;

  model: Model;
  effort: number;

  onModelChange?: (model: Model) => void;
  onEffortChange?: (effort: number) => void;

  modelSelectorDisabled?: boolean;
  effortSelectorDisabled?: boolean;
  modeSelectorDisabled?: boolean;

  status?: ComposerStatus;

  mode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;

  attachments?: ComposerAttachment[];

  onSubmit: (data: ComposerSubmitData) => void;
  onCancel: () => void;

  onVoiceClick?: () => void;

  branch?: BranchInfo;
  onBranchClick?: () => void;

  project?: ProjectInfo;
  onProjectClick?: () => void;

  contextUsage?: number;

  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MODES: { value: ComposerMode; label: string }[] = [
  { value: "chat", label: "Chat" },
  { value: "plan", label: "Plan" },
  { value: "agent", label: "Agent" },
];

export function AiChatComposer({
  value,
  onChange,
  model,
  effort,
  onModelChange,
  onEffortChange,
  modelSelectorDisabled = false,
  effortSelectorDisabled = false,
  modeSelectorDisabled = false,
  status = "idle",
  mode = "chat",
  onModeChange,
  attachments,
  onSubmit,
  onCancel,
  onVoiceClick,
  branch,
  onBranchClick,
  project,
  onProjectClick,
  contextUsage,
  onFilesClick,
  onGoalClick,
  onPlanClick,
  onDocumentsClick,
  onSpreadsheetsClick,
  onPresentationsClick,
  onCodeClick,
  placeholder = "Ask me anything",
  disabled = false,
  className,
}: AiChatComposerProps) {
  const {
    isMultiline,
    containerRef,
    textareaRef,
    ghostRef,
    addMenuRef,
    actionsRef,
    ghostWidth,
  } = useComposerAutosize(value);

  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const isGenerating = status === "submitting" || status === "streaming";
  const controlsDisabled = disabled || isGenerating;

  const hasUploadingAttachments =
    attachments?.some((a) => a.status === "uploading") ?? false;

  const canSubmit =
    value.trim().length > 0 && !disabled && !hasUploadingAttachments;

  const isSendDisabled = isGenerating ? false : !canSubmit;
  const currentModeLabel = MODES.find((m) => m.value === mode)?.label ?? "Chat";

  const addMenuProps: AddMenuProps = {
    disabled: controlsDisabled,
    onFilesClick,
    onGoalClick,
    onPlanClick,
    onDocumentsClick,
    onSpreadsheetsClick,
    onPresentationsClick,
    onCodeClick,
  };

  const handleSubmit = useCallback(() => {
    if (isGenerating) {
      onCancel();
      return;
    }

    if (!canSubmit) {
      return;
    }

    const data: ComposerSubmitData = {
      text: value.trim(),
      model,
      effort,
      mode,
      attachments: attachments ?? [],
    };

    onSubmit(data);
  }, [
    isGenerating,
    canSubmit,
    value,
    model,
    effort,
    mode,
    attachments,
    onSubmit,
    onCancel,
  ]);

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return; // newline
    if (event.nativeEvent.isComposing) return; // IME composition

    event.preventDefault();
    handleSubmit();
  };

  const hasFooterItems =
    Boolean(branch) ||
    Boolean(project) ||
    Boolean(onModeChange) ||
    typeof contextUsage === "number";

  return (
    <div className={cn("w-full", className)}>
      {/* Offscreen ghost: measures text against the pill-mode width so multiline
          detection never feeds back through the wider multiline layout. */}
      <div
        ref={ghostRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-2499.75 invisible select-none whitespace-pre-wrap wrap-break-word text-sm leading-snug"
        style={{ width: `${ghostWidth}px` }}
      />

      <form
        onSubmit={handleFormSubmit}
        aria-busy={isGenerating}
        className="relative"
      >
        {/* Morphing container: single-line pill when short, 2-tier card when multiline.
            NOTE: pill radius is 28px, NOT rounded-full. rounded-full = 9999px, and a
            radius that large only stops looking capsule-shaped once it drops below
            half the box height — so on a big paste (instant tall container) the
            border renders as a giant blob for the whole transition. 28px renders
            identically at pill heights (radius clamps to half-height) but actually
            interpolates during the morph. */}
        <div
          ref={containerRef}
          className={cn(
            "relative transition-[border-color,box-shadow,border-radius,padding] duration-150 ease-out outline-none focus:outline-none focus-within:outline-none focus-visible:outline-none",
            "bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
            "focus-within:border-zinc-300 dark:focus-within:border-zinc-700",
            isMultiline
              ? "flex flex-col justify-between rounded-2xl p-2 sm:p-2.5"
              : "flex items-center gap-1.5 rounded-[28px] p-1.5"
          )}
        >
          {!isMultiline && (
            <div ref={addMenuRef} className="shrink-0">
              <AddMenu {...addMenuProps} />
            </div>
          )}

          {/* Single continuous textarea */}
          <div
            className={cn(
              "min-w-0",
              isMultiline ? "w-full px-2 pt-1 pb-1" : "flex-1 px-1"
            )}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Message"
              rows={1}
              disabled={controlsDisabled}
              className={cn(
                "block w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 scrollbar-none dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-scrollbar]:hidden",
                isMultiline
                  ? "leading-relaxed"
                  : "py-1 leading-snug overflow-hidden"
              )}
            />
          </div>

          {isMultiline ? (
            <div className="flex items-center justify-between pt-1">
              <div ref={addMenuRef}>
                <AddMenu {...addMenuProps} />
              </div>
              <div ref={actionsRef}>
                <ComposerActions
                  model={model}
                  effort={effort}
                  onModelChange={onModelChange}
                  onEffortChange={onEffortChange}
                  disabled={controlsDisabled}
                  modelSelectorDisabled={modelSelectorDisabled}
                  effortSelectorDisabled={effortSelectorDisabled}
                  isGenerating={isGenerating}
                  sendDisabled={isSendDisabled}
                  onVoiceClick={onVoiceClick}
                />
              </div>
            </div>
          ) : (
            <div ref={actionsRef} className="shrink-0">
              <ComposerActions
                model={model}
                effort={effort}
                onModelChange={onModelChange}
                onEffortChange={onEffortChange}
                disabled={controlsDisabled}
                modelSelectorDisabled={modelSelectorDisabled}
                effortSelectorDisabled={effortSelectorDisabled}
                isGenerating={isGenerating}
                sendDisabled={isSendDisabled}
                onVoiceClick={onVoiceClick}
              />
            </div>
          )}
        </div>

        {/* Footer status row */}
        {hasFooterItems && (
          <div className="mt-2 flex items-center justify-between px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              {branch ? (
                <button
                  type="button"
                  onClick={onBranchClick}
                  disabled={disabled}
                  className="flex cursor-pointer items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
                >
                  <GitBranch className="size-3.5 text-zinc-400" />
                  <span>{branch.name}</span>
                </button>
              ) : null}

              {project ? (
                <button
                  type="button"
                  onClick={onProjectClick}
                  disabled={disabled}
                  className="flex cursor-pointer items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
                >
                  <Folder className="size-3.5 text-zinc-400" />
                  <span>{project.name}</span>
                  <ChevronDown className="size-3 text-zinc-400" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              {!modeSelectorDisabled && onModeChange ? (
                <Popover open={modeMenuOpen} onOpenChange={setModeMenuOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        disabled={controlsDisabled}
                        className="flex cursor-pointer items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
                      />
                    }
                  >
                    <InfinityIcon className="size-3.5 text-zinc-400" />
                    <span>{currentModeLabel}</span>
                    <ChevronDown
                      className={cn(
                        "size-3 text-zinc-400 transition-transform duration-200",
                        modeMenuOpen && "rotate-180"
                      )}
                    />
                  </PopoverTrigger>

                  <PopoverContent
                    side="top"
                    align="end"
                    sideOffset={12}
                    className={cn(popoverSurfaceClassName, "w-48")}
                  >
                    <p className={cn(menuHeadingClassName, "pt-2")}>Mode</p>
                    <MenuRadioGroup
                      label="Mode"
                      options={MODES}
                      value={mode}
                      onChange={(next) => {
                        onModeChange(next);
                        setModeMenuOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div
                  title={
                    modeSelectorDisabled
                      ? "Mode selection is currently unavailable"
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400",
                    modeSelectorDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <InfinityIcon className="size-3.5 text-zinc-400" />
                  <span>{currentModeLabel}</span>
                  {modeSelectorDisabled && (
                    <span className="text-[10px] text-zinc-400 font-normal">
                      (Unavailable)
                    </span>
                  )}
                </div>
              )}

              {typeof contextUsage === "number" ? (
                <ContextMeter value={contextUsage} />
              ) : null}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
