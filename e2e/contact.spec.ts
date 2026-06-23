import { test, expect } from "@playwright/test";

test("formulaire de contact — succès (api mockée)", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );
  await page.goto("/contact");
  await page.fill('input[name="first_name"]', "Marie");
  await page.fill('input[name="last_name"]', "Durand");
  await page.fill('input[name="company"]', "Durand SARL");
  await page.fill('input[name="email"]', "marie@durand.fr");
  await page.fill('textarea[name="description"]', "Besoin d'automatisation.");
  await page.check('input[name="consent"]');
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("Merci !")).toBeVisible();
});

test("formulaire de contact — erreur serveur affiche le repli email", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 502, body: "{}" })
  );
  await page.goto("/contact");
  await page.fill('input[name="first_name"]', "Marie");
  await page.fill('input[name="last_name"]', "Durand");
  await page.fill('input[name="company"]', "Durand SARL");
  await page.fill('input[name="email"]', "marie@durand.fr");
  await page.fill('textarea[name="description"]', "Test");
  await page.check('input[name="consent"]');
  await page.getByRole("button", { name: "Envoyer" }).click();
  // The error state renders a <p role="alert"> containing the fallback email.
  // Filter alerts to the one containing the email text to avoid the Next.js route announcer.
  await expect(
    page.getByRole("alert").filter({ hasText: "olivier@khepria.pro" })
  ).toBeVisible();
});
