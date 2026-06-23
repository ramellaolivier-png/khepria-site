import type { LeadPayload } from "./schema";

export type ForwardResult = { status: "ok" | "invalid" | "unavailable" };

export async function forwardLead(payload: LeadPayload, url: string): Promise<ForwardResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (res.ok) return { status: "ok" };
    if (res.status === 400) return { status: "invalid" };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
