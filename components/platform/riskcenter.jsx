"use client";

import { readBus, pushBus } from "@/lib/bus";
import { Map } from "lucide-react";
import { useState } from "react";
import { acInitiatives, riskRegister, kriRegister, AI_GOV_ENGINES, acAssessments } from "@/lib/platform-models";
import { T, AI_GOLD, F, CountUp, Tag, PTag, STag, Bar, Card, SHead } from "./core";
import { PageAISpine } from "./spine";

export function RiskAssessmentCascade({setTab,setAiCentralView,fixed}){
  const [selId,setSelId]=useState(fixed||acInitiatives[0].id);
  const ini=acInitiatives.find(i=>i.id===selId)||acInitiatives[0];
  const outcomes=acAssessments[selId]||[];
  const stC=st=>st==="Complete"?T.green:st==="In Progress"?T.amber:T.ink4;
  const drillTo=d=>{
    if(d.surface==="compliance")setTab&&setTab("compliance");
    else if(d.surface==="aicentral"){setAiCentralView&&setAiCentralView("governance");setTab&&setTab("aicentral");}
    /* riskcenter drills stay on this surface - the register/treatments tabs hold the detail */
  };
  return <div>
    {!fixed&&<Card style={{padding:"12px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"}}>Initiative</span>
      {acInitiatives.map(i=><button key={i.id} onClick={()=>setSelId(i.id)} style={{background:selId===i.id?AI_GOLD+"20":T.s2,border:`1px solid ${selId===i.id?AI_GOLD+"55":T.border}`,color:selId===i.id?AI_GOLD:T.ink3,borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{i.name}</button>)}
      <span style={{marginLeft:"auto",fontSize:9,color:T.ink4,fontFamily:F.m}}>VerisZone proprietary governance engines · run automatically per initiative</span>
    </Card>}
    <div style={{display:"grid",gap:8}}>
      {AI_GOV_ENGINES.map((e,idx)=>{
        const o=outcomes.find(x=>x.engine===e.code);
        if(!o)return null;
        const c=stC(o.status);
        const scoreCol=o.score>=80?T.green:o.score>=60?T.amber:T.red;
        return <div key={e.code}>
          <Card style={{padding:"13px 15px",border:`1px solid ${c}30`}}>
            <div style={{display:"grid",gridTemplateColumns:"64px 1.2fr 2fr auto",gap:14,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:900,fontFamily:F.m,color:AI_GOLD}}>{e.code}</div>
                <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:scoreCol,marginTop:3}}>{o.score}</div>
              </div>
              <div>
                <div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{e.name}</div>
                <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:2}}>{e.question}</div>
                <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center"}}><STag s={o.status}/><span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>Owner: {e.owner}</span></div>
              </div>
              <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{o.outcome}</div>
              <button onClick={()=>drillTo(o.drill)} title={o.drill.hint} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 11px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{o.drill.hint} →</button>
            </div>
          </Card>
          {idx<AI_GOV_ENGINES.length-1&&<div style={{textAlign:"center",fontSize:11,color:T.ink4,lineHeight:1,padding:"2px 0"}}>↓</div>}
        </div>;
      })}
    </div>
    {ini.blockedBy&&<div style={{marginTop:10,background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b}}><strong style={{color:T.red}}>Cascade blocker:</strong> {ini.blockedBy}</div>}
  </div>;
}

/* ── Risk Center: system of record for every AI risk ──────────────
   Owned once, viewed many times - the initiative Risks tab, dashboards
   and reports render filtered views of this register. Every risk drills
   back to its initiative, executive, controls, frameworks and treatment. */
export function PageRiskCenter({role,tab,setTab,setAiCentralView,showToast}){
  const RC_LEGACY={riskcenter:"register",aira:"register",airt:"treatments",aia:"assessments",aiia:"assessments"};
  const [rcTab,setRcTab]=useState(RC_LEGACY[tab]||"register");
  const [dimBy,setDimBy]=useState("Enterprise");
  const [dimVal,setDimVal]=useState("All");
  const [sel,setSel]=useState(riskRegister[0]);
  const [cell,setCell]=useState(null);
  const [bumped,setBumped]=useState({});
  const lvColor=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  const initOf=r=>r.initiativeId?acInitiatives.find(i=>i.id===r.initiativeId):null;
  const openInitiative=()=>{setAiCentralView&&setAiCentralView("initiatives");setTab&&setTab("aicentral");};
  const FW_FAMILIES=["ISO 42001","ISO 27001","EU AI Act","GDPR","NIST AI RMF","SOX","OWASP"];
  const dimValues=dimBy==="Business Unit"?[...new Set(riskRegister.map(r=>r.unit))]
    :dimBy==="Project"?acInitiatives.filter(i=>riskRegister.some(r=>r.initiativeId===i.id)).map(i=>i.name)
    :dimBy==="Executive"?[...new Set(riskRegister.map(r=>r.execOwner))]
    :dimBy==="Model"?[...new Set(riskRegister.map(r=>r.system))]
    :dimBy==="Framework"?FW_FAMILIES.filter(fw=>riskRegister.some(r=>r.frameworks.some(f=>f.startsWith(fw))))
    :[];
  const matchDim=r=>{
    if(dimBy==="Enterprise"||dimVal==="All")return true;
    if(dimBy==="Business Unit")return r.unit===dimVal;
    if(dimBy==="Project"){const ini=initOf(r);return (ini&&ini.name)===dimVal;}
    if(dimBy==="Executive")return r.execOwner===dimVal;
    if(dimBy==="Model")return r.system===dimVal;
    if(dimBy==="Framework")return r.frameworks.some(f=>f.startsWith(dimVal));
    return true;
  };
  const rows=riskRegister.filter(matchDim);
  const effT=r=>bumped[r.id]||r.treatment.status;
  const advance=r=>{
    const cur=effT(r);
    if(cur==="Complete")return;
    const next=cur==="Planned"?"In Progress":"Complete";
    setBumped(prev=>({...prev,[r.id]:next}));
    const ini=initOf(r);
    pushBus("vz-gw-evidence",{item:`Treatment update: ${r.id} ${r.title} -> ${next}`,initiative:ini?ini.name:r.unit,scope:ini?"Project":"Enterprise",control:`Risk Center - ISO 42001 C.8.3 (${r.controls.join(", ")})`,risk:r.category,owner:r.treatment.owner,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"});
    showToast&&showToast(`${r.id} treatment ${next==="Complete"?"completed":"started"} - evidence recorded`);
  };
  const kriBreach=k=>k.direction==="above"?k.value>k.threshold:k.value<k.threshold;
  const openCritHigh=riskRegister.filter(r=>(r.level==="Critical"||r.level==="High")&&r.status!=="Closed").length;
  const inProg=riskRegister.filter(r=>effT(r)==="In Progress").length;
  const breaching=kriRegister.filter(kriBreach).length;
  const kpis=[
    ["Risks on register",riskRegister.length,T.blue,"register"],
    ["Critical / high open",openCritHigh,T.red,"heatmap"],
    ["Treatments in progress",inProg,T.violet,"treatments"],
    ["KRIs breaching",breaching,T.amber,"kris"],
  ];
  const TABS=[["register","Risk Register"],["assessments","Assessments"],["heatmap","Heat Map"],["treatments","Treatments"],["residual","Residual & Trends"],["kris","KRIs"],["drift","Risk Drift"]];
  const Dots=({n,color})=><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(x=><div key={x} style={{width:7,height:7,borderRadius:2,background:x<=n?color:T.border}}/>)}</div>;
  const detail=sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",boxShadow:`0 0 28px ${lvColor(sel.level)}10`,animation:"fade .25s ease"}}>
    <div style={{background:`linear-gradient(135deg,${lvColor(sel.level)}18,${T.s3})`,borderBottom:`1px solid ${lvColor(sel.level)}30`,padding:"14px 16px"}}>
      <div style={{display:"flex",gap:7,alignItems:"center"}}><Tag label={sel.level} color={lvColor(sel.level)} bg={lvColor(sel.level)+"20"}/><STag s={sel.status}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginLeft:"auto"}}>{sel.id}</span></div>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginTop:9,lineHeight:1.3}}>{sel.title}</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:3}}>{sel.system}</p>
    </div>
    <div style={{padding:16}}>
      <p style={{fontSize:11,color:T.ink3,lineHeight:1.7,fontFamily:F.b,marginBottom:12}}>{sel.desc}</p>
      {[["Category",sel.category],["Business unit",sel.unit],["Executive owner",sel.execOwner],["Risk owner",sel.riskOwner],["Inherent score",`${sel.likelihood*sel.impact}/25`],["Residual score",`${sel.residual}/25`]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span>
        <span style={{fontSize:10,color:T.ink,fontFamily:F.m,fontWeight:600,textAlign:"right",maxWidth:170}}>{v}</span>
      </div>)}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"11px 0 0"}}>
        {sel.frameworks.map(f=><Tag key={f} label={f} color={T.blue} bg={T.blue+"14"}/>)}
        {sel.controls.map(c=><button key={c} onClick={()=>setTab&&setTab("controls")} title="Open in the control library" style={{background:T.violet+"14",border:`1px solid ${T.violet}40`,borderRadius:6,padding:"2px 8px",color:T.violet,fontSize:9,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{c}</button>)}
      </div>
      <div style={{marginTop:13,background:T.s3,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${T.violet}`}}>
        <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Treatment - {sel.treatment.strategy} · {sel.treatment.owner} · due {sel.treatment.deadline}</div>
        <p style={{fontSize:10.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:0}}>{sel.treatment.action}</p>
      </div>
      <div style={{marginTop:10,background:AI_GOLD+"0d",border:`1px solid ${AI_GOLD}30`,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:9,fontWeight:800,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>AI recommendation</div>
        <p style={{fontSize:10.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:0}}>{sel.aiRecommendation}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:initOf(sel)?"1fr 1fr":"1fr",gap:8,marginTop:12}}>
        <button onClick={()=>{setRcTab("treatments");}} style={{background:T.violet,border:"none",borderRadius:7,padding:"9px",color:"#fff",fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{effT(sel)==="Complete"?"Treatment complete":"Manage treatment"}</button>
        {initOf(sel)&&<button onClick={openInitiative} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:7,padding:"9px",color:AI_GOLD,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open initiative →</button>}
      </div>
    </div>
  </Card>;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Risk Center" sub="The system of record for every AI risk. Owned once, viewed many times - every risk traces to its initiative, executive owner, controls, frameworks and treatment evidence. ISO 42001 C.8.2 / C.8.3."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:14}}>
      {kpis.map(([l,v,c,t])=><Card key={l} onClick={()=>setRcTab(t)} style={{padding:14,cursor:"pointer"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{l}</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c}}><CountUp value={v}/></div>
      </Card>)}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {TABS.map(([id,label])=><button key={id} onClick={()=>setRcTab(id)} style={{background:rcTab===id?T.red+"18":T.s2,border:`1px solid ${rcTab===id?T.red+"50":T.border}`,color:rcTab===id?T.red:T.ink2,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"}}>{label}</button>)}
    </div>
    {(rcTab==="register"||rcTab==="heatmap")&&<Card style={{padding:"12px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"}}>View by</span>
      {["Enterprise","Business Unit","Project","Executive","Model","Framework"].map(d=><button key={d} onClick={()=>{setDimBy(d);setDimVal("All");}} style={{background:dimBy===d?T.blue+"18":T.s2,border:`1px solid ${dimBy===d?T.blue+"50":T.border}`,color:dimBy===d?T.blue:T.ink3,borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{d}</button>)}
      {dimValues.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",borderLeft:`1px solid ${T.border}`,paddingLeft:10}}>
        {["All",...dimValues].map(v=><button key={v} onClick={()=>setDimVal(v)} style={{background:dimVal===v?AI_GOLD+"20":T.s2,border:`1px solid ${dimVal===v?AI_GOLD+"55":T.border}`,color:dimVal===v?AI_GOLD:T.ink3,borderRadius:7,padding:"4px 9px",fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{v}</button>)}
      </div>}
      <Tag label={`${rows.length} risks`} color={T.red} bg={T.red+"14"}/>
    </Card>}
    {rcTab==="register"&&<div style={{display:"grid",gridTemplateColumns:"1fr minmax(0,340px)",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 60px 60px 90px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["Risk","Initiative / Unit","L","I","Residual"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {rows.map((r,i)=>{
            const c=lvColor(r.level);const ini=initOf(r);
            return <div key={r.id} onClick={()=>setSel(r)} style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 60px 60px 90px",padding:"11px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",background:sel&&sel.id===r.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel&&sel.id===r.id?`3px solid ${c}`:"3px solid transparent",transition:"all .15s"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{r.title}</div>
                <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.id} · {r.riskOwner}</span>
              </div>
              <div>
                <div style={{fontSize:10,color:ini?AI_GOLD:T.ink2,fontFamily:F.b,fontWeight:ini?800:500}}>{ini?ini.name:r.unit}</div>
                <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>{ini?"Initiative":"Enterprise"} · Exec: {r.execOwner}</span>
              </div>
              <Dots n={r.likelihood} color={T.amber}/>
              <Dots n={r.impact} color={c}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:800,fontFamily:F.m,color:c}}>{r.residual}</span>
                <Tag label={r.level} color={c} bg={c+"18"}/>
              </div>
            </div>;
          })}
        </div>
      </div>
      {detail}
    </div>}
    {rcTab==="heatmap"&&<div style={{display:"grid",gridTemplateColumns:"minmax(0,420px) 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 4px"}}>Inherent risk heat map</h3>
        <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>Click a cell to see the risks behind it. Rows are impact, columns likelihood.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
          {[5,4,3,2,1].map(imp=>[1,2,3,4,5].map(lik=>{
            const cellRisks=rows.filter(r=>r.likelihood===lik&&r.impact===imp);
            const sc=lik*imp;
            const bg=sc>=16?T.red:sc>=10?T.amber:sc>=5?T.blue:T.green;
            const active=cell&&cell.l===lik&&cell.i===imp;
            return <button key={`${imp}-${lik}`} onClick={()=>setCell(active?null:{l:lik,i:imp})} style={{height:52,borderRadius:6,background:active?bg:bg+(cellRisks.length?"45":"18"),border:active?`2px solid ${bg}`:`1px solid ${bg}30`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,fontFamily:F.m,color:active?"#fff":cellRisks.length?T.ink:"transparent"}}>{cellRisks.length||0}</button>;
          }))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>← lower likelihood</span>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>higher likelihood →</span>
        </div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 10px"}}>{cell?`Risks at likelihood ${cell.l} × impact ${cell.i}`:"All risks in view"}</h3>
        <div style={{display:"grid",gap:8}}>
          {(cell?rows.filter(r=>r.likelihood===cell.l&&r.impact===cell.i):rows).map(r=>{
            const c=lvColor(r.level);const ini=initOf(r);
            return <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
              <div><div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{r.title}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{ini?ini.name:r.unit} · {r.category}</div></div>
              <Tag label={r.level} color={c} bg={c+"16"}/>
              <button onClick={()=>{setSel(r);setRcTab("register");}} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open →</button>
            </div>;
          })}
          {cell&&rows.filter(r=>r.likelihood===cell.l&&r.impact===cell.i).length===0&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>No risks sit in this cell - the register has nothing at this likelihood and impact.</div>}
        </div>
      </Card>
    </div>}
    {rcTab==="treatments"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 90px 1fr 90px 110px 150px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        {["Risk","Strategy","Owner / deadline","Priority","Status","Action"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
      </div>
      <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
        {riskRegister.map((r,i)=>{
          const st=effT(r);
          return <div key={r.id} style={{display:"grid",gridTemplateColumns:"1.6fr 90px 1fr 90px 110px 150px",padding:"10px 12px",alignItems:"center",borderBottom:i<riskRegister.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{r.title}</div>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.id} · {r.system}</span>
            </div>
            <STag s={r.treatment.strategy}/>
            <div><div style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{r.treatment.owner}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>due {r.treatment.deadline}</span></div>
            <PTag p={r.treatment.priority}/>
            <STag s={st}/>
            <button onClick={()=>advance(r)} disabled={st==="Complete"} style={{background:st==="Complete"?T.s3:T.violet,color:st==="Complete"?T.green:"#fff",border:st==="Complete"?`1px solid ${T.green}40`:"none",borderRadius:7,padding:"7px 8px",fontSize:9.5,fontWeight:700,fontFamily:F.b,cursor:st==="Complete"?"default":"pointer"}}>{st==="Complete"?"Evidence recorded":st==="Planned"?"Start treatment":"Mark complete"}</button>
          </div>;
        })}
      </div>
    </div>}
    {rcTab==="assessments"&&<RiskAssessmentCascade setTab={setTab} setAiCentralView={setAiCentralView}/>}
    {rcTab==="residual"&&<div>
      <Card style={{padding:16,marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 4px"}}>Inherent vs residual by initiative</h3>
        <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>How far treatment has driven each initiative's exposure down. Click a row to open its risks.</p>
        <div style={{display:"grid",gap:10}}>
          {acInitiatives.map(i=>{
            const rs=riskRegister.filter(r=>r.initiativeId===i.id);
            if(!rs.length)return null;
            const inh=Math.max(...rs.map(r=>r.likelihood*r.impact));
            const res=Math.max(...rs.map(r=>r.residual));
            return <button key={i.id} onClick={()=>{setDimBy("Project");setDimVal(i.name);setRcTab("register");}} style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr 90px",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name}</span>
              <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>INHERENT {inh}/25</div><Bar value={inh*4} color={T.red}/></div>
              <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>RESIDUAL {res}/25</div><Bar value={res*4} color={res<=6?T.green:T.amber}/></div>
              <Tag label={`-${inh-res} pts`} color={T.green} bg={T.greenL}/>
            </button>;
          })}
        </div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 10px"}}>Control effectiveness</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:8}}>
          {[...new Set(riskRegister.flatMap(r=>r.controls))].map(c=>{
            const linked=riskRegister.filter(r=>r.controls.includes(c));
            const done=linked.filter(r=>r.treatment.status==="Complete").length;
            const eff=Math.round((done/linked.length)*100);
            const col=eff>=70?T.green:eff>=40?T.amber:T.red;
            return <button key={c} onClick={()=>setTab&&setTab("controls")} title="Open in the control library" style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10.5,fontWeight:800,color:T.ink,fontFamily:F.m}}>{c}</span>
                <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:col}}>{eff}%</span>
              </div>
              <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginBottom:5}}>Covers {linked.map(r=>r.id).join(", ")} · {done}/{linked.length} treatments complete</div>
              <Bar value={eff} color={col}/>
            </button>;
          })}
        </div>
      </Card>
    </div>}
    {rcTab==="kris"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
      {kriRegister.map(k=>{
        const breach=kriBreach(k);
        const c=breach?T.red:T.green;
        const ini=k.initiativeId?acInitiatives.find(i=>i.id===k.initiativeId):null;
        const linked=riskRegister.filter(r=>r.kris.includes(k.id));
        return <Card key={k.id} style={{padding:15,border:`1px solid ${c}30`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <Tag label={breach?"Breaching":"Within appetite"} color={c} bg={c+"16"}/>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{k.id} · trend {k.trend}</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{k.name}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:8}}>
            <span style={{fontSize:24,fontWeight:900,fontFamily:F.m,color:c}}>{k.value}</span>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{k.unit} · threshold {k.direction==="above"?"≤":"≥"} {k.threshold}</span>
          </div>
          <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginBottom:10}}>Protects {k.framework}{linked.length>0&&` · watches ${linked.map(r=>r.id).join(", ")}`}</div>
          {ini?<button onClick={openInitiative} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"6px 11px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{ini.name} →</button>
          :<Tag label="Enterprise-level" color={T.blue} bg={T.blue+"14"}/>}
        </Card>;
      })}
    </div>}
    {rcTab==="drift"&&<PageAISpine mode="riskdrift" setTab={setTab}/>}
  </div>;
}

