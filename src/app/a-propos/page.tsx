import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "À propos",
  description: "kheprIA, agence IA locale à Limoges. Notre mission, nos valeurs, les fondateurs.",
};

const VALUES = [
  { t: "Simplicité d'abord", d: "Des livrables simples et opérationnels, pas des usines à gaz." },
  { t: "Transparence", d: "Vous voyez ce qu'on facture et pourquoi." },
  { t: "Ancrage local", d: "Limoges d'abord, puis la Nouvelle-Aquitaine." },
];

export default function AProposPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">À propos</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--color-primary)]">Rendre l&apos;IA opérationnelle pour les PME d&apos;ici</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-foreground)]/80">
        kheprIA est une agence IA basée à {SITE.city}. On ne vend pas des slides de conseil : on livre du code, des automatisations et des produits qui tournent en production. La meilleure preuve qu&apos;on sait faire, c&apos;est qu&apos;on utilise nous-mêmes nos propres outils.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.t} className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="font-serif text-lg text-[var(--color-primary)]">{v.t}</h2>
            <p className="mt-2 text-sm text-[var(--color-foreground)]/70">{v.d}</p>
          </div>
        ))}
      </div>

      <section aria-label="Les fondateurs" className="mt-12 grid gap-6 sm:grid-cols-2">
        <Founder name="Olivier" role="Co-fondateur technique" bio="Dev, IA, infra. Il construit les outils." />
        <Founder name="Charles de Clerfayt" role="Co-fondateur commercial" bio="Vente, admin, relation client." />
      </section>

      <p className="mt-12 text-sm italic text-[var(--color-foreground)]/60">
        « kheprIA » vient de Khepri, le scarabée égyptien du soleil levant et de la transformation — l&apos;idée d&apos;aider les entreprises à se réinventer.
      </p>
    </div>
  );
}

function Founder({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-black/10 bg-white p-6">
      <div className="h-16 w-16 shrink-0 rounded-full bg-[var(--color-secondary)]" aria-hidden="true" />
      <div>
        <p className="font-serif text-lg text-[var(--color-primary)]">{name}</p>
        <p className="text-sm text-[var(--color-accent)]">{role}</p>
        <p className="mt-1 text-sm text-[var(--color-foreground)]/70">{bio}</p>
      </div>
    </div>
  );
}
