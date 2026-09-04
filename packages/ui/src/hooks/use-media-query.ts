"use client";
import { useEffect, useState } from "react";

/**
 * Reactive media-query state. Returns `false` during SSR and the first client
 * render, then syncs to the actual match — safe for gating listeners and
 * layout branches that only matter after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
