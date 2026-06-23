"use client";

import { useSyncExternalStore } from "react";

/**
 * Cached result of the one-shot WebGL probe.
 *
 * `undefined` = not probed yet. We probe lazily (on first client read) and
 * memoise: creating a throwaway canvas + context is cheap but pointless to
 * repeat, and the answer never changes within a page lifetime.
 */
let cachedSupport: boolean | undefined;

/**
 * Detects whether the browser can give us a WebGL rendering context.
 *
 * Wrapped in try/catch because some browsers *throw* (rather than return null)
 * when WebGL is blocked by policy, disabled, or the GPU is blocklisted. Any
 * failure path resolves to `false` so the caller falls back to static content.
 */
function detectWebGLSupport(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    // Some contexts exist but are immediately lost; treat any truthy context as
    // "supported" — R3F itself will surface a context-loss later and we still
    // have the error boundary + fallback around the scene.
    return gl != null;
  } catch {
    return false;
  }
}

// `useSyncExternalStore` external store: there is nothing to subscribe to
// (support does not change at runtime), so the subscribe is a no-op.
const emptySubscribe = () => () => {};

function getClientSnapshot(): boolean {
  if (cachedSupport === undefined) {
    cachedSupport = detectWebGLSupport();
  }
  return cachedSupport;
}

// Server (and the very first client paint before hydration) reports `false`,
// so the SSR HTML always contains the static fallback and there is no
// hydration mismatch. The real probe runs after mount on the client.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe hook reporting whether WebGL is available.
 *
 * Returns `false` on the server and on the first client render, then the real
 * probed value after hydration. Built on `useSyncExternalStore` to match the
 * project's no-setState-in-effect convention (see `use-reduced-motion.ts`).
 */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
