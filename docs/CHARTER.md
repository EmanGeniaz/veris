# VerisZone — Project Charter

> Source of truth for scope, decisions and honesty rules. If a feature is not in
> this charter and `docs/SPEC.md`, it does not get built. Updated every cycle.

**Product:** VerisZone — Enterprise AI Governance Control Plane (a product of Geniaz)
**Owner (business):** Saif / Sikander Ahmed
**PM · Developer · Tester:** Claude Code (this session)
**Last updated:** cycle C0 (charter established)

---

## 1. Vision (locked — from README)

VerisZone is the control plane where an enterprise **plans, governs, ships and
proves the value** of every AI initiative — opportunity to retirement — under one
auditable system of record. One object model (the *initiative*), one 13-phase
lifecycle, one governance spine (posture **computed** from initiatives, never
asserted), one **AI Gateway**, and one **enforcement plane (Veris Enforce)** where
"the governance you author is the governance that executes." Controls hold
*around* the model, not inside it.

## 2. Decisions (locked C0)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Product ambition | **Full enforcement platform** (control plane **+** real inline enforcement) |
| D2 | Deployment | **SaaS now, self-host (customer VPC) later** — code stays self-host-friendly from day one |
| D3 | Posture rule | Every compliance/posture number is **computed from a mapping**, never hand-set |
| D4 | Render safety | No `Date.now` / `Math.random` in any render/SSR path — deterministic engines |
| D5 | Readability | Grandma-readable is an **acceptance criterion**, not polish (see SPEC §Readability) |
| D6 | Evidence gate | No feature is "done" until: `npm run build` passes + live Playwright test + 0 console errors, shown to the owner |
| D7 | Veris Enforce | A **separately-licensed standalone AI-security product**. VerisZone embeds its surfaces seamlessly but **entitlement-gated per tenant** (MS 365 / Visio model): licensed → live Enforce data; unlicensed → locked/upsell + route to buy. Never free inside VerisZone. A **shared enforcement core** prevents drift. |
| D8 | Localisation | **Arabic + RTL**, rolled out **pilot-first** (i18n scaffolding + 1–2 full surfaces to prove the pattern), then surface-by-surface. |
| D9 | Regional law | First-class **UAE / Dubai** scope: PDPL (Federal), DIFC DP Law, ADGM DP Regs, DESC, and data-residency / cloud rules — as a computed regulatory pack. |
| D10 | Test gate | Every feature passes an automated **click-integrity** run capturing **location** (role · surface · element), **console logs**, and clickability before "done" (harness = milestone M-TEST). |

## 2b. Veris Enforce — product-line model (D7)

Veris Enforce is its own end-to-end AI-security product, **sold separately**.
Inside VerisZone it appears as native surfaces but is **licensed**:

- **Shared core** (`lib/enforce*`, policy engine, capability model) — one
  implementation, consumed by both the standalone product and the embedded view,
  so behaviour never diverges.
- **Data contract** — VerisZone reads Enforce state through a defined interface
  (`enforceProvider`), so the embedded surfaces render live when the tenant is
  licensed and a locked/upsell state when not.
- **Entitlement gate** — per-tenant `enforceLicensed`. Licensed → live; unlicensed
  → "Veris Enforce required" panel that routes to purchase. Never silently free.
- **Buildable here:** the shared core, the data contract, the entitlement gate and
  the locked/live surface states. **Not here:** the standalone product's own repo/
  deploy and real inline enforcement (see M6 / reality register).

## 3. Scope

### In scope (the product)
The control-plane UI + object model + framework mappings + governance workflows
(breach, AIA, data provenance, carbon, incident, gap-closure), the **Gateway**
policy pipeline, **Veris Enforce** (capability tokens, egress, HITL, circuit
breaker, Tool-Call Ledger), **Policy-as-a-Service** + shadow-AI extension, real
auth + Postgres + multi-tenant, and self-host packaging. Detailed per-component
status in `docs/SPEC.md`.

### Out of scope (explicitly, to prevent drift)
- Building the customer's AI apps/agents for them (we govern; we don't build their models).
- Claiming legal **"compliance"** — we deliver **control coverage / audit-readiness**, which an external auditor certifies. The word "compliant" is banned from UI and docs.
- Any framework/surface not listed in SPEC. New ideas go to a backlog, not into a cycle, until the owner promotes them.

## 4. Brutal reality register — what this sandbox CANNOT deliver

Choosing "full enforcement platform" means part of the product lives outside what
I can build or verify in this environment. This is not pessimism; it is the
honest boundary. Each is tagged in the Gantt.

| Item | Why it can't be finished/verified here | Who unblocks it |
|------|----------------------------------------|-----------------|
| Real inline enforcement (block/mask/revoke **live** traffic) | Needs real customer network path, real model providers, real tools | Customer integration + real env |
| Production auth + database | Needs real Postgres + secrets (`AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`) provisioned by owner | **Owner** (Vercel/infra) |
| Live model behaviour / guardrails | Gateway needs API keys; real refusal/injection behaviour needs load | Owner (keys) + real traffic |
| Multi-tenant isolation at scale, RBAC under load | Needs real environment + load harness | Real env + load test |
| Security hardening / penetration test | Needs a security team + real deployment | External security review |
| External **compliance assurance** | Only an auditor can certify | Third-party auditor |
| Real telemetry → provenance/carbon/incidents | Today all **modelled**; wiring live feeds is integration work | Customer data integration |

**What I CAN do here:** design + build all engine logic, data models, interfaces,
UI, deterministic mock/stub enforcement, self-host packaging config, docs; and
verify via build + Playwright + engine tests. The interfaces I build are the real
seams the above plug into — so "cannot verify here" ≠ "not built," it means the
last-mile live proof happens in a real environment.

## 5. Current state (honest, C0)

A **high-fidelity working prototype**: 32/32 frameworks Operational with computed
posture, 0 gap rows, governance workflows built and live-tested, demo mode on
modelled data. **Not yet** production: auth/DB not provisioned, enforcement is
design+logic not live, all registers are seeded. See Gantt for the path.

## 6. Cadence & reporting

One **cycle** = build → `npm run build` → live Playwright test → owner review →
merge. Each cycle I update `docs/GANTT.md` + this charter's "last updated",
report milestones hit, and state what's blocked. Rework stays inside its
milestone. No cycle starts a feature that isn't in SPEC.
