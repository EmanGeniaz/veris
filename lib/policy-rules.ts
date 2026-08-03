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
