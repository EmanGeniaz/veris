# VerisZone Platform Handover

Last updated: 2026-07-21

## 1. Product Context

VerisZone is currently implemented as an enterprise AI governance and transformation control-plane MVP. The product direction has evolved from a governance dashboard into an Enterprise AI Transformation Control Plane:

- CXO Platform: strategy, accountability, AI opportunity intake, CXO reviews, pilot planning, budget, ownership, scale decisions.
- AI Central: execution and assurance workspace for AI initiatives, department pilots, task monitoring, risk tracking, guardrails, evidence, exceptions, adoption, compliance and scale readiness.
- AI Spine: proprietary orchestration model, currently represented inside AI Central rather than as a separate workspace.
- Demo Center: seeded sales/demo environment. Other subscribed workspaces should open clean with no sample data.

Evidence:

- Main implementation: `components/VerisZonePlatform.jsx`
- Login profile definitions: `components/VerisZonePlatform.jsx` around `LOGIN_PROFILES`
- Workspace-empty behavior: `components/VerisZonePlatform.jsx` around `FreshWorkspaceEmpty`
- AI Central module: `components/VerisZonePlatform.jsx` around `PageAICentral`
- Template library: `components/VerisZonePlatform.jsx` around `PageTemplates`

## 2. Current Tech Stack

| Area | Current State | Evidence |
| --- | --- | --- |
| Framework | Next.js 15 app router | `package.json`, `app/page.tsx`, `app/layout.tsx` |
| Language | TypeScript project with a large JSX app component | `tsconfig.json`, `components/VerisZonePlatform.jsx`, `components/VerisZonePlatform.d.ts` |
| UI | Tailwind CSS plus inline React styles | `tailwind.config.ts`, `app/globals.css`, `components/VerisZonePlatform.jsx` |
| Animation | Framer Motion installed; custom CSS/keyframes also used | `package.json`, `components/VerisZonePlatform.jsx` |
| Icons | Lucide React installed and used | `package.json`, `components/VerisZonePlatform.jsx` |
| Charts | Recharts installed and used | `package.json`, `components/VerisZonePlatform.jsx` |
| State | Zustand installed; app currently relies heavily on local component state | `package.json`, `lib/store.ts`, `components/VerisZonePlatform.jsx` |

## 3. Important Routes

| Route | Purpose | Current Status | Evidence |
| --- | --- | --- | --- |
| `/` | Main login/demo entry shell | Implemented | `app/page.tsx` renders `VerisZonePlatform` |
| `/profile` | Profile route wrapper | Implemented as same platform shell | `app/profile/page.tsx` |
| `/workspace/[profile]/[[...segments]]` | Dynamic workspace route wrapper | Implemented as same platform shell | `app/workspace/[profile]/[[...segments]]/page.tsx` |

Routing caveat:

- The dynamic route exists, but much of the in-app navigation is still driven by local state and hash-style behavior inside `components/VerisZonePlatform.jsx`.
- Previous backlog marked hash/local tab routing as High priority.

## 4. Key Source Files

| File | Purpose |
| --- | --- |
| `components/VerisZonePlatform.jsx` | Main product UI, login shell, navigation, pages, mock data, templates, AI Central, profile editor |
| `components/VerisZonePlatform.d.ts` | Type declaration for the JSX component |
| `lib/types.ts` | Type model definitions for governance, CXO and transformation objects |
| `lib/platform-models.ts` | Mock transformation control-plane data |
| `lib/mock-data.ts` | Mock governance data from the earlier onion-layer MVP |
| `lib/store.ts` | Zustand store stub |
| `app/globals.css` | Global styling and theme foundations |
| `public/brand/*` | VerisZone and AI Central brand assets |
| `testing-agent/outputs/*` | Prior audit/regression/report artifacts |
| `.codex/skills/*` | Local Codex reusable skills and checklists |

## 5. Branding State

Current intended brand rules:

- Product name: VerisZone
- Tagline: Govern with certainty.
- Dark mode uses premium blue/gold VerisZone logo assets.
- Light mode uses the light blue/gold logo treatment.
- AI Central has a separate symbol/logo and should be visible as a standalone login profile, not as a normal CXO tab.

Important assets:

| Asset | Purpose |
| --- | --- |
| `public/brand/veriszone-official-dark.png` | Dark-mode VerisZone logo |
| `public/brand/veriszone-official-light.png` | Light-mode VerisZone logo |
| `public/brand/veriszone-logo-dark.png` | Legacy/current dark logo variant |
| `public/brand/veriszone-logo-light.svg` | Light logo SVG variant |
| `public/brand/veriszone-dark-app-icon.png` | Favicon/app icon |
| `public/brand/ai-central-symbol.png` | AI Central symbol |
| `public/brand/ai-central-logo.png` | AI Central logo |

## 6. Demo Center and Workspace Data Rule

Product rule from user:

- Demo Center is for the sales team to show seeded sample data.
- CXO workspaces should be brand new and empty by default.
- AI Central standalone workspace should be brand new and empty by default.
- AI Central inside Demo Center may have demo data.

Implementation evidence:

- `LOGIN_PROFILES` contains `demo`, CXO profiles, and `aicentral`.
- `FreshWorkspaceEmpty` communicates that subscribed workspaces are clean.
- `showSeededData` gates seeded pages in the main component.

## 7. Templates and CAIO Implementation Kit

The user provided a CAIO Implementation Kit at:

`C:\Users\User\Desktop\CCAIO\CAIO Implementation Kit\CAIO Implementation Kit`

Relevant kit documents inspected:

| Kit Document | Platform Template Alignment |
| --- | --- |
| `CAIO-801. AI Risk Inventory Sheet.docx` | AI Risk Register |
| `CAIO-802. Bias & Fairness Risk Checklist.docx` | Bias Detection & Mitigation |
| `CAIO-804. AI Ethics Impact Assessment (ISO 42001 Based).docx` | AI System Impact Assessment and Ethics Impact |
| `CAIO-814. Responsible Use Policy for Generative AI Tools.docx` | GenAI Responsible Use Policy |
| `CAIO-901. AI KPI Monitoring Dashboard.docx` | AI KPI Monitoring Dashboard |
| `CAIO-910. Post-Deployment Review Template.docx` | Post-Deployment Review |
| `CAIO-1002. Build vs Buy Decision Matrix.docx` | Build vs Buy Decision Matrix |
| `CAIO Responsibility Mapping - RACI Matrix.docx` | CAIO RACI |
| `Use Case Scoring Template (Impact - Feasibility - Risk).docx` | Use Case Scoring |
| `CAIO-401. AI Project Planning Template (POC -> Pilot -> Scale).docx` | POC / Pilot / Scale planning |
| `CAIO-1008. Legal & Data Privacy Risk Evaluation Template.docx` | DPIA / TIA legal privacy template |
| `CAIO-410. Governance Model for AI Projects (Pilot vs Production).docx` | Pilot vs Production governance applicability |
| `CAIO-506. Exception Handling & Human Review Ruleset.docx` | HITL exception and review rules |

Current template implementation:

- `KIT_TEMPLATE_SOURCES` is present in `components/VerisZonePlatform.jsx`.
- `PageTemplates` displays implementation kit source metadata.
- Template preview/generation is local mock generation, not a real AI call.
- Some draft content still needs stronger alignment to kit documents, especially `t_mc`, `t_nc`, `t_ks`, `t_soa`, `t_bias`, `t_dep`, `t_ethics`, `t_kpi`, `t_post`, `t_dpia`, and `t_tia`.

## 8. Known Quality Findings From Existing Reports

Existing backlog evidence is in `testing-agent/outputs/02-priority-backlog.md`.

| Priority | Status | Issue | Evidence |
| --- | --- | --- | --- |
| High | Verified | Monolithic app component | `components/VerisZonePlatform.jsx` |
| High | Verified | Hash/local tab routing | `app/page.tsx`, `enterFromHash` |
| High | Verified | No real RBAC boundary | Local role/session state only |
| High | Verified | Profile changes are local-only | `PageProfile`; save action only updates UI/toast |
| High | Verified | Demo login has no credential validation | `BrandEntryShell` |
| High | Inferred | Root theme mismatch | `app/layout.tsx` hardcoded `className="dark"` |

Note:

- Earlier build failure related to `next.config.ts` appears to have been addressed before this handover, but run the checks below before continuing any implementation.

## 9. Current Operational Commands

Use these from:

`C:\Users\User\Documents\Codex\2026-05-19\build-a-production-quality-mvp-for`

```powershell
cmd /c npm run lint
cmd /c npm run build
```

Restart local production server:

```powershell
$project='C:\Users\User\Documents\Codex\2026-05-19\build-a-production-quality-mvp-for'
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*$project*" -and ($_.Name -eq 'node.exe' -or $_.Name -eq 'cmd.exe') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList 'run','start' -WorkingDirectory $project -WindowStyle Hidden
Start-Sleep -Seconds 10
curl.exe -I http://localhost:3000/
```

## 10. Recommended Next Work

1. Finish CAIO Implementation Kit alignment for the remaining generated templates in `PageTemplates`.
2. Run lint/build and restart server.
3. Verify template Preview and Generate buttons visually in Demo Center.
4. Remove or convert any remaining non-clickable labels into either real controls or disabled controls with explanatory state.
5. Split `components/VerisZonePlatform.jsx` into smaller modules:
   - `BrandEntryShell`
   - `AppShell`
   - `Sidebar`
   - `Profile`
   - `Templates`
   - `AICentral`
   - `CXOWorkspace`
   - `FreshWorkspaceEmpty`
6. Add route-backed navigation for major modules so every sidebar item has a stable route.
7. Add explicit auth/RBAC model before claiming production readiness.
8. Add test coverage for:
   - Login profile selection
   - Demo Center seeded data
   - Clean subscribed workspaces
   - Template preview/generation
   - AI Central standalone login
   - Profile sign out

## 11. Guardrails For Future Changes

- Do not remove VerisZone logo assets or AI Central assets.
- Keep Demo Center seeded; keep subscribed workspaces empty.
- Do not place AI Central as a normal CXO tab.
- Keep AI Spine as part of AI Central unless the user asks otherwise.
- Do not use sample data in customer workspaces unless explicitly toggled through Demo Center.
- Use evidence-first reporting for audits and handoffs.
- Run `npm run lint` and `npm run build` after implementation changes.

## 12. Immediate Continuation Prompt

Use this prompt to continue cleanly:

```text
Continue from HANDOVER.md. Finish aligning PageTemplates generated draft content to the CAIO Implementation Kit sources already mapped in KIT_TEMPLATE_SOURCES. Do not redesign the app. Keep Demo Center seeded and subscribed workspaces empty. After changes, run npm run lint and npm run build, restart localhost:3000, and report files changed plus checks.
```

