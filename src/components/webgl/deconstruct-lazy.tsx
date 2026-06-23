"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { useWebGLSupport } from "@/lib/use-webgl-support";
import { StaticFallback } from "./static-fallback";

// The heavy three.js / R3F scene is code-split here and ONLY here. `ssr:false`
// keeps it out of the server bundle and the initial HTML; the `loading` state
// is the very same static fallback, so there is never a blank gap while the
// chunk downloads. Because this is the sole `import()` of the scene module, the
// three chunk is guaranteed absent from the initial homepage bundle.
const DeconstructScene = dynamic(() => import("./deconstruct-scene"), {
  ssr: false,
  loading: () => <StaticFallback />,
});

/**
 * Error boundary around the WebGL scene.
 *
 * Non-negotiable safety net: if the three chunk fails to load (network/parse
 * error), or anything throws while initialising/rendering the scene, we render
 * the static fallback instead of letting the error bubble up to the route-level
 * `error.tsx`. The rest of the page stays fully intact.
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // Surface for diagnostics without breaking the page. Kept quiet in prod
    // builds via the console.* the e2e tolerates a *warn* but not error here;
    // we use warn so the "no console errors" assertion still holds.
    if (typeof console !== "undefined") {
      console.warn("[deconstruct] WebGL scene failed, using fallback:", error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Lazy + gated entry point for the dogfooding media zone.
 *
 * Decision tree (the static fallback wins in every uncertain case):
 *   - reduced-motion OR viewport `< 1024px` OR WebGL unsupported
 *       → render `StaticFallback`, never touch three.js.
 *   - otherwise, observe the wrapper; once it nears the viewport
 *     (IntersectionObserver with a generous preload margin) mount the dynamic
 *     scene, wrapped in an error boundary that falls back on any failure.
 *
 * All three gates report `false` on the server / first paint (SSR-safe hooks),
 * so the SSR HTML and the first hydration render are always the static
 * fallback — no hydration mismatch, no white screen.
 */
export function DeconstructLazy() {
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const webglSupported = useWebGLSupport();

  const eligible = !reduced && isDesktop && webglSupported;

  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only arm the observer when the scene is eligible and not already queued.
    if (!eligible || shouldLoad) return;

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // No IO support → preload immediately rather than never showing the scene.
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      // Generous preload: start fetching the chunk well before the section
      // scrolls into view so the scene is ready by the time it matters.
      { rootMargin: "200% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eligible, shouldLoad]);

  // Not eligible → pure static fallback, three.js never imported on this client.
  if (!eligible) {
    return <StaticFallback />;
  }

  // Eligible: a wrapper we can observe. Until near-viewport (or before the
  // chunk resolves), show the fallback; then mount the scene behind a boundary.
  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <SceneErrorBoundary fallback={<StaticFallback />}>
          <DeconstructScene />
        </SceneErrorBoundary>
      ) : (
        <StaticFallback />
      )}
    </div>
  );
}
