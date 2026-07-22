"use client";

import { readBus, pushBus } from "@/lib/bus";
import { Cloud, Scale, Target, Workflow } from "lucide-react";
import { useState, useEffect } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, acGuardrails, acCxoAlignment, acEvidence, acFeedback, gatewayProviders, gatewayPolicies, gatewayLog, gatewayStats, gatewayRouting, guardrailDetectors, deploymentModes, gatewayRetention, knowledgeAssets, riskRegister } from "@/lib/platform-models";
import { FEEDBACK_DIMS, DEFAULT_FEEDBACK, feedbackAvg, feedbackDecision, decisionColorOf, autoEvidenceFor, T, RC, RCL, ROLES, AI_CENTRAL_NAV, acAccessFor, LIFECYCLE_BANDS, TERMINAL_LIFECYCLE, RETIREMENT_REASONS, AI_GOLD, AI_GOLD_L, AI_GOLD_B, AI_ROLLOUT_PROGRAMS, HITL, MODEL_REGISTRY, MATURITY_DOMAINS, USE_CASES, academyEvidenceFor, F, vzDownload, CountUp, IconBox, Tag, PTag, STag, Bar, Ring, Card, SHead, AICentralLogo, INTEGRATIONS } from "./core";
import { PageAISpine } from "./spine";
import { RiskAssessmentCascade } from "./riskcenter";
import { PageGovernanceAcademy } from "./academy";

export function PageModelRegistry({setTab}) {
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
export function PageMaturityRadar() {
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
export function PageUseCases() {
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
export function PageIntegrations({role,showToast}){
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
            <button onClick={()=>showToast("OAuth connection requires production identity credentials - unavailable in this workspace","error")} style={{background:rc,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Connect</button>
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
          <button onClick={()=>showToast("ServiceNow hand-off requires a connected production instance","error")} style={{background:T.s3,color:T.ink3,border:`1px solid ${T.border}`,borderRadius:5,padding:"4px 9px",fontSize:9,fontFamily:F.b}}>Open </button>
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
          <button onClick={()=>showToast("Connector authorisation requires production credentials","error")} style={{width:"100%",background:p.color,color:"#fff",border:"none",borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b}}>Connect {p.name}</button>
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
          <button onClick={()=>{vzDownload("veriszone-trust-pack.md",`# VerisZone Trust Pack (generated demo)\n\n${AC_FRAMEWORK_POSTURE.map(f=>`- ${f.name}: ${f.score}%`).join("\n")}\n`);showToast("Trust pack downloaded");}} style={{background:rc+"20",color:rc,border:"1px solid "+rc+"30",borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>Respond</button>
        </div>;})}
      </Card>
    </div>}
    {activeTab==="marketplace"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
      {[{name:"Jira",icon:"?",cat:"Task Management",status:"Available",col:"#0052CC"},{name:"Slack",icon:"?",cat:"Notifications",status:"Available",col:"#4A154B"},{name:"Microsoft 365",icon:"?",cat:"Evidence Collection",status:"Available",col:"#0078D4"},{name:"Google Workspace",icon:"?",cat:"Evidence Collection",status:"Available",col:"#4285F4"},{name:"AWS Security",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#FF9900"},{name:"Azure Defender",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#0078D4"},{name:"GitHub",icon:"?",cat:"Dev Security",status:"Coming Q3",col:"#6E5494"},{name:"Qualys",icon:"?",cat:"Vulnerability",status:"Coming Q4",col:"#ED1C24"},{name:"Okta",icon:"?",cat:"IAM Evidence",status:"Coming Q4",col:"#007DC1"},{name:"Crowdstrike",icon:"?",cat:"Endpoint Security",status:"Coming Q4",col:"#E01B2D"},{name:"Tenable",icon:"?",cat:"Vulnerability",status:"Roadmap",col:"#00B4C8"},{name:"Splunk",icon:"?",cat:"SIEM Evidence",status:"Roadmap",col:"#65A637"}].map((p,i)=><Card key={p.name} style={{padding:13,animation:`up ${.3+i*.04}s ease both`}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><IconBox name={`${p.name} ${p.cat}`} color={p.col} size={13} style={{width:28,height:28,borderRadius:7}}/><div><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{p.cat}</div></div></div>
        <Tag label={p.status} color={p.status==="Available"?T.green:p.status.includes("Q")?T.amber:T.ink3} bg={p.status==="Available"?T.greenL:p.status.includes("Q")?T.amberL:T.ink5}/>
        {p.status==="Available"&&<button onClick={()=>showToast(p.name+" connection requires production credentials","error")} style={{width:"100%",marginTop:8,background:rc,color:"#fff",border:"none",borderRadius:6,padding:"6px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Connect</button>}
      </Card>)}
    </div>}
  </div>;
}

/* Section */
/* Organization and business-unit view of the portfolio - the same
   initiative records rolled up per unit, drilling into the lifecycle. */
function PortfolioUnits({setView}){
  const [openUnit,setOpenUnit]=useState(null);
  const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
  const units=[...new Set(acInitiatives.map(i=>i.unit))].map(u=>{
    const inis=acInitiatives.filter(i=>i.unit===u);
    const risks=riskRegister.filter(r=>r.unit===u);
    const worst=risks.some(r=>r.level==="Critical")?"Critical":risks.some(r=>r.level==="High")?"High":risks.length?"Medium":"Low";
    return {u,inis,risks,worst,
      expected:inis.reduce((a,i)=>a+money(i.expected),0),
      actual:inis.reduce((a,i)=>a+money(i.actual),0),
      adoption:Math.round(inis.reduce((a,i)=>a+i.adoption,0)/inis.length),
      guardrail:Math.round(inis.reduce((a,i)=>a+i.guardrail,0)/inis.length)};
  }).sort((a,b)=>b.expected-a.expected);
  const org={n:acInitiatives.length,expected:units.reduce((a,x)=>a+x.expected,0),actual:units.reduce((a,x)=>a+x.actual,0),
    adoption:Math.round(acInitiatives.reduce((a,i)=>a+i.adoption,0)/acInitiatives.length),risks:riskRegister.length};
  const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <Card style={{padding:16,marginBottom:12,border:`1px solid ${AI_GOLD}30`}}>
      <div style={{fontSize:9,fontWeight:900,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:F.m,marginBottom:10}}>Organization view</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
        {[["AI initiatives",org.n,T.blue],["Expected value",`$${org.expected.toFixed(1)}M`,AI_GOLD],["Realized value",`$${org.actual.toFixed(1)}M`,T.green],["Avg adoption",`${org.adoption}%`,T.violet],["Risks on register",org.risks,T.red]].map(([l,v,c])=>
          <div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{l}</div>
            <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          </div>)}
      </div>
    </Card>
    <div style={{display:"grid",gap:10}}>
      {units.map(x=><Card key={x.u} style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr repeat(4,minmax(90px,1fr)) auto",gap:12,alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b}}>{x.u}</div>
            <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{x.inis.length} initiative{x.inis.length>1?"s":""} · {x.risks.length} risk{x.risks.length===1?"":"s"}</div>
          </div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>VALUE</div><span style={{fontSize:13,fontWeight:900,fontFamily:F.m,color:AI_GOLD}}>${x.actual.toFixed(1)}M / ${x.expected.toFixed(1)}M</span></div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>ADOPTION {x.adoption}%</div><Bar value={x.adoption} color={x.adoption>=70?T.green:T.amber}/></div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>GUARDRAILS {x.guardrail}%</div><Bar value={x.guardrail} color={x.guardrail>=80?T.green:T.amber}/></div>
          <Tag label={`${x.worst} risk`} color={lvC(x.worst)} bg={lvC(x.worst)+"16"}/>
          <button onClick={()=>setOpenUnit(openUnit===x.u?null:x.u)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 11px",color:T.ink2,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{openUnit===x.u?"Hide":"Initiatives"} {openUnit===x.u?"▲":"▼"}</button>
        </div>
        {openUnit===x.u&&<div style={{display:"grid",gap:6,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
          {x.inis.map(i=><div key={i.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px"}}>
            <div><div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.category} · phase {i.phaseIndex+1}/{AC_PHASES.length} {AC_PHASES[i.phaseIndex]?.name}</div></div>
            <STag s={i.lifecycle}/>
            <Tag label={`${i.roi} ROI`} color={T.green} bg={T.greenL}/>
            <button onClick={()=>setView&&setView("initiatives")} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open lifecycle →</button>
          </div>)}
        </div>}
      </Card>)}
    </div>
  </div>;
}

export function PageAICentral({role,setTab,showToast,view,setView,theme,sessionMode}) {
  const rc=AI_GOLD;
  const access=acAccessFor(role);
  const R=ROLES[role]||ROLES.caio;
  const activeModule=access.modules.includes(view)?view:"dashboard";
  const [items,setItems]=useState(acInitiatives);
  const [selectedId,setSelectedId]=useState(acInitiatives[0].id);
  const [initTab,setInitTab]=useState("list");
  const [phaseSel,setPhaseSel]=useState(null);
  const [govTab,setGovTab]=useState("controls");
  const [evTab,setEvTab]=useState("repository");
  const [gwTab,setGwTab]=useState("overview");
  const [lifecycleFilter,setLifecycleFilter]=useState("All");
  const [createOpen,setCreateOpen]=useState(false);
  const [draft,setDraft]=useState({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:""});
  const [evQuery,setEvQuery]=useState("");
  const [evScope,setEvScope]=useState("All");
  const [decisions,setDecisions]=useState({});
  const [retireDraft,setRetireDraft]=useState({reason:RETIREMENT_REASONS[0],rationale:""});
  const [feedback,setFeedback]=useState(acFeedback);
  const [hydrated,setHydrated]=useState(false);
  const selected=items.find(i=>i.id===selectedId)||items[0];
  const learningEvidence=academyEvidenceFor(role,sessionMode==="demo");
  const gwEvidence=(typeof window!=="undefined")?(()=>{try{return readBus("vz-gw-evidence");}catch{return [];}})():[];
  const evidenceRows=[...gwEvidence,...acEvidence,...autoEvidenceFor(items),...learningEvidence.map(e=>({...e,scope:"Organization",version:"v1"}))];
  /* Persistence: created initiatives, governed decisions and feedback survive reload. */
  useEffect(()=>{
    try{
      const savedItems=JSON.parse(localStorage.getItem("vz-ac-custom")||"[]");
      if(Array.isArray(savedItems)&&savedItems.length)setItems(prev=>[...savedItems.filter(s=>!prev.some(p=>p.id===s.id)),...prev]);
      const savedDec=JSON.parse(localStorage.getItem("vz-ac-decisions")||"null");
      if(savedDec)setDecisions(savedDec);
      const savedFb=JSON.parse(localStorage.getItem("vz-ac-feedback")||"null");
      if(savedFb)setFeedback(prev=>({...prev,...savedFb}));
    }catch{/* corrupt local data ignored */}
    setHydrated(true);
  },[]);
  useEffect(()=>{
    if(!hydrated)return;
    try{
      localStorage.setItem("vz-ac-custom",JSON.stringify(items.filter(i=>!acInitiatives.some(s=>s.id===i.id))));
      localStorage.setItem("vz-ac-decisions",JSON.stringify(decisions));
      localStorage.setItem("vz-ac-feedback",JSON.stringify(feedback));
    }catch{/* storage unavailable */}
  },[items,decisions,feedback,hydrated]);
  const total=items.length;
  const active=items.filter(i=>!["Completed","Retired"].includes(i.lifecycle)).length;
  const high=items.filter(i=>i.risk==="High"||i.risk==="Critical").length;
  const pending=items.filter(i=>i.status==="Awaiting Approval").length+2;
  const avgGuard=Math.round(items.reduce((s,i)=>s+i.guardrail,0)/total);
  const avgAdopt=Math.round(items.reduce((s,i)=>s+i.adoption,0)/total);
  const avgValue=Math.round(items.reduce((s,i)=>s+i.valueScore,0)/total);
  const openInitiative=(id,tab="overview")=>{setSelectedId(id);setInitTab(tab);setPhaseSel(null);setView("initiatives");};
  const openModule=id=>{if(access.modules.includes(id))setView(id);};

  const SubTabs=({tabs,active:a,onChange})=><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
    {tabs.map(([id,label])=><button key={id} onClick={()=>onChange(id)} style={{background:a===id?rc+"20":T.s2,border:`1px solid ${a===id?rc+"55":T.border}`,color:a===id?rc:T.ink2,borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"}}>{label}</button>)}
  </div>;

  const Metric=({label,value,sub,color,score,onClick})=><Card onClick={onClick} style={{padding:16,cursor:onClick?"pointer":"default",transition:"border-color .15s"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
      <div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
        <div style={{fontSize:26,fontWeight:800,color:T.ink,fontFamily:F.h}}><CountUp value={value}/></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:4}}>{sub}</div>
      </div>
      {typeof score==="number"?<Ring score={score} color={color||rc} size={54}/>:<div style={{width:38,height:38,borderRadius:12,background:(color||rc)+"18",border:"1px solid "+(color||rc)+"35"}}/>}
    </div>
  </Card>;

  const Header=()=><div style={{background:"linear-gradient(135deg,"+T.s2+", "+T.s1+")",border:"1px solid "+T.border,borderRadius:16,padding:"20px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:-60,top:-80,width:220,height:220,borderRadius:"50%",background:rc+"16",filter:"blur(24px)"}}/>
    <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",position:"relative",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:16,alignItems:"flex-start",minWidth:0}}>
        <AICentralLogo compact width={52} style={{flexShrink:0,marginTop:2,boxShadow:`0 14px 30px ${AI_GOLD}22`}}/>
        <div style={{minWidth:0}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:9,flexWrap:"wrap"}}>
            <Tag label="AI CENTRAL" color={AI_GOLD} bg={AI_GOLD_L}/>
            <Tag label={`Viewing as ${R.label}`} color={RC(role)} bg={RC(role)+"16"}/>
            <Tag label={`${access.lens} lens`} color={AI_GOLD} bg={AI_GOLD+"14"}/>
          </div>
          <h2 style={{fontSize:28,fontWeight:800,color:T.ink,fontFamily:F.h,letterSpacing:"-0.03em",margin:0,lineHeight:1.1}}>{AI_CENTRAL_NAV.find(m=>m.id===activeModule)?.label||"Dashboard"}</h2>
          <p style={{fontSize:12,color:T.ink3,lineHeight:1.7,maxWidth:780,margin:"7px 0 0",fontFamily:F.b}}>{access.focus}. One platform, one source of truth - every role sees its own perspective.</p>
        </div>
      </div>
      <button onClick={()=>{setTab("hitl");showToast&&showToast("Opening HITL approvals from AI Central");}} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:"1px solid "+AI_GOLD_B,borderRadius:8,padding:"10px 14px",fontSize:12,fontWeight:900,fontFamily:F.b,whiteSpace:"nowrap",boxShadow:"0 14px 34px "+AI_GOLD+"22",cursor:"pointer"}}>Review Approvals</button>
    </div>
  </div>;

  /* ── Dashboard ─────────────────────────────────────────────── */
  const W={
    portfolio:{label:"Total initiatives",value:total,sub:"Enterprise AI portfolio",color:rc,go:()=>openModule("initiatives")},
    active:{label:"Active AI projects",value:active,sub:"In lifecycle",color:T.blue,go:()=>openModule("initiatives")},
    risk:{label:"High-risk use cases",value:high,sub:"High or critical",color:T.red,go:()=>openModule("initiatives")},
    approvals:{label:"Pending approvals",value:pending,sub:"HITL and CXO",color:T.amber,go:()=>{setTab("hitl");}},
    findings:{label:"Open audit findings",value:"6",sub:"2 overdue",color:T.red,go:()=>openModule("evidence")},
    guardrail:{label:"Guardrail compliance",value:avgGuard+"%",sub:"Mandatory controls",color:T.green,score:avgGuard,go:()=>openModule("governance")},
    adoption:{label:"AI adoption score",value:avgAdopt+"%",sub:"Workforce readiness",color:T.teal,score:avgAdopt,go:()=>openModule("academy")},
    value:{label:"Business value score",value:avgValue+"%",sub:"ROI and outcomes",color:AI_GOLD,score:avgValue,go:()=>openModule("initiatives")},
    budget:{label:"Budget utilization",value:"64%",sub:"$8.6M of $13.4M FY26",color:T.blue,score:64,go:()=>openModule("initiatives")},
    roi:{label:"Portfolio ROI",value:"19%",sub:"Weighted actual vs expected",color:T.green,go:()=>openModule("initiatives")},
  };
  const LENS_WIDGETS={
    Executive:["portfolio","value","roi","risk","budget","approvals"],
    Operations:["active","adoption","risk","approvals","portfolio","guardrail"],
    Value:["value","roi","budget","portfolio","adoption","findings"],
    Workforce:["adoption","portfolio","active","approvals","guardrail","value"],
    Security:["risk","guardrail","findings","approvals","portfolio","active"],
    Governance:["portfolio","active","risk","approvals","findings","guardrail","adoption","value"],
    Delivery:["portfolio","active","risk","approvals","findings","guardrail","adoption","value"],
    Privacy:["risk","findings","guardrail","portfolio","approvals","adoption"],
    Compliance:["guardrail","findings","risk","approvals","portfolio","value"],
  };
  const showCxo=["Executive","Governance","Delivery"].includes(access.lens);
  const showValueSection=["Executive","Value","Workforce","Operations","Governance","Delivery"].includes(access.lens);
  const attention=items.filter(i=>i.blockedBy);

  const Dashboard=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      {(LENS_WIDGETS[access.lens]||LENS_WIDGETS.Governance).map(k=>{const w=W[k];return <Metric key={k} label={w.label} value={w.value} sub={w.sub} color={w.color} score={w.score} onClick={w.go}/>;})}
    </div>
    {attention.length>0&&<Card style={{padding:"14px 18px",marginBottom:14,border:`1px solid ${T.amber}40`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{width:7,height:7,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite"}}/><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:0}}>Initiatives needing attention</h3><Tag label={`${attention.length}`} color={T.amber} bg={T.amberL}/></div>
      <div style={{display:"grid",gap:7}}>
        {attention.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
          <div style={{minWidth:0}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.blockedBy}</div></div>
          <button onClick={()=>openInitiative(i.id,"implementation")} style={{background:rc+"18",border:`1px solid ${rc}45`,borderRadius:7,padding:"6px 11px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>Open phase</button>
        </div>)}
      </div>
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14,marginBottom:14}}>
      <Card style={{padding:18}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>Risk heatmap</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {items.map(i=><button key={i.id} onClick={()=>openInitiative(i.id)} style={{background:(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"18",border:"1px solid "+(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"35",borderRadius:10,padding:12,textAlign:"left",cursor:"pointer"}}>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginBottom:6}}>{i.unit}</div>
            <div style={{fontSize:12,color:T.ink,fontWeight:700,lineHeight:1.35}}>{i.name}</div>
            <div style={{marginTop:10}}><PTag p={i.risk}/></div>
          </button>)}
        </div>
      </Card>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:0}}>Governance maturity</h3>
          {access.modules.includes("governance")&&<button onClick={()=>setView("governance")} style={{background:"transparent",border:"none",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open AI Governance</button>}
        </div>
        {["Strategy linkage","Policy mapping","Human oversight","Evidence readiness","Value realization"].map((m,idx)=>{const val=[88,79,74,83,71][idx];return <div key={m} style={{marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,marginBottom:6}}><span>{m}</span><span style={{fontFamily:F.m}}>{val}%</span></div>
          <Bar value={val} color={val>80?T.green:val>72?T.blue:T.amber}/>
        </div>})}
      </Card>
    </div>
    <Card style={{padding:18,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:0}}>Feedback engine outcomes</h3>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Scale","Continue","Improve","Retire"].map(d=>{
            const n=items.filter(i=>feedbackDecision(feedback[i.id]||DEFAULT_FEEDBACK)===d).length;
            const c=decisionColorOf(d,T);
            return <span key={d} style={{display:"inline-flex",alignItems:"center",gap:5,background:c+"14",border:`1px solid ${c}35`,borderRadius:7,padding:"4px 9px",fontSize:10,fontWeight:800,fontFamily:F.b,color:c}}>{d} <span style={{fontFamily:F.m}}>{n}</span></span>;
          })}
        </div>
      </div>
      <div style={{display:"grid",gap:8}}>
        {items.map(i=>{
          const f=feedback[i.id]||DEFAULT_FEEDBACK;const avg=feedbackAvg(f);const rec=feedbackDecision(f);const c=decisionColorOf(rec,T);
          return <button key={i.id} onClick={()=>openInitiative(i.id,"feedback")} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 96px",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",textAlign:"left",cursor:"pointer"}}>
            <div><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.unit}</div></div>
            <div><Bar value={avg} color={c}/><div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>Composite {avg}/100</div></div>
            <div style={{justifySelf:"end"}}><Tag label={rec} color={c} bg={c+"16"}/></div>
          </button>;
        })}
      </div>
    </Card>
    {showValueSection&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>Business value tracking</h3>{items.map(i=><button key={i.id} onClick={()=>openInitiative(i.id)} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",padding:0,marginBottom:14,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink2,marginBottom:6}}><span>{i.name}</span><span>{i.valueScore}%</span></div><Bar value={i.valueScore} color={i.valueScore>80?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:5}}>Expected {i.expected} - Actual {i.actual}</div></button>)}</Card>
      <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>Business unit comparison</h3>{items.map(i=><div key={i.id} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:9,padding:12,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink,marginBottom:8}}><span>{i.unit}</span><Tag label={"Resistance: "+i.resistance} color={i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green}/></div><Bar value={parseInt(i.training)||0} color={(parseInt(i.training)||0)>75?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:7}}>Training {i.training} - Adoption {i.adoption}%</div></div>)}</Card>
    </div>}
    {showCxo&&<Card style={{padding:18}}>
      <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>CXO alignment</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
        {acCxoAlignment.map(c=><div key={c.role} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:10,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div><div style={{fontSize:17,color:T.ink,fontWeight:800}}>{c.role}</div><div style={{fontSize:10,color:T.ink3}}>{c.count} mapped initiatives</div></div><Ring score={c.score} color={c.score>80?T.green:c.score>72?T.blue:T.amber} size={44}/></div>
          <p style={{fontSize:10,color:T.ink3,lineHeight:1.55,margin:0}}>{c.focus}</p>
        </div>)}
      </div>
    </Card>}
  </div>;

  /* ── AI Initiatives ────────────────────────────────────────── */
  const filtered=lifecycleFilter==="All"?items:items.filter(i=>i.lifecycle===lifecycleFilter);
  const catColor=cat=>cat==="Retired"?T.red:cat==="Scaling"?T.green:cat==="Completed"?T.teal:cat==="Production"||cat==="Pilot"?AI_GOLD:T.blue;
  const decide=(outcome,reason,rationale)=>{
    const rec={outcome,reason:reason||null,rationale:rationale||"",decidedBy:R.label,at:"just now"};
    setDecisions({...decisions,[selected.id]:rec});
    setItems(items.map(i=>i.id===selected.id?{...i,lifecycle:outcome==="Scale"?"Scaling":"Retired",status:outcome==="Scale"?"Scaling":"Retired",blockedBy:null}:i));
    pushBus("vz-gw-evidence",{item:`Governed decision: ${outcome} - ${selected.name}`,initiative:selected.name,scope:"Project",control:"Scale gate",risk:reason||"Executive decision",owner:R.label,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"})
    showToast&&showToast(outcome==="Scale"?"Governed decision recorded: approved to scale":"Governed decision recorded: initiative retired");
    setRetireDraft({reason:RETIREMENT_REASONS[0],rationale:""});
  };
  const phaseStatus=(ini,idx)=>idx<ini.phaseIndex?"Complete":idx>ini.phaseIndex?"Not Started":ini.blockedBy?"Blocked":"Active";
  const artifactStatus=(ini,phaseIdx,artIdx)=>{
    if(phaseIdx<ini.phaseIndex)return "Complete";
    if(phaseIdx>ini.phaseIndex)return "Not Started";
    if(artIdx<ini.phaseArtifactsDone)return "Complete";
    return artIdx===ini.phaseArtifactsDone&&ini.blockedBy?"Blocked":"Missing";
  };
  const phaseProgress=ini=>Math.round(((ini.phaseIndex+(ini.phaseArtifactsDone/(AC_PHASES[ini.phaseIndex]?.deliverables.length||1)))/AC_PHASES.length)*100);
  const createInitiative=()=>{
    if(!draft.name.trim()||!draft.unit.trim()){showToast&&showToast("Name and business unit are required","error");return;}
    const rec={
      id:`ai-${String(items.length+1).padStart(3,"0")}`,name:draft.name.trim(),unit:draft.unit.trim(),category:draft.category,lifecycle:"New Ideas",
      businessOwner:draft.businessOwner.trim()||"Unassigned",technicalOwner:"Unassigned",sponsor:draft.sponsor.trim()||"Unassigned",champion:"Unassigned",cxo:"CAIO",
      status:"New Idea",priority:"Medium",risk:"Medium",expected:draft.expected.trim()||"TBD",actual:"$0",stage:"Demand Intake",
      guardrail:20,adoption:0,valueScore:0,policies:[],controls:[],audits:[],risks:[],roi:"--",savings:"$0",revenue:"$0",productivity:"--",training:"0%",resistance:"Medium",
      phaseIndex:0,phaseArtifactsDone:0,blockedBy:"Discover artifacts not started",
    };
    setItems([rec,...items]);setSelectedId(rec.id);setInitTab("implementation");setPhaseSel(0);setCreateOpen(false);
    setDraft({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:""});
    showToast&&showToast("Initiative created - Discover phase opened");
  };
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};

  const InitiativeList=()=><div>
    <Card style={{padding:"14px 16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setLifecycleFilter("All")} style={{background:lifecycleFilter==="All"?rc+"20":T.s2,border:`1px solid ${lifecycleFilter==="All"?rc+"55":T.border}`,color:lifecycleFilter==="All"?rc:T.ink2,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>All initiatives <span style={{fontFamily:F.m,opacity:.8}}>{items.length}</span></button>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em"}}>Governed lifecycle</span>
        </div>
        <button onClick={()=>setCreateOpen(!createOpen)} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:"1px solid "+AI_GOLD_B,borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{createOpen?"Close":"Create AI Initiative"}</button>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"stretch"}}>
        {LIFECYCLE_BANDS.map((band,bi)=><div key={band.band} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px"}}>
            <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:band.band==="Decide"?AI_GOLD:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7,textAlign:"center"}}>{band.band}</div>
            <div style={{display:"flex",gap:5}}>
              {band.cats.map(cat=>{
                const count=items.filter(i=>i.lifecycle===cat).length;
                const isA=lifecycleFilter===cat;
                const c=catColor(cat);
                return <button key={cat} onClick={()=>setLifecycleFilter(cat)} title={cat==="Retired"?"Governed retirement decision required":cat} style={{background:isA?c+"22":"transparent",border:`1px solid ${isA?c+"66":count?T.border:T.border}`,color:isA?c:count?T.ink2:T.ink4,borderRadius:7,padding:"5px 9px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{cat} <span style={{fontFamily:F.m,opacity:.85}}>{count}</span></button>;
              })}
            </div>
          </div>
          {bi<LIFECYCLE_BANDS.length-1&&<span aria-hidden style={{color:T.ink4,fontSize:14,fontWeight:900}}>&#8594;</span>}
        </div>)}
      </div>
      <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10,lineHeight:1.5}}>Plan and deliver move forward through phase gates. <strong style={{color:AI_GOLD}}>Scale or Retire is a governed decision</strong> - an initiative is never retired without a recorded reason (non-performing model, low value, cancelled vision, superseded, or risk).</div>
    </Card>
    {createOpen&&<Card style={{padding:18,marginBottom:14,border:`1px solid ${rc}45`,animation:"up .25s ease"}}>
      <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>Create AI Initiative</h3>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Every initiative starts in Discover. Mandatory artifacts gate each phase; the record becomes the single source of truth.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
        {[["Initiative name","name"],["Business unit","unit"],["Business owner","businessOwner"],["Executive sponsor","sponsor"],["Expected value","expected"]].map(([l,k])=><label key={k} style={{display:"grid",gap:5}}>
          <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{l}</span>
          <input value={draft[k]} onChange={e=>setDraft({...draft,[k]:e.target.value})} style={fieldStyle}/>
        </label>)}
        <label style={{display:"grid",gap:5}}>
          <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Category</span>
          <select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>
            {["GenAI Copilot","Decision Support","Process Automation","Recommendation","Agentic Workflow","Internal Model"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <button onClick={createInitiative} style={{background:rc,border:"none",borderRadius:8,padding:"10px 16px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Create initiative</button>
    </Card>}
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"16px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:15,color:T.ink}}>AI Initiative Portfolio</h3><Tag label={`${filtered.length} shown`} color={T.ink3}/></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>{["Initiative","Business unit","Lifecycle","Owners","Status","Risk","Value","Phase","Guardrails"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(i=><tr key={i.id} onClick={()=>openInitiative(i.id)} style={{cursor:"pointer",borderBottom:"1px solid "+T.border}}>
          <td style={{padding:"13px 12px",color:T.ink,fontWeight:700}}>{i.name}<div style={{fontSize:10,color:T.ink3,fontWeight:400}}>{i.category}</div></td>
          <td style={{padding:"13px 12px",color:T.ink2}}>{i.unit}</td>
          <td style={{padding:"13px 12px"}}><Tag label={i.lifecycle} color={catColor(i.lifecycle)} bg={catColor(i.lifecycle)+"16"}/></td>
          <td style={{padding:"13px 12px",color:T.ink2}}>{i.businessOwner}<div style={{fontSize:10,color:T.ink3}}>{i.sponsor}</div></td>
          <td style={{padding:"13px 12px"}}><STag s={i.status}/></td>
          <td style={{padding:"13px 12px"}}><PTag p={i.risk}/></td>
          <td style={{padding:"13px 12px",color:T.green,fontFamily:F.m}}>{i.actual} / {i.expected}</td>
          <td style={{padding:"13px 12px",minWidth:120}}><div style={{fontSize:10,color:T.ink2,fontFamily:F.m,marginBottom:4}}>{AC_PHASES[i.phaseIndex]?.name} - {i.phaseIndex+1}/{AC_PHASES.length}</div><Bar value={phaseProgress(i)} color={rc}/></td>
          <td style={{padding:"13px 12px",minWidth:110}}><Bar value={i.guardrail} color={i.guardrail>80?T.green:i.guardrail>70?T.amber:T.red}/><div style={{fontSize:10,color:T.ink3,marginTop:5}}>{i.guardrail}%</div></td>
        </tr>)}</tbody>
      </table></div>
    </Card>
  </div>;

  const Overview=()=><div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
    <Card style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:18}}>
        <div><Tag label={selected.id.toUpperCase()} color={rc}/><h3 style={{fontSize:24,color:T.ink,margin:"10px 0 4px",fontWeight:800}}>{selected.name}</h3><p style={{color:T.ink3,fontSize:12,margin:0}}>{selected.unit} - {selected.category}</p></div>
        <Ring score={selected.guardrail} color={selected.guardrail>80?T.green:T.amber} size={76}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        {[["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["Executive sponsor",selected.sponsor],["AI champion",selected.champion],["CXO sponsors",selected.cxo],["Status",selected.status],["Lifecycle",selected.lifecycle],["Linked policies",selected.policies.join(", ")||"None yet"],["Linked controls",selected.controls.join(", ")||"None yet"],["Linked risks",selected.risks.join(", ")||"None yet"],["Audits",selected.audits.join(", ")||"None yet"],["Current phase",`${AC_PHASES[selected.phaseIndex]?.name} (${selected.phaseIndex+1}/${AC_PHASES.length})`]].map(([l,v])=><div key={l} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:8,padding:11}}><div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",marginBottom:5}}>{l}</div><div style={{fontSize:12,color:T.ink2,lineHeight:1.35}}>{v}</div></div>)}
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

  const Implementation=()=>{
    const activePhase=phaseSel==null?selected.phaseIndex:phaseSel;
    const phase=AC_PHASES[activePhase];
    const st=phaseStatus(selected,activePhase);
    const stColor=st==="Complete"?T.green:st==="Active"?rc:st==="Blocked"?T.red:T.ink3;
    return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(8,minmax(96px,1fr))",gap:6,marginBottom:14,overflowX:"auto"}}>
        {AC_PHASES.map((p,idx)=>{
          const s=phaseStatus(selected,idx);
          const col=s==="Complete"?T.green:s==="Active"?rc:s==="Blocked"?T.red:T.ink4;
          const isSel=idx===activePhase;
          return <button key={p.id} onClick={()=>setPhaseSel(idx)} style={{background:isSel?col+"1C":T.s2,border:`1px solid ${isSel?col+"55":T.border}`,borderRadius:10,padding:"10px 8px",textAlign:"left",cursor:"pointer"}}>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginBottom:4}}>PHASE {p.order}</div>
            <div style={{fontSize:11,color:isSel?col:T.ink2,fontWeight:800,fontFamily:F.b,lineHeight:1.25,marginBottom:6}}>{p.name}</div>
            <Tag label={s} color={col} bg={col+"16"}/>
          </button>;
        })}
      </div>
      {selected.blockedBy&&activePhase===selected.phaseIndex&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:9,alignItems:"center"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:T.red,flexShrink:0,animation:"pulse 2s infinite"}}/>
        <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><strong style={{color:T.red}}>Progression blocked.</strong> {selected.blockedBy}. Missing mandatory artifacts prevent advancing to {AC_PHASES[selected.phaseIndex+1]?.name||"completion"}.</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
        <Card style={{padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <h3 style={{fontSize:16,color:T.ink,fontWeight:800,margin:0}}>Phase {phase.order}: {phase.name}</h3>
            <Tag label={st} color={stColor} bg={stColor+"16"}/>
          </div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 14px"}}>{phase.objective}</p>
          <h4 style={{fontSize:12,color:T.ink,margin:"0 0 8px"}}>Mandatory artifacts</h4>
          <div style={{display:"grid",gap:7}}>
            {phase.deliverables.map((d,ai)=>{
              const as_=artifactStatus(selected,activePhase,ai);
              const ac_=as_==="Complete"?T.green:as_==="Blocked"?T.red:as_==="Missing"?T.amber:T.ink4;
              return <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px"}}>
                <div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{width:7,height:7,borderRadius:"50%",background:ac_}}/><span style={{fontSize:12,color:T.ink2,fontFamily:F.b}}>{d}</span></div>
                <Tag label={as_} color={ac_} bg={ac_+"14"}/>
              </div>;
            })}
          </div>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:12,lineHeight:1.6}}>Artifacts are stored automatically in Trust &amp; Evidence when completed. A phase cannot close with missing mandatory artifacts.</div>
        </Card>
        <div style={{display:"grid",gap:12,alignContent:"start"}}>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px"}}>Ownership (RACI)</h3>
            {[["Responsible",phase.raci.responsible,T.green],["Accountable",phase.raci.accountable,rc],["Consulted",phase.raci.consulted,T.blue],["Informed",phase.raci.informed,T.ink3]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <Tag label={l} color={c} bg={c+"14"}/><span style={{fontSize:11,color:T.ink,fontWeight:700,fontFamily:F.b}}>{v}</span>
            </div>)}
            <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10}}>Nothing is ownerless: every phase carries explicit accountability.</div>
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 8px"}}>Overall progress</h3>
            <div style={{fontSize:24,fontWeight:800,color:rc,fontFamily:F.h,marginBottom:8}}>{phaseProgress(selected)}%</div>
            <Bar value={phaseProgress(selected)} color={rc}/>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:8}}>Phase {selected.phaseIndex+1} of {AC_PHASES.length} - {AC_PHASES[selected.phaseIndex]?.name}</div>
          </Card>
        </div>
      </div>
    </div>;
  };

  const PilotExecution=()=>{
    const program=AI_ROLLOUT_PROGRAMS.find(p=>selected.name.includes(p.name.split(" ")[0]))||AI_ROLLOUT_PROGRAMS[0];
    const tasks=[
      ["Guardrail activation","AI Spine","In Progress",selected.guardrail,"Controls and HITL checks activated for pilot workspace"],
      ["Department enablement",selected.unit,selected.adoption>=70?"On Track":"At Risk",selected.adoption,"Training, workflow comms and adoption readiness"],
      ["Evidence collection","Assurance",program.evidence>=80?"Ready":"Incomplete",program.evidence,program.blocker],
      ["Risk monitoring","Risk owner",parseInt(program.riskDrift,10)>8?"Escalate":"Monitor",Math.max(35,100-Math.abs(parseInt(program.riskDrift,10))*4),"Live risk drift against approved appetite"],
    ];
    const wave=[program.pilot,program.next,"Enterprise rollout"].map((dept,idx)=>({dept,status:idx===0?"Pilot active":idx===1?program.decision==="Scale"?"Queued":"Waiting gate":"Not started",score:idx===0?program.adoption:idx===1?program.readiness:42}));
    return <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:16}}>
          <div>
            <Tag label="DEPARTMENT PILOT EXECUTION" color={AI_GOLD} bg={AI_GOLD_L}/>
            <h3 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:T.ink,margin:"10px 0 5px"}}>{selected.name}</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>Downstream execution for the pilot department. AI Central monitors tasks, deviations, adoption, guardrails, evidence and scale readiness.</p>
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
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 12px"}}>Pilot control room</h3>
          {[["Risk drift",program.riskDrift,parseInt(program.riskDrift,10)>0?T.red:T.green],["Evidence confidence",program.evidence+"%",program.evidence>=80?T.green:T.amber],["Adoption",program.adoption+"%",program.adoption>=70?T.green:T.amber],["Value realized",program.value,AI_GOLD]].map(([l,v,col])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{l}</span><strong style={{fontSize:13,color:col,fontFamily:F.m}}>{v}</strong>
          </div>)}
        </Card>
        <Card style={{padding:16,border:`1px solid ${program.decision==="Scale"?T.green+"40":T.amber+"40"}`}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 8px"}}>Next required action</h3>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:"0 0 12px"}}>{program.blocker}</p>
          <button onClick={()=>{program.decision==="Scale"?setInitTab("scalegate"):access.modules.includes("evidence")?setView("evidence"):setInitTab("implementation");}} style={{width:"100%",background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"9px 10px",color:AI_GOLD,fontFamily:F.b,fontSize:11,fontWeight:900,cursor:"pointer"}}>{program.decision==="Scale"?"Open scale gate":"Review evidence"}</button>
        </Card>
      </div>
    </div>;
  };

  const FeedbackPanel=()=>{
    const f=feedback[selected.id]||DEFAULT_FEEDBACK;
    const avg=feedbackAvg(f);
    const rec=feedbackDecision(f);
    const recColor=decisionColorOf(rec,T);
    const setDim=(k,v)=>setFeedback({...feedback,[selected.id]:{...f,[k]:v}});
    return <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <Tag label="FEEDBACK ENGINE" color={AI_GOLD} bg={AI_GOLD_L}/>
        <h3 style={{fontSize:17,color:T.ink,fontWeight:800,fontFamily:F.h,margin:"10px 0 4px"}}>Multi-stakeholder feedback</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 14px"}}>Every initiative collects feedback from the people who live with it. Scores roll up into a Scale / Continue / Improve / Retire recommendation that feeds the governed decision.</p>
        <div style={{display:"grid",gap:11}}>
          {FEEDBACK_DIMS.map(([k,label])=>{
            const v=f[k]??50;
            const c=k==="risk"?(v>=60?T.green:v>=40?T.amber:T.red):(v>=70?T.green:v>=50?T.amber:T.red);
            return <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,fontFamily:F.b,marginBottom:5}}><span>{label}{k==="risk"?" (higher = safer)":""}</span><span style={{fontFamily:F.m,fontWeight:800,color:c}}>{v}</span></div>
              <input type="range" min={0} max={100} value={v} onChange={e=>setDim(k,parseInt(e.target.value,10))} style={{width:"100%",accentColor:AI_GOLD,cursor:"pointer"}}/>
            </div>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:16,border:`1px solid ${recColor}45`}}>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Recommendation</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <Ring score={avg} color={recColor} size={62}/>
            <div><div style={{fontSize:22,fontWeight:900,color:recColor,fontFamily:F.h}}>{rec}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Composite {avg}/100</div></div>
          </div>
          <p style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.6,margin:0}}>{rec==="Scale"?"Strong across stakeholders - ready for a governed scale decision.":rec==="Continue"?"Healthy - keep operating and monitoring.":rec==="Improve"?"Mixed signal - remediate before any scale decision.":"Weak or unsafe - a governed retirement decision is indicated."}</p>
        </Card>
        <Card style={{padding:16}}>
          <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>The recommendation is advisory. The accountable executive still records the governed decision in <button onClick={()=>setInitTab("decision")} style={{background:"transparent",border:"none",color:rc,fontWeight:900,fontFamily:F.b,fontSize:11,cursor:"pointer",padding:0}}>Scale / Retire</button>.</div>
        </Card>
      </div>
    </div>;
  };

  const DecisionPanel=()=>{
    const existing=decisions[selected.id];
    const fRec=feedbackDecision(feedback[selected.id]||DEFAULT_FEEDBACK);
    const isTerminal=TERMINAL_LIFECYCLE.has(selected.lifecycle)||!!existing;
    const readiness=Math.round((selected.guardrail+selected.adoption+selected.valueScore)/3);
    const canScale=readiness>=70&&!selected.blockedBy;
    const signals=[
      ["Guardrail compliance",selected.guardrail,selected.guardrail>=80?T.green:selected.guardrail>=70?T.amber:T.red],
      ["Adoption",selected.adoption,selected.adoption>=70?T.green:T.amber],
      ["Business value",selected.valueScore,selected.valueScore>=75?T.green:T.amber],
      ["Composite readiness",readiness,readiness>=70?T.green:T.amber],
    ];
    return <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14}}>
      <Card style={{padding:18}}>
        <Tag label="GOVERNED DECISION" color={AI_GOLD} bg={AI_GOLD_L}/>
        <h3 style={{fontSize:18,color:T.ink,fontWeight:800,fontFamily:F.h,margin:"10px 0 4px"}}>Scale or retire {selected.name}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:"0 0 12px"}}>AI Central plans, governs and monitors every initiative, then makes an accountable decision to scale or retire it. Retirement always records a reason - an initiative is never retired silently.</p>
        <div style={{display:"flex",alignItems:"center",gap:9,background:decisionColorOf(fRec,T)+"12",border:`1px solid ${decisionColorOf(fRec,T)}35`,borderRadius:9,padding:"9px 12px",marginBottom:12}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:decisionColorOf(fRec,T),flexShrink:0}}/>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>Feedback engine recommends <strong style={{color:decisionColorOf(fRec,T)}}>{fRec}</strong>. <button onClick={()=>setInitTab("feedback")} style={{background:"transparent",border:"none",color:rc,fontWeight:900,fontFamily:F.b,fontSize:11,cursor:"pointer",padding:0}}>Review feedback</button></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginBottom:8}}>
          {signals.map(([l,v,c])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:11}}>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div>
            <Bar value={v} color={c}/><div style={{fontSize:12,color:T.ink,fontFamily:F.m,fontWeight:800,marginTop:6}}>{v}%</div>
          </div>)}
        </div>
        {selected.blockedBy&&!isTerminal&&<div style={{fontSize:11,color:T.amber,fontFamily:F.b,marginTop:4}}>Open blocker: {selected.blockedBy}. Resolve before scaling.</div>}
      </Card>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        {existing?<Card style={{padding:16,border:`1px solid ${(existing.outcome==="Scale"?T.green:T.red)}45`}}>
          <Tag label={existing.outcome==="Scale"?"DECISION: SCALE":"DECISION: RETIRE"} color={existing.outcome==="Scale"?T.green:T.red} bg={(existing.outcome==="Scale"?T.green:T.red)+"16"}/>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.7,marginTop:10}}>
            {existing.reason&&<div><strong style={{color:T.ink}}>Reason:</strong> {existing.reason}</div>}
            {existing.rationale&&<div style={{marginTop:4}}><strong style={{color:T.ink}}>Rationale:</strong> {existing.rationale}</div>}
            <div style={{marginTop:4}}><strong style={{color:T.ink}}>Decided by:</strong> {existing.decidedBy} - {existing.at}</div>
          </div>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10}}>Recorded as a governed decision and captured in Trust &amp; Evidence.</div>
        </Card>:<>
          <Card style={{padding:16,border:`1px solid ${T.green}35`}}>
            <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>Approve to scale</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>Readiness, evidence and value support expanding this initiative to the next wave.</p>
            <button disabled={!canScale} onClick={()=>decide("Scale")} style={{width:"100%",background:canScale?T.green:T.s3,border:`1px solid ${canScale?T.green:T.border}`,borderRadius:8,padding:"10px",color:canScale?"#fff":T.ink4,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:canScale?"pointer":"not-allowed"}}>{canScale?"Approve to scale":"Readiness below scale threshold"}</button>
          </Card>
          <Card style={{padding:16,border:`1px solid ${T.red}35`}}>
            <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>Retire initiative</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>Retirement is careful and accountable. Record why this AI initiative, agent or AIMS is being retired.</p>
            <label style={{display:"grid",gap:5,marginBottom:9}}>
              <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Retirement reason</span>
              <select value={retireDraft.reason} onChange={e=>setRetireDraft({...retireDraft,reason:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>
                {RETIREMENT_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label style={{display:"grid",gap:5,marginBottom:10}}>
              <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Rationale</span>
              <textarea value={retireDraft.rationale} onChange={e=>setRetireDraft({...retireDraft,rationale:e.target.value})} rows={3} placeholder="Evidence and context for the retirement decision" style={{...fieldStyle,resize:"vertical",lineHeight:1.5}}/>
            </label>
            <button disabled={!retireDraft.rationale.trim()} onClick={()=>decide("Retire",retireDraft.reason,retireDraft.rationale.trim())} style={{width:"100%",background:retireDraft.rationale.trim()?T.red:T.s3,border:`1px solid ${retireDraft.rationale.trim()?T.red:T.border}`,borderRadius:8,padding:"10px",color:retireDraft.rationale.trim()?"#fff":T.ink4,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:retireDraft.rationale.trim()?"pointer":"not-allowed"}}>Record retirement decision</button>
          </Card>
        </>}
      </div>
    </div>;
  };

  /* ── Initiative context tabs: derived views over the initiative's own
        data. Risks are owned here and aggregated by Risk Center. ── */
  const InitRisks=()=>{
    const rows=riskRegister.filter(r=>r.initiativeId===selected.id);
    const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
    return <Card style={{padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:0}}>Initiative risks - a view of the Risk Center register</h3>
      <button onClick={()=>setTab&&setTab("riskcenter")} style={{background:T.red+"14",border:`1px solid ${T.red}40`,borderRadius:7,padding:"5px 11px",color:T.red,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Risk Center →</button>
    </div>
    <div style={{display:"grid",gap:8}}>
      {rows.map(r=><div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px"}}>
        <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{r.id} · {r.title}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Risk owner: {r.riskOwner} · Treatment: {r.treatment.strategy} ({r.treatment.status}) · Controls: {r.controls.join(", ")}</div></div>
        <Tag label={r.level} color={lvC(r.level)} bg={lvC(r.level)+"16"}/>
        <Tag label={`Residual ${r.residual}/25`} color={r.residual<=6?T.green:T.amber} bg={(r.residual<=6?T.green:T.amber)+"14"}/>
      </div>)}
      {rows.length===0&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>No risks registered for this initiative yet - raise one in the Risk Center.</div>}
      {selected.blockedBy&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b}}><strong style={{color:T.red}}>Open blocker:</strong> {selected.blockedBy}</div>}
    </div>
  </Card>;};
  const InitEvidence=()=>{
    const rows=evidenceRows.filter(e=>e.initiative===selected.name);
    return <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>Evidence for this initiative</h3><Tag label={`${rows.length} records`} color={AI_GOLD} bg={AI_GOLD+"16"}/></div>
      {rows.length===0&&<div style={{padding:"18px",fontSize:11,color:T.ink3,fontFamily:F.b}}>No evidence yet - completed phase artifacts and decisions will appear here automatically.</div>}
      {rows.map(e=><div key={`${e.item}-${e.time}`} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr auto",gap:12,padding:"12px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div><div style={{fontSize:12,color:T.ink,fontWeight:700}}>{e.item}</div><div style={{fontSize:9,color:T.ink3}}>Control: {e.control}</div></div>
        <span style={{fontSize:10,color:T.ink2}}>Owner: {e.owner}</span>
        <div style={{display:"flex",gap:6}}><STag s={e.status}/><STag s={e.approval}/></div>
      </div>)}
      <div style={{padding:"10px 18px"}}><button onClick={()=>setView("evidence")} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open the enterprise repository →</button></div>
    </Card>;
  };
  const InitControls=()=><Card style={{padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:0}}>Activated controls & policies</h3>
      <Ring score={selected.guardrail} color={selected.guardrail>=80?T.green:T.amber} size={44}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Controls</div>
        {selected.controls.length?selected.controls.map(c=><div key={c} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{width:7,height:7,borderRadius:"50%",background:T.green}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.m}}>{c}</span></div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>No controls activated yet - assigned in the Design phase.</div>}
      </div>
      <div>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Policies</div>
        {selected.policies.length?selected.policies.map(c=><div key={c} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{width:7,height:7,borderRadius:"50%",background:T.blue}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{c}</span></div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>No policies mapped yet.</div>}
      </div>
    </div>
    <button onClick={()=>setView("governance")} style={{marginTop:12,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open AI Governance →</button>
  </Card>;
  const InitApprovals=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>Phase approvals</h3>
    <div style={{display:"grid",gap:7}}>
      {AC_PHASES.map((ph,idx)=>{
        const st=idx<selected.phaseIndex?"Approved":idx===selected.phaseIndex?(selected.blockedBy?"Blocked":"In review"):"Pending";
        const c=st==="Approved"?T.green:st==="Blocked"?T.red:st==="In review"?T.amber:T.ink4;
        return <div key={ph.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
          <span style={{fontSize:11,color:T.ink,fontWeight:700,fontFamily:F.b}}>Phase {ph.order}: {ph.name}</span>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Accountable: {ph.raci.accountable}</span>
          <Tag label={st} color={c} bg={c+"16"}/>
        </div>;
      })}
    </div>
    <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10}}>Human-in-the-loop items for this initiative appear in the Decisions queue.</div>
  </Card>;
  const InitROI=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>Return on investment</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
      {[["Expected ROI",selected.roi,T.green],["Value realized",`${selected.actual} / ${selected.expected}`,AI_GOLD],["Cost savings",selected.savings,T.green],["Revenue impact",selected.revenue,T.teal],["Productivity",selected.productivity,T.blue]].map(([l,v,c])=><div key={l} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:6}}>{l}</div>
        <div style={{fontSize:17,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
      </div>)}
    </div>
    <Bar value={selected.valueScore} color={selected.valueScore>80?T.green:T.amber}/>
    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>Business value score {selected.valueScore}% - feeds the Value Center and the scale decision.</div>
  </Card>;
  const InitAdoption=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>Adoption & workforce readiness</h3>
    <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
      <Ring score={selected.adoption} color={selected.adoption>=70?T.green:T.amber} size={72}/>
      <div style={{flex:1,minWidth:220}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,fontFamily:F.b,marginBottom:5}}><span>Training completion</span><span style={{fontFamily:F.m}}>{selected.training}</span></div>
        <Bar value={parseInt(selected.training)||0} color={(parseInt(selected.training)||0)>75?T.green:T.amber}/>
        <div style={{marginTop:10}}><Tag label={`Resistance: ${selected.resistance}`} color={selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green} bg={(selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green)+"14"}/></div>
      </div>
    </div>
    <button onClick={()=>{setView("academy");}} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Assign learning in Governance Academy →</button>
  </Card>;
  const InitLessons=()=>{
    const linked=knowledgeAssets.filter(k=>k.sourceRef.includes(selected.id)||k.title.toLowerCase().includes(selected.name.split(" ")[0].toLowerCase()));
    return <Card style={{padding:16}}>
      <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>Lessons learned</h3>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 12px"}}>Knowledge captured from this initiative feeds the enterprise Knowledge Engine and every future rollout. Formal knowledge capture is a mandatory artifact of the Scale or Retire phase.</p>
      {linked.length?linked.map(k=><div key={k.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",marginBottom:7}}>
        <div><div style={{fontSize:12,color:T.ink,fontWeight:700,fontFamily:F.b}}>{k.title}</div><div style={{fontSize:9,color:T.ink3}}>{k.sourceRef}</div></div>
        <Tag label={k.kind} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:10,color:AI_GOLD,fontFamily:F.m,fontWeight:800}}>{k.reuseCount} reuses</span>
      </div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"12px"}}>No knowledge captured from this initiative yet - it is generated at the Scale/Retire gate.</div>}
    </Card>;
  };

  /* ── AI Initiative Workspace: Mission Control ─────────────────
     Six tabs, one business object. Everything below derives from the
     selected initiative record and its linked register, feedback,
     assessment and evidence data. */
  const wsRisks=riskRegister.filter(r=>r.initiativeId===selected.id);
  const wsFb=feedback[selected.id]||DEFAULT_FEEDBACK;
  const wsRec=feedbackDecision(wsFb);
  const wsRecC=decisionColorOf(wsRec,T);
  const wsHealth=Math.round((selected.guardrail+selected.adoption+selected.valueScore)/3);
  const wsRiskScore=wsRisks.length?Math.max(...wsRisks.map(r=>r.residual)):0;
  const wsEvidence=phaseProgress(selected);
  const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
  const wsRoiPct=Math.min(100,Math.round((money(selected.actual)/(money(selected.expected)||1))*100));
  const wsPhase=AC_PHASES[selected.phaseIndex];
  const wsMissing=wsPhase?wsPhase.deliverables.slice(selected.phaseArtifactsDone):[];
  const wsApprovalsLeft=wsMissing.filter(d=>/approval|decision|sign-off/i.test(d));
  const wsCrit=wsRisks.filter(r=>r.level==="Critical"||r.level==="High");
  const wsRemainingPhases=AC_PHASES.length-selected.phaseIndex;
  const wsNextAction=selected.blockedBy?`Resolve the blocker: ${selected.blockedBy}`:wsMissing.length?`Complete "${wsMissing[0]}" in ${wsPhase.name}`:`Advance to ${AC_PHASES[selected.phaseIndex+1]?.name||"the scale gate"}`;
  const wsConfidence=Math.min(98,Math.round((wsEvidence+selected.guardrail)/2));
  const wsBriefing=()=>{
    const L=["# Executive Briefing - "+selected.name,"",`${selected.unit} · ${selected.category} · Sponsor ${selected.sponsor}`,"",
      "## Where it stands",`- Phase: ${selected.phaseIndex+1}/${AC_PHASES.length} (${wsPhase?.name}) - ${wsEvidence}% evidence complete`,
      `- Overall health ${wsHealth}/100 · governance ${selected.guardrail}% · adoption ${selected.adoption}% · business value ${selected.valueScore}%`,
      `- Risk: ${selected.risk} inherent; worst residual ${wsRiskScore}/25 across ${wsRisks.length} registered risks`,
      `- Value: ${selected.actual} realized of ${selected.expected} expected (${wsRoiPct}%) · ROI ${selected.roi}`,"",
      "## Blockers & approvals",selected.blockedBy?`- BLOCKED: ${selected.blockedBy}`:"- No open blockers",
      ...wsApprovalsLeft.map(a=>`- Approval outstanding: ${a}`),"",
      "## Top risks",...wsRisks.slice(0,4).map(r=>`- ${r.id} ${r.title} (${r.level}) - treatment ${r.treatment.status}`),"",
      "## Recommendation",`- Veris Intelligence recommends: **${wsRec}** (confidence ${wsConfidence}%)`,
      `- Next action: ${wsNextAction}`,
      `- Estimated completion: ~${wsRemainingPhases*3} weeks at current cadence (${wsRemainingPhases} phases remaining)`];
    vzDownload(`briefing-${selected.id}.md`,L.join("\n"));
    showToast&&showToast("Executive briefing generated from live initiative data");
  };
  const MissionHeader=()=>{
    const stats=[
      ["Phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,wsPhase?.name,T.blue,"journey"],
      ["Health",wsHealth,"guardrail + adoption + value",wsHealth>=80?T.green:wsHealth>=60?T.amber:T.red,"overview"],
      ["Governance",`${selected.guardrail}%`,"control coverage",selected.guardrail>=80?T.green:T.amber,"governance"],
      ["Risk",wsRiskScore?`${wsRiskScore}/25`:"none","worst residual",wsRiskScore>=10?T.red:wsRiskScore>=6?T.amber:T.green,"risk"],
      ["Evidence",`${wsEvidence}%`,"lifecycle completion",wsEvidence>=70?T.green:T.amber,"evidence"],
      ["ROI",`${wsRoiPct}%`,`${selected.actual} of ${selected.expected}`,AI_GOLD,"overview"],
      ["Value",`${selected.valueScore}%`,"business value score",T.violet,"overview"],
    ];
    return <Card style={{padding:"14px 16px",marginBottom:12,border:`1px solid ${wsRecC}35`}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
        {stats.map(([l,v,sub,c,tabTo])=><button key={l} onClick={()=>setInitTab(tabTo)} title={`Open ${tabTo}`} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{l}</div>
          <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.b,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</div>
        </button>)}
        <button onClick={()=>setInitTab("insights")} style={{background:wsRecC+"12",border:`1px solid ${wsRecC}45`,borderRadius:9,padding:"9px 11px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:wsRecC,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Recommendation</div>
          <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:wsRecC}}>{wsRec}</div>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.b,marginTop:2}}>confidence {wsConfidence}%</div>
        </button>
      </div>
    </Card>;
  };
  const InitJourney=()=><div>
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>Mission timeline</h3>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>~{wsRemainingPhases*3} weeks to completion at current cadence · {wsRemainingPhases} phases remaining</span>
      </div>
      <div style={{display:"flex",gap:0,alignItems:"flex-start",flexWrap:"wrap",marginBottom:14}}>
        {AC_PHASES.map((ph,idx)=>{
          const state=idx<selected.phaseIndex?"done":idx===selected.phaseIndex?"active":"next";
          const c=state==="done"?T.green:state==="active"?AI_GOLD:T.ink4;
          return <div key={ph.id} style={{display:"flex",alignItems:"center"}}>
            <div style={{textAlign:"center",width:74}}>
              <div style={{width:state==="active"?26:18,height:state==="active"?26:18,borderRadius:"50%",margin:"0 auto",background:state==="done"?T.green:state==="active"?AI_GOLD+"22":"transparent",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:state==="active"?10:8,fontWeight:900,color:state==="done"?"#fff":c,boxShadow:state==="active"?`0 0 16px ${AI_GOLD}55`:"none"}}>{state==="done"?"✓":idx+1}</div>
              <div style={{fontSize:8,color:state==="active"?AI_GOLD:T.ink4,fontFamily:F.m,fontWeight:state==="active"?900:600,marginTop:4}}>{ph.name}</div>
            </div>
            {idx<AC_PHASES.length-1&&<div style={{width:10,height:2,background:idx<selected.phaseIndex?T.green:T.border,marginTop:-12}}/>}
          </div>;
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
        <div style={{background:selected.blockedBy?T.redL:T.s2,border:`1px solid ${selected.blockedBy?T.red+"40":T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:selected.blockedBy?T.red:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Current blockers</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{selected.blockedBy||"None - the phase gate is clear."}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Remaining approvals</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsApprovalsLeft.length?wsApprovalsLeft.join(" · "):"None in this phase."}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Missing evidence ({wsMissing.length})</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsMissing.length?wsMissing.join(" · "):"Phase artifacts complete."}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Critical risks</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsCrit.length?wsCrit.map(r=>r.id).join(", ")+" - open the Risk tab":"None above appetite."}</div>
        </div>
      </div>
      <button onClick={()=>{if(selected.blockedBy)setInitTab("risk");else setInitTab("evidence");}} style={{marginTop:12,background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"10px 14px",color:AI_GOLD,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Next action: {wsNextAction} →</button>
    </Card>
    <Implementation/>
  </div>;
  const InitEvidenceTimeline=()=><div>
    <Card style={{padding:"13px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Audit readiness</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:wsEvidence>=70?T.green:T.amber}}>{wsEvidence}%</div>
      </div>
      <div style={{flex:"1 1 260px"}}><Bar value={wsEvidence} color={wsEvidence>=70?T.green:T.amber}/></div>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Evidence completeness across the lifecycle - missing artifacts highlighted below</span>
    </Card>
    <div style={{display:"grid",gap:8,marginBottom:12}}>
      {AC_PHASES.map((ph,idx)=>{
        const state=idx<selected.phaseIndex?"done":idx===selected.phaseIndex?"active":"next";
        if(state==="next"&&idx>selected.phaseIndex+1)return null;
        const doneCount=state==="done"?ph.deliverables.length:state==="active"?selected.phaseArtifactsDone:0;
        const c=state==="done"?T.green:state==="active"?AI_GOLD:T.ink4;
        return <Card key={ph.id} style={{padding:"12px 15px",borderLeft:`3px solid ${c}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{idx+1}. {ph.name}</span>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{doneCount}/{ph.deliverables.length} artifacts · owner {ph.raci.responsible}</span>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {ph.deliverables.map((d,di)=>{
              const has=di<doneCount;
              return <button key={d} onClick={()=>{if(has){setView("evidence");}else{setInitTab("journey");}}} title={has?"Open in Trust & Evidence":"Missing - complete in the Journey"} style={{background:has?T.green+"12":T.red+"0d",border:`1px solid ${has?T.green+"40":T.red+"35"}`,borderRadius:6,padding:"3px 9px",color:has?T.green:T.red,fontSize:9.5,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{has?"✓":"!"} {d}</button>;
            })}
          </div>
        </Card>;
      })}
    </div>
    <InitEvidence/>
  </div>;
  const InitInsights=()=><div>
    <Card style={{padding:16,marginBottom:12,border:`1px solid ${wsRecC}40`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:AI_GOLD,boxShadow:`0 0 12px ${AI_GOLD}`,animation:"pulse 2.4s infinite"}}/>
          <span style={{fontSize:9,fontWeight:900,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:F.m}}>Veris Intelligence · Executive Advisor</span>
        </div>
        <button onClick={wsBriefing} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"9px 14px",color:"#111",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Generate Executive Briefing ↓</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
        <Tag label={`Recommend: ${wsRec}`} color={wsRecC} bg={wsRecC+"16"}/>
        <Tag label={`Confidence ${wsConfidence}%`} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:9,color:T.green,fontFamily:F.m,fontWeight:900}}>SOURCE: INTERNAL - initiative record, register, feedback engine, phase evidence</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
        {[["Reason",`Stakeholder feedback averages ${Math.round(Object.values(wsFb).reduce((a,b)=>a+b,0)/7)}/100 with risk scored ${wsFb.risk}/100; governance ${selected.guardrail}% and adoption ${selected.adoption}% ${wsRec==="Scale"?"clear":"do not yet clear"} the gate thresholds.`],
          ["Supporting evidence",`${wsEvidence}% lifecycle evidence complete through ${wsPhase?.name}; controls ${selected.controls.join(", ")}; policies ${selected.policies.join(", ")}.`],
          ["Business value",`${selected.actual} realized of ${selected.expected} expected (${wsRoiPct}%). ROI ${selected.roi}, productivity ${selected.productivity}.`],
          ["Risk impact",wsRisks.length?`${wsRisks.length} registered risks; worst residual ${wsRiskScore}/25 (${wsRisks[0].id}). ${wsCrit.length?wsCrit.length+" above appetite.":"All within appetite."}`:"No registered risks."],
          ["Expected outcome",wsRec==="Scale"?`Expansion unlocks the remaining ${(money(selected.expected)-money(selected.actual)).toFixed(1)}M of expected value.`:wsRec==="Retire"?"Retirement frees budget and removes unrewarded risk exposure.":`Continuing the current phase protects ${selected.expected} of expected value while gaps close.`],
          ["Decision required",wsRec==="Scale"||wsRec==="Retire"?`Record the ${wsRec} decision below - it will mint an audit-grade decision record.`:"No gate decision required yet - clear the next action in the Journey."],
        ].map(([l,v])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{l}</div>
          <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{v}</div>
        </div>)}
      </div>
    </Card>
    <PageAISpine mode="scalegate" setTab={setTab} focus={selected}/>
    <div style={{marginTop:12}}><DecisionPanel/></div>
    <div style={{marginTop:12}}><FeedbackPanel/></div>
    <div style={{marginTop:12}}><InitLessons/></div>
  </div>;
  const WS_LEGACY={implementation:"journey",risks:"risk",controls:"governance",approvals:"governance",pilot:"journey",roi:"overview",adoption:"overview",feedback:"insights",lessons:"insights",decision:"insights"};
  const wsTab=WS_LEGACY[initTab]||initTab;
  const Initiatives=()=>initTab==="list"?<InitiativeList/>:<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
      <button onClick={()=>setInitTab("list")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>&#8592; Portfolio</button>
      <div style={{minWidth:0}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <h3 style={{fontSize:18,color:T.ink,fontWeight:800,margin:0,fontFamily:F.h}}>{selected.name}</h3>
          <Tag label={selected.lifecycle} color={catColor(selected.lifecycle)} bg={catColor(selected.lifecycle)+"16"}/><PTag p={selected.risk}/>
        </div>
        <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:3}}>{selected.unit} - {selected.category} - Sponsor: {selected.sponsor}</div>
      </div>
    </div>
    <MissionHeader/>
    <SubTabs tabs={[["overview","Overview"],["journey","Journey"],["governance","Governance"],["risk","Risk"],["evidence","Evidence"],["insights","Insights"]]} active={wsTab} onChange={setInitTab}/>
    {wsTab==="overview"&&<div><Overview/><div style={{marginTop:14}}><InitROI/></div><div style={{marginTop:14}}><InitAdoption/></div><div style={{marginTop:14}}><PageAISpine mode="dna" setTab={setTab} focus={selected}/></div></div>}
    {wsTab==="journey"&&<InitJourney/>}
    {wsTab==="governance"&&<div><RiskAssessmentCascade setTab={setTab} fixed={selected.id}/><div style={{marginTop:12}}><InitControls/></div><div style={{marginTop:12}}><InitApprovals/></div></div>}
    {wsTab==="risk"&&<div><InitRisks/><div style={{marginTop:12}}><PilotExecution/></div></div>}
    {wsTab==="evidence"&&<InitEvidenceTimeline/>}
    {wsTab==="insights"&&<InitInsights/>}
  </div>;

  /* ── AI Governance ─────────────────────────────────────────── */
  const Governance=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Governance score" value={avgGuard+"%"} sub="Portfolio control compliance" color={rc} score={avgGuard}/>
      {AC_FRAMEWORK_POSTURE.filter(f=>["iso42001","nist","euai"].includes(f.id)).map(f=><Metric key={f.id} label={f.name} value={f.score+"%"} sub={f.sub} color={f.score>=75?T.blue:f.score>=70?T.teal:T.amber} score={f.score} onClick={()=>setGovTab("controls")}/>)}
      <Metric label="Policy violations" value="3" sub="1 repeated - training assigned" color={T.red} onClick={()=>openModule("academy")}/>
      <Metric label="Active exceptions" value="4" sub="2 expiring this month" color={T.amber} onClick={()=>{setTab("hitl");}}/>
    </div>
    <SubTabs tabs={[["controls","Controls & Guardrails"],["matrix","Control Matrix"],["drift","Risk Drift"]]} active={govTab} onChange={setGovTab}/>
    {govTab==="controls"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
      {acGuardrails.map((g,idx)=><Card key={g.cat} style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{fontSize:14,color:T.ink,margin:0}}>{g.cat} Guardrails</h3><Ring score={[92,84,78,74,81,69,88][idx]} color={[T.green,T.blue,T.amber,T.amber,T.teal,T.red,T.green][idx]} size={46}/></div>
        {g.items.map((it,j)=><div key={it} style={{display:"flex",gap:8,alignItems:"center",padding:"7px 0",borderTop:j?"1px solid "+T.border:"none"}}><span style={{width:7,height:7,borderRadius:"50%",background:j<3?T.green:T.amber}}/><span style={{fontSize:11,color:T.ink2}}>{it}</span></div>)}
        <button onClick={()=>{setLifecycleFilter("All");openInitiative(items[idx%items.length].id);}} style={{marginTop:12,background:"transparent",border:"none",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Linked to {items.length} initiatives &#8594;</button>
      </Card>)}
    </div>}
    {govTab==="matrix"&&<PageAISpine mode="controlmatrix" setTab={setTab}/>}
    {govTab==="drift"&&<PageAISpine mode="riskdrift" setTab={setTab}/>}
  </div>;

  /* ── Trust & Evidence ──────────────────────────────────────── */
  const q=evQuery.trim().toLowerCase();
  const evFiltered=evidenceRows.filter(e=>
    (evScope==="All"||e.scope===evScope)&&
    (!q||[e.item,e.initiative,e.control,e.owner,e.risk].join(" ").toLowerCase().includes(q))
  );
  const EvidenceModule=()=><div>
    <SubTabs tabs={[["repository","Evidence Repository"],["confidence","Evidence Confidence"]]} active={evTab} onChange={setEvTab}/>
    {evTab==="repository"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div><h3 style={{margin:0,fontSize:15,color:T.ink}}>Enterprise Evidence Repository</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>Everything searchable. Everything versioned. Nothing duplicated.</p></div>
        <input value={evQuery} onChange={e=>setEvQuery(e.target.value)} placeholder="Search evidence, controls, owners..." style={{...fieldStyle,maxWidth:280,marginLeft:"auto"}}/>
        <div style={{display:"flex",gap:5}}>
          {["All","Project","Business Unit","Organization"].map(s=><button key={s} onClick={()=>setEvScope(s)} style={{background:evScope===s?rc+"20":T.s2,border:`1px solid ${evScope===s?rc+"55":T.border}`,color:evScope===s?rc:T.ink3,borderRadius:7,padding:"6px 9px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{s}</button>)}
        </div>
        <Tag label={`${evFiltered.length} items`} color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      {evFiltered.map(e=><div key={`${e.item}-${e.time}`} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr 1fr",gap:12,padding:"14px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div><div style={{fontSize:13,color:T.ink,fontWeight:700}}>{e.item} <span style={{fontSize:9,color:rc,fontFamily:F.m,border:`1px solid ${rc}40`,borderRadius:5,padding:"1px 5px",marginLeft:4}}>{e.version||"v1"}</span></div><div style={{fontSize:10,color:T.ink3}}>{e.initiative} - {e.scope||"Project"}</div></div>
        <div style={{fontSize:11,color:T.ink2}}>Control: {e.control}<br/>Risk: {e.risk}</div>
        <div style={{fontSize:11,color:T.ink2}}>Owner: {e.owner}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><STag s={e.status}/><STag s={e.approval}/><Tag label={e.time} color={T.ink3}/></div>
      </div>)}
      {evFiltered.length===0&&<div style={{padding:"28px 18px",textAlign:"center",fontSize:12,color:T.ink3,fontFamily:F.b}}>No evidence matches this search.</div>}
    </Card>}
    {evTab==="confidence"&&<PageAISpine mode="evidenceconfidence" setTab={setTab}/>}
  </div>;

  /* ── AI Gateway ────────────────────────────────────────────── */
  const gwActionColor=a=>a==="Allowed"?T.green:a==="Redacted"?T.amber:a==="Escalated"?T.blue:T.red;
  const GatewayConfig=()=><div>
    {adminTab==="providers"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>Provider configuration</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>Vendor neutral and configuration driven - adding a provider is configuration, never a redesign.</p></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>{["Provider","Connection","Models","Allowed units","Region","Latency","Role"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
        <tbody>{gatewayProviders.map((pv,idx)=><tr key={pv.id} style={{borderBottom:"1px solid "+T.border}}>
          <td style={{padding:"11px 12px",color:T.ink,fontWeight:700}}>{pv.name}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{pv.kind}</div></td>
          <td style={{padding:"11px 12px"}}><Tag label={pv.status==="Blocked"?"Disconnected":"Connected"} color={pv.status==="Blocked"?T.red:T.green} bg={(pv.status==="Blocked"?T.red:T.green)+"14"}/></td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:11}}>{pv.models.join(", ")}</td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:10}}>{pv.status==="Approved"?"All units":"Pilot units only"}</td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:10}}>{idx%2===0?"EU / US":"US"}</td>
          <td style={{padding:"11px 12px",color:T.ink3,fontFamily:F.m,fontSize:10}}>{180+idx*45}ms</td>
          <td style={{padding:"11px 12px"}}>{idx===1?<Tag label="Default" color={AI_GOLD} bg={AI_GOLD+"16"}/>:idx===6?<Tag label="Fallback" color={T.blue} bg={T.blue+"16"}/>:<span style={{fontSize:10,color:T.ink4}}>-</span>}</td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {adminTab==="routing"&&<Card style={{padding:16}}>
      <h3 style={{fontSize:14,color:T.ink,margin:"0 0 4px"}}>Routing policy</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Every request follows configurable routing by business unit and risk class. High-risk workloads never leave the enterprise.</p>
      <div style={{display:"grid",gap:8}}>
        {gatewayRouting.map(r=>{const pv=gatewayProviders.find(x=>x.id===r.providerId);return <div key={r.id} style={{display:"grid",gridTemplateColumns:"160px auto 1fr",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <span style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{r.scope}</span>
          <Tag label={pv?.name||r.providerId} color={r.scope==="High Risk"?T.red:AI_GOLD} bg={(r.scope==="High Risk"?T.red:AI_GOLD)+"14"}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{r.reason}</span>
        </div>;})}
      </div>
    </Card>}
    {adminTab==="guardrails"&&<Card style={{padding:16}}>
      <h3 style={{fontSize:14,color:T.ink,margin:"0 0 4px"}}>Guardrail detectors</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Every prompt is inspected before any model call. Actions are configurable per detector: allow, warn, require justification, mask, redact, block or escalate.</p>
      <div style={{display:"grid",gap:8}}>
        {guardrailDetectors.map(d=>{const c=d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:d.action==="Require justification"?T.blue:T.green;return <div key={d.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <div><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{d.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Triggered {d.triggeredMtd.toLocaleString()}x MTD</div></div>
          <Tag label={d.action} color={c} bg={c+"16"}/>
        </div>;})}
      </div>
    </Card>}
    {adminTab==="modes"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10,marginBottom:14}}>
        {deploymentModes.map(m=><Card key={m.id} style={{padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{m.name}</div><Tag label={m.status} color={m.status==="Active"?T.green:m.status==="Available"?T.blue:T.ink3} bg={(m.status==="Active"?T.green:m.status==="Available"?T.blue:T.ink3)+"14"}/></div>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{m.desc}</p>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,margin:"0 0 10px"}}>Retention & compliance configuration</h3>
        {gatewayRetention.map(r=><div key={r.setting} style={{display:"grid",gridTemplateColumns:"200px auto 1fr",gap:12,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:700}}>{r.setting}</span>
          <Tag label={r.value} color={AI_GOLD} bg={AI_GOLD+"14"}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{r.note}</span>
        </div>)}
      </Card>
    </div>}
    {adminTab==="knowledge"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>Internal Knowledge Engine</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>Enterprise knowledge searched before any prompt reaches a model. Every approved artifact can graduate into this repository.</p></div>
      {knowledgeAssets.map(k=><div key={k.id} style={{display:"grid",gridTemplateColumns:"1.3fr auto 1fr auto",gap:12,padding:"11px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div style={{fontSize:12,color:T.ink,fontWeight:700}}>{k.title}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{k.sourceRef}</div></div>
        <Tag label={k.kind} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>Added by {k.addedBy}</span>
        <span style={{fontSize:10,color:AI_GOLD,fontFamily:F.m,fontWeight:800}}>{k.reuseCount} reuses</span>
      </div>)}
    </Card>}
  </div>;

  const ADMIN_TABS=[["providers","Providers"],["routing","Routing"],["guardrails","Guardrails"],["knowledge","Knowledge Engine"],["modes","Modes & Retention"]];
  const adminTab=ADMIN_TABS.some(([id])=>id===gwTab)?gwTab:"providers";
  const Administration=()=><div>
    <SubTabs tabs={ADMIN_TABS} active={adminTab} onChange={setGwTab}/>
    <GatewayConfig/>
  </div>;
  const [pfTab,setPfTab]=useState("units");
  const Portfolio=()=><div>
    <SubTabs tabs={[["units","Business Units"],["registry","Model Registry"],["maturity","Governance Maturity"],["usecases","Use Case Pipeline"]]} active={pfTab} onChange={setPfTab}/>
    {pfTab==="units"&&<PortfolioUnits setView={setView}/>}
    {pfTab==="registry"&&<PageModelRegistry setTab={setTab}/>}
    {pfTab==="maturity"&&<PageMaturityRadar/>}
    {pfTab==="usecases"&&<PageUseCases/>}
  </div>;
  const Gateway=()=><div>
    {<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Requests MTD" value={gatewayStats.requestsMtd} sub="All AI interactions governed" color={rc}/>
      <Metric label="Tokens MTD" value={gatewayStats.tokensMtd} sub="Across all providers" color={T.blue}/>
      <Metric label="Cost MTD" value={gatewayStats.costMtd} sub="FinOps monitored" color={T.green}/>
      <Metric label="Blocked" value={gatewayStats.blockedMtd} sub="Policy enforcement actions" color={T.red}/>
      <Metric label="Avg prompt risk" value={gatewayStats.avgRiskScore} sub="0-100 risk scoring" color={T.teal} score={gatewayStats.avgRiskScore}/>
    </div>
    <div style={{background:AI_GOLD_L,border:`1px solid ${AI_GOLD}35`,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>
      <strong style={{color:AI_GOLD}}>AI Gateway is the enterprise control plane.</strong> Every AI interaction passes through it - prompt filtering, PII detection, policy enforcement, model routing and cost control. Employee Workspace consumes the Gateway; it never bypasses it.
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14,marginBottom:14}}>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>Model providers &amp; routing</h3></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>{["Provider","Status","Approved models","Routed","Cost MTD"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
          <tbody>{gatewayProviders.map(p=><tr key={p.id} style={{borderBottom:"1px solid "+T.border}}>
            <td style={{padding:"11px 12px",color:T.ink,fontWeight:700}}>{p.name}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{p.kind}</div></td>
            <td style={{padding:"11px 12px"}}><Tag label={p.status} color={p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red} bg={(p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red)+"16"}/></td>
            <td style={{padding:"11px 12px",color:T.ink2,fontSize:11}}>{p.models.join(", ")}</td>
            <td style={{padding:"11px 12px",minWidth:90}}><Bar value={p.routedShare} color={rc}/><div style={{fontSize:9,color:T.ink3,marginTop:4}}>{p.routedShare}%</div></td>
            <td style={{padding:"11px 12px",color:T.ink2,fontFamily:F.m}}>{p.costMtd}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,margin:"0 0 12px"}}>Enforcement policies</h3>
        <div style={{display:"grid",gap:8}}>
          {gatewayPolicies.map(p=><div key={p.id} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
            <div style={{minWidth:0}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{p.category} - triggered {p.triggeredMtd.toLocaleString()}x MTD</div></div>
            <Tag label={p.enforcement} color={p.enforcement==="Block"?T.red:p.enforcement==="Redact"?T.amber:p.enforcement==="Route to review"?T.blue:T.ink3} bg={(p.enforcement==="Block"?T.red:p.enforcement==="Redact"?T.amber:p.enforcement==="Route to review"?T.blue:T.ink3)+"16"}/>
          </div>)}
        </div>
      </Card>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>Live prompt log</h3><Tag label="Streaming" color={T.green} bg={T.greenL}/></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>{["Time","User","Business unit","Provider / model","Risk","Action","Policy","Tokens"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
        <tbody>{gatewayLog.map(l=><tr key={l.id} style={{borderBottom:"1px solid "+T.border}}>
          <td style={{padding:"10px 12px",color:T.ink3,fontFamily:F.m}}>{l.time}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.user}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.unit}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.provider}<div style={{fontSize:9,color:T.ink4}}>{l.model}</div></td>
          <td style={{padding:"10px 12px"}}><span style={{color:l.riskScore>=60?T.red:l.riskScore>=30?T.amber:T.green,fontFamily:F.m,fontWeight:800}}>{l.riskScore}</span></td>
          <td style={{padding:"10px 12px"}}><Tag label={l.action} color={gwActionColor(l.action)} bg={gwActionColor(l.action)+"16"}/></td>
          <td style={{padding:"10px 12px",color:T.ink3,fontSize:10}}>{l.policy}</td>
          <td style={{padding:"10px 12px",color:T.ink3,fontFamily:F.m}}>{l.tokens.toLocaleString()}</td>
        </tr>)}</tbody>
      </table></div>
    </Card>
    </div>}
  </div>;

  /* ── Governance Academy ────────────────────────────────────── */
  const Academy=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:14}}>
      {items.map(i=><Card key={i.id} style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.unit}</div><Tag label={i.resistance+" resistance"} color={i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green} bg={(i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green)+"14"}/></div>
        <Bar value={parseInt(i.training)||0} color={(parseInt(i.training)||0)>75?T.green:T.amber}/>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:7}}>Learning completion {i.training}</div>
      </Card>)}
    </div>
    <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:16,flexWrap:"wrap",fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>
      <span><strong style={{color:rc}}>Auto-recommend:</strong> a falling governance score triggers recommended learning.</span>
      <span><strong style={{color:T.red}}>Auto-assign:</strong> repeated policy violations assign mandatory training.</span>
    </div>
    <PageGovernanceAcademy role={role} sessionMode={sessionMode} showToast={showToast} setTab={setTab}/>
  </div>;

  return <div style={{animation:"up .3s ease"}}>
    <Header/>
    {activeModule==="dashboard"&&<Dashboard/>}
    {activeModule==="initiatives"&&<Initiatives/>}
    {activeModule==="governance"&&<Governance/>}
    {activeModule==="evidence"&&<EvidenceModule/>}
    {activeModule==="portfolio"&&<Portfolio/>}
    {activeModule==="gateway"&&<Gateway/>}
    {activeModule==="admin"&&<Administration/>}
    {activeModule==="academy"&&<Academy/>}
  </div>;
}

