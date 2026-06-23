/**
 * Static fallback for the dogfooding media zone.
 *
 * This is the **bulletproof** path: it renders the two placeholder product
 * captures with no JS, no WebGL, and no animation dependency. It is shown
 * whenever the WebGL scene is not eligible (reduced-motion, viewport `< lg`,
 * WebGL unavailable) AND while the lazy three.js chunk is loading or if it
 * fails to load.
 *
 * Intentionally a plain server-compatible component (no `"use client"`, no
 * hooks): it must render identically on the server, during hydration, and as
 * the `next/dynamic` loading state. The captures are `aria-hidden` decorative
 * placeholders — the informative content (title + text) lives in the parent
 * section, outside this component.
 */
export function StaticFallback() {
  return (
    <div className="dogfooding-captures mt-6 grid gap-4 sm:grid-cols-2">
      <div
        aria-hidden="true"
        className="flex h-40 items-center justify-center rounded-lg bg-black/20 text-sm text-[var(--color-background)]/50"
      >
        [ capture kheprIA Planning ]
      </div>
      <div
        aria-hidden="true"
        className="flex h-40 items-center justify-center rounded-lg bg-black/20 text-sm text-[var(--color-background)]/50"
      >
        [ capture Dashboard CRM ]
      </div>
    </div>
  );
}
