"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const COARSE_QUERY = "(pointer: coarse)";

function subscribeCoarse(onChange: () => void): () => void {
  const mq = window.matchMedia(COARSE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the primary pointer is coarse (touch). SSR-safe → false. */
function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false,
  );
}

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** Pull factor toward the cursor (0–1). ~0.3 feels subtle. */
  strength?: number;
};

/**
 * Wraps its children so they drift toward the pointer (a "magnetic" hover),
 * snapping back on leave via a spring.
 *
 * Disabled — renders an inert wrapper with no listeners — when the user prefers
 * reduced motion or the primary pointer is coarse (touch).
 */
export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const enabled = !reduced && !coarse;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  );
}
