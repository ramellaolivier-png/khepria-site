import { describe, it, expect } from "vitest";
import { leadSchema, toLeadPayload } from "./schema";

const valid = {
  first_name: "Marie", last_name: "Durand", company: "Boulangerie Durand",
  email: "marie@durand.fr", phone: "", description: "On aimerait automatiser nos plannings.",
  consent: true,
};

describe("leadSchema", () => {
  it("accepte un lead valide", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });
  it("rejette si first_name manquant", () => {
    expect(leadSchema.safeParse({ ...valid, first_name: "" }).success).toBe(false);
  });
  it("rejette un email invalide", () => {
    expect(leadSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });
  it("rejette si consentement non donné", () => {
    expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("toLeadPayload ne garde que les champs plateforme", () => {
    const data = leadSchema.parse(valid);
    expect(toLeadPayload(data)).toEqual({
      first_name: "Marie", last_name: "Durand", company: "Boulangerie Durand",
      email: "marie@durand.fr", phone: undefined, description: "On aimerait automatiser nos plannings.",
    });
  });
});
