import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-5xl font-semibold text-[var(--color-primary)]">404</p>
      <p className="mt-4 text-[var(--color-foreground)]/70">Cette page n&apos;existe pas (ou plus).</p>
      <Link href="/" className="mt-8 inline-block rounded-lg bg-[var(--color-primary)] px-5 py-3 text-[var(--color-background)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
