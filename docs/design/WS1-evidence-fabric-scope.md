# Scope — WS1: the Evidence Fabric as GenVeris's canonical core

**Status:** Proposed (scoping only — no code in this doc) · **Owner:** Platform / Architecture
· **Approval:** REQUIRED before implementation (major architecture change per CLAUDE.md)
· **Roadmap:** Workstream 1 (the keystone) of the Veris Platform Blueprint.

> This is the first and load-bearing workstream: elevate the **Evidence Fabric**
> from an implied idea into the **one canonical, tamper-evident record** that
> Veris Discover and Veris Enforce write into and that every GenVeris surface
> (dashboards, employee workspace, Veris Intelligence, compliance, phase gates)
> reads from. Almost everything else on the roadmap reads or writes it, so it
> comes first.

---

## 1 · Why this exists

The vision calls for **one governance spine — "not a parallel spreadsheet that
drifts."** Today GenVeris has the *ingredients* of that spine but not the spine
itself:

- A real **tamper-evident audit hash chain** — `lib/audit.ts` `auditAppend()`
  chains every row with `sha256(prevHash | action | entity | detail | actor)`;
  altering any historical row breaks every hash after it. BL-04 wired six Enforce
  surfaces to read live decisions back off this chain.
- A set of **typed domain models** in Prisma — `Evidence`, `Decision`,
  `Initiative`, `Risk`, `Kri`, `AgentMemory`, `Policy`/`PolicyVersion`,
  `KnowledgeDoc`, `Violation`, etc.
- A drafted **Discover → GenVeris ingestion contract** (canonical entities +
  `/api/ingest/discover`).
- An honest **live-vs-demo** selector (`lib/telemetry-source.ts`).

**The gap:** these are scattered. Evidence lives partly in the audit chain,
partly in typed tables, partly in seeded surfaces. There is **no single canonical
entity model, and no read/write contract** that Discover and Enforce write into
and that governance reads out of. WS1 unifies them so the platform has one record
of truth.

---

## 2 · What the Evidence Fabric is

A **canonical, tenant-scoped, provenance-stamped, tamper-evident record** of the
enterprise's AI estate and everything governance needs to prove about it. Not a
new database engine — a **canonical schema + contracts + verification** layered on
the existing Postgres/Prisma store and the audit hash chain.

### 2.1 Canonical entities (reconciled with the Discover ingestion contract)
| Entity | Holds | Sourced from |
|---|---|---|
| `AISystem` | An AI system/agent/model in the estate: identity, tier, owner, lifecycle stage, region/vertical/sector. | Discover (found), GenVeris intake (net-new), Enforce (seen at runtime) |
| `Assessment` (typed) | A rating against a dimension — `compliance-rating`, `risk/AIRA`, `tokenization`, `carbon`, `security`, `data-privacy`, `governance-maturity`. | Discover, GenVeris PMO, Enforce |
| `EvidenceRef` | A pointer to a governed artifact + its review cadence/freshness (extends today's `Evidence` model). | all planes |
| `Finding` | An open issue/gap/violation with severity + status. | Enforce (runtime), Discover (scan), GenVeris (review) |
| `Decision` / `AuditEvent` | A governed decision on the tamper-evident chain (extends `AuditLog`). | Enforce (per-request), GenVeris (workflow) |
| `Owner` | Accountable person/role for a system or finding. | all |
| `FrameworkMapping` | Control ↔ framework (NIST AI RMF, EU AI Act, ISO 42001, UAE PDPL/DIFC/ADGM). | GenVeris (owns governance), Enforce feeds evidence |
| `ShadowAIItem` | An ungoverned/undiscovered AI use. | Discover, Enforce Posture |
| `Envelope` | Provenance wrapper on every write: source plane, tenant, confidence, timestamp, idempotency key. | all writes |

### 2.2 Invariants
- **Tenant-scoped** — every entity binds to a tenant; the BL-01 guard applies to
  every read/write. No cross-tenant access.
- **Provenance + confidence on every record** — the `Envelope` says which plane
  wrote it, when, and how sure it is. Nothing is anonymous.
- **Tamper-evident** — governed decisions extend the existing SHA-256 hash chain;
  the chain re-verifies (reuse `lib/enforce-live.ts` `auditChainIntact`).
- **Metadata, not raw content** — the Fabric records governance metadata and
  references, never the sensitive payload (same privacy contract as Memory #159
  and Retrieval #162: the audit row holds the decision, never the text/secret).
- **Conflict policy = human decision wins** — a later automated write never
  overrides a human governance decision; conflicts surface, they don't silently
  resolve (carried from the ingestion contract).

---

## 3 · Contracts (the seams)

| Seam | Direction | Mechanism | Tier/gate |
|---|---|---|---|
| **Discover → Fabric** | write | `POST /api/ingest/discover` (canonical entities, idempotent, rejects tier≠enterprise / Secret-class) | Enterprise-tier only |
| **Enforce → Fabric** | write | Enforce emits governed decisions + audit events via its `/admin/api/*` + audit; GenVeris ingests them as `Decision`/`Finding`/`AuditEvent` | Enforce entitlement |
| **GenVeris workflows → Fabric** | write | PMO intake, phase-gate decisions, assessments, evidence capture | in-product |
| **Fabric → surfaces** | read | dashboards, employee workspace, Veris Intelligence, compliance frameworks, phase gates all read the canonical record (live-first, honest demo fallback via `telemetry-source`) | — |

---

## 4 · Migration path (additive first, non-destructive)

1. **Define the canonical schema alongside** today's models (no drop/rewrite).
   Map existing `Evidence`/`Decision`/`AuditLog`/`AgentMemory` onto the canonical
   entities via views/adapters.
2. **Route new writes through the Fabric** — the ingestion endpoint and Enforce
   telemetry land as canonical entities; GenVeris workflows write canonically.
3. **Adapt surfaces to read the Fabric** — one surface at a time (dashboards →
   workspace → compliance), keeping the live/demo fallback so nothing breaks.
4. **Retire scattered seeds** — remove per-surface seed windows once each reads
   the Fabric (this is also where the "strictly-Enforce" runtime removals land).
5. **Retention** — BL-07's sweep governs Fabric data lifecycle; audit/evidence
   chain stays immutable (never auto-pruned).

Each step is a reviewable PR; the platform stays shippable throughout.

---

## 5 · Acceptance criteria

1. One canonical schema + `Envelope` provenance, tenant-scoped, documented.
2. Discover and Enforce writes land as canonical entities via their contracts;
   idempotent; conflicts surface (human-wins).
3. Governed decisions extend the tamper-evident chain and re-verify; tampering a
   row flips `intact` to false.
4. At least one live surface (dashboard) reads the Fabric end-to-end, live-first
   with honest demo fallback.
5. Privacy: no raw sensitive content in the Fabric; only metadata + references.
6. **Recurrence prevention:** tests for the canonical mapping, provenance,
   chain verification + tamper, tenant isolation, and idempotent ingest — wired
   into `test:unit` + CI.

---

## 6 · Approvals required before building

Per CLAUDE.md, a **major architecture change** needs explicit human approval.
This doc is that approval artifact. It does **not** change auth/RBAC, governance
methodology, or delete data — it consolidates existing stores behind a canonical
model. On approval, WS1 proceeds as the phased PRs in §4.

---

## 7 · Out of scope / open decisions

- **Enforce/Discover discovery boundary** — breadth (Discover) vs depth (Enforce
  Posture), both writing one `AISystem`/`ShadowAIItem` inventory. Confirmed in the
  blueprint; implementation detail here.
- **Exact canonical field lists** per entity — finalized in the build PR against
  the real surfaces' needs.
- **Runtime-engine removals** (strictly-Enforce) — sequenced as WS-C, after WS1 +
  the entitlement seam (WS2); tracked in the Enforce porting brief.
