const STACK = [
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "Redis",
  "Celery",
  "Gemini",
];

export function LogoStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
      {STACK.map((name) => (
        <span
          key={name}
          className="text-sm font-semibold tracking-wide text-zinc-400 grayscale transition hover:text-zinc-600"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
