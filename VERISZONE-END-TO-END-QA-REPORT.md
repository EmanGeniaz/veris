# VerisZone — End-to-End QA Report

_Adversarial audit. Verdicts are PASS / FAIL / REVIEW / NOT VERIFIABLE. Nothing marked PASS without a real test; nothing inflated._

> ## ⟳ Re-score (post-remediation) — 2026-08-05
> The defects below were remediated and this pass **re-verifies** them (live browser walk + source + build/lint). **Score: 64 → 83 / 100.** Every P1 and P2 defect is resolved; a handful of P3 / REVIEW nits remain (disclosed under "Residual items"). Verification method and the defect-status ledger are in **[§ Remediation verification](#remediation-verification-this-pass)** immediately below the summary. The original audit body is preserved unchanged beneath it as the audit trail.
>
> | Dimension | Before | After | What changed |
> | --- | --- | --- | --- |
> | Functional | 80 | **84** | Dead-end "New Project" now fires intake toast; build clean |
> | UI/UX | 70 | **77** | Contradictory duplicate tables gone; incident/forum data consolidated |
> | Navigation | 84 | **88** | Dead-end fixed; `FilterMap` on same `WORLD_GEO` as ExposureMap |
> | **Data Integrity** | **45** | **87** | Gov score single-sourced (75 live everywhere); open risks 12; CEO risk tables canonical; framework scores reconciled; portfolio spine unified |
> | Role / Permission | 65 | **78** | Server-side RBAC extended 3 → 7 bus stores |
> | Accessibility | 75 | **75** | Unchanged (not re-tested deeply; no regressions) |
> | Performance | 75 | **75** | Unchanged; build clean |
> | **Auditability** | **50** | **85** | Headline metrics now trace to canonical registers; incidents single-registered |
> | AI Reliability | 65 | **80** | 3 gateway-bypassing `api.anthropic.com` calls routed through `askGateway`; wrong cert figures removed; honest degradation intact |
>
> ### RE-SCORE: **83 / 100** _(was 64)_
> Still capped below ~90 by items **not** re-tested this pass (8 roles' deep journeys, responsive breakpoints, live state-sync, perf timings, lifecycle gating, evidence upload/version, live keyed AI) — these remain **NOT VERIFIABLE**, not passing.

## Method & honest scope
- **Live browser tests** (headless Chromium + Playwright) against the running dev app in demo mode: 5 roles (CEO, CAIO, CISO, CFO, Employee), each on Overview + one more surface — **45 interactive elements actually clicked**, plus universal search and accessibility on the CEO home.
- **Source analysis** across `components/platform/*`, `lib/*`, `app/api/*` for data traceability, duplicate sources of truth, hallucination, RBAC, and map consistency (evidence = `file:line`).
- **Build/lint/typecheck** executed.
- **Automated role×surface render walk** from earlier this session: 125 surfaces across all 13 roles rendered with **0 runtime errors** (1 hydration bug found & already fixed/merged).
- **NOT exhaustively tested** (marked NOT VERIFIABLE below): 8 of 13 roles' live journeys; most non-Overview surfaces; in-drawer form submit/validation (Phase 16); responsive breakpoints (14); live state-sync (17); performance timings (21); full lifecycle completion-gating (7); evidence upload/version (8); live Veris Intelligence per role with a real API key (10 — no key present, so only the honest-degrade path was exercised).

## Executive summary
VerisZone is a **polished, well-engineered demo SPA**: it builds clean, renders every role/surface without runtime errors, has real navigation + universal search, an honest AI-degradation path, and genuine server-side RBAC scaffolding. **However, for a product whose entire value proposition is _governance traceability and auditability_, the data layer undermines that promise:** the same headline metrics render **different values on different screens**, several dashboards **hardcode figures instead of deriving them**, and the CEO risk tables are **self-contradictory and diverge from the canonical risk register**. These are not cosmetic — an executive cannot trust a governance score that reads 72 here and 79 there.

| Dimension | Score /100 | Basis |
| --- | --- | --- |
| Functional | 80 | Builds, renders, navigates, search works, 0 runtime errors; 1 dead-end button; lifecycle-gating unverified |
| UI/UX | 70 | Polished & consistent shell; some dashboard density / duplicated concepts (partly REVIEW) |
| Navigation | 84 | 39/40 sample click-integrity PASS; canonical routing; search routes correctly; 1 dead-end |
| **Data Integrity** | **45** | Contradictory cross-screen metrics, hardcoded values, split sources of truth |
| Role / Permission | 65 | Real RBAC matrix, but 3/9 stores gated + bypassed in demo mode |
| Accessibility | 75 | 0/64 icon buttons missing labels, visible focus, Esc closes ⌘K; only CEO home tested; focus-trap unverified |
| Performance | 75 | 261 kB first-load; no obvious issues; live timings NOT measured |
| **Auditability** | **50** | Core promise partially broken by metric non-traceability |
| AI Reliability | 65 | Degrades honestly (no fabricated numbers); wrong hardcoded cert figures in a prompt; gateway bypass |

### FINAL SCORE (original audit): **64 / 100**
Strong engineering shell; **not production-ready as an enterprise governance system-of-record** until the data layer is single-sourced. Excellent as a sales/demo prototype.

---

## Remediation verification (this pass)

**Re-test method (2026-08-05):** production build (`next build` → PASS, exit 0); `eslint .` → **0 errors, 4 warnings** (was 2 errors); source re-inspection at `file:line` for every defect; and a **live headless-Chromium (Playwright) walk** of the running app — CAIO Overview + Governance + Risk Center, CEO cockpit + Risk, AI Central, and the two new CGO convergence surfaces — capturing rendered values and console/page errors (**0 errors** across the walk).

**What was observed live (the crux — same metric, one value):**
- **AI Governance Score = 75 on every surface** that shows it — CAIO Overview ring, "How the **75** is scored", Governance tab "Composite **75**". (Was 72 / 74 / 79 / 69.) No surface renders a competing "AI Governance Score"; AI Central's figure is the distinct **maturity** KPI, not this score.
- **Open risks = 12** consistently (was 12 on one CAIO screen, 8 on another).
- **CEO risk counts = Critical 2 / High 3**, and risk rows render `level · residual` straight from canonical (e.g. RSK-003 = `Critical · 12`, matching `riskRegister`). Both CEO risk tables now read the same `CEO_RISKS` source, so they cannot diverge. (Was RSK-004 Critical-vs-High across two tables.)
- **Convergence surfaces render clean:** Governance Forum agenda pulls canonical RSK-003/004/009/001; Incident Playbook shows the 5-record unified register (INC-1042/1051/1048/1039/1035) across all 6 stages.

### Defect-status ledger

| ID | Defect | Status | How verified |
| --- | --- | --- | --- |
| P1-1 | Gov score not single-sourced (72/74/79/69) | ✅ **Fixed** | Live: **75** everywhere; source `GOVERNANCE_SCORE` (`lib/governance.js`) imported into `caio.jsx` |
| P1-2 | CEO risk tables hardcoded/contradictory | ✅ **Fixed** | Source `CEO_RISKS=[...riskRegister]` (`ceo.jsx:396`); live counts Critical 2 / High 3, rows match canonical |
| P1-3 | "Open risks" 5 sources / 4 values | ✅ **Fixed** | Source `RISK_OPEN=riskRegister.length` (`caio.jsx:44`); live: 12 consistent |
| P1-4 | Framework/compliance scores forked | ✅ **Fixed** | Source: `canonStdScore` reconciles `STANDARDS_MAP` to `AC_FRAMEWORK_POSTURE` (`core.jsx:1112-1118`) |
| P1-5 | `PORTFOLIO` vs `acInitiatives` split | ✅ **Fixed** | Source: ai-001 `lifecycle:"Production"`, ai-003 `"Scaling"`; `pf-fraud` risk `"Medium"` aligned |
| P2-1 | Dead-end "＋ New Project" | ✅ **Fixed** | Source: `onNew` → `showToast("New project — intake started")` (`caio.jsx:262`) |
| P2-2 | Trust-Agent prompt wrong cert figures | ✅ **Fixed** | Source: hardcoded 65/91/81/72 removed from `compliance.jsx` prompt |
| P2-3 | 3 client calls bypass gateway | ✅ **Fixed** | Source: no `api.anthropic.com` in components; `askGateway()` used in `dashboard.jsx` + `compliance.jsx` |
| P2-4 | RBAC gates only 3/9 stores | ✅ **Fixed** (design caveat) | Source: `STORE_REQUIREMENT` now 7 stores (`rbac.ts:54-61`). Demo/no-DB mode still enforces nothing server-side — unchanged by design |
| P2-5 | Fraud model tri-state | ✅ **Fixed** | Source: `pf-fraud` risk `"Medium"`. _Residual:_ one narrative literal still says "17 models" (see below) |
| P3-1 | `FilterMap` on old `CONTINENTS` | ✅ **Fixed** | Source: `FilterMap` now maps `WORLD_GEO` (`ceo.jsx:495`) |
| P3-2 | `npm run lint` fails (2 errors) | ✅ **Fixed** | `eslint .` → 0 errors, 4 warnings |
| P3-3 | Workbench "Draft generated" affordance | ⬜ **Not addressed** | Still present (`workbench.jsx:143`) — out of the data-integrity remediation scope |
| P3-4 | Invalid `/workspace/<bad>` → login | ⬜ **Not addressed** | Client-side fallthrough, by design |

### Residual items (honestly disclosed, all P3 / REVIEW)
- **R1 (P3, data-integrity):** `platform-models.ts:634` maturity insight still reads _"10 of **17** models lack completed cards"_ — contradicts the derived 8-model count. A narrative literal, not a headline metric.
- **R2 (REVIEW):** CEO "Highest-Risk Program" card shows `Governance 74%` as a hardcoded **program-level** completeness figure (a different object from the enterprise score); should derive from that initiative's record.
- **R3 (P3):** `caio.jsx` "ISO 42001 81%" readiness tile is a hardcoded literal (minor; not currently contradicted elsewhere).

**Net:** the audit's core finding — _the same headline metric rendering different values per screen_ — is resolved. What remains is narrative/program-level polish, plus the breadth of surfaces this pass did not deep-test.

---

## Critical defects

### P0 — Blocking
None. The application runs, builds, and is navigable; no defect fully blocks use.

### P1 — Major (data trust / core value prop)

**P1-1 — AI Governance Score is not single-sourced (reads 72 / 74 / 79 / 69).**
- Severity: P1 · Screens: CAIO Overview, CEO cockpit, AI Central, Reports · Roles: CAIO/CEO/all
- Steps: view the governance score on each surface.
- Expected: one canonical score everywhere. Actual: `GOV_SCORE=72` (`caio.jsx:46`), CEO "74%" tile, AI Central 79, Reports 69.
- Evidence: `caio.jsx:46`; `ceo.jsx` governance tile; aicentral/reports.
- Root cause: hardcoded per-screen literals; no shared computed source. `caio.jsx:46`'s 72 even contradicts its own weighted inputs (which compute 75).
- Fix: derive from one governance engine; render it everywhere.

**P1-2 — CEO risk tables hardcoded and self-contradictory; diverge from canonical `riskRegister`.**
- Severity: P1 · Screen: CEO Overview → Risk tab & Risk Center · Role: CEO
- Steps: compare the two CEO risk tables and the canonical register.
- Expected: both read `riskRegister` (`platform-models.ts:785`). Actual: two inline arrays (`ceo.jsx:400-407`, `ceo.jsx:752`). RSK-004 "Adverse-decision harm" = **Critical** in canonical, rendered **"Critical·12"** in one table and **"High·12"** in the other. "Model drift…High·8", "Vendor concentration…Medium·6" are invented; "Workforce displacement…Low·3" contradicts canonical High. (riskcenter.jsx & aicentral.jsx read canonical correctly.)
- Fix: replace both inline arrays with `riskRegister` reads.

**P1-3 — "Open risks" count has 5 sources / 4 values.**
- `ceo.jsx:411` 12/25 · `caio.jsx:210` 12 · `core.jsx:790-803` per-role 8/14/19/11/23 · `core.jsx:1698` CISO 6. CAIO shows **12 on one screen, 8 on another**.
- Fix: compute from `riskRegister` with a role filter.

**P1-4 — Framework / compliance scores forked across the app.**
- ISO 27001 = 79/65 · ISO 42001 = 74/58/61/81 · SOC 2 = 86/91 · GDPR = 83/88/81 · EU AI Act = 68/72, across canonical posture, `core.jsx:917-954 STANDARDS_MAP` (which disagrees with itself), and hardcoded assistant prompts.
- Fix: one framework-posture source.

**P1-5 — Split source-of-truth: `PORTFOLIO` vs `acInitiatives` (claims "one record", isn't).**
- `portfolio.js` header claims a single initiative record, but ai-001 lifecycle = In Production vs Pilot; ai-003 risk = Low vs Medium between the two arrays.
- Fix: one initiative registry; derive role lenses from it (do not duplicate).

### P2 — Moderate

**P2-1 — Dead-end button: CAIO · Risk Center · "＋ New Project".** Verified twice (isolated): DOM/URL/inputs/dialogs byte-identical before/after, no error. Looks actionable, does nothing. (`/workspace/demo/caiorisk`)
**P2-2 — Trust-Agent prompt hardcodes WRONG cert figures** (`compliance.jsx:865`: ISO27001 65, SOC2 91, GDPR 81, EUAI 72 vs canonical 79/86/83/68) — becomes authoritative customer-facing fact if an API key is ever configured.
**P2-3 — 3 client-side calls to `api.anthropic.com` bypass the server gateway** (`dashboard.jsx:219`, `compliance.jsx:865`, `compliance.jsx:1049`) — no policy enforcement, can't carry a key safely, errors out in-browser.
**P2-4 — RBAC coverage partial.** `STORE_REQUIREMENT` gates only 3 of 9 bus stores (decisions/adminAudit/rbacPolicy); evidence/ideas/policies/violations/taxonomy have no write-capability check. Also all checks are behind `authConfigured()`, so **demo/no-DB mode enforces nothing server-side** (`app/api/bus/[store]/route.ts:95`).
**P2-5 — Fraud Detection Model in 3 conflicting governance states** (ungoverned RSK-010 / governed-under-ai-002 MODEL_REGISTRY m4 / standalone pf-fraud); model count 8 vs "17" in maturity prose.

### P3 — Minor
**P3-1 — `FilterMap` still uses old blocky `CONTINENTS`** (ceo.jsx:486) — the one remaining map not matching the new natural/world treatment. (Your "all maps" note.)
**P3-2 — `npm run lint` fails** — 2 `require()` errors in **dev scripts** (`scripts/click-audit.js`, `scripts/feature-test.js`), not shipped code; + 4 unused-var warnings.
**P3-3 — `workbench.jsx` shows "Draft generated" placeholder** narration implying an action completed that didn't (no invented data, but misleading affordance).
**P3-4 — Invalid `/workspace/<bad>` falls through to the login screen** (client-side); no real server 404.

---

## Click-integrity report (sample)
| Metric | Value |
| --- | --- |
| Interactive elements actually clicked | 45 |
| PASS | 39 |
| FAIL (dead-end) | 1 (CAIO Risk Center "＋ New Project") |
| REVIEW (benign: active-tab no-ops / card-vs-row notes) | 5 |
| Dead ends confirmed | 1 |
| Runtime/console errors across surfaces | 0 |

## Navigation matrix (verified sample)
| Source | Object | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| Universal search "credit" | Credit Decision Assurance | Initiative workspace | `/workspace/aicentral/initiatives` | PASS |
| CEO Overview | KPI/lineage rows (`.vz-lrow`) | Lineage drawer | Drawer opens | PASS |
| CAIO Overview → surfaces | sidebar items | Correct surface | Correct | PASS |
| CAIO Risk Center | "＋ New Project" | Create flow | Nothing | **FAIL** |
| Sidebar (per role) | nav items | role surfaces | correct | PASS |

## Data traceability (sample)
| Metric | Source | Traceable? |
| --- | --- | --- |
| CEO portfolio value / ROI / budget | `portfolio.js PF` | ✅ derived |
| CEO compliance % (77) | `COMPLIANCE_PCT` | ✅ |
| Open incidents (3) | `OPEN_INCIDENTS` | ✅ |
| AI Governance Score | hardcoded per screen | ❌ 72/74/79/69 |
| CAIO GOV_SCORE (72) | `caio.jsx:46` literal | ❌ contradicts computed 75 |
| Open risks | 5 sources | ❌ 4 values |
| Framework scores | forked | ❌ |
| CEO risk table rows | inline literals | ❌ contradict canonical |

## Role testing
| Role | Sidebar/dashboard render | Live journey depth | Notes |
| --- | --- | --- | --- |
| CEO | PASS | Overview + Risk | risk data defects (P1-2) |
| CAIO | PASS | Overview + Risk Center | dead-end button (P2-1) |
| CISO | PASS | Overview + Threat Center | clean in sample |
| CFO | PASS | Overview + Financial Risk | clean in sample |
| Employee | PASS | Overview + My Initiatives | no unauthorized exec info seen in sample |
| COO/CDPO/CGO/CRO/Legal/Manager | render-only (earlier walk) | NOT VERIFIABLE (live journey) | render clean, no deep click test |

## AI Initiative traceability
The object graph (initiative → risk → AIRA/AIRT → control → policy → evidence → approval → PMO → ROI → dashboard) **exists in code** and largely reads canonical sources in AI Central / Risk Center. **But** the CEO lens and several KPIs read *parallel hardcoded copies*, so the same initiative/risk can present contradictory figures depending on entry point (P1-2, P1-5). Full per-initiative chain traversal in the UI: **NOT VERIFIABLE** in this pass.

## Veris Intelligence findings
- **Honest degradation: PASS.** Gateway returns `{enabled:false}` w/o key (`route.ts:23`); `advisor.jsx` falls back to a **real-data-grounded** responder (`answer()`), does **not** invent numbers.
- **Hazards:** `workbench.jsx` "Draft generated" placeholder (misleading affordance); Trust-Agent prompt hardcodes wrong certs (P2-2); 3 direct `api.anthropic.com` calls bypass the gateway (P2-3).
- Live per-role contextual answers with a real key: **NOT VERIFIABLE** (no key configured).

## UX findings
- Strong, consistent visual system; polished cockpit. (REVIEW) Some executive dashboards are dense with overlapping concepts (multiple risk tables, repeated KPIs) — the data-duplication defects *manifest* as UX confusion (same metric, different number). Deep first-time-user heuristic pass across all screens: NOT VERIFIABLE.

## Accessibility
- Icon-only buttons missing accessible name: **0 / 64** (CEO home) — PASS.
- Visible focus outline on Tab — PASS. ⌘K palette opens, focus enters, **Escape closes** — PASS.
- Full focus-**trap** cycle, contrast audit, and a11y beyond CEO home: **NOT VERIFIABLE**.

## Security
- Real RBAC matrix (`lib/rbac.ts`) + server enforcement on writes (403). **Gaps:** 3/9 stores gated; all checks behind `authConfigured()` → **no server enforcement in demo mode**; demo role-switcher exposes all role data (intentional for demo, but all seeded data ships to the client). Direct-URL/deep-link permission probing with auth ON: NOT VERIFIABLE (no DB configured here).

## Performance
- Production build: 261 kB first-load JS (main); 10 routes. No obvious excessive-render or duplicate-request patterns spotted statically. Live timings (route transition, search, large tables): **NOT measured**.

## Automated tests
- **No unit/e2e framework is installed** (`package.json` `test` = `next build`; no jest/vitest/playwright deps). `testing-agent/` holds prior report artifacts, not runnable tests. This session used ad-hoc Playwright harnesses.
- Build: **PASS**. `npm test` (= build): **PASS**. Lint: **FAIL** (2 dev-script errors). Typecheck via `next build`: **PASS** (raw `tsc` shows spurious `.next/types` noise only).

---

## The 10 requested summaries

**1. Overall score:** **83 / 100** post-remediation (original audit baseline **64 / 100**; see [§ Remediation verification](#remediation-verification-this-pass)).

**2. Top 10 defects:** P1-1 governance-score split; P1-2 contradictory CEO risk tables; P1-3 open-risks 4 values; P1-4 forked framework scores; P1-5 PORTFOLIO≠acInitiatives; P2-1 dead-end "New Project"; P2-2 wrong hardcoded certs in prompt; P2-3 gateway-bypassing anthropic calls; P2-4 partial RBAC; P2-5 Fraud model tri-state.

**3. Top 10 UX problems:** duplicate risk tables on one screen; same KPI different numbers across screens; dense executive dashboards; "Draft generated" false affordance; dead-end create button; FilterMap visual inconsistency vs ExposureMap; ambiguous whether cards are clickable (mixed `<button>` vs row patterns); (REVIEW) tab density; (REVIEW) way-back/context on deep drawers; (NOT VERIFIABLE) first-time comprehension across all screens.

**4. Top 10 navigation problems:** 1 confirmed dead-end (CAIO New Project); (mostly PASS otherwise) — canonical routing and search route correctly in the sample. Remaining are NOT VERIFIABLE (untested surfaces/roles), not known failures. _Navigation is a relative strength; do not over-report problems here._

**5. Top 10 data-integrity problems:** governance score 72/74/79/69; open-risks 4 values; framework scores forked; CEO risk tables invented/contradictory; PORTFOLIO≠acInitiatives; GOV_SCORE literal ≠ computed; Fraud model tri-state; model count 8 vs 17; per-role KPI literals (core.jsx:790-803); STRAT_PILLARS sum ≠ PF.budget.

**6. Security findings:** RBAC real but only 3/9 stores gated and unenforced in demo mode; all seeded data ships client-side; no server-side route/profile validation; deep-link/permission probing with auth ON not verifiable here.

**7. AI / Veris Intelligence findings:** degrades honestly (no fabricated numbers) — good; but wrong hardcoded certs in Trust-Agent prompt, `api.anthropic.com` browser calls bypass the gateway, and a misleading "Draft generated" placeholder. Live keyed behavior not verifiable.

**8. Genuinely production-ready:** app shell/build/routing; universal search; AI honest-degradation; RBAC model & admin portal; accessibility basics on tested surface; the (newly shipped) CEO ExposureMap and canonical-reading Risk Center / AI Central surfaces.

**9. NOT production-ready:** the cross-screen metric layer (governance score, open risks, framework/compliance %, CEO risk tables) — contradictory & partly hardcoded; single-source-of-truth for Initiative/Framework/Model; the dead-end create action; RBAC store coverage; the Trust-Agent cert figures & gateway bypass.

**10. Recommended remediation order:**
1. **Single-source the headline metrics** (governance score, open risks, framework/compliance %) — one engine, read everywhere (fixes P1-1/1-3/1-4).
2. **Delete the hardcoded CEO risk tables; read `riskRegister`** (P1-2).
3. **Unify Initiative & Model sources of truth** (P1-5, P2-5).
4. **Fix the dead-end "New Project"** and audit remaining create actions (P2-1).
5. **Route the 3 `api.anthropic.com` calls through the gateway; correct/derive the Trust-Agent cert figures** (P2-2/2-3).
6. **Extend RBAC `STORE_REQUIREMENT` to all stores** (P2-4).
7. **Swap `FilterMap` to `WORLD_GEO`** for map consistency; fix lint errors (P3-1/3-2).
8. Add a real Playwright test suite to lock the above (Phase 22).

_No code was modified during this audit, per instruction._
