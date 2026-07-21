# VerisZone Source Code Index

This project source handover includes the application code, local project skills, public brand assets, mock data, configuration, and prior quality-agent outputs.

Generated folders such as `node_modules` and `.next` are intentionally excluded from the source bundle because they can be recreated with `npm install` and `npm run build`.

## Included Core Application Files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Root route; renders the VerisZone platform shell |
| `app/layout.tsx` | Next.js root layout and metadata/favicon |
| `app/globals.css` | Global CSS and theme styles |
| `app/profile/page.tsx` | Profile route wrapper |
| `app/workspace/[profile]/[[...segments]]/page.tsx` | Dynamic workspace route wrapper |
| `components/VerisZonePlatform.jsx` | Main MVP application component and UI implementation |
| `components/VerisZonePlatform.d.ts` | Type declaration for the JSX platform component |
| `components/ui/button.tsx` | Reusable shadcn-style button component |
| `lib/types.ts` | TypeScript type definitions |
| `lib/mock-data.ts` | Mock AI governance data |
| `lib/platform-models.ts` | Mock enterprise AI transformation control-plane data |
| `lib/store.ts` | Zustand store scaffold |
| `lib/utils.ts` | Utility helpers |

## Included Brand Assets

| Path | Purpose |
| --- | --- |
| `public/brand/veriszone-official-dark.png` | Official dark-mode VerisZone logo asset |
| `public/brand/veriszone-official-light.png` | Official light-mode VerisZone logo asset |
| `public/brand/veriszone-logo-light.svg` | Light logo SVG variant |
| `public/brand/veriszone-dark-app-icon.png` | Favicon/app icon |
| `public/brand/ai-central-symbol.png` | AI Central symbol |
| `public/brand/ai-central-logo.png` | AI Central logo |

## Included Project Configuration

| Path | Purpose |
| --- | --- |
| `package.json` | Scripts and dependencies |
| `package-lock.json` | Locked dependency graph |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind config |
| `postcss.config.mjs` | PostCSS config |
| `eslint.config.mjs` | ESLint config |
| `next-env.d.ts` | Next.js TypeScript env file |

## Included Project Documentation

| Path | Purpose |
| --- | --- |
| `HANDOVER.md` | Product and engineering handover |
| `SKILLS.md` | Skill usage and operating rules |
| `AGENTS.md` | Local Codex agent guidance |
| `SOURCE_CODE_INDEX.md` | This file |

## Included Local Codex Skills

| Path | Purpose |
| --- | --- |
| `.codex/skills/master-platform-quality-orchestrator/*` | Evidence-first audit/fix/regression orchestration |
| `.codex/skills/saas-platform-auditor/*` | QA, SaaS, UI, glyph, AI, governance/security checklists |

## Included Quality-Agent Outputs

| Path | Purpose |
| --- | --- |
| `testing-agent/outputs/00-project-inspection.md` | Project inspection |
| `testing-agent/outputs/01-master-audit-report.md` | Audit report |
| `testing-agent/outputs/02-priority-backlog.md` | Priority backlog |
| `testing-agent/outputs/03-phase-1-critical-fixes.md` | Critical fix report |
| `testing-agent/outputs/04-phase-1-regression.md` | Critical regression |
| `testing-agent/outputs/05-phase-2-high-fixes.md` | High fix report |
| `testing-agent/outputs/06-phase-2-regression.md` | High regression |
| `testing-agent/outputs/07-phase-3-medium-fixes.md` | Medium fix report |
| `testing-agent/outputs/08-phase-3-regression.md` | Medium regression |
| `testing-agent/outputs/09-design-glyph-polish.md` | Design/glyph polish report |
| `testing-agent/outputs/10-final-enterprise-readiness.md` | Final readiness report |

## Restore Commands

From the project root:

```powershell
cmd /c npm install
cmd /c npm run lint
cmd /c npm run build
cmd /c npm run start
```

