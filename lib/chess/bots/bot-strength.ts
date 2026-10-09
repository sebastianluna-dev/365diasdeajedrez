import type { EngineOptions } from "@/lib/chess/engine/engine-client";

// How Stockfish is weakened to a bot's Elo. The table lives here and only here;
// `docs/content/chess/bots.mdx` copies it.
//
// What the engine's own limiters really do (research/bot-strength.md §1,
// checked against Stockfish 18's source and the probes): `Skill Level` does not
// think worse — it thinks the same and, once the iteration at depth
// `1 + int(level)` ends, picks among four candidates with a weighted random;
// `UCI_Elo` is only a conversion to a fractional level, and it refuses
// anything under 1320. So there are TWO regimes, split by a threshold and
// never blended into each other:
//
// - `sampled` (≤ 1319): the engine at full strength on a tiny budget of nodes
//   with several lines (`MultiPV`), and the app picks among them with a
//   temperature and deliberate blunders (`chooseBotMove`).
// - `engine` (≥ 1320): `UCI_LimitStrength` + `UCI_Elo`, searching exactly to
//   the depth where Skill picks; the move is the engine's `bestmove`.
//
// A bot searches by depth or nodes, NEVER by time: its strength must not
// depend on the device, and nodes reproduce under Node, which is what lets it
// be calibrated before anything is promised. The numbers are the starting
// point; the calibration (`npm run bots:calibrate`) moves the table, never the
// labels.

/** Stockfish's floor: `UCI_Elo` refuses anything below 1320. */
export const SAMPLED_REGIME_MAX_ELO = 1319;

/** The hash every bot asks for: reproducing a game depends on it. */
export const BOT_HASH_MB = 16;

export interface SampledStrength {
  regime: "sampled";
  engine: EngineOptions;
  search: { nodes: number };
  multiPv: number;
  /** Centipawns: how much worse a candidate may be and still be picked often. */
  temperature: number;
  /** The share of moves that are a deliberate mistake. */
  blunderRate: number;
  /** A blunder is a random legal move (the weakest) or the worst candidate. */
  blunder: "legal" | "worst";
  /** The human-like wait, in milliseconds. */
  delayMs: [number, number];
}

export interface EngineStrength {
  regime: "engine";
  engine: EngineOptions;
  uciElo: number;
  /** The depth Skill picks at, never less: more is wasted, less weakens without control. */
  search: { depth: number };
  /**
   * A ceiling on nodes for the browser only, for the two strongest steps: it
   * can only weaken, and a phone stays within the delay. Never applied under
   * Node nor in the calibration.
   */
  browserNodeCap: number | null;
  delayMs: [number, number];
}

export type BotStrength = SampledStrength | EngineStrength;

/**
 * Stockfish 18's conversion of `UCI_Elo` to a fractional skill level
 * (`search.cpp`): a cubic over the range 1320–3190, clamped to 0–19.
 */
export function skillLevelFor(uciElo: number): number {
  const e = (uciElo - 1320) / (3190 - 1320);
  const level = ((37.2473 * e - 40.8525) * e + 22.2943) * e - 0.311438;
  return Math.min(19, Math.max(0, level));
}

interface SampledRow {
  elo: number;
  nodes: number;
  multiPv: number;
  temperature: number;
  blunderRate: number;
  blunder: "legal" | "worst";
  delay: [number, number];
}

/**
 * Rows 400–1200, as the second calibration round left them (2026-10-08).
 * research/bot-strength.md §3 started at 1 500–15 000 nodes, a temperature of
 * 140–40 cp and, from 1000, the worst candidate as the blunder: measured, that
 * was 400–900 points above every label (Rodrigo, 1309, played at 2235). A
 * full-strength search's worst line is still a decent move, and a few thousand
 * nodes already see a lot; fewer nodes, a warmer pick and random legal moves
 * as the blunder brought every bot within its tolerance.
 */
const SAMPLED_ROWS: readonly SampledRow[] = [
  { elo: 400, nodes: 400, multiPv: 8, temperature: 300, blunderRate: 0.3, blunder: "legal", delay: [600, 2_000] },
  { elo: 600, nodes: 600, multiPv: 8, temperature: 240, blunderRate: 0.24, blunder: "legal", delay: [700, 2_500] },
  { elo: 800, nodes: 1_000, multiPv: 8, temperature: 190, blunderRate: 0.18, blunder: "legal", delay: [800, 3_000] },
  { elo: 1000, nodes: 1_500, multiPv: 8, temperature: 150, blunderRate: 0.13, blunder: "legal", delay: [800, 3_500] },
  { elo: 1200, nodes: 2_500, multiPv: 8, temperature: 110, blunderRate: 0.09, blunder: "legal", delay: [1_000, 4_000] },
];

interface EngineRow {
  elo: number;
  /** The `UCI_Elo` sent; equal to the label until the calibration says otherwise. */
  uciElo: number;
  browserNodeCap: number | null;
  delay: [number, number];
}

/**
 * research/bot-strength.md §3, rows 1320–2800, as the calibration left them
 * (2026-10-09). Stockfish picks its move at depth `1 + int(level)`, so a bot's
 * strength climbs in whole depths — some 140–220 points a depth below 2500,
 * 70–110 above — and moves little between two steps. With every label sent as
 * it is, the step to depth 6 fell at 2197, just under its anchor: a bot of 2184
 * played a whole depth below its label and measured 2035. The 2200 row sends
 * 2300, which moves that step to the label 2131, halfway between the top of
 * depth 5 (≈ 2060) and the bottom of depth 6 (≈ 2190), and the one to depth 7
 * from 2383 to 2365.
 */
const ENGINE_ROWS: readonly EngineRow[] = [
  { elo: 1320, uciElo: 1320, browserNodeCap: null, delay: [1_000, 4_000] },
  { elo: 1400, uciElo: 1400, browserNodeCap: null, delay: [1_000, 4_000] },
  { elo: 1600, uciElo: 1600, browserNodeCap: null, delay: [1_000, 4_000] },
  { elo: 1800, uciElo: 1800, browserNodeCap: null, delay: [1_000, 4_500] },
  { elo: 2000, uciElo: 2000, browserNodeCap: null, delay: [1_200, 4_500] },
  { elo: 2200, uciElo: 2300, browserNodeCap: null, delay: [1_200, 5_000] },
  { elo: 2400, uciElo: 2400, browserNodeCap: null, delay: [1_200, 5_000] },
  { elo: 2600, uciElo: 2600, browserNodeCap: 400_000, delay: [1_500, 5_500] },
  { elo: 2800, uciElo: 2800, browserNodeCap: 400_000, delay: [1_500, 6_000] },
];

/** The extrapolation above the last sampled row stops at these, so 1201–1319 stays sensible. */
const SAMPLED_LIMITS = { maxNodes: 20_000, minTemperature: 30, minBlunderRate: 0.01 };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** The two rows around `elo` and how far between them it is (extrapolating past the ends). */
function around<Row extends { elo: number }>(rows: readonly Row[], elo: number): [Row, Row, number] {
  let index = rows.findIndex((row) => row.elo >= elo);
  if (index === -1) index = rows.length - 1;
  if (index === 0) index = 1;
  const low = rows[index - 1]!;
  const high = rows[index]!;
  return [low, high, (elo - low.elo) / (high.elo - low.elo)];
}

function sampledStrength(elo: number): SampledStrength {
  const clamped = Math.max(SAMPLED_ROWS[0]!.elo, elo);
  const [low, high, t] = around(SAMPLED_ROWS, clamped);
  // The lower row's step for what is not a number to interpolate.
  const step = t >= 1 ? high : low;
  const nodes = Math.min(SAMPLED_LIMITS.maxNodes, Math.round(lerp(low.nodes, high.nodes, t)));
  const multiPv = step.multiPv;
  return {
    regime: "sampled",
    engine: { hash: BOT_HASH_MB, skillLevel: 20, limitStrength: false, multiPv },
    search: { nodes },
    multiPv,
    temperature: Math.max(SAMPLED_LIMITS.minTemperature, Math.round(lerp(low.temperature, high.temperature, t))),
    blunderRate: Math.max(SAMPLED_LIMITS.minBlunderRate, Number(lerp(low.blunderRate, high.blunderRate, t).toFixed(4))),
    blunder: step.blunder,
    delayMs: [
      Math.min(ENGINE_ROWS[0]!.delay[0], Math.round(lerp(low.delay[0], high.delay[0], t))),
      Math.min(ENGINE_ROWS[0]!.delay[1], Math.round(lerp(low.delay[1], high.delay[1], t))),
    ],
  };
}

function engineStrength(elo: number): EngineStrength {
  const clamped = Math.min(ENGINE_ROWS[ENGINE_ROWS.length - 1]!.elo, elo);
  const [low, high, t] = around(ENGINE_ROWS, clamped);
  const uciElo = Math.round(lerp(low.uciElo, high.uciElo, t));
  return {
    regime: "engine",
    engine: { hash: BOT_HASH_MB, limitStrength: true, uciElo, multiPv: 1 },
    uciElo,
    search: { depth: 1 + Math.floor(skillLevelFor(uciElo)) },
    browserNodeCap: elo >= 2600 ? 400_000 : null,
    delayMs: [Math.round(lerp(low.delay[0], high.delay[0], t)), Math.round(lerp(low.delay[1], high.delay[1], t))],
  };
}

/**
 * How Stockfish plays a bot of this Elo: total over 400–2800, by threshold
 * (1319 sampled, 1320 the engine's own), interpolated INSIDE each regime.
 */
export function strengthFor(elo: number): BotStrength {
  return elo <= SAMPLED_REGIME_MAX_ELO ? sampledStrength(elo) : engineStrength(elo);
}
