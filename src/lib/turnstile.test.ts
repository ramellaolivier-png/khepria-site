import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile } from "./turnstile";

afterEach(() => vi.unstubAllGlobals());

describe("verifyTurnstile", () => {
  it("token vide → invalide", async () => {
    expect(await verifyTurnstile("", "secret", "1.2.3.4")).toBe(false);
  });
  it("success=true → valide", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4")).toBe(true);
  });
  it("success=false → invalide", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4")).toBe(false);
  });
  it("panne Cloudflare → fail-open (valide)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4")).toBe(true);
  });
  it("réponse non-200 Cloudflare → fail-open (valide)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4")).toBe(true);
  });
});
