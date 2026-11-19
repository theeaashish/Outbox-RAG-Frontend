import { ArrowUp, Mic, Square } from "lucide-react";
import { BoardButton } from "@repo/ui";
import { ModelMenu } from "./model-menu";
import type { ChatModelOption, Model } from "./constants";

interface ComposerActionsProps {
  model: Model;
  effort: number;
  onModelChange?: (model: Model) => void;
  onEffortChange?: (effort: number) => void;
  disabled: boolean;
  modelSelectorDisabled?: boolean;
  effortSelectorDisabled?: boolean;
  isGenerating: boolean;
  sendDisabled: boolean;
  onVoiceClick?: () => void;
  models?: readonly ChatModelOption[];
}

// Model picker + voice + send/stop — identical in both composer layouts.
export function ComposerActions({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled,
  modelSelectorDisabled = false,
  effortSelectorDisabled = false,
  isGenerating,
  sendDisabled,
  onVoiceClick,
  models,
}: ComposerActionsProps) {
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
          variant="ghost"
          size="small"
          iconOnly
          disabled={disabled || isGenerating}
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
        disabled={sendDisabled}
        type="submit"
        aria-label={isGenerating ? "Stop generation" : "Send message"}
        className="size-8 rounded-full"
      >
        {isGenerating ? (
          <Square className="size-3.5 fill-current" />
        ) : (
          <ArrowUp className="size-4" />
        )}
      </BoardButton>
    </div>
  );
}
