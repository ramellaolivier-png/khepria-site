"use client";

import { CountUp } from "@/components/motion/count-up";

const STATS = [
  { v: "12+", l: "workflows en prod" },
  { v: "~30 h", l: "/mois économisées" },
  { v: "100 %", l: "local & RGPD" },
] as const;

/**
 * Stats band — 3 chiffres clés animés avec CountUp.
 * Reduced-motion : CountUp affiche la valeur finale sans animation.
 * Sans JS : la valeur est rendue directement dans le HTML statique.
 */
export function StatsSection() {
  return (
    <section
      aria-label="Chiffres clés"
      className="grid gap-6 rounded-xl bg-[var(--color-secondary)] p-8 sm:grid-cols-3"
    >
      {STATS.map((s) => (
        <div key={s.l}>
          <p className="font-serif text-3xl font-bold text-[var(--color-primary)]">
            <CountUp value={s.v} />
          </p>
          <p className="text-sm text-[var(--color-primary)]/80">{s.l}</p>
        </div>
      ))}
    </section>
  );
}
