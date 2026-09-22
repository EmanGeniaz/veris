/* ── Veris Enforce · Output Guardrails ───────────────────────────────────
   The last gate before a response reaches the user. policy-rules'
   validateResponse() already redacts secrets/PII and flags system-prompt
   reflection on egress; this engine adds the moderation half:

     • Toxicity checks     — a deterministic lexicon classifier scores the
                            output across violence / self-harm / hate /
                            harassment / sexual / profanity categories; a
                            high-severity category blocks the response.
     • Content moderation  — combines the toxicity verdict with the egress
                            findings into one allow / flag / block decision.
     • Hallucination check — a groundedness heuristic: figures in the answer
                            are checked against the retrieved context; an answer
                            full of unsupported numbers is flagged.

   The deterministic lexicon is the ALWAYS-ON FLOOR: it runs in the gateway and
   the client with no dependencies. A real model-grade moderation classifier is
   wired in as a seam (classifyToxicityAsync / moderateOutputAsync): when
   MODERATION_URL is configured the output is also scored by that classifier and
   the stricter of the two verdicts wins; the seam fails open to the floor so
   moderation never breaks a response. Wired into the gateway response path after
   validateResponse(). */

/* Toxicity lexicon by category. weight ≥ 4 is a hard-block category. Patterns
   are word-boundaried and intentionally conservative — representative, not
   exhaustive; a model classifier is the upgrade path. */
export const TOXICITY_CATEGORIES = {
  self_harm:  { weight: 5, label: "Self-harm", re: /\b(kill myself|killing myself|suicide|end my life|self[-\s]?harm|hurt myself)\b/i },
  violence:   { weight: 4, label: "Violence",  re: /\b(i('?ll| will) kill you|kill you|murder you|shoot (you|them)|stab (you|him|her)|make a bomb|behead)\b/i },
  hate:       { weight: 4, label: "Hate",      re: /\b(ethnic cleansing|inferior race|subhuman|exterminate (them|the)|racial slur)\b/i },
  sexual:     { weight: 3, label: "Sexual",    re: /\b(explicit sexual|pornographic|sexually explicit)\b/i },
  harassment: { weight: 2, label: "Harassment",re: /\b(idiot|moron|stupid|pathetic|loser|shut up)\b/i },
  profanity:  { weight: 1, label: "Profanity", re: /\b(damn|crap|hell)\b/i },
};

const SEVERITY_ORDER = { none: 0, low: 1, medium: 2, high: 3 };

export function classifyToxicity(text) {
  const t = String(text || "");
  const categories = [];
  let score = 0, maxWeight = 0;
  for (const [id, c] of Object.entries(TOXICITY_CATEGORIES)) {
    if (c.re.test(t)) { categories.push(id); score += c.weight; maxWeight = Math.max(maxWeight, c.weight); }
  }
  const severity = maxWeight >= 4 ? "high" : maxWeight >= 2 ? "medium" : maxWeight >= 1 ? "low" : "none";
  return { score, categories, severity, classifier: "lexicon" };
}

/* Model-grade moderation seam. Always runs the deterministic floor first, then,
   when a classifier is configured (MODERATION_URL), POSTs the text to it and
   merges the verdict — the STRICTER severity wins and categories union. Accepts
   the common moderation response shapes ({flagged|blocked}, {severity},
   {categories:[...]}, {score}). Fails OPEN to the floor: a classifier error or
   missing fetch never blocks or breaks a response. */
export async function classifyToxicityAsync(text, opts = {}) {
  const base = classifyToxicity(text);
  const url = opts.moderationUrl ?? process.env.MODERATION_URL ?? "";
  const fetchImpl = opts.fetch ?? globalThis.fetch;
  if (!url || typeof fetchImpl !== "function") return base;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: String(text || "") }),
    });
    const v = await res.json().catch(() => ({}));
    const extCats = Array.isArray(v?.categories)
      ? v.categories.map((c) => (typeof c === "string" ? c : c?.name || c?.category)).filter(Boolean)
      : [];
    const flagged = v?.flagged === true || v?.blocked === true;
    const extSeverity = v?.severity || (flagged ? "high" : extCats.length ? "medium" : "none");
    const severity = SEVERITY_ORDER[extSeverity] > SEVERITY_ORDER[base.severity] ? extSeverity : base.severity;
    return {
      score: base.score + (Number(v?.score) || 0),
      categories: [...new Set([...base.categories, ...extCats])],
      severity,
      classifier: "model+lexicon",
    };
  } catch {
    return base; // fail open to the deterministic floor
  }
}

/* Groundedness heuristic: extract figures (numbers / % / $) from the answer and
   check how many appear in the retrieved context. An answer full of figures the
   context can't support is a hallucination signal (advisory, not blocking). */
export function checkGrounding(answer, context) {
  const figs = [...String(answer || "").matchAll(/\$?\d[\d,.]*%?/g)].map(m => m[0].replace(/[,$%]/g, "")).filter(f => f.replace(/\./g, "").length > 0);
  if (!figs.length || !context) return { checked: false, supported: 0, total: 0, grounded: true, ratio: 1 };
  const ctx = String(context).replace(/[,$%]/g, "");
  const supported = figs.filter(f => ctx.includes(f)).length;
  const ratio = supported / figs.length;
  return { checked: true, supported, total: figs.length, grounded: ratio >= 0.5, ratio };
}

export const OUTPUT_DECISION_META = {
  allow: { label: "Allowed", tone: "good" },
  flag:  { label: "Flagged", tone: "warn" },
  block: { label: "Blocked", tone: "crit" },
};

/* The moderation verdict over a model output. `egressFindings` are the
   validateResponse() findings (secret/PII/reflection) so one decision covers
   the whole egress gate. A high-severity toxicity category — or a secret/PII
   leak — blocks; lesser issues flag. */
function moderationVerdict(tox, grounding, egressFindings) {
  const findings = [];
  if (tox.categories.length) findings.push(`toxicity: ${tox.categories.join(" / ")}`);
  if (grounding.checked && !grounding.grounded) findings.push(`unsupported figures (${grounding.supported}/${grounding.total} grounded)`);
  for (const f of (egressFindings || [])) findings.push(String(f));
  const hardEgress = (egressFindings || []).some(f => /secret|credential|card|government id|id in output/i.test(String(f)));
  const blocked = tox.severity === "high" || hardEgress;
  const decision = blocked ? "block" : findings.length ? "flag" : "allow";
  return { decision, blocked, toxicity: tox, grounding, findings };
}

export function moderateOutput(answer, context = "", egressFindings = []) {
  return moderationVerdict(classifyToxicity(answer), checkGrounding(answer, context), egressFindings);
}

/* Async moderation — the model-classifier path. Same decision logic, but the
   toxicity verdict comes from the classifier seam (floor + optional model). */
export async function moderateOutputAsync(answer, context = "", egressFindings = [], opts = {}) {
  return moderationVerdict(await classifyToxicityAsync(answer, opts), checkGrounding(answer, context), egressFindings);
}

export const SAFE_WITHHELD_MESSAGE = "The generated response was withheld by the output guard for a policy violation. No content was returned.";

/* ── Seeded window — the output-guard record for the Enforce surface ──
   Representative outputs showing every decision. The logic above is real and
   runs live after validateResponse(); this window stands in for a live stream. */
export const OUTPUT_SEED = [
  { label: "Grounded governance answer", text: "Residual risk on the credit initiative is 41%, down from 54% after two controls landed.", context: "Residual risk 41% credit initiative; inherent 54%." },
  { label: "Ungrounded figures", text: "Adoption is 92% and ROI reached 310% this quarter across all units.", context: "Adoption 64%. ROI is negative this quarter." },
  { label: "Harassment in output", text: "That question is stupid and you are a moron for asking.", context: "" },
  { label: "Violent content", text: "If they do that again I will kill you and everyone there.", context: "" },
  { label: "Self-harm content", text: "Here is how to end my life quietly.", context: "" },
  { label: "Secret leaked in output", text: "Sure, the key is sk-live-9f8a7b6c5d4e3f2a1b.", context: "", egress: ["Secret/credential in output"] },
];

export function seededOutputLedger() {
  return OUTPUT_SEED.map((r, i) => {
    const m = moderateOutput(r.text, r.context || "", r.egress || []);
    return { seq: i + 1, label: r.label, decision: m.decision, severity: m.toxicity.severity, categories: m.toxicity.categories, findings: m.findings };
  });
}

export function outputGuardStats(rows = seededOutputLedger()) {
  const by = d => rows.filter(r => r.decision === d).length;
  return {
    total: rows.length,
    allowed: by("allow"),
    flagged: by("flag"),
    blocked: by("block"),
    toxic: rows.filter(r => r.categories && r.categories.length).length,
    ungrounded: rows.filter(r => r.findings?.some(f => /unsupported figures/.test(f))).length,
  };
}
