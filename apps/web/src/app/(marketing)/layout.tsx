import * as React from "react";
import { Header } from "@/components/layout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
