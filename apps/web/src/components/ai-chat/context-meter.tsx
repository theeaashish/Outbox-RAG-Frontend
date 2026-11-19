export function ContextMeter({ value }: { value: number }) {
  const radius = 5;
  const circumference = 2 * Math.PI * radius;
  const progress = Number.isFinite(value)
    ? Math.round(Math.min(100, Math.max(0, value)))
    : 0;

  return (
    <span
      role="meter"
      aria-label="Context usage"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      title={`Context window usage: ${progress}%`}
      className="flex items-center gap-1.5 rounded-full bg-zinc-200/70 py-0.5 pl-2 pr-2.5 text-xs font-medium tabular-nums text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-300"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="stroke-zinc-300 dark:stroke-zinc-700"
        />
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-zinc-600 dark:stroke-zinc-300"
          strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
        />
      </svg>
      {progress}%
    </span>
  );
}
