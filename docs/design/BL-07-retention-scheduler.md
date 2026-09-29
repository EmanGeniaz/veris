# Scope — BL-07: a real clock/scheduler for durable retention enforcement

**Status:** Proposed (scoping only — no code in this doc) · **Owner:** Platform /
Enforce · **Approval:** required before implementation (adds scheduled
infrastructure + a secret; touches audit-retention policy) · **Est. effort:**
~0.5–1 day for the memory sweep; audit/DSR items are separate.

---

## 1 · TL;DR

Governed memory already **persists** (Postgres `AgentMemory`) and expiry is
**enforced at read time** — `recallDurable()` filters `expiresAt > now`, so an
expired item is never returned, even before any sweep. That was issue **#136**,
which is **closed/done**.

What is **not** done: expired rows are never **physically deleted**.
`sweepDurable()` exists and is correct, but **nothing calls it**, and the project
has **no scheduler** (`vercel.json` declares only `{ "framework": "nextjs" }`,
no `crons`). So expired governed memory stays hidden but **undeleted** in the
database indefinitely — a data-minimization / storage-limitation gap (GDPR
Art. 5(1)(e), and the product's own "more sensitive → shorter life" promise).

**BL-07 = give the existing sweep a trigger, make the erasure provable, and
decide the policy for the other time-based stores.**

---

## 2 · Current state (with evidence)

| Piece | Where | State |
| --- | --- | --- |
| Retention window stamped at write | `lib/memory.js` `memoryWrite()` → `expiresAt = nowMs + retention.seconds*1000` | ✅ done |
| Durable persistence | `lib/memory-store.ts` `rememberDurable()` → `AgentMemory` | ✅ done (#136) |
| Read-time expiry enforcement | `lib/memory-store.ts` `recallDurable()` → `where: { expiresAt: { gt: now } }` | ✅ done (#136) |
| Physical deletion function | `lib/memory-store.ts` `sweepDurable()` → `deleteMany({ where: { expiresAt: { lte: now } } })` | ⚠️ **exists, zero callers** |
| A scheduler to run it | — | ❌ **none** (`vercel.json` has no `crons`) |
| Injectable clock (testability) | every fn takes `nowMs` | ✅ done |

`lib/guardrail-coverage.js` currently marks Memory retention + expiry as
**"have"**, with an honest note that the guarantee rests on the query-time
filter "even before a sweep." That remains true — the surface is not lying —
but the **durable-hygiene** half (actual erasure) is not scheduled. BL-07
closes that without changing any coverage claim from false to true; it makes an
already-true claim physically complete.

---

## 3 · Blast radius — every durable, time-based lifecycle

BL-07 is scoped to memory retention. The audit here names the others so the
decision is explicit, not accidental:

| Store | Time field | Read-filtered? | Physically reaped? | Verdict for BL-07 |
| --- | --- | --- | --- | --- |
| `AgentMemory` | `expiresAt` (+ index) | ✅ `recallDurable` | ❌ no caller | **In scope** — wire `sweepDurable()` to a schedule. |
| `PolicyException` | `expiresAt` (+ `@@index([tenantId, expiresAt])`) | ⚠️ **verify** — no read-time filter found in `lib`/`app` | ❌ | **In scope (verify + fix):** an expired exception must not still grant an exemption. Add a read-time filter first (correctness), then reap on the same schedule (hygiene). |
| `AuditLog` | `createdAt` (grows unbounded) | n/a (append-only) | ❌ (by design) | **Out of scope / separate decision.** The Article-12 chain is intentionally immutable and long-lived; any retention/rotation is a **compliance-methodology** call needing human approval — never auto-pruned by this task. |
| DSAR request clock | `elapsedD` vs `deadlineD` (`lib/data-subject-rights.js`) | n/a | n/a | **Out of scope.** The clock is *modelled*, not timestamp-driven; making it live is the DSAR-intake/DB seam, its own backlog item. |
| Capability tokens | `ttl` in `lib/enforce.js issueToken()` | n/a | n/a | **Not applicable** — tokens are minted per request and never stored, so nothing accumulates to reap. |

---

## 4 · Requirements / acceptance criteria

1. Expired `AgentMemory` rows are **physically deleted** on a recurring schedule
   (durable erasure, not just hidden), across serverless instances and restarts.
2. The sweep is **auditable**: each run appends a governance record (count
   removed) to the tenant/audit trail, so retention enforcement is provable —
   consistent with the platform's "provable, not a spreadsheet" story.
3. The trigger is **secured**: it cannot be invoked anonymously by the public
   internet to cause load or probe behaviour.
4. It is **idempotent, best-effort, and a clean no-op without a database** (never
   breaks a demo deploy — same discipline as `scripts/vercel-db.mjs`).
5. `PolicyException` expiry is **enforced at read time** (correctness) before it
   is reaped (hygiene).
6. **Recurrence prevention:** a test proving (a) an expired item is deleted by
   the sweep across a simulated restart, and (b) the cron route rejects an
   unauthenticated call. Wired into `test:unit` + CI.
7. No change to the audit chain's immutability; no auto-pruning of `AuditLog`.

---

## 5 · Options

| # | Approach | Pros | Cons |
| --- | --- | --- | --- |
| **A** | **Vercel Cron → secured internal route** (`vercel.json` `crons` calls `GET /api/cron/sweep`, guarded by `CRON_SECRET`) | Native to the deploy target; no new infra; visible in Vercel dashboard; schedule in-repo | Adds one env secret (`CRON_SECRET`); Vercel-specific (portable via option B) |
| **B** | **External scheduler** (GitHub Actions cron, Supabase `pg_cron`, or uptime pinger) hitting the same route | Portable off Vercel; same route works for all | Schedule lives outside the repo; another system to hold the secret |
| **C** | **Opportunistic/lazy sweep** — piggyback a bounded `sweepDurable()` on write, throttled (e.g., at most once/interval per instance) | Zero infra, zero secret; always runs where writes happen | Not guaranteed on idle tenants; adds latency variance to the write path unless deferred |
| **D** | **DB-native TTL** — Supabase `pg_cron` job `DELETE … WHERE expiresAt < now()` | No app code on the hot path; DB enforces it | Ops-managed in the DB, not in the app's audit trail (no governance record unless it writes one); harder to test in CI |

---

## 6 · Recommendation

**Primary: A (Vercel Cron + secured route), with C as a belt-and-suspenders
fallback.** Rationale:

- The sweep function already exists and is pure/injectable — A is a thin,
  low-risk wiring job that produces a **provable, auditable** erasure event,
  which the governance story needs (D erases silently unless it also writes a
  record).
- C alone can't guarantee erasure for a tenant that has gone quiet, but as a
  *secondary* opportunistic trigger it covers the window between cron runs and
  the case where cron is misconfigured — cheap insurance.
- D (`pg_cron`) is a good **optional hardening** later, but as the sole mechanism
  it moves enforcement outside the app's audit trail, so it's not the primary.

**Cadence:** hourly is ample (the shortest retention window is 24h for
Confidential; expired-but-undeleted rows are already invisible to recall, so the
sweep is hygiene, not a correctness deadline). Start hourly; tune later.

---

## 7 · Design sketch (for the implementation PR — not built here)

- **New route** `app/api/cron/sweep/route.ts`:
  - Rejects unless the request carries the expected secret. Vercel Cron sends
    `Authorization: Bearer $CRON_SECRET`; compare with `timingSafeEqual`. Return
    401 otherwise. No DB → `{ ok: true, swept: 0, mode: "demo" }` (no-op).
  - Calls `sweepDurable(Date.now())` (and `sweepPolicyExceptions()` once added).
  - Appends an audit-chain row `retention:sweep` per tenant (or one global),
    detail `{ store: "AgentMemory", removed: <n> }` via `auditAppend` — so the
    erasure is itself tamper-evident evidence. Best-effort; never throws.
- **`vercel.json`**: add
  `"crons": [{ "path": "/api/cron/sweep", "schedule": "0 * * * *" }]`.
- **`.env.example`**: document `CRON_SECRET` (generated like `AUTH_SECRET`).
  Add it to the **BL-00 runbook** as an optional production var.
- **`PolicyException`**: add a read-time `expiresAt > now` filter at its
  consumption site (correctness), then a `deleteMany` reaper on the same route.
- **`lib/memory-store.ts`**: no change needed to `sweepDurable()` itself.
- **`scripts/retention-sweep-test.mjs`** (new, wired into `test:unit` + CI):
  expired-item deletion across a simulated restart; route auth guard (401
  without the secret, 200 with); no-DB no-op; audit row emitted with the count.

---

## 8 · Security & governance notes

- The cron route is a **privileged maintenance endpoint** — it must be
  secret-guarded (constant-time compare) so it can't be triggered or probed
  anonymously. It performs only bounded, idempotent deletes of already-expired
  rows, so the blast radius even if triggered is limited to intended hygiene.
- **Never** point a reaper at `AuditLog`. The Article-12 chain is the evidence
  spine; pruning it is a compliance-methodology decision that requires explicit
  human approval and is **out of scope** here.
- Erasing expired governed memory is *aligned* with data-minimization, but the
  act of erasure should itself be logged (see the `retention:sweep` audit row) so
  "we deleted on schedule" is provable, not asserted.

---

## 9 · Approvals required before implementing

Per `CLAUDE.md`, the following need explicit human authorization, so this doc
stops at scope:

- **Production infrastructure change** — adding a Vercel Cron + `CRON_SECRET`.
- **Governance-methodology touch** — confirming that expired governed memory is
  erased on a schedule, and confirming `AuditLog` is explicitly *excluded* from
  any retention/pruning.

Once authorized, implementation is a focused, testable PR following §7.

---

## 10 · Out of scope (named, not forgotten)

- Making the **DSAR retention/erasure clock live** (timestamp-driven instead of
  modelled) — the DSAR intake/DB seam; its own item.
- Any **`AuditLog` retention/rotation policy** — a compliance decision, not a
  code task.
- DB-native `pg_cron` (option D) as a later hardening.
