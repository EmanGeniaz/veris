/* Demo-login verification — server-side only.
 *
 * Why this exists: the demo password used to be a string literal in the client
 * bundle (anyone could "View Source" and read it). Env vars don't fix that on
 * their own — only NEXT_PUBLIC_* vars reach the browser, and those STILL ship in
 * the bundle. The only way to keep the secret out of the client is to check it on
 * the server. This route does exactly that: the password never leaves the server.
 *
 * Set DEMO_PASSWORD in your environment (.env). There is deliberately NO
 * fallback: a default password in source is a published password (security
 * baseline · control 3). Without DEMO_PASSWORD the gate refuses every attempt.
 *
 * Brute-force protection (control 1): a per-IP auth-tier rate limit plus
 * exponential backoff per client after repeated wrong passwords. */
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { limit, parseJson, tooManyRequests } from "@/lib/api-guard";
import { demoLoginSchema } from "@/lib/api-schemas";
import { backoffWaitMs, clearAuthFailures, clientIp, rateLimitDisabled, recordAuthFailure } from "@/lib/rate-limit";

// Constant-time compare so we don't leak the password length/prefix via timing.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const limited = await limit(req, "auth", "demo-login");
  if (limited) return limited;
  const who = `demo-login:${clientIp(req.headers)}`;
  const wait = rateLimitDisabled() ? 0 : await backoffWaitMs(who);
  if (wait > 0) return tooManyRequests(Math.ceil(wait / 1000));

  const parsed = await parseJson(req, demoLoginSchema, { maxBytes: 2048 });
  if (!parsed.ok) return parsed.res;

  const expected = process.env.DEMO_PASSWORD;
  const ok = !!expected && safeEqual(parsed.data.password, expected);
  if (ok) await clearAuthFailures(who);
  else await recordAuthFailure(who);
  return NextResponse.json({ ok });
}
