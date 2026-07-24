"use client";

import { readBus, pushBus } from "@/lib/bus";
import { Library, Scale, Workflow } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { acInitiatives, acPmo, AC_PHASES, gatewayProviders, gatewayRouting, demoConversations, employeeUsageSeed } from "@/lib/platform-models";
import { T, USER_PROFILES, ROLES, AI_GOLD, AI_GOLD_L, AI_GOLD_B, HITL, F, Tag, Bar, Card, SHead, IDEA_JOURNEY, DEMO_IDEAS, vzDownload } from "./core";

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
    timers.current.push(setTimeout(async()=>{
      /* Live gateway when configured; the simulated reply otherwise. */
      let live=null;
      if(!blocked){
        try{
          const res=await fetch("/api/gateway/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:guard?guard.masked:text})});
          const d=await res.json();
          if(d&&d.enabled&&!d.blocked&&d.text)live=`${d.text}\n\n— Source: ${d.source} · routed via the enterprise gateway${d.masked?" · sensitive data masked at the boundary":""}`;
        }catch{/* gateway unreachable - simulated path continues */}
      }
      const finalReply=live||reply;
      setPhase(null);
      let pos=0;
      const step=()=>{
        pos=Math.min(finalReply.length,pos+3);
        setTyped({convId:base.id,text:finalReply.slice(0,pos)});
        if(pos<finalReply.length)timers.current.push(setTimeout(step,16));
        else timers.current.push(setTimeout(()=>commit(finalReply),140));
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

/* ── V5: My AI Workspace ──────────────────────────────────────────
   The employee's digital workplace. Work first, assistant second:
   the page answers "what do I need to do today?" and every widget
   navigates to the surface that owns the work. Assignments, training
   and evidence requests derive from the initiative lifecycle - the
   AI PMO creates them, nothing is manually tracked. */
const EMPLOYEE_ASSIGNMENTS={
  employee:[{initiativeId:"ai-001",myRole:"Agent champion - business user",deliverable:"Agent feedback pack for pilot cohort"}],
  manager:[{initiativeId:"ai-001",myRole:"Adoption lead - Customer Operations",deliverable:"Adoption plan for 250-agent expansion"},
           {initiativeId:"ai-004",myRole:"People manager sponsor",deliverable:"Team skills-profile review"}],
};
/* Initiative-driven learning: phase + role decide the curriculum. */
const PHASE_TRAINING={
  Governance:["Prompt Injection Defense","ISO 42001 Clause 8","Human Oversight in Practice","Threat Modeling for GenAI"],
  Development:["Secure Prompt Engineering","Evaluation & Test Design"],
  Pilot:["Responsible Rollout","Feedback Capture"],
  Testing:["Evaluation & Test Design","Bias Testing Basics"],
};
const CERTIFICATIONS=[
  {name:"Responsible AI Practitioner",expires:"Dec 2026",status:"Active"},
  {name:"Data Handling Level 2",expires:"Aug 2026",status:"Expiring soon"},
];
export function PageMyWorkspace({role="employee",sessionMode,showToast,setTab,openInitiative}){
  const P=USER_PROFILES[role]||{};
  const R=ROLES[role]||ROLES.employee;
  const assigns=(EMPLOYEE_ASSIGNMENTS[role]||EMPLOYEE_ASSIGNMENTS.employee).map(a=>({...a,ini:acInitiatives.find(i=>i.id===a.initiativeId)})).filter(a=>a.ini);
  const primary=assigns[0];
  const phaseName=i=>AC_PHASES[i.phaseIndex]?.name;
  const training=[...new Set(assigns.flatMap(a=>PHASE_TRAINING[phaseName(a.ini)]||[]))].slice(0,4);
  const pendingEvidence=assigns.filter(a=>a.ini.blockedBy).map(a=>({ini:a.ini,what:a.ini.blockedBy}));
  const nextMilestone=a=>(acPmo[a.ini.id]?.milestones||[]).find(m=>m.status!=="Complete");
  const tasks=[
    ...pendingEvidence.map(p=>({what:`Upload evidence: ${p.what}`,src:`${p.ini.name} \u00b7 ${phaseName(p.ini)}`,go:()=>openInitiative&&openInitiative(p.ini.id),urgent:true})),
    ...(primary?[{what:`Deliverable: ${primary.deliverable}`,src:`${primary.ini.name} \u00b7 due with ${nextMilestone(primary)?.name||"next milestone"}`,go:()=>openInitiative&&openInitiative(primary.ini.id)}]:[]),
    {what:`Complete "${training[0]||"Responsible AI Use"}" training`,src:"Governance Academy \u00b7 assigned from your initiative phase",go:()=>setTab&&setTab("academy")},
    {what:"Acknowledge Responsible GenAI Use policy v6",src:"Policy update \u00b7 requires acknowledgement",go:()=>{pushBus("vz-gw-evidence",{item:`Policy acknowledged: Responsible GenAI Use v6`,initiative:primary?primary.ini.name:"Employee Workspace",scope:"Policy",control:"Policy acknowledgement",risk:"Compliance",owner:P.name||R.name,status:"Complete",approval:"Recorded",version:"v6",time:"Just now"});showToast&&showToast("Policy acknowledged - recorded in your audit trail");}},
  ];
  const convos=demoConversations.slice(0,3);
  const secHead=t=><div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:9}}>{t}</div>;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={`Good day, ${(P.name||R.name||"there").split(" ")[0]}`} sub="My AI Workspace - what needs you today, with AI assisting your work through the Trust Gateway."/>
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)",gap:14,alignItems:"start"}}>
      <div style={{display:"grid",gap:14}}>
        <div>
          {secHead("Today's tasks")}
          <div style={{display:"grid",gap:7}}>
            {tasks.map((t2,i)=><button key={i} onClick={t2.go} style={{display:"flex",gap:10,alignItems:"center",background:t2.urgent?T.amberL:T.s2,border:`1px solid ${t2.urgent?T.amber+"45":T.border}`,borderRadius:9,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:t2.urgent?T.amber:T.green,flexShrink:0}}/>
              <span style={{flex:1,minWidth:0}}>
                <span style={{display:"block",fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{t2.what}</span>
                <span style={{display:"block",fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{t2.src}</span>
              </span>
              <span style={{fontSize:11,color:AI_GOLD,fontWeight:900}}>\u2192</span>
            </button>)}
          </div>
        </div>
        <div>
          {secHead("My AI initiatives")}
          <div style={{display:"grid",gap:9}}>
            {assigns.map(a=>{
              const ms=nextMilestone(a);
              const h=Math.round((a.ini.guardrail+a.ini.adoption+a.ini.valueScore)/3);
              return <button key={a.initiativeId} onClick={()=>openInitiative&&openInitiative(a.ini.id)} style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"13px 15px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.ini.name}</span>
                  <Tag label={`Phase ${a.ini.phaseIndex+1}/13 \u00b7 ${phaseName(a.ini)}`} color={T.blue} bg={T.blue+"14"}/>
                </div>
                <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,lineHeight:1.55,marginBottom:8}}>{a.ini.problem||a.ini.objective}</div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:9.5,color:T.ink3,fontFamily:F.m}}>
                  <span>My role: <strong style={{color:T.ink2}}>{a.myRole}</strong></span>
                  <span>Owner: <strong style={{color:T.ink2}}>{a.ini.businessOwner}</strong></span>
                  <span>Health: <strong style={{color:h>=75?T.green:T.amber}}>{h}</strong></span>
                  <span>Governance: <strong style={{color:T.ink2}}>{a.ini.guardrail}%</strong></span>
                  <span>Risk: <strong style={{color:a.ini.risk==="Critical"||a.ini.risk==="High"?T.red:T.ink2}}>{a.ini.risk}</strong></span>
                  {ms&&<span>Next: <strong style={{color:T.ink2}}>{ms.name} \u00b7 {ms.due}</strong></span>}
                </div>
              </button>;
            })}
          </div>
        </div>
        <div>
          {secHead("My conversations - enterprise knowledge")}
          <div style={{display:"grid",gap:7}}>
            {convos.map(c=><button key={c.id} onClick={()=>setTab&&setTab("workbench")} style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 13px",cursor:"pointer",textAlign:"left"}}>
              <span style={{minWidth:0,flex:1}}>
                <span style={{display:"block",fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</span>
                <span style={{display:"block",fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{c.project} \u00b7 {c.model} \u00b7 {c.classification} \u00b7 {c.lastActivity}</span>
              </span>
              <span style={{fontSize:9.5,color:AI_GOLD,fontWeight:900,fontFamily:F.b,flexShrink:0}}>Continue \u2192</span>
            </button>)}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:15,border:`1px solid ${AI_GOLD}30`}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:9}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:AI_GOLD,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.h,color:T.ink}}>Veris Intelligence</span>
          </div>
          <p style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>
            {primary?`${primary.ini.name} is in ${phaseName(primary.ini)}${primary.ini.blockedBy?" and blocked on evidence - your upload is the fastest unblock":""}. Your "${training[0]||"Responsible AI Use"}" training was assigned because of this phase and your role.`:"No initiative assignments yet - your governed workbench is ready."}
          </p>
        </Card>
        <Card style={{padding:15}}>
          {secHead("My governance training")}
          {training.map(t2=><div key={t2} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{t2}</span>
            <button onClick={()=>setTab&&setTab("academy")} style={{background:"transparent",border:"none",color:AI_GOLD,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Start \u2192</button>
          </div>)}
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:8,lineHeight:1.5}}>Auto-assigned from {primary?`${primary.ini.name} \u00b7 ${phaseName(primary.ini)} phase \u00b7 your role`:"your role"}. No manual assignment.</div>
        </Card>
        <Card style={{padding:15}}>
          {secHead("My certifications")}
          {CERTIFICATIONS.map(c=><div key={c.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{c.name}</span>
            <Tag label={`${c.status} \u00b7 ${c.expires}`} color={c.status==="Active"?T.green:T.amber} bg={(c.status==="Active"?T.green:T.amber)+"14"}/>
          </div>)}
        </Card>
        <Card style={{padding:15}}>
          {secHead("Recent activity")}
          {[`${employeeUsageSeed.prompts} governed prompts \u00b7 ${employeeUsageSeed.timeSavedHrs}h saved`,`${employeeUsageSeed.blocked} prompts blocked by the Trust Gateway`,`Knowledge reuse ${employeeUsageSeed.knowledgeReuse}% \u00b7 learning ${employeeUsageSeed.learningProgress}%`].map((a,i)=><div key={i} style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>\u00b7 {a}</div>)}
          <button onClick={()=>setTab&&setTab("aiusage")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open my AI dashboard \u2192</button>
        </Card>
      </div>
    </div>
  </div>;
}

/* ── V5: Team AI Workspace (managers) ───────────────────────────── */
export function PageTeamWorkspace({role="manager",sessionMode,showToast,setTab,openInitiative}){
  const P=USER_PROFILES[role]||{};
  const assigns=(EMPLOYEE_ASSIGNMENTS.manager).map(a=>({...a,ini:acInitiatives.find(i=>i.id===a.initiativeId)})).filter(a=>a.ini);
  const team=[
    {name:"Jamie Park",role:"Agent champion",training:82,certs:"2 active",evidence:1,ready:true},
    {name:"Sam Osei",role:"Senior agent",training:64,certs:"1 active",evidence:0,ready:true},
    {name:"Lena Fischer",role:"Team coach",training:41,certs:"1 expiring",evidence:2,ready:false},
    {name:"Marco Silva",role:"Quality analyst",training:23,certs:"none",evidence:0,ready:false},
  ];
  const avgTraining=Math.round(team.reduce((a,m)=>a+m.training,0)/team.length);
  const pendingEvidence=team.reduce((a,m)=>a+m.evidence,0);
  const overdue=team.filter(m=>m.training<50);
  const secHead=t=><div style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:9}}>{t}</div>;
  const act=(what,detail)=>{
    pushBus("vz-gw-evidence",{item:what,initiative:assigns[0]?.ini.name||"Team",scope:"Team",control:"Manager action",risk:"Readiness",owner:P.name||"Manager",status:"Complete",approval:"Recorded",version:"v1",time:"Just now"});
    showToast&&showToast(detail);
  };
  const readinessReport=()=>{
    const L=["# Team AI Readiness Report","",`Average training completion: ${avgTraining}%`,`Pending evidence uploads: ${pendingEvidence}`,`Members below 50% training: ${overdue.map(m=>m.name).join(", ")||"none"}`,"",
      "## Team",...team.map(m=>`- ${m.name} (${m.role}): training ${m.training}%, certifications ${m.certs}, pending evidence ${m.evidence}`),"",
      "## Initiatives",...assigns.map(a=>`- ${a.ini.name}: phase ${a.ini.phaseIndex+1}/13, adoption ${a.ini.adoption}%, ${a.ini.blockedBy?"BLOCKED: "+a.ini.blockedBy:"no blockers"}`)];
    vzDownload("team-readiness-report.md",L.join("\n"));
    act("Team readiness report generated","Readiness report downloaded - recorded in the audit trail");
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Team AI Workspace" sub="Team readiness, governed adoption and capacity - aggregates only, private prompts stay private by policy."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:14}}>
      {[["Team readiness",`${avgTraining}%`,avgTraining>=70?T.green:T.amber,()=>setTab&&setTab("academy")],
        ["Pending evidence",pendingEvidence,pendingEvidence?T.amber:T.green,()=>assigns[0]&&openInitiative&&openInitiative(assigns[0].ini.id)],
        ["Overdue training",overdue.length,overdue.length?T.red:T.green,()=>setTab&&setTab("academy")],
        ["Open team risks","2",T.amber,()=>setTab&&setTab("riskcenter")]].map(([l,v,c,go])=><Card key={l} onClick={go} style={{padding:"13px 14px",cursor:"pointer"}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{l}</div>
        <div style={{fontSize:22,fontWeight:800,fontFamily:F.m,color:c}}>{v}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)",gap:14,alignItems:"start"}}>
      <div style={{display:"grid",gap:14}}>
        <Card style={{padding:16}}>
          {secHead("Team readiness")}
          <div style={{display:"grid",gap:9}}>
            {team.map(m=><div key={m.name} style={{display:"grid",gridTemplateColumns:"1.2fr 1.6fr auto",gap:12,alignItems:"center"}}>
              <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{m.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{m.role} \u00b7 {m.certs}{m.evidence?` \u00b7 ${m.evidence} evidence pending`:""}</div></div>
              <div><Bar value={m.training} color={m.training>=70?T.green:m.training>=45?T.amber:T.red}/><div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:3}}>training {m.training}%</div></div>
              {m.ready?<Tag label="Ready" color={T.green} bg={T.greenL}/>:<button onClick={()=>act(`Learning path assigned to ${m.name}`,`Learning path assigned to ${m.name} - completion will lift team readiness`)} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Assign learning</button>}
            </div>)}
          </div>
          <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
            <button onClick={()=>act("Overdue training escalated","Overdue training escalated to the members and their initiative owners")} style={{background:T.amber+"16",border:`1px solid ${T.amber}45`,borderRadius:7,padding:"7px 12px",color:T.amber,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Escalate overdue training</button>
            <button onClick={readinessReport} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 12px",color:T.ink2,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Generate readiness report \u2193</button>
          </div>
        </Card>
        <div>
          {secHead("Current initiatives")}
          <div style={{display:"grid",gap:9}}>
            {assigns.map(a=><button key={a.initiativeId} onClick={()=>openInitiative&&openInitiative(a.ini.id)} style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 15px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.ini.name}</span>
                <Tag label={`Adoption ${a.ini.adoption}%`} color={a.ini.adoption>=60?T.green:T.amber} bg={(a.ini.adoption>=60?T.green:T.amber)+"14"}/>
              </div>
              <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{a.myRole} \u00b7 phase {a.ini.phaseIndex+1}/13{a.ini.blockedBy?` \u00b7 blocked: ${a.ini.blockedBy}`:""}</div>
            </button>)}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:15,border:`1px solid ${AI_GOLD}30`}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:9}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:AI_GOLD,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.h,color:T.ink}}>Veris Intelligence</span>
          </div>
          <p style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>Team readiness is {avgTraining}%. {overdue.length?`${overdue.map(m=>m.name.split(" ")[0]).join(" and ")} are below 50% training - assigning the governance path now protects the ${assigns[0]?.ini.name} expansion.`:"All members are on track."} Policy compliance is aggregate-only: private prompts stay private.</p>
        </Card>
        <Card style={{padding:15}}>
          {secHead("Capacity")}
          {(acPmo[assigns[0]?.initiativeId]?.resources||[]).map(r=><div key={r.role} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{r.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{r.role}</div></div>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD}}>{r.allocation}</span>
          </div>)}
        </Card>
        <Card style={{padding:15}}>
          {secHead("Policy compliance")}
          {[["Compliance rate","92%",T.green],["Blocked events","3",T.amber],["Gateway coverage","100%",T.green]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{l}</span><span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:c}}>{v}</span>
          </div>)}
          <button onClick={()=>setTab&&setTab("aiusage")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Open team dashboard \u2192</button>
        </Card>
      </div>
    </div>
  </div>;
}
