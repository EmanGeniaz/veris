"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { riskRegister } from "@/lib/platform-models";
import { pushBus } from "@/lib/bus";
import { T, F, AI_GOLD, ROLES, Card, vzDownload } from "./core";
import { AI_ASSETS, facetRollup } from "@/lib/initiative-facets";
import { assetById } from "@/lib/ai-assets";
import { PORTFOLIO as CEO_PORTFOLIO, PF, FRAMEWORKS as CANON_FRAMEWORKS, COMPLIANCE_PCT, OPEN_INCIDENTS } from "@/lib/portfolio";
import { WORLD_GEO } from "@/lib/world-geo";
import { BriefDrawer } from "./initiative-brief";
import { LineageDrawer } from "./lineage";

/* Lineage plumbing — any tile or row calls openLin() to trace a number to
   its source. The provider (at the command-center root) owns the drawer so
   every CEO surface, not just Overview, can drill to the last part. */
const LinCtx = createContext(() => {});
const useLin = () => useContext(LinCtx);

/* A showcase program (CEO_PORTFOLIO) is the leaf record for the board view,
   so its lineage explains its own numbers rather than deriving from assets. */
const programLineage = p => ({
  label: p.name, value: `$${p.realized.toFixed(1)}M realized`,
  formula: "realized value vs allocated budget · ROI = (realized − spent) ÷ spent",
  rows: [
    { name: "Allocated budget", v: `$${p.budget.toFixed(1)}M`, unit: "FY26 allocation" },
    { name: "Consumed to date", v: `$${p.spent.toFixed(1)}M`, unit: "spend booked" },
    { name: "Value realized", v: `$${p.realized.toFixed(1)}M`, unit: "value booked" },
    { name: "ROI", v: p.roi > 0 ? `+${p.roi}%` : `${p.roi}%`, unit: "return on invested" },
    { name: "Time-to-value", v: p.ttv ? `${p.ttv} mo` : "—", unit: "kickoff → first value" },
    { name: "Residual risk", v: p.risk, unit: "current grade" },
    { name: "Adoption region", v: p.region, unit: p.stage },
  ],
  note: `${p.name} · ${p.unit} · ${p.region} · ${p.stage}. These are this program's own figures — its contribution to every portfolio rollup above.`,
});

/* ── CEO Command Center ─────────────────────────────────────────────
   The board-level lens on the enterprise AI portfolio. Renders one of
   seven surfaces driven by the CEO sidebar: Overview (with in-surface
   tabs), CEO Playbook, Portfolio, Budget, Risk Center, My Action Items,
   Reporting. Numbers reconcile with the platform's seeded programs
   (acInitiatives / riskRegister) and extend them with the executive
   dimensions a CEO reads: deployment region, BU headcount, security
   incidents, budget-leakage and time-to-value. */

/* Stage → semantic colour. Lifecycle collapses to the five bands a CEO
   tracks: Scaling, In Production, In Progress, Completed, Retired. */
const stageColor=s=>({Scaling:T.green,"In Production":AI_GOLD,"In Progress":T.blue,Completed:T.ink3,Retired:T.red}[s]||T.ink3);

/* Enterprise portfolio now lives in lib/portfolio.js (the canonical spine)
   and is imported as CEO_PORTFOLIO above; PF holds the derived rollups so
   every headline number reconciles with CAIO and AI Central. */

const STAGES=["Scaling","In Production","In Progress","Completed","Retired"];
const stageCount=s=>CEO_PORTFOLIO.filter(p=>p.stage===s).length;

/* Adoption by business unit — headcount is the CEO dimension. */
const CEO_BU=[
  {bu:"Customer Ops", head:1240, adoption:64, band:T.green},
  {bu:"Finance", head:380, adoption:79, band:T.green},
  {bu:"Retail Banking", head:910, adoption:42, band:AI_GOLD},
  {bu:"People", head:260, adoption:31, band:T.red},
];

/* Descriptive region metadata; `live` is DERIVED from the portfolio so the
   count always traces to its source records (no hardcoded, drifting totals). */
const REGION_META=[
  {region:"EMEA", cities:"London, Frankfurt", adoption:72, regime:"EU AI Act · GDPR", c:T.green},
  {region:"Americas", cities:"NYC, São Paulo", adoption:58, regime:"NIST · SOC 2", c:AI_GOLD},
  {region:"APAC", cities:"Singapore, Sydney", adoption:44, regime:"PDPA · ISO 42001", c:T.blue},
];
const CEO_REGIONS=REGION_META.map(m=>({...m, live:CEO_PORTFOLIO.filter(p=>p.region===m.region).length}));

/* Immediate-attention items surfaced above everything. */
const CEO_ATTENTION=[
  {t:"Credit Decision Assurance — decision required", d:"Awaiting your scale-gate approval. EU AI Act Art.6 conformity assessment complete; $7.2M value at stake.", go:"Review & approve", c:T.red, to:"ceoactions"},
  {t:"Customer Resolution Copilot — blocked", d:"CISO prompt-injection evidence overdue by 4 days. Delivery slip of ~2 weeks predicted if unresolved this sprint.", go:"Escalate to CISO", c:AI_GOLD, to:"ceorisk"},
  {t:"Q3 budget re-forecast", d:"$1.9M of allocated budget is consumed ahead of realized value across 2 programs. Reallocation proposed.", go:"Open budget review", c:T.blue, to:"ceobudget"},
];

const CEO_ACTIONS=[
  {n:1, c:T.red, title:"Approve scale-gate — Credit Decision Assurance", desc:"Conformity assessment complete. Your approval unblocks the scale gate and $7.2M of value. Human-oversight record attached.", primary:"Approve", secondary:"Open record"},
  {n:2, c:AI_GOLD, title:"Decision — Q3 budget reallocation", desc:"CFO proposes moving $1.9M from 2 lagging programs to Fraud Detection scaling. Needs your sign-off.", primary:"Review & sign", secondary:"Defer"},
  {n:3, c:T.blue, title:"Acknowledge — new EU AI Act guidance", desc:"Updated Art.6 guidance affects 1 high-risk system. Compliance has drafted the response; your acknowledgement is required.", primary:"Acknowledge", secondary:"Read brief"},
];

const REPORT_DIMS=["By region","By time","By budget","By project","By risk","Scaling","Retired","Adoption","CEO KPIs","Resource tracking"];

/* ── shared render helpers ─────────────────────────────────────────── */
const Eyebrow=({children,style})=><div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,marginBottom:10,...style}}>{children}</div>;
const H3=({children,style})=><div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,margin:0,...style}}>{children}</div>;
const Pill=({children,c=T.ink3})=><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:9.5,fontWeight:800,fontFamily:F.m,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:c+"1f",color:c}}>{children}</span>;

function Donut({pct,size=122}){
  const r=15.9, circ=2*Math.PI*r;
  return <svg width={size} height={size} viewBox="0 0 42 42">
    <circle cx="21" cy="21" r={r} fill="none" stroke={T.border} strokeWidth="5"/>
    <circle cx="21" cy="21" r={r} fill="none" stroke={T.green} strokeWidth="5" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset="25" strokeLinecap="round"/>
    <circle cx="21" cy="21" r={r} fill="none" stroke={AI_GOLD} strokeWidth="5" strokeDasharray="26 74" strokeDashoffset={-(pct-25)} strokeLinecap="round"/>
    <text x="21" y="20" textAnchor="middle" fontSize="7" fontWeight="800" fill={T.ink} fontFamily={F.m}>{pct}%</text>
    <text x="21" y="26.5" textAnchor="middle" fontSize="2.6" fill={T.ink3} fontFamily={F.b}>to value</text>
  </svg>;
}
function Spark({pts,color,dot}){
  return <svg width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none" style={{marginTop:8}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="2"/>
    {dot&&<circle cx="120" cy={pts.split(" ").pop().split(",")[1]} r="2.4" fill={color}/>}
  </svg>;
}
function BarRow({label,sub,pct,color,valLabel}){
  return <div style={{display:"grid",gridTemplateColumns:"140px 1fr auto",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
    <span style={{fontSize:11.5,fontWeight:600,color:T.ink2,fontFamily:F.b}}>{label}{sub&&<span style={{color:T.ink4,fontWeight:600}}> · {sub}</span>}</span>
    <div style={{height:9,borderRadius:6,background:T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color}}/></div>
    <span style={{fontSize:11,fontWeight:800,color:T.ink,minWidth:42,textAlign:"right",fontFamily:F.m}}>{valLabel||pct+"%"}</span>
  </div>;
}
const cardPad={padding:"16px 18px"};
/* Computed per-render (not a frozen module const) so the tile background
   tracks the active theme — a literal here would capture dark-theme colors
   at import time and stay navy in light mode. */
const kpiStyleOf=()=>({background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:"pointer"});
/* Kpi: navigates when given onClick; otherwise traces its number via
   data lineage (lin=[label,value]) so no tile is a dead end. */
function Kpi({l,v,vc,s,spark,onClick,lin}){
  const openLin=useLin();
  const handle=onClick||(lin?()=>openLin(lin[0],lin[1]):undefined);
  return <button onClick={handle} style={{...kpiStyleOf(),textAlign:"left",cursor:handle?"pointer":"default"}}>
    <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div>
    <div style={{fontSize:23,fontWeight:800,marginTop:7,letterSpacing:"-0.02em",fontFamily:F.m,color:vc||T.ink}}>{v}</div>
    <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{s}</div>
    {spark}
  </button>;
}
/* A table row that drills to a lineage node on click. */
function LinRow({node,children}){
  const openLin=useLin();
  return <tr onClick={()=>openLin(node)} className="vz-lrow" style={{cursor:"pointer"}}>{children}</tr>;
}
/* Risk-grade summary card that traces its count on click. */
function GradeCard({g}){
  const openLin=useLin();
  return <Card onClick={()=>openLin(`${g[0]} risks`,String(g[2]))} style={{...cardPad,cursor:"pointer"}}><Eyebrow style={{color:g[1]}}>{g[0]}</Eyebrow><div style={{fontSize:30,fontWeight:800,color:g[1],fontFamily:F.m}}>{g[2]}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{g[3]}</div></Card>;
}
const Table=({head,children})=><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
  {head&&head.length>0&&<thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>}
  <tbody>{children}</tbody>
</table></div>;
const Td=({children,style})=><td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,verticalAlign:"middle",...style}}>{children}</td>;

/* ── page header for non-overview surfaces ─────────────────────────── */
function PageHead({title,sub}){
  return <div style={{marginBottom:16}}>
    <div style={{fontFamily:F.e,fontWeight:400,fontSize:26,lineHeight:1.1,color:T.ink,margin:"0 0 4px"}}>{title}</div>
    <div style={{color:T.ink3,fontSize:12,fontFamily:F.b}}>{sub}</div>
  </div>;
}

/* ══════════════════ OVERVIEW ══════════════════ */
function Overview({role,goPortfolio,openFull,openCompliance,navTab,showToast,userName}){
  const [tab,setTab]=useState("overview");
  const [brief,setBrief]=useState(null);
  const name=(userName||(ROLES[role]||ROLES.ceo).name).split(" ")[0];
  const hour=typeof window!=="undefined"?new Date().getHours():9;
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const TABS=[["overview","Overview"],["risk","Risk"],["value","Value & ROI"],["adoption","Adoption"],["exposure","Deployment Map"],["compliance","Compliance"]];
  /* The CEO composite: every initiative, and where each CXO stands on it —
     the same shared object, rolled up. Click opens the full brief. */
  const rag=(n,c)=>n>0?<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,fontFamily:F.m,color:c}}><span style={{width:7,height:7,borderRadius:"50%",background:c}}/>{n}</span>:null;
  const CeoBand=()=><Card style={{padding:"14px 16px",marginBottom:16}}>
    <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>Cross-functional oversight</div>
    <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:11}}>Every initiative — where each CXO stands</div>
    <div style={{display:"grid",gap:7}}>
      {AI_ASSETS.map(a=>{const r=facetRollup(a);const w=r.worst;return <button key={a.id} onClick={()=>setBrief(a)} style={{display:"grid",gridTemplateColumns:"1.5fr auto 1.5fr auto",gap:12,alignItems:"center",textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer"}}>
        <div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.name}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{a.unit} · {a.lifecycle}</div></div>
        <div style={{display:"flex",gap:11}}>{rag(r.cleared,T.green)}{rag(r.review,T.blue)}{rag(r.blocked,T.red)}</div>
        <div style={{fontSize:10,fontWeight:700,fontFamily:F.b,color:w?(w.key==="blocked"?T.red:T.amber):T.green}}>{w?`${w.key==="blocked"?"Blocked":"Needs review"} · ${w.domain} (${w.owner})`:"All facets cleared"}</div>
        <span style={{color:AI_GOLD,fontWeight:900,fontFamily:F.b,fontSize:11}}>Open →</span>
      </button>;})}
    </div>
  </Card>;

  return <div style={{animation:"up .3s ease"}}>
    {brief&&<BriefDrawer a={brief} role="ceo" onClose={()=>setBrief(null)}/>}
    {/* greeting + gold total tile */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}>
      <div>
        <h1 style={{fontFamily:F.e,fontSize:30,fontWeight:400,color:T.ink,margin:"2px 0 4px"}}>{greet}, <span style={{color:AI_GOLD}}>{name}.</span></h1>
        <div style={{color:T.ink3,fontSize:12.5,fontFamily:F.b}}>Enterprise AI is <b style={{color:AI_GOLD}}>holding steady</b> — 3 items need your decision, and one program is at critical exposure.</div>
      </div>
      <button onClick={goPortfolio} title="Open Portfolio" style={{display:"flex",alignItems:"center",gap:15,background:`linear-gradient(135deg,#E7BE63,${AI_GOLD} 55%,#B3852F)`,border:"1px solid #F0CE7E",borderRadius:15,padding:"13px 22px",cursor:"pointer",boxShadow:`0 12px 30px ${AI_GOLD}4d,0 0 0 4px ${AI_GOLD}1f`}}>
        <div style={{fontSize:40,fontWeight:800,color:"#221703",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{CEO_PORTFOLIO.length}</div>
        <div style={{textAlign:"left"}}><div style={{fontSize:10.5,letterSpacing:"0.09em",textTransform:"uppercase",color:"#2a1c02",fontWeight:900,fontFamily:F.m}}>Total AI Projects</div><div style={{fontSize:10.5,color:"#4b3608",marginTop:3,fontWeight:600,fontFamily:F.b}}>4 business units · 3 regions</div></div>
      </button>
    </div>

    {/* horizontal tabs */}
    <div style={{display:"flex",gap:6,margin:"18px 0",flexWrap:"wrap"}}>
      {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 15px",borderRadius:20,fontSize:11.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:`1px solid ${tab===k?AI_GOLD:T.border}`,background:tab===k?AI_GOLD:T.s2,color:tab===k?"#0b0e24":T.ink3}}>{l}</button>)}
    </div>

    {tab==="overview"&&<><CeoBand/><OverviewTab goPortfolio={goPortfolio} openFull={openFull} openCompliance={openCompliance} setTab={navTab}/></>}
    {tab==="risk"&&<RiskTab openFull={openFull}/>}
    {tab==="value"&&<ValueTab/>}
    {tab==="adoption"&&<AdoptionTab/>}
    {tab==="exposure"&&<ExposureTab/>}
    {tab==="compliance"&&<ComplianceTab openFull={openFull}/>}
  </div>;
}

function OverviewTab({goPortfolio,openFull,openCompliance,setTab}){
  const goto=t=>setTab&&setTab(t);
  return <div style={{animation:"up .2s ease"}}>
    {/* attention */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:16}}>
      {CEO_ATTENTION.map(a=><Card key={a.t} onClick={()=>goto(a.to)} style={{padding:"13px 15px",borderLeft:`3px solid ${a.c}`,cursor:"pointer"}}>
        <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.t}</div>
        <div style={{fontSize:10.5,color:T.ink3,marginTop:3,lineHeight:1.5,fontFamily:F.b}}>{a.d}</div>
        <div style={{fontSize:10,color:AI_GOLD,fontWeight:800,marginTop:8,fontFamily:F.b}}>{a.go} →</div>
      </Card>)}
    </div>

    {/* KPI strip — each tile drills into its home surface */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Kpi l="Portfolio value" v={`$${PF.realized.toFixed(1)}M`} s={`realized of $${PF.budget.toFixed(1)}M allocated`} spark={<Spark pts="0,18 20,17 40,14 60,13 80,9 100,7 120,4" color={AI_GOLD} dot/>} onClick={()=>goto("ceobudget")}/>
      <Kpi l="Enterprise health" v={PF.avgHealth} vc={T.green} s={`weighted across ${PF.count} programs`} spark={<Spark pts="0,10 20,12 40,9 60,11 80,8 100,7 120,6" color={T.green}/>} onClick={goPortfolio}/>
      <Kpi l="Overall AI risk" v={<>{PF.criticalCount+PF.highCount+PF.mediumCount}<span style={{fontSize:13,color:T.ink4}}>/{PF.count}</span></>} vc={T.red} s={`${PF.criticalCount} critical · ${PF.highCount} high open`} spark={<Spark pts="0,6 20,8 40,7 60,10 80,9 100,12 120,13" color={T.red}/>} onClick={openFull}/>
      <Kpi l="Compliance" v={`${COMPLIANCE_PCT}%`} vc={T.blue} s="EU AI Act · ISO 42001 · GDPR" onClick={openCompliance}/>
      <Kpi l="Adoption" v={`${PF.adoption}%`} s="across 4 business units" onClick={goPortfolio}/>
      <Kpi l="Security incidents" v={OPEN_INCIDENTS} vc={AI_GOLD} s="open this quarter · 0 breaches" onClick={openFull}/>
    </div>

    {/* lifecycle bands */}
    <Card style={{...cardPad,marginBottom:2}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div><Eyebrow style={{margin:0}}>AI Projects</Eyebrow><H3>By lifecycle status — click any program to drill in</H3></div>
        <Pill c={AI_GOLD}>{CEO_PORTFOLIO.length} total programs</Pill>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
        {STAGES.map(s=><div key={s} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 13px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
            <span style={{fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:800,color:stageColor(s),fontFamily:F.m}}>{s}</span>
            <span style={{fontSize:19,fontWeight:800,color:stageColor(s),fontFamily:F.m}}>{stageCount(s)}</span>
          </div>
          {CEO_PORTFOLIO.filter(p=>p.stage===s).map(p=><button key={p.name} onClick={goPortfolio} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:8,width:"100%",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:stageColor(s),flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:600,color:T.ink2,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
            <span style={{marginLeft:"auto",fontSize:10,color:T.ink4,fontWeight:700,fontFamily:F.m}}>{s==="Completed"?"✓":s==="Retired"?"↓":p.health}</span>
          </button>)}
        </div>)}
      </div>
    </Card>

    {/* exposure + budget */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:16}}>
      <Card style={cardPad}><Eyebrow>Deployment Exposure Map</Eyebrow><H3 style={{marginBottom:12}}>Where AI is live — by region &amp; program count</H3><ExposureMap/><RegionLegend/></Card>
      <Card style={cardPad}><Eyebrow>Budget → Value</Eyebrow><H3 style={{marginBottom:14}}>How much turned to value vs leaked</H3><BudgetValue/></Card>
    </div>

    {/* adoption + highest risk */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:16}}>
      <Card style={cardPad}><Eyebrow>Adoption by Business Unit</Eyebrow><H3 style={{marginBottom:12}}>Who is building &amp; adopting AI — with headcount</H3>
        {CEO_BU.map(b=><BarRow key={b.bu} label={b.bu} sub={b.head.toLocaleString()} pct={b.adoption} color={b.band}/>)}
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11}}>
          {[["On target",T.green],["Enablement needed",AI_GOLD],["Below threshold",T.red]].map(([l,c])=><span key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:c}}/>{l}</span>)}
        </div>
      </Card>
      <HighestRisk/>
    </div>
  </div>;
}

/* Simplified equirectangular world map (viewBox 1000×480) with continent
   silhouettes and one marker per deployment region, sized by live count.
   Theme-aware: light ocean/land in light mode, deep navy in dark mode. */
const CONTINENTS=[
  /* North America */ "M150,70 L250,58 L318,74 L326,120 L288,150 L266,196 L232,214 L206,180 L214,150 L176,150 L150,104 Z",
  /* Greenland */ "M338,44 L392,40 L410,70 L384,92 L350,82 Z",
  /* South America */ "M262,232 L300,224 L316,258 L306,312 L280,372 L258,404 L242,360 L250,300 L246,262 Z",
  /* Europe */ "M486,92 L556,84 L582,104 L566,140 L520,152 L494,132 L482,110 Z",
  /* Africa */ "M498,158 L580,150 L604,196 L588,258 L556,330 L520,346 L500,286 L488,222 L486,182 Z",
  /* Asia */ "M566,80 L720,62 L840,74 L906,108 L878,150 L806,158 L742,150 L688,168 L628,150 L586,120 Z",
  /* SE Asia / India nub */ "M640,158 L690,172 L676,214 L648,206 L636,180 Z",
  /* Oceania */ "M812,300 L880,292 L906,322 L872,352 L820,342 L804,318 Z",
];
const REGION_MARKERS=[
  {region:"Americas", x:222, y:150},
  {region:"EMEA",     x:524, y:120},
  {region:"APAC",     x:806, y:150},
];
/* Marker colour = the region's HIGHEST open AI-risk exposure (data-driven
   from the portfolio), so red/amber/blue/green carry real meaning; the
   number in the marker is the count of live programs. */
const SEV_RANK={Critical:4,High:3,Medium:2,Low:1};
const sevColor=s=>s==="Critical"?T.red:s==="High"?T.amber:s==="Medium"?T.blue:T.green;
const regionSeverity=region=>CEO_PORTFOLIO.filter(p=>p.region===region).reduce((m,p)=>SEV_RANK[p.risk]>SEV_RANK[m]?p.risk:m,"Low");
/* Numbers count up from zero on mount (cubic ease-out) — the "live" feel. */
function useCountUp(target,dur=1200){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let raf, start=null;
    const tick=t=>{ if(start===null)start=t; const p=Math.min(1,(t-start)/dur);
      setV(Math.round(target*(1-Math.pow(1-p,3)))); if(p<1)raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  },[target,dur]);
  return v;
}
/* Region hubs on the world map (Americas / EMEA / APAC), positioned in the
   1000x500 projected space. Size = live program count, colour = worst open
   exposure — both derived from the portfolio. */
const GEO_HUBS=[
  {region:"Americas", x:235, y:150},
  {region:"EMEA",     x:520, y:150},
  {region:"APAC",     x:762, y:175},
];
const hubLive=region=>(CEO_REGIONS.find(r=>r.region===region)||{}).live||0;
function GeoHub({region,x,y,idx}){
  const sev=regionSeverity(region), c=sevColor(sev), n=hubLive(region);
  const val=useCountUp(n,1000+idx*260), rad=13+n*2.6;
  return <g>
    <circle cx={x} cy={y} r={rad+6} fill={c} opacity="0.2">
      <animate attributeName="r" values={`${rad+3};${rad+14};${rad+3}`} dur={`${3+idx*0.5}s`} repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.24;0.05;0.24" dur={`${3+idx*0.5}s`} repeatCount="indefinite"/>
    </circle>
    <circle cx={x} cy={y} r={rad} fill={c} filter="url(#ceoGlow)"/>
    <circle cx={x} cy={y} r={rad-4} fill="#08101f" opacity="0.62"/>
    <text x={x} y={y+5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#f2f6ff" fontFamily={F.m}>{val}</text>
    <text x={x} y={y-rad-8} textAnchor="middle" fontSize="11" fontWeight="800" fill="#93a6c8" letterSpacing="1.4" fontFamily={F.m}>{region.toUpperCase()}</text>
  </g>;
}
/* Deployment connection map: the enterprise AI estate as one connected
   network. A dark world map (real Natural Earth geography) with the three
   deployment hubs — sized by live program count, coloured by worst exposure —
   linked by animated data-pulse arcs. Pure SVG/SMIL + a small count-up. */
function ExposureMap({big}){
  const arcs=[[0,1],[1,2],[0,2]].map(([i,j],k)=>{const a=GEO_HUBS[i],b=GEO_HUBS[j];
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-95; return {d:`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`,k};});
  return <div style={{position:"relative",height:big?430:360,borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`,background:"#0a1120"}}>
    <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{display:"block"}}>
      <defs>
        <filter id="ceoGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="ceoArcG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4f78c8" stopOpacity="0.06"/><stop offset="0.5" stopColor="#9fbcff" stopOpacity="0.6"/><stop offset="1" stopColor="#4f78c8" stopOpacity="0.06"/>
        </linearGradient>
      </defs>
      {/* real world land */}
      {WORLD_GEO.map((c,i)=><path key={i} d={c.d} fill="#17233d" stroke="#26364f" strokeWidth="0.4"/>)}
      {/* network arcs with travelling data pulses */}
      {arcs.map(a=><g key={a.k}>
        <path d={a.d} fill="none" stroke="url(#ceoArcG)" strokeWidth="1.6" opacity="0.7"/>
        <circle r="3" fill="#dbe6ff" filter="url(#ceoGlow)"><animateMotion dur={`${2.6+a.k*0.5}s`} repeatCount="indefinite" path={a.d}/></circle>
      </g>)}
      {/* region hubs */}
      {GEO_HUBS.map((h,idx)=><GeoHub key={h.region} region={h.region} x={h.x} y={h.y} idx={idx}/>)}
    </svg>
  </div>;
}
function RegionLegend(){
  return <div style={{marginTop:11}}>
    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
      {[...CEO_REGIONS].sort((a,b)=>b.live-a.live).map((r,i)=>{const sev=regionSeverity(r.region);return <span key={r.region} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{fontFamily:F.m,fontWeight:900,color:T.ink4}}>{i+1}</span><span style={{width:9,height:9,borderRadius:"50%",background:sevColor(sev)}}/>{r.region} · {r.live} live · worst exposure {sev}</span>;})}
    </div>
    <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:9,paddingTop:9,borderTop:`1px solid ${T.border}`,alignItems:"center"}}>
      <span style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>Node size = live programs · colour = highest risk exposure · arcs = enterprise network</span>
      {[["Critical",T.red],["High",AI_GOLD],["Medium",T.blue],["Low",T.green]].map(([l,c])=><span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:9.5,color:T.ink3,fontWeight:700,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:"50%",background:c}}/>{l}</span>)}
    </div>
  </div>;
}
function BudgetValue({big}){
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
      <Donut pct={PF.valueToBudgetPct} size={big?140:122}/>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {[["Value realized",`$${PF.realized.toFixed(1)}M`,T.green],["Consumed, no value yet",`$${PF.consumedNoValue.toFixed(1)}M`,AI_GOLD],["Unspent allocation",`$${PF.unspent.toFixed(1)}M`,T.border]].map(([l,v,c])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:c}}/>{l}<b style={{marginLeft:"auto",color:T.ink,fontFamily:F.m}}>{v}</b></div>)}
      </div>
    </div>
    <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
      {[["Realized / invested",`${PF.realizedRatio}%`,T.green],["Avg time-to-value",`${PF.avgTtv} mo`,T.ink]].map(([l,v,c])=>
        <div key={l} style={{flex:1,minWidth:120,background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px"}}><div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div><div style={{fontSize:18,fontWeight:800,marginTop:5,color:c,fontFamily:F.m}}>{v}</div></div>)}
    </div>
  </div>;
}
function HighestRisk(){
  return <Card style={cardPad}>
    <Eyebrow>Highest-Risk Program</Eyebrow>
    <H3>Credit Decision Assurance</H3>
    <div style={{fontSize:11,color:T.ink3,marginTop:4,fontFamily:F.b}}>Retail Banking · Sponsor Rafael Torres · Phase 7/13</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
      {[["Residual risk","12/25",T.red],["Governance","74%",AI_GOLD],["Owner","O. Khan",T.ink],["Mitigation","In progress",T.blue]].map(([l,v,c])=>
        <div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px"}}><div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div><div style={{fontSize:l==="Owner"||l==="Mitigation"?13:18,fontWeight:800,marginTop:5,color:c,fontFamily:F.m}}>{v}</div></div>)}
    </div>
    <div style={{marginTop:12,padding:"11px 13px",borderRadius:10,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}33`,fontSize:11,color:T.ink2,lineHeight:1.55,fontFamily:F.b}}>
      <b style={{color:AI_GOLD}}>Veris Intelligence:</b> Adverse-decision harm is the top exposure. Human-oversight design record is awaiting approval — clearing it unblocks the scale gate and $7.2M of value.
    </div>
  </Card>;
}

/* ── Overview sub-tabs ── */
/* ── Canonical CEO risk view ───────────────────────────────────────────
   Derived ONCE from the single riskRegister so the CEO Risk tab, the CEO
   Risk Center and the enterprise Risk Center all cite the same records —
   no hand-typed, drifting risk rows. Colour maps to level; lineage resolves
   to the owning portfolio program by name or initiative id. */
const CEO_RISK_RANK={Critical:4,High:3,Medium:2,Low:1};
const riskLevelColor=l=>l==="Critical"?T.red:l==="High"?AI_GOLD:l==="Medium"?T.blue:T.ink3;
const mitStatusColor=s=>/complete|closed|resolved/i.test(s)?T.green:/overdue|blocked/i.test(s)?T.red:/progress/i.test(s)?T.blue:T.ink3;
const CEO_RISKS=[...riskRegister]
  .sort((a,b)=>(CEO_RISK_RANK[b.level]-CEO_RISK_RANK[a.level])||(b.residual-a.residual))
  .map(r=>({id:r.id,title:r.title,system:r.system,level:r.level,residual:r.residual,
    owner:r.riskOwner||r.execOwner||"—",mit:r.treatment?.status||r.status||"—",initiativeId:r.initiativeId}));
const CEO_RISK_COUNTS={
  open:riskRegister.length,
  critical:riskRegister.filter(r=>r.level==="Critical").length,
  high:riskRegister.filter(r=>r.level==="High").length,
  medium:riskRegister.filter(r=>r.level==="Medium").length,
  low:riskRegister.filter(r=>r.level==="Low").length,
  onTrack:riskRegister.filter(r=>/progress|complete/i.test(r.treatment?.status||"")).length,
};
const riskLineage=r=>{const p=CEO_PORTFOLIO.find(x=>x.name===r.system)||CEO_PORTFOLIO.find(x=>x.id===r.initiativeId);return p?programLineage(p):{label:r.title,value:`${r.level} · ${r.residual}`};};
function CeoRiskRows({rows}){
  return rows.map(r=><LinRow key={r.id} node={riskLineage(r)}>
    <Td style={{fontWeight:700,color:T.ink}}>{r.title}</Td><Td>{r.system}</Td>
    <Td><Pill c={riskLevelColor(r.level)}>{r.level} · {r.residual}</Pill></Td>
    <Td>{r.owner}</Td><Td><Pill c={mitStatusColor(r.mit)}>{r.mit}</Pill></Td>
  </LinRow>);
}
function RiskTab({openFull}){
  const onTrackPct=Math.round(CEO_RISK_COUNTS.onTrack/CEO_RISK_COUNTS.open*100);
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:16}}>
      <Kpi l="Open risks" v={CEO_RISK_COUNTS.open} vc={T.red} s="in the risk register" lin={["Open risks",String(CEO_RISK_COUNTS.open)]}/>
      <Kpi l="Critical / High" v={<><span style={{color:T.red}}>{CEO_RISK_COUNTS.critical}</span> · <span style={{color:AI_GOLD}}>{CEO_RISK_COUNTS.high}</span></>} s="need executive attention" lin={["Critical / High risks",`${CEO_RISK_COUNTS.critical} critical · ${CEO_RISK_COUNTS.high} high`]}/>
      <Kpi l="Mitigations on track" v={`${onTrackPct}%`} vc={T.green} s={`${CEO_RISK_COUNTS.onTrack} of ${CEO_RISK_COUNTS.open} treatments`} lin={["Mitigations on track",`${onTrackPct}%`]}/>
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Risk Register — highest exposure first</Eyebrow><H3>Severity · owner · mitigation status · click a row to trace it</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open full Risk Center →</button></div>
      <Table head={["Risk","Program","Severity","Owner","Mitigation"]}>
        <CeoRiskRows rows={CEO_RISKS.slice(0,6)}/>
      </Table>
    </Card>
  </div>;
}
function ValueTab(){
  const rows=CEO_PORTFOLIO.filter(p=>p.spent>0).slice(0,5);
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Budget → Value</Eyebrow><H3 style={{marginBottom:14}}>${PF.budget.toFixed(1)}M allocated · where it went</H3><BudgetValue big/></Card>
      <Card style={cardPad}><Eyebrow>Value realized — trailing 7 quarters</Eyebrow><H3 style={{marginBottom:14}}>$1.2M → ${PF.realized.toFixed(1)}M realized</H3>
        <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="none">
          <defs><linearGradient id="vg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={AI_GOLD} stopOpacity=".35"/><stop offset="1" stopColor={AI_GOLD} stopOpacity="0"/></linearGradient></defs>
          <polygon points="0,120 50,112 100,96 150,84 200,60 250,40 300,22 300,150 0,150" fill="url(#vg)"/>
          <polyline points="0,120 50,112 100,96 150,84 200,60 250,40 300,22" fill="none" stroke={AI_GOLD} strokeWidth="2.5"/>
          <circle cx="300" cy="22" r="3.5" fill={AI_GOLD}/>
        </svg>
      </Card>
    </div>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>ROI by program</Eyebrow><H3 style={{marginBottom:14}}>Budget · realized value · ROI · time-to-value — click a program to trace it</H3>
      <Table head={["Program","Budget","Realized","ROI","Time-to-value"]}>
        {rows.map(p=><LinRow key={p.name} node={programLineage(p)}><Td style={{fontWeight:700,color:T.ink}}>{p.name}</Td><Td>${p.budget.toFixed(1)}M</Td><Td>${p.realized.toFixed(1)}M</Td><Td><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"% (early)":"Pending gate"}</Pill></Td><Td>{p.ttv?p.ttv+" mo":"—"}</Td></LinRow>)}
      </Table>
    </Card>
  </div>;
}
function AdoptionTab(){
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Adoption by Business Unit</Eyebrow><H3 style={{marginBottom:12}}>With headcount in each unit</H3>
        {CEO_BU.map(b=><BarRow key={b.bu} label={b.bu} sub={b.head.toLocaleString()} pct={b.adoption} color={b.band}/>)}
      </Card>
      <Card style={cardPad}><Eyebrow>Adoption by Region</Eyebrow><H3 style={{marginBottom:12}}>Active users vs licensed seats</H3>
        {CEO_REGIONS.map(r=><BarRow key={r.region} label={r.region} pct={r.adoption} color={r.c}/>)}
        <div style={{marginTop:14,padding:"11px 13px",borderRadius:10,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}33`,fontSize:11,color:T.ink2,lineHeight:1.55,fontFamily:F.b}}><b style={{color:AI_GOLD}}>Feedback analysis:</b> 1,140 responses · sentiment <b>+64 net</b>. Top request: deeper integration with core banking. People-team adoption is the priority gap.</div>
      </Card>
    </div>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>Adoption trend</Eyebrow><H3 style={{marginBottom:12}}>Enterprise active-user rate — 61% and climbing</H3>
      <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none"><polyline points="0,96 50,90 100,80 150,72 200,58 250,50 300,44" fill="none" stroke={T.green} strokeWidth="2.5"/><circle cx="300" cy="44" r="3.5" fill={T.green}/></svg>
    </Card>
  </div>;
}
/* ── Filterable geography / deployment map ──────────────────────────
   Where AI lives, by region — filter by lifecycle band (Proposed /
   Implemented / Scaling / Retired) and switch the marker metric between
   initiative count and adoption rate. Markers, legend and the table below
   all move together; every initiative row drills to its lineage. */
const GEO_FILTERS=[
  ["all","All",()=>true],
  ["proposed","Proposed",p=>p.stage==="In Progress"],
  ["implemented","Implemented",p=>p.stage==="In Production"||p.stage==="Completed"],
  ["scaling","Scaling",p=>p.stage==="Scaling"],
  ["retired","Retired",p=>p.stage==="Retired"],
];
const adoptBand=a=>a>=65?T.green:a>=50?AI_GOLD:T.red;
function FilterMap({regionData,metric,big}){
  const isLight=typeof document!=="undefined"&&document.documentElement.dataset.theme==="light";
  const ocean=isLight?"#EAF1F8":"#0c1030", land=isLight?"#C6D3E4":"#252c5c", landEdge=isLight?"#AFC0D6":"#39407a", grat=isLight?"#D4DEEC":"#ffffff12";
  return <div style={{position:"relative",height:big?360:280,borderRadius:11,overflow:"hidden",border:`1px solid ${T.border}`}}>
    <svg viewBox="0 0 1000 480" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{display:"block"}}>
      <defs>
        <radialGradient id="geoOcean" cx="50%" cy="0%" r="120%"><stop offset="0" stopColor={isLight?"#F2F7FC":"#1a2050"}/><stop offset="1" stopColor={ocean}/></radialGradient>
        <filter id="geoMk" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={isLight?"#5b6b8033":"#00000066"}/></filter>
      </defs>
      <rect x="0" y="0" width="1000" height="480" fill="url(#geoOcean)"/>
      {[80,160,240,320,400].map(y=><line key={"h"+y} x1="0" y1={y} x2="1000" y2={y} stroke={grat} strokeWidth="1"/>)}
      {[125,250,375,500,625,750,875].map(x=><line key={"v"+x} x1={x} y1="0" x2={x} y2="480" stroke={grat} strokeWidth="1"/>)}
      {CONTINENTS.map((d,i)=><path key={i} d={d} fill={land} stroke={landEdge} strokeWidth="1.5" strokeLinejoin="round"/>)}
      {regionData.map(m=>{const v=metric==="count"?m.count:m.adoption;const r=metric==="count"?(big?16+v*3:13+v*2.2):(big?14+v*0.2:12+v*0.16);const empty=metric==="count"&&v===0;return <g key={m.region} opacity={empty?0.35:1}>
        <circle cx={m.x} cy={m.y} r={r+9} fill={m.color} opacity="0.16"><animate attributeName="r" values={`${r+5};${r+13};${r+5}`} dur="3s" repeatCount="indefinite"/></circle>
        <circle cx={m.x} cy={m.y} r={r} fill={m.color} filter="url(#geoMk)"/>
        <text x={m.x} y={m.y+4} textAnchor="middle" fontSize={big?15:13} fontWeight="800" fill="#0b0e24" fontFamily={F.m}>{m.label}</text>
        <text x={m.x} y={m.y-r-8} textAnchor="middle" fontSize="11" letterSpacing="1.5" fontWeight="800" fill={isLight?T.ink3:"#cbd5e1"} fontFamily={F.m}>{m.region.toUpperCase()}</text>
      </g>;})}
    </svg>
  </div>;
}
function ExposureTab(){
  const [f,setF]=useState("all");
  const [metric,setMetric]=useState("count");
  const flt=GEO_FILTERS.find(x=>x[0]===f)[2];
  const regionData=REGION_MARKERS.map(m=>{
    const inis=CEO_PORTFOLIO.filter(p=>p.region===m.region&&flt(p));
    const adoption=(CEO_REGIONS.find(r=>r.region===m.region)||{}).adoption||0;
    const color=metric==="adoption"?adoptBand(adoption):AI_GOLD;
    return {...m,inis,adoption,count:inis.length,color,label:metric==="count"?String(inis.length):adoption+"%"};
  });
  const rows=CEO_PORTFOLIO.filter(flt);
  const chip=active=>({padding:"6px 13px",borderRadius:20,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:`1px solid ${active?AI_GOLD:T.border}`,background:active?AI_GOLD:T.s2,color:active?"#241703":T.ink3});
  return <div style={{animation:"up .2s ease"}}>
    <Card style={cardPad}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:12}}>
        <div><Eyebrow style={{margin:0}}>Deployment Map</Eyebrow><H3>Where AI lives by geography — filter by lifecycle, switch between count and adoption</H3></div>
      </div>
      {/* filter + metric controls */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:13}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{GEO_FILTERS.map(([id,label])=><button key={id} onClick={()=>setF(id)} style={chip(f===id)}>{label}</button>)}</div>
        <div style={{display:"flex",gap:4,marginLeft:"auto",background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:3}}>
          {[["count","By count"],["adoption","By adoption"]].map(([id,label])=><button key={id} onClick={()=>setMetric(id)} style={{padding:"5px 12px",borderRadius:18,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:"none",background:metric===id?T.blue:"transparent",color:metric===id?"#fff":T.ink3}}>{label}</button>)}
        </div>
      </div>
      <FilterMap regionData={regionData} metric={metric} big/>
      {/* per-region summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:12}}>
        {regionData.map(m=><div key={m.region} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px"}}>
          <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{m.region}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:5}}><span style={{fontSize:18,fontWeight:800,color:T.ink,fontFamily:F.m}}>{m.count}</span><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>initiatives</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{width:8,height:8,borderRadius:"50%",background:adoptBand(m.adoption)}}/><span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b}}>{m.adoption}% adoption</span></div>
        </div>)}
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11,paddingTop:11,borderTop:`1px solid ${T.border}`,alignItems:"center"}}>
        <span style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{metric==="count"?"Marker = initiatives in this lifecycle band":"Marker = regional adoption rate"}</span>
        {metric==="adoption"&&[["On target ≥65%",T.green],["Enablement 50–64%",AI_GOLD],["Below 50%",T.red]].map(([l,c])=><span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:9.5,color:T.ink3,fontWeight:700,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:"50%",background:c}}/>{l}</span>)}
      </div>
    </Card>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>Initiatives in view · {rows.length}</Eyebrow><H3 style={{marginBottom:12}}>{GEO_FILTERS.find(x=>x[0]===f)[1]} initiatives by region — click any to trace it</H3>
      <Table head={["Region","Initiative","Stage","ROI","Residual risk"]}>
        {rows.length?rows.map(p=><LinRow key={p.name} node={programLineage(p)}><Td style={{fontWeight:700,color:T.ink}}>{p.region}</Td><Td>{p.name}</Td><Td><Pill c={stageColor(p.stage)}>{p.stage}</Pill></Td><Td><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"%":"—"}</Pill></Td><Td><Pill c={p.risk==="Critical"?T.red:p.risk==="High"?AI_GOLD:p.risk==="Medium"?T.blue:T.green}>{p.risk}</Pill></Td></LinRow>):<tr><Td style={{color:T.ink3}}>No initiatives in this lifecycle band.</Td></tr>}
      </Table>
    </Card>
  </div>;
}
/* Compliance posture reads the canonical framework set (lib/portfolio.js)
   so the CEO, CAIO and AI Central numbers can never disagree again. */
const fwColor=p=>p>=85?T.green:p>=75?T.blue:AI_GOLD;
const _fwSub={euai:"Art.6 conformity · 1 high-risk in review",iso42001:"AI management-system controls",iso27001:"Annex A controls · ISMS certified",gdpr:"DPIAs complete on live systems",nist:"Govern·Map·Measure·Manage",soc2:"Trust-services criteria · annual"};
const CEO_FRAMEWORKS=CANON_FRAMEWORKS.map(f=>({fw:f.name,pct:f.score,c:fwColor(f.score),sub:_fwSub[f.id]||f.sub,scope:f.scope}));
/* ISO 27001 Annex A control-family posture — the security backbone under
   every AI system. */
const ISO27001_FAMILIES=[
  {ref:"A.5", name:"Organizational controls", done:35, total:37, c:T.green},
  {ref:"A.6", name:"People controls", done:7, total:8, c:T.green},
  {ref:"A.7", name:"Physical controls", done:12, total:14, c:AI_GOLD},
  {ref:"A.8", name:"Technological controls", done:30, total:34, c:AI_GOLD},
];
function ComplianceTab({openFull}){
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:16}}>
      {CEO_FRAMEWORKS.map(f=>
        <Card key={f.fw} onClick={openFull} style={{...cardPad,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Eyebrow style={{margin:0}}>{f.fw}</Eyebrow><Pill c={f.c}>{f.scope}</Pill></div><div style={{fontSize:26,fontWeight:800,color:f.c,fontFamily:F.m,marginTop:8}}>{f.pct}%</div><div style={{fontSize:10,color:T.ink3,marginTop:4,fontFamily:F.b}}>{f.sub}</div><div style={{height:8,borderRadius:6,background:T.border,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${f.pct}%`,background:`linear-gradient(90deg,${AI_GOLD},#8a6a25)`}}/></div></Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:16}}>
      <Card style={cardPad}>
        <Eyebrow>ISO 27001 · Annex A posture</Eyebrow><H3 style={{marginBottom:12}}>Control families under the ISMS</H3>
        {ISO27001_FAMILIES.map(a=><BarRow key={a.ref} label={`${a.ref} ${a.name}`} pct={Math.round(a.done/a.total*100)} color={a.c} valLabel={`${a.done}/${a.total}`}/>)}
        <div style={{marginTop:12,padding:"10px 12px",borderRadius:10,background:T.green+"14",border:`1px solid ${T.green}33`,fontSize:10.5,color:T.ink2,lineHeight:1.55,fontFamily:F.b}}><b style={{color:T.green}}>ISMS certified</b> — surveillance audit passed Mar 2026. 84 of 93 Annex A controls fully implemented; 9 in remediation.</div>
      </Card>
      <Card style={cardPad}>
        <Eyebrow>Regulatory horizon</Eyebrow><H3 style={{marginBottom:12}}>Obligations &amp; upcoming deadlines</H3>
        <Table head={["Regime","Obligation","Due"]}>
          {[["EU AI Act","High-risk conformity re-assessment","Aug 2026"],["ISO 27001","Annex A surveillance audit","Mar 2027"],["ISO 42001","AIMS internal audit cycle","Sep 2026"],["GDPR","DPIA refresh — 2 live systems","Jul 2026"],["SOC 2","Type II observation window close","Nov 2026"]].map(r=>
            <tr key={r[1]}><Td style={{fontWeight:700,color:T.ink}}>{r[0]}</Td><Td>{r[1]}</Td><Td><Pill c={T.blue}>{r[2]}</Pill></Td></tr>)}
        </Table>
      </Card>
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Compliance posture by program</Eyebrow><H3>Standards coverage &amp; reporting status</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open Compliance →</button></div>
      <Table head={["Program","Risk class","Frameworks","Evidence","Status"]}>
        {[["Credit Decision Assurance","High-risk",T.red,"EU AI Act · ISO 42001 · ISO 27001","18/20","Gate review",AI_GOLD],["Fraud Detection Model","Limited",AI_GOLD,"EU AI Act · NIST AI RMF · ISO 27001","22/22","Compliant",T.green],["Customer Resolution Copilot","Limited",AI_GOLD,"ISO 42001 · SOC 2 · GDPR","15/19","In progress",T.blue],["Finance Close Automation","Minimal",T.ink3,"ISO 42001 · ISO 27001","12/12","Compliant",T.green]].map(r=>{const p=CEO_PORTFOLIO.find(x=>x.name===r[0]);return
          <LinRow key={r[0]} node={p?programLineage(p):{label:r[0],value:r[4]}}><Td style={{fontWeight:700,color:T.ink}}>{r[0]}</Td><Td><Pill c={r[2]}>{r[1]}</Pill></Td><Td>{r[3]}</Td><Td>{r[4]}</Td><Td><Pill c={r[6]}>{r[5]}</Pill></Td></LinRow>;})}
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ THE AI PLAYBOOK ══════════════════
   Not a strategy/policy/roadmap wizard — the living portfolio "bible":
   the complete estate of enterprise AI, every program's value, risk,
   lifecycle and the decision it is asking of the board. One source of
   truth, drillable to the last record, audit-ready end to end. */

/* The governed recommendation for a board program, computed from its own
   stage + ROI + residual risk (mirrors the canonical assetRecommendation
   contract for the wider showcase estate). */
function programVerdict(p){
  if(p.stage==="Retired")   return {label:"Retired",c:T.ink3,why:"Superseded and decommissioned under governance."};
  if(p.stage==="Completed")return {label:"Delivered",c:T.green,why:"Objective met and value booked."};
  if(p.risk==="Critical")  return {label:"Remediate",c:T.red,why:"Critical residual risk — resolve before any scale decision."};
  if((p.stage==="Scaling"||p.stage==="In Production")&&p.roi>=40) return {label:"Scale",c:T.green,why:`ROI +${p.roi}% at ${p.stage} — ready for a governed scale decision.`};
  if(p.roi<=0&&p.stage!=="In Progress") return {label:"Review value",c:AI_GOLD,why:"Consuming budget ahead of realized value — reforecast or intervene."};
  if(p.stage==="In Progress") return {label:"In build",c:T.blue,why:"On the delivery path — governance gates ahead."};
  return {label:"Continue",c:T.blue,why:"Healthy but below the scale bar — keep operating and monitoring."};
}

function Playbook({showToast,role="ceo"}){
  const [brief,setBrief]=useState(null);
  const realized=CEO_PORTFOLIO.reduce((s,p)=>s+p.realized,0);
  const spent=CEO_PORTFOLIO.reduce((s,p)=>s+p.spent,0);
  /* Realized value per $ invested across the whole estate — a single
     honest ratio (in-progress programs still pre-payback pull it under
     100%), rather than a signed ROI that reads oddly when negative. */
  const realizedRatio=Math.round(realized/spent*100);
  const scaleReady=CEO_PORTFOLIO.filter(p=>programVerdict(p).label==="Scale");
  const critical=CEO_PORTFOLIO.filter(p=>p.risk==="Critical");
  const decisions=CEO_PORTFOLIO.filter(p=>["Scale","Remediate","Review value"].includes(programVerdict(p).label));
  const rag=(n,c)=>n>0?<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,fontFamily:F.m,color:c}}><span style={{width:7,height:7,borderRadius:"50%",background:c}}/>{n}</span>:null;
  return <div style={{animation:"up .3s ease"}}>
    {brief&&<BriefDrawer a={brief} role={role} onClose={()=>setBrief(null)}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap",marginBottom:6}}>
      <PageHead title="The AI Playbook" sub="The complete, living portfolio of enterprise AI — every initiative, its value, risk, lifecycle and the decision it is asking of you. One source of truth, audit-ready end to end."/>
      <button onClick={()=>{vzDownloadPlaybook(realized,realizedRatio);showToast&&showToast("Board portfolio pack exported");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 16px",color:"#241703",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>✦ Export board pack</button>
    </div>

    {/* Portfolio-at-a-glance — every figure traces to its records */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,margin:"12px 0 18px"}}>
      <Kpi l="AI programs" v={CEO_PORTFOLIO.length} s="the full governed estate" lin={["Portfolio initiatives",String(CEO_PORTFOLIO.length)]}/>
      <Kpi l="Value realized" v={`$${realized.toFixed(1)}M`} vc={T.green} s={`of $${CEO_PORTFOLIO.reduce((s,p)=>s+p.budget,0).toFixed(1)}M allocated`} lin={["Value realized",`$${realized.toFixed(1)}M`]}/>
      <Kpi l="Realized / invested" v={`${realizedRatio}%`} vc={realizedRatio>=100?T.green:AI_GOLD} s="value booked per $ spent" lin={["Realized value",`$${realized.toFixed(1)}M`]}/>
      <Kpi l="Scale-ready" v={scaleReady.length} vc={AI_GOLD} s="at the scale gate" lin={["Scale-ready initiatives",String(scaleReady.length)]}/>
      <Kpi l="Critical risk" v={critical.length} vc={critical.length?T.red:T.green} s="need board attention" lin={["Critical risks",String(critical.length)]}/>
    </div>

    {/* Decisions the portfolio is asking for */}
    <Card style={{...cardPad,marginBottom:16}}>
      <Eyebrow>Decisions the portfolio is asking of you</Eyebrow>
      <H3 style={{marginBottom:12}}>{decisions.length} program{decisions.length===1?"":"s"} at a governance gate — click any to trace it</H3>
      <Table head={[]}>
        {decisions.map(p=>{const v=programVerdict(p);return <LinRow key={p.name} node={programLineage(p)}>
          <Td style={{fontWeight:700,color:T.ink}}>{p.name}<div style={{fontSize:9.5,color:T.ink4,fontWeight:600,fontFamily:F.b,marginTop:1}}>{p.unit} · {p.stage}</div></Td>
          <Td><Pill c={v.c}>{v.label}</Pill></Td>
          <Td style={{fontSize:10.5,color:T.ink3,maxWidth:360}}>{v.why}</Td>
        </LinRow>;})}
      </Table>
    </Card>

    {/* The complete portfolio, by lifecycle band */}
    <Card style={{...cardPad,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div><Eyebrow style={{margin:0}}>The complete portfolio</Eyebrow><H3>Every AI program, by lifecycle — health · ROI · residual risk · governed verdict</H3></div>
        <Pill c={AI_GOLD}>{CEO_PORTFOLIO.length} programs · {STAGES.length} stages</Pill>
      </div>
      {STAGES.map(s=>{const rows=CEO_PORTFOLIO.filter(p=>p.stage===s);if(!rows.length)return null;return <div key={s} style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 6px"}}>
          <span style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:900,color:stageColor(s),fontFamily:F.m}}>{s}</span>
          <span style={{fontSize:10,color:T.ink4,fontWeight:700,fontFamily:F.m}}>{rows.length}</span>
          <span style={{flex:1,height:1,background:T.border}}/>
        </div>
        <Table head={[]}>
          {rows.map(p=>{const v=programVerdict(p);return <LinRow key={p.name} node={programLineage(p)}>
            <Td style={{fontWeight:700,color:p.stage==="Retired"?T.ink4:T.ink}}>{p.name}</Td>
            <Td style={{width:90}}>{p.stage==="Completed"?"✓ Done":p.stage==="Retired"?"↓ Retired":<span>Health {p.health}</span>}</Td>
            <Td style={{width:90}}><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"%":"—"}</Pill></Td>
            <Td style={{width:90}}><Pill c={p.risk==="Critical"?T.red:p.risk==="High"?AI_GOLD:p.risk==="Medium"?T.blue:T.green}>{p.risk}</Pill></Td>
            <Td style={{width:110}}><Pill c={v.c}>{v.label}</Pill></Td>
          </LinRow>;})}
        </Table>
      </div>;})}
    </Card>

    {/* Cross-functional readiness on the flagship initiatives */}
    <Card style={{...cardPad,marginBottom:16}}>
      <Eyebrow>Cross-functional readiness</Eyebrow>
      <H3 style={{marginBottom:12}}>Flagship initiatives — where each CXO stands. Open the full brief.</H3>
      <div style={{display:"grid",gap:7}}>
        {AI_ASSETS.map(a=>{const r=facetRollup(a);const w=r.worst;return <button key={a.id} onClick={()=>setBrief(a)} style={{display:"grid",gridTemplateColumns:"1.5fr auto 1.5fr auto",gap:12,alignItems:"center",textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer"}}>
          <div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.name}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{a.unit} · {a.lifecycle}</div></div>
          <div style={{display:"flex",gap:11}}>{rag(r.cleared,T.green)}{rag(r.review,T.blue)}{rag(r.blocked,T.red)}</div>
          <div style={{fontSize:10,fontWeight:700,fontFamily:F.b,color:w?(w.key==="blocked"?T.red:T.amber):T.green}}>{w?`${w.key==="blocked"?"Blocked":"Needs review"} · ${w.domain} (${w.owner})`:"All facets cleared"}</div>
          <span style={{color:AI_GOLD,fontWeight:900,fontFamily:F.b,fontSize:11}}>Open →</span>
        </button>;})}
      </div>
    </Card>

    {/* The governance spine — reference, always on (not a wizard) */}
    <Card style={cardPad}>
      <Eyebrow>The governance spine</Eyebrow>
      <H3 style={{marginBottom:12}}>How this portfolio is run — the operating contract behind every program</H3>
      <Table head={[]}>
        {[["Operating cadence","Monthly AI governance council · quarterly board review · weekly delivery stand-up."],["Gate model","13-phase lifecycle. The scale gate requires a human-oversight record plus a conformity assessment on high-risk systems."],["Escalation","Critical residual risk → CISO within 24h · value-leak >15% vs plan → CFO reforecast · conformity gap → Legal."],["Ownership","Every program carries an accountable sponsor, a named risk owner and a delivery lead — no orphan AI."],["Evidence & audit","Audit begins at initiation and runs to scale or retirement. Every number here traces to its source record and evidence."]].map(r=>
          <tr key={r[0]}><Td style={{fontWeight:700,color:T.ink,width:190,verticalAlign:"top"}}>{r[0]}</Td><Td style={{color:T.ink2}}>{r[1]}</Td></tr>)}
      </Table>
    </Card>
  </div>;
}

/* Board portfolio pack — a plain-text board export of the live estate. */
function vzDownloadPlaybook(realized,roiPct){
  const lines=CEO_PORTFOLIO.map(p=>`- ${p.name} (${p.unit}) · ${p.stage} · ROI ${p.roi>0?"+"+p.roi:p.roi}% · risk ${p.risk} · verdict ${programVerdict(p).label}`);
  vzDownload("veriszone-ai-playbook.md",`# VerisZone Enterprise AI Playbook\n\nThe complete portfolio of enterprise AI — the board's single source of truth.\n\nPrograms: ${CEO_PORTFOLIO.length} · Value realized: $${realized.toFixed(1)}M · Portfolio ROI: +${roiPct}%\n\n## Portfolio\n${lines.join("\n")}\n\n## Governance spine\n- Cadence: monthly council · quarterly board · weekly delivery\n- Gate: 13-phase lifecycle; scale gate needs human-oversight record + conformity assessment\n- Escalation: critical risk -> CISO 24h; value-leak >15% -> CFO reforecast\n- Ownership: every program has sponsor + risk owner + delivery lead\n`);
}

/* ══════════════════ PORTFOLIO ══════════════════ */
function Portfolio(){
  const appColor=a=>a==="CEO-approved"?T.green:a==="Gate pending"?AI_GOLD:a==="Under review"?T.blue:T.ink3;
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Portfolio" sub="Full AI project inventory — CEO-approved programs highlighted in gold."/>
    <Card style={cardPad}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><Eyebrow style={{margin:0}}>All AI Projects · {CEO_PORTFOLIO.length}</Eyebrow><Pill c={AI_GOLD}>★ CEO-approved</Pill></div>
      <Table head={["Program","Business unit","Stage","Health","Region","Approval"]}>
        {CEO_PORTFOLIO.map(p=>{const appr=p.approval==="CEO-approved";return <LinRow key={p.name} node={programLineage(p)}>
          <Td style={{fontWeight:700,color:p.stage==="Retired"?T.ink4:T.ink,background:appr?AI_GOLD+"12":undefined}}>{appr&&<span style={{color:AI_GOLD,fontWeight:900}}>★ </span>}{p.name}</Td>
          <Td style={{background:appr?AI_GOLD+"12":undefined}}>{p.unit}</Td><Td style={{background:appr?AI_GOLD+"12":undefined}}><Pill c={stageColor(p.stage)}>{p.stage}</Pill></Td>
          <Td style={{background:appr?AI_GOLD+"12":undefined}}>{p.stage==="Completed"?"✓":p.stage==="Retired"?"↓":p.health}</Td><Td style={{background:appr?AI_GOLD+"12":undefined}}>{p.region}</Td><Td style={{background:appr?AI_GOLD+"12":undefined}}><Pill c={appColor(p.approval)}>{p.approval}</Pill></Td>
        </LinRow>;})}
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ BUDGET ══════════════════ */
function Budget(){
  const rows=CEO_PORTFOLIO.filter(p=>p.spent>0).sort((a,b)=>b.budget-a.budget).slice(0,5);
  const rest=CEO_PORTFOLIO.filter(p=>!rows.includes(p));
  const oB=rest.reduce((s,p)=>s+p.budget,0), oS=rest.reduce((s,p)=>s+p.spent,0), oR=rest.reduce((s,p)=>s+p.realized,0);
  const ttvVals=CEO_PORTFOLIO.filter(p=>p.ttv).map(p=>p.ttv);
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Budget" sub="Per-project budget, ROI and time-to-value across the portfolio."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:16}}>
      <Kpi l="Allocated" v={`$${PF.budget.toFixed(1)}M`} s="FY26 AI budget" lin={["Budget allocated",`$${PF.budget.toFixed(1)}M`]}/><Kpi l="Value realized" v={`$${PF.realized.toFixed(1)}M`} vc={T.green} s={`${PF.valueToBudgetPct}% turned to value`} lin={["Value realized",`$${PF.realized.toFixed(1)}M`]}/>
      <Kpi l="Consumed, no value" v={`$${PF.consumedNoValue.toFixed(1)}M`} vc={AI_GOLD} s="pre-payload programs" lin={["Value leaked",`$${PF.consumedNoValue.toFixed(1)}M`]}/><Kpi l="Avg time-to-value" v={`${PF.avgTtv} mo`} s={`fastest ${Math.min(...ttvVals)} · slowest ${Math.max(...ttvVals)}`} lin={["Avg time-to-value",`${PF.avgTtv} mo`]}/>
    </div>
    <Card style={cardPad}><Eyebrow>Budget per project</Eyebrow><H3 style={{marginBottom:14}}>Allocated · consumed · ROI · time-to-value — click a program to trace it</H3>
      <Table head={["Program","Allocated","Consumed","Realized","ROI","Time-to-value"]}>
        {rows.map(p=><LinRow key={p.name} node={programLineage(p)}><Td style={{fontWeight:700,color:T.ink}}>{p.name}</Td><Td>${p.budget.toFixed(1)}M</Td><Td>${p.spent.toFixed(1)}M</Td><Td>${p.realized.toFixed(1)}M</Td><Td><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"% (early)":"Pending gate"}</Pill></Td><Td>{p.ttv?p.ttv+" mo":"—"}</Td></LinRow>)}
        <tr><Td style={{fontWeight:700,color:T.ink}}>Others ({rest.length} programs)</Td><Td>${oB.toFixed(1)}M</Td><Td>${oS.toFixed(1)}M</Td><Td>${oR.toFixed(1)}M</Td><Td><Pill c={T.ink3}>Ramping</Pill></Td><Td>—</Td></tr>
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ RISK CENTER (CEO lens) ══════════════════ */
function RiskCenter({openFull}){
  const grades=[
    ["High",T.red,CEO_RISK_COUNTS.critical+CEO_RISK_COUNTS.high,`${CEO_RISK_COUNTS.critical} critical · ${CEO_RISK_COUNTS.high} high`],
    ["Medium",AI_GOLD,CEO_RISK_COUNTS.medium,"treatments tracked"],
    ["Low",T.green,CEO_RISK_COUNTS.low,"monitored"],
  ];
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Risk Center" sub="Every risk graded High / Medium / Low with a named owner and live mitigation status."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:16}}>
      {grades.map(g=><GradeCard key={g[0]} g={g}/>)}
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Risk register</Eyebrow><H3>Severity · owner · mitigation — click a row to trace it</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open full Risk Center →</button></div>
      <Table head={["Risk","Program","Grade","Owner","Mitigation"]}>
        <CeoRiskRows rows={CEO_RISKS.slice(0,6)}/>
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ MY ACTION ITEMS ══════════════════ */
function Actions({role,showToast}){
  const [done,setDone]=useState({});
  const act=(n,label,title)=>{
    setDone(d=>({...d,[n]:label}));
    pushBus("vz-gw-evidence",{item:`CEO action: ${label} — ${title}`,initiative:title,scope:"Enterprise",control:"Executive action record",risk:"Executive decision",owner:(ROLES[role]||ROLES.ceo).name,status:"Complete",approval:label,version:"v1",time:"Just now"});
    showToast&&showToast(`${label} recorded — audit evidence minted`);
  };
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="My Action Items" sub="3 items are waiting on you."/>
    {CEO_ACTIONS.map(a=><Card key={a.n} style={{...cardPad,marginBottom:11,display:"flex",gap:13,alignItems:"flex-start"}}>
      <div style={{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0,color:"#0b0e24",background:a.c,fontFamily:F.m}}>{a.n}</div>
      <div style={{flex:1}}>
        <H3>{a.title}</H3>
        <div style={{fontSize:11,color:T.ink3,marginTop:4,lineHeight:1.55,fontFamily:F.b}}>{a.desc}</div>
        {done[a.n]?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b,marginTop:11}}>✓ {done[a.n]} recorded — evidence minted to the audit trail</div>
        :<div style={{display:"flex",gap:9,marginTop:11,flexWrap:"wrap"}}>
          <button onClick={()=>act(a.n,a.primary,a.title)} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"8px 15px",color:"#0b0e24",fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a.primary}</button>
          <button onClick={()=>act(a.n,a.secondary,a.title)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a.secondary}</button>
        </div>}
      </div>
    </Card>)}
  </div>;
}

/* ══════════════════ REPORTING ══════════════════ */
function Reporting({showToast}){
  const [sel,setSel]=useState(new Set(["By region","By time","By risk"]));
  const [gen,setGen]=useState(false);
  const toggle=d=>setSel(s=>{const n=new Set(s);n.has(d)?n.delete(d):n.add(d);return n;});
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Reporting" sub="Build an executive report by dimension — then export a board-ready pack."/>
    <Card style={cardPad}><Eyebrow>Report builder</Eyebrow><H3 style={{marginBottom:12}}>Choose the dimensions to include</H3>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {REPORT_DIMS.map(d=><button key={d} onClick={()=>toggle(d)} style={{padding:"7px 15px",borderRadius:20,fontSize:11.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:`1px solid ${sel.has(d)?AI_GOLD:T.border}`,background:sel.has(d)?AI_GOLD:T.s2,color:sel.has(d)?"#0b0e24":T.ink3}}>{d}</button>)}
      </div>
      <div style={{display:"flex",gap:9,marginTop:14,flexWrap:"wrap"}}>
        <button onClick={()=>{setGen(true);showToast&&showToast("Board pack generated");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 17px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>✦ Generate report</button>
        <button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 17px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Schedule weekly</button>
      </div>
    </Card>
    {gen&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}>
      <Eyebrow style={{color:AI_GOLD}}>Board pack · generated draft</Eyebrow><H3 style={{marginBottom:10}}>Executive AI Report — Q3 FY26</H3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:12}}>
        {[["Portfolio value",`$${PF.realized.toFixed(1)}M`,T.ink],["Overall risk",`${PF.criticalCount+PF.highCount+PF.mediumCount}/${PF.count}`,T.red],["Adoption",`${PF.adoption}%`,T.ink]].map(([l,v,c])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px"}}><div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div><div style={{fontSize:18,fontWeight:800,marginTop:5,color:c,fontFamily:F.m}}>{v}</div></div>)}
      </div>
      <Table head={[]}>
        {[["By region","EMEA 5 live · Americas 4 · APAC 3 — adoption 72 / 58 / 44%"],["By risk",`${PF.criticalCount} critical · ${PF.highCount} high · ${PF.mediumCount} medium — ${PF.count-PF.criticalCount-PF.highCount-PF.mediumCount} low; critical awaiting your gate decision`],["By time",`Value realized $1.2M → $${PF.realized.toFixed(1)}M across 7 quarters`],["Resource tracking","1,240 in Customer Ops · 910 Retail Banking · 380 Finance · 260 People"]].filter(r=>sel.has(r[0])||["By time","Resource tracking"].includes(r[0])).map(r=>
          <tr key={r[0]}><Td style={{fontWeight:700,color:T.ink,width:150}}>{r[0]}</Td><Td>{r[1]}</Td></tr>)}
      </Table>
      <div style={{display:"flex",gap:9,marginTop:14,flexWrap:"wrap"}}>
        <button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export XLSX</button>
        <button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export board PDF</button>
      </div>
    </Card>}
  </div>;
}

/* ══════════════════ ROOT ══════════════════ */
export function CEOCommandCenter({tab="home",role="ceo",setTab,setAiCentralView,showToast,userName}){
  const goPortfolio=()=>setTab&&setTab("ceoportfolio");
  const openFullRisk=()=>setTab&&setTab("riskcenter");
  const openCompliance=()=>setTab&&setTab("compliance");
  const [lin,setLin]=useState(null);
  const [brief,setBrief]=useState(null);
  /* openLin accepts either a full lineage node or (label,value). */
  const openLin=(a,b)=>setLin(a&&typeof a==="object"?a:{label:a,value:b});
  let content;
  switch(tab){
    case "ceoplaybook":  content=<Playbook showToast={showToast} role={role}/>; break;
    case "ceoportfolio": content=<Portfolio/>; break;
    case "ceobudget":    content=<Budget/>; break;
    case "ceorisk":      content=<RiskCenter openFull={openFullRisk}/>; break;
    case "ceoactions":   content=<Actions role={role} showToast={showToast}/>; break;
    case "ceoreporting": content=<Reporting showToast={showToast}/>; break;
    default:             content=<Overview role={role} goPortfolio={goPortfolio} openFull={openFullRisk} openCompliance={openCompliance} navTab={setTab} showToast={showToast} userName={userName}/>;
  }
  return <LinCtx.Provider value={openLin}>
    <style>{`.vz-lrow:hover td{background:${T.s2}!important}`}</style>
    {content}
    {lin&&<LineageDrawer node={lin} onAsset={id=>{setBrief(assetById(id));setLin(null);}} onClose={()=>setLin(null)}/>}
    {brief&&<BriefDrawer a={brief} role="ceo" onClose={()=>setBrief(null)}/>}
  </LinCtx.Provider>;
}
