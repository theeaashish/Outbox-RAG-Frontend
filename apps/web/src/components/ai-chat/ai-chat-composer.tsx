"use client";

import * as React from "react";
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

  onModelChange: (model: Model) => void;
  onEffortChange: (effort: number) => void;

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

/** Max textarea height before it stops growing and scrolls internally. */
const TEXTAREA_MAX_HEIGHT_PX = 180;
/** A single-row textarea is ~36px tall; anything taller means it wrapped. */
const SINGLE_LINE_HEIGHT_PX = 36;

/**
 * Layout effects warn during SSR; the DOM measurement this performs only
 * exists on the client, so fall back to a plain effect on the server.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function AiChatComposer({
  value,
  onChange,
  model,
  effort,
  onModelChange,
  onEffortChange,
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [modeMenuOpen, setModeMenuOpen] = React.useState(false);
  const [isMultiline, setIsMultiline] = React.useState(false);

  // Auto-grow textarea & detect multiline state like ChatGPT / Claude
  useIsomorphicLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const multiline =
      value.includes("\n") || scrollHeight > SINGLE_LINE_HEIGHT_PX;
    setIsMultiline(multiline);
    textarea.style.height = multiline
      ? `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`
      : "auto";
  }, [value]);

  const isGenerating = status === "submitting" || status === "streaming";
  const controlsDisabled = disabled || isGenerating;

  const hasUploadingAttachments =
    attachments?.some((a) => a.status === "uploading") ?? false;

  const canSubmit =
    value.trim().length > 0 && !disabled && !hasUploadingAttachments;

  const isSendDisabled = isGenerating ? false : !canSubmit;
  const currentModeLabel = MODES.find((m) => m.value === mode)?.label ?? "Chat";

  // One AddMenu prop bundle — both layouts render the same menu.
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

  const handleSubmit = React.useCallback(() => {
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

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return; // newline
    if (event.nativeEvent.isComposing) return; // IME composition

    event.preventDefault();
    handleSubmit();
  };

  // NOTE: gate on the *capability* (onModeChange), not the value — `mode`
  // always has a default, so checking it made this condition always true.
  const hasFooterItems =
    Boolean(branch) ||
    Boolean(project) ||
    Boolean(onModeChange) ||
    typeof contextUsage === "number";

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleFormSubmit}
        aria-busy={isGenerating}
        className="relative"
      >
        {/* Compact pill when single-line, morphs to 2-tier card when multiline */}
        <div
          className={cn(
            "relative transition-[border-color,box-shadow,border-radius,padding] duration-200 ease-out outline-none focus:outline-none",
            "bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
            isMultiline
              ? "flex flex-col justify-between rounded-2xl p-2"
              : "flex items-center gap-1.5 rounded-full p-1.5"
          )}
        >
          {!isMultiline && <AddMenu {...addMenuProps} />}

          {/* Single continuous textarea for zero focus/cursor loss */}
          <div
            className={cn(
              "min-w-0 flex-1",
              isMultiline && "w-full px-2 pb-1 pt-1"
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
                "block w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:outline-none focus:ring-0 scrollbar-none dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-scrollbar]:hidden",
                isMultiline ? "leading-relaxed" : "px-2 py-1 leading-snug"
              )}
            />
          </div>

          {isMultiline ? (
            <div className="flex items-center justify-between pt-1">
              <AddMenu {...addMenuProps} />
              <ComposerActions
                model={model}
                effort={effort}
                onModelChange={onModelChange}
                onEffortChange={onEffortChange}
                disabled={controlsDisabled}
                isGenerating={isGenerating}
                sendDisabled={isSendDisabled}
                onVoiceClick={onVoiceClick}
              />
            </div>
          ) : (
            <ComposerActions
              model={model}
              effort={effort}
              onModelChange={onModelChange}
              onEffortChange={onEffortChange}
              disabled={controlsDisabled}
              isGenerating={isGenerating}
              sendDisabled={isSendDisabled}
              onVoiceClick={onVoiceClick}
            />
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
                  className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
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
                  className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
                >
                  <Folder className="size-3.5 text-zinc-400" />
                  <span>{project.name}</span>
                  <ChevronDown className="size-3 text-zinc-400" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              {onModeChange ? (
                <Popover open={modeMenuOpen} onOpenChange={setModeMenuOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        disabled={controlsDisabled}
                        className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
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
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <InfinityIcon className="size-3.5 text-zinc-400" />
                  <span>{currentModeLabel}</span>
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
