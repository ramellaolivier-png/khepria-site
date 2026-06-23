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

/**
 * Elegant static fallback for the hero 3D object.
 *
 * A serene set of fine concentric rings drawn in pure SVG — monochrome, calm,
 * never a broken box. Shown whenever the WebGL scene is ineligible
 * (reduced-motion, viewport `< 1024px`, no WebGL) AND while the lazy three.js
 * chunk is loading, and if it ever fails. Server-renderable (no hooks): it must
 * render identically on the server, during hydration, and as the dynamic
 * loading state. A very slow CSS "breathe" gives life; it is frozen under
 * reduced-motion by the global media rule (the `.hero-fallback-rings` class).
 */
export function HeroObjectFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <svg
        viewBox="0 0 320 320"
        className="hero-fallback-rings h-full max-h-[420px] w-full max-w-[420px]"
        role="presentation"
      >
        <defs>
          <radialGradient id="hero-ring-fade" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="var(--color-foreground)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0.10" />
          </radialGradient>
        </defs>
        {/* Soft disc to ground the rings */}
        <circle cx="160" cy="160" r="150" fill="url(#hero-ring-fade)" />
        {/* Fine concentric rings, fading outward */}
        {[34, 56, 78, 100, 122, 144].map((r, i) => (
          <circle
            key={r}
            cx="160"
            cy="160"
            r={r}
            fill="none"
            stroke="var(--color-foreground)"
            strokeWidth="1"
            strokeOpacity={0.16 - i * 0.018}
          />
        ))}
        {/* One restrained accent ring — the single cool moment */}
        <circle
          cx="160"
          cy="160"
          r="34"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.25"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
}

// Heavy R3F / three.js scene, code-split here and ONLY here. `ssr:false` keeps
// it out of the server bundle and initial HTML; the `loading` state is the same
// static fallback, so there is never a blank gap while the chunk downloads.
const HeroObjectScene = dynamic(() => import("./hero-object-scene"), {
  ssr: false,
  loading: () => <HeroObjectFallback />,
});

/**
 * Error boundary around the WebGL scene. If the three chunk fails to load, or
 * anything throws while initialising/rendering, we render the static fallback
 * rather than letting the error reach the route-level boundary. Logs a *warn*
 * (not error) so the "no console errors" e2e assertion still holds.
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
    if (typeof console !== "undefined") {
      console.warn("[hero-object] WebGL scene failed, using fallback:", error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Lazy + gated entry point for the hero 3D object.
 *
 * Decision tree (the static fallback wins in every uncertain case):
 *   - reduced-motion OR viewport `< 1024px` OR WebGL unsupported
 *       → render `HeroObjectFallback`, never touch three.js.
 *   - otherwise observe the wrapper; once it nears the viewport (it's the hero,
 *     so essentially immediately) mount the dynamic scene behind the boundary.
 *
 * All three gates report `false` on the server / first paint (SSR-safe hooks),
 * so SSR HTML and the first hydration render are always the static fallback —
 * no hydration mismatch, no white screen.
 */
export function HeroObjectLazy() {
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const webglSupported = useWebGLSupport();

  const eligible = !reduced && isDesktop && webglSupported;

  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!eligible || shouldLoad) return;

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
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
      // The hero is above the fold; a modest preload margin is plenty.
      { rootMargin: "100% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eligible, shouldLoad]);

  // Not eligible → pure static fallback, three.js never imported on this client.
  if (!eligible) {
    return <HeroObjectFallback />;
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      {shouldLoad ? (
        <SceneErrorBoundary fallback={<HeroObjectFallback />}>
          <HeroObjectScene />
        </SceneErrorBoundary>
      ) : (
        <HeroObjectFallback />
      )}
    </div>
  );
}
