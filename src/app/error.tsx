"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-3xl font-semibold text-[var(--color-primary)]">Une erreur est survenue</p>
      <p className="mt-4 text-[var(--color-foreground)]/70">Réessayez, ou écrivez-nous à olivier@khepria.pro.</p>
      <button onClick={reset} className="mt-8 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-[var(--color-background)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
        Réessayer
      </button>
      <div className="mt-3"><Link href="/" className="rounded text-sm underline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">Accueil</Link></div>
    </div>
  );
}
