import { BoardButtonLink } from "@repo/ui";
import { RiArrowRightLine, RiGithubFill } from "@remixicon/react";
import { LogoStrip } from "./logo-strip";
import { OutboxStage } from "./outbox-stage";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24 sm:pb-20">
        {/* Balanced medium-weight headline */}
        <h1 className="mx-auto max-w-3xl text-balance font-medium tracking-[-0.03em] leading-[1.12] text-[clamp(1.5rem,0.95rem+2.75vw,3.25rem)] text-zinc-950 dark:text-zinc-50">
          <span className="block">Grounded AI over your docs,</span>
          <span className="block">built to never lose a file.</span>
        </h1>

        {/* Concise subtitle */}
        <p className="mx-auto mt-5 max-w-[50ch] text-pretty text-[15px] leading-relaxed font-normal text-zinc-600 dark:text-zinc-400 sm:text-base">
          Outbox RAG pairs transactional document ingestion with pgvector
          retrieval so every uploaded file is indexed and cited.
        </p>

        {/* Compact non-pill CTAs with identical outer box geometry */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <BoardButtonLink
            href="/register"
            variant="primary"
            size="small"
            trailingIcon={RiArrowRightLine}
            className="h-8 px-2.5 transition-[filter,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
          >
            Start building
          </BoardButtonLink>
          <BoardButtonLink
            href="https://github.com/theeaashish/Outbox-RAG"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="small"
            leadingIcon={RiGithubFill}
            className="h-8 border-0 px-2.5 shadow-[0_1px_2px_0_rgb(0_0_0/0.05),0_0_0_1px_var(--color-border-button-default)] transition-[background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_0_0_1px_var(--color-border-button-hover)] active:scale-[0.97]"
          >
            Star on GitHub
          </BoardButtonLink>
        </div>

        {/* Stageshow product showcase */}
        <div className="mt-12 w-full sm:mt-14">
          <OutboxStage />
        </div>

        {/* Architectural stack strip */}
        <div className="mt-10 w-full max-w-4xl sm:mt-12">
          <LogoStrip />
        </div>
      </div>
    </section>
  );
}
