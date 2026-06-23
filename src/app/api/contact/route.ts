import { leadSchema, toLeadPayload } from "@/lib/schema";
import { isBot } from "@/lib/honeypot";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { forwardLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  // Coolify/Traefik overwrite x-forwarded-for, so [0] is the real client IP.
  // "0.0.0.0" is a shared-bucket fallback only reachable if the proxy is misconfigured.
  return fwd ? fwd.split(",")[0].trim() : "0.0.0.0";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!rateLimit(ip, RATE_LIMIT, WINDOW_MS).ok) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (typeof rawBody !== "object" || rawBody === null || Array.isArray(rawBody)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const body = rawBody as Record<string, unknown>;

  // Honeypot : on répond 200 silencieux (le bot croit avoir réussi), sans forward.
  if (isBot(body)) return Response.json({ ok: true });

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY manquante");
    return Response.json({ error: "service_unavailable" }, { status: 502 });
  }

  const token = typeof body["cf-turnstile-response"] === "string" ? (body["cf-turnstile-response"] as string) : "";
  const human = await verifyTurnstile(token, secret, ip);
  if (!human) return Response.json({ error: "captcha" }, { status: 400 });

  const url = process.env.PLATFORM_LEADS_URL;
  if (!url) {
    console.error("[contact] PLATFORM_LEADS_URL manquante");
    return Response.json({ error: "service_unavailable" }, { status: 502 });
  }

  const result = await forwardLead(toLeadPayload(parsed.data), url);
  if (result.status === "ok") return Response.json({ ok: true });
  if (result.status === "invalid") return Response.json({ error: "invalid" }, { status: 400 });
  return Response.json({ error: "service_unavailable" }, { status: 502 });
}
