"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/**
 * Isomorphic layout effect: measurement must happen before paint on the client,
 * but useLayoutEffect warns during SSR — fall back to useEffect there.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Hard cap: past this the textarea stops growing and scrolls internally. */
const TEXTAREA_MAX_HEIGHT_PX = 180;

/**
 * Ghost heights above this count as multiline. A single line is ~20px
 * (text-sm leading-snug, no padding), two lines ~40px — anything in between
 * works; 34 leaves margin for font-rendering differences across platforms.
 */
const SINGLE_LINE_THRESHOLD_PX = 34;

/**
 * Horizontal chrome subtracted from the container width to get the pill-mode
 * text width: container p-1.5 (12) + two gap-1.5 (12) + textarea wrapper px-1 (8).
 * KEEP IN SYNC with the pill layout classes in AiChatComposer.
 * (Measure against the *pill* width — never the live multiline layout — or the
 * morph feeds back into the measurement and the pill oscillates while typing.)
 */
const PILL_HORIZONTAL_CHROME_PX = 32;

/** Ghost width before the first container measurement lands. */
const INITIAL_GHOST_WIDTH_PX = 320;

/** Measured-width fallbacks so the very first layout pass never sees 0. */
const FALLBACK_ADD_MENU_WIDTH_PX = 36;
const FALLBACK_ACTIONS_WIDTH_PX = 140;
const MIN_TEXTAREA_WIDTH_PX = 120;

export interface ComposerAutosize {
  isMultiline: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  ghostRef: RefObject<HTMLDivElement | null>;
  addMenuRef: RefObject<HTMLDivElement | null>;
  actionsRef: RefObject<HTMLDivElement | null>;
  /** Width the ghost should render at (pill-mode text width once measured). */
  ghostWidth: number;
}

/**
 * Owns all composer sizing: pill-width tracking, flicker-free multiline
 * detection via an offscreen ghost, and textarea auto-grow.
 */
export function useComposerAutosize(value: string): ComposerAutosize {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const [isMultiline, setIsMultiline] = useState(false);
  const [pillWidth, setPillWidth] = useState(0);

  // Measure available textarea width in single-line pill mode.
  const updatePillWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const addMenuWidth =
      addMenuRef.current?.offsetWidth || FALLBACK_ADD_MENU_WIDTH_PX;
    const actionsWidth =
      actionsRef.current?.offsetWidth || FALLBACK_ACTIONS_WIDTH_PX;
    const available =
      container.clientWidth -
      addMenuWidth -
      actionsWidth -
      PILL_HORIZONTAL_CHROME_PX;

    setPillWidth(Math.max(available, MIN_TEXTAREA_WIDTH_PX));
  }, []);

  // Track container resizes (window resize, sidebar collapse, font load, …).
  useIsomorphicLayoutEffect(() => {
    updatePillWidth();
    if (typeof ResizeObserver === "undefined" || !containerRef.current) return;

    const observer = new ResizeObserver(updatePillWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updatePillWidth]);

  // Multiline detection: measure the text against the pill-mode width via the
  // ghost, so the wider multiline layout never feeds back into the check.
  useIsomorphicLayoutEffect(() => {
    if (value.includes("\n")) {
      setIsMultiline(true);
      return;
    }

    const ghost = ghostRef.current;
    if (!ghost) return;

    ghost.textContent = value || " ";
    setIsMultiline(ghost.scrollHeight > SINGLE_LINE_THRESHOLD_PX);
  }, [value, pillWidth]);

  // Grow/shrink the live textarea to its content.
  useIsomorphicLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!isMultiline) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
      return;
    }

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
    textarea.style.overflowY =
      scrollHeight > TEXTAREA_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value, isMultiline]);

  return {
    isMultiline,
    containerRef,
    textareaRef,
    ghostRef,
    addMenuRef,
    actionsRef,
    ghostWidth: pillWidth || INITIAL_GHOST_WIDTH_PX,
  };
}
