/* Self-serve user registration — creates a real, DB-backed account with a
 * scrypt-hashed password, so a registered user can then sign in through
 * Auth.js Credentials. Activates only when real auth is configured
 * (AUTH_SECRET + DATABASE_URL); without it, it returns a clear setup message
 * rather than pretending to create an account. */
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authConfigured, hashPassword } from "@/auth";
import { db } from "@/lib/db";
import { resolveRegistrationRole } from "@/lib/identity";
import { limit, parseJson, serverError } from "@/lib/api-guard";
import { registerSchema } from "@/lib/api-schemas";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";

export async function POST(req: Request) {
  // Signup is an auth route: strictest tier, per IP (security baseline · control 1).
  const limited = await limit(req, "auth", "register");
  if (limited) return limited;
  // Real auth off → don't fake it; tell the operator exactly what to configure.
  if (!authConfigured()) {
    return NextResponse.json(
      { ok: false, needsSetup: true, error: "Registration needs the production database — set AUTH_SECRET and DATABASE_URL, then run the Prisma migration." },
      { status: 503 },
    );
  }
  const parsed = await parseJson(req, registerSchema, { maxBytes: 4096 });
  if (!parsed.ok) return parsed.res;
  const { name, email, password } = parsed.data;
  const org = parsed.data.org ?? "";
  /* Least-privilege identity (BL-02): a self-registered account is ALWAYS created
     at the least-privilege default — the caller's requested role is ignored, so
     `role:"ceo"` in the body cannot escalate. Privileged roles are granted by an
     administrator, never by self-registration. */
  const role = resolveRegistrationRole(parsed.data.role);

  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });

  try {
    if (await prisma.user.findUnique({ where: { email } })) {
      // Generic-enough: only reveals that this address can't be registered again.
      return NextResponse.json({ ok: false, error: "An account with that email already exists." }, { status: 409 });
    }
    // A registrant's workspace is their org (or their email domain) — created clean.
    const slug = slugify(org || email.split("@")[1] || name);
    const tenant = await prisma.tenant.upsert({ where: { slug }, update: {}, create: { slug, name: org || slug, mode: "clean" } });
    const salt = randomBytes(16).toString("hex");
    await prisma.user.create({ data: { email, name, role, tenantId: tenant.id, passwordHash: hashPassword(password, salt) } });
    return NextResponse.json({ ok: true, email, role, tenant: tenant.slug });
  } catch (e) {
    return serverError(e, "register");
  }
}
