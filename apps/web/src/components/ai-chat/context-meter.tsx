export function ContextMeter({ value }: { value: number }) {
  const radius = 5;
  const circumference = 2 * Math.PI * radius;

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-zinc-200/70 py-0.5 pl-2 pr-2.5 text-xs font-medium text-zinc-600">
      <svg viewBox="0 0 16 16" className="size-3.5 -rotate-90" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="stroke-zinc-300"
        />
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-zinc-600"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        />
      </svg>
      {value}%
    </span>
  );
}
