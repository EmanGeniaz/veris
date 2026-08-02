"use client";

import { useState } from "react";
import { riskRegister } from "@/lib/platform-models";
import { pushBus } from "@/lib/bus";
import { T, F, AI_GOLD, ROLES, Card } from "./core";
import { frameworkScore } from "@/lib/portfolio";

/* ── CAIO Command Center ────────────────────────────────────────────
   The AI Governance Office lens: governance score, compliance posture,
   AI incidents, per-project impact assessments and risk treatment, and
   a governance library. Renders one of eight surfaces driven by the
   CAIO sidebar. Numbers reconcile with the platform's seeded programs
   (acInitiatives / riskRegister) and extend them with governance
   dimensions — score inputs, per-model policy adherence, CRM incident
   sync, per-project AIA and AI Risk Treatment Plans. */

const PH=["Opportunity","Business Case","Discovery","Architecture","Governance","Development","Testing","Pilot","Deployment","Monitoring","Optimization","Scale","Retire"];
const stageColor=s=>({Scaling:T.green,"In Production":AI_GOLD,"In Progress":T.blue,Completed:T.ink3,Retired:T.red}[s]||T.ink3);
const riskColor=r=>({Critical:T.red,High:T.amber,Medium:T.blue,Low:T.ink3}[r]||T.ink3);

/* Enterprise AI project estate — reconciles with the platform programs. */
export const CAIO_PROJECTS=[
  {name:"Credit Decision Assurance", unit:"Retail Banking", stage:"In Progress", phase:7, risk:"Critical"},
  {name:"Fraud Detection Model", unit:"Retail Banking", stage:"In Production", phase:10, risk:"High"},
  {name:"Finance Close Automation", unit:"Finance", stage:"Scaling", phase:12, risk:"Low"},
  {name:"Doc Summarisation AI", unit:"Customer Ops", stage:"Scaling", phase:12, risk:"Low"},
  {name:"Payments Anomaly Guard", unit:"Retail Banking", stage:"In Production", phase:9, risk:"Medium"},
  {name:"Customer Resolution Copilot", unit:"Customer Ops", stage:"In Production", phase:8, risk:"High"},
  {name:"Predictive Maintenance", unit:"Retail Banking", stage:"In Production", phase:10, risk:"Medium"},
  {name:"Workforce Skills Navigator", unit:"People", stage:"In Progress", phase:3, risk:"High"},
  {name:"Supplier Risk Screener", unit:"Customer Ops", stage:"In Progress", phase:4, risk:"Medium"},
  {name:"Contract Review Assist", unit:"Customer Ops", stage:"Completed", phase:12, risk:"Low"},
  {name:"HR Query Bot", unit:"People", stage:"Completed", phase:12, risk:"Low"},
  {name:"RecoEngine v2", unit:"Retail Banking", stage:"Retired", phase:13, risk:"Low"},
];

const GOV_INPUTS=[
  {k:"Transparency & explainability", v:76, w:"18%", src:"Model cards, reason codes"},
  {k:"Accountability & ownership", v:82, w:"16%", src:"Named owner, RACI, sign-offs"},
  {k:"Fairness & bias control", v:68, w:"18%", src:"Bias tests, subgroup metrics"},
  {k:"Human oversight", v:74, w:"16%", src:"HITL gates, override logs"},
  {k:"Security & robustness", v:79, w:"16%", src:"Red-team, guardrail coverage"},
  {k:"Data governance & privacy", v:70, w:"16%", src:"DPIA, lineage, retention"},
];
const GOV_SCORE=72;
/* Framework scores read the canonical posture (lib/portfolio.js) so CAIO,
   CEO and AI Central never disagree. */
const _cc=v=>v>=85?T.green:v>=75?T.blue:AI_GOLD;
const COMPLIANCE=[
  {k:"ISO 42001 (AIMS)", v:frameworkScore("iso42001"), c:_cc(frameworkScore("iso42001"))},{k:"ISO 27001 (ISMS)", v:frameworkScore("iso27001"), c:_cc(frameworkScore("iso27001"))},
  {k:"EU AI Act", v:frameworkScore("euai"), c:_cc(frameworkScore("euai"))},{k:"NIST AI RMF", v:frameworkScore("nist"), c:_cc(frameworkScore("nist"))},{k:"GDPR / privacy", v:frameworkScore("gdpr"), c:_cc(frameworkScore("gdpr"))},
];
const CAIO_ATTENTION=[
  {t:"Human-oversight sign-off — Credit Decision Assurance", d:"EU AI Act Art.14 record ready. Your approval gates the scale review. High-risk system.", go:"Review & approve", c:T.red},
  {t:"Model card — Fraud Detection v3", d:"Retrain approved; new model card awaiting governance sign-off before promotion.", go:"Open model card", c:T.amber},
  {t:"Policy exception — Customer Ops", d:"Temporary exception to data-retention policy requested for pilot. 30-day window.", go:"Decide", c:T.blue},
];
const CAIO_INCIDENTS=[
  {id:"INC-1042", sum:"Prompt-injection attempt blocked at gateway", proj:"Customer Resolution Copilot", pri:"P1 · Critical", pc:T.red, src:"ServiceNow", status:"Investigating", sc:T.blue},
  {id:"INC-1039", sum:"Model drift threshold breached — fraud signals", proj:"Fraud Detection Model", pri:"P2 · High", pc:T.amber, src:"Datadog → SNOW", status:"Mitigating", sc:T.amber},
  {id:"INC-1035", sum:"PII near-miss in prompt logs", proj:"Customer Resolution Copilot", pri:"P3 · Medium", pc:T.blue, src:"ServiceNow", status:"Triage", sc:T.ink3},
];
const CAIO_RISKS=[
  {r:"Adverse-decision harm", p:"Credit Decision", g:"Critical · 12", gc:T.red, o:"O. Khan", t:"Mitigate", s:"In progress", sc:T.amber},
  {r:"Prompt-injection exposure", p:"Resolution Copilot", g:"High · 9", gc:T.amber, o:"CISO office", t:"Mitigate", s:"On track", sc:T.green},
  {r:"Model drift on fraud signals", p:"Fraud Detection", g:"High · 8", gc:T.amber, o:"D. Osei", t:"Mitigate", s:"On track", sc:T.green},
  {r:"Bias in eligibility scoring", p:"Skills Navigator", g:"High · 7", gc:T.amber, o:"Data Science", t:"Transfer", s:"Planned", sc:T.ink3},
];
const CAIO_POLICIES=[
  {m:"Credit Decision v2", n:"6 applied", a:91, c:T.green},{m:"Fraud Detection v3", n:"5 applied", a:88, c:T.green},
  {m:"Resolution Copilot", n:"5 applied", a:79, c:T.amber},{m:"Skills Navigator", n:"4 applied", a:72, c:T.amber},
];
const CAIO_STANDARDS=[
  {f:"ISO/IEC 42001", ty:"AI management system", sc:"Enterprise-wide", st:"Certified body · 81%", c:T.green},
  {f:"ISO/IEC 27001", ty:"Information security", sc:"Enterprise-wide", st:"Certified · 90%", c:T.green},
  {f:"EU AI Act", ty:"Regulation", sc:"High-risk systems", st:"Conformity in progress", c:T.blue},
  {f:"NIST AI RMF", ty:"Framework", sc:"All AI systems", st:"Aligned · 77%", c:T.violet},
  {f:"GDPR", ty:"Regulation", sc:"Personal data", st:"Compliant · 92%", c:T.green},
];
const LIBRARY=[
  {t:"ISO / IEC standards", d:"42001 · 27001 · 23894 · 42005 · 38507", n:"18 documents", c:T.teal},
  {t:"Checklists & controls", d:"ISO 42001 checklist · AIMS controls · common control library", n:"31 items", c:T.blue},
  {t:"EU AI Act", d:"Annex III · Art.9–15 · conformity · GPAI codes", n:"12 documents", c:T.violet},
  {t:"NIST AI RMF", d:"Govern · Map · Measure · Manage + playbooks", n:"9 documents", c:T.green},
  {t:"Country-specific AI rules", d:"US EO · UK · Singapore Model AI · UAE · Canada AIDA", n:"15 jurisdictions", c:T.amber},
  {t:"Templates & policies", d:"Policy pack · AIA template · model card · DPIA · runbook", n:"24 templates", c:T.ink3},
];
const REPORT_DIMS=["Governance score","Compliance posture","By project","Risk register","AI incidents","Policy adherence","Impact assessments","ISO 42001 audit"];

/* ── shared render helpers ─────────────────────────────────────────── */
const cardPad={padding:"16px 18px"};
const Eyebrow=({children,style})=><div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,marginBottom:10,...style}}>{children}</div>;
const H3=({children,style})=><div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,margin:0,...style}}>{children}</div>;
const Pill=({children,c=T.ink3,big})=><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:big?11:9.5,fontWeight:800,fontFamily:F.m,padding:big?"5px 12px":"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:c+"1f",color:c}}>{children}</span>;
function Kpi({l,v,vc,s,onClick}){
  return <button onClick={onClick} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:onClick?"pointer":"default",textAlign:"left"}}>
    <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div>
    <div style={{fontSize:23,fontWeight:800,marginTop:7,letterSpacing:"-0.02em",fontFamily:F.m,color:vc||T.ink}}>{v}</div>
    <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{s}</div>
  </button>;
}
function ScoreRow({label,v,c}){
  return <div style={{display:"grid",gridTemplateColumns:"150px 1fr 34px",alignItems:"center",gap:12,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
    <span style={{fontSize:11,fontWeight:700,color:T.ink2,fontFamily:F.b}}>{label}</span>
    <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${v}%`,background:c}}/></div>
    <span style={{fontSize:11,fontWeight:800,textAlign:"right",color:c,fontFamily:F.m}}>{v}</span>
  </div>;
}
const Table=({head,children})=><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
  {head&&head.length>0&&<thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>}
  <tbody>{children}</tbody>
</table></div>;
const Td=({children,style})=><td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,verticalAlign:"middle",...style}}>{children}</td>;
function Ring({score}){
  return <div style={{width:104,height:104,borderRadius:"50%",background:`conic-gradient(${T.green} ${score}%, ${T.border} 0)`,display:"grid",placeItems:"center",flex:"none"}}>
    <div style={{width:80,height:80,borderRadius:"50%",background:T.s1,display:"grid",placeItems:"center",textAlign:"center"}}>
      <div><div style={{fontSize:24,fontWeight:800,color:T.ink,lineHeight:1,fontFamily:F.m}}>{score}</div><div style={{fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4,fontWeight:800,marginTop:2}}>Composite</div></div>
    </div>
  </div>;
}
function PageHead({title,sub}){
  return <div style={{marginBottom:16}}>
    <div style={{fontFamily:F.e,fontWeight:400,fontSize:26,lineHeight:1.1,color:T.ink,margin:"0 0 4px"}}>{title}</div>
    <div style={{color:T.ink3,fontSize:12,fontFamily:F.b}}>{sub}</div>
  </div>;
}

/* ── adaptive project picker ───────────────────────────────────────── */
function ProjectPicker({projects,current,onSelect,onNew}){
  const [q,setQ]=useState(""); const [stage,setStage]=useState(""); const [open,setOpen]=useState(false); const [ai,setAi]=useState(false);
  if(projects.length<=4){
    return <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {projects.map(p=><button key={p.name} onClick={()=>onSelect(p)} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px solid ${p===current?AI_GOLD:T.border}`,background:p===current?AI_GOLD:T.s2,color:p===current?"#0b0e24":T.ink3}}>{p.name}</button>)}
      <button onClick={onNew} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px dashed ${AI_GOLD}`,background:T.s2,color:AI_GOLD}}>＋ New Project</button>
    </div>;
  }
  const rows=ai?projects.filter(p=>["Critical","High"].includes(p.risk))
    :projects.filter(p=>(!stage||p.stage===stage)&&(!q||p.name.toLowerCase().includes(q.toLowerCase())||p.unit.toLowerCase().includes(q.toLowerCase())));
  const inp={background:T.s2,border:`1px solid ${T.border}`,borderRadius:22,color:T.ink,fontSize:12,fontFamily:F.b,outline:"none"};
  return <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",position:"relative"}}>
    <div style={{position:"relative",flex:1,minWidth:240,maxWidth:360}}>
      <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:T.ink4,display:"flex"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>
      <input value={q} onChange={e=>{setQ(e.target.value);setAi(false);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),160)} placeholder={`Search ${projects.length} projects…`} style={{...inp,width:"100%",padding:"9px 14px 9px 36px"}}/>
    </div>
    <select value={stage} onChange={e=>{setStage(e.target.value);setAi(false);setOpen(true);}} style={{...inp,padding:"9px 14px",cursor:"pointer",fontWeight:700,color:T.ink2}}>
      <option value="">All stages</option>{["Scaling","In Production","In Progress","Completed","Retired"].map(s=><option key={s}>{s}</option>)}
    </select>
    <button onMouseDown={e=>{e.preventDefault();setAi(true);setOpen(true);setQ("high-risk · needs a decision");}} style={{background:`linear-gradient(135deg,${AI_GOLD}22,transparent)`,border:`1px solid ${AI_GOLD}44`,color:AI_GOLD,borderRadius:22,padding:"9px 15px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>✦ Ask Veris</button>
    <button onClick={onNew} style={{padding:"9px 14px",borderRadius:22,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px dashed ${AI_GOLD}`,background:T.s2,color:AI_GOLD}}>＋ New Project</button>
    <span style={{fontSize:10.5,color:T.ink4,fontWeight:800,fontFamily:F.m,letterSpacing:"0.04em"}}>{projects.length} projects · showing: {current.name}</span>
    {open&&<div style={{position:"absolute",top:46,left:0,width:390,maxWidth:"92vw",maxHeight:300,overflow:"auto",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 18px 44px rgba(0,0,0,.34)",zIndex:30,padding:6}}>
      <div style={{padding:"6px 10px 4px",fontSize:8.5,letterSpacing:"0.12em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m}}>{ai?`✦ Veris found ${rows.length} high-risk projects awaiting attention`:stage||(q?"Matches":"All projects")}</div>
      {rows.length?rows.map(p=><button key={p.name} onMouseDown={e=>{e.preventDefault();onSelect(p);setOpen(false);setAi(false);setQ("");}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,cursor:"pointer",border:"none",background:"transparent",width:"100%",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background=T.s2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span style={{flex:1}}><span style={{fontSize:12,fontWeight:700,color:T.ink,display:"block"}}>{p.name}</span><span style={{fontSize:9.5,color:T.ink3}}>{p.unit} · Phase {p.phase}/13 · {p.stage}</span></span>
        <Pill c={riskColor(p.risk)}>{p.risk}</Pill>
      </button>):<div style={{padding:14,fontSize:11,color:T.ink3,textAlign:"center",fontFamily:F.b}}>No projects match.</div>}
    </div>}
  </div>;
}

/* ══════════════════ OVERVIEW ══════════════════ */
function Overview({role,go,showToast,userName}){
  const [tab,setTab]=useState("overview");
  const name=(userName||(ROLES[role]||ROLES.caio).name).split(" ")[0];
  const hour=typeof window!=="undefined"?new Date().getHours():9;
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const TABS=[["overview","Overview"],["governance","Governance Score"],["compliance","Compliance"],["risks","Risks"],["incidents","Incidents"]];
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}>
      <div>
        <h1 style={{fontFamily:F.e,fontSize:30,fontWeight:400,color:T.ink,margin:"2px 0 4px"}}>{greet}, <span style={{color:AI_GOLD}}>{name}.</span></h1>
        <div style={{color:T.ink3,fontSize:12.5,fontFamily:F.b}}>AI governance is <b style={{color:T.green}}>on track</b> — 3 approvals need you, 12 active risks, 3 open incidents.</div>
      </div>
      <button onClick={()=>go("caiogov")} title="Open Governance & Compliance" style={{display:"flex",alignItems:"center",gap:15,background:`linear-gradient(135deg,#E7BE63,${AI_GOLD} 55%,#B3852F)`,border:"1px solid #F0CE7E",borderRadius:15,padding:"12px 20px",cursor:"pointer",boxShadow:`0 12px 30px ${AI_GOLD}4d,0 0 0 4px ${AI_GOLD}1f`}}>
        <div style={{fontSize:38,fontWeight:800,color:"#221703",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{GOV_SCORE}</div>
        <div style={{textAlign:"left"}}><div style={{fontSize:10,letterSpacing:"0.09em",textTransform:"uppercase",color:"#2a1c02",fontWeight:900,fontFamily:F.m}}>AI Governance Score</div><div style={{fontSize:10.5,color:"#4b3608",marginTop:3,fontWeight:600,fontFamily:F.b}}>/100 · +4 this quarter</div></div>
      </button>
    </div>

    <div style={{display:"flex",gap:6,margin:"18px 0",flexWrap:"wrap"}}>
      {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 15px",borderRadius:20,fontSize:11.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:`1px solid ${tab===k?AI_GOLD:T.border}`,background:tab===k?AI_GOLD:T.s2,color:tab===k?"#0b0e24":T.ink3}}>{l}</button>)}
    </div>

    {tab==="overview"&&<OverviewTab go={go}/>}
    {tab==="governance"&&<GovPanel withDefs/>}
    {tab==="compliance"&&<CompliancePanel/>}
    {tab==="risks"&&<Card style={cardPad}><Eyebrow>Active risk register · all projects</Eyebrow><H3 style={{marginBottom:12}}>12 open · 1 critical · 3 high</H3>
      <Table head={["Risk","Project","Grade","Owner","Treatment"]}>{CAIO_RISKS.map(r=><tr key={r.r}><Td style={{fontWeight:700,color:T.ink}}>{r.r}</Td><Td>{r.p}</Td><Td><Pill c={r.gc}>{r.g}</Pill></Td><Td>{r.o}</Td><Td><Pill c={T.blue}>{r.t}</Pill></Td></tr>)}</Table></Card>}
    {tab==="incidents"&&<IncidentTable/>}
  </div>;
}

function OverviewTab({go}){
  return <div style={{animation:"up .2s ease"}}>
    <Eyebrow style={{margin:"0 2px 9px"}}>Immediate attention · approvals pending</Eyebrow>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:18}}>
      {CAIO_ATTENTION.map(a=><Card key={a.t} style={{padding:"13px 15px",borderLeft:`3px solid ${a.c}`,cursor:"pointer"}}>
        <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.t}</div>
        <div style={{fontSize:10.5,color:T.ink3,marginTop:3,lineHeight:1.5,fontFamily:F.b}}>{a.d}</div>
        <div style={{fontSize:10,color:AI_GOLD,fontWeight:800,marginTop:8,fontFamily:F.b}}>{a.go} →</div>
      </Card>)}
    </div>
    <Eyebrow style={{margin:"0 2px 9px"}}>CAIO domain metrics</Eyebrow>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Kpi l="Governance score" v={<>72<span style={{fontSize:13,color:T.ink4}}>/100</span></>} vc={T.green} s="+4 vs last quarter" onClick={()=>go("caiogov")}/>
      <Kpi l="Active AI projects" v="9" s="4 high-risk · 3 limited" onClick={()=>go("caioplaybook")}/>
      <Kpi l="Policies enforced" v="24" vc={T.blue} s="avg adherence 88%" onClick={()=>go("caiogov")}/>
      <Kpi l="ISO 42001 readiness" v="81%" vc={AI_GOLD} s="Stage-2 audit Q4" onClick={()=>go("caiogov")}/>
      <Kpi l="Open risks" v="12" vc={T.red} s="1 critical · 3 high" onClick={()=>go("caiorisk")}/>
      <Kpi l="AI incidents" v="3" vc={T.amber} s="open · 1 P1" onClick={()=>go("caioincidents")}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
      <GovPanel/>
      <CompliancePanel compact/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,marginTop:16}}>
      <Card style={cardPad}><Eyebrow>Major &amp; active risks</Eyebrow><H3 style={{marginBottom:12}}>Highest exposure first</H3>
        <Table>{CAIO_RISKS.map(r=><tr key={r.r}><Td style={{fontWeight:700,color:T.ink}}>{r.r}</Td><Td>{r.p}</Td><Td><Pill c={r.gc}>{r.g}</Pill></Td></tr>)}</Table>
      </Card>
      <Card style={cardPad}><Eyebrow>AI incidents · from ServiceNow / CRM</Eyebrow><H3 style={{marginBottom:12}}>By priority &amp; severity</H3>
        <Table>{CAIO_INCIDENTS.map(i=><tr key={i.id}><Td style={{fontWeight:700,color:T.ink}}>{i.id}</Td><Td>{i.sum}</Td><Td><Pill c={i.pc}>{i.pri}</Pill></Td></tr>)}</Table>
      </Card>
    </div>
    <Eyebrow style={{margin:"20px 2px 9px"}}>Quick access</Eyebrow>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
      {[["Run Impact Assessment","Start an AIA for a project","caioaia"],["Create risk + treatment","AI Risk Treatment Plan","caiorisk"],["New project playbook","Strategy → runbook","caioplaybook"],["Governance Library","ISO · regulatory · checklists","caiolibrary"]].map(([t,d,dest])=>
        <button key={t} onClick={()=>go(dest)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:14,cursor:"pointer",textAlign:"left"}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{t}</div><div style={{fontSize:10,color:T.ink3,marginTop:3,fontFamily:F.b}}>{d}</div></button>)}
    </div>
  </div>;
}
function GovPanel({withDefs}){
  return <Card style={cardPad}>
    <Eyebrow>AI Governance Score · weighted inputs</Eyebrow><H3 style={{marginBottom:14}}>How the {GOV_SCORE} is scored</H3>
    <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
      <Ring score={GOV_SCORE}/>
      <div style={{flex:1,minWidth:220}}>{GOV_INPUTS.map(g=><ScoreRow key={g.k} label={g.k} v={g.v} c={g.v>=75?T.green:T.amber}/>)}</div>
    </div>
    {withDefs&&<div style={{marginTop:14}}><Table head={["Parameter","Source of evidence","Weight"]}>{GOV_INPUTS.map(g=><tr key={g.k}><Td style={{fontWeight:700,color:T.ink}}>{g.k}</Td><Td>{g.src}</Td><Td>{g.w}</Td></tr>)}</Table></div>}
    {!withDefs&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:11,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}33`,fontSize:11,color:T.ink2,lineHeight:1.6,fontFamily:F.b}}><b style={{color:AI_GOLD}}>Veris Intelligence:</b> Fairness &amp; bias control (68) is the lowest input — two high-risk models lack a documented bias-testing cycle. Closing that lifts the composite to an estimated 76.</div>}
  </Card>;
}
function CompliancePanel({compact}){
  return <Card style={cardPad}>
    <Eyebrow>Compliance posture</Eyebrow><H3 style={{marginBottom:14}}>ISO checklists · standards · regulatory</H3>
    {COMPLIANCE.map(c=><ScoreRow key={c.k} label={c.k} v={c.v} c={c.c}/>)}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}><Pill c={T.teal}>ISO 42001 certified body</Pill><Pill c={T.blue}>EU AI Act notified</Pill><Pill c={T.violet}>NIST aligned</Pill></div>
  </Card>;
}
function IncidentTable(){
  return <Card style={cardPad}><Eyebrow>Open incidents · ServiceNow / CRM</Eyebrow><H3 style={{marginBottom:12}}>3 open · 1 P1 · SLA breaches 0</H3>
    <Table head={["Ticket","Summary","Project","Priority","Source","Status"]}>{CAIO_INCIDENTS.map(i=><tr key={i.id}><Td style={{fontWeight:700,color:T.ink}}>{i.id}</Td><Td>{i.sum}</Td><Td>{i.proj}</Td><Td><Pill c={i.pc}>{i.pri}</Pill></Td><Td>{i.src}</Td><Td><Pill c={i.sc}>{i.status}</Pill></Td></tr>)}</Table>
  </Card>;
}

/* ══════════════════ MY PLAYBOOK ══════════════════ */
function Playbook({showToast}){
  const [cur,setCur]=useState(CAIO_PROJECTS[0]);
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="My Playbook" sub="Choose a project or create a new one — strategy, policies, roadmap, execution, resources & skills. Runbooks unlock once a project is implemented or completed."/>
    <div style={{marginBottom:14}}><ProjectPicker projects={CAIO_PROJECTS} current={cur} onSelect={setCur} onNew={()=>showToast&&showToast("New project — intake started")}/></div>
    <div style={{display:"flex",alignItems:"center",gap:10,background:`linear-gradient(90deg,${AI_GOLD}22,transparent)`,border:`1px solid ${AI_GOLD}33`,borderRadius:11,padding:"10px 15px",marginBottom:18}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:AI_GOLD,boxShadow:`0 0 10px ${AI_GOLD}`}}/>
      <span style={{fontSize:12,color:T.ink2,fontWeight:700,fontFamily:F.b}}>Active project: <b style={{color:T.ink}}>{cur.name}</b> <span style={{color:T.ink3,fontWeight:600}}>· {cur.unit} · Phase {cur.phase}/13</span></span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Strategy</Eyebrow><H3>Objective &amp; execution strategy</H3><div style={{fontSize:11,color:T.ink3,marginTop:8,lineHeight:1.65,fontFamily:F.b}}>Deliver <b style={{color:T.ink2}}>{cur.name}</b> for {cur.unit} under governed lifecycle control. Execution: phased pilot → parallel-run → conformity assessment → scale gate, with evidence captured at every phase.</div></Card>
      <Card style={cardPad}><Eyebrow>Policies applied</Eyebrow><H3>6 governance policies</H3>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2}}><Pill c={T.green}>Enforced</Pill>Human-oversight policy · adherence 91%</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2}}><Pill c={T.green}>Enforced</Pill>Model-risk policy · adherence 86%</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2}}><Pill c={T.amber}>Exception</Pill>Data-retention · 30-day pilot waiver</div>
        </div>
      </Card>
    </div>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>{cur.name} · project roadmap · 13-phase lifecycle</Eyebrow><H3 style={{marginBottom:12}}>Phase {cur.phase} of 13 — {PH[cur.phase-1]}</H3>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {PH.map((p,i)=>{const done=i<cur.phase-1,active=i===cur.phase-1;return <span key={p} style={{padding:"6px 11px",borderRadius:8,fontSize:10,fontWeight:800,fontFamily:F.b,background:active?AI_GOLD:done?AI_GOLD+"22":T.s2,color:active?"#0b0e24":done?AI_GOLD:T.ink4,border:`1px solid ${active?AI_GOLD:done?AI_GOLD+"44":T.border}`}}>{i+1}. {p}</span>;})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:16}}>
      <Card style={cardPad}><Eyebrow>Resources allocated · skills</Eyebrow><H3 style={{marginBottom:12}}>Delivery team</H3>
        <Table head={["Role","Name","Alloc","Key skills"]}>
          <tr><Td style={{fontWeight:700,color:T.ink}}>Business owner</Td><Td>Omar Khan</Td><Td>60%</Td><Td>Credit risk, banking ops</Td></tr>
          <tr><Td style={{fontWeight:700,color:T.ink}}>Risk engineering</Td><Td>Squad Delta (4)</Td><Td>100%</Td><Td>ML, model validation</Td></tr>
          <tr><Td style={{fontWeight:700,color:T.ink}}>Legal counsel</Td><Td>T. Brandt</Td><Td>25%</Td><Td>EU AI Act, GDPR</Td></tr>
          <tr><Td style={{fontWeight:700,color:T.ink}}>Compliance partner</Td><Td>GRC — D. Osei</Td><Td>40%</Td><Td>ISO 42001, controls</Td></tr>
        </Table>
      </Card>
      <Card style={cardPad}><Eyebrow>Runbook</Eyebrow><H3>{cur.phase>=9?"Runbook available":"Locked until implementation"}</H3>
        <div style={{fontSize:11,color:T.ink3,marginTop:8,lineHeight:1.6,fontFamily:F.b}}>{cur.phase>=9?<>The executable runbook for <b style={{color:T.ink2}}>{cur.name}</b> is available — operating cadence, gates, escalation and ownership.</>:<>This project is in <b style={{color:T.ink2}}>{PH[cur.phase-1]} (phase {cur.phase})</b>. The runbook unlocks at <b style={{color:T.ink2}}>Deployment</b>.</>}</div>
        <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2}}><Pill c={T.green}>Runbook ready</Pill>Finance Close Automation</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2}}><Pill c={T.green}>Runbook ready</Pill>Contract Review Assist</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink3}}><Pill c={T.ink3}>Locked</Pill>Credit Decision Assurance</div>
        </div>
      </Card>
    </div>
  </div>;
}

/* ══════════════════ GOVERNANCE & COMPLIANCE ══════════════════ */
function Governance(){
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Governance & Compliance" sub="Governance metrics, the policies applied and how closely each model adheres, plus the standards and regulatory bodies you're affiliated to."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Governance metrics</Eyebrow><H3 style={{marginBottom:14}}>Composite {GOV_SCORE}/100 · weighted inputs</H3>
        {GOV_INPUTS.map(g=><ScoreRow key={g.k} label={g.k.split(" ")[0]} v={g.v} c={g.v>=75?T.green:T.amber}/>)}
      </Card>
      <Card style={cardPad}><Eyebrow>Policy adherence by model</Eyebrow><H3 style={{marginBottom:14}}>How closely each model follows policy</H3>
        <Table head={["Model","Policies","Adherence"]}>{CAIO_POLICIES.map(p=><tr key={p.m}><Td style={{fontWeight:700,color:T.ink}}>{p.m}</Td><Td>{p.n}</Td><Td><Pill c={p.c}>{p.a}%</Pill></Td></tr>)}</Table>
      </Card>
    </div>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>Standards &amp; regulatory affiliations</Eyebrow><H3 style={{marginBottom:14}}>Frameworks the organisation is governed by</H3>
      <Table head={["Framework / body","Type","Scope","Status"]}>{CAIO_STANDARDS.map(s=><tr key={s.f}><Td style={{fontWeight:700,color:T.ink}}>{s.f}</Td><Td>{s.ty}</Td><Td>{s.sc}</Td><Td><Pill c={s.c}>{s.st}</Pill></Td></tr>)}</Table>
    </Card>
  </div>;
}

/* ══════════════════ REPORTS ══════════════════ */
function Reports({showToast}){
  const [sel,setSel]=useState(new Set(["Governance score","Compliance posture","Risk register"]));
  const [gen,setGen]=useState(false);
  const toggle=d=>setSel(s=>{const n=new Set(s);n.has(d)?n.delete(d):n.add(d);return n;});
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Reports" sub="Build a governance report by dimension, then export a board-ready or auditor-ready pack."/>
    <Card style={cardPad}><Eyebrow>Report builder</Eyebrow><H3 style={{marginBottom:12}}>Choose the dimensions to include</H3>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{REPORT_DIMS.map(d=><button key={d} onClick={()=>toggle(d)} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px solid ${sel.has(d)?AI_GOLD:T.border}`,background:sel.has(d)?AI_GOLD:T.s2,color:sel.has(d)?"#0b0e24":T.ink3}}>{d}</button>)}</div>
      <div style={{display:"flex",gap:9,marginTop:14,flexWrap:"wrap"}}><button onClick={()=>{setGen(true);showToast&&showToast("Governance pack generated");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 17px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>✦ Generate report</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 17px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Schedule monthly</button></div>
    </Card>
    {gen&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}>
      <Eyebrow style={{color:AI_GOLD}}>Governance pack · generated draft</Eyebrow><H3 style={{marginBottom:10}}>AI Governance Report — Q3 FY26</H3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:12}}>
        <Kpi l="Governance score" v="72" vc={T.green}/><Kpi l="ISO 42001" v="81%" vc={AI_GOLD}/><Kpi l="Open risks" v="12" vc={T.red}/><Kpi l="Open incidents" v="3" vc={T.amber}/>
      </div>
      <div style={{display:"flex",gap:9}}><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export XLSX</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export audit PDF</button></div>
    </Card>}
  </div>;
}

/* ══════════════════ AI INCIDENTS ══════════════════ */
function Incidents(){
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="AI Incidents" sub="Tickets synced from ServiceNow / CRM — ranked by priority and severity, with SLA status."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:16}}>
      <Kpi l="P1 · Critical" v="1" vc={T.red} s="SLA 4h · breached 0"/><Kpi l="P2 · High" v="1" vc={T.amber} s="SLA 1d"/><Kpi l="P3 · Medium" v="1" vc={T.blue} s="SLA 3d"/><Kpi l="Resolved (30d)" v="14" vc={T.green} s="avg 1.8d"/>
    </div>
    <IncidentTable/>
  </div>;
}

/* ══════════════════ IMPACT ASSESSMENT (AIA) ══════════════════ */
function AIA(){
  const [cur,setCur]=useState(CAIO_PROJECTS[0]);
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Impact Assessment (AIA)" sub="Select a project or create one, then run a structured AI impact assessment — the outcome classifies the system and drives its controls."/>
    <div style={{marginBottom:18}}><ProjectPicker projects={CAIO_PROJECTS} current={cur} onSelect={setCur} onNew={()=>{}}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Assessment sections</Eyebrow><H3 style={{marginBottom:12}}>{cur.name}</H3>
        <Table>{[["Purpose & context","Complete",T.green],["Affected individuals","Complete",T.green],["Data & personal data","Complete",T.green],["Automated decision-making","Review",T.amber],["Rights & human oversight","Review",T.amber],["Risk & mitigation summary","Pending",T.ink3]].map(s=><tr key={s[0]}><Td style={{fontWeight:700,color:T.ink}}>{s[0]}</Td><Td><Pill c={s[2]}>{s[1]}</Pill></Td></tr>)}</Table>
      </Card>
      <Card style={cardPad}><Eyebrow>Assessment outcome</Eyebrow><H3 style={{marginBottom:10}}>Classification &amp; controls</H3>
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"6px 0 12px"}}><Pill c={T.red} big>High-risk system</Pill><span style={{fontSize:11,color:T.ink3}}>EU AI Act Annex III · credit scoring</span></div>
        <div style={{padding:"12px 14px",borderRadius:11,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}33`,fontSize:11,color:T.ink2,lineHeight:1.6,fontFamily:F.b}}><b style={{color:AI_GOLD}}>Veris Intelligence:</b> Automated decision-making with legal effect on individuals ⇒ mandatory human oversight (Art.14), logging (Art.12) and a conformity assessment before deployment. 2 sections remain to complete the record.</div>
        <div style={{display:"flex",gap:9,marginTop:14}}><button style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"9px 16px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Continue assessment</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"9px 16px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Send to Risk Center →</button></div>
      </Card>
    </div>
  </div>;
}

/* ══════════════════ RISK CENTER (CAIO lens) ══════════════════ */
function RiskCenter({role,openFull,showToast}){
  const [cur,setCur]=useState(CAIO_PROJECTS[0]);
  const [assigned,setAssigned]=useState(false);
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Risk Center" sub="Select a project, define or create a risk, and generate an AI Risk Treatment Plan with a mitigation roadmap."/>
    <div style={{marginBottom:16}}><ProjectPicker projects={CAIO_PROJECTS} current={cur} onSelect={setCur} onNew={()=>{}}/></div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Eyebrow style={{margin:0}}>Risk register · {cur.name}</Eyebrow>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open full Risk Center →</button></div>
      <Table head={["Risk","Grade","Owner","Treatment","Status"]}>{CAIO_RISKS.map(r=><tr key={r.r}><Td style={{fontWeight:700,color:T.ink}}>{r.r}</Td><Td><Pill c={r.gc}>{r.g}</Pill></Td><Td>{r.o}</Td><Td><Pill c={r.t==="Transfer"?T.violet:T.blue}>{r.t}</Pill></Td><Td><Pill c={r.sc}>{r.s}</Pill></Td></tr>)}</Table>
    </Card>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow style={{color:AI_GOLD}}>AI Risk Treatment Plan · generated</Eyebrow><H3 style={{marginBottom:6}}>Adverse-decision harm → mitigation roadmap</H3>
      <div style={{marginTop:8,padding:"12px 14px",borderRadius:11,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}33`,fontSize:11,color:T.ink2,lineHeight:1.6,fontFamily:F.b}}><b style={{color:AI_GOLD}}>Veris Intelligence:</b> Recommended treatment — <b>Mitigate</b>. 1) Deploy human-in-the-loop review for all declines above threshold. 2) Publish reason codes to applicants. 3) Run parallel-run vs manual for 6 weeks and log divergence. 4) Independent bias audit before scale gate. Residual risk projected <b>12 → 5</b>.</div>
      {assigned?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b,marginTop:12}}>✓ Treatment plan accepted &amp; assigned — evidence minted to the audit trail</div>
      :<div style={{display:"flex",gap:9,marginTop:14}}><button onClick={()=>{setAssigned(true);pushBus("vz-gw-evidence",{item:`AI Risk Treatment Plan accepted — ${cur.name}`,initiative:cur.name,scope:"Risk Center",control:"AI Risk Treatment Plan",risk:"Adverse-decision harm",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:"Accepted",version:"v1",time:"Just now"});showToast&&showToast("Treatment plan accepted — evidence minted");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"9px 16px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Accept plan &amp; assign</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"9px 16px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Edit treatment</button></div>}
    </Card>
  </div>;
}

/* ══════════════════ GOVERNANCE LIBRARY ══════════════════ */
function Library({go}){
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Governance Library" sub="Central repository — ISO standards, checklists, control libraries, and regulatory & country-specific AI rules."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
      {LIBRARY.map(l=><button key={l.t} onClick={()=>go&&go("compliance")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 15px",cursor:"pointer",textAlign:"left"}}>
        <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{l.t}</div>
        <div style={{fontSize:10.5,color:T.ink3,marginTop:5,lineHeight:1.5,fontFamily:F.b}}>{l.d}</div>
        <div style={{marginTop:9}}><Pill c={l.c}>{l.n}</Pill></div>
      </button>)}
    </div>
  </div>;
}

/* ══════════════════ ROOT ══════════════════ */
export function CAIOCommandCenter({tab="home",role="caio",setTab,setAiCentralView,showToast,userName}){
  const go=dest=>setTab&&setTab(dest);
  const openFullRisk=()=>setTab&&setTab("riskcenter");
  const openCompliance=()=>setTab&&setTab("compliance");
  switch(tab){
    case "caioplaybook":  return <Playbook showToast={showToast}/>;
    case "caiogov":       return <Governance/>;
    case "caioreports":   return <Reports showToast={showToast}/>;
    case "caioincidents": return <Incidents/>;
    case "caioaia":       return <AIA/>;
    case "caiorisk":      return <RiskCenter role={role} openFull={openFullRisk} showToast={showToast}/>;
    case "caiolibrary":   return <Library go={openCompliance}/>;
    default:              return <Overview role={role} go={go} showToast={showToast} userName={userName}/>;
  }
}
