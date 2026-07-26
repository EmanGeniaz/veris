"use client";

import { useState } from "react";
import { riskRegister } from "@/lib/platform-models";
import { pushBus } from "@/lib/bus";
import { T, F, AI_GOLD, ROLES, Card } from "./core";

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

/* Enterprise portfolio — the four platform initiatives plus the wider
   estate a CEO oversees. Reuses canonical program names so the board
   view reconciles with AI Central. Values are the seeded showcase set. */
export const CEO_PORTFOLIO=[
  {name:"Finance Close Automation", unit:"Finance", stage:"Scaling", health:88, region:"EMEA", approval:"CEO-approved", budget:0.9, spent:0.9, realized:1.6, roi:78, ttv:5.1, risk:"Low"},
  {name:"Doc Summarisation AI", unit:"Customer Ops", stage:"Scaling", health:85, region:"APAC", approval:"Sponsor", budget:0.5, spent:0.5, realized:0.7, roi:40, ttv:4.2, risk:"Low"},
  {name:"Fraud Detection Model", unit:"Retail Banking", stage:"In Production", health:81, region:"EMEA", approval:"CEO-approved", budget:1.4, spent:1.4, realized:2.0, roi:43, ttv:6.4, risk:"High"},
  {name:"Payments Anomaly Guard", unit:"Retail Banking", stage:"In Production", health:77, region:"Americas", approval:"Sponsor", budget:0.6, spent:0.5, realized:0.6, roi:20, ttv:7.0, risk:"Medium"},
  {name:"Customer Resolution Copilot", unit:"Customer Ops", stage:"In Production", health:74, region:"Americas", approval:"Under review", budget:1.8, spent:1.5, realized:0.3, roi:-12, ttv:9.8, risk:"High"},
  {name:"Predictive Maintenance", unit:"Retail Banking", stage:"In Production", health:72, region:"APAC", approval:"Sponsor", budget:0.5, spent:0.4, realized:0.5, roi:25, ttv:6.8, risk:"Medium"},
  {name:"Credit Decision Assurance", unit:"Retail Banking", stage:"In Progress", health:62, region:"EMEA", approval:"Gate pending", budget:2.2, spent:1.9, realized:0.0, roi:0, ttv:null, risk:"Critical"},
  {name:"Workforce Skills Navigator", unit:"People", stage:"In Progress", health:52, region:"APAC", approval:"Sponsor", budget:0.4, spent:0.2, realized:0.0, roi:0, ttv:null, risk:"High"},
  {name:"Supplier Risk Screener", unit:"Customer Ops", stage:"In Progress", health:48, region:"Americas", approval:"Sponsor", budget:0.3, spent:0.2, realized:0.0, roi:0, ttv:null, risk:"Medium"},
  {name:"Contract Review Assist", unit:"Customer Ops", stage:"Completed", health:100, region:"Americas", approval:"CEO-approved", budget:0.5, spent:0.5, realized:0.9, roi:80, ttv:5.6, risk:"Low"},
  {name:"HR Query Bot", unit:"People", stage:"Completed", health:100, region:"EMEA", approval:"Sponsor", budget:0.3, spent:0.3, realized:0.5, roi:67, ttv:4.9, risk:"Low"},
  {name:"RecoEngine v2", unit:"Retail Banking", stage:"Retired", health:0, region:"—", approval:"Superseded", budget:0.4, spent:0.4, realized:0.2, roi:0, ttv:null, risk:"Low"},
];

const STAGES=["Scaling","In Production","In Progress","Completed","Retired"];
const stageCount=s=>CEO_PORTFOLIO.filter(p=>p.stage===s).length;

/* Adoption by business unit — headcount is the CEO dimension. */
const CEO_BU=[
  {bu:"Customer Ops", head:1240, adoption:64, band:T.green},
  {bu:"Finance", head:380, adoption:79, band:T.green},
  {bu:"Retail Banking", head:910, adoption:42, band:AI_GOLD},
  {bu:"People", head:260, adoption:31, band:T.red},
];

const CEO_REGIONS=[
  {region:"EMEA", live:5, cities:"London, Frankfurt", adoption:72, regime:"EU AI Act · GDPR", c:T.green},
  {region:"Americas", live:4, cities:"NYC, São Paulo", adoption:58, regime:"NIST · SOC 2", c:AI_GOLD},
  {region:"APAC", live:3, cities:"Singapore, Sydney", adoption:44, regime:"PDPA · ISO 42001", c:T.blue},
];

/* Immediate-attention items surfaced above everything. */
const CEO_ATTENTION=[
  {t:"Credit Decision Assurance — decision required", d:"Awaiting your scale-gate approval. EU AI Act Art.6 conformity assessment complete; $7.2M value at stake.", go:"Review & approve", c:T.red},
  {t:"Customer Resolution Copilot — blocked", d:"CISO prompt-injection evidence overdue by 4 days. Delivery slip of ~2 weeks predicted if unresolved this sprint.", go:"Escalate to CISO", c:AI_GOLD},
  {t:"Q3 budget re-forecast", d:"$1.9M of allocated budget is consumed ahead of realized value across 2 programs. Reallocation proposed.", go:"Open budget review", c:T.blue},
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
const kpiStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:"pointer"};
function Kpi({l,v,vc,s,spark,onClick}){
  return <button onClick={onClick} style={{...kpiStyle,textAlign:"left"}}>
    <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div>
    <div style={{fontSize:23,fontWeight:800,marginTop:7,letterSpacing:"-0.02em",fontFamily:F.m,color:vc||T.ink}}>{v}</div>
    <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{s}</div>
    {spark}
  </button>;
}
const Table=({head,children})=><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
  <thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
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
function Overview({role,goPortfolio,openFull,showToast}){
  const [tab,setTab]=useState("overview");
  const name=(ROLES[role]||ROLES.ceo).name.split(" ")[0];
  const hour=typeof window!=="undefined"?new Date().getHours():9;
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const TABS=[["overview","Overview"],["risk","Risk"],["value","Value & ROI"],["adoption","Adoption"],["exposure","Exposure Map"],["compliance","Compliance"]];

  return <div style={{animation:"up .3s ease"}}>
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

    {tab==="overview"&&<OverviewTab goPortfolio={goPortfolio}/>}
    {tab==="risk"&&<RiskTab openFull={openFull}/>}
    {tab==="value"&&<ValueTab/>}
    {tab==="adoption"&&<AdoptionTab/>}
    {tab==="exposure"&&<ExposureTab/>}
    {tab==="compliance"&&<ComplianceTab openFull={openFull}/>}
  </div>;
}

function OverviewTab({goPortfolio}){
  return <div style={{animation:"up .2s ease"}}>
    {/* attention */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:16}}>
      {CEO_ATTENTION.map(a=><Card key={a.t} style={{padding:"13px 15px",borderLeft:`3px solid ${a.c}`,cursor:"pointer"}}>
        <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.t}</div>
        <div style={{fontSize:10.5,color:T.ink3,marginTop:3,lineHeight:1.5,fontFamily:F.b}}>{a.d}</div>
        <div style={{fontSize:10,color:AI_GOLD,fontWeight:800,marginTop:8,fontFamily:F.b}}>{a.go} →</div>
      </Card>)}
    </div>

    {/* KPI strip */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Kpi l="Portfolio value" v="$4.1M" s="realized of $17.5M expected" spark={<Spark pts="0,18 20,17 40,14 60,13 80,9 100,7 120,4" color={AI_GOLD} dot/>}/>
      <Kpi l="Enterprise health" v="78" vc={T.green} s="weighted across 4 programs" spark={<Spark pts="0,10 20,12 40,9 60,11 80,8 100,7 120,6" color={T.green}/>}/>
      <Kpi l="Overall AI risk" v={<>12<span style={{fontSize:13,color:T.ink4}}>/25</span></>} vc={T.red} s="1 critical · 2 high open" spark={<Spark pts="0,6 20,8 40,7 60,10 80,9 100,12 120,13" color={T.red}/>}/>
      <Kpi l="Compliance" v="84%" vc={T.blue} s="EU AI Act · ISO 42001 · GDPR"/>
      <Kpi l="Adoption" v="61%" s="across 4 business units"/>
      <Kpi l="Security incidents" v="2" vc={AI_GOLD} s="this quarter · 0 breaches"/>
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

function ExposureMap({big}){
  return <div style={{position:"relative",height:big?360:264,borderRadius:11,overflow:"hidden",background:"radial-gradient(120% 140% at 50% 0%, #1a2050, #0c1030)",border:`1px solid ${T.border}`}}>
    {[["4%","20%","30%","56%","Americas","6%","14%"],["38%","14%","26%","50%","EMEA","40%","8%"],["68%","22%","27%","54%","APAC","70%","16%"]].map(z=><span key={z[4]}>
      <span style={{position:"absolute",left:z[0],top:z[1],width:z[2],height:z[3],border:"1px dashed #ffffff18",borderRadius:12,background:"#ffffff06"}}/>
      <span style={{position:"absolute",left:z[5],top:z[6],fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m}}>{z[4]}</span>
    </span>)}
    {[["19%","44%",30,AI_GOLD,"4"],["50%","38%",34,T.green,"5"],["80%","50%",24,T.blue,"3"],["45%","58%",18,AI_GOLD,"1"]].map((p,i)=>
      <span key={i} style={{position:"absolute",left:p[0],top:p[1],transform:"translate(-50%,-50%)",width:p[2],height:p[2],borderRadius:"50%",display:"grid",placeItems:"center",fontSize:9.5,fontWeight:800,color:"#0b0e24",background:p[3],boxShadow:"0 0 0 4px #0b0e2455,0 4px 14px rgba(0,0,0,.4)",fontFamily:F.m}}>{p[4]}</span>)}
  </div>;
}
function RegionLegend(){
  return <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11}}>
    {CEO_REGIONS.map(r=><span key={r.region} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:r.c}}/>{r.region} · {r.live} live · {r.cities}</span>)}
  </div>;
}
function BudgetValue({big}){
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
      <Donut pct={57} size={big?140:122}/>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {[["Value realized","$4.6M",T.green],["Consumed, no value yet","$2.1M",AI_GOLD],["Unspent allocation","$1.3M",T.border]].map(([l,v,c])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.ink2,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:c}}/>{l}<b style={{marginLeft:"auto",color:T.ink,fontFamily:F.m}}>{v}</b></div>)}
      </div>
    </div>
    <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
      {[["Portfolio ROI","+22%",T.green],["Avg time-to-value","7.4 mo",T.ink]].map(([l,v,c])=>
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
function RiskTab({openFull}){
  const rows=[
    ["Adverse-decision harm","Credit Decision Assurance","Critical · 12",T.red,"O. Khan","In progress",T.blue],
    ["Prompt-injection exposure","Customer Resolution Copilot","High · 9",AI_GOLD,"CISO office","Overdue",AI_GOLD],
    ["Model drift on fraud signals","Fraud Detection Model","High · 8",AI_GOLD,"D. Osei","On track",T.green],
    ["Vendor concentration","Portfolio-wide","Medium · 6",T.blue,"Procurement","On track",T.green],
    ["Data-residency (APAC)","Predictive Maintenance","Medium · 5",T.blue,"Legal","On track",T.green],
    ["Workforce displacement concern","Workforce Skills Navigator","Low · 3",T.ink3,"People team","On track",T.green],
  ];
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:16}}>
      <Kpi l="Open risks" v={<>12<span style={{fontSize:12,color:T.ink4}}>/25</span></>} vc={T.red} s="portfolio residual score"/>
      <Kpi l="Critical / High" v={<><span style={{color:T.red}}>1</span> · <span style={{color:AI_GOLD}}>2</span></>} s="need executive attention"/>
      <Kpi l="Mitigations on track" v="68%" vc={T.green} s="11 of 16 treatments"/>
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Risk Register — highest exposure first</Eyebrow><H3>Severity · owner · mitigation status</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open full Risk Center →</button></div>
      <Table head={["Risk","Program","Severity","Owner","Mitigation"]}>
        {rows.map(r=><tr key={r[0]}><Td style={{fontWeight:700,color:T.ink}}>{r[0]}</Td><Td>{r[1]}</Td><Td><Pill c={r[3]}>{r[2]}</Pill></Td><Td>{r[4]}</Td><Td><Pill c={r[6]}>{r[5]}</Pill></Td></tr>)}
      </Table>
    </Card>
  </div>;
}
function ValueTab(){
  const rows=CEO_PORTFOLIO.filter(p=>p.spent>0).slice(0,5);
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <Card style={cardPad}><Eyebrow>Budget → Value</Eyebrow><H3 style={{marginBottom:14}}>$8.0M allocated · where it went</H3><BudgetValue big/></Card>
      <Card style={cardPad}><Eyebrow>Value realized — trailing 7 quarters</Eyebrow><H3 style={{marginBottom:14}}>$1.2M → $4.6M realized</H3>
        <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="none">
          <defs><linearGradient id="vg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={AI_GOLD} stopOpacity=".35"/><stop offset="1" stopColor={AI_GOLD} stopOpacity="0"/></linearGradient></defs>
          <polygon points="0,120 50,112 100,96 150,84 200,60 250,40 300,22 300,150 0,150" fill="url(#vg)"/>
          <polyline points="0,120 50,112 100,96 150,84 200,60 250,40 300,22" fill="none" stroke={AI_GOLD} strokeWidth="2.5"/>
          <circle cx="300" cy="22" r="3.5" fill={AI_GOLD}/>
        </svg>
      </Card>
    </div>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>ROI by program</Eyebrow><H3 style={{marginBottom:14}}>Budget · realized value · ROI · time-to-value</H3>
      <Table head={["Program","Budget","Realized","ROI","Time-to-value"]}>
        {rows.map(p=><tr key={p.name}><Td style={{fontWeight:700,color:T.ink}}>{p.name}</Td><Td>${p.budget.toFixed(1)}M</Td><Td>${p.realized.toFixed(1)}M</Td><Td><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"% (early)":"Pending gate"}</Pill></Td><Td>{p.ttv?p.ttv+" mo":"—"}</Td></tr>)}
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
function ExposureTab(){
  return <div style={{animation:"up .2s ease"}}>
    <Card style={cardPad}><Eyebrow>Deployment Exposure Map</Eyebrow><H3 style={{marginBottom:14}}>Which AI projects are deployed in which locations</H3><ExposureMap big/></Card>
    <Card style={{...cardPad,marginTop:16}}><Eyebrow>Region → program mapping</Eyebrow>
      <Table head={["Region","Live programs","Data locations","Compliance regime"]}>
        {CEO_REGIONS.map(r=><tr key={r.region}><Td style={{fontWeight:700,color:T.ink}}>{r.region}</Td><Td>{r.live} · {CEO_PORTFOLIO.filter(p=>p.region===r.region).slice(0,3).map(p=>p.name.split(" ").slice(0,2).join(" ")).join(", ")}</Td><Td>{r.cities}</Td><Td><Pill c={T.blue}>{r.regime}</Pill></Td></tr>)}
      </Table>
    </Card>
  </div>;
}
function ComplianceTab({openFull}){
  return <div style={{animation:"up .2s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:16}}>
      {[["EU AI Act",88,T.green,"Art.6 conformity · 1 high-risk system in review"],["ISO 42001",81,T.blue,"AIMS controls implemented"],["GDPR / Privacy",92,T.green,"DPIAs complete on live systems"]].map(([l,v,c,s])=>
        <Card key={l} style={cardPad}><Eyebrow>{l}</Eyebrow><div style={{fontSize:26,fontWeight:800,color:c,fontFamily:F.m}}>{v}%</div><div style={{fontSize:10,color:T.ink3,marginTop:4,fontFamily:F.b}}>{s}</div><div style={{height:8,borderRadius:6,background:T.border,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${v}%`,background:`linear-gradient(90deg,${AI_GOLD},#8a6a25)`}}/></div></Card>)}
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Compliance posture by program</Eyebrow><H3>Standards coverage &amp; reporting status</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open Compliance →</button></div>
      <Table head={["Program","Risk class","Frameworks","Evidence","Status"]}>
        {[["Credit Decision Assurance","High-risk",T.red,"EU AI Act · ISO 42001","18/20","Gate review",AI_GOLD],["Fraud Detection Model","Limited",AI_GOLD,"EU AI Act · NIST","22/22","Compliant",T.green],["Customer Resolution Copilot","Limited",AI_GOLD,"ISO 42001 · SOC 2","15/19","In progress",T.blue],["Finance Close Automation","Minimal",T.ink3,"ISO 42001","12/12","Compliant",T.green]].map(r=>
          <tr key={r[0]}><Td style={{fontWeight:700,color:T.ink}}>{r[0]}</Td><Td><Pill c={r[2]}>{r[1]}</Pill></Td><Td>{r[3]}</Td><Td>{r[4]}</Td><Td><Pill c={r[6]}>{r[5]}</Pill></Td></tr>)}
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ CEO PLAYBOOK ══════════════════ */
function Playbook({showToast}){
  const [done,setDone]=useState(false);
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="CEO Playbook" sub="Strategy, policies and roadmap — complete all three and VerisZone auto-generates your enterprise AI Runbook."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
      {[["① Strategy · complete",T.green,"AI Ambition & pillars","3 strategic pillars set: Customer trust, Operational leverage, Responsible-by-design.",100],["② Policies · complete",T.green,"Governance policies","6 of 6 board policies ratified — acceptable-use, human-oversight, model-risk, data, procurement, incident response.",100],["③ Roadmap · 80%",AI_GOLD,"12-month roadmap","4 of 5 quarters planned. Q2 '27 scaling wave awaiting budget sign-off.",80]].map(c=>
        <Card key={c[2]} style={cardPad}><Eyebrow style={{color:c[1]}}>{c[0]}</Eyebrow><H3>{c[2]}</H3><div style={{fontSize:11,color:T.ink3,marginTop:8,lineHeight:1.6,fontFamily:F.b}}>{c[3]}</div><div style={{height:8,borderRadius:6,background:T.border,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${c[4]}%`,background:c[1]}}/></div></Card>)}
    </div>
    <Card style={{...cardPad,marginTop:16,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}><H3>Enterprise AI Runbook</H3><div style={{fontSize:11,color:T.ink3,marginTop:4,fontFamily:F.b}}>Playbook is <b style={{color:AI_GOLD}}>93% complete</b>. Generate the executable runbook from your strategy, policies &amp; roadmap.</div></div>
      <button onClick={()=>{setDone(true);showToast&&showToast("Enterprise AI Runbook generated");}} style={{background:done?T.green:AI_GOLD,border:"none",borderRadius:11,padding:"11px 18px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{done?"✓ Runbook generated":"✦ Generate Runbook"}</button>
    </Card>
    {done&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}>
      <Eyebrow style={{color:AI_GOLD}}>Runbook generated · draft v1</Eyebrow><H3 style={{marginBottom:10}}>VerisZone Enterprise AI Runbook</H3>
      <Table head={[]}>
        {[["1 · Operating cadence","Monthly AI governance council · quarterly board review · weekly delivery stand-up"],["2 · Gate model","13-phase lifecycle · scale-gate requires human-oversight record + conformity assessment"],["3 · Escalation","Critical risk → CISO within 24h · value-leak >15% → CFO reforecast"],["4 · Ownership","Every program has an accountable sponsor + risk owner + delivery lead"]].map(r=>
          <tr key={r[0]}><Td style={{fontWeight:700,color:T.ink,width:200}}>{r[0]}</Td><Td>{r[1]}</Td></tr>)}
      </Table>
    </Card>}
  </div>;
}

/* ══════════════════ PORTFOLIO ══════════════════ */
function Portfolio(){
  const appColor=a=>a==="CEO-approved"?T.green:a==="Gate pending"?AI_GOLD:a==="Under review"?T.blue:T.ink3;
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Portfolio" sub="Full AI project inventory — CEO-approved programs highlighted in gold."/>
    <Card style={cardPad}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><Eyebrow style={{margin:0}}>All AI Projects · {CEO_PORTFOLIO.length}</Eyebrow><Pill c={AI_GOLD}>★ CEO-approved</Pill></div>
      <Table head={["Program","Business unit","Stage","Health","Region","Approval"]}>
        {CEO_PORTFOLIO.map(p=>{const appr=p.approval==="CEO-approved";return <tr key={p.name} style={{background:appr?AI_GOLD+"12":undefined}}>
          <Td style={{fontWeight:700,color:p.stage==="Retired"?T.ink4:T.ink}}>{appr&&<span style={{color:AI_GOLD,fontWeight:900}}>★ </span>}{p.name}</Td>
          <Td>{p.unit}</Td><Td><Pill c={stageColor(p.stage)}>{p.stage}</Pill></Td>
          <Td>{p.stage==="Completed"?"✓":p.stage==="Retired"?"↓":p.health}</Td><Td>{p.region}</Td><Td><Pill c={appColor(p.approval)}>{p.approval}</Pill></Td>
        </tr>;})}
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ BUDGET ══════════════════ */
function Budget(){
  const rows=CEO_PORTFOLIO.filter(p=>p.spent>0).sort((a,b)=>b.budget-a.budget).slice(0,5);
  const other=CEO_PORTFOLIO.length-rows.length;
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Budget" sub="Per-project budget, ROI and time-to-value across the portfolio."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:16}}>
      <Kpi l="Allocated" v="$8.0M" s="FY26 AI budget"/><Kpi l="Value realized" v="$4.6M" vc={T.green} s="57% turned to value"/>
      <Kpi l="Value leaked" v="$2.1M" vc={AI_GOLD} s="consumed, no value yet"/><Kpi l="Avg time-to-value" v="7.4 mo" s="fastest 4.2 · slowest 9.8"/>
    </div>
    <Card style={cardPad}><Eyebrow>Budget per project</Eyebrow><H3 style={{marginBottom:14}}>Allocated · consumed · ROI · time-to-value</H3>
      <Table head={["Program","Allocated","Consumed","Realized","ROI","Time-to-value"]}>
        {rows.map(p=><tr key={p.name}><Td style={{fontWeight:700,color:T.ink}}>{p.name}</Td><Td>${p.budget.toFixed(1)}M</Td><Td>${p.spent.toFixed(1)}M</Td><Td>${p.realized.toFixed(1)}M</Td><Td><Pill c={p.roi>0?T.green:p.roi<0?AI_GOLD:T.ink3}>{p.roi>0?"+"+p.roi+"%":p.roi<0?p.roi+"% (early)":"Pending gate"}</Pill></Td><Td>{p.ttv?p.ttv+" mo":"—"}</Td></tr>)}
        <tr><Td style={{fontWeight:700,color:T.ink}}>Others ({other} programs)</Td><Td>$1.2M</Td><Td>$0.6M</Td><Td>$0.0M</Td><Td><Pill c={T.ink3}>Ramping</Pill></Td><Td>—</Td></tr>
      </Table>
    </Card>
  </div>;
}

/* ══════════════════ RISK CENTER (CEO lens) ══════════════════ */
function RiskCenter({openFull}){
  const grades=[["High",T.red,riskRegister.filter(r=>["Critical","High"].includes(r.level)).length||3,"1 critical · 2 high"],["Medium",AI_GOLD,5,"mitigations on track"],["Low",T.green,8,"monitored"]];
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title="Risk Center" sub="Every risk graded High / Medium / Low with a named owner and live mitigation status."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:16}}>
      {grades.map(g=><Card key={g[0]} style={cardPad}><Eyebrow style={{color:g[1]}}>{g[0]}</Eyebrow><div style={{fontSize:30,fontWeight:800,color:g[1],fontFamily:F.m}}>{g[2]}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{g[3]}</div></Card>)}
    </div>
    <Card style={cardPad}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><Eyebrow style={{margin:0}}>Risk register</Eyebrow><H3>Severity · owner · mitigation</H3></div>
        <button onClick={openFull} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 13px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Open full Risk Center →</button></div>
      <Table head={["Risk","Program","Grade","Owner","Mitigation"]}>
        {[["Adverse-decision harm","Credit Decision Assurance","High · 12",T.red,"O. Khan","Human-oversight record in review",T.blue],["Prompt-injection exposure","Customer Resolution Copilot","High · 9",T.red,"CISO office","Evidence overdue 4d",AI_GOLD],["Model drift on fraud signals","Fraud Detection Model","High · 8",T.red,"D. Osei","Auto-retrain live",T.green],["Vendor concentration","Portfolio-wide","Medium · 6",AI_GOLD,"Procurement","Second-source in flight",T.green],["Data-residency (APAC)","Predictive Maintenance","Medium · 5",AI_GOLD,"Legal","Regionalised",T.green],["Workforce displacement concern","Workforce Skills Navigator","Low · 3",T.ink3,"People team","Reskilling plan",T.green]].map(r=>
          <tr key={r[0]}><Td style={{fontWeight:700,color:T.ink}}>{r[0]}</Td><Td>{r[1]}</Td><Td><Pill c={r[3]}>{r[2]}</Pill></Td><Td>{r[4]}</Td><Td><Pill c={r[6]}>{r[5]}</Pill></Td></tr>)}
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
        {[["Portfolio value","$4.1M",T.ink],["Overall risk","12/25",T.red],["Adoption","61%",T.ink]].map(([l,v,c])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px"}}><div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{l}</div><div style={{fontSize:18,fontWeight:800,marginTop:5,color:c,fontFamily:F.m}}>{v}</div></div>)}
      </div>
      <Table head={[]}>
        {[["By region","EMEA 5 live · Americas 4 · APAC 3 — adoption 72 / 58 / 44%"],["By risk","3 high · 5 medium · 8 low — 1 critical awaiting your gate decision"],["By time","Value realized $1.2M → $4.6M across 7 quarters"],["Resource tracking","1,240 in Customer Ops · 910 Retail Banking · 380 Finance · 260 People"]].filter(r=>sel.has(r[0])||["By time","Resource tracking"].includes(r[0])).map(r=>
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
export function CEOCommandCenter({tab="home",role="ceo",setTab,setAiCentralView,showToast}){
  const goPortfolio=()=>setTab&&setTab("ceoportfolio");
  const openFullRisk=()=>setTab&&setTab("riskcenter");
  const openCompliance=()=>setTab&&setTab("compliance");
  switch(tab){
    case "ceoplaybook":  return <Playbook showToast={showToast}/>;
    case "ceoportfolio": return <Portfolio/>;
    case "ceobudget":    return <Budget/>;
    case "ceorisk":      return <RiskCenter openFull={openFullRisk}/>;
    case "ceoactions":   return <Actions role={role} showToast={showToast}/>;
    case "ceoreporting": return <Reporting showToast={showToast}/>;
    default:             return <Overview role={role} goPortfolio={goPortfolio} openFull={openFullRisk} showToast={showToast}/>;
  }
}
