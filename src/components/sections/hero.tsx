import Link from "next/link";
import { HeroObjectLazy } from "@/components/webgl/hero-object-lazy";
import { SITE } from "@/lib/site";

/**
 * HERO — minimal, white, Apple-grade composition.
 *
 * Layout: an asymmetric two-column grid on desktop (text left, 3D object right),
 * collapsing to a centred stack on smaller viewports. Generous whitespace, an
 * oversized tight-tracking headline (Sora via `font-serif`), a calm eyebrow,
 * refined subtext, a black pill primary CTA + a quiet text-link secondary.
 *
 * Intro reveal: each part carries `data-reveal` + a per-element `--reveal-delay`,
 * driving a staggered fade + translate-up on load via the CSS `hero-rise`
 * keyframe (eyebrow → headline → subtext → CTAs → 3D object). Refined Apple
 * easing `cubic-bezier(0.22, 1, 0.36, 1)`. No JS choreography: the animation is
 * pure CSS and is neutralised — fully static & visible — under
 * `prefers-reduced-motion` by the global rule in globals.css. The H1 keeps the
 * exact `SITE.baseline` copy (needed for e2e + it's the strong line).
 */
export function HeroSection() {
  // Split the baseline at its sentence break so the two clauses can sit on
  // their own visual lines for an editorial, Apple-style headline.
  const [line1, line2] = SITE.baseline.split(". ");

  return (
    <section className="relative overflow-hidden">
      <div className="grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
        {/* ── Text column ─────────────────────────────────────────────── */}
        <div className="max-w-2xl text-center lg:text-left">
          <p
            data-reveal
            style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
            className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-secondary)]"
          >
            {SITE.name} — agence IA — {SITE.city}
          </p>

          <h1
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="mt-6 font-serif text-[clamp(2.6rem,6vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-foreground)]"
          >
            <span className="block">{line1 ? `${line1}.` : SITE.baseline}</span>
            {line2 ? (
              <span className="mt-1 block text-[var(--color-secondary)]">
                {line2}
              </span>
            ) : null}
          </h1>

          <p
            data-reveal
            style={{ "--reveal-delay": "210ms" } as React.CSSProperties}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-secondary)] lg:mx-0"
          >
            On ne vend pas des slides. On livre du code, des automatisations et
            des produits qui tournent en production.
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "330ms" } as React.CSSProperties}
            className="mt-10 flex flex-col items-center gap-x-7 gap-y-4 sm:flex-row lg:justify-start"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-medium text-[var(--color-background)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Parler de votre projet
            </Link>
            <Link
              href="/services"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-foreground)] transition-colors duration-300 hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Voir nos services
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* ── 3D object column ────────────────────────────────────────────
            Lazy + gated: real WebGL sphere on desktop ≥1024 + WebGL + motion,
            elegant SVG concentric-ring fallback everywhere else. The reveal
            here is the slowest in the stagger so the object settles last. */}
        <div
          data-reveal
          style={{ "--reveal-delay": "450ms" } as React.CSSProperties}
          className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[420px] lg:max-w-none"
        >
          <HeroObjectLazy />
        </div>
      </div>
    </section>
  );
}
