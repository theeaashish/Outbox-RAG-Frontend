import type { ReactNode } from "react";
import { Card, Separator } from "@repo/ui";

export function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl p-0 gap-0">
      <div className="flex items-center gap-2 bg-zinc-50/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <div className="ml-4 hidden h-6 max-w-md flex-1 rounded-md border border-zinc-200 bg-white px-3 text-xs leading-6 text-zinc-400 sm:block font-mono">
          app.outboxrag.dev/mission-control
        </div>
      </div>
      <Separator />
      {children}
    </Card>
  );
}
