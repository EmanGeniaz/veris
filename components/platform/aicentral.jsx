"use client";

import { readBus, pushBus } from "@/lib/bus";
import { navigateTo } from "@/lib/navigation";
import { Cloud, Scale, Target, Workflow } from "lucide-react";
import { useState, useEffect } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, acPmo, acGuardrails, acCxoAlignment, acEvidence, acFeedback, gatewayProviders, gatewayPolicies, gatewayLog, gatewayStats, gatewayRouting, guardrailDetectors, deploymentModes, gatewayRetention, knowledgeAssets, riskRegister, POLICY_REGISTER } from "@/lib/platform-models";
import { FEEDBACK_DIMS, DEFAULT_FEEDBACK, feedbackAvg, feedbackDecision, decisionColorOf, autoEvidenceFor, T, RC, RCL, ROLES, AI_CENTRAL_NAV, acAccessFor, LIFECYCLE_BANDS, TERMINAL_LIFECYCLE, RETIREMENT_REASONS, AI_GOLD, AI_GOLD_L, AI_GOLD_B, AI_ROLLOUT_PROGRAMS, HITL, MODEL_REGISTRY, MATURITY_DOMAINS, USE_CASES, academyEvidenceFor, F, vzDownload, CountUp, IconBox, Tag, PTag, STag, Bar, Ring, Card, SHead, AICentralLogo, INTEGRATIONS } from "./core";
import { PageAISpine } from "./spine";
import { RiskAssessmentCascade, PageRiskCenter } from "./riskcenter";
import { PageGovernanceAcademy } from "./academy";
import { acLensFor } from "@/lib/ai-central-lens";
import { acModuleLensFor } from "@/lib/ai-central-module-lens";
import { SmartSelect } from "./smartselect";

export function PageModelRegistry({setTab,openInitiative,role="caio",showToast}) {
  /* Initiative-centric registry: Model -> AI System -> Initiative ->
     Business Unit -> Executive owner. A model is never shown without its
     business context; models outside a governed initiative are flagged
     for intake. */
  const R=ROLES[role]||ROLES.caio;
  const [extra,setExtra]=useState([]);
  const [mHydrated,setMHydrated]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [mdraft,setMdraft]=useState({bizName:"",system:"",type:"",vendor:"",dept:"",owner:"",euAiAct:"",category:"",status:"Awaiting Approval",risk:"Medium"});
  useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("vz-ac-models")||"[]");if(Array.isArray(s)&&s.length)setExtra(s);}catch{/* ignore */}setMHydrated(true);},[]);
  useEffect(()=>{if(!mHydrated)return;try{localStorage.setItem("vz-ac-models",JSON.stringify(extra));}catch{/* ignore */}},[extra,mHydrated]);
  const ALL_MODELS=[...extra,...MODEL_REGISTRY];
  const [selId,setSelId]=useState(MODEL_REGISTRY[0].id);
  const [openGroups,setOpenGroups]=useState({[MODEL_REGISTRY[0].initiativeId]:true});
  const sel=ALL_MODELS.find(m=>m.id===selId)||MODEL_REGISTRY[0];
  const setMK=k=>v=>setMdraft(d=>({...d,[k]:v}));
  const registerModel=()=>{
    if(!mdraft.bizName.trim()||!mdraft.system.trim()){showToast&&showToast("Model name and AI system are required","error");return;}
    const rec={id:`mx-${Date.now().toString(36)}`,initiativeId:null,system:mdraft.system.trim(),bizName:mdraft.bizName.trim(),
      name:mdraft.bizName.trim(),type:mdraft.type||"Generative AI / LLM",status:mdraft.status,risk:mdraft.risk,
      euAiAct:mdraft.euAiAct||"Unclassified",owner:mdraft.owner||"Unassigned",dept:mdraft.dept||"—",vendor:mdraft.vendor||"Internal",
      deployed:"Pending",accuracy:"Not tested",drift:"Not deployed",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,
      killSwitch:false,dataProvenance:false,transparency:0,clause:"Pending classification · ISO 42001 C.8.4"};
    setExtra([rec,...extra]);setSelId(rec.id);setCreateOpen(false);
    setMdraft({bizName:"",system:"",type:"",vendor:"",dept:"",owner:"",euAiAct:"",category:"",status:"Awaiting Approval",risk:"Medium"});
    showToast&&showToast("Model registered — governed intake required to classify");
  };
  const selIni=acInitiatives.find(i=>i.id===sel.initiativeId);
  const rCol=r=>r==="Critical"?T.red:r==="High"?T.amber:r==="Medium"?T.blue:r==="Unknown"?T.ink4:T.green;
  const sCol=s=>s==="In Production"?T.green:s==="Awaiting Approval"?T.amber:s==="Suspended"?T.red:s==="Unclassified"?T.red:T.ink3;
  const lcCol=lc=>lc==="Production"||lc==="Pilot"?AI_GOLD:lc==="Scaling"?T.green:lc==="Retired"?T.red:T.blue;
  const Check=({v,label})=><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
    <div style={{width:16,height:16,borderRadius:4,background:v?T.greenL:T.redL,border:`1px solid ${v?T.green:T.red}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:9,fontWeight:800,color:v?T.green:T.red}}>{v?"Yes":"No"}</span>
    </div>
    <span style={{fontSize:10,color:v?T.ink2:T.ink4,fontFamily:F.b}}>{label}</span>
  </div>;
  const unclassified=ALL_MODELS.filter(m=>m.euAiAct==="Unclassified").length;
  const critical=ALL_MODELS.filter(m=>m.risk==="Critical").length;
  const ungoverned=MODEL_REGISTRY.filter(m=>!m.initiativeId);
  const groups=acInitiatives.map(ini=>({ini,models:MODEL_REGISTRY.filter(m=>m.initiativeId===ini.id)})).filter(g=>g.models.length);
  const evConfidence=ini=>Math.round(((ini.phaseIndex+ini.phaseArtifactsDone/(AC_PHASES[ini.phaseIndex]?.deliverables.length||1))/AC_PHASES.length)*100);
  const approvalsPending=ini=>MODEL_REGISTRY.filter(m=>m.initiativeId===ini.id&&m.status==="Awaiting Approval").length+(ini.blockedBy?1:0);
  const modelRow=m=><button key={m.id} onClick={()=>setSelId(m.id)} style={{width:"100%",display:"grid",gridTemplateColumns:"1.5fr .9fr 92px 118px 64px",gap:10,alignItems:"center",padding:"10px 12px 10px 30px",background:selId===m.id?T.s3:"transparent",border:"none",borderTop:`1px solid ${T.border}`,borderLeft:selId===m.id?`3px solid ${T.caio}`:"3px solid transparent",cursor:"pointer",textAlign:"left"}}>
    <div style={{minWidth:0}}>
      <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.bizName}</div>
      <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{m.name} · {m.system}</div>
    </div>
    <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{m.vendor}</span>
    <Tag label={m.euAiAct} color={m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber} bg={(m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber)+"16"}/>
    <Tag label={m.status} color={sCol(m.status)} bg={sCol(m.status)+"16"}/>
    <Tag label={m.risk} color={rCol(m.risk)} bg={rCol(m.risk)+"16"}/>
  </button>;
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
      <SHead title="AI Model Registry" sub="Every model in its business context - initiative, executive owner and lifecycle. ISO 42001 C.8.4"/>
      <button onClick={()=>setCreateOpen(o=>!o)} style={{flexShrink:0,background:createOpen?"transparent":AI_GOLD+"16",border:`1px solid ${AI_GOLD}${createOpen?"55":"45"}`,borderRadius:8,padding:"9px 15px",color:AI_GOLD,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{createOpen?"Close":"+ Register model"}</button>
    </div>
    {createOpen&&(()=>{
      const fLabel=l=><span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{l}</span>;
      const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
      return <Card style={{padding:18,marginBottom:14,border:`1px solid ${AI_GOLD}45`,animation:"up .25s ease"}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>Register an AI model</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Governed fields are picked from the enterprise vocabulary — add or request a value inline. New models enter unclassified and require intake to be brought under an initiative.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
          <label style={{display:"grid",gap:5}}>{fLabel("Model name")}<input value={mdraft.bizName} onChange={e=>setMdraft({...mdraft,bizName:e.target.value})} placeholder="e.g. Contract Review Model" style={fieldStyle}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("AI system")}<input value={mdraft.system} onChange={e=>setMdraft({...mdraft,system:e.target.value})} placeholder="e.g. Legal Assistant" style={fieldStyle}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Model type")}<SmartSelect vocab="modelType" value={mdraft.type} onChange={setMK("type")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Vendor")}<SmartSelect vocab="vendor" value={mdraft.vendor} onChange={setMK("vendor")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Department")}<SmartSelect vocab="dept" value={mdraft.dept} onChange={setMK("dept")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Model owner")}<SmartSelect vocab="person" value={mdraft.owner} onChange={setMK("owner")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("EU AI Act risk class")}<SmartSelect vocab="risk" value={mdraft.euAiAct} onChange={setMK("euAiAct")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("AI system category")}<SmartSelect vocab="category" value={mdraft.category} onChange={setMK("category")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Lifecycle status")}
            <select value={mdraft.status} onChange={e=>setMdraft({...mdraft,status:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Awaiting Approval","In Production","Suspended","Unclassified"].map(s=><option key={s} value={s}>{s}</option>)}</select>
          </label>
          <label style={{display:"grid",gap:5}}>{fLabel("Risk severity")}
            <select value={mdraft.risk} onChange={e=>setMdraft({...mdraft,risk:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Low","Medium","High","Critical","Unknown"].map(s=><option key={s} value={s}>{s}</option>)}</select>
          </label>
        </div>
        <button onClick={registerModel} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"10px 16px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Register model</button>
      </Card>;
    })()}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[
        {label:"Total Models",value:ALL_MODELS.length,color:T.caio,sub:`across ${groups.length} governed initiatives`},
        {label:"Ungoverned",value:ungoverned.length,color:T.amber,sub:"No initiative - intake required"},
        {label:"Unclassified",value:unclassified,color:T.red,sub:"EU AI Act gap"},
        {label:"Critical Risk",value:critical,color:T.red,sub:"Require treatment"},
      ].map(k=><Card key={k.label} style={{padding:"13px 14px"}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{k.label}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:3}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14,alignItems:"start"}}>
      <div>
        {extra.length>0&&<div style={{border:`1px solid ${T.green}45`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.greenL||T.s1,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T.green,fontFamily:F.b}}>Registered this session</div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>Newly registered models awaiting governed intake and EU AI Act classification.</div>
            </div>
            <span style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink2}}>{extra.length} model{extra.length>1?"s":""}</span>
          </div>
          {extra.map(modelRow)}
        </div>}
        {groups.map(({ini,models})=>{
          const open=!!openGroups[ini.id];
          const techs=[...new Set(models.map(m=>m.type.split(" / ")[0]))];
          const vendors=[...new Set(models.map(m=>m.vendor))];
          return <div key={ini.id} style={{border:`1px solid ${T.border}`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
            <button onClick={()=>setOpenGroups(g=>({...g,[ini.id]:!open}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.s1,border:"none",cursor:"pointer",textAlign:"left",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:T.ink4,fontFamily:F.m,width:12}}>{open?"▾":"▸"}</span>
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{ini.name}</span>
                  <Tag label={ini.lifecycle} color={lcCol(ini.lifecycle)} bg={lcCol(ini.lifecycle)+"16"}/>
                </div>
                <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>{ini.unit} · Sponsor {ini.sponsor} · Owner {ini.businessOwner} · Phase {ini.phaseIndex+1}/{AC_PHASES.length} ({AC_PHASES[ini.phaseIndex]?.name})</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {techs.map(t=><span key={t} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:800,fontFamily:F.m,color:T.ink3}}>{t}</span>)}
                {vendors.filter(v=>v!=="Internal").map(v=><span key={v} style={{background:AI_GOLD+"10",border:`1px solid ${AI_GOLD}30`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:800,fontFamily:F.m,color:AI_GOLD}}>{v}</span>)}
                <span style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink2}}>{models.length} model{models.length>1?"s":""}</span>
              </div>
            </button>
            {open&&models.map(modelRow)}
          </div>;
        })}
        {ungoverned.length>0&&<div style={{border:`1px solid ${T.amber}45`,borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.amberL,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T.amber,fontFamily:F.b}}>Outside governed initiatives</div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>These models run without initiative context, executive ownership or lifecycle gates.</div>
            </div>
            <button onClick={()=>setTab&&setTab("intake")} style={{background:T.amber+"22",border:`1px solid ${T.amber}55`,borderRadius:7,padding:"7px 12px",color:T.amber,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Start governed intake →</button>
          </div>
          {ungoverned.map(modelRow)}
        </div>}
      </div>
      <Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${rCol(sel.risk)}14,${T.s3})`,borderBottom:`1px solid ${rCol(sel.risk)}30`,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
            {selIni&&<Tag label={selIni.lifecycle} color={lcCol(selIni.lifecycle)} bg={lcCol(selIni.lifecycle)+"16"}/>}
            <Tag label={sel.euAiAct} color={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.red:T.amber} bg={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.redL:T.amberL}/>
            <Tag label={sel.status} color={sCol(sel.status)} bg={sCol(sel.status)+"18"}/>
          </div>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,lineHeight:1.3,margin:0}}>{sel.bizName}</h3>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>{sel.name} · {sel.system} · {sel.clause}</p>
        </div>
        <div style={{padding:15}}>
          {selIni?<>
            <div style={{fontSize:9,fontWeight:700,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Business context</div>
            {[["Initiative",selIni.name],["Business Unit",selIni.unit],["Executive Sponsor",selIni.sponsor],["Business Owner",selIni.businessOwner],
              ["Current Phase",`${AC_PHASES[selIni.phaseIndex]?.name} (${selIni.phaseIndex+1}/${AC_PHASES.length})`],
              ["Business Value",`${selIni.actual} of ${selIni.expected}`],["Expected ROI",selIni.roi],
              ["Models in initiative",MODEL_REGISTRY.filter(m=>m.initiativeId===selIni.id).map(m=>m.bizName).join(", ")],
              ["Vendor(s)",[...new Set(MODEL_REGISTRY.filter(m=>m.initiativeId===selIni.id).map(m=>m.vendor))].join(", ")],
              ["Controls implemented",selIni.controls.join(", ")],["Risks",selIni.risks.join(", ")],
              ["Evidence confidence",evConfidence(selIni)+"%"],["Approvals pending",approvalsPending(selIni)]
            ].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{l}</span>
              <span style={{fontSize:10,color:T.ink,fontFamily:F.b,fontWeight:600,textAlign:"right",lineHeight:1.45}}>{v}</span>
            </div>)}
            <button onClick={()=>openInitiative?openInitiative(selIni.id):setTab&&setTab("aicentral")} style={{width:"100%",marginTop:12,background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Initiative →</button>
          </>:<div style={{background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:8,padding:"11px 12px"}}>
            <div style={{fontSize:10,fontWeight:800,color:T.amber,fontFamily:F.b,marginBottom:4}}>No governed initiative</div>
            <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 9px"}}>This model runs without executive ownership, lifecycle gates or business-value tracking. Bring it under governance through opportunity intake.</p>
            <button onClick={()=>setTab&&setTab("intake")} style={{width:"100%",background:T.amber+"22",border:`1px solid ${T.amber}55`,borderRadius:7,padding:"8px",fontSize:10,fontWeight:900,fontFamily:F.b,color:T.amber,cursor:"pointer"}}>Start governed intake →</button>
          </div>}
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>Model assurance (ISO 42001)</div>
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
        </div>
      </Card>
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
            <button onClick={()=>setView&&setView("initiatives")} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Continue initiative →</button>
          </div>)}
        </div>}
      </Card>)}
    </div>
  </div>;
}

export function PageAICentral({role,setTab,showToast,view,setView,navNonce,initToOpen,onInitOpened,theme,sessionMode}) {
  const rc=AI_GOLD;
  const access=acAccessFor(role);
  const R=ROLES[role]||ROLES.caio;
  /* Internal drill-in views are reachable from within a module (initiative
     workspace, PMO, gateway admin) even when they aren't RBAC-gated modules. */
  const AC_INTERNAL_VIEWS=["initiatives","pmo","admin"];
  const activeModule=access.modules.includes(view)?view:AC_INTERNAL_VIEWS.includes(view)?view:"dashboard";
  const [items,setItems]=useState(acInitiatives);
  const [selectedId,setSelectedId]=useState(acInitiatives[0].id);
  const [initTab,setInitTab]=useState("list");
  const [phaseSel,setPhaseSel]=useState(null);
  /* Phase evidence workspace state, keyed by `${initiativeId}:${phaseIdx}` so
     uploads and reviewer comments follow the globally selected initiative+phase. */
  const [phaseFiles,setPhaseFiles]=useState({});
  const [phaseComments,setPhaseComments]=useState({});
  const [commentDraft,setCommentDraft]=useState("");
  const [histOpen,setHistOpen]=useState(null);
  /* A left-nav click always returns the module to its root view, even when the
     module is already active (e.g. stepping out of an initiative workspace). */
  useEffect(()=>{if(navNonce){setInitTab("overview");setPhaseSel(null);setCreateOpen(false);}},[navNonce]);
  /* One global state: initiative + phase + role. Switching role re-frames the
     same initiative into that executive's perspective (CAIO opens the full
     profile by default - it is the operating role). */
  const [profileMode,setProfileMode]=useState(role==="caio");
  useEffect(()=>{setProfileMode(role==="caio");},[role]);
  /* Deep-open from universal search: land directly on the requested initiative. */
  useEffect(()=>{if(initToOpen){const id=typeof initToOpen==="object"?initToOpen.id:initToOpen;const it=typeof initToOpen==="object"?initToOpen.initTab:"overview";openInitiative(id,it);onInitOpened&&onInitOpened();}},[initToOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [govTab,setGovTab]=useState("controls");
  const [evTab,setEvTab]=useState("repository");
  const [gwTab,setGwTab]=useState("overview");
  const [lifecycleFilter,setLifecycleFilter]=useState("All");
  const [initQuery,setInitQuery]=useState("");
  const [unitFilter,setUnitFilter]=useState("All");
  const [recentIds,setRecentIds]=useState([]);
  const [favIds,setFavIds]=useState([]);
  const [ovDetails,setOvDetails]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [draft,setDraft]=useState({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:"",phase:"",risk:"",dataClass:""});
  const [evQuery,setEvQuery]=useState("");
  const [evScope,setEvScope]=useState("All");
  const [evLog,setEvLog]=useState({open:false,item:"",owner:"",control:"",status:"In Review",approval:"Awaiting Approval"});
  const [decisions,setDecisions]=useState({});
  const [retireDraft,setRetireDraft]=useState({reason:RETIREMENT_REASONS[0],rationale:""});
  const [feedback,setFeedback]=useState(acFeedback);
  const [hydrated,setHydrated]=useState(false);
  const selected=items.find(i=>i.id===selectedId)||items[0];
  const learningEvidence=academyEvidenceFor(role,(sessionMode==="demo"||sessionMode==="aicentral"));
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
  const openInitiative=(id,tab="overview")=>{setSelectedId(id);setInitTab(tab);setPhaseSel(null);setView("initiatives");setRecentIds(r=>[id,...r.filter(x=>x!==id)].slice(0,4));};
  /* Registry-bound navigation for every clickable object inside AI Central. */
  const nav=(objectType,ctx={})=>navigateTo(objectType,ctx,{setTab,setAiCentralView:setView,setInitToOpen:(id,it)=>openInitiative(id,it)});
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

  /* Plain typographic module header. Approval awareness lives in Veris
     Intelligence, and the selected initiative is the page's visual focus. */
  const lens=acLensFor(role);
  const LENSC={good:T.green,warn:T.amber,crit:T.red,info:T.blue,violet:T.violet,teal:T.teal,gold:AI_GOLD,ink3:T.ink3,ink:T.ink};
  const lensCol=k=>LENSC[k]||T.ink;
  const modMeta=AI_CENTRAL_NAV.find(m=>m.id===activeModule);
  const Header=()=><div style={{margin:"4px 0 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
    <div>
      <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.blue,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:5}}>AI Central · {access.lens} lens</div>
      <h2 style={{fontSize:26,fontWeight:800,color:T.ink,fontFamily:F.h,letterSpacing:"-0.03em",margin:0,lineHeight:1.1}}>{modMeta?.label||"Dashboard"}</h2>
      <p style={{fontSize:12,color:T.ink3,margin:"6px 0 0",fontFamily:F.b,fontStyle:"italic"}}>{lens.question}</p>
    </div>
    {/* The accountable-owner chip is governance-facing attribution (who is
        accountable for this module), not the current viewer. It confused
        scoped users ("why does it say CAIO?"), so it's shown only to the
        executive/governance roles who reason about module ownership. */}
    {modMeta?.owner&&role!=="employee"&&role!=="manager"&&<div title="The executive accountable for this module — not the current viewer" style={{textAlign:"right",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 13px",minWidth:150}}>
      <div style={{fontSize:8,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Accountable owner</div>
      <div style={{fontSize:13,fontWeight:800,color:AI_GOLD,fontFamily:F.b,marginTop:3}}>{modMeta.owner}</div>
      <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>Oversight · {modMeta.oversight}</div>
    </div>}
  </div>;

  /* ── Role lens band: the AI Central Overview, reframed for this role.
     Same initiative portfolio, role-specific hero metric, KPIs and
     columns. Rows open the initiative workspace. ── */
  const RoleLensBand=()=>{
    const rows=lens.filter?items.filter(lens.filter):items;
    const cell=v=>Array.isArray(v)?<span style={{display:"inline-flex",alignItems:"center",fontSize:9.5,fontWeight:800,fontFamily:F.m,padding:"2px 9px",borderRadius:20,background:lensCol(v[1])+"22",color:lensCol(v[1])}}>{v[0]}</span>:v;
    return <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:14}}>
        <div style={{display:"flex",gap:14,alignItems:"center",background:"linear-gradient(135deg,#7a1a3c,#a5254c 60%,#7c1f42)",border:"1px solid #c25878",borderRadius:14,padding:"11px 18px",boxShadow:"0 12px 30px rgba(138,26,60,.28)"}}>
          <div style={{fontSize:30,fontWeight:800,color:"#ffe9ef",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{lens.hero[0]}</div>
          <div><div style={{fontSize:9.5,letterSpacing:"0.09em",textTransform:"uppercase",color:"#f3c9d4",fontWeight:900,fontFamily:F.m}}>{lens.hero[1]}</div><div style={{fontSize:10,color:"#e0a9ba",marginTop:3,fontWeight:600,fontFamily:F.b}}>{lens.hero[2]}</div></div>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:700,fontFamily:F.b,background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 12px",alignSelf:"center"}}>🔒 RBAC · {access.modules.length} of {AI_CENTRAL_NAV.filter(m=>m.id!=="academy").length} modules enabled</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:14}}>
        {lens.kpis.map((k,i)=><div key={i} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{k[0]}</div>
          <div style={{fontSize:21,fontWeight:800,marginTop:6,fontFamily:F.m,color:lensCol(k[2])}}>{k[1]}</div>
          <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{k[3]}</div>
        </div>)}
      </div>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m,marginBottom:4}}>Initiative portfolio · {access.lens} columns</div>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{lens.filter?"Your initiatives":"All AI initiatives"} — the same portfolio, framed for {R.label}</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
          <thead><tr>{lens.cols.map(c=><th key={c[0]} style={{textAlign:"left",fontSize:9,letterSpacing:"0.07em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{c[0]}</th>)}</tr></thead>
          <tbody>{rows.map(i=><tr key={i.id} onClick={()=>openInitiative(i.id,"overview")} style={{cursor:"pointer"}} className="vz-pn-row">
            {lens.cols.map((c,ci)=><td key={ci} style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:ci===0?T.ink:T.ink2,fontWeight:ci===0?700:400}}>{cell(c[1](i))}</td>)}
          </tr>)}</tbody>
        </table></div>
      </Card>
      <div style={{display:"flex",alignItems:"center",gap:8,margin:"18px 0 4px"}}>
        <span style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap"}}>Full portfolio detail</span>
        <span style={{flex:1,height:1,background:`linear-gradient(90deg,${T.border},transparent)`}}/>
      </div>
    </div>;
  };

  /* ── Module lens band: the same role lens, carried into each module.
     A compact framing question + three role-relevant signals above the
     module's own content. Falls back to the module default for roles
     without a distinct angle. ── */
  const ModuleLensBand=({module})=>{
    const ml=acModuleLensFor(module,role);
    if(!ml)return null;
    return <div style={{marginBottom:14}}>
      <div style={{background:`linear-gradient(135deg,${T.s2},${T.s1})`,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.blue}`,borderRadius:12,padding:"13px 16px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
          <div style={{minWidth:220,flex:1}}>
            <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.blue,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:5}}>{ml.angle} · {R.label}</div>
            <div style={{fontSize:15,fontWeight:800,color:T.ink,fontFamily:F.b,letterSpacing:"-0.01em",lineHeight:1.25}}>{ml.question}</div>
            <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:3}}>{ml.sub}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ml.chips.map((c,i)=><div key={i} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",minWidth:96}}>
              <div style={{fontSize:8,fontFamily:F.m,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:800}}>{c[0]}</div>
              <div style={{fontSize:17,fontWeight:800,fontFamily:F.m,color:lensCol(c[2]),marginTop:4,letterSpacing:"-0.02em"}}>{c[1]}</div>
              <div style={{fontSize:8.5,color:T.ink3,fontFamily:F.b,marginTop:1}}>{c[3]}</div>
            </div>)}
          </div>
        </div>
      </div>
    </div>;
  };

  /* ── Dashboard ─────────────────────────────────────────────── */
  /* Every tile opens the surface that OWNS its metric - no two tiles may
     share a destination. initiatives=workspace overview, journey=execution,
     riskcenter=risk register, decisions=approvals, evidence=audit trail,
     governance=controls, academy=readiness, value tab=value scores,
     portfolio units=investment, reports=portfolio ROI reporting. */
  const W={
    portfolio:{label:"Total initiatives",value:total,sub:"Enterprise AI portfolio",color:rc,go:()=>openModule("lifecycle")},
    active:{label:"Active AI projects",value:active,sub:"In lifecycle",color:T.blue,go:()=>openInitiative(selectedId,"journey")},
    risk:{label:"High-risk use cases",value:high,sub:"High or critical",color:T.red,go:()=>openModule("risk")},
    approvals:{label:"Pending approvals",value:pending,sub:"HITL and CXO",color:T.amber,go:()=>{setTab("decisions");}},
    findings:{label:"Open audit findings",value:"6",sub:"2 overdue",color:T.red,go:()=>openModule("audit")},
    guardrail:{label:"Guardrail compliance",value:avgGuard+"%",sub:"Mandatory controls",color:T.green,score:avgGuard,go:()=>openModule("controls")},
    adoption:{label:"AI adoption score",value:avgAdopt+"%",sub:"Workforce readiness",color:T.teal,score:avgAdopt,go:()=>openModule("academy")},
    value:{label:"Business value score",value:avgValue+"%",sub:"ROI and outcomes",color:AI_GOLD,score:avgValue,go:()=>openModule("value")},
    budget:{label:"Budget utilization",value:"64%",sub:"$8.6M of $13.4M FY26",color:T.blue,score:64,go:()=>{setPfTab("units");openModule("portfolio");}},
    roi:{label:"Portfolio ROI",value:"19%",sub:"Weighted actual vs expected",color:T.green,go:()=>openModule("value")},
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
    Risk:["risk","guardrail","findings","approvals","active","portfolio"],
    Legal:["findings","guardrail","risk","approvals","portfolio","value"],
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
    setDraft({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:"",phase:"",risk:"",dataClass:""});
    showToast&&showToast("Initiative created - Discover phase opened");
  };
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};

  /* ── Portfolio Navigator (LEFT pane): navigate, not create.
     Compact rows - status dot, name, phase, health, value. Creation is a
     quiet secondary action pinned at the very bottom. ── */
  const railFiltered=filtered.filter(i=>(unitFilter==="All"||i.unit===unitFilter)&&(!initQuery.trim()||`${i.name} ${i.unit} ${i.category}`.toLowerCase().includes(initQuery.trim().toLowerCase())));
  const railUnits=[...new Set(railFiltered.map(i=>i.unit))];
  const allUnits=[...new Set(items.map(i=>i.unit))];
  const railHealth=i=>Math.round((i.guardrail+i.adoption+i.valueScore)/3);
  const navRow=i=>{
    const isA=selectedId===i.id;
    const h=railHealth(i);
    return <div key={i.id} className="vz-pn-row" style={{display:"flex",alignItems:"center",gap:8,borderRadius:8,marginBottom:3,background:isA?AI_GOLD+"12":"transparent",boxShadow:isA?`inset 2px 0 0 ${AI_GOLD}`:"none"}}>
      <button onClick={()=>openInitiative(i.id)} style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:9,background:"transparent",border:"none",padding:"11px 4px 11px 11px",cursor:"pointer",textAlign:"left"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:catColor(i.lifecycle),flexShrink:0}} title={i.lifecycle}/>
        <span style={{flex:1,minWidth:0,fontSize:11.5,fontWeight:isA?800:600,fontFamily:F.b,color:isA?AI_GOLD:T.ink2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</span>
        <span style={{fontSize:9,fontFamily:F.m,color:T.ink4,flexShrink:0}}>{i.phaseIndex+1}/{AC_PHASES.length}</span>
        <span style={{fontSize:9,fontFamily:F.m,fontWeight:800,color:h>=75?T.green:h>=55?T.amber:T.red,flexShrink:0}}>{h}</span>
        <span style={{fontSize:9,fontFamily:F.m,color:T.ink3,flexShrink:0}}>{i.expected}</span>
      </button>
      <button aria-label={favIds.includes(i.id)?"Unfavorite":"Favorite"} onClick={()=>setFavIds(f=>f.includes(i.id)?f.filter(x=>x!==i.id):[...f,i.id])} className="vz-pn-fav" style={{background:"transparent",border:"none",padding:"0 9px 0 0",cursor:"pointer",color:favIds.includes(i.id)?AI_GOLD:T.ink4,fontSize:11,lineHeight:1,opacity:favIds.includes(i.id)?1:0}}>{favIds.includes(i.id)?"★":"☆"}</button>
    </div>;
  };
  const navGroup=(title,list)=>list.length>0&&<div key={title}>
    <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",margin:"16px 0 7px 4px"}}>{title}</div>
    {list.map(navRow)}
  </div>;
  const renderPortfolioRail=()=><div style={{display:"flex",flexDirection:"column",gap:4,alignContent:"start",minHeight:420}}>
    <style>{`.vz-pn-row:hover{background:${T.s2}} .vz-pn-row:hover .vz-pn-fav{opacity:1}`}</style>
    <input aria-label="Search initiatives" placeholder="Search portfolio..." value={initQuery} onChange={e=>setInitQuery(e.target.value)} style={{...fieldStyle,fontSize:11,marginBottom:4}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      <select aria-label="Business unit filter" value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} style={{...fieldStyle,fontSize:10,padding:"7px 8px",cursor:"pointer"}}>
        <option value="All">All units</option>
        {allUnits.map(u=><option key={u} value={u}>{u}</option>)}
      </select>
      <select aria-label="Lifecycle filter" value={lifecycleFilter} onChange={e=>setLifecycleFilter(e.target.value)} style={{...fieldStyle,fontSize:10,padding:"7px 8px",cursor:"pointer"}}>
        <option value="All">All stages</option>
        {LIFECYCLE_BANDS.flatMap(b=>b.cats).map(cat=><option key={cat} value={cat}>{cat}</option>)}
      </select>
    </div>
    {navGroup("Favorites",railFiltered.filter(i=>favIds.includes(i.id)))}
    {navGroup("Recently viewed",recentIds.map(id=>railFiltered.find(i=>i.id===id)).filter(Boolean).filter(i=>!favIds.includes(i.id)))}
    {railUnits.map(unit=>navGroup(unit,railFiltered.filter(i=>i.unit===unit&&!favIds.includes(i.id)&&!recentIds.includes(i.id))))}
    {railFiltered.length===0&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,padding:"8px 4px"}}>No initiatives match - clear the search or filter.</div>}
    <div style={{flex:1}}/>
    <button onClick={()=>setCreateOpen(!createOpen)} style={{marginTop:12,background:"transparent",border:`1px dashed ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:10.5,fontWeight:700,fontFamily:F.b,color:T.ink3,cursor:"pointer",textAlign:"left"}}>{createOpen?"Close":"+ New AI Initiative"}</button>
  </div>;
  const renderCreateForm=()=><Card style={{padding:18,marginBottom:14,border:`1px solid ${rc}45`,animation:"up .25s ease"}}>
    <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>Create AI Initiative</h3>
    <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Every initiative starts in Discover. Mandatory artifacts gate each phase; the record becomes the single source of truth.</p>
    {(()=>{
      const fLabel=l=><span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{l}</span>;
      const setK=k=>v=>setDraft(d=>({...d,[k]:v}));
      return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
        {[["Initiative name","name","e.g. Resolution Copilot"],["Expected value (USD m)","expected","e.g. 3.4"]].map(([l,k,ph])=><label key={k} style={{display:"grid",gap:5}}>
          {fLabel(l)}<input value={draft[k]} onChange={e=>setDraft({...draft,[k]:e.target.value})} placeholder={ph} style={fieldStyle}/>
        </label>)}
        <label style={{display:"grid",gap:5}}>{fLabel("Business unit")}<SmartSelect vocab="unit" value={draft.unit} onChange={setK("unit")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Business owner")}<SmartSelect vocab="person" value={draft.businessOwner} onChange={setK("businessOwner")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Executive sponsor")}<SmartSelect vocab="person" value={draft.sponsor} onChange={setK("sponsor")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add a sponsor"/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Lifecycle phase")}<SmartSelect vocab="phase" value={draft.phase} onChange={setK("phase")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("EU AI Act risk class")}<SmartSelect vocab="risk" value={draft.risk} onChange={setK("risk")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Data classification")}<SmartSelect vocab="data" value={draft.dataClass} onChange={setK("dataClass")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Category")}<SmartSelect vocab="category" value={draft.category} onChange={setK("category")} role={role} showToast={showToast} requestedBy={R.name}/></label>
      </div>;
    })()}
    <button onClick={createInitiative} style={{background:rc,border:"none",borderRadius:8,padding:"10px 16px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Create initiative</button>
  </Card>;

  /* Overview: executive-level by default. Ownership and next action up
     front as typography; governance metadata and compliance mapping stay
     collapsed until explicitly expanded (progressive disclosure). */
  /* Executive charter - the 30-second read: why, where to, what success is. */
  const iniModels=MODEL_REGISTRY.filter(m=>m.initiativeId===selected.id);
  const renderCharter=()=>(selected.problem||selected.vision)&&<div style={{display:"grid",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:"14px 28px"}}>
      {[["Problem",selected.problem],["Vision",selected.vision],["Business objective",selected.objective]].filter(([,v])=>v).map(([l,v])=><div key={l}>
        <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>{l}</div>
        <div style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{v}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"12px 24px"}}>
      {[["Budget",`${selected.spent||"—"} of ${selected.budget||"—"}`],["Timeline",selected.timeline||"—"],
        ["Overall completion",phaseProgress(selected)+"%"],
        ["AI models used",iniModels.length?iniModels.map(m=>m.bizName).join(", "):"None registered"]].map(([l,v])=><div key={l}>
        <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
        <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:700,lineHeight:1.45}}>{v}</div>
      </div>)}
    </div>
    {selected.successMetrics&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {selected.successMetrics.map(m=><span key={m} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"4px 11px",fontSize:9.5,fontWeight:800,fontFamily:F.m,color:T.ink2}}>{m}</span>)}
    </div>}
  </div>;
  const Overview=()=><div style={{display:"grid",gap:20}}>
    {renderCharter()}
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"14px 24px",marginBottom:4}}>
        {[["Executive sponsor",selected.sponsor],["Status",selected.status],["Current phase",`${AC_PHASES[selected.phaseIndex]?.name} (${selected.phaseIndex+1}/${AC_PHASES.length})`],["Adoption",selected.adoption+"%"]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:600,lineHeight:1.4}}>{v}</div>
        </div>)}
      </div>
      {selected.blockedBy&&<div style={{background:T.redL,border:`1px solid ${T.red}35`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b,marginTop:12}}><strong style={{color:T.red}}>Blocked:</strong> {selected.blockedBy}</div>}
      <button onClick={()=>{if(selected.blockedBy)setInitTab("journey");else setInitTab("journey");}} style={{marginTop:12,background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:8,padding:"9px 14px",color:AI_GOLD,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Next action: {wsNextAction} →</button>
    </div>
    <div>
      <h3 style={{fontSize:13,color:T.ink,margin:"0 0 10px",fontFamily:F.h,fontWeight:800}}>Initiative team</h3>
      <div style={{display:"flex",gap:22,flexWrap:"wrap",marginBottom:4}}>
        {[["Executive sponsor",selected.sponsor],["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["AI champion",selected.champion],["CXO sponsors",selected.cxo]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:11.5,color:T.ink,fontFamily:F.b,fontWeight:600}}>{v}</div>
        </div>)}
      </div>
    </div>
    <div>
      <h3 style={{fontSize:13,color:T.ink,margin:"0 0 10px",fontFamily:F.h,fontWeight:800}}>Financial impact</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px 24px"}}>
        {[["Expected value",selected.expected],["Realized value",selected.actual],["ROI",selected.roi],["Cost savings",selected.savings],["Revenue generated",selected.revenue]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:14,color:T.ink,fontFamily:F.m,fontWeight:800}}>{v}</div>
        </div>)}
      </div>
    </div>
    <div>
      <button onClick={()=>setOvDetails(!ovDetails)} style={{background:"transparent",border:"none",padding:0,color:T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ovDetails?"▾":"▸"} Governance & technical details</button>
      {ovDetails&&<div style={{marginTop:12,animation:"up .2s ease"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px 24px",marginBottom:16}}>
          {[["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["AI champion",selected.champion],["CXO sponsors",selected.cxo],["Lifecycle",selected.lifecycle],["Linked policies",selected.policies.join(", ")||"None yet"],["Linked controls",selected.controls.join(", ")||"None yet"],["Linked risks",selected.risks.join(", ")||"None yet"],["Audits",selected.audits.join(", ")||"None yet"],["Training status",selected.training]].map(([l,v])=><div key={l}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
            <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.4}}>{v}</div>
          </div>)}
        </div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>Compliance mapping</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {["Compliant","Partially compliant","Non-compliant","Not assessed"].map((s,idx)=><div key={s} style={{display:"flex",gap:7,alignItems:"center"}}><Tag label={s} color={[T.green,T.amber,T.red,T.ink3][idx]}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{[5,3,1,2][idx]} items</span></div>)}
        </div>
      </div>}
    </div>
  </div>;

  const Implementation=()=>{
    const activePhase=phaseSel==null?selected.phaseIndex:phaseSel;
    const phase=AC_PHASES[activePhase];
    const st=phaseStatus(selected,activePhase);
    const stColor=st==="Complete"?T.green:st==="Active"?rc:st==="Blocked"?T.red:T.ink3;
    const pKey=`${selected.id}:${activePhase}`;
    const files=phaseFiles[pKey]||[];
    const comments=phaseComments[pKey]||[];
    const doneCount=idx=>idx<selected.phaseIndex?AC_PHASES[idx].deliverables.length:idx===selected.phaseIndex?selected.phaseArtifactsDone:0;
    const approvalsOf=idx=>AC_PHASES[idx].deliverables.filter((d,ai)=>/approval|sign-off|decision|charter/i.test(d)&&artifactStatus(selected,idx,ai)==="Complete").length;
    const lastUpdated=idx=>idx<selected.phaseIndex?"Jul 11":idx===selected.phaseIndex?"Today":"—";
    const stamp=()=>{const d=new Date();return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});};
    const recordEvidence=(item,control)=>pushBus("vz-gw-evidence",{item,initiative:selected.name,scope:"Phase "+phase.order+" - "+phase.name,control,risk:"Lifecycle evidence",owner:R.label,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"});
    const addFiles=names=>{
      if(!names.length)return;
      const recs=names.map(n=>({name:n,owner:R.label,time:stamp(),status:"Uploaded",version:"v1"}));
      setPhaseFiles(f=>({...f,[pKey]:[...recs,...(f[pKey]||[])]}));
      names.forEach(n=>recordEvidence(`Evidence uploaded: ${n}`,"Evidence intake"));
      showToast&&showToast(`${names.length} file${names.length>1?"s":""} recorded in the ${phase.name} evidence workspace`);
    };
    const addComment=()=>{
      const t=commentDraft.trim();
      if(!t)return;
      setPhaseComments(c=>({...c,[pKey]:[{by:R.label,time:stamp(),text:t},...(c[pKey]||[])]}));
      setCommentDraft("");
      recordEvidence(`Reviewer comment on ${phase.name}`,"Review trail");
    };
    const auditTrail=[
      ...files.map(f=>({time:f.time,what:`${f.name} uploaded (${f.version})`,by:f.owner})),
      ...comments.map(c=>({time:c.time,what:"Reviewer comment recorded",by:c.by})),
      ...phase.deliverables.map((d,ai)=>artifactStatus(selected,activePhase,ai)==="Complete"?{time:lastUpdated(activePhase),what:`${d} completed and approved`,by:phase.raci.accountable}:null).filter(Boolean),
    ];
    const completeness=Math.round((doneCount(activePhase)/phase.deliverables.length)*100);
    const downloadPackage=()=>{
      const L=[`# Evidence Package - ${selected.name}`,`Phase ${phase.order}: ${phase.name} (${st})`,"",
        "## Exit criteria",...phase.deliverables.map(d=>`- [${artifactStatus(selected,activePhase,phase.deliverables.indexOf(d))==="Complete"?"x":" "}] ${d}`),
        `- [${selected.blockedBy&&activePhase===selected.phaseIndex?" ":"x"}] No open blockers`,
        `- [${approvalsOf(activePhase)>0?"x":" "}] Accountable sign-off (${phase.raci.accountable})`,"",
        "## Uploaded evidence",...(files.length?files.map(f=>`- ${f.name} · ${f.owner} · ${f.time} · ${f.version}`):["- none"]),"",
        "## Reviewer comments",...(comments.length?comments.map(c=>`- ${c.time} ${c.by}: ${c.text}`):["- none"]),"",
        "## Audit trail",...auditTrail.map(a=>`- ${a.time} · ${a.what} · ${a.by}`)];
      vzDownload(`evidence-${selected.id}-phase-${phase.order}.md`,L.join("\n"));
      recordEvidence(`Evidence package exported - ${phase.name}`,"Audit export");
      showToast&&showToast("Evidence package downloaded - export recorded in the audit trail");
    };
    return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6,marginBottom:14}}>
        {AC_PHASES.map((p,idx)=>{
          const s=phaseStatus(selected,idx);
          const col=s==="Complete"?T.green:s==="Active"?rc:s==="Blocked"?T.red:T.ink4;
          const isSel=idx===activePhase;
          const pc=Math.round((doneCount(idx)/p.deliverables.length)*100);
          return <button key={p.id} onClick={()=>setPhaseSel(idx)} style={{background:isSel?col+"1C":T.s2,border:`1px solid ${isSel?col+"55":T.border}`,borderRadius:10,padding:"10px 10px",textAlign:"left",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>PHASE {p.order}</span>
              <Tag label={s} color={col} bg={col+"16"}/>
            </div>
            <div style={{fontSize:11,color:isSel?col:T.ink2,fontWeight:800,fontFamily:F.b,lineHeight:1.25,marginBottom:6}}>{p.name}</div>
            <Bar value={pc} color={col}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:8.5,color:T.ink4,fontFamily:F.m}}>
              <span>{doneCount(idx)}/{p.deliverables.length} artifacts</span><span>{approvalsOf(idx)} appr.</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:8.5,color:T.ink4,fontFamily:F.m}}>
              <span>{p.raci.accountable}</span><span>{lastUpdated(idx)}</span>
            </div>
            <div style={{marginTop:7,fontSize:9,fontWeight:900,fontFamily:F.b,color:isSel?col:T.ink3}}>Open phase →</div>
          </button>;
        })}
      </div>
      {selected.blockedBy&&activePhase===selected.phaseIndex&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:9,alignItems:"center"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:T.red,flexShrink:0,animation:"pulse 2s infinite"}}/>
        <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><strong style={{color:T.red}}>Progression blocked.</strong> {selected.blockedBy}. Missing mandatory artifacts prevent advancing to {AC_PHASES[selected.phaseIndex+1]?.name||"completion"}.</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
        <Card style={{padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
            <h3 style={{fontSize:16,color:T.ink,fontWeight:800,margin:0}}>Phase {phase.order}: {phase.name}</h3>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <Tag label={st} color={stColor} bg={stColor+"16"}/>
              <button onClick={downloadPackage} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Download package ↓</button>
            </div>
          </div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 12px"}}>{phase.objective}</p>
          <h4 style={{fontSize:12,color:T.ink,margin:"0 0 7px"}}>Exit criteria</h4>
          <div style={{display:"grid",gap:4,marginBottom:14}}>
            {[[`All ${phase.deliverables.length} mandatory artifacts complete`,completeness===100],
              ["No open blockers on this phase",!(selected.blockedBy&&activePhase===selected.phaseIndex)],
              [`${phase.raci.accountable} sign-off recorded`,st==="Complete"]].map(([txt,ok])=><div key={txt} style={{display:"flex",gap:7,alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:900,color:ok?T.green:T.amber,fontFamily:F.m}}>{ok?"✓":"○"}</span>
              <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{txt}</span>
            </div>)}
          </div>
          <h4 style={{fontSize:12,color:T.ink,margin:"0 0 8px"}}>Mandatory artifacts</h4>
          <div style={{display:"grid",gap:7}}>
            {phase.deliverables.map((d,ai)=>{
              const as_=artifactStatus(selected,activePhase,ai);
              const ac_=as_==="Complete"?T.green:as_==="Blocked"?T.red:as_==="Missing"?T.amber:T.ink4;
              const hKey=pKey+":"+ai;
              return <div key={d} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8}}>
                <button onClick={()=>setHistOpen(histOpen===hKey?null:hKey)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:"transparent",border:"none",padding:"9px 12px",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",gap:9,alignItems:"center",minWidth:0}}><span style={{width:7,height:7,borderRadius:"50%",background:ac_,flexShrink:0}}/><span style={{fontSize:12,color:T.ink2,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d}</span></div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                    <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>{phase.raci.responsible} · {as_==="Complete"?lastUpdated(activePhase):"—"}</span>
                    <Tag label={as_} color={ac_} bg={ac_+"14"}/>
                  </div>
                </button>
                {histOpen===hKey&&<div style={{padding:"0 12px 10px 28px",animation:"up .15s ease"}}>
                  <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>Version history & approvals</div>
                  {as_==="Complete"?<>
                    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>v1 · Drafted by {phase.raci.responsible} · {lastUpdated(activePhase)}</div>
                    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>v2 · Approved by {phase.raci.accountable} · {lastUpdated(activePhase)} · recorded to Trust & Evidence</div>
                  </>:<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>No versions yet - upload evidence below or complete the artifact to start the trail.</div>}
                </div>}
              </div>;
            })}
          </div>
          <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles([...e.dataTransfer.files].map(f=>f.name));}} style={{marginTop:12,border:`1.5px dashed ${rc}50`,borderRadius:10,padding:"16px 14px",textAlign:"center"}}>
            <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:700,marginBottom:3}}>Drop evidence files here</div>
            <div style={{fontSize:9.5,color:T.ink4,fontFamily:F.b,marginBottom:8}}>Uploads are stamped with owner, time and version and recorded in Trust & Evidence.</div>
            <label style={{background:rc+"16",border:`1px solid ${rc}45`,borderRadius:7,padding:"6px 13px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",display:"inline-block"}}>
              Select files<input type="file" multiple style={{display:"none"}} onChange={e=>{addFiles([...e.target.files].map(f=>f.name));e.target.value="";}}/>
            </label>
          </div>
          {files.length>0&&<div style={{marginTop:10,display:"grid",gap:6}}>
            {files.map(f=><div key={f.name+f.time} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px"}}>
              <span style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:600,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
              <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,flexShrink:0}}>{f.owner} · {f.time} · {f.version}</span>
              <Tag label={f.status} color={T.blue} bg={T.blue+"14"}/>
            </div>)}
          </div>}
          <div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>
            <button onClick={()=>setEvLog(e=>({...e,open:!e.open}))} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{evLog.open?"– Cancel evidence record":"+ Log an evidence record (governed owner)"}</button>
            {evLog.open&&(()=>{
              const fLabel=l=><span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{l}</span>;
              const logEvidence=()=>{
                if(!evLog.item.trim()){showToast&&showToast("Describe the evidence item","error");return;}
                pushBus("vz-gw-evidence",{item:evLog.item.trim(),initiative:selected.name,scope:"Phase "+phase.order+" - "+phase.name,control:evLog.control||"Evidence intake",risk:"Lifecycle evidence",owner:evLog.owner||R.label,status:evLog.status,approval:evLog.approval,version:"v1",time:"Just now"});
                setPhaseFiles(f=>({...f,[pKey]:[{name:evLog.item.trim(),owner:evLog.owner||R.label,time:stamp(),status:evLog.status,version:"v1"},...(f[pKey]||[])]}));
                showToast&&showToast(`Evidence "${evLog.item.trim()}" recorded — owner ${evLog.owner||R.label}`);
                setEvLog({open:false,item:"",owner:"",control:"",status:"In Review",approval:"Awaiting Approval"});
              };
              return <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:9}}>
                <label style={{display:"grid",gap:4,gridColumn:"1/-1"}}>{fLabel("Evidence item")}<input value={evLog.item} onChange={e=>setEvLog({...evLog,item:e.target.value})} placeholder="e.g. Human oversight design record" style={fieldStyle}/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Owner")}<SmartSelect vocab="person" value={evLog.owner} onChange={v=>setEvLog(e=>({...e,owner:v}))} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Control framework")}<SmartSelect vocab="framework" value={evLog.control} onChange={v=>setEvLog(e=>({...e,control:v}))} role={role} showToast={showToast} requestedBy={R.name}/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Status")}
                  <select value={evLog.status} onChange={e=>setEvLog({...evLog,status:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["In Review","In Progress","Complete"].map(s=><option key={s} value={s}>{s}</option>)}</select>
                </label>
                <label style={{display:"grid",gap:4}}>{fLabel("Approval")}
                  <select value={evLog.approval} onChange={e=>setEvLog({...evLog,approval:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Awaiting Approval","Pending","Approved"].map(s=><option key={s} value={s}>{s}</option>)}</select>
                </label>
                <button onClick={logEvidence} style={{gridColumn:"1/-1",justifySelf:"start",background:AI_GOLD,border:"none",borderRadius:7,padding:"8px 15px",color:"#111",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Record evidence</button>
              </div>;
            })()}
          </div>
        </Card>
        <div style={{display:"grid",gap:12,alignContent:"start"}}>
          <Card style={{padding:16,border:`1px solid ${AI_GOLD}30`}}>
            <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Veris completeness review</div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:F.m,color:completeness===100?T.green:completeness>=50?T.amber:T.red,marginBottom:6}}>{completeness}%</div>
            <Bar value={completeness} color={completeness===100?T.green:T.amber}/>
            <p style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:"9px 0 0"}}>
              {completeness===100?`All artifacts for ${phase.name} are complete. ${st==="Complete"?"Phase is closed and archived.":"Request "+phase.raci.accountable+" sign-off to close the phase."}`
              :`${phase.deliverables.length-doneCount(activePhase)} artifact${phase.deliverables.length-doneCount(activePhase)>1?"s":""} outstanding${selected.blockedBy&&activePhase===selected.phaseIndex?"; the phase is blocked: "+selected.blockedBy:""}. ${files.length?files.length+" uploaded file"+(files.length>1?"s":"")+" await mapping to artifacts.":"Upload supporting evidence to accelerate review."}`}
            </p>
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px"}}>Ownership (RACI)</h3>
            {[["Responsible",phase.raci.responsible,T.green],["Accountable",phase.raci.accountable,rc],["Consulted",phase.raci.consulted,T.blue],["Informed",phase.raci.informed,T.ink3]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <Tag label={l} color={c} bg={c+"14"}/><span style={{fontSize:11,color:T.ink,fontWeight:700,fontFamily:F.b}}>{v}</span>
            </div>)}
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 9px"}}>Reviewer comments</h3>
            <div style={{display:"flex",gap:6,marginBottom:9}}>
              <input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addComment();}} placeholder="Add a review note..." style={{...fieldStyle,fontSize:10.5,padding:"7px 10px"}}/>
              <button onClick={addComment} style={{background:rc+"16",border:`1px solid ${rc}45`,borderRadius:7,padding:"0 12px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Post</button>
            </div>
            {comments.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>No comments on this phase yet.</div>}
            <div style={{display:"grid",gap:7}}>
              {comments.map((c,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><strong style={{color:T.ink}}>{c.by}</strong> <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{c.time}</span><br/>{c.text}</div>)}
            </div>
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 9px"}}>Audit trail</h3>
            {auditTrail.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>Activity on this phase will appear here with timestamps.</div>}
            <div style={{display:"grid",gap:6}}>
              {auditTrail.slice(0,6).map((a,i)=><div key={i} style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}><span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{a.time}</span> · {a.what} · <span style={{color:T.ink2}}>{a.by}</span></div>)}
            </div>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:9,lineHeight:1.5}}>Entries are also written to the hash-chained platform audit log (ISO 42001 / EU AI Act ready).</div>
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
  /* Risk lives in the Risk Center. AI Central shows only count, highest,
     trend and status - clicking opens the register scoped to this initiative. */
  const renderRiskSummary=()=>{
    const rows=riskRegister.filter(r=>r.initiativeId===selected.id);
    const worst=[...rows].sort((a,b)=>b.residual-a.residual)[0];
    const inTreatment=rows.filter(r=>r.treatment.status!=="Complete").length;
    const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
    return <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:0}}>Risk summary</h3>
        <button onClick={()=>setTab&&setTab("riskcenter")} style={{background:T.red+"14",border:`1px solid ${T.red}40`,borderRadius:7,padding:"5px 11px",color:T.red,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Risk Center →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[["Registered risks",rows.length,rows.length?T.amber:T.green],
          ["Highest residual",worst?`${worst.residual}/25`:"none",worst?lvC(worst.level):T.green],
          ["Trend",selected.blockedBy?"Blocked":"Within appetite",selected.blockedBy?T.red:T.green],
          ["In treatment",inTreatment,inTreatment?T.blue:T.green]].map(([l,v,c])=>
          <button key={l} onClick={()=>setTab&&setTab("riskcenter")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{l}</div>
            <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          </button>)}
      </div>
      {worst&&<div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:10}}>Most severe: {worst.id} "{worst.title}" ({worst.level}) - treatment {worst.treatment.status.toLowerCase()} with {worst.treatment.owner}.</div>}
      {selected.blockedBy&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b,marginTop:10}}><strong style={{color:T.red}}>Open blocker:</strong> {selected.blockedBy}</div>}
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
      <div style={{padding:"10px 18px"}}><button onClick={()=>setView("evidence")} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open evidence →</button></div>
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
    <button onClick={()=>setView("governance")} style={{marginTop:12,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Review controls →</button>
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
  /* One Executive Summary Header: four hero metrics as typography, one
     primary recommendation. Everything else lives inside the tabs. */
  const renderExecHeader=(compact)=>{
    const heroes=[
      ["Health",String(wsHealth),wsHealth>=80?T.green:wsHealth>=60?T.amber:T.red,"overview",`(governance ${selected.guardrail} + adoption ${selected.adoption} + value ${selected.valueScore}) / 3`],
      ["Business value",selected.expected,AI_GOLD,"value","Expected value from the approved business case"],
      ["Risk",wsRiskScore?`${wsRiskScore}/25`:selected.risk,wsRiskScore>=10?T.red:wsRiskScore>=6?T.amber:T.green,"governance","Worst residual risk: likelihood x impact out of 25"],
      ["Phase",`${selected.phaseIndex+1} of ${AC_PHASES.length}`,T.blue,"journey","Position in the 13-phase governed lifecycle"],
    ];
    return <div style={{margin:"2px 0 18px"}}>
      <div style={{display:"flex",gap:10,alignItems:"baseline",flexWrap:"wrap"}}>
        <h2 style={{fontFamily:F.h,fontSize:24,fontWeight:800,color:T.ink,margin:0,letterSpacing:"-0.02em"}}>{selected.name}</h2>
        <Tag label={selected.lifecycle} color={catColor(selected.lifecycle)} bg={catColor(selected.lifecycle)+"14"}/>
      </div>
      <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:4}}>{selected.unit} · {selected.category} · Sponsor {selected.sponsor}</div>
      {!compact&&<div style={{display:"flex",gap:28,flexWrap:"wrap",margin:"16px 0 0"}}>
        {heroes.map(([l,v,c,tabTo,how])=><button key={l} onClick={()=>setInitTab(tabTo)} title={how} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c,lineHeight:1}}>{v}</div>
        </button>)}
        <button onClick={()=>setInitTab("value")} style={{marginLeft:"auto",alignSelf:"center",background:wsRecC+"10",border:`1px solid ${wsRecC}35`,borderRadius:9,padding:"9px 14px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:wsRecC,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:2}}>Primary recommendation</div>
          <div style={{fontSize:13,fontWeight:900,fontFamily:F.b,color:wsRecC}}>{wsRec==="Scale"?"Continue to Scale Gate":wsRec==="Retire"?"Prepare governed retirement":wsRec==="Improve"?"Address gaps before advancing":"Continue current phase"} · {wsConfidence}%</div>
        </button>
      
      </div>}
    </div>;
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
  const WS_LEGACY={list:"overview",implementation:"journey",risks:"governance",risk:"governance",controls:"governance",approvals:"governance",pilot:"monitoring",evidence:"monitoring",roi:"value",adoption:"value",feedback:"value",lessons:"value",insights:"value",decision:"value",scalegate:"value"};
  const wsTab=WS_LEGACY[initTab]||initTab;
  /* ── Veris Intelligence rail (RIGHT pane): context for the selected initiative ── */
  const renderIntelRail=()=>{
    const f=acFeedback[selected.id]||DEFAULT_FEEDBACK;
    const recD=feedbackDecision(f);
    const conf=feedbackAvg(f);
    const recC=decisionColorOf(recD,T);
    const activity=evidenceRows.filter(e=>e.initiative===selected.name).slice(0,3);
    const secHead=t=><div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>{t}</div>;
    const divider=<div style={{height:1,background:`linear-gradient(90deg,${AI_GOLD}30,transparent)`,margin:"15px 0"}}/>;
    /* The Executive Advisor is visually distinct from the rest of the
       interface: gold spine, soft gradient, typographic sections. */
    return <div style={{alignSelf:"start",background:`linear-gradient(165deg,${AI_GOLD}0a,${T.s1}99 40%)`,borderLeft:`2px solid ${AI_GOLD}55`,borderRadius:"4px 12px 12px 4px",padding:"16px 15px"}}>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:13}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:AI_GOLD,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:11.5,fontWeight:900,fontFamily:F.h,color:T.ink}}>Veris Intelligence</span>
        <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.1em",marginLeft:"auto"}}>{
          /* The advisor's persona follows the context being viewed. */
          (!profileMode&&buildPerspective())?buildPerspective().persona
          :wsTab==="value"?"Financial Advisor"
          :wsTab==="governance"?"Governance Advisor"
          :wsTab==="journey"||wsTab==="pmo"?"Delivery Advisor"
          :wsTab==="monitoring"?"Auditor"
          :"Executive Advisor"}</span>
      </div>
      {secHead("Executive brief")}
      <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{selected.name} is in {AC_PHASES[selected.phaseIndex]?.name} (phase {selected.phaseIndex+1}/{AC_PHASES.length}) delivering {selected.actual} of {selected.expected} expected.{phaseSel!=null&&phaseSel!==selected.phaseIndex?` You are reviewing ${AC_PHASES[phaseSel]?.name} (${phaseSel<selected.phaseIndex?"complete":"not started"}).`:""} {selected.blockedBy?`Progress is blocked: ${selected.blockedBy}.`:`No open blockers; adoption is at ${selected.adoption}%.`}</p>
      {divider}
      {secHead("Program analysis")}
      {(()=>{
        const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
        const totalExp=acInitiatives.reduce((a,i)=>a+money(i.expected),0);
        const share=Math.round((money(selected.expected)/totalExp)*100);
        const remaining=AC_PHASES.length-selected.phaseIndex;
        const weeks=remaining*3+(selected.blockedBy?2:0);
        const eta=new Date();eta.setDate(eta.getDate()+weeks*7);
        const etaLabel=eta.toLocaleDateString("en-GB",{month:"short",year:"numeric"});
        return <div style={{display:"grid",gap:6,fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
          <div><strong style={{color:T.ink}}>Portfolio impact:</strong> {share}% of enterprise AI value ({selected.expected} of ${totalExp.toFixed(1)}M).</div>
          <div><strong style={{color:T.ink}}>Financial impact:</strong> ${(money(selected.expected)-money(selected.actual)).toFixed(1)}M unrealized; {selected.spent||"—"} of {selected.budget||"—"} budget consumed.</div>
          <div><strong style={{color:T.ink}}>Blockers:</strong> {selected.blockedBy||"none open"}.</div>
          <div><strong style={{color:T.ink}}>Delay prediction:</strong> {selected.blockedBy?"~2 weeks slip if the blocker holds past this sprint":"on schedule at current cadence"}.</div>
          <div><strong style={{color:T.ink}}>Predicted completion:</strong> ~{etaLabel} ({remaining} phases remaining).</div>
        </div>;
      })()}
      {divider}
      {secHead("Recommendation")}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <Tag label={recD} color={recC} bg={recC+"16"}/>
        <span style={{fontSize:10,fontFamily:F.m,fontWeight:900,color:T.ink3}}>confidence {wsConfidence}%</span>
      </div>
      <div style={{display:"grid",gap:6,fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
        <div><strong style={{color:T.ink}}>Reason:</strong> governance {selected.guardrail}%, adoption {selected.adoption}%, value score {selected.valueScore}%.</div>
        <div><strong style={{color:T.ink}}>Business impact:</strong> {selected.expected} expected value; {selected.actual} realized to date.</div>
        <div><strong style={{color:T.ink}}>Evidence:</strong> phase artifacts through {AC_PHASES[selected.phaseIndex]?.name}; controls {selected.controls.join(", ")||"pending"}.</div>
      </div>
      <button onClick={()=>setInitTab("value")} style={{marginTop:11,width:"100%",background:recC+"12",border:`1px solid ${recC}40`,borderRadius:7,padding:"7px 10px",color:recC,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Recommended action: review in Value →</button>
      {(pending>0||recD==="Scale"||recD==="Retire")&&<>
        {divider}
        {secHead("Pending approvals")}
        <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55,marginBottom:8}}>{pending} approval{pending===1?"":"s"} await{pending===1?"s":""} executive review{(recD==="Scale"||recD==="Retire")?` - including a governed ${recD} decision on this initiative`:""}.</div>
        <button onClick={()=>setTab&&setTab("decisions")} style={{width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"7px 10px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Review approvals →</button>
      </>}
      {divider}
      {secHead("Suggested next actions")}
      <div style={{display:"grid",gap:6,marginBottom:2}}>
        {[[wsNextAction.length>46?wsNextAction.slice(0,46)+"…":wsNextAction,()=>setInitTab("journey")],
          ["Review phase evidence",()=>setInitTab("journey")],
          ["Check execution plan in AI PMO",()=>setInitTab("pmo")]].map(([l,go])=><button key={l} onClick={go} style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 10px",color:T.ink2,fontSize:10,fontWeight:700,fontFamily:F.b,cursor:"pointer"}}>{l} →</button>)}
      </div>
      {divider}
      {secHead("Recent activity")}
      {activity.length===0&&<div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>No recorded activity yet - completed artifacts will appear here.</div>}
      <div style={{display:"grid",gap:7}}>
        {activity.map(e=><div key={`${e.item}-${e.time}`} style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><span style={{color:T.ink4,fontFamily:F.m}}>{e.time}</span> · {e.item}</div>)}
      </div>
      {activity.length>0&&<button onClick={()=>setView("evidence")} style={{marginTop:9,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open evidence →</button>}
    </div>;
  };
  /* AI PMO - execution management. Journey owns the lifecycle method;
     the PMO owns delivery: schedule, scope, resources, money, decisions. */
  const renderPmo=()=>{
    const pmo=acPmo[selected.id];
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    if(!pmo)return <Card style={{padding:18}}><div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>Execution plan not yet stood up for this initiative - the PMO workspace is created at Business Case approval.</div></Card>;
    const secH=t=><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px",fontFamily:F.h}}>{t}</h3>;
    const msCol=st=>st==="Complete"?T.green:st==="On Track"?T.blue:st==="At Risk"?T.red:T.ink4;
    const budgetPct=Math.min(100,Math.round((money(selected.spent)/(money(selected.budget)||1))*100));
    const govDecisions=readBus("vz-gw-evidence").filter(e=>e.initiative===selected.name&&/decision/i.test(e.item)).slice(0,3);
    const allDeliverables=AC_PHASES.reduce((a,p)=>a+p.deliverables.length,0);
    const doneDeliverables=AC_PHASES.reduce((a,p,idx)=>a+(idx<selected.phaseIndex?p.deliverables.length:idx===selected.phaseIndex?selected.phaseArtifactsDone:0),0);
    return <div style={{display:"grid",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Sprint - "+pmo.sprint.name)}
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginBottom:7}}>{pmo.sprint.dates} · {pmo.sprint.goal}</div>
          <Bar value={Math.round((pmo.sprint.done/pmo.sprint.committed)*100)} color={AI_GOLD}/>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:6}}>{pmo.sprint.done} of {pmo.sprint.committed} points done</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Budget tracking")}
          <div style={{fontSize:18,fontWeight:900,fontFamily:F.m,color:budgetPct>85?T.red:budgetPct>65?T.amber:T.green,marginBottom:6}}>{selected.spent} <span style={{fontSize:11,color:T.ink3,fontWeight:700}}>of {selected.budget}</span></div>
          <Bar value={budgetPct} color={budgetPct>85?T.red:AI_GOLD}/>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>{budgetPct}% consumed · {phaseProgress(selected)}% of lifecycle complete</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Deliverables")}
          <div style={{fontSize:18,fontWeight:900,fontFamily:F.m,color:T.blue,marginBottom:6}}>{doneDeliverables} <span style={{fontSize:11,color:T.ink3,fontWeight:700}}>of {allDeliverables} artifacts</span></div>
          <Bar value={Math.round((doneDeliverables/allDeliverables)*100)} color={T.blue}/>
          <button onClick={()=>setInitTab("journey")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open the Journey →</button>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Timeline & milestones")}
          <div style={{display:"grid",gap:8}}>
            {pmo.milestones.map(m=><div key={m.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center",minWidth:0}}><span style={{width:7,height:7,borderRadius:"50%",background:msCol(m.status),flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{m.name}</span></div>
              <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{m.due}</span><Tag label={m.status} color={msCol(m.status)} bg={msCol(m.status)+"14"}/></div>
            </div>)}
          </div>
          <div style={{fontSize:9.5,color:T.ink4,fontFamily:F.b,marginTop:10}}>Timeline {selected.timeline} · phase {selected.phaseIndex+1}/{AC_PHASES.length} · {phaseProgress(selected)}% complete</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Tasks - current phase")}
          <div style={{display:"grid",gap:7}}>
            {AC_PHASES[selected.phaseIndex]?.deliverables.map((d,ai)=>{
              const st=artifactStatus(selected,selected.phaseIndex,ai);
              const c=st==="Complete"?T.green:st==="Blocked"?T.red:T.amber;
              return <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{d}</span>
                <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{AC_PHASES[selected.phaseIndex].raci.responsible}</span><Tag label={st} color={c} bg={c+"14"}/></div>
              </div>;
            })}
          </div>
        </Card>
      </div>
      <Card style={{padding:16}}>
        {secH("RAID log")}
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr>{["Type","Item","Owner","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"7px 10px",color:T.ink4,fontSize:8.5,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{pmo.raid.map((r,i)=>{
            const c=r.kind==="Risk"?T.red:r.kind==="Issue"?T.amber:r.kind==="Dependency"?T.blue:T.teal;
            return <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
              <td style={{padding:"8px 10px"}}><Tag label={r.kind} color={c} bg={c+"14"}/></td>
              <td style={{padding:"8px 10px",color:T.ink2,fontFamily:F.b}}>{r.item}</td>
              <td style={{padding:"8px 10px",color:T.ink3,fontFamily:F.b}}>{r.owner}</td>
              <td style={{padding:"8px 10px",color:/block|open/i.test(r.status)?T.red:T.ink3,fontFamily:F.b}}>{r.status}</td>
            </tr>;})}
          </tbody>
        </table></div>
        <button onClick={()=>setTab&&setTab("riskcenter")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Risks live in the Risk Center →</button>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Decision log")}
          <div style={{display:"grid",gap:9}}>
            {pmo.decisions.map((d,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
              <strong style={{color:T.ink}}>{d.decision}</strong><br/>
              <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{d.by} · {d.date}</span> · {d.rationale}
            </div>)}
            {govDecisions.map((d,i)=><div key={"g"+i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
              <strong style={{color:T.ink}}>{d.item}</strong><br/>
              <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{d.owner} · {d.time}</span>
            </div>)}
          </div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Resource allocation")}
          {pmo.resources.map(r=><div key={r.role} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{r.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{r.role}</div></div>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD}}>{r.allocation}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Meetings")}
          {pmo.meetings.map(m=><div key={m.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{m.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{m.cadence}</div></div>
            <span style={{fontSize:10,fontFamily:F.m,color:T.ink2}}>{m.next}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Change requests")}
          {pmo.changeRequests.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>No open change requests.</div>}
          {pmo.changeRequests.map(cr=><div key={cr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div style={{minWidth:0}}><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{cr.id} · {cr.title}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{cr.impact}</div></div>
            <Tag label={cr.status} color={/approved/i.test(cr.status)?T.green:T.amber} bg={(/approved/i.test(cr.status)?T.green:T.amber)+"14"}/>
          </div>)}
          <button onClick={wsBriefing} style={{marginTop:10,width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"8px 10px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Generate executive report ↓</button>
        </Card>
      </div>
    </div>;
  };

  /* ── Role perspectives: the same initiative, a different executive lens.
     Each perspective answers ONE question from live initiative data.
     "Full Initiative Profile" expands the complete digital twin. ── */
  const buildPerspective=()=>{
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    const iniRisks=[...riskRegister.filter(r=>r.initiativeId===selected.id)].sort((a,b)=>b.residual-a.residual);
    const pmo=acPmo[selected.id];
    const models=MODEL_REGISTRY.filter(m=>m.initiativeId===selected.id);
    const totalExp=acInitiatives.reduce((a,i)=>a+money(i.expected),0);
    const budgetPct=Math.min(100,Math.round((money(selected.spent)/(money(selected.budget)||1))*100));
    const benefits=Math.round((money(selected.actual)/(money(selected.expected)||1))*100);
    const P={
      ceo:{question:"Should I worry?",persona:"Executive Advisor",
        tiles:[["Overall health",wsHealth,wsHealth>=75?T.green:T.amber],["Business value",selected.expected,AI_GOLD],["ROI",selected.roi,T.green],["Budget",`${budgetPct}% used`,budgetPct>85?T.red:T.blue],["Delivery confidence",wsConfidence+"%",wsConfidence>=70?T.green:T.amber]],
        sections:[
          {title:"Executive summary",text:`${selected.objective||selected.name} ${selected.blockedBy?"Currently blocked: "+selected.blockedBy+".":"No blockers open."} Expected impact ${selected.expected}; ${selected.actual} realized.`},
          {title:"Major blockers",rows:selected.blockedBy?[[selected.blockedBy,"Open"]]:[["None open","✓"]]},
          {title:"Top risks",rows:iniRisks.slice(0,5).map(r=>[r.title,`${r.level} · ${r.residual}/25`])},
        ]},
      cfo:{question:"Is this investment creating value?",persona:"Financial Advisor",
        tiles:[["Investment",selected.budget||"—",T.blue],["Spent",selected.spent||"—",budgetPct>85?T.red:T.blue],["ROI",selected.roi,T.green],["Cost savings",selected.savings,T.green],["Revenue impact",selected.revenue,AI_GOLD]],
        sections:[
          {title:"Benefits realization",rows:[["Expected value",selected.expected],["Realized to date",`${selected.actual} (${benefits}%)`],["Budget variance",`${100-budgetPct}% headroom`],["Run rate",`~$${(money(selected.spent)/Math.max(1,selected.phaseIndex)).toFixed(2)}M per phase`],["Forecast accuracy",wsConfidence+"% confidence"],["Portfolio share",Math.round((money(selected.expected)/totalExp)*100)+"% of enterprise AI value"]]},
          {title:"Financial risks",rows:iniRisks.slice(0,3).map(r=>[r.title,r.level])},
        ]},
      cio:{question:"Will this integrate and scale?",persona:"Technology Advisor",
        tiles:[["Delivery timeline",selected.timeline||"—",T.blue],["Platform readiness",selected.guardrail+"%",selected.guardrail>=80?T.green:T.amber],["Operational health",wsHealth,wsHealth>=75?T.green:T.amber],["Models deployed",models.filter(m=>m.status==="In Production").length+"/"+models.length,T.teal]],
        sections:[
          {title:"Technology stack",rows:models.map(m=>[m.system,`${m.type} · ${m.vendor}`])},
          {title:"Dependencies & infrastructure",rows:(pmo?pmo.raid.filter(r=>r.kind==="Dependency"):[]).map(d=>[d.item,d.status]).concat([["Technical debt","Low - reviewed at each gate"],["Availability target","99.9% (gateway-fronted)"]])},
        ]},
      ciso:{question:"Can I trust this AI?",persona:"Security & Risk Advisor",
        tiles:[["Risk score",wsRiskScore?wsRiskScore+"/25":"none",wsRiskScore>=10?T.red:wsRiskScore>=6?T.amber:T.green],["Open risks",iniRisks.length,iniRisks.length?T.amber:T.green],["Controls",selected.controls.length,T.blue],["Security testing",models.filter(m=>m.biasTest).length+"/"+models.length+" tested",T.teal],["Kill switch",models.filter(m=>m.killSwitch).length+"/"+models.length,models.every(m=>m.killSwitch)?T.green:T.amber]],
        sections:[
          {title:"Threat exposure",rows:iniRisks.map(r=>[r.title,`${r.level} · residual ${r.residual}/25 · ${r.treatment.status}`])},
          {title:"Mitigations & evidence",rows:[["Active controls",selected.controls.join(", ")||"pending"],["Evidence trail",wsEvidence+"% of lifecycle evidenced"],["Attack surface","Gateway-mediated; no direct model exposure"]]},
        ]},
      caio:{question:"Is this AI responsible and governed?",persona:"Governance Advisor",
        tiles:[["Governance score",selected.guardrail+"%",selected.guardrail>=80?T.green:T.amber],["Lifecycle phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["Approvals pending",(pmo?1:0)+(selected.blockedBy?1:0),T.amber],["Evidence",wsEvidence+"%",wsEvidence>=70?T.green:T.amber]],
        sections:[
          {title:"Responsible AI posture",rows:[["AI policies",selected.policies.join(", ")],["Human oversight","HITL gates on all high-impact decisions"],["AIRA / AIRT","Open the Risk Center for assessments and treatments"]]},
          {title:"Decision log",rows:(pmo?pmo.decisions:[]).map(d=>[d.decision,`${d.by} · ${d.date}`])},
        ]},
      cdpo:{question:"Does this protect personal information?",persona:"Privacy Advisor",
        tiles:[["DPIA",models.every(m=>m.aia)?"Complete":"In progress",models.every(m=>m.aia)?T.green:T.amber],["Privacy controls",selected.policies.length,T.blue],["Data provenance",models.filter(m=>m.dataProvenance).length+"/"+models.length,T.teal],["Privacy risks",iniRisks.filter(r=>/leak|profil|privacy|data/i.test(r.title)).length,T.amber]],
        sections:[
          {title:"Privacy posture",rows:[["GDPR basis","Legitimate interest + consent where required"],["PII handling","Masked at the gateway before model calls"],["Retention","7-year evidence retention; prompts 90 days"],["Cross-border","EU/US processing under adequacy safeguards"],["Data classification",selected.policies.join(", ")]]},
          {title:"Privacy risks",rows:iniRisks.filter(r=>/leak|profil|privacy|data|bias/i.test(r.title)).map(r=>[r.title,r.level])},
        ]},
      cgo:{question:"Can this legally operate?",persona:"Legal & Compliance Advisor",
        tiles:[["Regulatory scope",models[0]?.clause?.split("/")[0]||"EU AI Act",T.blue],["Legal reviews",selected.audits.length,T.teal],["Open obligations",(selected.blockedBy?1:0),(selected.blockedBy?T.amber:T.green)],["Vendor contracts",[...new Set(models.map(m=>m.vendor))].filter(v=>v!=="Internal").length,T.ink3]],
        sections:[
          {title:"Regulatory obligations",rows:models.map(m=>[m.bizName,m.clause])},
          {title:"Contracts, IP & licensing",rows:[["Vendors",[...new Set(models.map(m=>m.vendor))].join(", ")],["Liability posture","Human accountability retained on all decisions"],["Policy compliance",selected.policies.join(", ")],["Open obligations",selected.blockedBy||"None"]]},
        ]},
      coo:{question:"Will this deliver successfully?",persona:"Delivery Advisor",
        tiles:[["Phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["Completion",phaseProgress(selected)+"%",T.teal],["Sprint",pmo?`${pmo.sprint.done}/${pmo.sprint.committed} pts`:"—",AI_GOLD],["Milestones at risk",pmo?pmo.milestones.filter(m=>m.status==="At Risk").length:0,T.amber]],
        sections:[
          {title:"Milestones",rows:(pmo?pmo.milestones:[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
          {title:"RAID highlights",rows:(pmo?pmo.raid.slice(0,4):[]).map(r=>[`${r.kind}: ${r.item}`,r.status])},
        ]},
      employee:{question:"What must happen next?",persona:"Work Advisor",
        tiles:[["Current phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["My tasks",AC_PHASES[selected.phaseIndex]?.deliverables.length-selected.phaseArtifactsDone,T.amber],["Evidence required",selected.blockedBy?1:0,selected.blockedBy?T.red:T.green],["Next milestone",(pmo?.milestones||[]).find(m=>m.status!=="Complete")?.due||"—",T.teal]],
        sections:[
          {title:"Tasks in this phase",rows:AC_PHASES[selected.phaseIndex]?.deliverables.map((d,ai)=>[d,ai<selected.phaseArtifactsDone?"Complete":"Open · "+AC_PHASES[selected.phaseIndex].raci.responsible])||[]},
          {title:"Evidence & approvals",rows:[["Evidence required",selected.blockedBy||"None outstanding"],["Approver",AC_PHASES[selected.phaseIndex]?.raci.accountable||"—"],["Applicable policies",selected.policies.join(", ")]]},
          {title:"Deadlines",rows:(pmo?.milestones||[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
        ]},
      manager:{question:"Is my team ready to deliver?",persona:"Adoption Advisor",
        tiles:[["Team adoption",selected.adoption+"%",selected.adoption>=60?T.green:T.amber],["Training",selected.training,T.blue],["Resistance",selected.resistance,selected.resistance==="High"?T.red:T.amber],["Phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.teal]],
        sections:[
          {title:"Milestones",rows:(pmo?.milestones||[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
          {title:"Workforce signals",rows:[["Adoption trend",selected.adoption>=60?"Growing":"Below target - enablement needed"],["Training completion",selected.training],["Change resistance",selected.resistance],["Blocker",selected.blockedBy||"None"]]},
        ]},
      chro:{question:"Is adoption increasing?",persona:"Adoption Advisor",
        tiles:[["Adoption",selected.adoption+"%",selected.adoption>=70?T.green:T.amber],["Training",selected.training,T.blue],["Resistance",selected.resistance,selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green],["Value score",selected.valueScore+"%",AI_GOLD]],
        sections:[
          {title:"Workforce signals",rows:[["Users in scope",selected.unit+" teams"],["Usage trend",selected.adoption>=60?"Growing week over week":"Below target - enablement needed"],["Feedback",`Stakeholder composite ${feedbackAvg(acFeedback[selected.id]||DEFAULT_FEEDBACK)}/100`],["Improvement backlog",pmo&&pmo.changeRequests.length?pmo.changeRequests.map(c=>c.title).join("; "):"None open"]]},
          {title:"Business KPIs",rows:(selected.successMetrics||[]).map(m=>[m,"tracked"])},
        ]},
    };
    return P[role];
  };
  const renderPerspective=()=>{
    const p=buildPerspective();
    if(!p)return null;
    return <div style={{animation:"up .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,margin:"2px 0 14px",flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:RC(role),textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>{(ROLES[role]||ROLES.caio).label} perspective</div>
          <div style={{fontSize:16,fontWeight:800,fontFamily:F.h,color:T.ink}}>{p.question}</div>
        </div>
        <button onClick={()=>setProfileMode(true)} style={{background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:8,padding:"8px 14px",color:AI_GOLD,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Full Initiative Profile →</button>
      </div>
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:18}}>
        {p.tiles.map(([l,v,c])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{l}</div>
          <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c,lineHeight:1.1}}>{v}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gap:18}}>
        {p.sections.map(sec=>{
          const secGo=/risk|threat/i.test(sec.title)?()=>nav("risk")
            :/benefit|financ|value|kpi/i.test(sec.title)?()=>nav("value",{id:selected.id})
            :/milestone|raid|task|stack|dependen|infra|technology/i.test(sec.title)?()=>nav("pmo",{id:selected.id})
            :/decision/i.test(sec.title)?()=>nav("decision")
            :/evidence|posture/i.test(sec.title)?()=>nav("monitoring",{id:selected.id})
            :/mitigation|regulat|contract|privacy|responsible|workforce|blocker|summary/i.test(sec.title)?()=>nav("governance",{id:selected.id})
            :null;
          return <div key={sec.title}>
          <h3 style={{fontSize:13,color:T.ink,margin:"0 0 8px",fontFamily:F.h,fontWeight:800}}>{sec.title}</h3>
          {sec.text&&<p style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{sec.text}</p>}
          {sec.rows&&<div style={{display:"grid",gap:2}}>
            {sec.rows.length===0&&<div style={{fontSize:10.5,color:T.ink4,fontFamily:F.b}}>Nothing recorded yet.</div>}
            {sec.rows.map(([a,b],i)=><button key={i} onClick={secGo||undefined} disabled={!secGo} style={{display:"flex",justifyContent:"space-between",gap:12,borderBottom:`1px solid ${T.border}`,padding:"7px 2px",background:"transparent",border:"none",cursor:secGo?"pointer":"default",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{a}</span>
              <span style={{fontSize:10.5,color:T.ink,fontFamily:F.b,fontWeight:700,textAlign:"right",flexShrink:0}}>{b}{secGo?<span style={{color:T.ink4}}> →</span>:null}</span>
            </button>)}
          </div>}
        </div>;})}
      </div>
    </div>;
  };

  /* ── Enterprise AI PMO: the Portfolio Delivery Office. Enterprise-wide
     delivery visibility only - execution stays inside each initiative. ── */
  const renderEnterprisePmo=()=>{
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    const totBudget=acInitiatives.reduce((a,i)=>a+money(i.budget),0);
    const totSpent=acInitiatives.reduce((a,i)=>a+money(i.spent),0);
    const allRaid=acInitiatives.flatMap(i=>(acPmo[i.id]?.raid||[]).map(r=>({...r,ini:i})));
    const deps=allRaid.filter(r=>r.kind==="Dependency");
    const openIssues=allRaid.filter(r=>r.kind==="Issue"&&/open/i.test(r.status));
    const atRisk=acInitiatives.filter(i=>(acPmo[i.id]?.milestones||[]).some(m=>m.status==="At Risk"));
    const resources=acInitiatives.flatMap(i=>(acPmo[i.id]?.resources||[]).map(r=>({...r,ini:i.name})));
    const secH=t=><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px",fontFamily:F.h}}>{t}</h3>;
    return <div style={{display:"grid",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
        {[["Initiatives in delivery",acInitiatives.length,T.blue,()=>openModule("initiatives"),"Open the initiative workspaces"],
          ["Milestones at risk",atRisk.length,atRisk.length?T.red:T.green,()=>atRisk[0]?openInitiative(atRisk[0].id,"pmo"):openModule("initiatives"),"Open the first at-risk initiative's PMO"],
          ["Open blocking issues",openIssues.length,openIssues.length?T.amber:T.green,()=>openIssues[0]?openInitiative(openIssues[0].ini.id,"pmo"):openModule("initiatives"),"Open the blocked initiative's PMO"],
          ["Portfolio budget",`$${totSpent.toFixed(1)}M / $${totBudget.toFixed(1)}M`,AI_GOLD,()=>setTab&&setTab("reports"),"Financial reporting lives in Reports"]].map(([l,v,c,go,hint])=><Card key={l} onClick={go} title={hint} style={{padding:"13px 14px",cursor:"pointer"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{l}</div>
          <div style={{fontSize:20,fontWeight:800,fontFamily:F.m,color:c}}>{v}</div>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        {secH("Delivery health & portfolio timeline")}
        <div style={{display:"grid",gap:9}}>
          {acInitiatives.map(i=>{
            const pmo=acPmo[i.id];
            const riskMs=(pmo?.milestones||[]).filter(m=>m.status==="At Risk").length;
            return <button key={i.id} onClick={()=>openInitiative(i.id,"pmo")} style={{display:"grid",gridTemplateColumns:"1.3fr 2fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${riskMs?T.amber+"45":T.border}`,borderRadius:9,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div>
                <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,marginTop:2}}>{i.timeline} · {pmo?pmo.sprint.name:"no sprint"}</div>
              </div>
              <div><Bar value={phaseProgress(i)} color={i.blockedBy?T.amber:T.green}/><div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:4}}>Phase {i.phaseIndex+1}/{AC_PHASES.length} · {phaseProgress(i)}% · {money(i.spent).toFixed(1)} of {money(i.budget).toFixed(1)}M</div></div>
              {riskMs?<Tag label={`${riskMs} at risk`} color={T.amber} bg={T.amberL}/>:<Tag label="On track" color={T.green} bg={T.greenL}/>}
              <span style={{fontSize:10,fontWeight:900,color:AI_GOLD,fontFamily:F.b}}>Open PMO →</span>
            </button>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Cross-initiative dependencies")}
          <div style={{display:"grid",gap:8}}>
            {deps.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
              <div style={{minWidth:0}}><div style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{d.item}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{d.ini.name} · {d.owner}</div></div>
              <span style={{fontSize:9.5,color:/due|pending/i.test(d.status)?T.amber:T.green,fontFamily:F.b,fontWeight:800,flexShrink:0}}>{d.status}</span>
            </div>)}
          </div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Portfolio RAID")}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {["Risk","Assumption","Issue","Dependency"].map(k=>{
              const n=allRaid.filter(r=>r.kind===k).length;
              const c=k==="Risk"?T.red:k==="Issue"?T.amber:k==="Dependency"?T.blue:T.teal;
              return <span key={k} style={{background:c+"14",border:`1px solid ${c}35`,borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,color:c}}>{k} {n}</span>;
            })}
          </div>
          {openIssues.map((r,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5,marginBottom:5}}><strong style={{color:T.amber}}>{r.ini.name}:</strong> {r.item}</div>)}
          <button onClick={()=>setTab&&setTab("riskcenter")} style={{marginTop:6,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Risks live in the Risk Center →</button>
        </Card>
        <Card style={{padding:16}}>
          {secH("Capacity & resources")}
          {resources.slice(0,7).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{r.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{r.role} · {r.ini}</div></div>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD}}>{r.allocation}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Executive reporting")}
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>Portfolio packs, value reporting and audit-ready exports are generated in Reports.</p>
          <button onClick={()=>setTab&&setTab("reports")} style={{width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"8px 10px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Reports →</button>
        </Card>
      </div>
    </div>;
  };

  /* ── AI Portfolio Command Center: portfolio rail | selected initiative | intelligence rail ── */
  const Initiatives=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"minmax(220px,1fr) minmax(0,2.1fr) minmax(220px,1fr)",gap:14,alignItems:"start"}}>
      {renderPortfolioRail()}
      <div style={{minWidth:0}}>
        {createOpen&&renderCreateForm()}
        {renderExecHeader(!profileMode&&!!buildPerspective())}
        {!profileMode&&buildPerspective()?renderPerspective():<>
          {buildPerspective()&&<button onClick={()=>setProfileMode(false)} style={{background:"transparent",border:"none",padding:0,marginBottom:8,color:T.ink3,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>← {(ROLES[role]||ROLES.caio).label} perspective</button>}
          <SubTabs tabs={[["overview","Overview"],["journey","Journey"],["pmo","AI PMO"],["value","Value"],["governance","Governance"],["monitoring","Monitoring"]]} active={wsTab} onChange={setInitTab}/>
          {wsTab==="overview"&&<Overview/>}
          {wsTab==="journey"&&<InitJourney/>}
          {wsTab==="pmo"&&renderPmo()}
          {wsTab==="value"&&<InitInsights/>}
          {wsTab==="governance"&&<div>{renderRiskSummary()}<div style={{marginTop:12}}><RiskAssessmentCascade setTab={setTab} fixed={selected.id}/></div><div style={{marginTop:12}}><InitControls/></div><div style={{marginTop:12}}><InitApprovals/></div></div>}
          {wsTab==="monitoring"&&<div><InitEvidenceTimeline/><div style={{marginTop:12}}><PilotExecution/></div></div>}
        </>}
      </div>
      {renderIntelRail()}
    </div>
  </div>;

  /* ── AI Governance ─────────────────────────────────────────── */
  const Governance=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Governance score" value={avgGuard+"%"} sub="Portfolio control compliance" color={rc} score={avgGuard}/>
      {AC_FRAMEWORK_POSTURE.filter(f=>["iso42001","nist","euai"].includes(f.id)).map(f=><Metric key={f.id} label={f.name} value={f.score+"%"} sub={f.sub} color={f.score>=75?T.blue:f.score>=70?T.teal:T.amber} score={f.score} onClick={()=>setGovTab("controls")}/>)}
      <Metric label="Policy violations" value="3" sub="1 repeated - training assigned" color={T.red} onClick={()=>openModule("academy")}/>
      <Metric label="Active exceptions" value="4" sub="2 expiring this month" color={T.amber} onClick={()=>{setTab("decisions");}}/>
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
    <SubTabs tabs={[["units","Business Units"],["maturity","Governance Maturity"],["usecases","Use Case Pipeline"]]} active={pfTab} onChange={setPfTab}/>
    {pfTab==="units"&&<PortfolioUnits setView={setView}/>}
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
    {(()=>{
      /* Runtime rules ranked by violations - each rule traces to its policy;
         live guardrail events from the workbench appear at the top. */
      const live=readBus("vz-violations").slice(0,5);
      const ranked=POLICY_REGISTER.flatMap(p=>p.rules.map(r=>({...r,policy:p})))
        .sort((a,b)=>b.violationsMtd-a.violationsMtd).slice(0,7);
      return <Card style={{padding:0,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <h3 style={{margin:0,fontSize:14,color:T.ink,fontWeight:800,fontFamily:F.h}}>Runtime rules by violations - last 30 days</h3>
          <button onClick={()=>setTab&&setTab("policies")} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Policy register →</button>
        </div>
        {ranked.map((r,i)=><div key={r.id+r.policy.id} style={{display:"grid",gridTemplateColumns:"22px minmax(0,1.5fr) 1fr 96px 80px",gap:10,alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,fontFamily:F.m,fontWeight:900,color:T.ink4}}>{i+1}</span>
          <span style={{minWidth:0}}>
            <span style={{display:"block",fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.name}</span>
            <button onClick={()=>setTab&&setTab("policies")} style={{background:"transparent",border:"none",padding:0,fontSize:8.5,color:AI_GOLD,fontFamily:F.m,cursor:"pointer"}}>{r.policy.key} {r.policy.name} · {r.clauseRef}</button>
          </span>
          <Tag label={r.action} color={r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue} bg={(r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue)+"14"}/>
          <span style={{fontSize:13,fontFamily:F.m,fontWeight:900,color:T.ink,textAlign:"right"}}>{r.violationsMtd}</span>
          <span style={{fontSize:10,fontFamily:F.m,fontWeight:800,color:r.trend.startsWith("+")?T.amber:T.green,textAlign:"right"}}>{r.trend}</span>
        </div>)}
        {live.length>0&&<div style={{padding:"10px 16px",background:T.s1}}>
          <div style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Live events - this session</div>
          {live.map((v,i)=><div key={i} style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6}}>
            <span style={{color:v.action==="Blocked"?T.red:T.amber,fontWeight:800}}>{v.action}</span> · {v.rule} · {v.policy} · {v.model||"gateway"} · {v.time}
          </div>)}
        </div>}
      </Card>;
    })()}
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

  /* ── AI Repository: the enterprise inventory of live AI agents and
     projects — each with its accountable owner and a system-architecture
     summary (model, data, integrations, guardrails). Replaces the abstract
     operating-model map on the Executive Dashboard with something concrete:
     what AI actually exists, who owns it, and how it's built. ── */
  const AI_REPOSITORY=[
    {name:"Customer Resolution Copilot",type:"GenAI Agent",owner:"Aisha Patel",unit:"Customer Operations",status:["Pilot","info"],
      arch:{Model:"Claude Sonnet · via AI Gateway",Data:"CRM tickets · KB articles",Integrations:"ServiceNow · Zendesk",Guardrails:"PII redaction · prompt-shield"}},
    {name:"Fraud Detection Model",type:"ML Model",owner:"D. Osei",unit:"Retail Banking",status:["Production","good"],
      arch:{Model:"Gradient-boosted ensemble v3",Data:"Transaction stream · device signals",Integrations:"Core banking · case mgmt",Guardrails:"Drift monitor · human review"}},
    {name:"Finance Close Automation",type:"GenAI Agent",owner:"R. Chen",unit:"Finance",status:["Scaling","good"],
      arch:{Model:"GPT-4o · via AI Gateway",Data:"Ledger · reconciliations",Integrations:"ERP · close workflow",Guardrails:"Approval gate · evidence log"}},
    {name:"Credit Decision Assurance",type:"Decision Model",owner:"CDPO office",unit:"SME Lending",status:["Remediate","warn"],
      arch:{Model:"Scorecard + LLM rationale",Data:"Applications · bureau data",Integrations:"Loan origination",Guardrails:"Art.22 human review · DPIA"}},
    {name:"Workforce Skills Navigator",type:"GenAI Agent",owner:"CHRO office",unit:"People",status:["Assessment","info"],
      arch:{Model:"Gemini · via AI Gateway",Data:"Skills graph · role profiles",Integrations:"HRIS · LMS",Guardrails:"Consent · bias eval"}},
    {name:"Supplier Risk Screener",type:"GenAI Agent",owner:"Procurement",unit:"Operations",status:["Pilot","info"],
      arch:{Model:"Claude Haiku · via AI Gateway",Data:"Vendor filings · news",Integrations:"Procurement suite",Guardrails:"Source citation · rate-limit"}},
  ];
  const RepositoryPanel=()=><Card style={{padding:"16px 18px",marginTop:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,flexWrap:"wrap",marginBottom:13}}>
      <div>
        <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m,marginBottom:3}}>AI Repository</div>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b}}>Live AI agents &amp; projects — owner and system architecture</div>
      </div>
      {access.modules.includes("repository")&&<button onClick={()=>openModule("repository")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 13px",color:AI_GOLD,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>Open AI Repository →</button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:10}}>
      {AI_REPOSITORY.map(a=><div key={a.name} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:9}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.name}</div>
            <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{a.type} · {a.unit}</div>
          </div>
          <Tag label={a.status[0]} color={lensCol(a.status[1])} bg={lensCol(a.status[1])+"18"}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:8.5,fontFamily:F.m,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em"}}>Owner</span>
          <span style={{fontSize:10.5,fontWeight:800,color:AI_GOLD,fontFamily:F.b}}>{a.owner}</span>
        </div>
        <div style={{fontSize:8.5,fontFamily:F.m,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>System architecture</div>
        <div style={{display:"grid",gap:5}}>
          {Object.entries(a.arch).map(([k,v])=><div key={k} style={{display:"grid",gridTemplateColumns:"84px 1fr",gap:8,alignItems:"baseline"}}>
            <span style={{fontSize:9.5,color:T.ink3,fontFamily:F.m,fontWeight:700}}>{k}</span>
            <span style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.4}}>{v}</span>
          </div>)}
        </div>
      </div>)}
    </div>
  </Card>;

  /* ── AI Strategy ── ambition · investment · roadmap ── */
  const STRAT_PILLARS=[["Productivity","Automate high-volume, low-variance work behind a human gate","$5.4M",78,"gold"],["Growth","AI-native products and customer experiences","$4.2M",54,"good"],["Risk & Trust","Govern, secure and prove every AI system","$2.1M",71,"blue"],["Workforce","Reskill and enable the whole organisation","$1.7M",61,"teal"]];
  const AIStrategy=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Strategic pillars" value="4" sub="board-agreed" color={rc}/>
      <Metric label="FY26 investment" value="$13.4M" sub="allocated across pillars" color={AI_GOLD}/>
      <Metric label="On roadmap" value="12" sub="initiatives sequenced" color={T.blue}/>
      <Metric label="Maturity target" value="3.8" sub="of 5 by FY27" color={T.teal} score={76}/>
    </div>
    <Card style={{padding:"16px 18px",marginBottom:14}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Strategic pillars — where AI investment goes</div>
      <div style={{display:"grid",gap:11}}>{STRAT_PILLARS.map(p=><div key={p[0]} style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) 90px minmax(120px,1fr)",gap:12,alignItems:"center"}}>
        <div style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{p[0]}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:1}}>{p[1]}</div></div>
        <div style={{fontSize:14,fontWeight:800,fontFamily:F.m,color:lensCol(p[4])}}>{p[2]}</div>
        <div><Bar value={p[3]} color={lensCol(p[4])}/><div style={{fontSize:9,color:T.ink3,marginTop:3,fontFamily:F.b}}>{p[3]}% of ambition funded</div></div>
      </div>)}</div>
    </Card>
    <Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Roadmap — initiatives by lifecycle horizon</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Initiative","Business unit","Horizon","Value at stake"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{items.map(i=><tr key={i.id} onClick={()=>openInitiative(i.id,"overview")} style={{cursor:"pointer"}} className="vz-pn-row">
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontWeight:700}}>{i.name}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2}}>{i.unit}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`}}><Tag label={["Scaling","Production"].includes(i.lifecycle)?"Now":["Pilot"].includes(i.lifecycle)?"Next":"Later"} color={["Scaling","Production"].includes(i.lifecycle)?T.green:["Pilot"].includes(i.lifecycle)?T.blue:T.ink3} bg={(["Scaling","Production"].includes(i.lifecycle)?T.green:["Pilot"].includes(i.lifecycle)?T.blue:T.ink3)+"18"}/></td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.expected}</td>
        </tr>)}</tbody>
      </table></div>
    </Card>
  </div>;

  /* ── AI Inventory ── systems · datasets · vendors ── */
  const [invTab,setInvTab]=useState("systems");
  const INV_DATASETS=[["Customer interactions","Confidential","EU",true],["Credit histories","Restricted","EU",true],["Financial ledgers","Confidential","US",false],["Employee records","Restricted","EU",true],["Support transcripts","Internal","US",false],["Product telemetry","Internal","Global",false]];
  const AIInventory=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="AI systems" value={MODEL_REGISTRY.length} sub="catalogued" color={rc}/>
      <Metric label="Datasets" value={INV_DATASETS.length+"·38"} sub="classified" color={T.teal}/>
      <Metric label="Approved vendors" value={gatewayProviders.length} sub="under contract" color={AI_GOLD}/>
      <Metric label="Shadow AI" value="2" sub="in intake" color={T.amber}/>
    </div>
    <SubTabs tabs={[["systems","Systems & models"],["datasets","Datasets"],["vendors","Vendors"]]} active={invTab} onChange={setInvTab}/>
    {invTab==="systems"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["System / model","Vendor","EU AI Act","Status"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{MODEL_REGISTRY.map(m=><tr key={m.id} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{m.bizName}<div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:400}}>{m.name}</div></td>
          <td style={{padding:"11px 14px",color:T.ink2}}>{m.vendor}</td>
          <td style={{padding:"11px 14px"}}><Tag label={m.euAiAct} color={m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber} bg={(m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber)+"16"}/></td>
          <td style={{padding:"11px 14px"}}><Tag label={m.status} color={m.status==="In Production"?T.green:m.status==="Awaiting Approval"?T.amber:T.ink3} bg={(m.status==="In Production"?T.green:m.status==="Awaiting Approval"?T.amber:T.ink3)+"16"}/></td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {invTab==="datasets"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Dataset","Classification","Residency","PII"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{INV_DATASETS.map((d,i)=><tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{d[0]}</td>
          <td style={{padding:"11px 14px"}}><Tag label={d[1]} color={d[1]==="Restricted"?T.red:d[1]==="Confidential"?T.amber:T.blue} bg={(d[1]==="Restricted"?T.red:d[1]==="Confidential"?T.amber:T.blue)+"16"}/></td>
          <td style={{padding:"11px 14px",color:T.ink2,fontFamily:F.m}}>{d[2]}</td>
          <td style={{padding:"11px 14px"}}><Tag label={d[3]?"PII":"None"} color={d[3]?T.amber:T.green} bg={(d[3]?T.amber:T.green)+"16"}/></td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {invTab==="vendors"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
      {gatewayProviders.map(p=><Card key={p.id} style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b}}>{p.name}</div><Tag label={p.status} color={p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red} bg={(p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red)+"16"}/></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{p.kind}</div>
        <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,marginTop:8}}>{p.models.join(", ")}</div>
      </Card>)}
    </div>}
  </div>;

  /* ── AI Lifecycle ── the 13-phase governed journey + workspace + PMO ── */
  const [lcTab,setLcTab]=useState("board");
  const lcCol=lc=>["Scaling"].includes(lc)?T.green:["Production","Pilot"].includes(lc)?AI_GOLD:["Retired"].includes(lc)?T.red:T.blue;
  const AILifecycle=()=><div>
    <SubTabs tabs={[["board","Phase Board"],["initiatives","Initiative Workspaces"],["pmo","AI PMO"]]} active={lcTab} onChange={setLcTab}/>
    {lcTab==="board"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
        <Metric label="Active initiatives" value={items.length} sub="on the journey" color={rc}/>
        <Metric label="At a gate" value="2" sub="awaiting decision" color={T.amber}/>
        <Metric label="Scale-ready" value="2" sub="evidence complete" color={T.green}/>
        <Metric label="Canonical phases" value={AC_PHASES.length} sub="opportunity → retire" color={T.blue}/>
      </div>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:4}}>Governed lifecycle — where each initiative sits</div>
        <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,marginBottom:14}}>Every initiative advances phase by phase; each gate needs evidence before it opens.</div>
        <div style={{display:"grid",gap:12}}>{items.map(i=>{const pi=i.phaseIndex||0;const ph=AC_PHASES[pi];return <div key={i.id} onClick={()=>openInitiative(i.id,"journey")} style={{cursor:"pointer",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px"}} className="vz-pn-row">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:9}}>
            <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name} <span style={{fontSize:9.5,color:T.ink3,fontWeight:600}}>· {i.unit}</span></div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><Tag label={i.lifecycle} color={lcCol(i.lifecycle)} bg={lcCol(i.lifecycle)+"16"}/><span style={{fontSize:9.5,color:T.ink3,fontFamily:F.m,fontWeight:700}}>Phase {pi+1}/{AC_PHASES.length} · {ph?.name}</span></div>
          </div>
          <div style={{display:"flex",gap:3}}>{AC_PHASES.map((p,idx)=><div key={p.id} title={p.name} style={{flex:1,height:6,borderRadius:3,background:idx<pi?T.green:idx===pi?AI_GOLD:T.s3}}/>)}</div>
        </div>;})}</div>
      </Card>
    </div>}
    {lcTab==="initiatives"&&<Initiatives/>}
    {lcTab==="pmo"&&renderEnterprisePmo()}
  </div>;

  /* ── Trust Center ── live posture and attestations ── */
  const TRUST_ATTEST=[["ISO 42001 AIMS","Certified","Feb 2026","good"],["EU AI Act readiness","In progress","Aug 2026","warn"],["SOC 2 Type II","Current","Jan 2026","good"],["GDPR Art.22 safeguards","Attested","Mar 2026","good"],["NIST AI RMF","Aligned","Apr 2026","good"],["Model transparency notices","Published","live","good"]];
  const TrustCenter=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Trust posture" value="82" sub="live composite" color={T.green} score={82}/>
      <Metric label="Attacks blocked" value="2,410" sub="last 30 days" color={T.blue}/>
      <Metric label="Live incidents" value="1" sub="P1 prompt-injection" color={T.red}/>
      <Metric label="Attestations" value="6" sub="current" color={AI_GOLD}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14}}>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Attestations & certifications</div>
        <div style={{display:"grid",gap:8}}>{TRUST_ATTEST.map(a=><div key={a[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <div><div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{a[0]}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:1}}>as of {a[2]}</div></div>
          <Tag label={a[1]} color={lensCol(a[3]==="good"?"good":"warn")} bg={lensCol(a[3]==="good"?"good":"warn")+"16"}/>
        </div>)}</div>
      </Card>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Live guardrail enforcement</div>
        <div style={{display:"grid",gap:8}}>{guardrailDetectors.slice(0,6).map(d=><div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          <div style={{minWidth:0}}><div style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{d.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{d.triggeredMtd.toLocaleString()}× MTD</div></div>
          <Tag label={d.action} color={d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:T.green} bg={(d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:T.green)+"16"}/>
        </div>)}</div>
      </Card>
    </div>
  </div>;

  /* ── Policies & Standards ── policy library + violations ── */
  const [polTab,setPolTab]=useState("library");
  const PoliciesStandards=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Active policies" value={POLICY_REGISTER.length} sub="in force" color={rc}/>
      <Metric label="Overdue review" value={POLICY_REGISTER.filter(p=>p.overdueDays>0).length} sub="past due date" color={T.amber}/>
      <Metric label="Avg acknowledgement" value={Math.round(POLICY_REGISTER.reduce((s,p)=>s+p.ackCoverage,0)/POLICY_REGISTER.length)+"%"} sub="workforce" color={T.green}/>
      <Metric label="Standards mapped" value="5" sub="frameworks" color={T.blue}/>
    </div>
    <SubTabs tabs={[["library","Policy Library"],["violations","Violation Analytics"]]} active={polTab} onChange={setPolTab}/>
    {polTab==="library"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Policy","Owner","Version","Next review","Ack"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{POLICY_REGISTER.map(p=><tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{p.name}<div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:400}}>{p.key} · {p.category}</div></td>
          <td style={{padding:"11px 14px",color:T.ink2}}>{p.owner}</td>
          <td style={{padding:"11px 14px",color:T.ink3,fontFamily:F.m}}>{p.version}</td>
          <td style={{padding:"11px 14px"}}><Tag label={p.nextReview} color={p.overdueDays>0?T.red:T.ink3} bg={p.overdueDays>0?T.red+"16":"transparent"}/></td>
          <td style={{padding:"11px 14px",color:p.ackCoverage>=85?T.green:T.amber,fontFamily:F.m,fontWeight:800}}>{p.ackCoverage}%</td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {polTab==="violations"&&<Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Top rules by violations — last 30 days</div>
      <div style={{display:"grid",gap:7}}>{POLICY_REGISTER.flatMap(p=>p.rules.map(r=>({...r,pol:p.name}))).sort((a,b)=>b.violationsMtd-a.violationsMtd).slice(0,8).map((r,i)=><div key={r.id} style={{display:"grid",gridTemplateColumns:"20px 1fr 100px 70px",gap:10,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:11,fontFamily:F.m,fontWeight:900,color:T.ink4}}>{i+1}</span>
        <div style={{minWidth:0}}><div style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{r.pol}</div></div>
        <Tag label={r.action} color={r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue} bg={(r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue)+"14"}/>
        <span style={{fontSize:13,fontFamily:F.m,fontWeight:900,color:T.ink,textAlign:"right"}}>{r.violationsMtd.toLocaleString()}</span>
      </div>)}</div>
    </Card>}
  </div>;

  /* ── Value Realization ── expected vs realized ROI ── */
  const totExp=items.reduce((s,i)=>s+money(i.expected),0),totAct=items.reduce((s,i)=>s+money(i.actual),0);
  const ValueRealization=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Expected value" value={"$"+totExp.toFixed(1)+"M"} sub="portfolio target" color={AI_GOLD}/>
      <Metric label="Realized value" value={"$"+totAct.toFixed(1)+"M"} sub={Math.round(totAct/totExp*100)+"% captured"} color={T.green} score={Math.round(totAct/totExp*100)}/>
      <Metric label="Portfolio ROI" value="+22%" sub="weighted actual" color={T.green}/>
      <Metric label="Value at risk" value="$2.1M" sub="no value yet" color={T.amber}/>
    </div>
    <Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>Value bridge — expected vs realized by initiative</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Initiative","Expected","Realized","Capture","Health"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{items.map(i=>{const cap=Math.round(money(i.actual)/money(i.expected)*100)||0;return <tr key={i.id} onClick={()=>openInitiative(i.id,"value")} style={{cursor:"pointer"}} className="vz-pn-row">
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontWeight:700}}>{i.name}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.expected}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.actual}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,minWidth:110}}><Bar value={cap} color={cap>=50?T.green:cap>=25?T.amber:T.red}/><div style={{fontSize:9,color:T.ink3,marginTop:3}}>{cap}%</div></td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontFamily:F.m,fontWeight:700}}>{i.valueScore}</td>
        </tr>;})}</tbody>
      </table></div>
    </Card>
  </div>;

  /* ── Audit Center ── immutable trail + findings + packs ── */
  const AUDIT_TRAIL=[["Scale decision recorded","Resolution Copilot","A. Patel","09:42","Decision"],["Guardrail policy v6 approved","Responsible GenAI Use","A. Patel","08:15","Policy"],["DPIA evidence uploaded","Credit Decision","N. Lynch","Jul 24","Evidence"],["Risk treatment advanced","Servicing drift","D. Nair","Jul 23","Risk"],["Control test logged","CTRL-AI-014","R. Torres","Jul 22","Control"],["Model approved for production","Finance Close","M. Reid","Jul 21","Approval"]];
  const AuditCenter=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Log integrity" value="100%" sub="hash-chained" color={T.green} score={100}/>
      <Metric label="Open findings" value="5" sub="2 high" color={T.amber}/>
      <Metric label="Audit packs" value="4" sub="regulator-ready" color={T.blue}/>
      <Metric label="Events logged" value="48.2K" sub="this month" color={rc}/>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      <button onClick={()=>{vzDownload("audit-pack.txt",AUDIT_TRAIL.map(a=>a.join(" · ")).join("\n"));showToast&&showToast("Audit pack exported");}} style={{background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"8px 14px",color:AI_GOLD,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Export audit pack →</button>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"13px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}><h3 style={{margin:0,fontSize:14,color:T.ink,fontFamily:F.b}}>Immutable audit trail</h3><Tag label="hash-chained" color={T.green} bg={T.green+"16"}/></div>
      {AUDIT_TRAIL.map((a,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 100px 80px 90px",gap:10,padding:"12px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
        <span style={{fontSize:12,color:T.ink,fontWeight:700,fontFamily:F.b}}>{a[0]}</span>
        <span style={{fontSize:10.5,color:T.ink3,fontFamily:F.b}}>{a[1]}</span>
        <span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b}}>{a[2]}</span>
        <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{a[3]}</span>
        <Tag label={a[4]} color={T.blue} bg={T.blue+"14"}/>
      </div>)}
    </Card>
  </div>;

  return <div style={{animation:"up .3s ease"}}>
    <Header/>
    {activeModule==="dashboard"&&<><RoleLensBand/><Dashboard/><RepositoryPanel/></>}
    {activeModule==="strategy"&&<><ModuleLensBand module="strategy"/><AIStrategy/></>}
    {activeModule==="portfolio"&&<><ModuleLensBand module="portfolio"/><Portfolio/></>}
    {activeModule==="repository"&&<><ModuleLensBand module="repository"/><PageModelRegistry setTab={setTab} openInitiative={openInitiative} role={role} showToast={showToast}/></>}
    {activeModule==="inventory"&&<><ModuleLensBand module="inventory"/><AIInventory/></>}
    {activeModule==="lifecycle"&&<><ModuleLensBand module="lifecycle"/><AILifecycle/></>}
    {activeModule==="gateway"&&<Gateway/>}
    {activeModule==="risk"&&<><ModuleLensBand module="risk"/><PageRiskCenter role={role} tab="riskcenter" setTab={setTab} setAiCentralView={setView} showToast={showToast}/></>}
    {activeModule==="trust"&&<><ModuleLensBand module="trust"/><TrustCenter/></>}
    {activeModule==="evidence"&&<><ModuleLensBand module="evidence"/><EvidenceModule/></>}
    {activeModule==="controls"&&<><ModuleLensBand module="controls"/><Governance/></>}
    {activeModule==="policies"&&<><ModuleLensBand module="policies"/><PoliciesStandards/></>}
    {activeModule==="value"&&<><ModuleLensBand module="value"/><ValueRealization/></>}
    {activeModule==="academy"&&<Academy/>}
    {activeModule==="audit"&&<><ModuleLensBand module="audit"/><AuditCenter/></>}
    {activeModule==="initiatives"&&<Initiatives/>}
    {activeModule==="pmo"&&renderEnterprisePmo()}
    {activeModule==="admin"&&<Administration/>}
  </div>;
}

