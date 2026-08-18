# VerisZone — Enterprise AI Governance Control Plane

> **Govern with certainty.**
> VerisZone is the control plane where an enterprise plans, governs, ships and
> proves the value of every AI initiative — from first opportunity to retirement —
> under one auditable system of record. A product of **Geniaz**.

---

## 1. What VerisZone is

Most organisations run AI as a scatter of pilots: a chatbot here, a copilot there,
a forecasting model in finance — each with its own risk story, its own spend, its
own (often absent) evidence trail. VerisZone replaces that scatter with a single
**governed portfolio**:

- **One object model.** Every AI effort is an *initiative* — a single record that
  carries its business case, lifecycle phase, risk posture, controls, evidence,
  cost and value, viewed through whichever lens a given role needs.
- **One lifecycle.** All initiatives move through the same canonical 13-phase
  lifecycle, so "where is this?" always has the same answer across the company.
- **One governance spine.** Risk, compliance (EU AI Act, ISO 42001/27001, NIST AI
  RMF and more), policy and evidence are computed from the initiatives themselves —
  not maintained in a parallel spreadsheet that drifts out of date.
- **One AI Gateway.** Every model call the platform makes runs through a policy
  pipeline (classify → mask/block → human-in-the-loop → egress control → live
  model → validate → log), so the governance you author is the governance that
  actually executes.
- **One enforcement plane — Veris Enforce.** Governance says what an agent *may*
  do; Enforce decides, at call time, what it *does* — deny-by-default capability
  tokens, egress control and human-in-the-loop — and signs every decision into a
  tamper-evident ledger. Controls hold *around* the model, not inside it.

The result is a workspace an executive, a governance officer, a risk lead and a
front-line employee can all open and see *the same portfolio, framed for them*.

---

## 2. Core concepts

| Concept | What it means |
| --- | --- |
| **Initiative** | The atomic unit. One AI effort as one record — business case, phase, risk, controls, evidence, cost, value. Everything else is a view over initiatives. |
| **13-phase lifecycle** | Opportunity → Business Case → Discovery → Architecture → Governance → Development → Testing → Pilot → Deployment → Monitoring → Optimization → Scale → Retire. |
| **Governance Score** | A composite (0–100) rolled up from evidence completeness, risk posture, control coverage and framework alignment. |
| **Role lens** | The same data re-framed per role (CEO, CFO, CISO, CAIO/CGO, manager, employee, …). No role sees a different truth — only a different emphasis. |
| **AI Gateway** | The single egress point for model calls, wrapped in the policy pipeline. |
| **Policy engine** | Deterministic rules (`lib/policy-rules.ts`) that classify text, mask or block sensitive data, and decide egress — reused by the gateway *and* by the shadow-AI inspection endpoint. |
| **Veris Enforce** | The enforcement plane (`lib/enforce.js`). Turns policy into runtime decisions on every agent tool call — capability tokens, egress-deny, HITL escalation, circuit breaker — and records them, tamper-evidently. |
| **Capability token** | A short-lived (90s), signed, per-tool-call grant scoped to exactly one tool for one agent. Agents hold no standing keys; issuance runs the least-privilege boundary first, so a denied call yields a refusal, never a token. |
| **Tool-Call Ledger** | A hash-chained record of every tool call an agent attempted — what it was *authorised* to do vs what it *actually did* — where any tampered row breaks every later row. The Article 12 / ISO 42001 evidence artifact. |
| **Policy-as-a-Service** | The policy engine exposed as a callable verdict service (`/api/policy/inspect`): a browser extension, CASB, forward proxy or CI pipeline calls the *same* rulebook and gets allow · mask · block, so shadow-AI traffic is governed too. Every verdict is signed into the evidence chain. |
| **Template Library** | A browsable repository of framework template packs (ISO 42001, ISO 27001, NIST AI RMF, EU AI Act). Each pack generates ready-to-fill artifacts — policy, Statement of Applicability, control checklist, impact assessment, RACI — pre-filled from the live control set, minting evidence on generation. |
| **Evidence** | Auto-captured artifacts from completed phase gates, forming the audit trail behind every Governance Score. |
| **Super Admin console** | The operator tier: provision tenants, enable modules, define users & RBAC, and cascade org-wide policy. Operators *enable and override* — they don't author initiatives. |

---

## 3. Technology

**Frontend**
- **Next.js 15.5** (App Router) + **React 19**
- **Tailwind CSS 3.4** over a heavy inline **design-token system** (`components/platform/core.jsx`)
- **Framer Motion** (motion), **Recharts** (charts), **Zustand** (client state), **lucide-react** (icons)
- Light-mode-only, with 13 swappable workspace palettes (see `design_Philosophy.md`)

**Backend**
- **Route Handlers** under `app/api/` (gateway, policy inspection, bus persistence, exports, admin/tenant provisioning, auth)
- **Prisma 6.19** + **PostgreSQL** (Supabase)
- **Auth.js v5** (JWT sessions; Credentials + Microsoft Entra + Google providers)
- **localStorage-first persistence** via a `bus.js` adapter that mirrors to the database
- Native **XLSX** export (no server dependency)
- **Hash-chained audit log** (`lib/audit.ts`) for tamper-evident governance records

**AI**
- **AI Gateway** (`app/api/gateway/chat/route.ts`) → live Claude (`claude-sonnet-5`) via the Anthropic Messages API, behind the full policy pipeline
- **Veris Enforce** (`lib/enforce.js`, `components/platform/enforce.jsx`) — the agent-runtime enforcement plane: deny-by-default capability tokens, egress policy, HITL gates, circuit breaker, and the hash-chained Tool-Call Ledger
- **Shadow-AI coverage**: `app/api/policy/inspect` + a reference MV3 browser extension (`integrations/browser-extension/`) let an external CASB/DLP client call the same policy engine before a user pastes sensitive data into a public AI tool

---

## 4. Veris Enforce — the enforcement plane

Governance tools tell you what an agent is *supposed* to do. Veris Enforce decides,
**at call time**, what it actually does — and proves it afterwards. It closes the
loop that neither the guardrail vendors nor the GRC vendors close on their own:
*enforcement without governance is a firewall nobody can explain to a board;
governance without enforcement is a spreadsheet.*

**One control set, three planes:** `policy → enforcement → evidence`.

The design bet is that controls must hold **around** the model, not inside it — a
more capable model is better at being argued out of its instructions, but no better
at forging a capability token or reaching a destination the egress policy denies.

**Two primitives** (`lib/enforce.js`):

1. **Capability tokens** — short-lived (`TOKEN_TTL_SECONDS = 90`), signed,
   per-tool-call, scoped grants. An agent never holds a standing key; to call a
   tool it must be *issued* a token, and issuance runs the least-privilege boundary
   (`capabilityCheck`) first. A denied call yields a refusal, never a token.

2. **The Tool-Call Ledger** — a hash-chained record of every attempted tool call:
   what the agent was *authorised* to do (the grant) vs what it *actually did* (the
   call), the deterministic decision, the token, and a `prevHash`/`hash` pair so
   tampering with any row breaks every later row (`ledgerIntact()` verifies the
   chain). This is the audit artifact **EU AI Act Art. 12** and **ISO 42001** push
   toward: prove what your agents were allowed to do, and prove what they did.

**Enforcement decisions** (`ENFORCE_DECISION_META`):

| Decision | Meaning | Contained? |
| --- | --- | --- |
| **Allowed** | Within grant; ran | no |
| **Masked** | Ran, but sensitive data redacted at the boundary | no |
| **Escalated** | High-stakes → routed to a human (e.g. adverse credit decision under Art. 22, SOX GL posting, account freeze) | yes |
| **Blocked** | Out-of-scope / ungranted tool — denied by default (least privilege) | yes |
| **Egress-deny** | Destination the egress policy refuses (SSRF class) | yes |

A **Blocked** or **Egress-deny** call against an ungranted tool is a *prevented
breach* — a prompt-injection or over-reach that never reached money, data, or the
internet. `enforceStats()` surfaces the containment rate, prevented-breach count,
least-privilege index and whether the chain is intact.

**Surfaces** (`components/platform/enforce.jsx`, reachable by CISO / CGO roles):
Enforcement Overview (the closed loop), Agent Authority, the Tool-Call Ledger,
Egress Policy, HITL Gates and the Circuit Breaker.

### Policy-as-a-Service — the outward-facing edge

Sitting beside Veris Enforce is **Policy-as-a-Service** (`PolicyAsAService` in
`enforce.jsx`, data in `lib/policy-service.js`). Where Enforce governs *agents at
runtime*, PaaS exposes the *same DLP + classification rulebook* the Gateway
enforces inline as a stateless verdict service at `POST /api/policy/inspect`
(`allow · mask · block`). Any channel — a browser extension, a CASB, a forward
proxy, a CI pipeline — calls one endpoint and enforces one policy, so the AI
traffic that never touches the in-app gateway (the "shadow AI" path) is governed
too. The surface presents the contract, the connected channels, per-channel
`x-veris-key` management, and a **live inspector that calls the real endpoint** —
and every verdict is signed into the same Article 12 evidence chain.

---

## 5. Repository layout

```
app/                 Next.js App Router — pages, layouts, and API route handlers
  api/               gateway/chat · policy/inspect · bus · export · admin · auth · knowledge
components/
  platform/          The product surfaces (30 modules): core design system, role
                     cockpits, AI Central, Risk Center, Compliance, Academy,
                     Super Admin, Veris Enforce, dictionary, guided tour, …
lib/                 The engines & data model — taxonomy, policy-rules, enforce,
                     policy-service (Policy-as-a-Service), template-library,
                     agent-registry, egress, hitl, circuit-breaker, risk-engine,
                     compliance-engine, cost-engine, audit, rbac, role-centers,
                     platform-models, and the framework/standards libraries
prisma/              schema + seed
integrations/
  browser-extension/ Reference shadow-AI DLP client for the policy engine
scripts/             Screenshot/verification tooling, dictionary artifact generator
public/              Brand assets
e2e/ · testing-agent/  End-to-end and agent-driven verification harnesses
```

---

## 6. Getting started

### Prerequisites
- Node.js 22+
- A PostgreSQL database URL (Supabase works out of the box)

### Environment
Create `.env` (or `.env.local`) with at least:

```bash
DATABASE_URL=postgresql://…            # Prisma / Supabase
AUTH_SECRET=…                          # Auth.js session signing
ANTHROPIC_API_KEY=…                    # live AI Gateway (optional in demo)
VZ_GATEWAY_MODEL=claude-sonnet-5       # default gateway model (optional)
# Optional SSO providers
AUTH_MICROSOFT_ENTRA_ID_ID=… AUTH_MICROSOFT_ENTRA_ID_SECRET=… AUTH_MICROSOFT_ENTRA_ID_ISSUER=…
AUTH_GOOGLE_ID=… AUTH_GOOGLE_SECRET=…
# Optional shadow-AI inspection key (open dev mode when unset)
VZ_INSPECT_KEY=…
```

### Install & run

```bash
npm install
npm run db:push      # apply the Prisma schema
npm run db:seed      # seed demo tenants, initiatives, policies
npm run dev          # http://localhost:3000
```

### Production build

```bash
npm run build        # prisma generate && next build
npm run start
```

---

## 7. Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type-check via `next build` |
| `npm run test` | Alias of `typecheck` |
| `npm run db:push` | Apply Prisma schema to the database |
| `npm run db:seed` | Seed demo data (`tsx prisma/seed.ts`) |

---

## 8. Entry points & demo logins

The entry page (`select[aria-label="Sign in to"]`) offers four ways in:

- **Demo Center** — full platform demo across every role
- **Employee Login** — your role & access resolved via RBAC
- **AI Central** — the standalone Enterprise AI Command Center
- **Super Admin** — platform administration (tenants, modules, RBAC, policy)

---

## 9. Governance & compliance coverage

VerisZone maps initiatives against the frameworks enterprises are actually
audited on, including:

- **EU AI Act** risk tiers (Unacceptable / High / Limited / Minimal) and GPAI obligations
- **ISO/IEC 42001** (AI management system) and **ISO/IEC 27001** (ISMS)
- **NIST AI RMF**, **COSO**, and regional/jurisdictional guardrails

These are computed engines (`lib/compliance-engine.js`, `lib/frameworks.js`,
`lib/iso-standards.js`, `lib/governance-standards.js`, …), not static checklists —
so posture updates as the portfolio does.

To turn that posture into paperwork, the **Template Library**
(`components/platform/template-library.jsx`, data in `lib/template-library.js`,
CAIO / CGO roles) ships browsable framework packs — ISO 42001, ISO 27001, NIST AI
RMF, EU AI Act — that generate ready-to-fill artifacts (policy, Statement of
Applicability, control checklist, impact assessment, RACI). Each one generates
**pre-filled from the live control set** (e.g. the ISO 42001 SoA pulls the actual
Annex A controls and their status), downloads as a real Markdown file, and mints
an evidence event — so authoring the artifact and evidencing it are one action.

---

## 10. Design

The visual and interaction philosophy — the "govern with certainty" calm, the
token system, the light-only palette strategy, accessibility rules and the
data-integrity principle that no number appears without a lineage — is documented
separately in **[`design_Philosophy.md`](./design_Philosophy.md)**.

---

## 11. Learn the platform

- **Guided Tour** — an in-app walkthrough (launches on first visit; re-openable any time)
- **Governance Academy → Glossary & Learning** — every term in the platform with
  meaning, where it's used, a worked example, a screenshot, and a what/why/how/where
  quick-learning card (177 entries)

---

© Geniaz. VerisZone is proprietary software.
