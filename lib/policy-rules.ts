/* ── Canonical runtime policy engine ──────────────────────────────────
   One source of truth for gateway enforcement (server AND client) and for
   the policy register / violation analytics. Runtime rules are DERIVED from
   POLICY_REGISTER, so the governed documents in the register are literally
   the rules the gateway enforces — closing the gap where the register, the
   gateway's regex, and the Prisma tables were three disconnected things.

   Pure module (regex only, no server/browser deps) so the exact same engine
   runs in the Node gateway route and in the client workbench inspection. */
import { POLICY_REGISTER } from "./platform-models";

export type DetectorKey =
  | "credential" | "card" | "email" | "pii" | "injection" | "sensitive" | "code" | "model";

export type RuntimeRule = {
  ruleId: string; name: string; clauseRef: string; action: string;
  policyKey: string; policyName: string; ownerRole: string;
  detector: DetectorKey; severity: number;
};

/* Detection library. Test patterns are NON-global (global + .test() is
   stateful and flip-flops); the *G variants are used only for masking. */
const P = {
  credential: /(password|api[\s_-]?key|secret|token)\s*[:=]|\bsk-[A-Za-z0-9]{8,}/i,
  card: /\b(?:\d[ -]?){13,16}\b/,
  cardG: /\b(?:\d[ -]?){13,16}\b/g,
  email: /[\w.+-]+@[\w-]+\.[\w.]+/,
  emailG: /[\w.+-]+@[\w-]+\.[\w.]+/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  ssnG: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/,
  injection: /\b(ignore (all |any )?(previous|prior|above)|disregard (the )?(system|above|previous)|reveal (your |the )?(system )?(prompt|instructions)|bypass (the )?(guard|filter|policy|rules)|jailbreak|do anything now|dan mode|you are now (a|an|dan|in))/i,
  sensitive: /\b(confidential|restricted|internal[\s-]only|trade secret|non[\s-]public|\bnda\b|proprietary)\b/i,
  code: /```|\b(select \* from|drop table|function\s+\w+\s*\(|private key|-----begin)\b/i,
};

const DETECT: Record<DetectorKey, (t: string) => boolean> = {
  credential: (t) => P.credential.test(t),
  card: (t) => P.card.test(t),
  email: (t) => P.email.test(t),
  pii: (t) => P.ssn.test(t) || P.phone.test(t),
  injection: (t) => P.injection.test(t),
  sensitive: (t) => P.sensitive.test(t),
  code: (t) => P.code.test(t),
  model: () => false, // allowlist / routing enforcement lives in model routing (roadmap)
};

export function severityOf(action: string): number {
  const a = action.toLowerCase();
  if (a.includes("block")) return 4;
  if (a.includes("justif") || a.includes("review")) return 3;
  if (a.includes("redact")) return 3;
  if (a.includes("mask")) return 2;
  if (a.includes("warn")) return 1;
  return 2;
}

/* Map a register rule to a runtime detector by its id / name / clause. */
export function detectorFor(id: string, name: string, clause: string): DetectorKey | null {
  const s = `${id} ${name} ${clause}`.toLowerCase();
  // "credential" must be specific — a bare "token"/"key" also matches LLM
  // token/spend guards, so require an explicit secret/credential phrase.
  if (/credential|secret|api[\s_-]?key|\bkeys?\b/.test(s)) return "credential";
  if (/card|pci|payment/.test(s)) return "card";
  if (/phi|health|confidential|sensitive|restricted|document/.test(s)) return "sensitive";
  if (/pii|personal|customer|redact/.test(s)) return "pii";
  if (/email/.test(s)) return "email";
  if (/filt|inject|jailbreak|acceptable prompt/.test(s)) return "injection";
  if (/code|exfil/.test(s)) return "code";
  if (/model|allowlist|routing|vendor/.test(s)) return "model";
  return null;
}

/* The enforceable runtime rule set — every register rule that maps to a
   detector. Rules with no runtime detector (procedural policies) are left to
   reviews/approvals and simply don't appear here. */
/* Built-in rules for detectors the register doesn't enumerate as a named
   clause (credentials were hardcoded in the gateway before). Pinned to the
   Data Handling Standard so violations link to a real, seeded policy. */
const BUILTIN_RULES: RuntimeRule[] = [
  { ruleId: "det-cred", name: "Credentials & Secrets", clauseRef: "§2.7 Secrets & keys", action: "Block",
    policyKey: "POL-DH-002", policyName: "Data Handling Standard", ownerRole: "CDPO", detector: "credential", severity: 4 },
];

export const RUNTIME_RULES: RuntimeRule[] = [...BUILTIN_RULES, ...POLICY_REGISTER.flatMap((p) =>
  (p.rules || [])
    .map((r): RuntimeRule | null => {
      const detector = detectorFor(r.id, r.name, r.clauseRef);
      if (!detector) return null;
      return {
        ruleId: r.id, name: r.name, clauseRef: r.clauseRef, action: r.action,
        policyKey: p.key, policyName: p.name, ownerRole: p.owner,
        detector, severity: severityOf(r.action),
      };
    })
    .filter((r): r is RuntimeRule => r !== null)
)];

export type Evaluation = {
  decision: "block" | "mask" | "flag" | "allow";
  blocked: boolean;
  masked: string;
  didMask: boolean;
  matches: RuntimeRule[];
  primary: RuntimeRule | null;
};

/* Evaluate a prompt against every active runtime rule. Any Block rule stops
   the prompt at the boundary; otherwise PII/card/SSN/email are masked in
   place. Returns the matched rules so a Violation can be recorded against the
   exact policy clause. */
export function evaluateRules(text: string): Evaluation {
  const matches = RUNTIME_RULES.filter((r) => DETECT[r.detector](text));
  const blocking = matches.find((m) => /block/i.test(m.action)) || null;
  let masked = text, didMask = false;
  if (!blocking) {
    if (P.card.test(masked)) { masked = masked.replace(P.cardG, "[MASKED-CARD]"); didMask = true; }
    if (P.ssn.test(masked)) { masked = masked.replace(P.ssnG, "[MASKED-SSN]"); didMask = true; }
    if (P.email.test(masked)) { masked = masked.replace(P.emailG, "[MASKED-EMAIL]"); didMask = true; }
  }
  const primary =
    blocking || matches.find((m) => /redact|mask/i.test(m.action)) || matches[0] || null;
  const decision: Evaluation["decision"] = blocking
    ? "block"
    : (didMask || matches.some((m) => /redact|mask/i.test(m.action)))
      ? "mask"
      : matches.length ? "flag" : "allow";
  return { decision, blocked: !!blocking, masked, didMask, matches, primary };
}

/* ── Data classification ────────────────────────────────────────────
   Classify prompt content into a data class + sensitive categories from
   the content itself — not a static label. This is the real detector
   behind the gateway's "Data Classification" stage. */
const PHI = /\b(patient|diagnosis|medical record|health record|\bphi\b|prescription|icd-?10)\b/i;
const PUBLIC = /\b(press release|public|marketing copy|blog draft)\b/i;

export type Classification = { dataClass: "Public" | "Internal" | "Confidential" | "Restricted"; categories: string[] };

export function classify(text: string): Classification {
  const cats: string[] = [];
  if (P.credential.test(text)) cats.push("Secrets");
  if (P.card.test(text)) cats.push("PCI");
  if (PHI.test(text)) cats.push("PHI");
  if (P.ssn.test(text) || P.phone.test(text) || P.email.test(text)) cats.push("PII");
  if (P.code.test(text)) cats.push("Source code");
  if (P.sensitive.test(text)) cats.push("Marked confidential");
  const has = (c: string) => cats.includes(c);
  let dataClass: Classification["dataClass"] = "Internal";
  if (has("Secrets") || has("PCI") || has("PHI")) dataClass = "Restricted";
  else if (has("PII") || has("Marked confidential") || has("Source code")) dataClass = "Confidential";
  else if (PUBLIC.test(text) && !cats.length) dataClass = "Public";
  return { dataClass, categories: [...new Set(cats)] };
}

/* ── Response validation ────────────────────────────────────────────
   Scan the MODEL'S OUTPUT before it reaches the user — catch secrets/PII
   that shouldn't leave the boundary and detect system-prompt reflection
   (a sign an injection got through). Real enforcement on egress, not just
   ingress. */
export type ResponseCheck = { ok: boolean; findings: string[]; redacted: string };

export function validateResponse(text: string): ResponseCheck {
  const findings: string[] = [];
  let redacted = String(text || "");
  if (P.credential.test(redacted)) { findings.push("Secret/credential in output"); redacted = redacted.replace(/sk-[A-Za-z0-9]{8,}/g, "[REDACTED-SECRET]"); }
  if (P.card.test(redacted)) { findings.push("Card number in output"); redacted = redacted.replace(P.cardG, "[REDACTED-CARD]"); }
  if (P.ssn.test(redacted)) { findings.push("Government ID in output"); redacted = redacted.replace(P.ssnG, "[REDACTED-SSN]"); }
  if (/never reveal these instructions|here (is|are) (my|the) (system )?(prompt|instructions)|you are veris intelligence, the enterprise ai advisor/i.test(text)) findings.push("System-prompt reflection");
  return { ok: findings.length === 0, findings, redacted };
}

/* Compatibility shape for the client workbench inspection (was a local
   hardcoded regex). Returns null when the prompt is clean. */
export function inspectPrompt(text: string) {
  const e = evaluateRules(text);
  if (!e.matches.length && !e.didMask) return null;
  return {
    action: e.blocked ? "Blocked" : (e.didMask || e.decision === "mask") ? "Masked" : "Flagged",
    detector: e.primary?.name || "Data policy",
    clauseRef: e.primary?.clauseRef || "",
    policyKey: e.primary?.policyKey || "POL-DH-002",
    ruleId: e.primary?.ruleId || "",
    severity: e.primary?.severity ?? 2,
    masked: e.masked,
  };
}
