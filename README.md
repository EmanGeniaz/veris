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
- **Shadow-AI coverage**: `app/api/policy/inspect` + a reference MV3 browser extension (`integrations/browser-extension/`) let an external CASB/DLP client call the same policy engine before a user pastes sensitive data into a public AI tool

---

## 4. Repository layout

```
app/                 Next.js App Router — pages, layouts, and API route handlers
  api/               gateway/chat · policy/inspect · bus · export · admin · auth · knowledge
components/
  platform/          The product surfaces (30 modules): core design system, role
                     cockpits, AI Central, Risk Center, Compliance, Academy,
                     Super Admin, dictionary, guided tour, …
lib/                 The engines & data model — taxonomy, policy-rules, risk-engine,
                     compliance-engine, cost-engine, audit, rbac, role-centers,
                     platform-models, egress, and the framework/standards libraries
prisma/              schema + seed
integrations/
  browser-extension/ Reference shadow-AI DLP client for the policy engine
scripts/             Screenshot/verification tooling, dictionary artifact generator
public/              Brand assets
e2e/ · testing-agent/  End-to-end and agent-driven verification harnesses
```

---

## 5. Getting started

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

## 6. Scripts

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

## 7. Entry points & demo logins

The entry page (`select[aria-label="Sign in to"]`) offers four ways in:

- **Demo Center** — full platform demo across every role
- **Employee Login** — your role & access resolved via RBAC
- **AI Central** — the standalone Enterprise AI Command Center
- **Super Admin** — platform administration (tenants, modules, RBAC, policy)

---

## 8. Governance & compliance coverage

VerisZone maps initiatives against the frameworks enterprises are actually
audited on, including:

- **EU AI Act** risk tiers (Unacceptable / High / Limited / Minimal) and GPAI obligations
- **ISO/IEC 42001** (AI management system) and **ISO/IEC 27001** (ISMS)
- **NIST AI RMF**, **COSO**, and regional/jurisdictional guardrails

These are computed engines (`lib/compliance-engine.js`, `lib/frameworks.js`,
`lib/iso-standards.js`, `lib/governance-standards.js`, …), not static checklists —
so posture updates as the portfolio does.

---

## 9. Design

The visual and interaction philosophy — the "govern with certainty" calm, the
token system, the light-only palette strategy, accessibility rules and the
data-integrity principle that no number appears without a lineage — is documented
separately in **[`design_Philosophy.md`](./design_Philosophy.md)**.

---

## 10. Learn the platform

- **Guided Tour** — an in-app walkthrough (launches on first visit; re-openable any time)
- **Governance Academy → Glossary & Learning** — every term in the platform with
  meaning, where it's used, a worked example, a screenshot, and a what/why/how/where
  quick-learning card (177 entries)

---

© Geniaz. VerisZone is proprietary software.
