import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   SUPABASE CLIENT
   Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from env.
   Returns null if either is missing so the app degrades to the
   seeded constants without crashing. When the env vars are set
   in Vercel, every page that fetches will switch to live DB data.
───────────────────────────────────────────── */
const _SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const _SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (_SUPABASE_URL && _SUPABASE_ANON_KEY)
  ? createClient(_SUPABASE_URL, _SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

/* Transform a DB risk row (snake_case) to the camelCase shape
   the Risk Register component already expects. Single boundary
   conversion — page code below is unchanged. */
function dbToRisk(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    owner: row.owner,
    asset: row.asset,
    threat: row.threat,
    vulnerability: row.vulnerability,
    inherentL: row.inherent_l,
    inherentI: row.inherent_i,
    treatmentOption: row.treatment_option,
    treatmentActions: row.treatment_actions,
    residualL: row.residual_l,
    residualI: row.residual_i,
    status: row.status,
    linkedControls: row.linked_controls || [],
    linkedUseCases: row.linked_use_cases || [],
    frameworks: row.frameworks || [],
    dateIdentified: row.date_identified,
    lastReviewed: row.last_reviewed,
    nextReview: row.next_review,
  };
}

/* DB row → Annex A control component shape. */
function dbToControl(row) {
  return {
    id: row.id,
    theme: row.theme,
    name: row.name,
    applicable: row.applicable,
    naJustification: row.na_justification,    /* used by SOA page */
    status: row.status,
    eff: row.eff,
    ev: row.ev_count,
    owner: row.owner,
    lastReviewed: row.last_reviewed,
  };
}

/* DB row → Template component shape. */
function dbToTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    framework: row.framework,
    frameworkRefs: row.framework_refs || [],
    description: row.description,
    icon: row.icon,
    status: row.status,
    owner: row.owner,
    version: row.version,
    lastReviewed: row.last_reviewed,
    reviewFrequency: row.review_frequency,
    nextReview: row.next_review,
    linkedClauses: row.linked_clauses || [],
    linkedControls: row.linked_controls || [],
    linkedRisks: row.linked_risks_count,
    linkedEvidence: row.linked_evidence_count,
    exports: row.exports || [],
    aiCustomization: row.ai_customization,
    tags: row.tags || [],
  };
}

/* DB row → Evidence component shape. */
function dbToEvidence(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    source: row.source,
    method: row.method,
    format: row.format,
    size: row.size_label,
    uploadedBy: row.uploaded_by,
    collected: row.collected_date,
    expires: row.expires_date,
    linkedControls: row.linked_controls || [],
    linkedRisks: row.linked_risks || [],
    frameworks: row.frameworks || [],
    status: row.status,
    owner: row.owner,
  };
}

/* DB row → Use Case component shape. Decisions merged in from
   the child table fetch by the page. */
function dbToUseCase(row, allDecisions = []) {
  return {
    id: row.id,
    name: row.name,
    dept: row.dept,
    system: row.system,
    dataClass: row.data_class,
    decisionImpact: row.decision_impact,
    affectedUsers: row.affected_users,
    tier: row.tier,
    iso42001Controls: row.iso42001_controls || [],
    submittedAt: row.submitted_at,
    submittedBy: row.submitted_by,
    pipelineStage: row.pipeline_stage,
    description: row.description,
    decisions: allDecisions
      .filter(d => d.use_case_id === row.id)
      .sort((a,b) => (a.signed_at||"").localeCompare(b.signed_at||""))
      .map(d => ({
        role: d.role,
        decision: d.decision,
        reasoning: d.reasoning,
        signer: d.signer,
        timestamp: d.signed_at,
      })),
  };
}

/* DB row → Audit component shape. */
function dbToAudit(row) {
  return {
    id: row.id,
    name: row.name,
    scope: row.scope,
    scopeThemes: row.scope_themes || [],
    scopeControls: row.scope_controls || [],
    leadAuditor: row.lead_auditor,
    auditors: row.auditors || [],
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    methodology: row.methodology,
    summary: row.summary,
    frameworks: row.frameworks || [],
  };
}

/* DB row → Audit Finding component shape. */
function dbToFinding(row) {
  return {
    id: row.id,
    auditId: row.audit_id,
    controlId: row.control_id,
    severity: row.severity,
    title: row.title,
    finding: row.finding,
    recommendation: row.recommendation,
    status: row.status,
    loggedBy: row.logged_by,
    loggedAt: row.logged_at,
    targetClose: row.target_close,
    linkedRiskId: row.linked_risk_id,
    capaId: row.capa_id,
  };
}

/* DB row → CAPA (corrective action) shape. */
function dbToCAPA(row) {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    sourceId: row.source_id,
    owner: row.owner,
    raisedBy: row.raised_by,
    raisedAt: row.raised_at,
    targetDate: row.target_date,
    closedAt: row.closed_at,
    status: row.status,
    priority: row.priority,
    rootCause: row.root_cause,
    actionSteps: row.action_steps || [],
    verificationMethod: row.verification_method,
    verificationDate: row.verification_date,
    verifier: row.verifier,
    verificationNotes: row.verification_notes,
    linkedControls: row.linked_controls || [],
    linkedRisks: row.linked_risks || [],
  };
}

/* Reusable hook — fetch a table on mount, fall back to a constant
   if Supabase is unavailable / empty / errors. Returns [data, status, setData]
   where status ∈ 'live' | 'loading' | 'fallback-empty' | 'fallback-error' | 'constant'.
   setData is exposed so consumers can do optimistic updates after writes. */
function useSupabaseTable(tableName, transformer, fallback, orderBy = "id") {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState(supabase ? "loading" : "constant");
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await supabase
        .from(tableName)
        .select("*")
        .order(orderBy, { ascending: true });
      if (cancelled) return;
      if (error || !rows || rows.length === 0) {
        setStatus(error ? "fallback-error" : "fallback-empty");
        return;
      }
      setData(rows.map(transformer));
      setStatus("live");
    })();
    return () => { cancelled = true; };
  }, [tableName]);
  return [data, status, setData];
}

/* Renders a small LIVE / SEEDED / LOADING pill — pass dataSource. */
function DataSourcePill({ dataSource, mono="'JetBrains Mono',ui-monospace,monospace" }) {
  if(dataSource==="live")    return <span style={{marginLeft:8,background:"rgba(91,122,94,0.20)",color:"#7DAA80",borderRadius:100,padding:"2px 8px",fontSize:9,fontWeight:700,letterSpacing:"0.10em",fontFamily:mono,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#7DAA80",boxShadow:"0 0 0 2px rgba(125,170,128,0.25)"}}/>LIVE</span>;
  if(dataSource==="loading") return <span style={{marginLeft:8,color:"rgba(245,242,234,0.40)",fontSize:9,fontFamily:mono,letterSpacing:"0.10em"}}>LOADING…</span>;
  return <span style={{marginLeft:8,background:"rgba(184,149,106,0.18)",color:"#D9B98C",borderRadius:100,padding:"2px 8px",fontSize:9,fontWeight:700,letterSpacing:"0.10em",fontFamily:mono,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#D9B98C"}}/>SEEDED</span>;
}

/* ─────────────────────────────────────────────
   DESIGN SYSTEM — Bloomberg × Palantir × OpenAI
   "Institutional AI Governance Operating System"
───────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400;1,6..72,500&display=swap');
`;

/* Token system — quiet luxury. Warm cream paper, deep graphite,
   champagne accent. Restraint over decoration. Private-bank palette. */
const T = {
  /* Surfaces — warm cream paper with subtle elevation */
  bg:      "#FAFAF6",   /* warm cream paper */
  s1:      "#F4F2EC",   /* whisper-tint elevation */
  s2:      "#EDE9E0",   /* card surface */
  s3:      "#E5E1D6",   /* elevated card */
  s4:      "#D6D2C5",   /* input/table row */
  s5:      "#B8B3A8",   /* hover state */
  /* Borders — warm graphite hairlines */
  border:  "#E5E1D6",
  borderB: "#D6D2C5",
  borderC: "#A8A398",
  /* Typography — warm graphite hierarchy */
  ink:     "#1A1916",   /* deep warm graphite (primary) */
  ink2:    "#5F5C56",   /* warm slate (secondary) */
  ink3:    "#9A9690",   /* lighter warm slate (tertiary) */
  ink4:    "#C5C2BA",
  ink5:    "#EDE9E0",
  /* Role accents — graphite family with subtle warmth */
  ciso:  "#1C1B1F", cisoL: "#EDE9E0",   /* deep warm graphite */
  caio:  "#2A2826", cdpoL: "#EDE9E0",   /* lighter graphite */
  cio:   "#5F5C56", cioL:  "#EDE9E0",   /* warm slate */
  cdpo:  "#4A4944", caioL: "#EDE9E0",   /* slate dark */
  cgo:   "#1C1B1F", cgoL:  "#EDE9E0",   /* graphite */
  /* Semantic — muted, sophisticated */
  red:    "#9B3636", redL:   "#F4E8E5",   /* muted oxblood */
  amber:  "#B8956A", amberL: "#F4ECDC",   /* warm tan */
  green:  "#5B7A5E", greenL: "#E8EEE5",   /* muted sage */
  blue:   "#1C1B1F", blueL:  "#EDE9E0",   /* graphite (no bright blue in this palette) */
  violet: "#5F5C56", violetL:"#EDE9E0",   /* slate (no violet) */
  teal:   "#5B7A5E", tealL:  "#E8EEE5",   /* sage */
  gold:   "#C9A961", goldL:  "#F4ECDC",   /* CHAMPAGNE GOLD */
  royal:  "#1C1B1F", royalL: "#EDE9E0",
};

const RC  = r => T[r]      || T.blue;
const RCL = r => T[r+"L"]  || T.blueL;

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────── */
const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:15px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
body{background:#FAFAF6;background-attachment:fixed;color:${T.ink};font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:0em;min-height:100vh;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:8px;}
::-webkit-scrollbar-thumb:hover{background:${T.borderB};}
button,select,input,textarea{font-family:'Plus Jakarta Sans',sans-serif;}
input:focus,textarea:focus,select:focus{outline:none;}
input::placeholder,textarea::placeholder{color:${T.ink4};}
select option{background:${T.s3};color:${T.ink};}
@keyframes up   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade {from{opacity:0}to{opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin {to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
`;


/* ─────────────────────────────────────────────
   ROLES
───────────────────────────────────────────── */
const ROLES = {
  ciso:{id:"ciso",label:"CISO",title:"Chief Information Security Officer",name:"Jordan Sinclair",initials:"JS",frameworks:["ISO 27001","NIST CSF","SOC 2","GDPR"]},
  caio:{id:"caio",label:"CAIO",title:"Chief AI Officer",name:"Aisha Patel",initials:"AP",frameworks:["ISO 42001","EU AI Act","NIST AI RMF","GDPR Art.22"]},
  cio: {id:"cio", label:"CIO", title:"Chief Information Officer",name:"Marcus Reid",initials:"MR",frameworks:["ISO 27001","NIST CSF","GDPR","SOC 2"]},
  cdpo:{id:"cdpo",label:"CDPO",title:"Chief Data Privacy Officer",name:"Niamh Lynch",initials:"NL",frameworks:["GDPR","ISO 27701","CCPA/CPRA","ePrivacy"]},
  cgo: {id:"cgo", label:"CGO", title:"Chief Compliance & Governance Officer",name:"Rafael Torres",initials:"RT",frameworks:["COBIT 5","ISO 31000","COSO ERM","GRC Integrated"]},
};

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
/* Categorised navigation — like Vanta / Drata. Each group has a header
   and a list of items. CAIO-only group is rendered conditionally. */
const NAV_GROUPS = [
  {id:"overview", label:"Overview", items:[
    {id:"home", icon:"⊞", label:"Dashboard"},
  ]},
  {id:"work", label:"My Work", items:[
    {id:"onboard",  icon:"◎", label:"Start Here"},
    {id:"playbook", icon:"☰", label:"Playbook"},
    {id:"hitl",     icon:"⚡", label:"HITL Queue"},
    {id:"strategy", icon:"◈", label:"Strategy"},
  ]},
  {id:"frameworks", label:"Frameworks", items:[
    {id:"iso27",     icon:"🛡", label:"ISO 27001 Workspace"},
    {id:"annexa",    icon:"☑", label:"Annex A Tracker"},
    {id:"risks",     icon:"⬟", label:"Risk Register"},
    {id:"soa",       icon:"📋", label:"Statement of Applicability"},
    {id:"gap",       icon:"📐", label:"Gap Analysis"},
    {id:"audit",     icon:"⌖", label:"Internal Audit"},
    {id:"capa",      icon:"⊛", label:"Corrective Actions"},
    {id:"compliance",icon:"◉", label:"Compliance"},
    {id:"checklists",icon:"☑", label:"ISO Checklists"},
    {id:"aia",       icon:"◭", label:"AI Impact (AIA)"},
    {id:"aiia",      icon:"◬", label:"Impact Assessment"},
  ]},
  {id:"ai", label:"AI Governance", caioOnly:true, items:[
    {id:"registry", icon:"⊟", label:"Model Registry"},
    {id:"usecases", icon:"◈", label:"Use Case Pipeline"},
    {id:"aira",     icon:"⬟", label:"Risk Register (AIRA)"},
    {id:"airt",     icon:"◆", label:"Risk Treatment (AIRT)"},
    {id:"maturity", icon:"◎", label:"Governance Maturity"},
  ]},
  {id:"programme", label:"Programme", items:[
    {id:"roadmap", icon:"⬢", label:"Roadmap"},
    {id:"impl",    icon:"⊕", label:"ISO 42001 Implementation"},
  ]},
  {id:"library", label:"Policies & Evidence", items:[
    {id:"templates", icon:"📋", label:"Template Library"},
    {id:"evidence",  icon:"📁", label:"Evidence Library"},
  ]},
  {id:"outputs", label:"Outputs", items:[
    {id:"reports",   icon:"▣", label:"Reports"},
  ]},
];

/* Flat NAV kept for backward compatibility with audit script and router.
   Derived from NAV_GROUPS so adding items in one place updates both. */
const NAV = NAV_GROUPS.flatMap(g => g.items);

/* ─────────────────────────────────────────────
   ISO 42001 CLAUSE CHECKLIST DATA
   (From BCAA UK training material)
───────────────────────────────────────────── */
const ISO42001_CHECKLIST = [
  {clause:"4.1", title:"Context of the Organisation", items:[
    {id:"4_1_1", text:"Internal context documented: governance structures, AI objectives, capabilities, culture", done:false},
    {id:"4_1_2", text:"External context documented: legal, regulatory, market, ethical, societal factors", done:false},
    {id:"4_1_3", text:"Climate change and sustainability relevance assessed for AI strategy", done:false},
    {id:"4_1_4", text:"SWOT/PESTLE analysis conducted and documented", done:false},
    {id:"4_1_5", text:"Organisation's role defined: AI provider, producer, deployer, or partner", done:false},
  ]},
  {clause:"4.2", title:"Interested Parties", items:[
    {id:"4_2_1", text:"All internal interested parties identified (management, staff, IT, legal, compliance)", done:false},
    {id:"4_2_2", text:"All external interested parties identified (customers, regulators, suppliers, public)", done:false},
    {id:"4_2_3", text:"Needs and expectations of each party documented and analysed", done:false},
    {id:"4_2_4", text:"Stakeholder needs integrated into AIMS planning and objectives", done:false},
  ]},
  {clause:"4.3", title:"Scope of the AIMS", items:[
    {id:"4_3_1", text:"AI systems, processes and services within scope clearly defined", done:false},
    {id:"4_3_2", text:"Organisational units and locations included in scope documented", done:false},
    {id:"4_3_3", text:"AI-related risks, obligations, and objectives within scope clarified", done:false},
    {id:"4_3_4", text:"Interfaces and dependencies with other systems and processes identified", done:false},
    {id:"4_3_5", text:"Scope documented, approved and communicated to stakeholders", done:false},
  ]},
  {clause:"4.4", title:"AI Management System (AIMS)", items:[
    {id:"4_4_1", text:"AIMS established and implemented with documented processes and controls", done:false},
    {id:"4_4_2", text:"AIMS actively operated across all relevant functions and AI lifecycle stages", done:false},
    {id:"4_4_3", text:"Continuous monitoring of AIMS effectiveness and compliance in place", done:false},
    {id:"4_4_4", text:"Continual improvement mechanisms established", done:false},
  ]},
  {clause:"5.1", title:"Leadership & Commitment", items:[
    {id:"5_1_1", text:"Top management actively engaged in AI governance and strategy alignment", done:false},
    {id:"5_1_2", text:"AI policy established, communicated and supported by leadership", done:false},
    {id:"5_1_3", text:"Resources allocated: financial, technological, and human", done:false},
    {id:"5_1_4", text:"Culture of trust, ethical AI practices, and continual learning fostered", done:false},
    {id:"5_1_5", text:"Clear roles, responsibilities, and authorities for AI oversight defined", done:false},
  ]},
  {clause:"5.2", title:"AI Policy", items:[
    {id:"5_2_1", text:"AI policy documented with purpose, scope, guiding principles, and prohibited uses", done:false},
    {id:"5_2_2", text:"Policy addresses ethics, fairness, transparency, accountability, and non-discrimination", done:false},
    {id:"5_2_3", text:"Policy aligned with other organisational policies (security, privacy, quality)", done:false},
    {id:"5_2_4", text:"Policy reviewed at least annually or upon significant changes", done:false},
    {id:"5_2_5", text:"High-risk AI safeguards documented and included in policy", done:false},
  ]},
  {clause:"5.3", title:"Roles, Responsibilities & Authorities", items:[
    {id:"5_3_1", text:"CAIO or equivalent AI governance lead appointed", done:false},
    {id:"5_3_2", text:"AI Risk Manager role defined and assigned", done:false},
    {id:"5_3_3", text:"AI Ethics Officer role defined and assigned", done:false},
    {id:"5_3_4", text:"AI Compliance Officer role defined and assigned", done:false},
    {id:"5_3_5", text:"Cross-functional governance team established (engineering, legal, risk, HR)", done:false},
    {id:"5_3_6", text:"RACI matrix for AI governance activities documented", done:false},
  ]},
  {clause:"6.1", title:"Risk & Opportunity Planning", items:[
    {id:"6_1_1", text:"AI risk assessment process defined with acceptance criteria", done:false},
    {id:"6_1_2", text:"Risks identified across technical, ethical, legal, and operational dimensions", done:false},
    {id:"6_1_3", text:"Risk scoring methodology (likelihood × impact) documented", done:false},
    {id:"6_1_4", text:"Risk treatment options selected (avoid, reduce, transfer, accept)", done:false},
    {id:"6_1_5", text:"Opportunities for responsible AI identified and planned for", done:false},
  ]},
  {clause:"6.2", title:"AI Objectives & Planning", items:[
    {id:"6_2_1", text:"AI objectives defined, measurable, and aligned with AI policy", done:false},
    {id:"6_2_2", text:"Plans for achieving objectives documented with owners, timelines, resources", done:false},
    {id:"6_2_3", text:"Objectives communicated to relevant functions", done:false},
  ]},
  {clause:"7.1", title:"Resources", items:[
    {id:"7_1_1", text:"Human resources with AI expertise identified and allocated", done:false},
    {id:"7_1_2", text:"Data resources documented: provenance, categories, quality, retention", done:false},
    {id:"7_1_3", text:"Tooling resources for development, testing, validation, monitoring available", done:false},
    {id:"7_1_4", text:"Computing infrastructure documented (cloud, on-premise, edge)", done:false},
  ]},
  {clause:"7.2", title:"Competence", items:[
    {id:"7_2_1", text:"Competence requirements for AI roles defined", done:false},
    {id:"7_2_2", text:"Training programmes established for AI governance and ethics", done:false},
    {id:"7_2_3", text:"Evidence of competence maintained (certifications, training records)", done:false},
  ]},
  {clause:"7.3", title:"Awareness", items:[
    {id:"7_3_1", text:"AI policy and objectives communicated to all relevant staff", done:false},
    {id:"7_3_2", text:"Staff aware of their contribution to AIMS effectiveness", done:false},
    {id:"7_3_3", text:"Awareness programme covers ethical AI and responsible use", done:false},
  ]},
  {clause:"8.1", title:"Operational Planning & Control", items:[
    {id:"8_1_1", text:"Processes needed to meet AI requirements established and controlled", done:false},
    {id:"8_1_2", text:"Criteria for AI processes defined and performance monitored", done:false},
    {id:"8_1_3", text:"Outsourced AI processes identified and controlled", done:false},
    {id:"8_1_4", text:"Change management process for AI systems established", done:false},
  ]},
  {clause:"8.2", title:"AI Risk Assessment", items:[
    {id:"8_2_1", text:"AI risk assessments performed at planned intervals", done:false},
    {id:"8_2_2", text:"Results of risk assessments documented and retained", done:false},
    {id:"8_2_3", text:"Risk assessments triggered by significant changes to AI systems", done:false},
  ]},
  {clause:"8.3", title:"AI Risk Treatment", items:[
    {id:"8_3_1", text:"Risk treatment plan documented with controls selected from Annex A", done:false},
    {id:"8_3_2", text:"Statement of Applicability (SoA) prepared for Annex A controls", done:false},
    {id:"8_3_3", text:"Residual risk assessed and accepted by risk owner", done:false},
  ]},
  {clause:"8.4", title:"AI System Design & Development", items:[
    {id:"8_4_1", text:"AI system objectives and requirements clearly defined", done:false},
    {id:"8_4_2", text:"Data requirements and quality criteria specified", done:false},
    {id:"8_4_3", text:"Human oversight mechanisms designed into system architecture", done:false},
    {id:"8_4_4", text:"Fairness and bias mitigation measures applied during design", done:false},
    {id:"8_4_5", text:"Explainability and transparency requirements addressed", done:false},
  ]},
  {clause:"8.5", title:"AI System Deployment & Operation", items:[
    {id:"8_5_1", text:"Deployment plan validated against all compliance requirements", done:false},
    {id:"8_5_2", text:"User-facing transparency notices in place before go-live", done:false},
    {id:"8_5_3", text:"Incident reporting channels for AI concerns established", done:false},
    {id:"8_5_4", text:"Kill-switch / emergency stop mechanism implemented", done:false},
  ]},
  {clause:"9.1", title:"Monitoring, Measurement & Evaluation", items:[
    {id:"9_1_1", text:"AI system performance monitored against defined metrics", done:false},
    {id:"9_1_2", text:"Bias monitoring and fairness testing scheduled", done:false},
    {id:"9_1_3", text:"Compliance with AI policy and objectives evaluated", done:false},
    {id:"9_1_4", text:"Results of evaluation documented and reported to leadership", done:false},
  ]},
  {clause:"9.2", title:"Internal Audit", items:[
    {id:"9_2_1", text:"Internal audit programme established for the AIMS", done:false},
    {id:"9_2_2", text:"Audit criteria, scope, frequency, and methods defined", done:false},
    {id:"9_2_3", text:"Auditors selected to ensure objectivity and impartiality", done:false},
    {id:"9_2_4", text:"Audit results reported to relevant management", done:false},
  ]},
  {clause:"9.3", title:"Management Review", items:[
    {id:"9_3_1", text:"Management review of AIMS conducted at planned intervals", done:false},
    {id:"9_3_2", text:"Review considers audit results, performance, stakeholder feedback", done:false},
    {id:"9_3_3", text:"Decisions and actions from review documented", done:false},
  ]},
  {clause:"10.1", title:"Nonconformity & Corrective Action", items:[
    {id:"10_1_1", text:"Nonconformities identified, documented, and investigated", done:false},
    {id:"10_1_2", text:"Root cause analysis performed for significant nonconformities", done:false},
    {id:"10_1_3", text:"Corrective actions implemented and verified for effectiveness", done:false},
  ]},
  {clause:"10.2", title:"Continual Improvement", items:[
    {id:"10_2_1", text:"Opportunities for AIMS improvement systematically identified", done:false},
    {id:"10_2_2", text:"Improvement initiatives linked to AI policy objectives", done:false},
    {id:"10_2_3", text:"Evidence of continual improvement maintained", done:false},
  ]},
];

const ISO27001_CHECKLIST = [
  {clause:"A.5", title:"Organisational Controls", items:[
    {id:"27_5_1",text:"Information security policies defined, approved by management",done:true},
    {id:"27_5_2",text:"Information security roles and responsibilities assigned",done:true},
    {id:"27_5_3",text:"Segregation of duties implemented for critical functions",done:false},
    {id:"27_5_4",text:"Management responsibilities for information security communicated",done:true},
  ]},
  {clause:"A.8", title:"Asset Management", items:[
    {id:"27_8_1",text:"Inventory of assets maintained with identified owners",done:false},
    {id:"27_8_2",text:"Assets classified by confidentiality, integrity, availability",done:false},
    {id:"27_8_3",text:"Acceptable use policy for information assets documented",done:true},
    {id:"27_8_4",text:"Return of assets enforced upon employment termination",done:true},
  ]},
  {clause:"A.9", title:"Access Control", items:[
    {id:"27_9_1",text:"Access control policy established and documented",done:true},
    {id:"27_9_2",text:"User access provisioning and de-provisioning process in place",done:true},
    {id:"27_9_3",text:"Privileged access rights managed and reviewed",done:false},
    {id:"27_9_4",text:"Secret authentication information managed securely",done:true},
  ]},
  {clause:"A.12",title:"Operations Security", items:[
    {id:"27_12_1",text:"Documented operating procedures for security operations",done:true},
    {id:"27_12_2",text:"Change management process established and enforced",done:true},
    {id:"27_12_3",text:"Malware protection deployed across all endpoints",done:true},
    {id:"27_12_4",text:"Vulnerability management programme active",done:false},
  ]},
];

const GDPR_CHECKLIST = [
  {clause:"Art.5", title:"Principles of Processing", items:[
    {id:"gdpr_5_1",text:"Lawfulness, fairness, transparency confirmed for all processing activities",done:true},
    {id:"gdpr_5_2",text:"Purpose limitation documented per processing activity",done:true},
    {id:"gdpr_5_3",text:"Data minimisation principle applied and verified",done:false},
    {id:"gdpr_5_4",text:"Accuracy measures implemented and maintained",done:true},
  ]},
  {clause:"Art.30",title:"Records of Processing Activities", items:[
    {id:"gdpr_30_1",text:"Processing register maintained and kept up to date",done:true},
    {id:"gdpr_30_2",text:"All processing activities documented with full details",done:false},
    {id:"gdpr_30_3",text:"Lawful basis recorded for each processing activity",done:false},
    {id:"gdpr_30_4",text:"Retention periods documented and enforced",done:true},
  ]},
  {clause:"Art.35",title:"Data Protection Impact Assessment", items:[
    {id:"gdpr_35_1",text:"DPIA threshold assessment performed for high-risk processing",done:false},
    {id:"gdpr_35_2",text:"DPIAs completed for all mandatory processing activities",done:false},
    {id:"gdpr_35_3",text:"DPIA results reviewed and approved by DPO",done:false},
    {id:"gdpr_35_4",text:"6-monthly DPIA review cycle established",done:false},
  ]},
];

const CHECKLISTS_MAP = {
  caio: [{key:"iso42001", label:"ISO 42001 AIMS", data:ISO42001_CHECKLIST}],
  ciso: [{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST}],
  cio:  [{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST}],
  cdpo: [{key:"gdpr", label:"GDPR", data:GDPR_CHECKLIST}],
  cgo:  [{key:"iso42001", label:"ISO 42001 AIMS", data:ISO42001_CHECKLIST},{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST},{key:"gdpr", label:"GDPR", data:GDPR_CHECKLIST}],
};

/* ─────────────────────────────────────────────
   PLAYBOOK DATA
───────────────────────────────────────────── */
const PLAYBOOK = {
  caio:[
    {id:1,title:"LLM v2 Production Deployment",priority:"Critical",status:"Awaiting Approval",due:"May 10",fw:"EU AI Act Art.6",owner:"You (CAIO)",collab:"CISO, Legal, Engineering",hitl:true,desc:"Customer-facing LLM for support automation. High-Risk under EU AI Act Art.6. Bias assessment passed (95.2% fairness). Transparency docs 80% complete — Art.13 disclosure pending before go-live."},
    {id:2,title:"EU AI Act Art.9 Risk Management System",priority:"Critical",status:"In Progress",due:"May 30",fw:"EU AI Act",owner:"You (CAIO)",collab:"GRC, Legal",hitl:false,desc:"Mandatory risk management system for all High-Risk AI systems. Requires ISO 42001 Clause 8.2/8.3 alignment and documented treatment plans."},
    {id:3,title:"AI Model Inventory — Risk Classification",priority:"High",status:"In Progress",due:"May 25",fw:"ISO 42001 C.8.4",owner:"AI Governance Lead",collab:"You (CAIO), All BUs",hitl:false,desc:"17 production models. 3 unclassified under EU AI Act risk tiers. ISO 42001 Clause 8.4 requires all system objectives documented before deployment."},
    {id:4,title:"Model Card Documentation Suite",priority:"Medium",status:"In Progress",due:"Jun 5",fw:"ISO 42001",owner:"ML Engineering",collab:"You (CAIO), Product",hitl:false,desc:"Standardised model cards for all 17 production models per ISO 42001 Annex A data documentation requirements. 7 of 17 complete."},
    {id:5,title:"AI Transparency Report Q2 2026",priority:"High",status:"Scheduled",due:"Jun 30",fw:"EU AI Act Art.13",owner:"You (CAIO)",collab:"Comms, Legal",hitl:true,desc:"Mandatory public transparency report per EU AI Act Art.13. Covers AI systems in use, training data sources, human oversight mechanisms, known limitations."},
  ],
  ciso:[
    {id:1,title:"GDPR Art.35 DPIA — Analytics Platform",priority:"Critical",status:"Overdue",due:"May 2",fw:"GDPR Art.35",owner:"You (CISO)",collab:"DPO, Legal",hitl:true,desc:"Processing >10,000 EU data subjects with behavioural profiling. Active GDPR violation — platform live without completed DPIA. 2 days overdue."},
    {id:2,title:"ISO 27001 Annex A.8.2 Gap Remediation",priority:"High",status:"In Progress",due:"May 20",fw:"ISO 27001 A.8",owner:"GRC Manager",collab:"You (CISO), IT Ops",hitl:false,desc:"143 assets — 47 unclassified. Closing A.8.2 gap before Q3 certification audit. Asset classification taxonomy in review."},
    {id:3,title:"Vendor Security Assessment — Stripe",priority:"High",status:"In Progress",due:"May 9",fw:"SOC 2",owner:"You (CISO)",collab:"Legal, Procurement",hitl:false,desc:"Quarterly security review of payment processor. Reviewing SOC 2 Type II report, penetration test results, and contractual obligations."},
    {id:4,title:"Incident Response Playbook v3",priority:"Medium",status:"In Review",due:"May 15",fw:"NIST CSF",owner:"SecOps Lead",collab:"You (CISO), Legal",hitl:true,desc:"Annual update incorporating Q1 incident lessons. Adds ransomware scenario and updated escalation chains. All reviews complete — awaiting CISO approval."},
    {id:5,title:"Zero Trust Architecture Phase 2",priority:"High",status:"Scheduled",due:"May 28",fw:"NIST CSF",owner:"IT Architect",collab:"You (CISO), CIO",hitl:false,desc:"Microsegmentation and identity verification across all cloud workloads. 847 endpoints in scope. CIO co-owns budget sign-off."},
  ],
  cio:[
    {id:1,title:"EU Data Residency Remediation — S3",priority:"Critical",status:"Overdue",due:"May 1",fw:"GDPR Art.46",owner:"Cloud Architect",collab:"You (CIO), CISO",hitl:true,desc:"3 S3 buckets storing EU PII in us-east-1. No transfer mechanism — GDPR Art.46 violation. AWS DataSync migration to eu-west-1 ready. 48h execution."},
    {id:2,title:"Zero Trust Phase 2 — Sign-off",priority:"Critical",status:"Awaiting Approval",due:"May 8",fw:"NIST CSF",owner:"You (CIO)",collab:"CISO, IT Ops",hitl:true,desc:"847 endpoints. $340k pre-approved. CISO approved security architecture. Implementation window closes May 15 for Q3 audit readiness."},
    {id:3,title:"FY25 IT Strategic Roadmap Review",priority:"High",status:"In Progress",due:"May 20",fw:"Internal",owner:"You (CIO)",collab:"CFO, All VPs",hitl:false,desc:"5 of 34 initiatives at risk. Cloud migration and AI infrastructure budget lines need executive discussion before Q3 commitment."},
    {id:4,title:"Vendor Contract Renewal — ServiceNow",priority:"High",status:"Overdue",due:"Apr 30",fw:"SOC 2",owner:"Procurement",collab:"You (CIO), Finance",hitl:false,desc:"$1.2M ACV 3-year renewal. Legal reviewing updated DPA. Security questionnaire submitted. Operating on expired contract — risk of service disruption."},
    {id:5,title:"Disaster Recovery Test Q2",priority:"Medium",status:"Scheduled",due:"Jun 15",fw:"ISO 27001 A.17",owner:"IT Ops Lead",collab:"You (CIO), CISO",hitl:false,desc:"Full failover across 3 regions. RTO target: 4 hours. Last test: 6.5 hours — improvement required before Q3 audit."},
  ],
  cdpo:[
    {id:1,title:"GDPR Art.35 DPIA — Analytics Platform",priority:"Critical",status:"Overdue",due:"May 2",fw:"GDPR Art.35",owner:"You (CDPO)",collab:"CISO, Legal",hitl:true,desc:"Platform live without DPIA. Processing >10k EU data subjects via behavioural profiling. Active Art.35 violation — supervisory authority risk. 2 days overdue."},
    {id:2,title:"Data Processing Register Audit",priority:"High",status:"In Progress",due:"May 20",fw:"GDPR Art.30",owner:"You (CDPO)",collab:"All Dept Heads",hitl:false,desc:"143 processing activities. 12 have no confirmed lawful basis under Art.6. Full audit and BU sign-off required before next DPA enquiry window."},
    {id:3,title:"DSR Queue — 4 Approaching Deadline",priority:"Critical",status:"Urgent",due:"Various",fw:"GDPR Art.12",owner:"You (CDPO)",collab:"Legal, IT Ops",hitl:false,desc:"4 data subject access requests approaching 30-day GDPR deadline. Two require manual extraction from legacy CRM — technical team engaged."},
    {id:4,title:"US Vendor SCC Review",priority:"High",status:"In Progress",due:"May 30",fw:"GDPR Art.46",owner:"Privacy Team",collab:"You (CDPO), Legal",hitl:true,desc:"8 US vendors processing EU personal data. Post-Schrems II SCCs required. 3 TIAs complete. 5 pending — processing pause notices drafted."},
    {id:5,title:"Privacy by Design — Q3 Product Launch",priority:"Medium",status:"Scheduled",due:"Jun 10",fw:"GDPR Art.25",owner:"You (CDPO)",collab:"Product, Engineering",hitl:false,desc:"Mandatory PbD review for Q3 product feature. Checklist must be signed off before design approval. ISO 27701 alignment required."},
  ],
  cgo:[
    {id:1,title:"Enterprise GRC Framework Rollout",priority:"Critical",status:"In Progress",due:"May 31",fw:"COBIT 5 / COSO ERM",owner:"You (CGO)",collab:"CISO, CAIO, CIO, CDPO",hitl:true,desc:"Deploying unified GRC framework across all five governance domains. COBIT 5 process model mapped to enterprise risk appetite. Cross-functional sign-off required from all role leads."},
    {id:2,title:"Board Governance Report — Q2 2026",priority:"Critical",status:"Awaiting Approval",due:"May 15",fw:"COSO ERM",owner:"You (CGO)",collab:"CEO, CFO, All C-Suite",hitl:true,desc:"Quarterly board-level governance report consolidating enterprise risk score, regulatory compliance posture, AI governance maturity, and privacy risk. Requires CGO sign-off before board submission."},
    {id:3,title:"Regulatory Change Management — EU AI Act",priority:"High",status:"In Progress",due:"Jun 30",fw:"EU AI Act / ISO 42001",owner:"You (CGO)",collab:"CAIO, Legal, GRC Team",hitl:false,desc:"Monitoring and operationalising EU AI Act enforcement changes (August 2026). Coordinating impact assessment across CAIO, CISO, and CDPO. Gap analysis in progress."},
    {id:4,title:"Enterprise Risk Register — Annual Refresh",priority:"High",status:"In Progress",due:"May 25",fw:"ISO 31000",owner:"Risk Manager",collab:"You (CGO), All Leads",hitl:false,desc:"Annual refresh of the enterprise risk register per ISO 31000. 47 risks under review. 8 new AI-related risks added. CGO owns sign-off and board presentation."},
    {id:5,title:"Third-Party Governance Programme",priority:"Medium",status:"Scheduled",due:"Jun 20",fw:"COBIT 5 / ISO 31000",owner:"You (CGO)",collab:"CISO, Procurement, Legal",hitl:false,desc:"Establishing enterprise-wide third-party risk governance programme. Vendor tiering, due diligence standards, and ongoing monitoring framework. Aligns all domain-specific vendor risk activities."},
  ],
};

/* ─────────────────────────────────────────────
   HITL DATA
───────────────────────────────────────────── */
const HITL = {
  caio:[
    {id:"hc1",title:"LLM v2 — Production Deployment",risk:"Critical",conf:87,time:"Go-live in 6 days",clause:"ISO 42001 C.8.5 / EU AI Act Art.6",reasoning:"High-Risk classification under EU AI Act Art.6 confirmed. Bias assessment passed — 95.2% fairness score across 4 demographic groups. ISO 42001 Clause 8.5 deployment compliance verified. Art.13 transparency disclosure 80% complete. Conditional deployment is permissible under Art.6(4) with monitoring obligations confirmed in writing by CAIO.",action:"Approve conditional deployment with real-time bias monitoring and 30-day CAIO review checkpoint"},
    {id:"hc2",title:"AI Transparency Report Q1 — Publish",risk:"High",conf:82,time:"Pending 1 day",clause:"EU AI Act Art.13",reasoning:"Report reviewed by Legal and Comms. EU AI Act Art.13 disclosures verified for 14/17 systems. One training data source flag requires CAIO judgment: publicly-scraped web data — disclosure approach is legally ambiguous between two options provided by Legal.",action:"Review training data disclosure options and approve publication with chosen approach"},
  ],
  ciso:[
    {id:"hs1",title:"GDPR Art.35 DPIA — Analytics Platform",risk:"Critical",conf:97,time:"2 days overdue",clause:"GDPR Art.35 / ISO 27001 A.18",reasoning:"Processing >10k EU data subjects with behavioural profiling triggers mandatory DPIA under Art.35. Platform is live and processing without completed DPIA — active GDPR violation. Legal confirmed. DPO standing by. ISO 27001 A.18.1 compliance requires CISO sign-off.",action:"Submit DPIA to DPO and initiate processing suspension assessment within 24 hours"},
    {id:"hs2",title:"Incident Response Playbook v3 — Publish",risk:"Medium",conf:96,time:"Pending 3 days",clause:"NIST CSF RS.RP",reasoning:"All stakeholder reviews complete. Legal approved. SecOps signed off. AI cross-referenced against ISO 27001 Annex A controls — no conflicts. Adds ransomware scenario currently absent from organisation response capability.",action:"Approve publication and distribution to all staff and relevant third parties"},
  ],
  cio:[
    {id:"hi1",title:"Zero Trust Phase 2 — Implementation",risk:"Critical",conf:91,time:"Pending 4 days",clause:"NIST CSF PR.AC",reasoning:"CISO approved architecture. 847 endpoints validated. $340k pre-approved by CFO. Implementation window closes May 15. Delay risks Q3 audit readiness. NIST CSF PR.AC-1 requires CITO/CIO formal approval before deployment.",action:"Approve implementation kickoff and issue purchase order to delivery partner"},
    {id:"hi2",title:"S3 Data Residency — Emergency Migration",risk:"Critical",conf:98,time:"Overdue 3 days",clause:"GDPR Art.46",reasoning:"3 S3 buckets confirmed storing EU PII in us-east-1 with no transfer mechanism in place. Active GDPR Art.46 violation. Legal confirmed. DataSync migration plan to eu-west-1 ready — 48 hours, zero data loss confirmed by Cloud Architecture.",action:"Approve emergency migration execution — 48-hour window confirmed"},
  ],
  cdpo:[
    {id:"hd1",title:"GDPR Art.35 DPIA — Analytics Platform",risk:"Critical",conf:97,time:"2 days overdue",clause:"GDPR Art.35",reasoning:"Platform processes behavioural data for >10k EU subjects. Art.35 DPIA mandatory before processing begins. Platform went live without one. DPIA 90% complete. Supervisory authority notification risk increasing daily. CDPO sign-off required to submit.",action:"Sign off DPIA and instruct Legal to submit to supervisory authority within 24 hours"},
    {id:"hd2",title:"US Vendor SCCs — Batch Approval",risk:"High",conf:89,time:"Pending 5 days",clause:"GDPR Art.46 / Schrems II",reasoning:"8 US vendors process EU personal data. Post-Schrems II SCCs and TIAs required. 3 vendors TIA-complete — Legal approved. 5 vendors TIA-incomplete — data processing should pause under Art.46. Legal drafted pause notices.",action:"Approve SCCs for 3 validated vendors and authorise pause notices to 5 pending"},
  ],
  cgo:[
    {id:"hg1",title:"Board Governance Report Q2 — Final Approval",risk:"Critical",conf:95,time:"Due in 2 days",clause:"COSO ERM / COBIT 5 ME4",reasoning:"Quarterly board pack consolidates enterprise risk score (72/100), AI governance maturity (69%), privacy compliance (78%), and cybersecurity posture (72%). All contributing leads have submitted their sections. Legal reviewed. CGO sign-off is the final gate before CEO submission to the Board.",action:"Approve Q2 Board Governance Report and release to CEO for board submission"},
    {id:"hg2",title:"EU AI Act Gap — Cross-functional Remediation Plan",risk:"High",conf:88,time:"Pending 3 days",clause:"EU AI Act Art.9 / ISO 42001 C.6.1",reasoning:"AI scored 72% EU AI Act conformity against an August 2026 enforcement deadline. CAIO, CISO, and CDPO have each submitted gap remediation plans. AI has consolidated them into a unified cross-functional plan. CGO must approve the unified plan and assign executive accountability before execution begins.",action:"Approve unified EU AI Act remediation plan and assign executive ownership per workstream"},
  ],
};

/* ─────────────────────────────────────────────
   ROLE-SPECIFIC KPI & STANDARDS DATA
───────────────────────────────────────────── */
const KPI = {
  caio:{compliance:72,cTrend:4,incidents:1,iTrend:0,risks:8,rTrend:-1,hitl:2,overdue:0,
    score:69, scoreLabel:"Moderate", scoreTrend:6,
    domainLabel:"AI Governance Score"},
  ciso:{compliance:82,cTrend:3,incidents:2,iTrend:-1,risks:14,rTrend:-2,hitl:2,overdue:1,
    score:72, scoreLabel:"Moderate", scoreTrend:8,
    domainLabel:"Enterprise Risk Score"},
  cio: {compliance:81,cTrend:2,incidents:3,iTrend:1,risks:19,rTrend:2,hitl:2,overdue:2,
    score:74, scoreLabel:"Good", scoreTrend:5,
    domainLabel:"IT Operations Score"},
  cdpo:{compliance:78,cTrend:3,incidents:0,iTrend:-1,risks:11,rTrend:0,hitl:2,overdue:1,
    score:81, scoreLabel:"Good", scoreTrend:7,
    domainLabel:"Privacy Score"},
  cgo: {compliance:76,cTrend:5,incidents:1,iTrend:-1,risks:23,rTrend:-3,hitl:2,overdue:1,
    score:74, scoreLabel:"Developing", scoreTrend:5,
    domainLabel:"Governance Maturity Score"},
};

/* Role-specific KPI tables from reference image */
const ROLE_KPIS = {
  ciso:[
    {cat:"Threat Detection",   kpi:"Mean Time to Detect (MTTD)",   target:"< 15 mins",  threshold:"> 30 mins",  fw:"NIST CSF",    status:"Critical", value:"22 min"},
    {cat:"Incident Response",  kpi:"Mean Time to Respond (MTTR)",  target:"< 60 mins",  threshold:"> 4 hrs",    fw:"ISO 27001",   status:"Alert",    value:"47 min"},
    {cat:"Vulnerability Mgmt", kpi:"Critical Patch SLA",           target:"96% in 7d",  threshold:"< 90%",      fw:"CIS Controls",status:"Alert",    value:"91%"},
    {cat:"Security Posture",   kpi:"Security Score",                target:"> 90/100",   threshold:"< 75",       fw:"Internal",    status:"Critical", value:"72"},
    {cat:"IAM Governance",     kpi:"MFA Coverage",                 target:"100%",       threshold:"< 95%",      fw:"NIST Identity",status:"Alert",   value:"94%"},
    {cat:"SOC Efficiency",     kpi:"False Positive Rate",          target:"< 10%",      threshold:"> 20%",      fw:"SOC Maturity",status:"Good",     value:"8%"},
    {cat:"Endpoint Security",  kpi:"Endpoint Compliance",          target:"> 98%",      threshold:"< 90%",      fw:"MS Security", status:"Good",     value:"98.2%"},
    {cat:"Third-Party Risk",   kpi:"Vendor Risk Index",            target:"< 20",       threshold:"> 60 High",  fw:"SIG Assess.", status:"High",     value:"34"},
    {cat:"Cloud Security",     kpi:"Misconfiguration Count",       target:"Zero",       threshold:"> 5",        fw:"CSA CCM",     status:"Critical", value:"8"},
    {cat:"Regulatory Security",kpi:"Compliance Adherence",         target:"> 95%",      threshold:"< 85%",      fw:"ISO/NIST/SOC2",status:"Alert",   value:"82%"},
  ],
  cio:[
    {cat:"IT Operations",      kpi:"System Availability",          target:"99.99%",     threshold:"< 99.5%",    fw:"ITIL",        status:"Good",     value:"99.96%"},
    {cat:"Digital Transform.", kpi:"Automation Coverage",          target:"> 70%",      threshold:"< 40%",      fw:"Hyperauto. Maturity",status:"Alert", value:"52%"},
    {cat:"Cloud Efficiency",   kpi:"Cloud Cost Optimisation",      target:"20-30% Sav.",threshold:"Overspend",  fw:"FinOps",      status:"Alert",    value:"12% Sav."},
    {cat:"Service Management", kpi:"Ticket Resolution < SLA",      target:"98% (P1)",   threshold:"< 8 hrs",    fw:"ITIL",        status:"Alert",    value:"91%"},
    {cat:"Infrastructure",     kpi:"Capacity Utilisation",         target:"70-80%",     threshold:"< 90% Risk", fw:"DCIM Std.",   status:"Good",     value:"76%"},
    {cat:"Business Continuity",kpi:"RTO Achievement",              target:"< 2 hrs",    threshold:"> 6 hrs",    fw:"ISO 22301",   status:"Good",     value:"1.8 hrs"},
    {cat:"Enterprise Arch.",   kpi:"Technical Debt Score",         target:"< 15%",      threshold:"N/A",        fw:"TOGAF",       status:"Good",     value:"11%"},
    {cat:"Employee Experience",kpi:"Digital Workplace Satisfaction",target:"> 85%",     threshold:"< 70%",      fw:"EX Maturity", status:"Alert",    value:"71%"},
    {cat:"AI Adoption",        kpi:"AI Utilisation Index",         target:"> 60%",      threshold:"< 25%",      fw:"AI Maturity", status:"Alert",    value:"38%"},
    {cat:"Governance",         kpi:"Change Failure Rate",          target:"< 5%",       threshold:"> 15%",      fw:"DevOps Metrics",status:"Alert",  value:"9%"},
  ],
  cdpo:[
    {cat:"Privacy Compliance", kpi:"Consent Validity",             target:"> 98%",      threshold:"< 90%",      fw:"GDPR",        status:"Alert",    value:"94%"},
    {cat:"DSAR Management",    kpi:"DSAR Closure Time",            target:"< 15 days",  threshold:"> 25 days",  fw:"GDPR/DPDP",   status:"Alert",    value:"18 days"},
    {cat:"Data Classification",kpi:"Classified Data Coverage",     target:"100%",       threshold:"< 85%",      fw:"ISO 27701",   status:"Alert",    value:"81%"},
    {cat:"Privacy Incidents",  kpi:"Privacy Breach Count",         target:"Zero",       threshold:"> 1 Major",  fw:"GDPR/DPDP",   status:"Good",     value:"0"},
    {cat:"Data Retention",     kpi:"Expired Data Purge",           target:"100%",       threshold:"< 90%",      fw:"Privacy Laws",status:"Alert",    value:"87%"},
    {cat:"Data Discovery",     kpi:"Shadow Data Detection",        target:"Continuous", threshold:"Unscanned Assets",fw:"DSPM",   status:"Alert",    value:"14 assets"},
    {cat:"Third-Party Privacy",kpi:"Vendor DPA Compliance",        target:"> 90%",      threshold:"< 80%",      fw:"GDPR Art.28", status:"Alert",    value:"84%"},
    {cat:"Data Residency",     kpi:"Residency Violations",         target:"Zero",       threshold:"> 0 Severe", fw:"Sovereignty Laws",status:"Good", value:"0"},
    {cat:"AI Ethics",          kpi:"Sensitive Data in AI Models",  target:"Zero Exposure",threshold:"Any Exposure",fw:"ISO 42001",status:"Critical","value":"3 models"},
    {cat:"Regulatory Readiness",kpi:"Audit Readiness Score",       target:"> 95%",      threshold:"< 80%",      fw:"DPDP/GDPR/CCPA",status:"Alert", value:"78%"},
  ],
  caio:[
    {cat:"AI Risk",            kpi:"High-Risk AI Systems Governed", target:"100%",      threshold:"< 90%",      fw:"EU AI Act",   status:"Alert",    value:"82%"},
    {cat:"Model Performance",  kpi:"Avg. Model Accuracy",          target:"> 92%",      threshold:"< 80%",      fw:"ISO 42001",   status:"Good",     value:"91.3%"},
    {cat:"Bias & Fairness",    kpi:"Fairness Score (avg.)",        target:"> 95%",      threshold:"< 85%",      fw:"NIST AI RMF", status:"Alert",    value:"89.4%"},
    {cat:"AI Transparency",    kpi:"Model Cards Complete",         target:"100%",       threshold:"< 80%",      fw:"ISO 42001",   status:"Alert",    value:"7/17"},
    {cat:"AI Incidents",       kpi:"AI Incident Response Time",    target:"< 4 hrs",    threshold:"> 24 hrs",   fw:"ISO 42001",   status:"Good",     value:"3.2 hrs"},
    {cat:"HITL Compliance",    kpi:"HITL Override Rate",           target:"< 5%",       threshold:"> 15%",      fw:"EU AI Act",   status:"Good",     value:"3.1%"},
    {cat:"Data Governance",    kpi:"Training Data Provenance",     target:"100%",       threshold:"< 90%",      fw:"ISO 42001",   status:"Alert",    value:"76%"},
    {cat:"Regulatory",         kpi:"EU AI Act Conformity",         target:"100%",       threshold:"< 80%",      fw:"EU AI Act",   status:"Critical", value:"72%"},
    {cat:"Model Monitoring",   kpi:"Drift Detection Coverage",     target:"100%",       threshold:"< 80%",      fw:"NIST AI RMF", status:"Alert",    value:"61%"},
    {cat:"AI Ethics",          kpi:"Ethical Review Completion",    target:"100%",       threshold:"< 90%",      fw:"ISO 42001",   status:"Good",     value:"94%"},
  ],
  cgo:[
    {cat:"Governance Maturity",  kpi:"GRC Framework Maturity",        target:"Level 4",    threshold:"< Level 2",  fw:"COBIT 5",     status:"Alert",    value:"Level 3"},
    {cat:"Enterprise Risk",      kpi:"Enterprise Risk Score",          target:"> 80/100",   threshold:"< 60/100",   fw:"COSO ERM",    status:"Alert",    value:"72/100"},
    {cat:"Regulatory Readiness", kpi:"Regulatory Compliance Rate",     target:"> 95%",      threshold:"< 80%",      fw:"ISO 31000",   status:"Alert",    value:"76%"},
    {cat:"Policy Governance",    kpi:"Policies Reviewed (Annual)",     target:"100%",       threshold:"< 90%",      fw:"COBIT 5",     status:"Alert",    value:"84%"},
    {cat:"Third-Party Risk",     kpi:"Vendor Risk Assessments Done",   target:"100%",       threshold:"< 75%",      fw:"ISO 31000",   status:"Critical", value:"61%"},
    {cat:"Audit Management",     kpi:"Audit Findings Closed (90d)",    target:"> 90%",      threshold:"< 70%",      fw:"COBIT 5",     status:"Alert",    value:"77%"},
    {cat:"Cross-Functional",     kpi:"Cross-role HITL Coordination",   target:"100%",       threshold:"< 80%",      fw:"GRC Integ.",  status:"Good",     value:"96%"},
    {cat:"Board Reporting",      kpi:"Board Pack On-Time Delivery",    target:"100%",       threshold:"< 90%",      fw:"COSO ERM",    status:"Good",     value:"100%"},
    {cat:"Incident Governance",  kpi:"Major Incidents Governed",       target:"100%",       threshold:"< 85%",      fw:"ISO 31000",   status:"Good",     value:"100%"},
    {cat:"AI Governance Ovrsght",kpi:"AI Risk Items Reviewed (CGO)",   target:"100%",       threshold:"< 80%",      fw:"EU AI Act",   status:"Alert",    value:"82%"},
  ],
};

/* Role-specific domain metrics for dashboard cards */
const DOMAIN_METRICS = {
  ciso:[
    {label:"Cybersecurity Score",    value:78, unit:"/100", color:"#4B7BF5", trend:6,  fw:"NIST CSF"},
    {label:"Threat Detection (MTTD)",value:22, unit:" min",  color:"#E84040", trend:-8, fw:"NIST CSF"},
    {label:"MFA Coverage",           value:94, unit:"%",     color:"#E8A020", trend:2,  fw:"ISO 27001"},
    {label:"Vendor Risk Index",       value:34, unit:"",      color:"#E8A020", trend:-4, fw:"SIG"},
    {label:"Patch Compliance",        value:91, unit:"%",     color:"#1FB864", trend:3,  fw:"CIS"},
    {label:"Open Vulnerabilities",    value:14, unit:"",      color:"#E84040", trend:-2, fw:"CVE"},
  ],
  cio:[
    {label:"System Availability",    value:99.96,unit:"%",   color:"#1FB864", trend:0,  fw:"ITIL"},
    {label:"RTO Achievement",        value:1.8, unit:" hrs",  color:"#1FB864", trend:-0.3,fw:"ISO 22301"},
    {label:"Cloud Cost Savings",     value:12,  unit:"%",    color:"#E8A020", trend:5,  fw:"FinOps"},
    {label:"Ticket SLA (P1)",        value:91,  unit:"%",    color:"#E8A020", trend:-3, fw:"ITIL"},
    {label:"Automation Coverage",    value:52,  unit:"%",    color:"#E8A020", trend:8,  fw:"DevOps"},
    {label:"Change Failure Rate",    value:9,   unit:"%",    color:"#E84040", trend:-1, fw:"DevOps"},
  ],
  cdpo:[
    {label:"DSAR Closure (avg.)",    value:18,  unit:" days", color:"#E8A020", trend:-3, fw:"GDPR"},
    {label:"Consent Validity",       value:94,  unit:"%",    color:"#E8A020", trend:2,  fw:"GDPR"},
    {label:"Vendor DPA Compliance",  value:84,  unit:"%",    color:"#E8A020", trend:5,  fw:"Art.28"},
    {label:"Data Classification",    value:81,  unit:"%",    color:"#E8A020", trend:4,  fw:"ISO 27701"},
    {label:"Audit Readiness Score",  value:78,  unit:"%",    color:"#E84040", trend:6,  fw:"GDPR"},
    {label:"Residency Violations",   value:0,   unit:"",     color:"#1FB864", trend:0,  fw:"Sovereignty"},
  ],
  caio:[
    {label:"EU AI Act Conformity",   value:72,  unit:"%",    color:"#E84040", trend:4,  fw:"EU AI Act"},
    {label:"Model Cards Complete",   value:7,   unit:"/17",  color:"#E8A020", trend:2,  fw:"ISO 42001"},
    {label:"Avg. Model Accuracy",    value:91.3,unit:"%",    color:"#1FB864", trend:1.3,fw:"ISO 42001"},
    {label:"Fairness Score",         value:89.4,unit:"%",    color:"#E8A020", trend:2.1,fw:"NIST AI RMF"},
    {label:"Drift Detection Cvg.",   value:61,  unit:"%",    color:"#E84040", trend:8,  fw:"NIST AI RMF"},
    {label:"HITL Override Rate",     value:3.1, unit:"%",    color:"#1FB864", trend:-1, fw:"EU AI Act"},
  ],
  cgo:[
    {label:"GRC Maturity Level",     value:"L3",unit:"",     color:"#E8A020", trend:1,  fw:"COBIT 5"},
    {label:"Enterprise Risk Score",  value:72,  unit:"/100", color:"#E8A020", trend:5,  fw:"COSO ERM"},
    {label:"Regulatory Compliance",  value:76,  unit:"%",    color:"#E8A020", trend:5,  fw:"ISO 31000"},
    {label:"Vendor Risk Assessed",   value:61,  unit:"%",    color:"#E84040", trend:8,  fw:"ISO 31000"},
    {label:"Audit Findings Closed",  value:77,  unit:"%",    color:"#E8A020", trend:4,  fw:"COBIT 5"},
    {label:"Board Pack On-Time",     value:100, unit:"%",    color:"#1FB864", trend:0,  fw:"COSO ERM"},
  ],
};

const STANDARDS_MAP = {
  ciso:[
    {std:"ISO 27001", applies:"Security Compliance",   status:"Active", score:65},
    {std:"NIST CSF",  applies:"Risk Management",       status:"Active", score:79},
    {std:"SOC 2 II",  applies:"Audit & Assurance",     status:"Active", score:91},
    {std:"GDPR",      applies:"Privacy Security",      status:"Active", score:88},
    {std:"PCI-DSS",   applies:"Payment Security",      status:"Active", score:83},
    {std:"CIS Controls",applies:"Security Baseline",   status:"Active", score:77},
  ],
  cio:[
    {std:"ITIL 4",    applies:"IT Service Management", status:"Active", score:84},
    {std:"ISO 22301", applies:"Business Continuity",   status:"Active", score:79},
    {std:"TOGAF",     applies:"Enterprise Architecture",status:"Active",score:71},
    {std:"COBIT 5",   applies:"Governance Maturity",   status:"Active", score:68},
    {std:"ISO 27001", applies:"IT Security",           status:"Active", score:65},
    {std:"NIST CSF",  applies:"Risk Maturity",         status:"Active", score:79},
  ],
  cdpo:[
    {std:"GDPR",        applies:"Privacy Compliance",  status:"Active", score:81},
    {std:"ISO 27701",   applies:"Privacy Gov.",        status:"Active", score:63},
    {std:"CCPA/CPRA",   applies:"US Privacy",          status:"Active", score:77},
    {std:"ePrivacy",    applies:"Cookie & Comms",      status:"Active", score:70},
    {std:"DPDP Act",    applies:"India Privacy",       status:"Building",score:45},
    {std:"HIPAA",       applies:"Healthcare Privacy",  status:"N/A",    score:0},
  ],
  caio:[
    {std:"EU AI Act",   applies:"AI Compliance",       status:"Active", score:72},
    {std:"ISO 42001",   applies:"AI Management System",status:"Active", score:58},
    {std:"NIST AI RMF", applies:"AI Risk Management",  status:"Active", score:74},
    {std:"GDPR Art.22", applies:"Automated Decisions", status:"Active", score:83},
    {std:"ISO 42001 A", applies:"Annex A Controls",    status:"Building",score:61},
    {std:"IEEE 7000",   applies:"Ethical AI Design",   status:"Planned",score:40},
  ],
  cgo:[
    {std:"COBIT 5",     applies:"GRC & Governance",    status:"Active", score:68},
    {std:"COSO ERM",    applies:"Enterprise Risk Mgmt",status:"Active", score:72},
    {std:"ISO 31000",   applies:"Risk Management",     status:"Active", score:74},
    {std:"ISO 27001",   applies:"Security Oversight",  status:"Active", score:65},
    {std:"ISO 42001",   applies:"AI Governance Ovrsght",status:"Active",score:58},
    {std:"GDPR",        applies:"Privacy Oversight",   status:"Active", score:81},
  ],
};



/* ─────────────────────────────────────────────
   AIRA DATA (ISO 42001-aligned)
───────────────────────────────────────────── */
const AIRA = [
  {id:"r1",system:"LLM v2 (Customer Support)",category:"Bias & Fairness",likelihood:4,impact:5,score:20,level:"Critical",owner:"CAIO",clause:"ISO 42001 C.8.2 / EU AI Act Art.9",desc:"Model exhibits differential response quality across demographic groups. Disproportionate impact on non-native English speakers identified in bias testing. EU AI Act Art.9 risk management system must document this."},
  {id:"r2",system:"Credit Scoring AI",category:"Transparency",likelihood:3,impact:5,score:15,level:"High",owner:"CAIO / Legal",clause:"EU AI Act Art.13 / GDPR Art.22",desc:"Decision logic opaque to affected individuals. Art.22 requires meaningful explanation for automated decisions with legal effect. Model cards incomplete."},
  {id:"r3",system:"HR Recruitment AI",category:"Regulatory Compliance",likelihood:4,impact:4,score:16,level:"High",owner:"HR / CAIO",clause:"EU AI Act Annex III / ISO 42001 C.8.4",desc:"Potential EU AI Act High-Risk classification as employment-related AI. Conformity assessment may be required. ISO 42001 Clause 8.4 design documentation incomplete."},
  {id:"r4",system:"Fraud Detection Model",category:"Data Privacy",likelihood:2,impact:4,score:8,level:"Medium",owner:"CISO",clause:"ISO 42001 C.7.2 / GDPR Art.5",desc:"Training dataset contains unmasked PII. ISO 42001 Clause 7.2 data resource requirements (provenance, bias identification) not fully documented."},
  {id:"r5",system:"Document Summarisation AI",category:"Hallucination Risk",likelihood:3,impact:3,score:9,level:"Medium",owner:"Product",clause:"ISO 42001 C.9.1",desc:"Model produces confident incorrect summaries. ISO 42001 Clause 9.1 monitoring not yet tracking hallucination rate. Risk of decisions made on AI-fabricated content."},
  {id:"r6",system:"Predictive Maintenance AI",category:"Safety",likelihood:2,impact:5,score:10,level:"Medium",owner:"Engineering",clause:"EU AI Act Annex III / ISO 42001 C.8.5",desc:"Incorrect predictions could cause equipment failure and physical harm. Potential High-Risk classification under EU AI Act Annex III. ISO 42001 C.8.5 kill-switch not implemented."},
];

/* ─────────────────────────────────────────────
   AIRT DATA
───────────────────────────────────────────── */
const AIRT = [
  {id:"t1",riskId:"r1",system:"LLM v2",risk:"Bias & Fairness",treatment:"Mitigate",action:"Deploy continuous bias monitoring with automated alerts. Retrain on balanced dataset. Add fairness guardrails pre-go-live. ISO 42001 C.9.1 monitoring framework to track daily.",owner:"CAIO",deadline:"May 15",status:"In Progress",priority:"Critical"},
  {id:"t2",riskId:"r2",system:"Credit Scoring AI",risk:"Transparency",treatment:"Mitigate",action:"Implement SHAP explainability layer. Generate automated Art.22 decision explanations. Legal to draft disclosure template. ISO 42001 model card to be updated.",owner:"CAIO / Legal",deadline:"May 30",status:"Planned",priority:"High"},
  {id:"t3",riskId:"r3",system:"HR Recruitment AI",risk:"Regulatory",treatment:"Transfer",action:"Engage EU AI Act consultant for conformity assessment. Suspend system pending classification outcome. ISO 42001 C.8.4 documentation to be completed.",owner:"HR / Legal",deadline:"Jun 15",status:"Planned",priority:"High"},
  {id:"t4",riskId:"r4",system:"Fraud Detection",risk:"Data Privacy",treatment:"Mitigate",action:"Anonymise training dataset using differential privacy. Re-validate performance post-anonymisation. Update ISO 42001 C.7.2 data documentation.",owner:"CISO / ML Eng",deadline:"Jun 1",status:"In Progress",priority:"Medium"},
  {id:"t5",riskId:"r5",system:"Document AI",risk:"Hallucination",treatment:"Accept",action:"Mandatory human review for all AI summaries in legal/financial contexts. Display confidence score to users. ISO 42001 C.9.1 hallucination rate tracking added.",owner:"Product",deadline:"May 20",status:"Complete",priority:"Medium"},
  {id:"t6",riskId:"r6",system:"Predictive Maintenance",risk:"Safety",treatment:"Mitigate",action:"Add hard safety threshold override. Implement fail-safe mode for critical equipment. ISO 42001 C.8.5 kill-switch deployed.",owner:"Engineering",deadline:"Jun 30",status:"Planned",priority:"Medium"},
];

/* ─────────────────────────────────────────────
   AIA DATA (AI Impact Assessment)
───────────────────────────────────────────── */
const AIA_DATA = [
  {
    id:"aia1",system:"LLM v2 Customer Support",date:"May 7, 2026",owner:"Aisha Patel",dept:"AI Governance",vendor:"Anthropic (via API)",status:"Pilot",
    decisionType:"Human-in-the-Loop",lifespan:"Continuous Deployment",
    data:{pii:true,sensitive:false,provenance:true,biasCheck:true,minimization:true},
    populations:["General Public","Employees"],
    rightsImpact:[
      {right:"Non-Discrimination",level:"High",desc:"Differential response quality identified across demographic groups. Bias mitigation controls in place."},
      {right:"Privacy",level:"Medium",desc:"Conversation logs retained 90 days. DPA reviewed. Minimisation applied."},
      {right:"Access to Justice",level:"Medium",desc:"Escalation path to human agent exists. Override documented."},
      {right:"Right to Safety",level:"Low",desc:"No physical harm risk. Financial advice explicitly excluded."},
      {right:"Transparency",level:"High",desc:"AI disclosure notice required before interaction. 80% complete."},
    ],
    technical:[
      {dim:"Accuracy",metric:">95% on test set",pass:true},
      {dim:"Bias Score (Fairness)",metric:"95.2% fairness across 4 groups",pass:true},
      {dim:"Robustness",metric:"Tested on adversarial inputs",pass:false},
      {dim:"Explainability",metric:"Decision rationale available",pass:false},
      {dim:"Cybersecurity",metric:"Prompt injection protection",pass:true},
    ],
    controls:[
      {measure:"Human Oversight",detail:"Human agent escalation within 2 clicks. Override available at any point."},
      {measure:"Training",detail:"All operators trained on AI limitations. 6-hour mandatory course."},
      {measure:"Transparency",detail:"'This response was generated by AI' disclosure. Pending on 20% of flows."},
      {measure:"Fall-back Plan",detail:"Manual support queue activated if AI confidence < 60%."},
      {measure:"Stop Mechanism",detail:"Kill-switch in CAIO HITL queue. Automated on critical error rate."},
    ],
    overallRisk:"High",
    decision:"Approved with Conditions",
    clause:"ISO 42001 C.8.2/8.4/8.5 · EU AI Act Art.6/9/13",
  },
  {
    id:"aia2",system:"HR Recruitment AI",date:"Apr 15, 2026",owner:"Sarah Chen",dept:"Human Resources",vendor:"HireRight AI",status:"Planning",
    decisionType:"Human-in-the-Loop",lifespan:"Continuous Deployment",
    data:{pii:true,sensitive:true,provenance:false,biasCheck:false,minimization:false},
    populations:["General Public","Vulnerable Groups"],
    rightsImpact:[
      {right:"Non-Discrimination",level:"High",desc:"Employment AI systems have documented history of reproducing historical biases. Protected characteristics in data not yet assessed."},
      {right:"Privacy",level:"High",desc:"CV data, interview recordings, psychometric scores processed. DPIA not yet initiated."},
      {right:"Access to Justice",level:"High",desc:"No appeal mechanism documented for rejected candidates."},
      {right:"Right to Safety",level:"Low",desc:"No physical safety risk."},
      {right:"Transparency",level:"High",desc:"Candidates not informed AI is used in screening process."},
    ],
    technical:[
      {dim:"Accuracy",metric:">85% match rate required",pass:false},
      {dim:"Bias Score",metric:"Not yet tested",pass:false},
      {dim:"Robustness",metric:"Not yet tested",pass:false},
      {dim:"Explainability",metric:"Not available from vendor",pass:false},
      {dim:"Cybersecurity",metric:"Vendor SOC 2 pending",pass:false},
    ],
    controls:[
      {measure:"Human Oversight",detail:"All shortlisting decisions reviewed by HR. Not yet implemented."},
      {measure:"Training",detail:"HR training on AI bias not yet conducted."},
      {measure:"Transparency",detail:"Candidate disclosure not yet designed."},
      {measure:"Fall-back Plan",detail:"Manual screening process documented."},
      {measure:"Stop Mechanism",detail:"Not yet defined."},
    ],
    overallRisk:"Unacceptable",
    decision:"Rejected",
    clause:"EU AI Act Annex III · ISO 42001 C.8.4 · GDPR Art.35",
  },
];

/* ─────────────────────────────────────────────
   ONBOARDING
───────────────────────────────────────────── */
const ONBOARD = {
  caio:[
    {id:1,title:"Read your AI Governance Charter",tag:"Foundation",time:"20 min",urgent:false,desc:"Your mandate under ISO 42001 covers all AI systems in development, production, pilot, and procurement. Clause 5.3 requires you to own the CAIO role formally."},
    {id:2,title:"Audit the AI Model Inventory",tag:"Critical",time:"25 min",urgent:true,desc:"17 models in production. 3 unclassified under EU AI Act risk tiers. ISO 42001 Clause 8.4 requires documented system objectives for all deployed AI."},
    {id:3,title:"Review the pending LLM v2 approval",tag:"Urgent",time:"15 min",urgent:true,desc:"Go-live in 6 days. Awaiting your HITL sign-off. EU AI Act Art.6 high-risk deployment requires explicit CAIO approval before any production traffic."},
    {id:4,title:"Understand the HITL workflow",tag:"Protocol",time:"10 min",urgent:false,desc:"ISO 42001 Clause 8.1 requires operational controls for AI decisions. Every high-stakes action requires your explicit approval before VerisZone can act."},
    {id:5,title:"Schedule your EU AI Act enforcement briefing",tag:"Compliance",time:"45 min",urgent:false,desc:"August 2026 enforcement is 12 weeks away. GRC team has a 45-min brief on your personal liability obligations as CAIO under Article 9 risk management."},
  ],
  ciso:[
    {id:1,title:"Review your Security Charter",tag:"Foundation",time:"15 min",urgent:false,desc:"Understand your mandate, authority scope, and reporting lines. ISO 27001 Clause 5.3 requires formally assigned CISO role with documented authorities."},
    {id:2,title:"Check live compliance gaps",tag:"Urgent",time:"10 min",urgent:true,desc:"ISO 27001 at 65% — 3 critical gaps including A.8.2 asset classification. Certification audit is Q3 2026. Pre-audit window opens in 8 weeks."},
    {id:3,title:"Review the overdue DPIA",tag:"Critical",time:"10 min",urgent:true,desc:"GDPR Art.35 DPIA for the analytics platform is 2 days overdue. Active regulatory violation. Your sign-off is required in the HITL Queue."},
    {id:4,title:"Meet your security team leads",tag:"People",time:"30 min",urgent:false,desc:"Schedule intros with SecOps Lead, GRC Manager, and Legal counsel. Understand current workstreams before making changes to strategy."},
    {id:5,title:"Explore the ISO 27001 checklist",tag:"Action",time:"15 min",urgent:false,desc:"Your Checklists tab has the full ISO 27001:2022 Annex A mapped to your current compliance posture. 47 assets still unclassified under A.8.2."},
  ],
  cio:[
    {id:1,title:"Review the IT Strategic Roadmap",tag:"Strategy",time:"30 min",urgent:false,desc:"34 active initiatives. 5 at risk of slipping this quarter. Cloud migration and AI infrastructure lines need executive discussion before Q3."},
    {id:2,title:"Inspect cloud architecture",tag:"Critical",time:"20 min",urgent:true,desc:"EU data residency GDPR Art.46 violation in 3 S3 buckets — active breach. Emergency migration plan awaiting your HITL approval. 3 days overdue."},
    {id:3,title:"Check the vendor risk register",tag:"Urgent",time:"15 min",urgent:true,desc:"47 active vendors. ServiceNow contract expired — operating at risk. 4 in critical security review. SOC 2 questionnaires outstanding for 2."},
    {id:4,title:"Approve Zero Trust Phase 2",tag:"Action",time:"10 min",urgent:false,desc:"Implementation plan awaiting your sign-off in the HITL Queue. CISO approved. $340k pre-approved. Window closes May 15 for Q3 audit readiness."},
    {id:5,title:"Meet your IT leadership team",tag:"People",time:"45 min",urgent:false,desc:"VP Engineering, Head of Ops, and Data Platform Lead all need intro calls. Understand current pressures before setting strategic direction."},
  ],
  cdpo:[
    {id:1,title:"Review your Privacy Charter",tag:"Foundation",time:"20 min",urgent:false,desc:"Your mandate covers all personal data processing. GDPR requires a formally designated DPO or CDPO with documented independence under Art.38."},
    {id:2,title:"Review the overdue DPIA",tag:"Critical",time:"20 min",urgent:true,desc:"Analytics platform DPIA is 2 days overdue. Art.35 active violation. Platform is live and processing. Your sign-off in HITL Queue is the critical path."},
    {id:3,title:"Audit the processing register",tag:"Urgent",time:"30 min",urgent:true,desc:"143 processing activities. 12 have no confirmed lawful basis under GDPR Art.6. DPA enquiry risk increasing. Register must be complete and current."},
    {id:4,title:"Meet Legal and the DPO team",tag:"People",time:"30 min",urgent:false,desc:"Understand the existing privacy governance structure, DPA relationship history, and escalation paths between Legal, Privacy, and DPO functions."},
    {id:5,title:"Clear the DSR queue",tag:"Action",time:"10 min",urgent:true,desc:"4 access requests approaching 30-day GDPR deadline. Two require manual extraction from legacy CRM. Risk of regulatory complaints if missed."},
  ],
  cgo:[
    {id:1,title:"Read your Governance Charter & Mandate",tag:"Foundation",time:"20 min",urgent:false,desc:"Your mandate as CGO spans all five domains: security, AI, technology, privacy, and enterprise risk. COBIT 5 governance model requires your role formally documented with Board-level authority."},
    {id:2,title:"Review the Board Governance Report",tag:"Critical",time:"25 min",urgent:true,desc:"Q2 board pack is due in 2 days and requires your sign-off. Consolidates risk scores from all 5 roles. It is awaiting your approval in the HITL Queue — this is your most time-critical action."},
    {id:3,title:"Assess the cross-functional GRC gaps",tag:"Urgent",time:"20 min",urgent:true,desc:"Enterprise GRC maturity is at Level 3 against a Level 4 target. Vendor risk assessments are only 61% complete. EU AI Act cross-functional remediation plan needs your approval to proceed."},
    {id:4,title:"Meet all five role leads",tag:"People",time:"60 min",urgent:false,desc:"As shared governance coordinator, schedule intro sessions with CISO, CAIO, CIO, and CDPO. Your effectiveness depends on trust and coordination across all four domains."},
    {id:5,title:"Explore the full ISO Checklists",tag:"Action",time:"20 min",urgent:false,desc:"You have access to ISO 42001, ISO 27001, and GDPR checklists simultaneously. Your oversight role means understanding compliance posture across all three frameworks."},
  ],
};

/* ─────────────────────────────────────────────
   ROADMAP
───────────────────────────────────────────── */
const ROADMAP = {
  caio:[
    {q:"Q1 2026",st:"done",items:["AI model inventory v1","EU AI Act gap analysis","ISO 42001 scoping","AI ethics policy v1"]},
    {q:"Q2 2026",st:"active",items:["LLM v2 deployment ★","EU AI Act Art.9 system ★","ISO 42001 C.8.4 model cards","CAIO governance framework"]},
    {q:"Q3 2026",st:"planned",items:["EU AI Act conformity assessment","ISO 42001 certification","AI transparency report Q2","Algorithmic impact assessments"]},
    {q:"Q4 2026",st:"planned",items:["AI Act compliance audit","Model risk framework v2","AI incident response plan","FY27 AI governance roadmap"]},
  ],
  ciso:[
    {q:"Q1 2026",st:"done",items:["ISO 27001 surveillance audit","Vendor risk framework v2","GDPR cookie consent","SOC 2 renewal"]},
    {q:"Q2 2026",st:"active",items:["ISO 27001 A.8.2 remediation ★","GDPR DPIA programme ★","Zero Trust review","Penetration test"]},
    {q:"Q3 2026",st:"planned",items:["ISO 27001 cert audit","NIST CSF uplift","Insider threat programme","Board security briefing"]},
    {q:"Q4 2026",st:"planned",items:["Annual risk assessment","Security awareness rollout","IR exercise","FY27 security budget"]},
  ],
  cio:[
    {q:"Q1 2026",st:"done",items:["Cloud architecture review","Zero Trust Phase 1","ServiceNow upgrade","Data classification"]},
    {q:"Q2 2026",st:"active",items:["Zero Trust Phase 2 ★","EU data residency fix ★","DR test","Roadmap review"]},
    {q:"Q3 2026",st:"planned",items:["Multi-cloud strategy","Vendor consolidation","Platform engineering","Digital workplace"]},
    {q:"Q4 2026",st:"planned",items:["FY27 IT budget","Technology risk review","Cloud cost optimisation","Architecture board"]},
  ],
  cdpo:[
    {q:"Q1 2026",st:"done",items:["GDPR processing register","DSR workflow","Privacy notice refresh","DPA review"]},
    {q:"Q2 2026",st:"active",items:["DPIA programme ★","Register audit ★","US vendor SCC review","ISO 27701 gap"]},
    {q:"Q3 2026",st:"planned",items:["ISO 27701 cert scoping","DPDP Act programme","Privacy by design rollout","CCPA update"]},
    {q:"Q4 2026",st:"planned",items:["Annual privacy review","FY27 budget","Cookie platform review","Board privacy brief"]},
  ],
  cgo:[
    {q:"Q1 2026",st:"done",items:["GRC framework scoping","Enterprise risk register v1","Board governance structure","Cross-role RACI matrix"]},
    {q:"Q2 2026",st:"active",items:["GRC framework rollout ★","Board Q2 governance report ★","EU AI Act cross-functional plan","Vendor risk programme design"]},
    {q:"Q3 2026",st:"planned",items:["COBIT 5 maturity assessment","ISO 31000 risk framework","Third-party governance rollout","Regulatory change mgmt. programme"]},
    {q:"Q4 2026",st:"planned",items:["Annual governance review","Board risk appetite refresh","FY27 GRC budget","Enterprise risk report"]},
  ],
};

/* ─────────────────────────────────────────────
   STRATEGY PILLARS
───────────────────────────────────────────── */
const PILLARS = {
  caio:[
    {name:"AI Governance Framework",desc:"ISO 42001 AIMS implementation",objs:["AIMS scope & context (C.4)","Leadership & AI policy (C.5)","Governance team RACI (C.5.3)","Management review (C.9.3)"],status:"Active"},
    {name:"Model Risk Management",desc:"Risk identification through ISO 42001 C.6 & C.8",objs:["Risk assessment process (C.6.1)","AI risk register (C.8.2)","Treatment plans (C.8.3)","Monitoring & metrics (C.9.1)"],status:"Active"},
    {name:"EU AI Act Compliance",desc:"Conformity before Aug 2026 enforcement",objs:["High-risk system register","Art.9 risk management system","Transparency docs (Art.13)","Conformity assessment (Art.43)"],status:"Active"},
    {name:"Ethical AI & Fairness",desc:"Embed fairness into all AI systems",objs:["Bias testing programme","Explainability framework","Algorithmic impact assessments","Fairness metrics dashboard"],status:"Building"},
    {name:"AI System Lifecycle",desc:"ISO 42001 C.8 end-to-end oversight",objs:["Design & development (C.8.4)","Deployment controls (C.8.5)","Monitoring & evaluation (C.9.1)","Decommissioning process"],status:"Building"},
  ],
  ciso:[
    {name:"Security Architecture",desc:"Zero-trust enterprise security",objs:["Zero Trust rollout","Cloud security posture","Identity governance","Microsegmentation"],status:"Active"},
    {name:"Threat Intelligence",desc:"Proactive threat detection",objs:["Threat feeds","Red team programme","Vulnerability management","Dark web monitoring"],status:"Active"},
    {name:"Compliance & Audit",desc:"Multi-framework compliance",objs:["ISO 27001 gap closure","SOC 2 renewal","GDPR controls uplift","Audit readiness"],status:"Active"},
    {name:"Incident Response",desc:"Minimise impact from incidents",objs:["Playbook maintenance","Tabletop exercises","SIEM integration","Escalation chains"],status:"Building"},
    {name:"Vendor Risk",desc:"Third-party security governance",objs:["Vendor questionnaires","Contractual controls","Ongoing monitoring","Offboarding procedures"],status:"Planned"},
  ],
  cio:[
    {name:"IT Strategy & Architecture",desc:"Technology aligned to business goals",objs:["Architecture review board","Technology radar","FY26 IT roadmap","Board technology reporting"],status:"Active"},
    {name:"Cloud & Infrastructure",desc:"Resilient, compliant cloud",objs:["Multi-region AWS","Zero Trust Phase 2","EU data residency","Cost optimisation"],status:"Active"},
    {name:"Digital Transformation",desc:"Modernise through technology",objs:["Platform engineering","Developer experience","Process automation","AI infrastructure"],status:"Building"},
    {name:"Vendor Management",desc:"Govern the vendor ecosystem",objs:["Contract renewals","Consolidation","SLA monitoring","Risk assessment"],status:"Active"},
    {name:"Business Continuity",desc:"Resilience and rapid recovery",objs:["DR testing","RTO/RPO targets","Incident playbooks","Failover validation"],status:"Planned"},
  ],
  cdpo:[
    {name:"Privacy Governance",desc:"Privacy as an organisational competency",objs:["Privacy charter","RACI matrix","DPA liaison","Board reporting"],status:"Active"},
    {name:"DPIA Programme",desc:"Systematic DPIAs for high-risk processing",objs:["DPIA templates","Threshold assessments","Register maintenance","Sign-off workflow"],status:"Active"},
    {name:"Data Subject Rights",desc:"Compliant DSR handling",objs:["DSR intake workflow","30-day SLA","Identity verification","Exemption framework"],status:"Active"},
    {name:"Privacy by Design",desc:"Privacy embedded from the start",objs:["PbD checklist","Dev training","Architecture review","Vendor contracts"],status:"Building"},
    {name:"Cross-border Transfers",desc:"Lawful international data transfers",objs:["SCC management","BCR programme","Transfer impact assessments","Adequacy tracking"],status:"Planned"},
  ],
  cgo:[
    {name:"Enterprise GRC Framework",desc:"Unified GRC across all five governance domains",objs:["COBIT 5 process model","Risk appetite statement","Cross-domain RACI","Board governance structure"],status:"Active"},
    {name:"Enterprise Risk Management",desc:"ISO 31000 / COSO ERM enterprise risk oversight",objs:["Enterprise risk register","Risk scoring methodology","Risk treatment coordination","Residual risk reporting"],status:"Active"},
    {name:"Regulatory Change Management",desc:"Monitor and operationalise regulatory changes",objs:["EU AI Act enforcement tracking","GDPR update monitoring","Cross-role impact assessment","Remediation coordination"],status:"Active"},
    {name:"Third-Party Governance",desc:"Enterprise-wide vendor and partner risk programme",objs:["Vendor tiering framework","Due diligence standards","Ongoing monitoring","Contract governance"],status:"Building"},
    {name:"Board & Executive Reporting",desc:"Consolidated governance reporting to the Board",objs:["Quarterly board governance pack","Enterprise risk dashboard","Cross-role compliance score","Escalation governance"],status:"Active"},
  ],
};

/* ─────────────────────────────────────────────
   TEMPLATES — from ISO 42001 Kit V3.0 & CAIO Kit
───────────────────────────────────────────── */
/* TEMPLATES — VerisZone Template Library
   Rich schema per Saif's spec: status, owner, version, review cycle,
   linked clauses/controls/risks/evidence, exports, AI customisation.
   Categories: Policy | Procedure | Plan | Register | Checklist | Agenda | Report | Assessment
   Status:     Draft | In Review | Approved | Expired | Needs Update          */
const TEMPLATES = [
  /* ═══════ ISO 27001 — Core policies (28 from Saif's spec) ═══════ */
  {id:"t_isp",      name:"Information Security Policy",            category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 5.2","ISO 27001 § A.5.1"], icon:"📋", status:"Approved",     owner:"M. Khan (CISO)",            version:"v2.3", lastReviewed:"2026-03-15", reviewFrequency:"Annual",     nextReview:"2027-03-15", linkedClauses:["5.2","A.5.1"],            linkedControls:["A.5.1","A.5.2"],                  linkedRisks:4, linkedEvidence:6, exports:["Word","PDF"],       aiCustomization:true,  tags:["CISO","All"],              desc:"Top-level information security policy stating management's commitment to information security. Defines scope, objectives, principles, and roles. Mandatory under ISO 27001 § 5.2."},
  {id:"t_acp",      name:"Access Control Policy",                  category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.15","A.5.16","A.5.17","A.5.18"], icon:"🔐", status:"Approved",     owner:"M. Khan (CISO)",            version:"v1.8", lastReviewed:"2026-02-10", reviewFrequency:"Annual",     nextReview:"2027-02-10", linkedClauses:["A.5.15","A.5.16","A.5.17","A.5.18"], linkedControls:["A.5.15","A.5.16","A.5.17","A.5.18","A.8.2","A.8.3"], linkedRisks:5, linkedEvidence:9, exports:["Word","PDF"],aiCustomization:true,  tags:["CISO","CIO","All"],        desc:"Rules for granting, reviewing, and revoking access to information assets. Covers identity lifecycle, privileged access, segregation of duties, MFA, RBAC."},
  {id:"t_aup",      name:"Acceptable Use Policy",                  category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.10","A.6.3"],              icon:"📜", status:"Needs Update", owner:"M. Khan (CISO)",            version:"v1.2", lastReviewed:"2025-08-22", reviewFrequency:"Annual",     nextReview:"2026-08-22", linkedClauses:["A.5.10","A.6.3"],         linkedControls:["A.5.10","A.6.3","A.6.4"],         linkedRisks:2, linkedEvidence:4, exports:["Word","PDF"],       aiCustomization:true,  tags:["CISO","HR","All"],         desc:"Defines acceptable use of organisational IT assets, email, internet, removable media. References disciplinary process for violations."},
  {id:"t_amp",      name:"Asset Management Policy",                category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.9","A.5.10","A.5.11"],     icon:"📦", status:"Approved",     owner:"D. Lee (Head of IT)",       version:"v2.0", lastReviewed:"2026-01-20", reviewFrequency:"Annual",     nextReview:"2027-01-20", linkedClauses:["A.5.9","A.5.10","A.5.11"], linkedControls:["A.5.9","A.5.10","A.5.11","A.7.10"], linkedRisks:3, linkedEvidence:5, exports:["Word","PDF"],     aiCustomization:true,  tags:["CIO","CISO"],              desc:"Inventory, classification, labelling, handling, and disposal of information assets. Defines asset register ownership and review cycles."},
  {id:"t_rmp",      name:"Risk Management Policy",                 category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 6.1","§ 8.2","§ 8.3"],         icon:"⚠", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v2.1", lastReviewed:"2026-03-01", reviewFrequency:"Annual",     nextReview:"2027-03-01", linkedClauses:["6.1","8.2","8.3"],        linkedControls:["A.5.4","A.5.36"],                 linkedRisks:0, linkedEvidence:7, exports:["Word","PDF"],       aiCustomization:true,  tags:["CISO","CAIO","CGO"],       desc:"Risk assessment methodology, criteria, scoring scales, treatment options. Defines risk owner accountability and tolerance thresholds."},
  {id:"t_imp",      name:"Incident Management Policy",             category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.24","A.5.25","A.5.26","A.5.27","A.5.28"], icon:"🚨", status:"Approved",     owner:"M. Khan (CISO)",            version:"v3.0", lastReviewed:"2026-04-05", reviewFrequency:"Annual",     nextReview:"2027-04-05", linkedClauses:["A.5.24","A.5.25","A.5.26"], linkedControls:["A.5.24","A.5.25","A.5.26","A.5.27","A.5.28"], linkedRisks:6, linkedEvidence:11, exports:["Word","PDF"], aiCustomization:true,  tags:["CISO","All"],          desc:"Incident lifecycle: detection, reporting, triage, response, recovery, lessons learned. Defines escalation paths, severity levels, notification SLAs."},
  {id:"t_bcp",      name:"Business Continuity Policy",             category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.29","A.5.30","A.8.13","A.8.14"], icon:"🛟", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.5", lastReviewed:"2026-01-12", reviewFrequency:"Annual",     nextReview:"2027-01-12", linkedClauses:["A.5.29","A.5.30","A.8.13","A.8.14"], linkedControls:["A.5.29","A.5.30","A.8.13","A.8.14"], linkedRisks:4, linkedEvidence:8, exports:["Word","PDF"], aiCustomization:false, tags:["CGO","CISO","CIO"],        desc:"Business continuity and disaster recovery commitments. RTO/RPO targets, BIA methodology, test schedule, plan ownership."},
  {id:"t_ssp",      name:"Supplier Security Policy",               category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.19","A.5.20","A.5.21","A.5.22","A.5.23"], icon:"🔗", status:"In Review",    owner:"M. Khan (CISO)",            version:"v1.3", lastReviewed:"2025-11-08", reviewFrequency:"Annual",     nextReview:"2026-11-08", linkedClauses:["A.5.19","A.5.20","A.5.21"], linkedControls:["A.5.19","A.5.20","A.5.21","A.5.22","A.5.23"], linkedRisks:7, linkedEvidence:5, exports:["Word","PDF"], aiCustomization:true,  tags:["CISO","Procurement"],    desc:"Security requirements for suppliers and third-parties: due diligence, contractual clauses, monitoring, exit. Covers ICT supply chain."},
  {id:"t_csp",      name:"Cloud Security Policy",                  category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.23","A.8.30"],             icon:"☁", status:"Approved",     owner:"D. Lee (Head of IT)",       version:"v2.4", lastReviewed:"2026-02-28", reviewFrequency:"Annual",     nextReview:"2027-02-28", linkedClauses:["A.5.23","A.8.30"],        linkedControls:["A.5.23","A.8.30","A.8.31"],       linkedRisks:5, linkedEvidence:9, exports:["Word","PDF"],       aiCustomization:true,  tags:["CIO","CISO"],              desc:"Approved cloud providers, shared responsibility, data residency, encryption, identity federation, exit strategy."},
  {id:"t_bkp",      name:"Backup Policy",                          category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.8.13"],                       icon:"💾", status:"Approved",     owner:"D. Lee (Head of IT)",       version:"v1.6", lastReviewed:"2026-03-18", reviewFrequency:"Annual",     nextReview:"2027-03-18", linkedClauses:["A.8.13"],                 linkedControls:["A.8.13","A.5.30"],                linkedRisks:3, linkedEvidence:6, exports:["Word","PDF"],       aiCustomization:false, tags:["CIO","CISO"],              desc:"Backup scope, frequency, retention, encryption, off-site storage, restoration testing. Aligns to RPO from BCP."},
  {id:"t_crp",      name:"Cryptography Policy",                    category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.8.24"],                       icon:"🔒", status:"Approved",     owner:"M. Khan (CISO)",            version:"v1.4", lastReviewed:"2026-02-05", reviewFrequency:"Annual",     nextReview:"2027-02-05", linkedClauses:["A.8.24"],                 linkedControls:["A.8.24","A.5.17"],                linkedRisks:4, linkedEvidence:7, exports:["Word","PDF"],       aiCustomization:false, tags:["CISO","CIO"],              desc:"Approved cryptographic algorithms, key lengths, key management lifecycle, certificate authorities, quantum-readiness statement."},
  {id:"t_dcp",      name:"Data Classification Policy",             category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.12","A.5.13"],             icon:"🏷", status:"Approved",     owner:"R. Patel (CDPO)",           version:"v2.0", lastReviewed:"2026-04-01", reviewFrequency:"Annual",     nextReview:"2027-04-01", linkedClauses:["A.5.12","A.5.13"],        linkedControls:["A.5.12","A.5.13","A.5.14"],       linkedRisks:5, linkedEvidence:8, exports:["Word","PDF"],       aiCustomization:true,  tags:["CDPO","CISO","All"],       desc:"Public / Internal / Confidential / Restricted scheme with handling rules per class. Mapped to data protection requirements."},
  {id:"t_chp",      name:"Change Management Policy",               category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.8.32"],                       icon:"🔄", status:"Approved",     owner:"D. Lee (Head of IT)",       version:"v1.7", lastReviewed:"2026-01-25", reviewFrequency:"Annual",     nextReview:"2027-01-25", linkedClauses:["A.8.32"],                 linkedControls:["A.8.32","A.8.31"],                linkedRisks:3, linkedEvidence:5, exports:["Word","PDF"],       aiCustomization:false, tags:["CIO","CISO"],              desc:"Change control board, request workflow, impact assessment, rollback planning, emergency change handling, post-change review."},
  {id:"t_sdp",      name:"Secure Development Policy",              category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.8.25","A.8.26","A.8.27","A.8.28"], icon:"⚙", status:"In Review",    owner:"K. Nakamura (CTO)",         version:"v1.2", lastReviewed:"2025-10-15", reviewFrequency:"Annual",     nextReview:"2026-10-15", linkedClauses:["A.8.25","A.8.26"],        linkedControls:["A.8.25","A.8.26","A.8.27","A.8.28","A.8.29"], linkedRisks:6, linkedEvidence:9, exports:["Word","PDF"], aiCustomization:true,  tags:["CIO","Engineering"],     desc:"SDLC controls: threat modelling, secure coding, code review, dependency scanning, vulnerability remediation SLAs, secrets handling."},
  {id:"t_hrs",      name:"HR Security Policy",                     category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.6.1","A.6.2","A.6.3","A.6.4","A.6.5","A.6.6"], icon:"👥", status:"Approved",     owner:"J. Brooks (Head of People)", version:"v1.9", lastReviewed:"2026-02-14", reviewFrequency:"Annual",     nextReview:"2027-02-14", linkedClauses:["A.6.1","A.6.2","A.6.3"], linkedControls:["A.6.1","A.6.2","A.6.3","A.6.4","A.6.5","A.6.6"], linkedRisks:4, linkedEvidence:7, exports:["Word","PDF"], aiCustomization:true,  tags:["HR","CISO"],             desc:"Joiner-mover-leaver process, screening, terms and conditions, training, awareness, disciplinary, NDA obligations."},
  {id:"t_rwp",      name:"Remote Working Policy",                  category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.6.7","A.7.9"],               icon:"🏠", status:"Approved",     owner:"M. Khan (CISO)",            version:"v2.1", lastReviewed:"2026-03-10", reviewFrequency:"Annual",     nextReview:"2027-03-10", linkedClauses:["A.6.7","A.7.9"],          linkedControls:["A.6.7","A.7.9"],                  linkedRisks:3, linkedEvidence:4, exports:["Word","PDF"],       aiCustomization:true,  tags:["HR","CISO","All"],         desc:"Equipment, network, family/visitor access, off-site working, BYOD, secure transit, monitoring. Includes acceptable home-office setup."},

  /* ═══════ ISO 27001 — Operational templates ═══════ */
  {id:"t_iac",      name:"Internal Audit Checklist",               category:"Checklist",  framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 9.2"],                          icon:"☑", status:"Approved",     owner:"Internal Audit",            version:"v1.4", lastReviewed:"2026-02-20", reviewFrequency:"Bi-annual",  nextReview:"2026-08-20", linkedClauses:["9.2"],                    linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Word","Excel"],     aiCustomization:true,  tags:["Audit","CGO"],             desc:"Walkthrough checklist for internal ISO 27001 audits. Clause-by-clause coverage with evidence prompts and finding-classification rules."},
  {id:"t_mra",      name:"Management Review Meeting Agenda",       category:"Agenda",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 9.3"],                          icon:"📅", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.2", lastReviewed:"2026-01-15", reviewFrequency:"Quarterly",  nextReview:"2026-04-15", linkedClauses:["9.3"],                    linkedControls:[],                                  linkedRisks:0, linkedEvidence:3, exports:["Word","PDF"],       aiCustomization:true,  tags:["CGO","Exec"],              desc:"Standing agenda covering all § 9.3.2 inputs: audit results, KPI performance, risks, opportunities, customer feedback, resource needs."},
  {id:"t_soa27",    name:"Statement of Applicability (ISO 27001)", category:"Register",   framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 6.1.3","Annex A"],             icon:"📋", status:"In Review",    owner:"M. Khan (CISO)",            version:"v0.9", lastReviewed:"2026-04-10", reviewFrequency:"Annual",     nextReview:"2027-04-10", linkedClauses:["6.1.3"],                  linkedControls:["all-93-Annex-A"],                 linkedRisks:24, linkedEvidence:42, exports:["Excel","Word","PDF"], aiCustomization:true, tags:["CISO","CGO","Audit"],   desc:"All 93 Annex A controls with Applicable Y/N, implementation status, justification, evidence reference. Living document maintained continuously."},
  {id:"t_rat",      name:"Risk Assessment Template",               category:"Assessment", framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 6.1.2","§ 8.2"],               icon:"⚠", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.5", lastReviewed:"2026-03-08", reviewFrequency:"Bi-annual",  nextReview:"2026-09-08", linkedClauses:["6.1.2","8.2"],            linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel","Word"],     aiCustomization:true,  tags:["CISO","CGO","CAIO"],       desc:"Standardised risk assessment worksheet. Asset → threat → vulnerability → likelihood × impact → score → owner → treatment option."},
  {id:"t_rtp",      name:"Risk Treatment Plan",                    category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 6.1.3","§ 8.3"],               icon:"◆", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.3", lastReviewed:"2026-03-22", reviewFrequency:"Annual",     nextReview:"2027-03-22", linkedClauses:["6.1.3","8.3"],            linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel","Word","PDF"], aiCustomization:true, tags:["CISO","CGO","CAIO"],   desc:"For each risk above tolerance: treatment option (mitigate/transfer/accept/avoid), specific actions, owner, due date, residual risk, sign-off."},
  {id:"t_cap",      name:"Corrective Action Plan",                 category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 10.1","§ 10.2"],               icon:"🔧", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.1", lastReviewed:"2026-02-12", reviewFrequency:"Annual",     nextReview:"2027-02-12", linkedClauses:["10.1","10.2"],            linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Word","Excel"],     aiCustomization:true,  tags:["CGO","Audit"],             desc:"Non-conformity → root cause analysis (5 whys) → action → verification → effectiveness check. Owner, due date, evidence."},
  {id:"t_evchk",    name:"Evidence Checklist",                     category:"Checklist",  framework:"Multi-framework", frameworkRefs:["ISO 27001 Annex A","ISO 42001"],          icon:"📁", status:"Approved",     owner:"Internal Audit",            version:"v1.0", lastReviewed:"2026-04-01", reviewFrequency:"Quarterly",  nextReview:"2026-07-01", linkedClauses:[],                          linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel","PDF"],      aiCustomization:true,  tags:["Audit","All"],             desc:"Master evidence inventory by control. Expected artefact, current artefact, owner, expiry, control mapping, gap status."},
  {id:"t_ack",      name:"Audit Readiness Checklist",              category:"Checklist",  framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 9.2"],                          icon:"✅", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.3", lastReviewed:"2026-04-08", reviewFrequency:"Quarterly",  nextReview:"2026-07-08", linkedClauses:["9.2"],                    linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CGO","Audit"],             desc:"Pre-audit readiness: SOA status, evidence completeness, policy currency, control test results, NCR closure, management review currency."},
  {id:"t_brp",      name:"Board Reporting Pack",                   category:"Report",     framework:"Multi-framework", frameworkRefs:["ISO 27001","ISO 42001","GDPR"],           icon:"📊", status:"Approved",     owner:"H. Williams (CGO)",         version:"v2.0", lastReviewed:"2026-04-15", reviewFrequency:"Quarterly",  nextReview:"2026-07-15", linkedClauses:[],                          linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["PDF","PowerPoint"], aiCustomization:true,  tags:["CGO","Exec","Board"],      desc:"One-pack quarterly board summary: posture by framework, top risks, NCRs, AI use-case pipeline, regulatory updates, recommended actions."},
  {id:"t_vrq",      name:"Vendor Risk Questionnaire",              category:"Assessment", framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.19","A.5.21","A.5.22"],     icon:"🔗", status:"Approved",     owner:"M. Khan (CISO)",            version:"v1.2", lastReviewed:"2026-01-30", reviewFrequency:"Annual",     nextReview:"2027-01-30", linkedClauses:["A.5.19","A.5.21","A.5.22"], linkedControls:["A.5.19","A.5.20","A.5.21","A.5.22"], linkedRisks:0, linkedEvidence:0, exports:["Word","Excel"], aiCustomization:true,  tags:["CISO","Procurement"],   desc:"Tiered questionnaire covering security posture, certifications, data handling, sub-processors, incident history. Tier 1/2/3 by criticality."},

  /* ═══════ AI Governance & Privacy (Saif's last two + cross-pollinate) ═══════ */
  {id:"t_aigov",    name:"AI Governance Policy",                   category:"Policy",     framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 5.2","§ A.2"],                 icon:"🤖", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.4", lastReviewed:"2026-03-25", reviewFrequency:"Annual",     nextReview:"2027-03-25", linkedClauses:["5.2","A.2.2","A.2.3"],    linkedControls:["A.2.2","A.2.3","A.2.4"],          linkedRisks:8, linkedEvidence:12, exports:["Word","PDF"], aiCustomization:true,  tags:["CAIO","All"],              desc:"Top-level AI governance policy. Sets AI principles, prohibited uses, HITL requirements, role accountability for AI systems. Required for ISO 42001 certification."},
  {id:"t_pgp",      name:"Privacy Governance Policy",              category:"Policy",     framework:"GDPR/DPDP",     frameworkRefs:["GDPR Art.24","Art.32","Art.35"],            icon:"🛡", status:"Approved",     owner:"R. Patel (CDPO)",           version:"v2.1", lastReviewed:"2026-02-28", reviewFrequency:"Annual",     nextReview:"2027-02-28", linkedClauses:["GDPR Art.24","Art.32"],    linkedControls:["A.5.34","ISO 27701"],            linkedRisks:9, linkedEvidence:14, exports:["Word","PDF"], aiCustomization:true,  tags:["CDPO","Legal","All"],      desc:"Privacy-by-design principles, lawful basis governance, data subject rights workflow, DPIA triggers, supervisory authority engagement."},

  /* ═══════ Toolkit-derived (from uploaded ISO 27001:2022 kit) ═══════ */
  {id:"t_gap",      name:"Gap Assessment Plan",                    category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 (full)"],                          icon:"📐", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.0", lastReviewed:"2026-01-08", reviewFrequency:"Annual",     nextReview:"2027-01-08", linkedClauses:[],                          linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel","Word"],     aiCustomization:true,  tags:["CGO","Project"],           desc:"From the ISO 27001:2022 toolkit. Structured gap assessment between current state and ISO 27001 requirements clause-by-clause."},
  {id:"t_scope",    name:"ISMS Scope Statement",                   category:"Policy",     framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 4.3"],                           icon:"🎯", status:"In Review",    owner:"H. Williams (CGO)",         version:"v0.7", lastReviewed:"2026-04-02", reviewFrequency:"Annual",     nextReview:"2027-04-02", linkedClauses:["4.3"],                     linkedControls:[],                                  linkedRisks:0, linkedEvidence:2, exports:["Word","PDF"],       aiCustomization:true,  tags:["CGO","CISO","Exec"],       desc:"Defines ISMS scope: organisational, geographical, technological boundaries. Exclusions and justification. Required first artefact for certification."},
  {id:"t_dr",       name:"Disaster Recovery Plan",                 category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.30","A.8.14"],              icon:"🔥", status:"Approved",     owner:"D. Lee (Head of IT)",       version:"v1.4", lastReviewed:"2026-02-22", reviewFrequency:"Annual",     nextReview:"2027-02-22", linkedClauses:["A.5.30","A.8.14"],         linkedControls:["A.5.30","A.8.14"],                linkedRisks:5, linkedEvidence:8, exports:["Word","PDF"],       aiCustomization:false, tags:["CIO","CISO","BCP"],        desc:"Technical recovery procedures: order of restoration, recovery teams, communication tree, success criteria, post-event reporting."},
  {id:"t_atp",      name:"Awareness and Training Plan",            category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 7.2","§ 7.3","A.6.3"],          icon:"🎓", status:"Approved",     owner:"J. Brooks (Head of People)", version:"v1.6", lastReviewed:"2026-01-18", reviewFrequency:"Annual",     nextReview:"2027-01-18", linkedClauses:["7.2","7.3","A.6.3"],       linkedControls:["A.6.3"],                          linkedRisks:2, linkedEvidence:6, exports:["Excel","Word"],     aiCustomization:true,  tags:["HR","CISO"],               desc:"Annual security awareness curriculum: onboarding, role-based training, phishing simulations, completion tracking, effectiveness metrics."},
  {id:"t_iap",      name:"Internal Audit Plan",                    category:"Plan",       framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 9.2"],                           icon:"🔍", status:"Approved",     owner:"Internal Audit",            version:"v1.2", lastReviewed:"2026-02-08", reviewFrequency:"Annual",     nextReview:"2027-02-08", linkedClauses:["9.2"],                     linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel","Word"],     aiCustomization:true,  tags:["Audit","CGO"],             desc:"12-month internal audit schedule covering all ISMS clauses and Annex A controls. Auditor independence, sampling strategy, reporting cadence."},
  {id:"t_assetreg", name:"Asset Inventory",                        category:"Register",   framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § A.5.9"],                         icon:"📦", status:"In Review",    owner:"D. Lee (Head of IT)",       version:"v3.2", lastReviewed:"2026-04-03", reviewFrequency:"Quarterly",  nextReview:"2026-07-03", linkedClauses:["A.5.9"],                   linkedControls:["A.5.9","A.5.10","A.5.11"],        linkedRisks:0, linkedEvidence:0, exports:["Excel"],            aiCustomization:false, tags:["CIO","CISO"],              desc:"Living asset register: ID, type, owner, classification, location, criticality, business process supported. From toolkit § 5."},
  {id:"t_rrr",      name:"Risk Register",                          category:"Register",   framework:"ISO 27001:2022", frameworkRefs:["ISO 27001 § 6.1.2","§ 8.2"],                icon:"⬟", status:"In Review",    owner:"S. Ali (CAIO)",             version:"v4.1", lastReviewed:"2026-04-11", reviewFrequency:"Monthly",    nextReview:"2026-05-11", linkedClauses:["6.1.2","8.2"],             linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Excel"],            aiCustomization:true,  tags:["CISO","CGO","All"],        desc:"Master risk register: risk ID, description, owner, likelihood, impact, score, treatment option, residual risk, due date. From toolkit § 3."},

  /* ═══════ AI Governance (migrated from existing — full schema) ═══════ */
  {id:"t_airr",     name:"AI Risk Register",                       category:"Register",   framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 8.2","ISO 23894"],              icon:"⬟", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v2.0", lastReviewed:"2026-03-30", reviewFrequency:"Monthly",    nextReview:"2026-04-30", linkedClauses:["8.2"],                     linkedControls:["A.5.4","A.5.5"],                  linkedRisks:0, linkedEvidence:0, exports:["Excel"],            aiCustomization:true,  tags:["CAIO","CISO","Risk"],      desc:"AI-specific risk register with L×S scoring (1-5 scale). Risk Score >12 = High/Critical. Includes auditor cheat sheet: Static Register, Ghost Control, and Missing Treatment failures."},
  {id:"t_airtp",    name:"AI Risk Treatment Plan",                 category:"Plan",       framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 8.3","Annex A"],                icon:"◆", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.5", lastReviewed:"2026-03-20", reviewFrequency:"Quarterly",  nextReview:"2026-06-20", linkedClauses:["8.3"],                     linkedControls:["A.4.5","A.6.2"],                  linkedRisks:0, linkedEvidence:0, exports:["Excel","Word"],     aiCustomization:true,  tags:["CAIO","Risk"],             desc:"Treatment plan for all AI risks scored >12. Four options: Avoid, Reduce, Transfer, Accept. Resource requirements, budget allocation, quarterly timeline."},
  {id:"t_aiia",     name:"AI System Impact Assessment (AIIA)",     category:"Assessment", framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § A.5","EU AI Act Art.27"],       icon:"◭", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.3", lastReviewed:"2026-02-25", reviewFrequency:"Per system", nextReview:"On change",   linkedClauses:["A.5.2","A.5.3"],           linkedControls:["A.5.2","A.5.3","A.5.4"],          linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CAIO","Legal","All"],      desc:"6-phase AIIA procedure per ISO 42001 § A.5: Characterise → Stakeholders → Identify → Evaluate → Mitigate → Conclude. Covers FRIA (Fundamental Rights Impact Assessment)."},
  {id:"t_mc",       name:"AI Model Card",                          category:"Assessment", framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 8.4","EU AI Act Art.13"],       icon:"◈", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.2", lastReviewed:"2026-03-12", reviewFrequency:"Per system", nextReview:"On change",   linkedClauses:["8.4"],                     linkedControls:["A.6.2","A.7.4"],                  linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CAIO","Engineering"],      desc:"Standardised model card: Intended Use, Architecture, Training Data, Performance Metrics, Bias Evaluation, Limitations. AI populates from system metadata."},
  {id:"t_ncr",      name:"Non-Conformity & Corrective Action Report", category:"Report", framework:"Multi-framework", frameworkRefs:["ISO 27001 § 10.1","ISO 42001 § 10.1"],     icon:"⚠", status:"Approved",     owner:"H. Williams (CGO)",         version:"v1.4", lastReviewed:"2026-04-05", reviewFrequency:"Per event",  nextReview:"On occurrence", linkedClauses:["10.1"],                    linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CGO","Audit","All"],       desc:"Structured NCR: Issue Identification → Immediate Correction → Root Cause Analysis (5 Whys) → Corrective Action Plan → Verification."},
  {id:"t_ks",       name:"AI Kill Switch & Emergency Fallback Procedure", category:"Procedure", framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 8.5","EU AI Act Art.9"], icon:"🔴", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.0", lastReviewed:"2026-01-22", reviewFrequency:"Bi-annual",  nextReview:"2026-07-22", linkedClauses:["8.5"],                     linkedControls:["A.6.2","A.9.2"],                  linkedRisks:6, linkedEvidence:3, exports:["Word","PDF"],       aiCustomization:false, tags:["CAIO","CISO"],             desc:"Emergency shutdown procedure: Authority, Red Lines, Technical Steps, Fallback to manual process, Post-incident review. Covers GenAI, automated decisions, autonomous agents."},
  {id:"t_soa42",    name:"Statement of Applicability (ISO 42001)", category:"Register",   framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § 8.3","Annex A"],                icon:"☑", status:"Approved",     owner:"S. Ali (CAIO)",             version:"v1.2", lastReviewed:"2026-04-09", reviewFrequency:"Annual",     nextReview:"2027-04-09", linkedClauses:["8.3"],                     linkedControls:["all-39-Annex-A"],                 linkedRisks:0, linkedEvidence:0, exports:["Excel","Word","PDF"], aiCustomization:true, tags:["CAIO","Audit"],         desc:"All 39 ISO 42001 Annex A controls with Applicable Y/N, implementation status, justification, evidence reference."},
  {id:"t_bias",     name:"AI Bias Detection & Mitigation Procedure", category:"Procedure", framework:"ISO 42001:2023", frameworkRefs:["ISO 42001 § A.7","EU AI Act Art.10"],     icon:"⚖", status:"In Review",    owner:"S. Ali (CAIO)",             version:"v0.8", lastReviewed:"2026-03-28", reviewFrequency:"Annual",     nextReview:"2027-03-28", linkedClauses:["A.7.3","A.7.4"],           linkedControls:["A.7.3","A.7.4"],                  linkedRisks:5, linkedEvidence:4, exports:["Word","PDF"],       aiCustomization:true,  tags:["CAIO","Legal"],            desc:"Methodology for identifying, measuring, and mitigating algorithmic bias. Protected Attributes, Disparate Impact testing, fairness thresholds."},

  /* ═══════ Privacy ═══════ */
  {id:"t_dpia",     name:"GDPR Article 35 DPIA",                    category:"Assessment", framework:"GDPR",          frameworkRefs:["GDPR Art.35"],                              icon:"🔒", status:"Approved",     owner:"R. Patel (CDPO)",           version:"v2.0", lastReviewed:"2026-02-18", reviewFrequency:"Per activity", nextReview:"On change", linkedClauses:[],                          linkedControls:["A.5.34"],                         linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CDPO","Legal"],            desc:"DPIA with all mandatory GDPR Art.35(7) elements. AI generates initial risk analysis from processing activity description. Includes supervisory-authority submission checklist."},
  {id:"t_tia",      name:"Transfer Impact Assessment (TIA)",        category:"Assessment", framework:"GDPR",          frameworkRefs:["GDPR Art.46","Schrems II"],                 icon:"🌍", status:"Approved",     owner:"R. Patel (CDPO)",           version:"v1.5", lastReviewed:"2026-03-05", reviewFrequency:"Annual",     nextReview:"2027-03-05", linkedClauses:[],                          linkedControls:[],                                  linkedRisks:0, linkedEvidence:0, exports:["Word","PDF"],       aiCustomization:true,  tags:["CDPO","Legal"],            desc:"Structured TIA for international data transfers post-Schrems II. Legal basis, destination country adequacy, supplementary measures, SCCs, vendor-specific risk."},
];
/* ─────────────────────────────────────────────
   AI MODEL REGISTRY DATA (from CAIO Kit)
───────────────────────────────────────────── */
const MODEL_REGISTRY = [
  {id:"m1",name:"LLM v2 (Customer Support)",type:"Generative AI / LLM",status:"Awaiting Approval",risk:"High",euAiAct:"High-Risk",owner:"CAIO",dept:"Product",vendor:"Anthropic API",deployed:"Pending",accuracy:"95.2% fairness",drift:"Not deployed",lastAudit:"May 2026",modelCard:true,aia:true,biasTest:true,killSwitch:true,dataProvenance:false,transparency:80,clause:"EU AI Act Art.6 / ISO 42001 C.8.4"},
  {id:"m2",name:"Credit Scoring AI",type:"Predictive / Classification",status:"In Production",risk:"Critical",euAiAct:"High-Risk",owner:"CISO",dept:"Finance",vendor:"Internal",deployed:"Mar 2025",accuracy:"88.4%",drift:"Low",lastAudit:"Feb 2026",modelCard:false,aia:true,biasTest:false,killSwitch:true,dataProvenance:true,transparency:45,clause:"EU AI Act Art.6 / GDPR Art.22"},
  {id:"m3",name:"HR Recruitment AI",type:"Classification / Ranking",status:"Suspended",risk:"High",euAiAct:"High-Risk",owner:"HR / CAIO",dept:"Human Resources",vendor:"HireRight AI",deployed:"Jan 2025",accuracy:"Not tested",drift:"Unknown",lastAudit:"Apr 2026",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Annex III / ISO 42001 C.8.4"},
  {id:"m4",name:"Fraud Detection Model",type:"Anomaly Detection",status:"In Production",risk:"Medium",euAiAct:"Limited Risk",owner:"CISO",dept:"Security",vendor:"Internal",deployed:"Jun 2024",accuracy:"96.1%",drift:"Medium",lastAudit:"Jan 2026",modelCard:true,aia:true,biasTest:true,killSwitch:true,dataProvenance:false,transparency:72,clause:"ISO 42001 C.7.2 / GDPR Art.5"},
  {id:"m5",name:"Document Summarisation AI",type:"Generative AI / NLP",status:"In Production",risk:"Medium",euAiAct:"Minimal Risk",owner:"Product",dept:"Operations",vendor:"OpenAI API",deployed:"Sep 2024",accuracy:"91.3%",drift:"Low",lastAudit:"Mar 2026",modelCard:true,aia:false,biasTest:false,killSwitch:false,dataProvenance:true,transparency:85,clause:"ISO 42001 C.9.1"},
  {id:"m6",name:"Predictive Maintenance AI",type:"Predictive / Regression",status:"In Production",risk:"Medium",euAiAct:"High-Risk",owner:"Engineering",dept:"Operations",vendor:"Internal",deployed:"Nov 2024",accuracy:"89.7%",drift:"Low",lastAudit:"Apr 2026",modelCard:true,aia:false,biasTest:false,killSwitch:false,dataProvenance:true,transparency:60,clause:"EU AI Act Annex III / ISO 42001 C.8.5"},
  {id:"m7",name:"RecoEngine v3",type:"Recommendation System",status:"Unclassified",risk:"Unknown",euAiAct:"Unclassified",owner:"Product",dept:"Marketing",vendor:"Internal",deployed:"Feb 2025",accuracy:"Unknown",drift:"Unknown",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Art.6 — Classification Pending"},
  {id:"m8",name:"SentimentAI",type:"NLP / Classification",status:"Unclassified",risk:"Unknown",euAiAct:"Unclassified",owner:"Product",dept:"Marketing",vendor:"Internal",deployed:"Mar 2025",accuracy:"Unknown",drift:"Unknown",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Art.6 — Classification Pending"},
];

/* ─────────────────────────────────────────────
   GOVERNANCE MATURITY DATA (from CAIO Kit Part 1)
───────────────────────────────────────────── */
const MATURITY_DOMAINS = [
  {domain:"Legal & Regulatory Compliance",score:72,target:90,desc:"Alignment with EU AI Act, ISO 42001, GDPR Art.22. 3 high-risk systems classified. 3 unclassified."},
  {domain:"Algorithmic Accountability",score:58,target:85,desc:"Bias testing complete on 2/8 high-impact systems. Model cards 7/17. Fairness score avg 89.4%."},
  {domain:"Data Sovereignty & Governance",score:65,target:80,desc:"Training data provenance documented for 76% of models. 3 datasets with PII not yet anonymised."},
  {domain:"Human Oversight & HITL",score:84,target:95,desc:"HITL override rate 3.1%. All critical decisions gated. Kill switch deployed on 4/8 high-risk systems."},
  {domain:"Transparency & Explainability",score:61,target:85,desc:"Transparency documentation 80% complete for LLM v2. 7 model cards complete. Art.13 gaps remain."},
  {domain:"Incident Response & Recovery",score:77,target:90,desc:"2 AI incidents in Q1. Mean response time 3.2 hrs vs 4hr target. Post-mortems completed."},
  {domain:"Ethics & Fairness",score:68,target:85,desc:"Ethics committee reviews 94% complete. AI Ethics Impact Assessment not yet run for 3 systems."},
  {domain:"Strategic AI Leadership",score:80,target:90,desc:"CAIO role formally established. RACI defined. Board reporting cadence active. 5-year AI strategy approved."},
];

/* ─────────────────────────────────────────────
   USE CASE PIPELINE (from CAIO Kit Part 2)
───────────────────────────────────────────── */
const USE_CASES = [
  {id:"uc1",name:"AI-Powered Contract Review",dept:"Legal",system:"Claude 3.5 Sonnet",dataClass:"Confidential",decisionImpact:"Advisory",affectedUsers:24,stage:"POC",impact:9,feasibility:7,risk:4,score:86,owner:"Legal + Engineering",eta:"Q3 2026",status:"Active",pipelineStage:"Under Review",tier:"Limited",iso42001Controls:["6.1.2","8.2","8.4","9.2"],submittedAt:"2026-04-12",submittedBy:"Priya Shah (Legal Director)",desc:"LLM-based contract analysis to extract obligations, risk clauses, and renewal dates. Estimated 60% reduction in review time.",decisions:[
    {role:"caio",decision:"approve",reasoning:"AI risk profile acceptable. Advisory-only with mandatory legal sign-off on every output. ISO 42001 § 8.2 evidence captured.",signer:"Saif Ali (CAIO)",timestamp:"2026-04-15 10:24"},
    {role:"ciso",decision:"approve_with_conditions",reasoning:"Confidential client data requires data residency in EU. Anthropic EU endpoint mandated. No model fine-tuning on client docs.",signer:"M. Khan (CISO)",timestamp:"2026-04-15 14:50"},
    {role:"cdpo",decision:"pending",reasoning:"",signer:"",timestamp:""},
  ]},
  {id:"uc2",name:"Predictive Churn Model",dept:"Sales",system:"Internal XGBoost",dataClass:"Internal",decisionImpact:"Advisory",affectedUsers:8,stage:"Pilot",impact:8,feasibility:8,risk:3,score:90,owner:"Data Science + Sales",eta:"Q2 2026",status:"Active",pipelineStage:"Approved",tier:"Limited",iso42001Controls:["6.1.2","8.2","8.5"],submittedAt:"2026-02-08",submittedBy:"Alex Mendez (Head of Sales)",desc:"ML model predicting customer churn 90 days in advance. Pilot on 5k accounts showing 73% accuracy vs 45% baseline.",decisions:[
    {role:"caio",decision:"approve",reasoning:"Internal-only model on commercial data. Acceptable AI risk.",signer:"Saif Ali (CAIO)",timestamp:"2026-02-14 09:10"},
    {role:"ciso",decision:"approve",reasoning:"No external data exfiltration. Model hosted on internal infra.",signer:"M. Khan (CISO)",timestamp:"2026-02-14 11:32"},
    {role:"cdpo",decision:"approve",reasoning:"PII pseudonymised in training set. GDPR Article 22 advisory carve-out applies.",signer:"R. Patel (CDPO)",timestamp:"2026-02-15 08:45"},
  ]},
  {id:"uc3",name:"AI Invoice Processing",dept:"Finance",system:"Microsoft Azure AI Document Intelligence",dataClass:"Internal",decisionImpact:"Automated",affectedUsers:6,stage:"Scale",impact:7,feasibility:9,risk:2,score:92,owner:"Finance + IT",eta:"Live",status:"Complete",pipelineStage:"Production",tier:"Minimal",iso42001Controls:["6.1.2","8.2","8.4","9.4"],submittedAt:"2025-09-20",submittedBy:"David Lee (Head of Finance)",desc:"IDP (Intelligent Document Processing) for invoice extraction. 94% straight-through processing. ROI: £340k saved annually.",decisions:[
    {role:"caio",decision:"approve",reasoning:"Minimal-risk OCR/extraction. Automated decisioning bounded with human review on flagged exceptions.",signer:"Saif Ali (CAIO)",timestamp:"2025-10-02 14:20"},
    {role:"ciso",decision:"approve",reasoning:"Azure compliance with internal procurement spec. No issues.",signer:"M. Khan (CISO)",timestamp:"2025-10-03 10:00"},
    {role:"cdpo",decision:"approve",reasoning:"No personal data in invoice content. Business data only.",signer:"R. Patel (CDPO)",timestamp:"2025-10-03 11:15"},
  ]},
  {id:"uc4",name:"HR Onboarding Automation",dept:"HR",system:"GPT-4 Enterprise",dataClass:"Restricted",decisionImpact:"Advisory",affectedUsers:340,stage:"POC",impact:6,feasibility:6,risk:5,score:62,owner:"HR + IT",eta:"Q4 2026",status:"Active",pipelineStage:"Conditions",tier:"High-Risk",iso42001Controls:["6.1.2","8.2","8.3","8.4","9.2","9.3"],submittedAt:"2026-05-02",submittedBy:"Jenna Brooks (Head of People)",desc:"AI-guided onboarding journey. Ethics risk: employee data processing at scale. DPIA required before pilot.",decisions:[
    {role:"caio",decision:"approve_with_conditions",reasoning:"High-risk under EU AI Act Annex III (employment). DPIA mandatory before any user interaction. Bias testing across protected groups required.",signer:"Saif Ali (CAIO)",timestamp:"2026-05-08 16:00"},
    {role:"ciso",decision:"pending",reasoning:"",signer:"",timestamp:""},
    {role:"cdpo",decision:"reject",reasoning:"Cannot proceed without completed DPIA, Article 35 consultation, and explicit employee transparency notice. Resubmit once these are in place.",signer:"R. Patel (CDPO)",timestamp:"2026-05-09 09:30"},
  ]},
  {id:"uc5",name:"Regulatory Change Monitor",dept:"Compliance",system:"Claude 3.5 Sonnet + Internal RAG",dataClass:"Internal",decisionImpact:"Advisory",affectedUsers:4,stage:"Pilot",impact:9,feasibility:5,risk:3,score:78,owner:"CGO + Legal",eta:"Q3 2026",status:"Active",pipelineStage:"Approved",tier:"Limited",iso42001Controls:["6.1.2","8.2","8.4"],submittedAt:"2026-03-15",submittedBy:"H. Williams (CGO)",desc:"LLM monitoring regulatory feeds (EU AI Act, GDPR, FCA) for changes affecting the organisation. Alerts to CGO and CAIO.",decisions:[
    {role:"caio",decision:"approve",reasoning:"Advisory only. Outputs reviewed by Legal before any policy action.",signer:"Saif Ali (CAIO)",timestamp:"2026-03-22 13:00"},
    {role:"ciso",decision:"approve",reasoning:"Public regulatory data only. No internal data leaves the perimeter.",signer:"M. Khan (CISO)",timestamp:"2026-03-22 15:30"},
    {role:"cdpo",decision:"approve",reasoning:"No personal data processed. Acceptable.",signer:"R. Patel (CDPO)",timestamp:"2026-03-23 10:00"},
  ]},
  {id:"uc6",name:"GenAI Code Assistant",dept:"Engineering",system:"GitHub Copilot Enterprise",dataClass:"Confidential",decisionImpact:"Advisory",affectedUsers:78,stage:"Scale",impact:7,feasibility:9,risk:3,score:88,owner:"Engineering",eta:"Live",status:"Complete",pipelineStage:"Production",tier:"Limited",iso42001Controls:["6.1.2","8.2","8.4","9.2"],submittedAt:"2025-08-10",submittedBy:"K. Nakamura (CTO)",desc:"GitHub Copilot Enterprise deployment. 35% faster development velocity. IP and data leakage policy in place.",decisions:[
    {role:"caio",decision:"approve",reasoning:"Acceptable AI risk. Copilot Enterprise with code retention disabled.",signer:"Saif Ali (CAIO)",timestamp:"2025-08-20 09:00"},
    {role:"ciso",decision:"approve",reasoning:"Repository scoping enforced. Secrets scanning enabled. No issues.",signer:"M. Khan (CISO)",timestamp:"2025-08-20 11:30"},
    {role:"cdpo",decision:"approve",reasoning:"No PII in source code. No issues.",signer:"R. Patel (CDPO)",timestamp:"2025-08-21 10:00"},
  ]},
];



/* ─────────────────────────────────────────────
   ATOM COMPONENTS
───────────────────────────────────────────── */
const F = {
  h: "'Plus Jakarta Sans', sans-serif",   /* headings — bold geometric, matching reference */
  b: "'Plus Jakarta Sans', sans-serif",   /* body — same family, different weight */
  m: "'JetBrains Mono', monospace",       /* mono — framework refs, KPI codes */
  logo: "'Inter', sans-serif",            /* logo wordmark — tighter, heavier */
};

const Tag = ({label, color=T.ink3, bg}) => (
  <span style={{display:"inline-block",background:bg||color+"18",color,border:`1px solid ${color}28`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:600,fontFamily:F.m,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{label}</span>
);

const priorityColor = p => ({Critical:T.red,High:T.amber,Medium:T.blue,Low:T.ink3,Urgent:T.red,"Awaiting Approval":T.amber}[p]||T.ink3);
const priorityBg    = p => ({Critical:T.redL,High:T.amberL,Medium:T.blueL,Low:T.ink5,Urgent:T.redL,"Awaiting Approval":T.amberL}[p]||T.ink5);
const statusColor   = s => ({["In Progress"]:T.blue,Overdue:T.red,["In Review"]:T.amber,["Awaiting Approval"]:T.amber,Scheduled:T.ink3,Complete:T.green,Urgent:T.red,Planned:T.ink3,Mitigate:T.blue,Accept:T.green,Transfer:T.violet,Avoid:T.red}[s]||T.ink3);
const statusBg      = s => ({["In Progress"]:T.blueL,Overdue:T.redL,["In Review"]:T.amberL,["Awaiting Approval"]:T.amberL,Scheduled:T.ink5,Complete:T.greenL,Urgent:T.redL,Planned:T.ink5,Mitigate:T.blueL,Accept:T.greenL,Transfer:T.violetL,Avoid:T.redL}[s]||T.ink5);

const PTag = ({p}) => <Tag label={p} color={priorityColor(p)} bg={priorityBg(p)} />;
const STag = ({s}) => <Tag label={s} color={statusColor(s)} bg={statusBg(s)} />;

function Spinner({color=T.ink3}) {
  return <div style={{width:14,height:14,border:`2px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}} />;
}

function Bar({value, color, delay=0}) {
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(value),200+delay);return()=>clearTimeout(t);},[value,delay]);
  return <div style={{background:T.border,borderRadius:3,height:4,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1.3s cubic-bezier(.16,1,.3,1)"}}/></div>;
}

function Ring({score,color,size=58}) {
  const r=size/2-5, circ=2*Math.PI*r;
  const [off,setOff]=useState(circ);
  useEffect(()=>{const t=setTimeout(()=>setOff(circ-(score/100)*circ),250);return()=>clearTimeout(t);},[score,circ]);
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={4}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)"}}/>
    <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{fontSize:size>70?14:10,fontWeight:700,fill:T.ink,fontFamily:F.m,transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{score}</text>
  </svg>;
}

function Card({children, style={}, glow}) {
  return <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:glow?`0 0 28px ${glow}15`:"0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)",...style}}>{children}</div>;
}

function SHead({title, sub}) {
  return <div style={{marginBottom:20}}>
    <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:800,color:T.ink,letterSpacing:"-0.01em",marginBottom:4,lineHeight:1.2}}>{title}</h2>
    {sub&&<p style={{fontSize:12,color:T.ink3,fontFamily:F.b}}>{sub}</p>}
  </div>;
}

function Toast({msg,type}) {
  return <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,background:type==="success"?T.green:T.red,color:"#fff",borderRadius:8,padding:"10px 18px",fontSize:12,fontWeight:600,fontFamily:F.b,boxShadow:"0 8px 32px rgba(0,0,0,.5)",animation:"up .3s ease"}}>{type==="success"?"✓ ":"✗ "}{msg}</div>;
}

/* ─────────────────────────────────────────────
   SIDEBAR (desktop hidden on mobile)
───────────────────────────────────────────── */
function Sidebar({tab,setTab,role,hitlCount,open,onClose}) {
  const rc=RC(role), R=ROLES[role];
  const K_KPI=KPI[role]||{};
  /* Per-group expand/collapse state. All open by default; the group
     containing the active tab is forced open after any role/tab change. */
  const [openGroups,setOpenGroups]=useState({});
  useEffect(()=>{
    const activeGroup=NAV_GROUPS.find(g=>g.items.some(i=>i.id===tab));
    if(activeGroup) setOpenGroups(g=>({...g,[activeGroup.id]:true}));
  },[tab,role]);

  /* Per-group accent for icon chip */
  const GROUP_META = {
    overview:   {icon:"⊞",  chip:"#5B7A5E"},
    work:       {icon:"☰",  chip:"#B8956A"},
    frameworks: {icon:"⊕",  chip:"#4A4944"},
    ai:         {icon:"✦",  chip:"#C9A961"},
    programme:  {icon:"⬢",  chip:"#5F5C56"},
    library:    {icon:"⊟",  chip:"#9B3636"},
    outputs:    {icon:"▣",  chip:"#1C1B1F"},
  };

  /* Today's pulse stats — pulled from role KPI */
  const stats=[
    {label:"DUE",    val:hitlCount,                color:"#9B3636"},
    {label:"RISKS",  val:K_KPI.risks||0,           color:"#1A1916"},
    {label:"SCORE",  val:(K_KPI.compliance||0)+"%",color:"#1A1916"},
  ];

  const initials = (R.name||"User").split(" ").map(n=>n[0]).join("").slice(0,2);
  const email    = (R.name||"user").toLowerCase().replace(/\s+/g,".")+"@geniaz.com";

  return <>
    {/* Backdrop */}
    {open&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(20,18,16,.42)",zIndex:199,backdropFilter:"blur(6px)"}}/>}

    {/* Drawer */}
    <div style={{
      width:280, maxWidth:"86vw",
      background:"#FAFAF6",
      display:"flex",flexDirection:"column",
      position:"fixed",top:0,left:0,height:"100vh",
      zIndex:200,
      transform:open?"translateX(0)":"translateX(-100%)",
      transition:"transform .3s cubic-bezier(.16,1,.3,1)",
      overflowX:"hidden",
      boxShadow:open?"4px 0 40px rgba(20,18,16,0.18)":"none",
    }}>
      {/* ── HEADER: logo + name + close ── */}
      <div style={{padding:"18px 18px 12px",display:"flex",alignItems:"center",gap:11}}>
        <svg width="26" height="28" viewBox="0 0 80 86" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="v-left" x1="0" y1="0" x2="40" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1C1B1F"/>
              <stop offset="100%" stopColor="#2A2826"/>
            </linearGradient>
            <linearGradient id="v-right" x1="80" y1="0" x2="40" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A2826"/>
              <stop offset="100%" stopColor="#1C1B1F"/>
            </linearGradient>
            <linearGradient id="v-inner" x1="40" y1="20" x2="40" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3A3833"/>
              <stop offset="100%" stopColor="#1C1B1F"/>
            </linearGradient>
            <linearGradient id="gem-grad" x1="24" y1="0" x2="32" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E6CB8B"/>
              <stop offset="100%" stopColor="#C9A961"/>
            </linearGradient>
          </defs>
          <polygon points="0,8 18,8 40,70 22,70" fill="url(#v-left)"/>
          <polygon points="80,8 62,8 40,70 58,70" fill="url(#v-right)"/>
          <polygon points="18,14 28,14 40,52 52,14 62,14 40,66 18,14" fill="url(#v-inner)"/>
          <polygon points="26,18 34,18 40,42 46,18 54,18 40,58 26,18" fill="url(#v-inner)" opacity="0.6"/>
          <polygon points="28,12 32,4 36,12 32,16" fill="url(#gem-grad)" opacity="0.95"/>
          <polygon points="28,12 32,16 36,12 32,8" fill="#F4E0B0" opacity="0.5"/>
        </svg>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:15,fontWeight:800,color:"#1A1916",letterSpacing:"0.005em",lineHeight:1}}>VerisZone</span>
          <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:9,fontWeight:600,color:"#9A9690",letterSpacing:"0.18em",textTransform:"uppercase",lineHeight:1}}>{R.label}</span>
        </div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"#9A9690",fontSize:22,padding:4,cursor:"pointer",lineHeight:1}}>×</button>
      </div>

      {/* ── TODAY'S PULSE STATS STRIP ── */}
      <div style={{
        margin:"6px 14px 14px",padding:"14px 16px",
        background:"#FFFFFF",borderRadius:14,
        border:"1px solid rgba(28,27,31,0.06)",
        boxShadow:"0 1px 2px rgba(28,27,31,0.03)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#C9A961",boxShadow:"0 0 0 3px rgba(201,169,97,0.18)"}}/>
          <span style={{fontSize:9.5,color:"#C9A961",fontFamily:"'JetBrains Mono',ui-monospace,monospace",letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700}}>Today's pulse</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:14}}>
          {stats.map(s=>(
            <div key={s.label} style={{textAlign:"left",flex:1}}>
              <div style={{fontFamily:"'Newsreader','Tinos',Georgia,serif",fontStyle:"italic",fontSize:24,fontWeight:400,color:s.color,letterSpacing:"-0.03em",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:8.5,color:"#9A9690",fontFamily:"'JetBrains Mono',ui-monospace,monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginTop:7}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{flex:1,padding:"0 14px",overflowY:"auto"}}>
        {NAV_GROUPS.filter(g=>!g.caioOnly||role==="caio").map(group=>{
          const isOpen=openGroups[group.id]!==false;
          const meta = GROUP_META[group.id] || {icon:"·",chip:"#5F5C56"};
          return <div key={group.id} style={{marginBottom:6}}>
            {/* GROUP CARD HEADER */}
            <button onClick={()=>setOpenGroups(g=>({...g,[group.id]:!isOpen}))} style={{
              width:"100%",display:"flex",alignItems:"center",gap:10,
              padding:"11px 12px",
              background:"#FFFFFF",
              border:"1px solid rgba(28,27,31,0.06)",
              borderRadius:12, marginBottom:isOpen?3:0,
              cursor:"pointer",textAlign:"left",
              transition:"all .15s",
              boxShadow:isOpen?"0 1px 2px rgba(28,27,31,0.04)":"none",
            }}>
              <span style={{
                width:22,height:22,borderRadius:6,
                background:meta.chip+"18",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,color:meta.chip,flexShrink:0,
              }}>{meta.icon}</span>
              <span style={{flex:1,fontSize:10.5,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#1A1916",letterSpacing:"0.10em",textTransform:"uppercase"}}>{group.label}</span>
              <span style={{fontSize:8,color:"#9A9690",transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s ease",display:"inline-block"}}>▸</span>
            </button>

            {/* GROUP ITEMS */}
            {isOpen&&<div style={{padding:"3px 0 6px 0"}}>
              {group.items.map(item=>{
                const isA=tab===item.id;
                const badge=item.id==="hitl"&&hitlCount>0;
                return <button key={item.id} onClick={()=>{setTab(item.id);onClose();}} style={{
                  width:"100%",display:"flex",alignItems:"center",gap:10,
                  padding:"10px 14px",
                  background:isA?"#1C1B1F":"transparent",
                  border:"none",borderRadius:10,marginBottom:2,
                  color:isA?"#F5F2EA":"#5F5C56",
                  fontSize:12.5,fontWeight:isA?600:500,fontFamily:"'Plus Jakarta Sans',sans-serif",
                  textAlign:"left",position:"relative",transition:"all .15s",
                  cursor:"pointer",
                  boxShadow:isA?"0 4px 12px rgba(28,27,31,0.18)":"none",
                }}>
                  <span style={{fontSize:13,color:isA?"#C9A961":"#9A9690",flexShrink:0,width:14}}>{item.icon}</span>
                  <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span>
                  {badge&&<span style={{background:isA?"#C9A961":"#9B3636",color:isA?"#1A1916":"#fff",fontSize:9,fontWeight:800,borderRadius:8,padding:"2px 6px",fontFamily:"'JetBrains Mono',ui-monospace,monospace"}}>{hitlCount}</span>}
                </button>;
              })}
            </div>}
          </div>;
        })}
      </nav>

      {/* ── PROFILE CARD AT BOTTOM ── */}
      <div style={{padding:"10px 14px 18px"}}>
        <div style={{
          padding:"12px 14px",
          background:"#FFFFFF",
          border:"1px solid rgba(28,27,31,0.06)",
          borderRadius:14,
          display:"flex",alignItems:"center",gap:11,
          boxShadow:"0 1px 2px rgba(28,27,31,0.03)",
        }}>
          <div style={{
            width:36,height:36,borderRadius:"50%",
            background:"linear-gradient(135deg,#5B7A5E 0%,#4A6650 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,
          }}>
            <span style={{color:"#F5F2EA",fontSize:13,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"0.02em"}}>{initials}</span>
          </div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"#1A1916",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{R.name}</div>
            <div style={{fontSize:9.5,color:"#9A9690",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'JetBrains Mono',ui-monospace,monospace",letterSpacing:"0.02em",marginTop:2}}>{email}</div>
          </div>
          <button style={{background:"none",border:"1px solid rgba(28,27,31,0.08)",borderRadius:8,padding:"5px 9px",color:"#9A9690",fontSize:13,cursor:"pointer",lineHeight:1,fontWeight:700}}>⋯</button>
        </div>
      </div>
    </div>
  </>;
}

/* ─────────────────────────────────────────────
   PAGE: DASHBOARD
───────────────────────────────────────────── */
function PageHome({role,setTab}) {
  const K=KPI[role];
  const standards=STANDARDS_MAP[role]||[];
  const R=ROLES[role];
  const hr=new Date().getHours();
  const greet=hr<12?"morning":hr<17?"afternoon":"evening";
  const date=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"});

  /* ─── Quiet luxury palette — graphite + champagne + cream ─────
     Deep warm graphite heroes, cream surfaces, champagne accent.
     Boardroom/private-bank aesthetic — restraint over decoration. */
  const K_ = {
    bg:        "#FAFAF6",                       /* warm cream paper */
    surface:   "#FFFFFF",                       /* pure white card */
    s1:        "#F4F2EC",                       /* whisper elevation */
    s2:        "#EDE9E0",                       /* tinted surface */
    line:      "rgba(28,27,31,0.07)",           /* graphite hairline */
    lineH:     "rgba(28,27,31,0.14)",
    navy:      "#1C1B1F",                       /* deep warm graphite (not navy) */
    navy2:     "#2A2826",                       /* lighter graphite for gradient */
    navyT:     "#F5F2EA",                       /* warm cream text on graphite */
    navyT2:    "rgba(245,242,234,0.62)",
    navyT3:    "rgba(245,242,234,0.32)",
    ink:       "#1A1916",                       /* primary text */
    ink2:      "#5F5C56",                       /* secondary — warm slate */
    ink3:      "#9A9690",                       /* tertiary */
    ink4:      "#C5C2BA",
    gold:      "#C9A961",                       /* CHAMPAGNE GOLD accent */
    goldText:  "#1A1916",                       /* dark graphite on champagne */
    goldL:     "rgba(201,169,97,0.12)",
    sage:      "#5B7A5E",                       /* muted forest — positive */
    sageL:     "rgba(91,122,94,0.10)",
    crit:      "#9B3636",                       /* muted oxblood */
    critL:     "rgba(155,54,54,0.10)",
  };

  const fSerif = "'Newsreader', 'PP Editorial Old', 'Tinos', Georgia, serif";
  const fSans  = "'Plus Jakarta Sans', system-ui, sans-serif";
  const fMono  = "'JetBrains Mono', ui-monospace, monospace";

  /* Multi-series area-line chart */
  const Trace = ({series, h=130, w=800}) => {
    const all = series.flatMap(s=>s.points);
    const max=Math.max(...all), min=Math.min(...all), range=max-min||1;
    return <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        {series.map((s,i)=>(
          <linearGradient key={i} id={`g-${i}-${s.color.replace("#","")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={s.fill||0.14}/>
            <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
      {series.map((s,si)=>{
        const pts=s.points.map((p,i)=>`${(i/(s.points.length-1))*w},${h-((p-min)/range)*(h-14)-7}`).join(" ");
        const area=`0,${h} ${pts} ${w},${h}`;
        return <g key={si} style={{opacity:0,animation:`fadeIn 1s ease ${si*0.15}s forwards`}}>
          {s.fill!==false && <polygon points={area} fill={`url(#g-${si}-${s.color.replace("#","")})`}/>}
          <polyline points={pts} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
        </g>;
      })}
    </svg>;
  };

  const trend=[5.2,5.4,5.5,5.4,5.8,5.6,6.0,5.9,6.3,6.5,6.8,7.4];
  const trendOp=[4.2,4.5,4.3,4.7,4.5,4.9,5.0,5.2,5.5,5.4,5.7,5.9];

  const activity=[
    {kind:"REGISTRY",  text:"GPT-4 enterprise tier reviewed by CAIO", t:"14:00", dot:K_.sage},
    {kind:"EVIDENCE",  text:"ISO 42001 control C.8.4 evidence ingested", t:"13:42", dot:K_.gold},
    {kind:"POLICY",    text:"Responsible Use policy v2.3 circulated to the board", t:"11:18", dot:K_.ink2},
    {kind:"USE CASE",  text:"Customer service AI approved for pilot scope", t:"09:50", dot:K_.sage},
    {kind:"MATURITY",  text:"Governance maturity refreshed across eight domains", t:"08:30", dot:K_.ink2},
  ];

  /* The three hero KPIs */
  const heroKpis = [
    {label:"Composite risk", val:"7.4", suf:"/ 10", delta:"▲ 0.3 wk", dC:K_.sage, tab:"compliance"},
    {label:"Models in scope", val:String(24).padStart(2,"0"), suf:"", delta:"+3 / 90d", dC:K_.ink2, tab:role==="caio"?"registry":"compliance"},
    {label:"Awaiting you",    val:String(K.hitl||2).padStart(2,"0"), suf:"", delta:"oldest 2h", dC:K_.gold, tab:"hitl"},
  ];

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",
    margin:"-12px -12px",
    minHeight:"calc(100vh - 56px)",
    fontFamily:fSans,
    color:K_.ink,
    padding:"16px",
  }}>
   <div style={{
    background:"transparent",
    backdropFilter:"none",
    WebkitBackdropFilter:"none",
    border:"none",
    borderRadius:0,
    padding:0,
    boxShadow:"none",
   }}>

    {/* ── 1. Deep navy hero card ──────────────────── */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,
      padding:"36px 40px 40px",
      marginBottom:14,
      position:"relative",overflow:"hidden",
      animation:"up .55s cubic-bezier(.16,1,.3,1) .05s both",
    }}>
      {/* Subtle dot pattern overlay */}
      <div style={{
        position:"absolute",inset:0,opacity:0.4,
        backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,
        backgroundSize:"24px 24px",
        pointerEvents:"none",
      }}/>
      {/* Brand tag */}
      <div style={{position:"relative",display:"flex",alignItems:"center",gap:7,fontSize:11,color:K_.navyT,fontWeight:600,marginBottom:32,letterSpacing:"0.01em"}}>
        <span style={{color:K_.gold,fontSize:14}}>✦</span>
        <span><strong>geniaz</strong> <span style={{color:K_.navyT2,fontWeight:400}}>· VerisZone</span></span>
      </div>
      {/* Eyebrow */}
      <div style={{position:"relative",fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
        <span>▸</span><span>good {greet}</span>
      </div>
      {/* Hero title */}
      <h1 style={{
        position:"relative",
        fontFamily:fSerif,fontWeight:400,
        fontSize:"clamp(36px, 4.5vw, 56px)",lineHeight:1.05,letterSpacing:"-0.025em",
        color:K_.navyT,margin:0,
      }}>
        Hello, <span style={{fontStyle:"italic"}}>{R.name.split(" ")[0]}.</span>
      </h1>
      {/* Subtitle */}
      <p style={{
        position:"relative",
        fontSize:14.5,lineHeight:1.5,color:K_.navyT2,
        margin:"14px 0 0",fontWeight:400,maxWidth:600,
      }}>
        <span style={{color:K_.navyT,fontWeight:600}}>{K.hitl||2} {(K.hitl||2)===1?"item":"items"} need your sign-off</span> today.
        Your governance workspace, all in one place.
      </p>
    </div>

    {/* ── 2. KPI strip — first navy, rest white ──── */}
    <div style={{
      display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:14,
      marginBottom:18,
    }}>
      {/* First KPI — deep navy with lime button */}
      <div onClick={()=>setTab("hitl")} style={{
        background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
        borderRadius:20,padding:"24px 26px",
        cursor:"pointer",position:"relative",overflow:"hidden",
        animation:"up .55s cubic-bezier(.16,1,.3,1) .1s both",
      }}>
        <div style={{
          position:"absolute",inset:0,opacity:0.3,
          backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,
          backgroundSize:"22px 22px",pointerEvents:"none",
        }}/>
        <div style={{position:"relative",fontSize:10,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:16}}>Awaiting you</div>
        <div style={{position:"relative",fontFamily:fSerif,fontStyle:"italic",fontSize:64,lineHeight:0.9,letterSpacing:"-0.04em",color:K_.navyT,marginBottom:22}}>{String(K.hitl||2).padStart(1,"0")}</div>
        <button style={{
          position:"relative",
          background:K_.gold,color:K_.goldText,
          border:"none",borderRadius:100,padding:"7px 14px",
          fontSize:11.5,fontWeight:700,letterSpacing:"0.01em",
          cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,
          fontFamily:fSans,
        }}>
          <span>✦</span> Start now →
        </button>
      </div>

      {/* Other 3 KPIs — white */}
      {[
        {label:"Composite risk", val:"7.4", suf:"/ 10", delta:"▲ 0.3 wk", dC:K_.sage, tab:"compliance"},
        {label:"Models in scope", val:"24", suf:"", delta:"+3 / 90d", dC:K_.ink2, tab:role==="caio"?"registry":"compliance"},
        {label:"Compliance",     val:String(K.compliance||83), suf:"%", delta:"all frameworks", dC:K_.ink2, tab:"compliance"},
      ].map((c,i)=>(
        <div key={c.label} onClick={()=>setTab(c.tab)} style={{
          background:K_.surface,
          borderRadius:20,padding:"24px 26px",
          border:`1px solid ${K_.line}`,
          cursor:"pointer",
          animation:`up .55s cubic-bezier(.16,1,.3,1) ${.15+i*.05}s both`,
        }}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:16}}>{c.label}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:18}}>
            <span style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:56,lineHeight:0.9,letterSpacing:"-0.04em",color:K_.ink}}>{c.val}</span>
            {c.suf&&<span style={{fontSize:18,color:K_.ink3,fontFamily:fSerif,fontStyle:"italic"}}>{c.suf}</span>}
          </div>
          <div style={{fontSize:11,color:c.dC,fontFamily:fMono,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:c.dC}}/>
            {c.delta}
          </div>
        </div>
      ))}
    </div>

    {/* Wrap remaining sections in a white card */}
    <div style={{background:K_.surface,borderRadius:20,padding:"28px 30px",border:`1px solid ${K_.line}`,animation:"up .55s cubic-bezier(.16,1,.3,1) .3s both"}}>

    {/* ── (was 1) Tracker line — removed, replaced by hero ── */}

    {/* ── (was 2) Hero band — removed, replaced by navy hero card above ── */}
    <div style={{display:"none"}}>{/* placeholder for removed hero band */}</div>

    {/* ── 3. Risk trajectory chart ─────────────────── */}
    <div style={{
      display:"grid",gridTemplateColumns:"minmax(0,2.2fr) minmax(0,1fr)",gap:32,
      paddingBottom:24,marginBottom:24,
      borderBottom:`1px solid ${K_.line}`,
      animation:"up .65s cubic-bezier(.16,1,.3,1) .25s both",
    }}>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
          <div>
            <div style={{
              fontSize:10,color:K_.ink3,fontFamily:fMono,
              letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
              marginBottom:6,
            }}>Risk trajectory · 12 weeks</div>
            <h2 style={{
              fontFamily:fSerif,fontStyle:"italic",fontWeight:400,
              fontSize:18,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.3,
            }}>Composite trending up. Operational has held the line.</h2>
          </div>
          <div style={{display:"flex",gap:18,fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>
            <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:14,height:1,background:K_.gold}}/>Composite</span>
            <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:14,height:1,background:K_.ink2}}/>Operational</span>
          </div>
        </div>
        <Trace series={[
          {color:K_.gold,points:trend,fill:0.16},
          {color:K_.ink2,points:trendOp,fill:0.05},
        ]} h={130}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:K_.ink4,fontFamily:fMono,marginTop:6,letterSpacing:"0.12em"}}>
          <span>W-12</span><span>W-8</span><span>W-4</span><span>NOW</span>
        </div>
      </div>

      {/* Side panel — quick context */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <div style={{
            fontSize:10,color:K_.ink3,fontFamily:fMono,
            letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
            marginBottom:10,
          }}>Current peak</div>
          <div style={{display:"flex",alignItems:"baseline",gap:7}}>
            <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:34,letterSpacing:"-0.03em",color:K_.gold,lineHeight:1}}>7.4</span>
            <span style={{fontSize:11,color:K_.ink3,fontFamily:fMono}}>this week</span>
          </div>
        </div>
        <div>
          <div style={{
            fontSize:10,color:K_.ink3,fontFamily:fMono,
            letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
            marginBottom:10,
          }}>12-week avg</div>
          <div style={{display:"flex",alignItems:"baseline",gap:7}}>
            <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:34,letterSpacing:"-0.03em",color:K_.ink,lineHeight:1}}>6.1</span>
            <span style={{fontSize:11,color:K_.sage,fontFamily:fMono}}>stable</span>
          </div>
        </div>
        <div style={{paddingTop:12,borderTop:`1px solid ${K_.line}`}}>
          <div style={{
            fontSize:10,color:K_.ink3,fontFamily:fMono,
            letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
            marginBottom:6,
          }}>Trend</div>
          <p style={{fontSize:12,color:K_.ink2,margin:0,lineHeight:1.5}}>Three new high-risk models added this quarter explain the composite uplift. Operational controls have absorbed the load.</p>
        </div>
      </div>
    </div>

    {/* ── 4. Two-column: activity & standards ──────── */}
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(0,1fr)",gap:44,paddingBottom:24,marginBottom:24,borderBottom:`1px solid ${K_.line}`}}>

      <div style={{animation:"up .65s cubic-bezier(.16,1,.3,1) .35s both"}}>
        <div style={{
          fontSize:10,color:K_.ink3,fontFamily:fMono,
          letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
          paddingBottom:12,borderBottom:`1px solid ${K_.line}`,
          marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <span>Recent activity</span>
          <span style={{color:K_.gold,cursor:"pointer",letterSpacing:"0.04em"}}>view all →</span>
        </div>
        {activity.map((a,i)=>(
          <div key={i} style={{
            display:"grid",gridTemplateColumns:"auto 1fr auto",
            gap:18,alignItems:"baseline",
            padding:"14px 0",borderBottom:i<activity.length-1?`1px solid ${K_.line}`:"none",
          }}>
            <span style={{
              fontSize:9.5,color:K_.ink3,fontFamily:fMono,
              letterSpacing:"0.16em",fontWeight:500,
              minWidth:66,
            }}>{a.kind}</span>
            <span style={{fontSize:13.5,color:K_.ink,lineHeight:1.4,fontWeight:400}}>{a.text}</span>
            <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>{a.t}</span>
          </div>
        ))}
      </div>

      <div style={{animation:"up .65s cubic-bezier(.16,1,.3,1) .42s both"}}>
        <div style={{
          fontSize:10,color:K_.ink3,fontFamily:fMono,
          letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
          paddingBottom:12,borderBottom:`1px solid ${K_.line}`,
          marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <span>Standards posture</span>
          <span onClick={()=>setTab("checklists")} style={{color:K_.gold,cursor:"pointer",letterSpacing:"0.04em"}}>checklists →</span>
        </div>
        {standards.slice(0,5).map((s,i,arr)=>{
          const c = s.score>=85 ? K_.sage : s.score>=70 ? K_.gold : s.score>0 ? K_.crit : K_.ink3;
          return <div key={s.std} style={{
            padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${K_.line}`:"none",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:9}}>
              <div>
                <div style={{fontSize:13.5,color:K_.ink,fontWeight:500,letterSpacing:"-0.003em"}}>{s.std}</div>
                <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",marginTop:3}}>{s.applies}</div>
              </div>
              <span style={{
                fontFamily:fSerif,fontStyle:"italic",fontSize:20,fontWeight:400,
                color:c,letterSpacing:"-0.02em",
              }}>{s.score}</span>
            </div>
            <div style={{height:2,background:K_.s2,position:"relative",overflow:"hidden",borderRadius:1}}>
              <div style={{
                position:"absolute",left:0,top:0,height:"100%",
                width:`${s.score}%`,background:c,
                transition:"width 1.4s cubic-bezier(.16,1,.3,1)",
              }}/>
            </div>
          </div>;
        })}
      </div>
    </div>
    </div>{/* close white card wrapper */}

    {/* ── HITL signature line — champagne callout ──────── */}
    {K.hitl>0 && <div onClick={()=>setTab("hitl")} style={{
      display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,
      padding:"22px 28px",borderRadius:20,
      background:K_.gold,
      cursor:"pointer",
      marginTop:14,marginBottom:14,
      boxShadow:`0 8px 24px -8px ${K_.gold}80`,
      animation:"up .65s cubic-bezier(.16,1,.3,1) .5s both",
    }}>
      <div style={{display:"flex",alignItems:"baseline",gap:18}}>
        <span style={{
          fontFamily:fSerif,fontStyle:"italic",fontSize:42,fontWeight:400,
          color:K_.navy,letterSpacing:"-0.03em",lineHeight:1,
        }}>{String(K.hitl).padStart(2,"0")}</span>
        <span style={{fontSize:14.5,color:K_.navy,fontWeight:600,lineHeight:1.4,maxWidth:520}}>
          {K.hitl===1?"decision":"decisions"} await your signature.
          <span style={{color:"rgba(15,27,92,0.65)",fontWeight:400}}> The AI cannot proceed without you.</span>
        </span>
      </div>
      <span style={{
        fontSize:11,color:K_.navy,fontFamily:fMono,
        letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:700,
      }}>review queue →</span>
    </div>}

    {/* ── Footer ──────────────────────────────────── */}
    <div style={{
      display:"flex",justifyContent:"space-between",alignItems:"baseline",
      fontSize:10.5,color:K_.ink3,fontFamily:fMono,
      letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:500,
      paddingTop:18,paddingBottom:8,
    }}>
      <span>VerisZone 1.0</span>
      <span style={{fontFamily:fSerif,fontStyle:"italic",letterSpacing:0,textTransform:"none",fontSize:13,color:K_.ink}}>A Geniaz product.</span>
      <span>Synced 14:02 UTC</span>
    </div>

   </div>
  </div>;
}
function PageOnboard({role,showToast}) {
  const rc=RC(role), R=ROLES[role], steps=ONBOARD[role];
  const [done,setDone]=useState({});
  const [open,setOpen]=useState(steps[0].id);
  useEffect(()=>{setDone({});setOpen(ONBOARD[role][0].id);},[role]);
  const count=Object.values(done).filter(Boolean).length;
  const toggle=id=>{setDone(d=>({...d,[id]:!d[id]}));showToast(!done[id]?"Step complete ✓":"Marked incomplete");};
  return <div style={{maxWidth:680,animation:"up .3s ease"}}>
    {/* Welcome */}
    <div style={{background:`linear-gradient(135deg,${rc}25,${rc}08)`,border:`1px solid ${rc}35`,borderRadius:12,padding:"22px 24px",marginBottom:18,position:"relative",overflow:"hidden",boxShadow:`0 0 40px ${rc}10`}}>
      <div style={{position:"absolute",right:-30,top:-30,width:160,height:160,borderRadius:"50%",background:rc+"08"}}/>
      <Tag label={`Day 1 · ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`} color={rc} bg={rc+"20"}/>
      <h1 style={{fontFamily:F.h,fontSize:24,fontWeight:800,color:T.ink,letterSpacing:"-0.03em",marginTop:12,marginBottom:8}}>{`Welcome, ${R.name.split(" ")[0]}.`}</h1>
      <p style={{fontSize:12,color:T.ink3,lineHeight:1.75,fontFamily:F.b,maxWidth:480,marginBottom:14}}>{R.title} — VerisZone has prepared a personalised onboarding path aligned to your governance obligations.</p>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{R.frameworks.map(f=><Tag key={f} label={f} color={rc} bg={rc+"20"}/>)}</div>
    </div>
    {/* Progress */}
    <Card style={{padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>Onboarding Progress</span>
        <span style={{fontSize:10,fontFamily:F.m,color:T.ink3}}>{count}/{steps.length} complete</span>
      </div>
      <Bar value={(count/steps.length)*100} color={rc}/>
    </Card>
    {/* Steps */}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {steps.map((s,i)=><Card key={s.id} style={{overflow:"hidden",border:`1px solid ${open===s.id?rc+"50":T.border}`,boxShadow:open===s.id?`0 0 18px ${rc}10`:"none",transition:"border-color .2s",animation:`up ${.3+i*.06}s ease both`}}>
        <div onClick={()=>setOpen(open===s.id?null:s.id)} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
          <button onClick={e=>{e.stopPropagation();toggle(s.id);}} style={{width:19,height:19,borderRadius:5,flexShrink:0,border:`2px solid ${done[s.id]?rc:T.borderB}`,background:done[s.id]?rc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
            {done[s.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
          </button>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,fontFamily:F.b,color:done[s.id]?T.ink4:T.ink,textDecoration:done[s.id]?"line-through":"none"}}>{s.title}</span>
            <Tag label={s.tag} color={s.urgent?T.red:T.ink3} bg={s.urgent?T.redL:T.ink5}/>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>~{s.time}</span>
            <span style={{color:T.ink4,transform:open===s.id?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block"}}>›</span>
          </div>
        </div>
        {open===s.id&&<div style={{padding:"0 14px 14px 43px",borderTop:`1px solid ${T.border}`}}>
          <p style={{fontSize:12,color:T.ink3,lineHeight:1.75,fontFamily:F.b,marginTop:12,marginBottom:11}}>{s.desc}</p>
          <button onClick={()=>toggle(s.id)} style={{background:rc,color:"#fff",border:"none",borderRadius:6,padding:"7px 15px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{done[s.id]?"Mark Incomplete":"Mark Complete →"}</button>
        </div>}
      </Card>)}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: STRATEGY + AI GENERATOR
───────────────────────────────────────────── */
function PageStrategy({role}) {
  const rc=RC(role), rcL=RCL(role), R=ROLES[role], pillars=PILLARS[role];
  const [pn,setPn]=useState(""), [pd,setPd]=useState(""), [fws,setFws]=useState([]), [tl,setTl]=useState("1–3 months"), [pri,setPri]=useState("High");
  const [loading,setLoading]=useState(false), [result,setResult]=useState(null), [err,setErr]=useState("");
  useEffect(()=>{setResult(null);setErr("");setPn("");setPd("");setFws([]);},[role]);
  const toggleFw=fw=>setFws(p=>p.includes(fw)?p.filter(f=>f!==fw):[...p,fw]);
  const generate=async()=>{
    if(!pn.trim()||!pd.trim()){setErr("Project name and description are required.");return;}
    setErr("");setLoading(true);setResult(null);
    const fwList=fws.length?fws.join(", "):R.frameworks.join(", ");
    const systemPrompt="You are VerisZone's AI Strategy Engine, specialising in "+R.label+" ("+R.title+") responsibilities and ISO 42001 AIMS implementation.\nGenerate a governance strategy. Respond ONLY in valid JSON, no markdown, no backticks:\n{\"summary\":\"2-3 sentence summary\",\"riskLevel\":\"Critical|High|Medium|Low\",\"objectives\":[{\"title\":\"string\",\"desc\":\"string\"}],\"steps\":[{\"n\":1,\"action\":\"string\",\"owner\":\"string\",\"timeline\":\"string\",\"clause\":\"string\",\"priority\":\"Critical|High|Medium\"}],\"regulatory\":[{\"framework\":\"string\",\"article\":\"string\",\"req\":\"string\",\"risk\":\"string\"}],\"hitl\":true,\"hitlReason\":\"string\"}\nRules: exactly 4 objectives, exactly 6 steps ordered chronologically, exactly 3 regulatory items. Reference real ISO 42001 clauses and regulatory articles. Return ONLY the JSON object.";
    const userMsg="Role: "+R.label+" — "+R.title+"\nProject: "+pn+"\nDescription: "+pd+"\nFrameworks: "+fwList+"\nTimeline: "+tl+"\nPriority: "+pri;
    try {
      const res=await fetch("/api/anthropic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:[{role:"user",content:userMsg}]})});
      const d=await res.json();
      const raw=(d.content&&d.content[0]&&d.content[0].text)||"";
      try{setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setErr("AI returned unexpected format. Please try again.");}
    }catch{setErr("Connection error. Please try again.");}
    setLoading(false);
  };
  const iColor=v=>v==="Critical"?T.red:v==="High"?T.amber:v==="Medium"?T.blue:T.ink3;
  const iBg=v=>v==="Critical"?T.redL:v==="High"?T.amberL:v==="Medium"?T.blueL:T.ink5;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Strategic Framework" sub={`${R.label} strategy pillars and AI-powered initiative planning`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:28}}>
      {pillars.map((p,i)=><Card key={p.name} style={{padding:15,animation:`up ${.3+i*.06}s ease both`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
          <h3 style={{fontFamily:F.h,fontSize:13,fontWeight:700,color:T.ink,lineHeight:1.35,flex:1,paddingRight:6}}>{p.name}</h3>
          <Tag label={p.status} color={p.status==="Active"?T.green:p.status==="Building"?T.amber:T.ink3} bg={p.status==="Active"?T.greenL:p.status==="Building"?T.amberL:T.ink5}/>
        </div>
        <p style={{fontSize:11,color:T.ink3,lineHeight:1.6,fontFamily:F.b,marginBottom:10}}>{p.desc}</p>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:8}}>
          {p.objs.map(o=><div key={o} style={{display:"flex",gap:6,marginBottom:5,alignItems:"flex-start"}}>
            <div style={{width:3,height:3,borderRadius:"50%",background:rc,marginTop:5,flexShrink:0}}/>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{o}</span>
          </div>)}
        </div>
      </Card>)}
    </div>

    {/* AI Generator */}
    <div style={{background:`linear-gradient(135deg,${rcL},${T.s2})`,border:`1px solid ${rc}30`,borderRadius:12,padding:22,marginBottom:result?18:0}}>
      <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:5}}>
        <div style={{width:24,height:24,borderRadius:6,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⚡</div>
        <h2 style={{fontFamily:F.h,fontSize:18,fontWeight:700,color:T.ink}}>AI Strategy Generator</h2>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginBottom:18,lineHeight:1.65}}>Describe your project — VerisZone AI generates a complete governance strategy with ISO 42001 clause mapping and regulatory considerations.</p>
      <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:12}}>
        <div>
          <label style={{fontSize:9,fontWeight:700,color:T.ink4,display:"block",marginBottom:5,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>Project Name *</label>
          <input value={pn} onChange={e=>setPn(e.target.value)} placeholder="e.g. Deploy customer-facing AI chatbot" style={{width:"100%",background:T.s3,border:`1px solid ${err&&!pn.trim()?T.red:T.border}`,borderRadius:7,padding:"9px 12px",fontSize:12,color:T.ink,fontFamily:F.b}}/>
        </div>
        <div>
          <label style={{fontSize:9,fontWeight:700,color:T.ink4,display:"block",marginBottom:5,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>Project Description *</label>
          <textarea value={pd} onChange={e=>setPd(e.target.value)} rows={3} placeholder="Scope, business objective, known risks, constraints..." style={{width:"100%",background:T.s3,border:`1px solid ${err&&!pd.trim()?T.red:T.border}`,borderRadius:7,padding:"9px 12px",fontSize:12,color:T.ink,fontFamily:F.b,resize:"vertical"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div>
            <label style={{fontSize:9,fontWeight:700,color:T.ink4,display:"block",marginBottom:5,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>Timeline</label>
            <select value={tl} onChange={e=>setTl(e.target.value)} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 11px",fontSize:11,color:T.ink,fontFamily:F.b}}>
              {["< 1 month","1–3 months","3–6 months","6–12 months","12+ months"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:9,fontWeight:700,color:T.ink4,display:"block",marginBottom:5,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>Priority</label>
            <select value={pri} onChange={e=>setPri(e.target.value)} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 11px",fontSize:11,color:T.ink,fontFamily:F.b}}>
              {["Critical","High","Medium","Low"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{fontSize:9,fontWeight:700,color:T.ink4,display:"block",marginBottom:7,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>Target Frameworks</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {R.frameworks.map(fw=><button key={fw} onClick={()=>toggleFw(fw)} style={{background:fws.includes(fw)?rc:T.s3,color:fws.includes(fw)?"#fff":T.ink3,border:`1px solid ${fws.includes(fw)?rc:T.border}`,borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:600,fontFamily:F.m,transition:"all .15s"}}>{fw}</button>)}
          </div>
        </div>
      </div>
      {err&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:7,padding:"9px 12px",marginBottom:11,fontSize:11,color:T.red,fontFamily:F.b}}>{err}</div>}
      <button onClick={generate} disabled={loading} style={{width:"100%",background:loading?T.border:rc,color:loading?T.ink4:"#fff",border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:600,fontFamily:F.b,display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
        {loading?<><Spinner color="#fff"/>Generating strategy…</>:"⚡  Generate Strategy & Next Steps"}
      </button>
    </div>

    {result&&<Card style={{overflow:"hidden",animation:"up .4s ease"}}>
      <div style={{background:rc,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
          <Tag label="AI Generated" color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.14)"/>
          <Tag label={`Risk: ${result.riskLevel}`} color={iColor(result.riskLevel)} bg={iBg(result.riskLevel)}/>
        </div>
        <h3 style={{fontFamily:F.h,fontSize:17,fontWeight:700,color:"#fff",lineHeight:1.3}}>{pn}</h3>
      </div>
      <div style={{padding:20}}>
        <p style={{fontSize:12,color:T.ink2,lineHeight:1.75,fontFamily:F.b,marginBottom:20,padding:"12px 14px",background:T.s3,borderRadius:8,borderLeft:`3px solid ${rc}`}}>{result.summary}</p>
        <h4 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:11}}>Strategic Objectives</h4>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8,marginBottom:20}}>
          {(result.objectives||[]).map((o,i)=><div key={i} style={{background:rcL+"60",border:`1px solid ${rc}20`,borderRadius:8,padding:"11px 13px"}}>
            <div style={{fontSize:11,fontWeight:600,color:rc,fontFamily:F.b,marginBottom:3}}>{o.title}</div>
            <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.55}}>{o.desc}</div>
          </div>)}
        </div>
        <h4 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:11}}>Action Plan</h4>
        <div style={{border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",marginBottom:20}}>
          {(result.steps||[]).map((s,i)=><div key={i} style={{padding:"10px 14px",borderBottom:i<(result.steps.length-1)?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"22px 2fr 1fr 90px 90px",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,fontWeight:700,fontFamily:F.m,color:rc}}>{s.n}</span>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{s.action}</div>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{s.clause}</span>
            </div>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.owner}</span>
            <span style={{fontSize:10,fontFamily:F.m,color:T.ink3}}>{s.timeline}</span>
            <PTag p={s.priority}/>
          </div>)}
        </div>
        <h4 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:11}}>Regulatory Considerations</h4>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:result.hitl?18:0}}>
          {(result.regulatory||[]).map((r,i)=><div key={i} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 13px"}}>
            <div style={{display:"flex",gap:7,marginBottom:5}}><Tag label={r.framework} color={rc} bg={rcL+"80"}/><span style={{fontSize:9,fontFamily:F.m,color:T.ink3}}>{r.article}</span></div>
            <div style={{fontSize:11,color:T.ink,fontFamily:F.b,marginBottom:3,fontWeight:500}}>{r.req}</div>
            <div style={{fontSize:11,color:T.red,fontFamily:F.b}}>⚠ {r.risk}</div>
          </div>)}
        </div>
        {result.hitl&&<div style={{background:T.amberL,border:`1px solid ${T.amber}35`,borderRadius:8,padding:"12px 14px",display:"flex",gap:10}}>
          <span>⚠️</span>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.amber,fontFamily:F.b,marginBottom:3}}>Human-in-the-Loop Required</div>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{result.hitlReason}</p>
          </div>
        </div>}
      </div>
    </Card>}
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: PLAYBOOK
───────────────────────────────────────────── */
function PagePlaybook({role}) {
  const rc=RC(role), rcL=RCL(role), tasks=PLAYBOOK[role]||[];
  const [selIdx,setSelIdx]=useState(0);
  const [runbook,setRunbook]=useState(null); // full runbook modal
  useEffect(()=>{ setSelIdx(0); setRunbook(null); },[role]);
  const sel=tasks[selIdx]||tasks[0]||{};

  // Runbook modal
  if(runbook) {
    const rb=runbook;
    const steps=[
      {n:1,title:"Trigger & Activation",desc:"Confirm the trigger condition has been met. Document the date, time, and initiating event. Notify all stakeholders listed in the RACI matrix."},
      {n:2,title:"Scope Assessment",desc:"Assess the full scope of the issue. Identify affected systems, data, users, and regulatory obligations. Classify severity (P1/P2/P3)."},
      {n:3,title:"Containment Actions",desc:"Execute immediate containment to prevent escalation. Apply technical and operational controls. Document every action taken with timestamp."},
      {n:4,title:"Stakeholder Notification",desc:"Notify all required parties per the communication tree: internal leadership, Legal, DPO, and if required, the supervisory authority within mandated timelines."},
      {n:5,title:"Remediation & Resolution",desc:"Execute the remediation plan. Verify effectiveness of controls. Obtain sign-off from accountable owner before closing."},
      {n:6,title:"Post-Incident Review",desc:"Conduct a blameless post-mortem within 5 business days. Document root cause, lessons learned, and control improvements. Update playbook."},
    ];
    return (
      <div style={{animation:"up .3s ease"}}>
        {/* Breadcrumb */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
          <button onClick={()=>setRunbook(null)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 12px",fontSize:11,color:T.ink2,fontFamily:F.b,cursor:"pointer"}}>← Back to Playbook</button>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Playbook → {rb.title}</span>
        </div>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${rc}22,${T.s2})`,border:`1px solid ${rc}35`,borderRadius:12,padding:"20px 22px",marginBottom:16,boxShadow:`0 0 32px ${rc}10`}}>
          <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
            <PTag p={rb.priority}/><STag s={rb.status}/>
            {rb.hitl&&<Tag label="HITL Required" color={T.amber} bg={T.amberL}/>}
            <Tag label={rb.fw} color={T.ink3} bg={T.s3}/>
          </div>
          <h1 style={{fontFamily:F.h,fontSize:22,fontWeight:700,color:T.ink,marginBottom:8,lineHeight:1.2}}>{rb.title}</h1>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.75}}>{rb.desc}</p>
        </div>

        {/* Metadata */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
          {[["Owner",rb.owner],["Collaborators",rb.collab],["Framework",rb.fw],["Due Date",rb.due]].map(([l,v])=>(
            <Card key={l} style={{padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{l}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b}}>{v}</div>
            </Card>
          ))}
        </div>

        {/* Runbook steps */}
        <Card style={{overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
            <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>Runbook Procedure</h3>
          </div>
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {steps.map((s,i)=>(
              <div key={s.n} style={{display:"flex",gap:12,alignItems:"flex-start",animation:`up ${.3+i*.06}s ease both`}}>
                <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:rc+"20",border:`2px solid ${rc}50`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:11,fontWeight:800,color:rc,fontFamily:F.m}}>{s.n}</span>
                </div>
                <div style={{flex:1,background:T.s3,borderRadius:8,padding:"11px 14px",borderLeft:`3px solid ${rc}40`}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:5}}>{s.title}</div>
                  <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* HITL alert */}
        {rb.hitl&&(
          <div style={{background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:10,padding:"14px 16px",display:"flex",gap:12,marginBottom:14}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:T.amber,fontFamily:F.b,marginBottom:4}}>Human-in-the-Loop Required</div>
              <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>This runbook cannot be executed without explicit approval in the HITL Queue. Navigate to the HITL Queue tab to review the AI reasoning and approve or reject the proposed action.</p>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setRunbook(null)} style={{flex:1,background:T.s2,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px",fontSize:12,fontWeight:600,fontFamily:F.b}}>← Back to Playbook</button>
          <button style={{flex:2,background:rc,color:"#fff",border:"none",borderRadius:8,padding:"11px",fontSize:12,fontWeight:600,fontFamily:F.b}}>▶ Begin Runbook Execution</button>
        </div>
      </div>
    );
  }

  // Main playbook list
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Active Playbook" sub={`${tasks.length} runbooks assigned to or involving your role`}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {tasks.map((t,i)=><div key={t.id} onClick={()=>setSelIdx(i)}
          style={{background:selIdx===i?T.s3:T.s1,border:`1px solid ${selIdx===i?rc+"50":T.border}`,borderRadius:10,padding:"13px 15px",cursor:"pointer",transition:"all .15s",boxShadow:selIdx===i?`0 0 18px ${rc}10`:"none",animation:`up ${.3+i*.06}s ease both`}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:8}}><PTag p={t.priority}/><STag s={t.status}/>{t.hitl&&<Tag label="HITL" color={T.amber} bg={T.amberL}/>}</div>
          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:5,lineHeight:1.4}}>{t.title}</div>
          <div style={{display:"flex",gap:12}}><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Due: {t.due}</span><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{t.fw}</span></div>
        </div>)}
      </div>

      {/* Detail pane */}
      <div style={{position:"sticky",top:70,height:"fit-content"}}>
        <Card style={{overflow:"hidden",boxShadow:`0 0 28px ${rc}10`}}>
          {["Overdue","Urgent"].includes(sel.status)&&(
            <div style={{background:T.red,padding:"7px 14px"}}>
              <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚠ {sel.status} — Immediate Action Required</span>
            </div>
          )}
          <div style={{background:`linear-gradient(135deg,${rc}22,${rc}08)`,borderBottom:`1px solid ${rc}30`,padding:"14px 16px"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}><PTag p={sel.priority}/><STag s={sel.status}/></div>
            <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink,lineHeight:1.35}}>{sel.title}</h3>
          </div>
          <div style={{padding:16}}>
            <p style={{fontSize:12,color:T.ink3,lineHeight:1.7,fontFamily:F.b,marginBottom:14}}>{sel.desc}</p>
            {[["Owner",sel.owner],["Collaborators",sel.collab],["Framework",sel.fw],["Due Date",sel.due]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:9,color:T.ink4,fontWeight:700,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span>
                <span style={{fontSize:10,color:T.ink,fontFamily:F.m,textAlign:"right",maxWidth:180}}>{v}</span>
              </div>
            ))}
            {sel.hitl&&(
              <div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:7,padding:"10px 12px",marginTop:12}}>
                <div style={{fontSize:9,fontWeight:700,color:T.amber,fontFamily:F.m,textTransform:"uppercase",marginBottom:3}}>⚠ HITL Required</div>
                <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:0,lineHeight:1.6}}>Requires approval in HITL Queue before execution.</p>
              </div>
            )}
            <button onClick={()=>setRunbook(sel)} style={{width:"100%",marginTop:13,background:rc,color:"#fff",border:"none",borderRadius:7,padding:"10px",fontSize:12,fontWeight:600,fontFamily:F.b,cursor:"pointer"}}>
              Open Full Runbook →
            </button>
          </div>
        </Card>
      </div>
    </div>
  </div>;
}
/* ─────────────────────────────────────────────
   PAGE: COMPLIANCE
───────────────────────────────────────────── */
function PageCompliance({role}) {
  const rc=RC(role);
  const standards=STANDARDS_MAP[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink4;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Compliance Scorecard" sub={"Live posture across all "+ROLES[role].label+" regulatory frameworks and standards."}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12,marginBottom:20}}>
      {standards.map((s,i)=>{
        const col=s.score>=85?T.green:s.score>=70?T.blue:s.score>=50?T.amber:s.score>0?T.red:T.ink4;
        const status=s.score>=85?"Strong":s.score>=70?"Good":s.score>=50?"Developing":s.score>0?"At Risk":"N/A";
        return <Card key={s.std} style={{padding:18,animation:`up ${.3+i*.08}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink,marginBottom:6}}>{s.std}</h3>
              <Tag label={s.status} color={stColor(s.status)} bg={stColor(s.status)+"18"}/>
            </div>
            <Ring score={s.score} color={rc} size={60}/>
          </div>
          <Bar value={s.score} color={rc} delay={i*100}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.applies}</span>
            <span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:col}}>{status}</span>
          </div>
        </Card>;
      })}
    </div>
    {/* Full KPI table */}
    <Card style={{overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{ROLES[role].label} Full KPI Register</h3>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"7px 14px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
        {["Category","KPI / Metric","Target","Current","Framework","Status"].map(h=>
          <span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>
        )}
      </div>
      {roleKpis.map((k,i)=>{
        const sc=stColor(k.status);
        return <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"10px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:i%2===0?T.s1:T.bg}}>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{k.cat}</span>
          <span style={{fontSize:10,fontWeight:600,color:T.ink,fontFamily:F.b}}>{k.kpi}</span>
          <span style={{fontSize:9,color:T.green,fontFamily:F.m}}>{k.target}</span>
          <span style={{fontSize:10,fontWeight:700,color:rc,fontFamily:F.m}}>{k.value}</span>
          <span style={{fontSize:9,color:T.ink3,fontFamily:F.m}}>{k.fw}</span>
          <Tag label={k.status} color={sc} bg={sc+"18"}/>
        </div>;
      })}
    </Card>
  </div>;
}

/* ─────────────────────────────────────────────
   ISO 27001 IMPLEMENTATION WORKSPACE
   The landing surface for all 18 ISO 27001 implementation
   sub-modules. Each module shows status + % complete + owner
   + optional deep-link to a related page (e.g. Template Library).
───────────────────────────────────────────── */
const ISO27001_MODULES = [
  /* FOUNDATIONS */
  {id:"iso27_scope",      name:"ISMS Scope Statement",            category:"Foundations", clause:"§ 4.3",     icon:"🎯", status:"In Progress",  complete:60,  owner:"H. Williams (CGO)",                  link:{tab:"templates"}},
  {id:"iso27_context",    name:"Context of the Organisation",     category:"Foundations", clause:"§ 4.1",     icon:"🏢", status:"Complete",     complete:100, owner:"H. Williams (CGO)",                  link:null},
  {id:"iso27_parties",    name:"Interested Parties Register",     category:"Foundations", clause:"§ 4.2",     icon:"👥", status:"In Progress",  complete:75,  owner:"H. Williams (CGO)",                  link:null},
  {id:"iso27_legal",      name:"Legal & Regulatory Register",     category:"Foundations", clause:"§ 4.2 / A.5.31", icon:"⚖", status:"Complete", complete:100, owner:"H. Williams (CGO) + R. Patel (CDPO)", link:null},
  /* RISK */
  {id:"iso27_method",     name:"Risk Assessment Methodology",     category:"Risk",        clause:"§ 6.1.2",   icon:"📐", status:"Complete",     complete:100, owner:"S. Ali (CAIO)",                      link:{tab:"templates"}},
  {id:"iso27_assets",     name:"Asset Inventory",                 category:"Risk",        clause:"§ A.5.9",   icon:"📦", status:"In Progress",  complete:80,  owner:"D. Lee (Head of IT)",                link:{tab:"templates"}},
  {id:"iso27_register",   name:"Risk Register",                   category:"Risk",        clause:"§ 6.1.2 / 8.2", icon:"⬟", status:"In Progress", complete:65, owner:"S. Ali (CAIO)",                  link:{tab:"risks"}},
  {id:"iso27_treatment",  name:"Risk Treatment Plan",             category:"Risk",        clause:"§ 6.1.3 / 8.3", icon:"◆", status:"In Progress", complete:55, owner:"S. Ali (CAIO)",                  link:{tab:"templates"}},
  /* CONTROLS */
  {id:"iso27_soa",        name:"Statement of Applicability",      category:"Controls",    clause:"§ 6.1.3",   icon:"📋", status:"In Review",    complete:90,  owner:"M. Khan (CISO)",                     link:{tab:"soa"}},
  {id:"iso27_annexa",     name:"Annex A Control Tracker",         category:"Controls",    clause:"Annex A (93)", icon:"☑", status:"In Progress", complete:72, owner:"M. Khan (CISO)",                  link:{tab:"annexa"}},
  /* DOCUMENTATION */
  {id:"iso27_policies",   name:"Policy Library",                  category:"Documentation", clause:"§ A.5.1 / A.5.36", icon:"📜", status:"In Progress", complete:80, owner:"M. Khan (CISO)",          link:{tab:"templates"}},
  {id:"iso27_procedures", name:"Procedure Library",               category:"Documentation", clause:"§ 7.5",    icon:"📑", status:"Not Started", complete:0,   owner:"M. Khan (CISO)",                     link:null},
  {id:"iso27_evidence",   name:"Evidence Library",                category:"Documentation", clause:"§ 7.5 / 9.2", icon:"📁", status:"In Progress", complete:60, owner:"Internal Audit",                  link:{tab:"evidence"}},
  /* AUDIT */
  {id:"iso27_internal",   name:"Internal Audit Plan",             category:"Audit",       clause:"§ 9.2",     icon:"🔍", status:"Complete",     complete:100, owner:"Internal Audit",                     link:{tab:"templates"}},
  {id:"iso27_mgmt",       name:"Management Review",               category:"Audit",       clause:"§ 9.3",     icon:"📅", status:"In Progress",  complete:50,  owner:"H. Williams (CGO)",                  link:{tab:"templates"}},
  {id:"iso27_corrective", name:"Corrective Actions",              category:"Audit",       clause:"§ 10.1",    icon:"🔧", status:"Not Started",  complete:0,   owner:"H. Williams (CGO)",                  link:{tab:"templates"}},
  /* IMPROVEMENT */
  {id:"iso27_continual",  name:"Continual Improvement",           category:"Improvement", clause:"§ 10.1",    icon:"🔄", status:"Not Started",  complete:0,   owner:"H. Williams (CGO)",                  link:null},
  {id:"iso27_auditor",    name:"Auditor Collaboration Workspace", category:"Improvement", clause:"§ 9.2",     icon:"🤝", status:"Not Started",  complete:0,   owner:"H. Williams (CGO)",                  link:null},
];

const ISO27001_CATEGORIES = [
  {id:"Foundations",   label:"Foundations",   tagline:"Define the scope and context of your ISMS."},
  {id:"Risk",          label:"Risk Management", tagline:"Assess and treat information-security risks."},
  {id:"Controls",      label:"Controls",       tagline:"Annex A applicability and implementation."},
  {id:"Documentation", label:"Documentation",  tagline:"Policies, procedures, and evidence."},
  {id:"Audit",         label:"Audit & Review", tagline:"Internal audit, management review, and corrective actions."},
  {id:"Improvement",   label:"Improvement",    tagline:"Continual improvement and auditor collaboration."},
];

function PageISO27001({setTab,showToast}) {
  /* Palette — quiet luxury */
  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* Status colour mapping */
  const statusColor = s => ({
    "Complete":K_.sage, "In Review":K_.amber, "In Progress":K_.gold,
    "Not Started":K_.ink3, "Needs Update":K_.crit,
  })[s] || K_.ink3;

  /* Aggregate readiness */
  const readiness = Math.round(ISO27001_MODULES.reduce((s,m)=>s+m.complete,0) / ISO27001_MODULES.length);
  const complete = ISO27001_MODULES.filter(m=>m.complete===100).length;
  const inProgress = ISO27001_MODULES.filter(m=>m.complete>0 && m.complete<100).length;
  const notStarted = ISO27001_MODULES.filter(m=>m.complete===0).length;
  const annexA = ISO27001_MODULES.find(m=>m.id==="iso27_annexa");

  /* Click target — link or toast */
  const onTileClick = (mod) => {
    if(mod.link && mod.link.tab) setTab(mod.link.tab);
    else showToast(`${mod.name} — coming in the next module build`,"info");
  };

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* ── HERO ── */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"36px 40px 40px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,
        backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,
        backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>Frameworks · ISO/IEC 27001:2022</span>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(34px,4.2vw,52px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            Information Security <span style={{fontStyle:"italic"}}>Management.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            All 18 sub-modules of your ISO 27001 implementation, in one workspace. From ISMS scope through Annex A controls to management review.
            <span style={{display:"block",marginTop:8,color:K_.gold,fontWeight:600}}>On track for Q4 2026 stage-2 audit.</span>
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Certification readiness</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{readiness}<span style={{fontSize:48,color:K_.navyT2,fontStyle:"normal"}}>%</span></div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10,letterSpacing:"0.02em"}}>across {ISO27001_MODULES.length} ISMS modules</div>
        </div>
      </div>
    </div>

    {/* ── STATS STRIP ── */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Complete",      val:String(complete),                  c:K_.sage},
        {label:"In progress",   val:String(inProgress),                c:K_.gold},
        {label:"Not started",   val:String(notStarted),                c:K_.ink3},
        {label:"Annex A controls", val:(annexA?Math.round(annexA.complete*0.93):0)+" / 93", c:K_.ink, suffixSmall:true},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:s.suffixSmall?40:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
        </div>
      ))}
    </div>

    {/* ── MODULES BY CATEGORY ── */}
    {ISO27001_CATEGORIES.map(cat=>{
      const mods = ISO27001_MODULES.filter(m=>m.category===cat.id);
      const catComplete = Math.round(mods.reduce((s,m)=>s+m.complete,0) / (mods.length||1));
      return <div key={cat.id} style={{marginBottom:18}}>
        {/* Section header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12,padding:"0 4px"}}>
          <div>
            <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>{cat.label}</div>
            <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:22,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.2}}>{cat.tagline}</h2>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Section</div>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:22,color:K_.ink,letterSpacing:"-0.02em"}}>{catComplete}<span style={{fontSize:14,color:K_.ink3}}>%</span></div>
          </div>
        </div>

        {/* Module tiles */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {mods.map(mod=>{
            const c = statusColor(mod.status);
            return <div key={mod.id} onClick={()=>onTileClick(mod)} style={{
              background:K_.surface,borderRadius:16,padding:"20px 22px",
              border:`1px solid ${K_.line}`,cursor:"pointer",
              transition:"all .15s",display:"flex",flexDirection:"column",gap:14,
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=K_.navy+"30";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 20px -10px rgba(28,27,31,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=K_.line;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
            >
              {/* Top: icon + clause + status */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:10,background:K_.s1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{mod.icon}</div>
                  <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.06em",fontWeight:500}}>{mod.clause}</span>
                </div>
                <span style={{
                  display:"inline-flex",alignItems:"center",gap:5,
                  background:c+"15",color:c,border:`1px solid ${c}30`,
                  borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600,fontFamily:fSans,
                }}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:c}}/>
                  {mod.status}
                </span>
              </div>
              {/* Name + owner */}
              <div>
                <h3 style={{fontSize:14.5,fontWeight:600,color:K_.ink,margin:"0 0 6px",letterSpacing:"-0.005em",lineHeight:1.3}}>{mod.name}</h3>
                <div style={{fontSize:11.5,color:K_.ink3,lineHeight:1.4}}>{mod.owner}</div>
              </div>
              {/* Progress bar */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",marginBottom:6}}>
                  <span>Progress</span>
                  <span style={{color:c,fontWeight:700}}>{mod.complete}%</span>
                </div>
                <div style={{height:3,background:K_.s2,borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${mod.complete}%`,height:"100%",background:c,transition:"width 1s cubic-bezier(.16,1,.3,1)"}}/>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>;
    })}

    {/* ── FOOTER: audit timeline ── */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"22px 28px",marginTop:18,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:24,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Audit timeline</div>
        <div style={{fontSize:13.5,color:K_.ink,lineHeight:1.5,maxWidth:540}}>
          Last internal audit: <strong>15 Jan 2026</strong> · Next internal audit: <strong>20 Jul 2026</strong> · Stage-1 external audit: <strong>3 Sep 2026</strong> · Stage-2: <strong>18 Nov 2026</strong>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Certification body</div>
        <div style={{fontSize:13.5,color:K_.ink,fontWeight:600}}>BSI Group</div>
      </div>
    </div>
  </div>;
}
/* ─────────────────────────────────────────────
   ISO 27001:2022 ANNEX A — 93 CONTROLS
   Four themes: Organisational (37), People (8), Physical (14),
   Technological (34). Realistic implementation status seeded.
───────────────────────────────────────────── */
const ANNEX_A_CONTROLS = [
  /* A.5 Organisational (37) */
  {id:"A.5.1", theme:"Organisational", name:"Policies for information security", applicable:true, status:"Implemented", eff:5, ev:6, owner:"M. Khan (CISO)", lastReviewed:"2026-03-15"},
  {id:"A.5.2", theme:"Organisational", name:"Information security roles and responsibilities", applicable:true, status:"Implemented", eff:5, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-03-10"},
  {id:"A.5.3", theme:"Organisational", name:"Segregation of duties", applicable:true, status:"Implemented", eff:4, ev:3, owner:"M. Khan (CISO)", lastReviewed:"2026-02-22"},
  {id:"A.5.4", theme:"Organisational", name:"Management responsibilities", applicable:true, status:"Implemented", eff:5, ev:5, owner:"H. Williams (CGO)", lastReviewed:"2026-03-01"},
  {id:"A.5.5", theme:"Organisational", name:"Contact with authorities", applicable:true, status:"Implemented", eff:4, ev:2, owner:"H. Williams (CGO)", lastReviewed:"2026-01-18"},
  {id:"A.5.6", theme:"Organisational", name:"Contact with special interest groups", applicable:true, status:"Implemented", eff:3, ev:1, owner:"M. Khan (CISO)", lastReviewed:"2025-12-05"},
  {id:"A.5.7", theme:"Organisational", name:"Threat intelligence", applicable:true, status:"In Progress", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-04-02"},
  {id:"A.5.8", theme:"Organisational", name:"Information security in project management", applicable:true, status:"Implemented", eff:4, ev:5, owner:"K. Nakamura (CTO)", lastReviewed:"2026-02-14"},
  {id:"A.5.9", theme:"Organisational", name:"Inventory of information and other associated assets", applicable:true, status:"In Progress", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-04-03"},
  {id:"A.5.10", theme:"Organisational", name:"Acceptable use of information and other associated assets", applicable:true, status:"Implemented", eff:5, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-03-10"},
  {id:"A.5.11", theme:"Organisational", name:"Return of assets", applicable:true, status:"Implemented", eff:4, ev:3, owner:"J. Brooks (HR)", lastReviewed:"2026-02-14"},
  {id:"A.5.12", theme:"Organisational", name:"Classification of information", applicable:true, status:"Implemented", eff:5, ev:4, owner:"R. Patel (CDPO)", lastReviewed:"2026-04-01"},
  {id:"A.5.13", theme:"Organisational", name:"Labelling of information", applicable:true, status:"In Progress", eff:3, ev:2, owner:"R. Patel (CDPO)", lastReviewed:"2026-03-22"},
  {id:"A.5.14", theme:"Organisational", name:"Information transfer", applicable:true, status:"Implemented", eff:4, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-02-28"},
  {id:"A.5.15", theme:"Organisational", name:"Access control", applicable:true, status:"Implemented", eff:5, ev:7, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.5.16", theme:"Organisational", name:"Identity management", applicable:true, status:"Implemented", eff:5, ev:5, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.5.17", theme:"Organisational", name:"Authentication information", applicable:true, status:"Implemented", eff:5, ev:6, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.5.18", theme:"Organisational", name:"Access rights", applicable:true, status:"Implemented", eff:4, ev:5, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.5.19", theme:"Organisational", name:"Information security in supplier relationships", applicable:true, status:"In Progress", eff:3, ev:3, owner:"M. Khan (CISO)", lastReviewed:"2025-11-08"},
  {id:"A.5.20", theme:"Organisational", name:"Addressing information security within supplier agreements", applicable:true, status:"In Progress", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2025-11-08"},
  {id:"A.5.21", theme:"Organisational", name:"Managing information security in the ICT supply chain", applicable:true, status:"Planned", eff:0, ev:0, owner:"M. Khan (CISO)", lastReviewed:""},
  {id:"A.5.22", theme:"Organisational", name:"Monitoring, review and change management of supplier services", applicable:true, status:"In Progress", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2025-11-08"},
  {id:"A.5.23", theme:"Organisational", name:"Information security for use of cloud services", applicable:true, status:"Implemented", eff:5, ev:7, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.5.24", theme:"Organisational", name:"Information security incident management planning and preparation", applicable:true, status:"Implemented", eff:5, ev:8, owner:"M. Khan (CISO)", lastReviewed:"2026-04-05"},
  {id:"A.5.25", theme:"Organisational", name:"Assessment and decision on information security events", applicable:true, status:"Implemented", eff:4, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-04-05"},
  {id:"A.5.26", theme:"Organisational", name:"Response to information security incidents", applicable:true, status:"Implemented", eff:5, ev:6, owner:"M. Khan (CISO)", lastReviewed:"2026-04-05"},
  {id:"A.5.27", theme:"Organisational", name:"Learning from information security incidents", applicable:true, status:"Implemented", eff:4, ev:3, owner:"M. Khan (CISO)", lastReviewed:"2026-04-05"},
  {id:"A.5.28", theme:"Organisational", name:"Collection of evidence", applicable:true, status:"Implemented", eff:4, ev:3, owner:"Internal Audit", lastReviewed:"2026-04-05"},
  {id:"A.5.29", theme:"Organisational", name:"Information security during disruption", applicable:true, status:"Implemented", eff:4, ev:5, owner:"H. Williams (CGO)", lastReviewed:"2026-01-12"},
  {id:"A.5.30", theme:"Organisational", name:"ICT readiness for business continuity", applicable:true, status:"Implemented", eff:4, ev:6, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-12"},
  {id:"A.5.31", theme:"Organisational", name:"Legal, statutory, regulatory and contractual requirements", applicable:true, status:"Implemented", eff:5, ev:4, owner:"H. Williams (CGO)", lastReviewed:"2026-03-01"},
  {id:"A.5.32", theme:"Organisational", name:"Intellectual property rights", applicable:true, status:"Implemented", eff:4, ev:2, owner:"Legal", lastReviewed:"2026-01-20"},
  {id:"A.5.33", theme:"Organisational", name:"Protection of records", applicable:true, status:"Implemented", eff:4, ev:3, owner:"R. Patel (CDPO)", lastReviewed:"2026-02-28"},
  {id:"A.5.34", theme:"Organisational", name:"Privacy and protection of PII", applicable:true, status:"Implemented", eff:5, ev:9, owner:"R. Patel (CDPO)", lastReviewed:"2026-02-28"},
  {id:"A.5.35", theme:"Organisational", name:"Independent review of information security", applicable:true, status:"In Progress", eff:3, ev:1, owner:"Internal Audit", lastReviewed:"2026-02-20"},
  {id:"A.5.36", theme:"Organisational", name:"Compliance with policies, rules and standards for information security", applicable:true, status:"Implemented", eff:4, ev:5, owner:"H. Williams (CGO)", lastReviewed:"2026-03-15"},
  {id:"A.5.37", theme:"Organisational", name:"Documented operating procedures", applicable:true, status:"In Progress", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-03-22"},
  /* A.6 People (8) */
  {id:"A.6.1", theme:"People", name:"Screening", applicable:true, status:"Implemented", eff:4, ev:3, owner:"J. Brooks (HR)", lastReviewed:"2026-02-14"},
  {id:"A.6.2", theme:"People", name:"Terms and conditions of employment", applicable:true, status:"Implemented", eff:5, ev:2, owner:"J. Brooks (HR)", lastReviewed:"2026-02-14"},
  {id:"A.6.3", theme:"People", name:"Information security awareness, education and training", applicable:true, status:"Implemented", eff:4, ev:6, owner:"J. Brooks (HR)", lastReviewed:"2026-01-18"},
  {id:"A.6.4", theme:"People", name:"Disciplinary process", applicable:true, status:"Implemented", eff:4, ev:1, owner:"J. Brooks (HR)", lastReviewed:"2026-02-14"},
  {id:"A.6.5", theme:"People", name:"Responsibilities after termination or change of employment", applicable:true, status:"Implemented", eff:4, ev:2, owner:"J. Brooks (HR)", lastReviewed:"2026-02-14"},
  {id:"A.6.6", theme:"People", name:"Confidentiality or non-disclosure agreements", applicable:true, status:"Implemented", eff:5, ev:3, owner:"Legal", lastReviewed:"2026-01-20"},
  {id:"A.6.7", theme:"People", name:"Remote working", applicable:true, status:"Implemented", eff:4, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-03-10"},
  {id:"A.6.8", theme:"People", name:"Information security event reporting", applicable:true, status:"Implemented", eff:4, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-04-05"},
  /* A.7 Physical (14) */
  {id:"A.7.1", theme:"Physical", name:"Physical security perimeters", applicable:true, status:"Implemented", eff:4, ev:3, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.2", theme:"Physical", name:"Physical entry", applicable:true, status:"Implemented", eff:4, ev:3, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.3", theme:"Physical", name:"Securing offices, rooms and facilities", applicable:true, status:"Implemented", eff:4, ev:2, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.4", theme:"Physical", name:"Physical security monitoring", applicable:true, status:"Implemented", eff:4, ev:4, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.5", theme:"Physical", name:"Protecting against physical and environmental threats", applicable:true, status:"Implemented", eff:3, ev:2, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.6", theme:"Physical", name:"Working in secure areas", applicable:true, status:"Implemented", eff:3, ev:1, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.7", theme:"Physical", name:"Clear desk and clear screen", applicable:true, status:"Implemented", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-02-22"},
  {id:"A.7.8", theme:"Physical", name:"Equipment siting and protection", applicable:true, status:"Implemented", eff:4, ev:2, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.9", theme:"Physical", name:"Security of assets off-premises", applicable:true, status:"In Progress", eff:3, ev:2, owner:"D. Lee (Head of IT)", lastReviewed:"2026-03-10"},
  {id:"A.7.10", theme:"Physical", name:"Storage media", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-20"},
  {id:"A.7.11", theme:"Physical", name:"Supporting utilities", applicable:true, status:"Implemented", eff:4, ev:2, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.12", theme:"Physical", name:"Cabling security", applicable:true, status:"Implemented", eff:3, ev:1, owner:"Facilities", lastReviewed:"2026-01-25"},
  {id:"A.7.13", theme:"Physical", name:"Equipment maintenance", applicable:true, status:"Implemented", eff:4, ev:2, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-08"},
  {id:"A.7.14", theme:"Physical", name:"Secure disposal or re-use of equipment", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-08"},
  /* A.8 Technological (34) */
  {id:"A.8.1", theme:"Technological", name:"User end point devices", applicable:true, status:"Implemented", eff:4, ev:5, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.8.2", theme:"Technological", name:"Privileged access rights", applicable:true, status:"Implemented", eff:5, ev:6, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.8.3", theme:"Technological", name:"Information access restriction", applicable:true, status:"Implemented", eff:5, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.8.4", theme:"Technological", name:"Access to source code", applicable:true, status:"Implemented", eff:4, ev:3, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.5", theme:"Technological", name:"Secure authentication", applicable:true, status:"Implemented", eff:5, ev:5, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.8.6", theme:"Technological", name:"Capacity management", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-08"},
  {id:"A.8.7", theme:"Technological", name:"Protection against malware", applicable:true, status:"Implemented", eff:5, ev:5, owner:"M. Khan (CISO)", lastReviewed:"2026-02-28"},
  {id:"A.8.8", theme:"Technological", name:"Management of technical vulnerabilities", applicable:true, status:"In Progress", eff:3, ev:3, owner:"M. Khan (CISO)", lastReviewed:"2026-04-02"},
  {id:"A.8.9", theme:"Technological", name:"Configuration management", applicable:true, status:"In Progress", eff:3, ev:2, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-25"},
  {id:"A.8.10", theme:"Technological", name:"Information deletion", applicable:true, status:"In Progress", eff:3, ev:1, owner:"R. Patel (CDPO)", lastReviewed:"2025-12-15"},
  {id:"A.8.11", theme:"Technological", name:"Data masking", applicable:true, status:"Planned", eff:0, ev:0, owner:"R. Patel (CDPO)", lastReviewed:""},
  {id:"A.8.12", theme:"Technological", name:"Data leakage prevention", applicable:true, status:"In Progress", eff:3, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-03-10"},
  {id:"A.8.13", theme:"Technological", name:"Information backup", applicable:true, status:"Implemented", eff:5, ev:6, owner:"D. Lee (Head of IT)", lastReviewed:"2026-03-18"},
  {id:"A.8.14", theme:"Technological", name:"Redundancy of information processing facilities", applicable:true, status:"Implemented", eff:4, ev:4, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-22"},
  {id:"A.8.15", theme:"Technological", name:"Logging", applicable:true, status:"Implemented", eff:4, ev:5, owner:"M. Khan (CISO)", lastReviewed:"2026-02-15"},
  {id:"A.8.16", theme:"Technological", name:"Monitoring activities", applicable:true, status:"Implemented", eff:4, ev:4, owner:"M. Khan (CISO)", lastReviewed:"2026-02-15"},
  {id:"A.8.17", theme:"Technological", name:"Clock synchronization", applicable:true, status:"Implemented", eff:5, ev:1, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-25"},
  {id:"A.8.18", theme:"Technological", name:"Use of privileged utility programs", applicable:true, status:"Implemented", eff:4, ev:2, owner:"M. Khan (CISO)", lastReviewed:"2026-02-10"},
  {id:"A.8.19", theme:"Technological", name:"Installation of software on operational systems", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-25"},
  {id:"A.8.20", theme:"Technological", name:"Networks security", applicable:true, status:"Implemented", eff:5, ev:5, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.8.21", theme:"Technological", name:"Security of network services", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.8.22", theme:"Technological", name:"Segregation of networks", applicable:true, status:"Implemented", eff:4, ev:3, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.8.23", theme:"Technological", name:"Web filtering", applicable:true, status:"Implemented", eff:4, ev:2, owner:"D. Lee (Head of IT)", lastReviewed:"2026-02-28"},
  {id:"A.8.24", theme:"Technological", name:"Use of cryptography", applicable:true, status:"Implemented", eff:5, ev:7, owner:"M. Khan (CISO)", lastReviewed:"2026-02-05"},
  {id:"A.8.25", theme:"Technological", name:"Secure development life cycle", applicable:true, status:"In Progress", eff:3, ev:4, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.26", theme:"Technological", name:"Application security requirements", applicable:true, status:"In Progress", eff:3, ev:3, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.27", theme:"Technological", name:"Secure system architecture and engineering principles", applicable:true, status:"In Progress", eff:3, ev:2, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.28", theme:"Technological", name:"Secure coding", applicable:true, status:"In Progress", eff:3, ev:3, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.29", theme:"Technological", name:"Security testing in development and acceptance", applicable:true, status:"In Progress", eff:3, ev:4, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.30", theme:"Technological", name:"Outsourced development", applicable:true, status:"Planned", eff:0, ev:0, owner:"K. Nakamura (CTO)", lastReviewed:""},
  {id:"A.8.31", theme:"Technological", name:"Separation of development, test and production environments", applicable:true, status:"Implemented", eff:5, ev:3, owner:"K. Nakamura (CTO)", lastReviewed:"2026-01-25"},
  {id:"A.8.32", theme:"Technological", name:"Change management", applicable:true, status:"Implemented", eff:4, ev:4, owner:"D. Lee (Head of IT)", lastReviewed:"2026-01-25"},
  {id:"A.8.33", theme:"Technological", name:"Test information", applicable:true, status:"In Progress", eff:3, ev:1, owner:"K. Nakamura (CTO)", lastReviewed:"2025-10-15"},
  {id:"A.8.34", theme:"Technological", name:"Protection of information systems during audit testing", applicable:true, status:"Implemented", eff:4, ev:2, owner:"Internal Audit", lastReviewed:"2026-02-20"},
];

/* ─────────────────────────────────────────────
   PAGE: ANNEX A CONTROL TRACKER
───────────────────────────────────────────── */
function PageAnnexA({setTab,showToast}) {
  const [themeFilter,setThemeFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data from Supabase, fallback to constant ─── */
  const [controls, dataSource, setControls] = useSupabaseTable("annex_a_controls", dbToControl, ANNEX_A_CONTROLS);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const canEdit = dataSource === "live";

  /* Generic single-column update for a control row. */
  const updateControl = async (controlId, patch) => {
    if(!supabase) return;
    setUpdatingStatus(true);
    const today = new Date().toISOString().slice(0,10);
    const dbPatch = { ...patch, last_reviewed: today };
    const { error } = await supabase
      .from("annex_a_controls")
      .update(dbPatch)
      .eq("id", controlId);
    setUpdatingStatus(false);
    if(error){
      showToast(`Update failed: ${error.message}`, "error");
      return;
    }
    /* Map snake → camel for local state */
    const camelPatch = {};
    if("status" in patch) camelPatch.status = patch.status;
    if("eff" in patch) camelPatch.eff = patch.eff;
    if("owner" in patch) camelPatch.owner = patch.owner;
    camelPatch.lastReviewed = today;
    setControls(cs => cs.map(c => c.id === controlId ? {...c, ...camelPatch} : c));
    showToast(`${controlId} updated`, "success");
  };

  /* Save new status for a single control (legacy name kept for the dropdown) */
  const updateControlStatus = (controlId, newStatus) => updateControl(controlId, { status: newStatus });

  /* Owner-editing inline state */
  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState("");

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  const statusColor = s => ({
    "Implemented":K_.sage, "In Progress":K_.gold, "Planned":K_.amber,
    "Not Implemented":K_.crit, "Compensating Control":K_.amber, "Not Applicable":K_.ink3,
  })[s] || K_.ink3;

  /* Aggregate stats */
  const total = controls.length;
  const implemented = controls.filter(c=>c.status==="Implemented").length;
  const inProgress  = controls.filter(c=>c.status==="In Progress").length;
  const gaps        = controls.filter(c=>c.status==="Planned" || c.status==="Not Implemented").length;
  const readiness   = Math.round(implemented / total * 100);

  /* Theme tabs */
  const THEMES = [
    {id:"all", label:"All themes", count:total},
    {id:"Organisational", label:"A.5 Organisational", count:37},
    {id:"People",         label:"A.6 People",         count:8},
    {id:"Physical",       label:"A.7 Physical",       count:14},
    {id:"Technological",  label:"A.8 Technological",  count:34},
  ];

  /* Filtered list */
  const filtered = controls.filter(c=>{
    if(themeFilter!=="all" && c.theme!==themeFilter) return false;
    if(statusFilter!=="all" && c.status!==statusFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sel = selectedId ? controls.find(c=>c.id===selectedId) : null;

  /* Esc closes the modal */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* ── HERO ── */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <button onClick={()=>setTab("iso27")} style={{background:"none",border:"none",color:K_.navyT2,fontSize:11,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",padding:0,marginBottom:18,fontWeight:500}}>← ISO 27001 Workspace</button>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>ISO 27001 · Annex A Control Tracker</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            Ninety-three <span style={{fontStyle:"italic"}}>controls.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            Every Annex A control with current implementation status, effectiveness score, evidence count, and owner. Filter by theme or status to drill into specific control families.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Implementation</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{readiness}<span style={{fontSize:48,color:K_.navyT2,fontStyle:"normal"}}>%</span></div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10}}>{implemented} of {total} fully implemented</div>
        </div>
      </div>
    </div>

    {/* ── STATS STRIP ── */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Implemented", val:String(implemented), c:K_.sage},
        {label:"In progress", val:String(inProgress), c:K_.gold},
        {label:"Open gaps",   val:String(gaps), c:K_.crit},
        {label:"Total in scope", val:String(total), c:K_.ink},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
        </div>
      ))}
    </div>

    {/* ── THEME TABS + FILTERS + SEARCH ── */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {THEMES.map(t=>(
          <button key={t.id} onClick={()=>setThemeFilter(t.id)} style={{
            background:themeFilter===t.id?K_.navy:"transparent",
            color:themeFilter===t.id?K_.navyT:K_.ink2,
            border:`1px solid ${themeFilter===t.id?K_.navy:K_.line}`,
            borderRadius:100,padding:"7px 14px",
            fontSize:12,fontWeight:themeFilter===t.id?600:500,
            fontFamily:fSans,cursor:"pointer",transition:"all .15s",
            display:"inline-flex",alignItems:"center",gap:7,
          }}>
            <span>{t.label}</span>
            <span style={{fontSize:10,opacity:0.7,fontFamily:fMono}}>{t.count}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by control ID, name, or owner…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600}}>Status</span>
          {[["all","All"],["Implemented","Implemented"],["In Progress","In Progress"],["Planned","Planned"],["Not Implemented","Not Implemented"]].map(([k,l])=>(
            <button key={k} onClick={()=>setStatusFilter(k)} style={{
              background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
              color:statusFilter===k?"#fff":K_.ink2,
              border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
              borderRadius:100,padding:"5px 12px",fontSize:11,fontWeight:statusFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>
    </div>

    {/* ── CONTROL TABLE ── */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"4px 0",marginBottom:14,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${K_.line}`}}>
            {["Ref","Theme","Control","Status","Effectiveness","Evidence","Owner","Last reviewed"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"14px 16px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(c=>(
            <tr key={c.id} onClick={()=>setSelectedId(c.id===selectedId?null:c.id)} style={{
              borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s",
              background:selectedId===c.id?K_.s1:"transparent",
            }}
            onMouseEnter={e=>{if(selectedId!==c.id)e.currentTarget.style.background=K_.bg;}}
            onMouseLeave={e=>{if(selectedId!==c.id)e.currentTarget.style.background="transparent";}}>
              <td style={{padding:"13px 16px",fontFamily:fMono,fontSize:11.5,color:K_.gold,fontWeight:700,letterSpacing:"0.04em"}}>{c.id}</td>
              <td style={{padding:"13px 16px",color:K_.ink2,fontSize:11.5}}>{c.theme}</td>
              <td style={{padding:"13px 16px",color:K_.ink,fontWeight:500,maxWidth:380}}>{c.name}</td>
              <td style={{padding:"13px 16px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(c.status)+"15",color:statusColor(c.status),border:`1px solid ${statusColor(c.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(c.status)}}/>
                  {c.status}
                </span>
              </td>
              <td style={{padding:"13px 16px"}}>
                {c.eff>0?<span style={{display:"inline-flex",gap:2}}>
                  {[1,2,3,4,5].map(n=><span key={n} style={{width:6,height:8,borderRadius:1,background:n<=c.eff?K_.gold:K_.ink4}}/>)}
                </span>:<span style={{color:K_.ink3,fontSize:11}}>—</span>}
              </td>
              <td style={{padding:"13px 16px",fontFamily:fMono,fontSize:11.5,color:c.ev>0?K_.ink:K_.ink3}}>{c.ev>0?c.ev:"—"}</td>
              <td style={{padding:"13px 16px",color:K_.ink2,fontSize:12}}>{c.owner}</td>
              <td style={{padding:"13px 16px",fontFamily:fMono,fontSize:10.5,color:K_.ink3,letterSpacing:"0.04em"}}>{c.lastReviewed||"—"}</td>
            </tr>
          ))}
          {filtered.length===0 && (
            <tr><td colSpan={8} style={{padding:"40px 16px",textAlign:"center",color:K_.ink3,fontStyle:"italic"}}>No controls match the current filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* ── SELECTED CONTROL DETAIL — modal overlay ── */}
    {sel && (
      <div onClick={()=>setSelectedId(null)} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
      <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",maxWidth:960,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
              <span style={{background:K_.s1,color:K_.ink2,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:500,fontFamily:fSans}}>{sel.theme}</span>
              {canEdit ? (
                <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:5,background:statusColor(sel.status)+"15",border:`1px solid ${statusColor(sel.status)}30`,borderRadius:100,padding:"3px 9px 3px 9px"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.status)}}/>
                  <select
                    value={sel.status}
                    disabled={updatingStatus}
                    onChange={e=>updateControlStatus(sel.id, e.target.value)}
                    style={{
                      background:"transparent",border:"none",outline:"none",
                      color:statusColor(sel.status),fontSize:11,fontWeight:600,
                      fontFamily:fSans,cursor:updatingStatus?"wait":"pointer",
                      paddingRight:14,appearance:"none",WebkitAppearance:"none",MozAppearance:"none",
                    }}>
                    {["Implemented","In Progress","Planned","Not Implemented","Compensating Control"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{position:"absolute",right:8,pointerEvents:"none",fontSize:7,color:statusColor(sel.status),opacity:0.7}}>▾</span>
                </div>
              ) : (
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(sel.status)+"15",color:statusColor(sel.status),border:`1px solid ${statusColor(sel.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:11,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.status)}}/>
                  {sel.status}
                </span>
              )}
            </div>
            <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.3}}>{sel.name}</h2>
          </div>
          <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:24,rowGap:22,marginBottom:18}}>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Effectiveness {canEdit && <span style={{color:K_.gold,fontStyle:"italic",textTransform:"none",letterSpacing:0,fontWeight:500}}> — click to set</span>}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {canEdit ? <>
                <span style={{display:"inline-flex",gap:3}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>updateControl(sel.id, {eff: n === sel.eff ? 0 : n})} disabled={updatingStatus}
                      title={`Set effectiveness to ${n}/5${n===sel.eff?" (click again to clear)":""}`}
                      style={{width:14,height:18,borderRadius:3,background:n<=sel.eff?K_.gold:K_.s2,border:"none",padding:0,cursor:updatingStatus?"wait":"pointer",transition:"background .12s, transform .08s"}}
                      onMouseEnter={e=>{if(!updatingStatus)e.currentTarget.style.transform="scaleY(1.1)";}}
                      onMouseLeave={e=>e.currentTarget.style.transform="scaleY(1)"}
                    />
                  ))}
                </span>
                <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:24,color:sel.eff>0?K_.ink:K_.ink3,letterSpacing:"-0.02em"}}>{sel.eff>0?sel.eff:"–"}<span style={{fontSize:14,color:K_.ink3}}>/5</span></span>
              </> : sel.eff>0?<>
                <span style={{display:"inline-flex",gap:3}}>
                  {[1,2,3,4,5].map(n=><span key={n} style={{width:8,height:14,borderRadius:2,background:n<=sel.eff?K_.gold:K_.ink4}}/>)}
                </span>
                <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:24,color:K_.ink,letterSpacing:"-0.02em"}}>{sel.eff}<span style={{fontSize:14,color:K_.ink3}}>/5</span></span>
              </>:<span style={{fontSize:13,color:K_.ink3,fontStyle:"italic"}}>Not yet measured</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Evidence linked</div>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:24,color:K_.ink,letterSpacing:"-0.02em"}}>{sel.ev}<span style={{fontSize:14,color:K_.ink3}}> artefacts</span></div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner {canEdit && !editingOwner && <span onClick={()=>{setOwnerDraft(sel.owner||"");setEditingOwner(true);}} style={{color:K_.gold,fontStyle:"italic",textTransform:"none",letterSpacing:0,fontWeight:500,cursor:"pointer"}}> — edit</span>}</div>
            {editingOwner ? (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={ownerDraft} onChange={e=>setOwnerDraft(e.target.value)} autoFocus
                  onKeyDown={e=>{ if(e.key==="Enter"){updateControl(sel.id,{owner:ownerDraft.trim()});setEditingOwner(false);} if(e.key==="Escape")setEditingOwner(false); }}
                  style={{padding:"6px 10px",border:`1px solid ${K_.lineH}`,borderRadius:8,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",flex:1,minWidth:140}}/>
                <button onClick={()=>{updateControl(sel.id,{owner:ownerDraft.trim()});setEditingOwner(false);}} disabled={updatingStatus}
                  style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:8,padding:"6px 10px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:fSans}}>✓</button>
                <button onClick={()=>setEditingOwner(false)}
                  style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"6px 10px",fontSize:11.5,cursor:"pointer",fontFamily:fSans}}>✗</button>
              </div>
            ) : (
              <div style={{fontSize:14,color:K_.ink,fontWeight:600}}>{sel.owner||<span style={{color:K_.ink3,fontStyle:"italic",fontWeight:400}}>Unassigned</span>}</div>
            )}
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Last reviewed</div>
            <div style={{fontSize:14,color:K_.ink,fontWeight:600,fontFamily:fMono,letterSpacing:"0.04em"}}>{sel.lastReviewed||"Not yet reviewed"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>showToast("Evidence library — coming in next module","info")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
            <span>✦</span> Open evidence
          </button>
          <button onClick={()=>showToast("Control testing scheduler — backend required","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
            Schedule test
          </button>
          <button onClick={()=>setTab("templates")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
            Linked templates →
          </button>
        </div>
      </div>
      </div>
    )}
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: GAP ANALYSIS DASHBOARD
   Derives all gap data from controls in real time.
───────────────────────────────────────────── */
function PageGapAnalysis({setTab,showToast}) {
  /* ─── Same control data as Annex A Tracker — derives gaps live ─── */
  const [controls, dataSource] = useSupabaseTable("annex_a_controls", dbToControl, ANNEX_A_CONTROLS);

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", navy:"#1C1B1F", navy2:"#2A2826",
    navyT:"#F5F2EA", navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", amber:"#B8956A", crit:"#9B3636",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* Derive gaps from Annex A */
  const gaps = controls.filter(c=>c.status==="Planned" || c.status==="Not Implemented");
  const weak = controls.filter(c=>c.status==="In Progress" && c.eff<=3);
  const allOpen = [...gaps, ...weak];
  const total = controls.length;
  const implemented = controls.filter(c=>c.status==="Implemented").length;
  const gapScore = Math.round(100 - (implemented / total * 100));
  const auditReadiness = Math.round(implemented / total * 100);

  /* Theme breakdown */
  const themes = ["Organisational","People","Physical","Technological"];
  const themeStats = themes.map(t=>{
    const inTheme = controls.filter(c=>c.theme===t);
    const imp = inTheme.filter(c=>c.status==="Implemented").length;
    const gp = inTheme.filter(c=>c.status==="Planned" || c.status==="Not Implemented").length;
    return {theme:t, total:inTheme.length, implemented:imp, gaps:gp, pct:Math.round(imp/(inTheme.length||1)*100)};
  });

  /* Priority remediation list — sort gaps by theme criticality */
  const PRIORITY = {Organisational:3, Technological:3, People:2, Physical:1};
  const remediation = allOpen
    .map(c=>({...c, priority:PRIORITY[c.theme]||1 + (c.status==="Not Implemented"?2:0)}))
    .sort((a,b)=>b.priority-a.priority)
    .slice(0,12);

  const sevColor = (theme,status) => {
    if(status==="Not Implemented") return K_.crit;
    if(theme==="Organisational" || theme==="Technological") return K_.amber;
    return K_.gold;
  };

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* HERO */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>Frameworks · Gap Analysis</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            What's missing, <span style={{fontStyle:"italic"}}>ranked.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            Live gap analysis derived from your Annex A control posture. {gaps.length} unfilled controls and {weak.length} weak controls require attention before the next audit.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Audit readiness</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{auditReadiness}<span style={{fontSize:48,color:K_.navyT2,fontStyle:"normal"}}>%</span></div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10}}>{gapScore}% gap score</div>
        </div>
      </div>
    </div>

    {/* TOP STATS */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Unfilled controls", val:String(gaps.length), c:K_.crit, sub:"Planned + Not Implemented"},
        {label:"Weak controls",     val:String(weak.length), c:K_.amber, sub:"Effectiveness ≤ 3"},
        {label:"Implemented",       val:String(implemented), c:K_.sage, sub:`${Math.round(implemented/total*100)}% of total`},
        {label:"High-priority",     val:String(remediation.filter(r=>r.status==="Not Implemented").length), c:K_.crit, sub:"Org + Tech, Not Implemented"},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          <div style={{fontSize:11,color:K_.ink3,marginTop:8}}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* THEME HEATMAP */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18}}>
        <div>
          <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Coverage by theme</div>
          <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:22,letterSpacing:"-0.015em",color:K_.ink,margin:0}}>Where the work lives.</h2>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:18}}>
        {themeStats.map(t=>{
          const c = t.pct>=85?K_.sage : t.pct>=70?K_.gold : K_.crit;
          return <div key={t.theme} style={{background:K_.s1,borderRadius:14,padding:"18px 20px"}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{t.theme}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:14}}>
              <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:34,color:c,letterSpacing:"-0.035em",lineHeight:1}}>{t.pct}</span>
              <span style={{fontSize:14,color:K_.ink3,fontFamily:fMono}}>%</span>
            </div>
            <div style={{height:4,background:K_.s2,borderRadius:2,overflow:"hidden",marginBottom:10}}>
              <div style={{width:`${t.pct}%`,height:"100%",background:c,transition:"width 1.2s cubic-bezier(.16,1,.3,1)"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>
              <span>{t.implemented} of {t.total}</span>
              <span style={{color:t.gaps>0?K_.crit:K_.ink3}}>{t.gaps} gap{t.gaps===1?"":"s"}</span>
            </div>
          </div>;
        })}
      </div>
    </div>

    {/* PRIORITY REMEDIATION LIST */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Priority remediation</div>
          <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:22,letterSpacing:"-0.015em",color:K_.ink,margin:0}}>Top {remediation.length} controls to fix before audit.</h2>
        </div>
        <button onClick={()=>setTab("annexa")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
          <span>✦</span> Open full tracker
        </button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {remediation.map((r,i)=>{
          const sev = sevColor(r.theme,r.status);
          return <div key={r.id} onClick={()=>setTab("annexa")} style={{
            background:K_.s1,borderRadius:12,padding:"14px 16px",
            borderLeft:`4px solid ${sev}`,
            display:"grid",gridTemplateColumns:"auto auto 1fr auto auto auto",gap:14,alignItems:"center",
            cursor:"pointer",transition:"background .12s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background=K_.s2}
          onMouseLeave={e=>e.currentTarget.style.background=K_.s1}>
            <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,fontWeight:700,letterSpacing:"0.06em",minWidth:24}}>#{String(i+1).padStart(2,"0")}</span>
            <span style={{fontFamily:fMono,fontSize:11.5,color:K_.gold,fontWeight:700,letterSpacing:"0.04em",minWidth:54}}>{r.id}</span>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,color:K_.ink,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
              <div style={{fontSize:11,color:K_.ink3,marginTop:3}}>{r.theme} · {r.owner}</div>
            </div>
            <span style={{fontSize:10.5,color:sev,fontFamily:fMono,letterSpacing:"0.04em",fontWeight:700}}>{r.status}</span>
            <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>EFF {r.eff||"—"}/5</span>
            <span style={{color:K_.ink3,fontSize:14}}>→</span>
          </div>;
        })}
      </div>
    </div>

    {/* RECOMMENDED ACTIONS */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
      <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Recommended next actions</div>
      <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:22,letterSpacing:"-0.015em",color:K_.ink,margin:"0 0 20px"}}>Three plays to close the largest gaps.</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14}}>
        {[
          {n:"01", action:"Close A.8.11 Data Masking and A.5.21 Supply-chain controls", impact:"−15% gap score", tab:"annexa"},
          {n:"02", action:"Raise effectiveness on A.5.19–A.5.22 supplier controls from 3 → 4", impact:"−8% gap score", tab:"annexa"},
          {n:"03", action:"Generate evidence for A.8.25–A.8.29 secure-development controls", impact:"−6% gap score", tab:"templates"},
        ].map(a=>(
          <div key={a.n} onClick={()=>setTab(a.tab)} style={{background:K_.s1,borderRadius:14,padding:"18px 20px",cursor:"pointer",transition:"background .12s"}}
          onMouseEnter={e=>e.currentTarget.style.background=K_.s2}
          onMouseLeave={e=>e.currentTarget.style.background=K_.s1}>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:32,color:K_.gold,letterSpacing:"-0.04em",lineHeight:1,marginBottom:14}}>{a.n}</div>
            <div style={{fontSize:13,color:K_.ink,fontWeight:500,lineHeight:1.45,marginBottom:10}}>{a.action}</div>
            <div style={{fontSize:10.5,color:K_.sage,fontFamily:fMono,letterSpacing:"0.06em",fontWeight:700}}>{a.impact}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
/* ─────────────────────────────────────────────
   RISK REGISTER — ISO 27001 § 6.1.2 / § 8.2
   Realistic seed across 7 categories. Each risk has full
   inherent + treatment + residual scoring, linked controls,
   linked use cases. The master risk inventory.
───────────────────────────────────────────── */
const RISK_REGISTER = [
  /* ── Information Security ── */
  {id:"R-001", title:"Unauthorised access to customer PII via misconfigured cloud storage",
    category:"Information Security", owner:"M. Khan (CISO)", asset:"AWS S3 — customer data bucket",
    threat:"External attacker / insider misuse", vulnerability:"Bucket ACL misconfiguration, lack of automated scanning",
    inherentL:4, inherentI:5, treatmentOption:"Mitigate",
    treatmentActions:"AWS Config rules + Macie + quarterly access review + automated public-bucket detection alerting CISO within 15 minutes.",
    residualL:1, residualI:5, status:"In Treatment",
    linkedControls:["A.5.23","A.8.3","A.8.16"], linkedUseCases:[],
    frameworks:["ISO 27001","GDPR","SOC 2"],
    dateIdentified:"2025-09-12", lastReviewed:"2026-03-22", nextReview:"2026-06-22"},

  {id:"R-002", title:"Ransomware attack disabling production systems",
    category:"Information Security", owner:"M. Khan (CISO)", asset:"All production infrastructure",
    threat:"Organised cybercrime", vulnerability:"Patching cadence, email attachment policy, RDP exposure",
    inherentL:4, inherentI:5, treatmentOption:"Mitigate",
    treatmentActions:"EDR on all endpoints + immutable backups + isolated DR environment + tested IR playbook + tabletop exercise twice yearly + cyber insurance.",
    residualL:2, residualI:5, status:"In Treatment",
    linkedControls:["A.5.24","A.5.26","A.5.30","A.8.7","A.8.13"], linkedUseCases:[],
    frameworks:["ISO 27001","ISO 22301"],
    dateIdentified:"2025-06-04", lastReviewed:"2026-04-05", nextReview:"2026-07-05"},

  {id:"R-003", title:"Privileged account compromise leading to lateral movement",
    category:"Information Security", owner:"M. Khan (CISO)", asset:"Domain admin / cloud root accounts",
    threat:"Credential theft, phishing", vulnerability:"Weak MFA enforcement on admin accounts, shared credentials",
    inherentL:3, inherentI:5, treatmentOption:"Mitigate",
    treatmentActions:"Hardware-MFA mandatory for all privileged accounts + PAM tooling (CyberArk) + just-in-time access + 90-day rotation + session recording.",
    residualL:1, residualI:5, status:"Treated",
    linkedControls:["A.5.15","A.8.2","A.8.5"], linkedUseCases:[],
    frameworks:["ISO 27001","SOC 2","NIST CSF"],
    dateIdentified:"2025-03-18", lastReviewed:"2026-02-10", nextReview:"2027-02-10"},

  {id:"R-004", title:"Phishing attack succeeding against finance team — wire fraud",
    category:"Information Security", owner:"M. Khan (CISO)", asset:"Finance email / payment systems",
    threat:"Business email compromise (BEC)", vulnerability:"Email spoofing controls, payment approval workflow",
    inherentL:4, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"DMARC strict, dual-approval for all wire transfers > £10k, mandatory phishing simulations quarterly, callback verification protocol.",
    residualL:2, residualI:3, status:"In Treatment",
    linkedControls:["A.6.3","A.8.7","A.8.23"], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-11-04", lastReviewed:"2026-02-28", nextReview:"2026-05-28"},

  {id:"R-005", title:"Encryption key compromise via HSM misconfiguration",
    category:"Information Security", owner:"M. Khan (CISO)", asset:"AWS KMS / HSM",
    threat:"Insider, accidental disclosure", vulnerability:"Key access policy, rotation schedule",
    inherentL:2, inherentI:5, treatmentOption:"Mitigate",
    treatmentActions:"KMS access via IAM roles only + CloudTrail logging + 365-day rotation + envelope encryption for all data at rest + dual-control for key destruction.",
    residualL:1, residualI:5, status:"Treated",
    linkedControls:["A.8.24"], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-08-15", lastReviewed:"2026-02-05", nextReview:"2027-02-05"},

  /* ── AI Governance ── */
  {id:"R-006", title:"AI model bias affecting hiring decisions (Annex III high-risk)",
    category:"AI Governance", owner:"S. Ali (CAIO)", asset:"HR onboarding AI (GPT-4 Enterprise)",
    threat:"Discriminatory outcomes against protected groups", vulnerability:"Bias in training data, lack of bias testing in deployment",
    inherentL:4, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Mandatory DPIA + bias testing across 12 protected attributes pre-deployment + human-in-the-loop for all hiring decisions + quarterly fairness audits + ISO 42001 § A.7.4 controls.",
    residualL:2, residualI:3, status:"Identified",
    linkedControls:["A.5.34","A.6.3"], linkedUseCases:["uc4"],
    frameworks:["ISO 42001","EU AI Act (Annex III)","GDPR Art.22"],
    dateIdentified:"2026-05-02", lastReviewed:"2026-05-08", nextReview:"2026-06-08"},

  {id:"R-007", title:"AI hallucination in customer-facing chatbot causing financial misstatement",
    category:"AI Governance", owner:"S. Ali (CAIO)", asset:"Contract Review AI (Claude 3.5 Sonnet)",
    threat:"Model error, prompt injection", vulnerability:"No output validation, no human review on critical advice",
    inherentL:3, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Mandatory legal sign-off on every output + structured output validation + prompt injection guardrails + monthly red-teaming + ISO 42001 § A.6.2.",
    residualL:2, residualI:3, status:"In Treatment",
    linkedControls:[], linkedUseCases:["uc1"],
    frameworks:["ISO 42001","EU AI Act"],
    dateIdentified:"2026-04-12", lastReviewed:"2026-04-15", nextReview:"2026-07-15"},

  {id:"R-008", title:"Shadow AI — unauthorised LLM use exposing confidential data",
    category:"AI Governance", owner:"S. Ali (CAIO)", asset:"Employee endpoints, browser sessions",
    threat:"Employees pasting confidential data into public ChatGPT / Claude / Gemini", vulnerability:"No DLP for AI services, no AI usage policy enforcement",
    inherentL:5, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"DLP rules block paste-to-AI on confidential data + approved AI services list + mandatory training + monthly browser session audit + AI usage policy with disciplinary consequences.",
    residualL:3, residualI:2, status:"In Treatment",
    linkedControls:["A.5.10","A.6.3","A.8.12"], linkedUseCases:[],
    frameworks:["ISO 27001","ISO 42001"],
    dateIdentified:"2025-12-08", lastReviewed:"2026-03-10", nextReview:"2026-06-10"},

  {id:"R-009", title:"EU AI Act high-risk classification missed — non-compliance fine",
    category:"AI Governance", owner:"S. Ali (CAIO)", asset:"All AI use cases in registry",
    threat:"Regulatory enforcement", vulnerability:"Manual classification, risk of human error",
    inherentL:3, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Auto-classification in intake form + mandatory CAIO sign-off on tier + quarterly review of all production AI systems against Annex III + legal review for borderline cases.",
    residualL:2, residualI:3, status:"In Treatment",
    linkedControls:[], linkedUseCases:["uc1","uc2","uc3","uc4","uc5","uc6"],
    frameworks:["ISO 42001","EU AI Act"],
    dateIdentified:"2025-10-15", lastReviewed:"2026-04-15", nextReview:"2026-07-15"},

  /* ── Privacy ── */
  {id:"R-010", title:"GDPR Article 32 — inadequate technical and organisational measures",
    category:"Privacy", owner:"R. Patel (CDPO)", asset:"All personal data processing systems",
    threat:"Supervisory authority enforcement, data subject complaints", vulnerability:"Encryption coverage gaps, access log retention",
    inherentL:3, inherentI:5, treatmentOption:"Mitigate",
    treatmentActions:"Full encryption at rest + in transit (all systems by Q3) + Article 32 control matrix mapped to ISO 27001 + annual DPO audit + privacy training mandatory.",
    residualL:2, residualI:4, status:"In Treatment",
    linkedControls:["A.5.34","A.8.24"], linkedUseCases:[],
    frameworks:["GDPR","ISO 27001","ISO 27701"],
    dateIdentified:"2025-07-22", lastReviewed:"2026-02-28", nextReview:"2026-05-28"},

  {id:"R-011", title:"Data subject access request (DSAR) SLA breach — 30-day window",
    category:"Privacy", owner:"R. Patel (CDPO)", asset:"DSAR handling process",
    threat:"Complaints to ICO / supervisory authority", vulnerability:"Manual DSAR workflow, no SLA tracking",
    inherentL:3, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"DSAR portal with automated SLA tracking + escalation at day 20 + monthly KPI review by CDPO + integration with CRM and HR systems for data discovery.",
    residualL:2, residualI:2, status:"Treated",
    linkedControls:["A.5.34"], linkedUseCases:[],
    frameworks:["GDPR","ISO 27701","DPDP Act India"],
    dateIdentified:"2025-04-10", lastReviewed:"2026-02-28", nextReview:"2027-02-28"},

  {id:"R-012", title:"International data transfer post-Schrems II — adequacy gap",
    category:"Privacy", owner:"R. Patel (CDPO)", asset:"Customer data transfers EU → US, EU → India",
    threat:"GDPR enforcement, customer complaints", vulnerability:"Standard contractual clauses not updated, no TIA on file",
    inherentL:4, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Updated SCCs (2021 EU SCCs) signed with all sub-processors + TIA documented per transfer + supplementary measures (encryption, pseudonymisation) + monitoring of jurisdictional adequacy.",
    residualL:2, residualI:3, status:"In Treatment",
    linkedControls:["A.5.34"], linkedUseCases:[],
    frameworks:["GDPR (Art.46)","Schrems II"],
    dateIdentified:"2025-09-30", lastReviewed:"2026-03-05", nextReview:"2026-09-05"},

  /* ── Operational / IT ── */
  {id:"R-013", title:"Single point of failure in payment processing — Stripe API",
    category:"Operational", owner:"D. Lee (Head of IT)", asset:"Payment processing pipeline",
    threat:"Provider outage", vulnerability:"No failover payment provider",
    inherentL:2, inherentI:4, treatmentOption:"Accept",
    treatmentActions:"Risk formally accepted by CIO and CFO. Stripe SLA 99.99%. Failover to Adyen evaluated — cost/benefit does not justify dual-rail at current revenue. Quarterly review.",
    residualL:2, residualI:4, status:"Accepted",
    linkedControls:["A.5.30","A.8.14"], linkedUseCases:[],
    frameworks:["ISO 27001","ISO 22301"],
    dateIdentified:"2025-08-20", lastReviewed:"2026-01-25", nextReview:"2026-04-25"},

  {id:"R-014", title:"DDoS attack on customer portal",
    category:"Operational", owner:"D. Lee (Head of IT)", asset:"Customer portal / public APIs",
    threat:"Volumetric / application-layer DDoS", vulnerability:"WAF rules, rate limiting coverage",
    inherentL:3, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"CloudFlare Enterprise + AWS Shield Advanced + rate limiting on all public endpoints + runbook tested quarterly + on-call rotation.",
    residualL:2, residualI:2, status:"Treated",
    linkedControls:["A.8.20","A.8.21"], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-05-15", lastReviewed:"2026-02-22", nextReview:"2027-02-22"},

  {id:"R-015", title:"Manual audit log gaps during incident — chain of custody broken",
    category:"Operational", owner:"M. Khan (CISO)", asset:"All systems generating audit logs",
    threat:"Forensic investigation failure, regulatory query unanswered", vulnerability:"Some legacy systems not centrally logged",
    inherentL:3, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"SIEM coverage of all production systems by Q4 2026 + log integrity via WORM storage + 365-day retention + monthly log review by CISO.",
    residualL:2, residualI:2, status:"In Treatment",
    linkedControls:["A.5.28","A.8.15","A.8.16"], linkedUseCases:[],
    frameworks:["ISO 27001","SOC 2"],
    dateIdentified:"2026-01-08", lastReviewed:"2026-02-15", nextReview:"2026-05-15"},

  /* ── Supply Chain ── */
  {id:"R-016", title:"Third-party supplier breach (e.g. SaaS provider compromise)",
    category:"Supply Chain", owner:"M. Khan (CISO)", asset:"Customer data shared with critical SaaS suppliers",
    threat:"Supplier security failure", vulnerability:"Supplier due diligence depth, no continuous monitoring",
    inherentL:4, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Tier-1 supplier annual SOC 2 review + tier-2 quarterly questionnaire + continuous monitoring via SecurityScorecard + breach notification clause in all contracts + supplier exit plan.",
    residualL:2, residualI:4, status:"In Treatment",
    linkedControls:["A.5.19","A.5.20","A.5.21","A.5.22"], linkedUseCases:[],
    frameworks:["ISO 27001","DORA"],
    dateIdentified:"2025-11-08", lastReviewed:"2026-04-01", nextReview:"2026-07-01"},

  {id:"R-017", title:"Source code exfiltration via developer tooling (e.g. Copilot, ChatGPT, browser extension)",
    category:"Supply Chain", owner:"K. Nakamura (CTO)", asset:"Production source code",
    threat:"Inadvertent code leak", vulnerability:"Developer use of unapproved tools",
    inherentL:2, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"GitHub Copilot Enterprise (no training on code) only + browser-extension allow-list + monthly access review + secrets scanning on all repos.",
    residualL:1, residualI:3, status:"Treated",
    linkedControls:["A.8.4","A.8.28"], linkedUseCases:["uc6"],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-08-10", lastReviewed:"2026-02-15", nextReview:"2027-02-15"},

  {id:"R-018", title:"Vendor security questionnaire backlog — customer trust delays",
    category:"Supply Chain", owner:"M. Khan (CISO)", asset:"Customer trust requests",
    threat:"Lost deals, delayed renewals", vulnerability:"Manual questionnaire response, no trust pack",
    inherentL:3, inherentI:2, treatmentOption:"Mitigate",
    treatmentActions:"Trust center deployment Q3 2026 + AI-assisted questionnaire response + SOC 2 / ISO 27001 attestations pre-loaded + 3-day SLA for response.",
    residualL:2, residualI:2, status:"Identified",
    linkedControls:[], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2026-02-20", lastReviewed:"2026-04-10", nextReview:"2026-06-10"},

  /* ── Compliance ── */
  {id:"R-019", title:"ISO 27001 stage-2 certification audit failure",
    category:"Compliance", owner:"H. Williams (CGO)", asset:"ISMS overall",
    threat:"Major NCR finding", vulnerability:"Annex A control implementation gaps, documentation completeness",
    inherentL:3, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Pre-audit gap analysis Q2 2026 + remediate all open Annex A gaps before Q3 + mock external audit by BSI advisory + SOA review + management review minutes complete.",
    residualL:2, residualI:3, status:"In Treatment",
    linkedControls:[], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-12-01", lastReviewed:"2026-04-10", nextReview:"2026-07-10"},

  {id:"R-020", title:"DORA non-compliance — operational resilience evidence gap",
    category:"Compliance", owner:"H. Williams (CGO)", asset:"Operational resilience programme",
    threat:"Regulatory enforcement (Jan 2025 effective)", vulnerability:"Third-party register, ICT-incident reporting maturity",
    inherentL:3, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"DORA gap assessment Q2 + third-party register linked to supplier evaluations + ICT incident reporting playbook + threat-led penetration testing (TLPT) annually.",
    residualL:2, residualI:2, status:"Identified",
    linkedControls:["A.5.30"], linkedUseCases:[],
    frameworks:["DORA","ISO 27001"],
    dateIdentified:"2026-01-15", lastReviewed:"2026-04-01", nextReview:"2026-07-01"},

  /* ── Physical ── */
  {id:"R-021", title:"Office break-in — laptop / hardware token loss",
    category:"Physical", owner:"Facilities", asset:"Office laptops, hardware tokens",
    threat:"Burglary, opportunistic theft", vulnerability:"Building access controls, asset tracking",
    inherentL:2, inherentI:3, treatmentOption:"Mitigate",
    treatmentActions:"All laptops full-disk encrypted + remote wipe via MDM + hardware tokens issued individually + after-hours access logged + alarmed perimeter + CCTV.",
    residualL:1, residualI:2, status:"Treated",
    linkedControls:["A.7.1","A.7.2","A.7.4","A.7.10"], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-06-30", lastReviewed:"2026-01-25", nextReview:"2027-01-25"},

  /* ── HR / Insider ── */
  {id:"R-022", title:"Insider threat — departing engineer with admin access",
    category:"Information Security", owner:"M. Khan (CISO) + J. Brooks (HR)", asset:"Production systems, source code",
    threat:"Malicious or accidental data exfil at termination", vulnerability:"Notice-period access controls, exit process",
    inherentL:3, inherentI:4, treatmentOption:"Mitigate",
    treatmentActions:"Immediate access revocation on notice of departure + reduced access during notice period + DLP monitoring elevated + post-exit log review + recovery of all assets + NDA reaffirmed.",
    residualL:2, residualI:3, status:"Treated",
    linkedControls:["A.6.5","A.5.11","A.5.18"], linkedUseCases:[],
    frameworks:["ISO 27001"],
    dateIdentified:"2025-09-08", lastReviewed:"2026-02-14", nextReview:"2027-02-14"},
];

/* ─────────────────────────────────────────────
   PAGE: RISK REGISTER
───────────────────────────────────────────── */
function PageRiskRegister({setTab,showToast}) {
  const [catFilter,setCatFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data from Supabase, with constant fallback ─── */
  const [risks, dataSource, setRisks] = useSupabaseTable("risks", dbToRisk, RISK_REGISTER);

  /* ─── Edit-mode state ─── */
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);    /* draft copy of the selected risk */
  const [saving, setSaving] = useState(false);
  const canEdit = dataSource === "live";

  /* ─── Add-new-risk state ─── */
  const [addMode, setAddMode] = useState(false);
  const [newRisk, setNewRisk] = useState(null);
  const [adding, setAdding] = useState(false);
  /* Generate next available R-XXX id */
  const nextRiskId = () => {
    const nums = risks
      .map(r => parseInt((r.id||"").replace(/^R-?/i,""),10))
      .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return "R-" + String(next).padStart(3,"0");
  };
  const openAddRisk = () => {
    if(!supabase){ showToast("Connect Supabase to add risks","info"); return; }
    setNewRisk({
      title:"", category:"Information Security", owner:"",
      asset:"", threat:"", vulnerability:"",
      inherentL:3, inherentI:3,
      treatmentOption:"Mitigate", treatmentActions:"",
      residualL:2, residualI:2,
      status:"Identified",
      linkedControls:[], linkedUseCases:[], frameworks:[],
      dateIdentified: new Date().toISOString().slice(0,10),
      nextReview:"",
    });
    setAddMode(true);
  };

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* Score → severity band */
  const severityFor = (score) => {
    if(score>=20) return {label:"Critical", color:K_.crit};
    if(score>=13) return {label:"High",     color:K_.crit};
    if(score>=5)  return {label:"Medium",   color:K_.amber};
    return                {label:"Low",      color:K_.sage};
  };
  const statusColor = s => ({
    "Identified":K_.crit, "In Treatment":K_.amber, "Treated":K_.sage,
    "Accepted":K_.ink2, "Closed":K_.ink3,
  })[s] || K_.ink3;
  const categoryColor = c => ({
    "Information Security":K_.navy, "AI Governance":K_.gold,
    "Privacy":K_.crit, "Operational":K_.amber, "Supply Chain":K_.sage,
    "Compliance":K_.ink2, "Physical":K_.ink3,
  })[c] || K_.ink3;

  /* Aggregate stats */
  const total = risks.length;
  const enriched = risks.map(r=>({
    ...r, inherentScore:r.inherentL*r.inherentI, residualScore:r.residualL*r.residualI,
  }));
  const critical = enriched.filter(r=>r.residualScore>=20).length;
  const high     = enriched.filter(r=>r.residualScore>=13 && r.residualScore<20).length;
  const aboveAppetite = enriched.filter(r=>r.residualScore>=13).length;
  const treated  = enriched.filter(r=>r.status==="Treated").length;

  /* Distinct categories for filter pills */
  const allCategories = Array.from(new Set(risks.map(r=>r.category)));
  const allStatuses   = ["Identified","In Treatment","Treated","Accepted","Closed"];

  /* Filtered + enriched */
  const filtered = enriched.filter(r=>{
    if(catFilter!=="all" && r.category!==catFilter) return false;
    if(statusFilter!=="all" && r.status!==statusFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  /* Sort: residual score desc by default */
  filtered.sort((a,b)=>b.residualScore-a.residualScore);

  const sel = selectedId ? enriched.find(r=>r.id===selectedId) : null;

  /* Esc key closes the detail modal (unless in the middle of editing) */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === "Escape" && !editMode) setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editMode]);

  /* Visualise L×I as a tiny 5×5 dot grid */
  const ScoreMatrix = ({L, I, color, size=4}) => (
    <div style={{display:"inline-grid",gridTemplateColumns:`repeat(5,${size+1}px)`,gridTemplateRows:`repeat(5,${size+1}px)`,gap:1}}>
      {Array.from({length:25}).map((_,i)=>{
        const col = i%5, row = 4-Math.floor(i/5);
        const inside = col<L && row<I;
        return <span key={i} style={{width:size,height:size,borderRadius:1,background:inside?color:K_.ink4}}/>;
      })}
    </div>
  );

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* HERO */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>ISO 27001 § 6.1.2 / § 8.2 · Risk Register</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            Every risk, <span style={{fontStyle:"italic"}}>scored & treated.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            {total} risks across seven categories. Inherent L×I → treatment → residual L×I. Linked to Annex A controls, AI use cases, and the frameworks they impact.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Above risk appetite</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{aboveAppetite}</div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10}}>residual score ≥ 13 — needs attention</div>
        </div>
      </div>
    </div>

    {/* STATS STRIP */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Total risks",  val:String(total), c:K_.ink},
        {label:"Critical",     val:String(critical), c:K_.crit, sub:"residual ≥ 20"},
        {label:"High",         val:String(high), c:K_.crit, sub:"residual 13–19"},
        {label:"Treated",      val:String(treated), c:K_.sage, sub:"residual ≤ appetite"},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          {s.sub && <div style={{fontSize:11,color:K_.ink3,marginTop:8}}>{s.sub}</div>}
        </div>
      ))}
    </div>

    {/* FILTERS */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ID, title, owner, category…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Category</span>
        {[["all","All"],...allCategories.map(c=>[c,c])].map(([k,l])=>(
          <button key={k} onClick={()=>setCatFilter(k)} style={{
            background:catFilter===k?(k==="all"?K_.navy:categoryColor(k)):"transparent",
            color:catFilter===k?"#fff":K_.ink2,
            border:`1px solid ${catFilter===k?(k==="all"?K_.navy:categoryColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:catFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Status</span>
        {[["all","All"],...allStatuses.map(s=>[s,s])].map(([k,l])=>(
          <button key={k} onClick={()=>setStatusFilter(k)} style={{
            background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
            color:statusFilter===k?"#fff":K_.ink2,
            border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:statusFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
    </div>

    {/* RISK TABLE */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px",marginBottom:10,gap:14,flexWrap:"wrap"}}>
      <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>
        Showing {filtered.length} risk{filtered.length===1?"":"s"} · sorted by residual score
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:11,color:K_.ink3,fontStyle:"italic"}}>
          {sel ? <>Selected: <strong style={{color:K_.gold,fontStyle:"normal",fontFamily:fMono,letterSpacing:"0.04em"}}>{sel.id}</strong></> : "Click any row to view details"}
        </div>
        <button onClick={openAddRisk} disabled={!canEdit}
          title={canEdit?"Log a new risk":"Add requires live DB connection"}
          style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"7px 14px",fontSize:11.5,fontWeight:700,cursor:canEdit?"pointer":"not-allowed",opacity:canEdit?1:0.55,fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:14,lineHeight:1}}>+</span> New risk
        </button>
      </div>
    </div>
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"4px 0",marginBottom:14,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:1000}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${K_.line}`}}>
            {["Ref","Risk","Category","Inherent","→","Residual","Treatment","Status","Owner"].map((h,i)=>(
              <th key={h+i} style={{textAlign:i===4?"center":"left",padding:"14px 14px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(r=>{
            const iSev = severityFor(r.inherentScore);
            const rSev = severityFor(r.residualScore);
            return <tr key={r.id} onClick={()=>setSelectedId(r.id===selectedId?null:r.id)} style={{
              borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s, box-shadow .12s",
              background:selectedId===r.id?K_.gold+"18":"transparent",
              boxShadow:selectedId===r.id?`inset 4px 0 0 ${K_.gold}`:"none",
            }}
            onMouseEnter={e=>{if(selectedId!==r.id)e.currentTarget.style.background=K_.bg;}}
            onMouseLeave={e=>{if(selectedId!==r.id)e.currentTarget.style.background="transparent";}}>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:11.5,color:K_.gold,fontWeight:700,letterSpacing:"0.04em"}}>{r.id}</td>
              <td style={{padding:"14px",color:K_.ink,fontWeight:500,maxWidth:380,lineHeight:1.3}}>{r.title}</td>
              <td style={{padding:"14px"}}>
                <span style={{background:categoryColor(r.category)+"15",color:categoryColor(r.category),border:`1px solid ${categoryColor(r.category)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>{r.category}</span>
              </td>
              <td style={{padding:"14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <ScoreMatrix L={r.inherentL} I={r.inherentI} color={iSev.color}/>
                  <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:18,color:iSev.color,letterSpacing:"-0.03em"}}>{r.inherentScore}</span>
                </div>
              </td>
              <td style={{padding:"14px",textAlign:"center",color:K_.ink3}}>→</td>
              <td style={{padding:"14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <ScoreMatrix L={r.residualL} I={r.residualI} color={rSev.color}/>
                  <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:18,color:rSev.color,letterSpacing:"-0.03em"}}>{r.residualScore}</span>
                </div>
              </td>
              <td style={{padding:"14px",fontSize:11.5,color:K_.ink2,fontWeight:500}}>{r.treatmentOption}</td>
              <td style={{padding:"14px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(r.status)+"15",color:statusColor(r.status),border:`1px solid ${statusColor(r.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(r.status)}}/>
                  {r.status}
                </span>
              </td>
              <td style={{padding:"14px",color:K_.ink2,fontSize:12}}>{r.owner}</td>
            </tr>;
          })}
          {filtered.length===0 && (
            <tr><td colSpan={9} style={{padding:"40px 16px",textAlign:"center",color:K_.ink3,fontStyle:"italic"}}>No risks match the current filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* SELECTED RISK DETAIL — modal overlay */}
    {sel && (() => {
      const iSev = severityFor(sel.inherentScore);
      const rSev = severityFor(sel.residualScore);
      return <div onClick={()=>{if(!editMode)setSelectedId(null);}} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
      <div id="risk-detail-panel" onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 32px",maxWidth:980,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,gap:14,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 400px"}}>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
              <span style={{background:categoryColor(sel.category)+"15",color:categoryColor(sel.category),border:`1px solid ${categoryColor(sel.category)}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>{sel.category}</span>
              <span style={{background:statusColor(sel.status)+"15",color:statusColor(sel.status),border:`1px solid ${statusColor(sel.status)}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.status)}}/>
                {sel.status}
              </span>
            </div>
            <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.3}}>{sel.title}</h2>
          </div>
          <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
        </div>

        {/* Threat + Vulnerability */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Threat</div>
            <div style={{fontSize:13.5,color:K_.ink,lineHeight:1.5}}>{sel.threat}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Vulnerability</div>
            <div style={{fontSize:13.5,color:K_.ink,lineHeight:1.5}}>{sel.vulnerability}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Asset at risk</div>
            <div style={{fontSize:13.5,color:K_.ink,lineHeight:1.5}}>{sel.asset}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner</div>
            <div style={{fontSize:13.5,color:K_.ink,fontWeight:600,lineHeight:1.5}}>{sel.owner}</div>
          </div>
        </div>

        {/* Scoring flow: inherent → treatment → residual */}
        <div style={{background:K_.s1,borderRadius:14,padding:"22px 24px",marginBottom:22}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto 1fr",gap:24,alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Inherent risk</div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <ScoreMatrix L={sel.inherentL} I={sel.inherentI} color={iSev.color} size={6}/>
                <div>
                  <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:34,color:iSev.color,letterSpacing:"-0.04em",lineHeight:1}}>{sel.inherentScore}</div>
                  <div style={{fontSize:11,color:iSev.color,fontWeight:700,fontFamily:fMono,letterSpacing:"0.04em",marginTop:4}}>{iSev.label.toUpperCase()}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:K_.ink3,marginTop:8,fontFamily:fMono,letterSpacing:"0.04em"}}>L {sel.inherentL} × I {sel.inherentI}</div>
            </div>
            <span style={{color:K_.ink3,fontSize:22}}>→</span>
            <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Treatment</div>
              <div style={{fontSize:18,color:K_.ink,fontWeight:700,fontFamily:fSans,letterSpacing:"-0.005em"}}>{sel.treatmentOption}</div>
              <div style={{fontSize:11,color:K_.ink3,marginTop:6,fontFamily:fMono,letterSpacing:"0.04em"}}>strategy applied</div>
            </div>
            <span style={{color:K_.ink3,fontSize:22}}>→</span>
            <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Residual risk</div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <ScoreMatrix L={sel.residualL} I={sel.residualI} color={rSev.color} size={6}/>
                <div>
                  <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:34,color:rSev.color,letterSpacing:"-0.04em",lineHeight:1}}>{sel.residualScore}</div>
                  <div style={{fontSize:11,color:rSev.color,fontWeight:700,fontFamily:fMono,letterSpacing:"0.04em",marginTop:4}}>{rSev.label.toUpperCase()}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:K_.ink3,marginTop:8,fontFamily:fMono,letterSpacing:"0.04em"}}>L {sel.residualL} × I {sel.residualI}</div>
            </div>
          </div>
        </div>

        {/* Treatment actions */}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Treatment actions</div>
          <div style={{fontSize:13.5,color:K_.ink,lineHeight:1.6,background:K_.s1,padding:"16px 20px",borderRadius:12,borderLeft:`3px solid ${K_.gold}`}}>{sel.treatmentActions}</div>
        </div>

        {/* Linked entities */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:24,marginBottom:18}}>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Linked Annex A controls</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.linkedControls.length>0 ? sel.linkedControls.map(c=>(
                <span key={c} onClick={(e)=>{e.stopPropagation();setTab("annexa");}} style={{background:K_.navy+"10",color:K_.navy,border:`1px solid ${K_.navy}25`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fMono,letterSpacing:"0.02em",fontWeight:600,cursor:"pointer"}}>{c}</span>
              )) : <span style={{color:K_.ink3,fontSize:12,fontStyle:"italic"}}>none</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Linked AI use cases</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.linkedUseCases.length>0 ? sel.linkedUseCases.map(uc=>(
                <span key={uc} onClick={(e)=>{e.stopPropagation();setTab("usecases");}} style={{background:K_.gold+"15",color:K_.goldText,border:`1px solid ${K_.gold}40`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fMono,letterSpacing:"0.04em",fontWeight:700,cursor:"pointer"}}>{uc.toUpperCase()}</span>
              )) : <span style={{color:K_.ink3,fontSize:12,fontStyle:"italic"}}>none</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Frameworks</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.frameworks.map((f,i)=>(
                <span key={i} style={{background:K_.s1,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fSans,fontWeight:500}}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dates + actions */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:18,borderTop:`1px solid ${K_.line}`,gap:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:30,fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",flexWrap:"wrap"}}>
            <span>Identified: <strong style={{color:K_.ink2}}>{sel.dateIdentified}</strong></span>
            <span>Last reviewed: <strong style={{color:K_.ink2}}>{sel.lastReviewed}</strong></span>
            <span>Next review: <strong style={{color:K_.ink2}}>{sel.nextReview}</strong></span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button
              onClick={()=>{
                if(!canEdit){ showToast("Connect Supabase to enable edits","info"); return; }
                setEditForm({...sel});
                setEditMode(true);
              }}
              disabled={saving}
              style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"8px 16px",fontSize:11.5,fontWeight:700,cursor:canEdit?"pointer":"not-allowed",opacity:canEdit?1:0.55,fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}
              title={canEdit?"Edit this risk":"Edit requires live DB connection"}
            >
              <span>✦</span> Edit risk
            </button>
            <button onClick={()=>showToast("Risk treatment plan — opens next module","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"8px 16px",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
              Treatment plan →
            </button>
          </div>
        </div>

        {/* ─── INLINE EDIT FORM — appears below detail panel when editMode is true ─── */}
        {editMode && editForm && (
          <div style={{marginTop:20,paddingTop:20,borderTop:`2px solid ${K_.gold}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700}}>Editing</span>
              <span style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
              {/* Title */}
              <div style={{gridColumn:"1 / -1"}}>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Title</label>
                <input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})}
                  style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
              </div>

              {/* Status */}
              <div>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Status</label>
                <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}
                  style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                  {["Identified","In Treatment","Treated","Accepted","Closed"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Owner */}
              <div>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner</label>
                <input value={editForm.owner||""} onChange={e=>setEditForm({...editForm,owner:e.target.value})}
                  style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
              </div>

              {/* Treatment option */}
              <div>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Treatment</label>
                <select value={editForm.treatmentOption||""} onChange={e=>setEditForm({...editForm,treatmentOption:e.target.value})}
                  style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                  {["Mitigate","Transfer","Accept","Avoid"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Residual L + I */}
              <div>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Residual L × I</label>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <select value={editForm.residualL||1} onChange={e=>setEditForm({...editForm,residualL:Number(e.target.value)})}
                    style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>L = {n}</option>)}
                  </select>
                  <span style={{fontSize:13,color:K_.ink3}}>×</span>
                  <select value={editForm.residualI||1} onChange={e=>setEditForm({...editForm,residualI:Number(e.target.value)})}
                    style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>I = {n}</option>)}
                  </select>
                  <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:20,color:K_.ink2,letterSpacing:"-0.02em",minWidth:36,textAlign:"right"}}>= {(editForm.residualL||0)*(editForm.residualI||0)}</span>
                </div>
              </div>

              {/* Next review date */}
              <div>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Next review</label>
                <input type="date" value={editForm.nextReview||""} onChange={e=>setEditForm({...editForm,nextReview:e.target.value})}
                  style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
              </div>

              {/* Treatment actions — full width */}
              <div style={{gridColumn:"1 / -1"}}>
                <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Treatment actions</label>
                <textarea value={editForm.treatmentActions||""} onChange={e=>setEditForm({...editForm,treatmentActions:e.target.value})} rows={4}
                  style={{width:"100%",padding:"12px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",resize:"vertical",lineHeight:1.55}}/>
              </div>
            </div>

            {/* Save + Cancel */}
            <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
              <button onClick={()=>{setEditMode(false);setEditForm(null);}} disabled={saving}
                style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:fSans,opacity:saving?0.5:1}}>
                Cancel
              </button>
              <button
                onClick={async ()=>{
                  if(!supabase) return;
                  setSaving(true);
                  /* Map camelCase → snake_case for DB column names */
                  const dbPatch = {
                    title:             editForm.title,
                    status:            editForm.status,
                    owner:             editForm.owner,
                    treatment_option:  editForm.treatmentOption,
                    treatment_actions: editForm.treatmentActions,
                    residual_l:        editForm.residualL,
                    residual_i:        editForm.residualI,
                    next_review:       editForm.nextReview || null,
                    last_reviewed:     new Date().toISOString().slice(0,10),
                  };
                  const { error } = await supabase.from("risks").update(dbPatch).eq("id", sel.id);
                  setSaving(false);
                  if(error){
                    showToast(`Save failed: ${error.message}`, "error");
                    return;
                  }
                  /* Optimistic local update — patch the matching risk in our array */
                  setRisks(rs => rs.map(r => r.id === sel.id ? {...r, ...editForm, lastReviewed: dbPatch.last_reviewed} : r));
                  setEditMode(false);
                  setEditForm(null);
                  showToast(`${sel.id} updated`, "success");
                }}
                disabled={saving}
                style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 22px",fontSize:12,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,opacity:saving?0.7:1}}>
                <span>{saving?"⋯":"✓"}</span> {saving?"Saving…":"Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>;
    })()}

    {/* ─── ADD NEW RISK MODAL ─── */}
    {addMode && newRisk && (
      <div onClick={()=>{if(!adding){setAddMode(false);setNewRisk(null);}}} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
        <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 32px",maxWidth:920,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,gap:14}}>
            <div>
              <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>New risk · {nextRiskId()}</div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:28,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.2}}>Log a new risk</h2>
            </div>
            <button onClick={()=>{setAddMode(false);setNewRisk(null);}} disabled={adding} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:adding?"not-allowed":"pointer",fontWeight:600}}>Close</button>
          </div>

          {/* Form fields */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            {/* Title — full width */}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Risk title <span style={{color:K_.crit}}>*</span></label>
              <input value={newRisk.title} onChange={e=>setNewRisk({...newRisk,title:e.target.value})} placeholder="e.g. Unauthorised access to customer PII via stolen credentials"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Category + Owner */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Category</label>
              <select value={newRisk.category} onChange={e=>setNewRisk({...newRisk,category:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Information Security","AI Governance","Privacy","Operational","Supply Chain","Compliance","Physical"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner <span style={{color:K_.crit}}>*</span></label>
              <input value={newRisk.owner} onChange={e=>setNewRisk({...newRisk,owner:e.target.value})} placeholder="e.g. Sarah Chen (CISO)"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Asset + Threat + Vulnerability */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Asset</label>
              <input value={newRisk.asset} onChange={e=>setNewRisk({...newRisk,asset:e.target.value})} placeholder="e.g. Customer database"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Threat</label>
              <input value={newRisk.threat} onChange={e=>setNewRisk({...newRisk,threat:e.target.value})} placeholder="e.g. External attacker"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Vulnerability</label>
              <input value={newRisk.vulnerability} onChange={e=>setNewRisk({...newRisk,vulnerability:e.target.value})} placeholder="e.g. Weak password policy, no MFA on admin accounts"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Inherent L × I */}
            <div style={{gridColumn:"1 / -1",paddingTop:8}}>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Inherent likelihood × impact (before any treatment)</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <select value={newRisk.inherentL} onChange={e=>setNewRisk({...newRisk,inherentL:Number(e.target.value)})}
                  style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>L = {n}</option>)}
                </select>
                <span style={{fontSize:13,color:K_.ink3}}>×</span>
                <select value={newRisk.inherentI} onChange={e=>setNewRisk({...newRisk,inherentI:Number(e.target.value)})}
                  style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>I = {n}</option>)}
                </select>
                <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:22,color:K_.ink2,letterSpacing:"-0.02em",minWidth:64,textAlign:"right"}}>= {newRisk.inherentL*newRisk.inherentI}</span>
              </div>
            </div>

            {/* Treatment + Actions */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Treatment option</label>
              <select value={newRisk.treatmentOption} onChange={e=>setNewRisk({...newRisk,treatmentOption:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Mitigate","Transfer","Accept","Avoid"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Next review</label>
              <input type="date" value={newRisk.nextReview} onChange={e=>setNewRisk({...newRisk,nextReview:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Treatment actions</label>
              <textarea value={newRisk.treatmentActions} onChange={e=>setNewRisk({...newRisk,treatmentActions:e.target.value})} rows={3} placeholder="e.g. Enforce MFA across all admin accounts. Deploy SIEM correlation rule. Quarterly access review."
                style={{width:"100%",padding:"12px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",resize:"vertical",lineHeight:1.55}}/>
            </div>

            {/* Residual L × I */}
            <div style={{gridColumn:"1 / -1"}}>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Residual likelihood × impact (after treatment is in place)</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <select value={newRisk.residualL} onChange={e=>setNewRisk({...newRisk,residualL:Number(e.target.value)})}
                  style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>L = {n}</option>)}
                </select>
                <span style={{fontSize:13,color:K_.ink3}}>×</span>
                <select value={newRisk.residualI} onChange={e=>setNewRisk({...newRisk,residualI:Number(e.target.value)})}
                  style={{padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer",flex:1}}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>I = {n}</option>)}
                </select>
                <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:22,color:K_.ink2,letterSpacing:"-0.02em",minWidth:64,textAlign:"right"}}>= {newRisk.residualL*newRisk.residualI}</span>
              </div>
            </div>
          </div>

          {/* Save + Cancel */}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
            <button onClick={()=>{setAddMode(false);setNewRisk(null);}} disabled={adding}
              style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:adding?"not-allowed":"pointer",fontFamily:fSans,opacity:adding?0.5:1}}>
              Cancel
            </button>
            <button
              onClick={async ()=>{
                if(!supabase) return;
                if(!newRisk.title.trim()){ showToast("Title is required","error"); return; }
                if(!newRisk.owner.trim()){ showToast("Owner is required","error"); return; }
                setAdding(true);
                const id = nextRiskId();
                const today = new Date().toISOString().slice(0,10);
                const dbRow = {
                  id,
                  title:             newRisk.title.trim(),
                  category:          newRisk.category,
                  owner:             newRisk.owner.trim(),
                  asset:             newRisk.asset || null,
                  threat:            newRisk.threat || null,
                  vulnerability:     newRisk.vulnerability || null,
                  inherent_l:        newRisk.inherentL,
                  inherent_i:        newRisk.inherentI,
                  treatment_option:  newRisk.treatmentOption,
                  treatment_actions: newRisk.treatmentActions || null,
                  residual_l:        newRisk.residualL,
                  residual_i:        newRisk.residualI,
                  status:            "Identified",
                  linked_controls:   [],
                  linked_use_cases:  [],
                  frameworks:        [],
                  date_identified:   today,
                  last_reviewed:     today,
                  next_review:       newRisk.nextReview || null,
                };
                const { error } = await supabase.from("risks").insert(dbRow);
                setAdding(false);
                if(error){
                  showToast(`Add failed: ${error.message}`, "error");
                  return;
                }
                /* Optimistic local update — prepend the new risk */
                setRisks(rs => [...rs, dbToRisk(dbRow)]);
                setAddMode(false);
                setNewRisk(null);
                showToast(`${id} logged`, "success");
              }}
              disabled={adding}
              style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 22px",fontSize:12,fontWeight:700,cursor:adding?"not-allowed":"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,opacity:adding?0.7:1}}>
              <span>{adding?"⋯":"+"}</span> {adding?"Logging…":"Log risk"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>;
}
/* ─────────────────────────────────────────────
   PAGE: STATEMENT OF APPLICABILITY (ISO 27001 § 6.1.3)
   The auditor-facing document. Same 93 controls as Annex A
   Tracker but viewed through applicability lens.
───────────────────────────────────────────── */

/* Not-applicable justifications for the 4 controls excluded from scope */
const SOA_NA_JUSTIFICATIONS = {
  "A.5.6":  "Organisation is too small to justify formal participation in special interest groups. Threat intelligence (A.5.7) and supplier monitoring (A.5.22) provide equivalent coverage.",
  "A.7.11": "All production infrastructure is fully cloud-based (AWS / Azure). Supporting utilities (power, HVAC, water) are inherited from cloud provider physical security obligations as documented in Cloud Security Policy.",
  "A.7.12": "No on-premises data centre cabling within ISMS scope. All connectivity is via cloud provider networks or commodity internet. Office network cabling falls outside ISMS scope per scope statement.",
  "A.8.30": "All software development is performed in-house by employees. No outsourced development arrangements in scope. Reassessed annually as part of supplier review.",
};

function PageSOA({setTab,showToast}) {
  const [themeFilter,setThemeFilter]=useState("all");
  const [applicabilityFilter,setApplicabilityFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data — annex A controls (with naJustification already on the row) ─── */
  const [controls, dataSource] = useSupabaseTable("annex_a_controls", dbToControl, ANNEX_A_CONTROLS);

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* Enrich controls with applicability info.
     When live: every row already has na_justification populated by the
     seed. When falling back to the local ANNEX_A_CONTROLS constant
     (no Supabase), use SOA_NA_JUSTIFICATIONS map to apply the 4 N/A
     justifications by id — same result either way. */
  const enriched = controls.map(c => {
    const naJust = c.naJustification ?? SOA_NA_JUSTIFICATIONS[c.id] ?? null;
    return {
      ...c,
      applicable: naJust ? false : (c.applicable !== false),
      naJustification: naJust,
    };
  });

  const statusColor = s => ({
    "Implemented":K_.sage, "In Progress":K_.gold, "Planned":K_.amber,
    "Not Implemented":K_.crit, "Compensating Control":K_.amber,
  })[s] || K_.ink3;

  /* Stats */
  const total = enriched.length;
  const applicable = enriched.filter(c=>c.applicable).length;
  const notApplicable = enriched.filter(c=>!c.applicable).length;
  const implemented = enriched.filter(c=>c.applicable && c.status==="Implemented").length;
  const coverage = Math.round(implemented / applicable * 100);

  const THEMES = [
    {id:"all", label:"All themes", count:total},
    {id:"Organisational", label:"A.5 Organisational", count:37},
    {id:"People",         label:"A.6 People",         count:8},
    {id:"Physical",       label:"A.7 Physical",       count:14},
    {id:"Technological",  label:"A.8 Technological",  count:34},
  ];

  const filtered = enriched.filter(c=>{
    if(themeFilter!=="all" && c.theme!==themeFilter) return false;
    if(applicabilityFilter==="applicable" && !c.applicable) return false;
    if(applicabilityFilter==="na" && c.applicable) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sel = selectedId ? enriched.find(c=>c.id===selectedId) : null;

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* HERO */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <button onClick={()=>setTab("iso27")} style={{background:"none",border:"none",color:K_.navyT2,fontSize:11,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",padding:0,marginBottom:18,fontWeight:500}}>← ISO 27001 Workspace</button>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>ISO 27001 § 6.1.3 · Statement of Applicability</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            The auditor's <span style={{fontStyle:"italic"}}>document.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            Every Annex A control with its applicability decision, justification, and current implementation status. The single document an external auditor reviews to confirm ISMS scope coverage.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Coverage</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{coverage}<span style={{fontSize:48,color:K_.navyT2,fontStyle:"normal"}}>%</span></div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10}}>{implemented} of {applicable} applicable controls implemented</div>
        </div>
      </div>
    </div>

    {/* DOCUMENT METADATA STRIP */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"22px 28px",marginBottom:14,display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:24}}>
      {[
        ["Document version","v0.9 · in review"],
        ["Approval status","Pending CISO"],
        ["ISMS scope","Production services + HQ"],
        ["Reference standard","ISO/IEC 27001:2022"],
        ["Owner","M. Khan (CISO)"],
      ].map(([l,v])=>(
        <div key={l}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
          <div style={{fontSize:13,color:K_.ink,fontWeight:600,lineHeight:1.3}}>{v}</div>
        </div>
      ))}
    </div>

    {/* STATS */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Total controls",   val:String(total), c:K_.ink},
        {label:"Applicable",       val:String(applicable), c:K_.sage, sub:`${Math.round(applicable/total*100)}% of Annex A`},
        {label:"Not Applicable",   val:String(notApplicable), c:K_.ink3, sub:"with justifications"},
        {label:"Implemented",      val:String(implemented), c:K_.gold, sub:`of ${applicable} applicable`},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          {s.sub && <div style={{fontSize:11,color:K_.ink3,marginTop:8}}>{s.sub}</div>}
        </div>
      ))}
    </div>

    {/* FILTERS */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {THEMES.map(t=>(
          <button key={t.id} onClick={()=>setThemeFilter(t.id)} style={{
            background:themeFilter===t.id?K_.navy:"transparent",
            color:themeFilter===t.id?K_.navyT:K_.ink2,
            border:`1px solid ${themeFilter===t.id?K_.navy:K_.line}`,
            borderRadius:100,padding:"7px 14px",
            fontSize:12,fontWeight:themeFilter===t.id?600:500,fontFamily:fSans,cursor:"pointer",
            display:"inline-flex",alignItems:"center",gap:7,
          }}>
            <span>{t.label}</span>
            <span style={{fontSize:10,opacity:0.7,fontFamily:fMono}}>{t.count}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by control ID or name…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600}}>Applicability</span>
          {[["all","All"],["applicable","Applicable"],["na","Not Applicable"]].map(([k,l])=>(
            <button key={k} onClick={()=>setApplicabilityFilter(k)} style={{
              background:applicabilityFilter===k?K_.navy:"transparent",
              color:applicabilityFilter===k?"#fff":K_.ink2,
              border:`1px solid ${applicabilityFilter===k?K_.navy:K_.line}`,
              borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:applicabilityFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>
        <button onClick={()=>showToast("SOA export to Excel — coming with backend","info")} style={{
          marginLeft:"auto",background:K_.gold,color:K_.goldText,
          border:"none",borderRadius:100,padding:"9px 18px",
          fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,
          display:"inline-flex",alignItems:"center",gap:6,
        }}>
          <span>⤓</span> Export SOA
        </button>
      </div>
    </div>

    {/* TABLE */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"4px 0",marginBottom:14,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:900}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${K_.line}`}}>
            {["Ref","Theme","Control","Applicable","Status / Justification","Evidence","Owner"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"14px 14px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(c=>(
            <tr key={c.id} onClick={()=>setSelectedId(c.id===selectedId?null:c.id)} style={{
              borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s",
              background:selectedId===c.id?K_.s1:"transparent",opacity:c.applicable?1:0.78,
            }}
            onMouseEnter={e=>{if(selectedId!==c.id)e.currentTarget.style.background=K_.bg;}}
            onMouseLeave={e=>{if(selectedId!==c.id)e.currentTarget.style.background="transparent";}}>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:11.5,color:K_.gold,fontWeight:700,letterSpacing:"0.04em"}}>{c.id}</td>
              <td style={{padding:"14px",color:K_.ink2,fontSize:11.5}}>{c.theme}</td>
              <td style={{padding:"14px",color:K_.ink,fontWeight:500,maxWidth:340}}>{c.name}</td>
              <td style={{padding:"14px"}}>
                {c.applicable
                  ? <span style={{display:"inline-flex",alignItems:"center",gap:5,background:K_.sage+"15",color:K_.sage,border:`1px solid ${K_.sage}30`,borderRadius:100,padding:"3px 10px",fontSize:10.5,fontWeight:700}}><span style={{width:5,height:5,borderRadius:"50%",background:K_.sage}}/>Yes</span>
                  : <span style={{display:"inline-flex",alignItems:"center",gap:5,background:K_.ink3+"15",color:K_.ink3,border:`1px solid ${K_.ink3}30`,borderRadius:100,padding:"3px 10px",fontSize:10.5,fontWeight:700}}><span style={{width:5,height:5,borderRadius:"50%",background:K_.ink3}}/>No</span>}
              </td>
              <td style={{padding:"14px",maxWidth:380}}>
                {c.applicable
                  ? <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(c.status)+"15",color:statusColor(c.status),border:`1px solid ${statusColor(c.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(c.status)}}/>{c.status}
                    </span>
                  : <span style={{fontSize:12,color:K_.ink3,fontStyle:"italic",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.naJustification?.slice(0,90)}…</span>}
              </td>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:11.5,color:c.ev>0?K_.ink:K_.ink3}}>{c.applicable?(c.ev>0?c.ev:"—"):"n/a"}</td>
              <td style={{padding:"14px",color:K_.ink2,fontSize:12}}>{c.applicable?c.owner:"—"}</td>
            </tr>
          ))}
          {filtered.length===0 && (
            <tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:K_.ink3,fontStyle:"italic"}}>No controls match the current filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* DETAIL PANEL */}
    {sel && (
      <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"28px 32px",marginBottom:14,animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
              <span style={{background:K_.s1,color:K_.ink2,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:500,fontFamily:fSans}}>{sel.theme}</span>
              {sel.applicable
                ? <span style={{background:K_.sage+"15",color:K_.sage,border:`1px solid ${K_.sage}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>Applicable: Yes</span>
                : <span style={{background:K_.ink3+"15",color:K_.ink3,border:`1px solid ${K_.ink3}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>Applicable: No</span>}
              {sel.applicable && <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(sel.status)+"15",color:statusColor(sel.status),border:`1px solid ${statusColor(sel.status)}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.status)}}/>{sel.status}
              </span>}
            </div>
            <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.3}}>{sel.name}</h2>
          </div>
          <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
        </div>

        {/* Justification or facts */}
        {!sel.applicable
          ? <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Justification for exclusion</div>
              <div style={{fontSize:14,color:K_.ink,lineHeight:1.65,background:K_.s1,padding:"18px 22px",borderRadius:12,borderLeft:`3px solid ${K_.ink3}`}}>{sel.naJustification}</div>
              <div style={{marginTop:18,fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>Decision reviewed: <strong style={{color:K_.ink2}}>annually</strong> · Last reaffirmed: <strong style={{color:K_.ink2}}>2026-01-15</strong></div>
            </div>
          : <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,rowGap:22}}>
              <div>
                <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Effectiveness</div>
                {sel.eff>0 ? <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(n=><span key={n} style={{width:8,height:14,borderRadius:2,background:n<=sel.eff?K_.gold:K_.ink4}}/>)}</div> : <span style={{color:K_.ink3,fontSize:12,fontStyle:"italic"}}>Not measured</span>}
              </div>
              <div>
                <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Evidence linked</div>
                <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:24,color:K_.ink,letterSpacing:"-0.02em"}}>{sel.ev}<span style={{fontSize:14,color:K_.ink3}}> artefacts</span></div>
              </div>
              <div>
                <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner</div>
                <div style={{fontSize:13,color:K_.ink,fontWeight:600}}>{sel.owner}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Last reviewed</div>
                <div style={{fontSize:13,color:K_.ink,fontWeight:600,fontFamily:fMono,letterSpacing:"0.04em"}}>{sel.lastReviewed||"—"}</div>
              </div>
            </div>}

        <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
          {sel.applicable && <button onClick={()=>setTab("annexa")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
            <span>✦</span> Open in Annex A Tracker
          </button>}
          <button onClick={()=>showToast("Applicability decision history — backend required","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
            Decision history
          </button>
        </div>
      </div>
    )}

    {/* APPROVAL FOOTER */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"24px 32px",marginBottom:14}}>
      <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Approval trail</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {role:"Prepared by", name:"M. Khan (CISO)", date:"2026-04-10", state:"complete"},
          {role:"Reviewed by", name:"H. Williams (CGO)", date:"Pending", state:"pending"},
          {role:"Approved by", name:"CEO", date:"Pending", state:"pending"},
        ].map(s=>(
          <div key={s.role} style={{padding:"16px 18px",background:K_.s1,borderRadius:12,borderLeft:`3px solid ${s.state==="complete"?K_.sage:K_.amber}`}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{s.role}</div>
            <div style={{fontSize:13,color:K_.ink,fontWeight:600,marginBottom:4}}>{s.name}</div>
            <div style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>{s.date}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
/* ─────────────────────────────────────────────
   EVIDENCE LIBRARY (ISO 27001 § 7.5 / § 9.2)
   The metadata registry of audit evidence artefacts. Files
   themselves require backend storage — this is the index layer.
───────────────────────────────────────────── */
const EVIDENCE_LIBRARY = [
  /* External certifications & attestations */
  {id:"EV-001", name:"ISO 27001:2022 Certificate", type:"Certificate", source:"BSI Group", description:"Annex SL certificate of conformity, scope: Production services + HQ.", method:"Vendor-provided", format:"PDF", size:"1.2 MB", uploadedBy:"M. Khan (CISO)", collected:"2025-11-22", expires:"2028-11-22", linkedControls:["A.5.1","A.5.31","A.5.36"], linkedRisks:["R-019"], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-002", name:"SOC 2 Type II Report", type:"Report", source:"PwC", description:"Audit period 2025-01-01 to 2025-12-31. Five trust services criteria assessed. No exceptions noted.", method:"Vendor-provided", format:"PDF", size:"3.4 MB", uploadedBy:"M. Khan (CISO)", collected:"2026-02-14", expires:"2027-02-14", linkedControls:["A.5.36","A.8.15","A.8.16"], linkedRisks:[], frameworks:["SOC 2","ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-003", name:"ISO 27701:2019 Certificate (Privacy extension)", type:"Certificate", source:"BSI Group", description:"Privacy information management system certificate.", method:"Vendor-provided", format:"PDF", size:"980 KB", uploadedBy:"R. Patel (CDPO)", collected:"2025-11-22", expires:"2028-11-22", linkedControls:["A.5.34"], linkedRisks:["R-010","R-011"], frameworks:["ISO 27701","GDPR"], status:"Current", owner:"R. Patel (CDPO)"},
  {id:"EV-004", name:"Cyber Essentials Plus Certificate", type:"Certificate", source:"NCSC-approved certifier", description:"UK Cyber Essentials Plus certification — perimeter, malware, patching, user access, secure configuration.", method:"Vendor-provided", format:"PDF", size:"450 KB", uploadedBy:"M. Khan (CISO)", collected:"2025-09-10", expires:"2026-09-10", linkedControls:["A.8.7","A.8.8","A.8.9"], linkedRisks:[], frameworks:["Cyber Essentials"], status:"Expiring Soon", owner:"M. Khan (CISO)"},
  {id:"EV-005", name:"AWS SOC 2 inheritance letter", type:"Attestation", source:"AWS", description:"Customer attestation letter confirming shared-responsibility scope and inherited controls.", method:"Vendor-provided", format:"PDF", size:"320 KB", uploadedBy:"D. Lee (Head of IT)", collected:"2026-01-15", expires:"2027-01-15", linkedControls:["A.5.23"], linkedRisks:[], frameworks:["SOC 2"], status:"Current", owner:"D. Lee (Head of IT)"},

  /* Penetration tests, scans, exercises */
  {id:"EV-006", name:"Annual Penetration Test Report", type:"Test result", source:"Sentinel Red (external)", description:"Black-box and grey-box testing against production environment. 2 medium, 4 low findings — all remediated by 2026-01.", method:"Vendor-provided", format:"PDF", size:"5.8 MB", uploadedBy:"M. Khan (CISO)", collected:"2025-11-15", expires:"2026-11-15", linkedControls:["A.8.8","A.8.29"], linkedRisks:["R-001","R-014"], frameworks:["ISO 27001","SOC 2"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-007", name:"Quarterly Vulnerability Scan Results — Q1 2026", type:"Scan", source:"Qualys VMDR", description:"Automated authenticated scan of all production assets. 0 critical, 3 high (patched within SLA), 12 medium.", method:"Automated", format:"PDF + CSV", size:"2.1 MB", uploadedBy:"Automated (Qualys API)", collected:"2026-04-03", expires:"2026-07-03", linkedControls:["A.8.8"], linkedRisks:["R-002"], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-008", name:"Annual DR Test Results", type:"Test result", source:"Internal", description:"Full failover to DR site executed 2026-01-18. RPO target 1h achieved (actual 47min). RTO target 4h achieved (actual 3h 12min).", method:"Manual", format:"DOCX", size:"680 KB", uploadedBy:"D. Lee (Head of IT)", collected:"2026-01-25", expires:"2027-01-25", linkedControls:["A.5.30","A.8.14"], linkedRisks:["R-002","R-013"], frameworks:["ISO 27001","ISO 22301"], status:"Current", owner:"D. Lee (Head of IT)"},
  {id:"EV-009", name:"BCP Tabletop Exercise — Ransomware Scenario", type:"Test result", source:"Internal + Marsh advisory", description:"Half-day tabletop with executive team. 4 process gaps identified, all closed by 2026-03.", method:"Manual", format:"PDF", size:"1.1 MB", uploadedBy:"H. Williams (CGO)", collected:"2026-01-30", expires:"2027-01-30", linkedControls:["A.5.24","A.5.30"], linkedRisks:["R-002"], frameworks:["ISO 27001","ISO 22301"], status:"Current", owner:"H. Williams (CGO)"},
  {id:"EV-010", name:"Phishing Simulation — Q1 2026", type:"Test result", source:"KnowBe4", description:"Three campaigns. Click rate 4.2% (target ≤ 8%). Repeat-clickers enrolled in remedial training.", method:"Vendor-provided", format:"PDF", size:"890 KB", uploadedBy:"J. Brooks (HR)", collected:"2026-04-02", expires:"2026-07-02", linkedControls:["A.6.3","A.8.23"], linkedRisks:["R-004"], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},

  /* Access reviews & operational records */
  {id:"EV-011", name:"Privileged Access Review — Q1 2026", type:"Record", source:"Internal", description:"Quarterly review of all domain admin and cloud-root accounts. 3 dormant accounts removed, 2 access levels reduced.", method:"Manual", format:"XLSX", size:"420 KB", uploadedBy:"M. Khan (CISO)", collected:"2026-04-01", expires:"2026-07-01", linkedControls:["A.5.15","A.8.2","A.5.18"], linkedRisks:["R-003"], frameworks:["ISO 27001","SOC 2"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-012", name:"User Access Recertification — Q1 2026", type:"Record", source:"Okta + manual review", description:"All employee + contractor access reviewed by line manager. 17 entitlements revoked. 100% manager attestation.", method:"Manual", format:"PDF + XLSX", size:"1.8 MB", uploadedBy:"M. Khan (CISO)", collected:"2026-03-28", expires:"2026-06-28", linkedControls:["A.5.18","A.8.3"], linkedRisks:[], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-013", name:"Joiners / Movers / Leavers Log — Q1 2026", type:"Record", source:"HRIS export + Okta", description:"All employment changes with access provisioning + de-provisioning timestamps. Average de-provisioning time 18 minutes.", method:"Automated", format:"XLSX", size:"310 KB", uploadedBy:"J. Brooks (HR)", collected:"2026-04-02", expires:"2027-04-02", linkedControls:["A.5.11","A.6.5","A.5.18"], linkedRisks:["R-022"], frameworks:["ISO 27001"], status:"Current", owner:"J. Brooks (HR)"},
  {id:"EV-014", name:"Tier-1 Supplier SOC 2 Review Pack", type:"Report", source:"Vendor SOC 2 reports + internal review", description:"Annual review of 12 tier-1 suppliers' SOC 2 Type II reports. No material gaps. Two supplier exits initiated.", method:"Manual", format:"PDF (12 docs)", size:"68 MB", uploadedBy:"M. Khan (CISO)", collected:"2026-02-20", expires:"2027-02-20", linkedControls:["A.5.19","A.5.20","A.5.22"], linkedRisks:["R-016"], frameworks:["ISO 27001","DORA"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-015", name:"Cloud Configuration Review — Production", type:"Scan", source:"AWS Config + Wiz", description:"Continuous CSPM scan. 0 critical, 5 high (all in remediation queue with 14-day SLA).", method:"Automated", format:"PDF", size:"2.4 MB", uploadedBy:"Automated (Wiz API)", collected:"2026-04-04", expires:"2026-05-04", linkedControls:["A.5.23","A.8.9"], linkedRisks:["R-001"], frameworks:["ISO 27001"], status:"Current", owner:"D. Lee (Head of IT)"},

  /* Approved policy/procedure artefacts */
  {id:"EV-016", name:"Information Security Policy — signed v2.1", type:"Policy", source:"Internal", description:"Top-level ISMS policy. Approved by CEO 2026-01-05. Distributed organisation-wide.", method:"Manual", format:"PDF", size:"540 KB", uploadedBy:"M. Khan (CISO)", collected:"2026-01-05", expires:"2027-01-05", linkedControls:["A.5.1"], linkedRisks:[], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-017", name:"Risk Treatment Plan — approved 2026 Q1", type:"Policy", source:"Internal", description:"Risk treatment decisions for all risks scoring ≥ 13 inherent. Signed by CISO and CGO.", method:"Manual", format:"PDF + XLSX", size:"1.5 MB", uploadedBy:"S. Ali (CAIO)", collected:"2026-02-10", expires:"2026-08-10", linkedControls:[], linkedRisks:["R-001","R-002","R-006","R-016"], frameworks:["ISO 27001","ISO 42001"], status:"Current", owner:"S. Ali (CAIO)"},
  {id:"EV-018", name:"Statement of Applicability — v0.9 draft", type:"Policy", source:"Internal", description:"Current SOA covering all 93 Annex A controls. Pending CISO + CEO signoff before stage-2 audit.", method:"Manual", format:"PDF", size:"890 KB", uploadedBy:"M. Khan (CISO)", collected:"2026-04-10", expires:null, linkedControls:[], linkedRisks:[], frameworks:["ISO 27001"], status:"Pending Review", owner:"M. Khan (CISO)"},
  {id:"EV-019", name:"Incident Response Plan v3.0", type:"Procedure", source:"Internal", description:"Current IR plan covering detection, containment, eradication, recovery, post-incident review. Tested 2026-04.", method:"Manual", format:"PDF", size:"1.2 MB", uploadedBy:"M. Khan (CISO)", collected:"2026-04-05", expires:"2027-04-05", linkedControls:["A.5.24","A.5.26"], linkedRisks:["R-002"], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},
  {id:"EV-020", name:"Business Continuity Plan v2.4", type:"Procedure", source:"Internal", description:"Site-wide BCP with role-based responsibilities, MAO/RPO/RTO targets per service.", method:"Manual", format:"PDF", size:"2.0 MB", uploadedBy:"H. Williams (CGO)", collected:"2026-01-15", expires:"2027-01-15", linkedControls:["A.5.29","A.5.30"], linkedRisks:["R-002","R-013"], frameworks:["ISO 27001","ISO 22301"], status:"Current", owner:"H. Williams (CGO)"},

  /* Training records */
  {id:"EV-021", name:"Annual Security Training Completion — 2026", type:"Training", source:"KnowBe4", description:"100% workforce completion of mandatory annual security awareness training. Records retained 3 years.", method:"Automated", format:"XLSX", size:"180 KB", uploadedBy:"J. Brooks (HR)", collected:"2026-03-28", expires:"2027-03-28", linkedControls:["A.6.3"], linkedRisks:["R-004"], frameworks:["ISO 27001"], status:"Current", owner:"J. Brooks (HR)"},
  {id:"EV-022", name:"AI Acceptable Use Training — Q1 2026 (new)", type:"Training", source:"Internal LMS", description:"Mandatory training on AI tools usage, data classification when using LLMs, prohibited use cases. 94% completion.", method:"Automated", format:"XLSX", size:"120 KB", uploadedBy:"S. Ali (CAIO)", collected:"2026-03-30", expires:"2027-03-30", linkedControls:["A.6.3","A.5.10"], linkedRisks:["R-008"], frameworks:["ISO 42001"], status:"Current", owner:"S. Ali (CAIO)"},
  {id:"EV-023", name:"GDPR Refresher Training — All staff 2025", type:"Training", source:"OneTrust", description:"Annual GDPR refresher. 100% completion + role-specific modules for data-processing teams.", method:"Automated", format:"XLSX", size:"240 KB", uploadedBy:"R. Patel (CDPO)", collected:"2025-11-15", expires:"2026-11-15", linkedControls:["A.5.34","A.6.3"], linkedRisks:["R-010"], frameworks:["GDPR","ISO 27701"], status:"Current", owner:"R. Patel (CDPO)"},

  /* Operational evidence (automated) */
  {id:"EV-024", name:"Backup Test Results — March 2026", type:"Test result", source:"Veeam + manual restore test", description:"Monthly restore test of randomly-selected production backup. 100% success rate over trailing 12 months.", method:"Automated", format:"PDF", size:"460 KB", uploadedBy:"Automated (Veeam API)", collected:"2026-03-28", expires:"2026-04-28", linkedControls:["A.8.13"], linkedRisks:["R-002"], frameworks:["ISO 27001"], status:"Current", owner:"D. Lee (Head of IT)"},
  {id:"EV-025", name:"Patch Compliance Report — April 2026", type:"Scan", source:"Tanium", description:"Critical patches: 99.2% within 14-day SLA. High patches: 96.8% within 30-day SLA.", method:"Automated", format:"PDF", size:"680 KB", uploadedBy:"Automated (Tanium API)", collected:"2026-04-01", expires:"2026-05-01", linkedControls:["A.8.8"], linkedRisks:["R-002"], frameworks:["ISO 27001"], status:"Current", owner:"D. Lee (Head of IT)"},
  {id:"EV-026", name:"Encryption Key Rotation Log — 2025–2026", type:"Log", source:"AWS KMS CloudTrail", description:"All KMS keys rotated within 365-day SLA. Continuous CloudTrail logging retained 7 years.", method:"Automated", format:"JSON + PDF", size:"4.2 MB", uploadedBy:"Automated (CloudTrail)", collected:"2026-04-01", expires:"2027-04-01", linkedControls:["A.8.24"], linkedRisks:["R-005"], frameworks:["ISO 27001"], status:"Current", owner:"M. Khan (CISO)"},

  /* DPIAs */
  {id:"EV-027", name:"DPIA — HR Onboarding AI (UC-4)", type:"Assessment", source:"Internal + Legal review", description:"GDPR Article 35 DPIA + EU AI Act Annex III high-risk assessment. Fairness testing committed quarterly.", method:"Manual", format:"PDF", size:"1.4 MB", uploadedBy:"R. Patel (CDPO)", collected:"2026-04-15", expires:"2027-04-15", linkedControls:["A.5.34"], linkedRisks:["R-006"], frameworks:["GDPR","ISO 42001","EU AI Act"], status:"Current", owner:"R. Patel (CDPO)"},
  {id:"EV-028", name:"DPIA — Contract Review AI (UC-1)", type:"Assessment", source:"Internal + Legal review", description:"Risk-of-hallucination assessment. Mandatory legal review of outputs documented as treatment.", method:"Manual", format:"PDF", size:"980 KB", uploadedBy:"R. Patel (CDPO)", collected:"2026-04-15", expires:"2027-04-15", linkedControls:[], linkedRisks:["R-007"], frameworks:["GDPR","ISO 42001"], status:"Current", owner:"R. Patel (CDPO)"},
  {id:"EV-029", name:"DSAR Log — Q1 2026", type:"Record", source:"Privacy portal export", description:"All data subject access requests handled in Q1. 100% within 30-day SLA. Average response: 11 days.", method:"Automated", format:"XLSX", size:"95 KB", uploadedBy:"R. Patel (CDPO)", collected:"2026-04-02", expires:"2027-04-02", linkedControls:["A.5.34"], linkedRisks:["R-011"], frameworks:["GDPR"], status:"Current", owner:"R. Patel (CDPO)"},

  /* Internal audit & management review */
  {id:"EV-030", name:"Internal ISMS Audit Report — January 2026", type:"Audit", source:"Internal Audit team", description:"Half-yearly internal audit. 12 minor findings (all closed by 2026-03). No major NCRs.", method:"Manual", format:"PDF", size:"3.1 MB", uploadedBy:"Internal Audit", collected:"2026-01-22", expires:"2026-07-22", linkedControls:["A.5.35","A.8.34"], linkedRisks:["R-019"], frameworks:["ISO 27001"], status:"Current", owner:"Internal Audit"},
  {id:"EV-031", name:"Management Review Minutes — Q4 2025", type:"Record", source:"CGO office", description:"Quarterly ISMS management review. Inputs covered per § 9.3. Six action items, all assigned and tracked.", method:"Manual", format:"PDF", size:"720 KB", uploadedBy:"H. Williams (CGO)", collected:"2026-01-10", expires:"2026-04-10", linkedControls:["A.5.4"], linkedRisks:[], frameworks:["ISO 27001"], status:"Expired", owner:"H. Williams (CGO)"},
  {id:"EV-032", name:"NCRs Closed — Q1 2026", type:"Record", source:"Internal", description:"Non-conformity register Q1 closeout. 4 NCRs closed with root-cause analysis and corrective actions evidenced.", method:"Manual", format:"XLSX", size:"180 KB", uploadedBy:"Internal Audit", collected:"2026-04-05", expires:"2027-04-05", linkedControls:["A.5.36"], linkedRisks:[], frameworks:["ISO 27001"], status:"Current", owner:"Internal Audit"},

  /* Expiring / overdue */
  {id:"EV-033", name:"Vendor Risk Assessment — CloudVendor X", type:"Assessment", source:"Internal + vendor questionnaire", description:"Annual third-party risk review for tier-2 supplier. Expired 2026-02. Refresh in progress.", method:"Manual", format:"PDF", size:"620 KB", uploadedBy:"M. Khan (CISO)", collected:"2025-02-18", expires:"2026-02-18", linkedControls:["A.5.19"], linkedRisks:["R-016"], frameworks:["ISO 27001"], status:"Expired", owner:"M. Khan (CISO)"},
  {id:"EV-034", name:"Web Application Security Test — November 2024", type:"Test result", source:"Sentinel Red", description:"Previous pen test before 2025 annual. Superseded by EV-006.", method:"Vendor-provided", format:"PDF", size:"4.8 MB", uploadedBy:"M. Khan (CISO)", collected:"2024-11-12", expires:"2025-11-12", linkedControls:["A.8.29"], linkedRisks:[], frameworks:["ISO 27001"], status:"Expired", owner:"M. Khan (CISO)"},
];

/* ─────────────────────────────────────────────
   PAGE: EVIDENCE LIBRARY
───────────────────────────────────────────── */
function PageEvidence({setTab,showToast}) {
  const [typeFilter,setTypeFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data from Supabase, fallback to constant ─── */
  const [items, dataSource, setItems] = useSupabaseTable("evidence", dbToEvidence, EVIDENCE_LIBRARY);

  /* ─── Add-evidence modal state ─── */
  const [addMode, setAddMode] = useState(false);
  const [newItem, setNewItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const canEdit = dataSource === "live";
  const nextEvidenceId = () => {
    const nums = items.map(e => parseInt((e.id||"").replace(/^EV-?/i,""),10)).filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return "EV-" + String(next).padStart(3,"0");
  };
  const openAddEvidence = () => {
    if(!canEdit){ showToast("Connect Supabase to upload evidence","info"); return; }
    const today = new Date().toISOString().slice(0,10);
    /* default expiry +1 year */
    const oneYearOut = new Date();
    oneYearOut.setFullYear(oneYearOut.getFullYear()+1);
    setNewItem({
      name:"", type:"Document", description:"",
      source:"", method:"Manual upload", format:"PDF", size:"",
      uploadedBy:"", collected: today,
      expires: oneYearOut.toISOString().slice(0,10),
      linkedControls:[], linkedRisks:[], frameworks:["ISO 27001"],
      status:"Current", owner:"",
    });
    setAddMode(true);
  };

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* Compute expiring-soon dynamically — within 30 days of today */
  const today = new Date("2026-06-04");
  const enriched = items.map(e=>{
    if(!e.expires) return e;
    const exp = new Date(e.expires);
    const days = Math.round((exp - today) / 86400000);
    let dynamicStatus = e.status;
    if(e.status==="Current" && days <= 30 && days >= 0) dynamicStatus = "Expiring Soon";
    if(e.status==="Current" && days < 0) dynamicStatus = "Expired";
    return {...e, daysToExpiry:days, dynamicStatus};
  });

  const statusColor = s => ({
    "Current":K_.sage, "Expiring Soon":K_.amber, "Expired":K_.crit,
    "Pending Review":K_.gold, "Archived":K_.ink3,
  })[s] || K_.ink3;
  const typeColor = t => ({
    "Certificate":K_.gold, "Report":K_.navy, "Policy":K_.sage,
    "Procedure":K_.sage, "Record":K_.ink2, "Test result":K_.amber,
    "Scan":K_.amber, "Attestation":K_.gold, "Training":K_.sage,
    "Audit":K_.crit, "Assessment":K_.crit, "Log":K_.ink2,
  })[t] || K_.ink3;

  /* Stats */
  const total = enriched.length;
  const current = enriched.filter(e=>(e.dynamicStatus||e.status)==="Current").length;
  const expiringSoon = enriched.filter(e=>(e.dynamicStatus||e.status)==="Expiring Soon").length;
  const expired = enriched.filter(e=>(e.dynamicStatus||e.status)==="Expired").length;

  /* Distinct types */
  const allTypes = Array.from(new Set(items.map(e=>e.type)));
  const allStatuses = ["Current","Expiring Soon","Expired","Pending Review","Archived"];

  const filtered = enriched.filter(e=>{
    const s = e.dynamicStatus || e.status;
    if(typeFilter!=="all" && e.type!==typeFilter) return false;
    if(statusFilter!=="all" && s!==statusFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.owner.toLowerCase().includes(q) || e.source.toLowerCase().includes(q))) return false;
    }
    return true;
  });
  /* Sort: expired/expiring at top */
  const statusOrder = {"Expired":0,"Expiring Soon":1,"Pending Review":2,"Current":3,"Archived":4};
  filtered.sort((a,b)=>{
    const sa = statusOrder[a.dynamicStatus||a.status] ?? 5;
    const sb = statusOrder[b.dynamicStatus||b.status] ?? 5;
    if(sa!==sb) return sa-sb;
    return (a.daysToExpiry??99999) - (b.daysToExpiry??99999);
  });

  const sel = selectedId ? enriched.find(e=>e.id===selectedId) : null;

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* HERO */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"end"}}>
        <div>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <span>▸</span><span>ISO 27001 § 7.5 / § 9.2 · Evidence Library</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
            Proof, <span style={{fontStyle:"italic"}}>indexed.</span>
          </h1>
          <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:560}}>
            The metadata index of every audit artefact — certificates, test results, signed policies, training records, scans. Linked to the controls and risks they evidence.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.navyT2,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Total artefacts</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:96,lineHeight:0.9,letterSpacing:"-0.045em",color:K_.gold}}>{total}</div>
          <div style={{fontSize:12,color:K_.navyT2,marginTop:10}}>{current} current · {expiringSoon+expired} need attention</div>
        </div>
      </div>
    </div>

    {/* STATS STRIP */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
      {[
        {label:"Current",         val:String(current),       c:K_.sage,  sub:"within validity window"},
        {label:"Expiring soon",   val:String(expiringSoon),  c:K_.amber, sub:"within 30 days"},
        {label:"Expired",         val:String(expired),       c:K_.crit,  sub:"renewal overdue"},
        {label:"Total in scope",  val:String(total),         c:K_.ink},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
          <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          {s.sub && <div style={{fontSize:11,color:K_.ink3,marginTop:8}}>{s.sub}</div>}
        </div>
      ))}
    </div>

    {/* FILTERS */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ID, name, source, owner…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
        <button onClick={openAddEvidence} disabled={!canEdit}
          title={canEdit?"Upload a new evidence artefact":"Upload requires live DB connection"}
          style={{
          background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",
          fontSize:12,fontWeight:700,cursor:canEdit?"pointer":"not-allowed",opacity:canEdit?1:0.55,fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,
        }}>
          <span>+</span> Upload evidence
        </button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Type</span>
        {[["all","All"],...allTypes.map(t=>[t,t])].map(([k,l])=>(
          <button key={k} onClick={()=>setTypeFilter(k)} style={{
            background:typeFilter===k?(k==="all"?K_.navy:typeColor(k)):"transparent",
            color:typeFilter===k?"#fff":K_.ink2,
            border:`1px solid ${typeFilter===k?(k==="all"?K_.navy:typeColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:typeFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Status</span>
        {[["all","All"],...allStatuses.map(s=>[s,s])].map(([k,l])=>(
          <button key={k} onClick={()=>setStatusFilter(k)} style={{
            background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
            color:statusFilter===k?"#fff":K_.ink2,
            border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:statusFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
    </div>

    {/* TABLE */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"4px 0",marginBottom:14,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:1100}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${K_.line}`}}>
            {["Ref","Artefact","Type","Source","Collected","Expires","Linked","Status","Owner"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"14px 14px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(e=>{
            const stat = e.dynamicStatus || e.status;
            const linkCount = (e.linkedControls?.length||0) + (e.linkedRisks?.length||0);
            return <tr key={e.id} onClick={()=>setSelectedId(e.id===selectedId?null:e.id)} style={{
              borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s",
              background:selectedId===e.id?K_.s1:"transparent",
            }}
            onMouseEnter={ev=>{if(selectedId!==e.id)ev.currentTarget.style.background=K_.bg;}}
            onMouseLeave={ev=>{if(selectedId!==e.id)ev.currentTarget.style.background="transparent";}}>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:11.5,color:K_.gold,fontWeight:700,letterSpacing:"0.04em"}}>{e.id}</td>
              <td style={{padding:"14px",color:K_.ink,fontWeight:500,maxWidth:340,lineHeight:1.3}}>{e.name}</td>
              <td style={{padding:"14px"}}>
                <span style={{background:typeColor(e.type)+"15",color:typeColor(e.type),border:`1px solid ${typeColor(e.type)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>{e.type}</span>
              </td>
              <td style={{padding:"14px",color:K_.ink2,fontSize:11.5,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.source}</td>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:10.5,color:K_.ink3,letterSpacing:"0.04em"}}>{e.collected}</td>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:10.5,letterSpacing:"0.04em",color:stat==="Expired"?K_.crit:stat==="Expiring Soon"?K_.amber:K_.ink3}}>
                {e.expires ? e.expires : <span style={{fontStyle:"italic"}}>permanent</span>}
              </td>
              <td style={{padding:"14px",fontFamily:fMono,fontSize:11.5,color:linkCount>0?K_.ink:K_.ink3}}>{linkCount>0?linkCount:"—"}</td>
              <td style={{padding:"14px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(stat)+"15",color:statusColor(stat),border:`1px solid ${statusColor(stat)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(stat)}}/>
                  {stat}
                </span>
              </td>
              <td style={{padding:"14px",color:K_.ink2,fontSize:12}}>{e.owner}</td>
            </tr>;
          })}
          {filtered.length===0 && (
            <tr><td colSpan={9} style={{padding:"40px",textAlign:"center",color:K_.ink3,fontStyle:"italic"}}>No evidence artefacts match the current filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {/* DETAIL PANEL */}
    {sel && (() => {
      const stat = sel.dynamicStatus || sel.status;
      return <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"28px 32px",marginBottom:14,animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:14,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 400px"}}>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
              <span style={{background:typeColor(sel.type)+"15",color:typeColor(sel.type),border:`1px solid ${typeColor(sel.type)}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>{sel.type}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(stat)+"15",color:statusColor(stat),border:`1px solid ${statusColor(stat)}30`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(stat)}}/>{stat}
              </span>
              {sel.method==="Automated" && <span style={{background:K_.s1,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:500,display:"inline-flex",alignItems:"center",gap:5}}><span>⚡</span>Automated</span>}
            </div>
            <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.3}}>{sel.name}</h2>
            {sel.description && <p style={{fontSize:13.5,color:K_.ink2,lineHeight:1.55,margin:"12px 0 0",maxWidth:680}}>{sel.description}</p>}
          </div>
          <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
        </div>

        {/* Facts grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,rowGap:22,marginBottom:24,paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
          {[
            ["Source", sel.source],
            ["Collection method", sel.method],
            ["Format", sel.format + (sel.size ? ` · ${sel.size}` : "")],
            ["Uploaded by", sel.uploadedBy],
            ["Collected", sel.collected],
            ["Expires", sel.expires || "Permanent"],
            ["Owner", sel.owner],
            ["Reference", sel.id],
          ].map(([l,v])=>(
            <div key={l}>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
              <div style={{fontSize:13,color:K_.ink,fontWeight:500,lineHeight:1.4}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Linked entities */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:24,marginBottom:18}}>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Linked Annex A controls</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.linkedControls?.length>0 ? sel.linkedControls.map(c=>(
                <span key={c} onClick={(e)=>{e.stopPropagation();setTab("annexa");}} style={{background:K_.navy+"10",color:K_.navy,border:`1px solid ${K_.navy}25`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fMono,letterSpacing:"0.02em",fontWeight:600,cursor:"pointer"}}>{c}</span>
              )) : <span style={{color:K_.ink3,fontSize:12,fontStyle:"italic"}}>none</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Linked risks</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.linkedRisks?.length>0 ? sel.linkedRisks.map(r=>(
                <span key={r} onClick={(e)=>{e.stopPropagation();setTab("risks");}} style={{background:K_.crit+"15",color:K_.crit,border:`1px solid ${K_.crit}30`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fMono,letterSpacing:"0.04em",fontWeight:700,cursor:"pointer"}}>{r}</span>
              )) : <span style={{color:K_.ink3,fontSize:12,fontStyle:"italic"}}>none</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Frameworks</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.frameworks?.map((f,i)=>(
                <span key={i} style={{background:K_.s1,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"4px 10px",fontSize:11,fontFamily:fSans,fontWeight:500}}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,paddingTop:18,borderTop:`1px solid ${K_.line}`,flexWrap:"wrap"}}>
          <button onClick={()=>showToast("Download — backend file storage required","info")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
            <span>⤓</span> Download artefact
          </button>
          <button onClick={()=>showToast("Refresh from source — automation engine required","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
            Refresh from source
          </button>
          <button onClick={()=>showToast("Version history — backend required","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
            Version history
          </button>
        </div>
      </div>;
    })()}

    {/* ─── UPLOAD EVIDENCE MODAL ─── */}
    {addMode && newItem && (
      <div onClick={()=>{if(!adding){setAddMode(false);setNewItem(null);}}} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
        <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 32px",maxWidth:880,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,gap:14}}>
            <div>
              <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>New artefact · {nextEvidenceId()}</div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:28,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.2}}>Upload evidence</h2>
              <p style={{fontSize:12,color:K_.ink3,margin:"6px 0 0 0",lineHeight:1.5,maxWidth:580}}>Log metadata for an evidence artefact. File storage (actual upload) is wired in next.</p>
            </div>
            <button onClick={()=>{setAddMode(false);setNewItem(null);}} disabled={adding} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:adding?"not-allowed":"pointer",fontWeight:600}}>Close</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            {/* Name — full width */}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Artefact name <span style={{color:K_.crit}}>*</span></label>
              <input value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} placeholder="e.g. Q2 2026 Access Review — Production Environment"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Type + Format */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Type</label>
              <select value={newItem.type} onChange={e=>setNewItem({...newItem,type:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Document","Log Export","Screenshot","Report","Attestation","Configuration","Test Result","Recording"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Format</label>
              <select value={newItem.format} onChange={e=>setNewItem({...newItem,format:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["PDF","XLSX","DOCX","JSON","CSV","PNG","ZIP","Other"].map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Description — full width */}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Description</label>
              <textarea value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})} rows={2} placeholder="What does this artefact demonstrate?"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",resize:"vertical",lineHeight:1.55}}/>
            </div>

            {/* Source + Method */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Source</label>
              <input value={newItem.source} onChange={e=>setNewItem({...newItem,source:e.target.value})} placeholder="e.g. AWS CloudTrail, IT operations team"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Collection method</label>
              <select value={newItem.method} onChange={e=>setNewItem({...newItem,method:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Manual upload","Automated export","API pull","Email attestation","System screenshot","Audit observation"].map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Uploaded by + Owner */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Uploaded by <span style={{color:K_.crit}}>*</span></label>
              <input value={newItem.uploadedBy} onChange={e=>setNewItem({...newItem,uploadedBy:e.target.value})} placeholder="Your name and title"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Owner</label>
              <input value={newItem.owner} onChange={e=>setNewItem({...newItem,owner:e.target.value})} placeholder="Responsible role/person for upkeep"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Collected date + Expiry date */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Collected on</label>
              <input type="date" value={newItem.collected} onChange={e=>setNewItem({...newItem,collected:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Expires on</label>
              <input type="date" value={newItem.expires} onChange={e=>setNewItem({...newItem,expires:e.target.value})}
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>

            {/* Size label */}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Size label (display only)</label>
              <input value={newItem.size} onChange={e=>setNewItem({...newItem,size:e.target.value})} placeholder="e.g. 2.4 MB, 18 pages, 320 lines"
                style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
          </div>

          {/* Save + Cancel */}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
            <button onClick={()=>{setAddMode(false);setNewItem(null);}} disabled={adding}
              style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:adding?"not-allowed":"pointer",fontFamily:fSans,opacity:adding?0.5:1}}>
              Cancel
            </button>
            <button
              onClick={async ()=>{
                if(!supabase) return;
                if(!newItem.name.trim()){ showToast("Name is required","error"); return; }
                if(!newItem.uploadedBy.trim()){ showToast("Uploaded by is required","error"); return; }
                setAdding(true);
                const id = nextEvidenceId();
                const dbRow = {
                  id,
                  name: newItem.name.trim(),
                  type: newItem.type,
                  description: newItem.description || null,
                  source: newItem.source || null,
                  method: newItem.method,
                  format: newItem.format,
                  size_label: newItem.size || null,
                  uploaded_by: newItem.uploadedBy.trim(),
                  collected_date: newItem.collected || null,
                  expires_date: newItem.expires || null,
                  linked_controls: [],
                  linked_risks: [],
                  frameworks: newItem.frameworks || [],
                  status: "Current",
                  owner: newItem.owner.trim() || newItem.uploadedBy.trim(),
                };
                const { error } = await supabase.from("evidence").insert(dbRow);
                setAdding(false);
                if(error){
                  showToast(`Upload failed: ${error.message}`, "error");
                  return;
                }
                setItems(its => [dbToEvidence(dbRow), ...its]);
                setAddMode(false);
                setNewItem(null);
                showToast(`${id} uploaded`, "success");
              }}
              disabled={adding}
              style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 22px",fontSize:12,fontWeight:700,cursor:adding?"not-allowed":"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,opacity:adding?0.7:1}}>
              <span>{adding?"⋯":"+"}</span> {adding?"Uploading…":"Upload artefact"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>;
}

/* ─────────────────────────────────────────────
   INTERNAL AUDIT — seeded data
   ISO 27001 § 9.2 Internal Audit. Auditors plan engagements
   scoped to specific Annex A themes/controls, log findings
   against tested controls, then findings feed into the Risk
   Register and Corrective Actions Plan (CAPA).
───────────────────────────────────────────── */
const INTERNAL_AUDITS = [
  {
    id:"AUD-2026-Q1-001",
    name:"Q1 2026 — Access Control Effectiveness Review",
    scope:"Joiner-mover-leaver, privilege creep, MFA coverage, audit log integrity across production environments.",
    scopeThemes:["Organisational","Technological"],
    scopeControls:["A.5.15","A.5.16","A.5.17","A.5.18","A.8.2","A.8.3","A.8.5","A.8.15"],
    leadAuditor:"Mei Lin (Internal Audit Lead)",
    auditors:["Mei Lin","Andre Okafor","David Park"],
    startDate:"2026-01-15",
    endDate:"2026-02-12",
    status:"Completed",
    methodology:"Walkthrough + sample-based testing. 60-account sample over Q4 2025. Privileged access log review n=240 events. MFA enrolment census via Okta API.",
    summary:"Annual access control audit. Three findings logged — one major (deprovisioning gap), one minor (privileged accounts without quarterly review), one observation (audit log retention shorter than policy mandate).",
    frameworks:["ISO 27001","SOC 2 CC6.1, CC6.2"],
  },
  {
    id:"AUD-2026-Q2-002",
    name:"Q2 2026 — Supplier Security Programme",
    scope:"Third-party risk management lifecycle, contract security clauses, ongoing monitoring, off-boarding.",
    scopeThemes:["Organisational"],
    scopeControls:["A.5.19","A.5.20","A.5.21","A.5.22","A.5.23","A.5.24"],
    leadAuditor:"Andre Okafor (Senior Auditor)",
    auditors:["Andre Okafor","Jennifer Lim"],
    startDate:"2026-04-08",
    endDate:"2026-05-22",
    status:"In Progress",
    methodology:"Risk-based sample: 12 critical suppliers + 25 standard. Contract review, attestation review (SOC 2 Type II / ISO 27001 cert), data flow walkthroughs.",
    summary:"Mid-audit. Walkthrough phase complete. Sample testing underway. Preliminary observations indicate inconsistent security questionnaire response cycle.",
    frameworks:["ISO 27001"],
  },
  {
    id:"AUD-2026-Q2-003",
    name:"Q2 2026 — AI Governance & Use Case Pipeline",
    scope:"ISO 42001 alignment — AI use case intake, tier classification accuracy, HITL decision quality, training data governance.",
    scopeThemes:["Organisational","Technological"],
    scopeControls:["A.5.1","A.5.2","A.5.34","A.8.10","A.8.11"],
    leadAuditor:"Marcus Chen (CAIO) — independent reviewer",
    auditors:["Marcus Chen","external: KPMG AI Assurance"],
    startDate:"2026-05-01",
    endDate:"2026-06-30",
    status:"In Progress",
    methodology:"All 6 active use cases reviewed. HITL decision audit trail integrity. AIIA completeness sample. Model card review for shadow AI.",
    summary:"First-ever AI governance audit. External co-assurance with KPMG. High visibility — feeds Q3 board pack.",
    frameworks:["ISO 42001","NIST AI RMF","EU AI Act"],
  },
  {
    id:"AUD-2026-Q3-004",
    name:"Q3 2026 — Cryptography & Key Management",
    scope:"Cryptographic algorithm inventory, key lifecycle, secret rotation cadence, HSM utilisation.",
    scopeThemes:["Technological"],
    scopeControls:["A.8.24","A.8.5"],
    leadAuditor:"David Park (CIO)",
    auditors:["David Park","Sarah Chen"],
    startDate:"2026-07-15",
    endDate:"2026-08-22",
    status:"Planned",
    methodology:"Inventory walkthrough. Sample 30 secrets across AWS Secrets Manager + HashiCorp Vault. Rotation log audit. Quantum-readiness assessment.",
    summary:"Scheduled. Resourcing confirmed. Pre-engagement letter sent.",
    frameworks:["ISO 27001","FIPS 140-3"],
  },
  {
    id:"AUD-2026-Q3-005",
    name:"Q3 2026 — Business Continuity & Disaster Recovery",
    scope:"BCP plan currency, DR test cadence, RTO/RPO compliance, supplier failover readiness.",
    scopeThemes:["Organisational","Technological"],
    scopeControls:["A.5.29","A.5.30","A.8.13","A.8.14"],
    leadAuditor:"Patricia Watts (CGO)",
    auditors:["Patricia Watts","Andre Okafor"],
    startDate:"2026-08-05",
    endDate:"2026-09-20",
    status:"Planned",
    methodology:"Tabletop exercise + live failover test for tier-1 systems. Last-test-date review for all 23 BCP scenarios.",
    summary:"Annual BCP/DR audit per ISO 27001 § 5.30. Live failover test pre-scheduled for Aug 28.",
    frameworks:["ISO 27001","ISO 22301"],
  },
  {
    id:"AUD-2025-Q4-016",
    name:"Q4 2025 — Annual ISMS Effectiveness Review",
    scope:"Full ISMS posture across all 93 Annex A controls. Statement of Applicability re-verification. Risk register reconciliation.",
    scopeThemes:["Organisational","People","Physical","Technological"],
    scopeControls:["(all 93 controls)"],
    leadAuditor:"External: Bureau Veritas (Stage 2 surveillance)",
    auditors:["BV lead auditor: Helena Kruger","BV team: 3 auditors"],
    startDate:"2025-11-10",
    endDate:"2025-12-04",
    status:"Completed",
    methodology:"External surveillance audit. Stage 2 verification. Document review + control testing + management interviews.",
    summary:"Surveillance audit passed. Certification maintained. 4 minor non-conformances, 2 opportunities for improvement. All findings closed in CAPA plan by Mar 2026.",
    frameworks:["ISO 27001:2022"],
  },
];

/* Audit findings — typically link to a specific control + audit */
const AUDIT_FINDINGS = [
  /* Findings from AUD-2026-Q1-001 (Access Control) */
  {
    id:"F-2026-001",
    auditId:"AUD-2026-Q1-001",
    controlId:"A.5.18",
    severity:"Major",
    title:"Joiner-mover-leaver gap — 14 dormant accounts retained beyond 90 days",
    finding:"Sample of 60 departed staff over Q4 2025 showed 14 accounts (23%) not deprovisioned within the 90-day window mandated by Access Control Policy § 4.2. Average age of dormant accounts: 142 days. Two contained production database read access. Root cause: HR offboarding events not consistently triggering IAM workflow when contractor end-dates are extended via email rather than the HRIS.",
    recommendation:"Automate deprovisioning via HR-to-IAM webhook integration (HRIS event → Okta deactivation). Implement quarterly orphan account scan with mandatory CISO sign-off. Re-test sample in Q3 2026 audit.",
    status:"In Remediation",
    loggedBy:"Mei Lin (Internal Audit Lead)",
    loggedAt:"2026-02-08",
    targetClose:"2026-08-15",
    linkedRiskId:"R-002",
    capaId:"CAPA-2026-001",
  },
  {
    id:"F-2026-002",
    auditId:"AUD-2026-Q1-001",
    controlId:"A.5.15",
    severity:"Minor",
    title:"Privileged accounts lack quarterly entitlement review evidence",
    finding:"Access Control Policy mandates quarterly review of privileged access lists. Sample showed reviews completed for 7 of 11 privileged groups in Q4 2025. Production database admin group last reviewed 11 months ago. Reviews that did occur lacked formal sign-off documentation.",
    recommendation:"Centralise privileged access reviews in a single dashboard. Calendar-driven reminders 30/14/7 days before due date. Sign-off captured in evidence library with reviewer + date.",
    status:"Open",
    loggedBy:"Andre Okafor",
    loggedAt:"2026-02-10",
    targetClose:"2026-07-31",
    linkedRiskId:null,
    capaId:"CAPA-2026-002",
  },
  {
    id:"F-2026-003",
    auditId:"AUD-2026-Q1-001",
    controlId:"A.8.15",
    severity:"Observation",
    title:"Audit log retention 12 months vs policy 24 months",
    finding:"CloudTrail log retention currently configured for 12 months in S3 lifecycle policy. Information Security Policy § 7.4 mandates 24-month retention for authentication and privileged operation logs. Not a current non-conformance with the standard but contradicts internal policy.",
    recommendation:"Either extend S3 lifecycle to 24 months (cost impact ~$340/mo) or update policy to reflect actual practice (preferred if 12 months satisfies legal hold + investigation needs).",
    status:"Closed",
    loggedBy:"David Park",
    loggedAt:"2026-02-12",
    targetClose:"2026-03-15",
    linkedRiskId:null,
    capaId:null,
  },
  /* Findings from AUD-2025-Q4-016 (Annual ISMS — external) */
  {
    id:"F-2025-014",
    auditId:"AUD-2025-Q4-016",
    controlId:"A.5.7",
    severity:"Minor",
    title:"Threat intelligence procedure documented but evidence of operationalisation thin",
    finding:"Threat Intelligence Procedure exists and references three feeds (CISA, MITRE ATT&CK, sector ISAC). Sample of monthly intelligence reports for Q3 2025 showed only one report on file. No evidence intelligence is being acted upon (e.g. tickets, control adjustments, training updates).",
    recommendation:"Operationalise the procedure: monthly report mandatory, with at least one actionable item per quarter tracked to closure.",
    status:"Closed",
    loggedBy:"Helena Kruger (Bureau Veritas)",
    loggedAt:"2025-11-22",
    targetClose:"2026-02-28",
    linkedRiskId:null,
    capaId:"CAPA-2025-014",
  },
  {
    id:"F-2025-015",
    auditId:"AUD-2025-Q4-016",
    controlId:"A.6.3",
    severity:"Minor",
    title:"Security awareness training completion 87% vs target 95%",
    finding:"Annual training cycle ended Oct 2025 with 87% completion across all staff (target 95%). 38 individuals overdue, primarily in two recently-acquired subsidiary teams.",
    recommendation:"Targeted catch-up campaign for the 38. M&A integration playbook to include day-1 training enrolment.",
    status:"Closed",
    loggedBy:"Helena Kruger (Bureau Veritas)",
    loggedAt:"2025-11-24",
    targetClose:"2026-01-31",
    linkedRiskId:null,
    capaId:"CAPA-2025-015",
  },
  {
    id:"F-2025-016",
    auditId:"AUD-2025-Q4-016",
    controlId:"A.8.32",
    severity:"Minor",
    title:"Change management — emergency change post-review SLA missed in 4 of 12 sampled cases",
    finding:"Change Management Policy mandates emergency-change post-implementation review within 48 hours. Sample of 12 emergency changes over Q3 2025 showed 4 reviewed outside SLA (range: 4-11 days). All eventually documented but timeliness lapsed.",
    recommendation:"Automated reminder at +24h. Block ticket closure until post-review complete.",
    status:"In Remediation",
    loggedBy:"Helena Kruger (Bureau Veritas)",
    loggedAt:"2025-11-28",
    targetClose:"2026-06-30",
    linkedRiskId:null,
    capaId:"CAPA-2025-016",
  },
  {
    id:"F-2025-017",
    auditId:"AUD-2025-Q4-016",
    controlId:"A.5.30",
    severity:"Minor",
    title:"Business continuity plan not exercised in last 12 months",
    finding:"Last full BCP tabletop exercise was Dec 2024. Policy mandates annual exercise. Several supporting playbooks (e.g. ransomware response) untested.",
    recommendation:"Schedule full tabletop Q3 2026 (already in audit plan). Quarterly micro-exercises against specific scenarios.",
    status:"In Remediation",
    loggedBy:"Helena Kruger (Bureau Veritas)",
    loggedAt:"2025-12-01",
    targetClose:"2026-09-30",
    linkedRiskId:null,
    capaId:"CAPA-2025-017",
  },
  /* Mid-audit observation from AUD-2026-Q2-002 (Suppliers) */
  {
    id:"F-2026-007",
    auditId:"AUD-2026-Q2-002",
    controlId:"A.5.22",
    severity:"Major",
    title:"Critical supplier monitoring cadence inconsistent",
    finding:"Of 12 critical suppliers in scope, 4 have not had their security posture reviewed in over 18 months (policy: annual). One holds direct production access. Annual security questionnaires sent but not chased, completion tracking absent.",
    recommendation:"Centralise supplier review calendar in VerisZone. Automated 90-day pre-due reminders. Escalation to Supplier Owner + CISO at 30 days overdue.",
    status:"Open",
    loggedBy:"Andre Okafor",
    loggedAt:"2026-05-08",
    targetClose:"2026-11-30",
    linkedRiskId:"R-014",
    capaId:null,
  },
  /* Mid-audit observation from AUD-2026-Q2-003 (AI Governance) */
  {
    id:"F-2026-009",
    auditId:"AUD-2026-Q2-003",
    controlId:"A.5.34",
    severity:"Observation",
    title:"AI use case intake tier classification — heuristic vs human judgement divergence in 1 of 6 cases",
    finding:"Compared the platform's heuristic-based tier classification against independent human assessment for all 6 active use cases. Five agreed. One case (HR Onboarding Automation) classified as 'High-Risk' by both heuristic AND independent review — agreement, but for different reasons (heuristic: Automated decisions; human: also concerned about discrimination proxy variables in training set). Indicates heuristic may underweight certain dimensions.",
    recommendation:"Enhance classification logic to include training data provenance and protected-attribute proxy detection. Document the rationale in tier decision audit trail. Consider AI-assisted classification (LLM-based) as next iteration.",
    status:"Open",
    loggedBy:"KPMG AI Assurance",
    loggedAt:"2026-05-22",
    targetClose:"2026-09-30",
    linkedRiskId:null,
    capaId:null,
  },
];

/* ─────────────────────────────────────────────
   PAGE: INTERNAL AUDIT PLANNER (ISO 27001 § 9.2)
   List of audits, status pipeline, finding ledger.
───────────────────────────────────────────── */
function PageInternalAudit({setTab,showToast}) {
  const [statusFilter,setStatusFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data, fallback to constants ─── */
  const [audits, dataSource, setAudits] = useSupabaseTable("audits", dbToAudit, INTERNAL_AUDITS, "id");
  const [findings, , setFindings] = useSupabaseTable("audit_findings", dbToFinding, AUDIT_FINDINGS, "id");
  const canEdit = dataSource === "live";

  /* ─── Log-finding modal state ─── */
  const [findingMode, setFindingMode] = useState(false);
  const [newFinding, setNewFinding] = useState(null);
  const [savingFinding, setSavingFinding] = useState(false);
  const [completingAudit, setCompletingAudit] = useState(false);

  const nextFindingId = () => {
    const year = new Date().getFullYear();
    const yearPrefix = "F-" + year + "-";
    const nums = findings
      .filter(f => (f.id||"").startsWith(yearPrefix))
      .map(f => parseInt(f.id.replace(yearPrefix,""),10))
      .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return yearPrefix + String(next).padStart(3,"0");
  };
  const openLogFinding = (audit) => {
    if(!canEdit){ showToast("Connect Supabase to log findings","info"); return; }
    const today = new Date().toISOString().slice(0,10);
    /* default target close: +90 days */
    const tc = new Date(); tc.setDate(tc.getDate()+90);
    setNewFinding({
      auditId: audit.id,
      controlId: audit.scopeControls[0] && !audit.scopeControls[0].includes("all") ? audit.scopeControls[0] : "",
      severity: "Minor",
      title: "",
      finding: "",
      recommendation: "",
      status: "Open",
      loggedBy: "",
      loggedAt: today,
      targetClose: tc.toISOString().slice(0,10),
      linkedRiskId: "",
      capaId: "",
    });
    setFindingMode(true);
  };
  const markAuditComplete = async (auditId) => {
    if(!supabase) return;
    setCompletingAudit(true);
    const { error } = await supabase
      .from("audits")
      .update({ status: "Completed" })
      .eq("id", auditId);
    setCompletingAudit(false);
    if(error){ showToast(`Update failed: ${error.message}`, "error"); return; }
    setAudits(as => as.map(a => a.id === auditId ? {...a, status: "Completed"} : a));
    showToast(`${auditId} marked complete`, "success");
  };

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','PP Editorial Old','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  const statusColor = s => ({
    "Planned":K_.ink3, "In Progress":K_.amber, "Completed":K_.sage,
  })[s] || K_.ink3;
  const sevColor = s => ({
    "Critical":K_.crit, "Major":K_.crit, "Minor":K_.amber, "Observation":K_.ink3,
  })[s] || K_.ink3;
  const findingStatusColor = s => ({
    "Open":K_.crit, "In Remediation":K_.amber, "Closed":K_.sage,
  })[s] || K_.ink3;

  /* Esc closes detail modal */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  /* Stats */
  const planned   = audits.filter(a=>a.status==="Planned").length;
  const inProg    = audits.filter(a=>a.status==="In Progress").length;
  const completed = audits.filter(a=>a.status==="Completed").length;
  const openFindings = findings.filter(f=>f.status==="Open").length;
  const inRemediation = findings.filter(f=>f.status==="In Remediation").length;
  const closed = findings.filter(f=>f.status==="Closed").length;

  /* Audit-readiness: % of controls tested in last 12 months.
     Approximation: count distinct controls in scope across audits dated within 12mo. */
  const oneYearAgo = new Date(); oneYearAgo.setMonth(oneYearAgo.getMonth()-12);
  const recentControls = new Set();
  audits.forEach(a => {
    if (new Date(a.endDate) >= oneYearAgo) {
      a.scopeControls.forEach(c => recentControls.add(c));
    }
  });
  // The annual ISMS audit covers all 93; cap at 93
  const testedCount = recentControls.has("(all 93 controls)") ? 93 : recentControls.size;
  const auditReadiness = Math.round((testedCount / 93) * 100);

  /* Filter */
  const filtered = audits.filter(a => {
    if(statusFilter!=="all" && a.status!==statusFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.leadAuditor.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sel = selectedId ? audits.find(a=>a.id===selectedId) : null;
  const selFindings = sel ? findings.filter(f=>f.auditId===sel.id) : [];

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* ── HERO ── */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.07,backgroundImage:`radial-gradient(circle at 20% 20%, ${K_.gold} 1px, transparent 1px)`,backgroundSize:"24px 24px"}}/>
      <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:24}}>
        <div style={{maxWidth:680}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:14}}>
            <span>▸</span><span>ISO 27001 § 9.2 · Internal Audit</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{
            fontFamily:fSerif,fontStyle:"italic",fontWeight:400,
            fontSize:"clamp(34px, 4.5vw, 52px)",
            letterSpacing:"-0.02em",lineHeight:1.05,color:K_.navyT,margin:"0 0 14px 0",
          }}>Plan, test, prove.</h1>
          <p style={{fontSize:14.5,color:K_.navyT2,lineHeight:1.6,margin:0,maxWidth:560}}>
            {audits.length} audits across the year. Scope mapped to Annex A controls. Findings feed Risk Register and CAPA.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Audit readiness</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:"clamp(64px, 9vw, 96px)",letterSpacing:"-0.04em",lineHeight:0.9,color:auditReadiness>=80?K_.gold:auditReadiness>=50?"#D9B98C":"#D9A285"}}>{auditReadiness}<span style={{fontSize:"40%"}}>%</span></div>
          <div style={{fontSize:11,color:K_.navyT3,marginTop:6,letterSpacing:"0.04em"}}>controls tested in last 12 months</div>
        </div>
      </div>
    </div>

    {/* ── STAT CARDS ── */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:14}}>
      {[
        {label:"Planned",         value:planned,         tone:K_.ink3,  sub:"on the calendar"},
        {label:"In progress",     value:inProg,          tone:K_.amber, sub:"underway"},
        {label:"Completed (12mo)",value:completed,       tone:K_.sage,  sub:"audits closed"},
        {label:"Open findings",   value:openFindings,    tone:K_.crit,  sub:"action required"},
        {label:"In remediation",  value:inRemediation,   tone:K_.amber, sub:"CAPA active"},
        {label:"Closed findings", value:closed,          tone:K_.sage,  sub:"complete"},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:14,border:`1px solid ${K_.line}`,padding:"18px 20px"}}>
          <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:38,letterSpacing:"-0.02em",lineHeight:1,color:s.tone}}>{s.value}</div>
          <div style={{fontSize:11,color:K_.ink3,marginTop:6}}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* ── SEARCH + STATUS FILTERS ── */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search audits by ID, name, lead auditor…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
        <button onClick={()=>showToast("New audit planning — write path next session","info")} style={{
          background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",
          fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,
        }}>
          <span>+</span> Schedule audit
        </button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Status</span>
        {[["all","All"],["Planned","Planned"],["In Progress","In Progress"],["Completed","Completed"]].map(([k,l])=>(
          <button key={k} onClick={()=>setStatusFilter(k)} style={{
            background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
            color:statusFilter===k?"#fff":K_.ink2,
            border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:statusFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
    </div>

    {/* ── AUDIT LIST ── */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px",marginBottom:10}}>
      <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>
        Showing {filtered.length} audit{filtered.length===1?"":"s"}
      </div>
      <div style={{fontSize:11,color:K_.ink3,fontStyle:"italic"}}>Click any audit to view findings</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(420px,1fr))",gap:12,marginBottom:14}}>
      {filtered.map(a => {
        const fcount = findings.filter(f=>f.auditId===a.id).length;
        const openCount = findings.filter(f=>f.auditId===a.id && f.status==="Open").length;
        return (
          <div key={a.id} onClick={()=>setSelectedId(a.id)} style={{
            background:K_.surface,borderRadius:14,border:`1px solid ${K_.line}`,
            padding:"20px 22px",cursor:"pointer",transition:"background .15s, transform .12s, box-shadow .12s",
            position:"relative",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background=K_.bg;e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 20px -10px rgba(28,27,31,0.18)";}}
          onMouseLeave={e=>{e.currentTarget.style.background=K_.surface;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"3px 10px",fontSize:10.5,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{a.id}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(a.status)+"15",color:statusColor(a.status),border:`1px solid ${statusColor(a.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(a.status)}}/>
                {a.status}
              </span>
            </div>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:18,letterSpacing:"-0.012em",lineHeight:1.25,color:K_.ink,margin:"0 0 10px 0"}}>{a.name}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {a.scopeThemes.map(t=>(<span key={t} style={{background:K_.s1,color:K_.ink2,borderRadius:6,padding:"2px 8px",fontSize:10.5,fontFamily:fSans,fontWeight:500}}>{t}</span>))}
            </div>
            <p style={{fontSize:12,color:K_.ink2,lineHeight:1.55,margin:"0 0 12px 0"}}>{a.scope}</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${K_.line}`,fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",flexWrap:"wrap",gap:8}}>
              <span>{a.startDate} → {a.endDate}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                {fcount > 0 && <strong style={{color:openCount>0?K_.crit:K_.sage,fontFamily:fSans,letterSpacing:0}}>{fcount} finding{fcount===1?"":"s"}{openCount>0?` · ${openCount} open`:""}</strong>}
                {fcount === 0 && a.status==="Completed" && <span style={{color:K_.sage}}>no findings</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    {/* ── SELECTED AUDIT DETAIL — modal ── */}
    {sel && (
      <div onClick={()=>setSelectedId(null)} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
        <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 34px",maxWidth:1000,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:14,flexWrap:"wrap"}}>
            <div style={{flex:"1 1 480px"}}>
              <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(sel.status)+"15",color:statusColor(sel.status),border:`1px solid ${statusColor(sel.status)}30`,borderRadius:100,padding:"3px 9px",fontSize:11,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.status)}}/>
                  {sel.status}
                </span>
                {sel.scopeThemes.map(t=>(<span key={t} style={{background:K_.s1,color:K_.ink2,borderRadius:100,padding:"3px 10px",fontSize:11,fontFamily:fSans,fontWeight:500}}>{t}</span>))}
              </div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.25}}>{sel.name}</h2>
            </div>
            <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
          </div>

          {/* Scope */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Scope</div>
            <p style={{fontSize:13.5,color:K_.ink,lineHeight:1.55,margin:0}}>{sel.scope}</p>
          </div>

          {/* Methodology + Summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
            <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Methodology</div>
              <p style={{fontSize:12.5,color:K_.ink2,lineHeight:1.55,margin:0}}>{sel.methodology}</p>
            </div>
            <div>
              <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Summary</div>
              <p style={{fontSize:12.5,color:K_.ink2,lineHeight:1.55,margin:0}}>{sel.summary}</p>
            </div>
          </div>

          {/* Meta grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20,padding:"16px 18px",background:K_.bg,borderRadius:12,border:`1px solid ${K_.line}`}}>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Lead auditor</div>
              <div style={{fontSize:13,color:K_.ink,fontWeight:600}}>{sel.leadAuditor}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Team</div>
              <div style={{fontSize:12.5,color:K_.ink,fontWeight:500}}>{sel.auditors.join(", ")}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Start → End</div>
              <div style={{fontSize:13,color:K_.ink,fontFamily:fMono,letterSpacing:"0.04em"}}>{sel.startDate} → {sel.endDate}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Frameworks</div>
              <div style={{fontSize:12,color:K_.ink,fontWeight:500}}>{sel.frameworks.join(" · ")}</div>
            </div>
          </div>

          {/* Controls in scope */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Annex A controls in scope ({sel.scopeControls.length === 1 && sel.scopeControls[0].includes("all") ? 93 : sel.scopeControls.length})</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {sel.scopeControls.map(c=>(
                <button key={c} onClick={()=>{if(!c.includes("all")){setSelectedId(null);setTab("annexa");}}} style={{background:K_.bg,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"5px 10px",fontSize:11.5,fontFamily:fMono,letterSpacing:"0.02em",cursor:c.includes("all")?"default":"pointer"}}>{c}</button>
              ))}
            </div>
          </div>

          {/* FINDINGS LEDGER */}
          <div style={{marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
              <div>
                <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Findings ledger</div>
                <h3 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:20,letterSpacing:"-0.015em",color:K_.ink,margin:0}}>What this audit found.</h3>
              </div>
              <button onClick={()=>openLogFinding(sel)} disabled={!canEdit}
                title={canEdit?"Log a new finding against this audit":"Log finding requires live DB connection"}
                style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"7px 14px",fontSize:11.5,fontWeight:700,cursor:canEdit?"pointer":"not-allowed",opacity:canEdit?1:0.55,fontFamily:fSans}}>
                + Log finding
              </button>
            </div>
            {selFindings.length === 0 ? (
              <div style={{padding:"24px 22px",background:K_.bg,borderRadius:12,border:`1px dashed ${K_.line}`,textAlign:"center"}}>
                <p style={{fontSize:13,color:K_.ink3,fontStyle:"italic",margin:0}}>No findings logged for this audit yet.</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {selFindings.map((f,i)=>(
                  <div key={f.id} style={{
                    background:K_.bg, borderRadius:12,
                    border:`1px solid ${sevColor(f.severity)}30`,
                    borderLeft:`4px solid ${sevColor(f.severity)}`,
                    padding:"16px 18px",
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:10,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.06em",fontWeight:600}}>{f.id}</span>
                        <span style={{background:sevColor(f.severity)+"15",color:sevColor(f.severity),borderRadius:100,padding:"2px 9px",fontSize:10.5,fontWeight:700,letterSpacing:"0.04em"}}>{f.severity.toUpperCase()}</span>
                        <button onClick={()=>{setSelectedId(null);setTab("annexa");}} style={{background:"transparent",color:K_.gold,border:`1px solid ${K_.gold}40`,borderRadius:6,padding:"1px 8px",fontSize:11,fontFamily:fMono,cursor:"pointer"}}>{f.controlId}</button>
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,color:findingStatusColor(f.status),fontSize:11,fontWeight:600,fontFamily:fSans}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:findingStatusColor(f.status)}}/>
                          {f.status}
                        </span>
                      </div>
                      <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono}}>{f.loggedAt}</span>
                    </div>
                    <div style={{fontSize:13.5,fontWeight:600,color:K_.ink,marginBottom:6,lineHeight:1.4}}>{f.title}</div>
                    <p style={{fontSize:12.5,color:K_.ink2,lineHeight:1.6,margin:"0 0 10px 0"}}>{f.finding}</p>
                    <div style={{paddingTop:10,borderTop:`1px dashed ${K_.line}`,fontSize:12,color:K_.ink2,lineHeight:1.55}}>
                      <strong style={{color:K_.ink,fontWeight:600}}>Recommendation:</strong> {f.recommendation}
                    </div>
                    <div style={{display:"flex",gap:14,marginTop:10,fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",flexWrap:"wrap"}}>
                      <span>logged by: <strong style={{color:K_.ink2,fontFamily:fSans,letterSpacing:0}}>{f.loggedBy}</strong></span>
                      <span>target close: <strong style={{color:K_.ink2,fontFamily:fSans,letterSpacing:0}}>{f.targetClose}</strong></span>
                      {f.linkedRiskId && <button onClick={()=>{setSelectedId(null);setTab("risks");}} style={{background:"transparent",color:K_.gold,border:`1px solid ${K_.gold}40`,borderRadius:6,padding:"1px 8px",fontSize:10.5,fontFamily:fMono,cursor:"pointer",letterSpacing:"0.02em"}}>→ {f.linkedRiskId}</button>}
                      {f.capaId && <span style={{color:K_.ink3,fontSize:10.5}}>CAPA: {f.capaId}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
            <button onClick={()=>showToast("Export audit report — backend required","info")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
              <span>↓</span> Export report (PDF)
            </button>
            {sel.status === "In Progress" && (
              <button onClick={()=>markAuditComplete(sel.id)} disabled={completingAudit || !canEdit}
                title={canEdit?"Close this audit out":"Mark complete requires live DB connection"}
                style={{background:"transparent",color:K_.sage,border:`1px solid ${K_.sage}50`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:(completingAudit||!canEdit)?"not-allowed":"pointer",fontFamily:fSans,opacity:(completingAudit||!canEdit)?0.55:1}}>
                {completingAudit?"⋯ Closing…":"✓ Mark complete"}
              </button>
            )}
            <button onClick={()=>{setSelectedId(null);setTab("annexa");}} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
              View scoped controls →
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ─── LOG FINDING MODAL ─── */}
    {findingMode && newFinding && (
      <div onClick={()=>{if(!savingFinding){setFindingMode(false);setNewFinding(null);}}} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.62)",
        zIndex:1010,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)",
      }}>
        <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 32px",maxWidth:880,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.4)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,gap:14}}>
            <div>
              <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>New finding · {nextFindingId()}</div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:28,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.2}}>Log a finding</h2>
              <p style={{fontSize:12,color:K_.ink3,margin:"6px 0 0 0",lineHeight:1.5}}>Against <strong style={{color:K_.ink2,fontFamily:fMono,fontWeight:600,letterSpacing:"0.04em"}}>{newFinding.auditId}</strong></p>
            </div>
            <button onClick={()=>{setFindingMode(false);setNewFinding(null);}} disabled={savingFinding} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:savingFinding?"not-allowed":"pointer",fontWeight:600}}>Close</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}}>
            {/* Control + Severity + Status */}
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Control <span style={{color:K_.crit}}>*</span></label>
              <input value={newFinding.controlId} onChange={e=>setNewFinding({...newFinding,controlId:e.target.value})} placeholder="A.5.18"
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Severity</label>
              <select value={newFinding.severity} onChange={e=>setNewFinding({...newFinding,severity:e.target.value})}
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Critical","Major","Minor","Observation"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Initial status</label>
              <select value={newFinding.status} onChange={e=>setNewFinding({...newFinding,status:e.target.value})}
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",cursor:"pointer"}}>
                {["Open","In Remediation","Closed"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Finding title <span style={{color:K_.crit}}>*</span></label>
            <input value={newFinding.title} onChange={e=>setNewFinding({...newFinding,title:e.target.value})} placeholder="One-line summary of what was found"
              style={{width:"100%",padding:"10px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Detailed finding</label>
            <textarea value={newFinding.finding} onChange={e=>setNewFinding({...newFinding,finding:e.target.value})} rows={4} placeholder="What was tested, what was found, sample sizes, root cause."
              style={{width:"100%",padding:"12px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",resize:"vertical",lineHeight:1.55}}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Recommendation</label>
            <textarea value={newFinding.recommendation} onChange={e=>setNewFinding({...newFinding,recommendation:e.target.value})} rows={3} placeholder="What needs to be done to address this finding, and by when."
              style={{width:"100%",padding:"12px 14px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",resize:"vertical",lineHeight:1.55}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:18}}>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Logged by <span style={{color:K_.crit}}>*</span></label>
              <input value={newFinding.loggedBy} onChange={e=>setNewFinding({...newFinding,loggedBy:e.target.value})} placeholder="Auditor name"
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Logged on</label>
              <input type="date" value={newFinding.loggedAt} onChange={e=>setNewFinding({...newFinding,loggedAt:e.target.value})}
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Target close</label>
              <input type="date" value={newFinding.targetClose} onChange={e=>setNewFinding({...newFinding,targetClose:e.target.value})}
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Linked risk (opt)</label>
              <input value={newFinding.linkedRiskId} onChange={e=>setNewFinding({...newFinding,linkedRiskId:e.target.value})} placeholder="R-014"
                style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fMono,color:K_.ink,background:K_.bg,outline:"none"}}/>
            </div>
          </div>

          {/* Save + Cancel */}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
            <button onClick={()=>{setFindingMode(false);setNewFinding(null);}} disabled={savingFinding}
              style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:savingFinding?"not-allowed":"pointer",fontFamily:fSans,opacity:savingFinding?0.5:1}}>
              Cancel
            </button>
            <button
              onClick={async ()=>{
                if(!supabase) return;
                if(!newFinding.controlId.trim()){ showToast("Control reference is required","error"); return; }
                if(!newFinding.title.trim()){ showToast("Title is required","error"); return; }
                if(!newFinding.loggedBy.trim()){ showToast("Logged by is required","error"); return; }
                setSavingFinding(true);
                const id = nextFindingId();
                const dbRow = {
                  id,
                  audit_id:        newFinding.auditId,
                  control_id:      newFinding.controlId.trim(),
                  severity:        newFinding.severity,
                  title:           newFinding.title.trim(),
                  finding:         newFinding.finding || null,
                  recommendation:  newFinding.recommendation || null,
                  status:          newFinding.status,
                  logged_by:       newFinding.loggedBy.trim(),
                  logged_at:       newFinding.loggedAt || null,
                  target_close:    newFinding.targetClose || null,
                  linked_risk_id:  newFinding.linkedRiskId.trim() || null,
                  capa_id:         newFinding.capaId.trim() || null,
                };
                const { error } = await supabase.from("audit_findings").insert(dbRow);
                setSavingFinding(false);
                if(error){
                  showToast(`Log failed: ${error.message}`, "error");
                  return;
                }
                setFindings(fs => [...fs, dbToFinding(dbRow)]);
                setFindingMode(false);
                setNewFinding(null);
                showToast(`${id} logged`, "success");
              }}
              disabled={savingFinding}
              style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 22px",fontSize:12,fontWeight:700,cursor:savingFinding?"not-allowed":"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,opacity:savingFinding?0.7:1}}>
              <span>{savingFinding?"⋯":"+"}</span> {savingFinding?"Logging…":"Log finding"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>;
}

/* ─────────────────────────────────────────────
   CAPA — Corrective Actions / seeded data
   Closes the loop: audit findings + risks generate Corrective
   Action items, tracked to verified closure. Same lifecycle
   regardless of source — Open → In Progress → Pending Verification
   → Closed.
───────────────────────────────────────────── */
const CAPA_REGISTER = [
  /* Linked from Q1 2026 Access Control audit */
  {
    id:"CAPA-2026-001",
    title:"Automate joiner-mover-leaver via HRIS-to-IAM webhook",
    source:"Audit Finding", sourceId:"F-2026-001",
    owner:"David Park (CIO)",
    raisedBy:"Mei Lin (Internal Audit Lead)",
    raisedAt:"2026-02-08", targetDate:"2026-08-15", closedAt:null,
    status:"In Progress", priority:"High",
    rootCause:"HR offboarding events did not consistently trigger IAM workflow because contractor end-date extensions were processed via email rather than through the HRIS. The integration assumed all offboarding events would originate in Workday.",
    actionSteps:[
      {step:"Document current end-to-end onboarding/offboarding flow including contractor variants", status:"complete", owner:"Andre Okafor", due:"2026-03-15"},
      {step:"Build Workday-to-Okta webhook for terminations and end-date changes", status:"complete", owner:"Platform Team", due:"2026-05-30"},
      {step:"Mandatory CISO sign-off on weekly orphan-account scan", status:"in progress", owner:"Sarah Chen (CISO)", due:"2026-07-15"},
      {step:"Update Access Control Policy § 4.2 with new automated SLA (5 business days)", status:"in progress", owner:"Compliance Team", due:"2026-07-31"},
      {step:"Re-test 60-account sample in Q3 2026 audit", status:"pending", owner:"Mei Lin", due:"2026-08-15"},
    ],
    verificationMethod:"Re-sample of 60 departed staff in Q3 2026 internal audit. Target: 0 accounts dormant beyond 5 business days.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.18","A.5.16"], linkedRisks:["R-002"],
  },
  {
    id:"CAPA-2026-002",
    title:"Centralise privileged access entitlement reviews",
    source:"Audit Finding", sourceId:"F-2026-002",
    owner:"Sarah Chen (CISO)",
    raisedBy:"Andre Okafor",
    raisedAt:"2026-02-10", targetDate:"2026-07-31", closedAt:null,
    status:"Open", priority:"Medium",
    rootCause:"No centralised system of record for privileged access reviews. Reviews were distributed across team leads, with no aggregated tracking or sign-off documentation requirement.",
    actionSteps:[
      {step:"Inventory all privileged groups (11 identified plus contractor groups)", status:"complete", owner:"Sarah Chen", due:"2026-03-15"},
      {step:"Build privileged access review dashboard with calendar-driven reminders", status:"in progress", owner:"Platform Team", due:"2026-06-30"},
      {step:"Pilot quarterly review with 3 groups using new dashboard", status:"pending", owner:"Sarah Chen", due:"2026-07-15"},
      {step:"Roll out to all 11 groups with signed-off review evidence captured", status:"pending", owner:"Sarah Chen", due:"2026-07-31"},
    ],
    verificationMethod:"Sample-based verification — sample 4 of 11 groups, confirm dashboard sign-off evidence exists for most-recent review cycle.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.15","A.5.18"], linkedRisks:[],
  },
  /* Linked from Annual ISMS audit (Bureau Veritas) */
  {
    id:"CAPA-2025-014",
    title:"Operationalise Threat Intelligence Procedure — monthly reports + actions",
    source:"Audit Finding", sourceId:"F-2025-014",
    owner:"Sarah Chen (CISO)",
    raisedBy:"Helena Kruger (Bureau Veritas)",
    raisedAt:"2025-11-22", targetDate:"2026-02-28", closedAt:"2026-02-25",
    status:"Closed", priority:"Medium",
    rootCause:"Procedure existed but lacked operational ownership. Three intelligence feeds were subscribed to but no defined cadence for report consolidation or actioning.",
    actionSteps:[
      {step:"Assign monthly threat intel ownership to Security Analyst", status:"complete", owner:"Sarah Chen", due:"2025-12-15"},
      {step:"Define minimum content for monthly intelligence report (template)", status:"complete", owner:"Security Analyst", due:"2026-01-15"},
      {step:"Establish quarterly action commitment (≥1 actionable item per quarter)", status:"complete", owner:"Security Analyst", due:"2026-02-15"},
      {step:"Q1 2026 report + first quarterly action logged", status:"complete", owner:"Security Analyst", due:"2026-02-28"},
    ],
    verificationMethod:"Bureau Veritas Q1 follow-up review. Sample: most recent 3 monthly reports + evidence of at least one tracked action.",
    verificationDate:"2026-03-12", verifier:"Helena Kruger (Bureau Veritas)",
    verificationNotes:"Verified. Three reports on file (Dec 2025, Jan 2026, Feb 2026). Two actionable items logged for Q1 — Log4j compensating control coverage gap + MITRE T1078 detection tuning. Both tracked in ticketing system. Closed.",
    linkedControls:["A.5.7"], linkedRisks:[],
  },
  {
    id:"CAPA-2025-015",
    title:"Catch-up security awareness training for 38 outstanding staff",
    source:"Audit Finding", sourceId:"F-2025-015",
    owner:"Patricia Watts (CGO)",
    raisedBy:"Helena Kruger (Bureau Veritas)",
    raisedAt:"2025-11-24", targetDate:"2026-01-31", closedAt:"2026-01-28",
    status:"Closed", priority:"Medium",
    rootCause:"Annual training cycle (Oct 2025) hit 87%. 38 individuals overdue — primarily concentrated in two subsidiaries acquired in Q3 2025. M&A integration runbook did not include day-1 training enrolment.",
    actionSteps:[
      {step:"Identify all 38 individuals and assign manager-level escalation", status:"complete", owner:"HR Operations", due:"2025-12-15"},
      {step:"Targeted catch-up campaign with 30/14/7 day reminders", status:"complete", owner:"HR Operations", due:"2026-01-15"},
      {step:"Update M&A integration runbook to include day-1 training enrolment", status:"complete", owner:"M&A Integration Lead", due:"2026-01-31"},
    ],
    verificationMethod:"Completion report from LMS showing 100% of 38 individuals trained. Runbook update visible in shared M&A space.",
    verificationDate:"2026-02-04", verifier:"Helena Kruger (Bureau Veritas)",
    verificationNotes:"Verified. All 38 completed by Jan 24. Final completion rate for FY2025 cycle: 99.2%. Runbook update reviewed.",
    linkedControls:["A.6.3"], linkedRisks:[],
  },
  {
    id:"CAPA-2025-016",
    title:"Enforce 48-hour SLA on emergency change post-implementation review",
    source:"Audit Finding", sourceId:"F-2025-016",
    owner:"David Park (CIO)",
    raisedBy:"Helena Kruger (Bureau Veritas)",
    raisedAt:"2025-11-28", targetDate:"2026-06-30", closedAt:null,
    status:"In Progress", priority:"Medium",
    rootCause:"Change management ticketing tool allowed emergency tickets to be closed without post-implementation review attached. Manual process relied on change manager memory.",
    actionSteps:[
      {step:"Add automated 24-hour reminder on emergency change tickets", status:"complete", owner:"Platform Team", due:"2026-02-15"},
      {step:"Block ticket closure until post-review section completed", status:"complete", owner:"Platform Team", due:"2026-04-15"},
      {step:"Sample 20 emergency changes Q2 2026 — verify 0 SLA breaches", status:"in progress", owner:"David Park", due:"2026-06-30"},
    ],
    verificationMethod:"Audit re-test in Q3 2026. Sample of 20 emergency changes from Q2 2026, target: 0 reviews outside 48h SLA.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.8.32"], linkedRisks:[],
  },
  {
    id:"CAPA-2025-017",
    title:"Restore annual BCP tabletop cadence + introduce quarterly micro-exercises",
    source:"Audit Finding", sourceId:"F-2025-017",
    owner:"Patricia Watts (CGO)",
    raisedBy:"Helena Kruger (Bureau Veritas)",
    raisedAt:"2025-12-01", targetDate:"2026-09-30", closedAt:null,
    status:"In Progress", priority:"High",
    rootCause:"BCP testing fell off after key BCP coordinator transitioned in Q2 2025. Replacement not appointed until Q4 2025. 12-month gap in tabletop exercises.",
    actionSteps:[
      {step:"Appoint new BCP coordinator (Patricia Watts taking direct ownership)", status:"complete", owner:"Patricia Watts", due:"2025-12-31"},
      {step:"Q1 2026 — ransomware-scenario tabletop", status:"complete", owner:"Patricia Watts", due:"2026-03-31"},
      {step:"Q2 2026 — DR failover live test (tier-1 systems)", status:"in progress", owner:"David Park", due:"2026-06-30"},
      {step:"Q3 2026 — Full BCP tabletop (annual cycle)", status:"pending", owner:"Patricia Watts", due:"2026-09-20"},
    ],
    verificationMethod:"Bureau Veritas Q4 2026 surveillance audit will sample tabletop reports + lessons-learned actions.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.30","A.5.29"], linkedRisks:[],
  },
  /* Standalone — raised from risk, not audit */
  {
    id:"CAPA-2026-003",
    title:"Vendor due-diligence refresh for 4 critical suppliers overdue >18 months",
    source:"Audit Finding", sourceId:"F-2026-007",
    owner:"Jennifer Lim (CDPO)",
    raisedBy:"Andre Okafor",
    raisedAt:"2026-05-08", targetDate:"2026-11-30", closedAt:null,
    status:"Open", priority:"High",
    rootCause:"Supplier review calendar maintained in shared spreadsheet without automated reminders. Calendar ownership unclear after procurement reorg in Q1 2026.",
    actionSteps:[
      {step:"Re-issue security questionnaires to 4 overdue critical suppliers", status:"pending", owner:"Vendor Risk Team", due:"2026-07-15"},
      {step:"Onboard supplier review cadence into VerisZone with 90-day pre-due reminders", status:"pending", owner:"Vendor Risk Team", due:"2026-08-31"},
      {step:"Escalation procedure documented — Supplier Owner + CISO at 30 days overdue", status:"pending", owner:"Sarah Chen", due:"2026-09-30"},
      {step:"All 12 critical suppliers current as of Q4 2026", status:"pending", owner:"Vendor Risk Team", due:"2026-11-30"},
    ],
    verificationMethod:"Q4 2026 sample — confirm all 12 critical suppliers have completed security review in current calendar year.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.19","A.5.22"], linkedRisks:["R-014"],
  },
  /* From a risk, not audit */
  {
    id:"CAPA-2026-004",
    title:"Phishing-resistant MFA rollout for all privileged accounts (FIDO2)",
    source:"Risk", sourceId:"R-001",
    owner:"Sarah Chen (CISO)",
    raisedBy:"Sarah Chen (CISO)",
    raisedAt:"2026-03-12", targetDate:"2026-10-31", closedAt:null,
    status:"In Progress", priority:"Critical",
    rootCause:"Current TOTP-based MFA is vulnerable to AitM phishing attacks. Sector incident in Feb 2026 (peer org) demonstrated real-world exploitability against TOTP.",
    actionSteps:[
      {step:"FIDO2 security key bulk purchase (250 units for all privileged staff)", status:"complete", owner:"Procurement", due:"2026-04-15"},
      {step:"Okta + Azure AD configuration to require FIDO2 for privileged role tiers", status:"complete", owner:"Platform Team", due:"2026-06-30"},
      {step:"Pilot rollout with Platform Team (12 individuals)", status:"complete", owner:"Sarah Chen", due:"2026-07-31"},
      {step:"Full rollout to all 250 privileged users + recovery key escrow procedure", status:"in progress", owner:"Sarah Chen", due:"2026-10-31"},
    ],
    verificationMethod:"Okta admin export confirming 100% of privileged roles have FIDO2 as primary factor + helpdesk record of zero phishing-related lockouts in 30-day post-rollout window.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.16","A.5.17","A.8.5"], linkedRisks:["R-001"],
  },
  /* From an incident */
  {
    id:"CAPA-2026-005",
    title:"Tighten S3 bucket public-access defaults post-misconfiguration incident",
    source:"Incident", sourceId:"INC-2026-031",
    owner:"David Park (CIO)",
    raisedBy:"Security Operations",
    raisedAt:"2026-04-22", targetDate:"2026-05-31", closedAt:"2026-05-29",
    status:"Closed", priority:"Critical",
    rootCause:"Developer-created S3 bucket for staging environment was created without Block Public Access. Default account-level setting was permissive (legacy). Bucket briefly held de-identified test data for 6 hours before being detected by daily configuration scan. No personal data exposed.",
    actionSteps:[
      {step:"Block Public Access enabled at account level for all 4 AWS accounts", status:"complete", owner:"Platform Team", due:"2026-05-01"},
      {step:"Service control policy (SCP) added to prevent BPA from being disabled below account level", status:"complete", owner:"Platform Team", due:"2026-05-15"},
      {step:"Daily config scan extended to detect any new buckets within 1 hour (was 24h)", status:"complete", owner:"SecOps", due:"2026-05-22"},
      {step:"Developer training session on S3 security defaults", status:"complete", owner:"Sarah Chen", due:"2026-05-29"},
    ],
    verificationMethod:"AWS Config rule + screenshot of SCP. Tested by attempting to create a public bucket — denied as expected.",
    verificationDate:"2026-05-30", verifier:"Sarah Chen (CISO)",
    verificationNotes:"Verified. All 4 accounts confirmed BPA on. SCP test passed. Incident closed with no customer impact. Lessons-learned doc filed.",
    linkedControls:["A.8.9","A.8.32"], linkedRisks:[],
  },
  /* Pending verification — overdue */
  {
    id:"CAPA-2026-006",
    title:"Data retention policy enforcement — purge >7yr customer records",
    source:"Internal Review", sourceId:"REV-2026-008",
    owner:"Jennifer Lim (CDPO)",
    raisedBy:"Jennifer Lim (CDPO)",
    raisedAt:"2026-01-14", targetDate:"2026-04-30", closedAt:null,
    status:"Pending Verification", priority:"Medium",
    rootCause:"Data retention policy mandates 7-year max retention for closed customer records. Internal review found ~84k records exceeding limit, primarily in legacy CRM imported during 2018 platform migration.",
    actionSteps:[
      {step:"Inventory and classify all records older than 7 years", status:"complete", owner:"Data Engineering", due:"2026-02-15"},
      {step:"Legal review for any litigation hold exclusions (47 records held)", status:"complete", owner:"Legal", due:"2026-03-01"},
      {step:"Purge ~84k records via approved purge process", status:"complete", owner:"Data Engineering", due:"2026-04-15"},
      {step:"Database query confirming 0 records older than 7yr + audit log of purge", status:"complete", owner:"Data Engineering", due:"2026-04-30"},
    ],
    verificationMethod:"Independent verification by CISO team — re-run retention query and confirm 0 records exceed 7-year threshold. Audit log spot-check.",
    verificationDate:null, verifier:null, verificationNotes:null,
    linkedControls:["A.5.33","A.8.10"], linkedRisks:[],
  },
];

/* ─────────────────────────────────────────────
   PAGE: CORRECTIVE ACTIONS (CAPA)
   Tracks remediation actions across audit findings, risks,
   incidents, internal reviews. Each item flows through the
   Open → In Progress → Pending Verification → Closed lifecycle.
───────────────────────────────────────────── */
function PageCAPA({setTab,showToast}) {
  const [statusFilter,setStatusFilter]=useState("all");
  const [priorityFilter,setPriorityFilter]=useState("all");
  const [sourceFilter,setSourceFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  /* ─── Live data, fallback to constants ─── */
  const [items, dataSource] = useSupabaseTable("capa", dbToCAPA, CAPA_REGISTER, "id");

  const K_ = {
    bg:"#FAFAF6", surface:"#FFFFFF", s1:"#F4F2EC", s2:"#EDE9E0",
    line:"rgba(28,27,31,0.07)", lineH:"rgba(28,27,31,0.14)",
    navy:"#1C1B1F", navy2:"#2A2826", navyT:"#F5F2EA",
    navyT2:"rgba(245,242,234,0.62)", navyT3:"rgba(245,242,234,0.32)",
    ink:"#1A1916", ink2:"#5F5C56", ink3:"#9A9690", ink4:"#C5C2BA",
    gold:"#C9A961", goldText:"#1A1916", goldL:"rgba(201,169,97,0.12)",
    sage:"#5B7A5E", sageL:"rgba(91,122,94,0.10)",
    amber:"#B8956A", amberL:"rgba(184,149,106,0.10)",
    crit:"#9B3636", critL:"rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','PP Editorial Old','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  const statusColor = s => ({
    "Open":K_.crit, "In Progress":K_.amber, "Pending Verification":K_.gold, "Closed":K_.sage, "Overdue":K_.crit,
  })[s] || K_.ink3;
  const prioColor = p => ({
    "Critical":K_.crit, "High":K_.crit, "Medium":K_.amber, "Low":K_.ink3,
  })[p] || K_.ink3;
  const sourceTone = s => ({
    "Audit Finding":K_.gold, "Risk":K_.crit, "Incident":K_.amber, "Internal Review":K_.ink2,
  })[s] || K_.ink3;

  /* Esc closes detail modal */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  /* Helpers — derive overdue + days to target */
  const today = new Date().toISOString().slice(0,10);
  const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date(today)) / 86400000) : null;
  const effectiveStatus = (c) => {
    if (c.status === "Closed") return "Closed";
    if (c.targetDate && c.targetDate < today && c.status !== "Pending Verification") return "Overdue";
    return c.status;
  };

  /* Stats */
  const enriched = items.map(c => ({...c, effStatus: effectiveStatus(c)}));
  const openCount      = enriched.filter(c => c.effStatus !== "Closed").length;
  const overdueCount   = enriched.filter(c => c.effStatus === "Overdue").length;
  const pendingVerify  = enriched.filter(c => c.effStatus === "Pending Verification").length;
  const closedCount    = enriched.filter(c => c.effStatus === "Closed").length;
  const criticalCount  = enriched.filter(c => c.priority === "Critical" && c.effStatus !== "Closed").length;
  /* Average days to close — only completed items */
  const closedItems = enriched.filter(c => c.effStatus === "Closed" && c.closedAt && c.raisedAt);
  const avgDays = closedItems.length
    ? Math.round(closedItems.reduce((s,c) => s + Math.ceil((new Date(c.closedAt) - new Date(c.raisedAt))/86400000), 0) / closedItems.length)
    : null;

  /* Filter */
  const filtered = enriched.filter(c => {
    if(statusFilter!=="all"   && c.effStatus !== statusFilter) return false;
    if(priorityFilter!=="all" && c.priority !== priorityFilter) return false;
    if(sourceFilter!=="all"   && c.source !== sourceFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(c.id.toLowerCase().includes(q) || (c.title||"").toLowerCase().includes(q) || (c.owner||"").toLowerCase().includes(q))) return false;
    }
    return true;
  });
  /* Sort: overdue first, then closest target date, then by priority */
  filtered.sort((a,b) => {
    const so = ["Overdue","Open","In Progress","Pending Verification","Closed"];
    const da = so.indexOf(a.effStatus), db = so.indexOf(b.effStatus);
    if (da !== db) return da - db;
    return (a.targetDate||"").localeCompare(b.targetDate||"");
  });

  const sel = selectedId ? enriched.find(c=>c.id===selectedId) : null;

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {/* ── HERO ── */}
    <div style={{
      background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
      borderRadius:20,padding:"32px 36px",marginBottom:14,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,opacity:0.07,backgroundImage:`radial-gradient(circle at 80% 20%, ${K_.gold} 1px, transparent 1px)`,backgroundSize:"24px 24px"}}/>
      <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:24}}>
        <div style={{maxWidth:680}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:14}}>
            <span>▸</span><span>ISO 27001 § 10.1 · Corrective Actions</span>
            <DataSourcePill dataSource={dataSource} mono={fMono}/>
          </div>
          <h1 style={{
            fontFamily:fSerif,fontStyle:"italic",fontWeight:400,
            fontSize:"clamp(34px, 4.5vw, 52px)",
            letterSpacing:"-0.02em",lineHeight:1.05,color:K_.navyT,margin:"0 0 14px 0",
          }}>What we found, what we fixed.</h1>
          <p style={{fontSize:14.5,color:K_.navyT2,lineHeight:1.6,margin:0,maxWidth:560}}>
            {items.length} corrective actions tracked. Sourced from audit findings, risks, incidents and internal reviews. Every item to verified closure.
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>{overdueCount>0?"Overdue":"All on track"}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:"clamp(64px, 9vw, 96px)",letterSpacing:"-0.04em",lineHeight:0.9,color:overdueCount>0?"#D9A285":K_.gold}}>{overdueCount}</div>
          <div style={{fontSize:11,color:K_.navyT3,marginTop:6,letterSpacing:"0.04em"}}>{overdueCount===0?"zero past target date":"actions past target date"}</div>
        </div>
      </div>
    </div>

    {/* ── STAT CARDS ── */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:14}}>
      {[
        {label:"Open",                value:openCount,      tone:K_.crit,  sub:"action required"},
        {label:"Critical priority",   value:criticalCount,  tone:K_.crit,  sub:"open, critical only"},
        {label:"Pending verification",value:pendingVerify,  tone:K_.gold,  sub:"work done, awaiting check"},
        {label:"Closed",              value:closedCount,    tone:K_.sage,  sub:"verified complete"},
        {label:"Avg days to close",   value:avgDays??"—",   tone:K_.ink,   sub:"completed items only"},
        {label:"Total tracked",       value:items.length,   tone:K_.ink2,  sub:"all sources"},
      ].map(s=>(
        <div key={s.label} style={{background:K_.surface,borderRadius:14,border:`1px solid ${K_.line}`,padding:"18px 20px"}}>
          <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>{s.label}</div>
          <div style={{fontFamily:fSerif,fontStyle:"italic",fontSize:38,letterSpacing:"-0.02em",lineHeight:1,color:s.tone}}>{s.value}</div>
          <div style={{fontSize:11,color:K_.ink3,marginTop:6}}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* ── FILTERS ── */}
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ID, title, owner…" style={{
          flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
          fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
        }}/>
        <button onClick={()=>showToast("Create CAPA — write path next session","info")} style={{
          background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",
          fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6,
        }}>
          <span>+</span> New CAPA
        </button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4,minWidth:60}}>Status</span>
        {[["all","All"],["Open","Open"],["In Progress","In Progress"],["Pending Verification","Pending Verification"],["Overdue","Overdue"],["Closed","Closed"]].map(([k,l])=>(
          <button key={k} onClick={()=>setStatusFilter(k)} style={{
            background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
            color:statusFilter===k?"#fff":K_.ink2,
            border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:statusFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4,minWidth:60}}>Priority</span>
        {[["all","All"],["Critical","Critical"],["High","High"],["Medium","Medium"],["Low","Low"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPriorityFilter(k)} style={{
            background:priorityFilter===k?(k==="all"?K_.navy:prioColor(k)):"transparent",
            color:priorityFilter===k?"#fff":K_.ink2,
            border:`1px solid ${priorityFilter===k?(k==="all"?K_.navy:prioColor(k)):K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:priorityFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4,minWidth:60}}>Source</span>
        {[["all","All"],["Audit Finding","Audit Finding"],["Risk","Risk"],["Incident","Incident"],["Internal Review","Internal Review"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSourceFilter(k)} style={{
            background:sourceFilter===k?K_.navy:"transparent",
            color:sourceFilter===k?"#fff":K_.ink2,
            border:`1px solid ${sourceFilter===k?K_.navy:K_.line}`,
            borderRadius:100,padding:"5px 12px",fontSize:11.5,fontWeight:sourceFilter===k?600:500,fontFamily:fSans,cursor:"pointer",
          }}>{l}</button>
        ))}
      </div>
    </div>

    {/* ── CAPA LIST ── */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px",marginBottom:10}}>
      <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>
        Showing {filtered.length} CAPA{filtered.length===1?"":"s"} · sorted by status + target date
      </div>
      <div style={{fontSize:11,color:K_.ink3,fontStyle:"italic"}}>Click any row to view detail</div>
    </div>
    <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"4px 0",marginBottom:14,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:1000}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${K_.line}`}}>
            {["ID","Title","Source","Priority","Status","Owner","Target","Linked"].map((h,i)=>(
              <th key={h+i} style={{textAlign:"left",padding:"14px 14px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(c=>{
            const du = daysUntil(c.targetDate);
            return <tr key={c.id} onClick={()=>setSelectedId(c.id)} style={{
              borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s",
              background:selectedId===c.id?K_.gold+"18":"transparent",
              boxShadow:selectedId===c.id?`inset 4px 0 0 ${K_.gold}`:"none",
            }}
            onMouseEnter={e=>{if(selectedId!==c.id)e.currentTarget.style.background=K_.bg;}}
            onMouseLeave={e=>{if(selectedId!==c.id)e.currentTarget.style.background="transparent";}}>
              <td style={{padding:"14px 14px",fontFamily:fMono,fontSize:11.5,fontWeight:600,color:K_.ink2,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{c.id}</td>
              <td style={{padding:"14px 14px",maxWidth:380}}>
                <div style={{fontSize:13,fontWeight:600,color:K_.ink,lineHeight:1.4}}>{c.title}</div>
              </td>
              <td style={{padding:"14px 14px",whiteSpace:"nowrap"}}>
                <span style={{display:"inline-block",background:sourceTone(c.source)+"15",color:sourceTone(c.source),border:`1px solid ${sourceTone(c.source)}30`,borderRadius:100,padding:"2px 9px",fontSize:10.5,fontWeight:600}}>{c.source}</span>
                {c.sourceId && <button onClick={(e)=>{e.stopPropagation(); if(c.source==="Audit Finding") setTab("audit"); else if(c.source==="Risk") setTab("risks");}} style={{display:"block",background:"transparent",color:K_.gold,border:"none",padding:0,marginTop:4,fontSize:10.5,fontFamily:fMono,letterSpacing:"0.02em",cursor:"pointer"}}>→ {c.sourceId}</button>}
              </td>
              <td style={{padding:"14px 14px",whiteSpace:"nowrap"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:prioColor(c.priority)+"15",color:prioColor(c.priority),borderRadius:100,padding:"2px 9px",fontSize:10.5,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:prioColor(c.priority)}}/>
                  {c.priority}
                </span>
              </td>
              <td style={{padding:"14px 14px",whiteSpace:"nowrap"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(c.effStatus)+"15",color:statusColor(c.effStatus),border:`1px solid ${statusColor(c.effStatus)}30`,borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(c.effStatus)}}/>
                  {c.effStatus}
                </span>
              </td>
              <td style={{padding:"14px 14px",fontSize:12,color:K_.ink2,whiteSpace:"nowrap"}}>{c.owner}</td>
              <td style={{padding:"14px 14px",whiteSpace:"nowrap",fontFamily:fMono,fontSize:11.5}}>
                <div style={{color:K_.ink2}}>{c.targetDate}</div>
                {du !== null && c.effStatus !== "Closed" && <div style={{fontSize:10,color:du<0?K_.crit:du<14?K_.amber:K_.ink3,fontFamily:fSans,letterSpacing:0,fontWeight:du<14?600:400}}>{du<0?`${Math.abs(du)}d overdue`:du===0?"due today":`${du}d to go`}</div>}
              </td>
              <td style={{padding:"14px 14px",whiteSpace:"nowrap",fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>
                {c.linkedControls.length>0 && <span>{c.linkedControls.length} control{c.linkedControls.length===1?"":"s"}</span>}
                {c.linkedRisks.length>0 && <span style={{marginLeft:c.linkedControls.length>0?8:0}}>{c.linkedRisks.length} risk{c.linkedRisks.length===1?"":"s"}</span>}
              </td>
            </tr>;
          })}
        </tbody>
      </table>
      {filtered.length===0 && <div style={{padding:"40px 22px",textAlign:"center",color:K_.ink3,fontSize:13,fontStyle:"italic"}}>No CAPAs match the current filters.</div>}
    </div>

    {/* ── SELECTED CAPA DETAIL — modal ── */}
    {sel && (
      <div onClick={()=>setSelectedId(null)} style={{
        position:"fixed",inset:0,background:"rgba(28,27,31,0.55)",
        zIndex:1000,padding:"40px 20px",overflowY:"auto",
        display:"flex",justifyContent:"center",alignItems:"flex-start",
        backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
      }}>
        <div onClick={(e)=>e.stopPropagation()} style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"30px 34px",maxWidth:1000,width:"100%",boxShadow:"0 30px 80px -20px rgba(0,0,0,0.35)",animation:"up .25s cubic-bezier(.16,1,.3,1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:14,flexWrap:"wrap"}}>
            <div style={{flex:"1 1 480px"}}>
              <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id}</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusColor(sel.effStatus)+"15",color:statusColor(sel.effStatus),border:`1px solid ${statusColor(sel.effStatus)}30`,borderRadius:100,padding:"3px 9px",fontSize:11,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(sel.effStatus)}}/>
                  {sel.effStatus}
                </span>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:prioColor(sel.priority)+"15",color:prioColor(sel.priority),borderRadius:100,padding:"3px 9px",fontSize:11,fontWeight:600}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:prioColor(sel.priority)}}/>
                  {sel.priority}
                </span>
                <span style={{background:sourceTone(sel.source)+"15",color:sourceTone(sel.source),border:`1px solid ${sourceTone(sel.source)}30`,borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:600}}>{sel.source}</span>
                {sel.sourceId && <button onClick={()=>{setSelectedId(null); if(sel.source==="Audit Finding") setTab("audit"); else if(sel.source==="Risk") setTab("risks");}} style={{background:"transparent",color:K_.gold,border:`1px solid ${K_.gold}40`,borderRadius:6,padding:"3px 10px",fontSize:11,fontFamily:fMono,cursor:"pointer",letterSpacing:"0.02em"}}>→ {sel.sourceId}</button>}
              </div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:26,letterSpacing:"-0.015em",color:K_.ink,margin:0,lineHeight:1.25}}>{sel.title}</h2>
            </div>
            <button onClick={()=>setSelectedId(null)} style={{background:"none",border:`1px solid ${K_.line}`,color:K_.ink2,borderRadius:100,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontWeight:600}}>Close</button>
          </div>

          {/* Root cause */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Root cause</div>
            <p style={{fontSize:13.5,color:K_.ink,lineHeight:1.6,margin:0}}>{sel.rootCause}</p>
          </div>

          {/* Meta grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20,padding:"16px 18px",background:K_.bg,borderRadius:12,border:`1px solid ${K_.line}`}}>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Owner</div>
              <div style={{fontSize:13,color:K_.ink,fontWeight:600}}>{sel.owner}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Raised by</div>
              <div style={{fontSize:12.5,color:K_.ink,fontWeight:500}}>{sel.raisedBy}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Raised</div>
              <div style={{fontSize:13,color:K_.ink,fontFamily:fMono,letterSpacing:"0.04em"}}>{sel.raisedAt}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Target</div>
              <div style={{fontSize:13,color:sel.effStatus==="Overdue"?K_.crit:K_.ink,fontFamily:fMono,letterSpacing:"0.04em",fontWeight:sel.effStatus==="Overdue"?600:400}}>{sel.targetDate}</div>
            </div>
            {sel.closedAt && (
              <div>
                <div style={{fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Closed</div>
                <div style={{fontSize:13,color:K_.sage,fontFamily:fMono,letterSpacing:"0.04em",fontWeight:600}}>{sel.closedAt}</div>
              </div>
            )}
          </div>

          {/* Action steps */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Action steps ({sel.actionSteps.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sel.actionSteps.map((s,i)=>{
                const stCol = s.status==="complete" ? K_.sage : s.status==="in progress" ? K_.amber : K_.ink3;
                const stLabel = s.status==="complete" ? "Done" : s.status==="in progress" ? "In Progress" : "Pending";
                return (
                  <div key={i} style={{background:K_.bg,borderRadius:10,border:`1px solid ${K_.line}`,borderLeft:`3px solid ${stCol}`,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 360px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,fontWeight:600}}>{String(i+1).padStart(2,"0")}</span>
                        <span style={{fontSize:10.5,color:stCol,fontWeight:700,letterSpacing:"0.05em"}}>{stLabel.toUpperCase()}</span>
                      </div>
                      <div style={{fontSize:13,color:K_.ink,lineHeight:1.5}}>{s.step}</div>
                    </div>
                    <div style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em",textAlign:"right",whiteSpace:"nowrap"}}>
                      <div>{s.owner}</div>
                      <div style={{marginTop:2}}>{s.due}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification */}
          <div style={{marginBottom:20,padding:"18px 20px",background:sel.verificationDate?K_.sageL:K_.s1,borderRadius:12,border:`1px solid ${sel.verificationDate?K_.sage+"30":K_.line}`}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Verification</div>
            <div style={{fontSize:13,color:K_.ink,lineHeight:1.55,marginBottom:8}}>
              <strong style={{color:K_.ink}}>Method:</strong> {sel.verificationMethod}
            </div>
            {sel.verificationDate ? (
              <div style={{paddingTop:10,borderTop:`1px dashed ${K_.sage}40`,fontSize:12.5,color:K_.ink2,lineHeight:1.55}}>
                <div style={{marginBottom:4}}><strong style={{color:K_.sage,fontFamily:fMono,letterSpacing:"0.04em"}}>VERIFIED {sel.verificationDate}</strong> by {sel.verifier}</div>
                {sel.verificationNotes && <div style={{marginTop:6,color:K_.ink2}}>{sel.verificationNotes}</div>}
              </div>
            ) : (
              <div style={{paddingTop:10,borderTop:`1px dashed ${K_.line}`,fontSize:12,color:K_.ink3,fontStyle:"italic"}}>Awaiting verification once action steps complete.</div>
            )}
          </div>

          {/* Linked controls + risks */}
          {(sel.linkedControls.length > 0 || sel.linkedRisks.length > 0) && (
            <div style={{display:"grid",gridTemplateColumns:sel.linkedControls.length>0 && sel.linkedRisks.length>0?"1fr 1fr":"1fr",gap:18,marginBottom:18}}>
              {sel.linkedControls.length > 0 && (
                <div>
                  <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Linked controls</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {sel.linkedControls.map(cid => (
                      <button key={cid} onClick={()=>{setSelectedId(null);setTab("annexa");}} style={{background:K_.bg,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"5px 10px",fontSize:11.5,fontFamily:fMono,letterSpacing:"0.02em",cursor:"pointer"}}>{cid}</button>
                    ))}
                  </div>
                </div>
              )}
              {sel.linkedRisks.length > 0 && (
                <div>
                  <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Linked risks</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {sel.linkedRisks.map(rid => (
                      <button key={rid} onClick={()=>{setSelectedId(null);setTab("risks");}} style={{background:K_.bg,color:K_.gold,border:`1px solid ${K_.gold}40`,borderRadius:8,padding:"5px 10px",fontSize:11.5,fontFamily:fMono,letterSpacing:"0.02em",cursor:"pointer"}}>{rid}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",paddingTop:18,borderTop:`1px solid ${K_.line}`}}>
            <button onClick={()=>showToast("Edit CAPA — write path next session","info")} style={{background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:6}}>
              <span>✦</span> Edit
            </button>
            {sel.effStatus !== "Closed" && sel.effStatus !== "Pending Verification" && (
              <button onClick={()=>showToast("Mark pending verification — write path next session","info")} style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                Mark pending verification
              </button>
            )}
            {sel.effStatus === "Pending Verification" && (
              <button onClick={()=>showToast("Verify + close — write path next session","info")} style={{background:"transparent",color:K_.sage,border:`1px solid ${K_.sage}50`,borderRadius:100,padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                ✓ Verify + close
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: ISO CHECKLISTS
───────────────────────────────────────────── */
function PageChecklists({role,showToast}) {
  const rc=RC(role);
  const available=CHECKLISTS_MAP[role]||[{key:"iso42001",label:"ISO 42001",data:ISO42001_CHECKLIST}];
  const [selKey,setSelKey]=useState(available[0].key);
  const [checked,setChecked]=useState({});
  useEffect(()=>{setSelKey(available[0].key);setChecked({});},[role]);
  const currentData=available.find(a=>a.key===selKey)?.data||available[0].data;
  const allItems=currentData.flatMap(s=>s.items);
  const doneCount=allItems.filter(i=>checked[i.id]!==undefined?checked[i.id]:i.done).length;
  const pct=allItems.length>0?Math.round((doneCount/allItems.length)*100):0;
  const toggle=id=>{setChecked(p=>({...p,[id]:!(p[id]!==undefined?p[id]:allItems.find(i=>i.id===id)?.done)}));};
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Compliance Checklists" sub="ISO and regulatory control checklists mapped to your governance obligations."/>
    <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
      {/* Show all checklists for CAIO, role-specific for others */}
      {(role==="caio"?[{key:"iso42001",label:"ISO 42001 AIMS"}]:[...available]).map(fw=><button key={fw.key} onClick={()=>{setSelKey(fw.key);setChecked({});}} style={{background:selKey===fw.key?rc:T.s2,color:selKey===fw.key?"#fff":T.ink3,border:`1px solid ${selKey===fw.key?rc:T.border}`,borderRadius:6,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.m,transition:"all .15s"}}>{fw.label}</button>)}
      {role!=="caio"&&<button onClick={()=>{setSelKey("iso42001");setChecked({});}} style={{background:selKey==="iso42001"?rc:T.s2,color:selKey==="iso42001"?"#fff":T.ink3,border:`1px solid ${selKey==="iso42001"?rc:T.border}`,borderRadius:6,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.m}}>ISO 42001 AIMS</button>}
    </div>
    <Card style={{padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{available.find(a=>a.key===selKey)?.label||"ISO 42001"} Progress</span>
        <span style={{fontSize:10,fontFamily:F.m,color:T.ink3}}>{doneCount}/{allItems.length} controls · {pct}%</span>
      </div>
      <Bar value={pct} color={rc}/>
    </Card>
    {(selKey==="iso42001"?ISO42001_CHECKLIST:currentData).map((section,si)=>{
      const sectionDone=section.items.filter(i=>checked[i.id]!==undefined?checked[i.id]:i.done).length;
      return <Card key={section.clause} style={{overflow:"hidden",marginBottom:10,animation:`up ${.3+si*.05}s ease both`}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:9,alignItems:"center"}}>
            <Tag label={section.clause} color={rc} bg={RCL(role)+"80"}/>
            <h3 style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b}}>{section.title}</h3>
          </div>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{sectionDone}/{section.items.length}</span>
        </div>
        <div style={{padding:"4px 14px"}}>
          {section.items.map((item,ii)=>{
            const isDone=checked[item.id]!==undefined?checked[item.id]:item.done;
            return <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 0",borderBottom:ii<section.items.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",opacity:isDone?.65:1}}>
              <div style={{width:17,height:17,borderRadius:4,flexShrink:0,border:`2px solid ${isDone?T.green:T.borderB}`,background:isDone?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",marginTop:1}}>
                {isDone&&<span style={{color:"#fff",fontSize:9,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:11,color:isDone?T.ink4:T.ink2,fontFamily:F.b,lineHeight:1.55,textDecoration:isDone?"line-through":"none"}}>{item.text}</span>
            </div>;
          })}
        </div>
      </Card>;
    })}
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: HITL QUEUE
───────────────────────────────────────────── */
function PageHITL({role,showToast,onCountChange}) {
  const rc=RC(role), rcL=RCL(role), items=HITL[role]||[];
  const [decisions,setDecisions]=useState({});
  const [notes,setNotes]=useState({});
  useEffect(()=>{setDecisions({});setNotes({});},[role]);
  useEffect(()=>{
    const pending=items.filter(i=>!decisions[i.id]).length;
    if(onCountChange)onCountChange(pending);
  },[decisions,role]);
  const decide=(id,action)=>{setDecisions(d=>({...d,[id]:action}));showToast(action==="approved"?"Action approved & audit-logged":"Rejected & returned for review",action==="approved"?"success":"error");};
  const rColor=r=>r==="Critical"?T.red:r==="High"?T.amber:T.blue;
  return <div style={{maxWidth:720,animation:"up .3s ease"}}>
    <SHead title="Human-in-the-Loop Queue" sub="AI-flagged decisions requiring your explicit approval before any action is taken."/>
    <div style={{background:T.blueL,border:`1px solid ${T.blue}28`,borderRadius:10,padding:"13px 16px",marginBottom:20,display:"flex",gap:12}}>
      <span style={{fontSize:18,flexShrink:0}}>🔐</span>
      <div>
        <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4}}>What is Human-in-the-Loop?</div>
        <p style={{fontSize:11,color:T.ink3,lineHeight:1.7,fontFamily:F.b,margin:0}}>VerisZone AI analyses your compliance posture and recommends actions. For high-stakes decisions, <strong style={{color:T.ink}}>the system cannot act until you explicitly approve.</strong> You see the full reasoning, ISO 42001 clause reference, confidence score, and proposed action — then you decide. Every decision is time-stamped and audit-logged.</p>
      </div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      {items.length===0&&<Card style={{padding:32,textAlign:"center"}}><p style={{color:T.ink3,fontFamily:F.b,fontSize:13}}>No items pending approval for your role.</p></Card>}
      {items.map((item,i)=>{
        const decided=decisions[item.id];
        const rc2=rColor(item.risk);
        return <Card key={item.id} style={{overflow:"hidden",border:`1px solid ${decided==="approved"?T.green+"50":decided==="rejected"?T.red+"50":T.border}`,opacity:decided?.75:1,transition:"all .3s",animation:`up ${.3+i*.1}s ease both`,boxShadow:!decided?`0 0 20px ${rc2}10`:"none"}}>
          <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:rc2,boxShadow:`0 0 0 3px ${rc2}25`,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:5}}>{item.title}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                <Tag label={`Risk: ${item.risk}`} color={rc2} bg={rc2+"15"}/>
                <Tag label={item.time} color={item.time.toLowerCase().includes("overdue")?T.red:T.ink3} bg={item.time.toLowerCase().includes("overdue")?T.redL:T.ink5}/>
                <Tag label={item.clause} color={T.ink3} bg={T.ink5}/>
              </div>
            </div>
            {decided&&<Tag label={decided==="approved"?"✓ Approved":"✗ Rejected"} color={decided==="approved"?T.green:T.red} bg={decided==="approved"?T.greenL:T.redL}/>}
          </div>
          <div style={{padding:"12px 15px",background:T.bg}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:7}}>AI Reasoning</div>
            <p style={{fontSize:12,color:T.ink2,lineHeight:1.75,fontFamily:F.b,marginBottom:11}}>{item.reasoning}</p>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,whiteSpace:"nowrap"}}>AI confidence</span>
              <div style={{flex:1,maxWidth:160}}><Bar value={item.conf} color={item.conf>=90?T.green:item.conf>=75?T.amber:T.red}/></div>
              <span style={{fontSize:11,fontWeight:700,fontFamily:F.m,color:item.conf>=90?T.green:item.conf>=75?T.amber:T.red,whiteSpace:"nowrap"}}>{item.conf}%</span>
            </div>
          </div>
          <div style={{padding:"12px 15px",background:`linear-gradient(135deg,${rcL}80,${T.s1})`}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:5}}>Proposed Action</div>
            <p style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:12,lineHeight:1.5}}>{item.action}</p>
            {!decided?<>
              <textarea value={notes[item.id]||""} onChange={e=>setNotes(n=>({...n,[item.id]:e.target.value}))} placeholder="Add a note for the audit log (optional)…" rows={2} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.ink3,fontFamily:F.b,resize:"none",marginBottom:10}}/>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>decide(item.id,"approved")} style={{flex:1,background:T.green,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:12,fontWeight:600,fontFamily:F.b}}>✓ Approve Action</button>
                <button onClick={()=>decide(item.id,"rejected")} style={{flex:1,background:T.s1,color:T.red,border:`1.5px solid ${T.red}45`,borderRadius:7,padding:"9px",fontSize:12,fontWeight:600,fontFamily:F.b}}>✗ Reject & Return</button>
              </div>
            </>:<div style={{fontSize:11,color:T.ink4,fontFamily:F.b}}>Decision recorded · {new Date().toLocaleTimeString()} · Audit log updated{notes[item.id]&&<div style={{marginTop:3}}>Note: "{notes[item.id]}"</div>}</div>}
          </div>
        </Card>;
      })}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: AIA (AI Impact Assessment)
───────────────────────────────────────────── */
function PageAIA({role}) {
  const rc=RC(role);
  const [selId,setSelId]=useState(AIA_DATA[0].id);
  const sel=AIA_DATA.find(a=>a.id===selId)||AIA_DATA[0];
  const levelColor=l=>l==="High"?T.red:l==="Medium"?T.amber:T.green;
  const levelBg=l=>l==="High"?T.redL:l==="Medium"?T.amberL:T.greenL;
  const overallColor=r=>r==="Unacceptable"?T.red:r==="High"?T.amber:r==="Medium"?T.blue:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Impact Assessment (AIA)" sub="Structured 6-part assessment per ISO 42001 C.8.2 and EU AI Act Art.9. Based on your uploaded AIA template."/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      {AIA_DATA.map(a=><button key={a.id} onClick={()=>setSelId(a.id)} style={{background:selId===a.id?rc:T.s2,color:selId===a.id?"#fff":T.ink3,border:`1px solid ${selId===a.id?rc:T.border}`,borderRadius:6,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b,transition:"all .15s"}}>{a.system}</button>)}
    </div>
    {/* Header */}
    <Card style={{overflow:"hidden",marginBottom:12,boxShadow:`0 0 24px ${overallColor(sel.overallRisk)}10`}}>
      <div style={{background:`linear-gradient(135deg,${overallColor(sel.overallRisk)}20,${T.s2})`,borderBottom:`1px solid ${overallColor(sel.overallRisk)}30`,padding:"15px 18px"}}>
        <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
          <Tag label={sel.overallRisk==="Unacceptable"?"⛔ "+sel.overallRisk:sel.overallRisk+" Risk"} color={overallColor(sel.overallRisk)} bg={overallColor(sel.overallRisk)+"20"}/>
          <Tag label={sel.decision} color={sel.decision==="Rejected"?T.red:sel.decision==="Approved"?T.green:T.amber} bg={sel.decision==="Rejected"?T.redL:sel.decision==="Approved"?T.greenL:T.amberL}/>
          <Tag label={sel.clause} color={T.ink3} bg={T.ink5}/>
        </div>
        <h2 style={{fontFamily:F.h,fontSize:18,fontWeight:700,color:T.ink,marginBottom:4}}>{sel.system}</h2>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.m}}>{sel.vendor} · {sel.dept} · {sel.date}</p>
      </div>
      <div style={{padding:"12px 18px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0}}>
        {[["Owner",sel.owner,T.ink2],["Status",sel.status,rc],["Decision Type",sel.decisionType,T.ink2]].map(([l,v,c])=><div key={l} style={{padding:"6px 12px",borderRight:l!=="Decision Type"?`1px solid ${T.border}`:"none"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>{l}</div>
          <div style={{fontSize:11,fontWeight:600,color:c,fontFamily:F.b}}>{v}</div>
        </div>)}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
      {/* Part 1: System Profile */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 1 — System Profile</div>
        {[["Status",sel.status],["Decision Type",sel.decisionType],["Lifespan",sel.lifespan]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
          <span style={{fontSize:11,color:T.ink,fontFamily:F.b}}>{v}</span>
        </div>)}
      </Card>
      {/* Part 2: Data Audit */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 2 — Data Audit</div>
        {[["PII Processed",sel.data.pii],["Sensitive Categories",sel.data.sensitive],["Data Provenance Verified",sel.data.provenance],["Bias Check Done",sel.data.biasCheck],["Data Minimisation",sel.data.minimization]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
          <Tag label={v?"Yes":"No"} color={v?T.amber:T.green} bg={v?T.amberL:T.greenL}/>
        </div>)}
      </Card>
      {/* Part 3: Rights Impact */}
      <Card style={{padding:16,gridColumn:"1/-1"}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:12}}>Part 3 — Fundamental Rights Impact (FRIA)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
          {sel.rightsImpact.map((r,i)=><div key={i} style={{background:T.s3,border:`1px solid ${levelColor(r.level)}25`,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${levelColor(r.level)}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{r.right}</span>
              <Tag label={r.level} color={levelColor(r.level)} bg={levelBg(r.level)}/>
            </div>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{r.desc}</p>
          </div>)}
        </div>
      </Card>
      {/* Part 4: Technical */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 4 — Technical Reliability</div>
        {sel.technical.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<sel.technical.length-1?`1px solid ${T.border}`:"none"}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t.dim}</div>
            <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{t.metric}</span>
          </div>
          <Tag label={t.pass?"✓ Pass":"✗ Fail"} color={t.pass?T.green:T.red} bg={t.pass?T.greenL:T.redL}/>
        </div>)}
      </Card>
      {/* Part 5: Controls */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 5 — Governance Controls</div>
        {sel.controls.map((c,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<sel.controls.length-1?`1px solid ${T.border}`:"none"}}>
          <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.measure}</div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:0}}>{c.detail}</p>
        </div>)}
      </Card>
      {/* Part 6: Decision */}
      <Card style={{padding:16,border:`1px solid ${overallColor(sel.overallRisk)}30`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:12}}>Part 6 — Final Determination</div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <Tag label={`Overall Risk: ${sel.overallRisk}`} color={overallColor(sel.overallRisk)} bg={overallColor(sel.overallRisk)+"15"}/>
          <Tag label={sel.decision} color={sel.decision==="Rejected"?T.red:sel.decision==="Approved"?T.green:T.amber} bg={sel.decision==="Rejected"?T.redL:sel.decision==="Approved"?T.greenL:T.amberL}/>
        </div>
        {sel.decision==="Rejected"&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:7,padding:"10px 12px",marginBottom:12}}>
          <p style={{fontSize:11,color:T.red,fontFamily:F.b,margin:0,lineHeight:1.6}}>⛔ This system was rejected. Risk to fundamental rights is too high to proceed. Refer to Part 3 FRIA for details.</p>
        </div>}
        {sel.decision==="Approved with Conditions"&&<div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:7,padding:"10px 12px",marginBottom:12}}>
          <p style={{fontSize:11,color:T.amber,fontFamily:F.b,margin:0,lineHeight:1.6}}>⚠ Conditional approval. All Part 5 mitigations must be active before deployment proceeds.</p>
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["AI System Owner",sel.owner],["Legal / DPO","Pending"],["Chief AI Officer","Aisha Patel"]].map(([role2,name])=><div key={role2} style={{background:T.s3,borderRadius:7,padding:"9px 10px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{role2}</div>
            <div style={{fontSize:11,color:T.ink,fontFamily:F.b,marginBottom:4}}>{name}</div>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Signature pending</div>
          </div>)}
        </div>
      </Card>
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: AIRA
───────────────────────────────────────────── */
function PageAIRA() {
  const [sel,setSel]=useState(AIRA[0]);
  const rColor=s=>s==="Critical"?T.red:s==="High"?T.amber:s==="Medium"?T.blue:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Risk Assessment Register (AIRA)" sub="ISO 42001 Clause 8.2 — structured identification and analysis of AI system risks."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr minmax(0,340px)",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 60px 60px 90px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["AI System","Category","L","I","Score"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {AIRA.map((r,i)=>{
            const rc2=rColor(r.level);
            return <div key={r.id} onClick={()=>setSel(r)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 60px 60px 90px",padding:"11px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<AIRA.length-1?`1px solid ${T.border}`:"none",background:sel?.id===r.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel?.id===r.id?`3px solid ${rc2}`:"3px solid transparent",transition:"all .15s"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{r.system}</div>
                <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.owner}</span>
              </div>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{r.category}</span>
              <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:7,height:7,borderRadius:2,background:n<=r.likelihood?T.amber:T.border}}/>)}</div>
              <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:7,height:7,borderRadius:2,background:n<=r.impact?rc2:T.border}}/>)}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:800,fontFamily:F.m,color:rc2}}>{r.score}</span>
                <Tag label={r.level} color={rc2} bg={rc2+"18"}/>
              </div>
            </div>;
          })}
        </div>
      </div>
      {sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",boxShadow:`0 0 28px ${rColor(sel.level)}10`,animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${rColor(sel.level)}18,${T.s3})`,borderBottom:`1px solid ${rColor(sel.level)}30`,padding:"14px 16px"}}>
          <Tag label={sel.level} color={rColor(sel.level)} bg={rColor(sel.level)+"20"}/>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginTop:9,lineHeight:1.3}}>{sel.system}</h3>
        </div>
        <div style={{padding:16}}>
          <p style={{fontSize:11,color:T.ink3,lineHeight:1.7,fontFamily:F.b,marginBottom:14}}>{sel.desc}</p>
          {[["ISO/Regulatory Reference",sel.clause],["Risk Category",sel.category],["Owner",sel.owner],["Likelihood",`${sel.likelihood}/5`],["Impact",`${sel.impact}/5`],["Risk Score",`${sel.score}/25`]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span>
            <span style={{fontSize:10,color:T.ink,fontFamily:F.m,fontWeight:600,textAlign:"right",maxWidth:160}}>{v}</span>
          </div>)}
          {/* Heatmap */}
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Risk Heatmap</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3}}>
              {[5,4,3,2,1].map(impact=>[1,2,3,4,5].map(likelihood=>{
                const s=likelihood*impact;
                const isThis=likelihood===sel.likelihood&&impact===sel.impact;
                const bg=s>=16?T.red:s>=10?T.amber:s>=5?T.blue:T.green;
                return <div key={`${impact}-${likelihood}`} style={{height:18,borderRadius:3,background:isThis?bg:bg+"25",border:isThis?`2px solid ${bg}`:"none",transition:"all .15s"}}/>;
              }))}
            </div>
          </div>
        </div>
      </Card>}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: AIRT
───────────────────────────────────────────── */
function PageAIRT() {
  const [sel,setSel]=useState(AIRT[0]);
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Risk Treatment Register (AIRT)" sub="ISO 42001 Clause 8.3 — treatment plans for identified AI risks. Linked to AIRA."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr minmax(0,340px)",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 90px 100px 90px 90px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["AI System","Treatment","Owner","Deadline","Status"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {AIRT.map((t,i)=><div key={t.id} onClick={()=>setSel(t)} style={{display:"grid",gridTemplateColumns:"2fr 90px 100px 90px 90px",padding:"10px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<AIRT.length-1?`1px solid ${T.border}`:"none",background:sel?.id===t.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel?.id===t.id?`3px solid ${T.violet}`:"3px solid transparent",transition:"all .15s"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t.system}</div>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Risk: {t.risk}</span>
            </div>
            <STag s={t.treatment}/>
            <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{t.owner}</span>
            <span style={{fontSize:9,fontFamily:F.m,color:T.ink3}}>{t.deadline}</span>
            <STag s={t.status}/>
          </div>)}
        </div>
      </div>
      {sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",boxShadow:`0 0 24px ${T.violet}10`,animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${T.violetL},${T.s3})`,borderBottom:`1px solid ${T.violet}30`,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:7,marginBottom:9}}><STag s={sel.treatment}/><PTag p={sel.priority}/></div>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,lineHeight:1.3}}>{sel.system}</h3>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>Risk: {sel.risk}</p>
        </div>
        <div style={{padding:16}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Treatment Action</div>
          <p style={{fontSize:11,color:T.ink2,lineHeight:1.7,fontFamily:F.b,marginBottom:14,padding:"10px 12px",background:T.s3,borderRadius:7,borderLeft:`3px solid ${T.violet}`}}>{sel.action}</p>
          {[["Owner",sel.owner],["Deadline",sel.deadline],["Status",sel.status],["Priority",sel.priority]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span>
            <span style={{fontSize:10,color:T.ink,fontFamily:F.m}}>{v}</span>
          </div>)}
          <button style={{width:"100%",marginTop:13,background:T.violet,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Update Treatment Plan →</button>
        </div>
      </Card>}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: ROADMAP
───────────────────────────────────────────── */
function PageRoadmap({role}) {
  const rc=RC(role), rcL=RCL(role), qs=ROADMAP[role];
  const nexts={
    caio:[{a:"Complete LLM v2 Art.13 transparency docs before go-live",w:"EU AI Act Art.13 requires complete docs for High-Risk systems. 6 days remaining.",i:"Critical"},{a:"Classify 3 unregistered models under EU AI Act",w:"Unclassified models = unknown exposure. August 2026 enforcement is 12 weeks away.",i:"High"},{a:"Begin ISO 42001 conformity assessment now",w:"Assessment takes 3–4 months. Q2 start is the minimum to meet Q3 deadline.",i:"High"}],
    ciso:[{a:"Close GDPR DPIA for analytics platform immediately",w:"Active Art.35 violation. Personal CISO liability under GDPR Art.83 growing daily.",i:"Critical"},{a:"Prioritise ISO 27001 A.8.2 asset classification gap",w:"65% score — 10-point uplift achievable in 30 days. Q3 cert audit approaching.",i:"High"},{a:"Prepare board-level security briefing",w:"Board oversight of security posture expected by regulators and enterprise insurers.",i:"Medium"}],
    cio:[{a:"Execute S3 data residency migration within 48 hours",w:"Active GDPR Art.46 violation. Every day increases regulatory and reputational exposure.",i:"Critical"},{a:"Sign off Zero Trust Phase 2 this week",w:"Window closes May 15. Missing it risks Q3 audit readiness.",i:"Critical"},{a:"Accelerate FY25 roadmap reprioritisation",w:"5 initiatives at risk. CFO alignment needed before end of Q2.",i:"High"}],
    cdpo:[{a:"Submit analytics platform DPIA to supervisory authority today",w:"Active Art.35 violation. DPA notification may already be required.",i:"Critical"},{a:"Resolve DSR queue before 30-day deadlines",w:"4 requests approaching deadline. Fines for DSR non-compliance rising.",i:"High"},{a:"Complete TIAs for 5 remaining US vendors",w:"Post-Schrems II exposure. Processing pause required by May 30.",i:"High"}],
    cgo:[{a:"Approve Q2 Board Governance Report before the deadline",w:"Board pack is due in 2 days. As CGO your sign-off is the final gate — it cannot proceed without it.",i:"Critical"},{a:"Approve the EU AI Act cross-functional remediation plan",w:"CAIO, CISO, and CDPO have submitted their gap plans. Unified plan needs CGO approval to assign accountability and begin execution.",i:"High"},{a:"Accelerate vendor risk programme — only 61% assessed",w:"Third-party governance is a top COBIT 5 maturity gap. 39% of vendors have no formal risk assessment on file.",i:"High"}],
  }[role];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Strategic Roadmap" sub="FY2026 governance and compliance milestones."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:22}}>
      {qs.map((q,i)=>{
        const isDone=q.st==="done",isAct=q.st==="active";
        const bg=isDone?T.green:isAct?rc:T.ink4;
        return <div key={q.q} style={{animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{background:bg,borderRadius:"8px 8px 0 0",padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:F.m}}>{q.q}</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,.75)",fontFamily:F.b}}>{isDone?"✓ Done":isAct?"● Active":"Planned"}</span>
          </div>
          <Card style={{borderRadius:"0 0 8px 8px",padding:12}}>
            {q.items.map((item,j)=>{
              const isStar=item.endsWith("★"),label=item.replace(" ★","");
              return <div key={j} style={{display:"flex",gap:7,marginBottom:j<q.items.length-1?8:0,alignItems:"flex-start"}}>
                <div style={{width:4,height:4,borderRadius:"50%",marginTop:5,flexShrink:0,background:isDone?T.green:isAct&&isStar?T.amber:isAct?rc:T.ink4}}/>
                <span style={{fontSize:10,color:isDone?T.ink4:T.ink3,fontFamily:F.b,lineHeight:1.5,textDecoration:isDone?"line-through":"none"}}>{label}{isStar&&!isDone&&<span style={{color:T.amber,fontWeight:700}}> ★</span>}</span>
              </div>;
            })}
          </Card>
        </div>;
      })}
    </div>
    <Card style={{padding:18}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>AI Recommended Next Steps</h3>
      <p style={{fontSize:11,color:T.ink4,fontFamily:F.b,marginBottom:16}}>Highest-leverage actions based on current compliance posture.</p>
      {nexts.map((ns,i)=><div key={i} style={{display:"flex",gap:13,padding:"12px 0",borderBottom:i<nexts.length-1?`1px solid ${T.border}`:"none",animation:`up ${.35+i*.08}s ease both`}}>
        <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:rcL,border:`1.5px solid ${rc}40`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:11,fontWeight:800,color:rc,fontFamily:F.m}}>{i+1}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{ns.a}</div>
          <div style={{fontSize:11,color:T.ink4,fontFamily:F.b,lineHeight:1.6,marginBottom:6}}>{ns.w}</div>
          <Tag label={`Impact: ${ns.i}`} color={ns.i==="Critical"?T.red:ns.i==="High"?T.amber:T.blue} bg={ns.i==="Critical"?T.redL:ns.i==="High"?T.amberL:T.blueL}/>
        </div>
      </div>)}
    </Card>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: TEMPLATES
───────────────────────────────────────────── */
function PageTemplates({role,showToast}) {
  const [view,setView]=useState("library");      /* "library" | "detail" */
  const [search,setSearch]=useState("");
  const [catFilter,setCatFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const [frameworkFilter,setFrameworkFilter]=useState("all");

  /* ─── Live data from Supabase, fallback to constant ─── */
  const [tmpls, dataSource] = useSupabaseTable("templates", dbToTemplate, TEMPLATES);
  const [selectedId,setSelectedId]=useState(TEMPLATES[0]?.id);

  /* ─── Quiet luxury palette — graphite + champagne + cream ─────
     Deep warm graphite heroes, cream surfaces, champagne accent.
     Boardroom/private-bank aesthetic — restraint over decoration. */
  const K_ = {
    bg:        "#FAFAF6",                       /* warm cream paper */
    surface:   "#FFFFFF",                       /* pure white card */
    s1:        "#F4F2EC",                       /* whisper elevation */
    s2:        "#EDE9E0",                       /* tinted surface */
    line:      "rgba(28,27,31,0.07)",           /* graphite hairline */
    lineH:     "rgba(28,27,31,0.14)",
    navy:      "#1C1B1F",                       /* deep warm graphite (not navy) */
    navy2:     "#2A2826",                       /* lighter graphite for gradient */
    navyT:     "#F5F2EA",                       /* warm cream text on graphite */
    navyT2:    "rgba(245,242,234,0.62)",
    navyT3:    "rgba(245,242,234,0.32)",
    ink:       "#1A1916",                       /* primary text */
    ink2:      "#5F5C56",                       /* secondary — warm slate */
    ink3:      "#9A9690",                       /* tertiary */
    ink4:      "#C5C2BA",
    gold:      "#C9A961",                       /* CHAMPAGNE GOLD accent */
    goldText:  "#1A1916",                       /* dark graphite on champagne */
    goldL:     "rgba(201,169,97,0.12)",
    sage:      "#5B7A5E",                       /* muted forest — positive */
    sageL:     "rgba(91,122,94,0.10)",
    crit:      "#9B3636",                       /* muted oxblood */
    critL:     "rgba(155,54,54,0.10)",
  
    amber:     "#B8956A",                       /* warm tan amber */
    amberL:    "rgba(184,149,106,0.10)",
    indigo:    "#4A4944",                       /* dark warm slate (replaces indigo) */
    indigoL:   "rgba(74,73,68,0.10)",
    slate:     "#5F5C56",                       /* warm slate */
    slateL:    "rgba(95,92,86,0.10)",
  };
  const fSerif="'Newsreader','PP Editorial Old','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* ─── Status & category colour helpers ─── */
  const statusColor = s => ({
    "Approved":K_.sage, "In Review":K_.amber, "Draft":K_.ink3,
    "Expired":K_.crit, "Needs Update":K_.amber, "Per system":K_.indigo, "Per activity":K_.indigo,
  })[s] || K_.ink3;
  const categoryColor = c => ({
    "Policy":K_.navy, "Procedure":K_.indigo, "Plan":K_.amber,
    "Register":K_.slate, "Checklist":K_.sage, "Agenda":K_.ink3,
    "Report":K_.indigo, "Assessment":K_.crit,
  })[c] || K_.ink3;

  /* ─── Distinct values for filters ─── */
  const allCategories = Array.from(new Set(tmpls.map(t=>t.category)));
  const allStatuses   = ["Approved","In Review","Draft","Needs Update","Expired"];
  const allFrameworks = Array.from(new Set(tmpls.map(t=>t.framework)));

  /* ─── Filtering ─── */
  const filtered = tmpls.filter(t=>{
    if(catFilter!=="all" && t.category!==catFilter) return false;
    if(statusFilter!=="all" && t.status!==statusFilter) return false;
    if(frameworkFilter!=="all" && t.framework!==frameworkFilter) return false;
    if(search){
      const q=search.toLowerCase();
      if(!(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.owner.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sel = tmpls.find(t=>t.id===selectedId) || tmpls[0];

  /* ─── Stats ─── */
  const stats = {
    total:    tmpls.length,
    approved: tmpls.filter(t=>t.status==="Approved").length,
    inReview: tmpls.filter(t=>t.status==="In Review").length,
    needsUpdate: tmpls.filter(t=>t.status==="Needs Update" || t.status==="Expired").length,
  };

  /* ════════ LIBRARY VIEW ════════ */
  const LibraryView = () => (
    <>
      {/* Hero */}
      <div style={{
        background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
        borderRadius:20,padding:"32px 36px",marginBottom:14,position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
        <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:24,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
              <span>▸</span><span>Policies & Evidence · Template Library</span>
              <DataSourcePill dataSource={dataSource} mono={fMono}/>
            </div>
            <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,3.8vw,46px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
              Every document, <span style={{fontStyle:"italic"}}>audit-ready.</span>
            </h1>
            <p style={{fontSize:14,lineHeight:1.5,color:K_.navyT2,margin:"12px 0 0",maxWidth:580}}>
              {stats.total} templates across ISO 27001, ISO 42001, GDPR, and your operational frameworks. Version-controlled, owner-assigned, framework-linked, audit-ready.
            </p>
          </div>
          <button onClick={()=>showToast("New template workflow — coming soon","info")} style={{
            background:K_.gold,color:K_.goldText,border:"none",borderRadius:100,
            padding:"11px 22px",fontSize:13,fontWeight:700,letterSpacing:"0.01em",
            cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,fontFamily:fSans,flexShrink:0,
          }}>
            <span>✦</span> New template
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
        {[
          {label:"Total in library", val:String(stats.total), c:K_.ink},
          {label:"Approved & current", val:String(stats.approved), c:K_.sage},
          {label:"In review", val:String(stats.inReview), c:K_.amber},
          {label:"Needs attention", val:String(stats.needsUpdate), c:K_.crit},
        ].map((s)=>(
          <div key={s.label} style={{background:K_.surface,borderRadius:18,padding:"22px 24px",border:`1px solid ${K_.line}`}}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"18px 22px",marginBottom:14}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:14}}>
          {/* Search */}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, owner, content…" style={{
            flex:"1 1 280px",minWidth:240,padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
            fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,outline:"none",
          }}/>
          {/* Framework */}
          <select value={frameworkFilter} onChange={e=>setFrameworkFilter(e.target.value)} style={{
            padding:"10px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
            fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.bg,cursor:"pointer",
          }}>
            <option value="all">All frameworks</option>
            {allFrameworks.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Status pills */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Status</span>
          {[["all","All"],...allStatuses.map(s=>[s,s])].map(([k,l])=>(
            <button key={k} onClick={()=>setStatusFilter(k)} style={{
              background:statusFilter===k?(k==="all"?K_.navy:statusColor(k)):"transparent",
              color:statusFilter===k?"#fff":K_.ink2,
              border:`1px solid ${statusFilter===k?(k==="all"?K_.navy:statusColor(k)):K_.line}`,
              borderRadius:100,padding:"5px 13px",fontSize:11.5,fontWeight:statusFilter===k?600:500,
              fontFamily:fSans,cursor:"pointer",transition:"all .15s",
            }}>{l}</button>
          ))}
        </div>
        {/* Category pills */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginRight:4}}>Category</span>
          {[["all","All"],...allCategories.map(c=>[c,c])].map(([k,l])=>(
            <button key={k} onClick={()=>setCatFilter(k)} style={{
              background:catFilter===k?(k==="all"?K_.navy:categoryColor(k)):"transparent",
              color:catFilter===k?"#fff":K_.ink2,
              border:`1px solid ${catFilter===k?(k==="all"?K_.navy:categoryColor(k)):K_.line}`,
              borderRadius:100,padding:"5px 13px",fontSize:11.5,fontWeight:catFilter===k?600:500,
              fontFamily:fSans,cursor:"pointer",transition:"all .15s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14,marginBottom:14}}>
        {filtered.map((t,i)=>(
          <div key={t.id} onClick={()=>{setSelectedId(t.id);setView("detail");}} style={{
            background:K_.surface,borderRadius:18,padding:"22px 24px 20px",
            border:`1px solid ${K_.line}`,cursor:"pointer",transition:"all .15s",
            display:"flex",flexDirection:"column",gap:14,position:"relative",
            animation:`up .35s cubic-bezier(.16,1,.3,1) ${.03+i*0.015}s both`,
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=K_.navy+"40";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px -12px rgba(15,27,92,0.15)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=K_.line;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            {/* Top row: icon + category, status */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:categoryColor(t.category)+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{t.icon}</div>
                <span style={{fontSize:10,color:categoryColor(t.category),fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700}}>{t.category}</span>
              </div>
              <span style={{
                display:"inline-flex",alignItems:"center",gap:5,
                background:statusColor(t.status)+"15",color:statusColor(t.status),
                border:`1px solid ${statusColor(t.status)}30`,
                borderRadius:100,padding:"3px 9px",fontSize:10.5,fontWeight:600,fontFamily:fSans,
              }}>
                <span style={{width:5,height:5,borderRadius:"50%",background:statusColor(t.status)}}/>
                {t.status}
              </span>
            </div>
            {/* Name + description */}
            <div>
              <h3 style={{fontSize:15,fontWeight:600,color:K_.ink,margin:"0 0 6px",letterSpacing:"-0.01em",lineHeight:1.3}}>{t.name}</h3>
              <p style={{fontSize:12.5,color:K_.ink2,lineHeight:1.5,margin:0,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{t.description}</p>
            </div>
            {/* Footer: framework, owner, version */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${K_.line}`,gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>{t.framework}</span>
              <span style={{fontSize:11,color:K_.ink2,fontWeight:600}}>{t.version}</span>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:"1 / -1",padding:"40px",textAlign:"center",color:K_.ink3,fontSize:13,fontStyle:"italic"}}>No templates match the current filters.</div>
        )}
      </div>
    </>
  );

  /* ════════ DETAIL VIEW ════════ */
  const DetailView = () => {
    if(!sel) return null;
    const facts = [
      ["Category", sel.category],
      ["Status", sel.status],
      ["Version", sel.version],
      ["Owner", sel.owner],
      ["Framework", sel.framework],
      ["Last reviewed", sel.lastReviewed],
      ["Review frequency", sel.reviewFrequency],
      ["Next review", sel.nextReview],
    ];
    return (
      <>
        {/* Hero */}
        <div style={{
          background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
          borderRadius:20,padding:"28px 32px 32px",marginBottom:14,position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setView("library")} style={{
              background:"none",border:"none",color:K_.navyT2,
              fontSize:11,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",
              cursor:"pointer",padding:0,marginBottom:18,fontWeight:500,
            }}>← Back to library</button>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.category.toUpperCase()}</span>
              <span style={{background:"rgba(255,255,255,0.15)",color:K_.navyT,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600,fontFamily:fSans}}>{sel.framework}</span>
              <span style={{background:statusColor(sel.status)+"30",color:K_.navyT,border:`1px solid ${statusColor(sel.status)}80`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600,fontFamily:fSans}}>{sel.status}</span>
              <span style={{background:"rgba(255,255,255,0.10)",color:K_.navyT2,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:500,fontFamily:fMono}}>{sel.version}</span>
            </div>
            <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(28px,3.4vw,42px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <span style={{fontSize:"0.85em"}}>{sel.icon}</span>{sel.name}
            </h1>
            <p style={{fontSize:14.5,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:760}}>{sel.description}</p>
          </div>
        </div>

        {/* Action bar */}
        <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"16px 22px",marginBottom:14,display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {label:"Edit",     icon:"✎", primary:false, action:()=>showToast("Rich editor — backend required","info")},
            {label:"Approve",  icon:"✓", primary:false, action:()=>showToast("Approval workflow — backend required","info")},
            {label:"Mark for review", icon:"⟳", primary:false, action:()=>showToast("Marked for review (not persisted yet)","info")},
            ...(sel.exports||[]).map(fmt=>({label:`Export ${fmt}`, icon:"⤓", primary:false, action:()=>showToast(`${fmt} export — coming soon`,"info")})),
            ...(sel.aiCustomization?[{label:"Customise with AI", icon:"✦", primary:true, action:()=>showToast("AI customisation needs ANTHROPIC_API_KEY in Vercel","info")}]:[]),
          ].map(a=>(
            <button key={a.label} onClick={a.action} style={{
              background:a.primary?K_.gold:"transparent",
              color:a.primary?K_.goldText:K_.ink2,
              border:`1px solid ${a.primary?K_.gold:K_.line}`,
              borderRadius:100,padding:"8px 16px",fontSize:12.5,fontWeight:a.primary?700:600,
              fontFamily:fSans,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,
            }}>
              <span>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>

        {/* Facts + linked items grid */}
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14,marginBottom:14}}>
          {/* Facts card */}
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px"}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:18}}>Facts</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24,rowGap:22}}>
              {facts.map(([l,v])=>(
                <div key={l}>
                  <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
                  <div style={{fontSize:13.5,color:K_.ink,fontWeight:500,lineHeight:1.35}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Linked entities card */}
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px"}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:18}}>Linked entities</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[
                ["Risks", sel.linkedRisks||0, K_.crit, "linked risk"],
                ["Evidence", sel.linkedEvidence||0, K_.sage, "evidence artefact"],
                ["Controls", (sel.linkedControls||[]).length, K_.navy, "Annex A control"],
                ["Framework clauses", (sel.linkedClauses||[]).length, K_.indigo, "clause"],
              ].map(([label,count,col,unit])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",paddingBottom:14,borderBottom:`1px solid ${K_.line}`}}>
                  <div>
                    <div style={{fontSize:13,color:K_.ink,fontWeight:600}}>{label}</div>
                    <div style={{fontSize:11,color:K_.ink3,marginTop:2}}>{count} {unit}{count!==1?"s":""}</div>
                  </div>
                  <span style={{fontFamily:fSerif,fontStyle:"italic",fontSize:26,fontWeight:400,color:col,letterSpacing:"-0.03em"}}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Framework references */}
        {(sel.frameworkRefs||[]).length>0 && (
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"24px 30px",marginBottom:14}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Framework references</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {sel.frameworkRefs.map((r,i)=>(
                <span key={i} style={{background:K_.bg,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:fMono,letterSpacing:"0.02em"}}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Linked controls */}
        {(sel.linkedControls||[]).length>0 && (
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"24px 30px",marginBottom:14}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Linked controls</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {sel.linkedControls.map((c,i)=>(
                <span key={i} style={{background:K_.navy+"10",color:K_.navy,border:`1px solid ${K_.navy}25`,borderRadius:8,padding:"6px 12px",fontSize:12,fontFamily:fMono,letterSpacing:"0.02em",fontWeight:600}}>§ {c}</span>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return <div style={{
    animation:"up .35s cubic-bezier(.16,1,.3,1)",
    background:"transparent",fontFamily:fSans,color:K_.ink,
    margin:"-12px -12px",padding:"16px",
    minHeight:"calc(100vh - 56px)",
  }}>
    {view==="library" && <LibraryView/>}
    {view==="detail"  && <DetailView/>}
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: REPORTS
───────────────────────────────────────────── */
function PageReports({role}) {
  const rc=RC(role), rcL=RCL(role), K=KPI[role];
  const standards=STANDARDS_MAP[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink4;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Reports & Analytics" sub="Executive-ready compliance reporting and operational metrics."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
      {[{label:"Overall Compliance",value:`${K.compliance}%`,sub:`+${K.cTrend}% vs last month`,color:rc},
        {label:K.domainLabel,value:`${K.score}/100`,sub:K.scoreLabel,color:rc},
        {label:"Open Risks",value:K.risks,sub:"In register",color:T.amber},
        {label:"HITL Pending",value:K.hitl,sub:"Awaiting approval",color:T.violet}
      ].map((k,i)=><Card key={k.label} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:9}}>{k.label}</div>
        <div style={{fontSize:28,fontWeight:700,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:4}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </Card>)}
    </div>
    <Card style={{overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Standards & Framework Scorecard</h3>
      </div>
      {standards.map((s,i)=>{
        const col=s.score>=85?T.green:s.score>=70?T.blue:s.score>=50?T.amber:s.score>0?T.red:T.ink4;
        const status=s.score>=85?"Strong":s.score>=70?"Good":s.score>=50?"Developing":s.score>0?"At Risk":"N/A";
        return <div key={s.std} style={{padding:"11px 16px",borderBottom:i<standards.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"100px 1fr 1fr 80px",gap:12,alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,fontFamily:F.m,color:T.ink}}>{s.std}</span>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.applies}</span>
          <div><Bar value={s.score} color={rc} delay={i*80}/></div>
          <Tag label={status} color={col} bg={col+"15"}/>
        </div>;
      })}
    </Card>
    <Card style={{overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{ROLES[role].label} Top KPIs</h3>
      </div>
      {roleKpis.slice(0,5).map((k,i)=>{
        const sc=stColor(k.status);
        return <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 70px",padding:"10px 16px",alignItems:"center",borderBottom:i<4?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{k.kpi}</div>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{k.cat}</span>
          </div>
          <span style={{fontSize:9,color:T.green,fontFamily:F.m}}>{k.target}</span>
          <span style={{fontSize:10,fontWeight:700,color:rc,fontFamily:F.m}}>{k.value}</span>
          <Tag label={k.status} color={sc} bg={sc+"18"}/>
        </div>;
      })}
    </Card>
    <Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Scheduled Reports</h3>
      </div>
      {[{name:"Weekly Compliance Digest",freq:"Every Monday",next:"May 11",fmt:"PDF + Email"},
        {name:"Monthly Board Risk Summary",freq:"1st of month",next:"Jun 1",fmt:"PDF"},
        {name:"Quarterly Regulatory Update",freq:"Quarterly",next:"Jul 1",fmt:"PDF + Deck"}
      ].map((r,i)=><div key={r.name} style={{padding:"11px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{r.name}</div>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{r.freq} · Next: {r.next}</span>
        </div>
        <Tag label={r.fmt} color={rc} bg={rcL+"80"}/>
        <button style={{fontSize:10,color:rc,fontWeight:600,background:rcL+"60",border:`1px solid ${rc}35`,borderRadius:6,padding:"5px 11px",fontFamily:F.b}}>Run Now</button>
      </div>)}
    </Card>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: AIIA — AI SYSTEM IMPACT ASSESSMENT
   Based on Day 3: ISO 42001 Annex A Control A.5
   6 Phases: Characterise → Stakeholders → Identify
             → Evaluate → Mitigate → Conclude
───────────────────────────────────────────── */
const AIIA_RISK_CATEGORIES = [
  {cat:"Security Risks",icon:"🔐",color:"#E84040",items:["Adversarial attacks & prompt injection","Data poisoning of training sets","Model theft or extraction","Unauthorized access to AI systems","Supply chain vulnerabilities via third-party models","System manipulation and evasion"]},
  {cat:"Safety Risks",icon:"⚠️",color:"#E8A020",items:["Unintended consequences from autonomous decisions","System malfunction or failure in safety-critical domains","Lack of robustness under adversarial inputs","Human overreliance on AI recommendations","Poor testing and validation before deployment"]},
  {cat:"Privacy Risks",icon:"🔒",color:"#9061F9",items:["Data leakage and unauthorized access to PII","Inappropriate profiling or re-identification","Lack of transparency and informed consent","Weak data governance and GDPR/CCPA non-compliance","Re-identification from anonymised training data"]},
  {cat:"Ethical & Societal Risks",icon:"⚖️",color:"#4B7BF5",items:["Algorithmic bias and discrimination against protected groups","Erosion of human agency in high-stakes decisions","Social inequality amplification","Environmental impact of energy-intensive AI","Labour market disruption from automation"]},
  {cat:"Reliability & Robustness",icon:"📊",color:"#0DB4A0",items:["Model drift — accuracy degrading over time","Hallucinations in generative AI","Failure under out-of-distribution inputs","Inconsistent outputs across demographic groups","Insufficient continuous monitoring"]},
  {cat:"Compliance & Legal Risks",icon:"📋",color:"#E8A020",items:["EU AI Act non-compliance for high-risk systems","GDPR Art.22 automated decision violations","Anti-discrimination law violations","Intellectual property and copyright issues","Failure to maintain audit trails and documentation"]},
  {cat:"Operational Risks",icon:"⚙️",color:"#6E7594",items:["Inadequate human oversight processes","Dependency on single-point-of-failure AI vendors","Lack of incident response for AI failures","Insufficient staff competence (ISO 42001 C.7.2)","No kill-switch or emergency stop mechanism"]},
];

const AIIA_PHASES = [
  {
    id:1, name:"System Characterisation", subtitle:"The 'What'",
    clause:"ISO 42001 C.6.1.4 / Annex A.5.1",
    icon:"🔍", color:"#4B7BF5",
    desc:"Define the system boundaries before any assessment can occur. You cannot assess a black box.",
    steps:[
      {title:"Define Use Case & Scope",detail:"Document intended purpose (e.g. 'Screen resumes for IT jobs'), intended users, deployment environment (cloud/on-premise), and data profile including PII and sensitive categories."},
      {title:"Identify Lifecycle Stage",detail:"Determine whether this assessment covers Design, Development, Testing, or Production deployment. Impacts and controls differ significantly at each stage."},
      {title:"Document Technical Architecture",detail:"Record the model type, training data sources, third-party components (SBOM), inference infrastructure, and any pre-trained models or APIs used."},
      {title:"Define Scope Boundaries",detail:"Specify what is included and excluded. Document interfaces with other systems, data flows, and dependencies on external AI components or vendors."},
    ],
    outputs:["Use case definition document","Lifecycle stage confirmation","Technical architecture record","AIMS scope statement (ISO 42001 C.4.3)"],
    isoRef:"ISO 42001 Clause 4.3, 8.4 / Annex A.5.1",
  },
  {
    id:2, name:"Stakeholder Analysis", subtitle:"The 'Who'",
    clause:"ISO 42001 Annex A.5.2 / C.4.2",
    icon:"👥", color:"#9061F9",
    desc:"Identify who will be affected. The impacted population is almost always broader than initially assumed.",
    steps:[
      {title:"Map Direct Subjects",detail:"Identify people the AI makes decisions about or directly interacts with (e.g. the job applicant the resume screener evaluates)."},
      {title:"Map Indirect Subjects",detail:"Identify people affected by the ripple effects of AI decisions (e.g. the applicant's family who depends on the income from the job they didn't get)."},
      {title:"Identify Vulnerable Groups",detail:"Explicitly assess whether the AI system disproportionately impacts children, elderly, non-native speakers, disabled persons, or marginalised communities."},
      {title:"Engage Diverse Perspectives",detail:"ISO 42001 requires cross-disciplinary stakeholder involvement: AI developers, legal, ethics, impacted user representatives, and external community voices."},
    ],
    outputs:["Affected populations register","Vulnerable groups assessment","Stakeholder engagement log","Interested parties register (ISO 42001 C.4.2)"],
    isoRef:"ISO 42001 Clause 4.2 / Annex A.5.2, A.5.4",
  },
  {
    id:3, name:"Impact Identification", subtitle:"The 'How it Hurts'",
    clause:"ISO 42001 Annex A.5.3 / C.6.1.4",
    icon:"⚡", color:"#E84040",
    desc:"The core of the assessment. Categorise potential negative outcomes across all impact domains.",
    steps:[
      {title:"Fundamental Rights Assessment",detail:"Could the system violate privacy (GDPR Art.7), freedom of expression, right to non-discrimination (EU AI Act Art.10), or access to justice? Document with specific legal basis."},
      {title:"Health & Safety Assessment",detail:"Could physical or psychological harm occur? (e.g. chatbot giving unsafe medical advice, autonomous system causing physical harm). Reference EU AI Act Annex III for high-risk domains."},
      {title:"Transparency Assessment",detail:"Will users know they are interacting with AI? Is the AI's decision explainable? Document Art.13 transparency obligations and explainability gaps."},
      {title:"Environmental & Societal Assessment",detail:"Assess energy consumption, carbon footprint, economic disruption, labour market impacts, and social inequality effects per ISO 42001 C.4.1 sustainability requirements."},
    ],
    outputs:["Fundamental Rights Impact Assessment (FRIA)","Health & safety impact log","Transparency gap analysis","Societal impact documentation"],
    isoRef:"ISO 42001 Clause 6.1.4 / Annex A.5.3, A.5.4 / EU AI Act Art.9, 13",
  },
  {
    id:4, name:"Evaluation & Scoring", subtitle:"The 'How Bad'",
    clause:"ISO 42001 C.8.2 / Annex A.5",
    icon:"📊", color:"#E8A020",
    desc:"Score each identified impact by severity and likelihood to enable prioritisation of mitigation efforts.",
    steps:[
      {title:"Likelihood Scoring (1–5)",detail:"1=Very Unlikely, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain. Base scores on evidence from testing, comparable systems, and expert judgment."},
      {title:"Severity Scoring (1–5)",detail:"1=Negligible, 2=Minor, 3=Moderate, 4=Serious, 5=Critical/Irreversible. Weight by whether vulnerable groups are disproportionately affected."},
      {title:"Risk Score Calculation",detail:"Impact Score = Likelihood × Severity. Score ≥16: Unacceptable — must halt or fully mitigate. 10–15: High — HITL controls mandatory. 5–9: Medium. <5: Low — accept with monitoring."},
      {title:"Document Risk Acceptance Decisions",detail:"ISO 42001 C.6.1.1 requires formal documentation of which risks are accepted within tolerance, by whom, and on what basis. Risk owner sign-off required."},
    ],
    outputs:["Scored impact register","Risk acceptance decisions","Heat map visualisation","Risk prioritisation report"],
    isoRef:"ISO 42001 Clause 6.1.1, 6.1.2, 8.2 / Annex A.5",
  },
  {
    id:5, name:"Mitigation & Treatment", subtitle:"The 'Fix'",
    clause:"ISO 42001 C.8.3 / Annex A controls",
    icon:"🛡️", color:"#1FB864",
    desc:"ISO 42001 Clause 8.4 requires you to treat all identified impacts. Select controls from Annex A.",
    steps:[
      {title:"Technical Controls",detail:"Retrain on balanced datasets, implement fairness constraints, deploy RLHF guardrails, apply differential privacy, add robustness testing (red teaming), enable continuous bias monitoring with automated alerts."},
      {title:"Governance Controls (HITL)",detail:"Human-in-the-Loop requirement: no high-impact decision without human review. Define escalation procedures, override mechanisms, and accountability for AI decisions. Document in RACI."},
      {title:"Transparency Controls",detail:"Explicit AI disclosure labelling ('This decision was assisted by AI'), model cards documenting limitations, explainability layer (SHAP/LIME), user notification per EU AI Act Art.52."},
      {title:"Statement of Applicability",detail:"ISO 42001 C.8.3 requires a Statement of Applicability (SoA) mapping selected Annex A controls to identified risks. Document included/excluded controls with justification."},
    ],
    outputs:["Risk treatment plan","Statement of Applicability (SoA)","Implemented controls evidence","Model cards and bias test results"],
    isoRef:"ISO 42001 Clause 8.3, 8.4 / Annex A.2–A.11",
  },
  {
    id:6, name:"Conclusion & Approval", subtitle:"The 'Go / No-Go'",
    clause:"ISO 42001 C.9.3 / Annex A.5.3",
    icon:"✅", color:"#0DB4A0",
    desc:"The AIIA must conclude with a formal recommendation and documented sign-off from accountable leadership.",
    steps:[
      {title:"Go/No-Go Decision",detail:"Proceed: All impacts negligible or fully mitigated. Proceed with Conditions: High impacts remain but strict HITL controls and monitoring are confirmed active. Halt: Impact on fundamental rights is too high and cannot be mitigated (e.g. real-time biometric ID in public spaces)."},
      {title:"Residual Risk Acceptance",detail:"Document any residual risks that are accepted within organisational tolerance. Risk owner (typically CAIO or senior accountable role) must formally acknowledge and sign."},
      {title:"Mandatory Sign-off",detail:"Per ISO 42001 C.9.3 and EU AI Act Art.27: document must be signed by AI Project Owner, CAIO/Chief AI Risk Officer, and Legal/DPO. Date and version controlled."},
      {title:"Ongoing Monitoring Plan",detail:"Establish post-deployment monitoring: bias metric cadence, incident reporting channel, trigger conditions for reassessment (system change, incident, regulatory update, 6-month cycle)."},
    ],
    outputs:["Go/No-Go decision record","Residual risk acceptance form","Signed approval documentation","Post-deployment monitoring plan"],
    isoRef:"ISO 42001 Clause 9.1, 9.3 / Annex A.5.3 / EU AI Act Art.9(9), 27",
  },
];

function PageAIIA({role, setTab}) {
  const rc = RC(role), rcL = RCL(role);
  const [activePhase, setActivePhase] = useState(1);
  const [activeCat, setActiveCat] = useState(0);
  const [view, setView] = useState("phases"); // "phases" | "categories"
  const phase = AIIA_PHASES.find(p => p.id === activePhase);

  return (
    <div style={{animation:"up .3s ease"}}>
      <SHead
        title="AI System Impact Assessment (AIIA)"
        sub="ISO 42001 Annex A Control A.5 · Day 3 curriculum · 6-phase structured process per ISO 42001 C.6.1.4"
      />

      {/* View toggle */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{id:"phases",label:"⊕ 6-Phase Process"},{id:"categories",label:"⬟ Risk Categories"}].map(v =>
          <button key={v.id} onClick={()=>setView(v.id)} style={{
            background:view===v.id?rc:T.s2, color:view===v.id?"#fff":T.ink3,
            border:`1px solid ${view===v.id?rc:T.border}`, borderRadius:7,
            padding:"7px 16px", fontSize:11, fontWeight:600, fontFamily:F.b
          }}>{v.label}</button>
        )}
      </div>

      {view === "phases" && <>
        {/* Phase selector timeline */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:18}}>
          {AIIA_PHASES.map((p,i) => {
            const isAct = activePhase === p.id;
            return (
              <button key={p.id} onClick={()=>setActivePhase(p.id)} style={{
                background: isAct ? p.color+"20" : T.s2,
                border:`1px solid ${isAct ? p.color+"60" : T.border}`,
                borderRadius:9, padding:"10px 8px", cursor:"pointer",
                textAlign:"center", transition:"all .18s",
                boxShadow: isAct ? `0 0 16px ${p.color}20` : "none"
              }}>
                <div style={{fontSize:18,marginBottom:5}}>{p.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:isAct?p.color:T.ink3,
                  fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",lineHeight:1.3}}>
                  Phase {p.id}
                </div>
                <div style={{fontSize:9,color:isAct?T.ink2:T.ink4,fontFamily:F.b,marginTop:2,lineHeight:1.3}}>
                  {p.name.split(" ").slice(0,2).join(" ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Connector bar */}
        <div style={{display:"flex",alignItems:"center",marginBottom:20,gap:0}}>
          {AIIA_PHASES.map((p,i) => <>
            <div key={p.id} style={{
              width:28, height:28, borderRadius:"50%", flexShrink:0,
              background: activePhase >= p.id ? p.color : T.s3,
              border:`2px solid ${activePhase >= p.id ? p.color : T.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all .3s", boxShadow: activePhase === p.id ? `0 0 12px ${p.color}50` : "none"
            }}>
              <span style={{fontSize:10,fontWeight:800,color:activePhase>=p.id?"#fff":T.ink4,fontFamily:F.m}}>{p.id}</span>
            </div>
            {i < AIIA_PHASES.length-1 && (
              <div key={`line-${i}`} style={{
                flex:1, height:2,
                background: activePhase > p.id ? `linear-gradient(90deg,${p.color},${AIIA_PHASES[i+1].color})` : T.border,
                transition:"background .4s"
              }}/>
            )}
          </>)}
        </div>

        {/* Phase detail */}
        {phase && (
          <div style={{animation:"fade .25s ease"}}>
            <div style={{
              background:`linear-gradient(135deg,${phase.color}18,${T.s2})`,
              border:`1px solid ${phase.color}40`,
              borderRadius:12, padding:"20px 22px", marginBottom:16,
              boxShadow:`0 0 32px ${phase.color}10`
            }}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:14}}>
                <span style={{fontSize:28}}>{phase.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                    <Tag label={`Phase ${phase.id}`} color={phase.color} bg={phase.color+"20"}/>
                    <Tag label={phase.subtitle} color={T.ink3} bg={T.s3}/>
                    <Tag label={phase.clause} color={T.ink4} bg={T.s3}/>
                  </div>
                  <h2 style={{fontFamily:F.h,fontSize:20,fontWeight:700,color:T.ink,marginBottom:6}}>
                    {phase.name}
                  </h2>
                  <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>{phase.desc}</p>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14}}>
              {/* Steps */}
              <div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {phase.steps.map((step,i) => (
                    <div key={i} style={{
                      background:T.s1, border:`1px solid ${T.border}`,
                      borderLeft:`3px solid ${phase.color}`,
                      borderRadius:9, padding:"14px 16px",
                      animation:`up ${.3+i*.07}s ease both`
                    }}>
                      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{
                          width:22,height:22,borderRadius:6,flexShrink:0,
                          background:phase.color+"25",
                          border:`1.5px solid ${phase.color}50`,
                          display:"flex",alignItems:"center",justifyContent:"center"
                        }}>
                          <span style={{fontSize:10,fontWeight:800,color:phase.color,fontFamily:F.m}}>{i+1}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:5}}>
                            {step.title}
                          </div>
                          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar: outputs + ISO ref */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card style={{padding:16}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",
                    letterSpacing:"0.08em",fontFamily:F.m,marginBottom:12}}>Phase Outputs</div>
                  {phase.outputs.map((o,i) => (
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",
                      marginBottom:i<phase.outputs.length-1?9:0}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:phase.color,
                        marginTop:5,flexShrink:0}}/>
                      <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{o}</span>
                    </div>
                  ))}
                </Card>
                <Card style={{padding:16, border:`1px solid ${phase.color}30`}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",
                    letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>ISO Reference</div>
                  <p style={{fontSize:11,color:phase.color,fontFamily:F.m,lineHeight:1.7,margin:0}}>
                    {phase.isoRef}
                  </p>
                </Card>
                <div style={{display:"flex",gap:8}}>
                  <button
                    disabled={activePhase===1}
                    onClick={()=>setActivePhase(p=>Math.max(1,p-1))}
                    style={{flex:1,background:T.s2,color:T.ink3,border:`1px solid ${T.border}`,
                      borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b,
                      opacity:activePhase===1?.4:1}}>
                    ← Prev
                  </button>
                  <button
                    disabled={activePhase===6}
                    onClick={()=>setActivePhase(p=>Math.min(6,p+1))}
                    style={{flex:1,background:phase.color,color:"#fff",border:"none",
                      borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b,
                      opacity:activePhase===6?.4:1}}>
                    Next →
                  </button>
                </div>
                {activePhase===6&&(
                  <button onClick={()=>setTab("hitl")} style={{
                    width:"100%",background:T.green,color:"#fff",border:"none",
                    borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b
                  }}>⚡ Go to HITL Queue for Approval →</button>
                )}
              </div>
            </div>
          </div>
        )}
      </>}

      {view === "categories" && (
        <div>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,marginBottom:16,lineHeight:1.7}}>
            Seven risk categories from ISO 42001 (Day 3 training material) — systematic threat taxonomy
            for Step 3 of the AIIA process. Use during Phase 3: Impact Identification.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
            {AIIA_RISK_CATEGORIES.map((cat,i) => (
              <Card key={cat.cat} style={{
                overflow:"hidden", animation:`up ${.3+i*.05}s ease both`,
                border:`1px solid ${cat.color}25`,
                cursor:"pointer", transition:"border-color .18s",
                borderLeft:`3px solid ${cat.color}`
              }}
                onClick={()=>setActiveCat(activeCat===i?-1:i)}
              >
                <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{cat.icon}</span>
                  <div style={{flex:1}}>
                    <h3 style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>
                      {cat.cat}
                    </h3>
                    <span style={{fontSize:10,color:cat.color,fontFamily:F.m}}>
                      {cat.items.length} threat vectors
                    </span>
                  </div>
                  <span style={{color:T.ink4,transform:activeCat===i?"rotate(90deg)":"none",
                    transition:"transform .2s",fontSize:14}}>›</span>
                </div>
                {activeCat===i&&(
                  <div style={{padding:"0 15px 14px",borderTop:`1px solid ${T.border}`,animation:"up .2s ease"}}>
                    {cat.items.map((item,j) => (
                      <div key={j} style={{display:"flex",gap:8,marginTop:9,alignItems:"flex-start"}}>
                        <div style={{width:4,height:4,borderRadius:"50%",background:cat.color,
                          marginTop:5,flexShrink:0}}/>
                        <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: ISO 42001 IMPLEMENTATION TRACKER
   Based on Day 4: PDCA 4-phase, 15-step plan
───────────────────────────────────────────── */
const IMPL_PHASES = [
  {
    id:"plan", label:"Phase 1 — Plan", subtitle:"Understanding & Preparation",
    color:"#4B7BF5", icon:"◈", status:"complete",
    clause:"ISO 42001 Clauses 4 & 6",
    desc:"Establish the foundation: leadership buy-in, team formation, scope definition, gap analysis, and objectives.",
    steps:[
      {n:1, title:"Get Leadership Buy-in & Commit Resources", status:"complete", owner:"CEO / Board", clause:"C.5.1", deliverable:"Formal commitment from senior leadership, approved budget and resource allocation", detail:"Present business case: legal risk of non-compliance (EU AI Act fines up to €30M), competitive advantage of certification, enhanced stakeholder trust. Requires C-suite champion — typically CAIO."},
      {n:2, title:"Form Cross-functional AIMS Team", status:"complete", owner:"CAIO", clause:"C.5.3", deliverable:"Team structure with defined roles, RACI matrix", detail:"Appoint project lead and assemble representatives from legal, compliance, data science, IT, product management, HR, and ethics. ISO 42001 requires diverse cross-functional governance structure (Clause 5.3)."},
      {n:3, title:"Define AIMS Scope (Clause 4.3)", status:"complete", owner:"AIMS Team", clause:"C.4.3", deliverable:"Documented scope statement specifying AI systems, roles, and boundaries", detail:"Identify all AI systems in scope. Define organisational units and locations covered. Specify AI roles: provider, producer, deployer, or partner. Consider starting with a pilot focusing on highest-risk applications."},
      {n:4, title:"Conduct Gap Analysis & Risk Assessment", status:"active", owner:"GRC + CAIO", clause:"C.6.1", deliverable:"Gap analysis report, AI risk register, implementation roadmap", detail:"Benchmark current AI practices against all ISO 42001 clauses. Perform comprehensive AI risk assessment for bias, security, privacy, ethical risks. Produce prioritised list of improvement areas. Use ISO 42001 Checklist tab for gap tracking."},
      {n:5, title:"Define AI Objectives & Policies (C.5 & C.6)", status:"active", owner:"CAIO + Legal", clause:"C.5.2, C.6.2", deliverable:"AI policy document, objectives and metrics log, risk/opportunity treatment plan", detail:"Establish AI policy per C.5.2 requirements: purpose, scope, guiding principles, prohibited uses, ethical guidelines. Set measurable AIMS objectives aligned to business goals. Define how risks and opportunities identified in Step 4 will be addressed."},
    ]
  },
  {
    id:"do", label:"Phase 2 — Do", subtitle:"Implementation",
    color:"#9061F9", icon:"⊕", status:"active",
    clause:"ISO 42001 Clauses 7 & 8",
    desc:"Implement the AIMS: documentation, Annex A controls, training, awareness, and operational processes.",
    steps:[
      {n:6, title:"Develop AIMS Documentation (Clause 7)", status:"active", owner:"AIMS Team + Legal", clause:"C.7.5", deliverable:"Complete AIMS documentation suite including Statement of Applicability (SoA)", detail:"Create all mandatory documented information: AI policies, procedures, ethical guidelines, AIA methodologies, risk assessment records, and treatment plans. Produce SoA detailing which Annex A controls are included/excluded and why."},
      {n:7, title:"Implement Annex A Controls", status:"active", owner:"Engineering + CAIO", clause:"Annex A", deliverable:"Evidence of controls: bias test results, data provenance logs, AIA reports", detail:"Core implementation: Data Governance (A.7) — data acquisition, quality, privacy. AI System Impact Assessment (A.5) — 6-phase AIIA process. Lifecycle Management (A.6) — responsible AI from design to decommissioning. Transparency & Explainability (A.8) — decision explanation mechanisms for stakeholders."},
      {n:8, title:"Training & Awareness Programme (Clause 7)", status:"pending", owner:"HR + CAIO", clause:"C.7.2, C.7.3", deliverable:"Training materials, attendance records, competency evidence", detail:"Roll out tailored training for all relevant staff: AI developers, managers, end-users, and compliance teams. Cover AIMS policies, AI risk categories, ethical obligations, and individual responsibilities. ISO 42001 C.7.2 requires documented evidence of competence."},
    ]
  },
  {
    id:"check", label:"Phase 3 — Check", subtitle:"Monitoring & Evaluation",
    color:"#E8A020", icon:"◉", status:"pending",
    clause:"ISO 42001 Clause 9",
    desc:"Evaluate AIMS performance through KPIs, internal audits, and management review.",
    steps:[
      {n:9, title:"Monitor, Measure & Analyse AIMS Performance", status:"pending", owner:"AI Governance Lead", clause:"C.9.1", deliverable:"Performance monitoring reports, anomaly logs, incident reports", detail:"Define and track KPIs for AIMS effectiveness: bias metric drift, incident frequency, control compliance rate, HITL approval volumes. Log anomalies and system changes. ISO 42001 C.9.1 requires documented evaluation of what, when, how, and by whom monitoring is conducted."},
      {n:10, title:"Conduct Internal Audit", status:"pending", owner:"Internal Audit / GRC", clause:"C.9.2", deliverable:"Internal audit report with non-conformities and improvement opportunities", detail:"Designated internal team or external consultant verifies AIMS compliance with all ISO 42001 requirements. Auditors must be selected for objectivity and impartiality (C.9.2). Audit findings documented and reported to relevant management."},
      {n:11, title:"Perform Management Review", status:"pending", owner:"CAIO + C-Suite", clause:"C.9.3", deliverable:"Management review minutes with decisions and actions documented", detail:"AIMS team presents monitoring results, audit findings, AI system performance, and stakeholder feedback to top management. Review must assess AIMS suitability, adequacy, and effectiveness. Outputs include decisions on improvement opportunities and AIMS changes."},
    ]
  },
  {
    id:"act", label:"Phase 4 — Act", subtitle:"Improvement & Certification",
    color:"#1FB864", icon:"⬢", status:"pending",
    clause:"ISO 42001 Clause 10",
    desc:"Address non-conformities, achieve certification, and embed continual improvement into operations.",
    steps:[
      {n:12, title:"Implement Corrective Actions (Clause 10)", status:"pending", owner:"AIMS Team", clause:"C.10.1", deliverable:"Corrective action plans, evidence of resolution", detail:"Address all non-conformities identified during internal audit and management review. Perform root cause analysis. Implement corrective actions, verify effectiveness, and update documentation. ISO 42001 C.10.1 requires documented nonconformity management."},
      {n:13, title:"Engage Accredited Certification Body", status:"pending", owner:"CAIO + Procurement", clause:"External", deliverable:"Signed agreement with accredited certification body", detail:"Select an accredited ISO 42001 certification body (check IAF/UKAS accreditation). Provide AIMS documentation for Stage 1 review. Agree audit timeline, scope, and format. Budget typical timeline: 3–6 months from initial contact to certificate."},
      {n:14, title:"External Certification Audit", status:"pending", owner:"All Teams", clause:"ISO 42001 Cert", deliverable:"ISO 42001 certificate upon successful audit completion", detail:"Stage 1: Documentation review — auditor reviews AIMS scope, policies, risk assessments, and SoA. Stage 2: Operational effectiveness audit — auditor verifies controls are working in practice. Address findings. Certificate issued on successful completion."},
      {n:15, title:"Surveillance & Continual Improvement", status:"pending", owner:"CAIO + AIMS Team", clause:"C.10.2", deliverable:"Annual surveillance audit records, updated policies and controls", detail:"AIMS becomes an integral part of operations. Annual surveillance audits required. Triennial recertification audit. Continually update policies, risk assessments, and controls as AI landscape, regulations (EU AI Act enforcement Aug 2026), and organisational context evolve."},
    ]
  },
];

function PageImpl({role}) {
  const rc = RC(role), rcL = RCL(role);
  const [activePhaseId, setActivePhaseId] = useState("plan");
  const [expandedStep, setExpandedStep] = useState(null);
  const activePhase = IMPL_PHASES.find(p => p.id === activePhaseId);
  const allSteps = IMPL_PHASES.flatMap(p => p.steps);
  const completedSteps = allSteps.filter(s => s.status === "complete").length;
  const activeSteps = allSteps.filter(s => s.status === "active").length;
  const pct = Math.round((completedSteps / allSteps.length) * 100);

  const statusColor = s => s==="complete"?T.green:s==="active"?T.amber:T.ink4;
  const statusLabel = s => s==="complete"?"✓ Complete":s==="active"?"● In Progress":"○ Pending";

  return (
    <div style={{animation:"up .3s ease"}}>
      <SHead
        title="ISO 42001 Implementation Tracker"
        sub="PDCA 4-phase, 15-step implementation roadmap from Day 4 training · Plan → Do → Check → Act"
      />

      {/* Overall progress */}
      <Card style={{padding:"14px 18px",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>
              AIMS Implementation Progress
            </div>
            <p style={{fontSize:11,color:T.ink4,fontFamily:F.b}}>
              {completedSteps} of {allSteps.length} steps complete · {activeSteps} in progress
            </p>
          </div>
          <div style={{fontSize:28,fontWeight:700,fontFamily:F.m,color:rc}}>{pct}%</div>
        </div>
        <Bar value={pct} color={rc}/>
        <div style={{display:"flex",gap:14,marginTop:10}}>
          {[{label:"Complete",color:T.green,count:completedSteps},
            {label:"In Progress",color:T.amber,count:activeSteps},
            {label:"Pending",color:T.ink4,count:allSteps.length-completedSteps-activeSteps}
          ].map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.label}: {s.count}</span>
          </div>)}
        </div>
      </Card>

      {/* Phase PDCA selector */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {IMPL_PHASES.map((phase,i) => {
          const isAct = activePhaseId === phase.id;
          const done = phase.steps.filter(s=>s.status==="complete").length;
          const total = phase.steps.length;
          return (
            <button key={phase.id} onClick={()=>setActivePhaseId(phase.id)} style={{
              background: isAct ? phase.color+"18" : T.s2,
              border:`1px solid ${isAct ? phase.color+"60" : T.border}`,
              borderRadius:10, padding:"13px 12px", cursor:"pointer",
              textAlign:"left", transition:"all .18s",
              boxShadow: isAct ? `0 0 20px ${phase.color}18` : "none"
            }}>
              <div style={{fontSize:18,marginBottom:7}}>{phase.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:isAct?phase.color:T.ink3,
                fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>
                {phase.label.split(" — ")[0]}
              </div>
              <div style={{fontSize:12,fontWeight:600,color:isAct?T.ink:T.ink2,fontFamily:F.b,marginBottom:5}}>
                {phase.subtitle}
              </div>
              <div style={{marginBottom:6}}>
                <Bar value={(done/total)*100} color={phase.color}/>
              </div>
              <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{done}/{total} steps</div>
            </button>
          );
        })}
      </div>

      {/* Active phase steps */}
      {activePhase && (
        <div style={{animation:"fade .2s ease"}}>
          <div style={{
            background:`linear-gradient(135deg,${activePhase.color}14,${T.s2})`,
            border:`1px solid ${activePhase.color}35`,
            borderRadius:10, padding:"14px 18px", marginBottom:16
          }}>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <Tag label={activePhase.label} color={activePhase.color} bg={activePhase.color+"20"}/>
              <Tag label={activePhase.clause} color={T.ink3} bg={T.s3}/>
            </div>
            <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>
              {activePhase.desc}
            </p>
          </div>

          <div style={{position:"relative"}}>
            {/* Vertical connector line */}
            <div style={{
              position:"absolute",left:16,top:20,bottom:20,width:2,
              background:`linear-gradient(180deg,${activePhase.color}60,${activePhase.color}10)`,
              zIndex:0
            }}/>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activePhase.steps.map((step,i) => {
                const isExp = expandedStep === step.n;
                const sCol = statusColor(step.status);
                return (
                  <div key={step.n} style={{
                    display:"flex", gap:14, alignItems:"flex-start",
                    animation:`up ${.3+i*.07}s ease both`
                  }}>
                    {/* Circle */}
                    <div style={{
                      width:34,height:34,borderRadius:"50%",flexShrink:0,
                      background: step.status==="complete" ? T.greenL : step.status==="active" ? activePhase.color+"25" : T.s3,
                      border:`2px solid ${sCol}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      position:"relative",zIndex:1,
                      boxShadow: step.status==="active" ? `0 0 14px ${activePhase.color}40` : "none",
                      transition:"all .3s"
                    }}>
                      <span style={{fontSize:step.status==="complete"?12:11,fontWeight:800,color:sCol,fontFamily:F.m}}>
                        {step.status==="complete"?"✓":step.n}
                      </span>
                    </div>

                    {/* Content card */}
                    <div style={{
                      flex:1,
                      background: step.status==="active" ? `linear-gradient(135deg,${activePhase.color}10,${T.s1})` : T.s1,
                      border:`1px solid ${isExp||step.status==="active" ? activePhase.color+"40" : T.border}`,
                      borderRadius:9, overflow:"hidden",
                      boxShadow: step.status==="active" ? `0 0 16px ${activePhase.color}08` : "none",
                      transition:"border-color .2s"
                    }}>
                      <div onClick={()=>setExpandedStep(isExp?null:step.n)}
                        style={{padding:"13px 15px",cursor:"pointer",display:"flex",
                          alignItems:"flex-start",gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:7,marginBottom:7,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:sCol}}>
                              {statusLabel(step.status)}
                            </span>
                            <Tag label={step.clause} color={T.ink4} bg={T.s3}/>
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,lineHeight:1.4}}>
                            Step {step.n}: {step.title}
                          </div>
                          <div style={{fontSize:11,color:T.ink4,fontFamily:F.b,marginTop:4}}>
                            Owner: {step.owner}
                          </div>
                        </div>
                        <span style={{color:T.ink4,transform:isExp?"rotate(90deg)":"none",
                          transition:"transform .2s",fontSize:14,flexShrink:0,marginTop:2}}>›</span>
                      </div>

                      {isExp && (
                        <div style={{padding:"0 15px 15px",borderTop:`1px solid ${T.border}`,
                          animation:"up .2s ease"}}>
                          <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.75,
                            marginTop:12,marginBottom:12}}>{step.detail}</div>
                          <div style={{background:T.s3,border:`1px solid ${activePhase.color}25`,
                            borderRadius:7,padding:"10px 12px"}}>
                            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",
                              letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>Deliverable</div>
                            <p style={{fontSize:11,color:activePhase.color,fontFamily:F.b,
                              lineHeight:1.6,margin:0,fontWeight:500}}>{step.deliverable}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: AI MODEL REGISTRY (from CAIO Kit Part 1 & ISO 42001 C.8.4)
───────────────────────────────────────────── */
function PageModelRegistry({setTab}) {
  const [sel,setSel]=useState(MODEL_REGISTRY[0]);
  const rCol=r=>r==="Critical"?T.red:r==="High"?T.amber:r==="Medium"?T.blue:r==="Unknown"?T.ink4:T.green;
  const sCol=s=>s==="In Production"?T.green:s==="Awaiting Approval"?T.amber:s==="Suspended"?T.red:s==="Unclassified"?T.red:T.ink3;
  const Check=({v,label})=><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
    <div style={{width:16,height:16,borderRadius:4,background:v?T.greenL:T.redL,border:`1px solid ${v?T.green:T.red}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:9,fontWeight:800,color:v?T.green:T.red}}>{v?"✓":"✗"}</span>
    </div>
    <span style={{fontSize:10,color:v?T.ink2:T.ink4,fontFamily:F.b}}>{label}</span>
  </div>;
  const unclassified=MODEL_REGISTRY.filter(m=>m.euAiAct==="Unclassified").length;
  const critical=MODEL_REGISTRY.filter(m=>m.risk==="Critical").length;
  const noCard=MODEL_REGISTRY.filter(m=>!m.modelCard).length;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Model Registry" sub="ISO 42001 C.8.4 · CAIO Kit — All AI systems in development, production, pilot, and procurement"/>
    {/* Summary strip */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[
        {label:"Total Models",value:MODEL_REGISTRY.length,color:T.caio,sub:"In registry"},
        {label:"Unclassified",value:unclassified,color:T.red,sub:"EU AI Act gap",action:()=>{}},
        {label:"Critical Risk",value:critical,color:T.red,sub:"Require treatment"},
        {label:"Missing Model Card",value:noCard,color:T.amber,sub:"ISO 42001 C.8.4"},
      ].map((k,i)=><Card key={k.label} style={{padding:"13px 14px",cursor:k.action?"pointer":"default"}} onClick={k.action}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{k.label}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:3}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14}}>
      {/* Table */}
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 90px 90px 70px",padding:"7px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["AI System","Type","EU AI Act","Status","Risk"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {MODEL_REGISTRY.map((m,i)=><div key={m.id} onClick={()=>setSel(m)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 90px 90px 70px",padding:"11px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<MODEL_REGISTRY.length-1?`1px solid ${T.border}`:"none",background:sel?.id===m.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel?.id===m.id?`3px solid ${T.caio}`:"3px solid transparent",transition:"all .15s"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{m.name}</div>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{m.dept} · {m.vendor}</span>
            </div>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.4}}>{m.type}</span>
            <Tag label={m.euAiAct} color={m.euAiAct==="High-Risk"?T.red:m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber} bg={m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.redL:m.euAiAct==="Minimal Risk"?T.greenL:T.amberL}/>
            <Tag label={m.status} color={sCol(m.status)} bg={sCol(m.status)+"18"}/>
            <Tag label={m.risk} color={rCol(m.risk)} bg={rCol(m.risk)+"18"}/>
          </div>)}
        </div>
      </div>
      {/* Detail */}
      {sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",animation:"fade .25s ease",boxShadow:`0 0 24px ${rCol(sel.risk)}10`}}>
        <div style={{background:`linear-gradient(135deg,${rCol(sel.risk)}18,${T.s3})`,borderBottom:`1px solid ${rCol(sel.risk)}30`,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
            <Tag label={sel.euAiAct} color={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.red:T.amber} bg={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.redL:T.amberL}/>
            <Tag label={sel.status} color={sCol(sel.status)} bg={sCol(sel.status)+"18"}/>
          </div>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,lineHeight:1.3}}>{sel.name}</h3>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>{sel.clause}</p>
        </div>
        <div style={{padding:15}}>
          {[["Type",sel.type],["Owner",sel.owner],["Vendor",sel.vendor],["Deployed",sel.deployed],["Accuracy",sel.accuracy],["Last Audit",sel.lastAudit]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span>
            <span style={{fontSize:10,color:T.ink,fontFamily:F.m,fontWeight:600}}>{v}</span>
          </div>)}
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>ISO 42001 Compliance Checklist</div>
            <div style={{background:T.s3,borderRadius:8,padding:"11px 12px"}}>
              <Check v={sel.modelCard}      label="Model Card documented (C.8.4)"/>
              <Check v={sel.aia}            label="AI Impact Assessment completed (A.5)"/>
              <Check v={sel.biasTest}       label="Bias & fairness testing done"/>
              <Check v={sel.killSwitch}     label="Kill switch / fallback deployed (C.8.5)"/>
              <Check v={sel.dataProvenance} label="Training data provenance documented (C.7.2)"/>
            </div>
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Transparency Score</span>
                <span style={{fontSize:11,fontWeight:700,fontFamily:F.m,color:sel.transparency>=80?T.green:sel.transparency>=50?T.amber:T.red}}>{sel.transparency}%</span>
              </div>
              <Bar value={sel.transparency} color={sel.transparency>=80?T.green:sel.transparency>=50?T.amber:T.red}/>
            </div>
          </div>
          {(sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified")&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:7,padding:"10px 12px",marginTop:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.red,fontFamily:F.b,marginBottom:3}}>⚠ Action Required</div>
            <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{sel.euAiAct==="Unclassified"?"EU AI Act risk classification must be completed before August 2026 enforcement.":"High-Risk system — full conformity assessment required per EU AI Act Art.43."}</p>
          </div>}
          <button onClick={()=>setTab("hitl")} style={{width:"100%",marginTop:12,background:T.caio,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Review in HITL Queue →</button>
        </div>
      </Card>}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: GOVERNANCE MATURITY RADAR (CAIO Kit Part 1)
───────────────────────────────────────────── */
function PageMaturityRadar() {
  const [sel,setSel]=useState(null);
  const overall=Math.round(MATURITY_DOMAINS.reduce((s,d)=>s+d.score,0)/MATURITY_DOMAINS.length);
  const matLabel=s=>s>=85?"Leading":s>=70?"Established":s>=55?"Developing":s>=40?"Initial":"Unprepared";
  const matCol=s=>s>=85?T.green:s>=70?T.blue:s>=55?T.amber:T.red;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Governance Maturity" sub="CAIO Kit Part 1 — Benchmarking across 8 governance domains. Target: Established (70+) by Q3 2026."/>
    {/* Overall score */}
    <Card style={{padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:20}}>
      <Ring score={overall} color={matCol(overall)} size={72}/>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Overall Governance Maturity Score</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:F.m,color:matCol(overall),letterSpacing:"-0.02em"}}>{overall}<span style={{fontSize:16,fontWeight:500,color:T.ink3}}>/100</span></div>
        <Tag label={matLabel(overall)} color={matCol(overall)} bg={matCol(overall)+"18"}/>
      </div>
      <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:20}}>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginBottom:8}}>Maturity Scale</div>
        {[["Leading","85+",T.green],["Established","70–84",T.blue],["Developing","55–69",T.amber],["Initial","40–54",T.red],["Unprepared","<40",T.red]].map(([l,r,c])=><div key={l} style={{display:"flex",gap:8,marginBottom:4,alignItems:"center"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{l}</span>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r}</span>
        </div>)}
      </div>
    </Card>
    {/* Domain bars */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
      {MATURITY_DOMAINS.map((d,i)=>{
        const col=matCol(d.score);
        const gap=d.target-d.score;
        return <Card key={d.domain} style={{padding:16,cursor:"pointer",border:`1px solid ${sel?.domain===d.domain?col+"60":T.border}`,transition:"border-color .2s",animation:`up ${.3+i*.05}s ease both`}} onClick={()=>setSel(sel?.domain===d.domain?null:d)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{flex:1,paddingRight:10}}>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4,lineHeight:1.3}}>{d.domain}</div>
              <Tag label={matLabel(d.score)} color={col} bg={col+"18"}/>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,fontFamily:F.m,color:col}}>{d.score}</div>
              <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Target: {d.target}</div>
            </div>
          </div>
          <div style={{marginBottom:6}}>
            <Bar value={d.score} color={col} delay={i*60}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Gap to target: {gap > 0 ? `+${gap} pts needed` : "Target met ✓"}</span>
            <span style={{fontSize:9,color:col,fontFamily:F.m,fontWeight:600}}>{d.score}%</span>
          </div>
          {sel?.domain===d.domain&&<div style={{marginTop:12,padding:"10px 12px",background:T.s3,borderRadius:7,borderLeft:`3px solid ${col}`}}>
            <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.7,margin:0}}>{d.desc}</p>
          </div>}
        </Card>;
      })}
    </div>
  </div>;
}

/* ─────────────────────────────────────────────
   PAGE: USE CASE PIPELINE (CAIO Kit Part 2)
───────────────────────────────────────────── */
function PageUseCases() {
  const [view,setView]=useState("inventory");        /* "inventory" | "intake" | "detail" */
  const [filter,setFilter]=useState("all");          /* pipeline-stage filter */
  const [tierFilter,setTierFilter]=useState("all");
  const [intake,setIntake]=useState({
    name:"", dept:"", system:"GPT-4 Enterprise", dataClass:"Internal",
    decisionImpact:"Advisory", affectedUsers:"", desc:"", submittedBy:"",
  });

  /* ─── Live data from Supabase ─── joins use_cases + use_case_decisions */
  const [cases, setCases] = useState(USE_CASES);
  const [dataSource, setDataSource] = useState(supabase ? "loading" : "constant");
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const [{ data: ucs, error: e1 }, { data: dcs, error: e2 }] = await Promise.all([
        supabase.from("use_cases").select("*").order("id", { ascending: true }),
        supabase.from("use_case_decisions").select("*"),
      ]);
      if (cancelled) return;
      if (e1 || e2 || !ucs || ucs.length === 0) {
        setDataSource((e1 || e2) ? "fallback-error" : "fallback-empty");
        return;
      }
      setCases(ucs.map(uc => dbToUseCase(uc, dcs || [])));
      setDataSource("live");
    })();
    return () => { cancelled = true; };
  }, []);

  const [selectedId,setSelectedId]=useState(USE_CASES[0]?.id);

  /* ─── Quiet luxury palette — graphite + champagne + cream ─────
     Deep warm graphite heroes, cream surfaces, champagne accent.
     Boardroom/private-bank aesthetic — restraint over decoration. */
  const K_ = {
    bg:        "#FAFAF6",                       /* warm cream paper */
    surface:   "#FFFFFF",                       /* pure white card */
    s1:        "#F4F2EC",                       /* whisper elevation */
    s2:        "#EDE9E0",                       /* tinted surface */
    line:      "rgba(28,27,31,0.07)",           /* graphite hairline */
    lineH:     "rgba(28,27,31,0.14)",
    navy:      "#1C1B1F",                       /* deep warm graphite (not navy) */
    navy2:     "#2A2826",                       /* lighter graphite for gradient */
    navyT:     "#F5F2EA",                       /* warm cream text on graphite */
    navyT2:    "rgba(245,242,234,0.62)",
    navyT3:    "rgba(245,242,234,0.32)",
    ink:       "#1A1916",                       /* primary text */
    ink2:      "#5F5C56",                       /* secondary — warm slate */
    ink3:      "#9A9690",                       /* tertiary */
    ink4:      "#C5C2BA",
    gold:      "#C9A961",                       /* CHAMPAGNE GOLD accent */
    goldText:  "#1A1916",                       /* dark graphite on champagne */
    goldL:     "rgba(201,169,97,0.12)",
    sage:      "#5B7A5E",                       /* muted forest — positive */
    sageL:     "rgba(91,122,94,0.10)",
    crit:      "#9B3636",                       /* muted oxblood */
    critL:     "rgba(155,54,54,0.10)",
  };
  const fSerif="'Newsreader','PP Editorial Old','Tinos',Georgia,serif";
  const fSans ="'Plus Jakarta Sans',system-ui,sans-serif";
  const fMono ="'JetBrains Mono',ui-monospace,monospace";

  /* ─── Helpers ─── */
  const tierColor = t => ({
    "Prohibited":K_.crit, "High-Risk":K_.amber, "Limited":K_.sage, "Minimal":K_.ink3,
  })[t] || K_.ink3;
  const stageColor = s => ({
    "Submitted":K_.ink3, "Under Review":K_.amber, "Approved":K_.sage,
    "Conditions":K_.amber, "Production":K_.navy, "Retired":K_.ink3,
  })[s] || K_.ink3;
  const decisionColor = d => ({
    "approve":K_.sage, "approve_with_conditions":K_.amber,
    "reject":K_.crit, "pending":K_.ink3,
  })[d] || K_.ink3;
  const decisionLabel = d => ({
    "approve":"Approved", "approve_with_conditions":"Approved · conditions",
    "reject":"Rejected", "pending":"Pending",
  })[d] || d;

  /* Auto-classify tier from the intake form */
  const classifyTier = (form) => {
    if(form.affectedUsers > 100 || form.dataClass==="Restricted") return "High-Risk";
    if(form.decisionImpact==="Automated") return "High-Risk";
    if(form.dataClass==="Confidential") return "Limited";
    return "Minimal";
  };

  /* Filter cases */
  const filteredCases = cases.filter(uc => {
    if(filter!=="all" && uc.pipelineStage!==filter) return false;
    if(tierFilter!=="all" && uc.tier!==tierFilter) return false;
    return true;
  });

  const sel = cases.find(c => c.id===selectedId) || cases[0];

  /* Submit intake form — writes to Supabase + creates 3 pending decisions */
  const [submittingIntake, setSubmittingIntake] = useState(false);

  /* ─── HITL decision actions ─── */
  const ROLE_SIGNERS = {
    caio: "Marcus Chen (CAIO)",
    ciso: "Sarah Chen (CISO)",
    cdpo: "Jennifer Lim (CDPO)",
    cio:  "David Park (CIO)",
    cgo:  "Patricia Watts (CGO)",
  };
  const [decidingRow, setDecidingRow] = useState(null);   /* `${ucId}-${role}` */
  const [decisionDraft, setDecisionDraft] = useState({}); /* { reasoning: "" } */

  /* Compute the rolled-up pipeline_stage from current decisions */
  const computeStage = (decisions) => {
    if (decisions.some(d => d.decision === "reject")) return "Rejected";
    const pending = decisions.filter(d => d.decision === "pending").length;
    if (pending === decisions.length) return "Submitted";
    if (pending > 0) return "Under Review";
    if (decisions.some(d => d.decision === "approve_with_conditions")) return "Conditions";
    return "Approved";
  };

  const decideDecision = async (useCase, role, action) => {
    if(!supabase || dataSource !== "live"){
      // local fallback only
      const updatedDecisions = useCase.decisions.map(d =>
        d.role === role
          ? { ...d, decision: action, reasoning: decisionDraft.reasoning || "", signer: ROLE_SIGNERS[role] || role, timestamp: new Date().toISOString().slice(0,10) }
          : d
      );
      const newStage = computeStage(updatedDecisions);
      setCases(cs => cs.map(c => c.id === useCase.id ? { ...c, decisions: updatedDecisions, pipelineStage: newStage } : c));
      setDecidingRow(null); setDecisionDraft({});
      return;
    }
    const today = new Date().toISOString();
    const signer = ROLE_SIGNERS[role] || role.toUpperCase();
    /* 1. UPDATE the matching decision row */
    const { error: decErr } = await supabase
      .from("use_case_decisions")
      .update({
        decision: action,
        reasoning: decisionDraft.reasoning || null,
        signer,
        signed_at: today,
      })
      .eq("use_case_id", useCase.id)
      .eq("role", role);
    if(decErr){
      setDecidingRow(null);
      return;
    }
    /* 2. Compute and update pipeline_stage if it changed */
    const updatedDecisions = useCase.decisions.map(d =>
      d.role === role
        ? { ...d, decision: action, reasoning: decisionDraft.reasoning || "", signer, timestamp: today.slice(0,10) }
        : d
    );
    const newStage = computeStage(updatedDecisions);
    if (newStage !== useCase.pipelineStage) {
      await supabase.from("use_cases").update({ pipeline_stage: newStage }).eq("id", useCase.id);
    }
    /* 3. Optimistic local update */
    setCases(cs => cs.map(c => c.id === useCase.id ? { ...c, decisions: updatedDecisions, pipelineStage: newStage } : c));
    setDecidingRow(null); setDecisionDraft({});
  };

  const submitIntake = async () => {
    if(!intake.name.trim() || !intake.dept.trim()){
      // Brief visual feedback if user didn't fill required fields
      return;
    }
    const tier = classifyTier(intake);
    const nums = cases.map(c => parseInt((c.id||"").replace(/^uc/i,""),10)).filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    const id = "uc" + next;
    const today = new Date().toISOString();

    if(supabase && dataSource === "live"){
      setSubmittingIntake(true);
      /* Insert into use_cases */
      const ucRow = {
        id,
        name: intake.name.trim(),
        dept: intake.dept.trim(),
        system: intake.system,
        data_class: intake.dataClass,
        decision_impact: intake.decisionImpact,
        affected_users: Number(intake.affectedUsers) || 0,
        tier,
        iso42001_controls: ["6.1.2","8.2"],
        submitted_at: today,
        submitted_by: intake.submittedBy.trim() || "Unknown",
        pipeline_stage: "Submitted",
        description: intake.desc.trim() || null,
      };
      const { error: ucErr } = await supabase.from("use_cases").insert(ucRow);
      if(ucErr){
        setSubmittingIntake(false);
        return;
      }
      /* Insert the 3 pending decisions (CAIO, CISO, CDPO) */
      const decisionRows = ["caio","ciso","cdpo"].map(role => ({
        use_case_id: id,
        role,
        decision: "pending",
        reasoning: null,
        signer: null,
        signed_at: null,
      }));
      await supabase.from("use_case_decisions").insert(decisionRows);
      setSubmittingIntake(false);
    }

    /* Optimistic local update — works in both live and constant-fallback modes */
    const newCase = {
      id, name:intake.name, dept:intake.dept, system:intake.system,
      dataClass:intake.dataClass, decisionImpact:intake.decisionImpact,
      affectedUsers:Number(intake.affectedUsers)||0,
      tier, iso42001Controls:["6.1.2","8.2"],
      submittedAt: today.slice(0,10),
      submittedBy: intake.submittedBy.trim() || "Unknown",
      pipelineStage:"Submitted",
      description: intake.desc,
      decisions:[
        {role:"caio",decision:"pending",reasoning:"",signer:"",timestamp:""},
        {role:"ciso",decision:"pending",reasoning:"",signer:"",timestamp:""},
        {role:"cdpo",decision:"pending",reasoning:"",signer:"",timestamp:""},
      ],
    };
    setCases([newCase, ...cases]);
    setSelectedId(newCase.id);
    setView("detail");
    setIntake({name:"",dept:"",system:"GPT-4 Enterprise",dataClass:"Internal",decisionImpact:"Advisory",affectedUsers:"",desc:"",submittedBy:""});
  };

  /* ════════ INVENTORY VIEW ════════ */
  const InventoryView = () => (
    <>
      {/* Page header */}
      <div style={{
        background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
        borderRadius:20, padding:"32px 36px", marginBottom:14,
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute",inset:0,opacity:0.4,
          backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,
          backgroundSize:"24px 24px", pointerEvents:"none",
        }}/>
        <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:24,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:10.5,color:K_.gold,fontFamily:fMono,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
              <span>▸</span><span>AI Governance · Use Case Pipeline</span>
              <DataSourcePill dataSource={dataSource} mono={fMono}/>
            </div>
            <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(32px,3.8vw,46px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
              Every AI use case, <span style={{fontStyle:"italic"}}>under control.</span>
            </h1>
            <p style={{fontSize:14,lineHeight:1.5,color:K_.navyT2,margin:"12px 0 0",maxWidth:520}}>
              From intake to production, every AI system in scope is registered, classified, and signed off by the right role.
            </p>
          </div>
          <button onClick={()=>setView("intake")} style={{
            background:K_.gold, color:K_.goldText,
            border:"none", borderRadius:100, padding:"11px 22px",
            fontSize:13, fontWeight:700, letterSpacing:"0.01em",
            cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8,
            fontFamily:fSans, position:"relative", flexShrink:0,
          }}>
            <span>✦</span> New use case
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>
        {[
          {label:"Total in scope", val:String(cases.length), suf:"", c:K_.ink},
          {label:"Awaiting review", val:String(cases.filter(c=>c.pipelineStage==="Submitted"||c.pipelineStage==="Under Review").length), suf:"", c:K_.amber},
          {label:"High-risk tier",  val:String(cases.filter(c=>c.tier==="High-Risk").length), suf:"", c:K_.crit},
          {label:"In production",   val:String(cases.filter(c=>c.pipelineStage==="Production").length), suf:"", c:K_.sage},
        ].map((s,i)=>(
          <div key={s.label} style={{
            background:K_.surface, borderRadius:18, padding:"22px 24px",
            border:`1px solid ${K_.line}`,
          }}>
            <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>{s.label}</div>
            <div style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:48,lineHeight:0.9,letterSpacing:"-0.04em",color:s.c}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter row + table card */}
      <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"20px 24px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600}}>Stage</span>
          {[["all","All"],["Submitted","Submitted"],["Under Review","Under review"],["Approved","Approved"],["Conditions","Conditions"],["Production","Production"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{
              background:filter===k?K_.navy:"transparent",
              color:filter===k?K_.navyT:K_.ink2,
              border:`1px solid ${filter===k?K_.navy:K_.line}`,
              borderRadius:100,padding:"6px 14px",
              fontSize:11.5,fontWeight:filter===k?600:500,fontFamily:fSans,
              cursor:"pointer",transition:"all .15s",
            }}>{l}</button>
          ))}
          <span style={{width:1,height:20,background:K_.line,margin:"0 4px"}}/>
          <span style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600}}>Tier</span>
          {[["all","All"],["High-Risk","High-Risk"],["Limited","Limited"],["Minimal","Minimal"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTierFilter(k)} style={{
              background:tierFilter===k?tierColor(k):"transparent",
              color:tierFilter===k?"#fff":K_.ink2,
              border:`1px solid ${tierFilter===k?tierColor(k):K_.line}`,
              borderRadius:100,padding:"6px 14px",
              fontSize:11.5,fontWeight:tierFilter===k?600:500,fontFamily:fSans,
              cursor:"pointer",transition:"all .15s",
            }}>{l}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${K_.line}`}}>
                {["ID","Use case","Department","System","Tier","Stage","Owner","Submitted"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:9.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(uc=>(
                <tr key={uc.id} onClick={()=>{setSelectedId(uc.id);setView("detail");}} style={{
                  borderBottom:`1px solid ${K_.line}`,cursor:"pointer",transition:"background .12s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.background=K_.bg;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                  <td style={{padding:"14px 12px",fontFamily:fMono,fontSize:11,color:K_.ink3,letterSpacing:"0.05em"}}>{uc.id.toUpperCase()}</td>
                  <td style={{padding:"14px 12px",color:K_.ink,fontWeight:500}}>{uc.name}</td>
                  <td style={{padding:"14px 12px",color:K_.ink2}}>{uc.dept}</td>
                  <td style={{padding:"14px 12px",color:K_.ink2,fontSize:12}}>{uc.system}</td>
                  <td style={{padding:"14px 12px"}}>
                    <span style={{display:"inline-block",background:tierColor(uc.tier)+"18",color:tierColor(uc.tier),border:`1px solid ${tierColor(uc.tier)}30`,borderRadius:100,padding:"3px 10px",fontSize:10.5,fontWeight:600,fontFamily:fSans,letterSpacing:"0.01em"}}>{uc.tier}</span>
                  </td>
                  <td style={{padding:"14px 12px"}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,color:stageColor(uc.pipelineStage),fontSize:12,fontWeight:500}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:stageColor(uc.pipelineStage)}}/>
                      {uc.pipelineStage}
                    </span>
                  </td>
                  <td style={{padding:"14px 12px",color:K_.ink2,fontSize:12}}>{uc.owner}</td>
                  <td style={{padding:"14px 12px",color:K_.ink3,fontFamily:fMono,fontSize:11,letterSpacing:"0.04em"}}>{uc.submittedAt}</td>
                </tr>
              ))}
              {filteredCases.length===0 && (
                <tr><td colSpan={8} style={{padding:"40px 12px",textAlign:"center",color:K_.ink3,fontSize:13,fontStyle:"italic"}}>No use cases match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  /* ════════ INTAKE FORM VIEW ════════ */
  const IntakeView = () => {
    const tierPreview = classifyTier(intake);
    const field = (label, child, hint) => (
      <div style={{marginBottom:18}}>
        <label style={{display:"block",fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>{label}</label>
        {child}
        {hint && <div style={{fontSize:11,color:K_.ink3,marginTop:6,lineHeight:1.4}}>{hint}</div>}
      </div>
    );
    const inputStyle = {
      width:"100%",padding:"11px 14px",border:`1px solid ${K_.line}`,borderRadius:10,
      fontSize:13.5,fontFamily:fSans,color:K_.ink,background:K_.bg,
      transition:"border .15s",
    };
    return (
      <>
        <div style={{
          background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
          borderRadius:20,padding:"32px 36px",marginBottom:14,position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setView("inventory")} style={{
              background:"none",border:"none",color:K_.navyT2,
              fontSize:11,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",
              cursor:"pointer",padding:0,marginBottom:18,fontWeight:500,
            }}>← Back to inventory</button>
            <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(28px,3.4vw,40px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
              Propose a new <span style={{fontStyle:"italic"}}>AI use case.</span>
            </h1>
            <p style={{fontSize:13.5,lineHeight:1.5,color:K_.navyT2,margin:"12px 0 0",maxWidth:560}}>
              Fill the form. VerisZone will auto-classify EU AI Act tier and route to CAIO, CISO, and CDPO for sign-off.
            </p>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14}}>
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"28px 32px"}}>
            {field("Name of use case",
              <input value={intake.name} onChange={e=>setIntake({...intake,name:e.target.value})} placeholder="e.g. AI-powered customer service triage" style={inputStyle}/>)}
            {field("Business unit",
              <input value={intake.dept} onChange={e=>setIntake({...intake,dept:e.target.value})} placeholder="e.g. Customer Support" style={inputStyle}/>)}
            {field("Submitted by",
              <input value={intake.submittedBy} onChange={e=>setIntake({...intake,submittedBy:e.target.value})} placeholder="Your name and title" style={inputStyle}/>)}
            {field("AI system",
              <select value={intake.system} onChange={e=>setIntake({...intake,system:e.target.value})} style={inputStyle}>
                {["GPT-4 Enterprise","Claude 3.5 Sonnet","Claude Opus 4","Gemini 1.5 Pro","AWS Bedrock","Azure OpenAI","Internal model","Other"].map(s=><option key={s}>{s}</option>)}
              </select>
            )}
            {field("Data classification",
              <select value={intake.dataClass} onChange={e=>setIntake({...intake,dataClass:e.target.value})} style={inputStyle}>
                {["Public","Internal","Confidential","Restricted"].map(s=><option key={s}>{s}</option>)}
              </select>,
              "Higher classifications trigger stricter controls."
            )}
            {field("Decision impact",
              <select value={intake.decisionImpact} onChange={e=>setIntake({...intake,decisionImpact:e.target.value})} style={inputStyle}>
                {["Advisory","Automated"].map(s=><option key={s}>{s}</option>)}
              </select>,
              "Automated decisioning typically triggers EU AI Act high-risk classification."
            )}
            {field("Affected users (estimate)",
              <input type="number" value={intake.affectedUsers} onChange={e=>setIntake({...intake,affectedUsers:e.target.value})} placeholder="e.g. 240" style={inputStyle}/>)}
            {field("Description",
              <textarea value={intake.desc} onChange={e=>setIntake({...intake,desc:e.target.value})} rows={4} placeholder="What does this AI system do? What problem does it solve?" style={{...inputStyle,resize:"vertical",fontFamily:fSans}}/>)}

            <div style={{display:"flex",gap:10,marginTop:24}}>
              <button onClick={submitIntake} disabled={!intake.name||!intake.dept||submittingIntake} style={{
                background:K_.gold,color:K_.goldText,
                border:"none",borderRadius:100,padding:"12px 24px",
                fontSize:13,fontWeight:700,cursor:(intake.name&&intake.dept&&!submittingIntake)?"pointer":"not-allowed",
                opacity:(intake.name&&intake.dept&&!submittingIntake)?1:0.5,
                fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:8,
              }}>
                <span>{submittingIntake?"⋯":"✦"}</span> {submittingIntake?"Submitting…":"Submit for review"}
              </button>
              <button onClick={()=>setView("inventory")} disabled={submittingIntake} style={{
                background:"transparent",color:K_.ink2,
                border:`1px solid ${K_.line}`,borderRadius:100,
                padding:"12px 24px",fontSize:13,fontWeight:600,cursor:submittingIntake?"not-allowed":"pointer",fontFamily:fSans,
                opacity:submittingIntake?0.5:1,
              }}>Cancel</button>
            </div>
          </div>

          {/* Live preview */}
          <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"28px 30px",alignSelf:"start",position:"sticky",top:74}}>
            <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:18}}>Live classification</div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,color:K_.ink2,marginBottom:8}}>EU AI Act tier</div>
              <div style={{display:"inline-block",background:tierColor(tierPreview)+"18",color:tierColor(tierPreview),border:`1px solid ${tierColor(tierPreview)}40`,borderRadius:100,padding:"5px 14px",fontSize:13,fontWeight:600,fontFamily:fSans}}>{tierPreview}</div>
            </div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,color:K_.ink2,marginBottom:8}}>Will route to</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["CAIO","CISO","CDPO"].map(r=>(
                  <span key={r} style={{display:"inline-block",background:K_.navy+"12",color:K_.navy,border:`1px solid ${K_.navy}24`,borderRadius:100,padding:"4px 10px",fontSize:11,fontWeight:600,fontFamily:fSans}}>{r}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,color:K_.ink2,marginBottom:8}}>Likely ISO 42001 controls</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(tierPreview==="High-Risk" ? ["6.1.2","8.2","8.3","8.4","9.2","9.3"] : ["6.1.2","8.2","8.4"]).map(c=>(
                  <span key={c} style={{background:K_.bg,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:6,padding:"3px 8px",fontSize:11,fontFamily:fMono,letterSpacing:"0.02em"}}>§ {c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  /* ════════ DETAIL VIEW (with decision ledger) ════════ */
  const DetailView = () => {
    if(!sel) return null;
    const ROLE_LABELS = {caio:"CAIO · AI Officer", ciso:"CISO · Security", cdpo:"CDPO · Privacy"};
    return (
      <>
        <div style={{
          background:`linear-gradient(135deg, ${K_.navy} 0%, ${K_.navy2} 100%)`,
          borderRadius:20,padding:"28px 32px 32px",marginBottom:14,position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,opacity:0.4,backgroundImage:`radial-gradient(${K_.navyT3} 1px, transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setView("inventory")} style={{
              background:"none",border:"none",color:K_.navyT2,
              fontSize:11,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",
              cursor:"pointer",padding:0,marginBottom:18,fontWeight:500,
            }}>← Back to inventory</button>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{background:K_.gold,color:K_.goldText,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:700,fontFamily:fMono,letterSpacing:"0.06em"}}>{sel.id.toUpperCase()}</span>
              <span style={{background:tierColor(sel.tier)+"30",color:K_.navyT,border:`1px solid ${tierColor(sel.tier)}80`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600,fontFamily:fSans}}>EU AI Act · {sel.tier}</span>
              <span style={{background:"rgba(255,255,255,0.10)",color:K_.navyT,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:500,fontFamily:fSans}}>{sel.pipelineStage}</span>
            </div>
            <h1 style={{fontFamily:fSerif,fontWeight:400,fontSize:"clamp(28px,3.4vw,42px)",lineHeight:1.05,letterSpacing:"-0.025em",color:K_.navyT,margin:0}}>
              {sel.name}
            </h1>
            <p style={{fontSize:14,lineHeight:1.55,color:K_.navyT2,margin:"14px 0 0",maxWidth:680}}>{sel.desc}</p>
          </div>
        </div>

        {/* Facts grid */}
        <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
          <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:18}}>Facts</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:24,rowGap:22}}>
            {[
              ["Department",sel.dept],
              ["AI system",sel.system],
              ["Data class",sel.dataClass],
              ["Decision impact",sel.decisionImpact],
              ["Affected users",String(sel.affectedUsers)],
              ["Owner",sel.owner],
              ["Submitted",sel.submittedAt],
              ["Submitted by",sel.submittedBy],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
                <div style={{fontSize:14,color:K_.ink,fontWeight:500,lineHeight:1.35}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ISO 42001 controls */}
        <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
          <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>ISO 42001 controls in scope</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {sel.iso42001Controls.map(c=>(
              <span key={c} style={{background:K_.bg,color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontFamily:fMono,letterSpacing:"0.02em"}}>§ {c}</span>
            ))}
          </div>
        </div>

        {/* DECISION LEDGER — the patent-candidate */}
        <div style={{background:K_.surface,borderRadius:18,border:`1px solid ${K_.line}`,padding:"26px 30px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18}}>
            <div>
              <div style={{fontSize:10.5,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.20em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Decision ledger</div>
              <h2 style={{fontFamily:fSerif,fontStyle:"italic",fontWeight:400,fontSize:22,letterSpacing:"-0.015em",color:K_.ink,margin:0}}>Three roles, one signature trail.</h2>
            </div>
            <span style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.06em"}}>immutable · audit-ready</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {sel.decisions.map((d,i)=>{
              const isPending = d.decision === "pending";
              const rowKey = `${sel.id}-${d.role}`;
              const isDeciding = decidingRow === rowKey;
              return (
              <div key={d.role+i} style={{
                background:K_.bg, borderRadius:14,
                border:`1px solid ${decisionColor(d.decision)}30`,
                borderLeft:`4px solid ${decisionColor(d.decision)}`,
                padding:"18px 22px",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,fontWeight:700,color:K_.ink,letterSpacing:"0.01em"}}>{ROLE_LABELS[d.role]||d.role.toUpperCase()}</span>
                    <span style={{fontSize:11.5,color:decisionColor(d.decision),fontWeight:600,fontFamily:fSans}}>{decisionLabel(d.decision)}</span>
                  </div>
                  {d.timestamp && <span style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>{d.timestamp}</span>}
                </div>
                {d.reasoning ? (
                  <p style={{fontSize:13,color:K_.ink2,lineHeight:1.55,margin:"0 0 8px"}}>{d.reasoning}</p>
                ) : (
                  <p style={{fontSize:12.5,color:K_.ink3,fontStyle:"italic",margin:"0 0 8px"}}>Awaiting review.</p>
                )}
                {d.signer && <div style={{fontSize:11,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.04em"}}>signed: {d.signer}</div>}

                {/* ─── Pending decision actions ─── */}
                {isPending && !isDeciding && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px dashed ${K_.line}`,display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={()=>{setDecidingRow(rowKey);setDecisionDraft({reasoning:""});}}
                      style={{background:K_.sage,color:"#fff",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                      ✓ Approve
                    </button>
                    <button onClick={()=>{setDecidingRow(rowKey);setDecisionDraft({reasoning:"",action:"approve_with_conditions"});}}
                      style={{background:K_.amber,color:"#fff",border:"none",borderRadius:100,padding:"6px 14px",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                      ⚠ Approve with conditions
                    </button>
                    <button onClick={()=>{setDecidingRow(rowKey);setDecisionDraft({reasoning:"",action:"reject"});}}
                      style={{background:"transparent",color:K_.crit,border:`1px solid ${K_.crit}40`,borderRadius:100,padding:"6px 14px",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                      ✗ Reject
                    </button>
                    <span style={{fontSize:10.5,color:K_.ink3,fontStyle:"italic",alignSelf:"center",marginLeft:6}}>signing as {ROLE_SIGNERS[d.role]}</span>
                  </div>
                )}

                {/* ─── Decision draft form ─── */}
                {isPending && isDeciding && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px dashed ${K_.line}`}}>
                    <label style={{display:"block",fontSize:10,color:K_.ink3,fontFamily:fMono,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Reasoning (optional)</label>
                    <textarea value={decisionDraft.reasoning||""} onChange={e=>setDecisionDraft({...decisionDraft,reasoning:e.target.value})} rows={3}
                      placeholder={decisionDraft.action==="reject" ? "Why is this being rejected?" : decisionDraft.action==="approve_with_conditions" ? "List the conditions / mitigations required..." : "Note any context for the audit trail..."}
                      style={{width:"100%",padding:"10px 12px",border:`1px solid ${K_.lineH}`,borderRadius:10,fontSize:13,fontFamily:fSans,color:K_.ink,background:K_.surface,outline:"none",resize:"vertical",lineHeight:1.5,marginBottom:10}}/>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                      <button onClick={()=>{setDecidingRow(null);setDecisionDraft({});}}
                        style={{background:"transparent",color:K_.ink2,border:`1px solid ${K_.line}`,borderRadius:100,padding:"7px 14px",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:fSans}}>
                        Cancel
                      </button>
                      <button onClick={()=>decideDecision(sel, d.role, decisionDraft.action || "approve")}
                        style={{
                          background: decisionDraft.action==="reject" ? K_.crit : decisionDraft.action==="approve_with_conditions" ? K_.amber : K_.sage,
                          color:"#fff",border:"none",borderRadius:100,padding:"7px 16px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:fSans,display:"inline-flex",alignItems:"center",gap:5
                        }}>
                        {decisionDraft.action==="reject" ? "✗ Confirm reject" : decisionDraft.action==="approve_with_conditions" ? "⚠ Confirm approval w/ conditions" : "✓ Confirm approve"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  /* ════════ Render ════════ */
  return <div style={{animation:"up .35s cubic-bezier(.16,1,.3,1)",background:"transparent",fontFamily:fSans,color:K_.ink,margin:"-12px -12px",padding:"16px",minHeight:"calc(100vh - 56px)"}}>
    {view==="inventory" && <InventoryView/>}
    {view==="intake"    && <IntakeView/>}
    {view==="detail"    && <DetailView/>}
  </div>;
}


export default function VERIS() {
  const [role,setRole]=useState("caio");
  /* ─── Hash-based routing ────────────────────────────────
     URL pattern: /#/<tab>  e.g.  /#/risks, /#/annexa, /#/iso27
     - On mount: read hash and initialise tab (so a refresh on
       /#/risks stays on the Risk Register, not the dashboard).
     - On hashchange (back/forward button, manual edit, link
       click): re-read the hash and update state.
     - On setTab call: push the new hash to history — the
       hashchange listener then updates state. */
  const _readHash = () => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    const m = h.replace(/^#\/?/, "").split(/[?&]/)[0];
    return m || "home";
  };
  const [tab,_setTabState]=useState(_readHash);
  useEffect(()=>{
    const onHash=()=>_setTabState(_readHash());
    window.addEventListener("hashchange",onHash);
    return ()=>window.removeEventListener("hashchange",onHash);
  },[]);
  const setTab = useCallback((next)=>{
    if(!next) return;
    if(next === _readHash()) return;            // no-op if already there
    window.location.hash = "/" + next;          // triggers hashchange
  },[]);
  /* End hash routing ─────────────────────────────────────── */

  const [toast,setToast]=useState({msg:"",vis:false,type:"success"});
  const [hitlCount,setHitlCount]=useState(()=>HITL["caio"].length);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);

  useEffect(()=>{
    if(document.getElementById("gp-css"))return;
    const s=document.createElement("style");s.id="gp-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handler);return()=>window.removeEventListener("resize",handler);
  },[]);

  const showToast=useCallback((msg,type="success")=>{
    setToast({msg,type,vis:true});
    setTimeout(()=>setToast(t=>({...t,vis:false})),3000);
  },[]);

  const switchRole=r=>{setRole(r);setTab("home");setHitlCount(HITL[r].length);};
  const R=ROLES[role],rc=RC(role);

  return <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
    {toast.vis&&<Toast msg={toast.msg} type={toast.type}/>}
    <Sidebar tab={tab} setTab={setTab} role={role} hitlCount={hitlCount} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>

    {/* ── Persistent edge handle — always visible when drawer is closed ── */}
    <button onClick={()=>setSidebarOpen(true)} aria-label="Open menu" style={{
      position:"fixed",
      left:0, top:"50%", transform:`translateY(-50%) ${sidebarOpen?"translateX(-100%)":"translateX(0)"}`,
      width:6, height:72,
      background:"#FFFFFF",
      border:"1px solid rgba(28,27,31,0.10)",
      borderLeft:"none",
      borderRadius:"0 8px 8px 0",
      boxShadow:"3px 0 12px rgba(20,18,16,0.10)",
      padding:0, cursor:"pointer", zIndex:150,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end",
      transition:"all .25s cubic-bezier(.16,1,.3,1)",
      opacity:sidebarOpen?0:1,
      pointerEvents:sidebarOpen?"none":"auto",
    }}
    onMouseEnter={e=>{e.currentTarget.style.width="9px";e.currentTarget.style.height="84px";}}
    onMouseLeave={e=>{e.currentTarget.style.width="6px";e.currentTarget.style.height="72px";}}
    >
      <span style={{
        width:4, height:4, borderRadius:"50%",
        background:"#C9A961",
        boxShadow:"0 0 0 2px rgba(201,169,97,0.20)",
        marginBottom:10,
      }}/>
    </button>

    {/* Main */}
    <div style={{marginLeft:0,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Top bar */}
      <div style={{background:T.s1,borderBottom:`1px solid ${T.border}`,height:56,display:"flex",alignItems:"center",padding:"0 18px",position:"sticky",top:0,zIndex:100,gap:14}}>
        <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",color:T.ink2,fontSize:22,padding:"6px 8px",flexShrink:0,cursor:"pointer",lineHeight:1}}>☰</button>
        <button onClick={()=>setTab("home")} title="Home" style={{display:"flex",alignItems:"center",gap:8,flex:"0 0 auto",background:"none",border:"none",padding:"4px 6px",borderRadius:8,cursor:"pointer",transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=T.bg}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
        >
          <svg width="18" height="20" viewBox="0 0 80 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vt-left" x1="0" y1="0" x2="40" y2="86" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#5B8AF5"/><stop offset="100%" stopColor="#7B3FC8"/>
              </linearGradient>
              <linearGradient id="vt-right" x1="80" y1="0" x2="40" y2="86" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C060F0"/><stop offset="100%" stopColor="#7B2FC0"/>
              </linearGradient>
              <linearGradient id="vt-inner" x1="40" y1="20" x2="40" y2="70" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A4A6A"/><stop offset="100%" stopColor="#2E2E48"/>
              </linearGradient>
              <linearGradient id="vt-gem" x1="24" y1="0" x2="32" y2="14" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7BB8FF"/><stop offset="100%" stopColor="#3B7EF0"/>
              </linearGradient>
            </defs>
            <polygon points="0,8 18,8 40,70 22,70" fill="url(#vt-left)"/>
            <polygon points="80,8 62,8 40,70 58,70" fill="url(#vt-right)"/>
            <polygon points="18,14 28,14 40,52 52,14 62,14 40,66 18,14" fill="url(#vt-inner)"/>
            <polygon points="28,12 32,4 36,12 32,16" fill="url(#vt-gem)" opacity="0.95"/>
          </svg>
          <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,fontWeight:800,color:T.ink,letterSpacing:"0.12em",textTransform:"uppercase"}}>VerisZone</span>
        </button>
        {!isMobile&&<div style={{display:"flex",gap:3,background:T.bg,borderRadius:8,padding:3,border:`1px solid ${T.border}`}}>
          {Object.values(ROLES).map(r2=><button key={r2.id} onClick={()=>switchRole(r2.id)} style={{background:role===r2.id?RC(r2.id)+"20":"transparent",border:role===r2.id?`1px solid ${RC(r2.id)}40`:"1px solid transparent",borderRadius:6,padding:"4px 13px",color:role===r2.id?RC(r2.id):T.ink4,fontSize:11,fontWeight:700,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>)}
        </div>}
        {isMobile&&<div style={{display:"flex",gap:3,background:T.bg,borderRadius:7,padding:3,border:`1px solid ${T.border}`,flex:1}}>
          {Object.values(ROLES).map(r2=><button key={r2.id} onClick={()=>switchRole(r2.id)} style={{flex:1,background:role===r2.id?RC(r2.id)+"20":"transparent",border:role===r2.id?`1px solid ${RC(r2.id)}40`:"1px solid transparent",borderRadius:5,padding:"3px 6px",color:role===r2.id?RC(r2.id):T.ink4,fontSize:9,fontWeight:700,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>)}
        </div>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {hitlCount>0&&<button onClick={()=>setTab("hitl")} style={{display:"flex",alignItems:"center",gap:6,background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:20,padding:"4px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:10,fontWeight:700,color:T.amber,fontFamily:F.b}}>{hitlCount}</span>
          </button>}
          <div style={{width:26,height:26,borderRadius:"50%",background:rc,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:9,fontWeight:700}}>{R.initials}</span>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{flex:1,padding:"20px 16px 60px",maxWidth:1140,width:"100%",margin:"0 auto"}}>
        {tab==="home"       &&<PageHome       role={role} setTab={setTab}/>}
        {tab==="onboard"    &&<PageOnboard    role={role} showToast={showToast}/>}
        {tab==="strategy"   &&<PageStrategy   role={role}/>}
        {tab==="playbook"   &&<PagePlaybook   role={role}/>}
        {tab==="iso27" &&<PageISO27001 setTab={setTab} showToast={showToast}/>}
        {tab==="annexa" &&<PageAnnexA setTab={setTab} showToast={showToast}/>}
        {tab==="risks" &&<PageRiskRegister setTab={setTab} showToast={showToast}/>}
        {tab==="soa" &&<PageSOA setTab={setTab} showToast={showToast}/>}
        {tab==="gap" &&<PageGapAnalysis setTab={setTab} showToast={showToast}/>}
        {tab==="audit" &&<PageInternalAudit setTab={setTab} showToast={showToast}/>}
        {tab==="capa" &&<PageCAPA setTab={setTab} showToast={showToast}/>}
        {tab==="compliance" &&<PageCompliance role={role}/>}
        {tab==="checklists" &&<PageChecklists role={role} showToast={showToast}/>}
        {tab==="hitl"       &&<PageHITL       role={role} showToast={showToast} onCountChange={setHitlCount}/>}
        {tab==="aia"        &&<PageAIA        role={role}/>}
        {tab==="aira"       &&role==="caio"&&<PageAIRA/>}
        {tab==="airt"       &&role==="caio"&&<PageAIRT/>}
        {tab==="registry"   &&role==="caio"&&<PageModelRegistry setTab={setTab}/>}
        {tab==="maturity"   &&role==="caio"&&<PageMaturityRadar/>}
        {tab==="usecases"   &&role==="caio"&&<PageUseCases/>}
        {tab==="aiia"       &&<PageAIIA       role={role} setTab={setTab}/>}
        {tab==="impl"       &&<PageImpl       role={role}/>}
        {tab==="roadmap"    &&<PageRoadmap    role={role}/>}
        {tab==="templates"  &&<PageTemplates  role={role} showToast={showToast}/>}
        {tab==="evidence"   &&<PageEvidence setTab={setTab} showToast={showToast}/>}
        {tab==="reports"    &&<PageReports    role={role}/>}
      </div>
    </div>
  </div>;
}
