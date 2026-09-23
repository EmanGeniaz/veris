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
import { resolveBusTenant } from "../lib/bus-tenant.ts";
import { telemetryMode, pickTelemetry } from "../lib/telemetry-source.ts";
import { authReadiness } from "../lib/auth-readiness.ts";
import { classify, evaluateRules, validateResponse, hasCredential } from "../lib/policy-rules.ts";
import retrievalGuard from "../lib/retrieval-guard.js";
import inputGuard from "../lib/input-guard.js";
import memory from "../lib/memory.js";
import runtimeGuard from "../lib/runtime-guard.js";
import concurrencyStore from "../lib/concurrency-store.js";
import outputGuard from "../lib/output-guard.js";
import hallucination from "../lib/hallucination.js";
const { sourceTrust, registerSource } = retrievalGuard;
const { scanAttachment, scanAttachmentAsync, EICAR_SIGNATURE } = inputGuard;
const { memoryWrite, memoryRecall, memorySweep } = memory;
const { admitCall, completeCall, RUNTIME_POLICY } = runtimeGuard;
const { createConcurrencyStore } = concurrencyStore;
const { moderateOutput, classifyToxicityAsync } = outputGuard;
const { checkFaithfulness, shouldJudge } = hallucination;

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

/* ── #136 memory retention/expiry — the durable guarantee is a query-time
   expiry filter, so recall must never return an expired item even before a
   sweep, and the sweep must drop it; both survive a "restart" (rebuilding the
   store array from the persisted items). ── */
{
  const t0 = Date.parse("2026-09-01T00:00:00Z");
  const w = memoryWrite({ tenant: "demo", agent: "a1", session: "s1", text: "Reconciliation for August close is 88% complete." }, t0);
  check("memory write is governed + stored", w.written && w.item?.expiresAt > t0);
  const store = [w.item];                          // the "persisted" rows
  const beforeExpiry = memoryRecall(store, { tenant: "demo", agent: "a1", session: "s1" }, t0 + 60_000);
  check("recall returns a live item", beforeExpiry.length === 1);
  const afterExpiry = t0 + (8 * 24 * 3600 * 1000);  // Internal = 7d retention → expired
  const recalledExpired = memoryRecall(store, { tenant: "demo", agent: "a1", session: "s1" }, afterExpiry);
  check("recall never returns an expired item (query-time filter)", recalledExpired.length === 0);
  const swept = memorySweep(store, afterExpiry);
  const restarted = [...swept];                     // simulate a restart from swept rows
  const afterRestart = memoryRecall(restarted, { tenant: "demo", agent: "a1", session: "s1" }, afterExpiry);
  check("expired item is gone after sweep + restart", swept.length === 0 && afterRestart.length === 0);
  const other = memoryRecall(store, { tenant: "demo", agent: "a2", session: "s1" }, t0 + 60_000);
  check("recall cannot cross a session partition", other.length === 0);
}

/* ── #137 concurrency — two "instances" sharing ONE store cannot exceed the
   global cap; with SEPARATE stores each gets its own cap (proving the store is
   what makes the cap global). ── */
{
  const now = Date.parse("2026-09-01T00:00:00Z");
  const shared = new Map();
  const instA = createConcurrencyStore(shared);
  const instB = createConcurrencyStore(shared);
  const max = RUNTIME_POLICY.maxConcurrent;
  const key = "tenant:agent:sess";
  let admitted = 0;
  for (let i = 0; i < max; i++) {
    // Alternate which "instance" issues the call; distinct actions avoid loop detection.
    const inst = i % 2 === 0 ? instA : instB;
    const r = admitCall(key, `act${i}`, now, RUNTIME_POLICY, inst);
    if (r.decision === "allow") admitted++;
  }
  check(`shared store admits up to the global cap (${max})`, admitted === max);
  const over = admitCall(key, "actN", now, RUNTIME_POLICY, instB);
  check("shared store throttles the call over the global cap", over.decision === "throttle");
  // Release one slot via instance A; instance B should then get exactly one in.
  completeCall(key, 100, RUNTIME_POLICY, instA);
  const afterRelease = admitCall(key, "actR", now, RUNTIME_POLICY, instB);
  check("a released slot frees exactly one call across instances", afterRelease.decision === "allow");
  // Separate stores → independent caps (the store, not the key, scopes the cap).
  const isoA = createConcurrencyStore();
  const isoB = createConcurrencyStore();
  for (let i = 0; i < max; i++) admitCall("k", `x${i}`, now, RUNTIME_POLICY, isoA);
  const isoOverA = admitCall("k", "xN", now, RUNTIME_POLICY, isoA);
  const isoB1 = admitCall("k", "y0", now, RUNTIME_POLICY, isoB);
  check("separate stores keep independent caps", isoOverA.decision === "throttle" && isoB1.decision === "allow");
}

/* ── #140 output moderation + hallucination — a labelled set asserting the
   deterministic floor's decisions (toxic/clean, grounded/ungrounded), plus the
   moderation seam's fail-open and the configurable judge mode. ── */
{
  // Labelled toxicity set: [text, expectBlock].
  const toxSet = [
    ["Residual risk on the credit initiative is 41%.", false],
    ["The adoption trend is up quarter over quarter.", false],
    ["If they do that again I will kill you and everyone there.", true],
    ["Here is how to end my life quietly.", true],
    ["That question is stupid and you are a moron.", false], // harassment = medium, flag not block
  ];
  let toxOk = true;
  for (const [text, expectBlock] of toxSet) { if (moderateOutput(text, "").blocked !== expectBlock) toxOk = false; }
  check("toxicity floor blocks high-severity, allows/flags the rest", toxOk);
  check("harassment flags (not blocks)", moderateOutput("you are a moron and a loser", "").decision === "flag");

  // Labelled grounding set: [answer, context, expectVerdictOneOf].
  const groundSet = [
    ["Residual risk on the credit initiative is 41%, down from 54%.", "Credit initiative residual risk 41%, inherent 54%.", ["grounded"]],
    ["Adoption reached 92% and ROI hit 310% this quarter.", "Adoption is 64%. ROI is negative this quarter.", ["ungrounded", "mixed"]],
    ["The fraud model's PSI is 0.42 and drift breached in July.", "", ["unverifiable"]],
  ];
  let groundOk = true;
  for (const [answer, context, expect] of groundSet) { if (!expect.includes(checkFaithfulness(answer, context).verdict)) groundOk = false; }
  check("faithfulness floor labels grounded / ungrounded / unverifiable", groundOk);

  // Moderation seam fails OPEN to the floor when the classifier errors.
  const seam = await classifyToxicityAsync("perfectly clean governance text", {
    moderationUrl: "http://av.invalid/moderate",
    fetch: async () => { throw new Error("unreachable"); },
  });
  check("moderation seam fails open to the lexicon floor", seam.severity === "none" && seam.classifier === "lexicon");

  // Judge mode: "always" judges any grounded-checkable answer; "off" never does.
  const faithMixed = checkFaithfulness("Adoption reached 92% and ROI hit 310%.", "Adoption is 64%. ROI is negative.");
  const faithGrounded = checkFaithfulness("Residual risk is 41%.", "Residual risk 41%.");
  check("judge mode=always judges even a grounded answer", shouldJudge(faithGrounded, "always") === true);
  check("judge mode=off never judges", shouldJudge(faithMixed, "off") === false);
  check("judge mode=auto judges only the uncertain", shouldJudge(faithMixed, "auto") === true && shouldJudge(faithGrounded, "auto") === false);
}

/* ── #143 bus tenant isolation — a signed-in user is bound to their own
   tenant; a request authenticated as tenant A can never resolve to tenant B,
   anonymous callers are confined to demo, and Host routing is reachable only in
   no-auth mode. ── */
{
  const A = resolveBusTenant({ authConfigured: true, sessionEmail: "a@ta.com", userTenantId: "tenant_A", host: "acme.genveris.com" });
  const B = resolveBusTenant({ authConfigured: true, sessionEmail: "b@tb.com", userTenantId: "tenant_B", host: "acme.genveris.com" });
  check("signed-in user resolves to their own tenant", A.source === "session" && A.tenantId === "tenant_A");
  check("tenant A cannot resolve to tenant B (isolation)", A.tenantId !== B.tenantId && B.tenantId === "tenant_B");
  check("Host header cannot override a signed-in user's tenant", A.source === "session"); // host 'acme' ignored
  const anon = resolveBusTenant({ authConfigured: true, sessionEmail: null, userTenantId: null, host: "acme.genveris.com" });
  check("anonymous + auth configured is confined to demo", anon.source === "demo" && anon.slug === "demo");
  const noAuthHost = resolveBusTenant({ authConfigured: false, sessionEmail: null, userTenantId: null, host: "acme.genveris.com" });
  check("Host routing works only in no-auth demo mode", noAuthHost.source === "host" && noAuthHost.slug === "acme");
  const infra = resolveBusTenant({ authConfigured: false, host: "console.genveris.com" });
  check("reserved infra host falls back to demo", infra.source === "demo");
}

/* ── #144 telemetry source — live only with a DB, seeded (clearly labelled)
   otherwise; an empty live ledger is still truthfully live, not seeded. ── */
{
  check("no DB → demo mode label", telemetryMode(false).mode === "demo" && telemetryMode(false).live === false);
  check("DB configured → live mode label", telemetryMode(true).mode === "live");
  const seeded = [{ x: 1 }, { x: 2 }];
  const demo = pickTelemetry({ dbConfigured: false, liveRows: [{ x: 9 }], seededRows: seeded });
  check("no DB uses seeded rows, labelled demo", demo.source === "seeded" && demo.rows === seeded && demo.mode === "demo");
  const live = pickTelemetry({ dbConfigured: true, liveRows: [{ x: 9 }], seededRows: seeded });
  check("DB uses live rows, labelled live", live.source === "live" && live.rows.length === 1 && live.mode === "live");
  const emptyLive = pickTelemetry({ dbConfigured: true, liveRows: [], seededRows: seeded });
  check("empty live ledger stays live (never shows seeded as real)", emptyLive.source === "live" && emptyLive.rows.length === 0);
}

/* ── #142 auth provisioning readiness — a secrets-safe check reports which
   prerequisites are set (booleans/names only, never values). ── */
{
  const demoEnv = { AUTH_SECRET: "auth-disabled-placeholder", DATABASE_URL: "postgres://user:password@localhost:5432/db", DIRECT_URL: "" };
  const rDemo = authReadiness(demoEnv);
  check("demo/placeholder env is not ready", rDemo.ready === false && rDemo.usingPlaceholderSecret === true);
  check("readiness lists missing prerequisites by name", rDemo.missing.includes("AUTH_SECRET") && rDemo.missing.includes("DATABASE_URL"));
  const provisioned = { AUTH_SECRET: "a-real-32-char-secret-value-xxxxx", DATABASE_URL: "postgresql://u:p@db.example:5432/app", DIRECT_URL: "postgresql://u:p@db.example:5432/app" };
  const rReady = authReadiness(provisioned);
  check("fully provisioned env is ready", rReady.ready === true && rReady.missing.length === 0 && rReady.usingPlaceholderSecret === false);
  const noDirect = authReadiness({ AUTH_SECRET: "real-secret-value-here-xxxxxxxxxx", DATABASE_URL: "postgresql://u:p@db.example:5432/app" });
  check("missing DIRECT_URL is recommended but not blocking", noDirect.ready === true && noDirect.recommendDirectUrl === true);
  // The readiness object must never carry a secret value.
  check("readiness never echoes a secret value", !JSON.stringify(rReady).includes("a-real-32-char-secret-value-xxxxx"));
}

/* ── BL-12 provider-credential DLP — detection, classification, redaction, and
   negative (no false-positive) coverage. The originally-reported formats plus
   additional realistic provider tokens; and ordinary hyphenated/underscored text
   that must NOT be treated as a secret. ── */
{
  // Positives: originally-discovered formats + realistic variants. Assembled
  // from fragments at runtime so no full token literal sits in source (these
  // are synthetic, but GitHub push-protection flags the real shapes — which is
  // itself evidence the patterns match genuine credential formats).
  const secrets = [
    ["sk-" + "ant-api03-9f8a7b6c5d4e3f2a1bXYZ", "anthropic"],
    ["sk-" + "proj-AbC123dEf456GhI789jkl",       "openai-proj"],
    ["sk" + "_live_" + "51H8xYzAbCdEf0123456789", "stripe"],
    ["AKIA" + "IOSFODNN7EXAMPLE",                "aws"],
    ["AIza" + "SyA1234567890B1234567890C1234567890", "google"],
    ["ghp_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", "github"],
    ["xoxb" + "-123456789012-abcdefghijklmno",   "slack"],
  ];
  let detected = 0, classified = 0, blocked = 0, redacted = 0;
  for (const [s] of secrets) {
    if (hasCredential(s)) detected++;
    const c = classify("here is a key " + s);
    if (c.dataClass === "Restricted" && c.categories.includes("Secrets")) classified++;
    if (evaluateRules("prompt with " + s).blocked) blocked++;
    const v = validateResponse("the answer leaked " + s);
    if (!v.ok && !v.redacted.includes(s)) redacted++;
  }
  check("BL-12 all provider tokens are detected", detected === secrets.length);
  check("BL-12 all provider tokens classify Restricted/Secrets", classified === secrets.length);
  check("BL-12 all provider tokens are blocked at evaluateRules", blocked === secrets.length);
  check("BL-12 all provider tokens are redacted from output", redacted === secrets.length);

  // Negatives: ordinary text must not be flagged (no regression, no over-redaction).
  const clean = [
    "task-oriented design workflow",
    "please ask-me about the roadmap",
    "sk-oriented-architecture-review",            // sk- prefix but no digit -> not a secret
    "https://example.com/some-long-hyphenated-path-segment-here",
    "commit 9f8a7b6c5d4e3f2a1b0c is ready for review",
    "The residual risk is 41% this quarter.",
    "AI-generated content pipeline v2",
    "token of appreciation for the whole team",
  ];
  let fp = 0;
  for (const s of clean) { if (hasCredential(s) || evaluateRules(s).blocked) fp++; }
  check("BL-12 no false positives on ordinary text", fp === 0);
  check("BL-12 clean text passes validateResponse untouched", (() => { const v = validateResponse("The residual risk is 41% this quarter."); return v.ok && !/REDACTED/.test(v.redacted); })());

  // Regression: existing DLP behaviour intact.
  check("BL-12 regression: card still blocked", evaluateRules("card 4111 1111 1111 1111").blocked === true);
  check("BL-12 regression: email still masked", evaluateRules("reach me at jane@example.com").didMask === true);
  check("BL-12 regression: api_key= form still blocked", evaluateRules("api_key=" + "sk-live-abcd1234").blocked === true);
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
