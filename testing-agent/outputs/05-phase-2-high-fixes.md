# Phase 5: High Fixes

| Approved High Issue | Status | Evidence | Files Changed | Fix |
|---|---|---|---|---|
| Glyph corruption | Verified fixed for source markers | `Select-String 'Ã|Â|â|�'` returned no matches in `components/GenVerisPlatform.jsx` | `components/GenVerisPlatform.jsx` | Removed mojibake markers, repaired damaged comments, normalized corrupted glyph/icon strings |
| Demo login lacks validation | Verified fixed in code | `BrandEntryShell` now validates selected profile email and demo password before `onEnter(profile)` | `components/GenVerisPlatform.jsx` | Added controlled email/password fields and error message |
| Theme root mismatch | Verified fixed in code | `document.documentElement.classList.toggle("dark", theme==="dark")` | `components/GenVerisPlatform.jsx` | Syncs root theme class and `data-theme` with app state |
| Hash/local tab routing | Verified improved in code | Hash sync effect and parser for workspace/profile/AI Central hashes | `components/GenVerisPlatform.jsx` | Adds stable hash state for workspace tabs and AI Central views |
| Profile changes local-only | Verified improved in code | `localStorage.setItem("genveris.userProfiles", ...)` and initial load merge | `components/GenVerisPlatform.jsx` | Saves editable profile data to browser local storage |

Deferred High risks: full server-side RBAC and monolithic decomposition were not changed because they require broader architecture work beyond a safe High-fix pass.
