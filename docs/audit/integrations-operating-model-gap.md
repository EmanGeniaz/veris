# Audit — Integrations & Operating-Model coverage (mockups vs. reality)

**Status:** Audit record (no code changed) · **Mode:** discovery/documentation
**Owner:** Principal Architect · **Date:** 2026-09-30
**Basis:** Two product mockups — "Integrations & Enterprise Architecture" (a connector
fabric) and "The GenVeris Operating Model" (a 7-step closed loop) — checked against the
actual codebase with file-path evidence. Marketing imagery is treated as a claim to
verify, not as fact.

> **Bottom line.** GenVeris has a genuinely built, live, **single-provider (Anthropic)**
> governance/enforcement gateway with a real DLP engine, tamper-evident audit chain, HITL
> gating, capability tokens, an Evidence Fabric, and real Entra/Google SSO options. But the
> **connector fabric in Mockup A is ~95% aspirational** — every non-Anthropic AI platform,
> data source, security tool, cloud, SaaS, ITSM/GRC and BI system is a UI label, a seeded
> demo row, or a Connect button that returns an error toast. The "ingestion layer" is one
> generic batch POST, not a fabric. Mockup B's loop is real in the middle (Understand →
> Govern → Monitor) and demo at the edges (multi-source Discover, named connectors,
> incident/remediation).

---

## 1 · The load-bearing fact

`package.json` declares **no vendor SDKs whatsoever** — no `@aws-sdk`, `@azure/*`,
`@google-cloud/*`, `openai`, nor ServiceNow / Jira / Splunk / Okta / Snowflake /
Databricks clients. Production dependencies are `@prisma/client`, `next-auth`, `next`,
`react`, `recharts`, `framer-motion`, `lucide-react`, `@radix-ui`. A repo-wide search for
vendor-SDK imports hits **only e2e/test files**, never app code.

Consequently the app makes exactly **one** outbound integration call:
`fetch("https://api.anthropic.com/v1/messages")` in `app/api/gateway/chat/route.ts`
(~line 296), plus OAuth via `next-auth`. Everything else labelled a "connector" is a
label, a seeded row, or a button that fires an error toast. This single fact underpins
nearly every verdict below.

The full `app/api/` route tree is small and contains **no per-provider connector route**:
`admin/*`, `auth/*`, `bus/*`, `demo-login`, `enforce/{breaker,egress,ledger,memory,retrieval,runtime}`,
`export/*`, `fabric`, `gateway/chat`, `inference-log`, `ingest/discover`, `knowledge`,
`policy/inspect`, `register`.

---

## 2 · The one ingest endpoint — precise capability

`app/api/ingest/discover/route.ts` + `lib/ingest-discover.ts` is a **single generic
bearer-token POST**, not a connector fabric:

- **Auth:** one shared secret (`VE_INGEST_TOKEN` / `VZ_INGEST_TOKEN`, constant-time
  compare). Unset → `503 not configured`.
- **Payload:** a JSON batch of ≤500 records, each `{kind, entityId, confidence?, fields}`,
  where `kind` ∈ the 7 canonical Fabric kinds.
- **Privacy gate:** rejects any record whose `fields` classify as Restricted (secrets /
  PCI / PHI) via `classify()` — metadata, not content.
- **Write:** stamps `source="discover"` and writes hash-chained, idempotent rows into the
  Prisma `FabricRecord` table via `fabricAppend` (`lib/evidence-fabric.ts`).
- **No** streaming, **no** per-source parsing, **no** bidirectional write-back, **no**
  polling/scheduling. It is a batch **push-in sink**. The Discover scanner that would
  *produce* these records is **not in this repo** — by design (it is a separate product).

---

## 3 · Mockup A — "Integrations & Enterprise Architecture"

Legend: ✅ built · ⚠️ partial · demo-only · ✖ absent.

| Claim | Verdict | Evidence |
|---|---|---|
| "Connectors & Ingestion Layer" (pre-built connectors, APIs, webhooks, agents) | **demo-only / absent** | Only the one generic ingest POST. `integrations/` holds **only a browser extension**; no server connectors, webhooks, or agent connectors. |
| AI platform: **Anthropic** | **✅ built** | Real API call, `app/api/gateway/chat/route.ts:~296` (gated on `ANTHROPIC_API_KEY`; `{enabled:false}` without it). |
| OpenAI, Azure OpenAI, Vertex, **AWS Bedrock**, Meta, Hugging Face | **demo-only** | Seeded rows in `lib/platform-models.ts:~313` with fabricated `routedShare`/`costMtd` ("$24.6K"). No SDK; gateway hardcodes `providerId="gw-claude"`. |
| Data sources (DBs, lakes, warehouses, catalogs, streaming) | **✖ absent** | No connector code. Prisma is the app's own store. |
| Security & Ops: Sentinel, Splunk, CrowdStrike, Palo Alto, Defender, SIEM/XDR | **demo-only** | Marketplace cards `components/platform/aicentral.jsx:~1171`, status "Coming Q3/Q4/Roadmap"; Connect → `showToast("Connector authorisation requires production credentials","error")`. |
| IT & Infra: VMware, Hyper-V, K8s, containers, endpoints, network | **✖ absent** | No code beyond incidental references. |
| GRC/ITSM: ServiceNow, Archer, Jira, SAP, Oracle, Workday | **demo-only** | ServiceNow panel `aicentral.jsx:~1092` — "Open" toasts *"ServiceNow hand-off requires a connected production instance"*. |
| Cloud: Azure, AWS, GCP, Oracle Cloud, IBM Cloud | **✖ labels only** | Icons/labels. |
| SaaS: M365/Copilot, Workspace, Salesforce, Atlassian | **demo-only** | `components/platform/core.jsx:~1750` — Salesforce/HubSpot/Dynamics/Zoho hardcoded `status:"Not Connected"`; Connect toasts an OAuth-unavailable error. |
| Identity: **Entra ID**, **Google SSO** | **⚠️ built (gated)** | Real Auth.js providers `auth.ts:~6,~48`, switched on by env vars; off by default. |
| Identity: Okta, Ping, Active Directory | **✖ absent** | Only Entra + Google + Credentials exist. |
| SSO / SAML / OAuth | **⚠️ partial** | OAuth/OIDC via the two providers only; **no SAML**. Default path is Credentials against the Prisma `User` table. |
| Enrichment: **Classify** | **✅ built** | `lib/policy-rules.ts:~180` `classify()` — regex-based data-class + category detector, used live in the gateway. |
| Enrichment: **Map to Frameworks** | **✅ built (static)** | `lib/crosswalk.js` — 32-capability crosswalk → EU AI Act / NIST RMF / ISO 42001 / Singapore MGF; `lib/computed-frameworks.js` computes posture. Statuses are hand-authored, not derived from external evidence. |
| Enrichment: Normalize / Correlate / Enrich | **⚠️ partial** | `lib/evidence-fabric.ts` canonicalizes **internally-held** records (provenance, idempotency, human-wins). Not enrichment from external sources. |
| BI: Power BI, Tableau, Qlik, Snowflake, Databricks | **✖ absent** | In-app `recharts` only. |
| Real-time & batch, bidirectional read/write | **✖ (batch-in only)** | Batch push-in ≤500 records; no streaming, no write-back. |

---

## 4 · Mockup B — "The GenVeris Operating Model" (7-step loop)

**Framing note:** the literal 7-step sequence *Discover → Ingest → Understand → Assess →
Govern → Monitor → Enforce* does **not** exist as a named pipeline, nav, or module.
`lib/navigation.js` uses a different taxonomy, and `README.md` describes a **13-phase
lifecycle** (Opportunity → … → Retire). The 7-step loop is a marketing frame. Mapping each
concept to backing code:

| Stage | Verdict | Where |
|---|---|---|
| **1 Discover** — multi-source detection, shadow-AI, auto-classify | **⚠️ partial** | `app/api/policy/inspect/route.ts` DLP verdict service is real (consumed by the browser extension). **No estate scanner** — multi-source AI detection is absent; ingest only receives externally-produced records. |
| **2 Ingest** — connectors "Connected" | **⚠️ partial** | Generic tokened endpoint real; the named "Connected" connectors are demo labels. |
| **3 Understand** — classify, asset-profile enrichment | **✅/⚠️** | `classify()` built & live; enrichment = internal Fabric canonicalization. |
| **4 Assess** — risk scoring, policy-to-control mapping | **✅ over seeded data** | `lib/risk-engine.js`, `lib/crosswalk.js`, `lib/computed-frameworks.js`; inputs largely seeded/hand-authored. |
| **5 Govern** — approval workflows, human oversight | **✅ built** | `lib/hitl.js` `requiresApproval()` + gateway HITL gate; `escalate` = routed to a human. Deterministic & live. |
| **6 Monitor** — anomaly, cost trend, exfiltration | **✅/⚠️** | Breaker anomaly (`lib/breaker-live.ts`) and egress/exfiltration (`lib/egress.js`) are live from the audit chain → built. **Cost trend** (`lib/cost-engine.ts`) is real arithmetic on a **hardcoded** `TOKENS_MTD` constant (~line 19) + seeded shares → synthetic. |
| **7 Enforce** — access restriction, approval, incident, remediation | **⚠️ partial** | Access restriction (deny-by-default capability block) + approval (HITL escalate) **built & enforced live** in `gateway/chat/route.ts` via `lib/enforce.js` + `lib/agent-registry.ts`. **Incident created / remediation task** are **demo** — no ticketing/ITSM; ledger rows seeded, hand-off buttons toast errors. |

---

## 5 · What IS genuinely built (protect this)

- **The enforcement gateway is real, not a mock.** `app/api/gateway/chat/route.ts` runs a
  full server-side pipeline: input-guard → MCP supply-chain check → capability
  least-privilege → HITL → egress → runtime loop-guard → classify → policy rules →
  governed RAG retrieval → Anthropic call → output moderation → hallucination check →
  tamper-evident audit append.
- **The `enforce/*` read routes** (`breaker`, `egress`, `ledger`, `memory`, `retrieval`,
  `runtime`) are **live-first from a hash-chained Prisma audit log**, falling back honestly
  to a labelled "seeded window" (`telemetryMode`) when no DB is present.
- **Evidence Fabric** (`lib/evidence-fabric.ts`) and **`lib/mcp-registry.js`** (rug-pull
  detection via manifest-hash comparison) are real deterministic logic. Caveat:
  `mcp-registry.js`'s `MCP_SERVERS` is a seeded representative estate, not a live registry.
- **DLP `classify()`** and the **framework crosswalk** are real and live.
- **Entra ID + Google SSO** are genuinely wired (Auth.js), gated on env vars.

---

## 6 · Gap-closure — build / integrate / relabel (reuse-not-rebuild)

The honest move is to decide, per element, one of three dispositions — and it maps cleanly
onto decisions already ratified (three-plane carve-up, strictly-Enforce, positioning doc).

| Element | Disposition | Rationale |
|---|---|---|
| Bedrock / Azure OpenAI / Vertex / OpenAI as **governed providers**; runtime connectors | **Enforce owns it** → surface via entitlement seam **#167** | Runtime is Enforce (the hands); GenVeris keeps governance + demo. strictly-Enforce. |
| Estate scanner / multi-source detection (the thing that *feeds* ingest) | **Veris Discover** (separate product, Enterprise tier) | Discover is the eyes; the ingest **sink** already exists (#176). Out of this repo by design. |
| **ServiceNow / Jira incident & remediation hand-off** | **Build (bounded, in GenVeris)** | Turns Enforce stage 7 from demo → real; a genuine, cheap near-term win. New issue below. |
| **Per-agent / per-tenant cost attribution** | **Deepen `cost-engine`** (no new platform) | Replaces the hardcoded `TOKENS_MTD` constant; closes the FinOps gap from the positioning doc. New issue below. |
| Data sources / SIEM / cloud / BI / SaaS connectors | **Relabel honestly** + roadmap | Show "Available / Roadmap / Requires Enterprise", never imply "Connected". New issue below. |
| Okta / Ping / AD / SAML | **Integrate when a deal needs it** | Incremental Auth.js/SAML providers; not core-blocking. |

**Guardrails still in force:** do **not** build an IdP / CA / PKI / SPIFFE / vault for NHI
(integrate only); do **not** rebuild what Enforce or Discover own.

---

## 7 · Concrete near-term issues (filed from this audit)

1. **Enforce → ServiceNow / Jira incident & remediation hand-off** — make stage-7
   "Incident created / Remediation task" real (behind the #167 entitlement seam), replacing
   the error-toast buttons.
2. **Cost attribution: retire the hardcoded `TOKENS_MTD` constant** — derive per-agent /
   per-tenant spend from the audit chain; deepen `lib/cost-engine.ts`.
3. **Connector honesty relabel** — every non-live connector card shows an accurate state
   (Available / Roadmap / Requires Enterprise / Not Connected) instead of implying
   "Connected"; align with the TelemetryBadge honesty pattern.

These are tracked as GitHub issues and linked to the WS1 entitlement-seam epic (#167).
