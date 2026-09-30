import { NextResponse } from "next/server";
import { handlers, authConfigured } from "@/auth";
import { limit, tooManyRequests } from "@/lib/api-guard";
import { backoffWaitMs, rateLimitDisabled } from "@/lib/rate-limit";

const disabled = () => NextResponse.json({ enabled: false }, { status: 404 });

/* Credentials sign-in is the brute-force target (security baseline · control 1):
   a per-IP auth-tier limit, plus per-account exponential backoff after repeated
   failures (recorded in auth.ts `authorize`). Both answer 429 + Retry-After
   before the password is ever checked. Other Auth.js calls (session, csrf,
   providers, OAuth callbacks) pass straight through. */
async function credentialsGate(req: Request): Promise<Response | null> {
  if (!new URL(req.url).pathname.endsWith("/callback/credentials")) return null;
  const limited = await limit(req, "auth", "signin");
  if (limited) return limited;
  if (rateLimitDisabled()) return null;
  let email = "";
  try { email = String((await req.clone().formData()).get("email") ?? "").trim().toLowerCase(); } catch { /* not form-encoded: authorize still applies backoff */ }
  if (!email) return null;
  const wait = await backoffWaitMs(`signin:${email}`);
  return wait > 0 ? tooManyRequests(Math.ceil(wait / 1000)) : null;
}

export const GET = (req: Request, ctx: unknown) => authConfigured() ? handlers.GET(req as never) : disabled();
export const POST = async (req: Request, ctx: unknown) => {
  if (!authConfigured()) return disabled();
  const gated = await credentialsGate(req);
  return gated ?? handlers.POST(req as never);
};
