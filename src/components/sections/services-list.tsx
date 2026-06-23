import Link from "next/link";
import { SERVICES } from "@/lib/site";
import { Reveal } from "@/components/motion/reveal";

/**
 * Services — editorial vertical list (replaces the horizontal pinned scroll).
 *
 * Each service is a full-width row (index · title · description · delay) split
 * by hairline rules, revealed with a soft staggered fade/slide as it scrolls in
 * (the `Reveal` primitive degrades to static under `prefers-reduced-motion`).
 * Plain vertical scroll — no pin, no scroll-hijack. All 5 titles render
 * unconditionally in the DOM.
 */
export function ServicesListSection() {
  return (
    <section aria-label="Nos services">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-secondary)]">
          Services
        </p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl tracking-tight text-[var(--color-foreground)] sm:text-5xl">
          Ce qu&apos;on fait
        </h2>
      </Reveal>

      <div className="mt-12 sm:mt-16">
        {SERVICES.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.05} y={20}>
            <div className="grid grid-cols-[2rem_1fr] items-baseline gap-x-5 gap-y-2 border-t border-black/10 py-8 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-8 sm:py-10">
              <span className="font-sans text-sm tabular-nums text-[var(--color-secondary)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-start-2 sm:col-start-2">
                <h3 className="font-serif text-2xl tracking-tight text-[var(--color-foreground)] sm:text-[1.75rem]">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-[var(--color-secondary)]">
                  {s.pitch}
                </p>
              </div>
              <span className="col-start-2 text-sm tabular-nums text-[var(--color-secondary)] sm:col-start-3 sm:pt-1 sm:text-right">
                {s.delay}
              </span>
            </div>
          </Reveal>
        ))}

        <div className="border-t border-black/10 pt-10">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-lg text-[var(--color-foreground)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-4"
          >
            Tous les services
            <span aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
