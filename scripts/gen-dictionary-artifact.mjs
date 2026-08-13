/* Generates the shareable VerisZone Dictionary artifact (standalone HTML) from
   the canonical lib/platform-dictionary.js + captured surface screenshots.
   Re-run to update the artifact whenever the dictionary changes:
     node scripts/gen-dictionary-artifact.mjs
   Output: scratchpad/veriszone-dictionary.html (publish via the Artifact tool). */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PLATFORM_DICTIONARY, DICT_CATEGORIES } from "../lib/platform-dictionary.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = process.env.SHOT_DIR || join(__dir, "dictionary-shots");
const OUT = process.env.OUT || join(__dir, "..", "veriszone-dictionary.html");

/* ── real VerisZone logo → data URI (blue+gold on transparent, for the dark header) ── */
const LOGO_PATH = join(__dir, "..", "public", "brand", "veriszone-dark-transparent.png");
const LOGO = existsSync(LOGO_PATH) ? `data:image/png;base64,${readFileSync(LOGO_PATH).toString("base64")}` : "";

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ── available surface screenshots (surf-<slug>.jpg from the capture walk) + legacy keyed shots ── */
const surfFiles = readdirSync(SHOT_DIR).filter(f => f.startsWith("surf-") && f.endsWith(".jpg"));
const surfSlugs = new Set(surfFiles.map(f => f.replace(/^surf-/, "").replace(/\.jpg$/, "")));

/* alias: dictionary term slug → captured surface slug (for names that differ from nav labels) */
const ALIAS = {
  "hitl-gates": "human-in-the-loop-gates", "human-in-the-loop-hitl": "human-in-the-loop-gates",
  "human-in-the-loop-queue": "human-in-the-loop-queue", "veris-enforce": "veris-enforce",
  "my-ai-assistant": "my-ai-assistant", "ai-hub": "ai-hub", "governance-academy": "governance-academy",
  "glossary-learning": "governance-academy", "model-registry": "model-registry", "ai-model-registry": "model-registry",
  "compliance-standards": "compliance-standards", "policies-standards": "compliance-standards",
  "global-framework-library": "global-framework-library", "control-library": "common-control-library",
  "compliance-scorecard": "compliance-scorecard", "compliance-checklists": "compliance-checklists",
  "gap-analysis-dashboard": "gap-analysis-dashboard", "isms-scope-builder": "isms-scope-builder",
  "iso-27001-workspace": "iso-27001-workspace", "knowledge": "knowledge", "my-ai-ideas": "my-ai-ideas",
  "ai-opportunity-intake": "ai-opportunity-intake", "ai-use-case-pipeline": "ai-use-case-pipeline",
  "cxo-platform-strategy": "cxo-platform-strategy", "ai-governance-cube": "ai-governance-cube",
  "governance-compliance-caio": "governance-compliance", "governance-library": "governance-library",
  "reports": "reports", "decisions": "decisions", "playbook": "playbook", "ai-playbook": "ai-playbook",
  "trust-center": "trust-center", "integrations": "integrations", "admin-portal": "admin-portal",
  "risk-center": "risk-center", "risk-register": "risk-register", "risk-appetite": "risk-appetite",
  "controls-kris": "controls-kris", "audit-readiness": "audit-readiness", "impact-assessment-aia": "impact-assessment-aia",
  "dpia": "dpia-assessments", "enterprise-risk": "enterprise-risk", "regulatory-map": "regulatory-map",
  "contracts-ip": "contracts-ip", "conformity": "conformity", "consent-rights": "consent-rights",
  "data-map-residency": "data-map-residency", "platform-health": "platform-health",
  "gateway-routing": "gateway-routing", "cost-performance": "cost-performance", "investment-portfolio": "investment-portfolio",
  "budget-forecast": "budget-forecast", "financial-risk": "financial-risk", "value-roi": "value-roi",
  "cost-run-rate": "cost-run-rate", "workforce-capacity": "workforce-capacity", "operational-risk": "operational-risk",
  "process-automation": "process-automation", "performance-slas": "performance-slas",
  "adoption-enablement": "adoption-enablement", "role-impact": "role-impact", "sentiment-feedback": "sentiment-feedback",
  "skills-reskilling": "skills-reskilling", "my-action-items": "my-action-items", "governance-forum": "governance-forum",
  "incident-playbook": "incident-playbook", "convergence-crosswalk": "convergence-crosswalk",
  "prohibited-practices": "prohibited-practices", "gpai-exposure": "gpai-exposure", "gap-closure": "gap-closure",
  "jurisdiction-atlas": "jurisdiction-atlas", "iso-42001-readiness": "iso-42001-readiness",
  "evidence-freshness": "evidence-freshness", "governance-glossary": "governance-glossary", "drift-monitor": "drift-monitor",
  "article-12-log": "article-12-log", "regulatory-posture": "regulatory-posture", "board-audit": "board-audit",
  "agent-authority": "agent-authority", "tool-call-ledger": "tool-call-ledger", "mcp-registry": "mcp-registry",
  "egress-policy": "egress-policy", "circuit-breaker": "circuit-breaker", "agent-chain-permissions": "agent-chain-permissions",
  "threat-center": "threat-center", "red-team": "red-team", "guardrails-controls": "guardrails-controls",
  "vulnerabilities": "vulnerabilities", "ai-incidents": "ai-incidents", "my-initiatives": "my-initiatives",
  "my-tasks": "my-tasks", "how-i-m-doing": "how-i-m-doing", "my-requests": "my-requests",
  "risk-compliance-employee": "risk-compliance", "approvals-manager": "approvals", "help": "help",
  "onboarding": "onboard", "use-cases": "use-cases", "roadmap": "strategic-roadmap", "maturity-radar": "ai-governance-maturity",
  "ceo-cockpit": "overview", "caio-governance": "governance-compliance",
  // role homes → a signature surface for that role
  "ciso-security": "veris-enforce", "cfo-value-office": "value-roi", "coo-operating-model": "process-automation",
  "chro-workforce": "adoption-enablement", "cio-portfolio": "platform-health", "cdpo-privacy": "dpia-assessments",
  "cro-risk": "risk-register", "legal-counsel": "regulatory-map", "manager-workspace": "approvals",
  "team-ai-surfaces": "ai-hub", "ai-central-login": "ai-central",
};

/* Framework entries all live inside the Compliance & Standards library — show that surface. */
const FRAMEWORK_FALLBACK = "compliance-standards";

const STOP = new Set(["the","a","an","of","and","for","to","in","on","its","cfo","coo","cio","cdpo","cro","chro","ciso","cgo","ceo","caio","manager","employee","legal","surface","view"]);
const usedFiles = new Set();

/* resolve a screenshot file for an entry: alias → exact slug → token overlap → legacy `shot` key */
function resolveShotFile(entry) {
  const clean = entry.term.toLowerCase().replace(/\([^)]*\)/g, " ").trim();
  const s = slugify(clean);
  const cand = [ALIAS[s], s].filter(Boolean);
  for (const c of cand) if (surfSlugs.has(c)) { const f = `surf-${c}.jpg`; usedFiles.add(f); return f; }
  // token overlap
  const toks = clean.split(/\s+/).map(slugify).filter(w => w && w.length > 2 && !STOP.has(w));
  if (toks.length) {
    let best = null, bestScore = 0;
    for (const ss of surfSlugs) {
      const st = new Set(ss.split("-"));
      const score = toks.filter(t => st.has(t)).length;
      if (score > bestScore) { bestScore = score; best = ss; }
    }
    if (best && bestScore >= Math.min(2, toks.length)) { const f = `surf-${best}.jpg`; usedFiles.add(f); return f; }
  }
  // legacy explicit shot key (ceo.jpg, caio.jpg, ...)
  if (entry.shot && existsSync(`${SHOT_DIR}/${entry.shot}.jpg`)) { const f = `${entry.shot}.jpg`; usedFiles.add(f); return f; }
  // frameworks all appear in the Compliance & Standards library
  if (entry.cat === "Framework & regulation" && surfSlugs.has(FRAMEWORK_FALLBACK)) { const f = `surf-${FRAMEWORK_FALLBACK}.jpg`; usedFiles.add(f); return f; }
  return null;
}

/* pre-resolve so we know which files are used, then embed only those */
const entryShotFile = new Map();
for (const e of PLATFORM_DICTIONARY) { const f = resolveShotFile(e); if (f) entryShotFile.set(e.term, f); }
const shotURI = {};
for (const f of usedFiles) shotURI[f] = `data:image/jpeg;base64,${readFileSync(`${SHOT_DIR}/${f}`).toString("base64")}`;

/* ── category dot colors (legible on both grounds) ── */
const CAT_DOT = {
  "Core concept": "#C79A45",
  "Role & workspace": "#5B8AC9",
  "AI Central": "#2F9E9E",
  "Security & enforcement": "#D06A54",
  "Compliance & governance": "#7C7ED6",
  "Risk & assurance": "#D69A3C",
  "Framework & regulation": "#5BA772",
  "Executive domain": "#B978A0",
  "Workforce": "#5FA3C9",
  "Platform & admin": "#8A93A5",
  "Metric & score": "#C7A84E",
};

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ── entry card ── */
function card(e) {
  const dot = CAT_DOT[e.cat] || "#8A93A5";
  const searchBlob = esc(`${e.term} ${e.cat} ${e.meaning} ${e.usage} ${e.example} ${e.ql.what} ${e.ql.why} ${e.ql.how} ${e.ql.where}`.toLowerCase());
  const sf = entryShotFile.get(e.term);
  const shot = sf && shotURI[sf] ? `
        <figure class="shot">
          <img loading="lazy" src="${shotURI[sf]}" alt="Screenshot of ${esc(e.term)} in VerisZone" />
          <figcaption>Where “${esc(e.term)}” lives in the platform</figcaption>
        </figure>` : "";
  return `
      <article class="entry" data-cat="${esc(e.cat)}" data-search="${searchBlob}" id="t-${slug(e.term)}">
        <header class="entry-h">
          <span class="dot" style="--dot:${dot}"></span>
          <h3>${esc(e.term)}</h3>
          <span class="cat-tag">${esc(e.cat)}</span>
        </header>
        <p class="meaning">${esc(e.meaning)}</p>
        <dl class="uv">
          <div><dt>Usage · where</dt><dd>${esc(e.usage)}</dd></div>
          <div><dt>Example · how it works</dt><dd>${esc(e.example)}</dd></div>
        </dl>${shot}
        <div class="ql">
          <div class="ql-h">Quick learning</div>
          <div class="ql-grid">
            <div class="ql-cell"><span class="k">What</span><span class="v">${esc(e.ql.what)}</span></div>
            <div class="ql-cell"><span class="k">Why</span><span class="v">${esc(e.ql.why)}</span></div>
            <div class="ql-cell"><span class="k">How</span><span class="v">${esc(e.ql.how)}</span></div>
            <div class="ql-cell"><span class="k">Where</span><span class="v">${esc(e.ql.where)}</span></div>
          </div>
        </div>
      </article>`;
}

/* ── grouped by category ── */
const sections = DICT_CATEGORIES.map(cat => {
  const items = PLATFORM_DICTIONARY.filter(e => e.cat === cat);
  if (!items.length) return "";
  return `
    <section class="cat-sec" data-cat="${esc(cat)}">
      <div class="cat-head"><span class="dot" style="--dot:${CAT_DOT[cat] || "#8A93A5"}"></span><h2>${esc(cat)}</h2><span class="cat-count">${items.length}</span></div>
      <div class="grid">${items.map(card).join("")}</div>
    </section>`;
}).join("");

const chips = ["All", ...DICT_CATEGORIES].map(c =>
  `<button class="chip${c === "All" ? " on" : ""}" data-chip="${c === "All" ? "all" : esc(c)}">${c === "All" ? "All" : esc(c)}<span class="chip-n">${c === "All" ? PLATFORM_DICTIONARY.length : PLATFORM_DICTIONARY.filter(e => e.cat === c).length}</span></button>`
).join("");

const html = `<meta charset="utf-8" />
<title>VerisZone Dictionary</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root{
    --bg:#F5F3EE; --surface:#FFFFFF; --surface2:#FBFAF6;
    --ink:#1C2130; --ink2:#4A5266; --ink3:#7A8194; --border:#E6E1D6;
    --gold:#A87C25; --gold-soft:#B7892F; --blue:#2C5AA0; --navy:#141A2B;
    --shadow:0 1px 2px rgba(20,26,43,.05), 0 12px 30px rgba(20,26,43,.05);
    --serif:Georgia,"Times New Roman",serif;
    --sans:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  }
  :root:not([data-theme="light"]){ }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --bg:#0E1220; --surface:#161B2B; --surface2:#12172433;
      --ink:#ECEFF5; --ink2:#AEB6C6; --ink3:#7C8598; --border:#28304400;
      --border:#273049; --gold:#D6A84F; --gold-soft:#C79A45; --blue:#7DA3C9; --navy:#0A0E1A;
      --shadow:0 1px 2px rgba(0,0,0,.3), 0 16px 40px rgba(0,0,0,.35);
    }
  }
  :root[data-theme="dark"]{
    --bg:#0E1220; --surface:#161B2B; --surface2:#121724;
    --ink:#ECEFF5; --ink2:#AEB6C6; --ink3:#7C8598; --border:#273049;
    --gold:#D6A84F; --gold-soft:#C79A45; --blue:#7DA3C9; --navy:#0A0E1A;
    --shadow:0 1px 2px rgba(0,0,0,.3), 0 16px 40px rgba(0,0,0,.35);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.55;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1120px;margin:0 auto;padding:0 20px}

  /* header */
  header.top{position:sticky;top:0;z-index:20;background:var(--navy);color:#F4E9EE;border-bottom:1px solid rgba(255,255,255,.08)}
  .top-in{max-width:1120px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .brand{display:flex;align-items:center;gap:12px;flex-shrink:0}
  .brand .logo{height:38px;width:auto;display:block}
  .brand b{font-family:var(--serif);font-size:16px;font-weight:700;letter-spacing:.01em;color:#F4E9EE}
  .brand-sub{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#D6A84F;padding-left:12px;border-left:1px solid rgba(255,255,255,.18)}
  .search{margin-left:auto;position:relative;flex:1;min-width:220px;max-width:420px}
  .search input{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:9px 14px 9px 36px;color:#fff;font-size:14px;font-family:var(--sans);outline:none}
  .search input::placeholder{color:#9AA3B4}
  .search input:focus{border-color:#D6A84F;background:rgba(255,255,255,.12)}
  .search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);opacity:.6}
  .count{font-family:var(--mono);font-size:11px;color:#B9C0CE;white-space:nowrap}

  /* hero */
  .hero{padding:46px 0 26px;border-bottom:1px solid var(--border)}
  .hero h1{font-family:var(--serif);font-weight:700;font-size:clamp(30px,5vw,46px);line-height:1.05;margin:0 0 12px;text-wrap:balance;letter-spacing:-.01em}
  .hero h1 em{font-style:italic;color:var(--gold)}
  .hero p{font-size:16px;color:var(--ink2);max-width:60ch;margin:0}
  .hero .legend{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:18px;font-size:12px;color:var(--ink3);font-family:var(--mono)}
  .hero .legend b{color:var(--ink);font-weight:600}

  /* chips */
  .chips-bar{position:sticky;top:63px;z-index:15;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}
  .chips{max-width:1120px;margin:0 auto;padding:11px 20px;display:flex;gap:7px;overflow-x:auto;scrollbar-width:thin}
  .chip{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:6px 12px;color:var(--ink2);font-size:12.5px;font-weight:600;font-family:var(--sans);cursor:pointer;transition:all .15s}
  .chip:hover{border-color:var(--gold-soft)}
  .chip.on{background:var(--navy);color:#fff;border-color:var(--navy)}
  :root[data-theme="dark"] .chip.on,:root:not([data-theme="light"]) .chip.on{background:var(--gold);color:#241703}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .chip.on{background:var(--gold);color:#241703}}
  .chip-n{font-family:var(--mono);font-size:10px;opacity:.7;font-variant-numeric:tabular-nums}

  /* sections */
  main{padding:8px 0 80px}
  .cat-sec{padding:30px 0 6px;scroll-margin-top:120px}
  .cat-head{display:flex;align-items:center;gap:10px;margin:0 0 16px}
  .cat-head h2{font-family:var(--serif);font-size:21px;font-weight:700;margin:0;letter-spacing:-.01em}
  .cat-count{font-family:var(--mono);font-size:11px;color:var(--ink3);background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-variant-numeric:tabular-nums}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--dot);flex-shrink:0;box-shadow:0 0 0 3px color-mix(in srgb,var(--dot) 22%,transparent)}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}
  .entry{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 17px;box-shadow:var(--shadow);display:flex;flex-direction:column;scroll-margin-top:130px}
  .entry-h{display:flex;align-items:center;gap:9px;margin-bottom:9px}
  .entry-h h3{font-family:var(--serif);font-size:17.5px;font-weight:700;margin:0;flex:1;min-width:0;line-height:1.2}
  .cat-tag{font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);white-space:nowrap}
  .meaning{margin:0 0 12px;font-size:13.5px;color:var(--ink);line-height:1.5}
  .uv{margin:0;display:flex;flex-direction:column;gap:8px}
  .uv div{display:flex;flex-direction:column;gap:2px}
  .uv dt{font-family:var(--mono);font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:var(--gold-soft);font-weight:700}
  .uv dd{margin:0;font-size:12.5px;color:var(--ink2);line-height:1.5}
  .shot{margin:12px 0 2px;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--surface2)}
  .shot img{display:block;width:100%;height:auto;cursor:zoom-in;transition:opacity .15s}
  .shot img:hover{opacity:.93}
  .shot figcaption{font-family:var(--mono);font-size:9.5px;color:var(--ink3);padding:6px 10px;border-top:1px solid var(--border);letter-spacing:.02em}
  .ql{margin-top:13px;border-top:1px dashed var(--border);padding-top:11px}
  .ql-h{font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:8px;font-weight:700}
  .ql-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .ql-cell{display:flex;flex-direction:column;gap:2px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:7px 9px}
  .ql-cell .k{font-family:var(--mono);font-size:9px;letter-spacing:.07em;text-transform:uppercase;color:var(--gold);font-weight:700}
  .ql-cell .v{font-size:11.5px;color:var(--ink2);line-height:1.4}

  .empty{display:none;text-align:center;padding:60px 20px;color:var(--ink3);font-size:15px}
  .empty.show{display:block}

  footer{border-top:1px solid var(--border);padding:26px 0 40px;color:var(--ink3);font-size:12px;font-family:var(--mono)}
  footer b{color:var(--ink2);font-weight:600}

  /* lightbox */
  .lb{position:fixed;inset:0;z-index:60;background:rgba(9,12,22,.86);display:none;align-items:center;justify-content:center;padding:24px;cursor:zoom-out}
  .lb.show{display:flex}
  .lb img{max-width:100%;max-height:100%;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.6)}

  @media (max-width:560px){
    .grid{grid-template-columns:1fr}
    .ql-grid{grid-template-columns:1fr}
    .chips-bar{top:0}
  }
  @media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  a:focus-visible,button:focus-visible,input:focus-visible,img:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
</style>

<header class="top">
  <div class="top-in">
    <div class="brand">
      ${LOGO ? `<img class="logo" src="${LOGO}" alt="VerisZone" />` : `<b>VerisZone</b>`}
      <span class="brand-sub">Governance Dictionary</span>
    </div>
    <div class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA3B4" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input id="q" type="search" placeholder="Search any term, meaning or usage…" aria-label="Search the dictionary" autocomplete="off" />
    </div>
    <div class="count"><span id="shown">${PLATFORM_DICTIONARY.length}</span> / ${PLATFORM_DICTIONARY.length} terms</div>
  </div>
</header>

<div class="wrap">
  <section class="hero">
    <h1>Every name in <em>VerisZone</em>, explained.</h1>
    <p>The complete reference to the platform's vocabulary — every role, surface, engine, framework, concept and metric — each with what it means, where it's used, how it works, a screenshot, and a quick What / Why / How / Where.</p>
    <div class="legend">
      <span><b>${PLATFORM_DICTIONARY.length}</b> terms</span>
      <span><b>${DICT_CATEGORIES.length}</b> categories</span>
      <span>Read top-to-bottom, or search &amp; filter</span>
    </div>
  </section>
</div>

<div class="chips-bar"><div class="chips">${chips}</div></div>

<div class="wrap">
  <main>
    ${sections}
    <div class="empty" id="empty">No term matches that search.</div>
  </main>
  <footer class="wrap-in">
    <p><b>VerisZone Governance Dictionary</b> — the enterprise AI governance control plane. One entry per name; kept in sync with the in-product Glossary &amp; Learning surface.</p>
  </footer>
</div>

<div class="lb" id="lb" aria-hidden="true"><img id="lb-img" src="" alt="Enlarged screenshot" /></div>

<script>
  (function(){
    var q=document.getElementById("q"), shown=document.getElementById("shown"),
        empty=document.getElementById("empty"), chips=[].slice.call(document.querySelectorAll(".chip")),
        entries=[].slice.call(document.querySelectorAll(".entry")),
        secs=[].slice.call(document.querySelectorAll(".cat-sec"));
    var cat="all", term="";
    function apply(){
      var n=0;
      entries.forEach(function(el){
        var okCat = cat==="all" || el.getAttribute("data-cat")===cat;
        var okTerm = !term || el.getAttribute("data-search").indexOf(term)>-1;
        var vis = okCat && okTerm;
        el.style.display = vis ? "" : "none";
        if(vis) n++;
      });
      secs.forEach(function(s){
        var any=s.querySelectorAll('.entry:not([style*="display: none"])').length>0
          || [].slice.call(s.querySelectorAll(".entry")).some(function(e){return e.style.display!=="none";});
        s.style.display = any ? "" : "none";
      });
      shown.textContent=n;
      empty.classList.toggle("show", n===0);
    }
    q.addEventListener("input", function(){ term=q.value.trim().toLowerCase(); apply(); });
    chips.forEach(function(c){ c.addEventListener("click", function(){
      chips.forEach(function(x){x.classList.remove("on");}); c.classList.add("on");
      cat=c.getAttribute("data-chip"); apply();
      window.scrollTo({top:0});
    });});
    // lightbox
    var lb=document.getElementById("lb"), lbImg=document.getElementById("lb-img");
    document.addEventListener("click", function(e){
      if(e.target.tagName==="IMG" && e.target.closest(".shot")){ lbImg.src=e.target.src; lb.classList.add("show"); lb.setAttribute("aria-hidden","false"); }
      else if(e.target===lb || e.target===lbImg){ lb.classList.remove("show"); lb.setAttribute("aria-hidden","true"); }
    });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ lb.classList.remove("show"); if(document.activeElement===q){q.blur();} } });
  })();
</script>`;

writeFileSync(OUT, html);
const withShot = PLATFORM_DICTIONARY.filter(e => entryShotFile.has(e.term)).length;
console.log("wrote", OUT, (html.length/1024/1024).toFixed(1)+"MB", "| entries", PLATFORM_DICTIONARY.length, "| entries with screenshot", withShot, "| unique images embedded", usedFiles.size);
const noShot = PLATFORM_DICTIONARY.filter(e => !entryShotFile.has(e.term)).map(e => `${e.term} [${e.cat}]`);
console.log("no screenshot ("+noShot.length+"):\n  " + noShot.join("\n  "));
