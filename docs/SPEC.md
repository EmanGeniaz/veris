# VerisZone — Locked Feature Spec

> The frozen feature list. A feature ships only if it is here. Status legend:
> **DONE** (built + live-tested) · **MODELLED** (built, runs on seeded data — real
> feed pending) · **LOGIC** (engine/interface built, live enforcement unproven
> here) · **INFRA** (code exists, needs owner-provisioned environment) ·
> **TODO** (not started). Updated every cycle alongside the Gantt.

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
| Capability tokens (90s, signed, per-call) | LOGIC | `lib/enforce.js` |
| Egress control (deny-by-default) | LOGIC | modelled destinations; live enforcement needs a deployed proxy/agent |
| HITL gates + circuit breaker | LOGIC | thresholds + revocation logic built |
| Tool-Call Ledger (hash chain) | LOGIC | pure-engine hash; server SHA-256 on real DB |
| Policy-as-a-Service (`/api/policy/inspect`) + shadow-AI extension | LOGIC | reference extension exists; real-browser deployment untested here |

## D. Platform / infrastructure
| Feature | Status | Notes |
|---|---|---|
| Auth.js v5 identity + tenant scoping | INFRA | code done; needs `AUTH_SECRET` + DB (owner) |
| Prisma/Postgres persistence + hash-chain audit | INFRA | schema + adapters done; needs real DB |
| Multi-tenant provisioning + Super Admin console | INFRA/MODELLED | flows built; real isolation untested at scale |
| Native XLSX evidence exports | DONE | |
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
| Veris Enforce entitlement gate (`enforceLicensed` per tenant) + locked/live surface states | TODO | D7 · MS 365 / Visio model |
| Veris Enforce shared core + data contract (`enforceProvider`) | TODO | one implementation, no drift |
| Veris Enforce **standalone** product (own repo/deploy, real inline enforcement) | TODO | ❌ not completable here — separate repo + integration |
| Arabic + RTL i18n scaffolding | TODO | D8 · pilot-first |
| Arabic pilot surfaces (1–2 full surfaces) | TODO | proves the pattern before rollout |
| UAE / Dubai regulatory pack (PDPL · DIFC · ADGM · DESC + residency/cloud) | TODO | D9 · computed pack |

## H. Test tooling (locked C1)
| Feature | Status | Notes |
|---|---|---|
| Click-integrity harness — role × surface walk, clickability, **location + console logs + errors**, report | TODO | D10 · milestone M-TEST · gates every later feature |

## F. Definition of Done (every feature)
1. In this SPEC. 2. Deterministic engine (D4) + computed posture where relevant (D3).
3. `npm run build` passes. 4. Live Playwright test + screenshot, 0 console errors.
5. Readability rules (§E) met. 6. Charter/Gantt/SPEC updated. 7. Owner reviews → merge.
