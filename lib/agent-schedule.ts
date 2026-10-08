/* ── Governed agent scheduler (pure) (#182 §08) ──────────────────────────
   Decides which agents are DUE to run, given their cadence and last-run times.
   Pure and testable — it computes "what's due" for an external trigger (a cron
   or a manual kick) to act on; it is NOT a daemon and holds no timers, so it
   runs the same in serverless and in tests. Manual-cadence agents are never
   auto-due. "planned" agents are never due (they can't run yet). */
import type { AgentDef } from "./agent-runtime";

const INTERVAL_MS: Record<string, number> = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

/* The next time an agent should run, or null if it never auto-runs (manual) or
   can't run (planned). With no prior run, an auto-cadence agent is due now. */
export function nextRunAt(agent: AgentDef, lastRun: Date | null): Date | null {
  if (agent.status !== "available") return null;
  const ms = INTERVAL_MS[agent.cadence];
  if (!ms) return null; // manual
  if (!lastRun) return new Date(0); // never run → due immediately
  return new Date(lastRun.getTime() + ms);
}

/* Is this agent due at `now`? */
export function isDue(agent: AgentDef, lastRun: Date | null, now: Date): boolean {
  const next = nextRunAt(agent, lastRun);
  if (!next) return false;
  return now.getTime() >= next.getTime();
}

/* The subset of agents due to run at `now`, given each agent's last-run time
   (keyed by agent id; missing/null means never run). */
export function dueAgents(
  now: Date,
  agents: AgentDef[],
  lastRuns: Record<string, Date | null> = {},
): AgentDef[] {
  return agents.filter((a) => isDue(a, lastRuns[a.id] ?? null, now));
}
