/* Service worker — holds the VerisZone config (endpoint + tenant key + actor)
   so the tenant key never lives in the page, and calls /api/policy/inspect on
   the content script's behalf. Verdicts are cached by a hash of the text so
   repeated inspections of the same content are instant. */

const DEFAULTS = {
  endpoint: "https://demo.veriszone.ai/api/policy/inspect", // set in Options
  key: "",                                                  // x-veris-key (blank = dev/open mode)
  actor: "",                                                // user email, for the audit trail
  failClosed: false,                                        // block if the endpoint is unreachable
};

async function cfg() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...s };
}

// tiny in-memory verdict cache (sha -> {verdict, ts})
const cache = new Map();
const TTL = 60_000;
async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function inspect({ text, destination }) {
  const c = await cfg();
  const key = await sha((destination || "") + "|" + text);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.verdict;

  try {
    const res = await fetch(c.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...(c.key ? { "x-veris-key": c.key } : {}) },
      body: JSON.stringify({ text, context: destination, actor: c.actor, channel: "browser-ext" }),
    });
    if (!res.ok) throw new Error("inspect " + res.status);
    const verdict = await res.json();
    cache.set(key, { verdict, ts: Date.now() });
    return verdict;
  } catch (e) {
    // Fail-open by default (don't break the user); fail-closed blocks on error.
    return { decision: c.failClosed ? "block" : "allow", reason: "VerisZone unreachable", error: String(e) };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg && msg.type === "inspect") { inspect(msg).then(reply); return true; }
});
