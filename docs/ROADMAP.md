# GenVeris — Roadmap

> Last reconciled against `main` on 2026-10-07.
> Forward horizons. The Gantt (`docs/GANTT.md`) tracks the committed milestones;
> this shows the direction beyond them. Honest about what needs a real
> environment. Updated as horizons shift. **"Here?"** = completable/verifiable in
> this sandbox (✅ / ⚠️ partial / ❌ needs real infra, keys, or integration).

## Now (in flight / next up)
| Item | Milestone | Here? |
|------|-----------|-------|
| Veris Enforce live-from-Enforce adapter + Enforce → Evidence Fabric (WS2 sub-task 3, #167) — blocked on the Enforce team's OpenAPI spec | M-ENF | ⚠️ |
| Provision deploy-env secrets so auth, RBAC and live telemetry run in production (#142) — owner/ops | M4 | ❌ |
| Readability & type lock | M-UX | ✅ |
| Arabic rollout — remaining English surfaces (Home/Playbook/Advisor, admin portals) | M-AR | ✅ |

Done since this roadmap was written: click-integrity harness (M-TEST), UAE/Dubai pack (M-UAE),
Arabic pilot + most surfaces (M-AR), data-subject-rights lifecycle (M2), Enforce entitlement
model + connection (#199, #200) — see `docs/GANTT.md`.

## Next (buildable here, sequenced after Now)
| Item | Notes | Here? |
|------|-------|-------|
| Durable retention reaper (BL-07, #172) | Scoped; needs owner approval (production infra + retention policy) | ✅ (build) |
| Connector honesty relabel (#182) + Enforce → ServiceNow/Jira hand-off (#180) | From the integrations gap audit | ✅ / ⚠️ |
| WS4 enforced AI-PMO phase gates (#169) · WS5 Veris Intelligence personas (#170) · WS6 role-center scope (#171, needs a product decision) | Not started | ✅ |
| Governance depth — retire remaining honest Partials via real controls | Rolling; never relabels | ✅ |
| More regional packs as customers require | Same computed-pack pattern | ✅ |

## Later (needs real environment / owner / integration)
| Item | Blocked on | Here? |
|------|-----------|-------|
| Gateway live — model keys + real routing + policy enforcement on live inference | Owner keys + real traffic | ⚠️ |
| **Veris Enforce standalone** — its own repo, deploy, and **real inline enforcement** (egress proxy/agent, capability broker, extension in a real network) | Separate repo + customer integration | ❌ |
| Self-host packaging — Docker/compose, config, install docs, air-gap, UAE data-residency deploy | After backend lands | ✅ (build) / ⚠️ (verify) |
| Hardening & assurance — security review, pen-test, load test, external audit | External security + auditor | ❌ |

## Vision (direction, not committed scope)
- **Two products, one seam:** GenVeris (governance control plane) + Veris Enforce
  (standalone AI-security), sold separately, integrated so the customer feels one
  surface — licensed, never free.
- **Regional-first:** UAE/Dubai as the first deep regional build (data residency,
  Arabic, local law), a template for other jurisdictions.
- **Prove, don't assert:** every number computed and evidenced; the product is
  audit-ready, and it never claims "compliant" — an auditor certifies that.
- **Enforcement at adopted chokepoints:** honest about controlling only the AI
  traffic a customer routes through the gateway — never "everything everywhere."

## Guardrails on this roadmap (from the charter)
No item enters a build cycle until it is in `docs/SPEC.md`. No calendar promises —
sequencing only, cadence set by the owner. Anything flagged ❌ here is stated as
not-completable-in-this-environment wherever it is discussed, to avoid overclaim.
