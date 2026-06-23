import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales — kheprIA SAS, Limoges.",
};

export default function MentionsPage() {
  return (
    <article className="prose-sm max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold text-[var(--color-primary)]">Mentions légales</h1>
      <h2 className="mt-6 font-medium">Éditeur</h2>
      <p>{SITE.name} SAS — {SITE.city}, {SITE.region}. SIRET : à compléter. Contact : {SITE.email}.</p>
      <h2 className="mt-6 font-medium">Directeur de la publication</h2>
      <p>Olivier (co-fondateur).</p>
      <h2 className="mt-6 font-medium">Hébergement</h2>
      <p>VPS Hostinger (déploiement Coolify). Hostinger International Ltd.</p>
      <h2 className="mt-6 font-medium">Propriété intellectuelle</h2>
      <p>L&apos;ensemble du contenu de ce site est la propriété de {SITE.name}, sauf mention contraire.</p>
    </article>
  );
}
