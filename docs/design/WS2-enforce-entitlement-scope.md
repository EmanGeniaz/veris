# WS2 — Veris Enforce entitlement seam (scope)

**Status:** Scope for approval · **Owner:** Platform / Architecture · **Issue:** #167
**Basis:** the ratified three-plane carve-up + **strictly-Enforce** decision
(`docs/design/enforce-porting-brief.md` §4), the Evidence Fabric (#166, delivered),
and the BL-04 live-first pattern already shipped on six Enforce surfaces.

> **Gate.** This touches an **entitlement / security boundary** (who may see live
> enforcement, and a per-tenant connection to an external engine). Per CLAUDE.md,
> implementation begins only on explicit human approval — **this doc is the
> approval artifact** (same precedent as the WS1 scope). It also raises decisions
> only the owner can make (§7); those must be answered before build.

---

## 1 · Problem

Veris Enforce is a separately-purchased product (the Go runtime engine). When a
customer buys it, it must **activate inside GenVeris** — GenVeris stays the single
pane of glass. Today there is **no entitlement concept at all**: the `Tenant` model
has only `mode: "demo" | "clean"` (`prisma/schema.prisma`), and every GenVeris
Enforce surface reads its "live" data from **GenVeris's own** audit chain
(`/api/enforce/*` → `lib/*-live.ts`), not from Enforce. So there is nothing that
(a) records whether a tenant owns Enforce, or (b) switches a surface's live source
to the Enforce engine when they do.

Per **strictly-Enforce**: a customer with GenVeris but **not** Enforce gets
**governance + demo only** — GenVeris does no live runtime enforcement on its own.
The entitlement seam is the switch that makes that true.

---

## 2 · What already exists (build on, don't rebuild)

- **The live-vs-demo switch (BL-04).** Each `/api/enforce/*` route resolves the
  tenant (`resolveTenant`, BL-01), reads live rows, and stamps a mode via
  `lib/telemetry-source.ts` (`telemetryMode`, `pickTelemetry`); the surface renders
  live-first with an honest demo fallback and a `TelemetryBadge`. **The seam adds a
  gate in front of the source selection — it does not touch the surfaces' render
  contract.**
- **The Evidence Fabric (#166).** The canonical sink Enforce emits into.
  `fabricAppend` (idempotent, hash-chained, human-wins), `auditToCanonical` already
  adapts governed audit decisions into canonical `Finding` entities, and
  `/api/fabric` serves the canonical view. All three writers now exist: Discover
  (#176), GenVeris (#197); Enforce is the one this workstream wires.
- **The Enforce contract.** Per the porting brief §1, every Enforce control
  **emits a governed decision + audit event** (decision, reason-code, metadata —
  never raw content) through its `/admin/api` + audit. That is the telemetry
  GenVeris consumes.

---

## 3 · The entitlement model

A per-tenant record of which **planes** a tenant owns.

- **Shape:** an `entitlements` set per tenant — e.g. `{"enforce","discover"}`.
  Stored server-side (see §7 for where: a `Tenant.entitlements` column vs a small
  `Entitlement` table). Default **empty** — no plane is owned until granted.
- **Resolution:** a pure, testable `entitledTo(tenant, "enforce")`, resolved
  **server-side only** from the session-bound tenant (never a client-supplied
  flag). Mirrors the BL-01 discipline: a client cannot grant itself Enforce.
- **Granting:** an administrator/superadmin action (out of band, like role
  elevation in `lib/identity.ts`) — not self-serve. Out of scope to build the
  billing that sets it; in scope to read it.

---

## 4 · The seam — three honest states

For every Enforce surface, the data source is chosen by entitlement **then**
connection, and always badged truthfully:

| State | Condition | Surface shows | Badge |
|---|---|---|---|
| **Live-from-Enforce** | entitled **and** an Enforce instance is connected | live telemetry read from the **Veris Enforce gateway** (`/admin/api/*` + its audit) | **Live** |
| **Entitled, not connected** | entitled, no reachable instance | honest "Enforce entitled — awaiting engine connection" empty state (no fabricated data) | **Demo** (labelled awaiting-connection) |
| **Not entitled** | tenant does not own Enforce | governance-only view + demo fallback; **no live enforcement** (strictly-Enforce) | **Demo** |

Key change from today: when **entitled + connected**, a surface's "live" source is
the **Enforce engine**, not GenVeris's local audit chain. When **not entitled**,
the surface must not present GenVeris-local enforcement as live — it is demo/
governance only. This is the whole point of strictly-Enforce, enforced at the seam.

---

## 5 · Enforce → Evidence Fabric

When entitled + connected, Enforce control-evidence flows into the Fabric as
canonical entities, so the governance record is complete regardless of which plane
acted:

- Enforce governed decisions → canonical **`Finding`** / decision records
  (`source: "enforce"`), via the existing `auditToCanonical` adapter and/or a
  tenant-scoped ingest path that calls `fabricAppend` — idempotent, metadata-only,
  human-decision-wins preserved.
- No raw content crosses the seam (same privacy contract as Discover ingest;
  Secret-class payloads rejected).

---

## 6 · Security & privacy

- **Entitlement is server-authoritative** — resolved from the session tenant, never
  trusted from the client (BL-01 pattern).
- **The Enforce connection is a per-tenant credential** (gateway base URL + token)
  held in the environment / secret store, **never committed** — same rule as
  `ANTHROPIC_API_KEY` / `AUTH_SECRET`.
- **Baseline-compliant** (post-#185): any new route validates its body
  (`parseJson` + a zod schema), carries a rate-limit tier, and reports failures via
  `serverError` (no leakage). Outbound calls to the Enforce gateway time out and
  fail to the honest demo/awaiting state, never to fabricated data.

---

## 7 · Decisions needed from the owner (before build)

1. **Where entitlements live** — a `Tenant.entitlements String[]` column
   (simplest) vs a normalized `Entitlement` table (auditable grants with
   who/when). Recommendation: start with the column; add the table if grant
   history is needed.
2. **How Enforce exposes telemetry to GenVeris** — confirm the `/admin/api/*`
   read contract + auth from the Enforce repo (`Geniaztechpotashsolutions/veris-enforce`),
   which this session cannot read. The seam's live adapter is written against that
   contract.
3. **Entitlement granularity** — per-tenant (assumed) vs per-org/parent.
4. **Connection credential management** — per-tenant env vars vs a secret store
   keyed by tenant; who provisions on purchase.

---

## 8 · Acceptance criteria (from #167)

- A tenant **with** the Enforce entitlement sees **live** Enforce telemetry on the
  relevant surfaces (badged Live); **without** it, demo (badged Demo). ✔ via §3–§4.
- Enforce decisions land in the Evidence Fabric as `Finding`/decision. ✔ via §5.
- Tests cover **both** entitlement states (entitled→live, not-entitled→demo), the
  server-authoritative resolver, and tenant isolation. ✔ via §3, §6.

---

## 9 · Phased sub-tasks (one reviewable PR each — do not auto-merge)

1. **Entitlement model + resolver** — storage (§7.1) + pure `entitledTo()` +
   admin grant path; tests (grant, default-empty, client-cannot-self-grant,
   tenant isolation).
2. **Enforce connection config** — per-tenant gateway URL/token (server-side,
   env/secret), a reachability probe, honest "awaiting connection" state.
3. **First surface flips live-from-Enforce** — pick one Enforce surface (e.g. the
   Tool-Call Ledger or Circuit Breaker); entitled+connected → read the Enforce
   gateway; entitled/not-connected and not-entitled → honest states. Reuses the
   BL-04 render contract.
4. **Enforce telemetry → Fabric** — canonical `Finding`/decision writes (§5) +
   tests (idempotent, human-wins, metadata-only).
5. **Roll out per surface**, then hand off to **#173** (per-capability deletes of
   GenVeris's embedded engines — build-first, remove-second, never a coverage gap).

---

## 10 · Dependencies & sequencing

- **Depends on:** #166 (Evidence Fabric — delivered) and the security baseline
  (#185 — delivered).
- **Unblocks:** #180 (Enforce → ServiceNow/Jira hand-off), #173 (dedup deletes),
  and the "Enforce" column of the Govern360 positioning (surfacing built Enforce
  capability in GenVeris).
- **External dependency:** the Enforce engine's `/admin/api` read contract (§7.2)
  — the live adapter can't be finalized without it. Sub-tasks 1–2 and the
  not-entitled/demo paths are buildable **now**; the live-from-Enforce adapter
  (sub-task 3's entitled path) needs that contract.
