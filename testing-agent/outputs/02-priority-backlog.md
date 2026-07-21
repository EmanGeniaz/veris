# Phase 2: Priority Backlog

| Priority | Status | Issue | Evidence | Recommended Fix |
|---|---|---|---|---|
| Critical | Verified | Build fails | `npm run build`; `next.config.ts:5` | Replace invalid `devIndicators: false` with valid Next 15 config or remove it |
| High | Verified | Glyph corruption | `components/VerisZonePlatform.jsx:5`, `:239`, `:1332` | Replace corrupted text/icons; remove encoding-damaged comments/strings |
| High | Verified | Demo login has no credential validation | `BrandEntryShell` anchors call `onEnter(profile)` | Make demo behavior explicit or add validation gate |
| High | Verified | No real RBAC boundary | `VerisZone` local `role`, `sessionMode`; no middleware/API inspected | Add permission model before pilot/production claims |
| High | Verified | Monolithic app component | `components/VerisZonePlatform.jsx` | Split shell, login, AI Central, CXO, profile, HITL modules |
| High | Verified | Hash/local tab routing | `app/page.tsx`, `enterFromHash` | Add stable route/deep-link model for key modules |
| High | Inferred | Theme root mismatch | `app/layout.tsx` hardcoded dark class | Sync root theme class with app theme |
| High | Verified | Profile changes are local-only | `PageProfile`; `Save profile` only shows toast | Add persistence or mark as mock-only |
