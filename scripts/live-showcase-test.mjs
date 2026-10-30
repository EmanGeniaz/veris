/* GenVeris · Live security showcase tests
   The Command Deck's "Live Security" view streams agent actions through the
   platform's enforcement engines. These checks lock that every verdict is
   COMPUTED by the real engines (policy/DLP, capability + HITL, egress,
   runtime loop guard, output guard, circuit breaker) in gateway order — not
   scripted — and that the breaker genuinely suspends a misbehaving agent
   until a human resumes it.
   Run: npx tsx scripts/live-showcase-test.mjs */
const m = await import("../lib/live-showcase.js");
const { evaluateAction, ROUTINE, ATTACKS, STAGES, initialFleet, applyEvent, agentStatus, breakerFor, resumeAgent, pauseAgent, SIGNAL_WINDOW } = m;

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const run = (a, ctx) => evaluateAction(a, ctx);
const burst = (a) => { let h = [], e; for (let i = 0; i < (a.burst || 1); i++) { e = run(a, { history: h }); h = [...h, a.tool]; } return e; };

/* ── 1 · pipeline shape ── */
{
  const e = run(ROUTINE[0]);
  check("eight stages in gateway order", STAGES.map(s => s.id).join(",") === "breaker,ingress,dlp,authority,egress,runtime,output,log");
  check("every result lists every stage, in order", e.stages.map(s => s.id).join(",") === STAGES.map(s => s.id).join(","));
  check("every action is logged to Article 12, whatever the outcome", Object.values(ATTACKS).every(a => burst(a).stages.find(s => s.id === "log")?.decision === "logged"));
  const blocked = run(ATTACKS.injection);
  const idx = STAGES.findIndex(s => s.id === blocked.decidedAt);
  check("stages after the deciding stage are marked not reached", blocked.stages.slice(idx + 1, -1).every(s => s.decision === "skipped"));
}

/* ── 2 · routine traffic passes ── */
{
  const out = ROUTINE.map(r => run(r));
  check("routine actions are never blocked or escalated", out.every(e => e.outcome !== "block" && e.outcome !== "escalate"));
  const email = out.find(e => /jane\.doe/.test(e.prompt));
  check("email in a routine prompt is masked, not leaked", email.outcome === "mask" && !/jane\.doe@example\.com/.test(email.masked) && /MASKED-EMAIL/.test(email.masked));
  check("routine actions raise no breaker signals", out.every(e => e.signals.length === 0));
}

/* ── 3 · each attack is stopped by the engine that owns it ── */
{
  const at = k => burst(ATTACKS[k]);
  check("prompt injection → blocked at DLP, injection signal", at("injection").outcome === "block" && at("injection").decidedAt === "dlp" && at("injection").signals.includes("injection"));
  check("credential → blocked at DLP", at("credential").outcome === "block" && at("credential").decidedAt === "dlp");
  check("card data → blocked at DLP and classified Restricted", at("card").outcome === "block" && at("card").dataClass === "Restricted");
  check("exfiltration to pastebin → blocked at egress", at("exfiltration").outcome === "block" && at("exfiltration").decidedAt === "egress" && at("exfiltration").signals.includes("egress"));
  check("SSRF to cloud metadata → blocked at egress", at("ssrf").outcome === "block" && /SSRF/.test(at("ssrf").reason));
  check("tool outside the grant → blocked by least privilege", at("overreach").outcome === "block" && at("overreach").decidedAt === "authority");
  check("high-stakes decision → escalated to a human, not executed", at("highstakes").outcome === "escalate" && at("highstakes").decidedAt === "authority");
  check("runaway loop → refused by the runtime guard", at("loop").outcome === "block" && at("loop").decidedAt === "runtime");
  check("card number in model output → withheld by the output guard", at("leak").outcome === "block" && at("leak").decidedAt === "output");
  check("a single loop call is allowed (only the repeat trips)", run(ATTACKS.loop).outcome !== "block");
}

/* ── 4 · circuit breaker applies, and only a human resumes ── */
{
  let f = initialFleet();
  check("fleet starts idle with zero counters", Object.values(f).every(a => a.calls === 0 && agentStatus(a) === "idle"));
  const doc = "agent-doc";
  for (const k of ["injection", "exfiltration"]) {
    const e = run(ATTACKS[k], { history: f[doc].history, signals: f[doc].signals });
    f = applyEvent(f, e);
  }
  check("injection + exfiltration suspend the agent (breaker ≥ 65)", agentStatus(f[doc]) === "suspended" && breakerFor(f[doc]).score >= 65);
  const next = run(ROUTINE.find(r => r.agent === doc), { history: f[doc].history, signals: f[doc].signals });
  check("a suspended agent is blocked at the breaker, even for routine work", next.outcome === "block" && next.decidedAt === "breaker");
  f = resumeAgent(f, doc);
  check("human resume clears the breaker window", agentStatus(f[doc]) !== "suspended" && breakerFor(f[doc]).score === 0);
  const after = run(ROUTINE.find(r => r.agent === doc), { history: f[doc].history, signals: f[doc].signals });
  check("after resume, routine work flows again", after.outcome === "allow");
  f = pauseAgent(f, "agent-crc");
  const paused = run(ROUTINE[0], { paused: f["agent-crc"].paused });
  check("human kill switch blocks the agent at the first stage", agentStatus(f["agent-crc"]) === "paused" && paused.outcome === "block" && paused.decidedAt === "breaker");
  let g = initialFleet();
  for (let i = 0; i < SIGNAL_WINDOW + 2; i++) g = applyEvent(g, run(ROUTINE[0], { history: [] }));
  check("clean traffic keeps the breaker at zero", breakerFor(g["agent-crc"]).score === 0);
  let h = initialFleet();
  h = applyEvent(h, run(ATTACKS.injection));
  for (let i = 0; i < SIGNAL_WINDOW; i++) h = applyEvent(h, run(ROUTINE.find(r => r.agent === doc), { history: [] }));
  check("risk signals age out of the window after sustained clean behaviour", breakerFor(h[doc]).score === 0);
  check("counters add up", Object.values(f).every(a => a.allowed + a.masked + a.blocked + a.escalated === a.calls));
}

/* ── 5 · no fabricated outcomes ── */
{
  check("unknown agent is denied by default", run({ agent: "agent-ghost", tool: "read_kb", prompt: "hello" }).outcome === "block");
  check("deterministic", JSON.stringify(run(ATTACKS.card)) === JSON.stringify(run(ATTACKS.card)));
  check("the source holds no credential-shaped literal", !/AKIA[0-9A-Z]{16}/.test(String(evaluateAction).concat(JSON.stringify(ROUTINE))));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
