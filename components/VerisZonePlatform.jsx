"use client";

import { Scale, Settings } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { T, DARK_T, LIGHT_T, RC, CSS, ROLES, EXECUTIVE_ROLE_IDS, USER_PROFILES, NAV, CAIO_EXTRA_NAV, PLATFORM_NAV_SECTIONS, OWNER_SURFACE, EMPLOYEE_NAV_SECTIONS, AI_CENTRAL_NAV, AC_LEGACY_VIEWS, acAccessFor, AI_GOLD, HITL, F, cleanText, Glyph, Tag, Card, SHead, Toast, BrandLogo, SIDEBAR_W, LOGIN_PROFILES, SEEDED_DEMO_TABS } from "./platform/core";
import { ExecAssistant } from "./platform/advisor";
import { PageHome, PageOnboard, PageOpportunityIntake, PageStrategy, PageHITL, PageRoadmap, PageDecisions } from "./platform/dashboard";
import { PagePlaybook } from "./platform/playbook";
import { PageComplianceStandards } from "./platform/compliance";
import { PageRiskCenter } from "./platform/riskcenter";
import { PageReports } from "./platform/reports";
import { PageGovernanceAcademy } from "./platform/academy";
import { PageModelRegistry, PageMaturityRadar, PageUseCases, PageIntegrations, PageAICentral } from "./platform/aicentral";
import { PageWorkbench, PageMyIdeas, PageAIUsage } from "./platform/workbench";

function LoginAICentralBrand({theme,width=104,style={}}) {
  const isLight=theme==="light";
  const glow=isLight?"rgba(37,99,235,.22)":"rgba(43,132,255,.42)";
  const titleColor=isLight?"#0B2F75":"#EAF2FF";
  const taglineColor=isLight?T.blue:AI_GOLD;
  return <div style={{display:"inline-flex",alignItems:"center",gap:16,...style}}>
    <div className="ai-login-mark" style={{width:width*1.28,height:width,position:"relative",flexShrink:0}}>
      <svg viewBox="0 0 154 120" width={width*1.28} height={width} role="img" aria-label="AI Central pilot-to-scale orchestration animation" style={{display:"block",overflow:"visible",filter:`drop-shadow(0 18px 34px ${glow})`}}>
        <defs>
          <radialGradient id="aiLoginCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="38%" stopColor="#DDF4FF"/>
            <stop offset="72%" stopColor="#2B84FF"/>
            <stop offset="100%" stopColor="#0B4EA2"/>
          </radialGradient>
          <linearGradient id="aiLoginBlue" x1="0" x2="1">
            <stop stopColor="#38BDF8"/>
            <stop offset="1" stopColor="#0B4EA2"/>
          </linearGradient>
          <linearGradient id="aiLoginGold" x1="0" x2="1">
            <stop stopColor="#F6D782"/>
            <stop offset="1" stopColor="#C99A2E"/>
          </linearGradient>
          <linearGradient id="aiLoginNebula" x1="0" x2="1">
            <stop stopColor="#2563EB" stopOpacity=".05"/>
            <stop offset=".48" stopColor="#38BDF8" stopOpacity=".42"/>
            <stop offset="1" stopColor="#D6A84F" stopOpacity=".06"/>
          </linearGradient>
        </defs>
        <rect x="8" y="10" width="138" height="100" rx="26" fill={isLight?"#F8FBFF":"#0B101D"} opacity=".94"/>
        <path d="M17 73 C42 17 114 17 138 73" fill="none" stroke="url(#aiLoginNebula)" strokeWidth="16" strokeLinecap="round" opacity=".9"/>
        <path d="M18 76 C42 34 112 34 137 76" fill="none" stroke="url(#aiLoginBlue)" strokeWidth="2.4" strokeDasharray="10 12" strokeLinecap="round" style={{animation:"aiLoginMilkyway 7.2s linear infinite"}}/>
        <path d="M25 51 C48 92 105 92 130 51" fill="none" stroke="url(#aiLoginGold)" strokeWidth="2.4" strokeDasharray="8 12" strokeLinecap="round" style={{animation:"aiLoginMilkyway 8s linear infinite reverse"}}/>
        <g style={{transformOrigin:"77px 60px",animation:"aiLoginGalaxy 16s linear infinite"}}>
          <circle cx="35" cy="68" r="3.2" fill="#2B84FF" opacity=".88"/>
          <circle cx="51" cy="38" r="2.4" fill="#38BDF8" opacity=".72"/>
          <circle cx="101" cy="37" r="2.8" fill="#D6A84F" opacity=".84"/>
          <circle cx="121" cy="71" r="3.4" fill="#C99A2E" opacity=".74"/>
          <circle cx="77" cy="24" r="2.2" fill="#EAF2FF" opacity=".58"/>
          <circle cx="77" cy="96" r="2.2" fill="#EAF2FF" opacity=".42"/>
        </g>
        <g style={{transformOrigin:"77px 60px",animation:"aiLoginSpine 3.4s ease-in-out infinite"}}>
          <rect x="74" y="22" width="6" height="76" rx="3" fill="url(#aiLoginBlue)" opacity=".74"/>
          <circle cx="77" cy="32" r="4" fill="url(#aiLoginGold)"/>
          <circle cx="77" cy="46" r="4" fill="#38BDF8"/>
          <circle cx="77" cy="74" r="4" fill="#38BDF8"/>
          <circle cx="77" cy="88" r="4" fill="url(#aiLoginGold)"/>
        </g>
        <path d="M23 60 C39 55 51 57 60 60" stroke="url(#aiLoginBlue)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M94 60 C106 57 118 55 133 60" stroke="url(#aiLoginGold)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="60" r="6" fill="#2B84FF" style={{transformOrigin:"24px 60px",animation:"aiLoginNode 3.2s ease-in-out infinite"}}/>
        <circle cx="132" cy="60" r="6" fill="#D6A84F" style={{transformOrigin:"132px 60px",animation:"aiLoginNode 3.2s ease-in-out .55s infinite"}}/>
        <circle cx="77" cy="60" r="18" fill={isLight?"#FFFFFF":"#111827"} stroke="#BFD7FF" strokeWidth="1.5" opacity=".96"/>
        <circle cx="77" cy="60" r="11" fill="url(#aiLoginCore)" style={{transformOrigin:"77px 60px",animation:"aiLoginCore 3s ease-in-out infinite"}}/>
        <circle cx="77" cy="60" r="4" fill="#FFFFFF"/>
        <circle cx="48" cy="58" r="3" fill="#38BDF8" style={{animation:"aiLoginConvergeA 3.6s ease-in-out infinite"}}/>
        <circle cx="108" cy="62" r="3" fill="#D6A84F" style={{animation:"aiLoginConvergeB 4s ease-in-out .4s infinite"}}/>
        <g style={{animation:"aiLoginDecision 3.8s ease-in-out infinite"}}>
          <path d="M112 34 H128 V50" fill="none" stroke="url(#aiLoginGold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M126 34 L134 34 L134 42" fill="none" stroke="url(#aiLoginGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    </div>
    <div style={{minWidth:0}}>
      <div style={{fontSize:30,fontWeight:900,fontFamily:F.h,color:titleColor,lineHeight:1,letterSpacing:0,animation:"aiLoginTitle 4.6s ease-in-out infinite",textShadow:isLight?"none":"0 0 18px rgba(43,132,255,.32)"}}>AI Central</div>
      <div style={{fontSize:11,fontWeight:900,fontFamily:F.b,color:taglineColor,letterSpacing:"0.12em",marginTop:8,textTransform:"uppercase",animation:"aiLoginTagline 4.6s ease-in-out infinite"}}>One Intelligence, One Direction.</div>
    </div>
  </div>;
}

function Sidebar({tab,setTab,role,hitlCount,open,onClose,aiCentralView,setAiCentralView,theme,profiles,sessionMode}) {
  const rc=RC(role), R=ROLES[role];
  const profileKey=sessionMode==="demo"?"demo":sessionMode==="aicentral"?"aicentral":role;
  const U=profiles?.[profileKey]||USER_PROFILES[profileKey]||R;
  const initials=(U.name||R.name).split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const isMobile=typeof window!=="undefined"&&window.innerWidth<768;
  const isAICentral=tab==="aicentral";
  const acOnly=sessionMode==="aicentral";
  const navById=Object.fromEntries([...NAV,...CAIO_EXTRA_NAV].map(item=>[item.id,item]));
  const roleNavSections=(role==="employee"||role==="manager")?EMPLOYEE_NAV_SECTIONS:PLATFORM_NAV_SECTIONS;
  const themeClass=theme==="light"?"vz-light":"vz-dark";
  const spring={type:"spring",stiffness:420,damping:38};
  let navIdx=0;
  const renderNavButton=(item)=>{
    const isA=tab===item.id||OWNER_SURFACE[tab]===item.id;
    const badge=item.id==="home"&&hitlCount>0;
    const delay=Math.min(navIdx++*0.018,0.28);
    return <button key={item.id} className={`vz-nav-btn ${themeClass}`} onClick={()=>{setTab(item.id);if(isMobile)onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,marginBottom:2,background:"transparent",border:"1px solid transparent",color:isA?rc:T.ink2,fontSize:11,fontWeight:isA?800:600,fontFamily:F.b,textAlign:"left",position:"relative",cursor:"pointer",animation:"vzNavIn .3s ease both",animationDelay:`${delay}s`}}>
      {isA&&<motion.span layoutId="vzNavActive" transition={spring} style={{position:"absolute",inset:0,borderRadius:9,background:theme==="light"?T.blueL:`linear-gradient(90deg,${rc}20,${rc}09 62%,transparent)`,border:`1px solid ${theme==="light"?T.blue+"30":rc+"38"}`,boxShadow:theme==="light"?"none":`inset 0 0 20px ${rc}0D`}}/>}
      {isA&&<motion.span layoutId="vzNavRail" transition={spring} style={{position:"absolute",left:0,top:7,bottom:7,width:3,borderRadius:4,background:`linear-gradient(180deg,${rc},${AI_GOLD})`,boxShadow:`0 0 12px ${rc}66`}}/>}
      <span className="vz-nav-ico" style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",opacity:isA?1:.72,flexShrink:0,position:"relative",zIndex:1,transition:"opacity .18s ease"}}><Glyph name={item.label} color={isA?rc:T.ink3} size={14}/></span>
      <span style={{position:"relative",zIndex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span>
      {badge&&<span style={{position:"absolute",right:8,zIndex:1,background:T.amber,color:"#000",fontSize:8,fontWeight:800,borderRadius:8,padding:"1px 4px",fontFamily:F.m,animation:"vzBadgePulse 2.4s ease-in-out infinite"}}>{hitlCount}</span>}
    </button>;
  };
  const renderSectionHeader=(title)=>(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"14px 10px 7px"}}>
      <span style={{fontSize:9,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:F.m,whiteSpace:"nowrap"}}>{title}</span>
      <span aria-hidden style={{flex:1,height:1,background:`linear-gradient(90deg,${T.border},transparent)`}}/>
    </div>
  );
  return <>
    {/* Overlay on mobile */}
    {open&&isMobile&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:199,backdropFilter:"blur(2px)"}}/>}
    <div style={{width:SIDEBAR_W,background:theme==="light"?"#FFFFFF":`linear-gradient(180deg,${T.s1} 0%,#0B0E15 100%)`,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:200,transform:isMobile?(open?"translateX(0)":"translateX(-100%)"):"translateX(0)",transition:"transform .25s ease",overflowX:"hidden",boxShadow:theme==="light"?"12px 0 34px rgba(17,24,39,.06)":"14px 0 40px rgba(0,0,0,.35)"}}>
      <div style={{padding:"14px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9,minHeight:64}}>
        <BrandLogo theme={theme} width={168} style={{objectPosition:"left center"}}/>
        {isMobile&&<button aria-label="Close navigation" onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:T.ink3,padding:6,cursor:"pointer",display:"flex"}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>}
      </div>
      <nav className="vz-side-nav" style={{flex:1,padding:"10px 9px",overflowY:"auto"}}>
        {!acOnly&&roleNavSections.map(section=>{
          const items=section.items.map(id=>navById[id]).filter(Boolean);
          return <div key={section.title} style={{marginBottom:4}}>
            {renderSectionHeader(section.title)}
            {items.map(renderNavButton)}
          </div>;
        })}
        {isAICentral&&<div style={{padding:"6px 8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:10,marginTop:acOnly?0:8}}>
          <div style={{fontSize:10,fontWeight:900,fontFamily:F.m,color:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>AI Central</div>
          <div style={{fontSize:10,color:T.ink3,lineHeight:1.5,fontFamily:F.b}}>Enterprise control plane where AI initiatives are planned, governed, monitored and decided to scale or retire.</div>
        </div>}
        {isAICentral&&AI_CENTRAL_NAV.filter(item=>acAccessFor(role).modules.includes(item.id)).map((item,idx)=>{
          const isA=aiCentralView===item.id;
          return <button key={item.id} className={`vz-nav-btn ${themeClass}`} onClick={()=>{setAiCentralView(item.id);if(isMobile)onClose();}} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:9,padding:"9px 10px",borderRadius:9,marginBottom:3,background:"transparent",border:"1px solid transparent",color:isA?AI_GOLD:T.ink3,fontSize:11,fontWeight:isA?700:500,fontFamily:F.b,textAlign:"left",position:"relative",cursor:"pointer",animation:"vzNavIn .3s ease both",animationDelay:`${Math.min(idx*0.025,0.28)}s`}}>
            {isA&&<motion.span layoutId="vzNavActive" transition={spring} style={{position:"absolute",inset:0,borderRadius:9,background:`linear-gradient(90deg,${AI_GOLD}20,${AI_GOLD}09 62%,transparent)`,border:`1px solid ${AI_GOLD}42`,boxShadow:`inset 0 0 20px ${AI_GOLD}0D`}}/>}
            {isA&&<motion.span layoutId="vzNavRail" transition={spring} style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:4,background:AI_GOLD,boxShadow:`0 0 12px ${AI_GOLD}66`}}/>}
            <span style={{width:18,height:18,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:isA?AI_GOLD+"24":T.s2,color:isA?AI_GOLD:T.ink4,fontSize:9,fontWeight:900,fontFamily:F.m,flexShrink:0,position:"relative",zIndex:1}}>{idx+1}</span>
            <span style={{minWidth:0,position:"relative",zIndex:1}}><span style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span><span style={{display:"block",fontSize:9,color:T.ink4,fontWeight:500,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.sub}</span></span>
          </button>;
        })}
      </nav>
      <a href="/profile" className={`vz-profile-btn ${themeClass}`} onClick={(e)=>{e.preventDefault();setTab("profile");if(isMobile)onClose();}} style={{cursor:"pointer",width:"100%",padding:"13px 14px",border:0,borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,background:"transparent",textAlign:"left",textDecoration:"none"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${rc},${theme==="light"?T.blue:AI_GOLD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 12px 28px ${rc}30`}}>
          <span style={{color:"#fff",fontSize:11,fontWeight:900,fontFamily:F.b,letterSpacing:0}}>{initials}</span>
        </div>
        <span style={{position:"absolute",right:-1,bottom:-1,width:9,height:9,borderRadius:"50%",background:T.green,border:`2px solid ${theme==="light"?"#FFFFFF":T.bg}`}}/>
      </div>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{fontSize:12,fontWeight:900,color:T.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:F.b}}>{cleanText(U.name||R.name)}</div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cleanText(U.email||`${R.label} Workspace`)}</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,color:T.ink4}}><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
    </div>
  </>;
}

/* Section */
function BrandEntryShell({theme,onTheme,onEnter}) {
  Object.assign(T, theme==="light"?LIGHT_T:DARK_T);
  const [selected,setSelected]=useState("demo");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("govern-with-certainty");
  const [loginError,setLoginError]=useState("");
  const profile=LOGIN_PROFILES.find(p=>p.id===selected)||LOGIN_PROFILES[0];
  useEffect(()=>{
    setEmail(profile.email);
    setPassword("govern-with-certainty");
    setLoginError("");
  },[profile.email]);
  const canEnter=()=>{
    const valid=email.trim().toLowerCase()===profile.email.toLowerCase()&&password==="govern-with-certainty";
    if(!valid)setLoginError(`Use ${profile.email} and the demo password for ${profile.label}.`);
    return valid;
  };
  const enterProfile=e=>{
    e?.preventDefault?.();
    if(!canEnter())return;
    onEnter(profile);
  };
  const enterProfileLink=e=>{
    e?.preventDefault?.();
    if(!canEnter())return;
    onEnter(profile);
  };
  const demoProfile=LOGIN_PROFILES.find(p=>p.id==="demo")||LOGIN_PROFILES[0];
  const executiveProfiles=LOGIN_PROFILES.filter(p=>EXECUTIVE_ROLE_IDS.includes(p.role));
  const governanceProfiles=LOGIN_PROFILES.filter(p=>!["demo","aicentral","employee","manager"].includes(p.id)&&!EXECUTIVE_ROLE_IDS.includes(p.role));
  const employeeProfiles=LOGIN_PROFILES.filter(p=>["employee","manager"].includes(p.id));
  const aiCentralProfile=LOGIN_PROFILES.find(p=>p.id==="aicentral");
  const enterDemoLink=()=>onEnter(demoProfile);
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 12px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
  return <div style={{minHeight:"100vh",background:theme==="light"?`linear-gradient(135deg, #F7F8FA, #FFFFFF 54%, #F3F6FB)`:`radial-gradient(circle at 20% 10%, ${profile.accent}18, transparent 30%), linear-gradient(135deg, ${T.bg}, ${T.s1})`,color:T.ink,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,420px),1fr))",gap:0,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:theme==="light"?.45:1}}>
      <div style={{position:"absolute",width:560,height:560,borderRadius:"50%",border:`1px solid ${profile.accent}22`,left:"8%",top:"10%",animation:"vzOrbit 38s linear infinite"}}/>
      <div style={{position:"absolute",width:370,height:370,borderRadius:"50%",border:`1px solid ${T.border}`,left:"15%",top:"20%",animation:"vzOrbit 26s linear infinite reverse"}}/>
      <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:profile.accent,boxShadow:`0 0 44px ${profile.accent}`,left:"36%",top:"17%",animation:"vzDrift 6s ease-in-out infinite"}}/>
      {theme==="dark"&&<div style={{position:"absolute",width:"80%",height:180,background:`linear-gradient(90deg, transparent, ${profile.accent}18, transparent)`,left:"10%",top:"44%",filter:"blur(18px)",animation:"vzSweep 8s ease-in-out infinite"}}/>}
    </div>
    <div style={{padding:"clamp(28px,5vh,52px) clamp(24px,5vw,72px) 28px",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"100vh",position:"relative",zIndex:1}}>
      <div>
        <button type="button" onClick={enterProfile} style={{display:"inline-flex",alignItems:"center",gap:8,border:`1px solid ${T.border}`,background:T.s2,borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800,fontFamily:F.b,color:T.ink3,marginBottom:10,cursor:"pointer"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:profile.accent,boxShadow:`0 0 18px ${profile.accent}`}}/>
          {profile.label} access profile
        </button>
        <div style={{fontSize:"clamp(28px,3.3vw,38px)",fontWeight:900,fontFamily:F.h,color:T.ink,letterSpacing:"-0.01em",lineHeight:1.1,margin:"0 0 10px",maxWidth:720}}>{profile.title}</div>
        <p style={{fontSize:13,lineHeight:1.6,color:T.ink3,fontFamily:F.b,maxWidth:760,margin:"0 0 14px"}}>{profile.subtitle}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,maxWidth:760,marginBottom:16}}>
          {profile.kpis.map(([v,l,s])=><div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",boxShadow:T.shadow}}>
            <div style={{fontSize:24,fontWeight:900,fontFamily:F.h,color:T.ink,marginBottom:3}}>{v}</div>
            <div style={{fontSize:11,fontWeight:800,fontFamily:F.b,color:T.ink2,marginBottom:5}}>{l}</div>
            <div style={{fontSize:10,fontFamily:F.m,color:profile.accent}}>{s}</div>
          </div>)}
        </div>
        <div style={{maxWidth:760,margin:"0 0 12px",padding:"14px 18px",background:theme==="light"?"rgba(255,255,255,.86)":`linear-gradient(145deg, ${T.card}, ${T.s1})`,border:`1px solid ${theme==="light"?T.border:AI_GOLD+"30"}`,borderRadius:16,boxShadow:T.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap",marginBottom:13}}>
            <div style={{animation:"loginBrandRise .75s cubic-bezier(.2,.8,.2,1) both, loginBrandFloat 5.8s ease-in-out 1s infinite, loginBrandBreathe 4.2s ease-in-out 1s infinite"}}>
              <LoginAICentralBrand theme={theme} width={theme==="light"?90:102} style={{flexShrink:0}}/>
            </div>
            <div style={{minWidth:240,flex:"1 1 360px"}}>
              <div style={{fontSize:10,fontWeight:900,fontFamily:F.m,color:theme==="light"?T.blue:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:7,animation:"loginTaglineReveal .7s ease .2s both, loginTextBreathe 4.8s ease-in-out 1.1s infinite"}}>AI Central orchestration layer</div>
              <p style={{fontSize:12,lineHeight:1.55,color:T.ink3,fontFamily:F.b,margin:0,animation:"loginBrandRise .7s cubic-bezier(.2,.8,.2,1) .12s both, loginTextBreathe 5.6s ease-in-out 1.4s infinite"}}>Scattered pilots, controls, approvals, evidence, and risks converge into one governed operating stream.</p>
            </div>
          </div>
          <div style={{height:1,background:`linear-gradient(90deg, ${AI_GOLD}50, ${T.border}, transparent)`,marginBottom:13}}/>
          <div style={{fontSize:11,fontWeight:900,fontFamily:F.b,color:theme==="light"?T.blue:AI_GOLD,textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:8}}>Enterprise AI Transformation Control Plane</div>
          <h1 style={{fontSize:"clamp(30px,3.9vw,48px)",lineHeight:1.04,letterSpacing:0,fontWeight:400,fontFamily:F.e,margin:"0 0 10px",maxWidth:760}}>Pilot AI safely. Scale only when evidence says yes.</h1>
          <p style={{fontSize:14,lineHeight:1.7,color:T.ink2,fontFamily:F.b,maxWidth:720,margin:0}}>VerisZone lets CXOs plan AI department by department, then hands execution to AI Central where AI Spine monitors risk drift, value, adoption, controls, evidence, and scale readiness.</p>
        </div>
        <div style={{maxWidth:760,margin:"0 0 12px"}}>
          <div style={{fontSize:10,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.14em",margin:"0 0 8px"}}>Platform capabilities</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
            {[
              ["CXO Platform","Strategy, budget, ownership and scale intent"],
              ["AI Central","Pilot execution, guardrails and assurance"],
              ["AI Spine","Risk drift, evidence confidence and scale gates"]
            ].map(([title,body],idx)=><div key={title} style={{background:theme==="light"?"rgba(255,255,255,.78)":T.card,border:`1px solid ${idx===0?AI_GOLD+"45":T.border}`,borderRadius:12,padding:"11px 13px",boxShadow:T.shadow}}>
              <div style={{fontSize:12,fontWeight:900,fontFamily:F.b,color:idx===0?AI_GOLD:T.ink,marginBottom:5}}>{title}</div>
              <div style={{fontSize:11,lineHeight:1.55,fontFamily:F.b,color:T.ink3}}>{body}</div>
            </div>)}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:11,color:T.ink4,fontFamily:F.b}}>
        <span>EU AI Act</span><span>ISO 42001</span><span>GDPR</span><span>NIST AI RMF</span><span>Evidence-ready audit trail</span>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"32px clamp(20px,4vw,60px)",borderLeft:`1px solid ${T.border}`,background:theme==="light"?"#FFFFFF":`linear-gradient(180deg, ${T.s1}F2, ${T.bg}F8)`,position:"relative",zIndex:1}}>
      <form onSubmit={enterProfile} style={{width:"100%",maxWidth:420,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"22px 24px",boxShadow:T.shadow,pointerEvents:"auto"}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",minHeight:theme==="light"?96:104,marginBottom:16}}>
          <div style={{animation:"loginBrandRise .8s cubic-bezier(.2,.8,.2,1) both, loginBrandFloat 6.4s ease-in-out 1.1s infinite, loginBrandBreathe 4.6s ease-in-out 1s infinite"}}>
            <BrandLogo theme={theme} width={200} style={{width:"min(200px,62vw)",margin:"0 auto",animation:"loginMarkGlow 5.2s ease-in-out 1.2s infinite"}}/>
          </div>
          <button type="button" onClick={onTheme} style={{position:"absolute",top:0,right:0,background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"7px 11px",color:T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{theme==="dark"?"Light":"Dark"}</button>
        </div>
        <div style={{fontSize:24,fontWeight:400,fontFamily:F.e,marginBottom:6}}>Secure control-plane sign in</div>
        <div style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.6,marginBottom:13}}>Use Demo Center for seeded sales storytelling. Subscribed CXO and AI Central workspaces open clean, ready for customer-owned data.</div>
        <div style={{display:"grid",gap:9,marginBottom:13}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{fontSize:10,fontWeight:900,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",color:T.ink4}}>Workspace</span>
            <select aria-label="Workspace" value={selected} onChange={e=>setSelected(e.target.value)} style={{...fieldStyle,appearance:"auto",cursor:"pointer"}}>
              <optgroup label="Sales showcase">
                <option value={demoProfile.id}>{demoProfile.label} - Full platform demo</option>
              </optgroup>
              <optgroup label="Executive workspaces">
                {executiveProfiles.map(p=><option key={p.id} value={p.id}>{p.label} - {ROLES[p.role]?.title||p.title}</option>)}
              </optgroup>
              <optgroup label="Governance workspaces">
                {governanceProfiles.map(p=><option key={p.id} value={p.id}>{p.label} - {ROLES[p.role]?.title||p.title}</option>)}
              </optgroup>
              <optgroup label="Employee workspace">
                {employeeProfiles.map(p=><option key={p.id} value={p.id}>{p.label} - {ROLES[p.role]?.title||p.title}</option>)}
              </optgroup>
              {aiCentralProfile&&<optgroup label="Execution and assurance">
                <option value={aiCentralProfile.id}>{aiCentralProfile.label} - Standalone command center</option>
              </optgroup>}
            </select>
          </label>
          <input aria-label="Email" value={email} onChange={e=>{setEmail(e.target.value);setLoginError("");}} style={fieldStyle}/>
          <input aria-label="Password" type="password" value={password} onChange={e=>{setPassword(e.target.value);setLoginError("");}} style={fieldStyle}/>
        </div>
        {loginError&&<div style={{fontSize:11,lineHeight:1.5,color:T.red,fontFamily:F.b,margin:"-6px 0 12px"}}>{loginError}</div>}
        <a href={`#workspace-${profile.id}`} onClick={enterProfileLink} style={{display:"block",textDecoration:"none",textAlign:"center",width:"100%",background:theme==="light"?T.blue:`linear-gradient(135deg,${profile.accent},${AI_GOLD})`,color:"#fff",border:"none",borderRadius:9,padding:"12px 14px",fontSize:13,fontWeight:900,fontFamily:F.b,boxShadow:theme==="light"?"0 10px 24px rgba(11,78,162,.18)":`0 18px 44px ${profile.accent}25`,marginBottom:10,cursor:"pointer"}}>Enter {profile.label} Workspace</a>
        {selected!=="demo"&&<a href="#workspace-demo" onClick={enterDemoLink} style={{display:"block",textDecoration:"none",textAlign:"center",width:"100%",background:T.s2,color:theme==="light"?T.blue:AI_GOLD,border:`1px solid ${theme==="light"?T.blue+"45":AI_GOLD+"55"}`,borderRadius:9,padding:"11px 14px",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open Demo Center</a>}
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"grid",gap:7,fontSize:11,color:T.ink3,fontFamily:F.b}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>SSO</span><strong style={{color:T.green}}>Ready</strong></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Evidence retention</span><strong style={{color:T.ink}}>7 years</strong></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Region</span><strong style={{color:T.ink}}>EU / US</strong></div>
        </div>
      </form>
    </div>
  </div>;
}


function ProfileInput({label,value,type="text",onChange}) {
  return <label style={{display:"grid",gap:6,fontFamily:F.b}}>
    <span style={{fontSize:10,fontWeight:900,color:T.ink3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",color:T.ink,fontFamily:F.b,fontSize:12,outline:"none"}} />
  </label>;
}

/* ── Employee Workspace: AI Workbench ─────────────────────────────
   The employee-facing surface of the Enterprise AI Gateway. Consumes the
   same canonical gateway objects the AI Central module monitors and the
   admin tabs configure. Demo Center is seeded; real tenants start clean. */

function PageProfile({role,sessionMode,profiles,setProfiles,showToast,onSignOut}) {
  const [selected,setSelected]=useState(sessionMode==="demo"?"demo":role);
  useEffect(()=>setSelected(sessionMode==="demo"?"demo":role),[role,sessionMode]);
  const profile=profiles[selected]||USER_PROFILES[selected];
  const profileOptions=[{id:"demo",label:"Demo Center",name:"Demo Center",title:"Sales Demo Workspace"},...Object.values(ROLES)];
  const selectedRole=profileOptions.find(item=>item.id===selected)||ROLES.caio;
  const update=(field,value)=>setProfiles(prev=>({...prev,[selected]:{...(prev[selected]||USER_PROFILES[selected]),[field]:value}}));
  const saveProfiles=()=>{
    if(typeof window!=="undefined")window.localStorage.setItem("veriszone.userProfiles",JSON.stringify(profiles));
    showToast(`${selectedRole.label} profile saved`);
  };
  const fields=[
    ["name","User name"],["email","Email address"],["password","Password","password"],["title","Title"],["department","Department"],["organization","Organization"],["phone","Phone"],["region","Region"],["timezone","Timezone"],["manager","Manager / committee"],["ssoStatus","SSO status"],["evidenceRetention","Evidence retention"],["lastLogin","Last login"]
  ];
  const initials=(profile.name||selectedRole.name).split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="User Profiles" sub="Manage demo identities, credentials, organisation metadata and workspace access for every VerisZone user."/>
    <Card style={{padding:16,marginBottom:14,background:T.s2}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
        {profileOptions.map(r=>{const active=selected===r.id;return <button key={r.id} type="button" onClick={()=>setSelected(r.id)} style={{background:active?RC(r.id)+"18":T.s3,border:`1px solid ${active?RC(r.id)+"55":T.border}`,borderRadius:10,padding:"10px 12px",color:active?RC(r.id):T.ink2,fontFamily:F.b,fontWeight:900,textAlign:"left",cursor:"pointer"}}>{r.label}<div style={{fontSize:10,fontWeight:600,color:T.ink3,marginTop:3}}>{profiles[r.id]?.name||r.name}</div></button>})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"minmax(220px,.8fr) minmax(0,2fr)",gap:14}}>
      <Card style={{padding:18,alignSelf:"start"}}>
        <div style={{width:62,height:62,borderRadius:"50%",background:`linear-gradient(135deg,${RC(selected)},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 18px 44px ${RC(selected)}30`,marginBottom:14}}><span style={{color:"#fff",fontSize:18,fontWeight:900,fontFamily:F.b}}>{initials}</span></div>
        <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:900,color:T.ink,marginBottom:4}}>{cleanText(profile.name)}</h3>
        <p style={{fontFamily:F.b,fontSize:12,color:T.ink3,marginBottom:14}}>{cleanText(profile.email)}</p>
        <div style={{display:"grid",gap:8,fontFamily:F.b,fontSize:12,color:T.ink2}}>
          <div><strong style={{color:T.ink}}>Workspace:</strong> {selectedRole.label}</div>
          <div><strong style={{color:T.ink}}>Role:</strong> {cleanText(profile.title)}</div>
          <div><strong style={{color:T.ink}}>SSO:</strong> {cleanText(profile.ssoStatus)}</div>
          <div><strong style={{color:T.ink}}>Retention:</strong> {cleanText(profile.evidenceRetention)}</div>
        </div>
        <button type="button" onClick={onSignOut} style={{marginTop:16,width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.ink2,fontFamily:F.b,fontWeight:900,cursor:"pointer",textAlign:"left"}}>Sign out</button>
      </Card>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:16}}>
          <div><h3 style={{fontFamily:F.h,fontSize:18,fontWeight:900,color:T.ink}}>Editable identity record</h3><p style={{fontFamily:F.b,fontSize:11,color:T.ink3}}>Every field below is wired as an input for this MVP.</p></div>
          <button type="button" onClick={saveProfiles} style={{background:RC(selected),border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontFamily:F.b,fontWeight:900,cursor:"pointer"}}>Save profile</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
          {fields.map(([key,label,type])=><ProfileInput key={key} label={label} type={type||"text"} value={profile[key]} onChange={value=>update(key,value)}/>) }
        </div>
      </Card>
    </div>
  </div>;
}

function FreshWorkspaceEmpty({role,tab,aiCentralView,setTab}) {
  const rc=RC(role), R=ROLES[role]||ROLES.caio;
  const allNav=[...NAV,...CAIO_EXTRA_NAV,{id:"profile",label:"Profile"},{id:"settings",label:"Settings"}];
  const navItem=allNav.find(item=>item.id===tab);
  const aiItem=AI_CENTRAL_NAV.find(item=>item.id===aiCentralView);
  const isAI=tab==="aicentral";
  const accent=isAI?AI_GOLD:rc;
  const title=isAI?`AI Central - ${aiItem?.label||"Workspace"}`:(navItem?.label||"Workspace");
  const sub=isAI
    ?"This AI Central tenant is brand new. No initiatives, guardrails, evidence, risks, approvals, or scale-gate signals have been loaded yet."
    :`This ${R.label} module is brand new. No customer records, pilot data, approvals, risk items, evidence, or reports have been loaded yet.`;
  const setupCards=isAI?[
    ["Create initiative registry","Add the first AI initiative, owner, department pilot and lifecycle stage."],
    ["Activate guardrails","Select control packs, compliance checks and HITL gates for the first pilot."],
    ["Collect evidence","Upload approvals, control evidence, audit notes and scale-readiness proof."]
  ]:[
    ["Start AI opportunity intake","Capture the first AI idea, business sponsor, pilot department and value hypothesis."],
    ["Assign CXO ownership","Define accountable executives, budget assumptions, risk appetite and approvals."],
    ["Prepare handoff package","Package the downstream execution workspace requirements once the pilot plan is approved."]
  ];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={title} sub={sub}/>
    <Card style={{padding:24,background:`linear-gradient(135deg,${T.s2},${T.bg})`,border:`1px solid ${accent}38`,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{maxWidth:720}}>
          <Tag label="NEW CUSTOMER WORKSPACE" color={accent} bg={accent+"18"}/>
          <h2 style={{fontFamily:F.h,fontSize:26,fontWeight:900,color:T.ink,margin:"12px 0 8px"}}>{isAI?"No AI Central data yet":"No workspace data yet"}</h2>
          <p style={{fontSize:13,lineHeight:1.7,color:T.ink3,fontFamily:F.b,margin:0}}>Demo Center contains the seeded showcase data. This subscribed workspace is intentionally empty so each customer module starts clean, auditable, and ready for their own records.</p>
        </div>
        <button type="button" onClick={()=>setTab("intake")} style={{background:accent,border:"none",borderRadius:10,padding:"11px 14px",color:"#fff",fontFamily:F.b,fontSize:12,fontWeight:900,cursor:"pointer",boxShadow:`0 16px 34px ${accent}24`}}>Start first intake</button>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:14}}>
      {setupCards.map(([heading,body],idx)=><Card key={heading} style={{padding:16,border:`1px solid ${idx===0?accent+"42":T.border}`}}>
        <div style={{width:28,height:28,borderRadius:8,background:accent+"16",border:`1px solid ${accent}35`,display:"flex",alignItems:"center",justifyContent:"center",color:accent,fontFamily:F.m,fontSize:11,fontWeight:900,marginBottom:12}}>{idx+1}</div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 6px"}}>{heading}</h3>
        <p style={{fontFamily:F.b,fontSize:11,lineHeight:1.6,color:T.ink3,margin:0}}>{body}</p>
      </Card>)}
    </div>
    <Card style={{padding:16}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 8px"}}>Tenant data policy</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
        {["No seeded records","No inherited demo risks","No mock approvals","No sample evidence"].map(item=><div key={item} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:11,fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:800}}>{item}</div>)}
      </div>
    </Card>
  </div>;
}

export default function VerisZone() {
  const [role,setRole]=useState("caio");
  const [tab,setTab]=useState("home");
  const [toast,setToast]=useState({msg:"",vis:false,type:"success"});
  const [hitlCount,setHitlCount]=useState(()=>HITL["caio"].length);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  const [theme,setTheme]=useState("dark");
  const [aiCentralView,setAiCentralView]=useState("dashboard");
  const [hasEntered,setHasEntered]=useState(false);
  const [sessionMode,setSessionMode]=useState("demo");
  const [userProfiles,setUserProfiles]=useState(()=>{
    if(typeof window==="undefined")return USER_PROFILES;
    try{
      return {...USER_PROFILES,...JSON.parse(window.localStorage.getItem("veriszone.userProfiles")||"{}")};
    }catch{
      return USER_PROFILES;
    }
  });
  Object.assign(T, theme==="light"?LIGHT_T:DARK_T);

  useEffect(()=>{
    if(document.getElementById("gp-css"))return;
    const s=document.createElement("style");s.id="gp-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    document.body.style.background=T.bg;
    document.body.style.color=T.ink;
    document.documentElement.classList.toggle("dark",theme==="dark");
    document.documentElement.dataset.theme=theme;
  },[theme]);

  useEffect(()=>{
    if(!hasEntered||typeof window==="undefined")return;
    const workspace=sessionMode==="demo"?"demo":role;
    const nextPath=tab==="aicentral"?`/workspace/aicentral/${aiCentralView}`:tab==="profile"?"/profile":`/workspace/${workspace}/${tab}`;
    if(window.location.pathname!==nextPath)window.history.replaceState(null,"",nextPath);
  },[hasEntered,tab,aiCentralView,role,sessionMode]);

  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handler);return()=>window.removeEventListener("resize",handler);
  },[]);

  const showToast=useCallback((msg,type="success")=>{
    setToast({msg,type,vis:true});
    setTimeout(()=>setToast(t=>({...t,vis:false})),3000);
  },[]);

  const switchRole=r=>{setRole(r);setTab(r==="employee"||r==="manager"?"workbench":"home");setHitlCount((HITL[r]||[]).length);};
  const signOut=useCallback(()=>{
    setHasEntered(false);
    setTab("home");
    setAiCentralView("dashboard");
    setSessionMode("demo");
    if(typeof window!=="undefined")window.history.replaceState(null,"","/");
  },[]);
  const enterApp=useCallback((profile=LOGIN_PROFILES[0])=>{
    setRole(profile.role);
    setTab(profile.target);
    setHitlCount(profile.mode==="demo"?(HITL[profile.role]||[]).length:0);
    setSessionMode(profile.mode||"role");
    setHasEntered(true);
  },[]);
  useEffect(()=>{
    const enterFromRoute=()=>{
      const path=window.location.pathname;
      const parts=path.split("/").filter(Boolean);
      if(path==="/profile"){
        setHasEntered(true);
        setTab("profile");
        return true;
      }
      if(parts[0]==="workspace"&&parts[1]==="aicentral"){
        const view=parts[2]||"dashboard";
        setRole("caio");
        setTab("aicentral");
        const mappedView=AC_LEGACY_VIEWS[view]||view;
        if(AI_CENTRAL_NAV.some(item=>item.id===mappedView))setAiCentralView(mappedView);
        setSessionMode("aicentral");
        setHasEntered(true);
        return true;
      }
      if(parts[0]==="workspace"&&parts[1]){
        const profileId=parts[1];
        const tabId=parts[2]||"home";
        const profile=LOGIN_PROFILES.find(p=>p.id===profileId);
        if(profile){
          enterApp(profile);
          setTab(tabId);
          return true;
        }
      }
      return false;
    };
    const enterFromHash=()=>{
      if(enterFromRoute())return;
      if(window.location.hash==="#profile"){
        setHasEntered(true);
        setTab("profile");
        return;
      }
      if(window.location.hash.startsWith("#workspace-aicentral")){
        const view=window.location.hash.replace("#workspace-aicentral-","");
        setRole("caio");
        setTab("aicentral");
        const mappedView=AC_LEGACY_VIEWS[view]||view;
        if(AI_CENTRAL_NAV.some(item=>item.id===mappedView))setAiCentralView(mappedView);
        setSessionMode("aicentral");
        setHasEntered(true);
        return;
      }
      const id=window.location.hash.replace("#workspace-","");
      if(!id)return;
      const [profileId,tabId]=id.split("-");
      const profile=LOGIN_PROFILES.find(p=>p.id===profileId);
      if(profile)enterApp(profile);
      if(profile&&tabId)setTab(tabId);
    };
    enterFromHash();
    window.addEventListener("hashchange",enterFromHash);
    window.addEventListener("popstate",enterFromHash);
    return()=>{
      window.removeEventListener("hashchange",enterFromHash);
      window.removeEventListener("popstate",enterFromHash);
    };
  },[enterApp]);
  const R=ROLES[role],rc=RC(role);
  const roleHome=(role==="employee"||role==="manager")?"workbench":"home";
  const showSeededData=sessionMode==="demo"||!SEEDED_DEMO_TABS.has(tab);

  if(!hasEntered)return <BrandEntryShell theme={theme} onTheme={()=>setTheme(theme==="dark"?"light":"dark")} onEnter={enterApp}/>;

  return <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
    {toast.vis&&<Toast msg={toast.msg} type={toast.type}/>}
    <Sidebar tab={tab} setTab={setTab} role={role} hitlCount={hitlCount} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} aiCentralView={aiCentralView} setAiCentralView={setAiCentralView} theme={theme} sessionMode={sessionMode} profiles={userProfiles}/>

    {/* Main */}
    <div style={{marginLeft:isMobile?0:SIDEBAR_W,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Top bar */}
      <div style={{background:theme==="light"?T.s2:T.s1,borderBottom:`1px solid ${T.border}`,height:56,display:"flex",alignItems:"center",padding:"0 16px",position:"sticky",top:0,zIndex:100,gap:12,boxShadow:theme==="light"?"0 1px 0 rgba(148,163,184,.22), 0 10px 24px rgba(17,24,39,.035)":"none"}}>
        {isMobile&&<button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",color:T.ink3,fontSize:11,fontWeight:800,padding:"4px 6px",flexShrink:0}}>Menu</button>}
        {isMobile&&<div style={{display:"flex",alignItems:"center",gap:7,flex:"0 0 auto"}}>
          <BrandLogo theme={theme} width={120}/>
        </div>}
        {!isMobile&&sessionMode!=="aicentral"&&<div style={{display:"flex",gap:3,background:theme==="light"?T.s2:T.bg,borderRadius:12,padding:4,border:`1px solid ${T.border}`,boxShadow:theme==="light"?"0 1px 2px rgba(15,23,42,.04)":"none",maxWidth:`calc(100vw - ${SIDEBAR_W+196}px)`,overflowX:"auto",overflowY:"hidden"}}>
          {sessionMode==="demo"&&Object.values(ROLES).map(r2=>{const active=tab!=="aicentral"&&role===r2.id;return <button key={r2.id} onClick={()=>switchRole(r2.id)} style={{background:active?RC(r2.id)+"18":"transparent",border:active?`1px solid ${RC(r2.id)}45`:"1px solid transparent",borderRadius:8,padding:"5px 14px",color:active?RC(r2.id):T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>})}
          {sessionMode!=="demo"&&tab==="aicentral"&&<button type="button" onClick={()=>setTab(roleHome)} title={`Return to ${R.label} workspace`} style={{background:rc+"18",border:`1px solid ${rc}45`,borderRadius:8,padding:"5px 14px",color:rc,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>&#8592; {R.label} Workspace</button>}
          {sessionMode!=="demo"&&tab!=="aicentral"&&<button type="button" onClick={()=>setTab(roleHome)} title={`Return to ${R.label} workspace`} style={{background:rc+"18",border:`1px solid ${rc}45`,borderRadius:8,padding:"5px 14px",color:rc,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{R.label} Workspace</button>}
        </div>}
        {isMobile&&sessionMode!=="aicentral"&&<div style={{display:"flex",gap:3,background:theme==="light"?T.s3:T.bg,borderRadius:7,padding:3,border:`1px solid ${T.border}`,flex:1,overflowX:"auto"}}>
          {sessionMode==="demo"
            ?Object.values(ROLES).map(r2=>{const active=tab!=="aicentral"&&role===r2.id;return <button key={r2.id} onClick={()=>switchRole(r2.id)} style={{flex:1,background:active?RC(r2.id)+"20":"transparent",border:active?`1px solid ${RC(r2.id)}40`:"1px solid transparent",borderRadius:5,padding:"3px 6px",color:active?RC(r2.id):T.ink4,fontSize:9,fontWeight:700,fontFamily:F.b,transition:"all .2s"}}>{r2.label}</button>})
            :<button type="button" onClick={()=>setTab(roleHome)} style={{flex:1,background:tab!=="aicentral"?rc+"20":"transparent",border:`1px solid ${tab!=="aicentral"?rc+"40":T.border}`,borderRadius:5,padding:"3px 6px",color:tab!=="aicentral"?rc:T.ink3,fontSize:9,fontWeight:800,fontFamily:F.b}}>{R.label}</button>}
        </div>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} title="Toggle dark and light mode" style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:isMobile?"4px 10px":"6px 13px",color:T.ink2,fontSize:isMobile?10:11,fontWeight:800,fontFamily:F.b,boxShadow:theme==="light"?"0 1px 2px rgba(15,23,42,.05)":"none"}}>{theme==="dark"?"Light":"Dark"}</button>
          {hitlCount>0&&<button onClick={()=>setTab("hitl")} style={{display:"flex",alignItems:"center",gap:6,background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:20,padding:"4px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:10,fontWeight:700,color:T.amber,fontFamily:F.b}}>{hitlCount}</span>
          </button>}
        </div>
      </div>

      {/* Page content */}
      <div style={{flex:1,padding:"20px 16px 60px",maxWidth:1140,width:"100%",margin:"0 auto"}}>
        {!showSeededData&&<FreshWorkspaceEmpty role={role} tab={tab} aiCentralView={aiCentralView} setTab={setTab}/>}
        {showSeededData&&tab==="home"       &&<PageHome       role={role} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {showSeededData&&tab==="onboard"    &&<PageOnboard    role={role} showToast={showToast}/>}
        {showSeededData&&tab==="intake"     &&<PageOpportunityIntake role={role} setTab={setTab} showToast={showToast}/>}
        {showSeededData&&tab==="strategy"   &&<PageStrategy   role={role} setTab={setTab}/>}
        {showSeededData&&tab==="playbook"   &&<PagePlaybook   role={role} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {tab==="academy"   &&<PageGovernanceAcademy role={role} sessionMode={sessionMode} showToast={showToast} setTab={setTab}/>}
        {showSeededData&&["compliance","checklists","impl","templates","iso27001","scope","controls","trustcenter","gapanalysis","aigov","knowledge"].includes(tab)&&<PageComplianceStandards key={tab} role={role} tab={tab} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {showSeededData&&tab==="aicentral"  &&<PageAICentral role={role} setTab={setTab} showToast={showToast} view={aiCentralView} setView={setAiCentralView} theme={theme} sessionMode={sessionMode}/>}
        {showSeededData&&tab==="hitl"       &&<PageHITL       role={role} showToast={showToast} onCountChange={setHitlCount}/>}
        {showSeededData&&["riskcenter","aira","airt","aia","aiia"].includes(tab)&&<PageRiskCenter key={tab} role={role} tab={tab} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {showSeededData&&tab==="registry"   &&<PageModelRegistry setTab={setTab}/>}
        {showSeededData&&tab==="maturity"   &&<PageMaturityRadar/>}
        {showSeededData&&tab==="usecases"   &&<PageUseCases/>}
        {showSeededData&&tab==="roadmap"    &&<PageRoadmap    role={role} setTab={setTab} setAiCentralView={setAiCentralView}/>}
        {showSeededData&&tab==="servicenow"  &&<PageIntegrations role={role} showToast={showToast}/>}
        {(tab==="profile"||tab==="settings") &&<PageProfile role={role} sessionMode={sessionMode} profiles={userProfiles} setProfiles={setUserProfiles} showToast={showToast} onSignOut={signOut}/>}
        {showSeededData&&tab==="reports"    &&<PageReports   role={role} sessionMode={sessionMode} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {tab==="workbench" &&<PageWorkbench role={role} sessionMode={sessionMode} showToast={showToast}/>}
        {tab==="myideas"   &&<PageMyIdeas   role={role} sessionMode={sessionMode} showToast={showToast}/>}
        {showSeededData&&tab==="decisions" &&<PageDecisions role={role} setTab={setTab} setAiCentralView={setAiCentralView} showToast={showToast}/>}
        {tab==="aiusage"   &&<PageAIUsage   role={role} sessionMode={sessionMode}/>}
      </div>
    </div>
    {sessionMode!=="aicentral"&&<ExecAssistant role={role} isMobile={isMobile} showToast={showToast} tab={tab} goto={link=>{if(!link)return;if(link.ac){setAiCentralView(link.ac);setTab("aicentral");}else if(link.tab){setTab(link.tab);}}}/>}
  </div>;
}

