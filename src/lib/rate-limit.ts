// ⚠️ In-memory, mono-instance UNIQUEMENT. Ne pas scaler horizontalement
// sans migrer vers un store partagé (ex. Upstash Redis).
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  entry.count += 1;
  return { ok: entry.count <= limit };
}

export function __resetRateLimit() {
  store.clear();
}
