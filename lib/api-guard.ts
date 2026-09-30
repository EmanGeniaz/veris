/* ── Shared API guards (security baseline · controls 1, 2, 5) ────────────
   The three things every route handler needs, in one place so they are
   applied the same way everywhere:

   - `limit(req, tier, scope)`: per-IP rate limit → 429 + Retry-After.
   - `parseJson(req, schema)`: strict schema validation → 400 on mismatch
     (malformed JSON, wrong types, over-long fields, unknown keys where the
     schema is strict). Nothing is "sanitised and continued".
   - `serverError(err, where)`: the ONLY way a handler reports an unexpected
     failure. The client gets a generic message and a request id; the full
     error (message + stack) is logged server-side under that id. Never put
     `e.message`, `String(e)`, stack traces, file paths, or Prisma/provider
     errors in a response body. */
import { NextResponse } from "next/server";
import type { ZodType, ZodTypeDef } from "zod";
import { clientIp, limitFor, rateLimit, rateLimitDisabled, type Tier } from "@/lib/rate-limit";

export function tooManyRequests(retryAfterSec: number, headers: Record<string, string> = {}) {
  return NextResponse.json(
    { ok: false, code: "rate_limited", error: `Too many requests. Try again in ${retryAfterSec} seconds.`, retryAfterSec },
    { status: 429, headers: { ...headers, "Retry-After": String(retryAfterSec) } },
  );
}

export async function limit(req: Request, tier: Tier, scope: string, headers: Record<string, string> = {}): Promise<NextResponse | null> {
  if (rateLimitDisabled()) return null;
  const r = await rateLimit(`${tier}:${scope}:${clientIp(req.headers)}`, limitFor(tier));
  return r.ok ? null : tooManyRequests(r.retryAfterSec, headers);
}

/* `error` is a human-readable sentence the UI can show as-is; `code` is the
   stable machine value. */
export function badRequest(issues?: { path: string; message: string }[], headers: Record<string, string> = {}) {
  const first = issues?.[0];
  const error = first ? (first.path === "(body)" ? first.message : `${first.path}: ${first.message}`) : "Invalid request.";
  return NextResponse.json({ ok: false, code: "invalid_request", error, ...(issues ? { issues } : {}) }, { status: 400, headers });
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; res: NextResponse };

/* Validation issues name the offending field and the rule it broke — they
   describe the caller's input, never server internals, so they are safe to
   return. */
export function validate<T>(schema: ZodType<T, ZodTypeDef, unknown>, input: unknown, headers: Record<string, string> = {}): Parsed<T> {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const issues = r.error.issues.slice(0, 10).map((i) => ({ path: i.path.join(".") || "(body)", message: i.message }));
  return { ok: false, res: badRequest(issues, headers) };
}

export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

/* Read the body with a hard byte cap: a declared Content-Length over the cap
   is refused before reading, and a chunked body is cut off the moment it
   crosses the cap, so an oversized payload is never fully buffered. */
async function readCapped(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
  return new TextDecoder().decode(buf);
}

export async function parseJson<T>(
  req: Request,
  schema: ZodType<T, ZodTypeDef, unknown>,
  opts: { maxBytes?: number; headers?: Record<string, string> } = {},
): Promise<Parsed<T>> {
  const headers = opts.headers ?? {};
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BODY_BYTES;
  const raw = await readCapped(req, maxBytes).catch(() => "");
  if (raw === null) {
    return { ok: false, res: NextResponse.json({ ok: false, code: "payload_too_large", error: "Request body is too large.", maxBytes }, { status: 413, headers }) };
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return { ok: false, res: badRequest([{ path: "(body)", message: "Malformed JSON" }], headers) }; }
  return validate(schema, body, headers);
}

/* Server-side only: the full error, keyed by a request id the client can quote. */
export function logError(err: unknown, where: string): string {
  const requestId = crypto.randomUUID();
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(JSON.stringify({ level: "error", requestId, where, name: e.name, message: e.message, stack: e.stack }));
  return requestId;
}

export function serverError(err: unknown, where: string, headers: Record<string, string> = {}) {
  const requestId = logError(err, where);
  return NextResponse.json({ ok: false, code: "internal_error", error: "Something went wrong. Please try again.", requestId }, { status: 500, headers });
}

/* Constant-time string compare for shared tokens/keys. Edge-safe (no
   node:crypto): the loop always runs over the longer input. */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}
