"use client";

import { useState } from "react";
import { pushBus } from "@/lib/bus";
import { ROLE_CENTERS } from "@/lib/role-centers";
import { T, F, AI_GOLD, ROLES, Card } from "./core";

/* ── Role Command Center engine ─────────────────────────────────────
   Renders any role's command center from its config in lib/role-centers.
   Overview is the `home` tab (hero + attention + KPIs + signature
   panels); each sidebar surface is a composition of generic blocks
   (kpis · attn · bars · table · scores · report · actions · text).
   Same design language and tokens as the CEO/CAIO command centers. */

const CMAP = { good:T.green, warn:T.amber, crit:T.red, info:T.blue, violet:T.violet, teal:T.teal, gold:AI_GOLD, ink3:T.ink3, ink:T.ink };
const col = k => CMAP[k] || T.ink;

const cardPad = { padding:"16px 18px" };
const Eyebrow = ({children}) => <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,marginBottom:6}}>{children}</div>;
const H3 = ({children,style}) => <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,margin:"0 0 12px",...style}}>{children}</div>;
const Pill = ({children,c=T.ink3}) => <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:9.5,fontWeight:800,fontFamily:F.m,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:c+"1f",color:c}}>{children}</span>;

/* ── block renderers ── */
function Kpis({items}){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
    {items.map((k,i)=><div key={i} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px"}}>
      <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{k[0]}</div>
      <div style={{fontSize:22,fontWeight:800,marginTop:7,letterSpacing:"-0.02em",fontFamily:F.m,color:col(k[2])}}>{k[1]}</div>
      <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{k[3]}</div>
    </div>)}
  </div>;
}
function Attn({items}){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:18}}>
    {items.map((a,i)=><Card key={i} style={{padding:"13px 15px",borderLeft:`3px solid ${col(a[3])}`,cursor:"pointer"}}>
      <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a[0]}</div>
      <div style={{fontSize:10.5,color:T.ink3,marginTop:3,lineHeight:1.5,fontFamily:F.b}}>{a[1]}</div>
      <div style={{fontSize:10,color:AI_GOLD,fontWeight:800,marginTop:8,fontFamily:F.b}}>{a[2]} →</div>
    </Card>)}
  </div>;
}
function Bars({eye,h3,rows,legend,raw}){
  const max = raw ? Math.max(...rows.map(r=>r[2])) : 100;
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    {rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr auto",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
      <span style={{fontSize:11,fontWeight:600,color:T.ink2,fontFamily:F.b}}>{r[0]}{r[1]?<span style={{color:T.ink4}}> · {r[1]}</span>:null}</span>
      <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(r[2]/max*100)}%`,background:col(r[3])}}/></div>
      <span style={{fontSize:11,fontWeight:800,textAlign:"right",minWidth:44,color:col(r[3]),fontFamily:F.m}}>{raw?r[2].toLocaleString():r[2]+"%"}</span>
    </div>)}
    {legend&&<div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11}}>{legend.map((l,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:col(l[1])}}/>{l[0]}</span>)}</div>}
  </Card>;
}
const cell = c => Array.isArray(c) ? <Pill c={col(c[1])}>{c[0]}</Pill> : c;
function Tbl({eye,h3,head,rows}){
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
      <thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} style={{padding:"11px 10px",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",color:j===0?T.ink:T.ink2,fontWeight:j===0?700:400}}>{cell(c)}</td>)}</tr>)}</tbody>
    </table></div>
  </Card>;
}
function Scores({eye,h3,ring,rows}){
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:`conic-gradient(${T.green} ${ring}%, ${T.s3||T.panel} 0)`,display:"grid",placeItems:"center",flex:"none"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:T.s1,display:"grid",placeItems:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:T.ink,lineHeight:1,fontFamily:F.m}}>{ring}</div><div style={{fontSize:7.5,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4,fontWeight:800,marginTop:2}}>Maturity</div></div></div>
      </div>
      <div style={{flex:1,minWidth:200}}>{rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr 34px",alignItems:"center",gap:12,padding:"7px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.ink2,fontFamily:F.b}}>{r[0]}</span>
        <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${r[1]}%`,background:col(r[2])}}/></div>
        <span style={{fontSize:11,fontWeight:800,textAlign:"right",color:col(r[2]),fontFamily:F.m}}>{r[1]}</span>
      </div>)}</div>
    </div>
  </Card>;
}
function TextBlock({eye,h3,body}){
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3 style={{marginBottom:8}}>{h3}</H3><div style={{fontSize:11.5,color:T.ink3,lineHeight:1.7,fontFamily:F.b}}>{body}</div></Card>;
}
function Library({items}){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
    {items.map((l,i)=><Card key={i} style={{padding:"14px 15px",cursor:"pointer"}}><div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{l[0]}</div><div style={{fontSize:10.5,color:T.ink3,marginTop:5,lineHeight:1.5,fontFamily:F.b}}>{l[1]}</div><div style={{marginTop:9}}><Pill c={col(l[3])}>{l[2]}</Pill></div></Card>)}
  </div>;
}
function Report({eye,h3,dims,showToast}){
  const [sel,setSel]=useState(new Set(dims.slice(0,3)));
  const [gen,setGen]=useState(false);
  const toggle=d=>setSel(s=>{const n=new Set(s);n.has(d)?n.delete(d):n.add(d);return n;});
  return <><Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{dims.map(d=><button key={d} onClick={()=>toggle(d)} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px solid ${sel.has(d)?AI_GOLD:T.border}`,background:sel.has(d)?AI_GOLD:T.s2,color:sel.has(d)?"#0b0e24":T.ink3}}>{d}</button>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button onClick={()=>{setGen(true);showToast&&showToast("Report generated");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 17px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>✦ Generate report</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 17px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Schedule</button></div>
  </Card>
  {gen&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}><Eyebrow>Generated draft · {[...sel].length} dimensions</Eyebrow><H3 style={{marginBottom:10}}>Report — Q3 FY26</H3>
    <div style={{fontSize:11,color:T.ink2,lineHeight:1.7,fontFamily:F.b}}>{[...sel].map(d=><div key={d}>• <b style={{color:T.ink}}>{d}</b> — consolidated for the period.</div>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export XLSX</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export PDF</button></div>
  </Card>}</>;
}
function Actions({eye,h3,items,role,showToast}){
  const [done,setDone]=useState({});
  const act=(n,label,title)=>{
    setDone(d=>({...d,[n]:label}));
    pushBus("vz-gw-evidence",{item:`${label} — ${title}`,initiative:title,scope:"Workspace",control:"Approval record",risk:"Decision",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:label,version:"v1",time:"Just now"});
    showToast&&showToast(`${label} recorded — evidence minted`);
  };
  return <div>{eye&&<Eyebrow>{eye}</Eyebrow>}{h3&&<H3>{h3}</H3>}
    {items.map(a=><Card key={a[0]} style={{...cardPad,marginBottom:11,display:"flex",gap:13,alignItems:"flex-start"}}>
      <div style={{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0,color:"#0b0e24",background:col(a[1]),fontFamily:F.m}}>{a[0]}</div>
      <div style={{flex:1}}><H3 style={{marginBottom:0}}>{a[2]}</H3><div style={{fontSize:11,color:T.ink3,marginTop:4,lineHeight:1.55,fontFamily:F.b}}>{a[3]}</div>
        {done[a[0]]?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b,marginTop:11}}>✓ {done[a[0]]} recorded — evidence minted</div>
        :<div style={{display:"flex",gap:9,marginTop:11,flexWrap:"wrap"}}>
          <button onClick={()=>act(a[0],a[4],a[2])} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"8px 15px",color:"#0b0e24",fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a[4]}</button>
          <button onClick={()=>act(a[0],a[5],a[2])} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a[5]}</button>
        </div>}
      </div>
    </Card>)}
  </div>;
}

function renderBlock(b, i, ctx){
  switch(b.t){
    case "kpis":    return <Kpis key={i} items={b.items}/>;
    case "attn":    return <Attn key={i} items={b.items}/>;
    case "bars":    return <Bars key={i} {...b}/>;
    case "table":   return <Tbl key={i} {...b}/>;
    case "scores":  return <Scores key={i} {...b}/>;
    case "text":    return <TextBlock key={i} {...b}/>;
    case "library": return <Library key={i} items={b.items}/>;
    case "report":  return <Report key={i} {...b} showToast={ctx.showToast}/>;
    case "actions": return <Actions key={i} {...b} role={ctx.role} showToast={ctx.showToast}/>;
    default:        return null;
  }
}
/* Card-type blocks flow into a responsive 2-col grid; full-width blocks
   (kpis, attn, actions, report, library) render on their own row. */
const FULL = new Set(["kpis","attn","actions","report","library"]);
function Blocks({blocks, ctx}){
  const out=[]; let bucket=[];
  const flush=()=>{ if(bucket.length){ out.push(<div key={"g"+out.length} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>{bucket}</div>); bucket=[]; } };
  blocks.forEach((b,i)=>{ if(FULL.has(b.t)){ flush(); out.push(<div key={"f"+i} style={{marginBottom:0}}>{renderBlock(b,i,ctx)}</div>); } else { bucket.push(renderBlock(b,i,ctx)); } });
  flush();
  return <>{out}</>;
}

function PageHead({title,sub}){
  return <div style={{marginBottom:16}}>
    <div style={{fontFamily:F.e,fontWeight:400,fontSize:26,lineHeight:1.1,color:T.ink,margin:"0 0 4px"}}>{title}</div>
    <div style={{color:T.ink3,fontSize:12,fontFamily:F.b}}>{sub}</div>
  </div>;
}

/* Overview dashboard lenses — derived from the role's surfaces (excluding
   playbook, reports and assistant, which are pages rather than lenses).
   Mirrors the CEO/CAIO in-surface tabs so every role is consistent. */
function Overview({role,cfg,ctx}){
  const name=(ROLES[role]||ROLES.caio).name.split(" ")[0];
  const hour=typeof window!=="undefined"?new Date().getHours():9;
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const lenses=cfg.surfaces.filter(s=>!/reports$|playbook$|assistant$/.test(s.id)).slice(0,4);
  const [tab,setTab]=useState(0);
  const TABS=[{label:"Overview"},...lenses.map(s=>({label:s.label,blocks:s.blocks}))];
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}>
      <div>
        <h1 style={{fontFamily:F.e,fontSize:29,fontWeight:400,color:T.ink,margin:"2px 0 4px"}}>{greet}, <span style={{color:AI_GOLD}}>{name}.</span></h1>
        <div style={{color:T.ink3,fontSize:12.5,fontFamily:F.b,maxWidth:680}}>{cfg.greet} — {cfg.sub}</div>
        <div style={{fontSize:10.5,color:T.ink4,fontWeight:700,marginTop:6,fontStyle:"italic",fontFamily:F.b}}>{cfg.thesis}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:15,background:`linear-gradient(135deg,#E7BE63,${AI_GOLD} 55%,#B3852F)`,border:"1px solid #F0CE7E",borderRadius:15,padding:"12px 20px",boxShadow:`0 12px 30px ${AI_GOLD}4d,0 0 0 4px ${AI_GOLD}1f`}}>
        <div style={{fontSize:36,fontWeight:800,color:"#221703",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{cfg.hero[0]}</div>
        <div style={{textAlign:"left"}}><div style={{fontSize:10,letterSpacing:"0.09em",textTransform:"uppercase",color:"#2a1c02",fontWeight:900,fontFamily:F.m}}>{cfg.hero[1]}</div><div style={{fontSize:10.5,color:"#4b3608",marginTop:3,fontWeight:600,fontFamily:F.b}}>{cfg.hero[2]}</div></div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,margin:"18px 0",flexWrap:"wrap"}}>
      {TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} style={{padding:"7px 15px",borderRadius:20,fontSize:11.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",border:`1px solid ${tab===i?AI_GOLD:T.border}`,background:tab===i?AI_GOLD:T.s2,color:tab===i?"#0b0e24":T.ink3}}>{t.label}</button>)}
    </div>
    {tab===0
      ? <div style={{animation:"up .2s ease"}}><Attn items={cfg.attn}/><Kpis items={cfg.kpis}/><Blocks blocks={cfg.panels} ctx={ctx}/></div>
      : <div style={{animation:"up .2s ease"}}><Blocks blocks={TABS[tab].blocks} ctx={ctx}/></div>}
  </div>;
}

export function RoleCommandCenter({tab="home",role="coo",setTab,setAiCentralView,showToast}){
  const cfg=ROLE_CENTERS[role]; if(!cfg) return null;
  const ctx={role,setTab,setAiCentralView,showToast};
  if(tab==="home") return <Overview role={role} cfg={cfg} ctx={ctx}/>;
  const s=cfg.surfaces.find(x=>x.id===tab);
  if(!s) return <Overview role={role} cfg={cfg} ctx={ctx}/>;
  return <div style={{animation:"up .3s ease"}}>
    <PageHead title={s.label} sub={s.sub}/>
    <Blocks blocks={s.blocks} ctx={ctx}/>
  </div>;
}
