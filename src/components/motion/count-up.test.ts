// @vitest-environment jsdom
/**
 * Unit tests for `parseCountValue` from count-up.tsx.
 *
 * The module uses `motion/react` (browser APIs) so we run in jsdom.
 */
import { describe, it, expect } from "vitest";
import { parseCountValue } from "./count-up";

describe("parseCountValue", () => {
  it('"12+" → prefix "", number 12, suffix "+"', () => {
    const result = parseCountValue("12+");
    expect(result.prefix).toBe("");
    expect(result.target).toBe(12);
    expect(result.suffix).toBe("+");
    expect(result.decimals).toBe(0);
  });

  it('"~30 h" → prefix "~", number 30, suffix " h"', () => {
    const result = parseCountValue("~30 h");
    expect(result.prefix).toBe("~");
    expect(result.target).toBe(30);
    expect(result.suffix).toBe(" h");
    expect(result.decimals).toBe(0);
  });

  it('"100 %" → prefix "", number 100, suffix " %"', () => {
    const result = parseCountValue("100 %");
    expect(result.prefix).toBe("");
    expect(result.target).toBe(100);
    expect(result.suffix).toBe(" %");
    expect(result.decimals).toBe(0);
  });

  it("purely non-numeric string → target null, prefix is full value, suffix empty", () => {
    const result = parseCountValue("aucun chiffre ici");
    expect(result.target).toBeNull();
    expect(result.prefix).toBe("aucun chiffre ici");
    expect(result.suffix).toBe("");
  });

  it("decimal value preserves decimal count", () => {
    const result = parseCountValue("99.5 %");
    expect(result.prefix).toBe("");
    expect(result.target).toBe(99.5);
    expect(result.suffix).toBe(" %");
    expect(result.decimals).toBe(1);
  });
});
