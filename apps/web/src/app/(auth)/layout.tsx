import type { ReactNode } from "react";
import Link from "next/link";
import { AuthMediaCarousel, Logo, ThemeToggle } from "@repo/ui";
import { authCarouselSlides } from "./_components/auth-slides";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-dvh w-full overflow-hidden bg-background-full text-foreground antialiased selection:bg-zinc-900 selection:text-white md:grid-cols-2 dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      {/* Left 50%: Auth form column with top header and bottom footer */}
      <div className="flex h-full min-h-0 flex-col justify-between overflow-y-auto px-6 py-5 sm:px-10 sm:py-6">
        <header className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            aria-label="Home"
          >
            <Logo />
          </Link>
          <ThemeToggle collapsed />
        </header>

        <main className="my-auto flex w-full flex-col items-center justify-center py-4">
          {children}
        </main>

        <footer className="flex shrink-0 items-center justify-between gap-4 text-xs text-text-tertiary">
          <p>© {new Date().getFullYear()} Outbox</p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="transition-colors hover:text-text-primary"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-text-primary"
            >
              Privacy
            </Link>
          </div>
        </footer>
      </div>

      {/* Right 50%: Full-height inset media panel */}
      <div className="relative hidden h-full p-3 md:block">
        <div className="relative size-full overflow-hidden rounded-3xl bg-background-secondary-default shadow-xs">
          <AuthMediaCarousel slides={authCarouselSlides} />
        </div>
      </div>
    </div>
  );
}
