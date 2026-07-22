"use client";

import { readBus, pushBus } from "@/lib/bus";
import { Library, Scale, Workflow } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { acInitiatives, gatewayProviders, gatewayRouting, demoConversations, employeeUsageSeed } from "@/lib/platform-models";
import { T, USER_PROFILES, AI_GOLD, AI_GOLD_L, AI_GOLD_B, HITL, F, Tag, Bar, Card, SHead, IDEA_JOURNEY, DEMO_IDEAS } from "./core";

export function wbInspectPrompt(text){
  if(/(password|api[\s_-]?key|secret|token)\s*[:=]/i.test(text)||/\bsk-[A-Za-z0-9]{8,}/.test(text))
    return {action:"Blocked",detector:"Credentials & API Keys",masked:text};
  const cardRe=/\b(?:\d[ -]?){13,16}\b/g, emailRe=/[\w.+-]+@[\w-]+\.[\w.]+/g;
  if(cardRe.test(text)||emailRe.test(text))
    return {action:"Masked",detector:/(?:\d[ -]?){13,16}/.test(text)?"PCI / Card Data":"PII Detection",
      masked:text.replace(/\b(?:\d[ -]?){13,16}\b/g,"[MASKED-CARD]").replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,"[MASKED-EMAIL]")};
  return null;
}

/* Internal Knowledge Engine: pick enrichment assets for a prompt. */
export function wbEnrichFor(text){
  const t=text.toLowerCase(), picks=[];
  if(/risk/.test(t))picks.push("Enterprise AI Risk Library","ISO 42001 Control Checklist");
  if(/agent|architect|design|build/.test(t))picks.push("AI Reference Architecture Standard","Approved Prompt Library");
  if(/proposal|sales|deck|present|draft/.test(t))picks.push("Approved Prompt Library","Pilot-to-Scale Playbook");
  if(/privacy|dpia|gdpr|consent/.test(t))picks.push("DPIA / Privacy Assessment Template");
  if(/policy|compliance/.test(t))picks.push("Responsible GenAI Use Policy");
  if(!picks.length)picks.push("Responsible GenAI Use Policy","Approved Prompt Library");
  return [...new Set(picks)].slice(0,4);
}

export function PageWorkbench({role,sessionMode,showToast}){
  const seeded=sessionMode==="demo";
  const U=USER_PROFILES[role==="manager"?"manager":"employee"]||USER_PROFILES.employee;
  const unit=U.department||"Engineering";
  const route=gatewayRouting.find(r=>r.scope.toLowerCase().startsWith(unit.split(" ")[0].toLowerCase()))||gatewayRouting[1];
  const provider=gatewayProviders.find(p=>p.id===route.providerId)||gatewayProviders[0];
  const [convos,setConvos]=useState(seeded?demoConversations:[]);
  const [hydrated,setHydrated]=useState(false);
  const [selId,setSelId]=useState(seeded?demoConversations[0].id:null);
  const [input,setInput]=useState("");
  const [phase,setPhase]=useState(null); /* {convId, stageIdx} while the gateway "works" */
  const [typed,setTyped]=useState(null); /* {convId, text} during the streaming reveal */
  const timers=useRef([]);
  useEffect(()=>()=>{timers.current.forEach(t=>clearTimeout(t));},[]);
  useEffect(()=>{
    try{const saved=JSON.parse(localStorage.getItem("vz-wb-convos")||"[]");
      if(Array.isArray(saved)&&saved.length){setConvos(prev=>[...saved.filter(s=>!prev.some(p=>p.id===s.id)),...prev]);if(!seeded)setSelId(saved[0].id);}
    }catch{/* ignore */}
    setHydrated(true);
  },[seeded]);
  useEffect(()=>{
    if(!hydrated)return;
    try{localStorage.setItem("vz-wb-convos",JSON.stringify(convos.filter(c=>!demoConversations.some(d=>d.id===c.id))));}catch{/* ignore */}
  },[convos,hydrated]);
  const sel=convos.find(c=>c.id===selId)||null;
  const recordEvidence=(conv)=>{
    pushBus("vz-gw-evidence",{item:`Workbench artifact: ${conv.title}`,initiative:acInitiatives.find(i=>i.id===conv.initiativeId)?.name||"Employee Workspace",scope:"Project",control:"Gateway policy engine",risk:"Prompt governance",owner:U.name,status:"Complete",approval:"Auto-captured",version:"v1",time:"Just now"})
  };
  /* The chat window is always available: the first message of a clean
     workspace creates its governed conversation automatically. The reply
     streams in after visible policy/knowledge/routing stages. */
  const send=()=>{
    const text=input.trim();
    if(!text||phase||typed)return;
    const base=sel||{
      id:`cv-${Math.random().toString(36).slice(2,8)}`,
      title:text.length>44?text.slice(0,44)+"...":text,
      unit,project:"Unassigned",initiativeId:null,providerId:provider.id,model:provider.models[0]||"Default",
      classification:"Internal",created:"Today",lastActivity:"Just now",riskScore:8,policyDecision:"No activity yet",
      evidenceLinks:0,retention:"90 days",messages:[],
    };
    const guard=wbInspectPrompt(text);
    const stamp=`m${Math.random().toString(36).slice(2,8)}`;
    const blocked=guard&&guard.action==="Blocked";
    const shown=blocked?"[Prompt blocked before leaving the enterprise boundary]":(guard?guard.masked:text);
    const userMsg={id:stamp,from:"user",text:shown,guardrail:guard?{action:guard.action,detector:guard.detector}:null};
    const withUser={...base,lastActivity:"Just now",messages:[...base.messages,userMsg],
      riskScore:blocked?Math.min(95,base.riskScore+20):base.riskScore,
      policyDecision:blocked?"Blocked by policy":base.policyDecision};
    setConvos(cs=>[withUser,...cs.filter(c=>c.id!==base.id)]);
    setSelId(base.id);
    setInput("");
    const enriched=blocked?[]:wbEnrichFor(text);
    const artifact=!blocked&&/register|assessment|policy|charter|dpia|plan|report|minutes/i.test(text);
    const reply=blocked
      ?`Request blocked by the ${guard.detector} policy. Nothing left the enterprise boundary. Remove the sensitive content, or request an exception through HITL approval.`
      :`${artifact?"Draft generated":"Done"} using enterprise knowledge before any model call - routed to ${provider.name} (${route.reason.toLowerCase()}).${guard?" Sensitive data was masked at the enterprise boundary.":""}${artifact?" The artifact and its policy decision were recorded in Trust & Evidence.":""}`;
    const commit=finalText=>{
      setConvos(cs=>cs.map(c=>c.id!==base.id?c:{...c,lastActivity:"Just now",
        evidenceLinks:c.evidenceLinks+(artifact?1:0),
        policyDecision:blocked?"Blocked by policy":guard?"Allowed with masking":"Allowed with enrichment",
        messages:[...c.messages,{id:stamp+"a",from:"assistant",text:finalText,enrichedWith:enriched.length?enriched:undefined,guardrail:blocked?{action:"Blocked",detector:guard.detector}:null}]}));
      setTyped(null);setPhase(null);
      if(blocked)showToast&&showToast(`Blocked by ${guard.detector} policy`,"error");
      else if(artifact){recordEvidence(base);showToast&&showToast("Evidence recorded in Trust & Evidence");}
      else if(guard)showToast&&showToast(`${guard.detector}: content masked`);
    };
    /* staged gateway work, then a streaming reveal */
    const stages=blocked?1:3;
    setPhase({convId:base.id,stageIdx:0});
    for(let i=1;i<stages;i++)timers.current.push(setTimeout(()=>setPhase({convId:base.id,stageIdx:i}),i*620));
    timers.current.push(setTimeout(()=>{
      setPhase(null);
      let pos=0;
      const step=()=>{
        pos=Math.min(reply.length,pos+3);
        setTyped({convId:base.id,text:reply.slice(0,pos)});
        if(pos<reply.length)timers.current.push(setTimeout(step,16));
        else timers.current.push(setTimeout(()=>commit(reply),140));
      };
      step();
    },stages*620+180));
  };
  const gaColor=a=>a==="Blocked"?T.red:a==="Masked"?T.amber:a==="Justification required"?T.blue:T.green;
  const clsColor=c=>c==="Restricted"?T.red:c==="Confidential"?T.amber:T.blue;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Workbench" sub={`Every interaction is governed by the Enterprise AI Gateway - ${unit} routes to ${provider.name}. Enterprise knowledge enriches every prompt; sensitive data never leaves the boundary.`}/>
    <div style={{display:"grid",gridTemplateColumns:"290px 1fr",gap:14,alignItems:"start"}}>
      {/* Conversations */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,fontSize:13,color:T.ink,fontWeight:800,fontFamily:F.h}}>Conversations</h3>
          <button onClick={()=>{setSelId(null);setInput("");}} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 10px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>New</button>
        </div>
        {convos.length===0&&<div style={{padding:"18px 14px",fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6}}>No conversations yet - this workspace is clean. Type your first message on the right to start a governed conversation.</div>}
        <div style={{maxHeight:520,overflowY:"auto"}}>
          {convos.map(c=><button key={c.id} onClick={()=>setSelId(c.id)} style={{display:"block",width:"100%",textAlign:"left",background:c.id===selId?AI_GOLD+"10":"transparent",border:"none",borderBottom:`1px solid ${T.border}`,borderLeft:`3px solid ${c.id===selId?AI_GOLD:"transparent"}`,padding:"11px 13px",cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:4,lineHeight:1.35}}>{c.title}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{c.unit}</span>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{gatewayProviders.find(p=>p.id===c.providerId)?.name||c.providerId}</span>
              <span style={{marginLeft:"auto",fontSize:9,fontFamily:F.m,color:c.riskScore>=40?T.amber:T.green}}>{c.riskScore}</span>
            </div>
          </button>)}
        </div>
      </Card>
      {/* Chat - always available */}
      <Card style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:560}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.h}}>{sel?sel.title:"New conversation"}</div>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{sel?`${sel.unit} · ${sel.project} · Retention ${sel.retention} · ${sel.policyDecision}`:`${unit} · Your first message starts a governed conversation`}</div>
          </div>
          <Tag label={sel?sel.classification:"Internal"} color={clsColor(sel?sel.classification:"Internal")} bg={clsColor(sel?sel.classification:"Internal")+"14"}/>
          <Tag label={`${route.scope} → ${provider.name}`} color={AI_GOLD} bg={AI_GOLD+"14"}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px",display:"grid",gap:12,alignContent:"start"}}>
          {(!sel||sel.messages.length===0)&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,maxWidth:560}}>
            Ask anything. Before your prompt reaches {provider.name}, the Gateway checks policy, searches enterprise knowledge and attaches your project context. Sensitive data is masked or blocked at the boundary - try including an email address to see it work.
          </div>}
          {sel&&sel.messages.map(m=><div key={m.id} style={{justifySelf:m.from==="user"?"end":"start",maxWidth:"78%"}}>
            <div style={{background:m.from==="user"?AI_GOLD+"14":T.s2,border:`1px solid ${m.from==="user"?AI_GOLD+"30":T.border}`,borderRadius:12,padding:"11px 14px"}}>
              <div style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.65}}>{m.text}</div>
              {m.guardrail&&<div style={{display:"flex",gap:6,alignItems:"center",marginTop:9}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:gaColor(m.guardrail.action)}}/>
                <span style={{fontSize:9,fontWeight:800,color:gaColor(m.guardrail.action),fontFamily:F.m}}>{m.guardrail.action} · {m.guardrail.detector}</span>
              </div>}
              {m.enrichedWith&&m.enrichedWith.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:9,paddingTop:9,borderTop:`1px solid ${T.border}`}}>
                <span style={{fontSize:8,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",alignSelf:"center"}}>Enriched with</span>
                {m.enrichedWith.map(k=><span key={k} style={{fontSize:9,color:AI_GOLD,background:AI_GOLD+"10",border:`1px solid ${AI_GOLD}30`,borderRadius:5,padding:"2px 7px",fontFamily:F.b,fontWeight:700}}>{k}</span>)}
              </div>}
            </div>
          </div>)}
          {phase&&sel&&phase.convId===sel.id&&<div style={{justifySelf:"start",maxWidth:"78%"}}>
            <div style={{background:T.s2,border:`1px solid ${AI_GOLD}30`,borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{display:"inline-flex",gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:AI_GOLD,animation:`pulse 1.1s ease-in-out ${i*0.18}s infinite`}}/>)}</span>
              <span style={{fontSize:11,color:AI_GOLD,fontFamily:F.m,fontWeight:800}}>{["Checking policy at the boundary...","Searching enterprise knowledge...",`Routing to ${provider.name}...`][phase.stageIdx]||"Working..."}</span>
            </div>
          </div>}
          {typed&&sel&&typed.convId===sel.id&&<div style={{justifySelf:"start",maxWidth:"78%"}}>
            <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"11px 14px"}}>
              <div style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.65}}>{typed.text}<span style={{display:"inline-block",width:7,height:13,background:AI_GOLD,marginLeft:2,verticalAlign:"text-bottom",animation:"pulse 1s infinite"}}/></div>
            </div>
          </div>}
        </div>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:9}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={`Message ${provider.name} through the Gateway...`} style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px",color:T.ink,fontSize:12,fontFamily:F.b,outline:"none"}}/>
          <button onClick={send} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,border:`1px solid ${AI_GOLD_B}`,borderRadius:9,padding:"11px 18px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Send</button>
        </div>
      </Card>
    </div>
  </div>;
}

/* ── My AI Ideas: bottom-up intake ────────────────────────────────
   Employees submit AI ideas that route into the existing intake funnel
   (AI Opportunity Intake -> AI Central "New Ideas"). One funnel - this is
   the employee-side entry, not a parallel pipeline. */

export function PageMyIdeas({role,sessionMode,showToast}){
  const seeded=sessionMode==="demo";
  const U=USER_PROFILES[role==="manager"?"manager":"employee"]||USER_PROFILES.employee;
  const [ideas,setIdeas]=useState(seeded?DEMO_IDEAS:[]);
  const [hydrated,setHydrated]=useState(false);
  const [draft,setDraft]=useState({title:"",problem:"",benefit:"",category:"GenAI Copilot"});
  useEffect(()=>{
    try{const saved=JSON.parse(localStorage.getItem("vz-my-ideas")||"[]");
      if(Array.isArray(saved)&&saved.length)setIdeas(prev=>[...saved.filter(s=>!prev.some(p=>p.id===s.id)),...prev]);
    }catch{/* ignore */}
    setHydrated(true);
  },[]);
  useEffect(()=>{
    if(!hydrated)return;
    try{localStorage.setItem("vz-my-ideas",JSON.stringify(ideas.filter(i=>!DEMO_IDEAS.some(d=>d.id===i.id))));}catch{/* ignore */}
  },[ideas,hydrated]);
  const submit=()=>{
    if(!draft.title.trim()||!draft.problem.trim()){showToast&&showToast("Add a title and the problem it solves","error");return;}
    const rec={id:`idea-${Math.random().toString(36).slice(2,8)}`,title:draft.title.trim(),problem:draft.problem.trim(),benefit:draft.benefit.trim()||"To be assessed",category:draft.category,unit:U.department||"Engineering",status:"Submitted",date:"Today"};
    setIdeas([rec,...ideas]);
    try{fetch("/api/bus/ideas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:rec.title,problem:rec.problem||rec.desc||"",unit:rec.unit||"",submitter:rec.by||rec.submitter||"Employee",stage:rec.stage||"Submitted"})}).catch(()=>{});}catch{/* fallback mode */}
    setDraft({title:"",problem:"",benefit:"",category:"GenAI Copilot"});
    showToast&&showToast("Idea submitted - routed to AI Opportunity Intake");
  };
  const stColor=st=>st==="In AI Central intake"?AI_GOLD:st==="Accepted"?T.green:st==="Under review"?T.blue:T.ink3;
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="My AI Ideas" sub="Bottom-up innovation: submit AI ideas from your daily work. Accepted ideas enter AI Opportunity Intake and become governed initiatives in AI Central."/>
    <div style={{display:"grid",gridTemplateColumns:"minmax(300px,.9fr) 1.1fr",gap:14,alignItems:"start"}}>
      <Card style={{padding:18}}>
        <Tag label="SUBMIT AN IDEA" color={AI_GOLD} bg={AI_GOLD_L}/>
        <h3 style={{fontSize:15,color:T.ink,fontWeight:800,fontFamily:F.h,margin:"10px 0 4px"}}>What could AI do better in your work?</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 14px"}}>You know the friction best. Every idea is reviewed; accepted ideas follow the governed lifecycle from day one.</p>
        <div style={{display:"grid",gap:10}}>
          <label style={{display:"grid",gap:5}}>
            <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Idea title</span>
            <input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="e.g. Auto-draft weekly status reports" style={fieldStyle}/>
          </label>
          <label style={{display:"grid",gap:5}}>
            <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>What problem does it solve?</span>
            <textarea value={draft.problem} onChange={e=>setDraft({...draft,problem:e.target.value})} rows={3} placeholder="Describe the friction in your daily work..." style={{...fieldStyle,resize:"vertical"}}/>
          </label>
          <label style={{display:"grid",gap:5}}>
            <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Expected benefit</span>
            <input value={draft.benefit} onChange={e=>setDraft({...draft,benefit:e.target.value})} placeholder="e.g. Save 2 hours per week per person" style={fieldStyle}/>
          </label>
          <label style={{display:"grid",gap:5}}>
            <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>Category</span>
            <select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>
              {["GenAI Copilot","Decision Support","Process Automation","Recommendation","Agentic Workflow"].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button onClick={submit} style={{background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,border:`1px solid ${AI_GOLD_B}`,borderRadius:9,padding:"11px 14px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Submit idea</button>
        </div>
      </Card>
      <div style={{display:"grid",gap:10,alignContent:"start"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{fontSize:14,color:T.ink,fontWeight:800,fontFamily:F.h,margin:0}}>My submitted ideas</h3>
          <Tag label={`${ideas.length} ideas`} color={AI_GOLD} bg={AI_GOLD+"16"}/>
        </div>
        {ideas.length===0&&<Card style={{padding:22}}><p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>No ideas yet. Your first submission starts your innovation record - accepted ideas are credited to you through the whole lifecycle.</p></Card>}
        {ideas.map(i=>{
          const stepIdx=IDEA_JOURNEY.indexOf(i.status==="Accepted"?"Accepted":i.status);
          return <Card key={i.id} style={{padding:15}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8,flexWrap:"wrap"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{i.title}</div>
                <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{i.problem}</div>
              </div>
              <Tag label={i.status} color={stColor(i.status)} bg={stColor(i.status)+"16"}/>
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:9,color:T.ink4,fontFamily:F.b,marginBottom:11}}>
              <span>{i.category}</span><span>{i.unit}</span><span>Benefit: {i.benefit}</span><span>{i.date}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:0}}>
              {IDEA_JOURNEY.map((step,si)=><div key={step} style={{display:"flex",alignItems:"center",flex:si<IDEA_JOURNEY.length-1?1:"0 0 auto"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:si<=stepIdx?AI_GOLD:T.s4,border:`2px solid ${si<=stepIdx?AI_GOLD:T.border}`,boxShadow:si===stepIdx?`0 0 10px ${AI_GOLD}66`:"none"}}/>
                  <span style={{fontSize:8,color:si<=stepIdx?AI_GOLD:T.ink4,fontFamily:F.m,fontWeight:800,whiteSpace:"nowrap"}}>{step}</span>
                </div>
                {si<IDEA_JOURNEY.length-1&&<div style={{flex:1,height:2,background:si<stepIdx?AI_GOLD+"70":T.border,margin:"0 6px 14px"}}/>}
              </div>)}
            </div>
          </Card>;
        })}
      </div>
    </div>
  </div>;
}

/* ── My AI Dashboard (employee) + Manager adoption view ───────── */
export function PageAIUsage({role,sessionMode}){
  const seeded=sessionMode==="demo";
  const u=seeded?employeeUsageSeed:{timeSavedHrs:0,prompts:0,blocked:0,warnings:0,successRate:0,knowledgeReuse:0,topSkills:[],preferredModels:[],learningProgress:0};
  const isManager=role==="manager";
  const tiles=[
    ["Time saved",`${u.timeSavedHrs}h`,"This month",T.green],
    ["Successful prompts",u.prompts,"Through the Gateway",AI_GOLD],
    ["Prompt success rate",u.successRate+"%","First-answer usefulness",T.teal],
    ["Knowledge reuse",u.knowledgeReuse+"%","Answers enriched internally",T.blue],
    ["Warnings",u.warnings,"Policy warnings received",T.amber],
    ["Blocked",u.blocked,"Nothing left the boundary",T.red],
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={isManager?"Team AI Adoption":"My AI Dashboard"} sub={isManager?"Team adoption, value and compliance - private prompts are never shown. Content review requires explicit permission granted by policy.":"Your governed AI activity - productivity, safety and learning in one place."}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:14}}>
      {tiles.map(([l,v,sub,c])=><Card key={l} style={{padding:14}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{l}</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c,marginBottom:3}}>{v}</div>
        <div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{sub}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>Top AI skills</h3>
        {(u.topSkills.length?u.topSkills:["No activity yet"]).map((s,i)=><div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{s}</span>
          {u.topSkills.length>0&&<Bar value={[86,74,63][i]||50} color={AI_GOLD} />}
        </div>)}
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.ink3,fontFamily:F.b,marginBottom:6}}><span>Learning progress</span><span style={{fontFamily:F.m}}>{u.learningProgress}%</span></div>
          <Bar value={u.learningProgress} color={T.teal}/>
        </div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>Preferred models</h3>
        {(u.preferredModels.length?u.preferredModels:["No usage yet"]).map(m=><div key={m} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:AI_GOLD}}/>
          <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{m}</span>
        </div>)}
        <p style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.6,margin:"12px 0 0"}}>Model choice is routed by the Gateway from your business unit policy - you always get an approved model without thinking about it.</p>
      </Card>
    </div>
    {isManager&&<Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:0}}>Team view</h3>
        <Tag label="Prompt content review: disabled by policy" color={T.ink3} bg={T.s3}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:13}}>
        {[["Team adoption",seeded?"64%":"--",T.teal],["Business value",seeded?"$1.2M":"--",AI_GOLD],["Compliance score",seeded?"92%":"--",T.green],["High-risk activity",seeded?"1":"--",T.amber],["Blocked events",seeded?"3":"--",T.red],["Training gap",seeded?"People unit":"--",T.blue]].map(([l,v,c])=><div key={l} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
          <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:7}}>{l}</div>
          <div style={{fontSize:17,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
        </div>)}
      </div>
      <h4 style={{fontSize:12,color:T.ink,margin:"0 0 8px"}}>Model utilization</h4>
      {gatewayProviders.slice(0,5).map(p=><div key={p.id} style={{display:"grid",gridTemplateColumns:"140px 1fr 44px",gap:10,alignItems:"center",marginBottom:7}}>
        <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{p.name}</span>
        <Bar value={seeded?p.routedShare*2:0} color={AI_GOLD}/>
        <span style={{fontSize:9,color:T.ink3,fontFamily:F.m,textAlign:"right"}}>{seeded?p.routedShare+"%":"--"}</span>
      </div>)}
    </Card>}
  </div>;
}


/* ── Decisions: one queue for everything awaiting the executive ────
   Merges executive decisions, pending scale/retire gates and the HITL
   queue. One Decision surface - the HITL engine is embedded, not cloned. */
