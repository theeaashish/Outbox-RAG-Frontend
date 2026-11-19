import { ArrowUp, Loader2, Mic, Square } from "lucide-react";
import { BoardButton } from "@repo/ui";
import { ModelMenu } from "./model-menu";
import type { Model } from "./constants";
import type { ChatModelOption } from "./types";

interface ComposerActionsProps {
  model: Model;
  effort: number;
  onModelChange?: (model: Model) => void;
  onEffortChange?: (effort: number) => void;
  disabled: boolean;
  modelSelectorDisabled?: boolean;
  effortSelectorDisabled?: boolean;
  isGenerating: boolean;
  isCancelling: boolean;
  sendDisabled: boolean;
  onCancel: () => void;
  onVoiceClick?: () => void;
  models?: readonly ChatModelOption[];
}

export function ComposerActions({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled,
  modelSelectorDisabled = false,
  effortSelectorDisabled = false,
  isGenerating,
  isCancelling,
  sendDisabled,
  onCancel,
  onVoiceClick,
  models,
}: ComposerActionsProps) {
  const isBusy = isGenerating || isCancelling;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ModelMenu
        model={model}
        effort={effort}
        onModelChange={onModelChange}
        onEffortChange={onEffortChange}
        disabled={disabled}
        modelSelectorDisabled={modelSelectorDisabled}
        effortSelectorDisabled={effortSelectorDisabled}
        models={models}
      />

      {onVoiceClick && (
        <BoardButton
          type="button"
          variant="ghost"
          size="small"
          iconOnly
          disabled={disabled || isBusy}
          onClick={onVoiceClick}
          aria-label="Voice input"
          className="rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <Mic className="size-4" />
        </BoardButton>
      )}

      <BoardButton
        variant="primary"
        size="small"
        iconOnly
        type={isBusy ? "button" : "submit"}
        disabled={isCancelling || (!isGenerating && sendDisabled)}
        onClick={isGenerating ? onCancel : undefined}
        aria-label={
          isCancelling
            ? "Stopping generation"
            : isGenerating
              ? "Stop generation"
              : "Send message"
        }
        className="size-8 rounded-full"
      >
        {isCancelling ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isGenerating ? (
          <Square className="size-3 fill-current" />
        ) : (
          <ArrowUp className="size-4" strokeWidth={2.2} />
        )}
      </BoardButton>
    </div>
  );
}
