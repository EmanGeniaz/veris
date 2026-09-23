/* ── Central request tenant guard (BL-01) ────────────────────────────────
   The one server-side helper every slug-scoped data route calls to get the
   tenant it is allowed to touch. It gathers the session + the signed-in user's
   own tenant slug, then delegates the actual decision to the pure, unit-tested
   `authoritativeTenant`. A client-supplied `?tenant` / body.tenant is passed in
   but is honoured only in no-auth demo mode — when auth is configured, the
   result is always the caller's own tenant (or demo for an anonymous caller),
   so it cannot be overridden to read another tenant's data.

   Node runtime only (uses Auth.js `auth()` + Prisma), like the other data
   routes. Best-effort lookups degrade to demo, never to another tenant. */
import { auth, authConfigured } from "@/auth";
import { db } from "@/lib/db";
import { authoritativeTenant } from "@/lib/bus-tenant";

export interface RequestTenant {
  slug: string;                                   // the tenant this request may touch
  identity: { name: string; email: string } | null;
  source: "session" | "demo" | "requested" | "host";
  authConfigured: boolean;
}

export async function resolveTenant(opts: { requestedTenant?: string | null; host?: string | null } = {}): Promise<RequestTenant> {
  const configured = authConfigured();
  let sessionEmail: string | null = null;
  let userTenantSlug: string | null = null;
  let identity: { name: string; email: string } | null = null;

  if (configured) {
    try {
      const session = await auth();
      if (session?.user?.email) {
        sessionEmail = session.user.email;
        identity = { name: session.user.name || session.user.email, email: session.user.email };
        const prisma = db();
        if (prisma) {
          const u = await prisma.user.findUnique({ where: { email: sessionEmail } });
          if (u?.tenantId) {
            const t = await prisma.tenant.findUnique({ where: { id: u.tenantId } });
            userTenantSlug = t?.slug ?? null;
          }
        }
      }
    } catch {
      // Any failure resolving identity degrades to the anonymous branch (demo),
      // never to a caller-named tenant.
      sessionEmail = null;
      userTenantSlug = null;
    }
  }

  const res = authoritativeTenant({
    authConfigured: configured,
    sessionEmail,
    userTenantSlug,
    requestedTenant: opts.requestedTenant,
    host: opts.host,
  });
  return { slug: res.slug, identity, source: res.source, authConfigured: configured };
}
