import Link from "next/link";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--color-background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="rounded font-serif text-lg font-semibold text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
          khepr<span className="text-[var(--color-accent)]">IA</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded text-[var(--color-primary)]/80 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-primary)] px-4 py-2 text-[var(--color-background)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
            Parler de votre projet
          </Link>
        </nav>
      </div>
    </header>
  );
}
