"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { FRAMEWORKS } from "@/lib/frameworks";
import { UAE_POSTURE_SCORE } from "@/lib/uae-mappings";
import { LANGS, dirFor, t as tr } from "@/lib/i18n";

const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;

export function ArabicGovernanceBriefing({ showToast }) {
  const [lang, setLang] = useState("en");
  const dir = dirFor(lang);
  const ar = lang === "ar";
  const t = (key, en) => tr(lang, key, en);

  // real data
  const total = FRAMEWORKS.length;
  const operational = FRAMEWORKS.filter(f => f.status === "Operational").length;
  const topFw = [
    { key: "fw.uae", en: "UAE / Dubai Data & AI Regulation", score: UAE_POSTURE_SCORE },
    { key: "fw.euai", en: "EU AI Act", score: (FRAMEWORKS.find(f => f.id === "eu-ai-act") || {}).score },
    { key: "fw.iso42001", en: "ISO/IEC 42001", score: (FRAMEWORKS.find(f => f.id === "iso-42001") || {}).score },
    { key: "fw.gdpr", en: "GDPR", score: (FRAMEWORKS.find(f => f.id === "gdpr") || {}).score },
    { key: "fw.nist", en: "NIST AI RMF", score: (FRAMEWORKS.find(f => f.id === "nist-rmf") || {}).score },
  ].filter(f => typeof f.score === "number");
  const controls = [
    { key: "ctrl.breach", en: "Breach-notification workflow", surface: "Breach Notification" },
    { key: "ctrl.dpia", en: "Impact assessment (AIA / DPIA)", surface: "Impact Assessments" },
    { key: "ctrl.provenance", en: "Data provenance & governance", surface: "Data Provenance" },
    { key: "ctrl.gateway", en: "AI Gateway enforcement", surface: "Veris Enforce" },
    { key: "ctrl.residency", en: "Data-residency & egress control", surface: "Veris Enforce · Egress" },
  ];

  const start = ar ? "right" : "left";
  const kpis = [
    [t("gb.frameworks", "Frameworks covered"), String(total), AI_GOLD, t("gb.operational", "Operational") + ` · ${operational}`],
    [t("gb.uaePosture", "UAE / Dubai posture"), `${UAE_POSTURE_SCORE}%`, T.green, t("gb.computed", "Computed from controls")],
    [t("gb.operational", "Operational"), `${operational}/${total}`, T.blue, t("gb.liveControls", "against live controls")],
  ];

  return <div dir={dir} lang={lang} style={{ animation: "up .3s ease", textAlign: start }}>
    {/* header + language toggle */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
      <div style={{ maxWidth: 720 }}>
        <h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: ar ? 0 : "-0.02em" }}>{t("gb.title", "AI Governance Briefing")}</h2>
        <p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", lineHeight: 1.7 }}>{t("gb.sub", "A snapshot of compliance and controls across VerisZone — computed from real controls, never asserted.")}</p>
      </div>
      <div style={{ display: "flex", gap: 4, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3 }}>
        {LANGS.map(l => { const on = lang === l.code; return <button key={l.code} onClick={() => { setLang(l.code); showToast && showToast(l.code === "ar" ? "تم التبديل إلى العربية" : "Switched to English"); }} style={{ background: on ? AI_GOLD : "transparent", border: "none", borderRadius: 8, padding: "6px 13px", color: on ? "#241703" : T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{l.native}</button>; })}
      </div>
    </div>

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${AI_GOLD}12,${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.7 }}>{t("gb.pilotNote", "This is a pilot surface demonstrating Arabic and right-to-left support. The rest of the platform is translated in phases.")}</div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub], i) => <Card key={i} style={{ padding: "14px 16px", textAlign: start }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 28, fontWeight: 900, color: c, fontFamily: F.m, margin: "6px 0 3px" }}>{v}</div>
        <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* top frameworks */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{t("gb.topFw", "Top regulatory frameworks")}</Eyebrow>
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        {topFw.map(f => <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px" }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{t(f.key, f.en)}</span>
          <Pill c={f.score >= 80 ? T.green : f.score >= 65 ? AI_GOLD : T.amber}>{f.score}%</Pill>
        </div>)}
      </div>
    </Card>

    {/* key controls */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{t("gb.keyControls", "Key controls")}</Eyebrow>
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ textAlign: start, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}` }}>{t("gb.control", "Control")}</th>
            <th style={{ textAlign: start, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}` }}>{t("gb.surface", "Surface")}</th>
          </tr></thead>
          <tbody>
            {controls.map(c => <tr key={c.key}>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink, fontSize: 12, fontWeight: 700, fontFamily: F.b, textAlign: start }}>{t(c.key, c.en)}</td>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink3, fontSize: 11.5, fontFamily: F.b, textAlign: start }}>{c.surface}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Card>

    <div style={{ padding: "11px 13px", borderRadius: 10, background: T.s2, border: `1px solid ${T.border}`, fontSize: 11, color: T.ink3, lineHeight: 1.7, fontFamily: F.b, textAlign: start }}>
      {t("gb.honesty", "VerisZone reports control coverage and audit-readiness — not legal compliance, which an external auditor certifies.")}
    </div>
  </div>;
}
