"use client";

import { memo, useMemo, type ComponentProps } from "react";
import { Streamdown, defaultRehypePlugins, type ExtraProps } from "streamdown";
import { code } from "@streamdown/code";
import type { ChatSource } from "@/features/chat";
import { CitationPill } from "./citation-pill";
import { rehypeCitations } from "./rehype-citations";

interface ChatMarkdownProps {
  content: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
  onSelectSource?: (citation: number) => void;
}

const STREAMDOWN_PLUGINS = { code } as const;
const REHYPE_PLUGINS = [
  ...Object.values(defaultRehypePlugins),
  rehypeCitations,
];

export const ChatMarkdown = memo(function ChatMarkdown({
  content,
  sources,
  isStreaming = false,
  onSelectSource,
}: ChatMarkdownProps) {
  const components = useMemo(
    () => ({
      a: ({
        node,
        href,
        children,
        ...props
      }: ComponentProps<"a"> & ExtraProps) => {
        const citation = node?.properties.dataCitation;
        if (typeof citation === "number") {
          return (
            <CitationPill
              citation={citation}
              source={sources?.find((source) => source.citation === citation)}
              onSelectSource={onSelectSource}
            />
          );
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [sources, onSelectSource]
  );

  return (
    <Streamdown
      mode={isStreaming ? "streaming" : "static"}
      plugins={STREAMDOWN_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={components}
      isAnimating={isStreaming}
      caret={isStreaming ? "block" : undefined}
    >
      {content}
    </Streamdown>
  );
});
