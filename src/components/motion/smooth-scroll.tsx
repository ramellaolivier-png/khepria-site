"use client";

import { useSyncExternalStore } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Register once, client-only. This file is `"use client"`, so module-scope
// runs only in the browser bundle — `window`/`document` are available here.
gsap.registerPlugin(ScrollTrigger);

// Reports `false` on the server / first paint and `true` after hydration,
// without a setState-in-effect cascade. Lets us defer Lenis instantiation to
// after the first client render so server and client HTML stay identical.
const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Wires the Lenis smooth-scroll instance to GSAP's ScrollTrigger so pinned /
 * scrubbed animations stay in sync with the lerped scroll position.
 *
 * Mounted as a child of <ReactLenis root> so `useLenis()` resolves the active
 * instance from context. The effect only attaches once the instance exists,
 * and cleans up on unmount (survives React 19 Strict-Mode double-mount in dev).
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  useGSAP(
    () => {
      if (!lenis) return;

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.off("scroll", onScroll);
      };
    },
    { dependencies: [lenis] },
  );

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const mounted = useMounted();

  // Default to the static / no-Lenis render on the server and on the first
  // client paint to keep hydration identical, then enable Lenis after mount.
  const enabled = mounted && !reduced;

  // Reduced-motion (or pre-mount): native scroll, NO Lenis instantiated.
  // Same DOM as the Lenis branch (ReactLenis root does not add wrapper nodes),
  // so toggling does not cause a layout shift or hydration mismatch.
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root autoRaf={false}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
