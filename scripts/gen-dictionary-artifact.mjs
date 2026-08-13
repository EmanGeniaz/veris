/* Generates the shareable VerisZone Dictionary artifact (standalone HTML) from
   the canonical lib/platform-dictionary.js + captured surface screenshots.
   Re-run to update the artifact whenever the dictionary changes:
     node scripts/gen-dictionary-artifact.mjs
   Output: scratchpad/veriszone-dictionary.html (publish via the Artifact tool). */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PLATFORM_DICTIONARY, DICT_CATEGORIES } from "../lib/platform-dictionary.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = process.env.SHOT_DIR || join(__dir, "dictionary-shots");
const OUT = process.env.OUT || join(__dir, "..", "veriszone-dictionary.html");

/* ── screenshots → data URIs ── */
const shotData = {};
for (const key of [...new Set(PLATFORM_DICTIONARY.filter(e => e.shot).map(e => e.shot))]) {
  const path = `${SHOT_DIR}/${key}.jpg`;
  if (existsSync(path)) shotData[key] = `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
}

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
  const shot = e.shot && shotData[e.shot] ? `
        <figure class="shot">
          <img loading="lazy" src="${shotData[e.shot]}" alt="Screenshot of ${esc(e.term)} in VerisZone" />
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

const html = `<title>VerisZone Dictionary</title>
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
  .brand{display:flex;align-items:center;gap:11px;flex-shrink:0}
  .brand .mark{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#2C5AA0,#D6A84F);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;color:#0B0E1A;font-size:18px}
  .brand b{font-family:var(--serif);font-size:16px;font-weight:700;letter-spacing:.01em}
  .brand span{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;color:#D6A84F;margin-top:1px}
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
      <div class="mark">V</div>
      <div><b>VerisZone</b><span>Governance Dictionary</span></div>
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
console.log("wrote", OUT, (html.length/1024).toFixed(0)+"KB", "entries", PLATFORM_DICTIONARY.length, "shots", Object.keys(shotData).length);
