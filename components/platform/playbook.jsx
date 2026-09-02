"use client";

import { PageTemplates, PageChecklists } from "./compliance";
import { readBus, pushBus } from "@/lib/bus";
import { useState, useEffect } from "react";
import { AC_PHASES, acInitiatives, riskRegister, PLAYBOOK_LENS } from "@/lib/platform-models";
import { T, RC, RCL, AI_GOLD, AI_GOLD_INK, PLAYBOOK, HITL, F, Tag, PTag, STag, Bar, Card, SHead } from "./core";

export function PagePlaybook({role,setTab,setAiCentralView,showToast,tab}){
  const rc=RC(role);
  const [selId,setSelId]=useState(acInitiatives[0].id);
  const [pTab,setPTab]=useState(tab==="templates"?"templates":tab==="checklists"?"checklists":"workspace");
  const ini=acInitiatives.find(i=>i.id===selId)||acInitiatives[0];
  const [activePhase,setActivePhase]=useState(ini.phaseIndex);
  useEffect(()=>{setActivePhase(ini.phaseIndex);},[selId,ini.phaseIndex]);
  const risks=riskRegister.filter(r=>r.initiativeId===ini.id);
  const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  const phaseDone=idx=>idx<ini.phaseIndex?100:idx>ini.phaseIndex?0:Math.round((ini.phaseArtifactsDone/(AC_PHASES[idx].deliverables.length||1))*100);
  const overall=Math.round(((ini.phaseIndex+(ini.phaseArtifactsDone/(AC_PHASES[ini.phaseIndex]?.deliverables.length||1)))/AC_PHASES.length)*100);
  const ph=AC_PHASES[activePhase];
  const phC=activePhase<ini.phaseIndex?T.green:activePhase===ini.phaseIndex?AI_GOLD:T.ink4;
  const lessons=acInitiatives.filter(i=>i.id!==ini.id).map(i=>({
    from:i.name,unit:i.unit,
    text:i.adoption>=70?`Reached ${i.adoption}% adoption - champion-led enablement (${i.training}% trained) moved resistance from ${i.resistance} early.`
      :i.blockedBy?`Currently blocked by "${i.blockedBy}" - sequence that artifact earlier than this project did.`
      :`Holding at ${i.adoption}% adoption with ${i.resistance.toLowerCase()} resistance - invest in training before pilot exit.`,
  })).slice(0,3);
  const gotoAC=view=>{setAiCentralView&&setAiCentralView(view);setTab&&setTab("aicentral");};
  const chip=(active,color)=>({background:active?color+"18":T.s2,border:`1px solid ${active?color+"50":T.border}`,color:active?color:T.ink2,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"});
  const owners=[["Business sponsor",ini.sponsor],["Executive owner",(ini.cxo||"CAIO").split(",")[0]],["Technical owner",ini.technicalOwner],["Business owner",ini.businessOwner],["Risk owner",risks[0]?risks[0].execOwner:"CAIO"],["AI champion",ini.champion]];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Playbook" sub="The execution workspace. Pick a project - objectives, business case, phases, tasks, owners, evidence, risks and lessons assemble themselves from AI Central's lifecycle."/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {[["workspace","The Method"],["architecture","Reference Architecture"],["runbooks","Governance Runbooks"],["templates","Templates"],["checklists","Checklists"]].map(([id,l])=><button key={id} onClick={()=>setPTab(id)} style={chip(pTab===id,AI_GOLD)}>{l}</button>)}
      <span style={{marginLeft:"auto",fontSize:9,color:"#636B8A",alignSelf:"center",fontFamily:"inherit"}}>Live execution state lives in each initiative's Journey - this is how we run any initiative.</span>
    </div>
    {pTab==="architecture"&&<PlaybookArchitecture ini={ini} selId={selId} setSelId={setSelId} role={role} setTab={setTab}/>}
    {pTab==="runbooks"&&<PlaybookRunbooks role={role} setTab={setTab} showToast={showToast}/>}
    {pTab==="templates"&&<PageTemplates role={role} showToast={showToast}/>}
    {pTab==="checklists"&&<PageChecklists role={role} showToast={showToast}/>}
    {pTab==="workspace"&&<>
    <Card style={{padding:18,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
        <div style={{minWidth:240,flex:1}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:8}}><STag s={ini.lifecycle}/><PTag p={ini.priority}/><Tag label={`${ini.risk} risk`} color={lvC(ini.risk)} bg={lvC(ini.risk)+"16"}/></div>
          <h2 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:T.ink,margin:"0 0 4px"}}>{ini.name}</h2>
          <div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{ini.unit} · {ini.category} · Objective: {ini.stage}</div>
        </div>
        <div style={{minWidth:200,flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"}}>Implementation completion</span>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK}}>{overall}%</span>
          </div>
          <Bar value={overall} color={AI_GOLD}/>
          <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:5}}>Phase {ini.phaseIndex+1} of {AC_PHASES.length} - {AC_PHASES[ini.phaseIndex]?.name} · {ini.phaseArtifactsDone}/{AC_PHASES[ini.phaseIndex]?.deliverables.length} artifacts</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginTop:14}}>
        {owners.map(([l,v])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px"}}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{v}</div>
        </div>)}
      </div>
      {ini.blockedBy&&<div style={{marginTop:12,background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}><strong style={{color:T.red}}>Current blocker:</strong> {ini.blockedBy}</span>
        <button onClick={()=>setTab&&setTab("riskcenter")} style={{marginLeft:"auto",background:T.red+"14",border:`1px solid ${T.red}40`,borderRadius:7,padding:"5px 11px",color:T.red,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Trace in Risk Center →</button>
      </div>}
    </Card>
    {(()=>{const L=PLAYBOOK_LENS[role]||PLAYBOOK_LENS.caio;const g=activePhase<=4?L.phaseGuidance.early:activePhase<=8?L.phaseGuidance.mid:L.phaseGuidance.late;
      return <Card style={{padding:"13px 16px",marginBottom:12,border:`1px solid ${rc}35`,background:`linear-gradient(135deg,${rc}0d,${T.s1})`}}>
        <div style={{display:"flex",gap:10,alignItems:"baseline",flexWrap:"wrap"}}>
          <span style={{fontSize:10,fontWeight:900,color:rc,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em"}}>{L.title}</span>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{L.angle}</span>
        </div>
        <p style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:"7px 0 0"}}>{g}</p>
      </Card>;})()}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
      {[["Expected value",ini.expected,AI_GOLD],["Realized to date",ini.actual,T.green],["ROI",ini.roi,T.blue],["Productivity",ini.productivity,T.violet],["Adoption",`${ini.adoption}%`,T.amber],["Business value score",`${ini.valueScore}%`,T.green]].map(([l,v,c])=>
        <Card key={l} onClick={()=>gotoAC("initiatives")} title="Review initiative" style={{padding:13,cursor:"pointer"}}>
          <div style={{fontSize:8.5,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:900,fontFamily:F.m,marginBottom:6}}>{l}</div>
          <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
        </Card>)}
    </div>
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Implementation phases</h3>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Lifecycle owned by AI Central · every phase generates artifacts, evidence and approvals</span>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
        {AC_PHASES.map((p2,idx)=>{
          const c=idx<ini.phaseIndex?T.green:idx===ini.phaseIndex?AI_GOLD:T.ink4;
          const active=activePhase===idx;
          return <button key={p2.id} onClick={()=>setActivePhase(idx)} style={{display:"flex",alignItems:"center",gap:5,background:active?c+"1c":T.s2,border:`1px solid ${active?c+"55":T.border}`,borderRadius:7,padding:"5px 9px",cursor:"pointer"}}>
            <span style={{width:14,height:14,borderRadius:"50%",background:idx<ini.phaseIndex?T.green:"transparent",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:900}}>{idx<ini.phaseIndex?"✓":""}</span>
            <span style={{fontSize:9.5,fontWeight:800,fontFamily:F.b,color:active?c:T.ink3}}>{idx+1}. {p2.name}</span>
          </button>;
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:13,fontWeight:800,color:phC,fontFamily:F.b}}>{ph.name} - {phaseDone(activePhase)}% complete</div>
            <Tag label={activePhase<ini.phaseIndex?"Complete":activePhase===ini.phaseIndex?"In progress":"Not started"} color={phC} bg={phC+"16"}/>
          </div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>{ph.objective}</p>
          <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Tasks & deliverables</div>
          <div style={{display:"grid",gap:6}}>
            {ph.deliverables.map((d,di)=>{
              const done=activePhase<ini.phaseIndex||(activePhase===ini.phaseIndex&&di<ini.phaseArtifactsDone);
              const isApproval=/approval|decision|sign-off/i.test(d);
              return <div key={d} style={{display:"flex",gap:9,alignItems:"center",background:T.s2,border:`1px solid ${done?T.green+"35":T.border}`,borderRadius:8,padding:"8px 11px"}}>
                <span style={{width:15,height:15,borderRadius:4,background:done?T.green:"transparent",border:`2px solid ${done?T.green:T.ink4}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:900,flexShrink:0}}>{done?"✓":""}</span>
                <span style={{fontSize:11,color:done?T.ink:T.ink2,fontFamily:F.b,fontWeight:done?700:500,flex:1}}>{d}</span>
                {isApproval&&<Tag label="Approval gate" color={T.amber} bg={T.amberL}/>}
                {done?<button onClick={()=>gotoAC("evidence")} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:9,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Evidence →</button>
                :<span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Pending</span>}
              </div>;
            })}
          </div>
        </div>
        <div>
          <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Responsibilities (RACI)</div>
          <div style={{display:"grid",gap:6,marginBottom:12}}>
            {[["Responsible",ph.raci.responsible,T.blue],["Accountable",ph.raci.accountable,AI_GOLD],["Consulted",ph.raci.consulted,T.violet],["Informed",ph.raci.informed,T.ink3]].map(([l,v,c])=>
              <div key={l} style={{display:"flex",justifyContent:"space-between",background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px"}}>
                <span style={{fontSize:10,color:c,fontFamily:F.b,fontWeight:800}}>{l}</span>
                <span style={{fontSize:10.5,color:T.ink,fontFamily:F.b,fontWeight:600}}>{v}</span>
              </div>)}
          </div>
          <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Inherited policies & controls</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {ini.policies.map(pl=><Tag key={pl} label={pl} color={T.violet} bg={T.violet+"12"}/>)}
            {ini.controls.map(c=><button key={c} onClick={()=>setTab&&setTab("controls")} title="Open in the control library" style={{background:T.blue+"12",border:`1px solid ${T.blue}40`,borderRadius:6,padding:"2px 8px",color:T.blue,fontSize:9,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{c}</button>)}
          </div>
          {activePhase===4&&<div style={{background:AI_GOLD+"0d",border:`1px solid ${AI_GOLD}30`,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:800,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Governance-phase assessments</div>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.55,marginBottom:7}}>The VerisZone engine cascade (AiOA → AiIA → AiRA → AiSA → AiPA → AiCA → AiGA → AiRT) runs automatically for this initiative.</div>
            <button onClick={()=>setTab&&setTab("aiia")} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"6px 11px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open the assessment cascade →</button>
          </div>}
          <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>Project risks - Risk Center register</div>
          <div style={{display:"grid",gap:6}}>
            {risks.slice(0,3).map(r=><button key={r.id} onClick={()=>setTab&&setTab("riskcenter")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:10.5,color:T.ink,fontFamily:F.b,fontWeight:600}}>{r.id} · {r.title}</span>
              <Tag label={r.level} color={lvC(r.level)} bg={lvC(r.level)+"16"}/>
            </button>)}
            {risks.length===0&&<span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>No risks registered for this project.</span>}
          </div>
        </div>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:800,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>AI recommendation for this project</div>
        <p style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.7,margin:"0 0 10px"}}>
          {ini.blockedBy
            ?`Progression to ${AC_PHASES[ini.phaseIndex+1]?.name||"the next phase"} is blocked: ${ini.blockedBy}. Resolve this artifact first - it gates ${ini.expected} of expected value. `
            :`No blockers. Complete the remaining ${AC_PHASES[ini.phaseIndex].deliverables.length-ini.phaseArtifactsDone} artifact(s) in ${AC_PHASES[ini.phaseIndex].name} to advance. `}
          {risks.find(r=>r.aiRecommendation)?risks.find(r=>r.aiRecommendation).aiRecommendation:""}
        </p>
        <button onClick={()=>gotoAC("initiatives")} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:7,padding:"7px 12px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Review initiative →</button>
      </Card>
      <Card style={{padding:16}}>
        <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Lessons from previous projects</div>
        <div style={{display:"grid",gap:7}}>
          {lessons.map(l=><div key={l.from} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px"}}>
            <div style={{fontSize:10,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:2}}>{l.from} <span style={{color:T.ink4,fontWeight:500}}>· {l.unit}</span></div>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.55}}>{l.text}</div>
          </div>)}
        </div>
      </Card>
    </div>
    </>}
  </div>;
}

export function PlaybookRunbooks({role,setTab,showToast}) {
  const [executed,setExecuted]=useState({});
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
          <button onClick={()=>{
            if(rb.hitl){setTab&&setTab("decisions");return;}
            setExecuted({...executed,[rb.id||rb.title]:true});
            pushBus("vz-gw-evidence",{item:`Runbook executed: ${rb.title}`,initiative:rb.fw||"Governance Playbook",scope:"Organization",control:"Playbook execution",risk:"Operational",owner:rb.owner||"Playbook owner",status:"Complete",approval:"Recorded",version:"v1",time:"Just now"})
            showToast&&showToast("Runbook executed - evidence recorded");
          }} style={{flex:2,background:executed[rb.id||rb.title]?T.s2:rc,color:executed[rb.id||rb.title]?T.green:"#fff",border:executed[rb.id||rb.title]?`1px solid ${T.green}40`:"none",borderRadius:8,padding:"11px",fontSize:12,fontWeight:600,fontFamily:F.b,cursor:"pointer"}}>{executed[rb.id||rb.title]?"Executed - Evidence Recorded":rb.hitl?"Approve with oversight →":"Execute Runbook"}</button>
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

/* ── Reference Architecture ───────────────────────────────────────────────
   The 7-layer enterprise AI reference architecture, standard in every
   initiative's playbook. Each layer, both governance spines and the runtime
   foundation are mapped to the VerisZone engine that actually enforces it, so
   this is a control map for the selected initiative - not a poster. */

const ARCH_LAYERS = [
  { n:"01", name:"Business Users & Triggers", tag:"Where every request begins",
    parts:["Employees","Customers","Web / App","Chat / Copilot","API events","Workflow triggers"],
    veris:"Every trigger enters through the governed gateway - there is no ungoverned path to a model. CXO cockpits and the employee/manager workspace are the attended triggers; scheduled and API events are the unattended ones.",
    maxim:"Design for the trigger, not the demo. Most enterprise AI runs unattended." },
  { n:"02", name:"Experience & Access", tag:"The front door",
    parts:["API gateway","Identity & access","Session context","Prompt / context manager"],
    veris:"Auth.js identity plus a deny-by-default capability check (agent registry) admit the caller; a scoped 90-second session token frames every call so authority cannot outlive the request.",
    maxim:"Context assembly is an engineering discipline - not a text box." },
  { n:"03", name:"Agent Orchestration", tag:"Where intent becomes a plan",
    parts:["Agent router","Planner / decomposer","Supervisor agent","Workflow engine","Memory","Human-in-the-loop gate"],
    veris:"The circuit breaker is the supervisor: it scores injection, egress, guardrail, drift and rate signals and steps normal → downscope → suspend → halt. HITL gates hold high-impact actions for a named human approver.",
    maxim:"This layer decides whether your AI is a demo or a system." },
  { n:"04", name:"Knowledge & Retrieval", tag:"Grounding in truth",
    parts:["Enterprise search","RAG pipeline","Vector store","Knowledge graph","Document store","SQL / warehouse"],
    veris:"retrieve() chunks the corpus, scores by term overlap and returns top-k grounded context; the DLP classifier tags data class on the way in, so sensitive material never reaches the prompt ungoverned.",
    maxim:"Retrieval quality beats model size for almost every use case." },
  { n:"05", name:"Model", tag:"The right model for the job",
    parts:["Model router","Foundation LLMs","Small language models","Embeddings","Reranker"],
    veris:"The gateway routes to the configured model; FinOps prices every call against the per-request token ceiling and blended rate, so a routing choice carries a cost signal, not just a capability.",
    maxim:"Routing most traffic to smaller models is the highest-ROI change most teams make." },
  { n:"06", name:"Tools & Action", tag:"Where AI stops talking and starts doing",
    parts:["Business apps","CRM / ERP","Email / calendar","Databases","Code execution","Automation / RPA","External APIs"],
    veris:"Every tool is pinned by manifest hash (MCP registry) against rug-pulls; every call is capability-checked and appended to the hash-chained tool-call ledger. Capability without control is liability.",
    maxim:"Every tool call needs a permission model." },
  { n:"07", name:"Enterprise Data & Systems", tag:"The ground truth",
    parts:["Policies","SOPs","Tickets","Documents","Data lake","Operational systems","Telemetry"],
    veris:"The canonical registers and the Evidence Fabric are this layer - policies, controls and every governed action converge here as the system of record.",
    maxim:"AI does not replace this layer. It finally makes it usable." },
];

const ARCH_GOV = {
  title:"Security, Governance & Compliance", sub:"Runs across all seven layers",
  parts:[["Guardrails","Input / output controls"],["PII protection","Masking & redaction"],["Policy enforcement","Access & usage rules"],["Audit trail","Immutable action log"]],
  veris:"policy-rules classify → evaluate → validate wraps every call; the Article 5 engine blocks prohibited practices; the hash-chained ledger is the audit trail.",
  maxim:"If governance is a gate at the end, it will be bypassed. Build it as a wrapper, not a checkpoint." };

const ARCH_OBS = {
  title:"Observability, Evaluation & Feedback", sub:"Runs across all seven layers",
  parts:[["Tracing","Follow every decision"],["Logs","Full execution record"],["Cost","Spend per outcome"],["Latency","Time to answer"],["Quality","Accuracy & usefulness"],["Feedback loop","Improve on real usage"]],
  veris:"The event bus traces every decision; the cost engine prices it; the drift monitor (PSI) and residual-risk engine grade whether it is still safe to run.",
  maxim:"Trace first, scale second. Untraceable agents become unmaintainable systems." };

const ARCH_FOUNDATION = [["Cloud / on-prem","Where it runs"],["Containers","How it ships"],["Queues","How it scales"],["Caching","How it stays fast"],["Secrets","How it stays safe"],["Monitoring","How you sleep at night"]];
const ARCH_ROUNDTRIP = ["Trigger","Access","Orchestrate","Retrieve","Reason","Act","Learn"];
const ARCH_TAKEAWAYS = [
  ["Start from the trigger","Not from the model."],
  ["Ground before you generate","Retrieval beats parameter count."],
  ["Gate every action","Capability without control is liability."],
  ["Instrument from day one","You cannot improve what you cannot trace."],
  ["Route, don't over-spend","Small models carry most of the load."],
];

export function PlaybookArchitecture({ini,selId,setSelId,role,setTab}){
  const rc=RC(role);
  const secHead=(l,c)=>({fontSize:9,fontWeight:800,color:c||T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7});
  const rail=(cfg,accent)=>
    <Card style={{padding:14,borderTop:`3px solid ${accent}`}}>
      <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.h,lineHeight:1.25}}>{cfg.title}</div>
      <div style={{fontSize:9.5,color:accent,fontFamily:F.m,fontWeight:700,marginBottom:10,marginTop:2}}>{cfg.sub}</div>
      <div style={{display:"grid",gap:6,marginBottom:10}}>
        {cfg.parts.map(([l,d])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 9px"}}>
          <div style={{fontSize:10.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{l}</div>
          <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{d}</div>
        </div>)}
      </div>
      <div style={{fontSize:9.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55,background:accent+"10",border:`1px solid ${accent}30`,borderRadius:7,padding:"8px 9px",marginBottom:8}}>
        <span style={{color:accent,fontWeight:800}}>VerisZone · </span>{cfg.veris}
      </div>
      <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,fontStyle:"italic",lineHeight:1.5,borderLeft:`3px solid ${accent}55`,paddingLeft:9}}>{cfg.maxim}</div>
    </Card>;

  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Reference Architecture" sub="Every AI initiative, system, agent or bot sits on the same seven layers - governance down the left, observability down the right, runtime underneath. Each layer maps to the VerisZone engine that enforces it for this initiative."/>

    {/* Initiative binding strip */}
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {acInitiatives.map(i=><button key={i.id} onClick={()=>setSelId&&setSelId(i.id)} style={{background:selId===i.id?AI_GOLD+"18":T.s2,border:`1px solid ${selId===i.id?AI_GOLD+"55":T.border}`,color:selId===i.id?AI_GOLD_INK:T.ink2,borderRadius:8,padding:"6px 11px",fontSize:10.5,fontWeight:700,fontFamily:F.b,cursor:"pointer"}}>{i.name}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        <div><div style={secHead("")}>System type</div><div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:700}}>{ini.category}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b}}>{ini.unit}</div></div>
        <div><div style={secHead("")}>Guardrail strength</div><div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:ini.guardrail>=80?T.green:ini.guardrail>=65?T.amber:T.red}}>{ini.guardrail}%</div></div>
        <div><div style={secHead("")}>Inherited policies</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{ini.policies.map(p=><Tag key={p} label={p} color={T.violet} bg={T.violet+"12"}/>)}</div></div>
        <div><div style={secHead("")}>Bound controls</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{ini.controls.map(c=><button key={c} onClick={()=>setTab&&setTab("controls")} style={{background:T.blue+"12",border:`1px solid ${T.blue}40`,borderRadius:6,padding:"2px 8px",color:T.blue,fontSize:9,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{c}</button>)}</div></div>
      </div>
      {ini.risks?.length>0&&<div style={{marginTop:12,fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.55}}>
        <span style={{color:T.amber,fontWeight:800}}>This system's live exposure · </span>
        {ini.risks.join(" · ")} - each is carried by a layer below and answered by the governance spine on the left. <button onClick={()=>setTab&&setTab("riskcenter")} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Trace in Risk Center →</button>
      </div>}
    </Card>

    {/* Thesis */}
    <Card style={{padding:"14px 18px",marginBottom:12,border:`1px solid ${AI_GOLD}35`,background:`linear-gradient(135deg,${AI_GOLD}0d,${T.s1})`}}>
      <div style={{fontSize:15,fontWeight:800,color:T.ink,fontFamily:F.h,lineHeight:1.3}}>Models are the easy part. Architecture is the moat.</div>
      <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:"6px 0 0"}}>One request. Seven layers. A request flows down the stack and the response flows back up, traced, priced and graded the whole way. Governance and observability are not steps at the end - they wrap every call.</p>
    </Card>

    {/* Rails + stack */}
    <div style={{display:"grid",gridTemplateColumns:"minmax(170px,220px) 1fr minmax(170px,220px)",gap:12,marginBottom:12,alignItems:"start"}}>
      <div style={{position:"sticky",top:70}}>{rail(ARCH_GOV,T.violet)}</div>
      <div style={{display:"grid",gap:8}}>
        {ARCH_LAYERS.map(L=>{const gold=AI_GOLD;return <Card key={L.n} style={{padding:14,borderLeft:`3px solid ${gold}`}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:gold+"88",lineHeight:1,flexShrink:0,minWidth:34}}>{L.n}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:9,alignItems:"baseline",flexWrap:"wrap"}}>
                <span style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.h}}>{L.name}</span>
                <span style={{fontSize:10,color:T.ink3,fontFamily:F.b,fontStyle:"italic"}}>{L.tag}</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"8px 0"}}>
                {L.parts.map(p=><span key={p} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 8px",fontSize:9.5,color:T.ink2,fontFamily:F.b,fontWeight:600}}>{p}</span>)}
              </div>
              <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55,background:gold+"0d",border:`1px solid ${gold}26`,borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                <span style={{color:AI_GOLD_INK,fontWeight:800}}>VerisZone · </span>{L.veris}
              </div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,fontStyle:"italic",lineHeight:1.5,borderLeft:`3px solid ${gold}55`,paddingLeft:9}}>{L.maxim}</div>
            </div>
          </div>
        </Card>;})}
      </div>
      <div style={{position:"sticky",top:70}}>{rail(ARCH_OBS,T.teal)}</div>
    </div>

    {/* Foundation */}
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:8,marginBottom:10}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Runtime & Infrastructure</h3>
        <span style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,fontStyle:"italic"}}>Everything above is a diagram until this layer makes it real, repeatable and affordable at scale.</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:14}}>
        {ARCH_FOUNDATION.map(([l,d])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"9px 11px"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{l}</div>
          <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{d}</div>
        </div>)}
      </div>
      <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>The round trip · request flows down, response flows back up - traced, priced, graded</div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {ARCH_ROUNDTRIP.map((s,i)=><span key={s} style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{background:T.s3,border:`1px solid ${AI_GOLD}35`,borderRadius:20,padding:"5px 12px",fontSize:10,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b}}>{s}</span>
          {i<ARCH_ROUNDTRIP.length-1&&<span style={{color:T.ink4,fontSize:12}}>→</span>}
        </span>)}
      </div>
    </Card>

    {/* Takeaways */}
    <Card style={{padding:16}}>
      <div style={{fontSize:9,fontWeight:800,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>If you remember one thing - the five rules every playbook inherits</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
        {ARCH_TAKEAWAYS.map(([t,d])=><div key={t} style={{background:T.s2,border:`1px solid ${T.border}`,borderLeft:`3px solid ${AI_GOLD}`,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t}</div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{d}</div>
        </div>)}
      </div>
    </Card>
  </div>;
}
/* Section */
