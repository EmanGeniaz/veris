/* Type declarations for lib/circuit-breaker.js so strict TypeScript consumers
   (e.g. lib/breaker-live.ts) get the breaker's public API typed. Runtime lives
   in the .js; this only describes it. */

export interface BreakerStateDef { id: string; label: string; min: number; tone: string; action: string }
export interface SignalDef { label: string; weight: number; tone: string }

export const SIGNALS: Record<string, SignalDef>;
export const BREAKER_STATES: BreakerStateDef[];
export function stateMeta(id: string): BreakerStateDef;
export function stateForScore(score: number): BreakerStateDef;

export interface BreakerSession {
  id: string;
  agent: string;
  agentName: string;
  owner: string;
  started?: string;
  signals: string[];
  score: number;
  state: string;
  stateLabel: string;
  tone: string;
  action: string;
  trigger: string;
  triggerLabel: string;
  revoked: string[];
  tokensRevoked: number;
  humanGate: boolean;
  ledgerRef: string | null;
  acted: boolean;
}

export function computeBreakerSession(r: { id: string; agent: string; signals: string[]; started?: string }): BreakerSession;
export function breakerSessions(): BreakerSession[];
export function breakerStats(rows?: BreakerSession[]): {
  watched: number;
  normal: number;
  downscoped: number;
  suspended: number;
  halted: number;
  acted: number;
  tokensRevoked: number;
  routedToHuman: number;
  ttlSeconds: number;
};
