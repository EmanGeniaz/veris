"use client";
/* ── Idea → Value Trace ────────────────────────────────────────────────────
   One initiative, shown as a single continuous thread from the idea that
   started it, down through the 13 governed lifecycle phases, to the value it
   realises. The governance that a GRC tool scatters across modules — the
   models registered, risks raised, policies mapped, controls selected, and
   decisions taken — attaches here at the phase where it entered, so you watch
   governance accumulate along the thread instead of inferring it from joins.

   Everything is READ from the same canonical data every other surface uses
   (AC_PHASES, riskRegister, POLICY_REGISTER, acPmo, MODEL_REGISTRY) — nothing
   is asserted. Pure derivation, deterministic, SSR-safe. */

import { AC_PHASES, riskRegister, POLICY_REGISTER, acPmo } from "@/lib/platform-models";
import { T, F, AI_GOLD, AI_GOLD_INK, MODEL_REGISTRY, Card, Tag, SHead } from "./core";

/* $-string → number in $M ("$4.8M" → 4.8, "-$0.2M" → -0.2). */
const money = s => {
  if (s == null) return 0;
  const neg = /^-|\(/.test(String(s));
  const n = parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  return neg ? -n : n;
};
const usd = n => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(Math.abs(n) < 10 ? 1 : 0) + "M";

/* Fraction of total value each phase is expected to realise — value lands late
   (pilot → scale). Cumulative gives the accrual curve. */
const VALUE_WEIGHT = [0, 0, 0, 0, 0, 0, 0, 0.05, 0.15, 0.25, 0.2, 0.35, 0];
const cumWeights = (() => { let a = [], s = 0; for (const w of VALUE_WEIGHT) { s += w; a.push(s); } return a; })();

/* Where each kind of governance first attaches to the thread. Deterministic. */
const GATE_PHASES = [1, 4, 7, 11]; // business case · governance · pilot · scale

function attachmentsFor(ini, idx) {
  const id = ini.id;
  const out = { models: [], risks: [], policies: [], controls: [], decisions: [] };
  if (idx === 3) out.models = MODEL_REGISTRY.filter(m => m.initiativeId === id);
  if (idx === 4) {
    out.risks = riskRegister.filter(r => r.initiativeId === id);
    out.policies = POLICY_REGISTER.filter(p => Array.isArray(p.initiativeIds) && p.initiativeIds.includes(id));
    out.controls = (ini.controls || []).slice();
  }
  const decs = (acPmo[id] && acPmo[id].decisions) || [];
  const gi = GATE_PHASES.indexOf(idx);
  if (gi >= 0) out.decisions = decs.filter((_, k) => k % GATE_PHASES.length === gi);
  return out;
}

const phaseState = (ini, idx) => idx < ini.phaseIndex ? "done" : idx === ini.phaseIndex ? "active" : "future";
function artifactDone(ini, idx, artIdx) {
  if (idx < ini.phaseIndex) return "done";
  if (idx > ini.phaseIndex) return "todo";
  if (artIdx < (ini.phaseArtifactsDone || 0)) return "done";
  if (ini.blockedBy && artIdx === (ini.phaseArtifactsDone || 0)) return "blocked";
  return "todo";
}

const STATE_C = { done: T.green, active: AI_GOLD, future: T.ink4 };

export function InitiativeTrace({ initiative }) {
  const ini = initiative;
  if (!ini || ini.phaseIndex == null) return <SHead title="Idea → Value" sub="Select a governed initiative to trace." />;

  const target = money(ini.expected), realised = money(ini.actual);
  const realisedFrac = cumWeights[ini.phaseIndex] || 0;

  // running governance tally as the thread descends
  const totals = { models: 0, risks: 0, policies: 0, controls: 0, decisions: 0 };
  AC_PHASES.forEach((_, idx) => {
    const a = attachmentsFor(ini, idx);
    totals.models += a.models.length; totals.risks += a.risks.length;
    totals.policies += a.policies.length; totals.controls += a.controls.length;
    totals.decisions += a.decisions.length;
  });
  const govTotal = totals.models + totals.risks + totals.policies + totals.controls + totals.decisions;

  const lbl = { fontSize: 9, fontWeight: 900, letterSpacing: "0.11em", textTransform: "uppercase", color: T.ink4, fontFamily: F.m };
  const goldWash = { background: AI_GOLD + "0e", border: `1px solid ${AI_GOLD}38` };

  /* ── the two ends + the middle summary ── */
  const IdeaCard = (
    <Card style={{ padding: "16px 18px", ...goldWash }}>
      <div style={lbl}>The idea</div>
      <div style={{ marginTop: 10, display: "grid", gap: 9 }}>
        {[["Problem", ini.problem], ["Vision", ini.vision], ["Objective", ini.objective]].filter(([, v]) => v).map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 8.5, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 12, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${T.border}`, display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>
        <span><b style={{ color: T.ink2 }}>Sponsor</b> {ini.sponsor}</span>
        <span><b style={{ color: T.ink2 }}>Owner</b> {ini.businessOwner}</span>
        <span><b style={{ color: T.ink2 }}>Since</b> {ini.timeline}</span>
      </div>
    </Card>
  );

  const spark = (() => {
    const W = 168, H = 42, n = cumWeights.length;
    const pts = cumWeights.map((c, i) => [i / (n - 1) * W, H - c * (H - 4) - 2]);
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const cx = ini.phaseIndex / (n - 1) * W, cy = H - realisedFrac * (H - 4) - 2;
    const solid = pts.filter((_, i) => i <= ini.phaseIndex).map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        <path d={path} fill="none" stroke={T.ink4} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" />
        <path d={solid} fill="none" stroke={AI_GOLD} strokeWidth="2.2" />
        <circle cx={cx} cy={cy} r="3.2" fill={AI_GOLD} stroke={T.card} strokeWidth="1.5" />
      </svg>
    );
  })();

  const ValueCard = (
    <Card style={{ padding: "16px 18px", ...goldWash }}>
      <div style={lbl}>The value</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: T.green, fontFamily: F.m, lineHeight: 1 }}>{usd(realised)}</span>
        <span style={{ fontSize: 12, color: T.ink3, fontFamily: F.b }}>realised of {usd(target)} target</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 9, fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>
        <span><b style={{ color: money(ini.roi) < 0 ? T.amber : T.green }}>{ini.roi}</b> ROI to date</span>
        <span><b style={{ color: T.ink2 }}>{ini.adoption}%</b> adoption</span>
        <span><b style={{ color: T.ink2 }}>{ini.valueScore}</b> value score</span>
      </div>
      {spark}
      <div style={{ fontSize: 8.5, color: T.ink4, fontFamily: F.m, letterSpacing: "0.06em", textTransform: "uppercase" }}>Projected accrual · ● today</div>
    </Card>
  );

  const GovCard = (
    <Card style={{ padding: "16px 18px" }}>
      <div style={lbl}>Governance accumulated</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: T.ink, fontFamily: F.m, lineHeight: 1, marginTop: 8 }}>{govTotal}</div>
      <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, marginTop: 1 }}>objects now governing this one initiative</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 11 }}>
        {[["models", totals.models], ["risks", totals.risks], ["policies", totals.policies], ["controls", totals.controls], ["decisions", totals.decisions]].filter(([, n]) => n).map(([k, n]) => (
          <span key={k} style={{ fontSize: 9.5, fontWeight: 800, fontFamily: F.m, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 8px" }}>{n} {k}</span>
        ))}
      </div>
      <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${T.border}`, fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>
        Now at <b style={{ color: AI_GOLD_INK }}>{AC_PHASES[ini.phaseIndex].name}</b> — phase {ini.phaseIndex + 1} of {AC_PHASES.length}
        {ini.blockedBy && <div style={{ marginTop: 5, color: T.amber, fontWeight: 700 }}>Blocked: {ini.blockedBy}</div>}
      </div>
    </Card>
  );

  /* ── one attachment group of chips/rows ── */
  const AttachGroup = ({ label, children }) => (
    <div style={{ marginTop: 8 }}>
      <div style={{ ...lbl, fontSize: 8.5, color: AI_GOLD_INK, marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
    </div>
  );
  const chip = (txt, key) => <span key={key} style={{ fontSize: 10, fontWeight: 700, fontFamily: F.b, color: T.ink2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "4px 9px" }}>{txt}</span>;

  return (
    <div>
      <SHead title="Idea → Value" sub={`The whole life of ${ini.name} on one thread — governance computed from the work, accumulating as the initiative moves toward value.`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12, marginBottom: 20 }}>
        {IdeaCard}{GovCard}{ValueCard}
      </div>

      {/* ── the thread ── */}
      <Card style={{ padding: "20px 20px 8px" }}>
        <div style={{ ...lbl, marginBottom: 14 }}>The thread · idea → value</div>

        <Anchor color={AI_GOLD} title="The idea" sub={ini.problem ? ini.problem.slice(0, 96) + (ini.problem.length > 96 ? "…" : "") : ini.vision} />

        {AC_PHASES.map((ph, idx) => {
          const st = phaseState(ini, idx);
          const c = STATE_C[st];
          const at = attachmentsFor(ini, idx);
          const hasGov = at.models.length || at.risks.length || at.policies.length || at.controls.length || at.decisions.length;
          const last = idx === AC_PHASES.length - 1;
          return (
            <div key={ph.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr", columnGap: 4 }}>
              {/* rail */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "absolute", top: 0, bottom: last ? "50%" : 0, width: 2, background: st === "future" ? T.border : c + "66" }} />
                <div style={{ position: "relative", marginTop: 6, width: st === "active" ? 15 : 12, height: st === "active" ? 15 : 12, borderRadius: "50%", background: st === "done" ? c : T.card, border: `2px solid ${c}`, boxShadow: st === "active" ? `0 0 0 4px ${AI_GOLD}22` : "none", zIndex: 1 }} />
              </div>
              {/* body */}
              <div style={{ paddingBottom: hasGov ? 16 : 12, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.ink4, letterSpacing: "0.06em" }}>PHASE {ph.order}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: st === "future" ? T.ink3 : T.ink, fontFamily: F.b }}>{ph.name}</span>
                  <Tag label={st === "done" ? "Complete" : st === "active" ? "In progress" : "Upcoming"} color={c} bg={c + "18"} />
                  <span style={{ marginLeft: "auto", fontSize: 9.5, color: T.ink4, fontFamily: F.m }}>{ph.raci?.accountable}</span>
                </div>
                <div style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.45, marginTop: 3 }}>{ph.objective}</div>

                {/* artifacts / gates */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                  {ph.deliverables.map((d, ai) => {
                    const ds = artifactDone(ini, idx, ai);
                    const dc = ds === "done" ? T.green : ds === "blocked" ? T.amber : T.ink4;
                    return (
                      <span key={ai} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, fontWeight: 600, fontFamily: F.b, color: ds === "todo" ? T.ink4 : T.ink2, background: ds === "done" ? T.green + "12" : ds === "blocked" ? T.amber + "12" : T.s2, border: `1px solid ${ds === "done" ? T.green + "35" : ds === "blocked" ? T.amber + "40" : T.border}`, borderRadius: 6, padding: "3px 8px" }}>
                        <span style={{ color: dc, fontWeight: 900 }}>{ds === "done" ? "✓" : ds === "blocked" ? "!" : "○"}</span>{d}
                      </span>
                    );
                  })}
                </div>

                {/* governance that entered here */}
                {hasGov ? (
                  <div style={{ marginTop: 10, borderLeft: `2px solid ${AI_GOLD}44`, paddingLeft: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, letterSpacing: "0.08em", textTransform: "uppercase" }}>+ Governance entered the thread</div>
                    {at.models.length > 0 && <AttachGroup label="Models registered">{at.models.map((m, i) => chip(m.name || m.id, "m" + i))}</AttachGroup>}
                    {at.risks.length > 0 && (
                      <AttachGroup label="Risks raised">
                        {at.risks.map((r, i) => (
                          <span key={"r" + i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, fontFamily: F.b, color: T.ink2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "4px 9px" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: /crit|high/i.test(r.level) ? T.red : T.amber }} />{r.id} {r.title}
                          </span>
                        ))}
                      </AttachGroup>
                    )}
                    {at.policies.length > 0 && <AttachGroup label="Policies mapped">{at.policies.map((p, i) => chip(p.name || p.title || p.id, "p" + i))}</AttachGroup>}
                    {at.controls.length > 0 && <AttachGroup label="Controls selected">{at.controls.map((c2, i) => chip(c2, "c" + i))}</AttachGroup>}
                    {at.decisions.length > 0 && (
                      <AttachGroup label="Decisions taken">
                        {at.decisions.map((d, i) => (
                          <div key={"d" + i} style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", width: "100%" }}>
                            <b style={{ color: T.ink }}>{d.decision}</b>
                            <span style={{ color: T.ink4 }}> — {d.by}{d.date ? " · " + d.date : ""}</span>
                            {d.rationale && <div style={{ color: T.ink3, marginTop: 2 }}>{d.rationale}</div>}
                          </div>
                        ))}
                      </AttachGroup>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        <Anchor color={T.green} title="The value" sub={`${usd(realised)} realised of ${usd(target)} · ${ini.roi} ROI · ${ini.adoption}% adoption`} />
      </Card>
    </div>
  );
}

/* the gold/green bookends of the thread */
function Anchor({ color, title, sub }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", columnGap: 4, alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 15, height: 15, borderRadius: 4, background: color, boxShadow: `0 0 0 4px ${color}22`, transform: "rotate(45deg)" }} />
      </div>
      <div style={{ padding: "4px 0 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color, fontFamily: F.b }}>{title}</div>
        <div style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}
