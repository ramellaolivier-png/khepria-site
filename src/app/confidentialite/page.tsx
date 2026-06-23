import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <article className="max-w-2xl space-y-4 text-[var(--color-foreground)]/85">
      <h1 className="font-serif text-3xl font-semibold text-[var(--color-primary)]">Politique de confidentialité</h1>

      <h2 className="font-medium text-[var(--color-primary)]">Responsable de traitement</h2>
      <p>{SITE.name} SAS, {SITE.city} ({SITE.region}). Contact : {SITE.email}. SIRET : à compléter au lancement.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Finalité &amp; base légale</h2>
      <p>Les données du formulaire de contact servent uniquement à vous recontacter suite à votre demande. Base légale : votre consentement (case à cocher) et notre intérêt légitime à répondre à une sollicitation commerciale.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Données collectées</h2>
      <p>Prénom, nom, société, email, téléphone (optionnel) et le contenu de votre message.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Destinataires &amp; sous-traitants</h2>
      <ul className="list-disc pl-6">
        <li><strong>Supabase</strong> — hébergement de la base de données (CRM interne).</li>
        <li><strong>Resend</strong> — envoi des emails de notification.</li>
        <li><strong>Cloudflare Turnstile</strong> — protection anti-spam du formulaire.</li>
      </ul>
      <p>Certains de ces sous-traitants peuvent traiter des données hors de l&apos;Union européenne ; des garanties appropriées (clauses contractuelles types) encadrent ces transferts.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Durée de conservation</h2>
      <p>Les demandes de contact sont conservées 3 ans à compter du dernier contact, puis supprimées.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Vos droits</h2>
      <p>Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition. Pour l&apos;exercer : {SITE.email}.</p>

      <h2 className="font-medium text-[var(--color-primary)]">Anti-spam</h2>
      <p>Ce site utilise Cloudflare Turnstile pour distinguer les humains des robots, sans recourir à des cookies publicitaires.</p>
    </article>
  );
}
