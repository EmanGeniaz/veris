"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

/* Section */
const T = {
  /* Surfaces */
  bg:      "#090B10",   /* deep graphite base */
  s1:      "#0E1117",   /* primary surface */
  s2:      "#131720",   /* card surface */
  s3:      "#181D28",   /* elevated card */
  s4:      "#1D2230",   /* input/table row */
  s5:      "#222840",   /* hover state */
  card:    "#0E1117",
  /* Borders */
  border:  "#1E2536",   /* primary border  */
  borderB: "#28304A",   /* medium border */
  borderC: "#323C58",   /* strong border */
  shadow:  "0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)",
  /* Typography */
  ink:     "#F1F3F9",   /* primary text  */
  ink2:    "#A8B0CC",   /* secondary text */
  ink3:    "#636B8A",   /* muted text */
  ink4:    "#3A4260",   /* very muted */
  ink5:    "#1E2536",   /* near-invisible */
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

const DARK_T = {...T};
const LIGHT_T = {
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

const RC  = r => T[r]      || T.blue;
const RCL = r => T[r+"L"]  || T.blueL;

/* Section */
const CSS = `
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
const ROLES = {
  ceo:{id:"ceo",label:"CEO",title:"Chief Executive Officer",name:"Maya Chen",initials:"MC",frameworks:["Board AI Oversight","ISO 42001","COSO ERM","Value Realization"]},
  coo:{id:"coo",label:"COO",title:"Chief Operating Officer",name:"Priya Mehta",initials:"PM",frameworks:["Operational Excellence","ISO 42001","NIST AI RMF","Change Management"]},
  cfo:{id:"cfo",label:"CFO",title:"Chief Financial Officer",name:"Elena Rossi",initials:"ER",frameworks:["ROI Governance","COSO ERM","FinOps","Audit Evidence"]},
  chro:{id:"chro",label:"CHRO",title:"Chief Human Resources Officer",name:"Hannah Lee",initials:"HL",frameworks:["Workforce Readiness","Responsible AI","Training Evidence","Change Adoption"]},
  ciso:{id:"ciso",label:"CISO",title:"Chief Information Security Officer",name:"Jordan Sinclair",initials:"JS",frameworks:["ISO 27001","NIST CSF","SOC 2","GDPR"]},
  caio:{id:"caio",label:"CAIO",title:"Chief AI Officer",name:"Aisha Patel",initials:"AP",frameworks:["ISO 42001","EU AI Act","NIST AI RMF","GDPR Art.22"]},
  cio: {id:"cio", label:"CIO", title:"Chief Information Officer",name:"Marcus Reid",initials:"MR",frameworks:["ISO 27001","NIST CSF","GDPR","SOC 2"]},
  cdpo:{id:"cdpo",label:"CDPO",title:"Chief Data Privacy Officer",name:"Niamh Lynch",initials:"NL",frameworks:["GDPR","ISO 27701","CCPA/CPRA","ePrivacy"]},
  cgo: {id:"cgo", label:"CGO", title:"Chief Compliance & Governance Officer",name:"Rafael Torres",initials:"RT",frameworks:["COBIT 5","ISO 31000","COSO ERM","GRC Integrated"]},
};
const EXECUTIVE_ROLE_IDS = ["ceo","coo","cfo","chro"];
const USER_PROFILES = {
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
};

/* Section */
const NAV = [
  {id:"home",      icon:"D", label:"Dashboard"},
  {id:"onboard",   icon:"S", label:"Start Here"},
  {id:"intake",    icon:"I", label:"AI Opportunity Intake"},
  {id:"strategy",  icon:"G", label:"Strategy"},
  {id:"playbook",  icon:"P", label:"Playbook"},
  {id:"academy",   icon:"V", label:"Governance Academy"},
  {id:"compliance",icon:"C", label:"Compliance"},
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
  {id:"reports",   icon:"B", label:"Reports"},
];

const CAIO_EXTRA_NAV = [
  {id:"aira",    icon:"R", label:"Risk Register (AIRA)"},
  {id:"airt",    icon:"T", label:"Risk Treatment (AIRT)"},
  {id:"registry",icon:"M", label:"AI Model Registry"},
  {id:"maturity",icon:"S", label:"Governance Maturity"},
  {id:"usecases",icon:"U", label:"Use Case Pipeline"},
];

const NAV_SECTIONS = [
  {title:"Command Center", items:["home"]},
  {title:"CXO Platform", items:["onboard","intake","strategy","aia","aiia","hitl"]},
  {title:"Governance Library", items:["playbook","academy","templates","checklists","compliance","impl","roadmap"]},
  {title:"Risk & Controls", items:["controls","scope","gapanalysis","aigov"]},
  {title:"Enterprise Assurance", items:["iso27001","trustcenter","servicenow","reports"]},
];

const EXECUTIVE_NAV_SECTIONS = [
  {title:"Executive Workspace", items:["home","intake","strategy","hitl"]},
  {title:"Transformation Oversight", items:["roadmap","academy","reports"]},
];

const CAIO_NAV_SECTIONS = [
  {title:"AI Portfolio", items:["registry","maturity","usecases"]},
  {title:"Risk Treatment", items:["aira","airt"]},
];

const AI_CENTRAL_NAV = [
  {id:"dashboard", label:"Dashboard", sub:"Portfolio pulse"},
  {id:"registry", label:"Initiative Registry", sub:"AI systems and owners"},
  {id:"pilot", label:"Pilot Workspace", sub:"Department execution"},
  {id:"detail", label:"Initiative Detail", sub:"Risk, value and controls"},
  {id:"lifecycle", label:"Lifecycle Workflow", sub:"Mandatory gates"},
  {id:"guardrails", label:"Guardrail Engine", sub:"Policy checks"},
  {id:"evidence", label:"Audit & Evidence", sub:"Assurance files"},
  {id:"cxo", label:"CXO Alignment", sub:"Optional accountability"},
  {id:"value", label:"Value & Workforce", sub:"ROI and adoption"},
  {id:"spine", label:"AI Spine", sub:"Orchestration layer"},
  {id:"dna", label:"Initiative DNA", sub:"Use-case fingerprint"},
  {id:"controlmatrix", label:"Control Matrix", sub:"Activated controls"},
  {id:"scalegate", label:"Scale Readiness", sub:"Scale gate engine"},
  {id:"riskdrift", label:"Risk Drift", sub:"Risk movement"},
  {id:"evidenceconfidence", label:"Evidence Confidence", sub:"Proof strength"},
  {id:"maturitymap", label:"Maturity Map", sub:"Learning propagation"},
];

const AI_GOLD = "#D6A84F";
const AI_GOLD_L = "#211806";
const AI_GOLD_B = "#6F5420";

const AI_ROLLOUT_PROGRAMS = [
  {id:"rollout-001",name:"Customer Resolution Copilot",pilot:"Customer Operations",next:"Retail Banking",owner:"CAIO",stage:"Pilot Running",decision:"Hold",readiness:76,riskDrift:"+6",evidence:82,adoption:64,value:"$1.2M",blocker:"CISO prompt-injection evidence due"},
  {id:"rollout-002",name:"Finance Close Automation",pilot:"Finance",next:"Procurement",owner:"CIO",stage:"Scale Gate",decision:"Scale",readiness:88,riskDrift:"-3",evidence:91,adoption:79,value:"$1.8M",blocker:"Board pack ready"},
  {id:"rollout-003",name:"Credit Decision Assurance",pilot:"Retail Banking",next:"SME Lending",owner:"CDPO",stage:"Remediate",decision:"Remediate",readiness:61,riskDrift:"+14",evidence:68,adoption:42,value:"$0.4M",blocker:"DPIA and bias test incomplete"},
  {id:"rollout-004",name:"Workforce Skills Navigator",pilot:"People",next:"Operations",owner:"CGO",stage:"CXO Review",decision:"Stop",readiness:54,riskDrift:"+18",evidence:58,adoption:31,value:"$0.2M",blocker:"Risk appetite exceeded"},
];

const AI_SPINE_SIGNALS = [
  {label:"AI Spine Readiness",value:"72%",sub:"Pilot-to-scale composite",color:AI_GOLD},
  {label:"Evidence Confidence",value:"81%",sub:"Audit proof quality",color:T.blue},
  {label:"Risk Drift Alerts",value:"3",sub:"Above approved appetite",color:T.red},
  {label:"Scale Gates Pending",value:"4",sub:"CXO decisions required",color:T.amber},
];

/* Section */
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

/* Section */
const PLAYBOOK = {
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
const HITL = {
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



/* Section */
const AIRA = [
  {id:"r1",system:"LLM v2 (Customer Support)",category:"Bias & Fairness",likelihood:4,impact:5,score:20,level:"Critical",owner:"CAIO",clause:"ISO 42001 C.8.2 / EU AI Act Art.9",desc:"Model exhibits differential response quality across demographic groups. Disproportionate impact on non-native English speakers identified in bias testing. EU AI Act Art.9 risk management system must document this."},
  {id:"r2",system:"Credit Scoring AI",category:"Transparency",likelihood:3,impact:5,score:15,level:"High",owner:"CAIO / Legal",clause:"EU AI Act Art.13 / GDPR Art.22",desc:"Decision logic opaque to affected individuals. Art.22 requires meaningful explanation for automated decisions with legal effect. Model cards incomplete."},
  {id:"r3",system:"HR Recruitment AI",category:"Regulatory Compliance",likelihood:4,impact:4,score:16,level:"High",owner:"HR / CAIO",clause:"EU AI Act Annex III / ISO 42001 C.8.4",desc:"Potential EU AI Act High-Risk classification as employment-related AI. Conformity assessment may be required. ISO 42001 Clause 8.4 design documentation incomplete."},
  {id:"r4",system:"Fraud Detection Model",category:"Data Privacy",likelihood:2,impact:4,score:8,level:"Medium",owner:"CISO",clause:"ISO 42001 C.7.2 / GDPR Art.5",desc:"Training dataset contains unmasked PII. ISO 42001 Clause 7.2 data resource requirements (provenance, bias identification) not fully documented."},
  {id:"r5",system:"Document Summarisation AI",category:"Hallucination Risk",likelihood:3,impact:3,score:9,level:"Medium",owner:"Product",clause:"ISO 42001 C.9.1",desc:"Model produces confident incorrect summaries. ISO 42001 Clause 9.1 monitoring not yet tracking hallucination rate. Risk of decisions made on AI-fabricated content."},
  {id:"r6",system:"Predictive Maintenance AI",category:"Safety",likelihood:2,impact:5,score:10,level:"Medium",owner:"Engineering",clause:"EU AI Act Annex III / ISO 42001 C.8.5",desc:"Incorrect predictions could cause equipment failure and physical harm. Potential High-Risk classification under EU AI Act Annex III. ISO 42001 C.8.5 kill-switch not implemented."},
];

/* Section */
const AIRT = [
  {id:"t1",riskId:"r1",system:"LLM v2",risk:"Bias & Fairness",treatment:"Mitigate",action:"Deploy continuous bias monitoring with automated alerts. Retrain on balanced dataset. Add fairness guardrails pre-go-live. ISO 42001 C.9.1 monitoring framework to track daily.",owner:"CAIO",deadline:"May 15",status:"In Progress",priority:"Critical"},
  {id:"t2",riskId:"r2",system:"Credit Scoring AI",risk:"Transparency",treatment:"Mitigate",action:"Implement SHAP explainability layer. Generate automated Art.22 decision explanations. Legal to draft disclosure template. ISO 42001 model card to be updated.",owner:"CAIO / Legal",deadline:"May 30",status:"Planned",priority:"High"},
  {id:"t3",riskId:"r3",system:"HR Recruitment AI",risk:"Regulatory",treatment:"Transfer",action:"Engage EU AI Act consultant for conformity assessment. Suspend system pending classification outcome. ISO 42001 C.8.4documentation to be completed.",owner:"HR / Legal",deadline:"Jun 15",status:"Planned",priority:"High"},
  {id:"t4",riskId:"r4",system:"Fraud Detection",risk:"Data Privacy",treatment:"Mitigate",action:"Anonymise training dataset using differential privacy. Re-validate performance post-anonymisation. Update ISO 42001 C.7.2 data documentation.",owner:"CISO / ML Eng",deadline:"Jun 1",status:"In Progress",priority:"Medium"},
  {id:"t5",riskId:"r5",system:"Document AI",risk:"Hallucination",treatment:"Accept",action:"Mandatory human review for all AI summaries in legal/financial contexts. Display confidence score to users. ISO 42001 C.9.1 hallucination rate tracking added.",owner:"Product",deadline:"May 20",status:"Complete",priority:"Medium"},
  {id:"t6",riskId:"r6",system:"Predictive Maintenance",risk:"Safety",treatment:"Mitigate",action:"Add hard safety threshold override. Implement fail-safe mode for critical equipment. ISO 42001 C.8.5 kill-switch deployed.",owner:"Engineering",deadline:"Jun 30",status:"Planned",priority:"Medium"},
];

/* Section */
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
    clause:"ISO 42001 C.8.2/8.4/8.5 ",
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
    clause:"EU AI Act Annex III ",
  },
];

/* Section */
const ONBOARD = {
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
const ROADMAP = {
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
const TEMPLATES = [
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

const KIT_TEMPLATE_SOURCES = {
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
const MODEL_REGISTRY = [
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

/* Section */
const USE_CASES = [
  {id:"uc1",name:"AI-Powered Contract Review",dept:"Legal",stage:"POC",impact:9,feasibility:7,risk:4,score:86,owner:"Legal + Engineering",eta:"Q3 2026",status:"Active",desc:"LLM-based contract analysis to extract obligations, risk clauses, and renewal dates. Estimated 60% reduction in review time."},
  {id:"uc2",name:"Predictive Churn Model",dept:"Sales",stage:"Pilot",impact:8,feasibility:8,risk:3,score:90,owner:"Data Science + Sales",eta:"Q2 2026",status:"Active",desc:"ML model predicting customer churn 90 days in advance. Pilot on 5k accounts showing 73% accuracy vs 45% baseline."},
  {id:"uc3",name:"AI Invoice Processing",dept:"Finance",stage:"Scale",impact:7,feasibility:9,risk:2,score:92,owner:"Finance + IT",eta:"Live",status:"Complete",desc:"IDP (Intelligent Document Processing) for invoice extraction. 94% straight-through processing. ROI: 4.2x annualized savings."},
  {id:"uc4",name:"HR Onboarding Automation",dept:"HR",stage:"POC",impact:6,feasibility:6,risk:5,score:62,owner:"HR + IT",eta:"Q4 2026",status:"Active",desc:"AI-guided onboarding journey. Ethics risk: employee data processing at scale. DPIA required before pilot."},
  {id:"uc5",name:"Regulatory Change Monitor",dept:"Compliance",stage:"Pilot",impact:9,feasibility:5,risk:3,score:78,owner:"CGO + Legal",eta:"Q3 2026",status:"Active",desc:"LLM monitoring regulatory feeds (EU AI Act, GDPR, FCA) for changes affecting the organisation. Alerts to CGO and CAIO."},
  {id:"uc6",name:"GenAI Code Assistant",dept:"Engineering",stage:"Scale",impact:7,feasibility:9,risk:3,score:88,owner:"Engineering",eta:"Live",status:"Complete",desc:"GitHub Copilot Enterprise deployment. 35% faster development velocity. IP and data leakage policy in place."},
];

const GOVERNANCE_ACADEMY = [
  {id:"eu-ai-act",framework:"EU AI Act",title:"High-risk AI: what must be true before launch",duration:"06:40",level:"Executive",owner:"CAIO + Legal",roles:["ceo","caio","cio","ciso","cdpo","cgo"],outcomes:["Identify high-risk triggers","Understand Art.9 risk management","Know when scale must pause"],evidence:"Attestation, quiz score, risk-classification acknowledgement",desc:"A board-ready walkthrough of EU AI Act obligations for pilots, high-risk classification, transparency, human oversight and conformity evidence."},
  {id:"iso-42001",framework:"ISO 42001",title:"AIMS operating model for AI pilots",duration:"07:15",level:"Practitioner",owner:"CAIO + CGO",roles:["ceo","coo","caio","cio","cgo"],outcomes:["Map AIMS clauses to rollout stages","Connect policy to lifecycle gates","Prepare audit-ready management evidence"],evidence:"Completion record, policy acknowledgement, AIMS readiness note",desc:"How ISO 42001 becomes an operating system: context, leadership, planning, operational controls, monitoring and continual improvement."},
  {id:"nist-ai-rmf",framework:"NIST AI RMF",title:"Govern, Map, Measure, Manage in AI Central",duration:"05:50",level:"Operator",owner:"CAIO + CISO",roles:["coo","caio","cio","ciso","cgo"],outcomes:["Use RMF functions in pilots","Recognize risk drift signals","Translate controls into operating tasks"],evidence:"Risk drift checkpoint and guardrail acknowledgement",desc:"A practical lens for turning NIST AI RMF into repeatable risk monitoring, guardrails and evidence workflows inside AI Central."},
  {id:"gdpr-art-22",framework:"GDPR",title:"Automated decisions, DPIA and data minimisation",duration:"06:10",level:"Executive",owner:"CDPO",roles:["ceo","caio","cio","cdpo","cgo"],outcomes:["Spot Art.22 decision risk","Know when DPIA is mandatory","Define privacy evidence before pilot"],evidence:"DPIA trigger acknowledgement and privacy checklist completion",desc:"Privacy obligations for AI pilots that process personal data, affect individuals, or create automated decision-making exposure."},
  {id:"ai-spine",framework:"AI Spine",title:"Pilot-to-scale readiness: Scale, Hold, Remediate, Stop",duration:"04:45",level:"Executive",owner:"CEO + CAIO",roles:["ceo","coo","cfo","chro","caio","cgo"],outcomes:["Interpret scale gate signals","Use evidence confidence","Understand inherited learning between departments"],evidence:"Scale gate decision note and executive acknowledgement",desc:"How VerisZone turns scattered rollout signals into a controlled decision: value, adoption, risk drift, evidence confidence and maturity propagation."},
  {id:"hitl",framework:"HITL",title:"Human approvals for high-stakes AI actions",duration:"04:20",level:"Operator",owner:"COO + CAIO",roles:["coo","caio","ciso","cdpo","cgo"],outcomes:["Know which actions require approval","Capture approval evidence","Escalate exceptions cleanly"],evidence:"HITL approval simulation and sign-off record",desc:"A short operating guide to approvals, rejections, exception handling and audit trail capture for high-stakes AI workflows."},
];

const ROLE_LEARNING_PATHS = {
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

function academyEvidenceFor(role, seeded=false) {
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
const F = {
  h: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  b: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  e: "DM Serif Display, Georgia, serif",
  m: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  logo: "Manrope, Inter, ui-sans-serif, system-ui, sans-serif",
};

function cleanText(value) {
  const s=String(value ?? "");
  return s
    .replace(/[\u00c2\u00c3\u00e2\u20ac\ufffd]/g,"")
    .replace(/'{3,}/g,"")
    .replace(/\s{2,}/g," ")
    .trim();
}

function glyphIconFor(value) {
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

function Glyph({name, color=T.ink3, size=16, strokeWidth=1.8, style={}}) {
  const Icon=glyphIconFor(name);
  return <Icon size={size} color={color} strokeWidth={strokeWidth} style={{display:"block",flexShrink:0,...style}} aria-hidden="true"/>;
}

function IconBox({name, color=T.blue, size=16, style={}}) {
  return <div style={{width:34,height:34,borderRadius:8,background:color+"14",border:`1px solid ${color}32`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...style}}>
    <Glyph name={name} color={color} size={size}/>
  </div>;
}

const Tag = ({label, color=T.ink3, bg}) => (
  <span style={{display:"inline-block",background:bg||color+"18",color,border:`1px solid ${color}28`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:600,fontFamily:F.m,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{cleanText(label)}</span>
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
  const light=T.bg==="#F7F8FA";
  const shadow=light
    ? "0 1px 2px rgba(17,24,39,.04), 0 12px 28px rgba(11,78,162,.06)"
    : "0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)";
  return <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:glow?`0 0 28px ${glow}15`:shadow,...style}}>{children}</div>;
}

function SHead({title, sub}) {
  return <div style={{marginBottom:20}}>
    <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:800,color:T.ink,letterSpacing:0,marginBottom:4,lineHeight:1.2}}>{cleanText(title)}</h2>
    {sub&&<p style={{fontSize:12,color:T.ink3,fontFamily:F.b}}>{cleanText(sub)}</p>}
  </div>;
}

function Toast({msg,type}) {
  const prefix=type==="success"?"Saved: ":"Alert: ";
  return <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,background:type==="success"?T.green:T.red,color:"#fff",borderRadius:8,padding:"10px 18px",fontSize:12,fontWeight:700,fontFamily:F.b,boxShadow:"0 8px 32px rgba(0,0,0,.32)",animation:"up .3s ease"}}>{prefix}{cleanText(msg)}</div>;
}

/* Section */
function BrandLogo({theme,width=160,style={}}) {
  const src=theme==="dark"?"/brand/veriszone-dark-transparent.png":"/brand/veriszone-light-blue-gold.png";
  const filter=theme==="dark"?"contrast(1.04) saturate(1.04)":"contrast(1.06) saturate(1.04)";
  return <img src={src} alt="VerisZone" width={width} style={{width,height:"auto",objectFit:"contain",display:"block",filter,...style}}/>;
}

function AICentralLogo({width=64,compact=false,style={}}) {
  const src=compact?"/brand/ai-central-symbol.png":"/brand/ai-central-logo.png";
  return <img src={src} alt="AI Central" width={width} style={{width,height:"auto",display:"block",objectFit:"contain",borderRadius:compact?10:16,filter:compact?"contrast(1.18) saturate(1.22) brightness(1.08)":"contrast(1.08) saturate(1.12)",...style}}/>;
}

function AICentralBrand({theme,width=112,compact=false,style={}}) {
  return <div style={{display:"inline-flex",alignItems:"center",gap:compact?8:14,...style}}>
    <AICentralLogo width={width} compact style={{flexShrink:0,boxShadow:theme==="light"?"0 14px 34px rgba(11,78,162,.10)":"0 22px 62px rgba(43,132,255,.24)"}}/>
    <div style={{minWidth:0}}>
      <div style={{fontSize:compact?14:28,fontWeight:900,fontFamily:F.h,color:theme==="light"?"#0B2F75":"#EAF2FF",lineHeight:1,letterSpacing:0,textShadow:theme==="light"?"none":"0 0 18px rgba(43,132,255,.34)"}}>AI Central</div>
      <div style={{fontSize:compact?8:11,fontWeight:800,fontFamily:F.b,color:theme==="light"?T.ink3:"#B8C7E6",letterSpacing:compact?"0.02em":"0.08em",marginTop:compact?2:6,textTransform:compact?"none":"uppercase"}}>One Intelligence, One Direction.</div>
    </div>
  </div>;
}

function LoginAICentralBrand({theme,width=104,style={}}) {
  const isLight=theme==="light";
  const glow=isLight?"rgba(37,99,235,.22)":"rgba(43,132,255,.42)";
  const titleColor=isLight?"#0B2F75":"#EAF2FF";
  const taglineColor=isLight?T.blue:AI_GOLD;
  return <div style={{display:"inline-flex",alignItems:"center",gap:16,...style}}>
    <div className="ai-login-mark" style={{width:width*1.28,height:width,position:"relative",flexShrink:0}}>
      <svg viewBox="0 0 154 120" width={width*1.28} height={width} role="img" aria-label="AI Central pilot-to-scale orchestration animation" style={{display:"block",overflow:"visible",filter:`drop-shadow(0 18px 34px ${glow})`}}>
        <defs>
          <radialGradient id="aiLoginCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="38%" stopColor="#DDF4FF"/>
            <stop offset="72%" stopColor="#2B84FF"/>
            <stop offset="100%" stopColor="#0B4EA2"/>
          </radialGradient>
          <linearGradient id="aiLoginBlue" x1="0" x2="1">
            <stop stopColor="#38BDF8"/>
            <stop offset="1" stopColor="#0B4EA2"/>
          </linearGradient>
          <linearGradient id="aiLoginGold" x1="0" x2="1">
            <stop stopColor="#F6D782"/>
            <stop offset="1" stopColor="#C99A2E"/>
          </linearGradient>
          <linearGradient id="aiLoginNebula" x1="0" x2="1">
            <stop stopColor="#2563EB" stopOpacity=".05"/>
            <stop offset=".48" stopColor="#38BDF8" stopOpacity=".42"/>
            <stop offset="1" stopColor="#D6A84F" stopOpacity=".06"/>
          </linearGradient>
        </defs>
        <rect x="8" y="10" width="138" height="100" rx="26" fill={isLight?"#F8FBFF":"#0B101D"} opacity=".94"/>
        <path d="M17 73 C42 17 114 17 138 73" fill="none" stroke="url(#aiLoginNebula)" strokeWidth="16" strokeLinecap="round" opacity=".9"/>
        <path d="M18 76 C42 34 112 34 137 76" fill="none" stroke="url(#aiLoginBlue)" strokeWidth="2.4" strokeDasharray="10 12" strokeLinecap="round" style={{animation:"aiLoginMilkyway 7.2s linear infinite"}}/>
        <path d="M25 51 C48 92 105 92 130 51" fill="none" stroke="url(#aiLoginGold)" strokeWidth="2.4" strokeDasharray="8 12" strokeLinecap="round" style={{animation:"aiLoginMilkyway 8s linear infinite reverse"}}/>
        <g style={{transformOrigin:"77px 60px",animation:"aiLoginGalaxy 16s linear infinite"}}>
          <circle cx="35" cy="68" r="3.2" fill="#2B84FF" opacity=".88"/>
          <circle cx="51" cy="38" r="2.4" fill="#38BDF8" opacity=".72"/>
          <circle cx="101" cy="37" r="2.8" fill="#D6A84F" opacity=".84"/>
          <circle cx="121" cy="71" r="3.4" fill="#C99A2E" opacity=".74"/>
          <circle cx="77" cy="24" r="2.2" fill="#EAF2FF" opacity=".58"/>
          <circle cx="77" cy="96" r="2.2" fill="#EAF2FF" opacity=".42"/>
        </g>
        <g style={{transformOrigin:"77px 60px",animation:"aiLoginSpine 3.4s ease-in-out infinite"}}>
          <rect x="74" y="22" width="6" height="76" rx="3" fill="url(#aiLoginBlue)" opacity=".74"/>
          <circle cx="77" cy="32" r="4" fill="url(#aiLoginGold)"/>
          <circle cx="77" cy="46" r="4" fill="#38BDF8"/>
          <circle cx="77" cy="74" r="4" fill="#38BDF8"/>
          <circle cx="77" cy="88" r="4" fill="url(#aiLoginGold)"/>
        </g>
        <path d="M23 60 C39 55 51 57 60 60" stroke="url(#aiLoginBlue)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M94 60 C106 57 118 55 133 60" stroke="url(#aiLoginGold)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="60" r="6" fill="#2B84FF" style={{transformOrigin:"24px 60px",animation:"aiLoginNode 3.2s ease-in-out infinite"}}/>
        <circle cx="132" cy="60" r="6" fill="#D6A84F" style={{transformOrigin:"132px 60px",animation:"aiLoginNode 3.2s ease-in-out .55s infinite"}}/>
        <circle cx="77" cy="60" r="18" fill={isLight?"#FFFFFF":"#111827"} stroke="#BFD7FF" strokeWidth="1.5" opacity=".96"/>
        <circle cx="77" cy="60" r="11" fill="url(#aiLoginCore)" style={{transformOrigin:"77px 60px",animation:"aiLoginCore 3s ease-in-out infinite"}}/>
        <circle cx="77" cy="60" r="4" fill="#FFFFFF"/>
        <circle cx="48" cy="58" r="3" fill="#38BDF8" style={{animation:"aiLoginConvergeA 3.6s ease-in-out infinite"}}/>
        <circle cx="108" cy="62" r="3" fill="#D6A84F" style={{animation:"aiLoginConvergeB 4s ease-in-out .4s infinite"}}/>
        <g style={{animation:"aiLoginDecision 3.8s ease-in-out infinite"}}>
          <path d="M112 34 H128 V50" fill="none" stroke="url(#aiLoginGold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M126 34 L134 34 L134 42" fill="none" stroke="url(#aiLoginGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    </div>
    <div style={{minWidth:0}}>
      <div style={{fontSize:30,fontWeight:900,fontFamily:F.h,color:titleColor,lineHeight:1,letterSpacing:0,animation:"aiLoginTitle 4.6s ease-in-out infinite",textShadow:isLight?"none":"0 0 18px rgba(43,132,255,.32)"}}>AI Central</div>
      <div style={{fontSize:11,fontWeight:900,fontFamily:F.b,color:taglineColor,letterSpacing:"0.12em",marginTop:8,textTransform:"uppercase",animation:"aiLoginTagline 4.6s ease-in-out infinite"}}>One Intelligence, One Direction.</div>
    </div>
  </div>;
}

const SIDEBAR_W = 236;

function Sidebar({tab,setTab,role,hitlCount,open,onClose,aiCentralView,setAiCentralView,theme,profiles,sessionMode}) {
  const rc=RC(role), R=ROLES[role];
  const profileKey=sessionMode==="demo"?"demo":sessionMode==="aicentral"?"aicentral":role;
  const U=profiles?.[profileKey]||USER_PROFILES[profileKey]||R;
  const initials=(U.name||R.name).split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const isMobile=typeof window!=="undefined"&&window.innerWidth<768;
  const isAICentral=tab==="aicentral";
  const navById=Object.fromEntries([...NAV,...CAIO_EXTRA_NAV].map(item=>[item.id,item]));
  const roleNavSections=EXECUTIVE_ROLE_IDS.includes(role)?EXECUTIVE_NAV_SECTIONS:NAV_SECTIONS;
  const themeClass=theme==="light"?"vz-light":"vz-dark";
  const spring={type:"spring",stiffness:420,damping:38};
  let navIdx=0;
  const renderNavButton=(item)=>{
    const isA=tab===item.id;
    const badge=item.id==="hitl"&&hitlCount>0;
    const delay=Math.min(navIdx++*0.018,0.28);
    return <button key={item.id} className={`vz-nav-btn ${themeClass}`} onClick={()=>{setTab(item.id);if(isMobile)onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,marginBottom:2,background:"transparent",border:"1px solid transparent",color:isA?rc:T.ink2,fontSize:11,fontWeight:isA?800:600,fontFamily:F.b,textAlign:"left",position:"relative",cursor:"pointer",animation:"vzNavIn .3s ease both",animationDelay:`${delay}s`}}>
      {isA&&<motion.span layoutId="vzNavActive" transition={spring} style={{position:"absolute",inset:0,borderRadius:9,background:theme==="light"?T.blueL:`linear-gradient(90deg,${rc}20,${rc}09 62%,transparent)`,border:`1px solid ${theme==="light"?T.blue+"30":rc+"38"}`,boxShadow:theme==="light"?"none":`inset 0 0 20px ${rc}0D`}}/>}
      {isA&&<motion.span layoutId="vzNavRail" transition={spring} style={{position:"absolute",left:0,top:7,bottom:7,width:3,borderRadius:4,background:`linear-gradient(180deg,${rc},${AI_GOLD})`,boxShadow:`0 0 12px ${rc}66`}}/>}
      <span className="vz-nav-ico" style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",opacity:isA?1:.72,flexShrink:0,position:"relative",zIndex:1,transition:"opacity .18s ease"}}><Glyph name={item.label} color={isA?rc:T.ink3} size={14}/></span>
      <span style={{position:"relative",zIndex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span>
      {badge&&<span style={{position:"absolute",right:8,zIndex:1,background:T.amber,color:"#000",fontSize:8,fontWeight:800,borderRadius:8,padding:"1px 4px",fontFamily:F.m,animation:"vzBadgePulse 2.4s ease-in-out infinite"}}>{hitlCount}</span>}
    </button>;
  };
  const renderSectionHeader=(title)=>(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"14px 10px 7px"}}>
      <span style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:F.m,whiteSpace:"nowrap"}}>{title}</span>
      <span aria-hidden style={{flex:1,height:1,background:`linear-gradient(90deg,${T.border},transparent)`}}/>
    </div>
  );
  return <>
    {/* Overlay on mobile */}
    {open&&isMobile&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:199,backdropFilter:"blur(2px)"}}/>}
    <div style={{width:SIDEBAR_W,background:theme==="light"?"#FFFFFF":`linear-gradient(180deg,${T.s1} 0%,#0B0E15 100%)`,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:200,transform:isMobile?(open?"translateX(0)":"translateX(-100%)"):"translateX(0)",transition:"transform .25s ease",overflowX:"hidden",boxShadow:theme==="light"?"12px 0 34px rgba(17,24,39,.06)":"14px 0 40px rgba(0,0,0,.35)"}}>
      <div style={{padding:"14px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9,minHeight:64}}>
        <BrandLogo theme={theme} width={168} style={{objectPosition:"left center"}}/>
        {isMobile&&<button aria-label="Close navigation" onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:T.ink3,padding:6,cursor:"pointer",display:"flex"}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>}
      </div>
      <nav className="vz-side-nav" style={{flex:1,padding:"10px 9px",overflowY:"auto"}}>
        {isAICentral&&<div style={{padding:"6px 8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:10}}>
          <AICentralBrand theme={theme} width={42} compact style={{marginBottom:8}}/>
          <div style={{fontSize:10,color:T.ink3,lineHeight:1.5,fontFamily:F.b}}>Standalone AI operating center for downstream pilot execution, guardrails, evidence and scale readiness.</div>
        </div>}
        {isAICentral&&AI_CENTRAL_NAV.map((item,idx)=>{
          const isA=aiCentralView===item.id;
          return <button key={item.id} className={`vz-nav-btn ${themeClass}`} onClick={()=>{setAiCentralView(item.id);if(isMobile)onClose();}} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:9,padding:"9px 10px",borderRadius:9,marginBottom:3,background:"transparent",border:"1px solid transparent",color:isA?AI_GOLD:T.ink3,fontSize:11,fontWeight:isA?700:500,fontFamily:F.b,textAlign:"left",position:"relative",cursor:"pointer",animation:"vzNavIn .3s ease both",animationDelay:`${Math.min(idx*0.025,0.28)}s`}}>
            {isA&&<motion.span layoutId="vzNavActive" transition={spring} style={{position:"absolute",inset:0,borderRadius:9,background:`linear-gradient(90deg,${AI_GOLD}20,${AI_GOLD}09 62%,transparent)`,border:`1px solid ${AI_GOLD}42`,boxShadow:`inset 0 0 20px ${AI_GOLD}0D`}}/>}
            {isA&&<motion.span layoutId="vzNavRail" transition={spring} style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:4,background:AI_GOLD,boxShadow:`0 0 12px ${AI_GOLD}66`}}/>}
            <span style={{width:18,height:18,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:isA?AI_GOLD+"24":T.s2,color:isA?AI_GOLD:T.ink4,fontSize:9,fontWeight:900,fontFamily:F.m,flexShrink:0,position:"relative",zIndex:1}}>{idx+1}</span>
            <span style={{minWidth:0,position:"relative",zIndex:1}}><span style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span><span style={{display:"block",fontSize:9,color:T.ink4,fontWeight:500,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.sub}</span></span>
          </button>;
        })}
        {!isAICentral&&roleNavSections.map(section=>{
          const items=section.items.map(id=>navById[id]).filter(Boolean);
          return <div key={section.title} style={{marginBottom:4}}>
            {renderSectionHeader(section.title)}
            {items.map(renderNavButton)}
          </div>;
        })}
        {!isAICentral&&role==="caio"&&CAIO_NAV_SECTIONS.map(section=>{
          const items=section.items.map(item=>typeof item==="string"?navById[item]:item).filter(Boolean);
          return <div key={section.title} style={{marginBottom:4}}>
            {renderSectionHeader(section.title)}
            {items.map(renderNavButton)}
          </div>;
        })}
      </nav>
      <a href="/profile" className={`vz-profile-btn ${themeClass}`} onClick={(e)=>{e.preventDefault();setTab("profile");if(isMobile)onClose();}} style={{cursor:"pointer",width:"100%",padding:"13px 14px",border:0,borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,background:"transparent",textAlign:"left",textDecoration:"none"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${rc},${theme==="light"?T.blue:AI_GOLD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 12px 28px ${rc}30`}}>
          <span style={{color:"#fff",fontSize:11,fontWeight:900,fontFamily:F.b,letterSpacing:0}}>{initials}</span>
        </div>
        <span style={{position:"absolute",right:-1,bottom:-1,width:9,height:9,borderRadius:"50%",background:T.green,border:`2px solid ${theme==="light"?"#FFFFFF":T.bg}`}}/>
      </div>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{fontSize:12,fontWeight:900,color:T.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:F.b}}>{cleanText(U.name||R.name)}</div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cleanText(U.email||`${R.label} Workspace`)}</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,color:T.ink4}}><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
    </div>
  </>;
}

/* Section */
function PageAISpine({mode="overview",setTab}) {
  const titles={
    overview:["AI Spine Overview","The proprietary orchestration layer translating CXO intent into controlled AI execution."],
    dna:["AI Initiative DNA","A compact fingerprint of the use case, affected CXOs, inherited learning, controls, evidence and scale intent."],
    controlmatrix:["Control Activation Matrix","Shows which controls were activated by risk class, department, regulation and pilot context."],
    scalegate:["Scale Readiness Engine","Decides whether each pilot is ready to Scale, Hold, Remediate, or Stop."],
    riskdrift:["AI Risk Drift Engine","Monitors whether live pilots are moving outside approved risk appetite."],
    evidenceconfidence:["Evidence Confidence Ledger","Measures the quality, completeness, and audit strength of proof before expansion."],
    maturitymap:["AI Maturity Propagation Map","Shows how learning from each pilot improves the next department rollout."]
  };
  const [title,sub]=titles[mode]||titles.overview;
  const decisionColor=d=>d==="Scale"?T.green:d==="Hold"?T.amber:d==="Remediate"?T.red:T.ink3;
  const driftColor=d=>String(d).startsWith("+")?T.red:T.green;
  const activePrograms=AI_ROLLOUT_PROGRAMS;
  const initiativeDna=[
    {label:"Use-case pattern",value:"Customer-facing assistance with human escalation",detail:"Classifies pilot behavior before controls are activated."},
    {label:"Affected CXOs",value:"COO, CIO, CAIO, CISO, CDPO",detail:"CXO Impact Graph determines who must review or own tasks."},
    {label:"Risk class",value:"High Risk",detail:"Human impact, customer interaction and data handling drive governance class."},
    {label:"Scale intent",value:"Multi-department rollout",detail:"Pilot learning is retained before moving to the next department."},
    {label:"Inherited learning",value:"2 control adjustments",detail:"Prompt-injection evidence and HITL escalation thresholds will transfer forward."},
    {label:"Evidence requirements",value:"Model card, DPIA, HITL log, security test",detail:"AI Central tracks completion and confidence before expansion."},
  ];
  const controlMatrix=[
    {domain:"Human Oversight",trigger:"High-impact customer workflow",controls:"HITL override, escalation policy, decision log",evidence:"Approval trail",owner:"CAIO",status:"Activated"},
    {domain:"Security",trigger:"Generative AI in production pilot",controls:"Prompt injection test, logging, red-team review",evidence:"Security test pack",owner:"CISO",status:"Monitoring"},
    {domain:"Privacy",trigger:"Customer data processing",controls:"DPIA, minimization, retention policy",evidence:"DPIA summary",owner:"CDPO",status:"Activated"},
    {domain:"Value",trigger:"Scale gate requested",controls:"ROI benchmark, adoption score, benefit realization",evidence:"Value report",owner:"CFO",status:"In Review"},
    {domain:"Operations",trigger:"Department rollout",controls:"Training, exception handling, runbook",evidence:"Pilot workspace log",owner:"COO",status:"Monitoring"},
  ];
  const spineCapabilities=[
    ["Governance-to-Execution Translator","Converts CXO decisions into pilot tasks, controls, guardrails and evidence requirements."],
    ["Control Activation Matrix","Activates the right controls based on AI class, department, risk and regulation."],
    ["Scale Gate Decision Engine","Recommends Scale, Hold, Remediate or Stop using evidence, value, adoption and risk drift."],
    ["Evidence Confidence Ledger","Scores whether audit proof is complete enough for board, regulator and next-wave expansion."],
  ];

  return <div style={{animation:"up .3s ease"}}>
    <div style={{background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${AI_GOLD}32`,borderRadius:16,padding:"22px 24px",marginBottom:14,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:-70,top:-90,width:260,height:260,borderRadius:"50%",background:AI_GOLD+"12",filter:"blur(18px)"}}/>
      <Tag label="AI SPINE" color={AI_GOLD} bg={AI_GOLD_L}/>
      <h1 style={{fontFamily:F.h,fontSize:30,fontWeight:900,color:T.ink,margin:"10px 0 6px",letterSpacing:"-0.02em"}}>{title}</h1>
      <p style={{fontFamily:F.b,fontSize:12,color:T.ink3,lineHeight:1.7,maxWidth:780,margin:0}}>{sub}</p>
    </div>

    {mode==="overview"&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {AI_SPINE_SIGNALS.map(s=><Card key={s.label} style={{padding:16}}>
          <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{s.label}</div>
          <div style={{fontSize:26,fontWeight:900,fontFamily:F.h,color:s.color,marginBottom:2}}>{s.value}</div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.sub}</div>
        </Card>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {spineCapabilities.map(([name,desc])=><Card key={name} style={{padding:16}}>
          <div style={{fontSize:14,fontWeight:900,color:T.ink,fontFamily:F.h,marginBottom:7}}>{name}</div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>{desc}</p>
        </Card>)}
      </div>
    </>}

    {mode==="dna"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {initiativeDna.map((item,idx)=><Card key={item.label} style={{padding:16,border:`1px solid ${idx%2===0?AI_GOLD+"32":T.border}`}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{item.label}</div>
        <div style={{fontSize:18,fontWeight:900,fontFamily:F.h,color:idx%2===0?AI_GOLD:T.ink,marginBottom:6}}>{item.value}</div>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{item.detail}</p>
      </Card>)}
    </div>}

    {mode==="controlmatrix"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink}}>Control Activation Matrix</h3>
        <Tag label="AI Spine activated" color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>{["Domain","Trigger","Activated Controls","Evidence","Owner","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{controlMatrix.map((row,idx)=><tr key={row.domain} style={{borderBottom:idx<controlMatrix.length-1?`1px solid ${T.border}`:"none"}}>
            <td style={{padding:"13px 12px",color:T.ink,fontWeight:900,fontFamily:F.b}}>{row.domain}</td>
            <td style={{padding:"13px 12px",color:T.ink2,lineHeight:1.45}}>{row.trigger}</td>
            <td style={{padding:"13px 12px",color:T.ink2,lineHeight:1.45}}>{row.controls}</td>
            <td style={{padding:"13px 12px",color:T.ink2}}>{row.evidence}</td>
            <td style={{padding:"13px 12px",color:AI_GOLD,fontWeight:900,fontFamily:F.m}}>{row.owner}</td>
            <td style={{padding:"13px 12px"}}><Tag label={row.status} color={row.status==="Activated"?T.green:row.status==="In Review"?T.amber:AI_GOLD} bg={(row.status==="Activated"?T.green:row.status==="In Review"?T.amber:AI_GOLD)+"18"}/></td>
          </tr>)}</tbody>
        </table>
      </div>
    </Card>}

    {mode==="scalegate"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink}}>Scale Gate Decision Engine</h3>
        <Tag label="Standalone workspace" color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      {activePrograms.map((p,i)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1.2fr 110px 90px 90px 100px",gap:10,alignItems:"center",padding:"13px 16px",borderBottom:i<activePrograms.length-1?`1px solid ${T.border}`:"none"}}>
        <div><div style={{fontSize:12,color:T.ink,fontWeight:900,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>Pilot {p.pilot}; next wave {p.next}</div></div>
        <Tag label={p.stage} color={AI_GOLD} bg={AI_GOLD+"18"}/>
        <span style={{fontFamily:F.m,color:T.ink,fontSize:12}}>{p.readiness}% ready</span>
        <Ring score={p.readiness} color={p.readiness>=85?T.green:p.readiness>=70?AI_GOLD:T.red} size={46}/>
        <Tag label={p.decision} color={decisionColor(p.decision)} bg={decisionColor(p.decision)+"18"}/>
      </div>)}
    </Card>}

    {mode==="riskdrift"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
      {activePrograms.map(p=><Card key={p.id} style={{padding:16,border:`1px solid ${driftColor(p.riskDrift)}30`}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:12}}>
          <div><h3 style={{fontFamily:F.h,fontSize:16,color:T.ink,margin:"0 0 4px"}}>{p.name}</h3><p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:0}}>{p.pilot} pilot risk drift against approved appetite</p></div>
          <Tag label={p.riskDrift} color={driftColor(p.riskDrift)} bg={driftColor(p.riskDrift)+"18"}/>
        </div>
        <Bar value={Math.min(100,Math.abs(parseInt(p.riskDrift,10))*5+40)} color={driftColor(p.riskDrift)}/>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:10}}>{p.blocker}</div>
      </Card>)}
    </div>}

    {mode==="evidenceconfidence"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
      {activePrograms.map(p=><Card key={p.id} style={{padding:16}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <Ring score={p.evidence} color={p.evidence>=85?T.green:p.evidence>=70?AI_GOLD:T.red} size={64}/>
          <div><h3 style={{fontFamily:F.h,fontSize:16,color:T.ink,margin:"0 0 5px"}}>{p.name}</h3><div style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>Evidence confidence: <strong style={{color:T.ink}}>{p.evidence}%</strong></div><p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"6px 0 0",lineHeight:1.5}}>{p.blocker}</p></div>
        </div>
      </Card>)}
    </div>}

    {mode==="maturitymap"&&<Card style={{padding:18}}>
      <h3 style={{fontFamily:F.h,fontSize:16,color:T.ink,margin:"0 0 14px"}}>Enterprise AI Maturity Propagation</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {activePrograms.map(p=><div key={p.id} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:13}}>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{p.pilot}</div>
          <div style={{fontSize:14,color:T.ink,fontWeight:900,fontFamily:F.h,lineHeight:1.25,minHeight:40}}>{p.name}</div>
          <div style={{margin:"12px 0"}}><Bar value={p.adoption} color={p.adoption>=70?T.green:p.adoption>=50?AI_GOLD:T.red}/></div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Learning transfers to {p.next}. Adoption {p.adoption}%, value {p.value}.</div>
        </div>)}
      </div>
    </Card>}
  </div>;
}

/* Section */
function PageHome({role,setTab}) {
  const rc=RC(role), K=KPI[role]||KPI.caio;
  const metrics=DOMAIN_METRICS[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const standards=STANDARDS_MAP[role]||[];
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const R=ROLES[role];
  const [kpiPage,setKpiPage]=useState(0);
  const KPI_PAGE_SIZE=5;
  const pagedKpis=roleKpis.slice(kpiPage*KPI_PAGE_SIZE,(kpiPage+1)*KPI_PAGE_SIZE);
  const totalKpiPages=Math.ceil(roleKpis.length/KPI_PAGE_SIZE);

  const topKpis=[
    {label:K.domainLabel,        value:K.score+"/100", sub:K.scoreLabel,    color:rc,       badge:"Maturity", tab:"compliance"},
    {label:"Overall Compliance", value:K.compliance+"%",sub:"All frameworks",color:T.teal,  badge:"Coverage", tab:"compliance"},
    {label:"Active Risks",       value:K.risks,        sub:"In register",   color:T.amber,  badge:"Risk", tab:role==="caio"?"aira":"compliance"},
    {label:"HITL Pending",       value:K.hitl,         sub:"Need approval", color:T.violet, badge:"Approvals",tab:"hitl"},
  ];

  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink3;

  return <div style={{animation:"up .3s ease"}}>
    {/* Header */}
    <div style={{marginBottom:18}}>
      <h1 style={{fontFamily:F.e,fontSize:30,fontWeight:400,color:T.ink,letterSpacing:0,marginBottom:4}}>{greet}, {R.name.split(" ")[0]}</h1>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{R.title} - {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
    </div>

    {/* Top KPI strip */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
      {topKpis.map((k,i)=><div key={k.label} onClick={()=>setTab(k.tab)}
        style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"border-color .2s"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=k.color+"60"}
        onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        <div style={{position:"absolute",top:0,right:0,width:50,height:50,background:`radial-gradient(circle at top right,${k.color}15,transparent 70%)`}}/>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",height:22,padding:"0 8px",borderRadius:999,background:k.color+"14",border:"1px solid "+k.color+"32",color:k.color,fontSize:9,fontWeight:800,fontFamily:F.m,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{k.badge}</div>
        <div style={{fontSize:24,fontWeight:700,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:2}}>{k.value}</div>
        <div style={{fontSize:10,fontWeight:600,color:T.ink2,fontFamily:F.b,marginBottom:1}}>{k.label}</div>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </div>)}
    </div>

    {/* Enterprise AI Transformation Control Plane */}
    <Card style={{padding:16,marginBottom:12,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${T.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,marginBottom:14}}>
        <div>
          <div style={{fontSize:9,fontWeight:900,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.16em",fontFamily:F.m,marginBottom:6}}>Enterprise AI Transformation Control Plane</div>
          <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:T.ink,marginBottom:5}}>Pilot-to-scale governance spine</h2>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,maxWidth:760}}>Launch AI department by department. CXOs own strategy and accountability; AI Central executes; AI Spine monitors readiness, risk drift, evidence confidence and scale decisions.</p>
        </div>
        <Tag label="AI Central executes after standalone sign in" color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
        {AI_SPINE_SIGNALS.map(s=><div key={s.label} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
          <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{s.label}</div>
          <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:s.color,marginBottom:2}}>{s.value}</div>
          <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{s.sub}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr .8fr",gap:10}}>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink}}>Active AI rollout programs</h3>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Idea - Pilot - Scale</span>
          </div>
          {AI_ROLLOUT_PROGRAMS.slice(0,3).map((p,i)=>{
            const decisionColor=p.decision==="Scale"?T.green:p.decision==="Hold"?T.amber:p.decision==="Remediate"?T.red:T.ink3;
            return <div key={p.id} style={{padding:"10px 12px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"grid",gridTemplateColumns:"1.2fr 95px 78px 70px",gap:8,alignItems:"center"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,fontWeight:900,color:T.ink,fontFamily:F.b,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Pilot: {p.pilot} to Next: {p.next}</div>
              </div>
              <Tag label={p.stage} color={RC(p.owner.toLowerCase())||AI_GOLD} bg={(RC(p.owner.toLowerCase())||AI_GOLD)+"18"}/>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.m}}>{p.readiness}% ready</span>
              <Tag label={p.decision} color={decisionColor} bg={decisionColor+"18"}/>
            </div>;
          })}
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:12}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,marginBottom:10}}>Scale gate focus</h3>
          {AI_ROLLOUT_PROGRAMS.slice(0,3).map(p=><div key={p.id} style={{display:"grid",gridTemplateColumns:"42px 1fr",gap:10,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <Ring score={p.evidence} color={p.evidence>=85?T.green:p.evidence>=70?AI_GOLD:T.red} size={40}/>
            <div>
              <div style={{fontSize:10,color:T.ink,fontWeight:900,fontFamily:F.b}}>{p.name}</div>
              <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{p.blocker}</div>
            </div>
          </div>)}
        </div>
      </div>
    </Card>

    {/* Domain metrics  */}
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>{R.label} Domain Metrics</h3>
        <button onClick={()=>setTab("compliance")} style={{fontSize:9,color:rc,background:"none",border:"none",fontFamily:F.b,fontWeight:600}}>Full scorecard</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {metrics.map((m,i)=>{
          const col=m.color;
          return <div key={m.label} style={{background:T.s3,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${col}`,animation:`up ${.3+i*.05}s ease both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b,fontWeight:500,lineHeight:1.3,flex:1,paddingRight:6}}>{m.label}</span>
              <span style={{fontSize:9,fontFamily:F.m,color:m.trend>0&&m.label.includes("Violation")?"red":m.trend>0?T.green:T.red,whiteSpace:"nowrap"}}>
                {m.trend>0?"Up":"Down"} {Math.abs(m.trend)}{m.unit==="%" ?"%":""}
              </span>
            </div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:F.m,color:col,letterSpacing:"-0.02em"}}>{m.value}{m.unit}</div>
            <div style={{fontSize:8,color:T.ink4,fontFamily:F.m,marginTop:3}}>{m.fw}</div>
          </div>;
        })}
      </div>
    </Card>

    {/* Role-specific KPI table */}
    <Card style={{marginBottom:12,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{R.label} KPI & Standards Table</h3>
        <button onClick={()=>setTab("compliance")} style={{fontSize:9,color:rc,background:"none",border:"none",fontFamily:F.b,fontWeight:600}}>View all</button>
      </div>
      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"7px 14px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
        {["KPI Category","KPI / Metric","Target","Threshold","Framework","Status"].map(h=>
          <span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>
        )}
      </div>
      {pagedKpis.map((k,i)=>{
        const sc=stColor(k.status);
        return <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"9px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:i%2===0?T.s1:T.bg}}>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{k.cat}</span>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{k.kpi}</div>
            <span style={{fontSize:9,color:rc,fontFamily:F.m,fontWeight:700}}>{k.value}</span>
          </div>
          <span style={{fontSize:9,color:T.green,fontFamily:F.m}}>{k.target}</span>
          <span style={{fontSize:9,color:T.red,fontFamily:F.m}}>{k.threshold}</span>
          <span style={{fontSize:9,color:T.ink3,fontFamily:F.m}}>{k.fw}</span>
          <Tag label={k.status} color={sc} bg={sc+"18"}/>
        </div>;
      })}
      {totalKpiPages>1&&<div style={{padding:"8px 14px",display:"flex",gap:6,alignItems:"center",borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>setKpiPage(p=>Math.max(0,p-1))} disabled={kpiPage===0}
          style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:5,padding:"3px 10px",fontSize:10,color:kpiPage===0?T.ink4:T.ink,fontFamily:F.b,opacity:kpiPage===0?.4:1}}>Prev</button>
        <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{kpiPage+1}/{totalKpiPages}</span>
        <button onClick={()=>setKpiPage(p=>Math.min(totalKpiPages-1,p+1))} disabled={kpiPage===totalKpiPages-1}
          style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:5,padding:"3px 10px",fontSize:10,color:kpiPage===totalKpiPages-1?T.ink4:T.ink,fontFamily:F.b,opacity:kpiPage===totalKpiPages-1?.4:1}}>Next</button>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginLeft:4}}>{roleKpis.length} KPIs total</span>
      </div>}
    </Card>

    {/* Standards mapping */}
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Standards & Regulatory Mapping</h3>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {standards.map((s,i)=>{
          const col=s.score>=85?T.green:s.score>=70?T.blue:s.score>=50?T.amber:s.score>0?T.red:T.ink4;
          return <div key={s.std} style={{background:T.s3,borderRadius:8,padding:"9px 12px",display:"flex",gap:10,alignItems:"center",animation:`up ${.3+i*.05}s ease both`}}>
            <Ring score={s.score>0?s.score:0} color={col} size={38}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.m,marginBottom:2}}>{s.std}</div>
              <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.applies}</div>
              <Tag label={s.status} color={stColor(s.status)} bg={stColor(s.status)+"18"}/>
            </div>
          </div>;
        })}
      </div>
    </Card>

    {/* Quick actions */}
    <Card style={{padding:14,marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:10}}>Quick Access</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
        {[
          {label:"HITL Queue",tab:"hitl",color:T.amber,badge:"HQ"},
          {label:"Playbook",tab:"playbook",color:rc,badge:"PB"},
          {label:"ISO Checklists",tab:"checklists",color:T.teal,badge:"ISO"},
          {label:"AI Risk (AIRA)",tab:role==="caio"?"aira":"aia",color:T.red,badge:"AR"},
          {label:role==="caio"?"Model Registry":"Templates",tab:role==="caio"?"registry":"templates",color:T.violet,badge:role==="caio"?"MR":"TP"},
          {label:role==="caio"?"Use Case Pipeline":"Roadmap",tab:role==="caio"?"usecases":"roadmap",color:T.green,badge:role==="caio"?"UC":"RM"},
        ].map(q=><button key={q.label} onClick={()=>setTab(q.tab)}
          style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 10px",display:"flex",alignItems:"center",gap:7,color:T.ink2,fontSize:10,fontWeight:500,fontFamily:F.b,textAlign:"left",transition:"all .12s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=q.color+"50";e.currentTarget.style.color=q.color;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.ink2;}}>
          <span style={{minWidth:28,height:20,borderRadius:999,display:"inline-flex",alignItems:"center",justifyContent:"center",background:q.color+"18",border:"1px solid "+q.color+"35",color:q.color,fontSize:8,fontWeight:900,fontFamily:F.m}}>{q.badge}</span>{q.label}
        </button>)}
      </div>
    </Card>

    {/* HITL alert */}
    {K.hitl>0&&<div onClick={()=>setTab("hitl")}
      style={{background:`linear-gradient(135deg,${T.amberL},${T.s2})`,border:`1px solid ${T.amber}40`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite",flexShrink:0}}/>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:T.amber,fontFamily:F.b}}>{K.hitl} items awaiting your approval in the HITL Queue</div>
        <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>High-stakes decisions the AI cannot act on without your explicit sign-off.</p>
      </div>
      <span style={{color:T.amber,fontSize:12,fontWeight:800,fontFamily:F.b}}>Open queue</span>
    </div>}
  </div>;
}

/* Section */
function PageOnboard({role,showToast}) {
  const rc=RC(role), R=ROLES[role], steps=ONBOARD[role]||ONBOARD.caio||[];
  const [done,setDone]=useState({});
  const [open,setOpen]=useState(steps[0].id);
  useEffect(()=>{setDone({});setOpen(ONBOARD[role][0].id);},[role]);
  const count=Object.values(done).filter(Boolean).length;
  const toggle=id=>{setDone(d=>({...d,[id]:!d[id]}));showToast(!done[id]?"Step complete":"Marked incomplete");};
  return <div style={{maxWidth:680,animation:"up .3s ease"}}>
    {/* Welcome */}
    <div style={{background:`linear-gradient(135deg,${rc}25,${rc}08)`,border:`1px solid ${rc}35`,borderRadius:12,padding:"22px 24px",marginBottom:18,position:"relative",overflow:"hidden",boxShadow:`0 0 40px ${rc}10`}}>
      <div style={{position:"absolute",right:-30,top:-30,width:160,height:160,borderRadius:"50%",background:rc+"08"}}/>
      <Tag label={`Day 1 - ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`} color={rc} bg={rc+"20"}/>
      <h1 style={{fontFamily:F.e,fontSize:30,fontWeight:400,color:T.ink,letterSpacing:0,marginTop:12,marginBottom:8}}>{`Welcome, ${R.name.split(" ")[0]}.`}</h1>
      <p style={{fontSize:12,color:T.ink3,lineHeight:1.75,fontFamily:F.b,maxWidth:480,marginBottom:14}}>{R.title}</p>
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
            {done[s.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>OK</span>}
          </button>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,fontFamily:F.b,color:done[s.id]?T.ink4:T.ink,textDecoration:done[s.id]?"line-through":"none"}}>{s.title}</span>
            <Tag label={s.tag} color={s.urgent?T.red:T.ink3} bg={s.urgent?T.redL:T.ink5}/>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>~{s.time}</span>
            <span style={{color:T.ink4,transform:open===s.id?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block"}}>{">"}</span>
          </div>
        </div>
        {open===s.id&&<div style={{padding:"0 14px 14px 43px",borderTop:`1px solid ${T.border}`}}>
          <p style={{fontSize:12,color:T.ink3,lineHeight:1.75,fontFamily:F.b,marginTop:12,marginBottom:11}}>{s.desc}</p>
          <button onClick={()=>toggle(s.id)} style={{background:rc,color:"#fff",border:"none",borderRadius:6,padding:"7px 15px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{done[s.id]?"Mark Incomplete":"Mark Complete"}</button>
        </div>}
      </Card>)}
    </div>
  </div>;
}

/* Section */
function PageOpportunityIntake({role,setTab,showToast}) {
  const rc=RC(role), rcL=RCL(role), R=ROLES[role];
  const [idea,setIdea]=useState({
    name:"Customer Resolution Copilot",
    sponsor:"Customer Operations",
    pilot:"Customer Operations",
    next:"Retail Banking",
    tool:"GenAI Copilot",
    value:"Reduce average resolution time by 28% while improving first-contact resolution.",
    risk:"High",
    budget:"$450K",
    roi:"$4.8M",
  });
  const update=(key,value)=>setIdea(prev=>({...prev,[key]:value}));
  const readiness=[
    ["CIO feasibility","Architecture, data access, integration and vendor/tool fit",78,T.blue],
    ["CAIO suitability","AI governance class, HITL need and responsible AI suitability",82,rc],
    ["Pilot clarity","Department, user cohort, success metrics and scale intent",74,AI_GOLD],
    ["Evidence plan","Controls, audit trail, approvals and assurance artifacts",69,T.amber],
  ];
  const impacted=[
    ["CIO","Validate architecture and integration",T.blue,"roadmap"],
    ["CAIO","Classify AI suitability and governance obligations",rc,"strategy"],
    ["CISO","Review access, misuse, prompt injection and data leakage",T.red,"controls"],
    ["CDPO","Run DPIA and automated decision assessment",T.teal,"aiia"],
    ["CGO","Map policy, regulatory and board reporting obligations",AI_GOLD,"reports"],
  ];
  const submit=()=>{
    showToast&&showToast("Opportunity captured and routed to CXO Platform strategy review");
    setTab("strategy");
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Opportunity Intake" sub="Capture the AI idea, validate feasibility, assign CXO accountability and prepare the pilot for AI Central execution."/>
    <div style={{display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:14}}>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:16}}>
          <div>
            <Tag label="CXO PLATFORM FRONT DOOR" color={rc} bg={rcL}/>
            <h3 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:T.ink,margin:"10px 0 5px"}}>New AI initiative intake</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>This creates the strategic record before AI Central opens the downstream pilot workspace.</p>
          </div>
          <Tag label={R.label+" owner view"} color={rc} bg={rc+"18"}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:11}}>
          {[
            ["name","AI initiative name"],
            ["tool","Tool / use case type"],
            ["sponsor","Business sponsor"],
            ["pilot","Pilot department"],
            ["next","Next rollout department"],
            ["budget","Pilot budget"],
            ["roi","Value hypothesis"],
          ].map(([key,label])=><label key={key} style={{display:"grid",gap:6,fontFamily:F.b}}>
            <span style={{fontSize:10,fontWeight:900,color:T.ink3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
            <input value={idea[key]} onChange={e=>update(key,e.target.value)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 11px",color:T.ink,fontSize:12,fontFamily:F.b}}/>
          </label>)}
          <label style={{display:"grid",gap:6,fontFamily:F.b}}>
            <span style={{fontSize:10,fontWeight:900,color:T.ink3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Initial risk class</span>
            <select value={idea.risk} onChange={e=>update("risk",e.target.value)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 11px",color:T.ink,fontSize:12,fontFamily:F.b}}>
              {["Critical","High","Medium","Low"].map(v=><option key={v}>{v}</option>)}
            </select>
          </label>
          <label style={{display:"grid",gap:6,fontFamily:F.b,gridColumn:"1 / -1"}}>
            <span style={{fontSize:10,fontWeight:900,color:T.ink3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Business value and pilot success criteria</span>
            <textarea value={idea.value} onChange={e=>update("value",e.target.value)} rows={3} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 11px",color:T.ink,fontSize:12,fontFamily:F.b,resize:"vertical"}}/>
          </label>
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={submit} style={{background:rc,border:"none",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Create CXO strategy review</button>
          <button onClick={()=>showToast("CXO strategy review created. AI Central execution is available from its separate login.")} style={{background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:9,padding:"10px 14px",color:AI_GOLD,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Prepare AI Central handoff</button>
        </div>
      </Card>
      <div style={{display:"grid",gap:12}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 12px"}}>Readiness before pilot</h3>
          {readiness.map(([label,desc,score,col])=><div key={label} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:6}}>
              <div><div style={{fontSize:11,color:T.ink,fontWeight:900,fontFamily:F.b}}>{label}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{desc}</div></div>
              <span style={{fontSize:11,color:col,fontFamily:F.m,fontWeight:900}}>{score}%</span>
            </div>
            <Bar value={score} color={col}/>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 12px"}}>CXO Impact Graph</h3>
          <div style={{display:"grid",gap:8}}>
            {impacted.map(([label,desc,col,target])=><button key={label} onClick={()=>setTab(target)} style={{display:"grid",gridTemplateColumns:"44px 1fr",gap:10,alignItems:"center",background:col+"10",border:`1px solid ${col}30`,borderRadius:9,padding:"9px 10px",textAlign:"left",cursor:"pointer"}}>
              <span style={{fontSize:13,color:col,fontFamily:F.h,fontWeight:900}}>{label}</span>
              <span><span style={{display:"block",fontSize:10,color:T.ink,fontFamily:F.b,fontWeight:900}}>{desc}</span><span style={{display:"block",fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Open mapped workspace</span></span>
            </button>)}
          </div>
        </Card>
      </div>
    </div>
  </div>;
}

/* Section */
function PageStrategy({role,setTab}) {
  const rc=RC(role), rcL=RCL(role), R=ROLES[role], pillars=PILLARS[role]||PILLARS.caio||[];
  const [pn,setPn]=useState(""), [pd,setPd]=useState(""), [fws,setFws]=useState([]), [tl,setTl]=useState("1 month"), [pri,setPri]=useState("High");
  const [loading,setLoading]=useState(false), [result,setResult]=useState(null), [err,setErr]=useState("");
  useEffect(()=>{setResult(null);setErr("");setPn("");setPd("");setFws([]);},[role]);
  const toggleFw=fw=>setFws(p=>p.includes(fw)?p.filter(f=>f!==fw):[...p,fw]);
  const generate=async()=>{
    if(!pn.trim()||!pd.trim()){setErr("Project name and description are required.");return;}
    setErr("");setLoading(true);setResult(null);
    const fwList=fws.length?fws.join(", "):R.frameworks.join(", ");
    const systemPrompt="You are VerisZone's AI Strategy Engine, specialising in "+R.label+" ("+R.title+") responsibilities and ISO 42001 AIMS implementation.\nGenerate a governance strategy. Respond ONLY in valid JSON, no markdown, no backticks:\n{\"summary\":\"2-3 sentence summary\",\"riskLevel\":\"Critical|High|Medium|Low\",\"objectives\":[{\"title\":\"string\",\"desc\":\"string\"}],\"steps\":[{\"n\":1,\"action\":\"string\",\"owner\":\"string\",\"timeline\":\"string\",\"clause\":\"string\",\"priority\":\"Critical|High|Medium\"}],\"regulatory\":[{\"framework\":\"string\",\"article\":\"string\",\"req\":\"string\",\"risk\":\"string\"}],\"hitl\":true,\"hitlReason\":\"string\"}\nRules: exactly 4 objectives, exactly 6 steps ordered chronologically, exactly 3 regulatory items. Reference real ISO 42001 clauses and regulatory articles. Return ONLY the JSON object.";
    const userMsg="Role: "+R.label+" - "+R.title+"\nProject: "+pn+"\nDescription: "+pd+"\nFrameworks: "+fwList+"\nTimeline: "+tl+"\nPriority: "+pri;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:[{role:"user",content:userMsg}]})});
      const d=await res.json();
      const raw=(d.content&&d.content[0]&&d.content[0].text)||"";
      try{setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setErr("AI returned unexpected format. Please try again.");}
    }catch{setErr("Connection error. Please try again.");}
    setLoading(false);
  };
  const iColor=v=>v==="Critical"?T.red:v==="High"?T.amber:v==="Medium"?T.blue:T.ink3;
  const iBg=v=>v==="Critical"?T.redL:v==="High"?T.amberL:v==="Medium"?T.blueL:T.ink5;
  const cxoFlow=[
    ["1","AI idea intake","Business sponsor submits opportunity, department, target value and affected users.","Ready",T.blue],
    ["2","CIO feasibility","Architecture, integration, data availability, vendor/tool fit and technical risk.","In Review",T.amber],
    ["3","CAIO governance class","AI suitability, risk class, HITL requirement, model/data obligations.","Required",rc],
    ["4","CXO Impact Graph","CISO, CDPO, CGO and CIO actions assigned based on impact and obligations.","Mapped",T.teal],
    ["5","Pilot and scale intent","Pilot department, budget, ROI assumption, scale gates and next waves defined.","Draft",AI_GOLD],
  ];
  const impactCxos=[
    ["CIO","Technical feasibility","Architecture, data readiness, integrations",T.blue],
    ["CAIO","AI suitability","Governance class, AI risk, HITL model",rc],
    ["CISO","Security exposure","Access, threat model, model misuse controls",T.red],
    ["CDPO","Privacy impact","DPIA, data minimisation, automated decision rules",T.teal],
    ["CGO","Governance assurance","Policy fit, regulatory traceability, board reporting",AI_GOLD],
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="CXO Platform Strategy" sub={`${R.label} strategy, accountability, pilot selection and scale decisions`}/>
    <Card style={{padding:18,marginBottom:14,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${rc}35`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:16}}>
        <div>
          <Tag label="CXO PLATFORM" color={rc} bg={rcL}/>
          <h2 style={{fontFamily:F.h,fontSize:24,fontWeight:900,color:T.ink,margin:"10px 0 5px"}}>Strategic AI rollout control layer</h2>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7,maxWidth:760,margin:0}}>Plan the AI opportunity, validate feasibility, assign CXO accountability, select the pilot department, define budget and decide when AI Central should execute downstream.</p>
        </div>
        <Tag label="Execution handoff ready" color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
        {cxoFlow.map(([n,title,desc,status,col])=><div key={title} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><span style={{width:22,height:22,borderRadius:999,background:col+"18",border:`1px solid ${col}40`,color:col,display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:F.m,fontSize:10,fontWeight:900}}>{n}</span><Tag label={status} color={col} bg={col+"18"}/></div>
          <div style={{fontSize:11,fontWeight:900,color:T.ink,fontFamily:F.b,marginBottom:6,lineHeight:1.25}}>{title}</div>
          <p style={{fontSize:9,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:0}}>{desc}</p>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:10}}>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:13}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 10px"}}>CXO Impact Graph</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
            {impactCxos.map(([label,focus,desc,col])=><button key={label} onClick={()=>setTab(label==="CAIO"?"aia":label==="CIO"?"roadmap":label==="CISO"?"controls":label==="CDPO"?"aiia":"reports")} style={{background:col+"12",border:`1px solid ${col}35`,borderRadius:9,padding:10,textAlign:"left",cursor:"pointer"}}>
              <div style={{fontSize:16,fontWeight:900,color:col,fontFamily:F.h,marginBottom:5}}>{label}</div>
              <div style={{fontSize:10,fontWeight:900,color:T.ink,fontFamily:F.b,marginBottom:4}}>{focus}</div>
              <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,lineHeight:1.45}}>{desc}</div>
            </button>)}
          </div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:13}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 10px"}}>Pilot and scale intent</h3>
          {AI_ROLLOUT_PROGRAMS.slice(0,2).map(p=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 70px",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontWeight:900,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>Pilot {p.pilot}; next {p.next}; owner {p.owner}</div></div>
            <Tag label={p.decision} color={p.decision==="Scale"?T.green:p.decision==="Hold"?T.amber:T.red} bg={(p.decision==="Scale"?T.green:p.decision==="Hold"?T.amber:T.red)+"18"}/>
          </div>)}
          <button onClick={()=>setTab("hitl")} style={{marginTop:10,width:"100%",background:rc+"18",border:`1px solid ${rc}40`,borderRadius:8,padding:"8px 10px",color:rc,fontFamily:F.b,fontSize:10,fontWeight:900,cursor:"pointer"}}>Open CXO approvals</button>
        </div>
      </div>
    </Card>
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
        <div style={{width:24,height:24,borderRadius:6,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}></div>
        <h2 style={{fontFamily:F.h,fontSize:18,fontWeight:700,color:T.ink}}>AI Strategy Generator</h2>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginBottom:18,lineHeight:1.65}}>Describe your project and VerisZone will generate a structured governance strategy.</p>
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
              {["< 1 month","1 month","3 months","6 months","12+ months"].map(o=><option key={o}>{o}</option>)}
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
        {loading?<><Spinner color="#fff"/>Generating strategy...</>:"Generate Strategy"}
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
            <div style={{fontSize:11,color:T.red,fontFamily:F.b}}>Risk: {r.risk}</div>
          </div>)}
        </div>
        {result.hitl&&<div style={{background:T.amberL,border:`1px solid ${T.amber}35`,borderRadius:8,padding:"12px 14px",display:"flex",gap:10}}>
          <span>!</span>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.amber,fontFamily:F.b,marginBottom:3}}>Human-in-the-Loop Required</div>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{result.hitlReason}</p>
          </div>
        </div>}
      </div>
    </Card>}
  </div>;
}

/* Section */
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
          <button onClick={()=>setRunbook(null)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 12px",fontSize:11,color:T.ink2,fontFamily:F.b,cursor:"pointer"}}>Back</button>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Playbook - {rb.title}</span>
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
            <span style={{fontSize:18}}>!</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:T.amber,fontFamily:F.b,marginBottom:4}}>Human-in-the-Loop Required</div>
              <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>This runbook cannot be executed without explicit approval in the HITL Queue. Navigate to the HITL Queue tab to review the AI reasoning and approve or reject the proposed action.</p>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setRunbook(null)} style={{flex:1,background:T.s2,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px",fontSize:12,fontWeight:600,fontFamily:F.b}}>Back</button>
          <button style={{flex:2,background:rc,color:"#fff",border:"none",borderRadius:8,padding:"11px",fontSize:12,fontWeight:600,fontFamily:F.b}}>Execute Runbook</button>
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
              <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>{sel.status} - Immediate Action Required</span>
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
                <div style={{fontSize:9,fontWeight:700,color:T.amber,fontFamily:F.m,textTransform:"uppercase",marginBottom:3}}>HITL Gate</div>
                <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:0,lineHeight:1.6}}>Requires approval in HITL Queue before execution.</p>
              </div>
            )}
            <button onClick={()=>setRunbook(sel)} style={{width:"100%",marginTop:13,background:rc,color:"#fff",border:"none",borderRadius:7,padding:"10px",fontSize:12,fontWeight:600,fontFamily:F.b,cursor:"pointer"}}>
              Open Full Runbook 
            </button>
          </div>
        </Card>
      </div>
    </div>
  </div>;
}
/* Section */
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

/* Section */
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
        <span style={{fontSize:10,fontFamily:F.m,color:T.ink3}}>{doneCount}/{allItems.length} controls - {pct}%</span>
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
                {isDone&&<span style={{color:"#fff",fontSize:9,fontWeight:700}}>OK</span>}
              </div>
              <span style={{fontSize:11,color:isDone?T.ink4:T.ink2,fontFamily:F.b,lineHeight:1.55,textDecoration:isDone?"line-through":"none"}}>{item.text}</span>
            </div>;
          })}
        </div>
      </Card>;
    })}
  </div>;
}

/* Section */
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
      <span style={{fontSize:18,flexShrink:0}}>HITL</span>
      <div>
        <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4}}>What is Human-in-the-Loop?</div>
        <p style={{fontSize:11,color:T.ink3,lineHeight:1.7,fontFamily:F.b,margin:0}}>VerisZone AI analyses your compliance posture and recommends actions. For high-stakes decisions, <strong style={{color:T.ink}}>the system cannot act until you explicitly approve.</strong> You see the full reasoning, ISO 42001 clause reference, confidence score, and proposed action before you decide. Every decision is time-stamped and audit-logged.</p>
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
            {decided&&<Tag label={decided==="approved"?"Approved":"Rejected"} color={decided==="approved"?T.green:T.red} bg={decided==="approved"?T.greenL:T.redL}/>}
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
              <textarea value={notes[item.id]||""} onChange={e=>setNotes(n=>({...n,[item.id]:e.target.value}))} placeholder="Add a note for the audit log (optional)" rows={2} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.ink3,fontFamily:F.b,resize:"none",marginBottom:10}}/>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>decide(item.id,"approved")} style={{flex:1,background:T.green,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:12,fontWeight:600,fontFamily:F.b}}>Approve Action</button>
                <button onClick={()=>decide(item.id,"rejected")} style={{flex:1,background:T.s1,color:T.red,border:`1.5px solid ${T.red}45`,borderRadius:7,padding:"9px",fontSize:12,fontWeight:600,fontFamily:F.b}}>Reject & Return</button>
              </div>
            </>:<div style={{fontSize:11,color:T.ink4,fontFamily:F.b}}>Decision recorded {new Date().toLocaleTimeString()} {notes[item.id]&&<div style={{marginTop:3}}>Note: "{notes[item.id]}"</div>}</div>}
          </div>
        </Card>;
      })}
    </div>
  </div>;
}

/* Section */
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
          <Tag label={sel.overallRisk==="Unacceptable"?"Unacceptable Risk":sel.overallRisk+" Risk"} color={overallColor(sel.overallRisk)} bg={overallColor(sel.overallRisk)+"20"}/>
          <Tag label={sel.decision} color={sel.decision==="Rejected"?T.red:sel.decision==="Approved"?T.green:T.amber} bg={sel.decision==="Rejected"?T.redL:sel.decision==="Approved"?T.greenL:T.amberL}/>
          <Tag label={sel.clause} color={T.ink3} bg={T.ink5}/>
        </div>
        <h2 style={{fontFamily:F.h,fontSize:18,fontWeight:700,color:T.ink,marginBottom:4}}>{sel.system}</h2>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.m}}>{sel.vendor} - {sel.dept} - {sel.date}</p>
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
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 1 - System Profile</div>
        {[["Status",sel.status],["Decision Type",sel.decisionType],["Lifespan",sel.lifespan]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
          <span style={{fontSize:11,color:T.ink,fontFamily:F.b}}>{v}</span>
        </div>)}
      </Card>
      {/* Part 2: Data Audit */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 2 - Data Audit</div>
        {[["PII Processed",sel.data.pii],["Sensitive Categories",sel.data.sensitive],["Data Provenance Verified",sel.data.provenance],["Bias Check Done",sel.data.biasCheck],["Data Minimisation",sel.data.minimization]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
          <Tag label={v?"Yes":"No"} color={v?T.amber:T.green} bg={v?T.amberL:T.greenL}/>
        </div>)}
      </Card>
      {/* Part 3: Rights Impact */}
      <Card style={{padding:16,gridColumn:"1/-1"}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:12}}>Part 3 - Fundamental Rights Impact (FRIA)</div>
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
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 4 - Technical Reliability</div>
        {sel.technical.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<sel.technical.length-1?`1px solid ${T.border}`:"none"}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t.dim}</div>
            <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{t.metric}</span>
          </div>
          <Tag label={t.pass?"Pass":"Fail"} color={t.pass?T.green:T.red} bg={t.pass?T.greenL:T.redL}/>
        </div>)}
      </Card>
      {/* Part 5: Controls */}
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:10}}>Part 5 - Governance Controls</div>
        {sel.controls.map((c,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<sel.controls.length-1?`1px solid ${T.border}`:"none"}}>
          <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.measure}</div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:0}}>{c.detail}</p>
        </div>)}
      </Card>
      {/* Part 6: Decision */}
      <Card style={{padding:16,border:`1px solid ${overallColor(sel.overallRisk)}30`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:12}}>Part 6 - Final Determination</div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <Tag label={`Overall Risk: ${sel.overallRisk}`} color={overallColor(sel.overallRisk)} bg={overallColor(sel.overallRisk)+"15"}/>
          <Tag label={sel.decision} color={sel.decision==="Rejected"?T.red:sel.decision==="Approved"?T.green:T.amber} bg={sel.decision==="Rejected"?T.redL:sel.decision==="Approved"?T.greenL:T.amberL}/>
        </div>
        {sel.decision==="Rejected"&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:7,padding:"10px 12px",marginBottom:12}}>
          <p style={{fontSize:11,color:T.red,fontFamily:F.b,margin:0,lineHeight:1.6}}>This system was rejected. Risk to fundamental rights is too high to proceed. Refer to Part 3 FRIA for details.</p>
        </div>}
        {sel.decision==="Approved with Conditions"&&<div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:7,padding:"10px 12px",marginBottom:12}}>
          <p style={{fontSize:11,color:T.amber,fontFamily:F.b,margin:0,lineHeight:1.6}}>Conditional approval. All Part 5 mitigations must be active before deployment proceeds.</p>
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

/* Section */
function PageAIRA() {
  const [sel,setSel]=useState(AIRA[0]);
  const rColor=s=>s==="Critical"?T.red:s==="High"?T.amber:s==="Medium"?T.blue:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Risk Assessment Register (AIRA)" sub="ISO 42001 Clause 8.2"/>
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

/* Section */
function PageAIRT() {
  const [sel,setSel]=useState(AIRT[0]);
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Risk Treatment Register (AIRT)" sub="ISO 42001 Clause 8.3"/>
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
          <button style={{width:"100%",marginTop:13,background:T.violet,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Update Treatment Plan</button>
        </div>
      </Card>}
    </div>
  </div>;
}

/* Section */
function PageRoadmap({role}) {
  const rc=RC(role), rcL=RCL(role), qs=ROADMAP[role]||ROADMAP.caio||[];
  const nexts={
    ceo:[{a:"Review two scale-gate decisions with the board pack",w:"Scale recommendations affect regulated departments and require executive sponsorship before AI Central opens the next wave.",i:"High"},{a:"Confirm enterprise AI risk appetite for Q3",w:"Risk drift alerts are active on three pilots. The CEO view should align value ambition with acceptable exposure.",i:"High"},{a:"Approve maturity propagation targets",w:"Each successful pilot should raise the enterprise maturity map before broader rollout.",i:"Medium"}],
    coo:[{a:"Clear operating blockers for Customer Operations pilot",w:"Three execution tasks are blocked and Retail Banking readiness depends on resolved process ownership.",i:"High"},{a:"Approve the next department wave operating plan",w:"The next rollout should inherit working controls, training cadence and exception handling from the pilot.",i:"High"},{a:"Review adoption resistance before scale",w:"Adoption is at 64%. COO review should assign owners for process change and frontline enablement.",i:"Medium"}],
    cfo:[{a:"Validate ROI confidence before releasing scale budget",w:"Scale funding should be tied to evidence confidence, realized value and benefit-owner accountability.",i:"High"},{a:"Review budget variance and payback assumptions",w:"Portfolio economics are positive, but the next wave needs an approved cost envelope and measurable value controls.",i:"Medium"},{a:"Confirm value ledger evidence for audit",w:"Financial benefits should be traceable to controls, approvals and evidence before board reporting.",i:"Medium"}],
    chro:[{a:"Close role impact assessments for affected teams",w:"Department expansion should not proceed until workforce impact, fairness and training evidence are complete.",i:"High"},{a:"Approve AI literacy and enablement cadence",w:"Training completion is below target. Managers need a repeatable adoption playbook before the next wave.",i:"Medium"},{a:"Monitor adoption resistance by department",w:"Resistance is a scale-readiness signal and should feed AI Spine recommendations.",i:"Medium"}],
    caio:[{a:"Complete LLM v2 Art.13 transparency docs before go-live",w:"EU AI Act Art.13 requires complete docs for High-Risk systems. 6 days remaining.",i:"Critical"},{a:"Classify 3 unregistered models under EU AI Act",w:"Unclassified models = unknown exposure. August 2026 enforcement is 12 weeks away.",i:"High"},{a:"Begin ISO 42001 conformity assessment now",w:"Assessment takes 3-6 months",i:"High"}],
    ciso:[{a:"Close GDPR DPIA for analytics platform immediately",w:"Active Art.35 violation. Personal CISO liability under GDPR Art.83 growing daily.",i:"Critical"},{a:"Prioritise ISO 27001 A.8.2 asset classification gap",w:"65% score and remediation required.",i:"High"},{a:"Prepare board-level security briefing",w:"Board oversight of security posture expected by regulators and enterprise insurers.",i:"Medium"}],
    cio:[{a:"Execute S3 data residency migration within 48 hours",w:"Active GDPR Art.46 violation. Every day increases regulatory and reputational exposure.",i:"Critical"},{a:"Sign off Zero Trust Phase 2this week",w:"Window closes May 15. Missing it risks Q3 audit readiness.",i:"Critical"},{a:"Accelerate FY25 roadmap reprioritisation",w:"5 initiatives at risk. CFO alignment needed before end of Q2.",i:"High"}],
    cdpo:[{a:"Submit analytics platform DPIA to supervisory authority today",w:"Active Art.35 violation. DPA notification may already be required.",i:"Critical"},{a:"Resolve DSR queue before 30-day deadlines",w:"4 requests approaching deadline. Fines for DSR non-compliance rising.",i:"High"},{a:"Complete TIAs for 5 remaining US vendors",w:"Post-Schrems II exposure. Processing pause required by May 30.",i:"High"}],
    cgo:[{a:"Approve Q2 Board Governance Report before the deadline",w:"Board pack is due in 2 days. As CGO your sign-off is the final gate.",i:"Critical"},{a:"Approve the EU AI Act cross-functional remediation plan",w:"CAIO, CISO, and CDPO have submitted their gap plans. Unified plan needs CGO approval to assign accountability and begin execution.",i:"High"},{a:"Accelerate vendor risk programme",w:"Third-party governance is a top COBIT 5 maturity gap. 39% of vendors have no formal risk assessment on file.",i:"High"}],
  }[role]||[{a:"Review role roadmap readiness",w:"This workspace needs a role-specific next-step list before enterprise demo sign-off.",i:"Medium"},{a:"Validate linked owners and due dates",w:"Roadmap items should map to accountability, evidence and approval gates.",i:"Medium"},{a:"Confirm AI Central handoff path",w:"Execution should move downstream only after pilot scope and controls are approved.",i:"Medium"}];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Strategic Roadmap" sub="FY2026 governance and compliance milestones."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:22}}>
      {qs.map((q,i)=>{
        const isDone=q.st==="done",isAct=q.st==="active";
        const bg=isDone?T.green:isAct?rc:T.ink4;
        return <div key={q.q} style={{animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{background:bg,borderRadius:"8px 8px 0 0",padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:F.m}}>{q.q}</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,.75)",fontFamily:F.b}}>{isDone?"Done":isAct?"Active":"Planned"}</span>
          </div>
          <Card style={{borderRadius:"0 0 8px 8px",padding:12}}>
            {q.items.map((item,j)=>{
              const isStar=q.st==="active"&&j<2,label=item;
              return <div key={j} style={{display:"flex",gap:7,marginBottom:j<q.items.length-1?8:0,alignItems:"flex-start"}}>
                <div style={{width:4,height:4,borderRadius:"50%",marginTop:5,flexShrink:0,background:isDone?T.green:isAct&&isStar?T.amber:isAct?rc:T.ink4}}/>
                <span style={{fontSize:10,color:isDone?T.ink4:T.ink3,fontFamily:F.b,lineHeight:1.5,textDecoration:isDone?"line-through":"none"}}>{label}{isStar&&!isDone&&<span style={{color:T.amber,fontWeight:700}}> Required</span>}</span>
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

/* Section */
function PageTemplates({role,showToast}) {
  const rc=RC(role);
  const [selId,setSelId]=useState(null);
  const [loading,setLoading]=useState(false);
  const [genResult,setGenResult]=useState(null);
  const selectedTemplate=TEMPLATES.find(t=>t.id===selId);
  const buildTemplatePreview=(template)=>{
    const source=KIT_TEMPLATE_SOURCES[template.id]||"VerisZone native template";
    const header=`# ${template.name}

Framework: ${template.fw}
Category: ${template.cat}
Responsible roles: ${template.tags.join(", ")}
Implementation kit source: ${source}

`;
    const drafts={
      t_rr:`## Register Scope
Maintain the authoritative record of AI risks for every pilot, production model and procured AI system.

## Risk Register Columns
| Field | Required Entry |
|---|---|
| AI system | Name, owner, department, lifecycle stage |
| Risk statement | Cause, event, impact and affected stakeholder |
| Likelihood x Impact | 1-5 x 1-5 scoring; score > 12 is High/Critical |
| Inherent / residual risk | Before and after controls |
| Control mapping | ISO 42001 C.8.2, ISO 23894 and linked internal controls |
| Treatment status | Open, Mitigating, Accepted, Transferred or Closed |
| Evidence reference | Linked model card, AIIA, DPIA, test report or approval log |

## Auditor Failure Checks
- Static register: risks not updated after model, data or workflow change.
- Ghost control: control listed but no operating evidence.
- Missing treatment: High/Critical risk has no owner, action or due date.`,
      t_rtp:`## Treatment Scope
Create a structured remediation plan for every High/Critical AI risk with score > 12.

## Treatment Options
| Option | When Used | Required Evidence |
|---|---|---|
| Avoid | Risk exceeds appetite or prohibited AI trigger exists | Stop decision and executive approval |
| Reduce | Controls can bring residual risk inside appetite | Control plan, owner, due date, verification |
| Transfer | Vendor, insurer or contract can absorb part of exposure | Contract clause, SLA or insurance reference |
| Accept | Residual risk is explicitly approved | Risk acceptance note and expiry date |

## Plan Fields
Risk ID, root cause, selected treatment, control owner, budget, dependency, quarter-by-quarter timeline, evidence requirement and verification method.`,
      t_aiia:`## AIIA Procedure
Six-phase AI System Impact Assessment aligned to ISO 42001 Control A.5 and EU AI Act obligations.

## Six Phases
1. Characterise the AI system: purpose, users, decisions, autonomy and deployment context.
2. Identify stakeholders: affected people, departments, customers, regulators and operators.
3. Assess impact: rights, safety, privacy, fairness, transparency and operational harm.
4. Map controls: human oversight, data governance, robustness, documentation and monitoring.
5. Capture approvals: CAIO, legal, privacy, security and business owner sign-off.
6. Define monitoring: KPIs, drift signals, incident triggers, post-release review and re-assessment cadence.

## Required Output
Context record, stakeholder map, ethical principle assessment, human oversight rating, open conditions, go/no-go recommendation and evidence references.`,
      t_mc:`## Model Card Structure
Standardised model documentation for design, approval, deployment and post-release monitoring.

## Required Sections
- Intended use: approved use cases, prohibited uses and user population.
- Model details: model family, provider, version, architecture and deployment environment.
- Training data: source, provenance, personal data status, exclusions and known limitations.
- Performance metrics: accuracy, latency, robustness, drift and benchmark date.
- Bias and fairness: protected attributes, test method, threshold and mitigation.
- Human oversight: review points, override path, escalation owner and kill switch.
- Transparency: user notice, explainability method and EU AI Act Art.13 reference.

## Approval Gate
Model card must be complete before production or high-risk pilot scale.`,
      t_nc:`## Non-Conformity Record
Capture governance or control failure, root cause and corrective action under ISO 42001 C.10.1.

## Required Fields
Issue ID, detection source, affected AI system, clause/control, severity, root cause, corrective action, owner, due date, verification evidence and closure approver.

## Corrective Action Workflow
1. Log issue and affected control.
2. Assign owner and target date.
3. Define containment action if risk is active.
4. Implement corrective action.
5. Verify evidence.
6. Close with management review note.`,
      t_ks:`## Emergency Fallback Procedure
Define authority and steps to stop or bypass an AI system safely.

## Activation Criteria
- Harm threshold exceeded.
- Material model drift or severe bias detected.
- Security incident, prompt injection or data leakage.
- Regulatory breach or prohibited-use trigger.
- HITL override failure.

## Operating Steps
1. Approver confirms activation authority.
2. Disable AI route or model endpoint.
3. Switch to manual fallback process.
4. Notify business owner, CAIO, CISO and impacted operators.
5. Preserve logs and evidence.
6. Conduct post-incident review and restart approval.`,
      t_soa:`## Statement of Applicability
Map ISO 42001 Annex A controls to the AI management system scope.

## Control Matrix
| Control | Applicable | Status | Justification | Evidence |
|---|---|---|---|---|
| A.5 Impact assessment | Yes | Partial | Required for high-risk pilots | AIIA record |
| A.6 AI system lifecycle | Yes | Planned | Needed before production | Lifecycle checklist |
| A.7 Data for AI systems | Yes | Implemented | Data provenance required | Dataset register |
| A.8 Information for interested parties | Yes | Partial | Transparency gaps remain | Notice draft |

## Required Decision
Each control must be marked Applicable or Not Applicable with a defensible justification and evidence reference.`,
      t_bias:`## Bias Detection Procedure
Methodology for identifying, measuring and reducing algorithmic bias.

## Assessment Steps
1. Identify protected or sensitive attributes.
2. Define fairness objective and harm scenario.
3. Select test population and baseline.
4. Measure disparate impact, false positive/negative parity and subgroup performance.
5. Record threshold breaches.
6. Apply mitigation and retest.
7. Define monitoring cadence.

## Evidence
Dataset summary, test notebook, fairness threshold, mitigation decision, reviewer sign-off and post-release monitoring trigger.`,
      t_dep:`## Deployment Release Checklist
Five-gate checklist before AI release or pilot scale.

## Gates
1. Governance documentation complete: model card, AIIA, owner and purpose.
2. Risk approval complete: risk register and treatment plans for High/Critical items.
3. Evidence reviewed: controls, test results, privacy and security records.
4. HITL sign-off complete: approval owner, override path and escalation.
5. Post-release monitoring ready: drift, incident, value and adoption metrics.

## Release Decision
Approve, approve with conditions, hold, remediate or stop.`,
      t_raci:`## CAIO Responsibility Mapping
Cross-functional RACI for enterprise AI governance activities.

## RACI Matrix
| Activity | CAIO | CIO | CISO | CDPO | CFO | COO | CGO |
|---|---|---|---|---|---|---|---|
| AI strategy | A | C | C | C | C | C | C |
| Use-case intake | A | R | C | C | C | R | C |
| Risk classification | A | C | C | C | I | I | R |
| Model deployment | A | R | C | C | I | R | I |
| Monitoring and reporting | A | R | R | R | C | R | R |

Legend: R Responsible, A Accountable, C Consulted, I Informed.`,
      t_uc:`## AI Use Case Scoring
Separate high-value AI opportunities from vanity projects.

## Nine-Block Canvas
Problem, user, data, technology, KPI, feasibility, ethics, HITL requirement and ROI.

## Scoring Grid
| Dimension | Score 1-5 | Notes |
|---|---:|---|
| Business impact |  | Revenue, cost, risk or experience impact |
| Data readiness |  | Quality, lineage, access and privacy |
| Technical feasibility |  | Architecture, integration and operating model |
| Governance risk |  | Legal, privacy, fairness, safety and oversight |
| Time to value |  | Pilot duration and adoption complexity |

Decision: proceed to feasibility review, hold, redesign or reject.`,
      t_poc:`## POC to Production Plan
Phase-based AI project plan from experiment to governed operation.

## Phases
1. POC: hypothesis, dataset, benchmark and feasibility.
2. Pilot: department selection, owner, risk controls and success metrics.
3. Production readiness: security, privacy, model card, AIIA and HITL.
4. Release: approval gates, monitoring and fallback.
5. Post-deployment: KPI review, drift check, lessons learned and scale gate.

## Required Owners
Business owner, technical owner, CAIO reviewer, security reviewer and evidence owner.`,
      t_ethics:`## AI Ethics Impact Assessment
Evaluate whether an AI system creates unfair, harmful or non-transparent outcomes.

## Assessment Areas
- Human rights and dignity.
- Unfair or harmful outcomes.
- Accountability and oversight.
- Transparency and explainability.
- Vulnerable groups and accessibility.
- Contestability and appeal.

## Output
Ethics risk rating, mitigation actions, reviewer comments, approval status and monitoring obligations.`,
      t_genai:`## Responsible GenAI Use Policy
Operating rules for generative AI use across the enterprise.

## Permitted Uses
Drafting, summarisation, ideation, code assistance and internal knowledge support where data classification permits.

## Prohibited Uses
Entering restricted PII, legal advice without review, customer-facing output without approval, credential sharing, source-code leakage and unmanaged model/plugin use.

## Mandatory Controls
Data classification, prompt hygiene, human review, source verification, output logging, incident reporting and training acknowledgement.`,
      t_kpi:`## AI KPI Monitoring Dashboard
Executive dashboard definition for technical, value, governance and risk metrics.

## Metric Groups
| Group | Example KPIs |
|---|---|
| Model health | Accuracy, drift, latency, uptime |
| Business value | ROI, time saved, adoption, conversion |
| Governance | HITL rate, approval SLA, audit findings |
| Risk | Bias score, incidents, exceptions, residual risk |

## Reporting Cadence
Weekly operating view, monthly CXO view and quarterly board pack.`,
      t_bvb:`## Build vs Buy Decision Matrix
Objective scoring framework for AI platform sourcing.

## Decision Dimensions
Strategic fit, technical feasibility, total cost of ownership, time-to-value, data/security risk, vendor dependency, integration complexity and regulatory exposure.

## Scoring
Score each dimension 1-5 for Build and Buy. Weight strategic fit, risk and time-to-value before final recommendation.

## Output
Recommendation, rationale, assumptions, open risks, exit strategy and executive approval.`,
      t_post:`## Post-Deployment Review
Blameless review after AI pilot or production release.

## Review Sections
Deployment summary, planned vs actual KPI performance, user adoption, incidents, model drift, fairness findings, HITL overrides, lessons learned and decision.

## Decision Options
Continue, retrain, remediate, expand, pause or decommission.

## Evidence
Monitoring data, approval log, incident record, business-value proof and owner sign-off.`,
      t_dpia:`## GDPR Article 35 DPIA
Data Protection Impact Assessment for AI processing.

## Mandatory Elements
1. Description of processing and AI system purpose.
2. Necessity and proportionality assessment.
3. Risks to rights and freedoms of individuals.
4. Measures to address risks, safeguards and security controls.
5. Residual risk and DPO/CDPO sign-off.

## Supervisory Authority Trigger
Consult authority if high residual risk remains after mitigation.`,
      t_tia:`## Transfer Impact Assessment
Assessment for international data transfers under GDPR Art.46 and Schrems II.

## Required Sections
Destination country, recipient/vendor, transfer mechanism, SCC module, government-access risk, supplementary measures, encryption, access controls and re-assessment cadence.

## Decision
Proceed, proceed with supplementary measures, hold transfer or reject transfer.`,
      t_board:`## Board-Ready Governance Summary
One-page executive governance insert for the board pack.

## Executive Snapshot
- Overall AI governance maturity.
- Critical risks and scale-gate decisions.
- Compliance posture across EU AI Act, ISO 42001, GDPR and NIST AI RMF.
- CXO approvals and open escalations.
- Top three management actions.

## Board Decisions Requested
Approve risk appetite, approve scale/no-scale decision, approve funding condition or request remediation plan.`
    };
    return `${header}${drafts[template.id]||`## Template Structure
${template.desc}

## Required Sections
Scope, owners, control mapping, evidence requirements, approval workflow, review cadence and audit notes.

## Output
A reviewable governance artifact tied to ${template.fw}.`}`;
  };
  const preview=(template)=>{
    setSelId(template.id);
    setLoading(false);
    setGenResult(null);
    showToast&&showToast(`${template.name} preview opened`);
  };
  const generate=(template)=>{
    setSelId(template.id);setLoading(true);setGenResult(null);
    window.setTimeout(()=>{
      setGenResult(buildTemplatePreview(template));
      setLoading(false);
      showToast&&showToast(`${template.name} generated`);
    },450);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Document Templates" sub="AI-native governance templates. AI-assisted templates auto-populate from your system description."/>
    {selectedTemplate&&<Card style={{padding:18,animation:"up .25s ease",marginBottom:16,border:`1px solid ${rc}45`,boxShadow:T.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,marginBottom:14}}>
        <div>
          <Tag label={genResult?"Generated draft":"Preview"} color={genResult?T.green:rc} bg={(genResult?T.green:rc)+"18"}/>
          <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:900,color:T.ink,margin:"9px 0 5px"}}>{selectedTemplate.name}</h3>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0,maxWidth:780}}>{selectedTemplate.desc}</p>
        </div>
        <button type="button" onClick={()=>{setSelId(null);setGenResult(null);setLoading(false);}} style={{background:T.s3,border:`1px solid ${T.border}`,color:T.ink3,borderRadius:8,padding:"7px 10px",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Close</button>
      </div>
      {loading&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 0",color:T.ink3,fontFamily:F.b,fontSize:12}}><Spinner color={rc}/>Generating governance template preview...</div>}
      {!loading&&!genResult&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
        {[["Framework",selectedTemplate.fw],["Category",selectedTemplate.cat],["Roles",selectedTemplate.tags.join(", ")],["Kit source",KIT_TEMPLATE_SOURCES[selectedTemplate.id]||"VerisZone native template"],["Mode",selectedTemplate.ai?"AI-assisted":"Manual template"]].map(([label,value])=><div key={label} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:12}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{label}</div>
          <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:800,lineHeight:1.4}}>{value}</div>
        </div>)}
      </div>}
      {genResult&&<div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:15,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.75,whiteSpace:"pre-wrap",maxHeight:360,overflowY:"auto"}}>{genResult}</div>}
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:11}}>
      {TEMPLATES.map((t,i)=><Card key={t.id} style={{padding:15,border:`1px solid ${selId===t.id?rc+"50":T.border}`,transition:"border-color .2s",animation:`up ${.3+i*.05}s ease both`}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:9}}>
          <IconBox name={`${t.cat} ${t.name}`} color={t.ai?T.violet:rc}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}>
              <Tag label={t.cat} color={T.blue} bg={T.blueL}/>
              {t.ai&&<Tag label="AI Native" color={T.violet} bg={T.violetL}/>}
            </div>
            <h3 style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,lineHeight:1.35}}>{t.name}</h3>
          </div>
        </div>
        <p style={{fontSize:11,color:T.ink3,lineHeight:1.65,fontFamily:F.b,marginBottom:11}}>{t.desc}</p>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:11}}>
          <Tag label={t.fw} color={T.ink3} bg={T.s3}/>
          {t.tags.map(tag=><Tag key={tag} label={tag} color={T.ink4} bg={T.ink5}/>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button type="button" onClick={()=>preview(t)} style={{flex:1,background:selId===t.id&&!genResult?rc+"12":T.s3,color:selId===t.id&&!genResult?rc:T.ink2,border:`1px solid ${selId===t.id&&!genResult?rc+"45":T.border}`,borderRadius:6,padding:"7px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Preview</button>
          {t.ai&&<button type="button" onClick={()=>generate(t)} style={{flex:1,background:rc,color:"#fff",border:"none",borderRadius:6,padding:"7px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Generate</button>}
        </div>
      </Card>)}
    </div>
  </div>;
}

/* Section */
function PageReports({role,sessionMode}) {
  const rc=RC(role), rcL=RCL(role), K=KPI[role]||KPI.caio;
  const standards=STANDARDS_MAP[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const learningEvidence=academyEvidenceFor(role,sessionMode==="demo");
  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink4;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Reports& Analytics" sub="Executive-ready compliance reporting and operational metrics."/>
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
    <Card style={{overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Governance Academy Evidence</h3>
        <Tag label={`${learningEvidence.length} captured`} color={learningEvidence.length?T.green:T.ink4} bg={learningEvidence.length?T.greenL:T.ink5}/>
      </div>
      {learningEvidence.length?learningEvidence.map((e,i)=><div key={e.control} style={{display:"grid",gridTemplateColumns:"1.1fr .9fr 80px",gap:12,padding:"11px 16px",alignItems:"center",borderBottom:i<learningEvidence.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
        <div><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{e.module}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:2}}>{e.evidence}</div></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Owner: {e.owner}<br/>Time: {e.time}</div>
        <Tag label={e.approval} color={T.green} bg={T.greenL}/>
      </div>):<div style={{padding:"14px 16px",fontSize:11,color:T.ink3,fontFamily:F.b}}>No learning evidence captured yet. Customer workspaces start clean; completion evidence will appear after users finish assigned Academy lessons.</div>}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Executive Board Pack Exports</h3>
        </div>
        {[
          ["Board AI Transformation Pack","Strategy, pilot value, AI Spine scale decisions","PDF + Deck","Ready"],
          ["Regulatory Assurance Pack","Evidence ledger, control mapping, audit trail","PDF","Ready"],
          ["CXO Accountability Pack","Approvals, task ownership, open exceptions","Deck","Draft"],
        ].map(([name,desc,fmt,status],i)=><div key={name} style={{padding:"12px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"grid",gridTemplateColumns:"1fr 72px 70px",gap:10,alignItems:"center",background:i%2===0?T.s1:T.bg}}>
          <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{name}</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.45}}>{desc}</div></div>
          <Tag label={fmt} color={rc} bg={rcL+"70"}/>
          <Tag label={status} color={status==="Ready"?T.green:T.amber} bg={(status==="Ready"?T.green:T.amber)+"18"}/>
        </div>)}
      </Card>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Audit Event Lineage</h3>
        </div>
        {[
          ["Scale gate outcome set","Customer Resolution Copilot","Aisha Patel","Hold"],
          ["Board pack export generated","Finance Close Automation","Elena Rossi","PDF"],
          ["Control activation updated","Customer Resolution Copilot","Jordan Sinclair","Monitoring"],
        ].map(([action,obj,actor,status],i)=><div key={`${action}-${obj}`} style={{padding:"12px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"grid",gridTemplateColumns:"1fr 95px 72px",gap:10,alignItems:"center",background:i%2===0?T.s1:T.bg}}>
          <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{action}</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.45}}>{obj} by {actor}</div></div>
          <Tag label="AuditEvent" color={AI_GOLD} bg={AI_GOLD+"16"}/>
          <Tag label={status} color={status==="Hold"?T.amber:status==="Monitoring"?AI_GOLD:T.green} bg={(status==="Hold"?T.amber:status==="Monitoring"?AI_GOLD:T.green)+"18"}/>
        </div>)}
      </Card>
    </div>
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
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{r.freq} {r.next}</span>
        </div>
        <Tag label={r.fmt} color={rc} bg={rcL+"80"}/>
        <button style={{fontSize:10,color:rc,fontWeight:600,background:rcL+"60",border:`1px solid ${rc}35`,borderRadius:6,padding:"5px 11px",fontFamily:F.b}}>Run Now</button>
      </div>)}
    </Card>
  </div>;
}

function PageGovernanceAcademy({role,sessionMode,showToast,setTab}) {
  const rc=RC(role), R=ROLES[role]||ROLES.caio;
  const pathIds=ROLE_LEARNING_PATHS[role]||ROLE_LEARNING_PATHS.caio;
  const path=pathIds.map(id=>GOVERNANCE_ACADEMY.find(v=>v.id===id)).filter(Boolean);
  const seeded=sessionMode==="demo";
  const completed=seeded?Math.max(1,Math.floor(path.length*.55)):0;
  const progress=path.length?Math.round((completed/path.length)*100):0;
  const featured=path[0]||GOVERNANCE_ACADEMY[0];
  const academyEvidence=academyEvidenceFor(role,seeded);
  const moduleStats=[
    ["Assigned modules",path.length,rc],
    ["Completed",completed,T.green],
    ["Evidence records",seeded?completed:0,AI_GOLD],
    ["Avg. quiz score",seeded?"86%":"--",T.blue],
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Governance Academy" sub={`${R.label} learning path for AI governance, pilot readiness, approvals and audit evidence.`}/>
    <Card style={{padding:18,marginBottom:14,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${rc}35`}}>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(260px,.85fr)",gap:16,alignItems:"stretch"}}>
        <div>
          <Tag label={seeded?"DEMO LEARNING EVIDENCE":"SUBSCRIPTION CONTENT"} color={seeded?AI_GOLD:rc} bg={(seeded?AI_GOLD:rc)+"18"}/>
          <h2 style={{fontFamily:F.h,fontSize:25,fontWeight:900,color:T.ink,margin:"12px 0 7px"}}>Short governance videos that become audit evidence.</h2>
          <p style={{fontFamily:F.b,fontSize:12,lineHeight:1.75,color:T.ink3,maxWidth:720,margin:"0 0 14px"}}>Each module teaches the executive or operator what they must do before an AI pilot can move forward. Completion, attestation and quiz outcomes become evidence for AI Central and board/regulator reporting.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}}>
            {moduleStats.map(([label,value,color])=><div key={label} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:11}}>
              <div style={{fontSize:20,fontWeight:900,fontFamily:F.m,color,marginBottom:3}}>{value}</div>
              <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
            </div>)}
          </div>
        </div>
        <div style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:12,padding:14,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{height:120,borderRadius:10,background:`radial-gradient(circle at 28% 38%, ${rc}55, transparent 26%), radial-gradient(circle at 72% 58%, ${AI_GOLD}55, transparent 22%), linear-gradient(135deg, ${T.bg}, ${T.s2})`,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:rc+"18",border:`1px solid ${rc}45`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 16px 38px ${rc}22`}}><PlayCircle size={26} color={rc}/></div>
          </div>
          <div style={{fontSize:10,color:AI_GOLD,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Featured path</div>
          <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink,margin:"0 0 5px"}}>{featured.title}</h3>
          <p style={{fontFamily:F.b,fontSize:10,lineHeight:1.55,color:T.ink3,margin:"0 0 10px"}}>{featured.desc}</p>
          <button type="button" onClick={()=>showToast(`${featured.framework} video placeholder opened`)} style={{background:rc,border:"none",borderRadius:9,padding:"9px 12px",color:"#fff",fontFamily:F.b,fontSize:11,fontWeight:900,cursor:"pointer"}}>Preview lesson</button>
        </div>
      </div>
    </Card>
    <Card style={{padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:12}}>
        <div><h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink,margin:"0 0 4px"}}>{R.label} learning path</h3><p style={{fontFamily:F.b,fontSize:11,color:T.ink3}}>Completion progress is tenant-specific; Demo Center shows sample evidence.</p></div>
        <div style={{minWidth:160}}><Bar value={progress} color={progress>70?T.green:progress>35?AI_GOLD:rc}/><div style={{fontSize:10,color:T.ink4,fontFamily:F.m,marginTop:5,textAlign:"right"}}>{progress}% complete</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {path.map((v,i)=>{
          const done=seeded&&i<completed;
          return <div key={v.id} style={{background:T.s3,border:`1px solid ${done?T.green+"45":T.border}`,borderRadius:11,padding:13,animation:`up ${.25+i*.05}s ease both`}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"flex-start",marginBottom:10}}>
              <div><Tag label={v.framework} color={v.framework==="AI Spine"?AI_GOLD:rc} bg={(v.framework==="AI Spine"?AI_GOLD:rc)+"16"}/></div>
              <Tag label={done?"Evidence captured":"Not started"} color={done?T.green:T.ink4} bg={done?T.greenL:T.ink5}/>
            </div>
            <h4 style={{fontFamily:F.h,fontSize:14,fontWeight:900,color:T.ink,lineHeight:1.3,margin:"0 0 6px"}}>{v.title}</h4>
            <p style={{fontFamily:F.b,fontSize:10,lineHeight:1.55,color:T.ink3,margin:"0 0 10px"}}>{v.desc}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              <Tag label={v.duration} color={T.blue} bg={T.blueL}/>
              <Tag label={v.level} color={T.ink3} bg={T.s2}/>
              <Tag label={v.owner} color={AI_GOLD} bg={AI_GOLD+"16"}/>
            </div>
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:9}}>
              {v.outcomes.map(o=><div key={o} style={{display:"flex",gap:7,alignItems:"flex-start",fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.45,marginBottom:5}}><CheckCircle2 size={12} color={done?T.green:rc} style={{marginTop:1,flexShrink:0}}/>{o}</div>)}
            </div>
          </div>;
        })}
      </div>
    </Card>
    <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:10}}>
        <div><h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink,margin:"0 0 4px"}}>Evidence captured from learning</h3><p style={{fontFamily:F.b,fontSize:11,color:T.ink3}}>Academy completions become audit-ready evidence records for AI Central.</p></div>
        <Tag label="Feeds AI Central evidence after handoff" color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      {academyEvidence.length>0?<div style={{display:"grid",gap:8}}>
        {academyEvidence.map(e=><div key={e.control} style={{display:"grid",gridTemplateColumns:"1.2fr .9fr .8fr .8fr",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:12}}>
          <div><div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:900}}>{e.item}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:3}}>{e.module}</div></div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{e.evidence}</div>
          <Tag label={e.status} color={T.green} bg={T.greenL}/>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.m,textAlign:"right"}}>{e.time}</div>
        </div>)}
      </div>:<div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:14,fontSize:12,color:T.ink3,fontFamily:F.b}}>No learning evidence yet. Once users complete lessons, acknowledgements and quiz results will be captured here and linked to AI Central evidence.</div>}
    </Card>
  </div>;
}

/* Section */
const AIIA_RISK_CATEGORIES = [
  {cat:"Security Risks",icon:"?",color:"#E84040",items:["Adversarial attacks & prompt injection","Data poisoning of training sets","Model theft or extraction","Unauthorized access to AI systems","Supply chain vulnerabilities via third-party models","System manipulation and evasion"]},
  {cat:"Safety Risks",icon:"?",color:"#E8A020",items:["Unintended consequences from autonomous decisions","System malfunction or failure in safety-critical domains","Lack of robustness under adversarial inputs","Human overreliance on AI recommendations","Poor testing and validation before deployment"]},
  {cat:"Privacy Risks",icon:"?",color:"#9061F9",items:["Data leakage and unauthorized access to PII","Inappropriate profiling or re-identification","Lack of transparency and informed consent","Weak data governance and GDPR/CCPA non-compliance","Re-identification from anonymised training data"]},
  {cat:"Ethical & Societal Risks",icon:"?",color:"#4B7BF5",items:["Algorithmic bias and discrimination against protected groups","Erosion of human agency in high-stakes decisions","Social inequality amplification","Environmental impact of energy-intensive AI","Labour market disruption from automation"]},
  {cat:"Reliability & Robustness",icon:"?",color:"#0DB4A0",items:["Model drift","Hallucinations in generative AI","Failure under out-of-distribution inputs","Inconsistent outputs across demographic groups","Insufficient continuous monitoring"]},
  {cat:"Compliance & Legal Risks",icon:"?",color:"#E8A020",items:["EU AI Act non-compliance for high-risk systems","GDPR Art.22 automated decision violations","Anti-discrimination law violations","Intellectual property and copyright issues","Failure to maintain audit trails and documentation"]},
  {cat:"Operational Risks",icon:"?",color:"#6E7594",items:["Inadequate human oversight processes","Dependency on single-point-of-failure AI vendors","Lack of incident response for AI failures","Insufficient staff competence (ISO 42001 C.7.2)","No kill-switch or emergency stop mechanism"]},
];

const AIIA_PHASES = [
  {
    id:1, name:"System Characterisation", subtitle:"The 'What'",
    clause:"ISO 42001 C.6.1.4 / Annex A.5.1",
    icon:"?", color:"#4B7BF5",
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
    icon:"?", color:"#9061F9",
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
    icon:"?", color:"#E84040",
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
    icon:"?", color:"#E8A020",
    desc:"Score each identified impact by severity and likelihood to enable prioritisation of mitigation efforts.",
    steps:[
      {title:"Likelihood Scoring (1-5)",detail:"1=Very Unlikely, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain. Base scores on evidence from testing, comparable systems, and expert judgment."},
      {title:"Severity Scoring (1-5)",detail:"1=Negligible, 2=Minor, 3=Moderate, 4=Serious, 5=Critical/Irreversible. Weight by whether vulnerable groups are disproportionately affected."},
      {title:"Risk Score Calculation",detail:"Risk Score = Likelihood x Severity. <5: Low, 5-9: Medium, 10-15: High, >15: Critical."},
      {title:"Document Risk Acceptance Decisions",detail:"ISO 42001 C.6.1.1 requires formal documentation of which risks are accepted within tolerance, by whom, and on what basis. Risk owner sign-off required."},
    ],
    outputs:["Scored impact register","Risk acceptance decisions","Heat map visualisation","Risk prioritisation report"],
    isoRef:"ISO 42001 Clause 6.1.1, 6.1.2, 8.2 / Annex A.5",
  },
  {
    id:5, name:"Mitigation & Treatment", subtitle:"The 'Fix'",
    clause:"ISO 42001 C.8.3 / Annex A controls",
    icon:"?", color:"#1FB864",
    desc:"ISO 42001 Clause 8.4 requires you to treat all identified impacts. Select controls from Annex A.",
    steps:[
      {title:"Technical Controls",detail:"Retrain on balanced datasets, implement fairness constraints, deploy RLHF guardrails, apply differential privacy, add robustness testing (red teaming), enable continuous bias monitoring with automated alerts."},
      {title:"Governance Controls (HITL)",detail:"Human-in-the-Loop requirement: no high-impact decision without human review. Define escalation procedures, override mechanisms, and accountability for AI decisions. Document in RACI."},
      {title:"Transparency Controls",detail:"Explicit AI disclosure labelling ('This decision was assisted by AI'), model cards documenting limitations, explainability layer (SHAP/LIME), user notification per EU AI Act Art.52."},
      {title:"Statement of Applicability",detail:"ISO 42001 C.8.3 requires a Statement of Applicability (SoA) mapping selected Annex A controls to identified risks. Document included/excluded controls with justification."},
    ],
    outputs:["Risk treatment plan","Statement of Applicability (SoA)","Implemented controls evidence","Model cards and bias test results"],
    isoRef:"ISO 42001 Clause 8.3, 8.4 / Annex A.2-A.10",
  },
  {
    id:6, name:"Conclusion & Approval", subtitle:"The 'Go / No-Go'",
    clause:"ISO 42001 C.9.3 / Annex A.5.3",
    icon:"?", color:"#0DB4A0",
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
        sub="ISO 42001 Annex A Control A.5"
      />

      {/* View toggle */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{id:"phases",label:"Phases"},{id:"categories",label:"Risk Categories"}].map(v =>
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
                <div style={{display:"flex",justifyContent:"center",marginBottom:7}}><Glyph name={p.name} color={isAct?p.color:T.ink3} size={18}/></div>
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
                <IconBox name={phase.name} color={phase.color} size={18} style={{width:40,height:40,borderRadius:10}}/>
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
                  </button>
                  <button
                    disabled={activePhase===6}
                    onClick={()=>setActivePhase(p=>Math.min(6,p+1))}
                    style={{flex:1,background:phase.color,color:"#fff",border:"none",
                      borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b,
                      opacity:activePhase===6?.4:1}}>
                    Next</button>
                </div>
                {activePhase===6&&(
                  <button onClick={()=>setTab("hitl")} style={{
                    width:"100%",background:T.green,color:"#fff",border:"none",
                    borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b
                  }}>Submit to HITL</button>
                )}
              </div>
            </div>
          </div>
        )}
      </>}

      {view === "categories" && (
        <div>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,marginBottom:16,lineHeight:1.7}}>
            Seven risk categories from ISO 42001 training material for Step 3 of the AIIA process. Use during Phase 3: Impact Identification.
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
                  <IconBox name={cat.cat} color={cat.color} size={17} style={{width:34,height:34}}/>
                  <div style={{flex:1}}>
                    <h3 style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>
                      {cat.cat}
                    </h3>
                    <span style={{fontSize:10,color:cat.color,fontFamily:F.m}}>
                      {cat.items.length} threat vectors
                    </span>
                  </div>
                  <span style={{color:T.ink4,transform:activeCat===i?"rotate(90deg)":"none",
                    transition:"transform .2s",fontSize:14}}>{">"}</span>
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

/* Section */
const IMPL_PHASES = [
  {
    id:"plan", label:"Phase 1", subtitle:"Understanding & Preparation",
    color:"#4B7BF5", icon:"?", status:"complete",
    clause:"ISO 42001 Clauses 4 & 6",
    desc:"Establish the foundation: leadership buy-in, team formation, scope definition, gap analysis, and objectives.",
    steps:[
      {n:1, title:"Get Leadership Buy-in & Commit Resources", status:"complete", owner:"CEO / Board", clause:"C.5.1", deliverable:"Formal commitment from senior leadership, approved budget approved.and resource allocation", detail:"Present business case: legal risk of non-compliance (EU AI Act fines can be material; document quantified exposure in the business case."},
      {n:2, title:"Form Cross-functional AIMS Team", status:"complete", owner:"CAIO", clause:"C.5.3", deliverable:"Team structure with defined roles, RACI matrix", detail:"Appoint project lead and assemble representatives from legal, compliance, data science, IT, product management, HR, and ethics. ISO 42001 requires diverse cross-functional governance structure (Clause 5.3)."},
      {n:3, title:"Define AIMS Scope (Clause 4.3)", status:"complete", owner:"AIMS Team", clause:"C.4.3", deliverable:"Documented scope statement specifying AI systems, roles, and boundaries", detail:"Identify all AI systems in scope. Define organisational units and locations covered. Specify AI roles: provider, producer, deployer, or partner. Consider starting with a pilot focusing on highest-risk applications."},
      {n:4, title:"Conduct Gap Analysis & Risk Assessment", status:"active", owner:"GRC + CAIO", clause:"C.6.1", deliverable:"Gap analysis report, AI risk register, implementation roadmap", detail:"Benchmark current AI practices against all ISO 42001 clauses. Perform comprehensive AI risk assessment for bias, security, privacy, ethical risks. Produce prioritised list of improvement areas. Use ISO 42001 Checklist tab for gap tracking."},
      {n:5, title:"Define AI Objectives& Policies (C.5 & C.6)", status:"active", owner:"CAIO + Legal", clause:"C.5.2, C.6.2", deliverable:"AI policy document, objectives and metrics log, risk/opportunity treatment plan", detail:"Establish AI policy per C.5.2 requirements: purpose, scope, guiding principles, prohibited uses, ethical guidelines. Set measurable AIMS objectives aligned to business goals. Define how risks and opportunities identified in Step 4 will be addressed."},
    ]
  },
  {
    id:"do", label:"Phase 2", subtitle:"Implementation",
    color:"#9061F9", icon:"?", status:"active",
    clause:"ISO 42001 Clauses 7 & 8",
    desc:"Implement the AIMS: documentation, Annex A controls, training, awareness, and operational processes.",
    steps:[
      {n:6, title:"Develop AIMS Documentation (Clause 7)", status:"active", owner:"AIMS Team + Legal", clause:"C.7.5", deliverable:"Complete AIMS documentation suite including Statement of Applicability (SoA)", detail:"Create all mandatory documented information: AI policies, procedures, ethical guidelines, AIA methodologies, risk assessment records, and treatment plans. Produce SoA detailing which Annex A controls are included/excluded and why."},
      {n:7, title:"Implement Annex A Controls", status:"active", owner:"Engineering + CAIO", clause:"Annex A", deliverable:"Evidence of controls: bias test results, data provenance logs, AIA reports", detail:"Core implementation: data governance, technical robustness, transparency, human oversight, and monitoring controls."},
      {n:8, title:"Training & Awareness Programme (Clause 7)", status:"pending", owner:"HR + CAIO", clause:"C.7.2, C.7.3", deliverable:"Training materials, attendance records, competency evidence", detail:"Roll out tailored training for all relevant staff: AI developers, managers, end-users, and compliance teams. Cover AIMS policies, AI risk categories, ethical obligations, and individual responsibilities. ISO 42001 C.7.2 requires documented evidence of competence."},
    ]
  },
  {
    id:"check", label:"Phase 3", subtitle:"Monitoring & Evaluation",
    color:"#E8A020", icon:"?", status:"pending",
    clause:"ISO 42001 Clause 9",
    desc:"Evaluate AIMS performance through KPIs, internal audits, and management review.",
    steps:[
      {n:9, title:"Monitor, Measure & Analyse AIMS Performance", status:"pending", owner:"AI Governance Lead", clause:"C.9.1", deliverable:"Performance monitoring reports, anomaly logs, incident reports", detail:"Define and track KPIs for AIMS effectiveness: bias metric drift, incident frequency, control compliance rate, HITL approval volumes. Log anomalies and system changes. ISO 42001 C.9.1 requires documented evaluation of what, when, how, and by whom monitoring is conducted."},
      {n:10, title:"Conduct Internal Audit", status:"pending", owner:"Internal Audit / GRC", clause:"C.9.2", deliverable:"Internal audit report with non-conformities and improvement opportunities", detail:"Designated internal team or external consultant verifies AIMS compliance with all ISO 42001 requirements. Auditors must be selected for objectivity and impartiality (C.9.2). Audit findings documented and reported to relevant management."},
      {n:11, title:"Perform Management Review", status:"pending", owner:"CAIO + C-Suite", clause:"C.9.3", deliverable:"Management review minutes with decisions and actions documented", detail:"AIMS team presents monitoring results, audit findings, AI system performance, and stakeholder feedback to top management. Review must assess AIMS suitability, adequacy, and effectiveness. Outputs include decisions on improvement opportunities and AIMS changes."},
    ]
  },
  {
    id:"act", label:"Phase 4", subtitle:"Improvement & Certification",
    color:"#1FB864", icon:"?", status:"pending",
    clause:"ISO 42001 Clause 10",
    desc:"Address non-conformities, achieve certification, and embed continual improvement into operations.",
    steps:[
      {n:12, title:"Implement Corrective Actions (Clause 10)", status:"pending", owner:"AIMS Team", clause:"C.10.1", deliverable:"Corrective action plans, evidence of resolution", detail:"Address all non-conformities identified during internal audit and management review. Perform root cause analysis. Implement corrective actions, verify effectiveness, and update documentation. ISO 42001 C.10.1 requires documented nonconformity management."},
      {n:13, title:"Engage Accredited Certification Body", status:"pending", owner:"CAIO + Procurement", clause:"External", deliverable:"Signed agreement with accredited certification body", detail:"Select an accredited ISO 42001 certification body (check IAF/UKAS accreditation). Provide AIMS documentation for Stage 1 review. Agree audit timeline, scope, and format. Budget typical timeline: 3-6 months"},
      {n:14, title:"External Certification Audit", status:"pending", owner:"All Teams", clause:"ISO 42001 Cert", deliverable:"ISO 42001 certificate upon successful audit completion", detail:"Stage 1: documentation review. Stage 2: operational effectiveness audit."},
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
  const statusLabel = s => s==="complete"?"Complete":s==="active"?"Active":"Pending";

  return (
    <div style={{animation:"up .3s ease"}}>
      <SHead
        title="ISO 42001 Implementation Tracker"
        sub="PDCA 4-phase, 15-step implementation roadmap"
      />

      {/* Overall progress */}
      <Card style={{padding:"14px 18px",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>
              AIMS Implementation Progress
            </div>
            <p style={{fontSize:11,color:T.ink4,fontFamily:F.b}}>
              {completedSteps} of {allSteps.length} steps complete - {activeSteps} in progress
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
              <div style={{display:"flex",marginBottom:8}}><Glyph name={phase.label} color={isAct?phase.color:T.ink3} size={18}/></div>
              <div style={{fontSize:10,fontWeight:700,color:isAct?phase.color:T.ink3,
                fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>
                {phase.label}
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
                        {step.status==="complete"?"Done":step.n}
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
                          transition:"transform .2s",fontSize:14,flexShrink:0,marginTop:2}}>{">"}</span>
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

/* Section */
function PageModelRegistry({setTab}) {
  const [sel,setSel]=useState(MODEL_REGISTRY[0]);
  const rCol=r=>r==="Critical"?T.red:r==="High"?T.amber:r==="Medium"?T.blue:r==="Unknown"?T.ink4:T.green;
  const sCol=s=>s==="In Production"?T.green:s==="Awaiting Approval"?T.amber:s==="Suspended"?T.red:s==="Unclassified"?T.red:T.ink3;
  const Check=({v,label})=><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
    <div style={{width:16,height:16,borderRadius:4,background:v?T.greenL:T.redL,border:`1px solid ${v?T.green:T.red}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:9,fontWeight:800,color:v?T.green:T.red}}>{v?"Yes":"No"}</span>
    </div>
    <span style={{fontSize:10,color:v?T.ink2:T.ink4,fontFamily:F.b}}>{label}</span>
  </div>;
  const unclassified=MODEL_REGISTRY.filter(m=>m.euAiAct==="Unclassified").length;
  const critical=MODEL_REGISTRY.filter(m=>m.risk==="Critical").length;
  const noCard=MODEL_REGISTRY.filter(m=>!m.modelCard).length;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Model Registry" sub="ISO 42001 C.8.4"/>
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
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{m.dept} {m.vendor}</span>
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
            <div style={{fontSize:10,fontWeight:700,color:T.red,fontFamily:F.b,marginBottom:3}}>Action Required</div>
            <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{sel.euAiAct==="Unclassified"?"EU AI Act risk classification must be completed before August 2026 enforcement.":"High-Risk system - full conformity assessment required per EU AI Act Art.43."}</p>
          </div>}
          <button onClick={()=>setTab("hitl")} style={{width:"100%",marginTop:12,background:T.caio,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Review in HITL Queue </button>
        </div>
      </Card>}
    </div>
  </div>;
}

/* Section */
function PageMaturityRadar() {
  const [sel,setSel]=useState(null);
  const overall=Math.round(MATURITY_DOMAINS.reduce((s,d)=>s+d.score,0)/MATURITY_DOMAINS.length);
  const matLabel=s=>s>=85?"Leading":s>=70?"Established":s>=55?"Developing":s>=40?"Initial":"Unprepared";
  const matCol=s=>s>=85?T.green:s>=70?T.blue:s>=55?T.amber:T.red;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Governance Maturity" sub="CAIO Kit Part 1"/>
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
        {[["Leading","85+",T.green],["Established","70-84",T.blue],["Developing","55-69",T.amber],["Initial","40",T.red],["Unprepared","<40",T.red]].map(([l,r,c])=><div key={l} style={{display:"flex",gap:8,marginBottom:4,alignItems:"center"}}>
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
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Gap to target: {gap > 0 ? `+${gap} pts needed` : "Target met"}</span>
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

/* Section */
function PageUseCases() {
  const [sel,setSel]=useState(USE_CASES[0]);
  const stageCol=s=>s==="Scale"?T.green:s==="Pilot"?T.blue:T.amber;
  const scoreCol=s=>s>=85?T.green:s>=70?T.blue:s>=55?T.amber:T.red;
  const byStage=(stage)=>USE_CASES.filter(u=>u.stage===stage);
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Use Case Pipeline" sub="CAIO Kit Part 2"/>
    {/* Pipeline kanban */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      {[["POC","Validate Assumption",T.amber],["Pilot","Validate Value",T.blue],["Scale","Validate Operations",T.green]].map(([stage,sub,col])=><div key={stage}>
        <div style={{background:col+"18",border:`1px solid ${col}30`,borderRadius:"8px 8px 0 0",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:col,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{stage}</div>
            <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{sub}</div>
          </div>
          <div style={{width:22,height:22,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:11,fontWeight:800,color:"#fff",fontFamily:F.m}}>{byStage(stage).length}</span>
          </div>
        </div>
        <div style={{border:`1px solid ${col}30`,borderTop:"none",borderRadius:"0 0 8px 8px",padding:"8px 8px",background:T.s1,minHeight:120}}>
          {byStage(stage).map(uc=><div key={uc.id} onClick={()=>setSel(uc)} style={{background:sel?.id===uc.id?col+"14":T.s3,border:`1px solid ${sel?.id===uc.id?col+"50":T.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8,cursor:"pointer",transition:"all .15s"}}>
            <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4,lineHeight:1.3}}>{uc.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{uc.dept}</span>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Score:</span>
                <span style={{fontSize:11,fontWeight:800,fontFamily:F.m,color:scoreCol(uc.score)}}>{uc.score}</span>
              </div>
            </div>
          </div>)}
        </div>
      </div>)}
    </div>
    {/* Detail */}
    {sel&&<Card style={{overflow:"hidden",animation:"fade .25s ease"}}>
      <div style={{background:`linear-gradient(135deg,${stageCol(sel.stage)}18,${T.s2})`,borderBottom:`1px solid ${stageCol(sel.stage)}30`,padding:"16px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
            <Tag label={sel.stage} color={stageCol(sel.stage)} bg={stageCol(sel.stage)+"20"}/>
            <Tag label={sel.dept} color={T.ink3} bg={T.s3}/>
            <Tag label={sel.status} color={sel.status==="Complete"?T.green:T.blue} bg={sel.status==="Complete"?T.greenL:T.blueL}/>
          </div>
          <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:700,color:T.ink,marginBottom:6}}>{sel.name}</h3>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>{sel.desc}</p>
        </div>
        <div style={{background:T.s3,borderRadius:10,padding:"12px 16px",textAlign:"center",flexShrink:0,border:`1px solid ${scoreCol(sel.score)}40`}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Score</div>
          <div style={{fontSize:32,fontWeight:800,fontFamily:F.m,color:scoreCol(sel.score),letterSpacing:"-0.03em"}}>{sel.score}</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>/100</div>
        </div>
      </div>
      <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[["Impact",sel.impact],["Feasibility",sel.feasibility],["Risk (inverted)",10-sel.risk]].map(([label,val])=>{
          const col=val>=8?T.green:val>=6?T.blue:val>=4?T.amber:T.red;
          return <div key={label} style={{background:T.s3,borderRadius:8,padding:"11px 13px",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>{label}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.m,color:col}}>{val}<span style={{fontSize:11,color:T.ink4}}>/10</span></div>
            <Bar value={val*10} color={col}/>
          </div>;
        })}
      </div>
      <div style={{padding:"0 18px 16px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[["Owner",sel.owner],["Target ETA",sel.eta],["Status",sel.status]].map(([l,v])=><div key={l} style={{padding:"9px 10px",background:T.s3,borderRadius:7}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{v}</div>
        </div>)}
      </div>
    </Card>}
  </div>;
}


/* Section */
const COMMON_CONTROLS = [
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

const SCOPE_DATA = {
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

const TRUST_CENTER_DATA = {
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
function PageScope({role}) {
  const rc=RC(role), D=SCOPE_DATA;
  const [tab,setTab]=useState("scope");
  const tabs=[{id:"scope",label:"ISMS Scope"},{id:"parties",label:"Interested Parties"},{id:"legal",label:"Legal & Regulatory"},{id:"context",label:"Context"}];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="ISMS Scope Builder" sub="ISO 27001 Clause 4"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?rc:T.s2,color:tab===t.id?"#fff":T.ink3,border:`1px solid ${tab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b}}>{t.label}</button>)}
    </div>
    {tab==="scope"&&<div>
      <Card style={{padding:18,marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>Organisation Profile</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {[["Organisation",D.orgName],["Industry",D.industry],["AI Systems in Scope",D.aiSystems],["Employees",D.employees.toLocaleString()],["Data Subjects",D.dataSubjects.toLocaleString()],["Geography",D.geography.join(", ")]].map(([l,v])=><div key={l} style={{background:T.s3,borderRadius:8,padding:"11px 13px"}}><div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b}}>{v}</div></div>)}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>In Scope</h3>
          {D.inScope.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green,marginTop:5,flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{item}</span></div>)}
        </Card>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Out of Scope</h3>
          {D.outOfScope.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:5,height:5,borderRadius:"50%",background:T.red,marginTop:5,flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{item}</span></div>)}
          <h3 style={{fontFamily:F.h,fontSize:13,fontWeight:700,color:T.ink,marginBottom:10,marginTop:14}}>Cloud Providers</h3>
          {D.cloudProviders.map((cp,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><Tag label={cp} color={rc} bg={RCL(role)+"80"}/></div>)}
        </Card>
      </div>
    </div>}
    {tab==="parties"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Interested Parties Register</h3></div>
      {D.interestedParties.map((p,i)=><div key={i} style={{padding:"13px 16px",borderBottom:i<D.interestedParties.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 2fr 80px",gap:12,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.party}</span>
        <span style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{p.need}</span>
        <Tag label={p.impact} color={p.impact==="Critical"?T.red:p.impact==="High"?T.amber:T.blue} bg={p.impact==="Critical"?T.redL:p.impact==="High"?T.amberL:T.blueL}/>
      </div>)}
    </Card>}
    {tab==="legal"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Legal & Regulatory Requirements</h3></div>
      {D.legalRequirements.map((r,i)=><div key={i} style={{padding:"13px 16px",borderBottom:i<D.legalRequirements.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 2fr 80px 90px",gap:12,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.req}</span>
        <span style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{r.obligation}</span>
        <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Due: {r.due}</span>
        <Tag label={r.status} color={r.status==="Urgent"?T.red:r.status==="Active"?T.green:r.status==="In Progress"?T.blue:T.ink3} bg={r.status==="Urgent"?T.redL:r.status==="Active"?T.greenL:r.status==="In Progress"?T.blueL:T.ink5}/>
      </div>)}
    </Card>}
    {tab==="context"&&<Card style={{padding:18}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>Context of the Organisation</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[["Internal Context","Governance structure, culture, and resources","Established ISMS governance team. Board-level security committee. Annual security budget approved."],["External Context","Legal, regulatory, market, and societal factors","Operating in highly regulated financial services sector. Subject to UK GDPR, FCA, EU AI Act, and DORA. Customer base across 23 countries."],["SWOT","Internal positive factors","SOC 2 Type II certified. Strong security culture. Dedicated CISO, CAIO, and CDPO. AI governance programme in progress."],["SWOT","External threats and challenges","EU AI Act August 2026 enforcement. Increasing supply chain attacks. Staff turnover in security roles. Legacy system integration complexity."]].map(([title,sub,body])=><div key={title} style={{background:T.s3,borderRadius:9,padding:"13px 15px"}}>
          <div style={{fontSize:11,fontWeight:700,color:rc,fontFamily:F.b,marginBottom:3}}>{title}</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginBottom:8}}>{sub}</div>
          <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{body}</p>
        </div>)}
      </div>
    </Card>}
  </div>;
}

/* Section */
function PageCommonControls({role}) {
  const rc=RC(role);
  const [sel,setSel]=useState(COMMON_CONTROLS[0]);
  const stCol=s=>s==="Implemented"?T.green:s==="Partial"?T.amber:T.red;
  const allFrameworks=["ISO 27001","ISO 27002","SOC 2","NIST CSF","CIS Controls","GDPR","ISO 42001","PCI DSS","HIPAA","DORA","EU AI Act","NIST AI RMF","MAS TRM","RBI"];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Common Control Library" sub="One control mapped across 16 frameworks"/>
    <div style={{background:T.s3,borderRadius:9,padding:"11px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap"}}>
      {allFrameworks.map(fw=><Tag key={fw} label={fw} color={rc} bg={RCL(role)+"80"}/>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 80px 80px",padding:"7px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["Control Area","Status","Strength"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {COMMON_CONTROLS.map((c,i)=><div key={c.id} onClick={()=>setSel(c)} style={{display:"grid",gridTemplateColumns:"2fr 80px 80px",padding:"12px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<COMMON_CONTROLS.length-1?`1px solid ${T.border}`:"none",background:sel?.id===c.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel?.id===c.id?"3px solid "+rc:"3px solid transparent",transition:"all .15s"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.control}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {Object.keys(c.mappings).slice(0,4).map(fw=><Tag key={fw} label={fw} color={T.ink4} bg={T.s3}/>)}
                {Object.keys(c.mappings).length>4&&<Tag label={"+"+(Object.keys(c.mappings).length-4)+" more"} color={rc} bg={RCL(role)+"80"}/>}
              </div>
            </div>
            <Tag label={c.status} color={stCol(c.status)} bg={stCol(c.status)+"18"}/>
            <Tag label={c.strength} color={stCol(c.strength)} bg={stCol(c.strength)+"18"}/>
          </div>)}
        </div>
      </div>
      {sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${rc}18,${T.s3})`,borderBottom:`1px solid ${rc}30`,padding:"14px 16px"}}>
          <Tag label={sel.status} color={stCol(sel.status)} bg={stCol(sel.status)+"18"}/>
          <h3 style={{fontFamily:F.h,fontSize:13,fontWeight:700,color:T.ink,marginTop:8,lineHeight:1.3}}>{sel.control}</h3>
        </div>
        <div style={{padding:15}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>Framework Mappings</div>
          {Object.entries(sel.mappings).map(([fw,ref])=><div key={fw} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{fw}</span>
            <Tag label={ref} color={rc} bg={RCL(role)+"80"}/>
          </div>)}
          <div style={{marginTop:12,background:T.s3,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Required Evidence</div>
            <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:0}}>{sel.evidence}</p>
          </div>
        </div>
      </Card>}
    </div>
  </div>;
}

/* Section */
function PageTrustCenter({role, showToast}) {
  const rc=RC(role), D=TRUST_CENTER_DATA;
  const [tab,setTab]=useState("overview");
  const tabs=[{id:"overview",label:"Overview"},{id:"questionnaires",label:"Security Questionnaires"},{id:"policies",label:"Public Policies"},{id:"copilot",label:"AI Trust Copilot"}];
  const [loading,setLoading]=useState(false);
  const [aiResponse,setAiResponse]=useState(null);
  const [question,setQuestion]=useState("");
  const runCopilot=async()=>{
    if(!question.trim())return;
    setLoading(true);setAiResponse(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are VerisZone's CRM Trust Agent and AI Trust Copilot. Help sales and security teams respond to customer trust and security questions. You have knowledge of: ISO 27001 (65% readiness, targeting Q3 2026 cert), SOC 2 Type II (certified, 91%), GDPR compliance (81%), EU AI Act programme (72%), and security practices. Be specific, professional, and reference certifications where applicable. Keep responses concise and suitable for customer-facing use.",messages:[{role:"user",content:question}]})});
      const d=await res.json();
      setAiResponse((d.content&&d.content[0]&&d.content[0].text)||"");
    }catch{showToast("Copilot failed","error");}
    setLoading(false);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Trust Center" sub="Customer-facing compliance posture"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?rc:T.s2,color:tab===t.id?"#fff":T.ink3,border:`1px solid ${tab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b}}>{t.label}</button>)}
    </div>
    {tab==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:14}}>
        {D.certifications.map((c,i)=>{
          const col=c.score>=85?T.green:c.score>=65?T.blue:c.score>=50?T.amber:T.red;
          return <Card key={c.name} style={{padding:16,animation:`up ${.3+i*.07}s ease both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><IconBox name={c.name} color={col} size={16} style={{marginBottom:8}}/><h3 style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b,marginTop:5}}>{c.name}</h3></div>
              <Ring score={c.score} color={col} size={46}/>
            </div>
            <Bar value={c.score} color={col} delay={i*80}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <Tag label={c.status} color={c.status==="Certified"||c.status==="Compliant"?T.green:c.status==="In Progress"?T.amber:T.ink3} bg={c.status==="Certified"||c.status==="Compliant"?T.greenL:c.status==="In Progress"?T.amberL:T.ink5}/>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Auditor: {c.auditor}</span>
            </div>
          </Card>;
        })}
      </div>
    </div>}
    {tab==="questionnaires"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
      {D.questionnaires.map((q,i)=><Card key={q.name} style={{padding:16,animation:`up ${.3+i*.07}s ease both`}}>
        <h3 style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:5}}>{q.name}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,marginBottom:10}}>{q.desc}</p>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <Tag label={q.pages+" pages"} color={T.ink3} bg={T.s3}/>
          <Tag label={q.time} color={T.ink3} bg={T.s3}/>
          <Tag label={q.status} color={T.green} bg={T.greenL}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>showToast("AI auto-completing questionnaire...")} style={{flex:1,background:rc,color:"#fff",border:"none",borderRadius:7,padding:"8px",fontSize:10,fontWeight:600,fontFamily:F.b}}>AI Complete</button>
          <button onClick={()=>showToast("Downloading questionnaire...")} style={{flex:1,background:T.s3,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Download</button>
        </div>
      </Card>)}
    </div>}
    {tab==="policies"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Publicly Available Policies</h3></div>
      {D.policies.map((p,i)=><div key={i} style={{padding:"12px 16px",borderBottom:i<D.policies.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{p.name}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>v{p.version} {p.updated}</span></div>
        <Tag label="Public" color={T.green} bg={T.greenL}/>
        <button onClick={()=>showToast("Downloading policy")} style={{background:rc+"20",color:rc,border:`1px solid ${rc}30`,borderRadius:6,padding:"5px 11px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Download</button>
      </div>)}
    </Card>}
    {tab==="copilot"&&<Card style={{padding:20}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>"</div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>CRM Trust Agent </h3>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,marginBottom:16}}>Help sales teams respond to customer security questions, RFP security sections, and trust reviews. Ask any compliance question as if you are a customer.</p>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {["Do you have ISO 27001?","How do you handle GDPR?","What is your AI governance approach?","Do you have SOC 2 Type II?"].map(q=><button key={q} onClick={()=>setQuestion(q)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 11px",fontSize:10,color:T.ink2,fontFamily:F.b}}>{q}</button>)}
      </div>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask a customer trust or security question" rows={3} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:T.ink,fontFamily:F.b,resize:"none",marginBottom:10}}/>
      <button onClick={runCopilot} disabled={loading||!question.trim()} style={{background:loading?T.border:rc,color:loading?T.ink4:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontSize:12,fontWeight:600,fontFamily:F.b,display:"flex",alignItems:"center",gap:8,marginBottom:aiResponse?14:0}}>
        {loading?<><Spinner color="#fff"/>Generating response</>:"Generate Response"}
      </button>
      {aiResponse&&<div style={{background:T.s3,borderRadius:8,padding:"14px 16px",borderLeft:"3px solid "+rc,animation:"up .3s ease"}}>
        <div style={{fontSize:9,fontWeight:700,color:rc,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>AI Trust Response</div>
        <p style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap"}}>{aiResponse}</p>
        <button onClick={()=>showToast("Copied to clipboard")} style={{marginTop:10,background:T.s4,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 12px",fontSize:10,fontFamily:F.b}}>Copy Response</button>
      </div>}
    </Card>}
  </div>;
}


const ANNEX_A_CONTROLS=[
  {id:"A5",clause:"A.5",title:"Organisational Controls",total:37,implemented:24,partial:8,notImpl:5,score:73},
  {id:"A6",clause:"A.6",title:"People Controls",total:8,implemented:5,partial:2,notImpl:1,score:75},
  {id:"A7",clause:"A.7",title:"Physical Controls",total:14,implemented:9,partial:3,notImpl:2,score:75},
  {id:"A8",clause:"A.8",title:"Technological Controls",total:34,implemented:18,partial:10,notImpl:6,score:65},
];
const ISO27001_POLICIES=[
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
const EVIDENCE_LIBRARY=[
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
const AUDIT_PLAN=[
  {id:"au1",area:"Clause 6",auditor:"Internal GRC",scheduled:"May 20, 2026",status:"Scheduled",critical:false},
  {id:"au2",area:"Annex A.8",auditor:"Internal GRC",scheduled:"Jun 3, 2026",status:"Scheduled",critical:false},
  {id:"au3",area:"Annex A.5",auditor:"External",scheduled:"Jun 17, 2026",status:"Scheduled",critical:false},
  {id:"au4",area:"Clause 9",auditor:"Internal GRC",scheduled:"Jul 1, 2026",status:"Planned",critical:false},
  {id:"au5",area:"Full ISMS Certification Audit",auditor:"BSI Group",scheduled:"Aug 2026",status:"Planned",critical:true},
];
const CORRECTIVE_ACTIONS=[
  {id:"ca1",finding:"DR test exceeded RTO target (6.5hrs vs 4hr target)",priority:"High",owner:"CIO",due:"Jun 15",status:"In Progress",linked:"A.5.29"},
  {id:"ca2",finding:"47 assets without classification (A.8.2 gap)",priority:"High",owner:"IT Ops",due:"May 30",status:"In Progress",linked:"A.5.9"},
  {id:"ca3",finding:"3 privileged accounts with no quarterly review",priority:"Critical",owner:"IT Ops",due:"May 15",status:"Overdue",linked:"A.8.3"},
  {id:"ca4",finding:"Penetration test remediation",priority:"High",owner:"SecOps",due:"Jun 1",status:"In Progress",linked:"A.8.8"},
  {id:"ca5",finding:"Business Continuity Policy never reviewed",priority:"Medium",owner:"CIO",due:"Jun 30",status:"Not Started",linked:"A.5.29"},
];
const GAP_DATA={
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
const INTEGRATIONS={
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

function PageISO27001({role,showToast}){
  const rc=RC(role);
  const [activeTab,setActiveTab]=useState("overview");
  const tabs=[{id:"overview",label:"Overview"},{id:"controls",label:"Annex A"},{id:"policies",label:"Policies"},{id:"evidence",label:"Evidence"},{id:"audit",label:"Audit Planner"},{id:"actions",label:"Corrective Actions"}];
  const totalControls=ANNEX_A_CONTROLS.reduce((s,a)=>s+a.total,0);
  const totalImpl=ANNEX_A_CONTROLS.reduce((s,a)=>s+a.implemented,0);
  const certScore=Math.round((totalImpl/totalControls)*100);
  const expiring=EVIDENCE_LIBRARY.filter(e=>e.status==="Expiring").length;
  const expired=EVIDENCE_LIBRARY.filter(e=>e.status==="Expired").length;
  const overdueCA=CORRECTIVE_ACTIONS.filter(c=>c.status==="Overdue").length;
  const psc=s=>s==="Approved"?T.green:s==="In Review"?T.blue:s==="Needs Update"||s==="Expired"?T.red:T.amber;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="ISO 27001 Workspace" sub="ISMS implementation"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?rc:T.s2,color:activeTab===t.id?"#fff":T.ink3,border:`1px solid ${activeTab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b,transition:"all .15s"}}>{t.label}</button>)}
    </div>
    {activeTab==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{label:"Cert. Readiness",value:certScore+"%",color:certScore>=80?T.green:T.amber,sub:"Overall ISMS score"},{label:"Controls Impl.",value:totalImpl+"/"+totalControls,color:rc,sub:"Annex A progress"},{label:"Evidence Issues",value:expiring+expired,color:expired>0?T.red:T.amber,sub:expired+" expired / "+expiring+" expiring"},{label:"Corrective Actions",value:CORRECTIVE_ACTIONS.length,color:overdueCA>0?T.red:T.amber,sub:overdueCA+" overdue"}].map(k=><Card key={k.label} style={{padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>{k.label}</div>
          <div style={{fontSize:24,fontWeight:800,fontFamily:F.m,color:k.color,marginBottom:2}}>{k.value}</div>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
        </Card>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {ANNEX_A_CONTROLS.map((a,i)=>{const col=a.score>=80?T.green:a.score>=65?T.blue:a.score>=50?T.amber:T.red;return <Card key={a.id} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><Tag label={a.clause} color={rc} bg={RCL(role)+"80"}/><h3 style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b,marginTop:6,lineHeight:1.3}}>{a.title}</h3></div>
            <Ring score={a.score} color={col} size={46}/>
          </div>
          <Bar value={a.score} color={col} delay={i*80}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            {[["Impl.",a.implemented,T.green],["Partial",a.partial,T.amber],["Missing",a.notImpl,T.red]].map(([l,v,c])=><div key={l} style={{flex:1,background:T.s3,borderRadius:6,padding:"5px 8px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,fontFamily:F.m,color:c}}>{v}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{l}</div></div>)}
          </div>
        </Card>;})}
      </div>
    </div>}
    {activeTab==="controls"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Annex A Control Tracker</h3>
        <Tag label="ISO 27001:2022" color={rc} bg={RCL(role)+"80"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"60px 2fr 60px 60px 70px 70px",padding:"7px 16px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
        {["Clause","Title","Total","Impl.","Partial","Missing"].map(h=><span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>)}
      </div>
      {ANNEX_A_CONTROLS.map((a,i)=><div key={a.id} style={{display:"grid",gridTemplateColumns:"60px 2fr 60px 60px 70px 70px",padding:"11px 16px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:i%2===0?T.s1:T.bg}}>
        <Tag label={a.clause} color={rc} bg={RCL(role)+"60"}/><span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{a.title}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.ink2,fontWeight:700}}>{a.total}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.green,fontWeight:700}}>{a.implemented}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.amber,fontWeight:700}}>{a.partial}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.red,fontWeight:700}}>{a.notImpl}</span>
      </div>)}
    </Card>}
    {activeTab==="policies"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Policy Library- {ISO27001_POLICIES.length} Policies</h3>
        <div style={{display:"flex",gap:7}}><Tag label={ISO27001_POLICIES.filter(p=>p.status==="Approved").length+" Approved"} color={T.green} bg={T.greenL}/><Tag label={ISO27001_POLICIES.filter(p=>p.status==="Draft"||p.status==="Needs Update").length+" Need Action"} color={T.red} bg={T.redL}/></div>
      </div>
      {ISO27001_POLICIES.map((p,i)=>{const sc=psc(p.status);return <div key={p.id} style={{padding:"11px 16px",borderBottom:i<ISO27001_POLICIES.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"2fr 100px 80px 80px 70px 60px",gap:8,alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{p.name}</div><div style={{display:"flex",gap:5}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>v{p.version}</span>{p.linked.map(l=><Tag key={l} label={l} color={T.ink4} bg={T.s3}/>)}</div></div>
        <Tag label={p.status} color={sc} bg={sc+"18"}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{p.owner}</span>
        <span style={{fontSize:9,color:T.ink3,fontFamily:F.m}}>{p.reviewed}</span>
        <Tag label={p.risk} color={p.risk==="High"?T.red:p.risk==="Medium"?T.amber:T.green} bg={p.risk==="High"?T.redL:p.risk==="Medium"?T.amberL:T.greenL}/>
        <button onClick={()=>showToast("Policy editor opening...")} style={{background:rc+"20",color:rc,border:`1px solid ${rc}30`,borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>Edit</button>
      </div>;})}
    </Card>}
    {activeTab==="evidence"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Evidence Library - {EVIDENCE_LIBRARY.length} Items</h3>
        <div style={{display:"flex",gap:7}}><Tag label={expired+" Expired"} color={T.red} bg={T.redL}/><Tag label={expiring+" Expiring"} color={T.amber} bg={T.amberL}/></div>
      </div>
      {EVIDENCE_LIBRARY.map((e,i)=>{const sc=e.status==="Valid"?T.green:e.status==="Expiring"?T.amber:T.red;return <div key={e.id} style={{padding:"11px 16px",borderBottom:i<EVIDENCE_LIBRARY.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"2fr 80px 80px 90px 60px",gap:8,alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{e.name}</div><div style={{display:"flex",gap:6}}><Tag label={e.control} color={T.ink4} bg={T.s3}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{e.type} - {e.size}</span></div></div>
        <Tag label={e.status} color={sc} bg={sc+"18"}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{e.owner}</span>
        <span style={{fontSize:9,color:sc,fontFamily:F.m,fontWeight:600}}>Exp: {e.expires}</span>
        <button onClick={()=>showToast("Evidence viewer opening...")} style={{background:T.s3,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>View</button>
      </div>;})}
    </Card>}
    {activeTab==="audit"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Internal Audit Programme 2026</h3></div>
      {AUDIT_PLAN.map((a,i)=>{const sc=a.status==="Scheduled"?T.blue:a.status==="Complete"?T.green:T.ink3;return <div key={a.id} style={{padding:"13px 16px",borderBottom:i<AUDIT_PLAN.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:a.critical?T.redL:T.s3,border:`2px solid ${a.critical?T.red:sc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:800,color:a.critical?T.red:sc,fontFamily:F.m}}>{i+1}</span></div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{a.area}</div><div style={{display:"flex",gap:10}}><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Auditor: {a.auditor}</span><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{a.scheduled}</span></div></div>
        <div style={{display:"flex",gap:7}}>{a.critical&&<Tag label="Cert. Audit" color={T.red} bg={T.redL}/>}<Tag label={a.status} color={sc} bg={sc+"18"}/></div>
      </div>;})}
    </Card>}
    {activeTab==="actions"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Corrective Action Register</h3><Tag label={overdueCA+" Overdue"} color={T.red} bg={T.redL}/></div>
      {CORRECTIVE_ACTIONS.map((ca,i)=>{const pc=ca.priority==="Critical"?T.red:ca.priority==="High"?T.amber:T.blue;const sc=ca.status==="Overdue"?T.red:ca.status==="In Progress"?T.blue:T.ink3;return <div key={ca.id} style={{padding:"12px 16px",borderBottom:i<CORRECTIVE_ACTIONS.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,borderLeft:"3px solid "+pc}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{flex:1,paddingRight:10}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{ca.finding}</div><div style={{display:"flex",gap:8}}><Tag label={ca.linked} color={T.ink4} bg={T.s3}/><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Owner: {ca.owner}</span><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Due: {ca.due}</span></div></div>
          <div style={{display:"flex",gap:6}}><Tag label={ca.priority} color={pc} bg={pc+"18"}/><Tag label={ca.status} color={sc} bg={sc+"18"}/></div>
        </div>
      </div>;})}
    </Card>}
  </div>;
}

function PageGapAnalysis({role,showToast}){
  const rc=RC(role);
  const [loading,setLoading]=useState(false);
  const [aiInsight,setAiInsight]=useState(null);
  const G=GAP_DATA;
  const priCol=p=>p==="Critical"?T.red:p==="High"?T.amber:p==="Medium"?T.blue:T.ink3;
  const priColBg=p=>p==="Critical"?T.redL:p==="High"?T.amberL:p==="Medium"?T.blueL:T.ink5;
  const runAI=async()=>{
    setLoading(true);setAiInsight(null);
    try{
      const prompt="Analyse these compliance gaps and provide remediation plan: "+G.topGaps.slice(0,5).map(g=>g.gap+" ("+g.priority+", "+g.fw+")").join("; ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are VerisZone's AI Gap Analysis Copilot. Return ONLY valid JSON: {\"summary\":\"string\",\"critical\":[{\"action\":\"string\",\"owner\":\"string\",\"days\":1,\"impact\":\"string\"}],\"quickWins\":[{\"action\":\"string\",\"effort\":\"Low\",\"days\":1}],\"insight\":\"string\"}",messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=(d.content&&d.content[0]&&d.content[0].text)||"";
      try{setAiInsight(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setAiInsight({summary:raw,critical:[],quickWins:[],insight:""});}
    }catch{showToast("AI analysis failed","error");}
    setLoading(false);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Gap Analysis Dashboard" sub="Multi-framework compliance gaps"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {[{label:"Overall Score",value:G.overall+"%",color:G.overall>=80?T.green:T.amber,sub:"vs 100% target"},{label:"Critical Gaps",value:G.topGaps.filter(g=>g.priority==="Critical").length,color:T.red,sub:"Audit-blocking"},{label:"Frameworks",value:G.frameworks.length,color:rc,sub:"Assessed"},{label:"High Priority",value:G.topGaps.filter(g=>g.priority==="High").length,color:T.amber,sub:"<30 days"}].map((k,i)=><Card key={k.label} style={{padding:"12px 14px",animation:`up ${.3+i*.07}s ease both`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>{k.label}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:F.m,color:k.color,marginBottom:2}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </Card>)}
    </div>
    <Card style={{padding:16,marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Framework Readiness Scores</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {G.frameworks.map((fw,i)=>{const col=fw.score>=85?T.green:fw.score>=70?T.blue:fw.score>=55?T.amber:T.red;return <div key={fw.fw} style={{background:T.s3,borderRadius:9,padding:"12px 14px",animation:`up ${.3+i*.06}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><span style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.m}}>{fw.fw}</span><span style={{fontSize:16,fontWeight:800,fontFamily:F.m,color:col}}>{fw.score}%</span></div>
          <Bar value={fw.score} color={col} delay={i*70}/>
          <div style={{display:"flex",gap:8,marginTop:7}}><span style={{fontSize:9,color:T.green,fontFamily:F.m}}>Implemented {fw.implemented}</span><span style={{fontSize:9,color:T.amber,fontFamily:F.m}}>Partial {fw.partial}</span><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>Missing {fw.missing}</span>{fw.critical>0&&<Tag label={fw.critical+" critical"} color={T.red} bg={T.redL}/>}</div>
        </div>;})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:12,marginBottom:12}}>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Top Compliance Gaps</h3></div>
        {G.topGaps.map((g,i)=><div key={g.id} style={{padding:"10px 16px",borderBottom:i<G.topGaps.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,borderLeft:"3px solid "+priCol(g.priority)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{flex:1,paddingRight:8}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{g.gap}</div><div style={{display:"flex",gap:7}}><Tag label={g.fw} color={T.ink4} bg={T.s3}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Owner: {g.owner}</span><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>~{g.days}d</span></div></div>
            <div style={{display:"flex",gap:5,flexShrink:0}}><Tag label={g.type} color={T.ink3} bg={T.s3}/><Tag label={g.priority} color={priCol(g.priority)} bg={priColBg(g.priority)}/></div>
          </div>
        </div>)}
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Department Heatmap</h3>
        {G.heatmap.map((d,i)=>{const col=d.score>=80?T.green:d.score>=65?T.blue:d.score>=50?T.amber:T.red;return <div key={d.dept} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{d.dept}</span><div style={{display:"flex",gap:6}}><Tag label={d.gaps+" gaps"} color={d.gaps>=7?T.red:d.gaps>=4?T.amber:T.green} bg={d.gaps>=7?T.redL:d.gaps>=4?T.amberL:T.greenL}/><span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:col}}>{d.score}%</span></div></div>
          <Bar value={d.score} color={col} delay={i*60}/>
        </div>;})}
      </Card>
    </div>
    <Card style={{padding:18,border:`1px solid ${rc}30`}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
        <div style={{width:28,height:28,borderRadius:7,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}></div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>AI Gap Analysis Copilot</h3>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginBottom:14,lineHeight:1.7}}>Analyse your top compliance gaps and generate a prioritised remediation plan with owners, timelines, and quick wins.</p>
      <button onClick={runAI} disabled={loading} style={{background:loading?T.border:rc,color:loading?T.ink4:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontSize:12,fontWeight:600,fontFamily:F.b,display:"flex",alignItems:"center",gap:8,marginBottom:aiInsight?14:0}}>
        {loading?<><Spinner color="#fff"/>Analysing gaps...</>:""}
      </button>
      {aiInsight&&<div style={{animation:"up .3s ease"}}>
        <div style={{background:T.s3,borderRadius:8,padding:"12px 14px",marginBottom:12,borderLeft:"3px solid "+rc}}><p style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.75,margin:0}}>{aiInsight.summary}</p></div>
        {aiInsight.critical&&aiInsight.critical.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Critical Actions</div>
          {aiInsight.critical.map((c,i)=><div key={i} style={{background:T.redL,border:"1px solid "+T.red+"25",borderRadius:7,padding:"9px 12px",marginBottom:6}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.action}</div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>Owner: {c.owner}</span><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>{c.days} days</span></div></div>)}
        </div>}
        {aiInsight.quickWins&&aiInsight.quickWins.length>0&&<div>
          <div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Quick Wins</div>
          {aiInsight.quickWins.map((q,i)=><div key={i} style={{background:T.greenL,border:"1px solid "+T.green+"25",borderRadius:7,padding:"9px 12px",marginBottom:6,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{q.action}</span><div style={{display:"flex",gap:6}}><Tag label={q.effort} color={T.amber} bg={T.amberL}/><Tag label={q.days+"d"} color={T.green} bg={T.greenL}/></div></div>)}
        </div>}
      </div>}
    </Card>
  </div>;
}

function PageIntegrations({role,showToast}){
  const rc=RC(role);
  const [activeTab,setActiveTab]=useState("servicenow");
  const SN=INTEGRATIONS.servicenow;
  const CRM=INTEGRATIONS.crm;
  const tabs=[{id:"servicenow",label:"ServiceNow"},{id:"crm",label:"CRM Platforms"},{id:"marketplace",label:"Marketplace"}];
  const tsc=s=>s==="In Progress"?T.blue:s==="Open"?T.amber:s==="Pending"?T.ink3:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Integrations" sub="ServiceNow GRC"/>
    <div style={{display:"flex",gap:6,marginBottom:16}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?rc:T.s2,color:activeTab===t.id?"#fff":T.ink3,border:`1px solid ${activeTab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 16px",fontSize:10,fontWeight:600,fontFamily:F.b,transition:"all .15s"}}>{t.label}</button>)}
    </div>
    {activeTab==="servicenow"&&<div>
      <Card style={{padding:16,marginBottom:12,border:"1px solid "+T.amber+"40"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:9,background:"#1B3A3C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}></div>
            <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:F.b}}>ServiceNow GRC/ IRM</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{SN.instance}</div></div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Tag label="Not Connected" color={T.amber} bg={T.amberL}/>
            <button onClick={()=>showToast("Opening OAuth setup...")} style={{background:rc,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Connect</button>
          </div>
        </div>
        <div style={{background:T.s3,borderRadius:8,padding:"11px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Integration Capabilities</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:5}}>
            {["Incident Creation","Change Request","Risk Issue","GRC Task","Control Remediation","Evidence Request","Policy Exception","CMDB Asset Sync","SLA Status Sync","Bi-directional Updates"].map(cap=><div key={cap} style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:4,height:4,borderRadius:"50%",background:rc}}/><span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{cap}</span></div>)}
          </div>
        </div>
      </Card>
      <Card style={{overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Trigger Configuration</h3></div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 120px 90px 60px 60px",padding:"7px 16px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
          {["Event","Table","Priority","Auto","Active"].map(h=><span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>)}
        </div>
        {SN.triggers.map((t,i)=><div key={t.id} style={{display:"grid",gridTemplateColumns:"2fr 120px 90px 60px 60px",padding:"10px 16px",alignItems:"center",borderBottom:i<SN.triggers.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
          <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{t.event}</span>
          <Tag label={t.table} color={T.ink3} bg={T.s3}/>
          <Tag label={t.priority} color={t.priority==="Critical"?T.red:t.priority==="High"?T.amber:T.blue} bg={t.priority==="Critical"?T.redL:t.priority==="High"?T.amberL:T.blueL}/>
          <div style={{width:30,height:15,borderRadius:8,background:t.auto?rc:T.border,display:"flex",alignItems:"center",padding:"0 2px"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#fff",marginLeft:t.auto?13:0,transition:"margin-left .2s"}}/></div>
          <div style={{width:30,height:15,borderRadius:8,background:t.active?T.green:T.border,display:"flex",alignItems:"center",padding:"0 2px"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#fff",marginLeft:t.active?13:0,transition:"margin-left .2s"}}/></div>
        </div>)}
      </Card>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Recent ServiceNow Tickets</h3></div>
        {SN.recentTickets.map((t,i)=><div key={t.id} style={{padding:"11px 16px",borderBottom:i<SN.recentTickets.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
          <Tag label={t.id} color={rc} bg={RCL(role)+"80"}/>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t.title}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{t.type} {t.created}</span></div>
          <Tag label={t.priority} color={t.priority==="High"?T.amber:t.priority==="Critical"?T.red:T.blue} bg={t.priority==="High"?T.amberL:t.priority==="Critical"?T.redL:T.blueL}/>
          <Tag label={t.status} color={tsc(t.status)} bg={tsc(t.status)+"18"}/>
          <button onClick={()=>showToast("Opening in ServiceNow...")} style={{background:T.s3,color:T.ink3,border:`1px solid ${T.border}`,borderRadius:5,padding:"4px 9px",fontSize:9,fontFamily:F.b}}>Open </button>
        </div>)}
      </Card>
    </div>}
    {activeTab==="crm"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
        {CRM.platforms.map((p,i)=><Card key={p.name} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <div style={{display:"flex",gap:9,alignItems:"center"}}>
              <IconBox name={p.name} color={p.color} size={15} style={{width:32,height:32}}/>
              <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.name}</span>
            </div>
            <Tag label={p.status} color={T.amber} bg={T.amberL}/>
          </div>
          <p style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.6,marginBottom:10}}>Customer trust requests, security questionnaires, compliance evidence sharing from your CRM pipeline.</p>
          <button onClick={()=>showToast("Opening OAuth flow...")} style={{width:"100%",background:p.color,color:"#fff",border:"none",borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Connect {p.name}</button>
        </Card>)}
      </div>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Customer Trust Requests</h3>
          <Tag label={CRM.trustRequests.length+" Active"} color={rc} bg={RCL(role)+"80"}/>
        </div>
        {CRM.trustRequests.map((r,i)=>{const sc=r.status==="In Progress"?T.blue:r.status==="Pending"?T.amber:T.ink3;return <div key={r.id} style={{padding:"11px 16px",borderBottom:i<CRM.trustRequests.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 100px 80px 80px 70px",gap:8,alignItems:"center"}}>
          <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{r.account}</div><span style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{r.type}</span></div>
          <Tag label={r.stage} color={rc} bg={RCL(role)+"80"}/>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Due {r.due}</span>
          <Tag label={r.status} color={sc} bg={sc+"18"}/>
          <button onClick={()=>showToast("Trust pack opening...")} style={{background:rc+"20",color:rc,border:"1px solid "+rc+"30",borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>Respond</button>
        </div>;})}
      </Card>
    </div>}
    {activeTab==="marketplace"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
      {[{name:"Jira",icon:"?",cat:"Task Management",status:"Available",col:"#0052CC"},{name:"Slack",icon:"?",cat:"Notifications",status:"Available",col:"#4A154B"},{name:"Microsoft 365",icon:"?",cat:"Evidence Collection",status:"Available",col:"#0078D4"},{name:"Google Workspace",icon:"?",cat:"Evidence Collection",status:"Available",col:"#4285F4"},{name:"AWS Security",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#FF9900"},{name:"Azure Defender",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#0078D4"},{name:"GitHub",icon:"?",cat:"Dev Security",status:"Coming Q3",col:"#6E5494"},{name:"Qualys",icon:"?",cat:"Vulnerability",status:"Coming Q4",col:"#ED1C24"},{name:"Okta",icon:"?",cat:"IAM Evidence",status:"Coming Q4",col:"#007DC1"},{name:"Crowdstrike",icon:"?",cat:"Endpoint Security",status:"Coming Q4",col:"#E01B2D"},{name:"Tenable",icon:"?",cat:"Vulnerability",status:"Roadmap",col:"#00B4C8"},{name:"Splunk",icon:"?",cat:"SIEM Evidence",status:"Roadmap",col:"#65A637"}].map((p,i)=><Card key={p.name} style={{padding:13,animation:`up ${.3+i*.04}s ease both`}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><IconBox name={`${p.name} ${p.cat}`} color={p.col} size={13} style={{width:28,height:28,borderRadius:7}}/><div><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{p.cat}</div></div></div>
        <Tag label={p.status} color={p.status==="Available"?T.green:p.status.includes("Q")?T.amber:T.ink3} bg={p.status==="Available"?T.greenL:p.status.includes("Q")?T.amberL:T.ink5}/>
        {p.status==="Available"&&<button onClick={()=>showToast("Connecting to "+p.name+"...")} style={{width:"100%",marginTop:8,background:rc,color:"#fff",border:"none",borderRadius:6,padding:"6px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Connect</button>}
      </Card>)}
    </div>}
  </div>;
}

/* Section */
const CUBE_DATA = {
  objectives:[
    {id:"strategic", label:"Strategic Objectives", icon:"?", color:"#4B7BF5"},
    {id:"operations",label:"Operations Objectives",icon:"?", color:"#0DB4A0"},
    {id:"reporting", label:"Reporting Objectives", icon:"?", color:"#9061F9"},
    {id:"compliance",label:"Compliance Objectives",icon:"?", color:"#E8A020"},
  ],
  components:[
    {id:"c1",num:1,label:"Control Environment",desc:"Establish AI governance, culture, roles and ethics.",color:"#E8A020",icon:"?",
     cells:{strategic:"AI governance structure and oversight",operations:"AI roles, skills and responsibility model",reporting:"AI governance metrics and reporting",compliance:"AI ethics, policy alignment and regulatory commitment"},
     veris:"Strategy Pillars"},
    {id:"c2",num:2,label:"Risk Assessment",desc:"Identify and assess AI risks affecting objectives.",color:"#E84040",icon:"?",
     cells:{strategic:"AI risk appetite and tolerance",operations:"AI use case risk identification",reporting:"AI risk impact on reporting integrity",compliance:"AI regulatory and ethical risk assessment"},
     veris:"AIRA Register"},
    {id:"c3",num:3,label:"Control Activities",desc:"Design and implement controls to mitigate AI risks.",color:"#1FB864",icon:"?",
     cells:{strategic:"AI policies, standards and procedures",operations:"Model controls, validation and safeguards",reporting:"Data quality, model output controls",compliance:"Bias detection, explainability and compliance checks"},
     veris:"Policy Library"},
    {id:"c4",num:4,label:"Information & Communication",desc:"Ensure quality, transparency and communication of AI information.",color:"#4B7BF5",icon:"?",
     cells:{strategic:"Stakeholder engagement on AI strategy",operations:"AI system documentation and data lineage",reporting:"AI-generated information disclosures",compliance:"Regulatory communication and transparency"},
     veris:"ISMS Scope"},
    {id:"c5",num:5,label:"Monitoring Activities",desc:"Monitor AI performance, controls and risks continuously.",color:"#9061F9",icon:"?",
     cells:{strategic:"AI governance oversight and assurance",operations:"Continuous monitoring of AI performance",reporting:"AI model drift and accuracy checks",compliance:"Independent reviews, audits and validation"},
     veris:"KPI Dashboard"},
  ],
  assurance:[
    {id:"a1",label:"Audit Tests",           desc:"Verify design and operating effectiveness of AI controls.",        icon:"?",color:"#4B7BF5",veris:"ISO 27001 Workspace"},
    {id:"a2",label:"Validation & Review",   desc:"Independent model validation and risk reviews.",                   icon:"?",color:"#9061F9",veris:"AI Model Registry"},
    {id:"a3",label:"Compliance Testing",    desc:"Assess adherence to laws, regulations and internal policy.",       icon:"?", color:"#1FB864",veris:"ISO 27001 Checklists"},
    {id:"a4",label:"Continuous Monitoring", desc:"Real-time monitoring and anomaly detection of AI systems.",         icon:"?", color:"#E8A020",veris:"Domain Metrics"},
    {id:"a5",label:"Assurance Reporting",   desc:"Report findings, issues and remediation status to stakeholders.",  icon:"?", color:"#E84040",veris:"Reports"},
  ],
  foundation:[
    {label:"AI Governance Framework",       icon:"?",color:"#4B7BF5"},
    {label:"Ethics & Responsible AI",       icon:"?",color:"#9061F9"},
    {label:"Data Governance & Quality",     icon:"?",color:"#0DB4A0"},
    {label:"Technology & Model Management", icon:"?",color:"#E8A020"},
    {label:"People, Culture & Capability",  icon:"?",color:"#1FB864"},
    {label:"Risk Culture & Accountability", icon:"?",color:"#E84040"},
  ],
};

function PageAIGovCube({role,setTab}) {
  const rc=RC(role);
  const [selComp,setSelComp]=useState(null);
  const [selA,setSelA]=useState(null);
  const [view,setView]=useState("cube");
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Governance Cube" sub="Integrating AI Risks, Controls and Assurance Across the Enterprise"/>
    <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
      {[{id:"cube",label:"Governance Cube"},{id:"assurance",label:"Assurance"},{id:"foundation",label:"Foundation"}].map(v=>
        <button key={v.id} onClick={()=>setView(v.id)} style={{background:view===v.id?rc:T.s2,color:view===v.id?"#fff":T.ink3,border:`1px solid ${view===v.id?rc:T.border}`,borderRadius:7,padding:"7px 16px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{v.label}</button>
      )}
    </div>
    {view==="cube"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"180px repeat(4,1fr)",gap:5,marginBottom:5}}>
        <div style={{display:"flex",alignItems:"flex-end",padding:"0 0 8px 0"}}>
          <div><div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:2}}>Objective Setting</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>AI Objectives</div></div>
        </div>
        {CUBE_DATA.objectives.map(obj=><div key={obj.id} style={{background:obj.color+"22",border:`1px solid ${obj.color}40`,borderRadius:"8px 8px 0 0",padding:"10px 12px",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Glyph name={obj.label} color={obj.color} size={16}/></div>
          <div style={{fontSize:10,fontWeight:700,color:obj.color,fontFamily:F.b,lineHeight:1.3}}>{obj.label}</div>
        </div>)}
      </div>
      {CUBE_DATA.components.map((comp,ci)=><div key={comp.id} style={{display:"grid",gridTemplateColumns:"180px repeat(4,1fr)",gap:5,marginBottom:5,animation:`up ${.3+ci*.07}s ease both`}}>
        <div onClick={()=>setSelComp(selComp===comp.id?null:comp.id)} style={{background:comp.color+"18",border:`1px solid ${comp.color}40`,borderRadius:8,padding:"12px 12px",cursor:"pointer",borderLeft:"4px solid "+comp.color,boxShadow:selComp===comp.id?"0 0 16px "+comp.color+"25":"none"}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <Glyph name={comp.label} color={comp.color} size={16}/>
            <div><div style={{fontSize:10,fontWeight:700,color:comp.color,fontFamily:F.b,marginBottom:3}}>{comp.num}. {comp.label}</div>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,lineHeight:1.4}}>{comp.desc}</div></div>
          </div>
        </div>
        {CUBE_DATA.objectives.map(obj=><div key={obj.id} style={{background:selComp===comp.id?comp.color+"12":T.s2,border:`1px solid ${selComp===comp.id?comp.color+"40":T.border}`,borderRadius:8,padding:"10px 11px",transition:"all .2s"}}>
          <div style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{comp.cells[obj.id]}</div>
        </div>)}
      </div>)}
      {selComp&&(()=>{const comp=CUBE_DATA.components.find(c=>c.id===selComp);return comp?<Card style={{padding:16,marginTop:8,animation:"up .25s ease",border:"1px solid "+comp.color+"40"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><div style={{fontSize:12,fontWeight:700,color:comp.color,fontFamily:F.b,marginBottom:3}}>{comp.num}. {comp.label}</div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{comp.desc}</p></div>
          <button onClick={()=>setSelComp(null)} style={{background:"none",border:"none",color:T.ink4,fontSize:16,cursor:"pointer"}}>Close</button>
        </div>
        <div style={{background:T.s3,borderRadius:8,padding:"10px 14px",borderLeft:"3px solid "+comp.color}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>Where in VerisZone</div>
          <div style={{fontSize:11,color:comp.color,fontFamily:F.b,fontWeight:600}}>{comp.veris}</div>
        </div>
      </Card>:null;})()}
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,padding:"10px 14px",background:T.s3,borderRadius:8,border:"1px solid "+T.border}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,whiteSpace:"nowrap"}}>Assurance Dimension (Third Line)</div>
        <div style={{flex:1,height:1,background:T.border}}/>
        <button onClick={()=>setView("assurance")} style={{background:rc,color:"#fff",border:"none",borderRadius:6,padding:"5px 12px",fontSize:10,fontWeight:600,fontFamily:F.b}}>View Activities</button>
      </div>
    </div>}
    {view==="assurance"&&<div>
      <div style={{background:T.caio+"18",border:"1px solid "+T.caio+"30",borderRadius:10,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.caio,fontFamily:F.b,marginBottom:4}}>Third Line Assurance</div>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>Five assurance activities verify that AI governance controls are designed and operating effectively across all five governance components.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {CUBE_DATA.assurance.map((a,i)=><Card key={a.id} style={{padding:16,animation:`up ${.3+i*.07}s ease both`,border:"1px solid "+a.color+"25",cursor:"pointer"}} onClick={()=>setSelA(selA===a.id?null:a.id)}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:selA===a.id?10:0}}>
            <IconBox name={a.label} color={a.color} size={16} style={{width:34,height:34,borderRadius:9}}/>
            <div><div style={{fontSize:12,fontWeight:700,color:a.color,fontFamily:F.b,marginBottom:3}}>{a.label}</div>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:0}}>{a.desc}</p></div>
          </div>
          {selA===a.id&&<div style={{background:T.s3,borderRadius:7,padding:"9px 12px",borderLeft:"3px solid "+a.color,animation:"up .2s ease"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>Where in VerisZone</div>
            <div style={{fontSize:11,color:a.color,fontFamily:F.b,fontWeight:600}}>{a.veris}</div>
          </div>}
        </Card>)}
      </div>
    </div>}
    {view==="foundation"&&<div>
      <div style={{background:T.s3,border:"1px solid "+T.border,borderRadius:10,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:4}}>Internal Environment</div>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>Six foundational pillars that underpin the entire AI Governance Cube. These must be established before the five governance components can function effectively.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:16}}>
        {CUBE_DATA.foundation.map((f,i)=><Card key={f.label} style={{padding:15,animation:`up ${.3+i*.07}s ease both`,borderLeft:"4px solid "+f.color}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}><IconBox name={f.label} color={f.color} size={15} style={{width:30,height:30,borderRadius:8}}/>
          <div style={{fontSize:11,fontWeight:700,color:f.color,fontFamily:F.b,lineHeight:1.3}}>{f.label}</div></div>
          <Bar value={[72,74,65,68,77,70][i]} color={f.color} delay={i*60}/>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:4}}>Foundation strength</div>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:10}}>How to Read the AI Governance Cube</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Across the top","AI Objectives"],["Down the side","Governance Components"],["Across the depth","Assurance Activities"]].map(([title,desc])=><div key={title} style={{background:T.s3,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:rc,fontFamily:F.b,marginBottom:4}}>{title}</div>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{desc}</div>
          </div>)}
        </div>
      </Card>
    </div>}
  </div>;
}

/* AI Central - enterprise AI transformation command center */
const AI_CENTRAL_GUARDRAILS = [
  {cat:"Strategic", items:["Business objective linked","Executive sponsor required","Business value hypothesis","Success metrics defined"]},
  {cat:"Governance", items:["AI owner assigned","Risk owner assigned","Governance review completed","Policy mapping completed","AI inventory updated"]},
  {cat:"Compliance", items:["ISO 42001 checklist","ISO 27001 checklist","NIST AI RMF checklist","GDPR/DPDP checklist","Regulatory impact assessment"]},
  {cat:"Security", items:["Data classification completed","Access control reviewed","Prompt injection risk reviewed","Model security review completed","Vendor risk reviewed"]},
  {cat:"Responsible AI", items:["Fairness assessment","Bias assessment","Explainability assessment","Transparency statement","Accountability mapping"]},
  {cat:"Human Oversight", items:["HITL for critical decisions","HOTL monitoring","Human-in-command for high risk","Escalation owner","Manual override process"]},
  {cat:"Audit", items:["Evidence repository updated","Approval history retained","Risk decisions logged","Control testing captured","Open findings tracked"]},
];

const AI_CENTRAL_INITIATIVES = [
  {
    id:"ai-001", name:"Customer Resolution Copilot", unit:"Customer Operations", category:"GenAI Copilot", businessOwner:"Priya Mehta", technicalOwner:"Platform AI", sponsor:"Aisha Patel", cxo:"CAIO, COO, CISO", status:"In Progress", priority:"Critical", risk:"High", expected:"$4.8M", actual:"$1.2M", stage:"Governance Review", guardrail:82, adoption:64, valueScore:76,
    policies:["Responsible GenAI Use","Human Oversight Standard"], controls:["CTRL-AI-014","CTRL-SEC-022"], audits:["AUD-Q2-09"], risks:["Prompt injection","Data leakage"], roi:"22%", savings:"$1.2M", revenue:"$0.6M", productivity:"18%", training:"68%", resistance:"Medium"
  },
  {
    id:"ai-002", name:"Credit Decision Assurance", unit:"Retail Banking", category:"Decision Support", businessOwner:"Omar Khan", technicalOwner:"Risk Engineering", sponsor:"Rafael Torres", cxo:"CEO, CAIO, CRO, Legal", status:"Awaiting Approval", priority:"Critical", risk:"Critical", expected:"$7.2M", actual:"$0.9M", stage:"Human Oversight Review", guardrail:74, adoption:42, valueScore:69,
    policies:["High-Risk AI Policy","Adverse Decision Review"], controls:["CTRL-AI-001","CTRL-GRC-044"], audits:["AUD-EUAI-03"], risks:["Adverse decision harm","Explainability gap"], roi:"14%", savings:"$0.7M", revenue:"$1.1M", productivity:"11%", training:"54%", resistance:"High"
  },
  {
    id:"ai-003", name:"Finance Close Automation", unit:"Finance", category:"Process Automation", businessOwner:"Elena Rossi", technicalOwner:"Enterprise Apps", sponsor:"Marcus Reid", cxo:"CFO, CIO, COO", status:"Build", priority:"High", risk:"Medium", expected:"$3.1M", actual:"$1.8M", stage:"Build", guardrail:91, adoption:79, valueScore:88,
    policies:["Automation Control Policy","Audit Evidence Policy"], controls:["CTRL-FIN-008","CTRL-AUD-019"], audits:["AUD-SOX-11"], risks:["Incorrect journal suggestion","Segregation of duties"], roi:"31%", savings:"$1.8M", revenue:"$0.1M", productivity:"26%", training:"82%", resistance:"Low"
  },
  {
    id:"ai-004", name:"Workforce Skills Navigator", unit:"People", category:"Recommendation", businessOwner:"Hannah Lee", technicalOwner:"Data Science", sponsor:"Niamh Lynch", cxo:"CHRO, CDPO, CAIO", status:"Risk Assessment", priority:"Medium", risk:"High", expected:"$2.4M", actual:"$0.2M", stage:"Risk Assessment", guardrail:67, adoption:31, valueScore:58,
    policies:["Employee Data Use","Fairness and Bias Standard"], controls:["CTRL-PRV-012","CTRL-RAI-006"], audits:["AUD-PRV-02"], risks:["Employee profiling","Bias in opportunity matching"], roi:"8%", savings:"$0.2M", revenue:"$0", productivity:"7%", training:"39%", resistance:"Medium"
  }
];

const AI_CENTRAL_LIFECYCLE = ["Demand Intake","Business Case Review","Risk Assessment","Governance Review","Security Review","Human Oversight Review","Approval","Build","Deployment","Monitoring","Audit","Continuous Improvement","Retirement"];
const AI_CENTRAL_CXOS = [
  {role:"CEO", focus:"Strategic value and enterprise transformation", count:7, score:84},
  {role:"CIO", focus:"Technology architecture and platform readiness", count:9, score:78},
  {role:"CAIO", focus:"AI governance, lifecycle, and adoption", count:14, score:82},
  {role:"CISO", focus:"Cybersecurity, model security, and data leakage risk", count:8, score:74},
  {role:"CFO", focus:"Investment, ROI, and cost optimization", count:5, score:80},
  {role:"CHRO", focus:"Workforce readiness and AI training", count:4, score:69},
  {role:"COO", focus:"Operational adoption and process change", count:6, score:76},
  {role:"CRO", focus:"Enterprise risk and risk acceptance", count:5, score:72},
  {role:"Legal", focus:"Regulatory and policy compliance", count:10, score:81},
];
const AI_CENTRAL_EVIDENCE = [
  {item:"Human oversight design record", initiative:"Credit Decision Assurance", control:"CTRL-AI-001", risk:"Adverse decision harm", owner:"Model Risk", status:"In Review", approval:"Awaiting Approval", time:"2026-06-18 09:20"},
  {item:"Prompt injection test results", initiative:"Customer Resolution Copilot", control:"CTRL-SEC-022", risk:"Prompt injection", owner:"CISO Office", status:"Complete", approval:"Approved", time:"2026-06-17 16:10"},
  {item:"Fairness assessment workbook", initiative:"Workforce Skills Navigator", control:"CTRL-RAI-006", risk:"Bias in opportunity matching", owner:"People Analytics", status:"In Progress", approval:"Pending", time:"2026-06-16 11:45"},
  {item:"SOX automation audit sample", initiative:"Finance Close Automation", control:"CTRL-AUD-019", risk:"Segregation of duties", owner:"Internal Audit", status:"Complete", approval:"Approved", time:"2026-06-15 14:30"},
];

function PageAICentral({role,setTab,showToast,view,setView,theme,sessionMode}) {
  const rc=AI_GOLD;
  const [selectedId,setSelectedId]=useState(AI_CENTRAL_INITIATIVES[0].id);
  const selected=AI_CENTRAL_INITIATIVES.find(i=>i.id===selectedId)||AI_CENTRAL_INITIATIVES[0];
  const learningEvidence=academyEvidenceFor(role,sessionMode==="demo");
  const evidenceItems=[...AI_CENTRAL_EVIDENCE,...learningEvidence];
  const total=AI_CENTRAL_INITIATIVES.length;
  const active=AI_CENTRAL_INITIATIVES.filter(i=>!["Retirement","Complete"].includes(i.status)).length;
  const high=AI_CENTRAL_INITIATIVES.filter(i=>i.risk==="High"||i.risk==="Critical").length;
  const pending=AI_CENTRAL_INITIATIVES.filter(i=>i.status==="Awaiting Approval").length+2;
  const avgGuard=Math.round(AI_CENTRAL_INITIATIVES.reduce((s,i)=>s+i.guardrail,0)/total);
  const avgAdopt=Math.round(AI_CENTRAL_INITIATIVES.reduce((s,i)=>s+i.adoption,0)/total);
  const avgValue=Math.round(AI_CENTRAL_INITIATIVES.reduce((s,i)=>s+i.valueScore,0)/total);
  const statusToneLocal=s=>s==="Complete"||s==="Approved"?T.green:s==="Awaiting Approval"||s==="Pending"?T.amber:s==="Critical"||s==="Overdue"?T.red:T.blue;
  const SectionTabs=()=> <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
    {AI_CENTRAL_NAV.map(({id,label})=>
      <button key={id} onClick={()=>setView(id)} style={{background:view===id?rc+"20":T.s2,border:"1px solid "+(view===id?rc+"55":T.border),color:view===id?rc:T.ink2,borderRadius:8,padding:"8px 11px",fontSize:11,fontWeight:700,fontFamily:F.b}}>{label}</button>
    )}
  </div>;
  const Metric=({label,value,sub,color,score})=> <Card style={{padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
      <div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
        <div style={{fontSize:26,fontWeight:800,color:T.ink,fontFamily:F.h}}>{value}</div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:4}}>{sub}</div>
      </div>
      {typeof score==="number"?<Ring score={score} color={color||rc} size={54}/>:<div style={{width:38,height:38,borderRadius:12,background:(color||rc)+"18",border:"1px solid "+(color||rc)+"35"}}/>}
    </div>
  </Card>;
  const Header=()=> <div style={{background:"linear-gradient(135deg,"+T.s2+", "+T.s1+")",border:"1px solid "+T.border,borderRadius:16,padding:"22px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:-60,top:-80,width:220,height:220,borderRadius:"50%",background:rc+"16",filter:"blur(24px)"}}/>
    <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",position:"relative"}}>
      <div style={{display:"flex",gap:18,alignItems:"flex-start",minWidth:0}}>
        <AICentralBrand theme={theme} width={102} style={{flexShrink:0,minWidth:260}}/>
        <div style={{minWidth:0}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
            <Tag label="AI CENTRAL" color={AI_GOLD} bg={AI_GOLD_L}/>
            <Tag label="Optional CXO workspace" color={AI_GOLD} bg={AI_GOLD+"14"}/>
          </div>
          <h2 style={{fontSize:28,fontWeight:800,color:T.ink,fontFamily:F.h,letterSpacing:"-0.03em",margin:0}}>Enterprise AI Transformation Command Center</h2>
          <p style={{fontSize:12,color:T.ink3,lineHeight:1.7,maxWidth:780,margin:"8px 0 0",fontFamily:F.b}}>Single source of truth for AI initiatives, use cases, models, risks, controls, approvals, audits, owners, business outcomes, workforce readiness, and CXO oversight.</p>
        </div>
      </div>
      <button onClick={()=>{setTab("hitl");showToast&&showToast("Opening HITL approvals from AI Central");}} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:"1px solid "+AI_GOLD_B,borderRadius:8,padding:"10px 14px",fontSize:12,fontWeight:900,fontFamily:F.b,whiteSpace:"nowrap",boxShadow:"0 14px 34px "+AI_GOLD+"22"}}>Review Approvals</button>
    </div>
  </div>;

  const Dashboard=()=> <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Total initiatives" value={total} sub="Enterprise AI portfolio" color={rc}/>
      <Metric label="Active AI projects" value={active} sub="In lifecycle" color={T.blue}/>
      <Metric label="High-risk use cases" value={high} sub="High or critical" color={T.red}/>
      <Metric label="Pending approvals" value={pending} sub="HITL and CXO" color={T.amber}/>
      <Metric label="Open audit findings" value="6" sub="2 overdue" color={T.red}/>
      <Metric label="Guardrail compliance" value={avgGuard+"%"} sub="Mandatory controls" color={T.green} score={avgGuard}/>
      <Metric label="AI adoption score" value={avgAdopt+"%"} sub="Workforce readiness" color={T.teal} score={avgAdopt}/>
      <Metric label="Business value score" value={avgValue+"%"} sub="ROI and outcomes" color={AI_GOLD} score={avgValue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>Risk heatmap</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {AI_CENTRAL_INITIATIVES.map(i=><button key={i.id} onClick={()=>{setSelectedId(i.id);setView("detail");}} style={{background:(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"18",border:"1px solid "+(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"35",borderRadius:10,padding:12,textAlign:"left"}}>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginBottom:6}}>{i.unit}</div>
            <div style={{fontSize:12,color:T.ink,fontWeight:700,lineHeight:1.35}}>{i.name}</div>
            <div style={{marginTop:10}}><PTag p={i.risk}/></div>
          </button>)}
        </div>
      </Card>
      <Card style={{padding:18}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>Governance maturity view</h3>
        {["Strategy linkage","Policy mapping","Human oversight","Evidence readiness","Value realization"].map((m,idx)=>{const val=[88,79,74,83,71][idx];return <div key={m} style={{marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,marginBottom:6}}><span>{m}</span><span style={{fontFamily:F.m}}>{val}%</span></div>
          <Bar value={val} color={val>80?T.green:val>72?T.blue:T.amber}/>
        </div>})}
      </Card>
    </div>
  </div>;

  const Registry=()=> <Card style={{padding:0,overflow:"hidden"}}>
    <div style={{padding:"16px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:15,color:T.ink}}>AI Initiative Registry</h3><Tag label="Mock seed data" color={T.ink3}/></div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{["Initiative","Business unit","Owners","CXO sponsors","Status","Priority","Risk","Value","Stage","Guardrails"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
      <tbody>{AI_CENTRAL_INITIATIVES.map(i=><tr key={i.id} onClick={()=>{setSelectedId(i.id);setView("detail");}} style={{cursor:"pointer",borderBottom:"1px solid "+T.border}}>
        <td style={{padding:"13px 12px",color:T.ink,fontWeight:700}}>{i.name}<div style={{fontSize:10,color:T.ink3,fontWeight:400}}>{i.category}</div></td>
        <td style={{padding:"13px 12px",color:T.ink2}}>{i.unit}</td>
        <td style={{padding:"13px 12px",color:T.ink2}}>{i.businessOwner}<div style={{fontSize:10,color:T.ink3}}>{i.technicalOwner}</div></td>
        <td style={{padding:"13px 12px",color:T.ink2}}>{i.cxo}</td>
        <td style={{padding:"13px 12px"}}><STag s={i.status}/></td>
        <td style={{padding:"13px 12px"}}><PTag p={i.priority}/></td>
        <td style={{padding:"13px 12px"}}><PTag p={i.risk}/></td>
        <td style={{padding:"13px 12px",color:T.green,fontFamily:F.m}}>{i.actual} / {i.expected}</td>
        <td style={{padding:"13px 12px",color:T.ink2}}>{i.stage}</td>
        <td style={{padding:"13px 12px",minWidth:120}}><Bar value={i.guardrail} color={i.guardrail>80?T.green:i.guardrail>70?T.amber:T.red}/><div style={{fontSize:10,color:T.ink3,marginTop:5}}>{i.guardrail}%</div></td>
      </tr>)}</tbody>
    </table></div>
  </Card>;

  const PilotWorkspace=()=> {
    const program=AI_ROLLOUT_PROGRAMS.find(p=>selected.name.includes(p.name.split(" ")[0]))||AI_ROLLOUT_PROGRAMS[0];
    const tasks=[
      ["Guardrail activation", "AI Spine", "In Progress", selected.guardrail, "Controls and HITL checks activated for pilot workspace"],
      ["Department enablement", selected.unit, selected.adoption>=70?"On Track":"At Risk", selected.adoption, "Training, workflow comms and adoption readiness"],
      ["Evidence collection", "Assurance", program.evidence>=80?"Ready":"Incomplete", program.evidence, program.blocker],
      ["Risk monitoring", "Risk owner", parseInt(program.riskDrift,10)>8?"Escalate":"Monitor", Math.max(35,100-Math.abs(parseInt(program.riskDrift,10))*4), "Live risk drift against approved appetite"],
    ];
    const wave=[program.pilot,program.next,"Enterprise rollout"].map((dept,idx)=>({dept,status:idx===0?"Pilot active":idx===1?program.decision==="Scale"?"Queued":"Waiting gate":"Not started",score:idx===0?program.adoption:idx===1?program.readiness:42}));
    return <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:16}}>
          <div>
            <Tag label="DEPARTMENT PILOT WORKSPACE" color={AI_GOLD} bg={AI_GOLD_L}/>
            <h3 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:T.ink,margin:"10px 0 5px"}}>{selected.name}</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>Downstream execution workspace for the pilot department. AI Central monitors tasks, deviations, adoption, guardrails, evidence and scale readiness.</p>
          </div>
          <Tag label={program.decision} color={program.decision==="Scale"?T.green:program.decision==="Hold"?T.amber:T.red} bg={(program.decision==="Scale"?T.green:program.decision==="Hold"?T.amber:T.red)+"18"}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:16}}>
          {wave.map((w,i)=><div key={w.dept} style={{background:T.s3,border:`1px solid ${i===0?AI_GOLD+"45":T.border}`,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Wave {i+1}</div>
            <div style={{fontSize:13,color:T.ink,fontWeight:900,fontFamily:F.h,marginBottom:5}}>{w.dept}</div>
            <Tag label={w.status} color={i===0?AI_GOLD:w.status==="Queued"?T.green:T.ink3} bg={(i===0?AI_GOLD:w.status==="Queued"?T.green:T.ink3)+"18"}/>
            <div style={{marginTop:10}}><Bar value={w.score} color={i===0?AI_GOLD:w.score>=70?T.green:T.amber}/></div>
          </div>)}
        </div>
        <div style={{display:"grid",gap:8}}>
          {tasks.map(([label,owner,status,score,detail])=>{
            const col=status==="At Risk"||status==="Escalate"||status==="Incomplete"?T.red:status==="Ready"||status==="On Track"?T.green:AI_GOLD;
            return <div key={label} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",display:"grid",gridTemplateColumns:"1fr 100px 90px 120px",gap:10,alignItems:"center"}}>
              <div><div style={{fontSize:12,color:T.ink,fontWeight:900,fontFamily:F.b}}>{label}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{detail}</div></div>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{owner}</span>
              <Tag label={status} color={col} bg={col+"18"}/>
              <div><Bar value={score} color={col}/><div style={{fontSize:9,color:T.ink3,fontFamily:F.m,marginTop:4}}>{score}%</div></div>
            </div>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gap:12}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 12px"}}>Pilot control room</h3>
          {[["Risk drift",program.riskDrift,parseInt(program.riskDrift,10)>0?T.red:T.green],["Evidence confidence",program.evidence+"%",program.evidence>=80?T.green:T.amber],["Adoption",program.adoption+"%",program.adoption>=70?T.green:T.amber],["Value realized",program.value,AI_GOLD]].map(([l,v,col])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{l}</span><strong style={{fontSize:13,color:col,fontFamily:F.m}}>{v}</strong>
          </div>)}
        </Card>
        <Card style={{padding:16,border:`1px solid ${program.decision==="Scale"?T.green+"40":T.amber+"40"}`}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 8px"}}>Next required action</h3>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:"0 0 12px"}}>{program.blocker}</p>
          <button onClick={()=>setView(program.decision==="Scale"?"scalegate":"evidenceconfidence")} style={{width:"100%",background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"9px 10px",color:AI_GOLD,fontFamily:F.b,fontSize:11,fontWeight:900,cursor:"pointer"}}>{program.decision==="Scale"?"Open scale gate":"Review evidence"}</button>
        </Card>
      </div>
    </div>;
  };

  const Detail=()=> <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
    <Card style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:18}}>
        <div><Tag label={selected.id.toUpperCase()} color={rc}/><h3 style={{fontSize:24,color:T.ink,margin:"10px 0 4px",fontWeight:800}}>{selected.name}</h3><p style={{color:T.ink3,fontSize:12,margin:0}}>{selected.unit} - {selected.category}</p></div>
        <Ring score={selected.guardrail} color={selected.guardrail>80?T.green:T.amber} size={76}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        {[["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["Executive sponsor",selected.sponsor],["CXO sponsors",selected.cxo],["Status",selected.status],["Lifecycle stage",selected.stage],["Linked policies",selected.policies.join(", ")],["Linked controls",selected.controls.join(", ")],["Linked risks",selected.risks.join(", ")]].map(([l,v])=><div key={l} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:8,padding:11}}><div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",marginBottom:5}}>{l}</div><div style={{fontSize:12,color:T.ink2,lineHeight:1.35}}>{v}</div></div>)}
      </div>
      <h4 style={{color:T.ink,margin:"0 0 10px",fontSize:14}}>Risk, control, audit and corrective action mapping</h4>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {["Compliant","Partially compliant","Non-compliant","Not assessed"].map((s,idx)=><div key={s} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:8,padding:11}}><Tag label={s} color={[T.green,T.amber,T.red,T.ink3][idx]}/><div style={{fontSize:10,color:T.ink3,marginTop:8}}>{[5,3,1,2][idx]} linked items</div></div>)}
      </div>
    </Card>
    <Card style={{padding:18}}>
      <h3 style={{fontSize:14,color:T.ink,margin:"0 0 14px"}}>Business value tracking</h3>
      {[["Expected ROI",selected.roi],["Cost savings",selected.savings],["Revenue impact",selected.revenue],["Productivity gains",selected.productivity],["Adoption rate",selected.adoption+"%"],["Training status",selected.training]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid "+T.border,padding:"10px 0",fontSize:12}}><span style={{color:T.ink3}}>{l}</span><span style={{color:T.ink,fontWeight:700}}>{v}</span></div>)}
    </Card>
  </div>;

  const Lifecycle=()=> <Card style={{padding:18}}>
    <h3 style={{fontSize:15,color:T.ink,margin:"0 0 16px"}}>AI Lifecycle Workflow - mandatory gates</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
      {AI_CENTRAL_LIFECYCLE.map((stage,idx)=>{const activeIdx=AI_CENTRAL_LIFECYCLE.indexOf(selected.stage);const done=idx<activeIdx,current=idx===activeIdx;return <div key={stage} style={{background:current?rc+"14":done?T.greenL:T.s2,border:"1px solid "+(current?rc+"50":done?T.green+"30":T.border),borderRadius:10,padding:12}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><div style={{fontSize:12,color:T.ink,fontWeight:800}}>{idx+1}. {stage}</div><Tag label={done?"Approved":current?"In Review":"Pending"} color={done?T.green:current?T.amber:T.ink3}/></div>
        <div style={{fontSize:10,color:T.ink3,lineHeight:1.55,marginTop:9}}>Required fields, owner, due date, evidence placeholder, comments and audit trail captured for this stage.</div>
        <div style={{marginTop:10,fontSize:10,color:T.ink2}}>Owner: {idx%3===0?"CAIO":idx%3===1?"CISO":"Business Owner"} - Due: 2026-07-{String(10+idx).padStart(2,"0")}</div>
      </div>})}
    </div>
  </Card>;

  const Guardrails=()=> <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
    {AI_CENTRAL_GUARDRAILS.map((g,idx)=><Card key={g.cat} style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{fontSize:14,color:T.ink,margin:0}}>{g.cat} Guardrails</h3><Ring score={[92,84,78,74,81,69,88][idx]} color={[T.green,T.blue,T.amber,T.amber,T.teal,T.red,T.green][idx]} size={46}/></div>
      {g.items.map((it,j)=><div key={it} style={{display:"flex",gap:8,alignItems:"center",padding:"7px 0",borderTop:j?"1px solid "+T.border:"none"}}><span style={{width:7,height:7,borderRadius:"50%",background:j<3?T.green:T.amber}}/><span style={{fontSize:11,color:T.ink2}}>{it}</span></div>)}
    </Card>)}
  </div>;

  const Evidence=()=> <Card style={{padding:0,overflow:"hidden"}}>
    <div style={{padding:"16px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><h3 style={{margin:0,fontSize:15,color:T.ink}}>Audit-ready Evidence Repository</h3><p style={{margin:"4px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>Includes Academy learning attestations when completed.</p></div><Tag label={`${evidenceItems.length} evidence items`} color={AI_GOLD} bg={AI_GOLD+"18"}/></div>
    {evidenceItems.map(e=><div key={`${e.item}-${e.time}`} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr 1fr",gap:12,padding:"14px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
      <div><div style={{fontSize:13,color:T.ink,fontWeight:700}}>{e.item}</div><div style={{fontSize:10,color:T.ink3}}>Linked initiative: {e.initiative}</div></div>
      <div style={{fontSize:11,color:T.ink2}}>Control: {e.control}<br/>Risk: {e.risk}</div>
      <div style={{fontSize:11,color:T.ink2}}>Owner: {e.owner}<br/>Upload placeholder: Ready</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><STag s={e.status}/><STag s={e.approval}/><Tag label={e.time} color={T.ink3}/></div>
    </div>)}
  </Card>;

  const CXO=()=> <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
    {AI_CENTRAL_CXOS.map(c=><Card key={c.role} style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><div style={{fontSize:20,color:T.ink,fontWeight:800}}>{c.role}</div><div style={{fontSize:10,color:T.ink3}}>{c.count} mapped initiatives</div></div><Ring score={c.score} color={c.score>80?T.green:c.score>72?T.blue:T.amber} size={50}/></div>
      <p style={{fontSize:11,color:T.ink3,lineHeight:1.6,margin:0}}>{c.focus}</p>
    </Card>)}
  </div>;

  const ValueWorkforce=()=> <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
    <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>Business value tracking</h3>{AI_CENTRAL_INITIATIVES.map(i=><div key={i.id} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink2,marginBottom:6}}><span>{i.name}</span><span>{i.valueScore}%</span></div><Bar value={i.valueScore} color={i.valueScore>80?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:5}}>Expected {i.expected} - Actual {i.actual} - Time saved and customer impact tracked</div></div>)}</Card>
    <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>Workforce readiness</h3>{AI_CENTRAL_INITIATIVES.map(i=><div key={i.id} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:9,padding:12,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink,marginBottom:8}}><span>{i.unit}</span><Tag label={"Resistance: "+i.resistance} color={i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green}/></div><Bar value={parseInt(i.training)} color={parseInt(i.training)>75?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:7}}>Required skills, training status, communication plan and change owner tracked.</div></div>)}</Card>
  </div>;

  return <div style={{animation:"up .3s ease"}}>
    <Header/>
    <SectionTabs/>
    {view==="dashboard"&&<Dashboard/>}
    {view==="registry"&&<Registry/>}
    {view==="pilot"&&<PilotWorkspace/>}
    {view==="detail"&&<Detail/>}
    {view==="lifecycle"&&<Lifecycle/>}
    {view==="guardrails"&&<Guardrails/>}
    {view==="evidence"&&<Evidence/>}
    {view==="cxo"&&<CXO/>}
    {view==="value"&&<ValueWorkforce/>}
    {view==="spine"&&<PageAISpine mode="overview" setTab={setTab}/>}
    {view==="dna"&&<PageAISpine mode="dna" setTab={setTab}/>}
    {view==="controlmatrix"&&<PageAISpine mode="controlmatrix" setTab={setTab}/>}
    {view==="scalegate"&&<PageAISpine mode="scalegate" setTab={setTab}/>}
    {view==="riskdrift"&&<PageAISpine mode="riskdrift" setTab={setTab}/>}
    {view==="evidenceconfidence"&&<PageAISpine mode="evidenceconfidence" setTab={setTab}/>}
    {view==="maturitymap"&&<PageAISpine mode="maturitymap" setTab={setTab}/>}
  </div>;
}

const LOGIN_PROFILES = [
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
  {id:"aicentral",label:"AI Central",role:"caio",target:"aicentral",mode:"aicentral",accent:AI_GOLD,title:"AI Central Standalone",subtitle:"Dedicated command center for AI initiatives, guardrails, lifecycle workflow, CXO alignment and value tracking.",email:"ai.central@veriszone.ai",kpis:[["4","Initiatives"],["3","High risk"],["79%","Guardrails"]]}
];

function BrandEntryShell({theme,onTheme,onEnter}) {
  Object.assign(T, theme==="light"?LIGHT_T:DARK_T);
  const [selected,setSelected]=useState("demo");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("govern-with-certainty");
  const [loginError,setLoginError]=useState("");
  const profile=LOGIN_PROFILES.find(p=>p.id===selected)||LOGIN_PROFILES[0];
  useEffect(()=>{
    setEmail(profile.email);
    setPassword("govern-with-certainty");
    setLoginError("");
  },[profile.email]);
  const canEnter=()=>{
    const valid=email.trim().toLowerCase()===profile.email.toLowerCase()&&password==="govern-with-certainty";
    if(!valid)setLoginError(`Use ${profile.email} and the demo password for ${profile.label}.`);
    return valid;
  };
  const enterProfile=e=>{
    e?.preventDefault?.();
    if(!canEnter())return;
    onEnter(profile);
  };
  const enterProfileLink=e=>{
    e?.preventDefault?.();
    if(!canEnter())return;
    onEnter(profile);
  };
  const demoProfile=LOGIN_PROFILES.find(p=>p.id==="demo")||LOGIN_PROFILES[0];
  const executiveProfiles=LOGIN_PROFILES.filter(p=>EXECUTIVE_ROLE_IDS.includes(p.role));
  const governanceProfiles=LOGIN_PROFILES.filter(p=>!["demo","aicentral"].includes(p.id)&&!EXECUTIVE_ROLE_IDS.includes(p.role));
  const aiCentralProfile=LOGIN_PROFILES.find(p=>p.id==="aicentral");
  const enterDemoLink=()=>onEnter(demoProfile);
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 12px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
  return <div style={{minHeight:"100vh",background:theme==="light"?`linear-gradient(135deg, #F7F8FA, #FFFFFF 54%, #F3F6FB)`:`radial-gradient(circle at 20% 10%, ${profile.accent}18, transparent 30%), linear-gradient(135deg, ${T.bg}, ${T.s1})`,color:T.ink,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,420px),1fr))",gap:0,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:theme==="light"?.45:1}}>
      <div style={{position:"absolute",width:560,height:560,borderRadius:"50%",border:`1px solid ${profile.accent}22`,left:"8%",top:"10%",animation:"vzOrbit 38s linear infinite"}}/>
      <div style={{position:"absolute",width:370,height:370,borderRadius:"50%",border:`1px solid ${T.border}`,left:"15%",top:"20%",animation:"vzOrbit 26s linear infinite reverse"}}/>
      <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:profile.accent,boxShadow:`0 0 44px ${profile.accent}`,left:"36%",top:"17%",animation:"vzDrift 6s ease-in-out infinite"}}/>
      {theme==="dark"&&<div style={{position:"absolute",width:"80%",height:180,background:`linear-gradient(90deg, transparent, ${profile.accent}18, transparent)`,left:"10%",top:"44%",filter:"blur(18px)",animation:"vzSweep 8s ease-in-out infinite"}}/>}
    </div>
    <div style={{padding:"clamp(28px,5vh,52px) clamp(24px,5vw,72px) 28px",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"100vh",position:"relative",zIndex:1}}>
      <div>
        <button type="button" onClick={enterProfile} style={{display:"inline-flex",alignItems:"center",gap:8,border:`1px solid ${T.border}`,background:T.s2,borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800,fontFamily:F.b,color:T.ink3,marginBottom:10,cursor:"pointer"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:profile.accent,boxShadow:`0 0 18px ${profile.accent}`}}/>
          {profile.label} access profile
        </button>
        <div style={{fontSize:"clamp(28px,3.3vw,38px)",fontWeight:900,fontFamily:F.h,color:T.ink,letterSpacing:"-0.01em",lineHeight:1.1,margin:"0 0 10px",maxWidth:720}}>{profile.title}</div>
        <p style={{fontSize:13,lineHeight:1.6,color:T.ink3,fontFamily:F.b,maxWidth:760,margin:"0 0 14px"}}>{profile.subtitle}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,maxWidth:760,marginBottom:16}}>
          {profile.kpis.map(([v,l,s])=><div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",boxShadow:T.shadow}}>
            <div style={{fontSize:24,fontWeight:900,fontFamily:F.h,color:T.ink,marginBottom:3}}>{v}</div>
            <div style={{fontSize:11,fontWeight:800,fontFamily:F.b,color:T.ink2,marginBottom:5}}>{l}</div>
            <div style={{fontSize:10,fontFamily:F.m,color:profile.accent}}>{s}</div>
          </div>)}
        </div>
        <div style={{maxWidth:760,margin:"0 0 12px",padding:"14px 18px",background:theme==="light"?"rgba(255,255,255,.86)":`linear-gradient(145deg, ${T.card}, ${T.s1})`,border:`1px solid ${theme==="light"?T.border:AI_GOLD+"30"}`,borderRadius:16,boxShadow:T.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap",marginBottom:13}}>
            <div style={{animation:"loginBrandRise .75s cubic-bezier(.2,.8,.2,1) both, loginBrandFloat 5.8s ease-in-out 1s infinite, loginBrandBreathe 4.2s ease-in-out 1s infinite"}}>
              <LoginAICentralBrand theme={theme} width={theme==="light"?90:102} style={{flexShrink:0}}/>
            </div>
            <div style={{minWidth:240,flex:"1 1 360px"}}>
              <div style={{fontSize:10,fontWeight:900,fontFamily:F.m,color:theme==="light"?T.blue:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:7,animation:"loginTaglineReveal .7s ease .2s both, loginTextBreathe 4.8s ease-in-out 1.1s infinite"}}>AI Central orchestration layer</div>
              <p style={{fontSize:12,lineHeight:1.55,color:T.ink3,fontFamily:F.b,margin:0,animation:"loginBrandRise .7s cubic-bezier(.2,.8,.2,1) .12s both, loginTextBreathe 5.6s ease-in-out 1.4s infinite"}}>Scattered pilots, controls, approvals, evidence, and risks converge into one governed operating stream.</p>
            </div>
          </div>
          <div style={{height:1,background:`linear-gradient(90deg, ${AI_GOLD}50, ${T.border}, transparent)`,marginBottom:13}}/>
          <div style={{fontSize:11,fontWeight:900,fontFamily:F.b,color:theme==="light"?T.blue:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:8}}>Enterprise AI Transformation Control Plane</div>
          <h1 style={{fontSize:"clamp(30px,3.9vw,48px)",lineHeight:1.04,letterSpacing:0,fontWeight:400,fontFamily:F.e,margin:"0 0 10px",maxWidth:760}}>Pilot AI safely. Scale only when evidence says yes.</h1>
          <p style={{fontSize:14,lineHeight:1.7,color:T.ink2,fontFamily:F.b,maxWidth:720,margin:0}}>VerisZone lets CXOs plan AI department by department, then hands execution to AI Central where AI Spine monitors risk drift, value, adoption, controls, evidence, and scale readiness.</p>
        </div>
        <div style={{maxWidth:760,margin:"0 0 12px"}}>
          <div style={{fontSize:10,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.14em",margin:"0 0 8px"}}>Platform capabilities</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
            {[
              ["CXO Platform","Strategy, budget, ownership and scale intent"],
              ["AI Central","Pilot execution, guardrails and assurance"],
              ["AI Spine","Risk drift, evidence confidence and scale gates"]
            ].map(([title,body],idx)=><div key={title} style={{background:theme==="light"?"rgba(255,255,255,.78)":T.card,border:`1px solid ${idx===0?AI_GOLD+"45":T.border}`,borderRadius:12,padding:"11px 13px",boxShadow:T.shadow}}>
              <div style={{fontSize:12,fontWeight:900,fontFamily:F.b,color:idx===0?AI_GOLD:T.ink,marginBottom:5}}>{title}</div>
              <div style={{fontSize:11,lineHeight:1.55,fontFamily:F.b,color:T.ink3}}>{body}</div>
            </div>)}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:11,color:T.ink4,fontFamily:F.b}}>
        <span>EU AI Act</span><span>ISO 42001</span><span>GDPR</span><span>NIST AI RMF</span><span>Evidence-ready audit trail</span>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"32px clamp(20px,4vw,60px)",borderLeft:`1px solid ${T.border}`,background:theme==="light"?"#FFFFFF":`linear-gradient(180deg, ${T.s1}F2, ${T.bg}F8)`,position:"relative",zIndex:1}}>
      <form onSubmit={enterProfile} style={{width:"100%",maxWidth:420,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"22px 24px",boxShadow:T.shadow,pointerEvents:"auto"}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",minHeight:theme==="light"?96:104,marginBottom:16}}>
          <div style={{animation:"loginBrandRise .8s cubic-bezier(.2,.8,.2,1) both, loginBrandFloat 6.4s ease-in-out 1.1s infinite, loginBrandBreathe 4.6s ease-in-out 1s infinite"}}>
            <BrandLogo theme={theme} width={200} style={{width:"min(200px,62vw)",margin:"0 auto",animation:"loginMarkGlow 5.2s ease-in-out 1.2s infinite"}}/>
          </div>
          <button type="button" onClick={onTheme} style={{position:"absolute",top:0,right:0,background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"7px 11px",color:T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{theme==="dark"?"Light":"Dark"}</button>
        </div>
        <div style={{fontSize:24,fontWeight:400,fontFamily:F.e,marginBottom:6}}>Secure control-plane sign in</div>
        <div style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.6,marginBottom:13}}>Use Demo Center for seeded sales storytelling. Subscribed CXO and AI Central workspaces open clean, ready for customer-owned data.</div>
        <div style={{display:"grid",gap:9,marginBottom:13}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{fontSize:10,fontWeight:900,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",color:T.ink4}}>Workspace</span>
            <select aria-label="Workspace" value={selected} onChange={e=>setSelected(e.target.value)} style={{...fieldStyle,appearance:"auto",cursor:"pointer"}}>
              <optgroup label="Sales showcase">
                <option value={demoProfile.id}>{demoProfile.label} - Full platform demo</option>
              </optgroup>
              <optgroup label="Executive workspaces">
                {executiveProfiles.map(p=><option key={p.id} value={p.id}>{p.label} - {ROLES[p.role]?.title||p.title}</option>)}
              </optgroup>
              <optgroup label="Governance workspaces">
                {governanceProfiles.map(p=><option key={p.id} value={p.id}>{p.label} - {ROLES[p.role]?.title||p.title}</option>)}
              </optgroup>
              {aiCentralProfile&&<optgroup label="Execution and assurance">
                <option value={aiCentralProfile.id}>{aiCentralProfile.label} - Standalone command center</option>
              </optgroup>}
            </select>
          </label>
          <input aria-label="Email" value={email} onChange={e=>{setEmail(e.target.value);setLoginError("");}} style={fieldStyle}/>
          <input aria-label="Password" type="password" value={password} onChange={e=>{setPassword(e.target.value);setLoginError("");}} style={fieldStyle}/>
        </div>
        {loginError&&<div style={{fontSize:11,lineHeight:1.5,color:T.red,fontFamily:F.b,margin:"-6px 0 12px"}}>{loginError}</div>}
        <a href={`#workspace-${profile.id}`} onClick={enterProfileLink} style={{display:"block",textDecoration:"none",textAlign:"center",width:"100%",background:theme==="light"?T.blue:`linear-gradient(135deg,${profile.accent},${AI_GOLD})`,color:"#fff",border:"none",borderRadius:9,padding:"12px 14px",fontSize:13,fontWeight:900,fontFamily:F.b,boxShadow:theme==="light"?"0 10px 24px rgba(11,78,162,.18)":`0 18px 44px ${profile.accent}25`,marginBottom:10,cursor:"pointer"}}>Enter {profile.label} Workspace</a>
        {selected!=="demo"&&<a href="#workspace-demo" onClick={enterDemoLink} style={{display:"block",textDecoration:"none",textAlign:"center",width:"100%",background:T.s2,color:theme==="light"?T.blue:AI_GOLD,border:`1px solid ${theme==="light"?T.blue+"45":AI_GOLD+"55"}`,borderRadius:9,padding:"11px 14px",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Demo Center</a>}
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"grid",gap:7,fontSize:11,color:T.ink3,fontFamily:F.b}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>SSO</span><strong style={{color:T.green}}>Ready</strong></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Evidence retention</span><strong style={{color:T.ink}}>7 years</strong></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Region</span><strong style={{color:T.ink}}>EU / US</strong></div>
        </div>
      </form>
    </div>
  </div>;
}


function ProfileInput({label,value,type="text",onChange}) {
  return <label style={{display:"grid",gap:6,fontFamily:F.b}}>
    <span style={{fontSize:10,fontWeight:900,color:T.ink3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",color:T.ink,fontFamily:F.b,fontSize:12,outline:"none"}} />
  </label>;
}

function PageProfile({role,sessionMode,profiles,setProfiles,showToast,onSignOut}) {
  const [selected,setSelected]=useState(sessionMode==="demo"?"demo":role);
  useEffect(()=>setSelected(sessionMode==="demo"?"demo":role),[role,sessionMode]);
  const profile=profiles[selected]||USER_PROFILES[selected];
  const profileOptions=[{id:"demo",label:"Demo Center",name:"Demo Center",title:"Sales Demo Workspace"},...Object.values(ROLES)];
  const selectedRole=profileOptions.find(item=>item.id===selected)||ROLES.caio;
  const update=(field,value)=>setProfiles(prev=>({...prev,[selected]:{...(prev[selected]||USER_PROFILES[selected]),[field]:value}}));
  const saveProfiles=()=>{
    if(typeof window!=="undefined")window.localStorage.setItem("veriszone.userProfiles",JSON.stringify(profiles));
    showToast(`${selectedRole.label} profile saved`);
  };
  const fields=[
    ["name","User name"],["email","Email address"],["password","Password","password"],["title","Title"],["department","Department"],["organization","Organization"],["phone","Phone"],["region","Region"],["timezone","Timezone"],["manager","Manager / committee"],["ssoStatus","SSO status"],["evidenceRetention","Evidence retention"],["lastLogin","Last login"]
  ];
  const initials=(profile.name||selectedRole.name).split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="User Profiles" sub="Manage demo identities, credentials, organisation metadata and workspace access for every VerisZone user."/>
    <Card style={{padding:16,marginBottom:14,background:T.s2}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
        {profileOptions.map(r=>{const active=selected===r.id;return <button key={r.id} type="button" onClick={()=>setSelected(r.id)} style={{background:active?RC(r.id)+"18":T.s3,border:`1px solid ${active?RC(r.id)+"55":T.border}`,borderRadius:10,padding:"10px 12px",color:active?RC(r.id):T.ink2,fontFamily:F.b,fontWeight:900,textAlign:"left",cursor:"pointer"}}>{r.label}<div style={{fontSize:10,fontWeight:600,color:T.ink3,marginTop:3}}>{profiles[r.id]?.name||r.name}</div></button>})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"minmax(220px,.8fr) minmax(0,2fr)",gap:14}}>
      <Card style={{padding:18,alignSelf:"start"}}>
        <div style={{width:62,height:62,borderRadius:"50%",background:`linear-gradient(135deg,${RC(selected)},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 18px 44px ${RC(selected)}30`,marginBottom:14}}><span style={{color:"#fff",fontSize:18,fontWeight:900,fontFamily:F.b}}>{initials}</span></div>
        <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:900,color:T.ink,marginBottom:4}}>{cleanText(profile.name)}</h3>
        <p style={{fontFamily:F.b,fontSize:12,color:T.ink3,marginBottom:14}}>{cleanText(profile.email)}</p>
        <div style={{display:"grid",gap:8,fontFamily:F.b,fontSize:12,color:T.ink2}}>
          <div><strong style={{color:T.ink}}>Workspace:</strong> {selectedRole.label}</div>
          <div><strong style={{color:T.ink}}>Role:</strong> {cleanText(profile.title)}</div>
          <div><strong style={{color:T.ink}}>SSO:</strong> {cleanText(profile.ssoStatus)}</div>
          <div><strong style={{color:T.ink}}>Retention:</strong> {cleanText(profile.evidenceRetention)}</div>
        </div>
        <button type="button" onClick={onSignOut} style={{marginTop:16,width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.ink2,fontFamily:F.b,fontWeight:900,cursor:"pointer",textAlign:"left"}}>Sign out</button>
      </Card>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:16}}>
          <div><h3 style={{fontFamily:F.h,fontSize:18,fontWeight:900,color:T.ink}}>Editable identity record</h3><p style={{fontFamily:F.b,fontSize:11,color:T.ink3}}>Every field below is wired as an input for this MVP.</p></div>
          <button type="button" onClick={saveProfiles} style={{background:RC(selected),border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontFamily:F.b,fontWeight:900,cursor:"pointer"}}>Save profile</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
          {fields.map(([key,label,type])=><ProfileInput key={key} label={label} type={type||"text"} value={profile[key]} onChange={value=>update(key,value)}/>) }
        </div>
      </Card>
    </div>
  </div>;
}

const SEEDED_DEMO_TABS = new Set(["home","onboard","strategy","compliance","hitl","aia","aira","airt","registry","maturity","usecases","aiia","impl","roadmap","scope","controls","trustcenter","iso27001","aigov","gapanalysis","servicenow","reports","aicentral"]);

function FreshWorkspaceEmpty({role,tab,aiCentralView,setTab}) {
  const rc=RC(role), R=ROLES[role]||ROLES.caio;
  const allNav=[...NAV,...CAIO_EXTRA_NAV,{id:"profile",label:"Profile"},{id:"settings",label:"Settings"}];
  const navItem=allNav.find(item=>item.id===tab);
  const aiItem=AI_CENTRAL_NAV.find(item=>item.id===aiCentralView);
  const isAI=tab==="aicentral";
  const accent=isAI?AI_GOLD:rc;
  const title=isAI?`AI Central - ${aiItem?.label||"Workspace"}`:(navItem?.label||"Workspace");
  const sub=isAI
    ?"This AI Central tenant is brand new. No initiatives, guardrails, evidence, risks, approvals, or scale-gate signals have been loaded yet."
    :`This ${R.label} module is brand new. No customer records, pilot data, approvals, risk items, evidence, or reports have been loaded yet.`;
  const setupCards=isAI?[
    ["Create initiative registry","Add the first AI initiative, owner, department pilot and lifecycle stage."],
    ["Activate guardrails","Select control packs, compliance checks and HITL gates for the first pilot."],
    ["Collect evidence","Upload approvals, control evidence, audit notes and scale-readiness proof."]
  ]:[
    ["Start AI opportunity intake","Capture the first AI idea, business sponsor, pilot department and value hypothesis."],
    ["Assign CXO ownership","Define accountable executives, budget assumptions, risk appetite and approvals."],
    ["Prepare handoff package","Package the downstream execution workspace requirements once the pilot plan is approved."]
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={title} sub={sub}/>
    <Card style={{padding:24,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${accent}38`,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{maxWidth:720}}>
          <Tag label="NEW CUSTOMER WORKSPACE" color={accent} bg={accent+"18"}/>
          <h2 style={{fontFamily:F.h,fontSize:26,fontWeight:900,color:T.ink,margin:"12px 0 8px"}}>{isAI?"No AI Central data yet":"No workspace data yet"}</h2>
          <p style={{fontSize:13,lineHeight:1.7,color:T.ink3,fontFamily:F.b,margin:0}}>Demo Center contains the seeded showcase data. This subscribed workspace is intentionally empty so each customer module starts clean, auditable, and ready for their own records.</p>
        </div>
        <button type="button" onClick={()=>setTab("intake")} style={{background:accent,border:"none",borderRadius:10,padding:"11px 14px",color:"#fff",fontFamily:F.b,fontSize:12,fontWeight:900,cursor:"pointer",boxShadow:`0 16px 34px ${accent}24`}}>Start first intake</button>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:14}}>
      {setupCards.map(([heading,body],idx)=><Card key={heading} style={{padding:16,border:`1px solid ${idx===0?accent+"42":T.border}`}}>
        <div style={{width:28,height:28,borderRadius:8,background:accent+"16",border:`1px solid ${accent}35`,display:"flex",alignItems:"center",justifyContent:"center",color:accent,fontFamily:F.m,fontSize:11,fontWeight:900,marginBottom:12}}>{idx+1}</div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 6px"}}>{heading}</h3>
        <p style={{fontFamily:F.b,fontSize:11,lineHeight:1.6,color:T.ink3,margin:0}}>{body}</p>
      </Card>)}
    </div>
    <Card style={{padding:16}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 8px"}}>Tenant data policy</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
        {["No seeded records","No inherited demo risks","No mock approvals","No sample evidence"].map(item=><div key={item} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:11,fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:800}}>{item}</div>)}
      </div>
    </Card>
  </div>;
}

export default function VerisZone() {
  const [role,setRole]=useState("caio");
  const [tab,setTab]=useState("home");
  const [toast,setToast]=useState({msg:"",vis:false,type:"success"});
  const [hitlCount,setHitlCount]=useState(()=>HITL["caio"].length);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  const [theme,setTheme]=useState("dark");
  const [aiCentralView,setAiCentralView]=useState("dashboard");
  const [hasEntered,setHasEntered]=useState(false);
  const [sessionMode,setSessionMode]=useState("demo");
  const [userProfiles,setUserProfiles]=useState(()=>{
    if(typeof window==="undefined")return USER_PROFILES;
    try{
      return {...USER_PROFILES,...JSON.parse(window.localStorage.getItem("veriszone.userProfiles")||"{}")};
    }catch{
      return USER_PROFILES;
    }
  });
  Object.assign(T, theme==="light"?LIGHT_T:DARK_T);

  useEffect(()=>{
    if(document.getElementById("gp-css"))return;
    const s=document.createElement("style");s.id="gp-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    document.body.style.background=T.bg;
    document.body.style.color=T.ink;
    document.documentElement.classList.toggle("dark",theme==="dark");
    document.documentElement.dataset.theme=theme;
  },[theme]);

  useEffect(()=>{
    if(!hasEntered||typeof window==="undefined")return;
    const workspace=sessionMode==="demo"?"demo":role;
    const nextPath=tab==="aicentral"?`/workspace/aicentral/${aiCentralView}`:tab==="profile"?"/profile":`/workspace/${workspace}/${tab}`;
    if(window.location.pathname!==nextPath)window.history.replaceState(null,"",nextPath);
  },[hasEntered,tab,aiCentralView,role,sessionMode]);

  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handler);return()=>window.removeEventListener("resize",handler);
  },[]);

  const showToast=useCallback((msg,type="success")=>{
    setToast({msg,type,vis:true});
    setTimeout(()=>setToast(t=>({...t,vis:false})),3000);
  },[]);

  const switchRole=r=>{setRole(r);setTab("home");setHitlCount((HITL[r]||[]).length);};
  const signOut=useCallback(()=>{
    setHasEntered(false);
    setTab("home");
    setAiCentralView("dashboard");
    setSessionMode("demo");
    if(typeof window!=="undefined")window.history.replaceState(null,"","/");
  },[]);
  const enterApp=useCallback((profile=LOGIN_PROFILES[0])=>{
    setRole(profile.role);
    setTab(profile.target);
    setHitlCount(profile.mode==="demo"?(HITL[profile.role]||[]).length:0);
    setSessionMode(profile.mode||"role");
    setHasEntered(true);
  },[]);
  useEffect(()=>{
    const enterFromRoute=()=>{
      const path=window.location.pathname;
      const parts=path.split("/").filter(Boolean);
      if(path==="/profile"){
        setHasEntered(true);
        setTab("profile");
        return true;
      }
      if(parts[0]==="workspace"&&parts[1]==="aicentral"){
        const view=parts[2]||"dashboard";
        setRole("caio");
        setTab("aicentral");
        if(AI_CENTRAL_NAV.some(item=>item.id===view))setAiCentralView(view);
        setSessionMode("aicentral");
        setHasEntered(true);
        return true;
      }
      if(parts[0]==="workspace"&&parts[1]){
        const profileId=parts[1];
        const tabId=parts[2]||"home";
        const profile=LOGIN_PROFILES.find(p=>p.id===profileId);
        if(profile){
          enterApp(profile);
          setTab(tabId);
          return true;
        }
      }
      return false;
    };
    const enterFromHash=()=>{
      if(enterFromRoute())return;
      if(window.location.hash==="#profile"){
        setHasEntered(true);
        setTab("profile");
        return;
      }
      if(window.location.hash.startsWith("#workspace-aicentral")){
        const view=window.location.hash.replace("#workspace-aicentral-","");
        setRole("caio");
        setTab("aicentral");
        if(AI_CENTRAL_NAV.some(item=>item.id===view))setAiCentralView(view);
        setSessionMode("aicentral");
        setHasEntered(true);
        return;
      }
      const id=window.location.hash.replace("#workspace-","");
      if(!id)return;
      const [profileId,tabId]=id.split("-");
      const profile=LOGIN_PROFILES.find(p=>p.id===profileId);
      if(profile)enterApp(profile);
      if(profile&&tabId)setTab(tabId);
    };
    enterFromHash();
    window.addEventListener("hashchange",enterFromHash);
    window.addEventListener("popstate",enterFromHash);
    return()=>{
      window.removeEventListener("hashchange",enterFromHash);
      window.removeEventListener("popstate",enterFromHash);
    };
  },[enterApp]);
  const R=ROLES[role],rc=RC(role);
  const showSeededData=sessionMode==="demo"||!SEEDED_DEMO_TABS.has(tab);

  if(!hasEntered)return <BrandEntryShell theme={theme} onTheme={()=>setTheme(theme==="dark"?"light":"dark")} onEnter={enterApp}/>;

  return <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
    {toast.vis&&<Toast msg={toast.msg} type={toast.type}/>}
    <Sidebar tab={tab} setTab={setTab} role={role} hitlCount={hitlCount} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} aiCentralView={aiCentralView} setAiCentralView={setAiCentralView} theme={theme} sessionMode={sessionMode} profiles={userProfiles}/>

    {/* Main */}
    <div style={{marginLeft:isMobile?0:SIDEBAR_W,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Top bar */}
      <div style={{background:theme==="light"?T.s2:T.s1,borderBottom:`1px solid ${T.border}`,height:56,display:"flex",alignItems:"center",padding:"0 16px",position:"sticky",top:0,zIndex:100,gap:12,boxShadow:theme==="light"?"0 1px 0 rgba(148,163,184,.22), 0 10px 24px rgba(17,24,39,.035)":"none"}}>
        {isMobile&&<button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",color:T.ink3,fontSize:11,fontWeight:800,padding:"4px 6px",flexShrink:0}}>Menu</button>}
        {isMobile&&<div style={{display:"flex",alignItems:"center",gap:7,flex:"0 0 auto"}}>
          <BrandLogo theme={theme} width={120}/>
        </div>}
        {!isMobile&&sessionMode!=="aicentral"&&<div style={{display:"flex",gap:3,background:theme==="light"?T.s2:T.bg,borderRadius:12,padding:4,border:`1px solid ${T.border}`,boxShadow:theme==="light"?"0 1px 2px rgba(15,23,42,.04)":"none",maxWidth:`calc(100vw - ${SIDEBAR_W+196}px)`,overflowX:"auto",overflowY:"hidden"}}>
          {sessionMode==="demo"&&Object.values(ROLES).map(r2=>{const active=tab!=="aicentral"&&role===r2.id;return <button key={r2.id} onClick={()=>switchRole(r2.id)} style={{background:active?RC(r2.id)+"18":"transparent",border:active?`1px solid ${RC(r2.id)}45`:"1px solid transparent",borderRadius:8,padding:"5px 14px",color:active?RC(r2.id):T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>})}
          {sessionMode!=="demo"&&<button type="button" onClick={()=>setTab("home")} title={`Return to ${R.label} workspace`} style={{background:tab!=="aicentral"?rc+"18":T.s2,border:`1px solid ${tab!=="aicentral"?rc+"45":T.border}`,borderRadius:8,padding:"5px 14px",color:tab!=="aicentral"?rc:T.ink2,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{R.label} Workspace</button>}
        </div>}
        {isMobile&&sessionMode!=="aicentral"&&<div style={{display:"flex",gap:3,background:theme==="light"?T.s3:T.bg,borderRadius:7,padding:3,border:`1px solid ${T.border}`,flex:1,overflowX:"auto"}}>
          {sessionMode==="demo"
            ?Object.values(ROLES).map(r2=>{const active=tab!=="aicentral"&&role===r2.id;return <button key={r2.id} onClick={()=>switchRole(r2.id)} style={{flex:1,background:active?RC(r2.id)+"20":"transparent",border:active?`1px solid ${RC(r2.id)}40`:"1px solid transparent",borderRadius:5,padding:"3px 6px",color:active?RC(r2.id):T.ink4,fontSize:9,fontWeight:700,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>})
            :<button type="button" onClick={()=>setTab("home")} style={{flex:1,background:tab!=="aicentral"?rc+"20":"transparent",border:`1px solid ${tab!=="aicentral"?rc+"40":T.border}`,borderRadius:5,padding:"3px 6px",color:tab!=="aicentral"?rc:T.ink3,fontSize:9,fontWeight:800,fontFamily:F.b}}>{R.label}</button>}
        </div>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} title="Toggle dark and light mode" style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:isMobile?"4px 10px":"6px 13px",color:T.ink2,fontSize:isMobile?10:11,fontWeight:800,fontFamily:F.b,boxShadow:theme==="light"?"0 1px 2px rgba(15,23,42,.05)":"none"}}>{theme==="dark"?"Light":"Dark"}</button>
          {hitlCount>0&&<button onClick={()=>setTab("hitl")} style={{display:"flex",alignItems:"center",gap:6,background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:20,padding:"4px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:10,fontWeight:700,color:T.amber,fontFamily:F.b}}>{hitlCount}</span>
          </button>}
        </div>
      </div>

      {/* Page content */}
      <div style={{flex:1,padding:"20px 16px 60px",maxWidth:1140,width:"100%",margin:"0 auto"}}>
        {!showSeededData&&<FreshWorkspaceEmpty role={role} tab={tab} aiCentralView={aiCentralView} setTab={setTab}/>}
        {showSeededData&&tab==="home"       &&<PageHome       role={role} setTab={setTab}/>}
        {showSeededData&&tab==="onboard"    &&<PageOnboard    role={role} showToast={showToast}/>}
        {showSeededData&&tab==="intake"     &&<PageOpportunityIntake role={role} setTab={setTab} showToast={showToast}/>}
        {showSeededData&&tab==="strategy"   &&<PageStrategy   role={role} setTab={setTab}/>}
        {showSeededData&&tab==="playbook"   &&<PagePlaybook   role={role}/>}
        {tab==="academy"   &&<PageGovernanceAcademy role={role} sessionMode={sessionMode} showToast={showToast} setTab={setTab}/>}
        {showSeededData&&tab==="compliance" &&<PageCompliance role={role}/>}
        {showSeededData&&tab==="checklists" &&<PageChecklists role={role} showToast={showToast}/>}
        {showSeededData&&tab==="aicentral"  &&<PageAICentral role={role} setTab={setTab} showToast={showToast} view={aiCentralView} setView={setAiCentralView} theme={theme} sessionMode={sessionMode}/>}
        {showSeededData&&tab==="hitl"       &&<PageHITL       role={role} showToast={showToast} onCountChange={setHitlCount}/>}
        {showSeededData&&tab==="aia"        &&<PageAIA        role={role}/>}
        {showSeededData&&tab==="aira"       &&<PageAIRA/>}
        {showSeededData&&tab==="airt"       &&<PageAIRT/>}
        {showSeededData&&tab==="registry"   &&<PageModelRegistry setTab={setTab}/>}
        {showSeededData&&tab==="maturity"   &&<PageMaturityRadar/>}
        {showSeededData&&tab==="usecases"   &&<PageUseCases/>}
        {showSeededData&&tab==="aiia"       &&<PageAIIA       role={role} setTab={setTab}/>}
        {showSeededData&&tab==="impl"       &&<PageImpl       role={role}/>}
        {showSeededData&&tab==="roadmap"    &&<PageRoadmap    role={role}/>}
        {showSeededData&&tab==="templates"  &&<PageTemplates  role={role} showToast={showToast}/>}
        {showSeededData&&tab==="scope"       &&<PageScope          role={role}/>}
        {showSeededData&&tab==="controls"    &&<PageCommonControls  role={role}/>}
        {showSeededData&&tab==="trustcenter" &&<PageTrustCenter     role={role} showToast={showToast}/>}
        {showSeededData&&tab==="iso27001"    &&<PageISO27001    role={role} showToast={showToast}/>}
        {showSeededData&&tab==="aigov"      &&<PageAIGovCube   role={role} setTab={setTab}/>}
        {showSeededData&&tab==="gapanalysis" &&<PageGapAnalysis  role={role} showToast={showToast}/>}
        {showSeededData&&tab==="servicenow"  &&<PageIntegrations role={role} showToast={showToast}/>}
        {(tab==="profile"||tab==="settings") &&<PageProfile role={role} sessionMode={sessionMode} profiles={userProfiles} setProfiles={setUserProfiles} showToast={showToast} onSignOut={signOut}/>}
        {showSeededData&&tab==="reports"    &&<PageReports   role={role} sessionMode={sessionMode}/>}
      </div>
    </div>
  </div>;
}
