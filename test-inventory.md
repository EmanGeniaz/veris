# VerisZone — Test Inventory (Phase 1)

_Read-only inventory established before testing. Evidence is `file:line`._

## Routes (Next.js filesystem)
| Route | Type | Renders |
| --- | --- | --- |
| `/` | page | `VerisZonePlatform` SPA (`app/page.tsx`) |
| `/profile` | page | same SPA, profile tab (`app/profile/page.tsx`) |
| `/workspace/[profile]/[[...segments]]` | page | same SPA, hydrates tab from URL (`app/workspace/.../page.tsx`) |
| `/api/admin/setup` | API | tenant provisioning |
| `/api/admin/tenants` | API | tenant list |
| `/api/auth-status` | API | `{enabled, sso}` |
| `/api/auth/[...nextauth]` | API | Auth.js handlers |
| `/api/bus/[store]` | API | persistence bus (GET/POST), RBAC-gated writes |
| `/api/export/[pack]` | API | XLSX export (`risks.xlsx`, `portfolio.xlsx`) |
| `/api/gateway/chat` | API | AI gateway (returns `{enabled:false}` w/o `ANTHROPIC_API_KEY`) |
| `/api/knowledge` | API | knowledge retrieval |

In-app navigation is a **client `tab` state machine** (~50 tab pseudo-routes) in `VerisZonePlatform.jsx`, mirrored to the URL via `history.replaceState` — not the Next router.

## Navigation (per role, from `components/platform/core.jsx`)
| Role | Sidebar items | Notes |
| --- | --- | --- |
| CEO | 10 | CEO cockpit + Enterprise group |
| CAIO | 11 | incl. Admin Portal |
| CISO / CIO / CGO | 10 | three roles get Admin Portal |
| COO / CFO / CHRO / CDPO | 9 | role command center |
| Employee | 11 | 5 groups (My Workspace / My Work / Insights / Learn / Enterprise) |
| Manager | 11 | 3 groups (My Workspace / My Team / Enterprise) |
| CRO / Legal | 7 | fall through to `PLATFORM_NAV_SECTIONS` (not in `ROLE_CENTERS`) |

Contextual routing via `OWNER_SURFACE` (core.jsx:427) keeps the owning sidebar item highlighted on drill-down. Central object routing via `lib/navigation`.

## Business objects → canonical source
| Object | Canonical source | Duplicate-source flag |
| --- | --- | --- |
| AI Initiative | `lib/platform-models.ts acInitiatives` **and** `lib/portfolio.js PORTFOLIO` | **SPLIT** — CEO center runs off `PORTFOLIO`; AI Central off `acInitiatives`; fields disagree |
| AI Model | `core.jsx MODEL_REGISTRY` | count 8 vs "17" in maturity prose |
| AI Agent | `lib/agent-registry.ts AI_AGENTS` | canonical |
| Risk | `lib/platform-models.ts riskRegister` | **VIOLATED** by hardcoded ceo.jsx risk tables |
| KRI | `lib/platform-models.ts kriRegister` | canonical |
| Policy / Control | `POLICY_REGISTER`, `COMMON_CONTROLS`/`ANNEX_A_CONTROLS` | canonical |
| Standard / Framework | `portfolio.js FRAMEWORKS` **and** `AC_FRAMEWORK_POSTURE` | **SPLIT** + `STANDARDS_MAP` |
| Evidence | `platform-models.ts acEvidence` + `lib/bus` store | canonical |
| Approval / Decision | `EXEC_DECISIONS` + `lib/bus` decisions store | canonical |
| PMO / Milestone | `platform-models.ts acPmo` | canonical |
| Impact Assessment / AIRA / AIRT | `AI_GOV_ENGINES` / `acAssessments` / `lib/risk-engine.js` | canonical |
| Training / Course | `lib/academy-engine.js` | canonical |
| ROI / Value | `portfolio.js PF`, `lib/cost-engine.ts` | canonical (traceable) |

There is **no `lib/mock-data.ts`** despite the source index referencing it.

## Maps / geographic visualizations
| Component | Location | Geography | Consistent with shipped treatment? |
| --- | --- | --- | --- |
| `ExposureMap` | ceo.jsx:334 | `WORLD_GEO` (real Natural Earth, `lib/world-geo.js`) | **YES** (reference) |
| `FilterMap` | ceo.jsx:474 / paths at :486 | old inline blocky `CONTINENTS` (ceo.jsx:275) | **NO** — only remaining inconsistent map |

No other component in the codebase renders a geographic map.
