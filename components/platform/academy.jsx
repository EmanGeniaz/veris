"use client";

import { CheckCircle2, PlayCircle } from "lucide-react";
import { acInitiatives, acCxoAlignment } from "@/lib/platform-models";
import { T, RC, ROLES, AI_GOLD, GOVERNANCE_ACADEMY, ROLE_LEARNING_PATHS, academyEvidenceFor, F, Tag, Bar, Card, SHead } from "./core";

/* Employee learner hub - the Academy as a personal learning experience.
   Curriculum and certifications derive from role, initiative and phase;
   managers' assignments appear alongside. */
function EmployeeLearnerHub({role,seeded,showToast,setTab}){
  const R=ROLES[role]||ROLES.employee;
  const pathIds=ROLE_LEARNING_PATHS[role]||ROLE_LEARNING_PATHS.caio;
  const path=pathIds.map(id=>GOVERNANCE_ACADEMY.find(v=>v.id===id)).filter(Boolean);
  const progress=seeded?68:0;
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
  const startBtn=n=><button onClick={()=>start(n)} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>Start</button>;
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
        {history.map(([n,d])=>row(n,d,<Tag label="\u2713" color={T.green} bg={T.greenL}/>))}
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
  const seededHub=sessionMode==="demo";
  if(role==="employee")return <EmployeeLearnerHub role={role} seeded={seededHub} showToast={showToast} setTab={setTab}/>;
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
    <SHead title="Governance Academy" sub={`${R.label} learning path for AI governance, pilot readiness, approvals and audit evidence. The Academy measures maturity - completion updates the Governance Score.`}/>
    <Card style={{padding:16,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Governance maturity - who understands AI</h3>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Learning completion feeds the Governance Score in AI Central</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:12}}>
        {acCxoAlignment.slice(0,6).map(x=>{
          const c=x.score>=80?T.green:x.score>=70?T.blue:T.amber;
          return <div key={x.role} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{x.role}</span>
              <span style={{fontSize:14,fontWeight:900,fontFamily:F.m,color:c}}>{x.score}</span>
            </div>
            <Bar value={x.score} color={c}/>
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
          <div style={{fontSize:10,color:AI_GOLD,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Featured path</div>
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
