/* ── Governed vocabularies ───────────────────────────────────────
   The enterprise's controlled lists behind every create/edit form. A
   field is a governed CHOICE, not free text — which keeps portfolio
   rollups honest ("Finance" is one unit, not three spellings).

   Each vocabulary has a `mode` and an `owner`:
     • open   — editable by roles in `editors`; everyone else may REQUEST
     • locked — canonical, editable by no one (regulatory / fixed)
   Adding is permission-aware: holders of taxonomy rights add directly
   (logged); everyone else's add becomes a request routed to the owner,
   pending approval. Adds and requests persist to the taxonomy service
   (localStorage now, the bus store when the DB is configured) and pending
   requests surface in the owning role's Approvals inbox. */

import { pushBus, readBus, writeBus } from "./bus";

export const TAXONOMY = {
  unit: {
    label: "Business unit", noun: "business unit", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "cio", "coo"],
    values: [
      ["Retail Banking", "112 people"], ["Customer Operations", "240 people"],
      ["Finance", "88 people"], ["People & HR", "64 people"],
      ["Procurement", "41 people"], ["Risk & Compliance", "57 people"],
    ],
  },
  person: {
    label: "Person", noun: "person", mode: "open", person: true,
    owner: "Directory admin", editors: ["caio", "cio", "chro"],
    values: [
      ["Aisha Patel", "CAIO"], ["Maya Chen", "CEO"], ["Marcus Reid", "CIO"],
      ["Jordan Sinclair", "CISO"], ["Niamh Lynch", "CDPO"], ["Elena Rossi", "CFO"],
      ["Deepa Nair", "CRO"], ["Riley Chen", "Eng. Manager"],
    ],
  },
  phase: {
    label: "Lifecycle phase", noun: "phase", mode: "locked",
    authority: "canonical 13-phase lifecycle",
    values: ["Opportunity", "Business Case", "Discovery", "Architecture", "Governance",
      "Development", "Testing", "Pilot", "Deployment", "Monitoring", "Optimization",
      "Scale", "Retire"].map(p => [p, ""]),
  },
  risk: {
    label: "EU AI Act risk class", noun: "risk class", mode: "locked", colored: true,
    authority: "defined by the EU AI Act",
    values: [["Minimal", "green"], ["Limited", "blue"], ["High", "amber"], ["Unacceptable", "red"]],
  },
  data: {
    label: "Data classification", noun: "data classification", mode: "open", colored: true,
    owner: "CISO · Data Protection", editors: ["ciso", "cdpo", "caio"],
    values: [["Public", "blue"], ["Internal", "teal"], ["Confidential", "amber"], ["Restricted", "red"]],
  },

  /* ── Vocabularies governing the Model / Policy / Risk / Evidence forms ── */
  category: {
    label: "AI system category", noun: "AI system category", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "cio"],
    values: [["GenAI Copilot", ""], ["Decision Support", ""], ["Process Automation", ""],
      ["Recommendation", ""], ["Agentic Workflow", ""], ["Internal Model", ""]],
  },
  modelType: {
    label: "Model type", noun: "model type", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "cio"],
    values: [["Generative AI / LLM", ""], ["Generative AI / NLP", ""], ["Predictive / Classification", ""],
      ["Predictive / Regression", ""], ["Classification / Ranking", ""], ["NLP / Classification", ""],
      ["Anomaly Detection", ""], ["Recommendation System", ""]],
  },
  vendor: {
    label: "Model vendor", noun: "model vendor", mode: "open",
    owner: "Procurement · AI Governance Office", editors: ["caio", "cio", "coo"],
    values: [["Internal", ""], ["Anthropic API", ""], ["OpenAI API", ""], ["HireRight AI", ""]],
  },
  dept: {
    label: "Department", noun: "department", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "cio", "coo"],
    values: [["Product", ""], ["Finance", ""], ["Human Resources", ""],
      ["Security", ""], ["Operations", ""], ["Marketing", ""]],
  },
  policyCategory: {
    label: "Policy category", noun: "policy category", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "cdpo"],
    values: [["Responsible AI", ""], ["Data Protection", ""], ["Security", ""],
      ["Model Risk", ""], ["Transparency", ""], ["Third-Party AI", ""]],
  },
  riskCategory: {
    label: "Risk category", noun: "risk category", mode: "open",
    owner: "Risk & Compliance", editors: ["cro", "ciso", "caio"],
    values: [["Model Security", ""], ["Data Privacy", ""], ["Bias & Fairness", ""],
      ["Consumer Harm", ""], ["Transparency", ""], ["Operational", ""], ["Regulatory", ""]],
  },
  framework: {
    label: "Control framework", noun: "control framework", mode: "open",
    owner: "AI Governance Office", editors: ["caio", "ciso", "cro"],
    values: [["ISO 42001", ""], ["ISO 27001", ""], ["EU AI Act", ""], ["NIST AI RMF", ""],
      ["GDPR", ""], ["OWASP LLM Top 10", ""], ["SOC 2", ""], ["COSO ERM", ""]],
  },
};

/* Can this role add directly to a vocabulary? Locked vocabularies are
   editable by no one; open ones by their listed editors. */
export const canEditTaxonomy = (vocabKey, role) => {
  const v = TAXONOMY[vocabKey];
  if (!v || v.mode === "locked") return false;
  return (v.editors || []).includes(role);
};

/* The roles that own a vocabulary — i.e. who sees its pending requests in
   their Approvals inbox. Same predicate as canEditTaxonomy, exposed for
   the inbox filter. */
export const editorsFor = vocabKey => (TAXONOMY[vocabKey] && TAXONOMY[vocabKey].editors) || [];
export const ownerLabelFor = vocabKey => (TAXONOMY[vocabKey] && TAXONOMY[vocabKey].owner) || "the owner";
export const nounFor = vocabKey => (TAXONOMY[vocabKey] && TAXONOMY[vocabKey].noun) || "value";

/* ── Persistence ─────────────────────────────────────────────────
   In-memory objects are the synchronous source of truth for render
   (SSR-safe: empty on the server, populated in-session on the client).
   Every mutation also writes through the persistence bus so adds and
   requests survive reload and reach the DB when configured. */
const ADDS_KEY = "vz-taxonomy-adds";
const PENDING_KEY = "vz-taxonomy-requests";
const SESSION_ADDS = {};      // vocab -> [value, ...]
const SESSION_PENDING = [];   // [{ id, vocab, value, noun, owner, requestedBy, status, at }, ...]

let uid = 0;
const newId = () => `tx-${Date.now().toString(36)}-${(uid++).toString(36)}`;

/* Merge persisted adds/requests into the in-memory store. Called once from
   the shell on entry (alongside hydrateBus) so an inbox opened after reload
   shows requests raised in an earlier session. Idempotent. */
export const hydrateTaxonomy = () => {
  if (typeof window === "undefined") return;
  try {
    const adds = readBus(ADDS_KEY, []);
    adds.forEach(a => {
      if (!a || !a.vocab) return;
      (SESSION_ADDS[a.vocab] = SESSION_ADDS[a.vocab] || []);
      if (!SESSION_ADDS[a.vocab].includes(a.value)) SESSION_ADDS[a.vocab].push(a.value);
    });
    const reqs = readBus(PENDING_KEY, []);
    reqs.forEach(r => { if (r && r.id && !SESSION_PENDING.some(p => p.id === r.id)) SESSION_PENDING.push(r); });
  } catch { /* corrupt local data ignored */ }
};

export const sessionValues = k => SESSION_ADDS[k] || [];

/* An editor adds a value directly — logged, immediately selectable, and
   promoted into the taxonomy store. */
export const addSessionValue = (k, v, by = "an editor") => {
  (SESSION_ADDS[k] = SESSION_ADDS[k] || []);
  if (!SESSION_ADDS[k].includes(v)) SESSION_ADDS[k].push(v);
  pushBus(ADDS_KEY, { vocab: k, value: v, noun: nounFor(k), addedBy: by, status: "Approved", at: "just now" });
};

/* A non-editor's add becomes a pending request routed to the vocabulary's
   owner. Returns the created request record. */
export const addPendingValue = (k, v, owner, by = "a contributor") => {
  const rec = { id: newId(), vocab: k, value: v, noun: nounFor(k), owner, requestedBy: by, status: "Pending", at: "just now" };
  SESSION_PENDING.push(rec);
  pushBus(PENDING_KEY, rec);
  return rec;
};

/* All pending requests (optionally the whole history) for the inbox. */
export const pendingValues = k => SESSION_PENDING.filter(r => r.vocab === k && r.status === "Pending");
export const allPending = () => SESSION_PENDING.filter(r => r.status === "Pending");

/* Requests the given role owns — i.e. is an editor of the vocabulary. */
export const pendingForRole = role => SESSION_PENDING.filter(r => r.status === "Pending" && editorsFor(r.vocab).includes(role));
export const pendingCountForRole = role => pendingForRole(role).length;

const persistPending = () => { try { writeBus(PENDING_KEY, SESSION_PENDING); } catch { /* storage unavailable */ } };

/* Approve a request: promote the value into the taxonomy and mark it. */
export const approveRequest = (id, by = "the owner") => {
  const r = SESSION_PENDING.find(x => x.id === id);
  if (!r || r.status !== "Pending") return null;
  r.status = "Approved"; r.decidedBy = by;
  (SESSION_ADDS[r.vocab] = SESSION_ADDS[r.vocab] || []);
  if (!SESSION_ADDS[r.vocab].includes(r.value)) SESSION_ADDS[r.vocab].push(r.value);
  pushBus(ADDS_KEY, { vocab: r.vocab, value: r.value, noun: r.noun, addedBy: `${by} (approved request)`, status: "Approved", at: "just now" });
  persistPending();
  return r;
};

export const rejectRequest = (id, by = "the owner") => {
  const r = SESSION_PENDING.find(x => x.id === id);
  if (!r || r.status !== "Pending") return null;
  r.status = "Declined"; r.decidedBy = by;
  persistPending();
  return r;
};

/* All selectable options for a vocabulary = governed values + approved
   additions (session + persisted). */
export const optionsFor = k => {
  const base = (TAXONOMY[k] && TAXONOMY[k].values) || [];
  const seen = new Set(base.map(o => o[0]));
  const extra = sessionValues(k).filter(v => !seen.has(v)).map(v => [v, "new"]);
  return base.concat(extra);
};
