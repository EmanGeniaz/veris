# Veris Enforce ↔ GenVeris integration contract

**Status:** Canonical contract for the GenVeris side · **Owner:** Platform / Architecture
**Issues:** #167 (WS2 Enforce entitlement seam) · §7.2 of `docs/design/WS2-enforce-entitlement-scope.md`
**Audience:** the Veris Enforce engineering track (separate repo, `Geniaztechpotashsolutions/veris-enforce`)

> This document is written from **GenVeris's side**: it states exactly what GenVeris will
> call and consume, so both products build to one interface. The Veris Enforce team should
> **implement this contract or reply with deltas**, then hand back an **OpenAPI 3.1 spec +
> one sanitized sample response per endpoint**. That spec is what unblocks GenVeris's
> live-from-Enforce adapter (WS2 sub-task 3). Until it exists, GenVeris correctly shows
> entitled tenants as *awaiting-connection* (badged Demo) and never fabricates live data.

---

## 0 · Context — what already exists on the GenVeris side

GenVeris is the control plane and single pane of glass. Veris Enforce is the runtime
enforcement engine — a **separately-purchased plane** that activates **per tenant** inside
GenVeris. The activation seam is already built and merged:

- **Entitlement** (sub-task 1, #199): a server-authoritative, per-tenant record of which
  planes a tenant owns. `entitledTo(tenant, "enforce")` gates everything below. Default-empty:
  no entitlement → governance/demo only.
- **Connection** (sub-task 2, #200): a per-tenant `EnforceConnection` holding an HTTPS
  `gatewayUrl` (validated — no http, no loopback/private/link-local/metadata hosts) and a
  **sealed** bearer credential (AES-256-GCM via `lib/secrets.ts`; stored only as an encrypted
  reference, never in the clear, never returned by any API).
- **Honest state** (`lib/enforce-connection.ts`): `not-entitled` → `awaiting-config` →
  `awaiting-connection` → (`live`, reserved for the adapter this contract unblocks).

Enforce does **not** build any governance UI, dashboards, or audit viewer — GenVeris renders
all of that. What GenVeris needs from Enforce is **(A)** a versioned, read-only API it polls
and **(B)** a governed-decision feed it ingests into the Evidence Fabric.

---

## 1 · Transport & auth

- **HTTPS only.** Base path **`/admin/api/v1`** (versioned; any breaking change becomes `v2`).
- **Auth:** `Authorization: Bearer <token>` — the exact per-tenant token GenVeris was given to
  seal and stores encrypted. Enforce validates it and **derives the tenant from the token**
  (never trust a client-supplied tenant id).
  - `401` — missing/invalid token. `403` — valid token, wrong tenant for the resource.
- **Read-only for v1** (GET only). No endpoint returns secrets, raw prompts/responses, model
  I/O, document contents, or personal data.
- **Bounded & consistent:** respond within a few seconds; `429` carries `Retry-After`; errors
  use one envelope — `{ "error": { "code": "...", "message": "..." } }` — with generic messages
  (no stack traces, no internal paths). Document timeout, retry and rate-limit behaviour.

---

## 2 · Endpoints GenVeris will call

### `GET /admin/api/v1/health`
Reachability probe. GenVeris uses a success here to move an entitled, configured tenant from
*awaiting-connection* to *live*.
```json
{ "status": "ok", "version": "x.y.z", "time": "2026-10-06T12:00:00Z" }
```

### `GET /admin/api/v1/capabilities`
Which controls this Enforce instance runs, so GenVeris lights up only the surfaces Enforce
actually covers.
```json
{ "controls": ["inference","egress","hitl","breaker","runtime","memory","mcp","least_privilege"] }
```

### `GET /admin/api/v1/decisions?since=<cursor|ISO8601>&limit=<n>`
The governed-decision feed — the important one. A page of **metadata-only** decision records,
oldest→newest, with a stable cursor for incremental pulls.
```json
{
  "decisions": [
    {
      "id": "stable-unique-id",          // idempotency key — GenVeris dedupes on this
      "ts": "2026-10-06T12:00:01Z",
      "category": "inference|egress|memory|runtime|breaker|mcp|hitl",
      "decision": "allow|mask|block|escalate|deny|throttle|loop|revoke",
      "reasonCode": "short.machine.code",
      "severity": 0,                       // 0–10
      "subject": { "agent": "id", "tool": "name", "dest": "host" },  // references only
      "metadata": {}                        // small, non-sensitive
    }
  ],
  "nextCursor": "opaque-cursor-or-null"
}
```
`category` + `decision` **must** map onto the signals GenVeris already renders on its Enforce
surfaces:

| GenVeris surface | signal it expects |
|---|---|
| Tool-Call Ledger | `inference:<allow\|mask\|block\|escalate>` |
| Egress Policy | `egress-inspect:<allow\|deny\|ssrf>` |
| Governed Memory | `memory:<allow\|mask\|refuse>` |
| Runtime Guard | `runtime:<allow\|throttle\|loop>` |
| Circuit Breaker | `breaker-signal:<injection\|egress\|…>` |

**Never** include prompt text, model input/output, document contents, secrets, or PII —
references and codes only (the same privacy contract as GenVeris's own Article 12 audit chain).

### `GET /admin/api/v1/status`
Tenant-scoped (from the token) operational rollup for the Enforce overview tiles: engine state,
active policy/rule counts, breaker posture, last-decision timestamp. Metadata only.

---

## 3 · Decisions → Evidence Fabric (pull, not push)

GenVeris **pulls** `/decisions` on a schedule and maps each record to a canonical
**Finding/decision** in its Evidence Fabric with `source: "enforce"`, idempotent on the
record's `id`, metadata only. This keeps GenVeris server-authoritative and means Enforce never
holds GenVeris credentials.

Requirements this places on Enforce:
- Every decision has a **stable, globally-unique `id`** (GenVeris's idempotency key).
- A monotonic, paginatable **`since` cursor** so GenVeris can pull incrementally without gaps or
  duplicates.

> A push/webhook model (Enforce → a GenVeris ingest endpoint) is a legitimate alternative, but
> it adds inbound surface and its own auth on the GenVeris side. **Start with pull.** If push is
> required, raise it — GenVeris already has a metadata-only ingest path (`POST /api/ingest`,
> shared-key auth) that could be adapted.

---

## 4 · Hard constraints (GenVeris rejects otherwise)

- **Metadata only.** A record carrying raw content or PII is a contract violation.
- **Stable identifiers** — ids, `reasonCode`s, and the `category`/`decision` enums — GenVeris
  pins to them.
- **Tenant isolation** enforced from the token; no cross-tenant reads.
- **Pagination + filtering** (`since`, `limit`), consistent error envelope, documented
  timeouts/rate-limits.
- **No secrets in responses**, ever.

---

## 5 · Deliverable back to GenVeris

1. **OpenAPI 3.1** document for `/admin/api/v1`.
2. One **sanitized sample response** per endpoint — especially `/decisions`.
3. Confirmation of the **auth** shape (bearer token as above) and how the tenant is derived.

With those in hand, GenVeris builds the sub-task 3 adapter: reachability via `/health`, surface
hydration via `/decisions` + `/status`, and Fabric ingestion of Enforce decisions — flipping
entitled + connected tenants from Demo to **Live**.

---

## 6 · What NOT to build on the Enforce side

- No governance UI, dashboards, reports, or audit viewer — GenVeris owns the pane of glass.
- Do not push raw prompts, model I/O, document contents, secrets, or PII across the seam.
- Do not require GenVeris to hold standing admin credentials beyond the per-tenant bearer token.
- Do not change the `category`/`decision` vocabulary without a `v2` — GenVeris surfaces bind to it.
