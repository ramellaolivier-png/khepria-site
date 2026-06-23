import { test, expect } from "@playwright/test";

/**
 * Phase 3 — WebGL deconstruction scene: bulletproof-fallback guarantees.
 *
 * The #1 priority is that the dogfooding section NEVER breaks because of the
 * WebGL scene. These tests assert the fallback contract from the plan:
 *   - under `prefers-reduced-motion: reduce`, the section renders the static
 *     placeholder captures and there is NO `<canvas>` in that section;
 *   - loading the homepage produces no console errors (the scene either mounts
 *     cleanly or quietly falls back — never throws to the error boundary in a
 *     way that logs an error).
 */

// Stable, accent/apostrophe-free anchor for the dogfooding section heading.
const DOGFOODING_HEADING = /nos propres outils/i;
// Substring of the static fallback placeholder captions.
const FALLBACK_CAPTION = /capture kheprIA Planning/i;

/**
 * Resolves the <section> element that contains the dogfooding heading, so we
 * can scope canvas/fallback assertions to that section only.
 */
function dogfoodingSection(page: import("@playwright/test").Page) {
  return page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: DOGFOODING_HEADING }) });
}

// ---------------------------------------------------------------------------
// Reduced-motion → static fallback, no canvas
// ---------------------------------------------------------------------------
test.describe("WebGL fallback — reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("dogfooding renders static fallback, no <canvas>", async ({ page }) => {
    await page.goto("/");

    const section = dogfoodingSection(page);
    await expect(section).toBeVisible();

    // The informative content (heading) is always present, outside the scene.
    await expect(
      section.getByRole("heading", { name: DOGFOODING_HEADING }),
    ).toBeVisible();

    // The static placeholder captures are in the DOM and readable.
    await expect(section.getByText(FALLBACK_CAPTION)).toBeAttached();

    // No WebGL canvas mounted under reduced motion.
    await expect(section.locator("canvas")).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// No console errors on the homepage (scene mounts cleanly or falls back quietly)
// ---------------------------------------------------------------------------
test("home — no console errors (WebGL scene is non-fatal)", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  await page.goto("/");

  // Dogfooding content present regardless of which branch (scene/fallback) ran.
  await expect(
    page.getByRole("heading", { name: DOGFOODING_HEADING }),
  ).toBeVisible();

  // Let the page settle first: the hero's lazy 3D object mounts on load and
  // swaps its subtree (fallback → R3F canvas), which can transiently detach
  // unrelated element handles. Waiting for networkidle lets that re-render land
  // before we touch the dogfooding heading.
  await page.waitForLoadState("networkidle");

  // Scroll the section into view to give the IntersectionObserver / lazy chunk
  // a chance to mount (in headless-with-WebGL) or stay on the fallback (no GL).
  // `toBeInViewport` auto-retries (re-resolving the locator), so it is robust
  // against any further re-render that would detach a one-shot scroll action.
  const dogHeading = page.getByRole("heading", { name: DOGFOODING_HEADING });
  await dogHeading.scrollIntoViewIfNeeded().catch(() => {});
  await expect(dogHeading).toBeInViewport();
  await page.waitForLoadState("networkidle");

  expect(errors).toEqual([]);
});
