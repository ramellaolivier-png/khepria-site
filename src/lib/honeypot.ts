export const HONEYPOT_FIELD = "website";

export function isBot(body: Record<string, unknown>): boolean {
  const v = body[HONEYPOT_FIELD];
  return typeof v === "string" && v.trim().length > 0;
}
