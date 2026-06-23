"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SITE } from "@/lib/site";

/**
 * Team section with a subtle parallax on the avatar cluster.
 *
 * Uses `motion/react` `useScroll` + `useTransform` — the avatars drift
 * slightly upward as the user scrolls past, giving depth without distraction.
 * Under reduced-motion (or SSR), the avatars are rendered statically with
 * no transform applied.
 */
export function TeamSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle: max ±16px vertical drift across the section's scroll range.
  const y = useTransform(scrollYProgress, [0, 1], [16, -16]);

  const avatars = (
    <div className="flex">
      <div className="h-14 w-14 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-secondary)]" />
      <div className="-ml-3 h-14 w-14 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-primary)]" />
    </div>
  );

  return (
    <section ref={sectionRef} className="flex items-center gap-6">
      {reduced ? (
        avatars
      ) : (
        <motion.div style={{ y }}>{avatars}</motion.div>
      )}
      <p className="text-[var(--color-foreground)]/80">
        <strong>Olivier &amp; Charles</strong> — une agence à taille humaine,
        ancrée à {SITE.city}.{" "}
        <Link
          href="/a-propos"
          className="rounded underline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2"
        >
          Faire connaissance →
        </Link>
      </p>
    </section>
  );
}
