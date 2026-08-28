import { Badge, cn } from "@repo/ui";

export type DocumentStatus = "ready" | "processing" | "failed";

const CHIP_STYLES: Record<DocumentStatus, string> = {
  ready:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  processing:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  failed:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
};

const DOT_STYLES: Record<DocumentStatus, string> = {
  ready: "bg-emerald-500",
  processing: "animate-pulse bg-amber-500",
  failed: "bg-red-500",
};

export function StatusChip({ status }: { status: DocumentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium px-2 py-0.5 text-[11px] h-auto shadow-none",
        CHIP_STYLES[status]
      )}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", DOT_STYLES[status])}
      />
      <span>{status}</span>
    </Badge>
  );
}
