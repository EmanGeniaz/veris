"use client";

import { Scale } from "lucide-react";
import { useState } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, riskRegister, kriRegister } from "@/lib/platform-models";
import { T, RC, RCL, ROLES, AI_GOLD, AI_GOLD_INK, HITL, KPI, ROLE_KPIS, STANDARDS_MAP, academyEvidenceFor, F, vzDownload, CountUp, Tag, Bar, Card, SHead, KpiInsightPanel } from "./core";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic for the Reports studio (ReportsGenerator + PageReports). The exported
   document payloads (Markdown / CSV / XLSX) are real English files and stay
   English; product/model names, person names and figures stay English too. */
registerContent({
  // ReportsGenerator
  "Generated reports": "التقارير المُنشأة", "Business unit": "وحدة الأعمال", "Framework": "الإطار", "All": "الكل",
  "Executive Board Pack": "حزمة المجلس التنفيذية", "Markdown - portfolio, risks, KRIs": "Markdown - المحفظة والمخاطر ومؤشّرات المخاطر",
  "Audit Pack": "حزمة التدقيق", "Markdown - posture, register, evidence": "Markdown - الوضع والسجل والأدلة",
  "Risk Register": "سجل المخاطر", "CSV - full treatment detail": "CSV - تفصيل المعالجة الكامل",
  "AI Portfolio": "محفظة الذكاء الاصطناعي", "CSV - lifecycle and value": "CSV - دورة الحياة والقيمة",
  "Risk Register (Excel)": "سجل المخاطر (Excel)", "Native XLSX workbook with KRIs": "مصنّف XLSX أصلي مع مؤشّرات المخاطر",
  "AI Portfolio (Excel)": "محفظة الذكاء الاصطناعي (Excel)", "Native XLSX workbook": "مصنّف XLSX أصلي",
  // PageReports
  "Reports & Analytics": "التقارير والتحليلات",
  "Generated, filterable, executive-ready. Every number traces to the register or lifecycle that produced it.": "مُنشأة، قابلة للتصفية، جاهزة للتنفيذيين. كل رقم يُنسَب إلى السجل أو دورة الحياة التي أنتجته.",
  "Overall Compliance": "الامتثال الإجمالي", "Open Risks": "المخاطر المفتوحة", "In register": "في السجل",
  "HITL Pending": "الإنسان في الحلقة معلّق", "Awaiting approval": "بانتظار الموافقة",
  "Framework posture and KPI detail live with their owners.": "وضع الأطر وتفاصيل مؤشّرات الأداء تعيش مع مُلّاكها.",
  "Review compliance posture →": "راجِع وضع الامتثال ←", "Executive KPIs →": "مؤشّرات الأداء التنفيذية ←",
  "Governance Academy Evidence": "أدلة أكاديمية الحوكمة", "captured": "مُلتقَطة", "Owner:": "المالك:", "Time:": "الوقت:",
  "No learning evidence captured yet. Customer workspaces start clean; completion evidence will appear after users finish assigned Academy lessons.": "لم تُلتقَط أدلة تعلّم بعد. تبدأ مساحات عمل العملاء نظيفة؛ وستظهر أدلة الإكمال بعد أن يُنهي المستخدمون دروس الأكاديمية المُسندة.",
  "Executive Board Pack Exports": "صادرات حزمة المجلس التنفيذية",
  "Board AI Transformation Pack": "حزمة تحوّل الذكاء الاصطناعي للمجلس", "Strategy, pilot value, AI Spine scale decisions": "الاستراتيجية وقيمة التجربة وقرارات توسّع العمود الفقري للذكاء الاصطناعي",
  "Regulatory Assurance Pack": "حزمة الضمان التنظيمي", "Evidence ledger, control mapping, audit trail": "سجل الأدلة وربط الضوابط وأثر التدقيق",
  "CXO Accountability Pack": "حزمة مساءلة القادة التنفيذيين", "Approvals, task ownership, open exceptions": "الموافقات وملكية المهام والاستثناءات المفتوحة",
  "Ready": "جاهز", "Draft": "مسودة",
  "Audit Event Lineage": "نسب أحداث التدقيق",
  "Scale gate outcome set": "تحديد نتيجة بوابة التوسّع", "Board pack export generated": "إنشاء صادر حزمة المجلس", "Control activation updated": "تحديث تفعيل الضابط",
  "Hold": "تعليق", "Monitoring": "مراقبة", "AuditEvent": "حدث تدقيق",
  "Scheduled Reports": "التقارير المجدولة",
  "Weekly Compliance Digest": "ملخّص الامتثال الأسبوعي", "Every Monday": "كل اثنين",
  "Monthly Board Risk Summary": "ملخّص مخاطر المجلس الشهري", "1st of month": "أول الشهر",
  "Quarterly Regulatory Update": "التحديث التنظيمي الربعي", "Quarterly": "ربعي",
  "Run Now": "شغّل الآن", "Ran just now": "شُغِّل للتوّ",
});

export function ReportsGenerator({showToast}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [bu,setBu]=useState("All");
  const [fwF,setFwF]=useState("All");
  const units=["All",...new Set(acInitiatives.map(i=>i.unit))];
  const fws=["All","ISO 42001","ISO 27001","EU AI Act","GDPR","NIST AI RMF","SOX"];
  const inis=acInitiatives.filter(i=>bu==="All"||i.unit===bu);
  const risks=riskRegister.filter(r=>(bu==="All"||r.unit===bu)&&(fwF==="All"||r.frameworks.some(f=>f.startsWith(fwF))));
  const chip=(active)=>({background:active?AI_GOLD+"20":T.s2,border:`1px solid ${active?AI_GOLD+"55":T.border}`,color:active?AI_GOLD:T.ink3,borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"});
  const boardPack=()=>{
    const lines=["# Executive Board Pack - AI Portfolio","",`Scope: ${bu==="All"?"Enterprise":bu}${fwF==="All"?"":" · "+fwF}`,"","## Portfolio",""];
    inis.forEach(i=>lines.push(`- **${i.name}** (${i.unit}) - ${i.lifecycle}, phase ${i.phaseIndex+1}/${AC_PHASES.length} ${AC_PHASES[i.phaseIndex]?.name}. Expected ${i.expected}, realized ${i.actual}, ROI ${i.roi}, adoption ${i.adoption}%.${i.blockedBy?" BLOCKED: "+i.blockedBy:""}`));
    lines.push("","## Top risks","");
    risks.slice(0,8).forEach(r=>lines.push(`- ${r.id} ${r.title} (${r.level}) - ${r.system}. Exec owner ${r.execOwner}. Treatment ${r.treatment.strategy}: ${r.treatment.status}.`));
    lines.push("","## KRIs","");
    kriRegister.forEach(k=>lines.push(`- ${k.name}: ${k.value} ${k.unit} (threshold ${k.threshold}, trend ${k.trend})`));
    vzDownload(`board-pack-${bu==="All"?"enterprise":bu.toLowerCase().replace(/\s+/g,"-")}.md`,lines.join("\n"));
    showToast&&showToast("Board pack generated from live portfolio and register data");
  };
  const auditPack=()=>{
    const lines=["# Audit Pack - AI Governance","",`Scope: ${bu==="All"?"Enterprise":bu}${fwF==="All"?"":" · "+fwF}`,"","## Framework posture",""];
    AC_FRAMEWORK_POSTURE.forEach(f=>lines.push(`- ${f.fw}: ${f.score}% (${f.state})`));
    lines.push("","## Risk register extract","");
    risks.forEach(r=>lines.push(`- ${r.id} | ${r.title} | ${r.level} | L${r.likelihood}xI${r.impact} residual ${r.residual} | controls ${r.controls.join("; ")} | frameworks ${r.frameworks.join("; ")}`));
    lines.push("","## Lifecycle evidence","");
    inis.forEach(i=>lines.push(`- ${i.name}: ${i.phaseArtifactsDone}/${AC_PHASES[i.phaseIndex]?.deliverables.length} artifacts complete in ${AC_PHASES[i.phaseIndex]?.name}; controls ${i.controls.join(", ")}`));
    vzDownload(`audit-pack-${fwF==="All"?"all-frameworks":fwF.toLowerCase().replace(/\s+/g,"-")}.md`,lines.join("\n"));
    showToast&&showToast("Audit pack generated - posture, register and evidence extract");
  };
  const riskCsv=()=>{
    const head="id,title,system,category,initiative,unit,execOwner,riskOwner,likelihood,impact,residual,level,status,strategy,treatmentStatus,frameworks,controls";
    const rows=risks.map(r=>[r.id,r.title,r.system,r.category,r.initiativeId||"",r.unit,r.execOwner,r.riskOwner,r.likelihood,r.impact,r.residual,r.level,r.status,r.treatment.strategy,r.treatment.status,r.frameworks.join("; "),r.controls.join("; ")].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
    vzDownload("risk-register.csv",[head,...rows].join("\n"));
    showToast&&showToast(`Risk register exported - ${rows.length} records`);
  };
  const portfolioCsv=()=>{
    const head="id,name,unit,category,lifecycle,phase,expected,actual,roi,adoption,valueScore,guardrail,blockedBy";
    const rows=inis.map(i=>[i.id,i.name,i.unit,i.category,i.lifecycle,AC_PHASES[i.phaseIndex]?.name,i.expected,i.actual,i.roi,i.adoption,i.valueScore,i.guardrail,i.blockedBy||""].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
    vzDownload("ai-portfolio.csv",[head,...rows].join("\n"));
    showToast&&showToast(`Portfolio exported - ${rows.length} initiatives`);
  };
  return <Card style={{padding:16,marginBottom:14,border:`1px solid ${AI_GOLD}30`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
      <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>{T_("Generated reports")}</h3>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{ar?`لا شيء مبنيّ يدوياً - الحزم تُجمَّع من السجلات الحيّة · ${inis.length} مبادرة، ${risks.length} خطر في النطاق`:`Nothing built by hand - packs assemble from the live registers · ${inis.length} initiatives, ${risks.length} risks in scope`}</span>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em",alignSelf:"center"}}>{T_("Business unit")}</span>
      {units.map(u=><button key={u} onClick={()=>setBu(u)} style={chip(bu===u)}>{T_(u)}</button>)}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em",alignSelf:"center"}}>{T_("Framework")}</span>
      {fws.map(f2=><button key={f2} onClick={()=>setFwF(f2)} style={chip(fwF===f2)}>{T_(f2)}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
      {[["Executive Board Pack","Markdown - portfolio, risks, KRIs",boardPack],["Audit Pack","Markdown - posture, register, evidence",auditPack],["Risk Register","CSV - full treatment detail",riskCsv],["AI Portfolio","CSV - lifecycle and value",portfolioCsv],["Risk Register (Excel)","Native XLSX workbook with KRIs",()=>window.open("/api/export/risks.xlsx","_blank")],["AI Portfolio (Excel)","Native XLSX workbook",()=>window.open("/api/export/portfolio.xlsx","_blank")]].map(([t2,d,fn])=>
        <button key={t2} onClick={fn} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"12px 13px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:11.5,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b,marginBottom:3}}>{T_(t2)} ↓</div>
          <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b}}>{T_(d)}</div>
        </button>)}
    </div>
  </Card>;
}

export function PageReports({role,sessionMode,setTab,setAiCentralView,showToast}) {
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const rc=RC(role), rcL=RCL(role), K=KPI[role]||KPI.caio;
  const standards=STANDARDS_MAP[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const [rowOpen,setRowOpen]=useState(null);
  const [ranNow,setRanNow]=useState({});
  const goto=link=>{
    if(!link)return;
    if(link.ac){setAiCentralView&&setAiCentralView(link.ac);setTab&&setTab("aicentral");}
    else if(link.tab){setTab&&setTab(link.tab);}
  };
  const learningEvidence=academyEvidenceFor(role,(sessionMode==="demo"||sessionMode==="aicentral"));
  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink4;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={T_("Reports & Analytics")} sub={T_("Generated, filterable, executive-ready. Every number traces to the register or lifecycle that produced it.")}/>
    <ReportsGenerator showToast={showToast}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
      {[{label:"Overall Compliance",value:`${K.compliance}%`,sub:(ar?`+${K.cTrend}% مقابل الشهر الماضي`:`+${K.cTrend}% vs last month`),color:rc},
        {label:K.domainLabel,value:`${K.score}/100`,sub:K.scoreLabel,color:rc},
        {label:"Open Risks",value:K.risks,sub:"In register",color:T.amber},
        {label:"HITL Pending",value:K.hitl,sub:"Awaiting approval",color:T.violet}
      ].map((k,i)=><Card key={k.label} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:9}}>{T_(k.label)}</div>
        <div style={{fontSize:28,fontWeight:700,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:4}}><CountUp value={k.value}/></div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_(k.sub)}</div>
      </Card>)}
    </div>
    <Card style={{padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{T_("Framework posture and KPI detail live with their owners.")}</span>
      <span style={{display:"flex",gap:8}}><button onClick={()=>setTab&&setTab("compliance")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",color:T.ink2,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ar?"راجِع وضع الامتثال ←":"Review compliance posture →"}</button><button onClick={()=>setTab&&setTab("home")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",color:T.ink2,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ar?"مؤشّرات الأداء التنفيذية ←":"Executive KPIs →"}</button></span>
    </Card>
    <Card style={{overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Governance Academy Evidence")}</h3>
        <Tag label={ar?`${learningEvidence.length} مُلتقَطة`:`${learningEvidence.length} captured`} color={learningEvidence.length?T.green:T.ink4} bg={learningEvidence.length?T.greenL:T.ink5}/>
      </div>
      {learningEvidence.length?learningEvidence.map((e,i)=><div key={e.control} style={{display:"grid",gridTemplateColumns:"1.1fr .9fr 80px",gap:12,padding:"11px 16px",alignItems:"center",borderBottom:i<learningEvidence.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
        <div><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{T_(e.module)}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:2}}>{T_(e.evidence)}</div></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Owner:")} {e.owner}<br/>{T_("Time:")} {e.time}</div>
        <Tag label={T_(e.approval)} color={T.green} bg={T.greenL}/>
      </div>):<div style={{padding:"14px 16px",fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No learning evidence captured yet. Customer workspaces start clean; completion evidence will appear after users finish assigned Academy lessons.")}</div>}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Executive Board Pack Exports")}</h3>
        </div>
        {[
          ["Board AI Transformation Pack","Strategy, pilot value, AI Spine scale decisions","PDF + Deck","Ready"],
          ["Regulatory Assurance Pack","Evidence ledger, control mapping, audit trail","PDF","Ready"],
          ["CXO Accountability Pack","Approvals, task ownership, open exceptions","Deck","Draft"],
        ].map(([name,desc,fmt,status],i)=><div key={name} style={{padding:"12px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"grid",gridTemplateColumns:"1fr 72px 70px",gap:10,alignItems:"center",background:i%2===0?T.s1:T.bg}}>
          <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{T_(name)}</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.45}}>{T_(desc)}</div></div>
          <Tag label={fmt} color={rc} bg={rcL+"70"}/>
          <Tag label={T_(status)} color={status==="Ready"?T.green:T.amber} bg={(status==="Ready"?T.green:T.amber)+"18"}/>
        </div>)}
      </Card>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Audit Event Lineage")}</h3>
        </div>
        {[
          ["Scale gate outcome set","Customer Resolution Copilot","Aisha Patel","Hold"],
          ["Board pack export generated","Finance Close Automation","Elena Rossi","PDF"],
          ["Control activation updated","Customer Resolution Copilot","Jordan Sinclair","Monitoring"],
        ].map(([action,obj,actor,status],i)=><div key={`${action}-${obj}`} style={{padding:"12px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"grid",gridTemplateColumns:"1fr 95px 72px",gap:10,alignItems:"center",background:i%2===0?T.s1:T.bg}}>
          <div><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{T_(action)}</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.45}}>{obj} {ar?"بواسطة":"by"} {actor}</div></div>
          <Tag label={T_("AuditEvent")} color={AI_GOLD} bg={AI_GOLD+"16"}/>
          <Tag label={T_(status)} color={status==="Hold"?T.amber:status==="Monitoring"?AI_GOLD:T.green} bg={(status==="Hold"?T.amber:status==="Monitoring"?AI_GOLD:T.green)+"18"}/>
        </div>)}
      </Card>
    </div>
    <Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Scheduled Reports")}</h3>
      </div>
      {[{name:"Weekly Compliance Digest",freq:"Every Monday",next:"May 11",fmt:"PDF + Email"},
        {name:"Monthly Board Risk Summary",freq:"1st of month",next:"Jun 1",fmt:"PDF"},
        {name:"Quarterly Regulatory Update",freq:"Quarterly",next:"Jul 1",fmt:"PDF + Deck"}
      ].map((r,i)=><div key={r.name} style={{padding:"11px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{T_(r.name)}</div>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{T_(r.freq)} {r.next}</span>
        </div>
        <Tag label={r.fmt} color={rc} bg={rcL+"80"}/>
        <button onClick={()=>{setRanNow({...ranNow,[r.name]:true});showToast&&showToast(ar?`تم إنشاء «${T_(r.name)}» - متاح في الصادرات`:`${r.name} generated - available in exports`);}} style={{fontSize:10,color:ranNow[r.name]?T.green:rc,fontWeight:600,background:ranNow[r.name]?T.greenL:rcL+"60",border:`1px solid ${ranNow[r.name]?T.green+"40":rc+"35"}`,borderRadius:6,padding:"5px 11px",fontFamily:F.b,cursor:"pointer"}}>{ranNow[r.name]?T_("Ran just now"):T_("Run Now")}</button>
      </div>)}
    </Card>
  </div>;
}

