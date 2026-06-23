import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: { PLATFORM_LEADS_URL: "http://localhost:3000/api/health", TURNSTILE_SECRET_KEY: "test" },
  },
});
