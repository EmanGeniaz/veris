/* Self-serve user registration — creates a real, DB-backed account with a
 * scrypt-hashed password, so a registered user can then sign in through
 * Auth.js Credentials. Activates only when real auth is configured
 * (AUTH_SECRET + DATABASE_URL); without it, it returns a clear setup message
 * rather than pretending to create an account. */
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authConfigured, hashPassword } from "@/auth";
import { db } from "@/lib/db";

const ROLES = new Set(["ceo", "cfo", "cio", "coo", "caio", "ciso", "chro", "cdpo", "cgo", "cro", "legal", "employee", "manager"]);
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";

export async function POST(req: Request) {
  // Real auth off → don't fake it; tell the operator exactly what to configure.
  if (!authConfigured()) {
    return NextResponse.json(
      { ok: false, needsSetup: true, error: "Registration needs the production database — set AUTH_SECRET and DATABASE_URL, then run the Prisma migration." },
      { status: 503 },
    );
  }
  let body: { name?: string; email?: string; password?: string; org?: string; role?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const org = String(body.org || "").trim();
  const role = ROLES.has(String(body.role)) ? String(body.role) : "employee";

  if (!name || !email || !password) return NextResponse.json({ ok: false, error: "Name, email and password are required." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });

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
  } catch {
    return NextResponse.json({ ok: false, error: "Could not create the account." }, { status: 500 });
  }
}
