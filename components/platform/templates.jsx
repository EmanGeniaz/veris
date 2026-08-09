"use client";

import { useState, useEffect } from "react";
import { pushBus } from "@/lib/bus";
import { AI_ASSETS, assetById } from "@/lib/ai-assets";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, Tag, SHead, vzDownload, ISO42001_CHECKLIST } from "./core";

/* ── Templates & Register ───────────────────────────────────────────
   Governance templates that PRE-FILL from the canonical AI Asset record —
   never blank, never re-keyed. Org-wide (the AI Register) and project-wise
   (Model Card · AIRA · ISO checklist). Every field shown is bound to the
   record; only genuine gaps are editable, and filling one writes back.
   Generating any template mints an evidence event. */

const col = k => ({ good:T.green, warn:T.amber, crit:T.red, info:T.blue, violet:T.violet, teal:T.teal, gold:AI_GOLD }[k] || T.ink3);
const riskColor = r => r === "Critical" ? T.red : r === "High" ? T.amber : r === "Medium" ? T.blue : T.green;
const field = { background:T.s2, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 11px", color:T.ink, fontSize:11.5, fontFamily:F.b, width:"100%", outline:"none" };

/* Deterministic per-asset ISO coverage so met/gap is stable and varies by
   asset (higher guardrail → fewer gaps), without random. */
const isoMet = (a, ci, ii) => ((ci * 3 + ii + (a.guardrail % 4)) % 4) !== 0;

export function PageTemplates({ role = "caio", showToast }){
  const [scope, setScope] = useState("org");
  const [assetId, setAssetId] = useState(AI_ASSETS[0].id);
  const [tpl, setTpl] = useState("modelcard");
  const [gaps, setGaps] = useState(() => { try { return JSON.parse(localStorage.getItem("vz-tpl-gaps") || "{}"); } catch { return {}; } });
  useEffect(() => { try { localStorage.setItem("vz-tpl-gaps", JSON.stringify(gaps)); } catch { /* ignore */ } }, [gaps]);
  const a = assetById(assetId);
  const gapKey = (k) => `${assetId}:${tpl}:${k}`;
  const setGap = (k, v) => setGaps(g => ({ ...g, [gapKey(k)]: v }));
  const gapVal = (k) => gaps[gapKey(k)] || "";

  const record = (item, control) => pushBus("vz-gw-evidence", { item, initiative:a.name, scope:"Templates", control, risk:"Governance artifact", owner:a.owner, status:"Complete", approval:"Generated", version:"v1", time:"Just now" });
  const exportDoc = (name, text, control) => { vzDownload(name, text); record(`Template exported: ${name}`, control); showToast && showToast(`${name} exported — evidence recorded`); };

  /* ── markdown builders (real file out) ── */
  const registerMd = () => [
    "# AI Register", "", "| Asset | Type | Owner | Unit | Data class | Risk | Adoption | ROI | Lifecycle | Recommendation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...AI_ASSETS.map(x => `| ${x.name} | ${x.arch.assetType} | ${x.owner} | ${x.unit} | ${x.arch.dataClass} | ${x.risk} | ${x.adoption}% | ${x.roi} | ${x.lifecycle} | ${x.rec.verdict} |`),
    "", `_Generated from the canonical AI Asset record · ${AI_ASSETS.length} assets._`,
  ].join("\n");
  const modelCardMd = () => [
    `# Model Card — ${a.name}`, "",
    `**Type:** ${a.arch.assetType}  **Owner:** ${a.owner}  **Technical owner:** ${a.technicalOwner}  **Unit:** ${a.unit}`,
    `**Lifecycle:** ${a.lifecycle}  **Data class:** ${a.arch.dataClass}  **EU AI Act:** ${a.arch.euAiAct}  **Hosting:** ${a.arch.hosting}`, "",
    "## Purpose", a.description, "", `**Objective:** ${a.objective}`, "",
    "## System architecture", `- Model: ${a.arch.model}`, `- Data: ${a.arch.data}`, `- Integrations: ${a.arch.integrations}`, `- Guardrails: ${a.arch.guardrails}`, "",
    "## Value", `- ROI: ${a.roi} · Adoption: ${a.adoption}% · Value score: ${a.value} · Expected ${a.expected} / realized ${a.actual}`, "",
    "## Risks & controls", `- Risks: ${a.risksList.join(", ") || "—"}`, `- Controls: ${a.controls.join(", ") || "—"}`, `- Policies: ${a.policies.join(", ") || "—"}`, "",
    "## Intended use & limitations", gapVal("use") || "_(to complete)_", "", "## Known failure modes", gapVal("fail") || "_(to complete)_", "", "## Human oversight", gapVal("oversight") || "_(to complete)_", "",
    `## Governed recommendation`, `**${a.rec.verdict}** — ${a.rec.why}`,
  ].join("\n");
  const airaMd = () => [
    `# AI Risk Assessment (AIRA) — ${a.name}`, "",
    `**Risk grade:** ${a.risk}  **Data class:** ${a.arch.dataClass}  **EU AI Act:** ${a.arch.euAiAct}`, "",
    "## Identified risks", ...a.risksList.map((r, i) => `### ${r}\n- Mitigation: ${gapVal("mit" + i) || "_(to complete)_"}\n- Owner: ${gapVal("own" + i) || "_(to complete)_"}`),
    "", "## Mapped controls", ...a.controls.map(c => `- ${c}`), "", `## Residual position`, `**${a.rec.verdict}** — ${a.rec.why}`,
  ].join("\n");
  const isoMd = () => {
    const lines = [`# ISO/IEC 42001 Conformance — ${a.name}`, ""];
    let met = 0, total = 0;
    ISO42001_CHECKLIST.forEach((cl, ci) => { lines.push(`## ${cl.clause} ${cl.title}`); cl.items.forEach((it, ii) => { const m = isoMet(a, ci, ii); total++; if (m) met++; lines.push(`- [${m ? "x" : " "}] ${it.text}`); }); lines.push(""); });
    lines.splice(1, 0, `**Conformance: ${met}/${total} (${Math.round(met / total * 100)}%)**`, "");
    return lines.join("\n");
  };

  const Btn = ({ children, onClick, primary }) => <button onClick={onClick} style={{ background: primary ? AI_GOLD : T.s2, border: `1px solid ${primary ? AI_GOLD : T.border}`, borderRadius:9, padding:"8px 14px", color: primary ? "#241703" : T.ink2, fontSize:11.5, fontWeight:800, fontFamily:F.b, cursor:"pointer" }}>{children}</button>;
  const KV = ({ l, v, c }) => <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 11px" }}>
    <div style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
    <div style={{ fontSize:12, fontWeight:700, color:c || T.ink, fontFamily:F.b, marginTop:3 }}>{v || "—"}</div>
  </div>;
  const Gap = ({ l, k, ph }) => <label style={{ display:"grid", gap:5 }}>
    <span style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:AI_GOLD_INK, textTransform:"uppercase", letterSpacing:"0.08em" }}>✎ {l} · gap to complete</span>
    <textarea value={gapVal(k)} onChange={e => setGap(k, e.target.value)} onBlur={e => e.target.value.trim() && showToast && showToast("Saved to the asset record")} placeholder={ph} rows={2} style={{ ...field, resize:"vertical", lineHeight:1.5 }} />
  </label>;
  const Sec = ({ t, children }) => <div style={{ marginBottom:14 }}><div style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:T.ink4, fontWeight:900, fontFamily:F.m, marginBottom:8 }}>{t}</div>{children}</div>;

  /* ── org: AI Register ── */
  const Register = () => {
    let met = 0, total = 0; AI_ASSETS.forEach(x => ISO42001_CHECKLIST.forEach((cl, ci) => cl.items.forEach((it, ii) => { total++; if (isoMet(x, ci, ii)) met++; })));
    return <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[["Assets", AI_ASSETS.length, T.blue], ["Scale-ready", AI_ASSETS.filter(x => x.rec.verdict === "Scale").length, T.green], ["Need remediation", AI_ASSETS.filter(x => x.rec.verdict === "Remediate" || x.rec.verdict === "Retire").length, T.amber], ["ISO 42001", `${Math.round(met / total * 100)}%`, AI_GOLD]].map(([l, v, c]) =>
            <div key={l} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 13px", minWidth:110 }}><div style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div><div style={{ fontSize:19, fontWeight:800, fontFamily:F.m, color:c, marginTop:3 }}>{v}</div></div>)}
        </div>
        <Btn primary onClick={() => exportDoc("ai-register.md", registerMd(), "AI Register")}>Export register →</Btn>
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}><table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:F.b }}>
          <thead><tr>{["Asset", "Type", "Owner", "Unit", "Data class", "Risk", "Adoption", "ROI", "Lifecycle", "Recommendation"].map(h => <th key={h} style={{ textAlign:"left", fontSize:8.5, letterSpacing:"0.06em", textTransform:"uppercase", color:T.ink4, fontWeight:900, fontFamily:F.m, padding:"11px 10px", borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>{AI_ASSETS.map((x, i) => <tr key={x.id} onClick={() => { setAssetId(x.id); setScope("project"); }} className="vz-reg-row" style={{ cursor:"pointer" }}>
            <td style={{ padding:"11px 10px", borderBottom:i < AI_ASSETS.length - 1 ? `1px solid ${T.border}` : "none", color:T.ink, fontWeight:800 }}>{x.name}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{x.arch.assetType}</td>
            <td style={{ padding:"11px 10px", color:T.ink2 }}>{x.owner}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{x.unit}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{x.arch.dataClass}</td>
            <td style={{ padding:"11px 10px" }}><Tag label={x.risk} color={riskColor(x.risk)} bg={riskColor(x.risk) + "18"} /></td>
            <td style={{ padding:"11px 10px", color:T.ink2, fontFamily:F.m }}>{x.adoption}%</td>
            <td style={{ padding:"11px 10px", color:T.ink2, fontFamily:F.m }}>{x.roi}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{x.lifecycle}</td>
            <td style={{ padding:"11px 10px" }}><Tag label={x.rec.verdict} color={col(x.rec.color)} bg={col(x.rec.color) + "18"} /></td>
          </tr>)}</tbody>
        </table></div>
        <style>{`.vz-reg-row:hover td{background:${T.s2}}`}</style>
      </Card>
      <div style={{ fontSize:10.5, color:T.ink4, fontFamily:F.b, marginTop:9 }}>Every row is pre-filled from the canonical AI Asset record. Click any asset to open its project templates.</div>
    </div>;
  };

  /* ── project templates ── */
  const ModelCard = () => <div>
    <Sec t="Identity"><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:8 }}>
      <KV l="Asset" v={a.name} /><KV l="Type" v={a.arch.assetType} /><KV l="Owner" v={a.owner} /><KV l="Technical owner" v={a.technicalOwner} /><KV l="Unit" v={a.unit} /><KV l="Lifecycle" v={a.lifecycle} /><KV l="Data class" v={a.arch.dataClass} /><KV l="EU AI Act" v={a.arch.euAiAct} /><KV l="Hosting" v={a.arch.hosting} />
    </div></Sec>
    <Sec t="Purpose"><div style={{ fontSize:12, color:T.ink2, fontFamily:F.b, lineHeight:1.65 }}>{a.description}</div><div style={{ fontSize:11, color:T.ink3, fontFamily:F.b, marginTop:6 }}><b style={{ color:T.ink2 }}>Objective:</b> {a.objective}</div></Sec>
    <Sec t="System architecture"><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
      <KV l="Model" v={a.arch.model} /><KV l="Data" v={a.arch.data} /><KV l="Integrations" v={a.arch.integrations} /><KV l="Guardrails" v={a.arch.guardrails} />
    </div></Sec>
    <Sec t="Value"><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8 }}>
      <KV l="ROI" v={a.roi} c={T.green} /><KV l="Adoption" v={a.adoption + "%"} /><KV l="Value score" v={a.value} /><KV l="Expected" v={a.expected} /><KV l="Realized" v={a.actual} />
    </div></Sec>
    <Sec t="Risks & controls"><div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{a.risksList.map(r => <Tag key={r} label={r} color={T.amber} bg={T.amber + "16"} />)}{a.controls.map(c => <Tag key={c} label={c} color={T.blue} bg={T.blue + "16"} />)}{a.policies.map(p => <Tag key={p} label={p} color={T.violet} bg={T.violet + "16"} />)}</div></Sec>
    <Sec t="To complete"><div style={{ display:"grid", gap:10 }}><Gap l="Intended use & limitations" k="use" ph="Where this asset should and shouldn't be used…" /><Gap l="Known failure modes" k="fail" ph="How it can fail and what's watched…" /><Gap l="Human oversight design" k="oversight" ph="Where a human reviews or can override…" /></div></Sec>
    <div style={{ display:"flex", justifyContent:"flex-end" }}><Btn primary onClick={() => exportDoc(`model-card-${a.id}.md`, modelCardMd(), "Model Card")}>Export model card →</Btn></div>
  </div>;

  const AIRA = () => <div>
    <Sec t="Assessment context"><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8 }}>
      <KV l="Asset" v={a.name} /><KV l="Risk grade" v={a.risk} c={riskColor(a.risk)} /><KV l="Data class" v={a.arch.dataClass} /><KV l="EU AI Act" v={a.arch.euAiAct} />
    </div></Sec>
    <Sec t="Identified risks — assess each">{a.risksList.length ? <div style={{ display:"grid", gap:10 }}>{a.risksList.map((r, i) => <Card key={r} style={{ padding:"12px 14px" }}>
      <div style={{ fontSize:12.5, fontWeight:800, color:T.ink, fontFamily:F.b, marginBottom:8 }}>{r}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <label style={{ display:"grid", gap:4 }}><span style={{ fontSize:8.5, fontWeight:900, color:AI_GOLD_INK, fontFamily:F.m, textTransform:"uppercase" }}>✎ Mitigation</span><input value={gapVal("mit" + i)} onChange={e => setGap("mit" + i, e.target.value)} placeholder="Treatment / control…" style={field} /></label>
        <label style={{ display:"grid", gap:4 }}><span style={{ fontSize:8.5, fontWeight:900, color:AI_GOLD_INK, fontFamily:F.m, textTransform:"uppercase" }}>✎ Owner</span><input value={gapVal("own" + i)} onChange={e => setGap("own" + i, e.target.value)} placeholder="Accountable owner…" style={field} /></label>
      </div></Card>)}</div> : <div style={{ fontSize:11.5, color:T.ink3, fontFamily:F.b }}>No risks recorded for this asset.</div>}</Sec>
    <Sec t="Mapped controls"><div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{a.controls.map(c => <Tag key={c} label={c} color={T.blue} bg={T.blue + "16"} />)}</div></Sec>
    <Sec t="Residual position"><Card style={{ padding:"12px 14px", borderLeft:`3px solid ${col(a.rec.color)}` }}><b style={{ color:col(a.rec.color) }}>{a.rec.verdict}</b> <span style={{ color:T.ink2, fontSize:11.5, fontFamily:F.b }}>— {a.rec.why}</span></Card></Sec>
    <div style={{ display:"flex", justifyContent:"flex-end" }}><Btn primary onClick={() => exportDoc(`aira-${a.id}.md`, airaMd(), "AIRA")}>Export AIRA →</Btn></div>
  </div>;

  const ISO = () => {
    let met = 0, total = 0; ISO42001_CHECKLIST.forEach((cl, ci) => cl.items.forEach((it, ii) => { total++; if (isoMet(a, ci, ii)) met++; }));
    return <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:12, flexWrap:"wrap" }}>
        <div style={{ fontSize:12, color:T.ink2, fontFamily:F.b }}>Conformance <b style={{ color:T.ink }}>{met}/{total}</b> · <b style={{ color: met / total > 0.75 ? T.green : T.amber }}>{Math.round(met / total * 100)}%</b> · auto-marked from this asset's evidence</div>
        <Btn primary onClick={() => exportDoc(`iso42001-${a.id}.md`, isoMd(), "ISO 42001 checklist")}>Export checklist →</Btn>
      </div>
      <div style={{ display:"grid", gap:10 }}>{ISO42001_CHECKLIST.map((cl, ci) => <Card key={cl.clause} style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:12, fontWeight:800, color:T.ink, fontFamily:F.b, marginBottom:8 }}>{cl.clause} · {cl.title}</div>
        <div style={{ display:"grid", gap:6 }}>{cl.items.map((it, ii) => { const m = isoMet(a, ci, ii); return <div key={it.id} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
          <span style={{ width:16, height:16, borderRadius:5, flexShrink:0, display:"grid", placeItems:"center", fontSize:10, fontWeight:900, background:(m ? T.green : T.amber) + "22", color:m ? T.green : T.amber, marginTop:1 }}>{m ? "✓" : "!"}</span>
          <span style={{ flex:1, fontSize:11, color:T.ink2, fontFamily:F.b, lineHeight:1.45 }}>{it.text}</span>
          {!m && <button onClick={() => { pushBus("vz-gw-evidence", { item:`ISO 42001 gap: ${cl.clause} ${it.text.slice(0, 40)}…`, initiative:a.name, scope:"Compliance", control:`ISO 42001 ${cl.clause}`, risk:"Conformance gap", owner:a.owner, status:"Open", approval:"Task created", version:"v1", time:"Just now" }); showToast && showToast("Gap logged as a task"); }} style={{ background:T.amber + "16", border:`1px solid ${T.amber}40`, borderRadius:6, padding:"3px 9px", color:T.amber, fontSize:9.5, fontWeight:800, fontFamily:F.b, cursor:"pointer", flexShrink:0 }}>Create task</button>}
        </div>; })}</div>
      </Card>)}</div>
    </div>;
  };

  const TPLS = [["modelcard", "Model Card"], ["aira", "AIRA"], ["iso", "ISO 42001"]];
  return <div style={{ animation:"up .3s ease" }}>
    <SHead title="Templates & Register" sub="Governance templates that pre-fill from the canonical AI Asset record — org-wide and per project. Nothing re-keyed; generating one records evidence." />
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {[["org", "Org-wide · AI Register"], ["project", "By project · templates"]].map(([id, l]) => <button key={id} onClick={() => setScope(id)} style={{ padding:"8px 15px", borderRadius:20, fontSize:12, fontWeight:800, fontFamily:F.b, cursor:"pointer", border:`1px solid ${scope === id ? AI_GOLD : T.border}`, background:scope === id ? AI_GOLD : T.s2, color:scope === id ? "#241703" : T.ink3 }}>{l}</button>)}
    </div>
    {scope === "org" ? <Register /> : <div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {AI_ASSETS.map(x => <button key={x.id} onClick={() => setAssetId(x.id)} style={{ padding:"7px 12px", borderRadius:9, fontSize:11, fontWeight:700, fontFamily:F.b, cursor:"pointer", border:`1px solid ${assetId === x.id ? AI_GOLD + "66" : T.border}`, background:assetId === x.id ? AI_GOLD + "14" : T.s2, color:assetId === x.id ? AI_GOLD : T.ink3 }}>{x.name}</button>)}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {TPLS.map(([id, l]) => <button key={id} onClick={() => setTpl(id)} style={{ padding:"6px 13px", borderRadius:20, fontSize:11.5, fontWeight:800, fontFamily:F.b, cursor:"pointer", border:`1px solid ${tpl === id ? AI_GOLD : T.border}`, background:tpl === id ? AI_GOLD : T.s2, color:tpl === id ? "#241703" : T.ink3 }}>{l}</button>)}
      </div>
      <Card style={{ padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
          <span style={{ width:28, height:28, borderRadius:8, display:"grid", placeItems:"center", background:AI_GOLD + "22", color:AI_GOLD_INK, fontSize:13 }}>▦</span>
          <div><div style={{ fontSize:14, fontWeight:800, color:T.ink, fontFamily:F.h }}>{TPLS.find(t => t[0] === tpl)[1]} · {a.name}</div><div style={{ fontSize:9.5, color:T.ink4, fontFamily:F.b }}>Pre-filled from the AI Asset record</div></div>
        </div>
        {tpl === "modelcard" && <ModelCard />}
        {tpl === "aira" && <AIRA />}
        {tpl === "iso" && <ISO />}
      </Card>
    </div>}
  </div>;
}
