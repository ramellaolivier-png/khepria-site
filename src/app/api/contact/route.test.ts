import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { __resetRateLimit } from "@/lib/rate-limit";

const good = {
  first_name: "Marie", last_name: "Durand", company: "Durand SARL",
  email: "marie@durand.fr", phone: "", description: "Besoin d'automatisation.",
  consent: true, website: "",
};

function req(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "5.5.5.5" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  __resetRateLimit();
  process.env.PLATFORM_LEADS_URL = "https://p/api/leads";
  process.env.TURNSTILE_SECRET_KEY = "secret";
  // Turnstile valide + plateforme OK par défaut
  vi.stubGlobal("fetch", vi.fn(async (url: string) =>
    url.includes("siteverify")
      ? { ok: true, json: async () => ({ success: true }) }
      : { ok: true, status: 200 }
  ));
});
afterEach(() => vi.unstubAllGlobals());

describe("POST /api/contact", () => {
  it("lead valide → 200", async () => {
    const res = await POST(req({ ...good, "cf-turnstile-response": "tok" }));
    expect(res.status).toBe(200);
  });
  it("champ requis manquant → 400", async () => {
    const res = await POST(req({ ...good, first_name: "", "cf-turnstile-response": "tok" }));
    expect(res.status).toBe(400);
  });
  it("honeypot rempli → 200 silencieux sans forward", async () => {
    const fetchSpy = globalThis.fetch as ReturnType<typeof vi.fn>;
    const res = await POST(req({ ...good, website: "spam", "cf-turnstile-response": "tok" }));
    expect(res.status).toBe(200);
    // aucun appel à /api/leads
    expect(fetchSpy.mock.calls.some((c) => String(c[0]).includes("/api/leads"))).toBe(false);
  });
  it("rate-limit dépassé → 429", async () => {
    for (let i = 0; i < 5; i++) await POST(req({ ...good, "cf-turnstile-response": "tok" }));
    const res = await POST(req({ ...good, "cf-turnstile-response": "tok" }));
    expect(res.status).toBe(429);
  });
});
