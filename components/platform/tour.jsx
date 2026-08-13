"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { T, F, AI_GOLD, BrandLogo } from "./core";

/* ── Guided product tour ───────────────────────────────────────────────
   Teaches the VerisZone mental model on the *real* screens. Each step may
   `enter()` — driving the app (role / tab / AI Central view) so the live
   surface sits behind a dimmed vignette — and may `spotlight` a stable DOM
   selector, which we measure and cut a hole around. Concept steps have no
   spotlight and render a centered card with inline SVG art.

   Deterministic + client-safe: no Date.now / Math.random. All measurement
   happens in effects (client only). Drives via the setters passed in `drive`. */

const GOLD_INK = "#241703";

/* one-sentence model, as a compact inline diagram */
const ModelArt = () => (
  <svg viewBox="0 0 460 150" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }} role="img" aria-label="Governed object flowing through the lifecycle, policy cascading down and evidence rising up">
    <defs>
      <marker id="tour-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={AI_GOLD} /></marker>
      <marker id="tour-arrow-up" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7DA3C9" /></marker>
    </defs>
    {/* governed object */}
    <rect x="8" y="58" width="86" height="34" rx="8" fill={AI_GOLD + "22"} stroke={AI_GOLD} strokeWidth="1.2" />
    <text x="51" y="72" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#F4E9EE">GOVERNED</text>
    <text x="51" y="84" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#F4E9EE">OBJECT</text>
    {/* lifecycle rail */}
    <line x1="104" y1="75" x2="330" y2="75" stroke={AI_GOLD} strokeWidth="1.4" markerEnd="url(#tour-arrow)" />
    {["Idea", "Build", "Validate", "Deploy", "Monitor"].map((p, i) => (
      <g key={p}>
        <circle cx={124 + i * 50} cy="75" r="4.5" fill={AI_GOLD} />
        <text x={124 + i * 50} y="59" textAnchor="middle" fontFamily={F.b} fontSize="8.5" fill="#C9D2DE">{p}</text>
      </g>
    ))}
    {/* cascade down */}
    <line x1="360" y1="16" x2="360" y2="66" stroke={AI_GOLD} strokeWidth="1.4" markerEnd="url(#tour-arrow)" />
    <text x="372" y="34" fontFamily={F.b} fontSize="9" fontWeight="700" fill={AI_GOLD}>policy</text>
    <text x="372" y="46" fontFamily={F.b} fontSize="9" fontWeight="700" fill={AI_GOLD}>cascades ↓</text>
    {/* evidence up */}
    <line x1="336" y1="134" x2="336" y2="86" stroke="#7DA3C9" strokeWidth="1.4" markerEnd="url(#tour-arrow-up)" />
    <text x="230" y="128" textAnchor="middle" fontFamily={F.b} fontSize="9" fontWeight="700" fill="#7DA3C9">evidence &amp; risk rise ↑</text>
  </svg>
);

const VOCAB = [
  ["The AI Spine", "One source of truth. Every number a CEO sees traces to the same spine an employee feeds — no contradictory dashboards."],
  ["Lifecycle · 13 phases", "Idea → build → validate → deploy → monitor → retire. Every initiative sits somewhere on it."],
  ["Cascade", "A policy switched on at the org level auto-implements down to CXO, manager and employee — enforced at the gateway."],
  ["Residual risk", "Risk isn't stated, it's computed: inherent − controls = residual, rolled up into the Risk Center."],
  ["Governed surface", "Any capability that can be switched on and access-controlled per org — there are 138 of them."],
];

const ENGINES = [
  ["Risk Center", "Computed residual risk, rolled up"],
  ["Compliance & Standards", "Live framework mappings — EU AI Act, ISO 42001, NIST, OECD"],
  ["Policy engine", "Org policies that cascade to every level"],
  ["Gateway", "The live model, behind policy"],
  ["Agent authority", "Least-privilege capability registry"],
  ["Circuit breaker", "Real-time revocation — EU AI Act Art. 14"],
];

export function GuidedTour({ open, onClose, drive }) {
  const STEPS = [
    {
      key: "welcome", center: true,
      render: () => <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><BrandLogo theme="dark" width={150} /></div>
        <h2 style={h2}>Welcome to VerisZone</h2>
        <p style={{ ...body, maxWidth: 440, margin: "0 auto" }}>
          VerisZone isn't a set of dashboards — it's a <b style={{ color: "#fff" }}>control plane</b>. In two minutes, you'll hold the one idea that makes every screen obvious.
        </p>
      </div>,
    },
    {
      key: "model", center: true,
      render: () => <div>
        <Eyebrow>The mental model</Eyebrow>
        <p style={{ ...body, textAlign: "center", maxWidth: 470, margin: "2px auto 16px" }}>
          VerisZone governs <b style={{ color: "#fff" }}>one object — an AI initiative</b> — as it moves through a 13-phase lifecycle, with policy cascading <b style={{ color: AI_GOLD }}>down</b> and evidence &amp; risk rolling <b style={{ color: "#7DA3C9" }}>up</b>.
        </p>
        <ModelArt />
      </div>,
    },
    {
      key: "vocab", center: true,
      render: () => <div>
        <Eyebrow>Five words unlock everything</Eyebrow>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {VOCAB.map(([t, d]) => <div key={t} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "9px 12px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: AI_GOLD, fontFamily: F.b }}>{t}</div>
            <div style={{ fontSize: 11.5, color: "#C9D2DE", fontFamily: F.b, lineHeight: 1.45, marginTop: 2 }}>{d}</div>
          </div>)}
        </div>
      </div>,
    },
    {
      key: "ceo", enter: () => { drive.switchRole("ceo"); drive.setTab("home"); }, spotlight: ".vz-role-switch",
      title: "Every role is a lens",
      body: "You're now in the CEO cockpit — the top altitude. Strategy, portfolio value and risk posture. The highlighted switcher changes who's looking; the initiative underneath stays the same.",
    },
    {
      key: "altitude", enter: () => { drive.switchRole("employee"); drive.setTab("myworkspace"); }, spotlight: ".vz-side-nav",
      title: "Same platform, employee altitude",
      body: "This is where AI work actually happens — the digital workplace: assistant, academy, my workspace. What an employee does here becomes the evidence that rolls up to that CEO cockpit.",
    },
    {
      key: "aicentral", enter: () => { drive.switchRole("caio"); drive.setTab("aicentral"); drive.setAiCentralView && drive.setAiCentralView("overview"); },
      title: "AI Central — the command center",
      body: "The portfolio command center: every initiative as one governed object, its lifecycle phase, controls, policies and residual risk in a single spine. This is the heart of the platform.",
    },
    {
      key: "engines", center: true,
      render: () => <div>
        <Eyebrow>What makes it governance, not a CMS</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          {ENGINES.map(([t, d]) => <div key={t} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "9px 11px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#fff", fontFamily: F.b }}>{t}</div>
            <div style={{ fontSize: 10.5, color: "#9DA8B8", fontFamily: F.b, lineHeight: 1.4, marginTop: 2 }}>{d}</div>
          </div>)}
        </div>
      </div>,
    },
    {
      key: "finish", center: true,
      render: () => <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>✦</div>
        <h2 style={h2}>You hold the model</h2>
        <p style={{ ...body, maxWidth: 430, margin: "0 auto 4px" }}>
          One governed object · a 13-phase lifecycle · policy down, evidence up. Every screen is a lens on that. Explore freely — switch roles in the top bar to change altitude anytime.
        </p>
      </div>,
    },
  ];

  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const stepRef = useRef(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // reset to first step whenever the tour (re)opens
  useEffect(() => { if (open) { setI(0); stepRef.current = 0; } }, [open]);

  // run the step's enter() side-effects (drive the app) when the step changes
  useEffect(() => {
    if (!open) return;
    stepRef.current = i;
    setRect(null);
    if (step.enter) step.enter();
  }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // measure the spotlight target after navigation settles
  useLayoutEffect(() => {
    if (!open || !step.spotlight) { setRect(null); return; }
    let raf1, raf2, t1, t2;
    const measure = () => {
      const el = document.querySelector(step.spotlight);
      if (el) { const r = el.getBoundingClientRect(); if (r.width && r.height) setRect({ x: r.left, y: r.top, w: r.width, h: r.height }); }
    };
    raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(measure); });
    t1 = setTimeout(measure, 220);
    t2 = setTimeout(measure, 480);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", measure); };
  }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(() => { drive.switchRole("ceo"); drive.setTab("home"); onClose(); }, [drive, onClose]);
  const next = useCallback(() => { if (last) finish(); else setI(v => Math.min(v + 1, STEPS.length - 1)); }, [last, finish, STEPS.length]);
  const prev = useCallback(() => setI(v => Math.max(v - 1, 0)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") finish(); else if (e.key === "ArrowRight") next(); else if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, finish]);

  if (!open) return null;

  const pad = 8;
  const spot = rect ? { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 } : null;

  // card placement: centered for concept steps; near the spotlight otherwise
  let cardStyle;
  if (step.center || !spot) {
    cardStyle = { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(560px, 92vw)" };
  } else {
    const belowRoom = window.innerHeight - (spot.y + spot.h);
    const w = Math.min(400, window.innerWidth - 32);
    let left = Math.min(Math.max(16, spot.x), window.innerWidth - w - 16);
    if (spot.x + spot.w + w + 24 < window.innerWidth && spot.w < 260) left = spot.x + spot.w + 20; // to the right for narrow targets (sidebar)
    const top = belowRoom > 260 ? spot.y + spot.h + 16 : Math.max(16, spot.y - 260);
    cardStyle = { position: "fixed", left, top, width: w };
  }

  return <div aria-modal="true" role="dialog" aria-label="VerisZone guided tour" style={{ position: "fixed", inset: 0, zIndex: 4000, fontFamily: F.b }}>
    {/* dim layer with a hole around the spotlight */}
    {spot
      ? <div style={{ position: "fixed", left: spot.x, top: spot.y, width: spot.w, height: spot.h, borderRadius: 12, boxShadow: "0 0 0 9999px rgba(9,12,22,.74)", border: `2px solid ${AI_GOLD}`, pointerEvents: "none", transition: "all .25s ease" }} />
      : <div style={{ position: "fixed", inset: 0, background: "rgba(9,12,22,.74)", pointerEvents: "none" }} />}

    {/* skip — top right */}
    <button onClick={finish} style={{ position: "fixed", top: 16, right: 18, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", color: "#C9D2DE", fontSize: 11, fontWeight: 800, fontFamily: F.b, borderRadius: 8, padding: "6px 12px", cursor: "pointer", backdropFilter: "blur(6px)" }}>Skip tour ✕</button>

    {/* coach card */}
    <div style={{ ...cardStyle, background: "linear-gradient(180deg,#141a2b,#0e1320)", border: `1px solid ${AI_GOLD}40`, borderRadius: 16, padding: "20px 22px 16px", boxShadow: "0 30px 80px rgba(0,0,0,.6)", color: "#F4E9EE" }}>
      {step.render ? step.render() : <div>
        <Eyebrow>{`Step ${i + 1}`}</Eyebrow>
        <h3 style={{ fontSize: 17, fontWeight: 900, fontFamily: F.b, color: "#fff", margin: "4px 0 8px" }}>{step.title}</h3>
        <p style={body}>{step.body}</p>
      </div>}

      {/* footer: progress dots + nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, idx) => <button key={s.key} onClick={() => setI(idx)} aria-label={`Go to step ${idx + 1}`} style={{ width: idx === i ? 20 : 7, height: 7, borderRadius: 999, border: "none", background: idx === i ? AI_GOLD : "rgba(255,255,255,.22)", cursor: "pointer", transition: "all .2s", padding: 0 }} />)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {i > 0 && <button onClick={prev} style={ghostBtn}>Back</button>}
          <button onClick={next} style={goldBtn}>{last ? "Start exploring" : "Next"}</button>
        </div>
      </div>
    </div>
  </div>;
}

/* launch pill for the top bar */
export function TourButton({ onClick, theme }) {
  const dark = theme !== "light";
  return <button onClick={onClick} title="Guided tour — learn the VerisZone model" aria-label="Start guided tour" style={{ display: "flex", alignItems: "center", gap: 6, background: AI_GOLD + (dark ? "22" : "18"), border: `1px solid ${AI_GOLD}55`, borderRadius: 20, padding: "5px 12px", color: dark ? AI_GOLD : GOLD_INK, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polygon points="15 9 12.5 12.5 9 15 11.5 11.5 15 9" fill="currentColor" stroke="none" /></svg>
    Tour
  </button>;
}

const h2 = { fontSize: 21, fontWeight: 900, fontFamily: F.b, color: "#fff", margin: "0 0 8px" };
const body = { fontSize: 12.5, color: "#C9D2DE", fontFamily: F.b, lineHeight: 1.55, margin: 0 };
const Eyebrow = ({ children }) => <div style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: AI_GOLD, fontWeight: 900, fontFamily: F.m, textAlign: "center" }}>{children}</div>;
const goldBtn = { background: AI_GOLD, border: "none", borderRadius: 9, padding: "8px 16px", color: GOLD_INK, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" };
const ghostBtn = { background: "transparent", border: "1px solid rgba(255,255,255,.2)", borderRadius: 9, padding: "8px 14px", color: "#C9D2DE", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" };
