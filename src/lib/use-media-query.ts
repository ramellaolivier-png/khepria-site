"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media-query hook.
 *
 * Mirrors the `useSyncExternalStore` pattern of `use-reduced-motion.ts`:
 * reports `false` on the server and the first client paint (so the static
 * markup is what hydrates — no mismatch), then the live `matchMedia` result
 * after mount, updating when the query starts/stops matching (e.g. on resize).
 *
 * @param query a CSS media query string, e.g. `"(min-width: 1024px)"`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Server + first paint: always `false`, so the fallback is what hydrates.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
