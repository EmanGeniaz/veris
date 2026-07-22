"use client";

import { Activity, Cloud, Library, Map, Target, Workflow } from "lucide-react";
import { useState, useEffect } from "react";
import { AC_FRAMEWORK_POSTURE, knowledgeAssets } from "@/lib/platform-models";
import { T, RC, RCL, ROLES, AI_GOLD, ISO42001_CHECKLIST, CHECKLISTS_MAP, HITL, KPI, ROLE_KPIS, STANDARDS_MAP, TEMPLATES, KIT_TEMPLATE_SOURCES, F, vzDownload, Glyph, IconBox, Tag, statusColor, Spinner, Bar, Ring, Card, SHead, KpiInsightPanel, COMMON_CONTROLS, SCOPE_DATA, TRUST_CENTER_DATA, ANNEX_A_CONTROLS, ISO27001_POLICIES, EVIDENCE_LIBRARY, AUDIT_PLAN, CORRECTIVE_ACTIONS, GAP_DATA } from "./core";

export function CompliancePosture({role,setTab,setAiCentralView}) {
  const [openStd,setOpenStd]=useState(null);
  const goto=link=>{
    if(!link)return;
    if(link.ac){setAiCentralView&&setAiCentralView(link.ac);setTab&&setTab("aicentral");}
    else if(link.tab){setTab&&setTab(link.tab);}
  };
  const rc=RC(role);
  const standards=STANDARDS_MAP[role]||[];
  const roleKpis=ROLE_KPIS[role]||[];
  const stColor=s=>s==="Good"||s==="Active"?T.green:s==="Alert"||s==="Building"?T.amber:s==="Critical"?T.red:T.ink4;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Compliance Scorecard" sub={"Live posture across all "+ROLES[role].label+" regulatory frameworks and standards."}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12,marginBottom:20}}>
      {standards.map((s,i)=>{
        const col=s.score>=85?T.green:s.score>=70?T.blue:s.score>=50?T.amber:s.score>0?T.red:T.ink4;
        const status=s.score>=85?"Strong":s.score>=70?"Good":s.score>=50?"Developing":s.score>0?"At Risk":"N/A";
        return <Card key={s.std} onClick={()=>setOpenStd(openStd===s.std?null:s.std)} style={{padding:18,animation:`up ${.3+i*.08}s ease both`,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink,marginBottom:6}}>{s.std}</h3>
              <Tag label={s.status} color={stColor(s.status)} bg={stColor(s.status)+"18"}/>
            </div>
            <Ring score={s.score} color={rc} size={60}/>
          </div>
          <Bar value={s.score} color={rc} delay={i*100}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.applies}</span>
            <span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:col}}>{status}</span>
          </div>
          {openStd===s.std&&<div style={{marginTop:4}}><KpiInsightPanel label={s.std} status={status==="Strong"||status==="Good"?"Good":"Alert"} role={role} goto={goto}/></div>}
          <div style={{display:"none"}}>
          </div>
        </Card>;
      })}
    </div>
    {/* Full KPI table */}
    <Card style={{overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{ROLES[role].label} Full KPI Register</h3>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"7px 14px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
        {["Category","KPI / Metric","Target","Current","Framework","Status"].map(h=>
          <span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>
        )}
      </div>
      {roleKpis.map((k,i)=>{
        const sc=stColor(k.status);
        return <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px",padding:"10px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:i%2===0?T.s1:T.bg}}>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{k.cat}</span>
          <span style={{fontSize:10,fontWeight:600,color:T.ink,fontFamily:F.b}}>{k.kpi}</span>
          <span style={{fontSize:9,color:T.green,fontFamily:F.m}}>{k.target}</span>
          <span style={{fontSize:10,fontWeight:700,color:rc,fontFamily:F.m}}>{k.value}</span>
          <span style={{fontSize:9,color:T.ink3,fontFamily:F.m}}>{k.fw}</span>
          <Tag label={k.status} color={sc} bg={sc+"18"}/>
        </div>;
      })}
    </Card>
  </div>;
}

/* Section */
/* ── Compliance & Standards: one surface for every framework, control,
   template, checklist and trust artifact. One control, many frameworks -
   owned here, referenced everywhere else. */
export function PageComplianceStandards({role,tab,setTab,setAiCentralView,showToast}){
  const LEGACY={compliance:"posture",checklists:"checklists",impl:"frameworks",iso27001:"frameworks",scope:"frameworks",gapanalysis:"frameworks",aigov:"frameworks",templates:"templates",controls:"controls",trustcenter:"trust",knowledge:"search"};
  const FW_LEGACY={impl:"impl",iso27001:"iso27001",scope:"scope",gapanalysis:"gap",aigov:"cube"};
  const [cTab,setCTab]=useState(LEGACY[tab]||"posture");
  const [fw,setFw]=useState(FW_LEGACY[tab]||"impl");
  const TABS=[["posture","Posture"],["search","Search"],["frameworks","Frameworks"],["controls","Control Library"],["templates","Templates"],["checklists","Checklists"],["trust","Trust Center"]];
  const FWS=[["impl","ISO 42001 Implementation"],["iso27001","ISO 27001 Workspace"],["scope","ISMS Scope"],["gap","Gap Analysis"],["cube","Framework Compare"]];
  const chip=(active,color)=>({background:active?color+"18":T.s2,border:`1px solid ${active?color+"50":T.border}`,color:active?color:T.ink2,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"});
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {TABS.map(([id,label])=><button key={id} onClick={()=>setCTab(id)} style={chip(cTab===id,T.blue)}>{label}</button>)}
    </div>
    {cTab==="posture"&&<CompliancePosture role={role} setTab={setTab} setAiCentralView={setAiCentralView}/>}
    {cTab==="search"&&<PageKnowledge role={role} setTab={setTab} showToast={showToast}/>}
    {cTab==="frameworks"&&<div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {FWS.map(([id,label])=><button key={id} onClick={()=>setFw(id)} style={chip(fw===id,AI_GOLD)}>{label}</button>)}
      </div>
      {fw==="impl"&&<PageImpl role={role}/>}
      {fw==="iso27001"&&<PageISO27001 role={role} showToast={showToast}/>}
      {fw==="scope"&&<PageScope role={role}/>}
      {fw==="gap"&&<PageGapAnalysis role={role} showToast={showToast}/>}
      {fw==="cube"&&<PageAIGovCube role={role} setTab={setTab}/>}
    </div>}
    {cTab==="controls"&&<PageCommonControls role={role}/>}
    {cTab==="templates"&&<PageTemplates role={role} showToast={showToast}/>}
    {cTab==="checklists"&&<PageChecklists role={role} showToast={showToast}/>}
    {cTab==="trust"&&<PageTrustCenter role={role} showToast={showToast}/>}
  </div>;
}

export function PageChecklists({role,showToast}) {
  const rc=RC(role);
  const available=CHECKLISTS_MAP[role]||[{key:"iso42001",label:"ISO 42001",data:ISO42001_CHECKLIST}];
  const [selKey,setSelKey]=useState(available[0].key);
  const [checked,setChecked]=useState({});
  useEffect(()=>{setSelKey(available[0].key);setChecked({});},[role]);
  const currentData=available.find(a=>a.key===selKey)?.data||available[0].data;
  const allItems=currentData.flatMap(s=>s.items);
  const doneCount=allItems.filter(i=>checked[i.id]!==undefined?checked[i.id]:i.done).length;
  const pct=allItems.length>0?Math.round((doneCount/allItems.length)*100):0;
  const toggle=id=>{setChecked(p=>({...p,[id]:!(p[id]!==undefined?p[id]:allItems.find(i=>i.id===id)?.done)}));};
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Compliance Checklists" sub="ISO and regulatory control checklists mapped to your governance obligations."/>
    <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
      {/* Show all checklists for CAIO, role-specific for others */}
      {(role==="caio"?[{key:"iso42001",label:"ISO 42001 AIMS"}]:[...available]).map(fw=><button key={fw.key} onClick={()=>{setSelKey(fw.key);setChecked({});}} style={{background:selKey===fw.key?rc:T.s2,color:selKey===fw.key?"#fff":T.ink3,border:`1px solid ${selKey===fw.key?rc:T.border}`,borderRadius:6,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.m,transition:"all .15s"}}>{fw.label}</button>)}
      {role!=="caio"&&<button onClick={()=>{setSelKey("iso42001");setChecked({});}} style={{background:selKey==="iso42001"?rc:T.s2,color:selKey==="iso42001"?"#fff":T.ink3,border:`1px solid ${selKey==="iso42001"?rc:T.border}`,borderRadius:6,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.m}}>ISO 42001 AIMS</button>}
    </div>
    <Card style={{padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{available.find(a=>a.key===selKey)?.label||"ISO 42001"} Progress</span>
        <span style={{fontSize:10,fontFamily:F.m,color:T.ink3}}>{doneCount}/{allItems.length} controls - {pct}%</span>
      </div>
      <Bar value={pct} color={rc}/>
    </Card>
    {(selKey==="iso42001"?ISO42001_CHECKLIST:currentData).map((section,si)=>{
      const sectionDone=section.items.filter(i=>checked[i.id]!==undefined?checked[i.id]:i.done).length;
      return <Card key={section.clause} style={{overflow:"hidden",marginBottom:10,animation:`up ${.3+si*.05}s ease both`}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:9,alignItems:"center"}}>
            <Tag label={section.clause} color={rc} bg={RCL(role)+"80"}/>
            <h3 style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b}}>{section.title}</h3>
          </div>
          <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{sectionDone}/{section.items.length}</span>
        </div>
        <div style={{padding:"4px 14px"}}>
          {section.items.map((item,ii)=>{
            const isDone=checked[item.id]!==undefined?checked[item.id]:item.done;
            return <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 0",borderBottom:ii<section.items.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",opacity:isDone?.65:1}}>
              <div style={{width:17,height:17,borderRadius:4,flexShrink:0,border:`2px solid ${isDone?T.green:T.borderB}`,background:isDone?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",marginTop:1}}>
                {isDone&&<span style={{color:"#fff",fontSize:9,fontWeight:700}}>OK</span>}
              </div>
              <span style={{fontSize:11,color:isDone?T.ink4:T.ink2,fontFamily:F.b,lineHeight:1.55,textDecoration:isDone?"line-through":"none"}}>{item.text}</span>
            </div>;
          })}
        </div>
      </Card>;
    })}
  </div>;
}

/* Section */
export function PageTemplates({role,showToast}) {
  const rc=RC(role);
  const [selId,setSelId]=useState(null);
  const [loading,setLoading]=useState(false);
  const [genResult,setGenResult]=useState(null);
  const selectedTemplate=TEMPLATES.find(t=>t.id===selId);
  const buildTemplatePreview=(template)=>{
    const source=KIT_TEMPLATE_SOURCES[template.id]||"VerisZone native template";
    const header=`# ${template.name}

Framework: ${template.fw}
Category: ${template.cat}
Responsible roles: ${template.tags.join(", ")}
Implementation kit source: ${source}

`;
    const drafts={
      t_rr:`## Register Scope
Maintain the authoritative record of AI risks for every pilot, production model and procured AI system.

## Risk Register Columns
| Field | Required Entry |
|---|---|
| AI system | Name, owner, department, lifecycle stage |
| Risk statement | Cause, event, impact and affected stakeholder |
| Likelihood x Impact | 1-5 x 1-5 scoring; score > 12 is High/Critical |
| Inherent / residual risk | Before and after controls |
| Control mapping | ISO 42001 C.8.2, ISO 23894 and linked internal controls |
| Treatment status | Open, Mitigating, Accepted, Transferred or Closed |
| Evidence reference | Linked model card, AIIA, DPIA, test report or approval log |

## Auditor Failure Checks
- Static register: risks not updated after model, data or workflow change.
- Ghost control: control listed but no operating evidence.
- Missing treatment: High/Critical risk has no owner, action or due date.`,
      t_rtp:`## Treatment Scope
Create a structured remediation plan for every High/Critical AI risk with score > 12.

## Treatment Options
| Option | When Used | Required Evidence |
|---|---|---|
| Avoid | Risk exceeds appetite or prohibited AI trigger exists | Stop decision and executive approval |
| Reduce | Controls can bring residual risk inside appetite | Control plan, owner, due date, verification |
| Transfer | Vendor, insurer or contract can absorb part of exposure | Contract clause, SLA or insurance reference |
| Accept | Residual risk is explicitly approved | Risk acceptance note and expiry date |

## Plan Fields
Risk ID, root cause, selected treatment, control owner, budget, dependency, quarter-by-quarter timeline, evidence requirement and verification method.`,
      t_aiia:`## AIIA Procedure
Six-phase AI System Impact Assessment aligned to ISO 42001 Control A.5 and EU AI Act obligations.

## Six Phases
1. Characterise the AI system: purpose, users, decisions, autonomy and deployment context.
2. Identify stakeholders: affected people, departments, customers, regulators and operators.
3. Assess impact: rights, safety, privacy, fairness, transparency and operational harm.
4. Map controls: human oversight, data governance, robustness, documentation and monitoring.
5. Capture approvals: CAIO, legal, privacy, security and business owner sign-off.
6. Define monitoring: KPIs, drift signals, incident triggers, post-release review and re-assessment cadence.

## Required Output
Context record, stakeholder map, ethical principle assessment, human oversight rating, open conditions, go/no-go recommendation and evidence references.`,
      t_mc:`## Model Card Structure
Standardised model documentation for design, approval, deployment and post-release monitoring.

## Required Sections
- Intended use: approved use cases, prohibited uses and user population.
- Model details: model family, provider, version, architecture and deployment environment.
- Training data: source, provenance, personal data status, exclusions and known limitations.
- Performance metrics: accuracy, latency, robustness, drift and benchmark date.
- Bias and fairness: protected attributes, test method, threshold and mitigation.
- Human oversight: review points, override path, escalation owner and kill switch.
- Transparency: user notice, explainability method and EU AI Act Art.13 reference.

## Approval Gate
Model card must be complete before production or high-risk pilot scale.`,
      t_nc:`## Non-Conformity Record
Capture governance or control failure, root cause and corrective action under ISO 42001 C.10.1.

## Required Fields
Issue ID, detection source, affected AI system, clause/control, severity, root cause, corrective action, owner, due date, verification evidence and closure approver.

## Corrective Action Workflow
1. Log issue and affected control.
2. Assign owner and target date.
3. Define containment action if risk is active.
4. Implement corrective action.
5. Verify evidence.
6. Close with management review note.`,
      t_ks:`## Emergency Fallback Procedure
Define authority and steps to stop or bypass an AI system safely.

## Activation Criteria
- Harm threshold exceeded.
- Material model drift or severe bias detected.
- Security incident, prompt injection or data leakage.
- Regulatory breach or prohibited-use trigger.
- HITL override failure.

## Operating Steps
1. Approver confirms activation authority.
2. Disable AI route or model endpoint.
3. Switch to manual fallback process.
4. Notify business owner, CAIO, CISO and impacted operators.
5. Preserve logs and evidence.
6. Conduct post-incident review and restart approval.`,
      t_soa:`## Statement of Applicability
Map ISO 42001 Annex A controls to the AI management system scope.

## Control Matrix
| Control | Applicable | Status | Justification | Evidence |
|---|---|---|---|---|
| A.5 Impact assessment | Yes | Partial | Required for high-risk pilots | AIIA record |
| A.6 AI system lifecycle | Yes | Planned | Needed before production | Lifecycle checklist |
| A.7 Data for AI systems | Yes | Implemented | Data provenance required | Dataset register |
| A.8 Information for interested parties | Yes | Partial | Transparency gaps remain | Notice draft |

## Required Decision
Each control must be marked Applicable or Not Applicable with a defensible justification and evidence reference.`,
      t_bias:`## Bias Detection Procedure
Methodology for identifying, measuring and reducing algorithmic bias.

## Assessment Steps
1. Identify protected or sensitive attributes.
2. Define fairness objective and harm scenario.
3. Select test population and baseline.
4. Measure disparate impact, false positive/negative parity and subgroup performance.
5. Record threshold breaches.
6. Apply mitigation and retest.
7. Define monitoring cadence.

## Evidence
Dataset summary, test notebook, fairness threshold, mitigation decision, reviewer sign-off and post-release monitoring trigger.`,
      t_dep:`## Deployment Release Checklist
Five-gate checklist before AI release or pilot scale.

## Gates
1. Governance documentation complete: model card, AIIA, owner and purpose.
2. Risk approval complete: risk register and treatment plans for High/Critical items.
3. Evidence reviewed: controls, test results, privacy and security records.
4. HITL sign-off complete: approval owner, override path and escalation.
5. Post-release monitoring ready: drift, incident, value and adoption metrics.

## Release Decision
Approve, approve with conditions, hold, remediate or stop.`,
      t_raci:`## CAIO Responsibility Mapping
Cross-functional RACI for enterprise AI governance activities.

## RACI Matrix
| Activity | CAIO | CIO | CISO | CDPO | CFO | COO | CGO |
|---|---|---|---|---|---|---|---|
| AI strategy | A | C | C | C | C | C | C |
| Use-case intake | A | R | C | C | C | R | C |
| Risk classification | A | C | C | C | I | I | R |
| Model deployment | A | R | C | C | I | R | I |
| Monitoring and reporting | A | R | R | R | C | R | R |

Legend: R Responsible, A Accountable, C Consulted, I Informed.`,
      t_uc:`## AI Use Case Scoring
Separate high-value AI opportunities from vanity projects.

## Nine-Block Canvas
Problem, user, data, technology, KPI, feasibility, ethics, HITL requirement and ROI.

## Scoring Grid
| Dimension | Score 1-5 | Notes |
|---|---:|---|
| Business impact |  | Revenue, cost, risk or experience impact |
| Data readiness |  | Quality, lineage, access and privacy |
| Technical feasibility |  | Architecture, integration and operating model |
| Governance risk |  | Legal, privacy, fairness, safety and oversight |
| Time to value |  | Pilot duration and adoption complexity |

Decision: proceed to feasibility review, hold, redesign or reject.`,
      t_poc:`## POC to Production Plan
Phase-based AI project plan from experiment to governed operation.

## Phases
1. POC: hypothesis, dataset, benchmark and feasibility.
2. Pilot: department selection, owner, risk controls and success metrics.
3. Production readiness: security, privacy, model card, AIIA and HITL.
4. Release: approval gates, monitoring and fallback.
5. Post-deployment: KPI review, drift check, lessons learned and scale gate.

## Required Owners
Business owner, technical owner, CAIO reviewer, security reviewer and evidence owner.`,
      t_ethics:`## AI Ethics Impact Assessment
Evaluate whether an AI system creates unfair, harmful or non-transparent outcomes.

## Assessment Areas
- Human rights and dignity.
- Unfair or harmful outcomes.
- Accountability and oversight.
- Transparency and explainability.
- Vulnerable groups and accessibility.
- Contestability and appeal.

## Output
Ethics risk rating, mitigation actions, reviewer comments, approval status and monitoring obligations.`,
      t_genai:`## Responsible GenAI Use Policy
Operating rules for generative AI use across the enterprise.

## Permitted Uses
Drafting, summarisation, ideation, code assistance and internal knowledge support where data classification permits.

## Prohibited Uses
Entering restricted PII, legal advice without review, customer-facing output without approval, credential sharing, source-code leakage and unmanaged model/plugin use.

## Mandatory Controls
Data classification, prompt hygiene, human review, source verification, output logging, incident reporting and training acknowledgement.`,
      t_kpi:`## AI KPI Monitoring Dashboard
Executive dashboard definition for technical, value, governance and risk metrics.

## Metric Groups
| Group | Example KPIs |
|---|---|
| Model health | Accuracy, drift, latency, uptime |
| Business value | ROI, time saved, adoption, conversion |
| Governance | HITL rate, approval SLA, audit findings |
| Risk | Bias score, incidents, exceptions, residual risk |

## Reporting Cadence
Weekly operating view, monthly CXO view and quarterly board pack.`,
      t_bvb:`## Build vs Buy Decision Matrix
Objective scoring framework for AI platform sourcing.

## Decision Dimensions
Strategic fit, technical feasibility, total cost of ownership, time-to-value, data/security risk, vendor dependency, integration complexity and regulatory exposure.

## Scoring
Score each dimension 1-5 for Build and Buy. Weight strategic fit, risk and time-to-value before final recommendation.

## Output
Recommendation, rationale, assumptions, open risks, exit strategy and executive approval.`,
      t_post:`## Post-Deployment Review
Blameless review after AI pilot or production release.

## Review Sections
Deployment summary, planned vs actual KPI performance, user adoption, incidents, model drift, fairness findings, HITL overrides, lessons learned and decision.

## Decision Options
Continue, retrain, remediate, expand, pause or decommission.

## Evidence
Monitoring data, approval log, incident record, business-value proof and owner sign-off.`,
      t_dpia:`## GDPR Article 35 DPIA
Data Protection Impact Assessment for AI processing.

## Mandatory Elements
1. Description of processing and AI system purpose.
2. Necessity and proportionality assessment.
3. Risks to rights and freedoms of individuals.
4. Measures to address risks, safeguards and security controls.
5. Residual risk and DPO/CDPO sign-off.

## Supervisory Authority Trigger
Consult authority if high residual risk remains after mitigation.`,
      t_tia:`## Transfer Impact Assessment
Assessment for international data transfers under GDPR Art.46 and Schrems II.

## Required Sections
Destination country, recipient/vendor, transfer mechanism, SCC module, government-access risk, supplementary measures, encryption, access controls and re-assessment cadence.

## Decision
Proceed, proceed with supplementary measures, hold transfer or reject transfer.`,
      t_board:`## Board-Ready Governance Summary
One-page executive governance insert for the board pack.

## Executive Snapshot
- Overall AI governance maturity.
- Critical risks and scale-gate decisions.
- Compliance posture across EU AI Act, ISO 42001, GDPR and NIST AI RMF.
- CXO approvals and open escalations.
- Top three management actions.

## Board Decisions Requested
Approve risk appetite, approve scale/no-scale decision, approve funding condition or request remediation plan.`
    };
    return `${header}${drafts[template.id]||`## Template Structure
${template.desc}

## Required Sections
Scope, owners, control mapping, evidence requirements, approval workflow, review cadence and audit notes.

## Output
A reviewable governance artifact tied to ${template.fw}.`}`;
  };
  const preview=(template)=>{
    setSelId(template.id);
    setLoading(false);
    setGenResult(null);
    showToast&&showToast(`${template.name} preview opened`);
  };
  const generate=(template)=>{
    setSelId(template.id);setLoading(true);setGenResult(null);
    window.setTimeout(()=>{
      setGenResult(buildTemplatePreview(template));
      setLoading(false);
      showToast&&showToast(`${template.name} generated`);
    },450);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Document Templates" sub="AI-native governance templates. AI-assisted templates auto-populate from your system description."/>
    {selectedTemplate&&<Card style={{padding:18,animation:"up .25s ease",marginBottom:16,border:`1px solid ${rc}45`,boxShadow:T.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,marginBottom:14}}>
        <div>
          <Tag label={genResult?"Generated draft":"Preview"} color={genResult?T.green:rc} bg={(genResult?T.green:rc)+"18"}/>
          <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:900,color:T.ink,margin:"9px 0 5px"}}>{selectedTemplate.name}</h3>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0,maxWidth:780}}>{selectedTemplate.desc}</p>
        </div>
        <button type="button" onClick={()=>{setSelId(null);setGenResult(null);setLoading(false);}} style={{background:T.s3,border:`1px solid ${T.border}`,color:T.ink3,borderRadius:8,padding:"7px 10px",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Close</button>
      </div>
      {loading&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 0",color:T.ink3,fontFamily:F.b,fontSize:12}}><Spinner color={rc}/>Generating governance template preview...</div>}
      {!loading&&!genResult&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
        {[["Framework",selectedTemplate.fw],["Category",selectedTemplate.cat],["Roles",selectedTemplate.tags.join(", ")],["Kit source",KIT_TEMPLATE_SOURCES[selectedTemplate.id]||"VerisZone native template"],["Mode",selectedTemplate.ai?"AI-assisted":"Manual template"]].map(([label,value])=><div key={label} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:12}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{label}</div>
          <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:800,lineHeight:1.4}}>{value}</div>
        </div>)}
      </div>}
      {genResult&&<div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:15,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.75,whiteSpace:"pre-wrap",maxHeight:360,overflowY:"auto"}}>{genResult}</div>}
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:11}}>
      {TEMPLATES.map((t,i)=><Card key={t.id} style={{padding:15,border:`1px solid ${selId===t.id?rc+"50":T.border}`,transition:"border-color .2s",animation:`up ${.3+i*.05}s ease both`}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:9}}>
          <IconBox name={`${t.cat} ${t.name}`} color={t.ai?T.violet:rc}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}>
              <Tag label={t.cat} color={T.blue} bg={T.blueL}/>
              {t.ai&&<Tag label="AI Native" color={T.violet} bg={T.violetL}/>}
            </div>
            <h3 style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,lineHeight:1.35}}>{t.name}</h3>
          </div>
        </div>
        <p style={{fontSize:11,color:T.ink3,lineHeight:1.65,fontFamily:F.b,marginBottom:11}}>{t.desc}</p>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:11}}>
          <Tag label={t.fw} color={T.ink3} bg={T.s3}/>
          {t.tags.map(tag=><Tag key={tag} label={tag} color={T.ink4} bg={T.ink5}/>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button type="button" onClick={()=>preview(t)} style={{flex:1,background:selId===t.id&&!genResult?rc+"12":T.s3,color:selId===t.id&&!genResult?rc:T.ink2,border:`1px solid ${selId===t.id&&!genResult?rc+"45":T.border}`,borderRadius:6,padding:"7px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Preview</button>
          {t.ai&&<button type="button" onClick={()=>generate(t)} style={{flex:1,background:rc,color:"#fff",border:"none",borderRadius:6,padding:"7px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Generate</button>}
        </div>
      </Card>)}
    </div>
  </div>;
}

/* Section */
/* Generated reports - never built by hand. Filters scope what goes
   into each generated pack; every download is real content derived
   from the live registers. */
export function PageImpl({role}) {
  const rc = RC(role), rcL = RCL(role);
  const [activePhaseId, setActivePhaseId] = useState("plan");
  const [expandedStep, setExpandedStep] = useState(null);
  const activePhase = IMPL_PHASES.find(p => p.id === activePhaseId);
  const allSteps = IMPL_PHASES.flatMap(p => p.steps);
  const completedSteps = allSteps.filter(s => s.status === "complete").length;
  const activeSteps = allSteps.filter(s => s.status === "active").length;
  const pct = Math.round((completedSteps / allSteps.length) * 100);

  const statusColor = s => s==="complete"?T.green:s==="active"?T.amber:T.ink4;
  const statusLabel = s => s==="complete"?"Complete":s==="active"?"Active":"Pending";

  return (
    <div style={{animation:"up .3s ease"}}>
      <SHead
        title="ISO 42001 Implementation Tracker"
        sub="PDCA 4-phase, 15-step implementation roadmap"
      />

      {/* Overall progress */}
      <Card style={{padding:"14px 18px",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>
              AIMS Implementation Progress
            </div>
            <p style={{fontSize:11,color:T.ink4,fontFamily:F.b}}>
              {completedSteps} of {allSteps.length} steps complete - {activeSteps} in progress
            </p>
          </div>
          <div style={{fontSize:28,fontWeight:700,fontFamily:F.m,color:rc}}>{pct}%</div>
        </div>
        <Bar value={pct} color={rc}/>
        <div style={{display:"flex",gap:14,marginTop:10}}>
          {[{label:"Complete",color:T.green,count:completedSteps},
            {label:"In Progress",color:T.amber,count:activeSteps},
            {label:"Pending",color:T.ink4,count:allSteps.length-completedSteps-activeSteps}
          ].map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{s.label}: {s.count}</span>
          </div>)}
        </div>
      </Card>

      {/* Phase PDCA selector */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {IMPL_PHASES.map((phase,i) => {
          const isAct = activePhaseId === phase.id;
          const done = phase.steps.filter(s=>s.status==="complete").length;
          const total = phase.steps.length;
          return (
            <button key={phase.id} onClick={()=>setActivePhaseId(phase.id)} style={{
              background: isAct ? phase.color+"18" : T.s2,
              border:`1px solid ${isAct ? phase.color+"60" : T.border}`,
              borderRadius:10, padding:"13px 12px", cursor:"pointer",
              textAlign:"left", transition:"all .18s",
              boxShadow: isAct ? `0 0 20px ${phase.color}18` : "none"
            }}>
              <div style={{display:"flex",marginBottom:8}}><Glyph name={phase.label} color={isAct?phase.color:T.ink3} size={18}/></div>
              <div style={{fontSize:10,fontWeight:700,color:isAct?phase.color:T.ink3,
                fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>
                {phase.label}
              </div>
              <div style={{fontSize:12,fontWeight:600,color:isAct?T.ink:T.ink2,fontFamily:F.b,marginBottom:5}}>
                {phase.subtitle}
              </div>
              <div style={{marginBottom:6}}>
                <Bar value={(done/total)*100} color={phase.color}/>
              </div>
              <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{done}/{total} steps</div>
            </button>
          );
        })}
      </div>

      {/* Active phase steps */}
      {activePhase && (
        <div style={{animation:"fade .2s ease"}}>
          <div style={{
            background:`linear-gradient(135deg,${activePhase.color}14,${T.s2})`,
            border:`1px solid ${activePhase.color}35`,
            borderRadius:10, padding:"14px 18px", marginBottom:16
          }}>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <Tag label={activePhase.label} color={activePhase.color} bg={activePhase.color+"20"}/>
              <Tag label={activePhase.clause} color={T.ink3} bg={T.s3}/>
            </div>
            <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>
              {activePhase.desc}
            </p>
          </div>

          <div style={{position:"relative"}}>
            {/* Vertical connector line */}
            <div style={{
              position:"absolute",left:16,top:20,bottom:20,width:2,
              background:`linear-gradient(180deg,${activePhase.color}60,${activePhase.color}10)`,
              zIndex:0
            }}/>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activePhase.steps.map((step,i) => {
                const isExp = expandedStep === step.n;
                const sCol = statusColor(step.status);
                return (
                  <div key={step.n} style={{
                    display:"flex", gap:14, alignItems:"flex-start",
                    animation:`up ${.3+i*.07}s ease both`
                  }}>
                    {/* Circle */}
                    <div style={{
                      width:34,height:34,borderRadius:"50%",flexShrink:0,
                      background: step.status==="complete" ? T.greenL : step.status==="active" ? activePhase.color+"25" : T.s3,
                      border:`2px solid ${sCol}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      position:"relative",zIndex:1,
                      boxShadow: step.status==="active" ? `0 0 14px ${activePhase.color}40` : "none",
                      transition:"all .3s"
                    }}>
                      <span style={{fontSize:step.status==="complete"?12:11,fontWeight:800,color:sCol,fontFamily:F.m}}>
                        {step.status==="complete"?"Done":step.n}
                      </span>
                    </div>

                    {/* Content card */}
                    <div style={{
                      flex:1,
                      background: step.status==="active" ? `linear-gradient(135deg,${activePhase.color}10,${T.s1})` : T.s1,
                      border:`1px solid ${isExp||step.status==="active" ? activePhase.color+"40" : T.border}`,
                      borderRadius:9, overflow:"hidden",
                      boxShadow: step.status==="active" ? `0 0 16px ${activePhase.color}08` : "none",
                      transition:"border-color .2s"
                    }}>
                      <div onClick={()=>setExpandedStep(isExp?null:step.n)}
                        style={{padding:"13px 15px",cursor:"pointer",display:"flex",
                          alignItems:"flex-start",gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:7,marginBottom:7,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:sCol}}>
                              {statusLabel(step.status)}
                            </span>
                            <Tag label={step.clause} color={T.ink4} bg={T.s3}/>
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,lineHeight:1.4}}>
                            Step {step.n}: {step.title}
                          </div>
                          <div style={{fontSize:11,color:T.ink4,fontFamily:F.b,marginTop:4}}>
                            Owner: {step.owner}
                          </div>
                        </div>
                        <span style={{color:T.ink4,transform:isExp?"rotate(90deg)":"none",
                          transition:"transform .2s",fontSize:14,flexShrink:0,marginTop:2}}>{">"}</span>
                      </div>

                      {isExp && (
                        <div style={{padding:"0 15px 15px",borderTop:`1px solid ${T.border}`,
                          animation:"up .2s ease"}}>
                          <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.75,
                            marginTop:12,marginBottom:12}}>{step.detail}</div>
                          <div style={{background:T.s3,border:`1px solid ${activePhase.color}25`,
                            borderRadius:7,padding:"10px 12px"}}>
                            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",
                              letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>Deliverable</div>
                            <p style={{fontSize:11,color:activePhase.color,fontFamily:F.b,
                              lineHeight:1.6,margin:0,fontWeight:500}}>{step.deliverable}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Section */
export function PageScope({role}) {
  const rc=RC(role), D=SCOPE_DATA;
  const [tab,setTab]=useState("scope");
  const tabs=[{id:"scope",label:"ISMS Scope"},{id:"parties",label:"Interested Parties"},{id:"legal",label:"Legal & Regulatory"},{id:"context",label:"Context"}];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="ISMS Scope Builder" sub="ISO 27001 Clause 4"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?rc:T.s2,color:tab===t.id?"#fff":T.ink3,border:`1px solid ${tab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b}}>{t.label}</button>)}
    </div>
    {tab==="scope"&&<div>
      <Card style={{padding:18,marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>Organisation Profile</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {[["Organisation",D.orgName],["Industry",D.industry],["AI Systems in Scope",D.aiSystems],["Employees",D.employees.toLocaleString()],["Data Subjects",D.dataSubjects.toLocaleString()],["Geography",D.geography.join(", ")]].map(([l,v])=><div key={l} style={{background:T.s3,borderRadius:8,padding:"11px 13px"}}><div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b}}>{v}</div></div>)}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>In Scope</h3>
          {D.inScope.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green,marginTop:5,flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{item}</span></div>)}
        </Card>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Out of Scope</h3>
          {D.outOfScope.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:5,height:5,borderRadius:"50%",background:T.red,marginTop:5,flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{item}</span></div>)}
          <h3 style={{fontFamily:F.h,fontSize:13,fontWeight:700,color:T.ink,marginBottom:10,marginTop:14}}>Cloud Providers</h3>
          {D.cloudProviders.map((cp,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><Tag label={cp} color={rc} bg={RCL(role)+"80"}/></div>)}
        </Card>
      </div>
    </div>}
    {tab==="parties"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Interested Parties Register</h3></div>
      {D.interestedParties.map((p,i)=><div key={i} style={{padding:"13px 16px",borderBottom:i<D.interestedParties.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 2fr 80px",gap:12,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.party}</span>
        <span style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{p.need}</span>
        <Tag label={p.impact} color={p.impact==="Critical"?T.red:p.impact==="High"?T.amber:T.blue} bg={p.impact==="Critical"?T.redL:p.impact==="High"?T.amberL:T.blueL}/>
      </div>)}
    </Card>}
    {tab==="legal"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Legal & Regulatory Requirements</h3></div>
      {D.legalRequirements.map((r,i)=><div key={i} style={{padding:"13px 16px",borderBottom:i<D.legalRequirements.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 2fr 80px 90px",gap:12,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.req}</span>
        <span style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{r.obligation}</span>
        <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Due: {r.due}</span>
        <Tag label={r.status} color={r.status==="Urgent"?T.red:r.status==="Active"?T.green:r.status==="In Progress"?T.blue:T.ink3} bg={r.status==="Urgent"?T.redL:r.status==="Active"?T.greenL:r.status==="In Progress"?T.blueL:T.ink5}/>
      </div>)}
    </Card>}
    {tab==="context"&&<Card style={{padding:18}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>Context of the Organisation</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[["Internal Context","Governance structure, culture, and resources","Established ISMS governance team. Board-level security committee. Annual security budget approved."],["External Context","Legal, regulatory, market, and societal factors","Operating in highly regulated financial services sector. Subject to UK GDPR, FCA, EU AI Act, and DORA. Customer base across 23 countries."],["SWOT","Internal positive factors","SOC 2 Type II certified. Strong security culture. Dedicated CISO, CAIO, and CDPO. AI governance programme in progress."],["SWOT","External threats and challenges","EU AI Act August 2026 enforcement. Increasing supply chain attacks. Staff turnover in security roles. Legacy system integration complexity."]].map(([title,sub,body])=><div key={title} style={{background:T.s3,borderRadius:9,padding:"13px 15px"}}>
          <div style={{fontSize:11,fontWeight:700,color:rc,fontFamily:F.b,marginBottom:3}}>{title}</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginBottom:8}}>{sub}</div>
          <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{body}</p>
        </div>)}
      </div>
    </Card>}
  </div>;
}

/* Section */
export function PageCommonControls({role}) {
  const rc=RC(role);
  const [sel,setSel]=useState(COMMON_CONTROLS[0]);
  const stCol=s=>s==="Implemented"?T.green:s==="Partial"?T.amber:T.red;
  const allFrameworks=["ISO 27001","ISO 27002","SOC 2","NIST CSF","CIS Controls","GDPR","ISO 42001","PCI DSS","HIPAA","DORA","EU AI Act","NIST AI RMF","MAS TRM","RBI"];
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Common Control Library" sub="One control mapped across 16 frameworks"/>
    <div style={{background:T.s3,borderRadius:9,padding:"11px 14px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap"}}>
      {allFrameworks.map(fw=><Tag key={fw} label={fw} color={rc} bg={RCL(role)+"80"}/>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 80px 80px",padding:"7px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["Control Area","Status","Strength"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {COMMON_CONTROLS.map((c,i)=><div key={c.id} onClick={()=>setSel(c)} style={{display:"grid",gridTemplateColumns:"2fr 80px 80px",padding:"12px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<COMMON_CONTROLS.length-1?`1px solid ${T.border}`:"none",background:sel?.id===c.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel?.id===c.id?"3px solid "+rc:"3px solid transparent",transition:"all .15s"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.control}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {Object.keys(c.mappings).slice(0,4).map(fw=><Tag key={fw} label={fw} color={T.ink4} bg={T.s3}/>)}
                {Object.keys(c.mappings).length>4&&<Tag label={"+"+(Object.keys(c.mappings).length-4)+" more"} color={rc} bg={RCL(role)+"80"}/>}
              </div>
            </div>
            <Tag label={c.status} color={stCol(c.status)} bg={stCol(c.status)+"18"}/>
            <Tag label={c.strength} color={stCol(c.strength)} bg={stCol(c.strength)+"18"}/>
          </div>)}
        </div>
      </div>
      {sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${rc}18,${T.s3})`,borderBottom:`1px solid ${rc}30`,padding:"14px 16px"}}>
          <Tag label={sel.status} color={stCol(sel.status)} bg={stCol(sel.status)+"18"}/>
          <h3 style={{fontFamily:F.h,fontSize:13,fontWeight:700,color:T.ink,marginTop:8,lineHeight:1.3}}>{sel.control}</h3>
        </div>
        <div style={{padding:15}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>Framework Mappings</div>
          {Object.entries(sel.mappings).map(([fw,ref])=><div key={fw} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{fw}</span>
            <Tag label={ref} color={rc} bg={RCL(role)+"80"}/>
          </div>)}
          <div style={{marginTop:12,background:T.s3,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>Required Evidence</div>
            <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:0}}>{sel.evidence}</p>
          </div>
        </div>
      </Card>}
    </div>
  </div>;
}

/* Section */
export function PageTrustCenter({role, showToast}) {
  const rc=RC(role), D=TRUST_CENTER_DATA;
  const [tab,setTab]=useState("overview");
  const tabs=[{id:"overview",label:"Overview"},{id:"questionnaires",label:"Security Questionnaires"},{id:"policies",label:"Public Policies"},{id:"copilot",label:"AI Trust Copilot"}];
  const [loading,setLoading]=useState(false);
  const [aiResponse,setAiResponse]=useState(null);
  const [question,setQuestion]=useState("");
  const runCopilot=async()=>{
    if(!question.trim())return;
    setLoading(true);setAiResponse(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are VerisZone's CRM Trust Agent and AI Trust Copilot. Help sales and security teams respond to customer trust and security questions. You have knowledge of: ISO 27001 (65% readiness, targeting Q3 2026 cert), SOC 2 Type II (certified, 91%), GDPR compliance (81%), EU AI Act programme (72%), and security practices. Be specific, professional, and reference certifications where applicable. Keep responses concise and suitable for customer-facing use.",messages:[{role:"user",content:question}]})});
      const d=await res.json();
      setAiResponse((d.content&&d.content[0]&&d.content[0].text)||"");
    }catch{showToast("Copilot failed","error");}
    setLoading(false);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Trust Center" sub="Customer-facing compliance posture"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?rc:T.s2,color:tab===t.id?"#fff":T.ink3,border:`1px solid ${tab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b}}>{t.label}</button>)}
    </div>
    {tab==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:14}}>
        {D.certifications.map((c,i)=>{
          const col=c.score>=85?T.green:c.score>=65?T.blue:c.score>=50?T.amber:T.red;
          return <Card key={c.name} style={{padding:16,animation:`up ${.3+i*.07}s ease both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><IconBox name={c.name} color={col} size={16} style={{marginBottom:8}}/><h3 style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b,marginTop:5}}>{c.name}</h3></div>
              <Ring score={c.score} color={col} size={46}/>
            </div>
            <Bar value={c.score} color={col} delay={i*80}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <Tag label={c.status} color={c.status==="Certified"||c.status==="Compliant"?T.green:c.status==="In Progress"?T.amber:T.ink3} bg={c.status==="Certified"||c.status==="Compliant"?T.greenL:c.status==="In Progress"?T.amberL:T.ink5}/>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Auditor: {c.auditor}</span>
            </div>
          </Card>;
        })}
      </div>
    </div>}
    {tab==="questionnaires"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
      {D.questionnaires.map((q,i)=><Card key={q.name} style={{padding:16,animation:`up ${.3+i*.07}s ease both`}}>
        <h3 style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:5}}>{q.name}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,marginBottom:10}}>{q.desc}</p>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <Tag label={q.pages+" pages"} color={T.ink3} bg={T.s3}/>
          <Tag label={q.time} color={T.ink3} bg={T.s3}/>
          <Tag label={q.status} color={T.green} bg={T.greenL}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>showToast("Auto-complete requires the production AI Gateway connection - available after go-live","error")} style={{flex:1,background:rc,color:"#fff",border:"none",borderRadius:7,padding:"8px",fontSize:10,fontWeight:600,fontFamily:F.b}}>AI Complete</button>
          <button onClick={()=>{vzDownload("veriszone-security-questionnaire.md",`# Security Questionnaire (generated demo)\n\nGenerated from the VerisZone Trust Center.\n\nFramework posture:\n${AC_FRAMEWORK_POSTURE.map(f=>`- ${f.name}: ${f.score}% (${f.sub})`).join("\n")}\n`);showToast("Questionnaire downloaded");}} style={{flex:1,background:T.s3,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Download</button>
        </div>
      </Card>)}
    </div>}
    {tab==="policies"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Publicly Available Policies</h3></div>
      {D.policies.map((p,i)=><div key={i} style={{padding:"12px 16px",borderBottom:i<D.policies.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{p.name}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>v{p.version} {p.updated}</span></div>
        <Tag label="Public" color={T.green} bg={T.greenL}/>
        <button onClick={()=>{vzDownload("veriszone-policy.md","# Policy document (generated demo)\n\nExported from the VerisZone Trust Center policy library.\n");showToast("Policy downloaded");}} style={{background:rc+"20",color:rc,border:`1px solid ${rc}30`,borderRadius:6,padding:"5px 11px",fontSize:10,fontWeight:600,fontFamily:F.b}}>Download</button>
      </div>)}
    </Card>}
    {tab==="copilot"&&<Card style={{padding:20}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>"</div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>CRM Trust Agent </h3>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,marginBottom:16}}>Help sales teams respond to customer security questions, RFP security sections, and trust reviews. Ask any compliance question as if you are a customer.</p>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {["Do you have ISO 27001?","How do you handle GDPR?","What is your AI governance approach?","Do you have SOC 2 Type II?"].map(q=><button key={q} onClick={()=>setQuestion(q)} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 11px",fontSize:10,color:T.ink2,fontFamily:F.b}}>{q}</button>)}
      </div>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask a customer trust or security question" rows={3} style={{width:"100%",background:T.s3,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:T.ink,fontFamily:F.b,resize:"none",marginBottom:10}}/>
      <button onClick={runCopilot} disabled={loading||!question.trim()} style={{background:loading?T.border:rc,color:loading?T.ink4:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontSize:12,fontWeight:600,fontFamily:F.b,display:"flex",alignItems:"center",gap:8,marginBottom:aiResponse?14:0}}>
        {loading?<><Spinner color="#fff"/>Generating response</>:"Generate Response"}
      </button>
      {aiResponse&&<div style={{background:T.s3,borderRadius:8,padding:"14px 16px",borderLeft:"3px solid "+rc,animation:"up .3s ease"}}>
        <div style={{fontSize:9,fontWeight:700,color:rc,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>AI Trust Response</div>
        <p style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap"}}>{aiResponse}</p>
        <button onClick={()=>{try{navigator.clipboard&&navigator.clipboard.writeText(aiResponse);}catch{}showToast("Response copied to clipboard");}} style={{marginTop:10,background:T.s4,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 12px",fontSize:10,fontFamily:F.b}}>Copy Response</button>
      </div>}
    </Card>}
  </div>;
}


export function PageISO27001({role,showToast}){
  const rc=RC(role);
  const [activeTab,setActiveTab]=useState("overview");
  const tabs=[{id:"overview",label:"Overview"},{id:"controls",label:"Annex A"},{id:"policies",label:"Policies"},{id:"evidence",label:"Evidence"},{id:"audit",label:"Audit Planner"},{id:"actions",label:"Corrective Actions"}];
  const totalControls=ANNEX_A_CONTROLS.reduce((s,a)=>s+a.total,0);
  const totalImpl=ANNEX_A_CONTROLS.reduce((s,a)=>s+a.implemented,0);
  const certScore=Math.round((totalImpl/totalControls)*100);
  const expiring=EVIDENCE_LIBRARY.filter(e=>e.status==="Expiring").length;
  const expired=EVIDENCE_LIBRARY.filter(e=>e.status==="Expired").length;
  const overdueCA=CORRECTIVE_ACTIONS.filter(c=>c.status==="Overdue").length;
  const psc=s=>s==="Approved"?T.green:s==="In Review"?T.blue:s==="Needs Update"||s==="Expired"?T.red:T.amber;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="ISO 27001 Workspace" sub="ISMS implementation"/>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?rc:T.s2,color:activeTab===t.id?"#fff":T.ink3,border:`1px solid ${activeTab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 14px",fontSize:10,fontWeight:600,fontFamily:F.b,transition:"all .15s"}}>{t.label}</button>)}
    </div>
    {activeTab==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{label:"Cert. Readiness",value:certScore+"%",color:certScore>=80?T.green:T.amber,sub:"Overall ISMS score"},{label:"Controls Impl.",value:totalImpl+"/"+totalControls,color:rc,sub:"Annex A progress"},{label:"Evidence Issues",value:expiring+expired,color:expired>0?T.red:T.amber,sub:expired+" expired / "+expiring+" expiring"},{label:"Corrective Actions",value:CORRECTIVE_ACTIONS.length,color:overdueCA>0?T.red:T.amber,sub:overdueCA+" overdue"}].map(k=><Card key={k.label} style={{padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>{k.label}</div>
          <div style={{fontSize:24,fontWeight:800,fontFamily:F.m,color:k.color,marginBottom:2}}>{k.value}</div>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
        </Card>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {ANNEX_A_CONTROLS.map((a,i)=>{const col=a.score>=80?T.green:a.score>=65?T.blue:a.score>=50?T.amber:T.red;return <Card key={a.id} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><Tag label={a.clause} color={rc} bg={RCL(role)+"80"}/><h3 style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b,marginTop:6,lineHeight:1.3}}>{a.title}</h3></div>
            <Ring score={a.score} color={col} size={46}/>
          </div>
          <Bar value={a.score} color={col} delay={i*80}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            {[["Impl.",a.implemented,T.green],["Partial",a.partial,T.amber],["Missing",a.notImpl,T.red]].map(([l,v,c])=><div key={l} style={{flex:1,background:T.s3,borderRadius:6,padding:"5px 8px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,fontFamily:F.m,color:c}}>{v}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{l}</div></div>)}
          </div>
        </Card>;})}
      </div>
    </div>}
    {activeTab==="controls"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Annex A Control Tracker</h3>
        <Tag label="ISO 27001:2022" color={rc} bg={RCL(role)+"80"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"60px 2fr 60px 60px 70px 70px",padding:"7px 16px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
        {["Clause","Title","Total","Impl.","Partial","Missing"].map(h=><span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{h}</span>)}
      </div>
      {ANNEX_A_CONTROLS.map((a,i)=><div key={a.id} style={{display:"grid",gridTemplateColumns:"60px 2fr 60px 60px 70px 70px",padding:"11px 16px",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:i%2===0?T.s1:T.bg}}>
        <Tag label={a.clause} color={rc} bg={RCL(role)+"60"}/><span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{a.title}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.ink2,fontWeight:700}}>{a.total}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.green,fontWeight:700}}>{a.implemented}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.amber,fontWeight:700}}>{a.partial}</span>
        <span style={{fontSize:11,fontFamily:F.m,color:T.red,fontWeight:700}}>{a.notImpl}</span>
      </div>)}
    </Card>}
    {activeTab==="policies"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Policy Library- {ISO27001_POLICIES.length} Policies</h3>
        <div style={{display:"flex",gap:7}}><Tag label={ISO27001_POLICIES.filter(p=>p.status==="Approved").length+" Approved"} color={T.green} bg={T.greenL}/><Tag label={ISO27001_POLICIES.filter(p=>p.status==="Draft"||p.status==="Needs Update").length+" Need Action"} color={T.red} bg={T.redL}/></div>
      </div>
      {ISO27001_POLICIES.map((p,i)=>{const sc=psc(p.status);return <div key={p.id} style={{padding:"11px 16px",borderBottom:i<ISO27001_POLICIES.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"2fr 100px 80px 80px 70px 60px",gap:8,alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{p.name}</div><div style={{display:"flex",gap:5}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>v{p.version}</span>{p.linked.map(l=><Tag key={l} label={l} color={T.ink4} bg={T.s3}/>)}</div></div>
        <Tag label={p.status} color={sc} bg={sc+"18"}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{p.owner}</span>
        <span style={{fontSize:9,color:T.ink3,fontFamily:F.m}}>{p.reviewed}</span>
        <Tag label={p.risk} color={p.risk==="High"?T.red:p.risk==="Medium"?T.amber:T.green} bg={p.risk==="High"?T.redL:p.risk==="Medium"?T.amberL:T.greenL}/>
        <button onClick={()=>showToast("Policy editing arrives with the production document service - view-only in this workspace","error")} style={{background:rc+"20",color:rc,border:`1px solid ${rc}30`,borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>Edit</button>
      </div>;})}
    </Card>}
    {activeTab==="evidence"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Evidence Library - {EVIDENCE_LIBRARY.length} Items</h3>
        <div style={{display:"flex",gap:7}}><Tag label={expired+" Expired"} color={T.red} bg={T.redL}/><Tag label={expiring+" Expiring"} color={T.amber} bg={T.amberL}/></div>
      </div>
      {EVIDENCE_LIBRARY.map((e,i)=>{const sc=e.status==="Valid"?T.green:e.status==="Expiring"?T.amber:T.red;return <div key={e.id} style={{padding:"11px 16px",borderBottom:i<EVIDENCE_LIBRARY.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"2fr 80px 80px 90px 60px",gap:8,alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{e.name}</div><div style={{display:"flex",gap:6}}><Tag label={e.control} color={T.ink4} bg={T.s3}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{e.type} - {e.size}</span></div></div>
        <Tag label={e.status} color={sc} bg={sc+"18"}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{e.owner}</span>
        <span style={{fontSize:9,color:sc,fontFamily:F.m,fontWeight:600}}>Exp: {e.expires}</span>
        <button onClick={()=>showToast("Full evidence viewer arrives with production file storage - records are listed in Trust & Evidence","error")} style={{background:T.s3,color:T.ink2,border:`1px solid ${T.border}`,borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>View</button>
      </div>;})}
    </Card>}
    {activeTab==="audit"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Internal Audit Programme 2026</h3></div>
      {AUDIT_PLAN.map((a,i)=>{const sc=a.status==="Scheduled"?T.blue:a.status==="Complete"?T.green:T.ink3;return <div key={a.id} style={{padding:"13px 16px",borderBottom:i<AUDIT_PLAN.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:a.critical?T.redL:T.s3,border:`2px solid ${a.critical?T.red:sc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:800,color:a.critical?T.red:sc,fontFamily:F.m}}>{i+1}</span></div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{a.area}</div><div style={{display:"flex",gap:10}}><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Auditor: {a.auditor}</span><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{a.scheduled}</span></div></div>
        <div style={{display:"flex",gap:7}}>{a.critical&&<Tag label="Cert. Audit" color={T.red} bg={T.redL}/>}<Tag label={a.status} color={sc} bg={sc+"18"}/></div>
      </div>;})}
    </Card>}
    {activeTab==="actions"&&<Card style={{overflow:"hidden"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Corrective Action Register</h3><Tag label={overdueCA+" Overdue"} color={T.red} bg={T.redL}/></div>
      {CORRECTIVE_ACTIONS.map((ca,i)=>{const pc=ca.priority==="Critical"?T.red:ca.priority==="High"?T.amber:T.blue;const sc=ca.status==="Overdue"?T.red:ca.status==="In Progress"?T.blue:T.ink3;return <div key={ca.id} style={{padding:"12px 16px",borderBottom:i<CORRECTIVE_ACTIONS.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,borderLeft:"3px solid "+pc}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{flex:1,paddingRight:10}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{ca.finding}</div><div style={{display:"flex",gap:8}}><Tag label={ca.linked} color={T.ink4} bg={T.s3}/><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Owner: {ca.owner}</span><span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>Due: {ca.due}</span></div></div>
          <div style={{display:"flex",gap:6}}><Tag label={ca.priority} color={pc} bg={pc+"18"}/><Tag label={ca.status} color={sc} bg={sc+"18"}/></div>
        </div>
      </div>;})}
    </Card>}
  </div>;
}

export function PageGapAnalysis({role,showToast}){
  const rc=RC(role);
  const [loading,setLoading]=useState(false);
  const [aiInsight,setAiInsight]=useState(null);
  const G=GAP_DATA;
  const priCol=p=>p==="Critical"?T.red:p==="High"?T.amber:p==="Medium"?T.blue:T.ink3;
  const priColBg=p=>p==="Critical"?T.redL:p==="High"?T.amberL:p==="Medium"?T.blueL:T.ink5;
  const runAI=async()=>{
    setLoading(true);setAiInsight(null);
    try{
      const prompt="Analyse these compliance gaps and provide remediation plan: "+G.topGaps.slice(0,5).map(g=>g.gap+" ("+g.priority+", "+g.fw+")").join("; ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are VerisZone's AI Gap Analysis Copilot. Return ONLY valid JSON: {\"summary\":\"string\",\"critical\":[{\"action\":\"string\",\"owner\":\"string\",\"days\":1,\"impact\":\"string\"}],\"quickWins\":[{\"action\":\"string\",\"effort\":\"Low\",\"days\":1}],\"insight\":\"string\"}",messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=(d.content&&d.content[0]&&d.content[0].text)||"";
      try{setAiInsight(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setAiInsight({summary:raw,critical:[],quickWins:[],insight:""});}
    }catch{showToast("AI analysis failed","error");}
    setLoading(false);
  };
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Gap Analysis Dashboard" sub="Multi-framework compliance gaps"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {[{label:"Overall Score",value:G.overall+"%",color:G.overall>=80?T.green:T.amber,sub:"vs 100% target"},{label:"Critical Gaps",value:G.topGaps.filter(g=>g.priority==="Critical").length,color:T.red,sub:"Audit-blocking"},{label:"Frameworks",value:G.frameworks.length,color:rc,sub:"Assessed"},{label:"High Priority",value:G.topGaps.filter(g=>g.priority==="High").length,color:T.amber,sub:"<30 days"}].map((k,i)=><Card key={k.label} style={{padding:"12px 14px",animation:`up ${.3+i*.07}s ease both`}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:7}}>{k.label}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:F.m,color:k.color,marginBottom:2}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{k.sub}</div>
      </Card>)}
    </div>
    <Card style={{padding:16,marginBottom:12}}>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Framework Readiness Scores</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {G.frameworks.map((fw,i)=>{const col=fw.score>=85?T.green:fw.score>=70?T.blue:fw.score>=55?T.amber:T.red;return <div key={fw.fw} style={{background:T.s3,borderRadius:9,padding:"12px 14px",animation:`up ${.3+i*.06}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><span style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.m}}>{fw.fw}</span><span style={{fontSize:16,fontWeight:800,fontFamily:F.m,color:col}}>{fw.score}%</span></div>
          <Bar value={fw.score} color={col} delay={i*70}/>
          <div style={{display:"flex",gap:8,marginTop:7}}><span style={{fontSize:9,color:T.green,fontFamily:F.m}}>Implemented {fw.implemented}</span><span style={{fontSize:9,color:T.amber,fontFamily:F.m}}>Partial {fw.partial}</span><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>Missing {fw.missing}</span>{fw.critical>0&&<Tag label={fw.critical+" critical"} color={T.red} bg={T.redL}/>}</div>
        </div>;})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:12,marginBottom:12}}>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>Top Compliance Gaps</h3></div>
        {G.topGaps.map((g,i)=><div key={g.id} style={{padding:"10px 16px",borderBottom:i<G.topGaps.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,borderLeft:"3px solid "+priCol(g.priority)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{flex:1,paddingRight:8}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{g.gap}</div><div style={{display:"flex",gap:7}}><Tag label={g.fw} color={T.ink4} bg={T.s3}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>Owner: {g.owner}</span><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>~{g.days}d</span></div></div>
            <div style={{display:"flex",gap:5,flexShrink:0}}><Tag label={g.type} color={T.ink3} bg={T.s3}/><Tag label={g.priority} color={priCol(g.priority)} bg={priColBg(g.priority)}/></div>
          </div>
        </div>)}
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>Department Heatmap</h3>
        {G.heatmap.map((d,i)=>{const col=d.score>=80?T.green:d.score>=65?T.blue:d.score>=50?T.amber:T.red;return <div key={d.dept} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{d.dept}</span><div style={{display:"flex",gap:6}}><Tag label={d.gaps+" gaps"} color={d.gaps>=7?T.red:d.gaps>=4?T.amber:T.green} bg={d.gaps>=7?T.redL:d.gaps>=4?T.amberL:T.greenL}/><span style={{fontSize:10,fontWeight:700,fontFamily:F.m,color:col}}>{d.score}%</span></div></div>
          <Bar value={d.score} color={col} delay={i*60}/>
        </div>;})}
      </Card>
    </div>
    <Card style={{padding:18,border:`1px solid ${rc}30`}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
        <div style={{width:28,height:28,borderRadius:7,background:rc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}></div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:700,color:T.ink}}>AI Gap Analysis Copilot</h3>
      </div>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginBottom:14,lineHeight:1.7}}>Analyse your top compliance gaps and generate a prioritised remediation plan with owners, timelines, and quick wins.</p>
      <button onClick={runAI} disabled={loading} style={{background:loading?T.border:rc,color:loading?T.ink4:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontSize:12,fontWeight:600,fontFamily:F.b,display:"flex",alignItems:"center",gap:8,marginBottom:aiInsight?14:0}}>
        {loading?<><Spinner color="#fff"/>Analysing gaps...</>:""}
      </button>
      {aiInsight&&<div style={{animation:"up .3s ease"}}>
        <div style={{background:T.s3,borderRadius:8,padding:"12px 14px",marginBottom:12,borderLeft:"3px solid "+rc}}><p style={{fontSize:12,color:T.ink2,fontFamily:F.b,lineHeight:1.75,margin:0}}>{aiInsight.summary}</p></div>
        {aiInsight.critical&&aiInsight.critical.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Critical Actions</div>
          {aiInsight.critical.map((c,i)=><div key={i} style={{background:T.redL,border:"1px solid "+T.red+"25",borderRadius:7,padding:"9px 12px",marginBottom:6}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:3}}>{c.action}</div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>Owner: {c.owner}</span><span style={{fontSize:9,color:T.red,fontFamily:F.m}}>{c.days} days</span></div></div>)}
        </div>}
        {aiInsight.quickWins&&aiInsight.quickWins.length>0&&<div>
          <div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>Quick Wins</div>
          {aiInsight.quickWins.map((q,i)=><div key={i} style={{background:T.greenL,border:"1px solid "+T.green+"25",borderRadius:7,padding:"9px 12px",marginBottom:6,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{q.action}</span><div style={{display:"flex",gap:6}}><Tag label={q.effort} color={T.amber} bg={T.amberL}/><Tag label={q.days+"d"} color={T.green} bg={T.greenL}/></div></div>)}
        </div>}
      </div>}
    </Card>
  </div>;
}

export const CUBE_DATA = {
  objectives:[
    {id:"strategic", label:"Strategic Objectives", icon:"?", color:"#4B7BF5"},
    {id:"operations",label:"Operations Objectives",icon:"?", color:"#0DB4A0"},
    {id:"reporting", label:"Reporting Objectives", icon:"?", color:"#9061F9"},
    {id:"compliance",label:"Compliance Objectives",icon:"?", color:"#E8A020"},
  ],
  components:[
    {id:"c1",num:1,label:"Control Environment",desc:"Establish AI governance, culture, roles and ethics.",color:"#E8A020",icon:"?",
     cells:{strategic:"AI governance structure and oversight",operations:"AI roles, skills and responsibility model",reporting:"AI governance metrics and reporting",compliance:"AI ethics, policy alignment and regulatory commitment"},
     veris:"Strategy Pillars"},
    {id:"c2",num:2,label:"Risk Assessment",desc:"Identify and assess AI risks affecting objectives.",color:"#E84040",icon:"?",
     cells:{strategic:"AI risk appetite and tolerance",operations:"AI use case risk identification",reporting:"AI risk impact on reporting integrity",compliance:"AI regulatory and ethical risk assessment"},
     veris:"AIRA Register"},
    {id:"c3",num:3,label:"Control Activities",desc:"Design and implement controls to mitigate AI risks.",color:"#1FB864",icon:"?",
     cells:{strategic:"AI policies, standards and procedures",operations:"Model controls, validation and safeguards",reporting:"Data quality, model output controls",compliance:"Bias detection, explainability and compliance checks"},
     veris:"Policy Library"},
    {id:"c4",num:4,label:"Information & Communication",desc:"Ensure quality, transparency and communication of AI information.",color:"#4B7BF5",icon:"?",
     cells:{strategic:"Stakeholder engagement on AI strategy",operations:"AI system documentation and data lineage",reporting:"AI-generated information disclosures",compliance:"Regulatory communication and transparency"},
     veris:"ISMS Scope"},
    {id:"c5",num:5,label:"Monitoring Activities",desc:"Monitor AI performance, controls and risks continuously.",color:"#9061F9",icon:"?",
     cells:{strategic:"AI governance oversight and assurance",operations:"Continuous monitoring of AI performance",reporting:"AI model drift and accuracy checks",compliance:"Independent reviews, audits and validation"},
     veris:"KPI Dashboard"},
  ],
  assurance:[
    {id:"a1",label:"Audit Tests",           desc:"Verify design and operating effectiveness of AI controls.",        icon:"?",color:"#4B7BF5",veris:"ISO 27001 Workspace"},
    {id:"a2",label:"Validation & Review",   desc:"Independent model validation and risk reviews.",                   icon:"?",color:"#9061F9",veris:"AI Model Registry"},
    {id:"a3",label:"Compliance Testing",    desc:"Assess adherence to laws, regulations and internal policy.",       icon:"?", color:"#1FB864",veris:"ISO 27001 Checklists"},
    {id:"a4",label:"Continuous Monitoring", desc:"Real-time monitoring and anomaly detection of AI systems.",         icon:"?", color:"#E8A020",veris:"Domain Metrics"},
    {id:"a5",label:"Assurance Reporting",   desc:"Report findings, issues and remediation status to stakeholders.",  icon:"?", color:"#E84040",veris:"Reports"},
  ],
  foundation:[
    {label:"AI Governance Framework",       icon:"?",color:"#4B7BF5"},
    {label:"Ethics & Responsible AI",       icon:"?",color:"#9061F9"},
    {label:"Data Governance & Quality",     icon:"?",color:"#0DB4A0"},
    {label:"Technology & Model Management", icon:"?",color:"#E8A020"},
    {label:"People, Culture & Capability",  icon:"?",color:"#1FB864"},
    {label:"Risk Culture & Accountability", icon:"?",color:"#E84040"},
  ],
};

export function PageAIGovCube({role,setTab}) {
  const rc=RC(role);
  const [selComp,setSelComp]=useState(null);
  const [selA,setSelA]=useState(null);
  const [view,setView]=useState("cube");
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="AI Governance Cube" sub="Integrating AI Risks, Controls and Assurance Across the Enterprise"/>
    <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
      {[{id:"cube",label:"Governance Cube"},{id:"assurance",label:"Assurance"},{id:"foundation",label:"Foundation"}].map(v=>
        <button key={v.id} onClick={()=>setView(v.id)} style={{background:view===v.id?rc:T.s2,color:view===v.id?"#fff":T.ink3,border:`1px solid ${view===v.id?rc:T.border}`,borderRadius:7,padding:"7px 16px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{v.label}</button>
      )}
    </div>
    {view==="cube"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"180px repeat(4,1fr)",gap:5,marginBottom:5}}>
        <div style={{display:"flex",alignItems:"flex-end",padding:"0 0 8px 0"}}>
          <div><div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,marginBottom:2}}>Objective Setting</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>AI Objectives</div></div>
        </div>
        {CUBE_DATA.objectives.map(obj=><div key={obj.id} style={{background:obj.color+"22",border:`1px solid ${obj.color}40`,borderRadius:"8px 8px 0 0",padding:"10px 12px",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Glyph name={obj.label} color={obj.color} size={16}/></div>
          <div style={{fontSize:10,fontWeight:700,color:obj.color,fontFamily:F.b,lineHeight:1.3}}>{obj.label}</div>
        </div>)}
      </div>
      {CUBE_DATA.components.map((comp,ci)=><div key={comp.id} style={{display:"grid",gridTemplateColumns:"180px repeat(4,1fr)",gap:5,marginBottom:5,animation:`up ${.3+ci*.07}s ease both`}}>
        <div onClick={()=>setSelComp(selComp===comp.id?null:comp.id)} style={{background:comp.color+"18",border:`1px solid ${comp.color}40`,borderRadius:8,padding:"12px 12px",cursor:"pointer",borderLeft:"4px solid "+comp.color,boxShadow:selComp===comp.id?"0 0 16px "+comp.color+"25":"none"}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <Glyph name={comp.label} color={comp.color} size={16}/>
            <div><div style={{fontSize:10,fontWeight:700,color:comp.color,fontFamily:F.b,marginBottom:3}}>{comp.num}. {comp.label}</div>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,lineHeight:1.4}}>{comp.desc}</div></div>
          </div>
        </div>
        {CUBE_DATA.objectives.map(obj=><div key={obj.id} style={{background:selComp===comp.id?comp.color+"12":T.s2,border:`1px solid ${selComp===comp.id?comp.color+"40":T.border}`,borderRadius:8,padding:"10px 11px",transition:"all .2s"}}>
          <div style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{comp.cells[obj.id]}</div>
        </div>)}
      </div>)}
      {selComp&&(()=>{const comp=CUBE_DATA.components.find(c=>c.id===selComp);return comp?<Card style={{padding:16,marginTop:8,animation:"up .25s ease",border:"1px solid "+comp.color+"40"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><div style={{fontSize:12,fontWeight:700,color:comp.color,fontFamily:F.b,marginBottom:3}}>{comp.num}. {comp.label}</div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{comp.desc}</p></div>
          <button onClick={()=>setSelComp(null)} style={{background:"none",border:"none",color:T.ink4,fontSize:16,cursor:"pointer"}}>Close</button>
        </div>
        <div style={{background:T.s3,borderRadius:8,padding:"10px 14px",borderLeft:"3px solid "+comp.color}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>Where in VerisZone</div>
          <div style={{fontSize:11,color:comp.color,fontFamily:F.b,fontWeight:600}}>{comp.veris}</div>
        </div>
      </Card>:null;})()}
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,padding:"10px 14px",background:T.s3,borderRadius:8,border:"1px solid "+T.border}}>
        <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F.m,whiteSpace:"nowrap"}}>Assurance Dimension (Third Line)</div>
        <div style={{flex:1,height:1,background:T.border}}/>
        <button onClick={()=>setView("assurance")} style={{background:rc,color:"#fff",border:"none",borderRadius:6,padding:"5px 12px",fontSize:10,fontWeight:600,fontFamily:F.b}}>View Activities</button>
      </div>
    </div>}
    {view==="assurance"&&<div>
      <div style={{background:T.caio+"18",border:"1px solid "+T.caio+"30",borderRadius:10,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.caio,fontFamily:F.b,marginBottom:4}}>Third Line Assurance</div>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>Five assurance activities verify that AI governance controls are designed and operating effectively across all five governance components.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {CUBE_DATA.assurance.map((a,i)=><Card key={a.id} style={{padding:16,animation:`up ${.3+i*.07}s ease both`,border:"1px solid "+a.color+"25",cursor:"pointer"}} onClick={()=>setSelA(selA===a.id?null:a.id)}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:selA===a.id?10:0}}>
            <IconBox name={a.label} color={a.color} size={16} style={{width:34,height:34,borderRadius:9}}/>
            <div><div style={{fontSize:12,fontWeight:700,color:a.color,fontFamily:F.b,marginBottom:3}}>{a.label}</div>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:0}}>{a.desc}</p></div>
          </div>
          {selA===a.id&&<div style={{background:T.s3,borderRadius:7,padding:"9px 12px",borderLeft:"3px solid "+a.color,animation:"up .2s ease"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>Where in VerisZone</div>
            <div style={{fontSize:11,color:a.color,fontFamily:F.b,fontWeight:600}}>{a.veris}</div>
          </div>}
        </Card>)}
      </div>
    </div>}
    {view==="foundation"&&<div>
      <div style={{background:T.s3,border:"1px solid "+T.border,borderRadius:10,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:4}}>Internal Environment</div>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>Six foundational pillars that underpin the entire AI Governance Cube. These must be established before the five governance components can function effectively.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:16}}>
        {CUBE_DATA.foundation.map((f,i)=><Card key={f.label} style={{padding:15,animation:`up ${.3+i*.07}s ease both`,borderLeft:"4px solid "+f.color}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}><IconBox name={f.label} color={f.color} size={15} style={{width:30,height:30,borderRadius:8}}/>
          <div style={{fontSize:11,fontWeight:700,color:f.color,fontFamily:F.b,lineHeight:1.3}}>{f.label}</div></div>
          <Bar value={[72,74,65,68,77,70][i]} color={f.color} delay={i*60}/>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:4}}>Foundation strength</div>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,marginBottom:10}}>How to Read the AI Governance Cube</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Across the top","AI Objectives"],["Down the side","Governance Components"],["Across the depth","Assurance Activities"]].map(([title,desc])=><div key={title} style={{background:T.s3,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:rc,fontFamily:F.b,marginBottom:4}}>{title}</div>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}>{desc}</div>
          </div>)}
        </div>
      </Card>
    </div>}
  </div>;
}

/* AI Central - enterprise AI transformation command center */
export function PageKnowledge({role,setTab,showToast}){
  const [q,setQ]=useState("");
  const [kind,setKind]=useState("All");
  const surfaces=[
    {title:"Document Templates",kind:"Template",desc:"AI-native governance templates mapped to the CAIO Implementation Kit.",ref:"Templates library",action:()=>setTab("templates")},
    {title:"Active Playbooks",kind:"Playbook",desc:"Role-assigned runbooks for governance and pilot readiness.",ref:"Playbook library",action:()=>setTab("playbook")},
    {title:"ISO & Regulatory Checklists",kind:"Framework",desc:"ISO 42001, ISO 27001 and regulatory control checklists.",ref:"Checklists",action:()=>setTab("checklists")},
    {title:"Governance Academy",kind:"Learning",desc:"Role learning paths whose completion becomes audit evidence.",ref:"Academy",action:()=>setTab("academy")},
    {title:"ISO 42001 Implementation Kit",kind:"Framework",desc:"PDCA 4-phase, 15-step AIMS implementation tracker.",ref:"Implementation",action:()=>setTab("impl")},
    {title:"Compliance Scorecard",kind:"Framework",desc:"Live posture across all regulatory frameworks.",ref:"Compliance",action:()=>setTab("compliance")},
  ];
  const rows=[
    ...surfaces.map(x=>({...x,reuse:null})),
    ...knowledgeAssets.map(k=>({title:k.title,kind:k.kind,desc:`Added by ${k.addedBy}. Used by the Gateway to enrich prompts before any model call.`,ref:k.sourceRef,reuse:k.reuseCount,action:null})),
  ];
  const kinds=["All",...new Set(rows.map(r=>r.kind))];
  const ql=q.trim().toLowerCase();
  const filtered=rows.filter(r=>(kind==="All"||r.kind===kind)&&(!ql||`${r.title} ${r.kind} ${r.desc} ${r.ref}`.toLowerCase().includes(ql)));
  return <div style={{animation:"up .3s ease"}}>
    <SHead title="Knowledge" sub="One intelligent repository - playbooks, templates, policies, frameworks, lessons learned and learning paths. Everything searchable; everything feeds the AI Gateway's enrichment."/>
    <Card style={{padding:"14px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search knowledge, frameworks, lessons, templates..." style={{flex:"1 1 260px",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px",color:T.ink,fontSize:12,fontFamily:F.b,outline:"none"}}/>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {kinds.map(k=><button key={k} onClick={()=>setKind(k)} style={{background:kind===k?AI_GOLD+"20":T.s2,border:`1px solid ${kind===k?AI_GOLD+"55":T.border}`,color:kind===k?AI_GOLD:T.ink3,borderRadius:7,padding:"6px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{k}</button>)}
      </div>
      <Tag label={`${filtered.length} items`} color={AI_GOLD} bg={AI_GOLD+"16"}/>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
      {filtered.map((r,i)=><Card key={r.title} style={{padding:15,animation:`up ${.25+Math.min(i,8)*.04}s ease both`}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginBottom:8}}>
          <Tag label={r.kind} color={T.blue} bg={T.blue+"14"}/>
          {r.reuse!=null&&<span style={{fontSize:9,color:AI_GOLD,fontFamily:F.m,fontWeight:800}}>{r.reuse} reuses</span>}
        </div>
        <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:5}}>{r.title}</div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.55,marginBottom:10}}>{r.desc}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.ref}</span>
          {r.action?<button onClick={r.action} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Open →</button>
          :<button onClick={()=>{showToast&&showToast("Asset available to the Gateway enrichment engine");}} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 11px",color:T.ink3,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>In enrichment</button>}
        </div>
      </Card>)}
    </div>
  </div>;
}


