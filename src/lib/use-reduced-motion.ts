"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

// Server (and first paint before hydration) always reports `false` so the
// rendered DOM is identical across server/client — no hydration mismatch.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe hook that reports whether the user prefers reduced motion.
 *
 * Built on `useSyncExternalStore` so it subscribes to the
 * `prefers-reduced-motion` media query without a setState-in-effect cascade,
 * stays consistent between server and client, and updates live when the OS
 * setting changes.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
