/* ── Governed vocabularies ───────────────────────────────────────
   The enterprise's controlled lists behind every create/edit form. A
   field is a governed CHOICE, not free text — which keeps portfolio
   rollups honest ("Finance" is one unit, not three spellings).

   Each vocabulary has a `mode` and an `owner`:
     • open   — editable by roles in `editors`; everyone else may REQUEST
     • locked — canonical, editable by no one (regulatory / fixed)
   Adding is permission-aware: holders of taxonomy rights add directly
   (logged); everyone else's add becomes a request routed to the owner,
   pending approval. Session adds/requests live in-memory for the demo. */

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
};

/* Can this role add directly to a vocabulary? Locked vocabularies are
   editable by no one; open ones by their listed editors. */
export const canEditTaxonomy = (vocabKey, role) => {
  const v = TAXONOMY[vocabKey];
  if (!v || v.mode === "locked") return false;
  return (v.editors || []).includes(role);
};

/* ── Session-local store (demo): additions and pending requests ──
   Keeps a created/requested value usable for the session without a
   backend change. A real build persists these to the taxonomy service
   and routes requests into the owner's Approvals inbox. */
const SESSION_ADDS = {};
const SESSION_PENDING = {};

export const sessionValues = k => SESSION_ADDS[k] || [];
export const addSessionValue = (k, v) => { (SESSION_ADDS[k] = SESSION_ADDS[k] || []).push(v); };

export const pendingValues = k => SESSION_PENDING[k] || [];
export const addPendingValue = (k, v, owner) => {
  (SESSION_PENDING[k] = SESSION_PENDING[k] || []).push({ value: v, owner, at: "just now" });
};

/* All selectable options for a vocabulary = governed values + this
   session's approved-in-demo additions. */
export const optionsFor = k => {
  const base = (TAXONOMY[k] && TAXONOMY[k].values) || [];
  const extra = sessionValues(k).map(v => [v, "new"]);
  return base.concat(extra);
};
