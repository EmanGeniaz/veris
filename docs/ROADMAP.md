# VerisZone — Roadmap

> Forward horizons. The Gantt (`docs/GANTT.md`) tracks the committed milestones;
> this shows the direction beyond them. Honest about what needs a real
> environment. Updated as horizons shift. **"Here?"** = completable/verifiable in
> this sandbox (✅ / ⚠️ partial / ❌ needs real infra, keys, or integration).

## Now (in flight / next up)
| Item | Milestone | Here? |
|------|-----------|-------|
| Click-integrity test harness (location + logs + clickability gate) | M-TEST | ✅ |
| UAE / Dubai regulatory pack | M-UAE | ✅ |
| Arabic + RTL pilot (i18n scaffolding + 1–2 surfaces) | M-AR | ✅ |
| Readability & type lock | M-UX | ✅ |
| Data-subject-rights lifecycle (consent · DSAR · erasure) | M2 | ✅ |

## Next (buildable here, sequenced after Now)
| Item | Notes | Here? |
|------|-------|-------|
| Veris Enforce product-line — shared core + data contract + per-tenant entitlement gate + locked/live states | The MS 365 / Visio model (D7). Standalone repo/deploy is separate. | ⚠️ |
| Arabic rollout — remaining surfaces, RTL polish, Arabic numerals/dates | After pilot proves the pattern | ✅ |
| Governance depth — retire remaining honest Partials via real controls | Rolling; never relabels | ✅ |
| More regional packs as customers require | Same computed-pack pattern | ✅ |

## Later (needs real environment / owner / integration)
| Item | Blocked on | Here? |
|------|-----------|-------|
| Real backend live — auth + Postgres + tenant isolation + server RBAC | Owner infra (`AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`) | ⚠️ |
| Gateway live — model keys + real routing + policy enforcement on live inference | Owner keys + real traffic | ⚠️ |
| **Veris Enforce standalone** — its own repo, deploy, and **real inline enforcement** (egress proxy/agent, capability broker, extension in a real network) | Separate repo + customer integration | ❌ |
| Self-host packaging — Docker/compose, config, install docs, air-gap, UAE data-residency deploy | After backend lands | ✅ (build) / ⚠️ (verify) |
| Hardening & assurance — security review, pen-test, load test, external audit | External security + auditor | ❌ |

## Vision (direction, not committed scope)
- **Two products, one seam:** VerisZone (governance control plane) + Veris Enforce
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
