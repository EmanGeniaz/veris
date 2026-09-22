# Phase 0: Project Inspection

| Item | Status | Evidence |
|---|---|---|
| Framework | Verified | `package.json`: Next `15.0.4`, React `19.0.0`, TypeScript |
| Scripts | Verified | `package.json`: `dev`, `build`, `start`, `lint`; no app test script |
| Routes | Verified | `app/page.tsx` returns `GenVerisPlatform`; only `/` app route found in inspected files |
| Main UI | Verified | `components/GenVerisPlatform.jsx` exports default `GenVeris`; large single client component |
| Data model | Verified | `lib/types.ts`: AIAsset, Risk, TreatmentPlan, HITLApproval, Framework, Control, EvidenceItem, UserRole, GovernanceLayer, AuditEvent |
| Mock data | Verified | `lib/mock-data.ts`; additional embedded mock data in `components/GenVerisPlatform.jsx` |
| State | Verified | `lib/store.ts` exists; `components/GenVerisPlatform.jsx` uses local React `useState` |
| Branding | Verified | `app/layout.tsx` metadata and icons use GenVeris assets |
| Checks | Verified | `npm run lint` passed; `npm run build` failed on `next.config.ts` |
