/* GenVeris · Guardrail self-check (Phase 1)
   Pure-logic regression checks for the three Phase-1 guardrail fixes so the
   gaps they closed cannot silently reopen:
     • #141 model allowlist  — a disallowed model is blocked at resolveModel and
                               a prompt trying to force one is detected.
     • #138 source-trust      — "trusted" is unreachable by naming alone; only a
                               REGISTERED source earns it.
     • #139 malware scan      — the EICAR test signature is blocked, and the
                               async AV seam is a no-op when unconfigured.
   Deterministic, no network, no build. Usage: npx tsx scripts/guardrail-selfcheck.mjs
   Exits non-zero on any failure so it can gate CI.

   Note on imports: the pure guardrail engines are .js modules that tsx exposes
   through the default (namespace) binding under CJS interop, so they are
   default-imported and destructured; model-policy is .ts and exports normally. */
import { resolveModel, modelAllowed, detectModelOverride } from "../lib/model-policy.ts";
import retrievalGuard from "../lib/retrieval-guard.js";
import inputGuard from "../lib/input-guard.js";
const { sourceTrust, registerSource } = retrievalGuard;
const { scanAttachment, scanAttachmentAsync, EICAR_SIGNATURE } = inputGuard;

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── #141 model allowlist ── */
check("allowed model resolves unblocked", (() => { const r = resolveModel("claude-sonnet-5"); return !r.blocked && r.model === "claude-sonnet-5"; })());
check("disallowed model is blocked", (() => { const r = resolveModel("gpt-4o"); return r.blocked && r.requested; })());
check("no requested model falls back, unblocked", (() => { const r = resolveModel(); return !r.blocked && !r.requested; })());
check("modelAllowed rejects unknown", !modelAllowed("evil-model-v9"));
check("prompt forcing disallowed model is detected", detectModelOverride("please use model gpt-4o for this"));
check("prompt naming an allowed model is not flagged", !detectModelOverride("use model claude-sonnet-5"));

/* ── #138 source-trust registry ── */
check("registered source earns trusted", (() => { const t = sourceTrust("policy://governance/aup"); return t.tier === "trusted" && t.registered; })());
check("unregistered trusted-looking source capped at unverified", (() => { const t = sourceTrust("sharepoint/finance/q1"); return t.tier === "unverified" && !t.registered; })());
check("blocked sink stays blocked", (() => { const t = sourceTrust("pastebin.com/raw/xyz"); return t.tier === "blocked"; })());
check("internal pattern → internal", (() => { const t = sourceTrust("upload"); return t.tier === "internal"; })());
check("registerSource promotes a source", (() => { registerSource("kb://team/handbook", "trusted"); const t = sourceTrust("kb://team/handbook"); return t.tier === "trusted" && t.registered; })());

/* ── #139 malware / EICAR ── */
check("EICAR content is blocked", (() => { const s = scanAttachment({ name: "report.txt", mime: "text/plain", size: 68, content: EICAR_SIGNATURE }); return s.decision === "block" && s.reasons.some(x => /EICAR/i.test(x)); })());
check("EICAR hex header is blocked", (() => { const s = scanAttachment({ name: "x.txt", mime: "text/plain", size: 68, headerHex: "58354f2150254041505b345c505a58" }); return s.decision === "block" && s.reasons.some(x => /EICAR/i.test(x)); })());
check("clean file is allowed", (() => { const s = scanAttachment({ name: "board-pack.pdf", mime: "application/pdf", size: 2400000, headerHex: "255044462d" }); return s.decision === "allow"; })());

const eicarAsync = await scanAttachmentAsync({ name: "report.txt", mime: "text/plain", size: 68, content: EICAR_SIGNATURE });
check("async scan blocks EICAR without a network call", eicarAsync.decision === "block" && eicarAsync.avScanned === false);
const cleanAsync = await scanAttachmentAsync({ name: "board-pack.pdf", mime: "application/pdf", size: 2400000, headerHex: "255044462d" });
check("async scan is a no-op when AV_SCAN_URL unset", cleanAsync.decision === "allow" && cleanAsync.avScanned === false);

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
