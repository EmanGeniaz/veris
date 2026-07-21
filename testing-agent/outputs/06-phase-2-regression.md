# Phase 6: High Regression

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Lint | Passed | `cmd /c npm run lint` exited 0 | Pass |
| Build | Passed | `cmd /c npm run build` exited 0; `/` and `/_not-found` generated | Webpack cache warning non-blocking |
| Tests | Unknown | `cmd /c npm test` returned `Missing script: "test"` | No test script configured |
| Mojibake scan | Passed | `Select-String 'Ã|Â|â|�'` returned no matches | Source marker scan only |
| Production main route | Passed | Temp `next start -p 3002`; `curl -I /` returned `200 OK` | Fresh production server |
| Production invalid route | Passed | Temp `next start -p 3002`; `curl -I /does-not-exist` returned `404 Not Found` | Fresh production server |
| Existing dev server on 3000 | Failed/Stale | `curl http://localhost:3000/` returned 500: `Cannot find module './627.js'` | Stale dev runtime; restart needed |
| Browser navigation | Unknown | Browser runner failed with `CreateProcessAsUserW failed: 5` | Click behavior not claimed |
| Core dashboards/forms/tables | Unknown | Browser runner unavailable | Build/source pass only |
| AI Central/guardrails/audit logs | Unknown | Browser runner unavailable | Runtime behavior not claimed |
| Responsive sanity | Unknown | Browser runner unavailable | Needs viewport QA |

Decision: Go for build/lint/production-route regression. Stop before visual/runtime signoff until dev server is restarted and browser QA is available.
