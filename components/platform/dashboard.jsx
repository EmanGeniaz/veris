"use client";

import { readBus, pushBus } from "@/lib/bus";
import { ExecutiveCockpit } from "./cockpit";
import { Map, Scale, Target, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, acEvidence, acFeedback, gatewayStats, EXEC_BRIEF, EXEC_PRIORITIES, EXEC_DECISIONS, EXEC_RECOMMENDATIONS, KPI_INSIGHTS, riskRegister, EXEC_QUICK_ACTIONS, EXEC_RECENT_CHANGES } from "@/lib/platform-models";
import { DEFAULT_FEEDBACK, feedbackDecision, decisionColorOf, T, RC, RCL, ROLES, AI_GOLD, AI_ROLLOUT_PROGRAMS, AI_SPINE_SIGNALS, HITL, KPI, ROLE_KPIS, DOMAIN_METRICS, STANDARDS_MAP, ONBOARD, ROADMAP, PILLARS, F, CountUp, Tag, PTag, Spinner, Bar, Ring, Card, SHead, priColor, execHealthOf, execMoney, execInitiativesFor, KpiInsightPanel } from "./core";

export function ExecBrief({role,goAC,goto}){
  const b=EXEC_BRIEF[role]||EXEC_BRIEF.caio;
  /* Every number drills to the surface that owns it. */
  const drillFor=label=>{
    const l=label.toLowerCase();
    if(/risk|blocked|incident|vuln|leak/.test(l))return {link:{tab:"riskcenter"},hint:"Open Risk Center"};
    if(/maturity|readiness|training|learning|adoption|resistance/.test(l))return {link:{tab:"academy"},hint:"Open Governance Academy"};
    if(/value|roi|revenue|saving|spend|budget|cost|payback/.test(l))return {link:{ac:"portfolio"},hint:"Open portfolio value in AI Central"};
    if(/pilot|scale|initiative|decision|hitl|approval|retire/.test(l))return {link:{ac:"initiatives"},hint:"Open initiatives in AI Central"};
    return {link:{ac:"dashboard"},hint:"Open AI Central"};
  };
  const open=link=>{
    if(goto)return goto(link);
    if(link.ac&&goAC)return goAC(link.ac);
  };
  return <Card style={{padding:16,marginBottom:12,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${AI_GOLD}30`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:AI_GOLD,boxShadow:`0 0 12px ${AI_GOLD}`,animation:"pulse 2.4s infinite"}}/>
        <span style={{fontSize:9,fontWeight:900,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.16em",fontFamily:F.m}}>Executive AI Brief</span>
      </div>
      <Tag label={b.focus} color={AI_GOLD} bg={AI_GOLD+"16"}/>
    </div>
    <h2 style={{fontFamily:F.h,fontSize:18,fontWeight:900,color:T.ink,margin:"0 0 8px",lineHeight:1.3}}>{b.headline}</h2>
    <p style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.75,margin:"0 0 14px",maxWidth:900}}>{b.body}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
      {b.deltas.map(([label,dir,val])=>{const c=dir==="up"?T.green:dir==="down"?T.amber:T.ink3;const d=drillFor(label);return <button key={label} onClick={()=>open(d.link)} title={d.hint} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",cursor:"pointer",textAlign:"left",transition:"border-color .15s"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=AI_GOLD+"55"} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{label}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:T.ink}}><CountUp value={val}/></span><span style={{fontSize:10,fontFamily:F.m,color:c}}>{dir==="up"?"▲":dir==="down"?"▼":"–"}</span></span><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>→</span></div>
      </button>;})}
    </div>
  </Card>;
}

export function ExecPriorities({role,goto}){
  const items=EXEC_PRIORITIES[role]||EXEC_PRIORITIES.caio;
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>My Priorities Today</h3>
      <Tag label={`${items.length} to action`} color={AI_GOLD} bg={AI_GOLD+"16"}/>
    </div>
    <div style={{display:"grid",gap:8}}>
      {items.map((p,i)=><button key={i} onClick={()=>goto(p.link)} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",textAlign:"left",cursor:"pointer",transition:"border-color .15s"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=priColor(p.priority,T)+"66"} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        <div style={{width:34,height:34,borderRadius:9,background:priColor(p.priority,T)+"18",border:`1px solid ${priColor(p.priority,T)}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,fontFamily:F.m,color:priColor(p.priority,T)}}>{i+1}</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{p.title}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:9,color:T.ink3,fontFamily:F.b}}>
            <span>Owner: {p.owner}</span><span>Impact: {p.impact}</span><span style={{color:AI_GOLD}}>AI: {p.benefit}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <Tag label={p.priority} color={priColor(p.priority,T)} bg={priColor(p.priority,T)+"16"}/>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{p.due}</span>
        </div>
      </button>)}
    </div>
  </Card>;
}

export function ExecDecisionCenter({role,goto,showToast}){
  const items=EXEC_DECISIONS[role]||EXEC_DECISIONS.caio;
  const [done,setDone]=useState({});
  const act=(i,label,d)=>{
    setDone({...done,[i]:label});
    pushBus("vz-gw-evidence",{item:`Executive decision: ${d.title} - ${label}`,initiative:d.title,scope:"Organization",control:"Decision Center",risk:d.risk+" risk decision",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"})
    showToast&&showToast(`${label} recorded - audit evidence generated`);
  };
  const rColor=r=>r==="High"?T.red:r==="Medium"?T.amber:T.green;
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Decision Center</h3>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Every decision auto-generates evidence</span>
    </div>
    <div style={{display:"grid",gap:10}}>
      {items.map((d,i)=>{const decided=done[i];return <div key={i} style={{background:T.s2,border:`1px solid ${decided?T.green+"40":T.border}`,borderRadius:10,padding:"13px 14px",opacity:decided?.85:1,transition:"all .25s"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8,flexWrap:"wrap"}}>
          <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{d.title}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{d.context}</div></div>
          <div style={{display:"flex",gap:6,flexShrink:0}}><Tag label={`Risk: ${d.risk}`} color={rColor(d.risk)} bg={rColor(d.risk)+"16"}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:11}}>
          {[["Impact",d.impact],["AI recommendation",d.aiRec],["Supporting evidence",d.evidence]].map(([l,v])=><div key={l} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 10px"}}>
            <div style={{fontSize:8,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{l}</div>
            <div style={{fontSize:10,color:l==="AI recommendation"?AI_GOLD:T.ink2,fontFamily:F.b,fontWeight:l==="AI recommendation"?800:500}}>{v}</div>
          </div>)}
        </div>
        {decided?<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <Tag label={decided} color={T.green} bg={T.greenL}/>
          <span style={{display:"inline-flex",alignItems:"center",gap:6,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}45`,borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,color:AI_GOLD,animation:"up .45s ease",boxShadow:`0 0 18px ${AI_GOLD}30`}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:AI_GOLD,animation:"pulse 2s infinite"}}/>Evidence record created → Trust &amp; Evidence
          </span>
          <button onClick={()=>goto(d.link)} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>View in AI Central →</button>
        </div>
        :<div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {[["Approve",T.green],["Reject",T.red],["Request changes",T.amber],["Escalate",T.violet]].map(([label,c])=><button key={label} onClick={()=>act(i,label,d)} style={{background:c+"14",border:`1px solid ${c}40`,borderRadius:7,padding:"7px 12px",color:c,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{label}</button>)}
          <button onClick={()=>goto(d.link)} style={{marginLeft:"auto",background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 12px",color:T.ink3,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open evidence →</button>
        </div>}
      </div>;})}
    </div>
  </Card>;
}

export function ExecRecommendations({role,goto}){
  const items=EXEC_RECOMMENDATIONS[role]||EXEC_RECOMMENDATIONS.caio;
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>AI Recommendations</h3>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Proactive - ranked by impact</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
      {items.map((r,i)=><button key={i} onClick={()=>goto(r.link)} style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:14,cursor:"pointer",transition:"border-color .15s"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=AI_GOLD+"55"} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        <div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:10,lineHeight:1.35,minHeight:32}}>{r.action}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:8}}>
          <span style={{fontSize:22,fontWeight:900,fontFamily:F.h,color:AI_GOLD}}>{r.value}</span>
          <span style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.06em"}}>{r.metric}</span>
        </div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5,marginBottom:9}}>{r.rationale}</div>
        <span style={{fontSize:10,color:AI_GOLD,fontWeight:900,fontFamily:F.b}}>Act in AI Central →</span>
      </button>)}
    </div>
  </Card>;
}

export function ExecMyInitiatives({role,goAC}){
  const mine=execInitiativesFor(role);
  return <Card style={{marginBottom:12,overflow:"hidden"}}>
    <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,margin:0}}>My Initiatives</h3>
      <button onClick={()=>goAC("initiatives")} style={{fontSize:9,color:AI_GOLD,background:"none",border:"none",fontFamily:F.b,fontWeight:600,cursor:"pointer"}}>Open portfolio in AI Central</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.3fr 90px 110px 70px 70px 110px 120px",padding:"7px 14px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
      {["Initiative","Health","Phase","ROI","Risk","Value / Budget","Next milestone"].map(h=><span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>)}
    </div>
    {mine.map((i,idx)=>{
      const health=execHealthOf(i);
      const hc=health>=75?T.green:health>=60?T.amber:T.red;
      const nextPhase=AC_PHASES[i.phaseIndex+1];
      return <div key={i.id} onClick={()=>goAC("initiatives")} style={{display:"grid",gridTemplateColumns:"1.3fr 90px 110px 70px 70px 110px 120px",padding:"10px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:idx%2===0?T.s1:T.bg,cursor:"pointer"}}>
        <div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{i.unit} · {i.businessOwner}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><Ring score={health} color={hc} size={28}/><span style={{fontSize:10,fontFamily:F.m,color:hc,fontWeight:800}}>{health}</span></div>
        <div><div style={{fontSize:10,color:T.ink2,fontFamily:F.b,fontWeight:700}}>{AC_PHASES[i.phaseIndex]?.name}</div><div style={{fontSize:8,color:T.ink4,fontFamily:F.m}}>{i.phaseIndex+1}/{AC_PHASES.length}</div></div>
        <span style={{fontSize:10,color:T.green,fontFamily:F.m,fontWeight:700}}>{i.roi}</span>
        <PTag p={i.risk}/>
        <span style={{fontSize:10,color:T.ink2,fontFamily:F.m}}>{i.actual} / {i.expected}</span>
        <div style={{fontSize:9,color:i.blockedBy?T.amber:T.ink3,fontFamily:F.b,lineHeight:1.4}}>{i.blockedBy?"Clear blocker first":nextPhase?`Enter ${nextPhase.name}`:"Scale decision"}</div>
      </div>;
    })}
  </Card>;
}

export function ExecRiskCenter({role,goAC}){
  const mine=execInitiativesFor(role);
  const rows=mine.flatMap(i=>i.risks.map(r=>({risk:r,i})));
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Enterprise Risk Center</h3>
      <button onClick={()=>goAC("governance")} style={{fontSize:9,color:AI_GOLD,background:"none",border:"none",fontFamily:F.b,fontWeight:600,cursor:"pointer"}}>Open risk register in AI Central</button>
    </div>
    <div style={{display:"grid",gap:8}}>
      {rows.map(({risk,i},idx)=>{
        const sev=i.risk;
        const sc=sev==="Critical"?T.red:sev==="High"?T.amber:T.blue;
        const predictive=Math.max(5,100-execHealthOf(i));
        const f=acFeedback[i.id];
        const aiRec=f&&f.risk<40?"Contain and remediate before any expansion":i.blockedBy?"Close the open evidence blocker":"Monitor within appetite";
        return <div key={idx} onClick={()=>goAC("governance")} style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",cursor:"pointer"}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{risk}</div>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{i.name} · {i.category} · Owner: {i.businessOwner}</div>
          </div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>Exposure: <strong style={{color:T.ink2}}>{i.expected}</strong><br/>Mitigation: <strong style={{color:i.guardrail>=80?T.green:T.amber}}>{i.guardrail}% controls</strong> ({i.controls[0]||"unassigned"})</div>
          <div style={{fontSize:10,color:AI_GOLD,fontFamily:F.b,lineHeight:1.5}}>AI: {aiRec}</div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            <PTag p={sev}/>
            <span style={{fontSize:9,color:predictive>=40?T.red:T.ink3,fontFamily:F.m}}>Predictive {predictive}</span>
          </div>
        </div>;
      })}
    </div>
  </Card>;
}

export function ExecValueCenter({role,goAC}){
  const mine=execInitiativesFor(role);
  const sum=k=>mine.reduce((s,i)=>s+execMoney(i[k]),0);
  const expected=sum("expected"),actual=sum("actual");
  const savings=sum("savings"),revenue=sum("revenue");
  const roiVals=mine.map(i=>execMoney(i.roi)).filter(Boolean);
  const roi=roiVals.length?Math.round(roiVals.reduce((a,b)=>a+b,0)/roiVals.length):0;
  const prodVals=mine.map(i=>execMoney(i.productivity)).filter(Boolean);
  const prod=prodVals.length?Math.round(prodVals.reduce((a,b)=>a+b,0)/prodVals.length):0;
  const target=expected?Math.round((actual/expected)*100):0;
  const tiles=[
    ["Value realized",`$${actual.toFixed(1)}M`,`of $${expected.toFixed(1)}M expected`,AI_GOLD],
    ["Cost savings",`$${savings.toFixed(1)}M`,"Across portfolio",T.green],
    ["Revenue impact",`$${revenue.toFixed(1)}M`,"Attributed to AI",T.teal],
    ["Portfolio ROI",`${roi}%`,"Average across initiatives",T.green],
    ["Productivity gain",`${prod}%`,"Average uplift",T.blue],
    ["Gateway cost avoidance",gatewayStats.costMtd,"Governed spend MTD",T.violet],
  ];
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Value Center</h3>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Target achievement</span>
        <Ring score={target} color={target>=60?T.green:T.amber} size={34}/>
        <span style={{fontSize:11,fontFamily:F.m,fontWeight:800,color:target>=60?T.green:T.amber}}>{target}%</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:12}}>
      {tiles.map(([l,v,sub,c])=><div key={l} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:7}}>{l}</div>
        <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c,marginBottom:2}}>{v}</div>
        <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{sub}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gap:7}}>
      {mine.map(i=><button key={i.id} onClick={()=>goAC("initiatives")} style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",gap:12,alignItems:"center",background:"transparent",border:"none",padding:0,cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:700}}>{i.name}</span>
        <Bar value={i.valueScore} color={i.valueScore>80?T.green:T.amber}/>
        <span style={{fontSize:10,color:T.ink3,fontFamily:F.m,textAlign:"right"}}>{i.actual} / {i.expected}</span>
      </button>)}
    </div>
  </Card>;
}

export function ExecGovernanceHealth({role,goAC,goto}){
  const mine=execInitiativesFor(role);
  const evTotal=acEvidence.length;
  const evComplete=acEvidence.filter(e=>e.status==="Complete").length;
  const evPct=Math.round((evComplete/evTotal)*100);
  const controlCoverage=Math.round(mine.reduce((s,i)=>s+i.guardrail,0)/mine.length);
  const auditReady=Math.round((evPct+controlCoverage)/2);
  const stats=[
    ["Control coverage",controlCoverage+"%",controlCoverage>=80?T.green:T.amber,{ac:"governance"}],
    ["Evidence completeness",evPct+"%",evPct>=70?T.green:T.amber,{ac:"evidence"}],
    ["Audit readiness",auditReady+"%",auditReady>=75?T.green:T.amber,{ac:"evidence"}],
    ["Active exceptions","4",T.amber,{tab:"hitl"}],
  ];
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Governance Health</h3>
      <button onClick={()=>goAC("governance")} style={{fontSize:9,color:AI_GOLD,background:"none",border:"none",fontFamily:F.b,fontWeight:600,cursor:"pointer"}}>Open AI Governance</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:13}}>
      {stats.map(([l,v,c,link])=><button key={l} onClick={()=>goto(link)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",textAlign:"left",cursor:"pointer"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:7}}>{l}</div>
        <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
      </button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
      {AC_FRAMEWORK_POSTURE.map(f=><button key={f.id} onClick={()=>goAC("governance")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",textAlign:"left",cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:10,fontWeight:800,color:T.ink2,fontFamily:F.b}}>{f.name}</span>
          <span style={{fontSize:10,fontFamily:F.m,fontWeight:800,color:f.score>=75?T.green:f.score>=70?T.amber:T.red}}>{f.score}%</span>
        </div>
        <Bar value={f.score} color={f.score>=75?T.green:f.score>=70?T.amber:T.red}/>
      </button>)}
    </div>
  </Card>;
}


/* Expandable insight panel for KPIs and domain metrics. Authored insight
   from KPI_INSIGHTS when available; otherwise an honest derived summary. */
export function ExecSection({title,hint,defaultOpen=false,children}){
  const [open,setOpen]=useState(defaultOpen);
  return <div style={{marginBottom:12}}>
    <button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:T.s2,border:`1px solid ${T.border}`,borderRadius:open?"10px 10px 0 0":10,padding:"11px 14px",cursor:"pointer",textAlign:"left"}}>
      <span style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.h}}>{title}</span>
      {hint&&<span style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{hint}</span>}
      <span style={{marginLeft:"auto",color:AI_GOLD,fontSize:11,fontWeight:900,fontFamily:F.m,transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
    </button>
    {open&&<div style={{border:`1px solid ${T.border}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:"12px 12px 4px",background:T.s1,animation:"fade .25s ease"}}>{children}</div>}
  </div>;
}

/* Section */
/* Quick actions - every action lands on a real surface. */
export function ExecQuickActions({role,setTab,setAiCentralView}){
  const acts=EXEC_QUICK_ACTIONS[role]||EXEC_QUICK_ACTIONS.caio;
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Quick actions</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:8}}>
      {acts.map(a=><button key={a.label} onClick={()=>{if(a.ac&&setAiCentralView)setAiCentralView(a.ac);setTab(a.tab);}} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px",cursor:"pointer",textAlign:"left",fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.label} →</button>)}
    </div>
  </Card>;
}

/* Recent changes - seeded lens events merged with the live evidence bus. */
export function ExecRecentChanges({role,setTab,setAiCentralView}){
  const seeded=EXEC_RECENT_CHANGES[role]||EXEC_RECENT_CHANGES.caio;
  let live=[];
  try{
    if(typeof window!=="undefined")live=readBus("vz-gw-evidence").slice(0,2).map(e=>({what:e.item,initiative:e.initiative,when:e.time,kind:"evidence"}));
  }catch{/* ignore */}
  const rows=[...live,...seeded].slice(0,5);
  const kindColor={evidence:AI_GOLD,decision:T.green,risk:T.red,deployment:T.blue,learning:T.violet};
  return <Card style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em"}}>Recent changes</div>
      <button onClick={()=>{setAiCentralView&&setAiCentralView("evidence");setTab("aicentral");}} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Evidence trail →</button>
    </div>
    <div style={{display:"grid",gap:7}}>
      {rows.map((r,i)=><div key={`${r.what}-${i}`} style={{display:"flex",gap:10,alignItems:"flex-start",background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:kindColor[r.kind]||T.ink4,marginTop:4,flexShrink:0}}/>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:600,lineHeight:1.45}}>{r.what}</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{r.initiative} · {r.when}</div>
        </div>
      </div>)}
    </div>
  </Card>;
}

/* Critical risks and business-unit heat, straight from the Risk Center
   register - every number drills back to its origin. */
export function ExecRiskPulse({setTab}){
  const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  const top=[...riskRegister].sort((a,b)=>(b.likelihood*b.impact)-(a.likelihood*a.impact)).slice(0,4);
  const units=[...new Set(riskRegister.map(r=>r.unit))].map(u=>{
    const rs=riskRegister.filter(r=>r.unit===u);
    const worst=rs.some(r=>r.level==="Critical")?"Critical":rs.some(r=>r.level==="High")?"High":rs.some(r=>r.level==="Medium")?"Medium":"Low";
    return {u,n:rs.length,worst};
  }).sort((a,b)=>b.n-a.n);
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:12}}>
    <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em"}}>Critical risks right now</div>
        <button onClick={()=>setTab("riskcenter")} style={{background:"transparent",border:"none",color:T.red,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Risk Center →</button>
      </div>
      <div style={{display:"grid",gap:7}}>
        {top.map(r=><button key={r.id} onClick={()=>setTab("riskcenter")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px",cursor:"pointer",textAlign:"left"}}>
          <span style={{minWidth:0}}><span style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700,display:"block"}}>{r.title}</span><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.system} · exec {r.execOwner} · treatment {r.treatment.status.toLowerCase()}</span></span>
          <Tag label={r.level} color={lvC(r.level)} bg={lvC(r.level)+"16"}/>
        </button>)}
      </div>
    </Card>
    <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em"}}>Business unit heatmap</div>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{riskRegister.length} risks on register</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
        {units.map(x=><button key={x.u} onClick={()=>setTab("riskcenter")} title="Open in Risk Center" style={{background:lvC(x.worst)+"10",border:`1px solid ${lvC(x.worst)}35`,borderRadius:9,padding:"11px 12px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:10.5,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:4}}>{x.u}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:lvC(x.worst)}}>{x.n}</span>
            <Tag label={x.worst} color={lvC(x.worst)} bg={lvC(x.worst)+"18"}/>
          </div>
        </button>)}
      </div>
    </Card>
  </div>;
}

export function PageHome({role,setTab,setAiCentralView,showToast}) {
  /* One dashboard layout for every executive - only the data changes. */
  return <ExecutiveCockpit role={role} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>;
}

export function PageOnboard({role,showToast}) {
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
export function PageOpportunityIntake({role,setTab,showToast}) {
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
          <button onClick={()=>showToast("Strategy hand-off packs arrive with the production workflow service - record the decision in AI Central instead","error")} style={{background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:9,padding:"10px 14px",color:AI_GOLD,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Prepare AI Central handoff</button>
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
export function PageStrategy({role,setTab}) {
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
/* ── Playbook: the execution workspace ─────────────────────────────
   Open a project and the Playbook shows its objectives, business case,
   the 13-phase lifecycle with tasks, owners, artifacts and evidence,
   the policies and controls it inherits, its risks, blockers, lessons
   from previous projects and the AI's next-step recommendation.
   The lifecycle itself is owned by AI Central - this is its execution
   surface, never a second implementation engine. */
export function PageHITL({role,showToast,onCountChange}) {
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
/* The VerisZone governance engine cascade - proprietary engines that
   run automatically for every AI initiative. Users see outcomes; the
   engines power dashboards, assessments and recommendations. */
export function PageRoadmap({role,setTab,setAiCentralView}) {
  const gotoAC=m=>{setAiCentralView&&setAiCentralView(m);setTab&&setTab("aicentral");};
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
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Tag label={`Impact: ${ns.i}`} color={ns.i==="Critical"?T.red:ns.i==="High"?T.amber:T.blue} bg={ns.i==="Critical"?T.redL:ns.i==="High"?T.amberL:T.blueL}/>
            <button onClick={()=>gotoAC(/risk|dpia|violation|assessment/i.test(ns.a+ns.w)?"governance":/evidence|docs|report|pack/i.test(ns.a+ns.w)?"evidence":"initiatives")} style={{background:"transparent",border:"none",color:rc,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer",padding:0}}>Act in AI Central →</button>
          </div>
        </div>
      </div>)}
    </Card>
  </div>;
}

/* Section */
export function PageDecisions({role,setTab,setAiCentralView,showToast}){
  const goto=link=>{
    if(!link)return;
    if(link.ac){setAiCentralView&&setAiCentralView(link.ac);setTab&&setTab("aicentral");}
    else if(link.tab){setTab&&setTab(link.tab);}
  };
  const K=KPI[role]||KPI.caio;
  const execCount=(EXEC_DECISIONS[role]||EXEC_DECISIONS.caio).length;
  const gates=acInitiatives.filter(i=>{
    const rec=feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK);
    return rec==="Scale"||rec==="Retire";
  });
  const counts=[
    ["Executive decisions",execCount,AI_GOLD],
    ["HITL approvals",K.hitl,T.violet],
    ["Scale / retire gates",gates.length,T.blue],
    ["Exceptions expiring","2",T.amber],
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Decisions" sub="Everything waiting for you in one place - approvals, HITL, exceptions, escalations and scale or retire gates. Every decision generates audit evidence."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:14}}>
      {counts.map(([l,v,c])=><Card key={l} style={{padding:14}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{l}</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c}}><CountUp value={v}/></div>
      </Card>)}
    </div>
    <ExecDecisionCenter role={role} goto={goto} showToast={showToast}/>
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Scale / retire gates</h3>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Recommended by the feedback engine - recorded in AI Central</span>
      </div>
      <div style={{display:"grid",gap:8}}>
        {gates.map(i=>{
          const rec=feedbackDecision(acFeedback[i.id]||DEFAULT_FEEDBACK);
          const c=decisionColorOf(rec,T);
          return <div key={i.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px"}}>
            <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.unit} · readiness {Math.round((i.guardrail+i.adoption+i.valueScore)/3)}%</div></div>
            <Tag label={`Recommend: ${rec}`} color={c} bg={c+"16"}/>
            <button onClick={()=>goto({ac:"initiatives"})} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:7,padding:"7px 12px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Record decision →</button>
          </div>;
        })}
      </div>
    </Card>
    <PageHITL role={role} showToast={showToast} onCountChange={()=>{}}/>
  </div>;
}

/* ── Knowledge: one intelligent repository ─────────────────────────
   Merges the knowledge engine assets with the platform's knowledge
   surfaces (templates, playbooks, checklists, academy, kits). One search;
   the original renderers stay as contextual destinations. */
