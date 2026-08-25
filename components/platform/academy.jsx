"use client";

import { CheckCircle2, PlayCircle } from "lucide-react";
import { acInitiatives } from "@/lib/platform-models";
import { T, RC, ROLES, AI_GOLD, AI_GOLD_INK, GOVERNANCE_ACADEMY, ROLE_LEARNING_PATHS, academyEvidenceFor, F, Tag, Bar, Card, SHead } from "./core";
import { pathProgress, quizAvg, stateOf, isComplete, enterpriseReadiness, evidenceFromLearning } from "@/lib/academy-engine";
import { GlossaryLearning } from "./dictionary";
import { useState } from "react";
import { useLang, ts } from "@/lib/i18n";
import { USE_CASES, USE_CASE_CATS, USE_CASE_CAT_AR } from "@/lib/use-cases";

/* ── Use Cases (Help / Guides) ──────────────────────────────────────
   A problem an organisation faces, and the step-by-step way VerisZone
   solves it. Bilingual; content lives in lib/use-cases.js. */
function UseCases() {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const [cat, setCat] = useState("all");
  const list = USE_CASES.filter(u => cat === "all" || u.cat === cat);
  const catLabel = c => ar ? (USE_CASE_CAT_AR[c] || c) : c;
  const chips = ["all", ...USE_CASE_CATS];
  return <div style={{ animation: "up .3s ease" }}>
    <SHead title={ar ? "حالات الاستخدام" : "Use Cases"} sub={ar
      ? "مشكلة تواجهها مؤسستك، والطريقة خطوة بخطوة التي تحلّها بها VerisZone — كل خطوة تشير إلى السطح الذي ينجزها."
      : "A problem your organisation faces, and the step-by-step way VerisZone solves it — each step points to the surface that does the work."} />
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
      {chips.map(c => { const on = cat === c; return <button key={c} onClick={() => setCat(c)} style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", color: on ? "#241703" : T.ink2, background: on ? AI_GOLD : T.s2, border: `1px solid ${on ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 12px" }}>{c === "all" ? (ar ? "الكل" : "All") : catLabel(c)}</button>; })}
    </div>
    <div style={{ display: "grid", gap: 14 }}>
      {list.map(u => <Card key={u.id} style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: AI_GOLD_INK, textTransform: "uppercase", letterSpacing: "0.1em" }}>{ar ? "المشكلة" : "The problem"}</div>
          <Tag label={catLabel(u.cat)} color={AI_GOLD} bg={AI_GOLD + "16"} />
        </div>
        <h3 style={{ fontFamily: F.h, fontSize: 17, fontWeight: 900, color: T.ink, margin: "0 0 6px", textAlign: ar ? "right" : "left" }}>{ar && u.titleAr ? u.titleAr : u.title}</h3>
        <p style={{ fontSize: 12, color: T.ink2, fontFamily: F.b, lineHeight: 1.6, margin: "0 0 14px", textAlign: ar ? "right" : "left" }}>{ar && u.problemAr ? u.problemAr : u.problem}</p>
        <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9 }}>{ar ? "الحل خطوة بخطوة" : "Step-by-step solution"}</div>
        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {u.steps.map((st, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: ar ? "auto 1fr" : "auto 1fr", gap: 11, alignItems: "start" }}>
            <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", background: AI_GOLD + "1f", color: AI_GOLD_INK, fontSize: 11, fontWeight: 900, fontFamily: F.m, display: "grid", placeItems: "center" }}>{i + 1}</span>
            <div style={{ minWidth: 0, textAlign: ar ? "right" : "left" }}>
              <span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.55 }}>{ar && st.tAr ? st.tAr : st.t}</span>
              {st.s && <span style={{ display: "inline-block", marginInlineStart: 8, fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "1px 7px", whiteSpace: "nowrap", verticalAlign: "middle" }}>{st.s}</span>}
            </div>
          </div>)}
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 13px", borderRadius: 10, background: T.green + "12", border: `1px solid ${T.green}30`, textAlign: ar ? "right" : "left" }}>
          <span style={{ color: T.green, fontWeight: 900, flexShrink: 0 }}>✓</span>
          <div>
            <span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.55 }}><b style={{ color: T.ink }}>{ar ? "النتيجة: " : "Outcome: "}</b>{ar && u.outcomeAr ? u.outcomeAr : u.outcome}</span>
            <div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m, marginTop: 5 }}>{u.frameworks}</div>
          </div>
        </div>
      </Card>)}
    </div>
  </div>;
}

/* Employee learner hub - the Academy as a personal learning experience.
   Curriculum and certifications derive from role, initiative and phase;
   managers' assignments appear alongside. */
function EmployeeLearnerHub({role,seeded,showToast,setTab}){
  const R=ROLES[role]||ROLES.employee;
  const pathIds=ROLE_LEARNING_PATHS[role]||ROLE_LEARNING_PATHS.caio;
  const path=pathIds.map(id=>GOVERNANCE_ACADEMY.find(v=>v.id===id)).filter(Boolean);
  const progress=seeded?pathProgress(role).pct:0;
  const mandatory=["Prompt Injection Defense","ISO 42001 Clause 8","Human Oversight in Practice","Responsible GenAI Use v6"];
  const recommended=["Threat Modeling for GenAI","Effective Prompt Engineering","Evaluating AI Outputs"];
  const managerAssigned=[{name:"Customer conversation quality with AI",by:"Riley Chen",due:"Aug 08"}];
  const certs=[["Responsible AI Practitioner","Active · Dec 2026",T.green],["Data Handling Level 2","Expiring · Aug 2026",T.amber]];
  const sims=[["Prompt-injection fire drill","Simulation · 20 min"],["Adverse decision escalation","Simulation · 15 min"],["Spot the data leak","Challenge · weekly"],["Governed prompt golf","Challenge · leaderboard"]];
  const history=[["Responsible AI Foundations","Completed · Jun 2026"],["Data Handling Level 2","Completed · Feb 2026"],["Secure Prompting Basics","Completed · May 2026"]];
  const start=n=>showToast&&showToast(`"${n}" started - completion becomes governance evidence`);
  const secHead=t=><div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:9}}>{t}</div>;
  const row=(n,d,action)=><div key={n} style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
    <span style={{minWidth:0,flex:1}}>
      <span style={{display:"block",fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{n}</span>
      {d&&<span style={{display:"block",fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:1}}>{d}</span>}
    </span>
    {action}
  </div>;
  const startBtn=n=><button onClick={()=>start(n)} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD_INK,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>Start</button>;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Governance Academy" sub="Your learning hub - courses, certifications, simulations and challenges. Completions become governance evidence automatically."/>
    <Card style={{padding:16,marginBottom:14,border:`1px solid ${AI_GOLD}30`}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:220}}>
          <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.h,marginBottom:7}}>My learning path</div>
          <Bar value={progress} color={AI_GOLD}/>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>{progress}% complete · assigned from your role, initiative and current lifecycle phase</div>
        </div>
        <div style={{display:"flex",gap:14}}>
          {certs.map(([n,st,c])=><div key={n}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Certification</div>
            <div style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{n}</div>
            <div style={{fontSize:9.5,color:c,fontFamily:F.m,fontWeight:800,marginTop:2}}>{st}</div>
          </div>)}
        </div>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
      <Card style={{padding:15}}>
        {secHead("Mandatory courses")}
        {mandatory.map(n=>row(n,"Required by your initiative's current phase",startBtn(n)))}
      </Card>
      <Card style={{padding:15}}>
        {secHead("Recommended for you")}
        {recommended.map(n=>row(n,"Based on your role and recent AI activity",startBtn(n)))}
      </Card>
      <Card style={{padding:15}}>
        {secHead("Manager-assigned training")}
        {managerAssigned.map(m=>row(m.name,`Assigned by ${m.by} · due ${m.due}`,startBtn(m.name)))}
        {secHead&&<div style={{marginTop:14}}>{secHead("Company policies")}</div>}
        {["Responsible GenAI Use v6","Data Handling Standard","Human Oversight Standard"].map(n=>row(n,"Policy learning · acknowledgement tracked",startBtn(n)))}
      </Card>
      <Card style={{padding:15}}>
        {secHead("Simulations & challenges")}
        {sims.map(([n,d])=>row(n,d,startBtn(n)))}
      </Card>
      <Card style={{padding:15}}>
        {secHead("Learning history")}
        {history.map(([n,d])=>row(n,d,<Tag label="✓" color={T.green} bg={T.greenL}/>))}
      </Card>
      <Card style={{padding:15}}>
        {secHead("Role curriculum")}
        {path.slice(0,5).map(v=>row(v.title,v.duration||v.level||"Module",startBtn(v.title)))}
      </Card>
    </div>
  </div>;
}

export function PageGovernanceAcademy({role,sessionMode,showToast,setTab}) {
  const rc=RC(role), R=ROLES[role]||ROLES.caio;
  const seededHub=(sessionMode==="demo"||sessionMode==="aicentral");
  const [view,setView]=useState("learning");
  const seg=(id,label)=>{const on=view===id;return <button key={id} onClick={()=>setView(id)} style={{background:on?AI_GOLD:"transparent",border:"none",borderRadius:8,padding:"6px 14px",color:on?"#241703":T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer",transition:"all .15s"}}>{label}</button>;};
  const acLang=useLang(); const acAr=acLang==="ar";
  const toggle=<div style={{display:"inline-flex",gap:3,background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:4,marginBottom:14,flexWrap:"wrap"}}>{seg("learning",acAr?"مسار التعلّم":"Learning Path")}{seg("glossary",acAr?"المسرد والتعلّم":"Glossary & Learning")}{seg("usecases",acAr?"حالات الاستخدام":"Use Cases")}</div>;
  if(view==="usecases")return <div style={{animation:"up .3s ease"}}>{toggle}<UseCases/></div>;
  if(view==="glossary")return <div style={{animation:"up .3s ease"}}>{toggle}<GlossaryLearning/></div>;
  if(role==="employee")return <div>{toggle}<EmployeeLearnerHub role={role} seeded={seededHub} showToast={showToast} setTab={setTab}/></div>;
  const pathIds=ROLE_LEARNING_PATHS[role]||ROLE_LEARNING_PATHS.caio;
  const path=pathIds.map(id=>GOVERNANCE_ACADEMY.find(v=>v.id===id)).filter(Boolean);
  const seeded=(sessionMode==="demo"||sessionMode==="aicentral");
  /* Computed by the Academy engine: per-module completion → path progress,
     quiz average and an enterprise readiness index (no flat 55% / 86%). */
  const pg=pathProgress(role);
  const completed=seeded?pg.done:0;
  const progress=seeded?pg.pct:0;
  const qAvg=quizAvg(role);
  const readiness=enterpriseReadiness();
  const featured=path[0]||GOVERNANCE_ACADEMY[0];
  const academyEvidence=seeded?evidenceFromLearning(role):[];
  const moduleStats=[
    ["Assigned modules",path.length,rc],
    ["Completed",completed,T.green],
    ["Readiness index",seeded?readiness.index:"--",AI_GOLD],
    ["Avg. quiz score",seeded&&qAvg?qAvg+"%":"--",T.blue],
  ];
  return <div style={{animation:"up .3s ease"}}>
    {toggle}
    <SHead title="Governance Academy" sub={`${R.label} learning path for AI governance, pilot readiness, approvals and audit evidence. The Academy measures maturity - completion updates the Governance Score.`}/>
    <Card style={{padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Governance maturity - who understands AI</h3>
        <span title="mean role maturity = 0.55·path completion + 0.25·quiz + 0.20·initiative training" style={{fontSize:9.5,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK,background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:999,padding:"3px 10px"}}>Readiness index {readiness.index} · feeds Governance Score</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:12}}>
        {readiness.rows.slice(0,6).map(x=>{
          const c=x.maturity>=80?T.green:x.maturity>=70?T.blue:T.amber;
          return <div key={x.role} title={`Path ${x.progress}% · quiz ${x.quiz} · training ${x.training}%`} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{x.role}</span>
              <span style={{fontSize:14,fontWeight:900,fontFamily:F.m,color:c}}>{x.maturity}</span>
            </div>
            <Bar value={x.maturity} color={c}/>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginTop:4}}>path {x.progress}% · quiz {x.quiz}</div>
          </div>;
        })}
      </div>
      <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Learning required - recommended from live project data</div>
      <div style={{display:"grid",gap:7}}>
        {acInitiatives.filter(i=>parseInt(i.training,10)<70).map(i=><div key={i.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
          <div><div style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.unit} team - {i.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Only {i.training} trained · resistance {i.resistance.toLowerCase()} · adoption {i.adoption}% - training gap is holding value back</div></div>
          <Tag label={`${i.training} trained`} color={T.amber} bg={T.amberL}/>
          <button onClick={()=>showToast&&showToast(`Learning path assigned to the ${i.unit} team - completion will lift the governance score`)} style={{background:rc+"14",border:`1px solid ${rc}40`,borderRadius:7,padding:"6px 11px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Assign path</button>
        </div>)}
      </div>
    </Card>
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
          <div style={{fontSize:10,color:AI_GOLD_INK,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Featured path</div>
          <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:900,color:T.ink,margin:"0 0 5px"}}>{featured.title}</h3>
          <p style={{fontFamily:F.b,fontSize:10,lineHeight:1.55,color:T.ink3,margin:"0 0 10px"}}>{featured.desc}</p>
          <button type="button" onClick={()=>showToast("Video lessons ship with the production media library - module outline is available now","error")} style={{background:rc,border:"none",borderRadius:9,padding:"9px 12px",color:"#fff",fontFamily:F.b,fontSize:11,fontWeight:900,cursor:"pointer"}}>Preview lesson</button>
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
          const st=seeded?stateOf(v.id):"Not started";const done=st==="Complete";const prog=st==="In progress";
          const stColor=done?T.green:prog?AI_GOLD:T.ink4;const stBg=done?T.greenL:prog?AI_GOLD+"18":T.ink5;
          return <div key={v.id} style={{background:T.s3,border:`1px solid ${done?T.green+"45":prog?AI_GOLD+"40":T.border}`,borderRadius:11,padding:13,animation:`up ${.25+i*.05}s ease both`}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"flex-start",marginBottom:10}}>
              <div><Tag label={v.framework} color={v.framework==="AI Spine"?AI_GOLD:rc} bg={(v.framework==="AI Spine"?AI_GOLD:rc)+"16"}/></div>
              <Tag label={done?"Evidence captured":prog?"In progress":"Not started"} color={stColor} bg={stBg}/>
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
