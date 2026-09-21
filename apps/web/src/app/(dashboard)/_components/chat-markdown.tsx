"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

interface ChatMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

const STREAMDOWN_PLUGINS = { code } as const;

export const ChatMarkdown = memo(function ChatMarkdown({
  content,
  isStreaming = false,
}: ChatMarkdownProps) {
  return (
    <Streamdown
      plugins={STREAMDOWN_PLUGINS}
      isAnimating={isStreaming}
      caret={isStreaming ? "block" : undefined}
    >
      {content}
    </Streamdown>
  );
});
