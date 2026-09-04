import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal focus behavior for custom overlays: moves focus into the container on
 * open, wraps Tab navigation inside it while open, and restores focus to the
 * previously focused element on close. Pairs with `aria-modal="true"` —
 * without the trap, keyboard users keep tabbing through content behind the
 * overlay the modal claims to own.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const first = focusables()[0] ?? container;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (
        !container.contains(event.target as Node) &&
        !container.contains(document.activeElement)
      ) {
        return;
      }

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      if (event.shiftKey) {
        // Wrap backwards from the first item (or when focus escaped the container).
        const nextIndex =
          currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[nextIndex]?.focus();
      } else {
        const nextIndex =
          currentIndex === items.length - 1 || currentIndex === -1
            ? 0
            : currentIndex + 1;
        items[nextIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, containerRef]);
}
