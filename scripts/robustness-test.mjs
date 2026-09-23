/* GenVeris · Robustness tests (BL-06)
   Deterministic coverage for the "robust external calls / inputs" hardening:
   bounded outbound fetch (timeout + abort), honest request validation, and the
   two other external-call sites (LLM judge, AV scanner) degrading correctly on
   a hung upstream. No network, no DB — hung upstreams are simulated with a
   never-resolving fetch stub. Run: npx tsx scripts/robustness-test.mjs

   Import interop under tsx: .ts modules export normally; .js modules expose
   their exports via the default (namespace) binding. */
import { fetchWithTimeout, TimeoutError, DEFAULT_UPSTREAM_TIMEOUT_MS } from "../lib/http.ts";
import { validateChatRequest, MAX_PROMPT_CHARS, MAX_ATTACHMENTS } from "../lib/gateway-validate.ts";
import hallucination from "../lib/hallucination.js";
import inputGuard from "../lib/input-guard.js";

const { judgeFaithfulness } = hallucination;
const { scanAttachmentAsync } = inputGuard;

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const hangingFetch = () => new Promise(() => {}); // never resolves, ignores abort
const okFetch = (bodyObj) => async () => ({ ok: true, status: 200, json: async () => bodyObj });

/* ── fetchWithTimeout ── */
{
  // resolves when the upstream is fast
  const fast = async () => ({ ok: true, status: 200, json: async () => ({ hi: 1 }) });
  const res = await fetchWithTimeout("https://x.test", {}, 1000, fast);
  check("fetchWithTimeout resolves for a fast upstream", res && res.ok === true);

  // rejects with TimeoutError when the upstream hangs (even if it ignores abort)
  let timedOut = false, err = null;
  try { await fetchWithTimeout("https://x.test", {}, 40, hangingFetch); }
  catch (e) { err = e; timedOut = e instanceof TimeoutError; }
  check("fetchWithTimeout rejects a hung upstream", !!err);
  check("fetchWithTimeout throws TimeoutError on timeout", timedOut);

  // wires an AbortSignal into the underlying fetch
  let sawSignal = false;
  const spy = async (_url, init) => { sawSignal = !!(init && init.signal && typeof init.signal.aborted === "boolean"); return { ok: true, status: 200, json: async () => ({}) }; };
  await fetchWithTimeout("https://x.test", { method: "POST" }, 1000, spy);
  check("fetchWithTimeout passes an AbortSignal to fetch", sawSignal);

  check("DEFAULT_UPSTREAM_TIMEOUT_MS is a sane positive default", DEFAULT_UPSTREAM_TIMEOUT_MS > 0 && DEFAULT_UPSTREAM_TIMEOUT_MS <= 60_000);
}

/* ── validateChatRequest ── */
{
  const ok = validateChatRequest({ prompt: "hello", tenant: "acme", value: 3 });
  check("valid request accepted", ok.ok === true && ok.value.prompt === "hello" && ok.value.value === 3);
  check("tenant defaults to demo", validateChatRequest({ prompt: "x" }).value.tenant === "demo");

  const bad = (body) => { const r = validateChatRequest(body); return r.ok === false ? r.reason : "ACCEPTED"; };
  check("rejects non-object body", bad("nope") === "bad_request" && bad(null) === "bad_request" && bad([1]) === "bad_request");
  check("rejects non-string prompt", bad({ prompt: 42 }) === "invalid_prompt");
  check("rejects empty prompt", bad({ prompt: "   " }) === "empty_prompt");
  check("rejects oversized prompt", bad({ prompt: "a".repeat(MAX_PROMPT_CHARS + 1) }) === "prompt_too_large");
  check("rejects mistyped identifier field", bad({ prompt: "x", tenant: 5 }) === "invalid_tenant");
  check("rejects over-long identifier field", bad({ prompt: "x", agent: "a".repeat(9999) }) === "invalid_agent");
  check("rejects non-finite value", bad({ prompt: "x", value: "NaNsense" }) === "invalid_value");
  check("rejects non-array attachments", bad({ prompt: "x", attachments: {} }) === "invalid_attachments");
  check("rejects too many attachments", bad({ prompt: "x", attachments: new Array(MAX_ATTACHMENTS + 1).fill({}) }) === "too_many_attachments");
  // status codes are honest client errors
  check("oversized prompt is 413", validateChatRequest({ prompt: "a".repeat(MAX_PROMPT_CHARS + 1) }).status === 413);
  check("bad body is 400", validateChatRequest("x").status === 400);
}

/* ── judgeFaithfulness (external call, best-effort) ── */
{
  const nullOnTimeout = await judgeFaithfulness({ answer: "a", context: "c", apiKey: "k", fetchImpl: hangingFetch, timeoutMs: 40 });
  check("judgeFaithfulness returns null when the verifier hangs", nullOnTimeout === null);
  const nullNoKey = await judgeFaithfulness({ answer: "a", context: "c", apiKey: "", fetchImpl: okFetch({}) });
  check("judgeFaithfulness returns null without an API key", nullNoKey === null);
  const good = await judgeFaithfulness({ answer: "a", context: "c", apiKey: "k", fetchImpl: okFetch({ content: [{ text: '{"verdict":"grounded","unsupported":[]}' }] }) });
  check("judgeFaithfulness parses a valid verdict", good && good.verdict === "grounded");
}

/* ── scanAttachmentAsync (external AV scanner, timeout policy) ── */
{
  const clean = { name: "board.pdf", mime: "application/pdf", size: 1000, headerHex: "255044462d" };
  const failClosed = await scanAttachmentAsync(clean, { avScanUrl: "https://av.test", fetch: hangingFetch, failClosed: true, timeoutMs: 40 });
  check("AV scanner timeout blocks when fail-closed", failClosed.decision === "block" && failClosed.avScanned === false);
  const failOpen = await scanAttachmentAsync(clean, { avScanUrl: "https://av.test", fetch: hangingFetch, failClosed: false, timeoutMs: 40 });
  check("AV scanner timeout allows a clean file when fail-open", failOpen.decision === "allow" && failOpen.avScanned === false);
  const infected = await scanAttachmentAsync(clean, { avScanUrl: "https://av.test", fetch: okFetch({ status: "infected" }), timeoutMs: 1000 });
  check("AV scanner infected verdict blocks", infected.decision === "block" && infected.avScanned === true);
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
