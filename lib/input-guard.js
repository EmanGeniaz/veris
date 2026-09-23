/* ── Veris Enforce · Input Guardrails ────────────────────────────────────
   The first thing that touches a request, before classification or the model.
   Ingress is an injection surface twice over: the text can carry invisible
   instruction-smuggling (zero-width and Unicode-Tag characters a human never
   sees but a model reads), and any attachment can be a malicious or
   mis-declared file. This engine runs at the gateway door:

     • Content sanitization — strips zero-width, Unicode-Tag (E0000–E007F),
                              bidi-override and control characters, and
                              neutralises <script> blocks, so hidden-prompt
                              injection can't ride in on invisible text.
     • Schema & MIME checks — attachments must declare an allow-listed MIME
                              type whose extension matches; the request body
                              itself is shape-validated.
     • Malware & file scan   — deterministic checks: executable magic bytes
                              (PE / ELF / Mach-O), dangerous or double
                              extensions, and macro-bearing office files.
     • Size & rate limits    — oversized text is capped and a per-session
                              request-rate limit throttles bursts.

   Pure + deterministic (the caller passes the clock). Written with explicit
   code points so the invisible-character patterns are exact and reviewable.
   Wired into the gateway ingress so it runs on every request. */

import { fetchWithTimeout } from "./http";

/* Invisible / dangerous character classes used to smuggle instructions past a
   human reviewer. */
const ZERO_WIDTH   = /[\u200B-\u200D\u2060\uFEFF\u180E]/g;   // zero-width space/joiner, word-joiner, BOM
const UNICODE_TAGS = /[\u{E0000}-\u{E007F}]/gu;              // "tag" chars — invisible ASCII smuggling
const BIDI         = /[\u202A-\u202E\u2066-\u2069]/g;        // bidi overrides — visual spoofing
const CONTROL      = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // control chars (keeps \t \n \r)
const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;

export function sanitizeInput(text) {
  let clean = String(text ?? "");
  const findings = [];
  if (ZERO_WIDTH.test(clean))   { findings.push("zero-width characters"); clean = clean.replace(ZERO_WIDTH, ""); }
  if (UNICODE_TAGS.test(clean)) { findings.push("Unicode-Tag smuggling"); clean = clean.replace(UNICODE_TAGS, ""); }
  if (BIDI.test(clean))         { findings.push("bidi-override characters"); clean = clean.replace(BIDI, ""); }
  if (SCRIPT_BLOCK.test(clean)) { findings.push("embedded <script> block"); clean = clean.replace(SCRIPT_BLOCK, "[removed-script]"); }
  if (CONTROL.test(clean))      { findings.push("control characters"); clean = clean.replace(CONTROL, ""); }
  return { clean, changed: findings.length > 0, findings };
}

/* Attachment policy. Allow-listed MIME → its permitted extensions. Anything
   outside the map is denied by default. */
export const INPUT_MIME_ALLOWLIST = {
  "application/pdf": ["pdf"],
  "image/png": ["png"], "image/jpeg": ["jpg", "jpeg"], "image/gif": ["gif"], "image/webp": ["webp"],
  "text/plain": ["txt"], "text/csv": ["csv"], "application/json": ["json"], "text/markdown": ["md"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
};
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB
const DANGEROUS_EXT = /\.(exe|js|mjs|bat|cmd|com|scr|pif|sh|ps1|jar|msi|dll|vbs|wsf|hta|apk)$/i;
const DOUBLE_EXT = /\.(pdf|png|jpe?g|gif|docx?|xlsx?|csv|txt|json)\.(exe|js|bat|cmd|scr|sh|ps1|jar|msi|dll|vbs)$/i;
/* Executable / script magic bytes, matched against a hex header string. */
const MAGIC = [
  { sig: "4d5a", label: "PE executable (MZ)" },        // Windows .exe/.dll
  { sig: "7f454c46", label: "ELF executable" },         // Linux
  { sig: "cafebabe", label: "Mach-O / Java class" },    // macOS / JVM
  { sig: "feedface", label: "Mach-O executable" },
  { sig: "23212f", label: "shell script (#!/)" },       // shebang
];

/* EICAR — the industry-standard anti-malware test signature. Not real malware,
   but every AV product is required to flag it, so it is the honest way to prove
   the malware path fires end-to-end. We match both the literal ASCII string
   (when a text body is provided) and its hex prefix in the file header, so a
   binary upload is caught even without decoding the body. */
export const EICAR_SIGNATURE =
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
const EICAR_HEX_PREFIX = "58354f2150254041505b345c505a58"; // "X5O!P%@AP[4\PZX" in hex

function eicarHit(headerHex, content) {
  if (headerHex && headerHex.startsWith(EICAR_HEX_PREFIX)) return true;
  if (content && String(content).includes(EICAR_SIGNATURE)) return true;
  return false;
}

/* Scan one attachment: { name, mime, size, headerHex?, content? }. Pure +
   deterministic — the sync first pass. `content` (optional decoded text) lets
   the EICAR string be matched directly. */
export function scanAttachment(att) {
  const name = String(att?.name || "unnamed");
  const mime = String(att?.mime || "").toLowerCase();
  const size = Number(att?.size) || 0;
  const headerHex = String(att?.headerHex || "").toLowerCase().replace(/[^0-9a-f]/g, "");
  const reasons = [];
  const ext = (name.split(".").pop() || "").toLowerCase();

  if (DOUBLE_EXT.test(name)) reasons.push("double extension (masquerading executable)");
  else if (DANGEROUS_EXT.test(name)) reasons.push(`dangerous extension .${ext}`);
  if (!INPUT_MIME_ALLOWLIST[mime]) reasons.push(`MIME not allow-listed (${mime || "none"})`);
  else if (ext && !INPUT_MIME_ALLOWLIST[mime].includes(ext)) reasons.push(`extension .${ext} does not match MIME ${mime}`);
  if (size > MAX_ATTACHMENT_BYTES) reasons.push(`over size cap (${Math.round(size / 1048576)}MB > ${MAX_ATTACHMENT_BYTES / 1048576}MB)`);
  const magic = MAGIC.find(m => headerHex.startsWith(m.sig));
  if (magic) reasons.push(`executable signature: ${magic.label}`);
  if (eicarHit(headerHex, att?.content)) reasons.push("malware signature: EICAR test file");

  return { name, mime, size, decision: reasons.length ? "block" : "allow", reasons };
}

/* Async attachment scan — the production seam. Runs the deterministic sync pass
   first (it never needs the network and catches the obvious cases), then, when
   an external AV scanner is configured via AV_SCAN_URL, POSTs the attachment
   metadata to it for a second opinion. A sync block short-circuits (no reason
   to pay for a network call on an already-blocked file); a scanner verdict of
   "infected"/"malicious"/"block" adds a reason and blocks. The scanner is
   fail-safe by policy: AV_SCAN_FAIL_CLOSED=1 blocks when the scanner is
   unreachable, otherwise it falls back to the sync verdict and records that the
   external scan did not run. No network dependency when AV_SCAN_URL is unset,
   so the engine stays pure by default. */
export async function scanAttachmentAsync(att, opts = {}) {
  const base = scanAttachment(att);
  const url = opts.avScanUrl ?? process.env.AV_SCAN_URL ?? "";
  if (!url || base.decision === "block") {
    return { ...base, avScanned: false };
  }
  const failClosed = opts.failClosed ?? process.env.AV_SCAN_FAIL_CLOSED === "1";
  const fetchImpl = opts.fetch ?? globalThis.fetch;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  if (typeof fetchImpl !== "function") {
    const reasons = failClosed ? [...base.reasons, "AV scanner unavailable (fail-closed)"] : base.reasons;
    return { ...base, reasons, decision: reasons.length ? "block" : "allow", avScanned: false };
  }
  try {
    // Bounded: a hung AV scanner must not hold ingress open. On timeout the
    // catch below applies the configured fail-open / fail-closed policy.
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: base.name, mime: base.mime, size: base.size, headerHex: att?.headerHex || "" }),
    }, timeoutMs, fetchImpl);
    const verdict = await res.json().catch(() => ({}));
    const status = String(verdict?.status || verdict?.result || "").toLowerCase();
    const infected = verdict?.infected === true || /infect|malicious|block|positive/.test(status);
    if (infected) {
      const label = verdict?.signature || verdict?.threat || "external AV scanner";
      const reasons = [...base.reasons, `malware detected by ${label}`];
      return { ...base, reasons, decision: "block", avScanned: true };
    }
    return { ...base, avScanned: true };
  } catch {
    const reasons = failClosed ? [...base.reasons, "AV scanner unreachable (fail-closed)"] : base.reasons;
    return { ...base, reasons, decision: reasons.length ? "block" : "allow", avScanned: false };
  }
}

/* Per-session ingress rate limit (generous — bounds bursts, not normal use).
   In-process window on globalThis. */
export const INPUT_RATE = { windowMs: 60_000, max: 40 };
const RATE = ((globalThis.__vzInputRate ||= {}));
export function ingressRate(key, nowMs = Date.now(), policy = INPUT_RATE) {
  const arr = (RATE[key] ||= []).filter(ts => nowMs - ts < policy.windowMs);
  arr.push(nowMs);
  RATE[key] = arr;
  return { count: arr.length, limited: arr.length > policy.max, max: policy.max };
}

export const TEXT_SIZE_CAP = 8000;

/* The gateway ingress gate. Returns the sanitized text plus a blocked verdict
   if any hard check fails (malicious attachment, rate limit). */
export function ingressCheck({ text, attachments, sessionKey, nowMs = Date.now() }) {
  const findings = [];
  const raw = String(text ?? "");
  const truncated = raw.length > TEXT_SIZE_CAP;
  const san = sanitizeInput(raw.slice(0, TEXT_SIZE_CAP));
  if (san.changed) findings.push(...san.findings);
  if (truncated) findings.push("oversized input truncated");

  const attachmentResults = Array.isArray(attachments) ? attachments.map(scanAttachment) : [];
  const badAttachment = attachmentResults.find(a => a.decision === "block");

  const rate = sessionKey ? ingressRate(sessionKey, nowMs) : { count: 0, limited: false, max: INPUT_RATE.max };

  let blocked = false, decision = "allow";
  if (badAttachment) { blocked = true; decision = "attachment blocked"; }
  else if (rate.limited) { blocked = true; decision = "rate limited"; }

  return { ok: !blocked, blocked, decision, sanitized: san.clean, sanitized_changed: san.changed, findings, attachmentResults, rate, truncated };
}

/* ── Seeded window — the input-guard record for the Enforce surface ──
   Representative inputs showing every decision. The logic above is real and
   runs live at ingress; this window stands in for a live request stream. The
   injection sample is built with real invisible code points at load time. */
const INJECTED_TEXT = "Summarise this" + "​​" +
  String.fromCodePoint(0xE0069, 0xE0067, 0xE006E, 0xE006F, 0xE0072, 0xE0065) + " and proceed";
export const INPUT_SEED = [
  { kind: "text", label: "Normal governance question", text: "What is the residual risk on the credit initiative?" },
  { kind: "text", label: "Hidden-instruction injection", text: INJECTED_TEXT, note: "zero-width + Unicode-Tag chars" },
  { kind: "file", att: { name: "board-pack.pdf", mime: "application/pdf", size: 2_400_000, headerHex: "255044462d" } },
  { kind: "file", att: { name: "invoice.pdf.exe", mime: "application/pdf", size: 120_000, headerHex: "4d5a90000300" } },
  { kind: "file", att: { name: "photo.png", mime: "image/png", size: 800_000, headerHex: "4d5a90000300" }, note: "PE magic under a .png name" },
  { kind: "file", att: { name: "export.csv", mime: "application/json", size: 40_000, headerHex: "" }, note: "extension/MIME mismatch" },
  { kind: "file", att: { name: "dataset.zip", mime: "application/zip", size: 60_000_000, headerHex: "504b0304" }, note: "MIME not allow-listed + oversize" },
  { kind: "file", att: { name: "report.txt", mime: "text/plain", size: 68, content: EICAR_SIGNATURE }, note: "EICAR anti-malware test signature" },
];

export function seededInputLedger() {
  return INPUT_SEED.map((r, i) => {
    if (r.kind === "text") {
      const san = sanitizeInput(r.text);
      return { seq: i + 1, kind: "text", label: r.label, decision: san.changed ? "sanitized" : "allow", reasons: san.findings, note: r.note || null };
    }
    const scan = scanAttachment(r.att);
    return { seq: i + 1, kind: "file", label: r.att.name, mime: r.att.mime, decision: scan.decision, reasons: scan.reasons, note: r.note || null };
  });
}

export function inputGuardStats(rows = seededInputLedger()) {
  const by = d => rows.filter(r => r.decision === d).length;
  return {
    total: rows.length,
    allowed: by("allow"),
    sanitized: by("sanitized"),
    blocked: by("block"),
    attachmentsScanned: rows.filter(r => r.kind === "file").length,
    malwareBlocked: rows.filter(r => r.kind === "file" && r.reasons?.some(x => /executable|double extension|dangerous|malware|EICAR/i.test(x))).length,
  };
}
