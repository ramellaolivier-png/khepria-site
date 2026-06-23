import { test, expect } from "@playwright/test";

test("navigation entre les pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const [link, heading] of [
    ["Services", "Des services concrets"],
    // À propos: H1 contains an apostrophe — match a safe substring instead
    ["À propos", "Rendre"],
    ["Contact", "Parlons de votre projet"],
  ] as const) {
    // scope to the first <nav> (header), not the footer nav
    await page.getByRole("navigation").first().getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
  }
});

test("pages légales accessibles", async ({ page }) => {
  await page.goto("/confidentialite");
  await expect(
    page.getByRole("heading", { name: "Politique de confidentialité" })
  ).toBeVisible();
  await page.goto("/mentions-legales");
  await expect(page.getByRole("heading", { name: "Mentions légales" })).toBeVisible();
});
