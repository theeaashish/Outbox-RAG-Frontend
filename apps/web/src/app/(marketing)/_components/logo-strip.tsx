import { cn } from "@repo/ui";

const STACK: readonly { name: string; role: string }[] = [
  { name: "FastAPI", role: "Gateway" },
  { name: "PostgreSQL", role: "ACID Outbox" },
  { name: "pgvector", role: "HNSW Index" },
  { name: "Redis", role: "Relay Broker" },
  { name: "Celery", role: "Fenced Workers" },
  { name: "Gemini", role: "768d + Stream" },
];

export function LogoStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-zinc-200/80 pt-7 dark:border-zinc-800/80",
        className
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.06em] text-zinc-400 uppercase dark:text-zinc-500">
        Engineered on proven primitives
      </p>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/50 sm:grid-cols-3 lg:grid-cols-6 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        {STACK.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center justify-center gap-0.5 border-b border-r border-zinc-200/70 px-3 py-3 text-center transition-colors duration-150 max-sm:even:border-r-0 max-sm:nth-[n+5]:border-b-0 sm:max-lg:nth-[3n]:border-r-0 sm:max-lg:nth-[n+4]:border-b-0 lg:border-b-0 lg:last:border-r-0 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white dark:border-zinc-800/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-900/90"
          >
            <span className="text-[13px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200">
              {item.name}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {item.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
