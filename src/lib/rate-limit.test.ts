import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimit());
  it("autorise sous la limite", () => {
    for (let i = 0; i < 5; i++) expect(rateLimit("1.2.3.4", 5, 60_000).ok).toBe(true);
  });
  it("bloque au-delà de la limite", () => {
    for (let i = 0; i < 5; i++) rateLimit("1.2.3.4", 5, 60_000);
    expect(rateLimit("1.2.3.4", 5, 60_000).ok).toBe(false);
  });
  it("isole par IP", () => {
    for (let i = 0; i < 5; i++) rateLimit("1.1.1.1", 5, 60_000);
    expect(rateLimit("9.9.9.9", 5, 60_000).ok).toBe(true);
  });
});
