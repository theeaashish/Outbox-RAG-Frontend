"use client";

import * as React from "react";
import {
  ArrowUp,
  ChevronDown,
  Folder,
  GitBranch,
  Infinity as InfinityIcon,
  Mic,
  Square,
} from "lucide-react";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { AddMenu, type AddMenuProps } from "./add-menu";
import { ContextMeter } from "./context-meter";
import { ModelMenu } from "./model-menu";
import { Radio } from "./menu-items";
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

  // Auto-grow textarea — compact for "hello", grows for long RAG prompts
  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const isGenerating = status === "submitting" || status === "streaming";

  const hasUploadingAttachments =
    attachments?.some((a) => a.status === "uploading") ?? false;

  const canSubmit =
    value.trim().length > 0 && !disabled && !hasUploadingAttachments;

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
    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    if (event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    handleSubmit();
  };

  const isSendDisabled = isGenerating ? false : !canSubmit;
  const currentModeLabel = MODES.find((m) => m.value === mode)?.label ?? "Chat";

  const hasStatusItems =
    Boolean(branch) ||
    Boolean(project) ||
    Boolean(mode) ||
    typeof contextUsage === "number";

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleFormSubmit}
        aria-busy={isGenerating}
        className="relative"
      >
        <div className="relative flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-900/90 p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.5)] border border-zinc-200/80 dark:border-zinc-800 ring-1 ring-black/3 dark:ring-white/5">
          <AddMenu
            disabled={disabled || isGenerating}
            onFilesClick={onFilesClick}
            onGoalClick={onGoalClick}
            onPlanClick={onPlanClick}
            onDocumentsClick={onDocumentsClick}
            onSpreadsheetsClick={onSpreadsheetsClick}
            onPresentationsClick={onPresentationsClick}
            onCodeClick={onCodeClick}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Message"
            rows={1}
            disabled={disabled || isGenerating}
            className="min-h-9 max-h-36 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-1.5 text-sm leading-snug text-zinc-900 dark:text-zinc-100 caret-zinc-900 dark:caret-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />

          <ModelMenu
            model={model}
            effort={effort}
            onModelChange={onModelChange}
            onEffortChange={onEffortChange}
            disabled={disabled || isGenerating}
          />

          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isGenerating}
            aria-label="Voice input"
            onClick={onVoiceClick}
            className="size-9 shrink-0 rounded-full bg-zinc-100/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            <Mic className="size-4" />
          </Button>

          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              if (isGenerating) {
                onCancel();
              } else {
                handleSubmit();
              }
            }}
            aria-label={isGenerating ? "Stop generation" : "Send message"}
            disabled={isSendDisabled}
            className="relative z-20 size-9 shrink-0 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Square className="size-3 fill-current" />
            ) : (
              <ArrowUp className="size-4" strokeWidth={2.5} />
            )}
          </Button>
        </div>

        {hasStatusItems && (
          <div className="mt-2 flex items-center justify-between px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              {branch ? (
                <button
                  type="button"
                  onClick={onBranchClick}
                  disabled={disabled}
                  className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
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
                  className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
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
                        disabled={disabled || isGenerating}
                        className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
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
                    className="w-48 gap-0 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]"
                  >
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Mode
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Mode"
                      className="flex flex-col gap-0.5"
                    >
                      {MODES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={option.value === mode}
                          onClick={() => {
                            onModeChange(option.value);
                            setModeMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                            option.value === mode &&
                              "bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                          )}
                        >
                          <span>{option.label}</span>
                          <Radio checked={option.value === mode} />
                        </button>
                      ))}
                    </div>
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
