"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface UseChatScrollOptions {
  threshold?: number;
  initiallyStuck?: boolean;
}

export function useChatScroll({
  threshold = 80,
  initiallyStuck = true,
}: UseChatScrollOptions = {}) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  const scrollElRef = useRef<HTMLDivElement | null>(null);

  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  const [isAtBottom, setIsAtBottom] = useState(initiallyStuck);
  const isAtBottomRef = useRef(initiallyStuck);

  const rafRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef<number | null>(null);
  const userInterruptedRef = useRef(false);

  const setAtBottom = useCallback((value: boolean) => {
    if (isAtBottomRef.current === value) {
      return;
    }

    isAtBottomRef.current = value;
    setIsAtBottom(value);
  }, []);

  const getDistanceFromBottom = useCallback((el: HTMLElement) => {
    return Math.max(0, el.scrollHeight - el.scrollTop - el.clientHeight);
  }, []);

  const isNearBottom = useCallback(
    (el: HTMLElement) => {
      return getDistanceFromBottom(el) <= thresholdRef.current;
    },
    [getDistanceFromBottom]
  );

  const finishProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = false;

    if (programmaticTimeoutRef.current !== null) {
      window.clearTimeout(programmaticTimeoutRef.current);
      programmaticTimeoutRef.current = null;
    }

    const el = scrollElRef.current;
    if (!el) return;

    if (userInterruptedRef.current) {
      userInterruptedRef.current = false;
      setAtBottom(isNearBottom(el));
    } else {
      setAtBottom(true);
      if (getDistanceFromBottom(el) > 0) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [getDistanceFromBottom, isNearBottom, setAtBottom]);

  const cancelProgrammaticScroll = useCallback(() => {
    if (!programmaticScrollRef.current) {
      return;
    }

    userInterruptedRef.current = true;
    finishProgrammaticScroll();
  }, [finishProgrammaticScroll]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = scrollElRef.current;
      if (!el) {
        return;
      }

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      const resolvedBehavior =
        behavior === "smooth" && prefersReducedMotion ? "auto" : behavior;

      setAtBottom(true);
      userInterruptedRef.current = false;

      if (resolvedBehavior === "auto") {
        el.scrollTop = el.scrollHeight;
        return;
      }

      programmaticScrollRef.current = true;

      if (programmaticTimeoutRef.current !== null) {
        window.clearTimeout(programmaticTimeoutRef.current);
      }

      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });

      /**
       * Fallback for browsers without scrollend.
       */
      programmaticTimeoutRef.current = window.setTimeout(() => {
        finishProgrammaticScroll();
      }, 1500);
    },
    [finishProgrammaticScroll, setAtBottom]
  );

  const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
    scrollElRef.current = node;
    setScrollEl(node);
  }, []);

  const contentRef = useCallback((node: HTMLDivElement | null) => {
    setContentEl(node);
  }, []);

  /**
   * Initial positioning should happen before paint
   * to avoid a visible jump to the bottom.
   */
  useIsomorphicLayoutEffect(() => {
    const el = scrollElRef.current;
    if (!el || !initiallyStuck) {
      return;
    }

    el.scrollTop = el.scrollHeight;
  }, [scrollEl, initiallyStuck]);

  useEffect(() => {
    const container = scrollEl;
    const content = contentEl;

    if (!container || !content) {
      return;
    }

    const handleScroll = () => {
      if (programmaticScrollRef.current) {
        return;
      }

      setAtBottom(isNearBottom(container));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    container.addEventListener("wheel", cancelProgrammaticScroll, {
      passive: true,
    });
    container.addEventListener("pointerdown", cancelProgrammaticScroll, {
      passive: true,
    });
    container.addEventListener("keydown", cancelProgrammaticScroll, {
      passive: true,
    });

    const handleScrollEnd = () => {
      if (!programmaticScrollRef.current) {
        return;
      }

      finishProgrammaticScroll();
    };

    container.addEventListener("scrollend", handleScrollEnd);

    const stickToBottom = () => {
      const el = scrollElRef.current;
      if (!el || !isAtBottomRef.current || programmaticScrollRef.current) {
        return;
      }

      if (getDistanceFromBottom(el) <= 1) {
        return;
      }

      el.scrollTop = el.scrollHeight;
    };

    const scheduleStickToBottom = () => {
      if (!isAtBottomRef.current) {
        return;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        stickToBottom();
      });
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleStickToBottom)
        : null;

    resizeObserver?.observe(content);
    resizeObserver?.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", cancelProgrammaticScroll);
      container.removeEventListener("pointerdown", cancelProgrammaticScroll);
      container.removeEventListener("keydown", cancelProgrammaticScroll);
      container.removeEventListener("scrollend", handleScrollEnd);

      resizeObserver?.disconnect();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      programmaticScrollRef.current = false;
      userInterruptedRef.current = false;

      if (programmaticTimeoutRef.current !== null) {
        window.clearTimeout(programmaticTimeoutRef.current);
        programmaticTimeoutRef.current = null;
      }
    };
  }, [
    scrollEl,
    contentEl,
    cancelProgrammaticScroll,
    finishProgrammaticScroll,
    getDistanceFromBottom,
    isNearBottom,
    setAtBottom,
  ]);

  return {
    scrollContainerRef,
    contentRef,
    scrollToBottom,
    isAtBottom,
  };
}
