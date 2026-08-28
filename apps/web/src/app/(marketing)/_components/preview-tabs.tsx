import { Button, cn } from "@repo/ui";

const TABS = [
  "Ingestion pipeline",
  "Vector search",
  "Streaming chat",
  "Ops feed",
];

export function PreviewTabs() {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
        {TABS.map((tab, index) => (
          <Button
            key={tab}
            size="sm"
            variant="ghost"
            className={cn(
              "h-auto rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors select-none",
              index === 0
                ? "bg-[#F75B33] text-white hover:bg-[#e04b24] hover:text-white"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            {tab}
          </Button>
        ))}
      </div>
    </div>
  );
}
