import * as React from "react";
import Link from "next/link";
import { Logo, ThemeToggle } from "@repo/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-zinc-50 text-foreground antialiased selection:bg-zinc-900 selection:text-white dark:bg-zinc-950 dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      {/* Background ambient pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(0,0,0,0))]"
      />

      {/* Top navigation header */}
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          aria-label="Home"
        >
          <Logo />
        </Link>
        <ThemeToggle appearance="segmented" />
      </header>

      {/* Main card container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} Basic RAG. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link
            href="/terms"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
