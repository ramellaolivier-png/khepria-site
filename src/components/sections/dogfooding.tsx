"use client";

import { Reveal } from "@/components/motion/reveal";
import { DeconstructLazy } from "@/components/webgl/deconstruct-lazy";

/**
 * Dogfooding section — proof we use our own tools daily.
 *
 * The title + text (informative content) live inside <Reveal>, OUTSIDE the
 * WebGL scene, so they are always in the DOM and readable regardless of motion,
 * viewport, or WebGL availability.
 *
 * The media zone is delegated to <DeconstructLazy>, which decides — entirely
 * client-side and SSR-safe — whether to mount the particle deconstruction scene
 * (desktop + motion + WebGL, lazy-loaded on approach) or render the static
 * placeholder captures. The static fallback is the default and the SSR output,
 * so the section is never blank and never depends on three.js loading.
 *
 * Reduced-motion: Reveal renders children fully visible with no animation, and
 * DeconstructLazy renders the static fallback.
 */
export function DogfoodingSection() {
  return (
    <Reveal>
      <section className="rounded-xl bg-[var(--color-dark)] p-8 text-[var(--color-background)]">
        <h2 className="font-serif text-2xl">On construit nos propres outils</h2>
        <p className="mt-2 max-w-xl text-[var(--color-background)]/80">
          La meilleure preuve qu&apos;on sait faire : on l&apos;utilise nous-mêmes au
          quotidien.
        </p>

        {/* Media zone: WebGL deconstruction scene (desktop+motion+WebGL, lazy)
            or the static placeholder captures everywhere else. The DOM always
            contains a readable fallback, independent of JS. */}
        <DeconstructLazy />
      </section>
    </Reveal>
  );
}
