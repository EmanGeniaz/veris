/* ── Rate limiting + auth backoff (security baseline · control 1) ────────
   One limiter for every endpoint class, with thresholds read from env (never
   hardcoded at the call site):

     tier     default              used by
     auth     20 / 15 min per IP   sign-in, register, demo-login, admin tokens
     public   60 / 1 min  per IP   unauthenticated APIs (policy/inspect)
     user     120 / 1 min per IP   authenticated writes (bus, knowledge, gateway)
     global   600 / 1 min per IP   every /api/* request (middleware backstop)

   Override with RATE_LIMIT_<TIER>_MAX and RATE_LIMIT_<TIER>_WINDOW_SEC.

   Auth routes additionally get per-ACCOUNT exponential backoff (not a hard
   lockout): after AUTH_BACKOFF_FREE_ATTEMPTS consecutive failures each further
   attempt must wait AUTH_BACKOFF_BASE_MS · 2^(n − free), capped at
   AUTH_BACKOFF_MAX_MS. A success clears the counter.

   Storage is behind `RateLimitStore`. The default is in-process memory on
   globalThis, which is per-instance on serverless hosts (each warm Vercel
   instance counts separately), so it bounds bursts rather than giving a global
   guarantee. Plug a shared store (Redis/Upstash INCR + PEXPIRE) in with
   `setRateLimitStore` for a fleet-wide limit. Pure + edge-safe: no Node
   imports, so middleware can use it. */

export type Tier = "auth" | "public" | "user" | "global";
export interface Limit { max: number; windowMs: number }

export interface RateLimitStore {
  /** Increment `key` in a fixed window of `windowMs`; returns the new count and when the window resets. */
  incr(key: string, windowMs: number, now: number): Promise<{ count: number; resetAt: number }>;
  get(key: string, now: number): Promise<number | null>;
  set(key: string, value: number, ttlMs: number, now: number): Promise<void>;
  del(key: string): Promise<void>;
}

type Entry = { v: number; exp: number };

export class MemoryStore implements RateLimitStore {
  private map = new Map<string, Entry>();
  private ops = 0;
  constructor(private maxKeys = 50_000) {}

  private live(key: string, now: number): Entry | undefined {
    const e = this.map.get(key);
    if (e && e.exp <= now) { this.map.delete(key); return undefined; }
    return e;
  }
  private sweep(now: number) {
    // Amortised cleanup so an attacker rotating keys can't grow memory unbounded.
    if (++this.ops % 1000 !== 0 && this.map.size < this.maxKeys) return;
    for (const [k, e] of this.map) if (e.exp <= now) this.map.delete(k);
    while (this.map.size >= this.maxKeys) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }
  async incr(key: string, windowMs: number, now: number) {
    this.sweep(now);
    const e = this.live(key, now);
    if (e) { e.v += 1; return { count: e.v, resetAt: e.exp }; }
    const fresh = { v: 1, exp: now + windowMs };
    this.map.set(key, fresh);
    return { count: 1, resetAt: fresh.exp };
  }
  async get(key: string, now: number) { return this.live(key, now)?.v ?? null; }
  async set(key: string, value: number, ttlMs: number, now: number) { this.sweep(now); this.map.set(key, { v: value, exp: now + ttlMs }); }
  async del(key: string) { this.map.delete(key); }
}

const g = globalThis as unknown as { __vzRateStore?: RateLimitStore };
export function rateLimitStore(): RateLimitStore { return (g.__vzRateStore ||= new MemoryStore()); }
export function setRateLimitStore(store: RateLimitStore) { g.__vzRateStore = store; }

const DEFAULTS: Record<Tier, { max: number; windowSec: number }> = {
  auth:   { max: 20,  windowSec: 900 },
  public: { max: 60,  windowSec: 60 },
  user:   { max: 120, windowSec: 60 },
  global: { max: 600, windowSec: 60 },
};

function envInt(env: Record<string, string | undefined>, name: string, fallback: number): number {
  const n = Number(env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function limitFor(tier: Tier, env: Record<string, string | undefined> = process.env): Limit {
  const d = DEFAULTS[tier];
  const T = tier.toUpperCase();
  return {
    max: envInt(env, `RATE_LIMIT_${T}_MAX`, d.max),
    windowMs: envInt(env, `RATE_LIMIT_${T}_WINDOW_SEC`, d.windowSec) * 1000,
  };
}

export const rateLimitDisabled = (env: Record<string, string | undefined> = process.env) => env.RATE_LIMIT_DISABLED === "1";

export interface RateResult { ok: boolean; count: number; max: number; retryAfterSec: number }

export async function rateLimit(key: string, limit: Limit, now = Date.now(), store = rateLimitStore()): Promise<RateResult> {
  const { count, resetAt } = await store.incr(`rl:${key}`, limit.windowMs, now);
  const ok = count <= limit.max;
  return { ok, count, max: limit.max, retryAfterSec: ok ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)) };
}

/* ── Per-account exponential backoff ── */
export interface BackoffPolicy { free: number; baseMs: number; maxMs: number; memoryMs: number }

export function backoffPolicy(env: Record<string, string | undefined> = process.env): BackoffPolicy {
  return {
    free: envInt(env, "AUTH_BACKOFF_FREE_ATTEMPTS", 5),
    baseMs: envInt(env, "AUTH_BACKOFF_BASE_MS", 1000),
    maxMs: envInt(env, "AUTH_BACKOFF_MAX_MS", 15 * 60_000),
    memoryMs: envInt(env, "AUTH_BACKOFF_MEMORY_SEC", 3600) * 1000,
  };
}

export function backoffDelayMs(failures: number, p: BackoffPolicy): number {
  if (failures < p.free) return 0;
  return Math.min(p.maxMs, p.baseMs * 2 ** (failures - p.free));
}

/** Milliseconds the caller must still wait before another attempt on `account` (0 = go ahead). */
export async function backoffWaitMs(account: string, now = Date.now(), p = backoffPolicy(), store = rateLimitStore()): Promise<number> {
  const failures = (await store.get(`bo:n:${account}`, now)) ?? 0;
  const lastAt = (await store.get(`bo:t:${account}`, now)) ?? 0;
  return Math.max(0, lastAt + backoffDelayMs(failures, p) - now);
}

export async function recordAuthFailure(account: string, now = Date.now(), p = backoffPolicy(), store = rateLimitStore()) {
  const failures = ((await store.get(`bo:n:${account}`, now)) ?? 0) + 1;
  await store.set(`bo:n:${account}`, failures, p.memoryMs, now);
  await store.set(`bo:t:${account}`, now, p.memoryMs, now);
}

export async function clearAuthFailures(account: string, store = rateLimitStore()) {
  await store.del(`bo:n:${account}`);
  await store.del(`bo:t:${account}`);
}

/* Client IP for keying. Vercel sets x-vercel-forwarded-for / x-real-ip and
   overwrites x-forwarded-for, so these can't be spoofed by the client there.
   Behind a different proxy, make sure it overwrites (not appends to)
   x-forwarded-for. */
export function clientIp(headers: Headers): string {
  const first = (v: string | null) => (v ? v.split(",")[0].trim() : "");
  return first(headers.get("x-vercel-forwarded-for")) || first(headers.get("x-real-ip")) || first(headers.get("x-forwarded-for")) || "unknown";
}
