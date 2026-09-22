/* ── GenVeris · Hallucination / Faithfulness engine ──────────────────────
   "Make sure the LLM is not hallucinating." Two tiers, both real:

   1. Deterministic faithfulness (always on, in-process, no extra model call):
      every factual claim in the answer is checked against the retrieved
      context — figures must appear in the context, salient tokens must overlap,
      answers that assert specifics with no evidence are flagged, and
      overconfident absolutes ("guaranteed", "zero risk") are penalised. Yields
      a 0-100 faithfulness score and a grounded / mixed / ungrounded verdict.

   2. LLM judge (model-grade second pass): a strict verifier model call
      re-checks the answer against the context and returns the unsupported
      claims. How often it runs is set by VZ_JUDGE_MODE (judgeMode/shouldJudge):
      "auto" (default) runs it only on the uncertain minority; "always" makes
      the model-grade pass the default on every grounded-checkable answer where
      cost allows; "off" leaves the deterministic floor alone. Either way the
      deterministic tier is the always-on floor.

   The deterministic tier is a pure module (client + server); the judge is an
   async helper the gateway calls best-effort. Neither ever throws into the
   response path. */

const STOP = new Set(["the","and","for","that","with","this","from","have","has","are","was","were","will","would","your","you","our","their","its","into","than","then","them","they","also","been","being","which","when","what","who","whom","how","why","where","about","over","under","after","before","between","per","via","not","but","all","any","can","could","should","may","might","must","one","two","three","only","more","most","some","such","each","both","other","within","across","upon","onto","off"]);

const FIG_RE = /\$?\d[\d,.]*%?/g;
const ABSOLUTE_RE = /\b(always|never|guaranteed|guarantee|100%\s+(safe|secure|accurate)|zero risk|no risk whatsoever|will definitely|without exception|completely eliminates?)\b/i;

function figures(s) { return (String(s).match(FIG_RE) || []).map(x => x.replace(/[,$%]/g, "")).filter(x => x.replace(/\./g, "").length > 0); }
function salientTokens(s) { return [...new Set((String(s).toLowerCase().match(/[a-z0-9]+/g) || []))].filter(w => w.length > 3 && !STOP.has(w)); }

export function extractClaims(answer) {
  return String(answer || "")
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && /[a-z]/i.test(s));
}

export const HALLUCINATION_META = {
  grounded:     { label: "Grounded",     tone: "good" },
  mixed:        { label: "Mixed",        tone: "warn" },
  ungrounded:   { label: "Ungrounded",   tone: "crit" },
  unverifiable: { label: "Unverifiable", tone: "warn" },
  "no-context": { label: "No context",   tone: "info" },
};

/* Deterministic faithfulness check. `context` is the retrieved grounding text. */
export function checkFaithfulness(answer, context) {
  const ctxLower = String(context || "").toLowerCase();
  // Exact figure set from the context — membership, not substring, so a
  // fabricated "9" is not treated as supported by "79" in the context.
  const ctxFigSet = new Set(figures(context));
  const hasContext = ctxLower.trim().length > 0;
  const claims = extractClaims(answer).map(c => {
    const figs = figures(c);
    const toks = salientTokens(c);
    const checkable = figs.length > 0 || toks.length >= 2;
    let supported = true, reason = null;
    if (hasContext && checkable) {
      const badFigs = figs.filter(f => !ctxFigSet.has(f));
      const tokOverlap = toks.length ? toks.filter(t => ctxLower.includes(t)).length / toks.length : 1;
      if (badFigs.length) { supported = false; reason = `figure(s) not in context: ${badFigs.join(", ")}`; }
      else if (toks.length >= 2 && tokOverlap < 0.34) { supported = false; reason = "claim not grounded in retrieved context"; }
    }
    return { text: c.slice(0, 180), figs, checkable, supported, reason };
  });
  const checkable = claims.filter(c => c.checkable);
  const supported = checkable.filter(c => c.supported).length;
  const ratio = checkable.length ? supported / checkable.length : 1;
  const absolute = ABSOLUTE_RE.test(String(answer || ""));
  const answeredWithoutEvidence = !hasContext && checkable.some(c => c.figs.length > 0);

  let verdict, score;
  if (!hasContext) { verdict = answeredWithoutEvidence ? "unverifiable" : "no-context"; score = answeredWithoutEvidence ? 45 : 70; }
  else { score = Math.round(ratio * 100); verdict = ratio >= 0.8 ? "grounded" : ratio >= 0.5 ? "mixed" : "ungrounded"; }
  if (absolute) score = Math.max(0, score - 15);

  const findings = [];
  claims.filter(c => !c.supported && c.reason).forEach(c => findings.push(c.reason));
  if (answeredWithoutEvidence) findings.push("asserts specific figures with no retrieved evidence");
  if (absolute) findings.push("overconfident absolute qualifier");
  return { verdict, score, ratio, hasContext, checkable: checkable.length, supported, claims, findings: [...new Set(findings)], judge: null };
}

/* When to escalate to the LLM judge (auto mode): context exists and the fast
   check isn't clearly grounded. */
export function needsJudge(faith) {
  return !!(faith && faith.hasContext && faith.verdict !== "grounded" && faith.checkable > 0);
}

/* Judge policy — how often the strict LLM verifier runs, over the always-on
   deterministic floor:
     auto   (default) — only on the uncertain minority (needsJudge).
     always           — on every answer that has checkable claims + context,
                        so the model-grade pass is the default where cost allows.
     off              — deterministic floor only (no model call).
   Configured by VZ_JUDGE_MODE. */
export function judgeMode() {
  const m = String(process.env.VZ_JUDGE_MODE || "auto").toLowerCase();
  return ["auto", "always", "off"].includes(m) ? m : "auto";
}

export function shouldJudge(faith, mode = judgeMode()) {
  if (!faith || !faith.hasContext || faith.checkable <= 0) return false;
  if (mode === "off") return false;
  if (mode === "always") return true;
  return needsJudge(faith); // auto
}

/* LLM judge — a strict second-pass verifier. Best-effort: returns null on any
   error so the caller can fall back to the deterministic verdict. `fetchImpl`
   is injectable for testing. */
export async function judgeFaithfulness({ answer, context, apiKey, model, fetchImpl }) {
  const doFetch = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
  if (!doFetch || !apiKey) return null;
  const system = "You are a strict grounding verifier. Given CONTEXT and an ANSWER, decide whether every factual claim in the ANSWER is supported by the CONTEXT alone. Do not use outside knowledge. Reply with ONLY minified JSON: {\"verdict\":\"grounded\"|\"mixed\"|\"ungrounded\",\"unsupported\":[\"<claim>\", ...]}. An unsupported list must be empty when verdict is grounded.";
  try {
    const res = await doFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: model || "claude-sonnet-5", max_tokens: 400, system, messages: [{ role: "user", content: `CONTEXT:\n${String(context || "").slice(0, 6000)}\n\nANSWER:\n${String(answer || "").slice(0, 3000)}` }] }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = Array.isArray(data.content) ? data.content.map(c => c.text || "").join("") : "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]);
    if (!parsed || !["grounded", "mixed", "ungrounded"].includes(parsed.verdict)) return null;
    return { verdict: parsed.verdict, unsupported: Array.isArray(parsed.unsupported) ? parsed.unsupported.slice(0, 8) : [] };
  } catch { return null; }
}

export const HALLUCINATION_CAUTION = "\n\n⚠ Faithfulness check: parts of this answer could not be verified against your retrieved evidence — treat unverified figures and claims with caution.";

/* ── Seeded window — the faithfulness record for the monitor surface ── */
export const HALLUCINATION_SEED = [
  { label: "Grounded, cited answer", answer: "Residual risk on the credit initiative is 41%, down from 54% after two controls landed.", context: "Credit initiative residual risk 41%, inherent 54%, two controls effective." },
  { label: "Fabricated figures", answer: "Adoption reached 92% and ROI hit 310% across every unit this quarter.", context: "Adoption is 64%. ROI is negative this quarter." },
  { label: "Overconfident absolute", answer: "This control guarantees zero risk and will definitely eliminate all incidents.", context: "The control reduces incident likelihood; residual risk remains." },
  { label: "Answered with no evidence", answer: "The fraud model's PSI is 0.42 and drift breached in July.", context: "" },
  { label: "Partially grounded", answer: "The close automation initiative is in Scaling at 79% adoption and saved $9M.", context: "Finance Close Automation is in Scaling, adoption 79%." },
];

export function seededHallucinationLedger() {
  return HALLUCINATION_SEED.map((r, i) => {
    const f = checkFaithfulness(r.answer, r.context);
    return { seq: i + 1, label: r.label, verdict: f.verdict, score: f.score, checkable: f.checkable, supported: f.supported, findings: f.findings, judged: needsJudge(f) };
  });
}

export function hallucinationStats(rows = seededHallucinationLedger()) {
  const by = v => rows.filter(r => r.verdict === v).length;
  return {
    total: rows.length,
    grounded: by("grounded"),
    flagged: rows.filter(r => ["mixed", "ungrounded", "unverifiable"].includes(r.verdict)).length,
    ungrounded: by("ungrounded"),
    avgScore: rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0,
    wouldJudge: rows.filter(r => r.judged).length,
  };
}
