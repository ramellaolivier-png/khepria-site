const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch(SITEVERIFY, { method: "POST", body: form });
    if (!res.ok) {
      console.warn("[turnstile] siteverify non-200, fail-open");
      return true; // fail-open : panne Cloudflare → on laisse passer (honeypot + rate-limit en filet)
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    console.warn("[turnstile] siteverify injoignable, fail-open");
    return true; // fail-open
  }
}
