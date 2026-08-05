/* ── Canonical portfolio spine ──────────────────────────────────────
   The single source of truth for "the enterprise AI portfolio". Before
   this, value / budget / ROI / framework-posture / risk counts were
   hardcoded separately in the CEO, CAIO and AI Central cockpits and never
   reconciled (realized value appeared as $4.1M / $4.6M / $7.3M; budget as
   $8.0M / $9.8M / $13.4M). Every surface now derives its headline numbers
   from HERE, so the board view, the CAIO view and AI Central always agree.

   PORTFOLIO is the one program list; PF holds the derived rollups. */

import { AC_FRAMEWORK_POSTURE } from "./platform-models";

/* Each row carries a canonical initiative id. Four programs are also
   fully-governed AI Central objects (ai-001..004) — same id, so the CEO
   portfolio row and the governed object are provably ONE record. The rest
   are portfolio-only summaries (pf-*) awaiting a governed record. */
export const PORTFOLIO = [
  {id:"ai-003", name:"Finance Close Automation", unit:"Finance", stage:"Scaling", health:88, region:"EMEA", approval:"CEO-approved", budget:0.9, spent:0.9, realized:1.6, roi:78, ttv:5.1, risk:"Low"},
  {id:"pf-doc", name:"Doc Summarisation AI", unit:"Customer Ops", stage:"Scaling", health:85, region:"APAC", approval:"Sponsor", budget:0.5, spent:0.5, realized:0.7, roi:40, ttv:4.2, risk:"Low"},
  {id:"pf-fraud", name:"Fraud Detection Model", unit:"Retail Banking", stage:"In Production", health:81, region:"EMEA", approval:"CEO-approved", budget:1.4, spent:1.4, realized:2.0, roi:43, ttv:6.4, risk:"Medium"},
  {id:"pf-pay", name:"Payments Anomaly Guard", unit:"Retail Banking", stage:"In Production", health:77, region:"Americas", approval:"Sponsor", budget:0.6, spent:0.5, realized:0.6, roi:20, ttv:7.0, risk:"Medium"},
  {id:"ai-001", name:"Customer Resolution Copilot", unit:"Customer Ops", stage:"In Production", health:74, region:"Americas", approval:"Under review", budget:1.8, spent:1.5, realized:0.3, roi:-12, ttv:9.8, risk:"High"},
  {id:"pf-maint", name:"Predictive Maintenance", unit:"Retail Banking", stage:"In Production", health:72, region:"APAC", approval:"Sponsor", budget:0.5, spent:0.4, realized:0.5, roi:25, ttv:6.8, risk:"Medium"},
  {id:"ai-002", name:"Credit Decision Assurance", unit:"Retail Banking", stage:"In Progress", health:62, region:"EMEA", approval:"Gate pending", budget:2.2, spent:1.9, realized:0.0, roi:0, ttv:null, risk:"Critical"},
  {id:"ai-004", name:"Workforce Skills Navigator", unit:"People", stage:"In Progress", health:52, region:"APAC", approval:"Sponsor", budget:0.4, spent:0.2, realized:0.0, roi:0, ttv:null, risk:"High"},
  {id:"pf-supp", name:"Supplier Risk Screener", unit:"Customer Ops", stage:"In Progress", health:48, region:"Americas", approval:"Sponsor", budget:0.3, spent:0.2, realized:0.0, roi:0, ttv:null, risk:"Medium"},
  {id:"pf-contract", name:"Contract Review Assist", unit:"Customer Ops", stage:"Completed", health:100, region:"Americas", approval:"CEO-approved", budget:0.5, spent:0.5, realized:0.9, roi:80, ttv:5.6, risk:"Low"},
  {id:"pf-hr", name:"HR Query Bot", unit:"People", stage:"Completed", health:100, region:"EMEA", approval:"Sponsor", budget:0.3, spent:0.3, realized:0.5, roi:67, ttv:4.9, risk:"Low"},
  {id:"pf-reco", name:"RecoEngine v2", unit:"Retail Banking", stage:"Retired", health:0, region:"—", approval:"Superseded", budget:0.4, spent:0.4, realized:0.2, roi:0, ttv:null, risk:"Low"},
];

const sum = (f) => PORTFOLIO.reduce((s, p) => s + f(p), 0);
const round = (n) => Math.round(n);
const active = PORTFOLIO.filter(p => p.stage !== "Retired");

const budget = sum(p => p.budget);
const spent = sum(p => p.spent);
const realized = sum(p => p.realized);
/* value consumed on programs that have booked no value yet — the honest
   "at-risk" figure a CFO reads, not a blanket budget−realized. */
const consumedNoValue = PORTFOLIO.filter(p => p.realized === 0).reduce((s, p) => s + p.spent, 0);
const withTtv = PORTFOLIO.filter(p => p.ttv);
const riskCount = g => PORTFOLIO.filter(p => p.risk === g).length;
/* headcount-weighted adoption, from the BU dimension the CEO view carries */
const BU = [ {head:1240,adoption:64}, {head:380,adoption:79}, {head:910,adoption:42}, {head:260,adoption:31} ];

export const PF = {
  count: PORTFOLIO.length,
  budget, spent, realized,
  consumedNoValue,
  unspent: +(budget - spent).toFixed(1),
  /* value realized per $ invested — the single canonical "return" figure,
     used verbatim across every cockpit (labelled "realized / invested"). */
  realizedRatio: round(realized / spent * 100),               // 84
  netRoiPct: round((realized - spent) / spent * 100),         // -16 (still pre-payback across the estate)
  valueToBudgetPct: round(realized / budget * 100),           // 74 (donut)
  avgHealth: round(active.reduce((s, p) => s + p.health, 0) / active.length),
  avgTtv: +(withTtv.reduce((s, p) => s + p.ttv, 0) / withTtv.length).toFixed(1),
  adoption: round(BU.reduce((s, b) => s + b.head * b.adoption, 0) / BU.reduce((s, b) => s + b.head, 0)),
  criticalCount: riskCount("Critical"),                        // 1
  highCount: riskCount("High"),                                // 3
  mediumCount: riskCount("Medium"),                            // 3
  scaleReady: PORTFOLIO.filter(p => (p.stage === "Scaling" || p.stage === "In Production") && p.roi >= 40).length,
  byStage: (s) => PORTFOLIO.filter(p => p.stage === s).length,
};

/* One canonical open-security-incident count (CISO incident register has 3;
   CEO said 2, Trust Center said 1 — now all read this). */
export const OPEN_INCIDENTS = 3;
/* One canonical open-audit-findings count (Dashboard said 6, Audit Center 5). */
export const OPEN_AUDIT_FINDINGS = 5;

/* One canonical framework-posture set. Extends the AI Central backbone
   (AC_FRAMEWORK_POSTURE) with the two frameworks the exec views add, so the
   CEO / CAIO / AI Central compliance numbers never disagree again. */
const acScore = id => (AC_FRAMEWORK_POSTURE.find(f => f.id === id) || {}).score;
export const FRAMEWORKS = [
  { id:"euai",     name:"EU AI Act",     score: acScore("euai"),     scope:"AI-specific", sub:"Regulatory conformity" },
  { id:"iso42001", name:"ISO 42001",     score: acScore("iso42001"), scope:"AI-specific", sub:"AI management system" },
  { id:"iso27001", name:"ISO 27001",     score: acScore("iso27001"), scope:"Security",    sub:"Information security · ISMS" },
  { id:"gdpr",     name:"GDPR / Privacy",score: acScore("gdpr"),      scope:"Privacy",     sub:"Data protection · DPIAs" },
  { id:"nist",     name:"NIST AI RMF",   score: acScore("nist"),      scope:"AI-specific", sub:"Govern·Map·Measure·Manage" },
  { id:"soc2",     name:"SOC 2 Type II", score: 86,                   scope:"Security",    sub:"Trust-services criteria" },
];
/* Blended compliance headline — the mean of the canonical posture set. */
export const COMPLIANCE_PCT = round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);
export const frameworkScore = id => (FRAMEWORKS.find(f => f.id === id) || {}).score;
