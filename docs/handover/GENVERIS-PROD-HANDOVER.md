# GenVeris PROD — Build Handover (Python)

**Audience:** the Claude Code session that builds GenVeris PROD, and the people who review it.
**Prepared:** 2026-10-12. Source repo `EmanGeniaz/veris` at commit `4588c9a` on `main`.
**Status:** a complete brief. The new session builds from this document. It doesn't need this chat.

**How to read it:** sections 0–3 are the rules and decisions. Sections 4–9 are *what* to build. Sections 10–14 are *how* to build and verify it. Section 15 lists the decisions that are still open, which you must ask about before acting on them.

---

## 0. The ask, in the owner's words, and what it means

The owner (Sikander Ahmed, Geniaz) asked for:

1. A **new repository**, which already exists: **https://github.com/EmanGeniaz/GenVeris-PROD**.
2. A **clone of the platform** built as the demo at `console.veriszone.com`. Its source is `EmanGeniaz/veris`.
3. A **production version** connected to **`platform.veriszone.com`**.
4. **A clean slate.** The demo is full of fabricated and synthetic data. PROD has **none**. It contains real features only, so QA can test them with real use cases.
5. **Python.** The demo is entirely Next.js. PROD is Python.
6. The build happens **in a new chat**, so the demo isn't disturbed.
7. **A real login.** No demo login.
8. **Everything the demo has gets built.** Owner's words: *"Demo has everything — build everything that has in demo."* Nothing is hidden, stubbed or "coming soon". Every capability the demo *shows* must *work* in PROD on real data.

Decisions the owner has already made (2026-10-12):

| Decision | Choice |
|---|---|
| Backend | **Python** (FastAPI recommended, see §3) |
| Frontend | **React**, a separate SPA. Port the demo's screens; don't re-invent the UX. |
| Hosting | **AWS** |
| Database | **A new, separate PostgreSQL**. Never the demo's Supabase database. |
| Scope | **Full parity with the demo.** Every feature is built real, with no fabricated data anywhere. |
| Login | **Real authentication only.** No demo login, no persona picker, no shared password, no seeded accounts. |

---

## 1. Non-negotiable rules for PROD

Every one of these is an acceptance criterion. If a change breaks one, it's a defect.

**R1 — Zero fabricated data.**
- No hardcoded arrays of initiatives, risks, KRIs, users, incidents, KPIs, spend, scores, percentages, counts or "recent changes".
- No seed data in any tenant.
- Every number on screen is computed from that tenant's own rows, or the screen shows an empty state.
- *Reference content* is allowed: framework requirement texts, lifecycle phase templates, glossary, course content, detector patterns. Keep it as versioned reference data (§7). But **a status, score or count is never reference content.**

**R2 — Real login only.**
- Email and password accounts with verified email, plus SSO (Microsoft Entra ID and Google, via OIDC).
- Sessions are server-side and secure.
- Every route is authorised on the server.
- **Remove entirely:** Demo Center, persona picker, `DEMO_PASSWORD`, `/api/demo-login`, `DEMO_SEED_PASSWORD`, seeded `role@<slug>.genveris.demo` users, the `demo` and `aicentral` session modes, `USER_PROFILES` and the "Manage demo identities" editor.

**R3 — Tenant isolation everywhere.**
- The tenant always comes from the **authenticated session**.
- Nothing the client sends (body, query, `Host`, `X-Forwarded-Host`) can choose or widen the tenant.
- Every table carries a `tenant_id` with a foreign key, and every query filters on it.

**R4 — RBAC on every route, on the server.**
- The 13-role × 7-module matrix (§6.3), with per-tenant overrides, is enforced by the API on **every** read and write. In the demo it is only enforced on `/api/bus`.
- The UI hides what the API would refuse, but the API is the boundary.

**R5 — Honesty.**
- Never show "Live" or "Connected" unless it really is.
- Never claim "compliant" or "certified". Use "control coverage" and "audit readiness" (Charter rule).
- An empty state is the truth. Keep the honesty vocabulary (§6.9).

**R6 — The six-control security baseline (§11)** on every change. CI enforces it.

**R7 — Human accountability.**
- Agents never act on their own. `propose` and `act` actions need a human approval, recorded under that **human's** identity.
- "Human decision wins" in the Evidence Fabric must be *authenticated*, not something the client claims.

**R8 — Tamper evidence.**
- The audit trail and the Evidence Fabric are hash-chained, appended under a lock with a per-tenant sequence, and checkable on demand.

**R9 — Leave the demo alone.**
- Never write to `EmanGeniaz/veris`, its Vercel project, its Supabase database or `console.veriszone.com`. The demo is **read-only reference**.

**R10 — No secrets in git, client bundles, logs, docs or tests. Never put a model identifier in commits, PR text or code comments.**

---

## 2. Where things are

| Thing | Location | Notes |
|---|---|---|
| **PROD repo (build here)** | `https://github.com/EmanGeniaz/GenVeris-PROD` | New and empty. All PROD work goes here. |
| Demo source (read-only) | `https://github.com/EmanGeniaz/veris` | Next.js 15.5, React 19.3, Prisma 6.19, Auth.js v5 beta. About 38k lines: 30 API routes, 114 `lib/` modules, 41 components, 28 Prisma models. Add it to the session with read access to consult code. |
| This handover | `veris` repo: `docs/handover/GENVERIS-PROD-HANDOVER.md` | Copy it into `GenVeris-PROD/docs/` in your first PR. |
| Demo site | `console.veriszone.com` (the e2e config also says `console.genveris.com`) | Vercel project `geniaz/veris`. |
| PROD target domain | `platform.veriszone.com` | **Check what serves it today before any DNS change** (§15, D5). Evidence suggests it currently points at the *demo* Next.js build, with a live database and `AUTH_SECRET` **unset**, which is insecure (§13.1). |
| Demo database | Supabase Postgres | **Do not use.** PROD gets a new database on AWS. |
| Product docs in `veris` | `README.md`, `CLAUDE.md`, `docs/CHARTER.md`, `docs/SPEC.md`, `docs/GANTT.md`, `docs/ROADMAP.md`, `design_Philosophy.md`, `docs/design/*` (WS1 Fabric, WS2 Enforce entitlement, Enforce integration contract, Enforce porting brief, BL-07 retention, positioning), `docs/AUTH-SETUP.md`, `docs/runbooks/BL-00-provisioning.md`, `docs/GenVeris-Glossary-EN-AR.pdf` | Read CHARTER, SPEC and design_Philosophy before designing screens. |
| Brand assets | `veris/public/brand/*`, `veris/public/fonts/*` | See §6.10. |
| Open issues in `veris` | #142, #145, #166–#173, #180 | Summarised in §14. Their requirements apply to PROD. |

---

## 3. Target architecture (proposed; confirm the items marked ⚑)

```
                    platform.veriszone.com
                            │
                     CloudFront + AWS WAF  ───────────── S3 (React SPA build, private, OAC)
                            │ /api/*
                    Application Load Balancer
                            │
            ECS Fargate: api (FastAPI/uvicorn)   ECS Fargate: worker (jobs + scheduler)
                 │            │          │                 │
     RDS PostgreSQL 16   ElastiCache   S3 (uploads,     same DB / Redis
     (+pgvector, Multi-AZ)  Redis      exports; private,
                                        KMS, never public)
                 │
      Secrets Manager + KMS · CloudWatch Logs/Metrics/Alarms · AWS Backup
      Outbound: Anthropic API, OIDC IdPs (Entra/Google), customer
      integrations (ServiceNow/Jira/...), Veris Enforce admin API
```

**Backend (Python 3.12+)**

| Concern | Choice |
|---|---|
| API framework | FastAPI. Pydantic v2 for every request model, with `extra="forbid"`, strict types, and length/format/enum limits. |
| Data access | SQLAlchemy 2.0, async with asyncpg. |
| Migrations | **Alembic.** Never use `db push`, and never change schema at build time. |
| Cache and coordination | Redis: rate limits, auth backoff, concurrency caps, token revocation, ingress rate, locks. |
| Background work | A worker service for the agent scheduler, retention sweep, integration sync and export jobs. Arq, Celery or RQ, plus a scheduler; pick one and justify it. |
| LLM | The official `anthropic` SDK, with timeouts, retries and real `usage` token counts. Confirm current model IDs with the `claude-api` skill. **Don't** carry over the demo's model strings. |
| RAG | pgvector embeddings. The demo uses keyword overlap only. |
| Crypto | `cryptography`: AES-GCM through **KMS envelope encryption** for integration credentials. |
| Passwords | Argon2id (`argon2-cffi`). PROD starts empty, so the demo's scrypt format doesn't need to be supported. |
| Exports | `openpyxl` or `xlsxwriter` (XLSX), a PDF library (WeasyPrint or ReportLab), `csv`. |
| HTTP client | `httpx` with explicit timeouts on every outbound call. |
| Quality gates | Ruff, mypy (strict), pytest + pytest-asyncio + hypothesis, bandit, pip-audit. |

**Frontend**
- React 19 + TypeScript + Vite SPA.
- Port the demo's screens, navigation, design tokens, Arabic/RTL and brand. The UX is the spec.
- **Remove every hardcoded dataset from the client.**
- Data comes from the API through one typed API client, generated from FastAPI's OpenAPI schema.
- State: TanStack Query for server state and minimal local state.
- **No secrets and no tenant data in `localStorage`.** Only UI preferences.

**Same origin.** Serve the SPA and `/api/*` from the same host, `platform.veriszone.com`, through CloudFront path routing. That lets sessions be `HttpOnly; Secure; SameSite=Lax` cookies with CSRF protection, and avoids CORS.

**Environments ⚑:** `dev` (developers), `staging` (QA's main test bed, with production-like data shapes but no customer data) and `prod` (`platform.veriszone.com`). Each has its own database, Redis, secrets and IdP app registrations. Confirm with the owner whether QA tests in staging, in prod, or both (D4).

**Region ⚑:** recommend `me-central-1` (UAE) for data residency, because the product is Arabic-first and ships a UAE/Dubai regulatory pack (Charter D8/D9). Confirm with the owner (D2).

**Infrastructure as code:** Terraform or AWS CDK in `infra/`. **Ask the owner before provisioning anything or changing DNS** (CLAUDE.md: production infrastructure changes need approval).

**Suggested repo layout**
```
GenVeris-PROD/
  api/            FastAPI app (app/, tests/, alembic/, pyproject.toml)
  web/            React + Vite SPA (src/, tests/, package.json)
  worker/         or api/app/worker  (scheduler + jobs)
  reference/      versioned reference catalogues (YAML/JSON) + loader
  infra/          Terraform/CDK
  extension/      browser extension (ported, see F-79)
  docs/           this handover, ADRs, runbooks, API docs
  .github/        CI workflows, PR template, CODEOWNERS, dependabot
  CLAUDE.md       ported + adapted (see §12)
```

---

## 4. The product, in one page

GenVeris is an **Enterprise AI Governance control plane**: *"the control plane where an enterprise plans, governs, ships and proves the value of every AI initiative … under one auditable system of record."* Tagline: **"Govern AI with certainty."** The company is **Geniaz**.

- **One object model, the AI initiative**, moving through **one 13-phase lifecycle**:
  Opportunity → Business Case → Discovery → Architecture → Governance → Development → Testing → Pilot → Deployment → Monitoring → Optimization → Scale → Retire.
  Each phase has mandatory deliverables and a RACI (`veris/lib/platform-models.ts` → `AC_PHASES`).
  The demo also has a 9-stage `LIFECYCLE_ORDER` (New Ideas … Retired) for the portfolio view. Reconcile the two (D11).
- **Governance spine.** Posture is **computed, never asserted** (Charter D3). There is a composite Governance Score with lineage: *"no number without lineage."*
- **Personas are lenses on the same data.** The roles are CEO, COO, CFO, CHRO, CISO, CAIO, CIO, CDPO, CGO, CRO, Legal, Manager and Employee, plus a platform Super Admin (operator).
- **Planes and products:**
  - **GenVeris**: the governance control plane and "single pane of glass".
  - **Veris Enforce**: the runtime enforcement product, sold separately and **entitlement-gated per tenant**. The "strictly-Enforce" decision D7 says that without the entitlement a tenant gets governance only. Enforce is a separate Go product. GenVeris *pulls* its decisions (§9.3).
  - **Veris Discover**: the shadow-AI and estate scanner, Enterprise tier, in a separate repo. It *pushes* findings into the Evidence Fabric.
  - **Veris Intelligence**: the in-product AI assistant.
  - **Evidence Fabric**: the canonical, tamper-evident record that all planes write to (WS1, #166).
- **Methodology:**
  - ISO/IEC 42001 operating model.
  - About 33 frameworks with computed posture: EU AI Act, NIST AI RMF, ISO 42001, 23894, 27001, GDPR, UAE and more.
  - Article 12 inference logging; Art. 14 human oversight; Art. 22.
  - AIA, DPIA and FRIA assessments; EU AI Act Art. 5 prohibited-practice screen; GPAI obligations (Art. 53/55).
  - Breach clocks; data-subject rights.
  - **Scale / Continue / Improve / Retire** decisions, where a failing risk score vetoes the outcome; governed retirement reasons.
- **Design philosophy** (`veris/design_Philosophy.md`):
  - Light mode only. Token-only colours. WCAG AA. **Exception (owner decision, 2026-10-30):** the Intelligence Home and Command Deck (F-22A/B) use a dark, brand-derived immersive theme; the classic workspace stays light. Tokens are in `docs/design/intelligence/README.md`.
  - Deterministic rendering. "Reflow, never clip" down to 390 px.
  - Minimum text sizes 14 / 12 / 11 px.
  - Arabic/RTL first (D8). UAE/Dubai pack (D9).
  - SaaS now, self-host later (D2).

---

## 5. Feature parity matrix — build ALL of these, real

This is the master scope. Each row is a capability that exists in the demo, and PROD builds every one.

**How to read the columns:**
- "Demo state" says how it works today:
  - **REAL**: a working route and table.
  - **MIXED**: live data first, with a seed fallback.
  - **DEMO**: fabricated client-side.
- "PROD requirement" says what it must do with real data. Where the demo was fake, PROD needs new data entry or ingestion, so the numbers come from the tenant.
- "Demo reference" points at the files to read for UX and logic.

Each row has an ID so QA can trace it.

### 5.1 Identity, access, tenancy

| ID | Capability | Demo state | PROD requirement | Demo reference |
|---|---|---|---|---|
| F-01 | Sign-in (email + password) | REAL only if `AUTH_SECRET` and DB are set; otherwise a demo persona gate | Real credentials. Argon2id. Verified email. Generic errors. Per-IP and per-account rate limit with exponential backoff (§11). Server sessions. | `veris/auth.ts`, `GenVerisPlatform.jsx:308-562` |
| F-02 | SSO: Microsoft Entra ID and Google | Providers configured; **no button in the UI**; SSO users get **no User row** | OIDC through Authlib. Sign-in buttons. **Provision or link the user** on first sign-in. **Map email domain to tenant** with an allow-list; never let an arbitrary Google account in. Role defaults to `employee`. | `auth.ts` |
| F-03 | Self-registration | REAL, but **joins an existing tenant** by org or email-domain slug, with no verification (a security hole) | Two flows. (a) **Create a new organisation**: the registrant becomes the tenant's first admin after email verification. (b) **Join by invitation only.** Never auto-join by slug or domain unless that domain is verified and allow-listed by the tenant admin. Role is always least privilege. | `app/api/register`, `lib/identity.ts` |
| F-04 | Sign-out | Clears client state only; **the session cookie survives** | Revoke the server session and clear the cookie. | `GenVerisPlatform.jsx:831-839` |
| F-05 | Session persistence, deep links, refresh | Loses the real identity on refresh | The session carries the user, tenant and role. Deep links to `/workspace/<role>/<tab>` work after sign-in. A URL role the user doesn't hold → 403 or redirect. | |
| F-06 | Password reset, email verification, account lockout through backoff | Missing | Build them, using signed single-use tokens and an email provider (SES). | |
| F-07 | MFA ⚑ | Missing | Recommended: TOTP for admins at minimum. Confirm with the owner (D3). | |
| F-08 | Create workspace (tenant onboarding) | Operator token form on the login screen | Moves to (a) self-serve "create organisation" (F-03) and (b) the Super Admin console (F-71). There's no "seeded demo" mode. | `app/api/admin/tenants` |
| F-09 | Profile and account settings | Persona editor that ships **plaintext passwords** in the client | Real profile (name, language, palette, notification preferences), change password, sessions list, sign out of other sessions. | `PageProfile` / `AppearanceCard` |
| F-10 | Role and permission enforcement | Server-side only on `/api/bus`; the UI trusts the URL role | Server-side on every route (§6.3). The role comes from the DB on each request (or a short cache), so a role change applies immediately. | `lib/rbac.ts` |
| F-11 | Per-tenant RBAC overrides (access matrix) | `RbacGrant` through the bus | Same model; audited; only tenant admins. | `admin.jsx`, `RbacGrant` |

### 5.2 Shell and cross-cutting UX

| ID | Capability | Demo state | PROD requirement | Demo reference |
|---|---|---|---|---|
| F-12 | Role-aware sidebar, Enterprise group, Admin Portal entry, AI Central module locks | Works on fabricated role centres | Same navigation, driven by the RBAC capability matrix from the API. `acAccessFor` must **fail closed** (in the demo, an unknown role gets full CAIO access). | `GenVerisPlatform.jsx:148-305`, `core.jsx` `AI_CENTRAL_NAV`, `AC_RBAC` |
| F-13 | Universal search and ⌘K command palette | Indexes seed arrays | Server-side search over the tenant's own entities (initiatives, risks, policies, controls, people, knowledge, templates) plus reference catalogues. RBAC-filtered. | `palette.jsx` |
| F-14 | Guided tour | Opens automatically in the demo | Optional onboarding tour for new users, started on demand; nothing seeded. | `tour.jsx` |
| F-15 | Veris Intelligence assistant (floating, on every page) | Gateway, or a seed-grounded fallback | Real gateway (F-50), grounded **only** in the tenant's own data and knowledge, with citations. With no model configured, show an honest "unavailable" message, never a fake answer. | `advisor.jsx` |
| F-16 | Live/Demo telemetry badge | "Live" whenever a DB is set, even on constant panels | Replace with a per-surface provenance badge: computed from tenant data / awaiting data / integration not connected / not entitled. No "Demo" state in PROD. | `telemetry-badge.jsx` |
| F-17 | Connector status tags | 5-state vocabulary | Keep the vocabulary exactly (§6.9), driven by real connection state. | `lib/connector-status.ts` |
| F-18 | AI disclosure footer on AI output | "◆ AI-assisted · via the governed Gateway · logged to Article 12" | Keep it, and make it true: every AI output is logged to the Article 12 record. | `core.jsx` `AIDisclosure` |
| F-19 | Empty workspace state | `FreshWorkspaceEmpty` | Every surface has a designed empty state with a "next step" call to action. | `GenVerisPlatform.jsx:668-714` |
| F-20 | EN/AR language toggle, RTL | Partial; many screens not translated; Arabic text still says "VerisZone" | **100% of strings** in EN and AR through gettext-style catalogues. `<html lang dir>` set correctly. Arabic brand name corrected. | `lib/i18n.js` |
| F-21 | Palettes and theming | 12 palettes, light mode only | Same tokens (§6.10); user preference saved on the server. | `core.jsx` `T`, `PALETTES` |
| F-22 | HITL count pill (top bar) | Seeded counts | Real count of pending approvals assigned to the user. | `core.jsx` `HITL` |
| F-22A | **Intelligence Home: the first screen after sign-in** (owner request, 2026-10-30) | Built in the demo: `docs/design/intelligence/` (spec + screenshots) | **This replaces the regular dashboard as the landing screen.** "How may I help you?" ask bar: explicit "open …" requests navigate directly; everything else goes through the governed gateway with provenance labels; voice input where the browser supports it. Below it, the top 5 **burning issues** ranked through the role's filter (approvals, high/critical risks, KRI breaches, open incidents, breach-notification clocks, stale evidence, budget overruns, coverage gaps), computed from **tenant data only**. Each issue has why, metric, owner, one action and "Ask about this". Empty tenant shows "All clear". Buttons to the Command Deck and the classic dashboard. A per-user "skip on sign-in" preference, **saved server-side** in PROD. | `components/platform/intelligence.jsx`, `lib/burning-issues.js` (+ `scripts/burning-issues-test.mjs`, 46 checks) |
| F-22B | **Command Deck** (interactive dashboard) | Built in the demo | Governance Core (score with lineage) with six orbiting planes (Portfolio, Risk, Compliance, Runtime, Agents, Evidence) → drill panel → "Open in classic workspace". KPI strip, burning queue, live inference feed, AI spend gauge, control coverage (EU AI Act / ISO 42001 / NIST AI RMF + Govern/Map/Measure/Manage), governed agents, 13-phase lifecycle with blocked gates, and the evidence chain of custody (real chain verification). **Every value from tenant data**; empty states when there is none. Always one click from the classic dashboard and back (◆ Intelligence pill in the classic top bar). | same |
| F-22C | **Live Security: agent monitoring and security applied live** (owner request, 2026-10-30) | Built in the demo as a labelled *simulation*: synthetic traffic, real engines (`lib/live-showcase.js`, 29 checks) | **In PROD this shows REAL traffic only.** Feed it from real gateway inferences and real agent tool calls (Article 12 records plus agent-run telemetry), streamed live (WebSocket or SSE). Contents: the 8-stage pipeline visual with the deciding stage, reason and policy clause; the agent fleet monitor (status, breaker score and state, recent decisions, counters); a **kill switch** and **human resume**, which in PROD call the real breaker / token revocation and are audited under the human; threat counters; the enforcement stream; and the Home live ribbon. **The demo's synthetic background stream must not exist in PROD (R1).** The Attack lab and "Test your own prompt" become a **Security test bench**: test actions run through the real pipeline, are marked `test=true`, appear only in the test view, and **never count in production telemetry or the Article 12 record of real traffic**. RBAC: CISO/CAIO/CGO for kill switch and resume. | `components/platform/intelligence.jsx` (`LiveSecurity`, `FleetMonitor`, `Pipeline`, `AttackLab`, `LiveRibbon`) |

### 5.3 Persona command centres (every number computed from tenant data)

| ID | Persona | Surfaces to build | Demo reference |
|---|---|---|---|
| F-23 | CEO | Home tabs (overview / risk / value / adoption / exposure map / compliance), playbook, portfolio, budget, risk, actions, reporting. Dashboard layout preferences per user. | `ceo.jsx`, `lib/portfolio.js`, `lib/initiative-facets.js`, `lib/world-geo.js`, `lib/reporting.js`, `lib/dashboard-prefs.js` |
| F-24 | CAIO | Home, playbook, governance, reports, incidents, AIA, risk, library, crosswalk, SoA, templates, drift, guardrail layers, hallucination monitor, Evidence Fabric panel. **Governance Score computed with lineage.** No hardcoded "9 projects / 24 policies / ISO 81%". | `caio.jsx`, `lib/governance.js` |
| F-25 | COO, CFO, CHRO, CIO, CDPO | Overview plus 6 surfaces each (playbook, domain views, reports) | `rolecenters.jsx`, `lib/role-centers.js` |
| F-26 | CISO | Overview plus 23 surfaces: Enforce/guardrail set, threat, workflows, incidents, vulnerabilities, guardrails, red-team, reports | as above |
| F-27 | CGO | Overview plus about 40 surfaces: governance, convergence, guidebook, Enforce | as above |
| F-28 | CRO | Overview, risk appetite, risk register, controls (KRIs), audit, reports | as above |
| F-29 | Legal | Overview, regulatory, crosswalk, jurisdictions, contracts, conformity, Article 12, evidence, reports | as above |
| F-30 | Employee | Home, assistant (workbench), learning, approved-tool hub, propose a project, my tasks, my usage, my risk, my requests, my reports, help | `ROLE_CENTERS.employee`, `workbench.jsx` |
| F-31 | Manager | Everything Employee has, plus team view: roster, **real** approval queue, team guardrail events | `MGR_TEAM_VIEW` |
| F-32 | Role-centre widgets | Assistant; AIMS task inbox (F-60); facet band; "new project" (creates a proposed AI system in the Fabric plus an evidence entry); approve/decline actions (**real decisions**, not toasts); report builder (**real XLSX/PDF export**; the demo buttons have no handlers); scheduled delivery (real, F-75) | `rolecenters.jsx` |

### 5.4 AI Central (portfolio and lifecycle hub)

| ID | Module | PROD requirement | Demo reference |
|---|---|---|---|
| F-33 | AI Central dashboard and ownership model | Computed from the tenant's initiatives and owners | `aicentral.jsx` (3,399 lines) |
| F-34 | Strategy (pillars) | Tenant-defined strategy pillars and objectives; initiatives linked to them | `core.jsx` `PILLARS`, `PageStrategy` |
| F-35 | Portfolio (units, maturity, use cases) | Business units and maturity assessment entered by the tenant; use-case library is reference content | `PageMaturityRadar`, `PageUseCases`, `lib/use-cases.js` |
| F-36 | Repository: models, agents, prompts, tools | Tenant registers models (model registry), agents (F-56), prompts and tools; CRUD with owners | `PageModelRegistry` (`MODEL_REGISTRY`), `agents.jsx` |
| F-37 | Inventory: systems, datasets, vendors | Tenant inventory with CRUD; Discover ingest adds `AISystem` and `ShadowAIItem` (F-66) | `aicentral.jsx` |
| F-38 | **Initiative lifecycle** | Full CRUD. 13-phase board. Initiative workspace tabs: Idea→Value trace, overview, journey, PMO, value, governance, monitoring. **Phase gates enforced**: you can't advance until mandatory deliverables and evidence exist (#169). Human decides, audited. PMO milestones. | `aicentral.jsx`, `trace.jsx`, `AC_PHASES`, `acPmo` |
| F-39 | Feedback and decision | 7-dimension feedback scoring, then a Scale / Continue / Improve / Retire recommendation; a failing risk score vetoes it; governed retirement reasons; the decision is recorded and audited. The demo kept these in `localStorage` only. | `core.jsx:25`, `acFeedback`, `lib/ai-assets.js` `assetRecommendation` |
| F-40 | Gateway admin: providers, routing, guardrails, knowledge engine, modes and retention | Real provider configuration (Anthropic first); routing rules; guardrail settings per tenant; retention settings that the sweep actually honours | `aicentral.jsx` gateway tabs |
| F-41 | Templates and AI assets | Template library (reference content) plus generation of tenant documents; AI asset recommendations computed from real ROI and adoption inputs | `templates.jsx`, `template-library.jsx`, `lib/template-library.js`, `lib/ai-assets.js` |
| F-42 | Controls (controls and guardrails, matrix, risk drift) | Tenant control catalogue, mapped to frameworks; status set by humans or derived from evidence | `aicentral.jsx`, `compliance.jsx` |
| F-43 | Policies (library, violation analytics) | See F-47 | |
| F-44 | Value / AI FinOps | Real spend from gateway usage (F-50) plus tenant-entered budgets; spend by provider and agent; month-to-date filter (the demo had none) | `aicentral.jsx`, `lib/cost-engine.ts`, `lib/cost-live.ts` |
| F-45 | Trust Center, Audit Center | Tenant trust centre (published controls, evidence status); audit plans and corrective actions as real records | `core.jsx` `TRUST_CENTER_DATA`, `AUDIT_PLAN`, `CORRECTIVE_ACTIONS` |
| F-46 | Integrations page (ServiceNow / CRM / Marketplace) | Real connectors (F-80 to F-83) with honest status | `PageIntegrations` |

### 5.5 Governance, risk and compliance

| ID | Capability | PROD requirement | Demo reference |
|---|---|---|---|
| F-47 | **Policy lifecycle** | Policies with **versions, owners, review cycles, reviews, acknowledgements (attestations) and exceptions with expiry**. In the demo, `PolicyVersion`, `PolicyReview`, `PolicyAcknowledgement` and `PolicyException` are dead schema; build them all. Policies compile into **runtime rules that the gateway enforces** (in the demo the gateway enforces hardcoded rules instead). Violation analytics come from real violations. | `compliance.jsx`, `POLICY_REGISTER`, `lib/policy-rules.ts`, Prisma Policy* models |
| F-48 | **Risk register** | CRUD. Likelihood × impact → inherent risk; treatment plan (strategy, action, owner, deadline, status, priority); residual risk through `liveResidual` (13% buy-down per treatment step, 12% floor); bands ≥12 Critical / ≥7 High / ≥3 Medium. Links to initiatives, controls, frameworks and KRIs. AI recommendation from the gateway. | `riskcenter.jsx`, `lib/risk-engine.js` |
| F-49 | **KRIs** | KRI definitions (threshold, direction, unit, framework) plus **real measurements over time**, entered manually or by API; breach alerts; trend | `kriRegister`, `cro_controls` |
| F-50 | Assessment cascade (AiOA…AiRT engines, AIRA, AIRT, AIA, AIIA) | Real assessment workflows per initiative; outcomes recorded | `AI_GOV_ENGINES`, `acAssessments`, `riskcenter.jsx` |
| F-51 | Framework library (about 33 frameworks) and computed posture | Requirement catalogues are **reference data** (§7). Each tenant sets **control status and evidence per requirement**, and posture is computed Met 100 / Partial 60 / Gap 0 **from tenant data, never hardcoded**. Region applicability. | `lib/frameworks.js`, `lib/computed-frameworks.js`, about 20 mapping libraries |
| F-52 | Crosswalk (32 capabilities × EU AI Act × NIST × ISO 42001 × Singapore) and gap closure | Mapping is reference; status per tenant; gap-closure plan with real owners and dates | `lib/crosswalk.js`, `lib/gap-closure.js` |
| F-53 | ISO 42001 Statement of Applicability | Generated from the tenant's controls and justifications; exportable | `lib/soa.js` |
| F-54 | EU AI Act Art. 5 prohibited-practice screen; GPAI Art. 53/55 obligations | Per-system questionnaire with results stored; GPAI register entered by the tenant; `gpaiExposure` logic kept | `lib/prohibited.js`, `lib/gpai.js` |
| F-55 | AIA / DPIA / FRIA | Real impact-assessment workflows, completeness scoring, sign-off | `lib/impact-assessment.js` |
| F-56 | Data-subject rights and breach notification | Registers with **real regulatory clocks** (computed from received/discovered timestamps; the demo "modelled" elapsed time) | `lib/data-subject-rights.js`, `lib/breach-notification.js` |
| F-57 | Jurisdictions / regimes, UAE pack, China, India DPDPA, Australia, Singapore and regional mappings | Applicability computed from the tenant's operating regions; reference requirement text EN+AR | `lib/jurisdictions.js`, `uae-mappings.js`, `cn-measures.js`, `in-dpdpa.js`, `au-guardrails.js`, `sg-dimensions.js`, `regional-mappings.js` |
| F-58 | Evidence | Evidence records (item, initiative, scope, control, risk, owner, status, approval, version), **real file upload** (§11 control 6), versioning, approval, **freshness and expiry** (Expired / Expiring within 60 days / Valid), compliance walk-back from a control to its evidence | `compliance.jsx`, `lib/compliance-engine.js`, `lib/evidence-freshness.js` |
| F-59 | **Evidence Fabric** (canonical record) | §8.2. Kinds: AISystem, Assessment, EvidenceRef, Finding, Owner, FrameworkMapping, ShadowAIItem. Idempotent, hash-chained, human-wins (authenticated). Repository and confidence views (AI Spine). | `lib/evidence-fabric.ts`, `spine.jsx` |
| F-60 | **AIMS task inbox** | Tasks derived from the Fabric and audit (high/critical AISystem without Assessment/EvidenceRef → assessment task; Finding → finding task; `inference:escalate` → review task); acknowledge or flag, written back to the audit chain **under the human's identity** (the demo recorded `workspace`) | `lib/workspace-tasks.ts`, `rolecenters.jsx` |
| F-61 | Governance forum / council, unified incidents, ownership matrix, red lines | Real council membership, meetings and decisions; incident register (with classes); ownership matrix from real owners | `convergence.jsx`, `lib/convergence.js` |
| F-62 | Data provenance | 8-dimension provenance record per system, entered or ingested, with a **real** SHA-256 content hash (the demo used djb2) | `data-provenance.jsx`, `lib/data-provenance.js` |
| F-63 | Sustainability (energy and CO2) | Estimates from **real usage** (model class × tokens × grid intensity × PUE); assumptions shown | `sustainability.jsx`, `lib/sustainability.js` |
| F-64 | Model drift (PSI) | Real `psi()` (bands <0.10 / 0.25) over **real distributions ingested** from the tenant (API or upload) | `roadmap.jsx`, `lib/drift.js` |
| F-65 | Decisions centre and taxonomy approvals | Executive decisions recorded (the demo never persisted them); taxonomy add/request with an approve/decline workflow | `PageDecisions`, `ExecDecisionCenter`, `TaxonomyApprovals`, `lib/taxonomy.js` |

### 5.6 AI Gateway, guardrails, runtime and agents

| ID | Capability | PROD requirement | Demo reference |
|---|---|---|---|
| F-50G | **Governed AI Gateway** (`POST /api/gateway/chat`) | Pipeline (§8.4): validate → resolve tenant from session → model allow-list → input guard → (agent/tool: MCP pin, capability check, HITL, egress, runtime admit, **signed** capability token) → DLP from **tenant** policies → governed retrieval → durable memory → model → output validation → moderation → faithfulness (plus optional judge) → real usage cost → Article 12 and telemetry rows. **No demo grounding** (the demo grounded every tenant in fake initiatives). | `app/api/gateway/chat/route.ts` (386 lines) and the libs it uses |
| F-51W | Workbench / employee assistant | Conversations **saved on the server** (the demo kept them in the browser only), projects, pinned, archived; knowledge upload; client-side prompt hints. The tenant comes from the session (the demo sent `"role"`/`"demo"`). | `workbench.jsx` |
| F-52K | Knowledge base (RAG) | Upload, chunk, **embed (pgvector)** and retrieve. Per-tenant **source registry with trust tiers** (trusted 1.0 / internal 0.8 / unverified 0.4 / blocked 0). Freshness (stale over 180 days, expired over 365). Chunk validation. DLP on ingest. A client can't spoof a trusted source. | `lib/knowledge.ts`, `lib/retrieval-guard.js` |
| F-53M | Durable agent memory | Retention by data class (Public 30 days, Internal 7 days, Confidential 24 hours, Restricted never stored); partition by tenant + agent + **user** session; **scheduled sweep** (#172) | `lib/memory.js`, `lib/memory-store.ts` |
| F-54I | Input guard | Strip zero-width, Unicode Tag (E0000–E007F), bidi and control characters, and `<script>`; attachment scanning on **real bytes** (MIME allow-list, extension/MIME match, size cap, magic bytes, EICAR) plus a **wired AV service** (fail-closed configurable); per-session ingress rate in Redis | `lib/input-guard.js` |
| F-55O | Output guard and moderation | Real moderation classifier (stricter result wins over the lexicon floor), outbound timeout, safe-withheld message | `lib/output-guard.js` |
| F-56H | Hallucination / faithfulness monitor | `checkFaithfulness` (claim split, figure check, token overlap ≥0.34, absolutes penalty) plus an optional LLM judge (`auto`/`always`/`off`) using structured output; monitor dashboard over real verdicts | `lib/hallucination.js` |
| F-57E | Egress control | Per-tenant egress policy; **parse URLs** (the demo matched raw strings); SSRF and metadata detection; deny by default; telemetry | `lib/egress.js`, `lib/egress-live.ts` |
| F-58R | Runtime guard | SLO, max concurrency, rate per window, loop detection (repeats or A↔B cycles), latency P95. Enforced globally in Redis. | `lib/runtime-guard.js`, `lib/runtime-live.ts` |
| F-59B | Circuit breaker | Signal weights (injection 35, egress 30, guardrail 18, sensitive 15, drift 12, rate 10) and states (normal 0 / downscope 40 / suspend 65 / halt 85). **Must actually enforce**: downscope or suspend sessions and revoke tokens (the demo only displayed them). | `lib/circuit-breaker.js`, `lib/breaker-live.ts` |
| F-60T | Tool-call ledger and capability tokens | **Signed** (HMAC or JWT), short TTL, verified and revocable tokens; ledger from real calls | `lib/enforce.js`, `lib/enforce-live.ts` |
| F-61H | HITL gates and approvals | Configurable gates (action plus value threshold) with a real approvals queue; a working threshold (the demo's was unreachable) | `lib/hitl.js`, `PageHITL` |
| F-62M | MCP server registry | Tenant registers MCP servers; real **SHA-256 manifest pinning and signature verification**; statuses rugpull / unsigned / unpinned / unvetted / verified; blocks the bad ones | `mcp.jsx`, `lib/mcp-registry.js` |
| F-63A | Agent authority registry | Per-tenant agents with tool grants; deny-by-default capability check; least-privilege index; controls AGC-1..5; over-privilege detection; workflow and delegation checks (scope intersection, taint from source to sink) | `lib/agent-registry.ts`, `lib/agent-workflows.js`, `lib/agent-composition.js` |
| F-64C | Enforcement coverage (enforced / observed / shadow) | Computed from real registries and telemetry | `lib/enforcement-coverage.js` |
| F-65P | Policy-as-a-Service (inspect API plus console) | **Per-tenant API keys** (hashed, scoped, rotatable); the tenant comes from the key, never the body; CORS restricted; live inspector; client and key management; real stats | `app/api/policy/inspect`, `lib/policy-service.js` |
| F-66L | Article 12 inference log | Every inference logged with **user identity, request id, model, latency, tokens, cost, decision**; chain verification; export | `app/api/inference-log`, `roadmap.jsx` `Article12Log` |
| F-67G | Guardrail coverage (the 7 layers) | Generated from real capability flags (the demo overclaimed) | `lib/guardrail-coverage.js` |
| F-68 | **Governed agent runtime** | All 8 agents in the registry (§8.5): `evidence-gaps` (monitor), `evidence-freshness`/"Remediation proposer" (propose), `drift-kri`, `policy-review`, `cost-guard`, `incident-triage` (act → ServiceNow/Jira), `enforce-ingest`, `shadow-discovery`. Gate order kept. **A real scheduler** (the demo had none). Proposals queue with **RBAC on approval**, and **approval applies the effect**. | `lib/agent-runtime.ts`, `lib/agent-schedule.ts`, `lib/agent-findings.ts`, `lib/agent-proposals.ts`, `app/api/agents/*` |

### 5.7 Planes, integrations, reports, admin, learning

| ID | Capability | PROD requirement | Demo reference |
|---|---|---|---|
| F-69 | Plane entitlements (Enforce, Discover) | Per-tenant entitlements (default none; suspended doesn't count; planes isolated); granted only by Super Admin; **audited**; the UI reflects the state | `lib/entitlements.ts`, `app/api/admin/entitlements`, `app/api/entitlements` |
| F-70 | Enforce connection | Per-tenant gateway URL (SSRF-validated, **including DNS-rebinding protection**) plus a credential sealed through KMS; masked view; states not-entitled → awaiting-config → awaiting-connection → **live** (the live adapter, F-84) | `lib/enforce-connection.ts`, `app/api/admin/enforce-connection`, `app/api/enforce/connection` |
| F-71 | **Super Admin (platform operator) console** | Orgs/tenants, module enablement, entitlements, users, policy cascade, operators. **Persisted.** Restricted to a separate operator identity with MFA. The demo kept all of this in client state. | `superadmin.jsx`, `lib/superadmin.js` |
| F-72 | **Tenant Admin Portal** | Users (**real invites** that create real users), access matrix (F-11), access requests, **recertification campaigns**, **segregation-of-duties rules**, org settings (including SSO configuration), admin audit trail | `admin.jsx` |
| F-73 | Reports | Board pack, audit pack, role reports. CSV, XLSX and PDF **from tenant data**, authenticated and tenant-scoped (the demo exported static seed data with no auth) | `reports.jsx`, `app/api/export/[pack]` |
| F-74 | Exports: risks.xlsx, portfolio.xlsx and others | As above | |
| F-75 | Scheduled report delivery | Real schedules run by the worker; email or download | `lib/reporting.js` |
| F-76 | Governance Academy | Courses (reference content), **per-user progress and completion**, maturity and readiness computed from real completion; glossary; platform dictionary; use-case library | `academy.jsx`, `dictionary.jsx`, `lib/academy-engine.js`, `lib/glossary.js`, `lib/platform-dictionary.js`, `lib/use-cases.js` |
| F-77 | Playbooks, checklists, guidebook (jurisdictions, SoA, freshness, glossary) | Reference content plus per-tenant completion state | `playbook.jsx`, `compliance.jsx`, `guidebook.jsx` |
| F-78 | Onboarding wizard, opportunity intake, ideas, roadmap | Tenant onboarding checklist computed from real state; idea intake → triage → AI Central; ideas **persisted** (the demo never posted them) | `dashboard.jsx` `PageOnboard`, `PageOpportunityIntake`, `PageMyIdeas`, `PageRoadmap` |
| F-79 | Browser extension "GenVeris AI Guard" (MV3 CASB) | Port it. Points at PROD with **per-tenant keys**; sends the tenant through the key; fix the bug where `preventDefault()` runs **after** `await` (send, drop and upload aren't actually held); fail-closed option | `veris/integrations/browser-extension/*` |
| F-80 | ServiceNow | Real outbound incident/remediation hand-off: idempotent, metadata-only, tenant-scoped, behind the entitlement seam, external ref recorded on a Fabric Finding (#180) | `PageIntegrations`, issue #180 |
| F-81 | Jira | Same pattern as ServiceNow (#180) | |
| F-82 | CRM / trust requests | Real inbound trust-request intake (form or API) into the Trust Center | `core.jsx` `INTEGRATIONS` |
| F-83 | Marketplace connectors (Slack, Microsoft 365 and the rest of the demo's catalogue) | Build each connector the demo lists; show honest status until it's connected | `aicentral.jsx` marketplace |
| F-84 | **Veris Enforce live adapter** | Pull `GET /admin/api/v1/{health,capabilities,decisions?since&limit,status}` per tenant with a bearer token; map decision categories to audit prefixes; cursor-based. ⛔ **Blocked** until the Enforce team publishes its OpenAPI. Build the seam and contract tests now, and the adapter when the spec arrives. **Never invent the Enforce API.** | `docs/design/enforce-integration-contract.md` |
| F-85 | Veris Discover ingest | `POST` ingest with a **per-tenant token**; the tenant comes from the token (the demo used the body); **check the Discover entitlement** (the demo trusted a body-supplied `tier`); at most 500 records, metadata only, Restricted payloads rejected, partial success | `app/api/ingest/discover`, `lib/ingest-discover.ts` |
| F-86 | Arabic pilot / UAE pack screens | Reference content EN+AR, applicability per tenant | `arabic-pilot.jsx`, `lib/uae-mappings.js` |
| F-87 | Account / workspace settings, help | Real settings saved on the server; help links into the Academy | |
| F-88 | Metric lineage and initiative brief | Every KPI opens its lineage (source records, calculation, provenance class actual/calculated/estimated) — "no number without lineage". Printable one-page initiative brief generated from real data. | `lineage.jsx`, `lib/lineage.js` (`PROVENANCE`), `initiative-brief.jsx` |
| F-89 | Trust Agent (compliance Q&A) | Gateway-backed Q&A over the tenant's own controls, evidence and policies, with citations | `compliance.jsx` (`askGateway`) |

> **If you find a demo surface that isn't in this matrix, it's still in scope.** Add a row (F-9x) and build it. The demo's own screen inventory is in `veris/scripts/click-integrity.mjs` (154 surfaces) and `veris/lib/platform-dictionary.js`.

---

## 6. Domain contracts to preserve

Keep these semantics. They are the product's logic and its contracts with Veris Enforce and Veris Discover.

### 6.1 Tenancy
- `Tenant`: id, slug (unique), name, plan label (commercial label only; **it never grants a plane**), created.
- Tenant = organisation. There's no separate Organisation model (WS2 decision). Entitlements are per tenant; authorisation and ownership are per org.

### 6.2 Users
- `User.email` is globally unique.
- Use a membership row (user ↔ tenant, role) so one person can later belong to several tenants.
- Registration always gets the least-privileged role (`employee`). The client can never choose its role.

### 6.3 RBAC (`veris/lib/rbac.ts`)

Modules: `ac` (AI Central), `risk`, `comp` (compliance), `rep` (reporting), `acad` (academy), `dec` (decisions), `admin`.
Capabilities, in order: `none < view < contribute < approve < admin`.

| role | ac | risk | comp | rep | acad | dec | admin |
|---|---|---|---|---|---|---|---|
| caio | admin | approve | approve | view | view | approve | admin |
| cgo | view | approve | admin | view | view | approve | contribute |
| ciso | view | admin | approve | view | view | contribute | contribute |
| cdpo | view | approve | approve | view | view | contribute | none |
| cro | view | approve | approve | view | view | approve | none |
| cio | admin | view | view | view | view | contribute | admin |
| ceo | view | view | view | approve | view | approve | view |
| coo | contribute | view | view | view | view | contribute | none |
| cfo | view | view | view | approve | view | contribute | none |
| chro | view | view | view | view | admin | contribute | none |
| legal | view | view | approve | view | view | contribute | none |
| manager | view | none | view | view | contribute | contribute | none |
| employee | none | none | view | none | contribute | none | none |

- Per-tenant overrides `(tenant, role, module) → capability` win over these defaults. Unknown or null role → deny.
- Write requirements carried over from the demo: decisions need `dec ≥ approve`; RBAC policy needs `admin ≥ admin`; admin audit needs `admin ≥ contribute`; evidence, policies and violations need `comp ≥ contribute`; taxonomy adds need `ac ≥ contribute`.
- **Extend this to every resource in PROD.** Define a requirement for every endpoint, including approving agent proposals (suggest `dec ≥ approve` or `admin`), writing the Fabric, ingesting knowledge, and running agents.
- The AI Central per-role module access is `AC_RBAC` (`veris/lib/platform-models.ts:87`). It must fail closed.
- Super Admin is a **platform operator plane**, separate from tenant roles.

### 6.4 Entitlements
- Planes are `enforce` and `discover`. Default is none.
- Status is `active` or `suspended`; only `active` counts. (The demo treated null as active — fix that.)
- Unique per (tenant, plane). Records who granted it and when. Every change is audited.

### 6.5 Agent runtime
- Action classes are `monitor | propose | act`. Run states are `scheduled | running | completed | proposed | blocked | failed`.
- `planAgentRun` checks gates **in this order**:
  1. not available → blocked
  2. breaker open → blocked (**wire this**; the demo never did)
  3. required entitlement missing → blocked
  4. act → proposed, needs approval
  5. propose → proposed, needs approval
  6. monitor → completed
- The capability scope is exactly what the agent declared.
- `act` is never autonomous.
- Findings are written only with `fabric:write`; proposals only with `proposal:write`.
- Proposals are idempotent per (tenant, agent, entity).
- Approving or rejecting an already-decided proposal → 409.
- The approval is recorded under the human. In PROD, approval **executes** the proposed effect.

### 6.6 Audit and Fabric vocabularies (the Enforce wire contract; keep exactly)
- Audit action prefixes:
  - `inference:<decision>`
  - `memory:<decision>`
  - `runtime:<decision>`
  - `retrieval:<decision>`
  - `egress-inspect:<decision>`
  - `breaker-signal:<signal>`
  - `agent:run:<status>`
  - `proposal:approved|rejected`
  - `task:acknowledge|flag`
  - `create` (entity = resource)
  - `rbac-grant` and admin actions
- Fabric kinds: `AISystem, Assessment, EvidenceRef, Finding, Owner, FrameworkMapping, ShadowAIItem`.
- Fabric sources: `discover | enforce | genveris | human`.

### 6.7 Fixed numbers and rules
- **Risk:** inherent = L × I; bands ≥12 Critical, ≥7 High, ≥3 Medium; residual buy-down 13% per treatment rank step, 12% floor.
- **Cost:** price per provider from a price book. Use the API's real `usage` tokens; only estimate (`ceil(len/4)`) as a fallback. Request token ceiling 6000.
- **Governance Score:** weighted inputs whose weights sum to 1. The inputs must be computed and **shown with their lineage**.
- **Breaker:** weights and states as in F-59B.
- **Memory retention:** as in F-53M.
- **Trust tiers and freshness:** as in F-52K.
- **Runtime policy:** SLO 8000 ms, max 4 concurrent, 20 calls per 10 s, loop window 6, repeat threshold 3. Make these per-tenant configurable.
- **Faithfulness:** overlap ≥0.34; verdict thresholds 0.8 / 0.5.
- **Data classification:** `Public < Internal < Confidential < Restricted`. DLP decision precedence: block > mask > flag > allow. Mask tokens: `[MASKED-CARD]`, `[REDACTED-SECRET]`, and so on.
- **Credential detectors** (`hasCredential`): `sk-`, `sk_live_`, `AKIA` + 16, `AIza`, `ghp_`, `github_pat_`, `xox[baprs]-`, PEM private keys.
- **Porting caveat:** JavaScript regex `\d`/`\w`/`\b` are ASCII-only, while Python's are Unicode (they match Arabic-Indic digits). Use `re.ASCII` or explicit `[0-9]`. Python string length counts code points, while JS counts UTF-16 units.

### 6.8 Gateway request limits
- Prompt ≤100,000 chars (413 above that).
- ≤10 attachments.
- Identifier fields ≤256 chars.
- Error codes `invalid_prompt`, `prompt_too_large`.
- The input guard truncates at 8,000 chars. PROD should **reject or chunk explicitly, never truncate silently**.

### 6.9 Honesty vocabulary
- Connector states: `connected | live-when-configured | enterprise | roadmap | disconnected`. Only the first two count as live. Unknown → `disconnected`.
- Assistant provenance (EN+AR): `live | simulated | blocked | declined`. In PROD, `simulated` is never produced; show "AI unavailable" instead.
- A persona is never presented as the signed-in user, and an email is never invented.

### 6.10 Brand (from `veris/CLAUDE.md`)
- Name **GenVeris**. Tagline **"Govern AI with certainty."** Company **Geniaz**. Sub-planes **Veris Enforce, Veris Intelligence, Veris Discover**.
- Logos (copy them; don't recreate):
  - Light backgrounds: `public/brand/genveris-logo-blue-gold-transparent-v1.png`. The demo code wrongly uses `genveris-light-blue-gold.png`.
  - Dark backgrounds: `public/brand/genveris-dark-transparent.png`.
  - App icon: `public/brand/genveris-dark-app-icon.png`.
  - Favicons: `genveris-favicon-16/32/48`, `icon-192/512`, `apple-touch-180`.
  - AI Central marks: `ai-central-logo.png`, `ai-central-symbol.png`.
- **Don't** carry over the `veriszone-*` or `tmp-*` files. The Arabic name must not be "فيرِس زون" (that's VerisZone).
- Fonts: Manrope and DM Serif Display, self-hosted (`public/fonts`).
- Tokens: `veris/components/platform/core.jsx` (`T`, `LIGHT_T`, `PALETTES` — 12 palettes, default burgundy — `AI_GOLD #D6A84F`, `AI_GOLD_INK #7E620F`, role colours `RC()`).
- Note: the domain `veriszone.com` is the old brand. Whether to keep it is D13.

---

## 7. Reference content vs fabricated data — the line

### 7.1 Carry over as versioned reference data

Store it in `reference/` and load it through migrations or a loader. It is read-only, shared by all tenants, and versioned.

- Framework catalogues and requirement texts, region applicability. Sources: `frameworks.js`, `computed-frameworks.js` (`*_REQS` **texts and IDs only**), `foundational-mappings`, `principle-mappings`, `governance-standards`, `iso-standards`, `lifecycle-standards`, `regional-mappings`, `uae-mappings`, `cn-measures`, `in-dpdpa`, `au-guardrails`, `sg-dimensions`.
- Crosswalk **mapping structure** (`crosswalk.js`) and SoA clause list (`soa.js`).
- EU AI Act Art. 5 practice definitions (`prohibited.js`) and GPAI obligations (`gpai.js`).
- Lifecycle phase templates, deliverables and RACI (`AC_PHASES`); `AI_GOV_ENGINES` definitions; playbooks (`PLAYBOOK_LENS`, `core.jsx PLAYBOOK`); ISO checklists; `KIT_TEMPLATE_SOURCES`; template library text.
- Glossary EN+AR (`glossary.js`, `docs/GenVeris-Glossary-EN-AR.pdf`), platform dictionary, use-case library, academy course content, jurisdiction and regime definitions.
- Detector patterns, risk bands, breaker weights, retention tables, trust tiers, connector vocabulary, i18n strings.

### 7.2 Never carry over (fabricated)

Any of these appearing in PROD is a defect.

- **All of `veris/lib/platform-models.ts`** except the reference items above:
  - `acInitiatives`, `acPmo`, `acGuardrails`, `acCxoAlignment`, `acEvidence`
  - `gatewayProviders`, `gatewayPolicies`, `gatewayLog`, `gatewayStats`, `gatewayRouting`, `guardrailDetectors`, `deploymentModes`, `gatewayRetention`
  - `POLICY_REGISTER` as code, including its counts
  - `acFeedback`, `AC_FRAMEWORK_POSTURE`
  - `EXEC_BRIEF`, `EXEC_PRIORITIES`, `EXEC_RECOMMENDATIONS`, `EXEC_DECISIONS`, `ASSISTANT_NUDGES`, `KPI_INSIGHTS`, `EXEC_QUICK_ACTIONS`, `EXEC_RECENT_CHANGES`
  - `knowledgeAssets`, `demoConversations`, `employeeUsageSeed`, `managerUsageSeed`
  - `riskRegister`, `kriRegister`, `acAssessments`
- **Seeded windows and estates in `lib/`:**
  - `TOOLCALL_LEDGER`/`RAW` (enforce.js), `RAW_SESSIONS` (circuit-breaker.js), `MEMORY_EVENTS`, `EGRESS_EVENTS`, `INFERENCE_EVENTS`
  - `RUNTIME_SEED`, `RETRIEVAL_SEED` (and `SOURCE_REGISTRY` entries), `INPUT_SEED`, `OUTPUT_SEED`, `HALLUCINATION_SEED`
  - `PAAS_CLIENTS`, `PAAS_KEYS`, `PAAS_SAMPLES`, `paasStats`
  - `ENFORCEMENT_ESTATE`, `HITL_GATES.pending`, `AI_AGENTS`, `ORCHESTRATIONS`, `WORKFLOWS`, `DRIFT_MODELS`, `MCP_SERVERS`
  - `PORTFOLIO`, `PF`, `OPEN_INCIDENTS`, `OPEN_AUDIT_FINDINGS`, `FRAMEWORKS` scores ("SOC 2 86")
  - `SA_ORGS`, `SA_USERS`, `SA_POLICIES`, `SA_OPERATORS`
  - `FORUM_COUNCIL`, `OWNERSHIP_MATRIX`, `UNIFIED_INCIDENTS`, `BREACH_REGISTER`, `AIA_REGISTER`, `GPAI_REGISTER`
  - `SECURITY_EVENTS`, `ROLE_CENTERS` literal content, `SCHEDULED_REPORTS`
  - `EVIDENCE_ARTIFACTS` dates, `SOA_CONTROLS` statuses, `GAP_CLOSURES`, `GOVERNANCE_INPUTS`/`GOVERNANCE_DELTA`
  - `TOKENS_MTD = 19.6B`, `PRICE_BOOK` budgets, `MODULE_STATE`, `AI_ASSETS`/`INITIATIVES` built from seeds
  - Every `*_POSTURE_SCORE` and every hardcoded requirement `status`
- **Fabricated components:**
  - `core.jsx`: `USER_PROFILES` (plaintext passwords), `LOGIN_PROFILES` and its KPI tiles, `DEMO_IDEAS`, `KPI`, `ROLE_KPIS`, `DOMAIN_METRICS`, `SCOPE_DATA`, `TRUST_CENTER_DATA`, `EVIDENCE_LIBRARY`, `AUDIT_PLAN`, `CORRECTIVE_ACTIONS`, `GAP_DATA`, `INTEGRATIONS`, `MODEL_REGISTRY`, `ROADMAP`, `ONBOARD`, `HITL`
  - `admin.jsx` seed users, requests, recert, SoD, audit and org (including the fake "Okta (SAML 2.0)")
  - `dashboard.jsx` `SEEDED_TAXONOMY_REQ` (the demo even pushes it into the database)
  - `FABRIC_DEMO`, `WS_TASKS_DEMO`
  - CAIO hardcoded KPIs and the "ISO 42001 certified body", "EU AI Act notified" and "SOC 2 Type II certified" pills
  - The `pending + 2` arithmetic
- **Fake mechanics:** djb2 or FNV "hashes" and "signatures" used as security (`enforce.js`, `mcp-registry.js`, `memory.js` ids, `data-provenance.js`, `sustainability.js`); hash-derived "measured" metrics; modelled regulatory clocks.
- **Demo flows:** Demo Center, persona picker, `demo-login`, `honestSimulatedReply` and the advisor `answer()` fallback, toast-only buttons, automatic tour, the "seeded demo workspace" mode, `/api/admin/setup` seeding, the static login footer ("SSO Ready / 7 years / EU-US").
- **Dead code:** `PageHome`, `ExecutiveCockpit`, `PLATFORM_NAV_SECTIONS`; unused `zustand` and `recharts`.

---

## 8. Data model and core services (PROD design)

### 8.1 Entities

Derived from the demo's 28 Prisma models plus everything the demo kept only in the browser. Every tenant-owned table has `id` (UUID), `tenant_id` (FK, indexed), `created_at`/`updated_at` (timestamptz), and `created_by`/`updated_by` (user FK) where relevant.

**Identity**
- `tenant`; `tenant_domain` (verified domains for SSO and join)
- `user`; `membership` (user, tenant, role)
- `session`; `invite`; `email_token`; `mfa_factor`
- `operator` (platform Super Admin)
- `api_key` (per tenant, hashed, scoped: policy-inspect, discover-ingest, browser-extension)
- `rbac_grant`

**Planes**
- `entitlement`
- `enforce_connection` (credential is a KMS envelope)

**Portfolio**
- `strategy_pillar`, `business_unit`
- `initiative` (all fields from the demo's `Initiative` model: owners, sponsor, champion, CxO, status, priority, risk, expected/actual value, stage, phase index, ROI, savings, revenue, productivity, training, resistance, guardrail and adoption scores, value score)
- `initiative_phase_deliverable`, `pmo_milestone`
- `idea`, `decision` (Scale / Continue / Improve / Retire, rationale, risk veto), `feedback_score`
- `ai_model`, `ai_agent` (with tool grants), `prompt`, `tool`
- `ai_system` (inventory), `dataset`, `vendor`
- `use_case_adoption`

**Risk and compliance**
- `risk` (L, I, residual, level, status, treatment plan, AI recommendation), `risk_link` (to initiative, control, framework, KRI)
- `kri`, `kri_measurement`
- `control`, `control_requirement_status` (tenant × reference requirement → Met / Partial / Gap / N/A plus evidence links), `soa_entry`, `gap_closure`
- `assessment` (AIA, DPIA, FRIA, AIRA, AIRT, prohibited-practice screen, GPAI), `assessment_answer`
- `dsr_request`, `breach` (with real clocks)
- `incident`
- `council`, `council_meeting`, `council_decision`
- `audit_plan`, `corrective_action`, `trust_request`

**Policy**
- `policy`, `policy_version`, `policy_rule` (compiled into runtime rules)
- `policy_review`, `policy_acknowledgement`, `policy_exception` (with expiry)
- `violation`

**Evidence**
- `evidence`
- `evidence_file` (S3 key, SHA-256, size, MIME sniffed from content, scan result)
- `fabric_record`

**AI runtime**
- `knowledge_source` (trust tier), `knowledge_doc`, `knowledge_chunk` (with a pgvector embedding)
- `conversation`, `message`
- `agent_memory`
- `mcp_server`, `hitl_gate`, `approval_request`
- `capability_token` (revocation)
- `runtime_session`, `breaker_state`
- `inference_record` (the Article 12 record), `usage_cost`
- `drift_series`

**Agents**
- `agent_run`, `agent_proposal`

**Platform**
- `audit_log` (with `seq`)
- `taxonomy_add`, `taxonomy_request`
- `report_schedule`, `export_job`
- `academy_progress`, `checklist_progress`
- `user_preference`
- `integration_connection` (ServiceNow, Jira, …), `integration_event`
- `notification`

**Keep these uniques (from the demo):**
- tenant slug; user email
- rbac_grant (tenant, role, module)
- entitlement (tenant, plane)
- enforce_connection (tenant)
- agent_proposal (tenant, agent, entity)
- policy (tenant, key)
- policy_acknowledgement (version, user)

**Add:**
- foreign keys everywhere (the demo lacked them on AuditLog and the Policy family)
- `audit_log (tenant_id, seq)` unique
- `fabric_record (tenant_id, seq)` unique
- indexes for every list and filter query

### 8.2 Hash-chained records (audit log and Evidence Fabric)

PROD starts empty, so the chain format can be improved. You don't need byte compatibility with the demo.

**Append**
1. Run in one transaction holding a per-tenant `pg_advisory_xact_lock(tenant)`, or use `SELECT … FOR UPDATE` on a per-tenant head row.
2. `seq = last.seq + 1`.
3. `hash = SHA-256(prev_hash ‖ canonical(record))`. Canonical encoding is length-prefixed, or canonical JSON with sorted keys. **Don't** join fields with an unescaped `|` the way the demo did, because that allows collisions.
4. Include every semantic field in the hash: kind, entity, source, payload, actor, confidence, supersedes, and timestamp.
5. Genesis is a constant per tenant.

**Verify** by walking `seq` in order: as a background job, on demand, and exposed as "chain intact" with the first broken `seq` if any.

**Never** have read endpoints re-hash the whole table on every GET. The demo was O(n); PROD keeps checkpoints.

**Fabric semantics to keep**
- **Idempotency:** the same (kind, entity, source, payload) as the current head for that entity → deduped. In PROD, compare against the entity's current record, not only the last one.
- **Human decision wins:** the latest record from a human source overrides automated records. A human source in PROD means an **authenticated user action**, never a client-supplied `source:"human"`.
- **Implement `supersedes`.**
- **Provenance can't be spoofed.** Only Discover ingest can write `discover`, and only the Enforce adapter can write `enforce`.

### 8.3 Policies drive enforcement
- Tenant policies and rules (F-47) compile to the runtime rule set that the gateway and the PaaS inspect endpoint evaluate.
- Ship a default **starter rule pack** as reference data that the tenant explicitly adopts: credential, PCI, PII, PHI, injection, sensitive, code, model-override and cost detectors.
- Fix the demo's detector mis-mappings:
  - PHI was never blocked.
  - Any prompt containing "confidential", "NDA" or "proprietary" was blocked.
  - Phone numbers were detected but never masked.
  - Card masking was unreachable because cards were always blocked.

### 8.4 Gateway pipeline (order matters)
1. Authenticate and resolve the tenant (session, or a PaaS/extension key).
2. Rate limit.
3. Validate the request (Pydantic).
4. Model allow-list (tenant setting, platform default).
5. Input guard.
6. If agent or tool: MCP pin, capability check, HITL gate, egress decision, runtime admit, signed token.
7. Classify and run DLP from tenant rules: block, mask, flag or allow.
8. Governed retrieval from the tenant knowledge base, with trust and freshness.
9. Recall durable memory.
10. Call the model through the SDK, with timeout and retries.
11. Validate the response (redaction, system-prompt reflection).
12. Moderation (classifier, stricter wins).
13. Faithfulness check, plus the judge if configured.
14. Cost from real usage.
15. Write memory.
16. Write runtime, breaker, egress, retrieval, memory and inference records (Article 12) under the **user** identity with a request id.

Response: `{blocked, text, masked, classification, capabilityToken, responseValidation, cost, memory, runtime, input, output, hallucination, source (Hybrid|External), citations}`.

### 8.5 Agents
- Registry (8 agents):

| id | Name | Class | Capabilities | Entitlement |
|---|---|---|---|---|
| `evidence-gaps` | Evidence & assessment monitor | monitor | `fabric:read`, `audit:read`, `fabric:write` | — |
| `evidence-freshness` | Remediation proposer | propose | `fabric:read`, `audit:read`, `proposal:write` | — |
| `drift-kri` | Drift & KRI monitor | monitor | — | — |
| `policy-review` | | propose | — | — |
| `cost-guard` | | propose | — | — |
| `incident-triage` | | act | → ServiceNow/Jira | — |
| `enforce-ingest` | | — | — | `enforce` |
| `shadow-discovery` | | — | — | `discover` |

- Cadences: hourly, daily, weekly, manual. Due-logic: `nextRunAt`, `isDue`, `dueAgents`.
- The worker runs due agents.
- Monitor agents raise Findings. They skip finding-derived tasks, to avoid a growth loop.
- The proposer creates `remediation:<entity>` proposals.
- Approval is RBAC-gated and executes the effect.

---

## 9. External interfaces

### 9.1 Public API
- REST under `/api/v1`, documented through OpenAPI. Every route has an auth requirement, an RBAC requirement, a rate-limit tier and a request/response schema.
- Error envelope, kept from the demo:
  - 400 `{ok:false, code:"invalid_request", error, issues[≤10]}`
  - 413 `{code:"payload_too_large", maxBytes}`
  - 429 `{code:"rate_limited", retryAfterSec}` plus a `Retry-After` header
  - 500 `{ok:false, code:"internal_error", error:"<generic>", requestId}`
  - 401, 403, 404, 409 with the same shape

### 9.2 Machine-to-machine
- Policy-as-a-Service inspect: per-tenant key.
- Discover ingest: per-tenant token.
- Browser extension: per-tenant key.
- Inbound integration webhooks: signed.

### 9.3 Veris Enforce contract
Read `veris/docs/design/enforce-integration-contract.md` in full.
- GenVeris pulls `/admin/api/v1/…` with a per-tenant bearer token; the tenant is derived from the token; data is metadata-only with a stable id and cursor.
- Categories map to the §6.6 prefixes. Note that the contract omits `retrieval`; raise this with the Enforce team.
- **Don't build against guesses.**

### 9.4 Anthropic
- Official SDK, timeouts, retries with backoff, real usage.
- Never send unmasked Restricted data.
- Confirm model IDs with the `claude-api` skill at build time.

---

## 10. Delivery plan (phases, each made of small PRs)

Each phase ends with a working, deployed (to staging), tested slice. Per CLAUDE.md, stop and ask before: destructive DB changes, auth/RBAC/security architecture choices, governance methodology changes, compliance interpretation, production infrastructure or DNS changes, and anything that changes product requirements.

| Phase | Deliverables | Exit criteria |
|---|---|---|
| **P0 Foundations** | Repo scaffold (§3 layout). Port and adapt `CLAUDE.md` (§12) and the security-baseline skill. CI (§13.2). Pre-commit. `.env.example` with **every** variable (§13.3). docker-compose for local Postgres and Redis. Alembic. FastAPI skeleton with request id, error envelope, security headers/CSP, Redis rate limiter, Pydantic `extra="forbid"`, generic 500s. React/Vite skeleton with tokens, fonts, brand, i18n framework, RTL. Typed API client from OpenAPI. `/healthz`. ADRs for every choice. | CI green; `docker compose up` gives a working app; baseline tests pass |
| **P1 Identity and tenancy** | F-01 to F-11; tenant isolation middleware; RBAC dependency on every route; audit log v2 (§8.2); Super Admin operator identity (F-71 skeleton); SES email. **Ask the owner about D3 (auth, MFA) and D6 (onboarding model) first.** | A real user can register, verify, sign in (password and SSO), and be 403'd across roles and tenants. Tests for every R3/R4 case. |
| **P2 AWS staging** | IaC for VPC, ECS, RDS (pgvector), ElastiCache, S3, CloudFront, WAF, Secrets Manager, KMS, CloudWatch, Backup; CI/CD deploy to staging; migrations run in the deploy pipeline, never at build. **Owner approval before provisioning (D2, D4).** | Staging URL live with real login |
| **P3 Portfolio core** | F-33 to F-39, F-41, F-44 (budgets), F-65, F-78; Fabric v2 (F-59); evidence with S3 upload (F-58); AIMS inbox (F-60) | Initiative goes idea → phases → decision, with gates enforced and audited |
| **P4 Risk, policy, compliance** | F-47 to F-57, F-61, F-62; reference catalogue loader (§7.1); computed posture with lineage | Posture changes only when the tenant's control status or evidence changes |
| **P5 Gateway and guardrails** | F-50G to F-67G, F-15, F-51W, F-52K; policies drive enforcement (§8.3); worker retention sweep | A prompt through the workbench produces a masked/blocked/allowed result, Article 12 rows and real cost |
| **P6 Agents** | F-68 plus the scheduler; proposals and approvals with effects | Scheduled run raises Findings; proposal approval executes and is audited |
| **P7 Persona command centres** | F-23 to F-32, F-12/F-13/F-16/F-22, F-24 Governance Score | Every tile traces to a query; empty tenant shows empty states |
| **P8 Planes and integrations** | F-69, F-70, F-84 (seam), F-85, F-79, F-80 to F-83 | Entitlement gating works end to end; ServiceNow/Jira hand-off |
| **P9 Admin, reports, learning** | F-71, F-72, F-73 to F-77, F-86, F-87 | Exports are tenant-scoped and real |
| **P10 Hardening and launch** | Full Arabic, accessibility (axe clean), 390 px, load test, backup/restore drill, runbooks, pen-test readiness, observability dashboards and alarms; **production** environment; DNS cutover of `platform.veriszone.com` (**owner approval, D5**) | QA sign-off on §14 journeys; owner go-live approval |

> **Order is a recommendation.** If the owner wants QA testing sooner, ship P0, P1 and P2 first, then grow staging feature by feature.

---

## 11. Security baseline (mandatory on every change)

Carried over from `veris/CLAUDE.md` and adapted for Python. Before every PR, check the diff against all six controls.

**1. Rate limiting**
- Every endpoint has a tier: `auth` (default 20 per 15 min), `public` (60/min), `user` (120/min), and a global per-IP backstop (600/min).
- Auth routes combine **per-IP and per-account** limits, with **exponential backoff** (5 free attempts, base 1 s, max 15 min, memory 1 h) rather than a hard lockout.
- All thresholds come from env/config: `RATE_LIMIT_<TIER>_MAX`, `RATE_LIMIT_<TIER>_WINDOW_SEC`, `AUTH_BACKOFF_*`.
- Over-limit → 429 with `Retry-After`.
- **The store is Redis**, shared across instances. The demo's was per instance.
- Take the client IP only from the trusted proxy chain (CloudFront/ALB). Never trust a client-sent `X-Forwarded-For`.

**2. Input validation**
- Pydantic models with `extra="forbid"`, strict types, and length, format and enum limits on body, query, path and headers.
- Reject with 400; don't sanitise and continue.
- **Cap the byte size before parsing.** The demo's gateway and ingest routes didn't.

**3. Secrets**
- Nothing hardcoded anywhere, including tests and seeds.
- AWS Secrets Manager plus KMS. `.env*` is in `.gitignore`; only `.env.example` with placeholders is committed.
- Nothing sensitive in the SPA bundle.
- Tokens only in headers, **never in query strings**. The demo accepted `?token=`.

**4. Dependency vulnerabilities**
- `pip-audit` (or `uv`/`safety`) and `npm audit --omit=dev --audit-level=high` in CI, plus a weekly scheduled run.
- CI fails on high or critical. Dependabot is enabled.

**5. Error handling and information leakage**
- Clients get a generic message and a request id. Full details are logged server-side as structured JSON.
- No stack traces, file paths, SQL/ORM errors or provider errors reach the client.
- A static test scans all routes for leaked exception text.

**6. File uploads**
- Check type by **magic bytes**, not extension or client MIME.
- Enforce a size limit **before buffering**.
- Store in a **private S3 bucket** with generated keys and an AV scan, wired and fail-closed by config.
- Uploads are never executed and never served inline as HTML or SVG. Use `Content-Disposition: attachment` and nosniff.

**Plus, for PROD:**
- Security headers and CSP: CSP, HSTS, X-Frame-Options/`frame-ancestors`, nosniff, Referrer-Policy, Permissions-Policy. The demo had none.
- CSRF protection on cookie-authenticated writes.
- SSRF protection on every outbound call to a user-supplied URL: scheme allow-list, resolve DNS and block private, loopback, link-local, CGNAT and metadata ranges **after** resolution, and pin the resolved IP.
- Admin and operator actions require MFA and are audited.

---

## 12. Working rules for the build session

1. **Port `veris/CLAUDE.md`** into `GenVeris-PROD/CLAUDE.md`. Keep the role (Principal Architect, Lead Engineer, QA, Debugger, Reviewer), "validate everything", "don't chase symptoms", the completion criteria, the approval gates, the security baseline (§11) and brand. Replace the Next.js helper references with the new Python and React equivalents once they exist.
2. **Branches and PRs.** Small, focused PRs, opened as drafts. CI must be green: tests, types, lint, security baseline, dependency audit and secret scan. **Merge only when the owner says "merge #N".** One concern per PR. The PR body lists the status of each baseline control.
3. **Commit trailers.** Follow the session's attribution instructions. Never put a model identifier in commits, PR text or code.
4. **Use the demo only as a reference.** Read `EmanGeniaz/veris` for UX and logic; never modify it. Treat its data as fabricated unless §7.1 says it's reference content.
5. **Anti-hallucination.** Mark every claim about the demo or the system as Verified (you read or ran it), Inferred, or Unknown. Never invent an external API (the Enforce one especially) or a compliance interpretation.
6. **Tests prove behaviour.** Write behavioural tests, not text-grep "source contracts" (about half the demo's checks were greps).
7. **Ask the owner** when a decision is theirs (§15). Otherwise use sensible defaults and record them as ADRs.

---

## 13. Environment, CI and operations

### 13.1 Known issue on the current domain (tell the owner if it's still true)
On 2026-10-12, `/api/auth-status` returned `enabled:false`, `databaseUrl:true`, `missing:[AUTH_SECRET, DIRECT_URL]` and `telemetry: live` for the demo deployment that `platform.veriszone.com` appears to serve.

In that mode the demo trusts a caller-named tenant, so anyone can read and write any tenant's data in that database through `/api/fabric`, `/api/knowledge`, `/api/gateway/chat`, `/api/agents/run`, `/api/agents/approve`, `/api/workspace/tasks` and `/api/bus/*`.

This isn't the PROD repo's code, but **don't point `platform.veriszone.com` at anything until it serves GenVeris-PROD**. Remind the owner that the demo needs `AUTH_SECRET` set, or its database disconnected, in the meantime.

### 13.2 CI gates (parity with the demo's, plus more)
- **API:** ruff, mypy strict, pytest (unit plus integration against a real Postgres and Redis in CI services), coverage threshold, bandit, pip-audit, Alembic migration check (upgrade, downgrade, upgrade), OpenAPI diff.
- **Web:** eslint, `tsc --noEmit`, vitest, build, `npm audit --omit=dev --audit-level=high`.
- **Repo:** secret scan (gitleaks over the full history), "no committed `.env*`", CodeQL.
- **E2E:** Playwright against a docker-compose stack in CI with real auth, plus an axe accessibility check. **Never default to the production URL.**
- **Weekly:** dependency audit cron. Dependabot: pip, npm and actions.
- PR template, CODEOWNERS, issue templates.

### 13.3 Environment variables (names; values never in git)

| Area | Variables |
|---|---|
| Core | `APP_ENV`, `APP_BASE_URL`, `DATABASE_URL`, `REDIS_URL`, `SESSION_SECRET` (or KMS key), `KMS_KEY_ID`, `S3_UPLOAD_BUCKET`, `S3_EXPORT_BUCKET`, `SES_SENDER`, `LOG_LEVEL` |
| Auth | `OIDC_ENTRA_CLIENT_ID`, `OIDC_ENTRA_CLIENT_SECRET`, `OIDC_ENTRA_TENANT`, `OIDC_GOOGLE_CLIENT_ID`, `OIDC_GOOGLE_CLIENT_SECRET`, `MFA_REQUIRED_FOR_ADMINS` |
| AI | `ANTHROPIC_API_KEY`, `DEFAULT_MODEL`, `MODEL_ALLOWLIST`, `JUDGE_MODE` (`auto`/`always`/`off`), `EMBEDDING_MODEL`, `MODERATION_URL` (or provider), `AV_SCAN_URL`, `AV_SCAN_FAIL_CLOSED` |
| Limits | `RATE_LIMIT_{AUTH,PUBLIC,USER,GLOBAL}_{MAX,WINDOW_SEC}`, `AUTH_BACKOFF_{FREE_ATTEMPTS,BASE_MS,MAX_MS,MEMORY_SEC}` (never a "disable" switch in prod) |
| Integrations | Per-tenant credentials live in the DB (KMS-sealed), not env |

**Gone from the demo:** `DEMO_PASSWORD`, `DEMO_SEED_PASSWORD`, `VZ_SETUP_TOKEN`, global `VZ_INGEST_TOKEN`/`VE_INGEST_TOKEN`, global `VZ_INSPECT_KEY`, `VZ_ONBOARD_TOKEN` (replaced by the operator console), `DIRECT_URL`/pooler specifics.

### 13.4 Operations
- Structured logs with request id and tenant id.
- Metrics: latency, error rate, 429s, gateway blocks, chain verification.
- Alarms.
- Automated backups with point-in-time recovery, plus a tested restore.
- Retention sweeps (memory, expired exceptions, export files) as scheduled jobs. **Never sweep the audit log.**
- Runbooks: provisioning, secret rotation, key rotation, incident response, tenant offboarding and data export or deletion.

---

## 14. QA acceptance — journeys that must pass on a clean tenant

All journeys start with **no data**. QA creates every record through the product or the API, never through seeds.

1. **Organisation creation:** register, verify email, the first admin lands in an empty workspace, and every surface shows designed empty states (no demo numbers anywhere, including search, ⌘K and the assistant).
2. **Invite users** across all 13 roles; each role sees exactly its navigation and gets 403 on anything outside its RBAC row, **API included**.
3. **Isolation:** a second tenant can never see or write tenant A's data by any parameter, header or path.
4. **SSO** sign-in with domain mapping; unknown domain refused; first sign-in provisions an `employee`.
5. **Sign-out** revokes the session; refresh and deep links preserve identity; a role change applies without waiting for token expiry.
6. **Auth abuse:** per-IP and per-account limits, backoff, 429 + `Retry-After`; generic errors; no account enumeration.
7. **Initiative lifecycle:** idea → intake → initiative → phases, with gates **blocking** until deliverables and evidence exist → feedback → Scale/Continue/Improve/Retire with the risk veto → retirement with a reason. All audited.
8. **Risk:** create, treat, residual recalculated; KRI measurements trigger a breach; XLSX export of only this tenant's risks.
9. **Policy:** create, version, approve, acknowledgement campaign, exception with expiry → the gateway enforces the new rule → violation analytics show it.
10. **Compliance:** set control status and attach evidence → posture, crosswalk, SoA and gap analysis update; no score moves without a data change.
11. **Evidence:** upload valid files; spoofed, oversized and infected files refused; freshness expiry flips the status.
12. **Gateway:** credential prompt blocked; PII masked; Restricted data never reaches the model; Article 12 record with user identity, model, tokens, cost and decision; chain intact.
13. **Knowledge:** upload, retrieval with citations, trust tiers, stale and expired sources demoted.
14. **Guardrails:** egress deny/SSRF; runtime loop detection; breaker escalation **actually suspends**; HITL gate holds a high-value action until a human approves.
15. **Agents:** scheduled monitor raises Findings → proposer drafts proposals → an unauthorised role can't approve → an authorised approval executes and is audited under the human.
16. **Entitlements:** without Enforce or Discover the planes are locked and labelled; Super Admin grants → unlocked; suspend → locked again; all audited.
17. **Discover ingest** with a per-tenant token lands in only that tenant; Restricted records are rejected.
18. **Integrations:** ServiceNow/Jira hand-off is created once (idempotent) and the reference is recorded.
19. **Reports:** board and audit packs; CSV, XLSX and PDF; scheduled delivery.
20. **Admin Portal:** invites, access matrix change, recertification, SoD conflict detection, admin audit trail. **Super Admin:** tenant lifecycle with MFA.
21. **Academy:** progress is saved per user.
22. **Arabic:** every screen in Arabic, RTL mirrored, no English leaks, correct brand name.
23. **Accessibility and responsive:** axe has no serious or critical issues; works at 390 px with no horizontal scroll.
24. **Security baseline:** each of the six controls is verified by automated tests and spot-checked by hand.

**Open `veris` issues whose requirements apply to PROD:**

| Issue | Requirement |
|---|---|
| #142 | Real auth live |
| #145 | Authenticated E2E tests |
| #166 | Evidence Fabric as the canonical core |
| #167 | Enforce entitlement and live telemetry |
| #168 | Employee workspace cockpit |
| #169 | Enforced AI-PMO phase gates |
| #170 | Veris Intelligence personas |
| #171 | Role-centre scope and the Legal decision |
| #172 | Durable retention reaper |
| #173 | Strictly-Enforce (see D1) |
| #180 | ServiceNow/Jira hand-off |

---

## 15. Decisions to confirm with the owner (ask before you build the affected part)

| # | Decision | Recommendation |
|---|---|---|
| **D1** | **Runtime enforcement engines vs "strictly-Enforce."** The owner said *build everything in the demo*. The recorded product decision (Charter D7, `docs/design/enforce-porting-brief.md` §4, issue #173) says GenVeris must not do live runtime enforcement itself; that belongs to Veris Enforce (a separate Go product), and the embedded engines are to be retired. | Build the engines (F-50G … F-67G) as a separable **"embedded runtime" module**, gated by the tenant's Enforce entitlement, so it can be switched to the Enforce adapter later without UI changes. **Confirm with the owner before P5.** |
| D2 | AWS region and data residency | `me-central-1` (UAE) |
| D3 | Auth approach and MFA | First-party sessions plus OIDC (Authlib), Argon2id, TOTP MFA for admins and operators. Alternative: Amazon Cognito. |
| D4 | Environments; where QA tests | dev, staging and prod; QA mainly on staging, with a final pass on prod |
| D5 | DNS cutover of `platform.veriszone.com` (find out what serves it today) | Cut over only at P10, with approval |
| D6 | Tenant onboarding model | Self-serve "create organisation" with email verification, plus invite-only join; domain auto-join only for verified domains |
| D7 | Super Admin operators | Geniaz staff only, separate identity, MFA required |
| D8 | Integration priority and credentials | ServiceNow and Jira first (#180) |
| D9 | LLM provider and models | Anthropic; confirm current model IDs at build time |
| D10 | Starter policy rule pack | Offer it, opt-in per tenant |
| D11 | 13-phase lifecycle vs 9-stage portfolio stages | Keep 13 phases as canonical; derive portfolio stage from phase plus status |
| D12 | Claims language | Ban "compliant" and "certified" in the UI (Charter) |
| D13 | Domain and brand | `platform.veriszone.com` for now; plan a `genveris` domain |
| D14 | Pricing and tiers (what "Enterprise" includes) | Owner to define; entitlements model supports it |

---

## Appendix A — Demo defects not to reproduce (checklist)

**Security**
- Tenant taken from body or query in no-auth mode.
- `/api/policy/inspect` takes the tenant from the body and is open when no key is set; `Access-Control-Allow-Origin: *`.
- Discover ingest takes the tenant from the body under one global token.
- Registration joins an existing tenant by slug.
- RBAC only on `/api/bus`.
- Agent approvals by any member, recorded as "reviewer".
- Fabric "human" source spoofable; client-supplied actor fields.
- Middleware only checks that a cookie exists.
- Sign-out leaves the session.
- Plaintext persona passwords in the client bundle.
- Super Admin reachable from the demo switcher.
- Tokens in query strings; state-changing GET (`/api/admin/setup`).
- Unkeyed djb2 capability tokens.
- No security headers.
- Per-instance rate limits; trust in `X-Forwarded-For` and `X-Forwarded-Host`.
- Unbounded body parsing on two routes.
- Account enumeration on register.
- Entitlement and connection changes not audited.
- SSRF check without DNS resolution; its `fc`/`fd` prefix test also blocks legitimate hosts.

**Correctness**
- Audit and Fabric chains not serialized, so they can fork.
- `createdAt` ordering ties; `|`-joined hashes collide.
- Confidence and supersedes not hashed; supersedes unused.
- Full-table re-hash on every read; cost labelled "MTD" with no date filter.
- Policies in the DB never drive enforcement; detector mis-mappings.
- Phone not masked; card mask unreachable; cost detector unreachable; silent prompt truncation.
- HITL threshold unreachable; egress doesn't parse URLs; breaker never enforced.
- AV seam and retention sweep never called; moderation call without a timeout.
- Article 12 rows lack the user.
- Every audit row with ":" relabelled as an Enforce Finding.
- Seeds use global primary keys; violations look up rules across tenants.
- SSO users get no account.
- Role frozen in the JWT for 30 days.
- `assetById`/`walkBack` fall back to the first record.
- The browser extension's `preventDefault` runs after `await`.
- The workbench sends `tenant: "role"`.
- Bus decision shape mismatch.
- Report export buttons with no handlers.
- The "Live" badge shows on constant panels.
- Seed data leaks into "clean" workspaces (`SEEDED_DEMO_TABS`).

**Process**
- No migrations; schema pushed at build time with failures swallowed.
- Preview builds could change the prod schema.
- Lint and E2E not in CI; E2E defaults to the prod URL.
- Half the tests are text greps.
- Undeclared test dependencies.
- `.env.example` missing 10 variables.

## Appendix B — Demo test invariants to re-implement as pytest (behavioural)

The demo had 26 suites and 863 checks, all green at `4588c9a`. Reproduce the **invariants**:

- Tenant isolation (session wins; slug sanitising).
- RBAC matrix and overrides.
- Least-privilege registration.
- Rate limits, backoff and 429.
- Strict schemas (400/413).
- Generic 500 with request id.
- No secret fallbacks.
- Upload magic bytes, spoofing and size caps.
- Constant-time token compares.
- Hash chains and tamper detection.
- Fabric idempotency and human-wins.
- Metadata-only memory and retrieval audit (no content).
- Retention by data class.
- Egress deny-by-default plus SSRF.
- Runtime loop and SLO.
- Breaker thresholds.
- Retrieval deny-by-default and trust.
- Cost maths (no NaN or divide-by-zero).
- Model allow-list and override detection.
- Credential DLP across provider token formats; card and email handling.
- EICAR and AV fail-closed.
- Moderation floor and "stricter wins".
- Faithfulness and judge modes.
- Outbound timeouts.
- Entitlements: default empty, suspended, plane isolation, no self-grant.
- Secret sealing: tamper → none; refuse without a key; never return the secret.
- SSRF URL rules.
- Connector honesty.
- Assistant provenance honesty.
- Persona never shown as the signed-in user.
- Agent gate order, least privilege, never autonomous, approval under the human, 409 on re-decide.
- Scheduler due-logic.
- Task derivation only from real records, idempotent.

Read the demo suites in `veris/scripts/*-test.mjs` for the exact cases.

## Appendix C — Demo file map (where to look)

- **API routes:** `veris/app/api/**/route.ts`
  - `admin/{setup,tenants,entitlements,enforce-connection}`
  - `agents/{,run,approve,proposals}`
  - `auth-status`, `auth/[...nextauth]`
  - `bus/[store]`, `demo-login`
  - `enforce/{breaker,connection,cost,egress,ledger,memory,retrieval,runtime}`
  - `entitlements`, `export/[pack]`, `fabric`, `gateway/chat`, `inference-log`, `ingest/discover`, `knowledge`, `policy/inspect`, `register`, `workspace/tasks`
- **Schema:** `veris/prisma/schema.prisma` (28 models); demo seeding in `veris/lib/seed-core.ts` (don't port).
- **Engines:** `veris/lib/*` (see §5 and §7 for which file is which).
- **UI:**
  - Root and router: `veris/components/GenVerisPlatform.jsx`.
  - Tokens, nav, shared components: `veris/components/platform/core.jsx`.
  - Screens: `veris/components/platform/*.jsx` — aicentral, caio, ceo, rolecenters, workbench, compliance, riskcenter, enforce, convergence, guidebook, roadmap, reports, admin, superadmin, academy, dictionary, playbook, templates, template-library, agents, mcp, spine, trace, lineage, data-provenance, data-subject-rights, sustainability, arabic-pilot, advisor, palette, tour, telemetry-badge, dashboard, cockpit, initiative-brief, smartselect.
- **Extension:** `veris/integrations/browser-extension/`.
- **Tests:** `veris/scripts/*-test.mjs`, `veris/e2e/`.
- **CI:** `veris/.github/workflows/{ci,security-baseline}.yml`.
- **Agent tooling:** `veris/CLAUDE.md`, `veris/.claude/skills/security-baseline/SKILL.md`, `veris/AGENTS.md`, `veris/.codex/skills/*` (anti-hallucination finding format).

*End of handover.*
