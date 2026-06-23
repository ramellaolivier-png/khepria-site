"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type CountUpProps = {
  /**
   * Display value with the number embedded, e.g. `"12+"`, `"~30 h"`, `"100 %"`.
   * The leading number is animated; the surrounding prefix/suffix are kept.
   * If no number is found, the value is rendered verbatim (no animation).
   */
  value: string;
  className?: string;
  /** Animation duration in seconds. */
  duration?: number;
};

type Parsed = {
  prefix: string;
  /** null when the value has no parseable number → render as-is. */
  target: number | null;
  suffix: string;
  /** Decimal places to preserve when formatting (0 for integers). */
  decimals: number;
};

/** Splits a value into prefix + number + suffix; tolerant of non-numeric input. */
export function parseCountValue(value: string): Parsed {
  // Match the first number (integer or decimal). Everything before it is the
  // prefix, everything after is the suffix.
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match || match.index === undefined) {
    return { prefix: value, target: null, suffix: "", decimals: 0 };
  }
  const raw = match[0];
  const prefix = value.slice(0, match.index);
  const suffix = value.slice(match.index + raw.length);
  const normalized = raw.replace(",", ".");
  const target = Number.parseFloat(normalized);
  const dot = normalized.indexOf(".");
  const decimals = dot === -1 ? 0 : normalized.length - dot - 1;
  return { prefix, target, suffix, decimals };
}

/** Formats the running number with the parsed decimal precision. */
function format(n: number, decimals: number): string {
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
}

/**
 * Counts a number up from 0 to its target the first time it enters the
 * viewport, preserving any prefix/suffix. Renders the final value statically
 * under `prefers-reduced-motion` (or when the value has no number).
 */
export function CountUp({ value, className, duration = 1.6 }: CountUpProps) {
  const reduced = useReducedMotion();
  const { prefix, target, suffix, decimals } = parseCountValue(value);

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  // The animated frame text; null until the count-up starts running. While
  // null we render the appropriate static text (final when reduced/done,
  // start otherwise), so the effect never needs a synchronous setState.
  const [frame, setFrame] = useState<string | null>(null);

  const shouldAnimate = target !== null && !reduced && inView;

  useEffect(() => {
    if (!shouldAnimate || target === null) return;
    // setState here happens inside an external-system callback (Motion's
    // animation loop), not synchronously in the effect body.
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setFrame(`${prefix}${format(latest, decimals)}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [shouldAnimate, target, prefix, suffix, decimals, duration]);

  // Non-numeric values render verbatim.
  if (target === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  // Static fallback text shown before/without animation.
  // Always the final target so SSR, no-JS, and reduced-motion users
  // never see a "0" placeholder. When the in-view animation eventually
  // starts (motion only, below-fold scroll), it counts 0→target — which
  // is fine because the element has just entered the viewport.
  const staticText = `${prefix}${format(target, decimals)}${suffix}`;

  return (
    <span ref={ref} className={className}>
      {frame ?? staticText}
    </span>
  );
}
