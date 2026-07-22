"use client";

import { Map, Scale } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, acEvidence, acFeedback, gatewayStats, EXEC_BRIEF, EXEC_PRIORITIES, ASSISTANT_NUDGES, riskRegister } from "@/lib/platform-models";
import { DEFAULT_FEEDBACK, feedbackDecision, decisionColorOf, T, ROLES, NAV, AI_GOLD, AI_GOLD_B, F, Tag } from "./core";

export function ExecAssistant({role,goto,showToast,isMobile,tab}){
  const [chat,setChat]=useState([]);
  const [q,setQ]=useState("");
  const [busy,setBusy]=useState(false);
  const chatTimer=useRef(null);
  useEffect(()=>()=>{if(chatTimer.current)clearTimeout(chatTimer.current);},[]);
  const pageLabel=(NAV.find(n=>n.id===tab)||{}).label||(tab==="aicentral"?"AI Central":tab==="home"?"Dashboard":"Workspace");
  const isWorkbench=tab==="workbench";
  const artifactActions=["Generate AIRA","Generate AI Impact Assessment","Generate Risk Register","Create Evidence Folder","Recommend Controls"];
  const runArtifact=a=>{try{const list=JSON.parse(localStorage.getItem("vz-gw-evidence")||"[]");list.unshift({item:`${a} (assistant-generated)`,initiative:"Employee Workspace",scope:"Project",control:"Gateway policy engine",risk:"Prompt governance",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:"Auto-captured",version:"v1",time:"Just now"});localStorage.setItem("vz-gw-evidence",JSON.stringify(list.slice(0,40)));}catch{}showToast&&showToast(`${a}: draft created and recorded in Trust & Evidence`);};
  const [open,setOpen]=useState(false);
  const R=ROLES[role]||ROLES.caio;
  const nudges=ASSISTANT_NUDGES[role]||ASSISTANT_NUDGES.caio;
  const focus=(EXEC_BRIEF[role]||EXEC_BRIEF.caio).focus;
  const priorities=EXEC_PRIORITIES[role]||EXEC_PRIORITIES.caio;
  /* Reasoned recommendation: every line traces to the initiative record,
     its feedback scores, controls and phase evidence. Nothing invented. */
  const isExec=!["employee","manager"].includes(role);
  const gate=isExec?acInitiatives.map(i=>({i,f:acFeedback[i.id]||DEFAULT_FEEDBACK,rec:feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK)})).find(x=>x.rec==="Scale"||x.rec==="Retire"):null;
  const gateChecks=gate?[
    [`Governance score ${gate.i.guardrail}% (target ≥85)`,gate.i.guardrail>=85],
    [gate.i.blockedBy?`Open blocker: ${gate.i.blockedBy}`:"No open blockers",!gate.i.blockedBy],
    [`Residual risk ${gate.i.risk}; stakeholder risk score ${gate.f.risk}/100`,gate.i.risk!=="Critical"&&gate.f.risk>=60],
    [`Adoption ${gate.i.adoption}% (threshold 70%)`,gate.i.adoption>=70],
    [`Business value score ${gate.i.valueScore}%`,gate.i.valueScore>=75],
    [`Evidence complete through ${AC_PHASES[gate.i.phaseIndex]?.name||"Opportunity"} (phase ${gate.i.phaseIndex+1}/${AC_PHASES.length})`,gate.i.phaseIndex>=8],
  ]:[];
  /* Grounded responder: answers reference the role's priorities, nudges and
     modules - never invented content. External reasoning stays out of scope. */
  const answer=text=>{
    const t=text.toLowerCase();
    const p0=priorities[0];
    if(/what is|explain|define/.test(t)){
      const topic=/iso\s*42001/.test(t)?"ISO 42001 is the international AI management system standard: it defines how an organization governs AI across lifecycle, risk, evidence and continuous improvement. Your posture against it lives in Compliance & Standards."
        :/eu ai act/.test(t)?"The EU AI Act is the European regulation classifying AI systems by risk tier. High-risk systems require conformity assessment, human oversight and technical documentation. Your affected systems are tracked in the Risk Center."
        :/nist/.test(t)?"NIST AI RMF is the US voluntary framework for AI risk: Govern, Map, Measure, Manage. Your KRIs map to it in the Risk Center."
        :null;
      if(topic)return {text:topic,src:"Hybrid",srcNote:"General knowledge + your internal posture"};
    }
    if(/risk/.test(t)){const worst=[...riskRegister].sort((a,b)=>(b.likelihood*b.impact)-(a.likelihood*a.impact))[0];return {text:`The register holds ${riskRegister.length} risks; the most severe is ${worst.id} "${worst.title}" (${worst.level}, ${worst.system}), treatment ${worst.treatment.status.toLowerCase()} with ${worst.treatment.owner}.`,link:{tab:"riskcenter"},label:"Open Risk Center",src:"Internal",srcNote:"Risk Center register"};}
    if(/approve|decision|pending/.test(t))return {text:`You have ${priorities.length} priority actions today. The most urgent: "${p0.title}", due ${p0.due.toLowerCase()}.`,link:p0.link,label:"Go to decision",src:"Internal",srcNote:"Your priority queue"};
    if(/evidence|audit/.test(t))return {text:"Evidence is captured automatically - phase artifacts, gateway decisions and your approvals all land in Trust & Evidence with an audit trail.",link:{ac:"evidence"},label:"Open Trust & Evidence",src:"Internal",srcNote:"Trust & Evidence repository"};
    if(/idea/.test(t))return {text:"Bottom-up ideas are welcome - submit one and track it from Submitted to AI Central intake.",link:{tab:"myideas"},label:"Open My AI Ideas",src:"Internal",srcNote:"Idea pipeline"};
    if(/train|learn|academy/.test(t))return {text:"Learning completion becomes governance evidence. I can open the Governance Academy with your role's path.",link:{tab:"academy"},label:"Open Academy",src:"Internal",srcNote:"Governance Academy records"};
    if(/help|what can|who are/.test(t))return {text:`I am Veris Intelligence, your Executive Advisor. I watch your priorities, decisions, risks and evidence across VerisZone and reason over internal knowledge first - external models are used for reasoning only, never trained on your data.`,src:"Internal",srcNote:"Platform knowledge"};
    return {text:`${nudges[0]} Your top priority right now is "${p0.title}" - want me to open it?`,link:p0.link,label:"Open top priority",src:"Internal",srcNote:"Your priorities and nudges"};
  };
  const ask=()=>{
    const t=q.trim();
    if(!t||busy)return;
    setChat(c=>[...c.slice(-5),{from:"user",text:t}]);
    setQ("");setBusy(true);
    chatTimer.current=setTimeout(()=>{
      setChat(c=>[...c.slice(-5),{from:"ai",...answer(t)}]);
      setBusy(false);
    },700);
  };
  return <>
    {!open&&<button onClick={()=>setOpen(true)} title="AI Executive Assistant" style={{position:"fixed",bottom:22,right:22,zIndex:9000,display:"flex",alignItems:"center",gap:9,background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:`1px solid ${AI_GOLD_B}`,borderRadius:999,padding:isMobile?"10px 14px":"12px 18px",fontSize:12,fontWeight:900,fontFamily:F.b,boxShadow:`0 16px 40px ${AI_GOLD}44`,cursor:"pointer"}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:"#111",boxShadow:"0 0 0 3px rgba(17,17,17,.18)",animation:"pulse 2s infinite"}}/>
      Veris Intelligence
    </button>}
    {open&&<div style={{position:"fixed",bottom:22,right:22,zIndex:9000,width:isMobile?"calc(100vw - 32px)":360,maxHeight:"78vh",display:"flex",flexDirection:"column",background:T.card,border:`1px solid ${AI_GOLD}45`,borderRadius:16,boxShadow:"0 30px 80px rgba(0,0,0,.5)",overflow:"hidden",animation:"up .25s ease"}}>
      <div style={{padding:"13px 15px",borderBottom:`1px solid ${T.border}`,background:`linear-gradient(135deg,${T.s2},${T.s1})`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:13,fontWeight:900,color:"#111",fontFamily:F.h}}>AI</span></div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:900,color:T.ink,fontFamily:F.h}}>Veris Intelligence</div><div style={{fontSize:9,color:AI_GOLD,fontFamily:F.m,fontWeight:800}}>Executive Advisor · {R.label} · {pageLabel}</div></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.ink3,cursor:"pointer",padding:4,display:"flex"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></button>
      </div>
      <div style={{padding:"13px 15px",overflowY:"auto",display:"grid",gap:12}}>
        <div>
          <div style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.m,marginBottom:8}}>What needs your attention</div>
          <div style={{display:"grid",gap:7}}>
            {nudges.map((n,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:AI_GOLD,marginTop:5,flexShrink:0}}/>
              <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{n}</span>
            </div>)}
          </div>
        </div>
        {gate&&<div>
          <div style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.m,marginBottom:8}}>Reasoned recommendation</div>
          <div style={{background:T.s2,border:`1px solid ${decisionColorOf(gate.rec,T)}40`,borderRadius:10,padding:"11px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:900,color:T.ink,fontFamily:F.b}}>{gate.i.name}</span>
              <Tag label={`Recommend: ${gate.rec}`} color={decisionColorOf(gate.rec,T)} bg={decisionColorOf(gate.rec,T)+"16"}/>
            </div>
            <div style={{display:"grid",gap:4,marginBottom:9}}>
              {gateChecks.map(([txt,ok],i)=><div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                <span style={{fontSize:10,fontWeight:900,color:ok?T.green:T.red,fontFamily:F.m,flexShrink:0}}>{ok?"✓":"✗"}</span>
                <span style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.45}}>{txt}</span>
              </div>)}
            </div>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,lineHeight:1.5,marginBottom:8}}>Sources: feedback engine scores · controls {gate.i.controls.join(", ")||"none"} · policies {gate.i.policies.join(", ")||"none"} · phase artifact evidence. Value at stake: {gate.i.expected} expected.</div>
            <button onClick={()=>{goto({ac:"initiatives"});setOpen(false);}} style={{width:"100%",background:decisionColorOf(gate.rec,T)+"14",border:`1px solid ${decisionColorOf(gate.rec,T)}45`,borderRadius:7,padding:"7px 10px",color:decisionColorOf(gate.rec,T),fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Record {gate.rec} decision in AI Central →</button>
          </div>
        </div>}
        {isWorkbench&&<div>
          <div style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.m,marginBottom:8}}>I noticed you are working on an AI artifact</div>
          <div style={{display:"grid",gap:6}}>
            {artifactActions.map(a=><button key={a} onClick={()=>runArtifact(a)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${AI_GOLD}30`,borderRadius:8,padding:"8px 11px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:10,color:T.ink,fontFamily:F.b,fontWeight:700}}>{a}</span>
              <span style={{fontSize:11,color:AI_GOLD,fontWeight:900,flexShrink:0}}>+</span>
            </button>)}
          </div>
        </div>}
        <div>
          <div style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.m,marginBottom:8}}>Do it now</div>
          <div style={{display:"grid",gap:6}}>
            {priorities.slice(0,3).map((p,i)=><button key={i} onClick={()=>{goto(p.link);setOpen(false);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:10,color:T.ink,fontFamily:F.b,fontWeight:700,minWidth:0}}>{p.title}</span>
              <span style={{fontSize:11,color:AI_GOLD,fontWeight:900,flexShrink:0}}>→</span>
            </button>)}
          </div>
        </div>
        {chat.length>0&&<div>
          <div style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.m,marginBottom:8}}>Conversation</div>
          <div style={{display:"grid",gap:6}}>
            {chat.map((m,i)=><div key={i} style={{justifySelf:m.from==="user"?"end":"start",maxWidth:"92%"}}>
              <div style={{background:m.from==="user"?AI_GOLD+"14":T.s2,border:`1px solid ${m.from==="user"?AI_GOLD+"30":T.border}`,borderRadius:10,padding:"8px 11px"}}>
                <div style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{m.text}</div>
                {m.from!=="user"&&m.src&&<div style={{marginTop:5,display:"inline-flex",alignItems:"center",gap:5}} title={m.srcNote||""}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:m.src==="Internal"?T.green:m.src==="External"?T.blue:T.amber}}/>
                  <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:m.src==="Internal"?T.green:m.src==="External"?T.blue:T.amber,textTransform:"uppercase",letterSpacing:"0.06em"}}>Source: {m.src}</span>
                  {m.srcNote&&<span style={{fontSize:8.5,color:T.ink4,fontFamily:F.b}}>· {m.srcNote}</span>}
                </div>}
                {m.link&&<button onClick={()=>{goto(m.link);setOpen(false);}} style={{marginTop:6,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:6,padding:"4px 9px",color:AI_GOLD,fontSize:9,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{m.label||"Open"} →</button>}
              </div>
            </div>)}
            {busy&&<div style={{justifySelf:"start"}}><div style={{background:T.s2,border:`1px solid ${AI_GOLD}30`,borderRadius:10,padding:"8px 11px",display:"inline-flex",gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:AI_GOLD,animation:`pulse 1.1s ease-in-out ${i*0.18}s infinite`}}/>)}</div></div>}
          </div>
        </div>}
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,lineHeight:1.6,paddingTop:4,borderTop:`1px solid ${T.border}`}}>
          Reasoning order: Internal SLM (policies, playbooks, evidence) → Enterprise Knowledge Graph → external LLM for reasoning only. Confidential knowledge never leaves the enterprise boundary.
        </div>
      </div>
      <div style={{padding:"10px 13px",borderTop:`1px solid ${T.border}`,display:"flex",gap:7,background:T.s1}}>
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask your Executive Advisor..." style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:11,fontFamily:F.b,outline:"none"}}/>
        <button onClick={ask} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,border:`1px solid ${AI_GOLD_B}`,borderRadius:8,padding:"9px 13px",color:"#111",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Ask</button>
      </div>
    </div>}
  </>;
}

/* ── Executive Workspace 4.0 increment 2: derived views ───────────
   Every value below is derived from the canonical business objects
   (acInitiatives, acFeedback, acEvidence, gatewayStats,
   AC_FRAMEWORK_POSTURE). No parallel data stores. */

