/* Operator Enforce-connection config (WS2 · #167 sub-task 2). The platform-
   operator path that records WHERE a tenant's Veris Enforce engine is and the
   credential to reach it. Guarded by VZ_ONBOARD_TOKEN — the same server-
   authoritative boundary as tenant provisioning and entitlement grants.

   The gateway URL is SSRF-validated (https, non-private) before it is stored.
   The credential is sealed by lib/secrets (AES-256-GCM) and only the encrypted
   reference is persisted; the plaintext token and the sealed value are NEVER
   returned by this or any route. GET reports a masked status (URL + whether a
   credential is set, with a non-secret fingerprint). No-op without a database. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limit, parseJson, safeEqual, serverError } from "@/lib/api-guard";
import { enforceConnectionSchema } from "@/lib/api-schemas";
import { sealSecret, secretFingerprint, secretsConfigured } from "@/lib/secrets";
import { isSafeEnforceUrl, maskConnection } from "@/lib/enforce-connection";

const authorized = (req: NextRequest) => {
  const t = process.env.VZ_ONBOARD_TOKEN;
  if (!t) return false;
  const h = req.headers.get("x-onboard-token"), q = req.nextUrl.searchParams.get("token");
  return (h !== null && safeEqual(h, t)) || (q !== null && safeEqual(q, t));
};

export async function GET(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-enforce-connection");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const slug = (req.nextUrl.searchParams.get("tenant") || "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ ok: false, error: "tenant is required" }, { status: 400 });
  try {
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ ok: false, error: "unknown tenant" }, { status: 404 });
    const row = await prisma.enforceConnection.findUnique({ where: { tenantId: t.id } });
    return NextResponse.json({ ok: true, tenant: slug, secretsConfigured: secretsConfigured(), connection: maskConnection(row) });
  } catch (e) {
    return serverError(e, "admin.enforceConnection.get");
  }
}

export async function POST(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-enforce-connection");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const parsed = await parseJson(req, enforceConnectionSchema, { maxBytes: 8192 });
  if (!parsed.ok) return parsed.res;
  const { tenant: slug, action, gatewayUrl, token, actor } = parsed.data;
  try {
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ ok: false, error: "unknown tenant" }, { status: 404 });

    if (action === "clear") {
      await prisma.enforceConnection.deleteMany({ where: { tenantId: t.id } });
      return NextResponse.json({ ok: true, tenant: slug, connection: maskConnection(null) });
    }

    // action === "set": validate the gateway URL (SSRF guard) before storing.
    const urlCheck = isSafeEnforceUrl(gatewayUrl as string);
    if (!urlCheck.ok) return NextResponse.json({ ok: false, code: "unsafe_url", error: `gateway URL rejected: ${urlCheck.reason}` }, { status: 400 });

    // Seal the credential if one was supplied. A token with no secret store
    // configured is refused — we never persist a credential in the clear.
    let sealedToken: string | undefined;
    let credentialFp: string | undefined;
    if (token) {
      if (!secretsConfigured()) {
        return NextResponse.json({ ok: false, code: "secrets_unconfigured", error: "secret store not configured (VZ_SECRETS_KEY); cannot store a credential" }, { status: 400 });
      }
      const sealed = sealSecret(token);
      if (!sealed) return NextResponse.json({ ok: false, code: "seal_failed", error: "could not seal the credential" }, { status: 400 });
      sealedToken = sealed;
      credentialFp = secretFingerprint(token);
    }

    const by = actor || "operator";
    const row = await prisma.enforceConnection.upsert({
      where: { tenantId: t.id },
      // On update, only replace the credential when a new token was supplied.
      update: { gatewayUrl, configuredBy: by, ...(sealedToken ? { sealedToken, credentialFp } : {}) },
      create: { tenantId: t.id, gatewayUrl: gatewayUrl as string, configuredBy: by, sealedToken: sealedToken ?? null, credentialFp: credentialFp ?? null },
    });
    return NextResponse.json({ ok: true, tenant: slug, connection: maskConnection(row) });
  } catch (e) {
    return serverError(e, "admin.enforceConnection.set");
  }
}
