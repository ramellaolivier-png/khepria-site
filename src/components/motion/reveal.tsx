"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the reveal animation starts. */
  delay?: number;
  /** Vertical offset (px) the content rises from. */
  y?: number;
  /** Animation duration in seconds. */
  duration?: number;
};

/**
 * Fades + slides its children up the first time they scroll into view.
 *
 * Under `prefers-reduced-motion`, renders the content fully visible with no
 * animation (opacity 1, no transform).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
