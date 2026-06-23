import { describe, it, expect, vi, afterEach } from "vitest";
import { forwardLead } from "./leads";

const payload = { first_name: "A", last_name: "B", company: "C", email: "a@b.fr", phone: undefined, description: "x" };

afterEach(() => vi.unstubAllGlobals());

describe("forwardLead", () => {
  it("2xx → ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    expect(await forwardLead(payload, "https://p/api/leads")).toEqual({ status: "ok" });
  });
  it("400 plateforme → invalid", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    expect(await forwardLead(payload, "https://p/api/leads")).toEqual({ status: "invalid" });
  });
  it("5xx → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    expect(await forwardLead(payload, "https://p/api/leads")).toEqual({ status: "unavailable" });
  });
  it("réseau down → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    expect(await forwardLead(payload, "https://p/api/leads")).toEqual({ status: "unavailable" });
  });
});
