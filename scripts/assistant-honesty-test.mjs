/* GenVeris · Assistant honesty tests (#168 / WS3)
   Locks the truth-telling of the employee assistant: a reply is only ever
   labelled "live" when a real model answered through the governed gateway; the
   simulated fallback states plainly that no model ran (never claims routing to a
   provider); provenance is carried onto every assistant turn and badged.
   Pure over the honesty module + a source contract over workbench wiring.
   Run: npx tsx scripts/assistant-honesty-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  ASSISTANT_PROVENANCE, assistantProvenance, allowedProvenance,
  honestSimulatedReply, liveReplySuffix,
} from "../lib/assistant-honesty.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const AR = /[؀-ۿ]/;

/* ── provenance descriptors ── */
{
  check("live provenance is toned live and labelled Live", assistantProvenance("live").tone === "live" && /Live/.test(assistantProvenance("live").label));
  check("simulated provenance is toned demo", assistantProvenance("simulated").tone === "demo");
  check("blocked provenance is toned bad", assistantProvenance("blocked").tone === "bad");
  check("declined provenance is toned muted", assistantProvenance("declined").tone === "muted");
  check("unknown provenance falls back to simulated (never overclaims live)", assistantProvenance("bogus").key === "simulated" && assistantProvenance(undefined).key === "simulated");
  check("every descriptor carries an Arabic label", Object.values(ASSISTANT_PROVENANCE).every((p) => AR.test(p.ar)));
}

/* ── allowed turn: live ONLY when a model answered ── */
{
  check("a real gateway model answer is live", allowedProvenance(true) === "live");
  check("no model answer is a local simulation, not live", allowedProvenance(false) === "simulated");
}

/* ── the simulated reply never lies about model work ── */
{
  const en = honestSimulatedReply({ ar: false });
  check("simulated reply never claims provider routing", !/routed to|routed via/i.test(en));
  check("simulated reply never claims a model call happened", !/before any model call|using enterprise knowledge before/i.test(en));
  check("simulated reply states it is simulated / local, not a model", /simulat/i.test(en) && /(no live model|not by a model|generated locally)/i.test(en));
  check("simulated reply still credits the real local policy check", /policy/i.test(en) && /boundary/i.test(en));
  const masked = honestSimulatedReply({ ar: false, masked: true });
  check("masked simulated reply mentions masking; unmasked does not", /mask/i.test(masked) && !/mask/i.test(en));
  const draft = honestSimulatedReply({ ar: false, artifact: true });
  check("artifact simulated reply is framed as a simulated draft", /simulated draft/i.test(draft));
  const ar = honestSimulatedReply({ ar: true });
  check("Arabic simulated reply is Arabic and still claims no routing", AR.test(ar) && !/routed to|routed via/i.test(ar));
}

/* ── the live suffix is accurate provenance ── */
{
  const s = liveReplySuffix({ ar: false, source: "enterprise knowledge" });
  check("live suffix credits the gateway", /gateway/i.test(s));
  check("live suffix notes masking only when masked", /mask/i.test(liveReplySuffix({ ar: false, masked: true })) && !/mask/i.test(s));
  check("Arabic live suffix is Arabic", AR.test(liveReplySuffix({ ar: true })));
}

/* ── source contract: workbench wires the honesty layer, drops the false claim ── */
{
  const wb = read("components/platform/workbench.jsx");
  check("workbench imports the honesty layer", /from "@\/lib\/assistant-honesty"/.test(wb));
  check("workbench builds the simulated reply honestly", /honestSimulatedReply\(/.test(wb));
  check("workbench appends the accurate live suffix", /liveReplySuffix\(/.test(wb));
  check("workbench tracks per-turn provenance and only upgrades to live on a real answer", /provKey/.test(wb) && /provKey="live"/.test(wb));
  check("workbench carries provenance onto the assistant message", /from:"assistant",text:outText,provenance/.test(wb));
  check("workbench badges the turn's provenance", /assistantProvenance\(m\.provenance\)/.test(wb));
  check("the old false 'routed to {provider}' simulated claim is gone", !/routed to \$\{provider\.name\}/.test(wb) && !/before any model call/.test(wb));
  const pkg = read("package.json");
  check("package.json wires test:assistanthonesty into test:unit", /"test:assistanthonesty"/.test(pkg) && /test:assistanthonesty/.test(pkg.split('"test:unit"')[1] || ""));
  const ci = read(".github/workflows/ci.yml");
  check("CI runs the assistant-honesty tests", /test:assistanthonesty/.test(ci));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
