import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { TurnstileScript } from "@/components/turnstile-script";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Parlons de votre projet IA. Agence locale à Limoges, Nouvelle-Aquitaine.",
};

export default function ContactPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <TurnstileScript />
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">Contact</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--color-primary)]">Parlons de votre projet</h1>
        <p className="mt-4 text-[var(--color-foreground)]/80">Un échange de 30 minutes, sans engagement. On vous répond sous 48 h.</p>
        <ul className="mt-6 space-y-2 text-sm text-[var(--color-foreground)]/70">
          <li><span aria-hidden="true">✉️</span> <a href={`mailto:${SITE.email}`} className="rounded underline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">{SITE.email}</a></li>
          <li><span aria-hidden="true">📍</span> {SITE.city} · {SITE.region}</li>
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
