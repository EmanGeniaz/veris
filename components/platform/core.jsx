"use client";

import { useState, useEffect } from "react";
import { AC_PHASES, AC_RBAC, acInitiatives, KPI_INSIGHTS } from "@/lib/platform-models";

export const FEEDBACK_DIMS = [
  ["user","User feedback"],["business","Business owner"],["executive","Executive"],
  ["risk","Risk"],["operational","Operational"],["value","Value"],["adoption","Adoption"],
];
export const DEFAULT_FEEDBACK = {user:50,business:50,executive:50,risk:50,operational:50,value:50,adoption:50};
export const feedbackAvg = f => Math.round(FEEDBACK_DIMS.reduce((s,[k])=>s+(f?.[k]??50),0)/FEEDBACK_DIMS.length);
/* Recommendation: a failing risk score caps the outcome regardless of average. */
export const feedbackDecision = f => {
  const avg=feedbackAvg(f);
  if((f?.risk??50)<40) return avg>=55?"Improve":"Retire";
  return avg>=80?"Scale":avg>=64?"Continue":avg>=50?"Improve":"Retire";
};
export const decisionColorOf = (d,T) => d==="Scale"?T.green:d==="Continue"?T.blue:d==="Improve"?T.amber:T.red;

/* Evidence auto-captured from completed implementation phase artifacts. */
export const autoEvidenceFor = items => items.flatMap(i => AC_PHASES.map((p,idx)=>{
  if(idx>i.phaseIndex) return null;
  const complete = idx<i.phaseIndex;
  const done = complete ? p.deliverables.length : i.phaseArtifactsDone;
  if(done<=0) return null;
  return {
    item:`${p.name} artifact pack (${done}/${p.deliverables.length})`,
    initiative:i.name, scope:"Project", control:`${p.name} phase gate`, risk:"Lifecycle gate",
    owner:p.raci.responsible, status:complete?"Complete":"In Progress",
    approval:"Auto-captured", version:"v1", time:`Phase ${p.order}`,
  };
}).filter(Boolean));
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCheck2,
  FileSearch,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  Library,
  LineChart,
  LockKeyhole,
  Map,
  MessageSquare,
  Network,
  PlayCircle,
  RefreshCw,
  Scale,
  SearchCheck,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";

/* Section */
export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

/* Section */
export const T = {
  /* Surfaces */
  bg:      "#0F1330",   /* deep indigo base - marketing palette */
  s1:      "#151A3C",   /* primary surface */
  s2:      "#1A2048",   /* card surface */
  s3:      "#202657",   /* elevated card */
  s4:      "#252C63",   /* input/table row */
  s5:      "#2B336F",   /* hover state */
  card:    "#151A3C",
  /* Borders */
  border:  "#2A3163",   /* primary border  */
  borderB: "#363E7A",   /* medium border */
  borderC: "#454E96",   /* strong border */
  shadow:  "0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)",
  /* Typography */
  ink:     "#F1F3F9",   /* primary text  */
  ink2:    "#A8B0CC",   /* secondary text */
  ink3:    "#636B8A",   /* muted text */
  ink4:    "#3A4260",   /* very muted */
  ink5:    "#2A3163",   /* near-invisible */
/* Section */
  ceo:   "#D6A84F", ceoL:  "#211806",
  coo:   "#0EA5E9", cooL:  "#071926",
  cfo:   "#22C55E", cfoL:  "#071A0E",
  chro:  "#EC4899", chroL: "#240716",
  /* Semantic */
  red:    "#C94040", redL:   "#1A0909",
  amber:  "#C8842A", amberL: "#221408",
  green:  "#2BA86A", greenL: "#081A0F",
  blue:   "#5B7FE8", blueL:  "#0D1530",
  violet: "#7C5CDB", violetL:"#130D2E",
  teal:   "#2BA88A", tealL:  "#081C17",
};

export const DARK_T = {...T};
export const LIGHT_T = {
  bg:      "#F7F8FA",
  s1:      "#FFFFFF",
  s2:      "#FFFFFF",
  s3:      "#EEF2F7",
  s4:      "#E7ECF3",
  s5:      "#DCE4EE",
  card:    "#FFFFFF",
  border:  "#E5E7EB",
  borderB: "#D1D8E3",
  borderC: "#BFC9D7",
  shadow:  "0 1px 2px rgba(17,24,39,.04), 0 14px 34px rgba(11,78,162,.07)",
  ink:     "#111827",
  ink2:    "#374151",
  ink3:    "#6B7280",
  ink4:    "#9CA3AF",
  ink5:    "#E5E7EB",
  ceo:   "#C99A2E", ceoL:  "#FAF4E6",
  coo:   "#0B4EA2", cooL:  "#EAF2FF",
  cfo:   "#2F6F63", cfoL:  "#E7F3F0",
  chro:  "#BE185D", chroL: "#FCE7F3",
  ciso:  "#0B4EA2", cisoL: "#EAF2FF",
  caio:  "#0B4EA2", caioL: "#EAF2FF",
  cio:   "#0B4EA2", cioL:  "#EAF2FF",
  cdpo:  "#C99A2E", cdpoL: "#FAF4E6",
  cgo:   "#C99A2E", cgoL:  "#FAF4E6",
  red:    "#B42318", redL:   "#FEF3F2",
  amber:  "#C99A2E", amberL: "#FAF4E6",
  green:  "#2F6F63", greenL: "#E7F3F0",
  blue:   "#0B4EA2", blueL:  "#EAF2FF",
  violet: "#334155", violetL:"#F1F5F9",
  teal:   "#0B4EA2", tealL:  "#EAF2FF",
};

export const RC  = r => T[r]      || T.blue;
export const RCL = r => T[r+"L"]  || T.blueL;

/* Section */
export const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:15px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
body{background:${T.bg};color:${T.ink};font-family:'Manrope',sans-serif;letter-spacing:0em;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:8px;}
::-webkit-scrollbar-thumb:hover{background:${T.borderB};}
button,select,input,textarea{font-family:'Manrope',sans-serif;}
input:focus,textarea:focus,select:focus{outline:none;}
input::placeholder,textarea::placeholder{color:${T.ink4};}
select option{background:${T.s3};color:${T.ink};}
@keyframes up   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade {from{opacity:0}to{opacity:1}}
@keyframes spin {to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes vzDrift{0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.42}50%{transform:translate3d(18px,-22px,0) rotate(7deg);opacity:.72}}
@keyframes vzSweep{0%{transform:translateX(-120%) rotate(8deg);opacity:0}25%{opacity:.22}70%{opacity:.08}100%{transform:translateX(120%) rotate(8deg);opacity:0}}
@keyframes vzOrbit{to{transform:rotate(360deg)}}
@keyframes loginBrandRise{0%{opacity:0;transform:translateY(14px) scale(.96);filter:blur(4px)}70%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
@keyframes loginBrandFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes loginMarkGlow{0%,100%{filter:drop-shadow(0 18px 34px rgba(37,99,235,.16)) saturate(1.04)}50%{filter:drop-shadow(0 24px 48px rgba(201,154,46,.20)) saturate(1.14)}}
@keyframes loginTaglineReveal{0%{opacity:0;letter-spacing:.22em;transform:translateY(5px)}100%{opacity:1;letter-spacing:.08em;transform:translateY(0)}}
@keyframes loginTextBreathe{0%,100%{opacity:.72;text-shadow:0 0 0 rgba(201,154,46,0)}50%{opacity:1;text-shadow:0 0 18px rgba(201,154,46,.22)}}
@keyframes loginBrandBreathe{0%,100%{opacity:.96}50%{opacity:1}}
@keyframes aiLoginGalaxy{0%{transform:rotate(0deg) scale(.98);opacity:.52}45%{opacity:.92}100%{transform:rotate(360deg) scale(.98);opacity:.52}}
@keyframes aiLoginMilkyway{0%{stroke-dashoffset:220;opacity:.18}42%{opacity:.72}100%{stroke-dashoffset:-80;opacity:.18}}
@keyframes aiLoginSpine{0%,100%{opacity:.58;transform:scaleY(.72)}48%{opacity:1;transform:scaleY(1.05)}}
@keyframes aiLoginConvergeA{0%{opacity:.2;transform:translate(-22px,-13px) scale(.72)}34%{opacity:1;transform:translate(-5px,-4px) scale(1)}72%{opacity:.92;transform:translate(8px,2px) scale(.88)}100%{opacity:.18;transform:translate(18px,5px) scale(.68)}}
@keyframes aiLoginConvergeB{0%{opacity:.18;transform:translate(25px,15px) scale(.76)}38%{opacity:1;transform:translate(6px,4px) scale(1)}76%{opacity:.88;transform:translate(-7px,-1px) scale(.9)}100%{opacity:.16;transform:translate(-18px,-5px) scale(.68)}}
@keyframes aiLoginCore{0%,100%{transform:scale(.94);filter:drop-shadow(0 0 12px rgba(37,99,235,.48))}50%{transform:scale(1.1);filter:drop-shadow(0 0 28px rgba(201,154,46,.45))}}
@keyframes aiLoginNode{0%,100%{opacity:.66;transform:scale(.9)}50%{opacity:1;transform:scale(1.18)}}
@keyframes aiLoginDecision{0%,100%{opacity:.5;transform:translateX(0)}45%{opacity:1;transform:translateX(5px)}}
@keyframes aiLoginTitle{0%,100%{opacity:.9;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}
@keyframes aiLoginTagline{0%,100%{opacity:.72;letter-spacing:.1em}50%{opacity:1;letter-spacing:.16em}}
.ai-login-mark svg *{transform-box:fill-box}
.vz-nav-btn{position:relative;transition:background .18s ease,color .18s ease,transform .18s ease;}
.vz-nav-btn:hover{transform:translateX(2px);}
.vz-nav-btn.vz-dark:hover{background:rgba(148,163,184,.08);}
.vz-nav-btn.vz-light:hover{background:rgba(11,78,162,.06);}
.vz-nav-btn:hover .vz-nav-ico{opacity:1;}
.vz-profile-btn{transition:background .18s ease;}
.vz-profile-btn.vz-dark:hover{background:rgba(148,163,184,.08);}
.vz-profile-btn.vz-light:hover{background:rgba(11,78,162,.05);}
.vz-side-nav{scrollbar-gutter:stable;}
.vz-side-nav::-webkit-scrollbar{width:4px;}
.vz-side-nav::-webkit-scrollbar-thumb{background:rgba(99,107,138,.35);border-radius:8px;}
@keyframes vzBadgePulse{0%,100%{box-shadow:0 0 0 0 rgba(200,132,42,.45)}50%{box-shadow:0 0 0 5px rgba(200,132,42,0)}}
@keyframes vzNavIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
`;


/* Section */
export const ROLES = {
  ceo:{id:"ceo",label:"CEO",title:"Chief Executive Officer",name:"Maya Chen",initials:"MC",frameworks:["Board AI Oversight","ISO 42001","COSO ERM","Value Realization"]},
  coo:{id:"coo",label:"COO",title:"Chief Operating Officer",name:"Priya Mehta",initials:"PM",frameworks:["Operational Excellence","ISO 42001","NIST AI RMF","Change Management"]},
  cfo:{id:"cfo",label:"CFO",title:"Chief Financial Officer",name:"Elena Rossi",initials:"ER",frameworks:["ROI Governance","COSO ERM","FinOps","Audit Evidence"]},
  chro:{id:"chro",label:"CHRO",title:"Chief Human Resources Officer",name:"Hannah Lee",initials:"HL",frameworks:["Workforce Readiness","Responsible AI","Training Evidence","Change Adoption"]},
  ciso:{id:"ciso",label:"CISO",title:"Chief Information Security Officer",name:"Jordan Sinclair",initials:"JS",frameworks:["ISO 27001","NIST CSF","SOC 2","GDPR"]},
  caio:{id:"caio",label:"CAIO",title:"Chief AI Officer",name:"Aisha Patel",initials:"AP",frameworks:["ISO 42001","EU AI Act","NIST AI RMF","GDPR Art.22"]},
  cio: {id:"cio", label:"CIO", title:"Chief Information Officer",name:"Marcus Reid",initials:"MR",frameworks:["ISO 27001","NIST CSF","GDPR","SOC 2"]},
  cdpo:{id:"cdpo",label:"CDPO",title:"Chief Data Privacy Officer",name:"Niamh Lynch",initials:"NL",frameworks:["GDPR","ISO 27701","CCPA/CPRA","ePrivacy"]},
  cgo: {id:"cgo", label:"CGO", title:"Chief Compliance & Governance Officer",name:"Rafael Torres",initials:"RT",frameworks:["COBIT 5","ISO 31000","COSO ERM","GRC Integrated"]},
  employee:{id:"employee",label:"Employee",title:"Employee AI Workbench",name:"Jamie Park",initials:"JP",frameworks:["Responsible AI Use","Data Handling","Prompt Hygiene","Security Awareness"]},
  manager:{id:"manager",label:"Manager",title:"Team AI Adoption Lead",name:"Riley Chen",initials:"RC",frameworks:["Team Adoption","Responsible AI Use","Value Tracking","Change Management"]},
};
export const EXECUTIVE_ROLE_IDS = ["ceo","coo","cfo","chro"];
export const USER_PROFILES = {
  demo:{name:"Demo Center",email:"demo.center@veriszone.ai",password:"govern-with-certainty",role:"Demo Center",title:"Sales Demo Workspace",department:"Solution Engineering",organization:"VerisZone Demo Center",phone:"+1 415 555 0199",region:"Global",timezone:"UTC",manager:"Revenue and Product Leadership",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 15:30"},
  ceo:{name:"Maya Chen",email:"maya.chen@veriszone.ai",password:"VerisZone-CEO-2026",role:"CEO",title:"Chief Executive Officer",department:"Executive Office",organization:"VerisZone Executive Committee",phone:"+1 415 555 0188",region:"Global",timezone:"America/New_York",manager:"Board of Directors",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 08:15"},
  coo:{name:"Priya Mehta",email:"priya.mehta@veriszone.ai",password:"VerisZone-COO-2026",role:"COO",title:"Chief Operating Officer",department:"Enterprise Operations",organization:"VerisZone Operating Office",phone:"+1 415 555 0144",region:"Global",timezone:"America/Los_Angeles",manager:"Executive Committee",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 08:31"},
  cfo:{name:"Elena Rossi",email:"elena.rossi@veriszone.ai",password:"VerisZone-CFO-2026",role:"CFO",title:"Chief Financial Officer",department:"Finance and Value Realization",organization:"VerisZone Finance Office",phone:"+39 02 555 0162",region:"EU / US",timezone:"Europe/Rome",manager:"Audit and Finance Committee",ssoStatus:"Ready",evidenceRetention:"10 years",lastLogin:"2026-06-19 09:18"},
  chro:{name:"Hannah Lee",email:"hannah.lee@veriszone.ai",password:"VerisZone-CHRO-2026",role:"CHRO",title:"Chief Human Resources Officer",department:"People and Transformation",organization:"VerisZone People Office",phone:"+1 415 555 0137",region:"Global",timezone:"America/Los_Angeles",manager:"Executive Committee",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 09:27"},
  ciso:{name:"Jordan Sinclair",email:"jordan.sinclair@veriszone.ai",password:"VerisZone-CISO-2026",role:"CISO",title:"Chief Information Security Officer",department:"Security Governance",organization:"VerisZone Global Trust Office",phone:"+1 415 555 0101",region:"US / EU",timezone:"America/New_York",manager:"Enterprise Risk Committee",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 09:05"},
  caio:{name:"Aisha Patel",email:"aisha.patel@veriszone.ai",password:"VerisZone-CAIO-2026",role:"CAIO",title:"Chief AI Officer",department:"AI Governance",organization:"VerisZone Global AI Office",phone:"+1 415 555 0128",region:"US / EU",timezone:"America/Los_Angeles",manager:"Board AI Risk Committee",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 09:42"},
  cio:{name:"Marcus Reid",email:"marcus.reid@veriszone.ai",password:"VerisZone-CIO-2026",role:"CIO",title:"Chief Information Officer",department:"Enterprise Technology",organization:"VerisZone Digital Platforms",phone:"+44 20 7946 0184",region:"UK / EU",timezone:"Europe/London",manager:"Executive Technology Council",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 08:50"},
  cdpo:{name:"Niamh Lynch",email:"niamh.lynch@veriszone.ai",password:"VerisZone-CDPO-2026",role:"CDPO",title:"Chief Data Privacy Officer",department:"Privacy and Data Protection",organization:"VerisZone Privacy Office",phone:"+353 1 555 0198",region:"EU",timezone:"Europe/Dublin",manager:"Data Protection Board",ssoStatus:"Ready",evidenceRetention:"10 years",lastLogin:"2026-06-19 10:11"},
  cgo:{name:"Rafael Torres",email:"rafael.torres@veriszone.ai",password:"VerisZone-CGO-2026",role:"CGO",title:"Chief Governance Officer",department:"Governance, Risk and Compliance",organization:"VerisZone Governance Office",phone:"+1 212 555 0176",region:"US / LATAM",timezone:"America/New_York",manager:"Audit and Risk Committee",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 07:38"},
  aicentral:{name:"AI Central",email:"ai.central@veriszone.ai",password:"govern-with-certainty",role:"AI Central",title:"Execution and Assurance Workspace",department:"AI Central Operations",organization:"VerisZone AI Operating Center",phone:"+1 415 555 0150",region:"Global",timezone:"UTC",manager:"AI Transformation Office",ssoStatus:"Ready",evidenceRetention:"7 years",lastLogin:"2026-06-19 15:40"},
  employee:{name:"Jamie Park",email:"jamie.park@veriszone.ai",password:"govern-with-certainty",role:"Employee",title:"Product Engineer",department:"Engineering",organization:"VerisZone Enterprise",phone:"+1 415 555 0171",region:"US",timezone:"America/Los_Angeles",manager:"Riley Chen",ssoStatus:"Ready",evidenceRetention:"90 days",lastLogin:"2026-07-21 09:10"},
  manager:{name:"Riley Chen",email:"riley.chen@veriszone.ai",password:"govern-with-certainty",role:"Manager",title:"Engineering Manager",department:"Engineering",organization:"VerisZone Enterprise",phone:"+1 415 555 0164",region:"US",timezone:"America/Los_Angeles",manager:"Priya Mehta",ssoStatus:"Ready",evidenceRetention:"90 days",lastLogin:"2026-07-21 08:45"},
};

/* Section */
export const NAV = [
  {id:"home",      icon:"D", label:"Dashboard"},
  {id:"onboard",   icon:"S", label:"Start Here"},
  {id:"intake",    icon:"I", label:"AI Opportunity Intake"},
  {id:"strategy",  icon:"G", label:"Strategy"},
  {id:"playbook",  icon:"P", label:"Playbook"},
  {id:"academy",   icon:"V", label:"Governance Academy"},
  {id:"compliance",icon:"C", label:"Compliance & Standards"},
  {id:"checklists",icon:"I", label:"ISO Checklists"},
  {id:"hitl",      icon:"H", label:"HITL Queue"},
  {id:"aia",       icon:"A", label:"AI Impact (AIA)"},
  {id:"aiia",      icon:"R", label:"Impact Assessment (AIIA)"},
  {id:"impl",      icon:"M", label:"ISO 42001 Implementation"},
  {id:"roadmap",   icon:"R", label:"Roadmap"},
  {id:"templates", icon:"T", label:"Templates"},
  {id:"iso27001",  icon:"S", label:"ISO 27001 Workspace"},
  {id:"scope",     icon:"O", label:"ISMS Scope Builder"},
  {id:"controls",  icon:"L", label:"Common Control Library"},
  {id:"trustcenter",icon:"T",label:"Trust Center"},
  {id:"gapanalysis",icon:"G",label:"Gap Analysis"},
  {id:"servicenow",icon:"N", label:"ServiceNow / CRM"},
  {id:"aigov",     icon:"V", label:"AI Governance Cube"},
  {id:"riskcenter",icon:"R", label:"Risk Center"},
  {id:"reports",   icon:"B", label:"Reports"},
  {id:"aicentral", icon:"V", label:"AI Central"},
  {id:"workbench", icon:"W", label:"AI Workbench"},
  {id:"myideas",   icon:"I", label:"My AI Ideas"},
  {id:"aiusage",   icon:"U", label:"My AI Dashboard"},
  {id:"decisions", icon:"D", label:"Decisions"},
  {id:"knowledge", icon:"K", label:"Knowledge"},
];

export const CAIO_EXTRA_NAV = [
  {id:"registry",icon:"M", label:"AI Model Registry"},
  {id:"maturity",icon:"S", label:"Governance Maturity"},
  {id:"usecases",icon:"U", label:"Use Case Pipeline"},
];

/* FINAL platform sidebar - seven surfaces, nothing else. Every other
   page is a contextual destination underneath one of these owners. */
export const PLATFORM_NAV_SECTIONS = [
  {title:"Platform", items:["home","aicentral","playbook","compliance","riskcenter","reports","academy"]},
];

/* Which surface owns each contextual page - keeps the owning sidebar
   item highlighted while the user drills into contextual destinations. */
export const OWNER_SURFACE = {
  onboard:"aicentral", intake:"aicentral", strategy:"aicentral", roadmap:"aicentral",
  registry:"aicentral", maturity:"aicentral", usecases:"aicentral", servicenow:"aicentral",
  aia:"riskcenter", aiia:"riskcenter",
  checklists:"playbook", impl:"compliance", templates:"playbook", iso27001:"compliance",
  scope:"compliance", controls:"compliance", trustcenter:"compliance", gapanalysis:"compliance",
  aigov:"compliance", knowledge:"compliance",
  aira:"riskcenter", airt:"riskcenter",
  hitl:"home", decisions:"home",
};

export const EMPLOYEE_NAV_SECTIONS = [
  {title:"AI Workbench", items:["workbench","myideas","aiusage"]},
];

export const AI_CENTRAL_NAV = [
  {id:"dashboard", label:"Dashboard", sub:"Executive intelligence"},
  {id:"initiatives", label:"AI Initiatives", sub:"Lifecycle and delivery"},
  {id:"governance", label:"AI Governance", sub:"Controls and compliance"},
  {id:"evidence", label:"Trust & Evidence", sub:"Enterprise evidence"},
  {id:"portfolio", label:"Portfolio", sub:"Models, maturity, use cases"},
  {id:"gateway", label:"AI Gateway", sub:"Enterprise control plane"},
  {id:"admin", label:"Administration", sub:"Providers, routing, policies"},
  {id:"academy", label:"Governance Academy", sub:"Readiness and learning"},
];

/* Pre-consolidation view ids still reachable via old URLs/hashes */
export const AC_LEGACY_VIEWS = {
  registry:"initiatives", pilot:"initiatives", detail:"initiatives", lifecycle:"initiatives",
  dna:"initiatives", scalegate:"initiatives",
  guardrails:"governance", controlmatrix:"governance", riskdrift:"governance", spine:"governance",
  cxo:"dashboard", value:"dashboard", maturitymap:"dashboard",
  evidenceconfidence:"evidence",
};

export const acAccessFor = role => AC_RBAC[role] || AC_RBAC.caio;

/* Governed lifecycle: initiatives are planned, delivered, then a control-plane
   decision scales or retires them. Retirement is never a free jump - it is a
   justified governance decision. */
export const LIFECYCLE_BANDS = [
  {band:"Plan",    cats:["New Ideas","Assessment","Approved"]},
  {band:"Deliver", cats:["Implementation","Pilot","Production"]},
  {band:"Decide",  cats:["Scaling","Completed","Retired"]},
];
export const LIFECYCLE_ORDER = ["New Ideas","Assessment","Approved","Implementation","Pilot","Production","Scaling","Completed","Retired"];
export const TERMINAL_LIFECYCLE = new Set(["Scaling","Completed","Retired"]);
/* An AI initiative / agent / AIMS is retired only for a governed reason. */
export const RETIREMENT_REASONS = [
  "Non-performing model",
  "Inefficient / low business value",
  "Vision cancelled or deprioritised",
  "Superseded by a newer initiative",
  "Unacceptable risk or compliance exposure",
  "Data source or vendor no longer viable",
];

export const AI_GOLD = "#D6A84F";
export const AI_GOLD_L = "#211806";
export const AI_GOLD_B = "#6F5420";

export const AI_ROLLOUT_PROGRAMS = [
  {id:"rollout-001",name:"Customer Resolution Copilot",pilot:"Customer Operations",next:"Retail Banking",owner:"CAIO",stage:"Pilot Running",decision:"Hold",readiness:76,riskDrift:"+6",evidence:82,adoption:64,value:"$1.2M",blocker:"CISO prompt-injection evidence due"},
  {id:"rollout-002",name:"Finance Close Automation",pilot:"Finance",next:"Procurement",owner:"CIO",stage:"Scale Gate",decision:"Scale",readiness:88,riskDrift:"-3",evidence:91,adoption:79,value:"$1.8M",blocker:"Board pack ready"},
  {id:"rollout-003",name:"Credit Decision Assurance",pilot:"Retail Banking",next:"SME Lending",owner:"CDPO",stage:"Remediate",decision:"Remediate",readiness:61,riskDrift:"+14",evidence:68,adoption:42,value:"$0.4M",blocker:"DPIA and bias test incomplete"},
  {id:"rollout-004",name:"Workforce Skills Navigator",pilot:"People",next:"Operations",owner:"CGO",stage:"CXO Review",decision:"Stop",readiness:54,riskDrift:"+18",evidence:58,adoption:31,value:"$0.2M",blocker:"Risk appetite exceeded"},
];

export const AI_SPINE_SIGNALS = [
  {label:"AI Spine Readiness",value:"72%",sub:"Pilot-to-scale composite",color:AI_GOLD},
  {label:"Evidence Confidence",value:"81%",sub:"Audit proof quality",color:T.blue},
  {label:"Risk Drift Alerts",value:"3",sub:"Above approved appetite",color:T.red},
  {label:"Scale Gates Pending",value:"4",sub:"CXO decisions required",color:T.amber},
];

/* Section */
export const ISO42001_CHECKLIST = [
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
    {id:"6_1_3", text:"Risk scoring methodology (likelihood x severity)", done:false},
    {id:"6_1_4", text:"Risk treatment options selected (avoid, reduce, transfer, accept)", done:false},
    {id:"6_1_5", text:"Opportunities for responsible AI identified and planned for", done:false},
  ]},
  {clause:"6.2", title:"AI Objectives& Planning", items:[
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

export const ISO27001_CHECKLIST = [
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

export const GDPR_CHECKLIST = [
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

export const CHECKLISTS_MAP = {
  caio: [{key:"iso42001", label:"ISO 42001 AIMS", data:ISO42001_CHECKLIST}],
  ciso: [{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST}],
  cio:  [{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST}],
  cdpo: [{key:"gdpr", label:"GDPR", data:GDPR_CHECKLIST}],
  cgo:  [{key:"iso42001", label:"ISO 42001 AIMS", data:ISO42001_CHECKLIST},{key:"iso27001", label:"ISO 27001", data:ISO27001_CHECKLIST},{key:"gdpr", label:"GDPR", data:GDPR_CHECKLIST}],
};

/* Section */
export const PLAYBOOK = {
  caio:[
    {id:1,title:"LLM v2 Production Deployment",priority:"Critical",status:"Awaiting Approval",due:"May 10",fw:"EU AI Act Art.6",owner:"You (CAIO)",collab:"CISO, Legal, Engineering",hitl:true,desc:"Customer-facing LLM for support automation. High-Risk under EU AI Act Art.6. Bias assessment passed (95.2% fairness). Transparency docs 80% complete."},
    {id:2,title:"EU AI Act Art.9 Risk Management System",priority:"Critical",status:"In Progress",due:"May 30",fw:"EU AI Act",owner:"You (CAIO)",collab:"GRC, Legal",hitl:false,desc:"Mandatory risk management system for all High-Risk AI systems. Requires ISO 42001 Clause 8.2/8.3 alignment and documented treatment plans."},
    {id:3,title:"AI Model Inventory ",priority:"High",status:"In Progress",due:"May 25",fw:"ISO 42001 C.8.4",owner:"AI Governance Lead",collab:"You (CAIO), All BUs",hitl:false,desc:"17 production models. 3 unclassified under EU AI Act risk tiers. ISO 42001 Clause 8.4 requires all system objectives documented before deployment."},
    {id:4,title:"Model Card Documentation Suite",priority:"Medium",status:"In Progress",due:"Jun 5",fw:"ISO 42001",owner:"ML Engineering",collab:"You (CAIO), Product",hitl:false,desc:"Standardised model cards for all 17 production models per ISO 42001 Annex A data documentation requirements. 7 of 17 complete."},
    {id:5,title:"AI Transparency Report Q2 2026",priority:"High",status:"Scheduled",due:"Jun 30",fw:"EU AI Act Art.13",owner:"You (CAIO)",collab:"Comms, Legal",hitl:true,desc:"Mandatory public transparency report per EU AI Act Art.13. Covers AI systems in use, training data sources, human oversight mechanisms, known limitations."},
  ],
  ciso:[
    {id:1,title:"GDPR Art.35 DPIA ",priority:"Critical",status:"Overdue",due:"May 2",fw:"GDPR Art.35",owner:"You (CISO)",collab:"DPO, Legal",hitl:true,desc:"Processing >10,000 EU data subjects with behavioural profiling. Active GDPR violation."},
    {id:2,title:"ISO 27001 Annex A.8.2 Gap Remediation",priority:"High",status:"In Progress",due:"May 20",fw:"ISO 27001 A.8",owner:"GRC Manager",collab:"You (CISO), IT Ops",hitl:false,desc:"143 assets pending classification."},
    {id:3,title:"Vendor Security Assessment ",priority:"High",status:"In Progress",due:"May 9",fw:"SOC 2",owner:"You (CISO)",collab:"Legal, Procurement",hitl:false,desc:"Quarterly security review of payment processor. Reviewing SOC 2 Type II report, penetration test results, and contractual obligations."},
    {id:4,title:"Incident Response Playbook v3",priority:"Medium",status:"In Review",due:"May 15",fw:"NIST CSF",owner:"SecOps Lead",collab:"You (CISO), Legal",hitl:true,desc:"Annual update incorporating Q1 incident lessons. Adds ransomware scenario and updated escalation chains. All reviews complete."},
    {id:5,title:"Zero Trust Architecture Phase 2",priority:"High",status:"Scheduled",due:"May 28",fw:"NIST CSF",owner:"IT Architect",collab:"You (CISO), CIO",hitl:false,desc:"Microsegmentation and identity verification across all cloud workloads. 847 endpoints in scope. CIO co-owns budget approved.sign-off."},
  ],
  cio:[
    {id:1,title:"EU Data Residency Remediation ",priority:"Critical",status:"Overdue",due:"May 1",fw:"GDPR Art.46",owner:"Cloud Architect",collab:"You (CIO), CISO",hitl:true,desc:"3 S3 buckets storing EU PII in us-east-1. No transfer mechanism in place."},
    {id:2,title:"Zero Trust Phase 2",priority:"Critical",status:"Awaiting Approval",due:"May 8",fw:"NIST CSF",owner:"You (CIO)",collab:"CISO, IT Ops",hitl:true,desc:"847 endpoints. $340k pre-approved. CISO approved security architecture. Implementation window closes May 15 for Q3 audit readiness."},
    {id:3,title:"FY25 IT Strategic Roadmap Review",priority:"High",status:"In Progress",due:"May 20",fw:"Internal",owner:"You (CIO)",collab:"CFO, All VPs",hitl:false,desc:"5 of 34 initiatives at risk. Cloud migration and AI infrastructure budget approved.lines need executive discussion before Q3 commitment."},
    {id:4,title:"Vendor Contract Renewal ",priority:"High",status:"Overdue",due:"Apr 30",fw:"SOC 2",owner:"Procurement",collab:"You (CIO), Finance",hitl:false,desc:"$1.2M ACV 3-year renewal. Legal reviewing updated DPA. Security questionnaire submitted. Operating on expired contract."},
    {id:5,title:"Disaster Recovery Test Q2",priority:"Medium",status:"Scheduled",due:"Jun 15",fw:"ISO 27001 A.17",owner:"IT Ops Lead",collab:"You (CIO), CISO",hitl:false,desc:"Full failover across 3 regions. RTO target: 4 hours. Last test: 6.5 hours."},
  ],
  cdpo:[
    {id:1,title:"GDPR Art.35 DPIA ",priority:"Critical",status:"Overdue",due:"May 2",fw:"GDPR Art.35",owner:"You (CDPO)",collab:"CISO, Legal",hitl:true,desc:"Platform live without DPIA. Processing >10k EU data subjects via behavioural profiling. Active Art.35 violation "},
    {id:2,title:"Data Processing Register Audit",priority:"High",status:"In Progress",due:"May 20",fw:"GDPR Art.30",owner:"You (CDPO)",collab:"All Dept Heads",hitl:false,desc:"143 processing activities. 12 have no confirmed lawful basis under Art.6. Full audit and BU sign-off required before next DPA enquiry window."},
    {id:3,title:"DSR Queue ",priority:"Critical",status:"Urgent",due:"Various",fw:"GDPR Art.12",owner:"You (CDPO)",collab:"Legal, IT Ops",hitl:false,desc:"4 data subject access requests approaching 30-day GDPR deadline. Two require manual extraction from legacy CRM "},
    {id:4,title:"US Vendor SCC Review",priority:"High",status:"In Progress",due:"May 30",fw:"GDPR Art.46",owner:"Privacy Team",collab:"You (CDPO), Legal",hitl:true,desc:"8 US vendors processing EU personal data. Post-Schrems II SCCs required. 3 TIAs complete. 5 pending."},
    {id:5,title:"Privacy by Design ",priority:"Medium",status:"Scheduled",due:"Jun 10",fw:"GDPR Art.25",owner:"You (CDPO)",collab:"Product, Engineering",hitl:false,desc:"Mandatory PbD review for Q3 product feature. Checklist must be signed off before design approval. ISO 27701 alignment required."},
  ],
  cgo:[
    {id:1,title:"Enterprise GRC Framework Rollout",priority:"Critical",status:"In Progress",due:"May 31",fw:"COBIT 5 / COSO ERM",owner:"You (CGO)",collab:"CISO, CAIO, CIO, CDPO",hitl:true,desc:"Deploying unified GRC framework across all five governance domains. COBIT 5 process model mapped to enterprise risk appetite. Cross-functional sign-off required from all role leads."},
    {id:2,title:"Board Governance Report ",priority:"Critical",status:"Awaiting Approval",due:"May 15",fw:"COSO ERM",owner:"You (CGO)",collab:"CEO, CFO, All C-Suite",hitl:true,desc:"Quarterly board-level governance report consolidating enterprise risk score, regulatory compliance posture, AI governance maturity, and privacy risk. Requires CGO sign-off before board submission."},
    {id:3,title:"Regulatory Change Management ",priority:"High",status:"In Progress",due:"Jun 30",fw:"EU AI Act / ISO 42001",owner:"You (CGO)",collab:"CAIO, Legal, GRC Team",hitl:false,desc:"Monitoring and operationalising EU AI Act enforcement changes (August 2026). Coordinating impact assessment across CAIO, CISO, and CDPO. Gap analysis in progress."},
    {id:4,title:"Enterprise Risk Register ",priority:"High",status:"In Progress",due:"May 25",fw:"ISO 31000",owner:"Risk Manager",collab:"You (CGO), All Leads",hitl:false,desc:"Annual refresh of the enterprise risk register per ISO 31000. 47 risks under review. 8 new AI-related risks added. CGO owns sign-off and board presentation."},
    {id:5,title:"Third-Party Governance Programme",priority:"Medium",status:"Scheduled",due:"Jun 20",fw:"COBIT 5 / ISO 31000",owner:"You (CGO)",collab:"CISO, Procurement, Legal",hitl:false,desc:"Establishing enterprise-wide third-party risk governance programme. Vendor tiering, due diligence standards, and ongoing monitoring framework. Aligns all domain-specific vendor risk activities."},
  ],
};

/* Section */
export const HITL = {
  caio:[
    {id:"hc1",title:"LLM v2 ",risk:"Critical",conf:87,time:"Go-live in 6 days",clause:"ISO 42001 C.8.5 / EU AI Act Art.6",reasoning:"High-Risk classification under EU AI Act Art.6confirmed. Bias assessment passed ",action:"Approve conditional deployment with real-time bias monitoring and 30-day CAIO review checkpoint"},
    {id:"hc2",title:"AI Transparency Report Q1 ",risk:"High",conf:82,time:"Pending 1 day",clause:"EU AI Act Art.13",reasoning:"Report reviewed by Legal and Comms. EU AI Act Art.13 disclosures verified for 14/17 systems. One training data source flag requires CAIO judgment: publicly-scraped web data ",action:"Review training data disclosure options and approve publication with chosen approach"},
  ],
  ciso:[
    {id:"hs1",title:"GDPR Art.35 DPIA ",risk:"Critical",conf:97,time:"2 days overdue",clause:"GDPR Art.35 / ISO 27001 A.18",reasoning:"Processing >10k EU data subjects with behavioural profiling triggers mandatory DPIA under Art.35. Platform is live and processing without completed DPIA ",action:"Submit DPIA to DPO and initiate processing suspension assessment within 24 hours"},
    {id:"hs2",title:"Incident Response Playbook v3 ",risk:"Medium",conf:96,time:"Pending 3 days",clause:"NIST CSF RS.RP",reasoning:"All stakeholder reviews complete. Legal approved. SecOps signed off. AI cross-referenced against ISO 27001 Annex A controls ",action:"Approve publication and distribution to all staff and relevant third parties"},
  ],
  cio:[
    {id:"hi1",title:"Zero Trust Phase 2",risk:"Critical",conf:91,time:"Pending 4 days",clause:"NIST CSF PR.AC",reasoning:"CISO approved architecture. 847 endpoints validated. $340k pre-approved by CFO. Implementation window closes May 15. Delay risks Q3 audit readiness. NIST CSF PR.AC-1 requires CITO/CIO formal approval before deployment.",action:"Approve implementation kickoff and issue purchase order to delivery partner"},
    {id:"hi2",title:"S3 Data Residency ",risk:"Critical",conf:98,time:"Overdue 3 days",clause:"GDPR Art.46",reasoning:"3 S3 buckets confirmed storing EU PII in us-east-1 with no transfer mechanism in place. Active GDPR Art.46 violation. Legal confirmed. DataSync migration plan to eu-west-1 ready ",action:"Approve emergency migration execution "},
  ],
  cdpo:[
    {id:"hd1",title:"GDPR Art.35 DPIA ",risk:"Critical",conf:97,time:"2 days overdue",clause:"GDPR Art.35",reasoning:"Platform processes behavioural data for >10k EU subjects. Art.35 DPIA mandatory before processing begins. Platform went live without one. DPIA 90% complete. Supervisory authority notification risk increasing daily. CDPO sign-off required to submit.",action:"Sign off DPIA and instruct Legal to submit to supervisory authority within 24 hours"},
    {id:"hd2",title:"US Vendor SCCs ",risk:"High",conf:89,time:"Pending 5 days",clause:"GDPR Art.46 / Schrems II",reasoning:"8 US vendors process EU personal data. Post-Schrems II SCCs and TIAs required. 3 vendors TIA-complete ",action:"Approve SCCs for 3 validated vendors and authorise pause notices to 5 pending"},
  ],
  cgo:[
    {id:"hg1",title:"Board Governance Report Q2 ",risk:"Critical",conf:95,time:"Due in 2 days",clause:"COSO ERM / COBIT 5 ME4",reasoning:"Quarterly board pack consolidates enterprise risk score (72/100), AI governance maturity (69%), privacy compliance (78%), and cybersecurity posture (72%). All contributing leads have submitted their sections. Legal reviewed. CGO sign-off is the final gate.before CEO submission to the Board.",action:"Approve Q2 Board Governance Report and release to CEO for board submission"},
    {id:"hg2",title:"EU AI Act Gap ",risk:"High",conf:88,time:"Pending 3 days",clause:"EU AI Act Art.9 / ISO 42001 C.6.1",reasoning:"AI scored 72% EU AI Act conformity against an August 2026 enforcement deadline. CAIO, CISO, and CDPO have each submitted gap remediation plans. AI has consolidated them into a unified cross-functional plan. CGO must approve the unified plan and assign executive accountability before execution begins.",action:"Approve unified EU AI Act remediation plan and assign executive ownership per workstream"},
  ],
};

/* Section */
export const KPI = {
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
export const ROLE_KPIS = {
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
export const DOMAIN_METRICS = {
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

export const STANDARDS_MAP = {
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



/* Section */
export const ONBOARD = {
  caio:[
    {id:1,title:"Read your AI Governance Charter",tag:"Foundation",time:"20 min",urgent:false,desc:"Your mandate under ISO 42001 covers all AI systems in development, production, pilot, and procurement. Clause 5.3 requires you to own the CAIO role formally."},
    {id:2,title:"Audit the AI Model Inventory",tag:"Critical",time:"25 min",urgent:true,desc:"17 models in production. 3 unclassified under EU AI Act risk tiers. ISO 42001 Clause 8.4 requires documented system objectives for all deployed AI."},
    {id:3,title:"Review the pending LLM v2 approval",tag:"Urgent",time:"15 min",urgent:true,desc:"Go-live in 6 days. Awaiting your HITL sign-off. EU AI Act Art.6high-risk deployment requires explicit CAIO approval before any production traffic."},
    {id:4,title:"Understand the HITL workflow",tag:"Protocol",time:"10 min",urgent:false,desc:"ISO 42001 Clause 8.1 requires operational controls for AI decisions. Every high-stakes action requires your explicit approval before VerisZone can act."},
    {id:5,title:"Schedule your EU AI Act enforcement briefing",tag:"Compliance",time:"45 min",urgent:false,desc:"August 2026 enforcement is 12 weeks away. GRC team has a 45-min brief on your personal liability obligations as CAIO under Article 9 risk management."},
  ],
  ciso:[
    {id:1,title:"Review your Security Charter",tag:"Foundation",time:"15 min",urgent:false,desc:"Understand your mandate, authority scope, and reporting lines. ISO 27001 Clause 5.3 requires formally assigned CISO role with documented authorities."},
    {id:2,title:"Check live compliance gaps",tag:"Urgent",time:"10 min",urgent:true,desc:"ISO 27001 at 65% "},
    {id:3,title:"Review the overdue DPIA",tag:"Critical",time:"10 min",urgent:true,desc:"GDPR Art.35 DPIA for the analytics platform is 2 days overdue. Active regulatory violation. Your sign-off is required in the HITL Queue."},
    {id:4,title:"Meet your security team leads",tag:"People",time:"30 min",urgent:false,desc:"Schedule intros with SecOps Lead, GRC Manager, and Legal counsel. Understand current workstreams before making changes to strategy."},
    {id:5,title:"Explore the ISO 27001 checklist",tag:"Action",time:"15 min",urgent:false,desc:"Your Checklists tab has the full ISO 27001:2022 Annex A mapped to your current compliance posture. 47 assets still unclassified under A.8.2."},
  ],
  cio:[
    {id:1,title:"Review the IT Strategic Roadmap",tag:"Strategy",time:"30 min",urgent:false,desc:"34 active initiatives. 5 at risk of slipping this quarter. Cloud migration and AI infrastructure lines need executive discussion before Q3."},
    {id:2,title:"Inspect cloud architecture",tag:"Critical",time:"20 min",urgent:true,desc:"EU data residency GDPR Art.46 violation in 3 S3 buckets "},
    {id:3,title:"Check the vendor risk register",tag:"Urgent",time:"15 min",urgent:true,desc:"47 active vendors. ServiceNow contract expired "},
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
    {id:2,title:"Review the Board Governance Report",tag:"Critical",time:"25 min",urgent:true,desc:"Q2 board pack is due in 2 days and requires your sign-off. Consolidates risk scores from all 5 roles. It is awaiting your approval in the HITL Queue "},
    {id:3,title:"Assess the cross-functional GRC gaps",tag:"Urgent",time:"20 min",urgent:true,desc:"Enterprise GRC maturity is at Level 3 against a Level 4 target. Vendor risk assessments are only 61% complete. EU AI Act cross-functional remediation plan needs your approval to proceed."},
    {id:4,title:"Meet all five role leads",tag:"People",time:"60 min",urgent:false,desc:"As shared governance coordinator, schedule intro sessions with CISO, CAIO, CIO, and CDPO. Your effectiveness depends on trust and coordination across all four domains."},
    {id:5,title:"Explore the full ISO Checklists",tag:"Action",time:"20 min",urgent:false,desc:"You have access to ISO 42001, ISO 27001, and GDPR checklists simultaneously. Your oversight role means understanding compliance posture across all three frameworks."},
  ],
};

/* Section */
export const ROADMAP = {
  caio:[
    {q:"Q1 2026",st:"done",items:["AI model inventory v1","EU AI Act gap analysis","ISO 42001 scoping","AI ethics policy v1"]},
    {q:"Q2 2026",st:"active",items:["LLM v2 deployment ","EU AI Act Art.9 system ","ISO 42001 C.8.4model cards","CAIO governance framework"]},
    {q:"Q3 2026",st:"planned",items:["EU AI Act conformity assessment","ISO 42001 certification","AI transparency report Q2","Algorithmic impact assessments"]},
    {q:"Q4 2026",st:"planned",items:["AI Act compliance audit","Model risk framework v2","AI incident response plan","FY27 AI governance roadmap"]},
  ],
  ciso:[
    {q:"Q1 2026",st:"done",items:["ISO 27001 surveillance audit","Vendor risk framework v2","GDPR cookie consent","SOC 2 renewal"]},
    {q:"Q2 2026",st:"active",items:["ISO 27001 A.8.2 remediation ","GDPR DPIA programme ","Zero Trust review","Penetration test"]},
    {q:"Q3 2026",st:"planned",items:["ISO 27001 cert audit","NIST CSF uplift","Insider threat programme","Board security briefing"]},
    {q:"Q4 2026",st:"planned",items:["Annual risk assessment","Security awareness rollout","IR exercise","FY27 security budget"]},
  ],
  cio:[
    {q:"Q1 2026",st:"done",items:["Cloud architecture review","Zero Trust Phase 1","ServiceNow upgrade","Data classification"]},
    {q:"Q2 2026",st:"active",items:["Zero Trust Phase 2","EU data residency fix ","DR test","Roadmap review"]},
    {q:"Q3 2026",st:"planned",items:["Multi-cloud strategy","Vendor consolidation","Platform engineering","Digital workplace"]},
    {q:"Q4 2026",st:"planned",items:["FY27 IT budget","Technology risk review","Cloud cost optimisation","Architecture board"]},
  ],
  cdpo:[
    {q:"Q1 2026",st:"done",items:["GDPR processing register","DSR workflow","Privacy notice refresh","DPA review"]},
    {q:"Q2 2026",st:"active",items:["DPIA programme ","Register audit ","US vendor SCC review","ISO 27701 gap"]},
    {q:"Q3 2026",st:"planned",items:["ISO 27701 cert scoping","DPDP Act programme","Privacy by design rollout","CCPA update"]},
    {q:"Q4 2026",st:"planned",items:["Annual privacy review","FY27 budget","Cookie platform review","Board privacy brief"]},
  ],
  cgo:[
    {q:"Q1 2026",st:"done",items:["GRC framework scoping","Enterprise risk register v1","Board governance structure","Cross-role RACI matrix"]},
    {q:"Q2 2026",st:"active",items:["GRC framework rollout ","Board Q2 governance report ","EU AI Act cross-functional plan","Vendor risk programme design"]},
    {q:"Q3 2026",st:"planned",items:["COBIT 5 maturity assessment","ISO 31000 risk framework","Third-party governance rollout","Regulatory change mgmt. programme"]},
    {q:"Q4 2026",st:"planned",items:["Annual governance review","Board risk appetite refresh","FY27 GRC budget","Enterprise risk report"]},
  ],
};

/* Section */
export const PILLARS = {
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

Object.assign(HITL,{
  ceo:[{id:"he1",title:"Scale Customer Resolution Copilot to Retail Banking",risk:"High",conf:91,time:"Decision due in 2 days",clause:"Board AI Oversight",reasoning:"Pilot value is positive but evidence confidence remains 82%. CEO approval required because the next wave expands customer-facing AI into regulated financial operations.",action:"Approve scale with evidence condition and weekly risk-drift review"}],
  coo:[{id:"ho1",title:"Approve next rollout wave operating plan",risk:"High",conf:88,time:"Pending 4 days",clause:"Operational Change Control",reasoning:"Customer Operations pilot has adoption at 64%. COO approval required before changing service workflows in Retail Banking.",action:"Approve operating readiness plan and adoption remediation owner"}],
  cfo:[{id:"hf1",title:"Release Finance Close Automation scale budget",risk:"Medium",conf:93,time:"Pending 3 days",clause:"Investment Governance",reasoning:"Finance pilot shows $1.8M realized value against $3.1M target. CFO approval releases next-wave budget and benefit tracking controls.",action:"Approve budget release with ROI confidence threshold"}],
  chro:[{id:"hh1",title:"Approve workforce enablement plan",risk:"Medium",conf:86,time:"Pending 5 days",clause:"Workforce Readiness",reasoning:"Adoption resistance remains medium for the Workforce Skills Navigator. CHRO approval required for training, communications and role impact controls.",action:"Approve enablement plan and adoption pulse cadence"}],
});

Object.assign(KPI,{
  ceo:{compliance:84,cTrend:5,incidents:0,iTrend:0,risks:7,rTrend:-2,hitl:1,overdue:0,score:78,scoreLabel:"Scale-ready",scoreTrend:9,domainLabel:"Enterprise AI Transformation Score"},
  coo:{compliance:79,cTrend:4,incidents:1,iTrend:0,risks:10,rTrend:-1,hitl:1,overdue:1,score:73,scoreLabel:"Operationalizing",scoreTrend:6,domainLabel:"AI Operating Readiness Score"},
  cfo:{compliance:82,cTrend:3,incidents:0,iTrend:0,risks:6,rTrend:-1,hitl:1,overdue:0,score:81,scoreLabel:"Value-positive",scoreTrend:7,domainLabel:"AI Value Realization Score"},
  chro:{compliance:76,cTrend:5,incidents:0,iTrend:0,risks:8,rTrend:1,hitl:1,overdue:0,score:70,scoreLabel:"Adoption building",scoreTrend:8,domainLabel:"Workforce AI Readiness Score"},
});

Object.assign(ROLE_KPIS,{
  ceo:[{cat:"Strategy",kpi:"Enterprise AI Maturity",target:"> 85/100",threshold:"< 65",fw:"Board Oversight",status:"Alert",value:"78/100"},{cat:"Scale",kpi:"Scale Gate Approval Quality",target:"> 90%",threshold:"< 75%",fw:"AI Spine",status:"Good",value:"86%"},{cat:"Value",kpi:"AI Value Realized",target:">$10M",threshold:"< $3M",fw:"Value Governance",status:"Alert",value:"$3.6M"},{cat:"Risk",kpi:"Executive Risk Drift",target:"< 5",threshold:"> 12",fw:"COSO ERM",status:"Alert",value:"7"}],
  coo:[{cat:"Operations",kpi:"Pilot Execution Health",target:"> 85%",threshold:"< 65%",fw:"Ops Governance",status:"Alert",value:"73%"},{cat:"Adoption",kpi:"Department Adoption",target:"> 75%",threshold:"< 50%",fw:"Change Mgmt",status:"Alert",value:"64%"},{cat:"Scale",kpi:"Wave Readiness",target:"> 80%",threshold:"< 60%",fw:"AI Spine",status:"Alert",value:"76%"},{cat:"Exceptions",kpi:"Open Operational Exceptions",target:"< 3",threshold:"> 8",fw:"Ops Risk",status:"Good",value:"3"}],
  cfo:[{cat:"Finance",kpi:"ROI Confidence",target:"> 85%",threshold:"< 60%",fw:"Investment Gov.",status:"Good",value:"88%"},{cat:"Budget",kpi:"Budget Variance",target:"< 8%",threshold:"> 15%",fw:"FinOps",status:"Good",value:"6%"},{cat:"Value",kpi:"Payback Forecast",target:"< 12 mo",threshold:"> 24 mo",fw:"Value Office",status:"Alert",value:"14 mo"},{cat:"Controls",kpi:"Financial Evidence Confidence",target:"> 90%",threshold:"< 75%",fw:"Audit",status:"Good",value:"91%"}],
  chro:[{cat:"Workforce",kpi:"AI Training Completion",target:"> 85%",threshold:"< 60%",fw:"Workforce Readiness",status:"Alert",value:"68%"},{cat:"Adoption",kpi:"AI Adoption Resistance",target:"Low",threshold:"High",fw:"Change Mgmt",status:"Alert",value:"Medium"},{cat:"Impact",kpi:"Role Impact Assessments",target:"100%",threshold:"< 80%",fw:"Responsible AI",status:"Alert",value:"72%"},{cat:"Culture",kpi:"AI Literacy Pulse",target:"> 80%",threshold:"< 55%",fw:"People Analytics",status:"Good",value:"77%"}],
});

Object.assign(DOMAIN_METRICS,{
  ceo:[{label:"Scale-ready Pilots",value:2,unit:"",color:AI_GOLD,trend:1,fw:"AI Spine"},{label:"Enterprise AI Value",value:3.6,unit:"M",color:T.green,trend:8,fw:"Value"},{label:"Risk Drift Alerts",value:3,unit:"",color:T.red,trend:-1,fw:"COSO"},{label:"Evidence Confidence",value:81,unit:"%",color:T.blue,trend:4,fw:"Audit"}],
  coo:[{label:"Pilots In Flight",value:4,unit:"",color:AI_GOLD,trend:1,fw:"Ops"},{label:"Adoption Score",value:64,unit:"%",color:T.amber,trend:6,fw:"Change"},{label:"Blocked Tasks",value:3,unit:"",color:T.red,trend:-2,fw:"Execution"},{label:"Wave Readiness",value:76,unit:"%",color:T.blue,trend:5,fw:"AI Spine"}],
  cfo:[{label:"AI Portfolio Value",value:3.6,unit:"M",color:T.green,trend:9,fw:"Finance"},{label:"Budget Variance",value:6,unit:"%",color:T.green,trend:-1,fw:"FinOps"},{label:"ROI Confidence",value:88,unit:"%",color:AI_GOLD,trend:4,fw:"Value"},{label:"Unfunded Gates",value:2,unit:"",color:T.amber,trend:0,fw:"Budget"}],
  chro:[{label:"Training Completion",value:68,unit:"%",color:T.amber,trend:7,fw:"People"},{label:"Adoption Resistance",value:2,unit:"",color:T.amber,trend:-1,fw:"Change"},{label:"Role Impact Reviews",value:72,unit:"%",color:T.blue,trend:5,fw:"Responsible AI"},{label:"AI Literacy Pulse",value:77,unit:"%",color:T.green,trend:6,fw:"Workforce"}],
});

Object.assign(STANDARDS_MAP,{
  ceo:[{std:"Board AI Oversight",applies:"Executive accountability",status:"Active",score:78},{std:"COSO ERM",applies:"Enterprise risk",status:"Active",score:72},{std:"ISO 42001",applies:"AI management",status:"Active",score:58},{std:"Value Governance",applies:"Benefits tracking",status:"Building",score:74}],
  coo:[{std:"Operational Change",applies:"Rollout governance",status:"Active",score:76},{std:"ISO 42001",applies:"AI operations",status:"Active",score:58},{std:"NIST AI RMF",applies:"Operational risk",status:"Active",score:74},{std:"Adoption Governance",applies:"Change readiness",status:"Building",score:64}],
  cfo:[{std:"Investment Governance",applies:"Funding gates",status:"Active",score:82},{std:"COSO ERM",applies:"Financial risk",status:"Active",score:72},{std:"Audit Evidence",applies:"Value assurance",status:"Active",score:91},{std:"FinOps",applies:"AI spend control",status:"Building",score:78}],
  chro:[{std:"Workforce Readiness",applies:"Training and adoption",status:"Active",score:68},{std:"Responsible AI",applies:"People impact",status:"Active",score:72},{std:"Change Management",applies:"Adoption readiness",status:"Building",score:64},{std:"Training Evidence",applies:"Competence proof",status:"Active",score:77}],
});

Object.assign(ONBOARD,{
  ceo:[{id:1,title:"Review enterprise AI transformation score",tag:"Strategy",time:"20 min",urgent:false,desc:"Understand scale-ready pilots, risk drift, value realized and board-level AI maturity."},{id:2,title:"Review scale gate decisions",tag:"Critical",time:"15 min",urgent:true,desc:"Two initiatives require CEO decision before expansion to regulated departments."},{id:3,title:"Check AI value and risk balance",tag:"Board",time:"20 min",urgent:false,desc:"Compare AI portfolio value against executive risk appetite and evidence confidence."}],
  coo:[{id:1,title:"Review pilot execution health",tag:"Operations",time:"15 min",urgent:false,desc:"See active department pilots, blocked tasks and adoption readiness."},{id:2,title:"Clear rollout blockers",tag:"Urgent",time:"20 min",urgent:true,desc:"Customer Operations pilot requires operating-plan approval before next wave."},{id:3,title:"Review adoption playbook",tag:"Change",time:"20 min",urgent:false,desc:"Confirm enablement, comms and process adoption owners."}],
  cfo:[{id:1,title:"Review AI portfolio economics",tag:"Finance",time:"20 min",urgent:false,desc:"Inspect value realized, budget variance, ROI confidence and payback forecasts."},{id:2,title:"Approve funding gate",tag:"Action",time:"10 min",urgent:true,desc:"Finance Close Automation needs scale budget release for next department rollout."},{id:3,title:"Check audit evidence confidence",tag:"Assurance",time:"15 min",urgent:false,desc:"Confirm financial evidence is sufficient before scale decisions."}],
  chro:[{id:1,title:"Review workforce AI readiness",tag:"People",time:"20 min",urgent:false,desc:"Track AI literacy, training completion and adoption resistance."},{id:2,title:"Review role impact assessments",tag:"Responsible AI",time:"25 min",urgent:true,desc:"Workforce Skills Navigator needs role impact and fairness controls before pilot expansion."},{id:3,title:"Approve enablement plan",tag:"Change",time:"15 min",urgent:false,desc:"Confirm training, comms and manager enablement cadence."}],
});

Object.assign(ROADMAP,{
  ceo:[{q:"Q1 2026",st:"done",items:["AI transformation charter","Board AI oversight model","AI value baseline"]},{q:"Q2 2026",st:"active",items:["Pilot-to-scale governance","Scale gate cadence","Executive AI maturity review"]},{q:"Q3 2026",st:"planned",items:["Enterprise rollout waves","Board AI assurance pack","Value realization review"]}],
  coo:[{q:"Q1 2026",st:"done",items:["Pilot operating model","Department wave plan","Adoption baseline"]},{q:"Q2 2026",st:"active",items:["Customer Operations pilot","Retail Banking readiness","Operational exception cadence"]},{q:"Q3 2026",st:"planned",items:["Multi-department rollout","Process adoption reviews","Operating model refresh"]}],
  cfo:[{q:"Q1 2026",st:"done",items:["AI investment baseline","ROI model","Budget gate design"]},{q:"Q2 2026",st:"active",items:["Finance automation scale case","Value evidence ledger","Budget release gates"]},{q:"Q3 2026",st:"planned",items:["Portfolio value review","FY27 AI budget","Benefit realization audit"]}],
  chro:[{q:"Q1 2026",st:"done",items:["AI literacy baseline","Workforce impact model","Enablement plan"]},{q:"Q2 2026",st:"active",items:["Role impact reviews","Training completion push","Adoption resistance pulse"]},{q:"Q3 2026",st:"planned",items:["Manager enablement","AI workforce readiness pack","Skills propagation map"]}],
});

Object.assign(PILLARS,{
  ceo:[{name:"Enterprise AI Strategy",desc:"AI transformation aligned to board priorities",objs:["AI transformation thesis","Scale/no-scale authority","Board AI cadence","Enterprise maturity targets"],status:"Active"},{name:"Value and Risk Balance",desc:"Scale only when evidence proves readiness",objs:["Value realized","Risk drift appetite","Evidence confidence","Executive decision gates"],status:"Active"},{name:"Market and Operating Advantage",desc:"Turn pilots into enterprise capability",objs:["Department wave plan","Competitive advantage","Customer impact","Operating maturity"],status:"Building"}],
  coo:[{name:"Pilot Operating Model",desc:"Department-by-department AI rollout execution",objs:["Pilot workspace","Operating owner","Exception handling","Adoption cadence"],status:"Active"},{name:"Process Transformation",desc:"Operational workflows redesigned safely",objs:["Process impact","SOP updates","Control handoffs","Escalation paths"],status:"Building"},{name:"Scale Execution",desc:"Next wave readiness and inherited learning",objs:["Rollout waves","Adoption blockers","Task completion","AI Spine signals"],status:"Active"}],
  cfo:[{name:"AI Investment Governance",desc:"Funding tied to evidence and value",objs:["Business case","Budget release gates","Payback forecast","ROI confidence"],status:"Active"},{name:"Value Assurance",desc:"Benefits tracked before scale",objs:["Value ledger","Financial evidence","Audit proof","Benefit owners"],status:"Active"},{name:"Cost and Risk Control",desc:"Spend, exposure and variance managed",objs:["Budget variance","Cost drift","Risk-adjusted ROI","Portfolio funding"],status:"Building"}],
  chro:[{name:"Workforce Readiness",desc:"People prepared for AI-enabled work",objs:["Training completion","AI literacy","Manager enablement","Role readiness"],status:"Active"},{name:"Responsible Workforce AI",desc:"People impact governed before scale",objs:["Role impact assessment","Fairness review","Change risk","Employee transparency"],status:"Building"},{name:"Adoption and Culture",desc:"Sustained adoption across departments",objs:["Adoption pulse","Resistance tracking","Communications","Feedback loops"],status:"Active"}],
});

/* Section */
export const TEMPLATES = [
/* Section */
  {id:"t_rr",   name:"AI Risk Register",                cat:"Risk Management",   fw:"ISO 42001 C.8.2 / ISO 23894",    ai:true,  icon:"?", tags:["CAIO","CISO","Risk"],     desc:"Authoritative AI risk register with Likelihood x impact > 12 = High/Critical. Includes auditor cheat sheet: Static Register, Ghost Control, and Missing Treatment failures. AI pre-populates from your model inventory."},
  {id:"t_rtp",  name:"AI Risk Treatment Plan",          cat:"Risk Management",   fw:"ISO 42001 C.8.3 / Annex A",      ai:true,  icon:"?", tags:["CAIO","Risk"],            desc:"Structured treatment plan for all High/Critical risks (score >12). Covers four options: Avoid, Reduce, Transfer, Accept. Includes resource requirements, budget allocation, and Q-by-Q timeline. Links to Risk Register."},
  {id:"t_aiia", name:"AI System Impact Assessment (AIIA)", cat:"AI Governance",  fw:"ISO 42001 C.A.5 / EU AI Act",    ai:true,  icon:"?", tags:["CAIO","Legal","All"],     desc:"6-phase AIIA procedure per ISO 42001 Control A.5: Characterise the AI system, stakeholders, impact, controls, approvals, and monitoring plan."},
  {id:"t_mc",   name:"AI Model Card",                   cat:"AI Governance",     fw:"ISO 42001 C.8.4/ EU AI Act Art.13", ai:true,icon:"?", tags:["CAIO","Engineering"], desc:"Standardised model card: Intended Use (Green/Red Zones), Model Details & Architecture, Training Data, Performance Metrics, Bias Evaluation, Limitations. Based on ISO 42001 Kit template. AI populates from system name and description."},
  {id:"t_nc",   name:"Non-Conformity & Corrective Action Report", cat:"Audit",  fw:"ISO 42001 C.10.1",               ai:true,  icon:"?", tags:["CAIO","GRC","All"],      desc:"Structured NCR: Issue identification, root cause, corrective action, owner, due date, and verification evidence."},
  {id:"t_ks",   name:"AI Kill Switch & Emergency Fallback Procedure", cat:"Security", fw:"ISO 42001 C.8.5 / EU AI Act Art.9", ai:false, icon:"?", tags:["CAIO","CISO"], desc:"Emergency shutdown procedure defining: Authority, Red Lines (activation criteria), Technical Steps, Fallback to manual process, Post-incident review. Covers Generative AI, Automated Decisions, Autonomous Agents."},
  {id:"t_soa",  name:"Statement of Applicability (SoA)", cat:"AI Governance",   fw:"ISO 42001 C.8.3 / Annex A",      ai:true,  icon:"?", tags:["CAIO","GRC"],            desc:"SoA mapping all ISO 42001 Annex A controls: Applicable Y/N, Implementation Status (Implemented/Planned/Partial), Justification, and Evidence reference. AI generates from your checklist data."},
  {id:"t_bias", name:"AI Bias Detection & Mitigation Procedure", cat:"Ethics",  fw:"ISO 42001 / EU AI Act Art.10",   ai:true,  icon:"?", tags:["CAIO","Legal"],          desc:"Methodology for identifying, measuring, and mitigating algorithmic bias. Covers Protected Attributes, Disparate Impact testing, EEOC/GDPR/EU AI Act compliance. Includes bias testing schedule and fairness thresholds."},
  {id:"t_dep",  name:"AI Deployment Release Checklist", cat:"AI Governance",    fw:"ISO 42001 C.8.5 / EU AI Act",    ai:false, icon:"?", tags:["CAIO","Engineering"],   desc:"5-gate deployment checklist: Governance and documentation, risk approval, evidence review, HITL sign-off, and post-release monitoring."},
  /* CAIO Kit */
  {id:"t_raci", name:"CAIO Responsibility Mapping", cat:"Governance", fw:"ISO 42001 C.5.3",            ai:true,  icon:"?", tags:["CAIO","CGO","All"],      desc:"Cross-functional RACI for all CAIO activities: AI Strategy, Risk Management, Ethics Review, Model Deployment, Monitoring. Covers CAIO vs CTO vs CIO vs CDO vs CFO boundaries per CAIO Kit Part 1."},
  {id:"t_uc",   name:"AI Use Case Scoring (Impact and Feasibility)", cat:"Strategy", fw:"CAIO Kit Part 2",           ai:true,  icon:"?", tags:["CAIO","Product"],        desc:"9-block use case canvas: Problem, User, Data, Tech, KPI, Feasibility, Ethics, HITL requirement, ROI. Scoring grid filters vanity projects from value projects. AI scores from use case description."},
  {id:"t_poc",  name:"AI Project Planning (POC to Production)", cat:"Strategy",fw:"CAIO Kit Part 4",               ai:true,  icon:"?", tags:["CAIO","Engineering"],   desc:"Phase-based AI project plan: POC, pilot, production readiness, owners, evidence, and approval gates."},
  {id:"t_ethics",name:"AI Ethics Impact Assessment (ISO 42001)",  cat:"Ethics",  fw:"ISO 42001 / CAIO-804",          ai:true,  icon:"?", tags:["CAIO","Legal","All"],    desc:"Systematic ethical evaluation: Human Rights & Dignity, Unfair/Harmful Outcomes, Accountability & Oversight, Transparency. Aligned to ISO 42001 Annex A ethical principles and EU AI Act Art.9 requirements."},
  {id:"t_genai",name:"Responsible Use Policy",    cat:"Policy",  fw:"CAIO-814 / ISO 42001",          ai:false, icon:"?", tags:["CAIO","All Roles"],      desc:"Enforceable GenAI use policy: Permitted uses, Prohibited uses (PII input, legal advice, client-facing without review), Data classification rules, Prompt management, Incident reporting. From CAIO Kit Part 8."},
  {id:"t_kpi",  name:"AI KPI Monitoring Dashboard",               cat:"Performance",fw:"CAIO-901 / ISO 42001 C.9.1", ai:true,  icon:"?", tags:["CAIO","Board"],          desc:"Executive AI KPI dashboard: Technical model health (accuracy, drift, latency), Business value (ROI, adoption), Governance (HITL rate, audit findings), Risk (bias score, incident count). AI populates from your system data."},
  {id:"t_bvb",  name:"Build vs Buy Decision Matrix",              cat:"Strategy", fw:"CAIO-1002",                    ai:true,  icon:"?", tags:["CAIO","CIO"],             desc:"Structured framework: Strategic Fit, Technical Feasibility, Cost (TCO), Risk, Vendor Dependency, Time-to-Value. Objective scoring prevents bias toward build or buy. AI evaluates from platform requirements description."},
  {id:"t_post", name:"Post-Deployment Review Template",           cat:"AI Governance",fw:"CAIO-910 / ISO 42001 C.9.1",ai:true,icon:"?", tags:["CAIO","Engineering"],   desc:"Blameless post-deployment review: Deployment success validation, KPI performance vs plan, lessons learned, model drift assessment, and next steps (continue/retrain/decommission). Closes the POC-to-production loop."},
  /* Privacy & Security */
  {id:"t_dpia", name:"GDPR Art.35 DPIA",                          cat:"Privacy",  fw:"GDPR Art.35",                  ai:true,  icon:"?", tags:["CDPO","Legal"],          desc:"Data Protection Impact Assessment with all mandatory GDPR Art.35(7) elements. AI generates initial risk analysis from processing activity description. Includes supervisory authority submission checklist."},
  {id:"t_tia",  name:"Transfer Impact Assessment (TIA)",          cat:"Privacy",  fw:"GDPR Art.46 / Schrems II",     ai:true,  icon:"?", tags:["CDPO","Legal"],          desc:"Structured TIA for international data transfers post-Schrems II. Covers: legal basis, destination country adequacy, supplementary measures, SCCs, vendor-specific risk assessment."},
  {id:"t_board",name:"Board-Ready Governance Summary",            cat:"Executive", fw:"Multi-framework",              ai:true,  icon:"?", tags:["CGO","Board","All"],     desc:"One-page board pack insert. AI synthesises compliance scores across all 5 roles, critical risks, cross-role HITL status, and top 3 recommended actions into executive boardroom language."},
];

export const KIT_TEMPLATE_SOURCES = {
  t_rr:"CAIO-801. AI Risk Inventory Sheet",
  t_rtp:"CAIO-406. Risk Register & Contingency Plan + CAIO-801. AI Risk Inventory Sheet",
  t_aiia:"CAIO-804. AI Ethics Impact Assessment (ISO 42001 Based)",
  t_mc:"CAIO-308. AI Model Lifecycle Planning + CAIO-311. Model Requirement Validation Checklist",
  t_nc:"CAIO-810. Periodic AI Model Audit Template + CAIO-811. Risk Escalation & Incident Log",
  t_ks:"CAIO-506. Exception Handling & Human Review Ruleset",
  t_soa:"CAIO-410. Governance Model for AI Projects (Pilot vs Production)",
  t_bias:"CAIO-802. Bias & Fairness Risk Checklist",
  t_dep:"CAIO-401. AI Project Planning Template (POC -> Pilot -> Scale) + CAIO-407. POC Evaluation Checklist",
  t_raci:"CAIO Responsibility Mapping - RACI Matrix",
  t_uc:"Use Case Scoring Template (Impact - Feasibility - Risk) + AI Use Case Identification Canvas",
  t_poc:"CAIO-401. AI Project Planning Template (POC -> Pilot -> Scale)",
  t_ethics:"CAIO-804. AI Ethics Impact Assessment (ISO 42001 Based)",
  t_genai:"CAIO-814. Responsible Use Policy for Generative AI Tools",
  t_kpi:"CAIO-901. AI KPI Monitoring Dashboard",
  t_bvb:"CAIO-1002. Build vs Buy Decision Matrix",
  t_post:"CAIO-910. Post-Deployment Review Template",
  t_dpia:"CAIO-1008. Legal & Data Privacy Risk Evaluation Template",
  t_tia:"CAIO-1008. Legal & Data Privacy Risk Evaluation Template",
  t_board:"CAIO-601. AI Dashboard Design Template for Executives + AI Reporting Line & Accountability Dashboard",
};

/* Section */
export const MODEL_REGISTRY = [
  {id:"m1",name:"LLM v2 (Customer Support)",type:"Generative AI / LLM",status:"Awaiting Approval",risk:"High",euAiAct:"High-Risk",owner:"CAIO",dept:"Product",vendor:"Anthropic API",deployed:"Pending",accuracy:"95.2% fairness",drift:"Not deployed",lastAudit:"May 2026",modelCard:true,aia:true,biasTest:true,killSwitch:true,dataProvenance:false,transparency:80,clause:"EU AI Act Art.6/ ISO 42001 C.8.4"},
  {id:"m2",name:"Credit Scoring AI",type:"Predictive / Classification",status:"In Production",risk:"Critical",euAiAct:"High-Risk",owner:"CISO",dept:"Finance",vendor:"Internal",deployed:"Mar 2025",accuracy:"88.4%",drift:"Low",lastAudit:"Feb 2026",modelCard:false,aia:true,biasTest:false,killSwitch:true,dataProvenance:true,transparency:45,clause:"EU AI Act Art.6/ GDPR Art.22"},
  {id:"m3",name:"HR Recruitment AI",type:"Classification / Ranking",status:"Suspended",risk:"High",euAiAct:"High-Risk",owner:"HR / CAIO",dept:"Human Resources",vendor:"HireRight AI",deployed:"Jan 2025",accuracy:"Not tested",drift:"Unknown",lastAudit:"Apr 2026",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Annex III / ISO 42001 C.8.4"},
  {id:"m4",name:"Fraud Detection Model",type:"Anomaly Detection",status:"In Production",risk:"Medium",euAiAct:"Limited Risk",owner:"CISO",dept:"Security",vendor:"Internal",deployed:"Jun 2024",accuracy:"96.1%",drift:"Medium",lastAudit:"Jan 2026",modelCard:true,aia:true,biasTest:true,killSwitch:true,dataProvenance:false,transparency:72,clause:"ISO 42001 C.7.2 / GDPR Art.5"},
  {id:"m5",name:"Document Summarisation AI",type:"Generative AI / NLP",status:"In Production",risk:"Medium",euAiAct:"Minimal Risk",owner:"Product",dept:"Operations",vendor:"OpenAI API",deployed:"Sep 2024",accuracy:"91.3%",drift:"Low",lastAudit:"Mar 2026",modelCard:true,aia:false,biasTest:false,killSwitch:false,dataProvenance:true,transparency:85,clause:"ISO 42001 C.9.1"},
  {id:"m6",name:"Predictive Maintenance AI",type:"Predictive / Regression",status:"In Production",risk:"Medium",euAiAct:"High-Risk",owner:"Engineering",dept:"Operations",vendor:"Internal",deployed:"Nov 2024",accuracy:"89.7%",drift:"Low",lastAudit:"Apr 2026",modelCard:true,aia:false,biasTest:false,killSwitch:false,dataProvenance:true,transparency:60,clause:"EU AI Act Annex III / ISO 42001 C.8.5"},
  {id:"m7",name:"RecoEngine v3",type:"Recommendation System",status:"Unclassified",risk:"Unknown",euAiAct:"Unclassified",owner:"Product",dept:"Marketing",vendor:"Internal",deployed:"Feb 2025",accuracy:"Unknown",drift:"Unknown",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Art.6"},
  {id:"m8",name:"SentimentAI",type:"NLP / Classification",status:"Unclassified",risk:"Unknown",euAiAct:"Unclassified",owner:"Product",dept:"Marketing",vendor:"Internal",deployed:"Mar 2025",accuracy:"Unknown",drift:"Unknown",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,killSwitch:false,dataProvenance:false,transparency:0,clause:"EU AI Act Art.6"},
];

/* Section */
export const MATURITY_DOMAINS = [
  {domain:"Legal & Regulatory Compliance",score:72,target:90,desc:"Alignment with EU AI Act, ISO 42001, GDPR Art.22. 3 high-risk systems classified. 3 unclassified."},
  {domain:"Algorithmic Accountability",score:58,target:85,desc:"Bias testing complete on 2/8 high-impact systems. Model cards 7/17. Fairness score avg 89.4%."},
  {domain:"Data Sovereignty & Governance",score:65,target:80,desc:"Training data provenance documented for 76% of models. 3 datasets with PII not yet anonymised."},
  {domain:"Human Oversight & HITL",score:84,target:95,desc:"HITL override rate 3.1%. All critical decisions gated. Kill switch deployed on 4/8 high-risk systems."},
  {domain:"Transparency & Explainability",score:61,target:85,desc:"Transparency documentation 80% complete for LLM v2. 7 model cards complete. Art.13 gaps remain."},
  {domain:"Incident Response & Recovery",score:77,target:90,desc:"2 AI incidents in Q1. Mean response time 3.2 hrs vs 4hr target. Post-mortems completed."},
  {domain:"Ethics & Fairness",score:68,target:85,desc:"Ethics committee reviews 94% complete. AI Ethics Impact Assessment not yet run for 3 systems."},
  {domain:"Strategic AI Leadership",score:80,target:90,desc:"CAIO role formally established. RACI defined. Board reporting cadence active. 5-year AI strategy approved."},
];

/* Section */
export const USE_CASES = [
  {id:"uc1",name:"AI-Powered Contract Review",dept:"Legal",stage:"POC",impact:9,feasibility:7,risk:4,score:86,owner:"Legal + Engineering",eta:"Q3 2026",status:"Active",desc:"LLM-based contract analysis to extract obligations, risk clauses, and renewal dates. Estimated 60% reduction in review time."},
  {id:"uc2",name:"Predictive Churn Model",dept:"Sales",stage:"Pilot",impact:8,feasibility:8,risk:3,score:90,owner:"Data Science + Sales",eta:"Q2 2026",status:"Active",desc:"ML model predicting customer churn 90 days in advance. Pilot on 5k accounts showing 73% accuracy vs 45% baseline."},
  {id:"uc3",name:"AI Invoice Processing",dept:"Finance",stage:"Scale",impact:7,feasibility:9,risk:2,score:92,owner:"Finance + IT",eta:"Live",status:"Complete",desc:"IDP (Intelligent Document Processing) for invoice extraction. 94% straight-through processing. ROI: 4.2x annualized savings."},
  {id:"uc4",name:"HR Onboarding Automation",dept:"HR",stage:"POC",impact:6,feasibility:6,risk:5,score:62,owner:"HR + IT",eta:"Q4 2026",status:"Active",desc:"AI-guided onboarding journey. Ethics risk: employee data processing at scale. DPIA required before pilot."},
  {id:"uc5",name:"Regulatory Change Monitor",dept:"Compliance",stage:"Pilot",impact:9,feasibility:5,risk:3,score:78,owner:"CGO + Legal",eta:"Q3 2026",status:"Active",desc:"LLM monitoring regulatory feeds (EU AI Act, GDPR, FCA) for changes affecting the organisation. Alerts to CGO and CAIO."},
  {id:"uc6",name:"GenAI Code Assistant",dept:"Engineering",stage:"Scale",impact:7,feasibility:9,risk:3,score:88,owner:"Engineering",eta:"Live",status:"Complete",desc:"GitHub Copilot Enterprise deployment. 35% faster development velocity. IP and data leakage policy in place."},
];

export const GOVERNANCE_ACADEMY = [
  {id:"eu-ai-act",framework:"EU AI Act",title:"High-risk AI: what must be true before launch",duration:"06:40",level:"Executive",owner:"CAIO + Legal",roles:["ceo","caio","cio","ciso","cdpo","cgo"],outcomes:["Identify high-risk triggers","Understand Art.9 risk management","Know when scale must pause"],evidence:"Attestation, quiz score, risk-classification acknowledgement",desc:"A board-ready walkthrough of EU AI Act obligations for pilots, high-risk classification, transparency, human oversight and conformity evidence."},
  {id:"iso-42001",framework:"ISO 42001",title:"AIMS operating model for AI pilots",duration:"07:15",level:"Practitioner",owner:"CAIO + CGO",roles:["ceo","coo","caio","cio","cgo"],outcomes:["Map AIMS clauses to rollout stages","Connect policy to lifecycle gates","Prepare audit-ready management evidence"],evidence:"Completion record, policy acknowledgement, AIMS readiness note",desc:"How ISO 42001 becomes an operating system: context, leadership, planning, operational controls, monitoring and continual improvement."},
  {id:"nist-ai-rmf",framework:"NIST AI RMF",title:"Govern, Map, Measure, Manage in AI Central",duration:"05:50",level:"Operator",owner:"CAIO + CISO",roles:["coo","caio","cio","ciso","cgo"],outcomes:["Use RMF functions in pilots","Recognize risk drift signals","Translate controls into operating tasks"],evidence:"Risk drift checkpoint and guardrail acknowledgement",desc:"A practical lens for turning NIST AI RMF into repeatable risk monitoring, guardrails and evidence workflows inside AI Central."},
  {id:"gdpr-art-22",framework:"GDPR",title:"Automated decisions, DPIA and data minimisation",duration:"06:10",level:"Executive",owner:"CDPO",roles:["ceo","caio","cio","cdpo","cgo"],outcomes:["Spot Art.22 decision risk","Know when DPIA is mandatory","Define privacy evidence before pilot"],evidence:"DPIA trigger acknowledgement and privacy checklist completion",desc:"Privacy obligations for AI pilots that process personal data, affect individuals, or create automated decision-making exposure."},
  {id:"ai-spine",framework:"AI Spine",title:"Pilot-to-scale readiness: Scale, Hold, Remediate, Stop",duration:"04:45",level:"Executive",owner:"CEO + CAIO",roles:["ceo","coo","cfo","chro","caio","cgo"],outcomes:["Interpret scale gate signals","Use evidence confidence","Understand inherited learning between departments"],evidence:"Scale gate decision note and executive acknowledgement",desc:"How VerisZone turns scattered rollout signals into a controlled decision: value, adoption, risk drift, evidence confidence and maturity propagation."},
  {id:"hitl",framework:"HITL",title:"Human approvals for high-stakes AI actions",duration:"04:20",level:"Operator",owner:"COO + CAIO",roles:["coo","caio","ciso","cdpo","cgo"],outcomes:["Know which actions require approval","Capture approval evidence","Escalate exceptions cleanly"],evidence:"HITL approval simulation and sign-off record",desc:"A short operating guide to approvals, rejections, exception handling and audit trail capture for high-stakes AI workflows."},
];

export const ROLE_LEARNING_PATHS = {
  ceo:["eu-ai-act","iso-42001","ai-spine"],
  coo:["iso-42001","nist-ai-rmf","hitl","ai-spine"],
  cfo:["ai-spine","iso-42001"],
  chro:["ai-spine","hitl"],
  caio:["eu-ai-act","iso-42001","nist-ai-rmf","gdpr-art-22","ai-spine","hitl"],
  ciso:["eu-ai-act","nist-ai-rmf","hitl"],
  cio:["eu-ai-act","iso-42001","nist-ai-rmf","gdpr-art-22"],
  cdpo:["eu-ai-act","gdpr-art-22","hitl"],
  cgo:["eu-ai-act","iso-42001","nist-ai-rmf","gdpr-art-22","ai-spine","hitl"],
};

export function academyEvidenceFor(role, seeded=false) {
  const pathIds=ROLE_LEARNING_PATHS[role]||ROLE_LEARNING_PATHS.caio;
  const completed=seeded?Math.max(1,Math.floor(pathIds.length*.55)):0;
  return pathIds.slice(0,completed).map((id,idx)=>{
    const module=GOVERNANCE_ACADEMY.find(v=>v.id===id)||GOVERNANCE_ACADEMY[0];
    return {
      item:`Academy completion - ${module.framework}`,
      initiative:"Governance Learning & Enablement",
      control:`LEARN-${String(idx+1).padStart(3,"0")}`,
      risk:"Role obligation awareness",
      owner:module.owner,
      status:"Complete",
      approval:"Acknowledged",
      time:`2026-06-${String(17-idx).padStart(2,"0")} ${String(10+idx).padStart(2,"0")}:15`,
      module:module.title,
      evidence:module.evidence
    };
  });
}



/* Section */
export const F = {
  h: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  b: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  e: "DM Serif Display, Georgia, serif",
  m: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  logo: "Manrope, Inter, ui-sans-serif, system-ui, sans-serif",
};

export function cleanText(value) {
  const s=String(value ?? "");
  return s
    .replace(/[\u00c2\u00c3\u00e2\u20ac\ufffd]/g,"")
    .replace(/'{3,}/g,"")
    .replace(/\s{2,}/g," ")
    .trim();
}

export function glyphIconFor(value) {
  const v=cleanText(value).toLowerCase();
  if(v.includes("dashboard")||v.includes("command")) return LayoutDashboard;
  if(v.includes("register")) return ClipboardList;
  if(v.includes("start")||v.includes("playbook")||v.includes("runbook")) return PlayCircle;
  if(v.includes("academy")||v.includes("learning")||v.includes("video")) return PlayCircle;
  if(v.includes("strategy")||v.includes("objective")) return Target;
  if(v.includes("compliance")||v.includes("regulatory")||v.includes("legal")) return Scale;
  if(v.includes("checklist")||v.includes("approval")||v.includes("hitl")) return ClipboardCheck;
  if(v.includes("impact")||v.includes("assessment")||v.includes("risk")) return AlertTriangle;
  if(v.includes("implementation")||v.includes("lifecycle")||v.includes("workflow")) return Workflow;
  if(v.includes("roadmap")) return Map;
  if(v.includes("template")||v.includes("policy")||v.includes("document")) return FileText;
  if(v.includes("library")) return Library;
  if(v.includes("setting")) return Settings;
  if(v.includes("workspace")||v.includes("organization")||v.includes("organisation")) return Building2;
  if(v.includes("scope")) return SearchCheck;
  if(v.includes("control")||v.includes("guardrail")||v.includes("security")) return ShieldCheck;
  if(v.includes("trust")||v.includes("privacy")) return Shield;
  if(v.includes("gap")) return FileSearch;
  if(v.includes("servicenow")||v.includes("crm")||v.includes("integration")) return Network;
  if(v.includes("cube")||v.includes("model")||v.includes("registry")) return Boxes;
  if(v.includes("report")||v.includes("analytics")||v.includes("kpi")) return BarChart3;
  if(v.includes("chart")||v.includes("trend")) return LineChart;
  if(v.includes("ai")||v.includes("prompt")||v.includes("genai")) return BrainCircuit;
  if(v.includes("system")||v.includes("technology")) return Cpu;
  if(v.includes("data")) return Database;
  if(v.includes("cloud")||v.includes("aws")||v.includes("azure")||v.includes("google")) return Cloud;
  if(v.includes("code")||v.includes("github")) return Code2;
  if(v.includes("slack")||v.includes("message")) return MessageSquare;
  if(v.includes("vendor")||v.includes("supplier")||v.includes("marketplace")) return BriefcaseBusiness;
  if(v.includes("people")||v.includes("workforce")||v.includes("user")) return Users;
  if(v.includes("monitor")||v.includes("activity")) return Activity;
  if(v.includes("evidence")||v.includes("audit")) return FileCheck2;
  if(v.includes("quality")||v.includes("robust")) return Gauge;
  if(v.includes("refresh")||v.includes("change")) return RefreshCw;
  if(v.includes("identity")||v.includes("access")) return KeyRound;
  if(v.includes("lock")) return LockKeyhole;
  if(v.includes("notification")) return Bell;
  if(v.includes("complete")||v.includes("ready")) return CheckCircle2;
  if(v.includes("ethics")) return UserCheck;
  if(v.includes("bot")||v.includes("copilot")) return Bot;
  return Sparkles;
}

/* Downloads generated text content as a real file. */
export function vzDownload(filename,text){
  try{
    const blob=new Blob([text],{type:"text/markdown"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
  }catch{/* download unavailable in this environment */}
}

/* Animates the first number in a value string from zero on mount. */
export function CountUp({value,duration=900}){
  const str=String(value??"");
  const m=str.match(/-?\d+(\.\d+)?/);
  const [disp,setDisp]=useState(m?str.replace(m[0],"0"):str);
  useEffect(()=>{
    if(!m){setDisp(str);return;}
    const target=parseFloat(m[0]);
    const dec=(m[0].split(".")[1]||"").length;
    const t0=performance.now();
    let raf;
    const tick=now=>{
      const p=Math.min(1,(now-t0)/duration);
      const eased=1-Math.pow(1-p,3);
      setDisp(str.replace(m[0],(target*eased).toFixed(dec)));
      if(p<1)raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[str]);
  return <>{disp}</>;
}

export function Glyph({name, color=T.ink3, size=16, strokeWidth=1.8, style={}}) {
  const Icon=glyphIconFor(name);
  return <Icon size={size} color={color} strokeWidth={strokeWidth} style={{display:"block",flexShrink:0,...style}} aria-hidden="true"/>;
}

export function IconBox({name, color=T.blue, size=16, style={}}) {
  return <div style={{width:34,height:34,borderRadius:8,background:color+"14",border:`1px solid ${color}32`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...style}}>
    <Glyph name={name} color={color} size={size}/>
  </div>;
}

export const Tag = ({label, color=T.ink3, bg}) => (
  <span style={{display:"inline-block",background:bg||color+"18",color,border:`1px solid ${color}28`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:600,fontFamily:F.m,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{cleanText(label)}</span>
);

export const priorityColor = p => ({Critical:T.red,High:T.amber,Medium:T.blue,Low:T.ink3,Urgent:T.red,"Awaiting Approval":T.amber}[p]||T.ink3);
export const priorityBg    = p => ({Critical:T.redL,High:T.amberL,Medium:T.blueL,Low:T.ink5,Urgent:T.redL,"Awaiting Approval":T.amberL}[p]||T.ink5);
export const statusColor   = s => ({["In Progress"]:T.blue,Overdue:T.red,["In Review"]:T.amber,["Awaiting Approval"]:T.amber,Scheduled:T.ink3,Complete:T.green,Urgent:T.red,Planned:T.ink3,Mitigate:T.blue,Accept:T.green,Transfer:T.violet,Avoid:T.red}[s]||T.ink3);
export const statusBg      = s => ({["In Progress"]:T.blueL,Overdue:T.redL,["In Review"]:T.amberL,["Awaiting Approval"]:T.amberL,Scheduled:T.ink5,Complete:T.greenL,Urgent:T.redL,Planned:T.ink5,Mitigate:T.blueL,Accept:T.greenL,Transfer:T.violetL,Avoid:T.redL}[s]||T.ink5);

export const PTag = ({p}) => <Tag label={p} color={priorityColor(p)} bg={priorityBg(p)} />;
export const STag = ({s}) => <Tag label={s} color={statusColor(s)} bg={statusBg(s)} />;

export function Spinner({color=T.ink3}) {
  return <div style={{width:14,height:14,border:`2px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}} />;
}

export function Bar({value, color, delay=0}) {
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(value),200+delay);return()=>clearTimeout(t);},[value,delay]);
  return <div style={{background:T.border,borderRadius:3,height:4,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1.3s cubic-bezier(.16,1,.3,1)"}}/></div>;
}

export function Ring({score,color,size=58}) {
  const r=size/2-5, circ=2*Math.PI*r;
  const [off,setOff]=useState(circ);
  useEffect(()=>{const t=setTimeout(()=>setOff(circ-(score/100)*circ),250);return()=>clearTimeout(t);},[score,circ]);
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={4}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)"}}/>
    <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{fontSize:size>70?14:10,fontWeight:700,fill:T.ink,fontFamily:F.m,transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{score}</text>
  </svg>;
}

export function Card({children, style={}, glow, onClick, title}) {
  const light=T.bg==="#F7F8FA";
  const shadow=light
    ? "0 1px 2px rgba(17,24,39,.04), 0 12px 28px rgba(11,78,162,.06)"
    : "0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)";
  return <div onClick={onClick} title={title} role={onClick?"button":undefined} tabIndex={onClick?0:undefined} onKeyDown={onClick?(e=>{if(e.key==="Enter")onClick(e);}):undefined} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:glow?`0 0 28px ${glow}15`:shadow,cursor:onClick?"pointer":undefined,...style}}>{children}</div>;
}

export function SHead({title, sub}) {
  return <div style={{marginBottom:20}}>
    <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:800,color:T.ink,letterSpacing:0,marginBottom:4,lineHeight:1.2}}>{cleanText(title)}</h2>
    {sub&&<p style={{fontSize:12,color:T.ink3,fontFamily:F.b}}>{cleanText(sub)}</p>}
  </div>;
}

export function Toast({msg,type}) {
  const prefix=type==="success"?"Saved: ":"Alert: ";
  return <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,background:type==="success"?T.green:T.red,color:"#fff",borderRadius:8,padding:"10px 18px",fontSize:12,fontWeight:700,fontFamily:F.b,boxShadow:"0 8px 32px rgba(0,0,0,.32)",animation:"up .3s ease"}}>{prefix}{cleanText(msg)}</div>;
}

/* Section */
export function BrandLogo({theme,width=160,style={}}) {
  const src=theme==="dark"?"/brand/veriszone-dark-transparent.png":"/brand/veriszone-light-blue-gold.png";
  const filter=theme==="dark"?"contrast(1.04) saturate(1.04)":"contrast(1.06) saturate(1.04)";
  return <img src={src} alt="VerisZone" width={width} style={{width,height:"auto",objectFit:"contain",display:"block",filter,...style}}/>;
}

export function AICentralLogo({width=64,compact=false,style={}}) {
  const src=compact?"/brand/ai-central-symbol.png":"/brand/ai-central-logo.png";
  return <img src={src} alt="AI Central" width={width} style={{width,height:"auto",display:"block",objectFit:"contain",borderRadius:compact?10:16,filter:compact?"contrast(1.18) saturate(1.22) brightness(1.08)":"contrast(1.08) saturate(1.12)",...style}}/>;
}

export const SIDEBAR_W = 236;

export const priColor = (p,T) => p==="Critical"?T.red:p==="High"?T.amber:T.blue;

export const execHealthOf = i => Math.round((i.guardrail+i.adoption+i.valueScore)/3);
export const execMoney = v => parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
/* Role relevance: executives see the whole portfolio; CXOs see initiatives
   naming them as sponsor CXO; fall back to full portfolio. */
export const execInitiativesFor = role => {
  const label=(ROLES[role]||ROLES.caio).label;
  if(EXECUTIVE_ROLE_IDS.includes(role))return acInitiatives;
  const mine=acInitiatives.filter(i=>i.cxo.includes(label));
  return mine.length?mine:acInitiatives;
};

export function KpiInsightPanel({label,status,role,goto}){
  const R=ROLES[role]||ROLES.caio;
  const ins=KPI_INSIGHTS[label];
  const derived={
    rootCause:status==="Good"||status==="Active"?"Tracking within target.":`Below target - under review by the ${R.label} office.`,
    impact:status==="Critical"?"Requires executive attention this cycle.":status==="Alert"||status==="High"?"Trending toward threshold; monitor closely.":"No adverse business impact.",
    aiRec:status==="Good"||status==="Active"?"No action required.":"Open the linked register to assign a corrective action.",
    link:{ac:"governance"},
  };
  const d=ins||derived;
  const linked=execInitiativesFor(role)[0];
  return <div style={{gridColumn:"1 / -1",background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 13px",margin:"6px 0 4px",animation:"fade .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10,marginBottom:10}}>
      {[["Owner",`${R.label} office`],["Root cause",d.rootCause],["Business impact",d.impact],["AI recommendation",d.aiRec]].map(([l,v])=><div key={l}>
        <div style={{fontSize:8,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{l}</div>
        <div style={{fontSize:10,color:l==="AI recommendation"?AI_GOLD:T.ink2,fontFamily:F.b,lineHeight:1.5,fontWeight:l==="AI recommendation"?700:500}}>{v}</div>
      </div>)}
    </div>
    <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
      {linked&&<span style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>Linked initiative: <strong style={{color:T.ink2}}>{linked.name}</strong></span>}
      <button onClick={e=>{e.stopPropagation();goto(d.link);}} style={{marginLeft:"auto",background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}40`,borderRadius:6,padding:"5px 10px",color:AI_GOLD,fontSize:9,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Resolve blocker →</button>
      <button onClick={e=>{e.stopPropagation();goto({ac:"evidence"});}} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 10px",color:T.ink3,fontSize:9,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Evidence →</button>
    </div>
  </div>;
}

/* Collapsible section shell for the executive dashboard's deep sections. */
export const AIIA_RISK_CATEGORIES = [
  {cat:"Security Risks",icon:"?",color:"#E84040",items:["Adversarial attacks & prompt injection","Data poisoning of training sets","Model theft or extraction","Unauthorized access to AI systems","Supply chain vulnerabilities via third-party models","System manipulation and evasion"]},
  {cat:"Safety Risks",icon:"?",color:"#E8A020",items:["Unintended consequences from autonomous decisions","System malfunction or failure in safety-critical domains","Lack of robustness under adversarial inputs","Human overreliance on AI recommendations","Poor testing and validation before deployment"]},
  {cat:"Privacy Risks",icon:"?",color:"#9061F9",items:["Data leakage and unauthorized access to PII","Inappropriate profiling or re-identification","Lack of transparency and informed consent","Weak data governance and GDPR/CCPA non-compliance","Re-identification from anonymised training data"]},
  {cat:"Ethical & Societal Risks",icon:"?",color:"#4B7BF5",items:["Algorithmic bias and discrimination against protected groups","Erosion of human agency in high-stakes decisions","Social inequality amplification","Environmental impact of energy-intensive AI","Labour market disruption from automation"]},
  {cat:"Reliability & Robustness",icon:"?",color:"#0DB4A0",items:["Model drift","Hallucinations in generative AI","Failure under out-of-distribution inputs","Inconsistent outputs across demographic groups","Insufficient continuous monitoring"]},
  {cat:"Compliance & Legal Risks",icon:"?",color:"#E8A020",items:["EU AI Act non-compliance for high-risk systems","GDPR Art.22 automated decision violations","Anti-discrimination law violations","Intellectual property and copyright issues","Failure to maintain audit trails and documentation"]},
  {cat:"Operational Risks",icon:"?",color:"#6E7594",items:["Inadequate human oversight processes","Dependency on single-point-of-failure AI vendors","Lack of incident response for AI failures","Insufficient staff competence (ISO 42001 C.7.2)","No kill-switch or emergency stop mechanism"]},
];

export const COMMON_CONTROLS = [
  {id:"cc1",control:"Access Control & Identity Management",
   mappings:{"ISO 27001":"A.8.3","ISO 27002":"8.3","SOC 2":"CC6.1","NIST CSF":"PR.AC-1","CIS Controls":"5","GDPR":"Art.32","ISO 42001":"C.7.1","PCI DSS":"8","HIPAA":"N/A","DORA":"Art.9","EU AI Act":"Art.10"},
   evidence:"MFA screenshots, IAM policy, access review logs",status:"Implemented",strength:"Strong"},
  {id:"cc2",control:"Risk Assessment & Treatment",
   mappings:{"ISO 27001":"C.6.1","ISO 27002":"6.1","SOC 2":"CC3.2","NIST CSF":"ID.RA","CIS Controls":"18","GDPR":"Art.35","ISO 42001":"C.8.2","PCI DSS":"12.3","HIPAA":"N/A","DORA":"Art.6","EU AI Act":"Art.9","NIST AI RMF":"GOVERN 1.2","MAS TRM":"7.1","RBI":"4.1"},
   evidence:"Risk register, treatment plans, DPIA documentation",status:"Partial",strength:"Medium"},
  {id:"cc3",control:"Incident Management & Response",
   mappings:{"ISO 27001":"A.5.24","ISO 27002":"5.24","SOC 2":"CC7.3","NIST CSF":"RS.RP","CIS Controls":"17","GDPR":"Art.33","ISO 42001":"C.10.1","PCI DSS":"12.10","HIPAA":"N/A","DORA":"Art.17","EU AI Act":"Art.73"},
   evidence:"IR playbook, incident logs, DPA notifications",status:"Implemented",strength:"Strong"},
  {id:"cc4",control:"Supplier & Third-Party Risk",
   mappings:{"ISO 27001":"A.5.19","ISO 27002":"5.19","SOC 2":"CC9.2","NIST CSF":"ID.SC","CIS Controls":"15","GDPR":"Art.28","ISO 42001":"C.8.1","PCI DSS":"12.8","DORA":"Art.28","MAS TRM":"10.1"},
   evidence:"Vendor questionnaires, DPAs, SCC agreements",status:"Partial",strength:"Medium"},
  {id:"cc5",control:"Business Continuity & Resilience",
   mappings:{"ISO 27001":"A.5.29","ISO 27002":"5.29","SOC 2":"A1.2","NIST CSF":"RC.RP","CIS Controls":"11","ISO 42001":"C.8.5","PCI DSS":"12.10.1","HIPAA":"N/A","DORA":"Art.11","MAS TRM":"8.1"},
   evidence:"BCP documents, DR test results, RTO/RPO evidence",status:"Weak",strength:"Weak"},
  {id:"cc6",control:"Vulnerability & Patch Management",
   mappings:{"ISO 27001":"A.8.8","ISO 27002":"8.8","SOC 2":"CC7.1","NIST CSF":"ID.RA-1","CIS Controls":"7","PCI DSS":"6.3","HIPAA":"N/A","DORA":"Art.9","RBI":"5.2"},
   evidence:"Scan reports, patch records, remediation tickets",status:"Partial",strength:"Medium"},
  {id:"cc7",control:"Data Classification & Protection",
   mappings:{"ISO 27001":"A.5.12","ISO 27002":"5.12","SOC 2":"CC6.7","NIST CSF":"PR.DS","CIS Controls":"3","GDPR":"Art.5","ISO 42001":"C.7.2","PCI DSS":"9.9","HIPAA":"N/A","MAS TRM":"11.1"},
   evidence:"Classification policy, DLP logs, data inventory",status:"Partial",strength:"Medium"},
  {id:"cc8",control:"Security Awareness & Training",
   mappings:{"ISO 27001":"A.6.3","ISO 27002":"6.3","SOC 2":"CC1.4","NIST CSF":"PR.AT","CIS Controls":"14","GDPR":"Art.39","ISO 42001":"C.7.3","PCI DSS":"12.6","HIPAA":"N/A","DORA":"Art.13"},
   evidence:"Training completion certs, phishing test results",status:"Implemented",strength:"Strong"},
];

export const SCOPE_DATA = {
  orgName: "Acme Corporation Ltd",
  industry: "Financial Services",
  geography: ["United Kingdom","European Union","India"],
  aiSystems: 17,
  employees: 1240,
  dataSubjects: 150000,
  cloudProviders: ["AWS eu-west-1","Azure UK South","GCP europe-west2"],
  inScope: ["Corporate IT infrastructure","Cloud-hosted SaaS products","AI/ML systems (17 in production)","Customer data processing","Third-party integrations (47 vendors)"],
  outOfScope: ["Personal devices","Joint ventures","Subsidiaries below 50 employees"],
  interestedParties: [
    {party:"Customers",need:"Data privacy, security assurance, compliance evidence",impact:"High"},
    {party:"Regulators (ICO, FCA)",need:"GDPR/FCA compliance, audit cooperation",impact:"Critical"},
    {party:"Board of Directors",need:"Risk oversight, governance maturity reporting",impact:"High"},
    {party:"Employees",need:"Clear policies, secure work environment, training",impact:"Medium"},
    {party:"Suppliers/Vendors",need:"Clear security requirements, contract terms",impact:"Medium"},
    {party:"Auditors (BSI)",need:"ISMS documentation, evidence, cooperation",impact:"High"},
  ],
  legalRequirements: [
    {req:"UK GDPR / GDPR",obligation:"Data protection, breach notification, DPIA",due:"Ongoing",status:"Active"},
    {req:"UK FCA SYSC 8",obligation:"Operational resilience, third-party oversight",due:"Ongoing",status:"Active"},
    {req:"EU AI Act",obligation:"High-risk AI conformity, transparency",due:"Aug 2026",status:"Urgent"},
    {req:"DORA (EU)",obligation:"Digital operational resilience, ICT risk",due:"Jan 2025",status:"Active"},
    {req:"ISO 27001:2022",obligation:"ISMS certification",due:"Q3 2026",status:"In Progress"},
    {req:"PCI DSS v4.0",obligation:"Payment card data security",due:"Mar 2025",status:"Active"},
    {req:"DPDP Act (India)",obligation:"India data protection compliance",due:"2025",status:"Monitoring"},
    {req:"MAS TRM (Singapore)",obligation:"Technology risk management guidelines",due:"Ongoing",status:"Monitoring"},
    {req:"RBI Cyber Guidelines",obligation:"India cybersecurity framework",due:"Ongoing",status:"Monitoring"},
  ],
};

export const TRUST_CENTER_DATA = {
  certifications:[
    {name:"ISO 27001:2022",status:"In Progress",score:65,expires:"N/A",auditor:"BSI Group",badge:"Verified"},
    {name:"SOC 2 Type II",status:"Certified",score:91,expires:"Dec 2026",auditor:"Deloitte",badge:"Verified"},
    {name:"ISO 42001",status:"In Progress",score:58,expires:"N/A",auditor:"Pending",badge:"Verified"},
    {name:"GDPR",status:"Compliant",score:81,expires:"Ongoing",auditor:"Internal DPO",badge:"Verified"},
    {name:"Cyber Essentials Plus",status:"Certified",score:100,expires:"Sep 2026",auditor:"IASME",badge:"Verified"},
  ],
  questionnaires:[
    {name:"SIG Lite",desc:"Standardised Information Gathering questionnaire",pages:16,time:"45 min",status:"Available"},
    {name:"CAIQ v3.1",desc:"Cloud Security Alliance Consensus Assessment Initiative Questionnaire",pages:12,time:"30 min",status:"Available"},
    {name:"VSAQ",desc:"Vendor Security Assessment Questionnaire (Google-style)",pages:8,time:"20 min",status:"Available"},
    {name:"Custom Enterprise",desc:"VerisZone custom enterprise security questionnaire",pages:24,time:"60 min",status:"Available"},
  ],
  policies:[
    {name:"Information Security Policy",public:true,version:"2.1",updated:"Jan 2026"},
    {name:"Privacy Policy",public:true,version:"3.0",updated:"Mar 2026"},
    {name:"AI Ethics Policy",public:true,version:"0.3",updated:"Nov 2025"},
    {name:"Subprocessor List",public:true,version:"8.2",updated:"Apr 2026"},
    {name:"Responsible Disclosure Policy",public:true,version:"1.4",updated:"Jan 2026"},
  ],
};

/* Section */
export const ANNEX_A_CONTROLS=[
  {id:"A5",clause:"A.5",title:"Organisational Controls",total:37,implemented:24,partial:8,notImpl:5,score:73},
  {id:"A6",clause:"A.6",title:"People Controls",total:8,implemented:5,partial:2,notImpl:1,score:75},
  {id:"A7",clause:"A.7",title:"Physical Controls",total:14,implemented:9,partial:3,notImpl:2,score:75},
  {id:"A8",clause:"A.8",title:"Technological Controls",total:34,implemented:18,partial:10,notImpl:6,score:65},
];
export const ISO27001_POLICIES=[
  {id:"p1",name:"Information Security Policy",status:"Approved",owner:"CISO",version:"2.1",reviewed:"Jan 2026",due:"Jan 2027",linked:["A.5.1"],risk:"Low"},
  {id:"p2",name:"Access Control Policy",status:"In Review",owner:"IT Ops",version:"1.8",reviewed:"Nov 2025",due:"May 2026",linked:["A.8.3"],risk:"Medium"},
  {id:"p3",name:"Asset Management Policy",status:"Approved",owner:"IT Ops",version:"1.4",reviewed:"Feb 2026",due:"Feb 2027",linked:["A.5.9"],risk:"Low"},
  {id:"p4",name:"Incident Management Policy",status:"Needs Update",owner:"CISO",version:"2.0",reviewed:"Oct 2025",due:"Apr 2026",linked:["A.5.24"],risk:"High"},
  {id:"p5",name:"Business Continuity Policy",status:"Draft",owner:"CIO",version:"0.9",reviewed:"Never",due:"Jun 2026",linked:["A.5.29"],risk:"High"},
  {id:"p6",name:"Supplier Security Policy",status:"Approved",owner:"CISO",version:"1.2",reviewed:"Mar 2026",due:"Mar 2027",linked:["A.5.19"],risk:"Low"},
  {id:"p7",name:"Cloud Security Policy",status:"Draft",owner:"IT Arch",version:"0.5",reviewed:"Never",due:"Jun 2026",linked:["A.5.23"],risk:"High"},
  {id:"p8",name:"Cryptography Policy",status:"Approved",owner:"SecOps",version:"1.1",reviewed:"Jan 2026",due:"Jan 2027",linked:["A.8.24"],risk:"Low"},
  {id:"p9",name:"Data Classification Policy",status:"In Review",owner:"CDPO",version:"1.6",reviewed:"Dec 2025",due:"Jun 2026",linked:["A.5.12"],risk:"Medium"},
  {id:"p10",name:"Remote Working Policy",status:"Approved",owner:"HR",version:"2.3",reviewed:"Feb 2026",due:"Feb 2027",linked:["A.6.7"],risk:"Low"},
  {id:"p11",name:"Secure Development Policy",status:"Needs Update",owner:"Engineering",version:"1.0",reviewed:"Sep 2025",due:"Mar 2026",linked:["A.8.25"],risk:"High"},
  {id:"p12",name:"AI Governance Policy",status:"Draft",owner:"CAIO",version:"0.3",reviewed:"Never",due:"Jul 2026",linked:["ISO 42001"],risk:"High"},
];
export const EVIDENCE_LIBRARY=[
  {id:"e1",name:"ISO 27001 Scope Document",control:"A.5.1",status:"Valid",expires:"Dec 2026",owner:"CISO",type:"Document",size:"245KB"},
  {id:"e2",name:"Asset Register v3.2",control:"A.5.9",status:"Valid",expires:"Sep 2026",owner:"IT Ops",type:"Spreadsheet",size:"1.2MB"},
  {id:"e3",name:"Risk Assessment Report Q1 2026",control:"C.6.1",status:"Valid",expires:"Jun 2026",owner:"GRC",type:"Report",size:"890KB"},
  {id:"e4",name:"Penetration Test Results 2025",control:"A.8.8",status:"Expiring",expires:"Jun 2026",owner:"SecOps",type:"Report",size:"4.1MB"},
  {id:"e5",name:"Access Review",control:"A.8.3",status:"Valid",expires:"Sep 2026",owner:"IT Ops",type:"Screenshot",size:"340KB"},
  {id:"e6",name:"DR Test Results Q4 2025",control:"A.5.29",status:"Expired",expires:"Mar 2026",owner:"CIO",type:"Report",size:"1.8MB"},
  {id:"e7",name:"Security Awareness Training Certs",control:"A.6.3",status:"Valid",expires:"Dec 2026",owner:"HR",type:"Certificates",size:"2.2MB"},
  {id:"e8",name:"Vendor Security Assessments",control:"A.5.19",status:"Expiring",expires:"May 2026",owner:"CISO",type:"Document",size:"560KB"},
  {id:"e9",name:"MFA Implementation Evidence",control:"A.8.5",status:"Valid",expires:"Dec 2026",owner:"IT Ops",type:"Screenshot",size:"120KB"},
  {id:"e10",name:"ISMS Internal Audit Report 2025",control:"C.9.2",status:"Expired",expires:"Jan 2026",owner:"GRC",type:"Report",size:"1.1MB"},
];
export const AUDIT_PLAN=[
  {id:"au1",area:"Clause 6",auditor:"Internal GRC",scheduled:"May 20, 2026",status:"Scheduled",critical:false},
  {id:"au2",area:"Annex A.8",auditor:"Internal GRC",scheduled:"Jun 3, 2026",status:"Scheduled",critical:false},
  {id:"au3",area:"Annex A.5",auditor:"External",scheduled:"Jun 17, 2026",status:"Scheduled",critical:false},
  {id:"au4",area:"Clause 9",auditor:"Internal GRC",scheduled:"Jul 1, 2026",status:"Planned",critical:false},
  {id:"au5",area:"Full ISMS Certification Audit",auditor:"BSI Group",scheduled:"Aug 2026",status:"Planned",critical:true},
];
export const CORRECTIVE_ACTIONS=[
  {id:"ca1",finding:"DR test exceeded RTO target (6.5hrs vs 4hr target)",priority:"High",owner:"CIO",due:"Jun 15",status:"In Progress",linked:"A.5.29"},
  {id:"ca2",finding:"47 assets without classification (A.8.2 gap)",priority:"High",owner:"IT Ops",due:"May 30",status:"In Progress",linked:"A.5.9"},
  {id:"ca3",finding:"3 privileged accounts with no quarterly review",priority:"Critical",owner:"IT Ops",due:"May 15",status:"Overdue",linked:"A.8.3"},
  {id:"ca4",finding:"Penetration test remediation",priority:"High",owner:"SecOps",due:"Jun 1",status:"In Progress",linked:"A.8.8"},
  {id:"ca5",finding:"Business Continuity Policy never reviewed",priority:"Medium",owner:"CIO",due:"Jun 30",status:"Not Started",linked:"A.5.29"},
];
export const GAP_DATA={
  overall:67,
  frameworks:[
    {fw:"ISO 27001:2022",score:65,controls:93,implemented:60,partial:18,missing:15,critical:4},
    {fw:"ISO 42001",score:58,controls:42,implemented:24,partial:10,missing:8,critical:3},
    {fw:"GDPR",score:81,controls:28,implemented:23,partial:3,missing:2,critical:1},
    {fw:"NIST CSF",score:74,controls:108,implemented:80,partial:18,missing:10,critical:2},
    {fw:"SOC 2 Type II",score:88,controls:64,implemented:56,partial:6,missing:2,critical:0},
    {fw:"EU AI Act",score:72,controls:38,implemented:27,partial:8,missing:3,critical:2},
  ],
  topGaps:[
    {id:"g1",gap:"Business Continuity Policy not reviewed",priority:"Critical",fw:"ISO 27001 A.5.29",owner:"CIO",effort:"Low",days:7,type:"Policy"},
    {id:"g2",gap:"47 assets without ISO 27001 classification",priority:"Critical",fw:"ISO 27001 A.5.9",owner:"IT Ops",effort:"Medium",days:14,type:"Control"},
    {id:"g3",gap:"Privileged access review overdue (3 accounts)",priority:"Critical",fw:"ISO 27001 A.8.3",owner:"IT Ops",effort:"Low",days:2,type:"Evidence"},
    {id:"g4",gap:"AI Model Cards missing for 10/17 systems",priority:"High",fw:"ISO 42001 C.8.4",owner:"CAIO",effort:"High",days:30,type:"Documentation"},
    {id:"g5",gap:"Cloud Security Policy in draft review",priority:"High",fw:"ISO 27001 A.5.23",owner:"CISO",effort:"Low",days:5,type:"Policy"},
    {id:"g6",gap:"ISMS Internal Audit overdue by 4 months",priority:"High",fw:"ISO 27001 C.9.2",owner:"GRC",effort:"Medium",days:21,type:"Audit"},
    {id:"g7",gap:"Secure Development Policy needs update",priority:"High",fw:"ISO 27001 A.8.25",owner:"Engineering",effort:"Medium",days:14,type:"Policy"},
    {id:"g8",gap:"DR Evidence expired",priority:"High",fw:"ISO 27001 A.5.29",owner:"CIO",effort:"High",days:30,type:"Evidence"},
    {id:"g9",gap:"Vendor DPA compliance at 84%",priority:"Medium",fw:"GDPR Art.28",owner:"CDPO",effort:"Medium",days:20,type:"Compliance"},
    {id:"g10",gap:"EU AI Act conformity at 72%",priority:"Medium",fw:"EU AI Act Art.9",owner:"CAIO",effort:"High",days:60,type:"Regulatory"},
  ],
  heatmap:[
    {dept:"Engineering",score:58,gaps:8},{dept:"HR",score:74,gaps:3},
    {dept:"Finance",score:81,gaps:2},{dept:"IT Operations",score:62,gaps:7},
    {dept:"Legal",score:88,gaps:1},{dept:"Product",score:55,gaps:9},
    {dept:"Marketing",score:70,gaps:4},{dept:"Security",score:79,gaps:3},
  ],
};
export const INTEGRATIONS={
  servicenow:{
    connected:false,
    instance:"https://your-instance.service-now.com",
    triggers:[
      {id:"sn1",event:"Control Failure",table:"GRC Task",priority:"High",auto:true,active:true},
      {id:"sn2",event:"Missing Evidence",table:"GRC Task",priority:"Medium",auto:true,active:true},
      {id:"sn3",event:"Expired Evidence",table:"GRC Task",priority:"High",auto:false,active:true},
      {id:"sn4",event:"Audit Finding",table:"GRC Task",priority:"High",auto:true,active:true},
      {id:"sn5",event:"Risk Above Threshold",table:"Risk Issue",priority:"Critical",auto:true,active:true},
      {id:"sn6",event:"Policy Exception",table:"Change Request",priority:"Medium",auto:false,active:false},
      {id:"sn7",event:"Vendor Risk Issue",table:"Problem",priority:"High",auto:false,active:true},
      {id:"sn8",event:"AI Governance Issue",table:"GRC Task",priority:"High",auto:true,active:true},
    ],
    recentTickets:[
      {id:"INC0012847",type:"Incident",title:"Privileged access review overdue",status:"In Progress",priority:"High",created:"May 7"},
      {id:"GRC0004521",type:"GRC Task",title:"Asset classification gap",status:"Open",priority:"High",created:"May 6"},
      {id:"CHG0008934",type:"Change Request",title:"DR policy review and update",status:"Pending",priority:"Medium",created:"May 5"},
      {id:"GRC0004498",type:"GRC Task",title:"Cloud Security Policy approval",status:"Open",priority:"High",created:"May 3"},
    ],
  },
  crm:{
    connected:false,
    platforms:[
      {name:"Salesforce",icon:"?",status:"Not Connected",color:"#00A1E0"},
      {name:"HubSpot",icon:"?",status:"Not Connected",color:"#FF7A59"},
      {name:"Microsoft Dynamics",icon:"?",status:"Not Connected",color:"#0078D4"},
      {name:"Zoho CRM",icon:"?",status:"Not Connected",color:"#E42527"},
    ],
    trustRequests:[
      {id:"tr1",account:"Acme Corp",type:"Security Questionnaire",stage:"Contract",due:"May 20",status:"Pending",assigned:"CISO"},
      {id:"tr2",account:"GlobalBank Ltd",type:"ISO 27001 Evidence",stage:"Renewal",due:"Jun 1",status:"In Progress",assigned:"GRC"},
      {id:"tr3",account:"TechCo India",type:"GDPR Compliance Pack",stage:"New Deal",due:"May 25",status:"Pending",assigned:"CDPO"},
      {id:"tr4",account:"MedGroup EU",type:"HIPAA + GDPR Evidence",stage:"Enterprise",due:"Jun 15",status:"Not Started",assigned:"CISO"},
    ],
  },
};

export const LOGIN_PROFILES = [
  {id:"demo",label:"Demo Center",role:"caio",target:"home",mode:"demo",accent:"#5B8CFF",title:"VerisZone Demo Center",subtitle:"A seeded sales showcase of the Enterprise AI Transformation Control Plane, from CXO strategy to AI Central execution and AI Spine scale decisions.",email:"demo.center@veriszone.ai",kpis:[["Pilot","to scale"],["9","CXO views"],["Live","AI Spine"]]},
  {id:"ceo",label:"CEO",role:"ceo",target:"home",accent:"#D6A84F",title:"CEO Enterprise AI Command",subtitle:"Board-level AI transformation, enterprise maturity, strategic risk, value realization and scale/no-scale decisions.",email:"maya.chen@veriszone.ai",kpis:[["78/100","AI maturity"],["2","Scale-ready"],["$3.6M","Value realized"]]},
  {id:"coo",label:"COO",role:"coo",target:"home",accent:"#0EA5E9",title:"COO AI Operating Model",subtitle:"Department rollout health, adoption, operating exceptions, process change and pilot-to-scale execution.",email:"priya.mehta@veriszone.ai",kpis:[["4","Pilots"],["64%","Adoption"],["3","Blocked tasks"]]},
  {id:"cfo",label:"CFO",role:"cfo",target:"home",accent:"#22C55E",title:"CFO AI Value Office",subtitle:"Budget governance, ROI confidence, value evidence, benefit realization and investment gate approvals.",email:"elena.rossi@veriszone.ai",kpis:[["88%","ROI confidence"],["6%","Budget variance"],["14 mo","Payback"]]},
  {id:"chro",label:"CHRO",role:"chro",target:"home",accent:"#EC4899",title:"CHRO Workforce AI Readiness",subtitle:"Workforce readiness, adoption resistance, AI literacy, role impact and responsible people transformation.",email:"hannah.lee@veriszone.ai",kpis:[["68%","Training"],["72%","Role impact"],["77%","AI literacy"]]},
  {id:"ciso",label:"CISO",role:"ciso",target:"home",accent:"#3B82F6",title:"CISO Security Governance",subtitle:"Security posture, third-party AI exposure, incident oversight, ISO 27001 alignment and control evidence.",email:"jordan.sinclair@veriszone.ai",kpis:[["18","Controls"],["6","Open risks"],["91%","SOC 2"]]},
  {id:"caio",label:"CAIO",role:"caio",target:"home",accent:"#8B5CF6",title:"CAIO Governance Command",subtitle:"AI strategy, risk appetite, model oversight, board reporting and responsible AI operating cadence.",email:"aisha.patel@veriszone.ai",kpis:[["72/100","Maturity"],["8","Active risks"],["7","HITL approvals"]]},
  {id:"cio",label:"CIO",role:"cio",target:"home",accent:"#06B6D4",title:"CIO AI Portfolio Control",subtitle:"AI systems portfolio, implementation roadmap, platform controls, data readiness and enterprise adoption.",email:"marcus.chen@veriszone.ai",kpis:[["47","AI assets"],["12","Roadmap items"],["79%","Controls"]]},
  {id:"cdpo",label:"CDPO",role:"cdpo",target:"home",accent:"#14B8A6",title:"CDPO Privacy Oversight",subtitle:"DPIAs, GDPR Article 22, data processing controls, consent evidence and regulatory response readiness.",email:"elena.rossi@veriszone.ai",kpis:[["11","DPIAs"],["83%","GDPR"],["4","Deadlines"]]},
  {id:"cgo",label:"CGO",role:"cgo",target:"home",accent:"#F59E0B",title:"CGO Governance Office",subtitle:"Policy lifecycle, framework mapping, approvals, escalations and assurance reporting for leadership.",email:"rafael.torres@veriszone.ai",kpis:[["24","Policies"],["61%","ISO 42001 A"],["9","Reports"]]},
  {id:"employee",label:"Employee",role:"employee",target:"workbench",accent:"#2BA88A",title:"Employee AI Workbench",subtitle:"One governed workbench for every AI interaction - approved models, enterprise knowledge and automatic compliance, faster than any public chat.",email:"jamie.park@veriszone.ai",kpis:[["84","Prompts governed"],["11.5h","Time saved"],["0","Data leaks"]]},
  {id:"manager",label:"Manager",role:"manager",target:"aiusage",accent:"#0EA5E9",title:"Manager AI Adoption View",subtitle:"Team adoption, value and compliance without reading private prompts - aggregates only, by policy.",email:"riley.chen@veriszone.ai",kpis:[["64%","Team adoption"],["92%","Compliance"],["3","Blocked events"]]},
  {id:"aicentral",label:"AI Central",role:"caio",target:"aicentral",mode:"aicentral",accent:AI_GOLD,title:"AI Central Standalone",subtitle:"Dedicated command center for AI initiatives, guardrails, lifecycle workflow, CXO alignment and value tracking.",email:"ai.central@veriszone.ai",kpis:[["4","Initiatives"],["3","High risk"],["79%","Guardrails"]]}
];

export const WB_CLASSIFICATIONS=["Public","Internal","Confidential","Restricted"];

/* Demo policy engine: inspect a prompt against the configured detectors. */
export const IDEA_JOURNEY=["Submitted","Under review","Accepted","In AI Central intake"];
export const DEMO_IDEAS=[
  {id:"idea-1",title:"Auto-summarise support handovers",problem:"Shift handovers lose context between support tiers; agents re-read full tickets.",benefit:"Save ~40 min per agent per day",category:"GenAI Copilot",unit:"Engineering",status:"In AI Central intake",date:"2026-07-08"},
  {id:"idea-2",title:"Contract clause pre-checker",problem:"Legal reviews start from scratch on standard clauses.",benefit:"Cut first-pass review time 30%",category:"Decision Support",unit:"Engineering",status:"Under review",date:"2026-07-15"},
  {id:"idea-3",title:"Meeting action extractor",problem:"Action items from meetings get lost across tools.",benefit:"Fewer dropped follow-ups",category:"Process Automation",unit:"Engineering",status:"Submitted",date:"2026-07-19"},
];

export const SEEDED_DEMO_TABS = new Set(["home","onboard","strategy","compliance","hitl","aia","aira","airt","registry","maturity","usecases","aiia","impl","roadmap","scope","controls","trustcenter","iso27001","aigov","gapanalysis","servicenow","reports","aicentral"]);

