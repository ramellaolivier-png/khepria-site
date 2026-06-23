import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Chatbot IA, assistant interne, automatisation n8n, développement IA sur mesure, conseil. Des livrables qui tournent en prod.",
};

export default function ServicesPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">Ce qu&apos;on fait</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--color-primary)]">Des services concrets, pas du conseil en l&apos;air</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <article key={s.slug} className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="font-serif text-xl text-[var(--color-primary)]">{s.title}</h2>
            <p className="mt-2 text-[var(--color-foreground)]/80">{s.pitch}</p>
            <dl className="mt-4 grid gap-1 text-sm text-[var(--color-foreground)]/70">
              <div><dt className="inline font-medium">Ce qu&apos;on livre : </dt><dd className="inline">{s.delivers}</dd></div>
              <div><dt className="inline font-medium">Délai indicatif : </dt><dd className="inline">{s.delay}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-xl bg-[var(--color-primary)] p-8 text-[var(--color-background)]">
        <h2 className="font-serif text-2xl">Notre produit : kheprIA Planning</h2>
        <p className="mt-2 text-[var(--color-background)]/80">SaaS planning + pointage + conventions collectives pour PME de 10 à 75 salariés. À partir de 29 €/mois.</p>
      </section>

      <div className="mt-12">
        <Link href="/contact" className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-primary)] px-5 py-3 text-[var(--color-background)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Parler de votre projet</Link>
      </div>
    </div>
  );
}
