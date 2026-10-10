# GenVeris — Locked Feature Spec

> The frozen feature list. A feature ships only if it is here. Status legend:
> **DONE** (built + live-tested) · **MODELLED** (built, runs on seeded data — real
> feed pending) · **LOGIC** (engine/interface built, live enforcement unproven
> here) · **INFRA** (code exists, needs owner-provisioned environment) ·
> **IN PROGRESS** (partly built, remainder blocked or under way) · **TODO** (not started).
> Updated every cycle alongside the Gantt. Last reconciled against `main` on
> 2026-10-07 (statuses checked against the code and merged PRs up to #201).

## A. Object model & spine
| Feature | Status | Notes |
|---|---|---|
| Initiative object + 13-phase lifecycle | DONE | `lib/platform-models.ts` |
| Role lenses (CEO/CFO/CISO/CAIO/CGO/CDPO/CRO/Legal/COO/CHRO/CIO/Manager/Employee) | DONE | `lib/role-centers.js` |
| Governance Score / computed posture (32/32 frameworks) | DONE | computed, never asserted (D3) |
| Framework library (32 Operational, 0 Library, 0 Gap) | DONE | `lib/frameworks.js` + packs |

## B. Governance workflows
| Feature | Status | Notes |
|---|---|---|
| Breach-notification workflow | DONE | `lib/breach-notification.js` |
| Impact assessment (AIA · DPIA · FRIA) | DONE | `lib/impact-assessment.js` |
| Data provenance & governance | DONE | `lib/data-provenance.js` |
| Environmental footprint + carbon disclosure | DONE | `lib/sustainability.js` |
| Converged incident playbook + crosswalk + gap-closure | MODELLED | seeded registers |
| Enforcement Coverage (enforced/observed/shadow) | MODELLED | honest 3-plane split |
| **Data-subject-rights lifecycle** (consent · DSAR · retention/erasure) | DONE | `lib/data-subject-rights.js` — 4 rights per system + live request queue; statutory clock **modelled** (elapsedD vs regime deadlineD, SSR-safe); EN/AR |

## C. Gateway & enforcement (the "full enforcement" core — D1)
| Feature | Status | Notes |
|---|---|---|
| Policy engine (classify · mask · block · egress) | LOGIC | `lib/policy-rules.ts` — deterministic; real-traffic proof pending |
| AI Gateway pipeline (`/api/gateway/chat`) | LOGIC | thin path built; needs model keys + real routing to be live |
| Capability tokens (90s, per-call) | LOGIC | `lib/enforce.js` — minted per allowed call, but the "signature" is a non-cryptographic djb2 fingerprint (no secret) and nothing verifies a token yet; the gateway decides tool calls but does not execute them |
| Egress control (deny-by-default) | LOGIC | modelled destinations; live enforcement needs a deployed proxy/agent |
| HITL gates + circuit breaker | LOGIC | thresholds + revocation logic built |
| Tool-Call Ledger (hash chain) | LOGIC | pure-engine hash; server SHA-256 on real DB |
| Policy-as-a-Service (`/api/policy/inspect`) + shadow-AI extension | LOGIC | reference extension exists; real-browser deployment untested here |

## D. Platform / infrastructure
| Feature | Status | Notes |
|---|---|---|
| Auth.js v5 identity + tenant scoping | INFRA | code done (`auth.ts`, `lib/tenant-guard.ts`, server RBAC 403s in `app/api/bus/[store]`); needs `AUTH_SECRET` + DB in the deploy env — #142 |
| Prisma/Postgres persistence + hash-chain audit | INFRA | schema + adapters done; needs real DB |
| Multi-tenant provisioning + Super Admin console | INFRA/MODELLED | flows built; real isolation untested at scale |
| Native XLSX evidence exports | DONE | |
| Evidence Fabric — canonical, tenant-scoped, hash-chained record | INFRA | core built + tested: `lib/evidence-fabric.ts`, `/api/fabric` GET+POST (#174, #197); Discover ingest sink `/api/ingest/discover` (#176); CAIO panel + AI Asset Register read it (#175, #178). Enforce → Fabric pending (#167) |
| Live enforcement surfaces from the audit chain (ledger · egress · memory · runtime · breaker · retrieval · cost) | INFRA | built + tested; live only once a DB is provisioned — `/api/enforce/*` read routes, chain re-verified; labelled seeded window when no DB (BL-03/BL-04, #183) |
| Security baseline (rate limits · validation · secrets · deps · error leakage · uploads) | DONE | `lib/rate-limit.ts`, `lib/api-guard.ts`, `lib/api-schemas.ts`, `npm run test:security`, `.github/workflows/security-baseline.yml` (#185) |
| Durable retention sweep (physical deletion of expired governed memory) | TODO | `sweepDurable()` exists with no caller and no scheduler — BL-07 / #172 (needs approval) |
| **Self-host packaging** (Docker/compose, config, install docs, air-gap mode) | TODO | required by D2 |

## E. UX / readability standard (D5 — acceptance criteria)
Grandma-readable **and** sophisticated. Hard rules, checked each cycle:
- **Primary content** (headings, body copy, KPI values, buttons, nav labels): **≥ 14px**.
- **Secondary/meta** (captions, table cells, sub-labels): **≥ 12px**.
- **Functional minimum:** no interactive or decision-carrying text below **11px** (today's 9–10px eyebrows/labels are a violation to fix as milestone rework — expect a less dense look).
- **Contrast:** WCAG AA (≥ 4.5:1 normal text, ≥ 3:1 large).
- **Targets:** clickable ≥ 32px tall; visible focus state.
- **No horizontal body scroll**; wide tables scroll inside their own container.
- **Determinism:** no `Date.now`/`Math.random` in render (D4).
- Every new surface passes a live Playwright render + click test with **0 console errors** before merge (D6).

> Note (brutal): the current UI leans heavily on 9–11px text. Enforcing this
> standard is real rework across most surfaces and **will** change the dense
> executive look. Tracked as milestone **M-UX**.

## G. Product-line, localisation & regional (locked C1)
| Feature | Status | Notes |
|---|---|---|
| Veris Enforce entitlement gate (per-tenant plane entitlement) + honest surface states | INFRA | `lib/entitlements.ts` `entitledTo()`, `/api/entitlements`, `/api/admin/entitlements` (#199); per-tenant connection + sealed credential `lib/enforce-connection.ts`, `lib/secrets.ts`, `/api/enforce/connection`, `/api/admin/enforce-connection` (#200). States resolve to not-entitled / awaiting-config / awaiting-connection — **never live yet** |
| Veris Enforce data contract + live-from-Enforce adapter | IN PROGRESS | contract defined GenVeris-side (`docs/design/enforce-integration-contract.md`, #201); the live adapter + Enforce → Evidence Fabric ingestion (WS2 sub-task 3, #167) are blocked on the Enforce team's OpenAPI spec |
| Veris Enforce **standalone** product (own repo/deploy, real inline enforcement) | TODO | ❌ not completable here — separate repo + integration |
| Arabic + RTL i18n scaffolding | DONE | D8 · `lib/i18n.js`, shell-level RTL toggle (Gantt C4–C5) |
| Arabic pilot surfaces (1–2 full surfaces) | DONE | `components/platform/arabic-pilot.jsx`; estate-wide content rollout largely done (Gantt C6–C21) — Home/Playbook/Advisor + admin portals remain English |
| UAE / Dubai regulatory pack (PDPL · DIFC · ADGM · DESC + residency/cloud) | DONE | D9 · `lib/uae-mappings.js` (Gantt C3) |

## H. Test tooling (locked C1)
| Feature | Status | Notes |
|---|---|---|
| Click-integrity harness — role × surface walk, clickability, **location + console logs + errors**, report | DONE | D10 · `scripts/click-integrity.mjs` → `docs/test-reports/click-integrity.md` (Gantt C2). Not run in CI — it needs a running server |

## F. Definition of Done (every feature)
1. In this SPEC. 2. Deterministic engine (D4) + computed posture where relevant (D3).
3. `npm run build` passes. 4. Live Playwright test + screenshot, 0 console errors.
5. Readability rules (§E) met. 6. Charter/Gantt/SPEC updated. 7. Owner reviews → merge.
