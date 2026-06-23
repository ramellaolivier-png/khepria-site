"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

/**
 * CTA final — brand-signature section.
 *
 * The headline "Parlons de votre projet." assembles in via Reveal (fade +
 * slide up). Two staggered Reveals layer the paragraph and button in behind.
 * Under reduced-motion, Reveal renders children fully visible statically.
 */
export function CtaFinalSection() {
  return (
    <section className="rounded-xl bg-[var(--color-accent)] p-10 text-center text-[var(--color-primary)]">
      <Reveal>
        <h2 className="font-serif text-3xl font-semibold">
          Parlons de votre projet.
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mt-2">Un échange de 30 min, sans engagement.</p>
      </Reveal>

      <Reveal delay={0.22}>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 text-[var(--color-background)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
        >
          Nous contacter
        </Link>
      </Reveal>
    </section>
  );
}
