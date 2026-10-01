# WS2 sub-task 1 — tenant/org model gap analysis

**Status:** Informs the sub-task 1 build · **Owner:** Platform / Architecture · **Issue:** #167
**Basis:** owner decisions on the WS2 scope (`docs/design/WS2-enforce-entitlement-scope.md` §7) —
normalized `Entitlement` table + a small tenant-level plan reference; **per-tenant**
entitlements. This note records what the *current* data model actually is (not what the
scope doc assumed) and how that shapes the build, as the owner asked: _"inspect the current
repository and produce a gap analysis first — the existing tenant/organization model could
materially affect the entitlement design."_

---

## 1 · What the codebase actually has today

| Concept | Reality in the code | Where |
|---|---|---|
| **Tenant** | The single persisted isolation **and** ownership boundary. Every data model is keyed by `tenantId`; `User.tenantId → Tenant`. | `prisma/schema.prisma` |
| **Organization** | **Does not exist as a persisted entity.** "Org" and "tenant" are used interchangeably — the super-admin console literally maps each "org" to a tenant (`SA_ORGS` carry `{id, slug}`). | `lib/superadmin.js` |
| **Subscription / plan** | **Not persisted.** A `plan` label (`"Enterprise" / "Growth" / "Pilot"`) exists only as client-side demo seed state; `Tenant` has no `plan` column. | `lib/superadmin.js` (`SA_PLANS`, `SA_ORGS[].plan`) |
| **Entitlement** | **No concept at all.** Nothing records which planes a tenant owns. | — |
| **Grant authority** | Two precedents: (a) tenant provisioning is a platform-operator action guarded by `VZ_ONBOARD_TOKEN` (`safeEqual`, `auth`-tier limit); (b) per-tenant RBAC overrides are **persisted + enforced** via the normalized `RbacGrant` table (`@@unique([tenantId, role, module])`, upsert through a guarded route). The super-admin "operator" tier that "provisions orgs / enables modules" is **client-side demo state**, not persisted or enforced. | `app/api/admin/tenants/route.ts`, `prisma/schema.prisma` (`RbacGrant`), `lib/superadmin.js` |
| **Server-authoritative tenant binding (BL-01)** | `resolveTenant` binds the tenant to the session; a client `?tenant`/`body.tenant` is honoured **only** in no-auth demo mode, never when auth is configured. | `lib/tenant-guard.ts` |

---

## 2 · How this changes the design

1. **No Organization model → entitlements are per-Tenant, and we do *not* introduce an
   Organization entity.** The owner's §3 split (tenant entitlements vs. org-level authz /
   resource ownership) cannot be realised today because there is no separate Organization —
   the Tenant already *is* the org. Introducing one would be a major, cross-cutting schema +
   authorization change (every model re-keyed), which the autonomy rules reserve for explicit
   approval and which the owner did **not** ask for here. So sub-task 1 attaches entitlements
   to **`Tenant`**, matching both the real model and the "Tenant-level entitlements" decision.
   If org-within-tenant structure is ever needed, it is its own workstream; the normalized
   `Entitlement` table (keyed by `tenantId`) does not block adding an `organizationId` later.

2. **No persisted plan → add a *small* reference, kept separate from authorization.** Per the
   decision ("normalized Entitlement table, **with a small tenant-level subscription or plan
   reference**"), we add a nullable `Tenant.plan` column — a commercial **label**, not an
   authorization input. Authorization to a plane is decided **only** by `Entitlement` rows
   (default-empty, strictly-Enforce). This keeps the two concepts the owner separated —
   *subscription = commercial agreement*, *entitlement = product capability* — from being
   conflated. We deliberately do **not** build a billing/Subscription aggregate (the scope doc
   puts billing out of scope); a column is the smallest honest reference.

3. **Model the grant like `RbacGrant`, authorise like `/api/admin/tenants`.** The normalized
   `Entitlement` table mirrors `RbacGrant` (unique per `(tenantId, plane)`, carries
   who/when). Granting is a platform-operator action guarded by `VZ_ONBOARD_TOKEN` — the
   established, server-authoritative admin path — operating on an explicitly named tenant
   (not session-bound), exactly as tenant provisioning does.

4. **Reading entitlement stays session-bound (BL-01).** A surface asking "is my tenant
   entitled to Enforce?" reads through `resolveTenant`, so a client can only ever see its own
   tenant's entitlements and can never supply an entitlement flag. This is what makes
   **client-cannot-self-grant** true end-to-end: the write path needs the operator token; the
   read path never trusts the client.

---

## 3 · Scope boundary for sub-task 1

**In:** `Entitlement` model + `Tenant.plan`; pure server-authoritative resolver
(`entitledTo`); operator grant/revoke path; session-bound read; tests (grant, default-empty,
suspended, tenant isolation, client-cannot-self-grant) + end-to-end persistence.

**Out (later sub-tasks / separate approval):** the Enforce `/admin/api` read contract and any
live adapter (§7.2 — not inventable from this session); the credential-management abstraction
(§7.4, sub-task 2); flipping any surface to live-from-Enforce (sub-task 3); and any
Organization entity (not requested; major change).
