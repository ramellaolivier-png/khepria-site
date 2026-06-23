import { z } from "zod";

export const leadSchema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  company: z.string().trim().min(1, "Société requise"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().optional(),
  description: z.string().trim().min(1, "Message requis"),
  consent: z.literal(true, { message: "Consentement requis" }),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadPayload = {
  first_name: string; last_name: string; company: string;
  email: string; phone: string | undefined; description: string;
};

export function toLeadPayload(data: LeadInput): LeadPayload {
  return {
    first_name: data.first_name,
    last_name: data.last_name,
    company: data.company,
    email: data.email,
    phone: data.phone ? data.phone : undefined,
    description: data.description,
  };
}
