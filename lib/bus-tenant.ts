/* ── Bus tenant resolution (pure, testable) ──────────────────────────────
   The persistence bus (app/api/bus/[store]) must serve each caller ONLY their
   own tenant's data. Cross-tenant isolation is decided here, in one pure
   function, so it is auditable and unit-testable without a live DB or auth:

     • Signed-in user  → ALWAYS their own tenant (from their User row), never the
                        Host header or a URL param. This is the guarantee that a
                        request authenticated as tenant A cannot read tenant B.
     • Anonymous + auth configured → confined to the public "demo" tenant. A real
                        tenant's data is never served without a session.
     • Anonymous + no-auth (local/self-hosted demo) → Host-based routing is
                        allowed, so acme.genveris.com serves the "acme" demo
                        tenant. The caller still validates the slug against the
                        tenant table before trusting it.

   Host-based tenant selection is therefore reachable ONLY in the no-auth demo
   mode — the exact hole that would otherwise let an unauthenticated request read
   a real tenant's data purely from its Host header. */

export type BusTenantInput = {
  authConfigured: boolean;
  sessionEmail?: string | null;   // present ⇒ a signed-in session
  userTenantId?: string | null;   // the signed-in user's own tenantId (from their User row)
  host?: string | null;           // Host / X-Forwarded-Host header
};

export type BusTenantResolution =
  | { source: "session"; tenantId: string; slug: null }
  | { source: "demo"; tenantId: null; slug: "demo" }
  | { source: "host"; tenantId: null; slug: string };

/* Reserved labels that are never a tenant slug (infra / brand hosts). */
const NON_TENANT_LABELS = new Set(["console", "www", "localhost", "genveris", "veris"]);

export function resolveBusTenant(input: BusTenantInput): BusTenantResolution {
  // A signed-in user is bound to their own tenant — nothing else can override it.
  if (input.authConfigured && input.sessionEmail && input.userTenantId) {
    return { source: "session", tenantId: input.userTenantId, slug: null };
  }
  // Auth is configured but the caller is anonymous → only the demo tenant.
  if (input.authConfigured) {
    return { source: "demo", tenantId: null, slug: "demo" };
  }
  // No-auth demo mode → Host-based routing is permitted (slug validated by caller).
  const host = String(input.host || "").split(":")[0];
  const label = host.split(".")[0];
  if (label && !NON_TENANT_LABELS.has(label)) {
    return { source: "host", tenantId: null, slug: label };
  }
  return { source: "demo", tenantId: null, slug: "demo" };
}
