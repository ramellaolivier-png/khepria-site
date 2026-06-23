import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--color-dark)] text-[var(--color-background)]/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm sm:flex-row sm:justify-between">
        <span>{SITE.name} · {SITE.city}, {SITE.region}</span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/services" className="rounded focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Services</Link>
          <Link href="/a-propos" className="rounded focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">À propos</Link>
          <Link href="/contact" className="rounded focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Contact</Link>
          <Link href="/mentions-legales" className="rounded focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Mentions légales</Link>
          <Link href="/confidentialite" className="rounded focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
