import { ArrowUp, Mic, Square } from "lucide-react";
import { BoardButton } from "@repo/ui";
import { ModelMenu } from "./model-menu";
import type { Model } from "./constants";

interface ComposerActionsProps {
  model: Model;
  effort: number;
  onModelChange: (model: Model) => void;
  onEffortChange: (effort: number) => void;
  disabled: boolean;
  isGenerating: boolean;
  sendDisabled: boolean;
  onVoiceClick?: () => void;
}

// Model picker + voice + send/stop — identical in both composer layouts.
export function ComposerActions({
  model,
  effort,
  onModelChange,
  onEffortChange,
  disabled,
  isGenerating,
  sendDisabled,
  onVoiceClick,
}: ComposerActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ModelMenu
        model={model}
        effort={effort}
        onModelChange={onModelChange}
        onEffortChange={onEffortChange}
        disabled={disabled}
      />

      {onVoiceClick && (
        <BoardButton
          variant="ghost"
          size="small"
          iconOnly
          disabled={disabled}
          aria-label="Voice input"
          onClick={onVoiceClick}
          className="rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Mic className="size-4" />
        </BoardButton>
      )}

      <BoardButton
        variant="primary"
        size="small"
        iconOnly
        type="submit"
        disabled={sendDisabled}
        aria-label={isGenerating ? "Stop generation" : "Send message"}
        className="rounded-full shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        {isGenerating ? (
          <Square className="size-3 fill-current" />
        ) : (
          <ArrowUp className="size-4" strokeWidth={2.2} />
        )}
      </BoardButton>
    </div>
  );
}
