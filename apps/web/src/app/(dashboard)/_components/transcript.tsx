import { RiCheckLine, RiLoader4Line, RiSparklingLine } from "@remixicon/react";
import { cx } from "@repo/ui";
import type { AgentStep } from "./fixtures";

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl bg-zinc-100/90 px-4 py-3 text-xs leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        {children}
      </p>
    </div>
  );
}

function StepRow({ step }: { step: AgentStep }) {
  const isComplete = step.status === "complete";
  return (
    <div
      className={cx(
        "flex items-center gap-2",
        isComplete
          ? "text-zinc-800 dark:text-zinc-200"
          : "blur-[0.5px] text-zinc-400"
      )}
    >
      <span className="flex size-4 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        {isComplete ? (
          <RiCheckLine
            className="size-3 text-zinc-600 dark:text-zinc-400"
            aria-hidden
          />
        ) : (
          <RiLoader4Line
            className="size-3 animate-spin text-zinc-400"
            aria-hidden
          />
        )}
      </span>
      <span>{step.label}</span>
    </div>
  );
}

export function AgentProgressCard({
  stepsRemaining,
  steps,
}: {
  stepsRemaining: number;
  steps: AgentStep[];
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between pb-3">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {stepsRemaining} steps left
        </span>
        <span
          className="size-2 animate-pulse rounded-full bg-orange-500"
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-2.5 text-xs">
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}

export function ThinkingIndicator({ seconds }: { seconds: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
      <RiSparklingLine className="size-3.5 text-orange-500" aria-hidden />
      <span>Thinking {seconds}s</span>
    </div>
  );
}
