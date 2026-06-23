import { test, expect } from "@playwright/test";

/**
 * Motion layer — home page section visibility + reduced-motion fallback.
 *
 * Selectors intentionally robust: role/heading + stable substrings, no
 * brittle exact-match on apostrophes or accented characters.
 */

const SERVICE_TITLES = [
  "Chatbot IA sur mesure",
  "Assistant IA interne",
  "Automatisation (n8n)",
  "Développement IA sur mesure",
  "Conseil / Stratégie IA",
] as const;

// ---------------------------------------------------------------------------
// Normal motion — all sections render
// ---------------------------------------------------------------------------
test("home — all sections visible (normal motion)", async ({ page }) => {
  await page.goto("/");

  // 1. Hero H1
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Des outils IA qui tournent en prod",
  );

  // 2. Stats section — 3 stat labels
  await expect(page.getByText("workflows en prod")).toBeVisible();
  await expect(page.getByText("/mois économisées")).toBeVisible();
  await expect(page.getByText("local & RGPD")).toBeVisible();

  // 3. Services — 5 service titles (heading level 3 inside the section)
  for (const title of SERVICE_TITLES) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  // 4. Dogfooding heading
  await expect(
    page.getByRole("heading", { name: /nos propres outils/i }),
  ).toBeVisible();

  // 5. Team text — stable substring avoiding apostrophe issues
  await expect(page.getByText(/Olivier.*Charles/)).toBeVisible();

  // 6. CTA final — heading + link
  await expect(
    page.getByRole("heading", { name: /Parlons de votre projet/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Nous contacter" }).first(),
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// Reduced-motion path — vertical-grid fallback, services visible, CTA works
// ---------------------------------------------------------------------------
test.describe("reduced-motion path", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("home — services visible in vertical-grid fallback", async ({ page }) => {
    await page.goto("/");

    // Hero still renders its H1 (static, no animation)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Des outils IA qui tournent en prod",
    );

    // Stats show the final target value immediately (no 0-flash, no animation)
    await expect(page.getByText("12+")).toBeVisible();

    // All 5 service cards are in the DOM as a vertical grid (no horizontal pin)
    for (const title of SERVICE_TITLES) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("reduced-motion — contact CTA navigates to /contact with form", async ({
    page,
  }) => {
    await page.goto("/");

    // Click the "Nous contacter" CTA from the final section
    await page.getByRole("link", { name: "Nous contacter" }).first().click();

    // Verify we landed on /contact and the form is present
    await expect(page).toHaveURL(/\/contact/);
    await expect(
      page.getByRole("heading", { name: /Parlons de votre projet/i }),
    ).toBeVisible();
    // The form is present (name field confirms it)
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
  });
});
