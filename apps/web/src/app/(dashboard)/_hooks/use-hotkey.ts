import { useEffect } from "react";

interface HotkeyOptions {
  key: string;
  metaOrCtrl?: boolean;
  enabled?: boolean;
}

export function useHotkey(
  { key, metaOrCtrl = false, enabled = true }: HotkeyOptions,
  handler: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (metaOrCtrl && !(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      handler(event);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, metaOrCtrl, enabled, handler]);
}
