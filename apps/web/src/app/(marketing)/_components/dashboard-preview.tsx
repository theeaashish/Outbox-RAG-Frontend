import { Activity, FileText, MessageSquare, Search } from "lucide-react";
import { Badge, Button, cn } from "@repo/ui";
import { StatusChip, type DocumentStatus } from "./status-chip";

const NAV_ITEMS = [
  { label: "Documents", icon: FileText, active: true },
  { label: "Conversations", icon: MessageSquare, active: false },
  { label: "Search", icon: Search, active: false },
  { label: "Ops", icon: Activity, active: false },
];

const DOCUMENT_ROWS: {
  file: string;
  status: DocumentStatus;
  chunks: string;
  age: string;
}[] = [
  { file: "annual-report-2025.pdf", status: "ready", chunks: "142", age: "2m" },
  {
    file: "policy-handbook.pdf",
    status: "processing",
    chunks: "—",
    age: "31s",
  },
  { file: "scan-bad.pdf", status: "failed", chunks: "0", age: "5m" },
];

export function DashboardPreview() {
  return (
    <div className="flex text-left">
      <aside className="hidden w-48 shrink-0 border-r border-zinc-100 p-4 md:block bg-zinc-50/40">
        <p className="px-2 pb-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Mission Control
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 px-2 py-1.5 text-xs font-medium h-auto",
                  item.active
                    ? "bg-zinc-100 text-zinc-900 font-semibold hover:bg-zinc-100 hover:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Documents</h3>
            <p className="text-xs text-zinc-500">
              Real-time transactional ingestion
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-mono font-normal"
          >
            3 total
          </Badge>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border border-zinc-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] tracking-wider text-zinc-400 uppercase">
                <th className="px-3 py-2 font-medium">Filename</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">
                  Chunks
                </th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">
                  Age
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {DOCUMENT_ROWS.map((row) => (
                <tr
                  key={row.file}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-3 py-2.5 font-mono text-zinc-700">
                    {row.file}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="hidden px-3 py-2.5 font-mono text-zinc-500 sm:table-cell">
                    {row.chunks}
                  </td>
                  <td className="hidden px-3 py-2.5 font-mono text-zinc-500 sm:table-cell">
                    {row.age}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
