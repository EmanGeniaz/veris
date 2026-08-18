/* Demo-login verification — server-side only.
 *
 * Why this exists: the demo password used to be a string literal in the client
 * bundle (anyone could "View Source" and read it). Env vars don't fix that on
 * their own — only NEXT_PUBLIC_* vars reach the browser, and those STILL ship in
 * the bundle. The only way to keep the secret out of the client is to check it on
 * the server. This route does exactly that: the password never leaves the server.
 *
 * Set DEMO_PASSWORD in your environment (.env) to override the fallback. The
 * fallback keeps the demo working out-of-the-box; it lives in SERVER code, which
 * is never shipped to the browser. */
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "govern-with-certainty";

// Constant-time compare so we don't leak the password length/prefix via timing.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const ok = typeof password === "string" && safeEqual(password, DEMO_PASSWORD);
  return NextResponse.json({ ok });
}
