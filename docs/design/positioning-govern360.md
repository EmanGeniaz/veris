# Positioning — GenVeris vs Govern360 (with gap-closure, reuse-not-rebuild)

**Status:** Working reference · **Owner:** Product / Strategy · **Basis:** a competitor
comparison (external, Govern360) corrected against what GenVeris + Veris Enforce +
Veris Discover actually build today. External comparison points are treated as
data to weigh, not fact; the corrections below reflect the real codebase.

> Bottom line: lead where GenVeris is structurally different and hard to copy —
> one control plane across Discover→Govern→Enforce, an ISO 42001 operating model,
> and **continuous, provable evidence** — then close two cheap, reuse-only gaps
> (FinOps attribution, NHI) and *surface* capabilities already built in Enforce.

---

## 1 · Corrections — where the external comparison undercounts GenVeris

The comparison was written without visibility into the Veris Enforce repo, so it
marks three built capabilities as "opportunity / should be built."

| Row | External says | Reality in the codebase |
|---|---|---|
| **MCP governance** | "should be built" | **Built.** Enforce M11 = full MCP JSON-RPC enforcement proxy (tool-call enforcement + result scanning); GenVeris `lib/mcp-registry.js` adds supply-chain **provenance** (manifest hash-pinning, rug-pull quarantine, OWASP LLM03). Not a gap — it surfaces in GenVeris via the entitlement seam (#167). |
| **Runtime agent control** | "Enforce opportunity" | **Built (DP-ready).** Enforce M5 — per-agent tool allow-lists, argument validation, dangerous→HITL gates — plus the circuit-breaker (graduated revocation / kill-switch). A *current strength*. |
| **Token / AI FinOps** | "not core" | **Exists.** `lib/cost-engine.ts` (price book, per-request token ceiling, per-provider budgets) + AI Central "AI FinOps — spend vs budget." Not as deep as Govern360's, but present. |

These live in **Enforce** and light up in **GenVeris** through the entitlement seam
(#167). Wiring that seam corrects the undercount without new platform work.

---

## 2 · The moat the comparison flattened to "Core / Core"

**AI evidence / audit is not parity.** Govern360 has evidence; GenVeris has a
**cryptographically tamper-evident, *continuous* Evidence Fabric** (#174) — live,
chain-verified, provenance-stamped, human-decision-wins — not a point-in-time
binder. Paired with the **ISO 42001 operating-model foundation**, that is the
hardest-to-copy edge.

**Message:** *"governance you can prove, continuously"* — not *"we also store
evidence."* Do not let a "Core/Core" cell hide it.

---

## 3 · The real gaps — honest, and worth respecting

| Gap | Govern360 | GenVeris today | Nature |
|---|---|---|---|
| **FinOps depth + spend attribution** | very strong differentiator | `cost-engine` foundation; per-agent/tenant attribution shallow | **deepen**, not build |
| **Microsoft ecosystem** | very strong (M365/Copilot/Purview) | Azure OpenAI + Entra SSO only | incremental connectors |
| **NHI / agent identities** | strong/current | agent-registry + per-agent enforce + capability tokens + breaker revocation; no first-class NHI register | bounded build — **do NOT build an IdP** (integrate SPIFFE/IAM/Vault) |

---

## 4 · Gap-closure — reuse-not-rebuild, mapped to issues

| Item | Move | New platform? |
|---|---|---|
| MCP + runtime control | *Surface* Enforce's built capability in GenVeris | No — entitlement seam **#167** |
| FinOps / attribution | Extend `cost-engine` → per-agent/tenant spend attribution | No — deepen existing |
| NHI / agent identities | Fabric entity (`AgentIdentity`/`AISystem` subtype) + Discover connector + Enforce enforcement | Bounded; **no IdP** |
| Microsoft depth | Enforce connectors (Purview / Copilot / Entra) | Incremental connectors |
| Governance lifecycle | AI PMO enforced phase gates | **#169** |
| Operating model / consulting | The ISO 42001 framework + lifecycle-loop operating model | The wedge — already the direction |

Almost nothing here is net-new platform: it is *surface* (via #167), *deepen*
(cost-engine), or *bounded add* (NHI entity + connectors).

---

## 5 · Positioning verdict

Don't fight Govern360 head-on on FinOps and Microsoft first — that's chasing.
**Lead with the structural differences they can't easily copy:**

1. **One control plane** spanning Discover → Govern → Enforce (three products, one
   Evidence Fabric spine).
2. **ISO 42001 operating model** as the foundation, not a checkbox.
3. **Continuous, provable evidence** (tamper-evident Fabric).

Then:
- **Close** FinOps-attribution and NHI — both cheap, both reuse — so the
  "opportunity" cells flip to "Core."
- **Surface** Enforce's MCP + runtime strengths via #167 so the undercounted rows
  correct themselves.
- **Invest** in Microsoft-ecosystem connectors where deals demand it.

---

## 6 · Corrected capability snapshot

Legend: ✅ built · ◐ foundation exists, deepen · ○ bounded build · 🔌 integrate.

| Capability | GenVeris (corrected) |
|---|---|
| AI discovery / inventory / shadow AI / agent discovery | ✅ (Discover + Fabric + Enforce posture) |
| AI risk assessment · governance · policy · compliance | ✅ |
| ISO 42001 (strategic foundation) · EU AI Act · NIST AI RMF | ✅ |
| AI evidence / audit (continuous, tamper-evident) | ✅ **differentiator** |
| MCP governance | ✅ (Enforce M11 + provenance) — surface via #167 |
| Runtime agent control | ✅ (Enforce M5 + circuit-breaker) — surface via #167 |
| Token / AI FinOps | ◐ (cost-engine + AI Central) — deepen |
| AI spend attribution | ◐ deepen (per-agent/tenant) |
| NHI / agent identities | ○ bounded build (no IdP) |
| Microsoft ecosystem | 🔌 incremental connectors |
| Enforcement orchestration | ✅ Enforce (strategic strength) |
| Governance lifecycle · operating model · consulting | ◐→✅ the wedge (#169 + operating model) |
