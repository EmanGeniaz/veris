"use client";

import { Map, Scale } from "lucide-react";
import { AC_PHASES } from "@/lib/platform-models";
import { T, AI_GOLD, AI_GOLD_L, AI_ROLLOUT_PROGRAMS, AI_SPINE_SIGNALS, HITL, F, Tag, Bar, Ring, Card } from "./core";

export function PageAISpine({mode="overview",setTab,focus}) {
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
  const focusMatch=focus?AI_ROLLOUT_PROGRAMS.filter(pr=>focus.name.includes(pr.name.split(" ")[0])):[];
  const activePrograms=focus&&focusMatch.length?focusMatch:AI_ROLLOUT_PROGRAMS;
  /* DNA derives from the selected initiative when one is in focus. */
  const initiativeDna=focus?[
    {label:"Use-case pattern",value:`${focus.category} in ${focus.unit}`,detail:"Classifies pilot behavior before controls are activated."},
    {label:"Affected CXOs",value:focus.cxo,detail:"CXO Impact Graph determines who must review or own tasks."},
    {label:"Risk class",value:`${focus.risk} Risk`,detail:"Human impact, customer interaction and data handling drive governance class."},
    {label:"Scale intent",value:focus.lifecycle==="Production"?"Enterprise rollout":"Multi-department rollout",detail:"Pilot learning is retained before moving to the next department."},
    {label:"Activated controls",value:focus.controls.join(", ")||"None yet",detail:"Controls inherited by every downstream department."},
    {label:"Evidence requirements",value:(AC_PHASES[focus.phaseIndex]?.deliverables||[]).slice(0,4).join(", "),detail:`Current phase: ${AC_PHASES[focus.phaseIndex]?.name}. AI Central tracks completion before expansion.`},
  ]:[
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

/* ── Executive Workspace 4.0 intelligence layer ──────────────────
   Personal, role-specific decision intelligence. Everything deep-links
   into AI Central where operational work happens - no duplication. */

/* Deep-link targets: {tab} for a top-level tab, {ac} for an AI Central module. */
