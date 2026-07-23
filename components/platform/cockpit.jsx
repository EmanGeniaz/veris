"use client";

import { useState } from "react";
import { acInitiatives, acFeedback, riskRegister, EXEC_DECISIONS, EXEC_RECENT_CHANGES, EXEC_BRIEF } from "@/lib/platform-models";
import { pushBus } from "@/lib/bus";
import { T, F, AI_GOLD, ROLES, Card, Tag, feedbackDecision, DEFAULT_FEEDBACK } from "./core";

/* ── CEO Executive Cockpit ─────────────────────────────────────────
   Answers exactly four questions: what is happening, what needs my
   attention, what decision do I make, where do I go next. Every click
   lands on the module that owns the metric. One viewport, no scroll-
   report. */
/* The one executive dashboard. Layout never changes between roles -
   only the data does. Composed from the canonical components:
   ExecutiveBrief, DecisionPanel, EnterpriseSnapshot, AttentionRequired,
   RecentActivity, Veris Intelligence narrative. */
export function ExecutiveCockpit({role="ceo",setTab,setAiCentralView,showToast}){
  const [decided,setDecided]=useState({});
  const goAC=v=>{setAiCentralView&&setAiCentralView(v);setTab("aicentral");};
  const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
  const expected=acInitiatives.reduce((a,i)=>a+money(i.expected),0);
  const realized=acInitiatives.reduce((a,i)=>a+money(i.actual),0);
  const health=Math.round(acInitiatives.reduce((a,i)=>a+(i.guardrail+i.adoption+i.valueScore)/3,0)/acInitiatives.length);
  const risksOpen=riskRegister.filter(r=>r.status!=="Closed").length;
  const critHigh=riskRegister.filter(r=>r.level==="Critical"||r.level==="High").length;
  const gates=acInitiatives.filter(i=>["Scale","Retire"].includes(feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK)));
  const roleDecisions=EXEC_DECISIONS[role]||EXEC_DECISIONS.ceo||[];
  const decisions=roleDecisions.length+gates.length;
  const compliance=84;
  const maturity=78;
  const blocked=acInitiatives.find(i=>i.blockedBy);
  const scaleReady=gates.filter(i=>feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK)==="Scale");
  const roleBrief=EXEC_BRIEF[role]||EXEC_BRIEF.ceo;
  const narrative=[
    roleBrief.headline,
    `Enterprise AI maturity is ${maturity}/100 with $${realized.toFixed(1)}M of $${expected.toFixed(1)}M value realized.`,
    scaleReady.length?`${scaleReady.length} initiative${scaleReady.length>1?"s are":" is"} ready to scale.`:null,
    `${decisions} decision${decisions===1?"":"s"} are waiting on you.`,
    blocked?`${blocked.name} is blocked: ${blocked.blockedBy}.`:null,
    `Approving today's recommendations unlocks an estimated $${(expected-realized).toFixed(1)}M in enterprise value.`,
  ].filter(Boolean).slice(0,5);
  const hero=[
    ["Portfolio value",`$${realized.toFixed(1)}M`,AI_GOLD,()=>setTab("reports"),"Value reporting lives in Reports"],
    ["Enterprise health",`${health}`,health>=75?T.green:T.amber,()=>goAC("portfolio"),"Execution health lives in AI Central"],
    ["Decisions waiting",decisions,T.blue,()=>setTab("decisions"),"Open the Decision Center"],
    ["Active risks",risksOpen,critHigh?T.red:T.green,()=>setTab("riskcenter"),"Every risk lives in the Risk Center"],
    ["Compliance confidence",`${compliance}%`,T.green,()=>setTab("compliance"),"Controls live in Compliance & Standards"],
  ];
  const snapshot=[
    ["Enterprise AI value",`$${expected.toFixed(1)}M`,"expected",AI_GOLD,()=>setTab("reports")],
    ["Portfolio health",`${health}/100`,"execution",T.green,()=>goAC("portfolio")],
    ["AI maturity",`${maturity}/100`,"capability",T.blue,()=>setTab("academy")],
    ["Compliance confidence",`${compliance}%`,"all frameworks",T.teal,()=>setTab("compliance")],
    ["Enterprise risk",`${critHigh} high+`,"of "+risksOpen+" open",T.red,()=>setTab("riskcenter")],
    ["Active programs",acInitiatives.length,"in lifecycle",T.violet,()=>goAC("initiatives")],
  ];
  const blockedIni=acInitiatives.filter(i=>i.blockedBy).sort((a,b)=>(b.risk==="Critical")-(a.risk==="Critical"))[0];
  const lowAdopt=[...acInitiatives].sort((a,b)=>a.adoption-b.adoption)[0];
  const attention=[
    blockedIni&&{name:blockedIni.name,note:"Blocked: "+blockedIni.blockedBy.slice(0,32),c:T.red,go:()=>goAC("initiatives")},
    scaleReady[0]&&{name:scaleReady[0].name,note:"Ready to scale",c:T.green,go:()=>goAC("initiatives")},
    lowAdopt&&{name:lowAdopt.name,note:`Low adoption - ${lowAdopt.adoption}%`,c:T.amber,go:()=>goAC("initiatives")},
  ].filter(Boolean).slice(0,3);
  const activity=[
    ...(EXEC_RECENT_CHANGES[role]||EXEC_RECENT_CHANGES.ceo||[]),
    {what:"CISO submitted prompt-injection evidence pack",initiative:"Customer Resolution Copilot",when:"2 days ago",kind:"evidence"},
    {what:"Q2 board report generated",initiative:"Portfolio",when:"3 days ago",kind:"decision"},
  ].slice(0,5);
  const actKind={evidence:["Compliance",()=>setTab("compliance")],decision:["Decisions",()=>setTab("decisions")],risk:["Risk Center",()=>setTab("riskcenter")],deployment:["AI Central",()=>goAC("initiatives")],learning:["Academy",()=>setTab("academy")]};
  const decideCard=(d,idx)=>{
    d={id:d.id||"exec-"+idx,...d};
    const st=decided[idx];
    const record=(verdict)=>{
      setDecided(prev=>({...prev,[idx]:verdict}));
      pushBus("vz-gw-evidence",{item:`CEO decision: ${verdict} - ${d.title}`,initiative:d.title,scope:"Enterprise",control:"Executive decision record",risk:d.risk,owner:(ROLES[role]||ROLES.ceo).label,status:"Complete",approval:verdict,version:"v1",time:"Just now"});
      showToast&&showToast(`Decision recorded: ${verdict} - audit evidence minted`);
    };
    return <Card key={d.id} style={{padding:"16px 18px",border:`1px solid ${st?T.green+"45":AI_GOLD+"35"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,lineHeight:1.35}}>{d.title}</div>
        <Tag label={d.time||d.risk+" risk"} color={T.amber} bg={T.amberL}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:11}}>
        {[["Business impact",d.impact||d.reasoning||d.context],["AI recommendation",d.aiRec||d.action],["Supporting evidence",(d.evidence||d.clause||"Decision record")+(d.conf?" · confidence "+d.conf+"%":"")],["Owner",d.owner||"CAIO Office"]].map(([l,v])=>
          <div key={l}><div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{l}</div><div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{v}</div></div>)}
      </div>
      {st?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b}}>✓ {st} recorded - evidence minted to the audit trail</div>
      :<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>record("Approved")} style={{background:T.green,border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Approve</button>
        <button onClick={()=>record("Rejected")} style={{background:T.red+"18",border:`1px solid ${T.red}45`,borderRadius:8,padding:"8px 16px",color:T.red,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Reject</button>
        <button onClick={()=>{setTab("aicentral");setAiCentralView&&setAiCentralView("initiatives");}} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 16px",color:T.ink2,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Request more information</button>
        <button onClick={()=>{setTab("decisions");}} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 16px",color:T.ink2,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Escalate</button>
      </div>}
    </Card>;
  };
  const hour=new Date().getHours();
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  return <div style={{animation:"up .3s ease",display:"grid",gap:16}}>
    <Card style={{padding:"22px 24px",border:`1px solid ${AI_GOLD}30`,background:`linear-gradient(130deg,${T.s2},${T.s1})`}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:18,flexWrap:"wrap",alignItems:"flex-start"}}>
        <div style={{minWidth:260}}>
          <h1 style={{fontFamily:F.e,fontSize:30,fontWeight:400,color:T.ink,margin:0}}>{greet}, {(ROLES[role]||ROLES.ceo).name.split(" ")[0]}</h1>
          <div style={{fontSize:12,color:health>=75?T.green:T.amber,fontFamily:F.b,fontWeight:800,marginTop:5}}>Enterprise AI is {health>=75?"healthy":"holding - two items need you"}.</div>
        </div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
          {hero.map(([l,v,c,go,hint])=><button key={l} onClick={go} title={hint} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 15px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{l}</div>
            <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          </button>)}
        </div>
      </div>
      <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:AI_GOLD,boxShadow:`0 0 10px ${AI_GOLD}`,marginTop:5,flexShrink:0,animation:"pulse 2.4s infinite"}}/>
        <div style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.7,maxWidth:980}}>
          <strong style={{color:AI_GOLD,fontSize:9.5,fontFamily:F.m,letterSpacing:"0.1em"}}>VERIS INTELLIGENCE · </strong>
          {narrative.join(" ")}
        </div>
      </div>
    </Card>
    {/* Reading order follows the executive constitution:
        Brief (above) → Snapshot → Attention → Pending decisions → Activity. */}
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.5fr)",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gap:12}}>
        <div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em"}}>Enterprise snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {snapshot.map(([l,v,sub,c,go])=><button key={l} onClick={go} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 13px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{l}</div>
            <div style={{fontSize:17,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.b,marginTop:2}}>{sub}</div>
          </button>)}
        </div>
        <div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginTop:2}}>Attention required</div>
        <div style={{display:"grid",gap:8}}>
          {attention.map(a=><button key={a.name} onClick={a.go} style={{display:"flex",alignItems:"center",gap:10,background:a.c+"0d",border:`1px solid ${a.c}40`,borderRadius:10,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:a.c,flexShrink:0,boxShadow:`0 0 8px ${a.c}66`}}/>
            <span style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b,flex:1}}>{a.name}</span>
            <span style={{fontSize:9.5,color:a.c,fontFamily:F.m,fontWeight:800}}>{a.note}</span>
          </button>)}
        </div>
        <div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginTop:2}}>Recent executive activity</div>
        <Card style={{padding:"6px 14px"}}>
          {activity.map((r,i)=>{
            const [dest,go]=actKind[r.kind]||actKind.decision;
            return <button key={i} onClick={go} style={{display:"flex",gap:10,alignItems:"center",width:"100%",padding:"8px 0",borderBottom:i<activity.length-1?`1px solid ${T.border}`:"none",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:T.ink4,flexShrink:0}}/>
              <span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,flex:1,lineHeight:1.4}}>{r.what}</span>
              <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,whiteSpace:"nowrap"}}>{r.when} · {dest} →</span>
            </button>;
          })}
        </Card>
      </div>
      <div style={{display:"grid",gap:12}}>
        <div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em"}}>Pending decisions</div>
        {roleDecisions.map(decideCard)}
        {gates.map((i,gi)=>{
          const rec=feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK);
          return decideCard({id:"gate-"+i.id,title:`${rec} ${i.name}`,risk:i.risk,conf:82,time:"Gate open",clause:`Lifecycle evidence through phase ${i.phaseIndex+1}`,reasoning:`${i.actual} realized of ${i.expected} expected · adoption ${i.adoption}%`,action:`Feedback engine recommends ${rec}`,owner:i.sponsor},"g"+gi);
        })}
        
      </div>
    </div>
  </div>;
}

