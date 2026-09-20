import type { ReactNode } from "react";
import { Header } from "@/components/layout";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
