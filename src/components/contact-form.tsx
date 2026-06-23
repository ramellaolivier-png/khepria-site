"use client";
import { useRef, useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { SITE } from "@/lib/site";

type State = "idle" | "loading" | "success" | "invalid" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const submitting = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setState("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.consent = fd.get("consent") === "on";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setState("success"); }
      else if (res.status === 400) setState("invalid");
      else setState("error");
    } catch {
      setState("error");
    } finally {
      submitting.current = false;
    }
  }

  if (state === "success") {
    return (
      <div role="status" aria-live="polite" className="rounded-xl border border-[var(--color-accent)] bg-white p-6">
        <p className="font-serif text-xl text-[var(--color-primary)]">Merci !</p>
        <p className="mt-2 text-[var(--color-foreground)]/70">On revient vers vous sous 48 h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first_name" label="Prénom *" />
        <Field name="last_name" label="Nom *" />
      </div>
      <Field name="company" label="Société *" />
      <Field name="email" label="Email *" type="email" />
      <Field name="phone" label="Téléphone" />
      <label className="grid gap-1 text-sm">
        <span>Votre projet *</span>
        <textarea name="description" required rows={5} className="rounded-lg border border-black/10 bg-white p-3 outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2" />
      </label>
      {/* Widget Turnstile injecté ici (champ cf-turnstile-response) — voir Task 18 */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          aria-label="Vérification anti-spam (Cloudflare Turnstile)"
        />
      )}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2" />
        <span>J&apos;accepte d&apos;être recontacté(e) par kheprIA. Voir la <a href="/confidentialite" className="rounded underline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">politique de confidentialité</a>.</span>
      </label>
      {state === "invalid" && <p role="alert" className="text-sm text-red-700">Vérifiez les champs obligatoires.</p>}
      {state === "error" && <p role="alert" className="text-sm text-red-700">Une erreur est survenue. Réessayez ou écrivez-nous à {SITE.email}.</p>}
      <button type="submit" disabled={state === "loading"} className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-[var(--color-background)] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2">
        {state === "loading" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  const required = label.includes("*");
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input name={name} type={type} required={required} className="rounded-lg border border-black/10 bg-white p-3 outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2" />
    </label>
  );
}
