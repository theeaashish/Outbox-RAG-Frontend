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

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
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
  const currentModeLabel =
    MODES.find((m) => m.value === mode)?.label ?? "Chat";

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
        <div className="relative flex items-center gap-1.5 rounded-full bg-[#fafafb] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.08)] ring-1 ring-black/4">
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
            className="min-h-9 max-h-36 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-[15px] leading-snug text-zinc-800 caret-orange-500 outline-none placeholder:text-zinc-400"
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
            className="size-9 shrink-0 rounded-full bg-white text-zinc-900 shadow-[0_1px_2px_rgba(16,24,40,0.08),0_0_0_1px_rgba(16,24,40,0.04)] hover:bg-zinc-50 disabled:opacity-50"
          >
            <Mic className="size-4 text-zinc-600" />
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
            className="relative z-20 size-9 shrink-0 rounded-full bg-linear-to-b from-amber-500 to-orange-600 text-white shadow-[0_4px_12px_-2px_rgba(234,88,12,0.4)] hover:from-amber-400 hover:to-orange-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <Square className="size-3 fill-current" />
            ) : (
              <ArrowUp className="size-4" strokeWidth={2.5} />
            )}
          </Button>
        </div>

        {hasStatusItems && (
          <div className="mt-2 flex items-center justify-between px-3 text-[13px] font-medium text-zinc-500">
            <div className="flex items-center gap-4">
              {branch ? (
                <button
                  type="button"
                  onClick={onBranchClick}
                  disabled={disabled}
                  className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50"
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
                  className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50"
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
                        className="flex items-center gap-1.5 transition-colors hover:text-zinc-900 disabled:opacity-50"
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
                    className="w-48 gap-0 rounded-2xl bg-white p-2 shadow-[0_0_0_1px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.25)]"
                  >
                    <p className="px-3 pb-1 pt-2 text-sm text-zinc-500">Mode</p>
                    <div role="radiogroup" aria-label="Mode">
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
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[15px] text-zinc-900 transition-colors hover:bg-zinc-100",
                            option.value === mode && "bg-zinc-100"
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
                <div className="flex items-center gap-1.5 text-zinc-500">
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

