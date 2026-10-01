/* ── Plane entitlements (WS2 · #167) ─────────────────────────────────────
   Which separately-purchased planes a tenant owns. The authorization half of
   the Enforce seam: a tenant with GenVeris but not Veris Enforce gets
   governance + demo only (strictly-Enforce). This module is PURE — no database,
   no node APIs — so it is safe to import on the client and is unit-tested in
   isolation. The server reads the tenant's Entitlement rows (bound to the
   session, BL-01) and passes them here; a client never supplies entitlement.

   Default-empty is the invariant: no row → not entitled. A `suspended` row does
   not entitle. Only an `active` row for the plane does. */

/* The planes a tenant can be entitled to. "enforce" = Veris Enforce (the runtime
   engine); "discover" = Veris Discover (the estate scanner). GenVeris itself (the
   control plane) is not a plane — it is what everyone has. */
export const PLANES = ["enforce", "discover"] as const;
export type Plane = (typeof PLANES)[number];

export function isPlane(v: unknown): v is Plane {
  return typeof v === "string" && (PLANES as readonly string[]).includes(v);
}

/* A row's active status. Anything other than an explicit "suspended" is treated
   as active, so a legacy/empty status still entitles — but a plane is only ever
   entitled via a row that exists for it (default-empty). */
export type EntitlementStatus = "active" | "suspended";
export interface EntitlementRow {
  plane: string;
  status?: string | null;
}

/* True iff the status counts as granting access. */
export function isActive(status?: string | null): boolean {
  return (status ?? "active") !== "suspended";
}

/* Server-authoritative resolver. `rows` are the tenant's Entitlement rows
   (already bound to the session's tenant). Returns true only when an active row
   for `plane` exists. Null/empty rows → false (default-empty). */
export function entitledTo(rows: EntitlementRow[] | null | undefined, plane: Plane): boolean {
  if (!rows || rows.length === 0) return false;
  return rows.some((r) => r.plane === plane && isActive(r.status));
}

/* The set of planes a tenant is actively entitled to, de-duplicated and ordered
   by PLANES. Unknown plane strings in the rows are ignored. */
export function entitledPlanes(rows: EntitlementRow[] | null | undefined): Plane[] {
  if (!rows || rows.length === 0) return [];
  return PLANES.filter((p) => rows.some((r) => r.plane === p && isActive(r.status)));
}
