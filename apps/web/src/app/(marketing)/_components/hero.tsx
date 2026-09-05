import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, BoardButtonLink } from "@repo/ui";
import { RiArrowRightLine, RiGithubFill } from "@remixicon/react";
import { LogoStrip } from "./logo-strip";

export interface HeroProps {
  children?: React.ReactNode;
}

export function Hero({ children }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 pt-16 text-center sm:pt-24">
        {/* Badge */}
        <div className="inline-flex items-center justify-center">
          <Link
            href="#features"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-1 pr-3 pl-1 text-sm text-zinc-600 dark:text-zinc-300 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <Badge className="rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold border-none">
              New
            </Badge>
            <span>Transactional outbox ingestion is live</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-4xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-50 sm:text-4xl md:text-5xl">
          AI answers easy to stream.
          <br />
          Not easy to lose.
        </h1>

        {/* Subhead */}
        <p className="mx-auto mt-6 max-w-[50ch] text-base text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed">
          Outbox RAG is the production-grade foundation for retrieval systems
          that must never lose a document.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BoardButtonLink
            href="#start"
            variant="primary"
            size="medium"
            trailingIcon={RiArrowRightLine}
            className="bg-zinc-900! text-white! hover:bg-zinc-800! dark:bg-zinc-50! dark:text-zinc-900! dark:hover:bg-zinc-200! shadow-xs"
          >
            Start building
          </BoardButtonLink>
          <BoardButtonLink
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="medium"
            leadingIcon={RiGithubFill}
          >
            Star on GitHub
          </BoardButtonLink>
        </div>

        {/* Chat Composer in Hero */}
        {children ? (
          <div className="relative z-10 mx-auto mt-10 max-w-2xl text-left">
            {children}
          </div>
        ) : null}

        {/* Logo strip */}
        <div className="mt-16 pb-20">
          <LogoStrip />
        </div>
      </div>
    </section>
  );
}
