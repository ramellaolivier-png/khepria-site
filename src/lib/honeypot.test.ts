import { describe, it, expect } from "vitest";
import { isBot, HONEYPOT_FIELD } from "./honeypot";

describe("honeypot", () => {
  it("champ vide = humain", () => {
    expect(isBot({ [HONEYPOT_FIELD]: "" })).toBe(false);
  });
  it("champ absent = humain", () => {
    expect(isBot({})).toBe(false);
  });
  it("champ rempli = bot", () => {
    expect(isBot({ [HONEYPOT_FIELD]: "http://spam.example" })).toBe(true);
  });
});
