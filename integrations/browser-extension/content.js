/* Content script — runs on public AI sites. It inspects text at the moment it
   would leave the browser (paste, drag-drop, file upload, and submit) by asking
   the background worker, which calls VerisZone's /api/policy/inspect. On a
   `block` verdict it stops the action; on `mask` it substitutes the redacted
   text VerisZone returns. This is a reference implementation — selectors for
   each site's composer may need tuning as those UIs change.

   Enforcement lives server-side in the policy engine; this only carries the
   verdict to the point of action. */

const HOST = location.hostname;

function toast(msg, tone) {
  const el = document.createElement("div");
  el.textContent = "VerisZone: " + msg;
  Object.assign(el.style, {
    position: "fixed", zIndex: 2147483647, bottom: "20px", left: "50%", transform: "translateX(-50%)",
    background: tone === "block" ? "#B42318" : "#1D4ED8", color: "#fff", font: "600 13px system-ui",
    padding: "10px 16px", borderRadius: "10px", boxShadow: "0 8px 30px rgba(0,0,0,.35)", maxWidth: "80vw",
  });
  document.documentElement.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function ask(text, destination = HOST) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "inspect", text, destination }, resolve));
}

/* ---- Paste: inspect the clipboard text before it lands in the composer ---- */
document.addEventListener("paste", async (e) => {
  const text = e.clipboardData && e.clipboardData.getData("text");
  if (!text || text.length < 3) return;
  e.preventDefault(); e.stopPropagation();               // hold it while we check
  const v = await ask(text);
  if (v.decision === "block") { toast(`paste blocked — ${v.reason || v.dataClass}`, "block"); return; }
  const out = v.decision === "mask" ? v.redacted : text;
  if (v.decision === "mask") toast("sensitive data masked before paste");
  insertText(out);
}, true);

/* ---- Drag & drop text ---- */
document.addEventListener("drop", async (e) => {
  const text = e.dataTransfer && e.dataTransfer.getData("text");
  if (!text) return;
  const v = await ask(text);
  if (v.decision !== "allow") { e.preventDefault(); e.stopPropagation();
    toast(v.decision === "block" ? `drop blocked — ${v.reason || v.dataClass}` : "masked", v.decision); }
}, true);

/* ---- File uploads: read text-like files and inspect before they attach ---- */
document.addEventListener("change", async (e) => {
  const inp = e.target;
  if (!inp || inp.type !== "file" || !inp.files || !inp.files.length) return;
  for (const f of inp.files) {
    if (f.size > 2_000_000) continue;                    // skip large binaries in this reference
    const text = await f.text().catch(() => "");
    if (!text) continue;
    const v = await ask(text, HOST);
    if (v.decision === "block") {
      e.preventDefault(); e.stopPropagation(); inp.value = "";
      toast(`upload blocked — ${f.name}: ${v.reason || v.dataClass}`, "block");
      return;
    }
  }
}, true);

/* ---- Submit (Enter or send button): last check on the composed prompt ---- */
async function guardSubmit(e) {
  const box = document.activeElement;
  const text = box && (box.value || box.innerText || box.textContent) || "";
  if (!text || text.length < 3) return;
  const v = await ask(text);
  if (v.decision === "block") {
    e.preventDefault(); e.stopPropagation();
    toast(`send blocked — ${v.reason || v.dataClass}`, "block");
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) guardSubmit(e);
}, true);

/* ---- helper: insert text into the focused composer (textarea or contenteditable) ---- */
function insertText(text) {
  const el = document.activeElement;
  if (!el) return;
  if ("value" in el) {
    const s = el.selectionStart ?? el.value.length, epos = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, s) + text + el.value.slice(epos);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    document.execCommand("insertText", false, text);     // contenteditable composers
  }
}
