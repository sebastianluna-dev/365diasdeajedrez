// Measures the bots' strength by playing them, before any Elo is promised.
//
//   npm run bots:calibrate -- [--bots tere,sofia,carlsen] [--games 120] [--workers 6] [--seed 7]
//   npm run bots:calibrate -- --check            (what is measured, what is missing, whether the engine changed)
//   npm run bots:calibrate -- --verify-openings  (the openings are still balanced)
//
// It reads no `.env.local` and touches no database: it runs the engine the
// browser loads (`node public/engine/stockfish.js`) as child processes and
// writes `lib/chess/bots/calibration.json`. Always run it through `npm run`.
//
// Method (research/bot-strength.md §4):
// - Fixed anchors: Stockfish at `UCI_Elo` 1320, 1400, 1600 … 2800, 3000, each
//   searching to its pick depth, with no node cap.
// - A bot of 1320 and up plays the anchors within ±300 of its label. A bot of
//   the sampled regime (≤ 1319) plays its neighbours within ±300 — every
//   sampled bot from it up to 1319 joins the run as a rung of the ladder — and
//   the anchors within reach, so the chain hangs from them.
// - Each pairing plays the twelve balanced openings of
//   `lib/chess/__fixtures__/calibration-openings.pgn`, each twice with the
//   colours swapped. A game ends by the rules (`gameEnd`) or, after 400 plies,
//   as a draw.
// - The ratings are fitted jointly (Bradley-Terry on the Elo scale, draws as
//   half points, the anchors fixed) with one virtual draw against each
//   opponent, so a clean sweep does not run to infinity; the margin is 1.96
//   standard deviations of a bootstrap over the games.
//
// The figure is an Elo in Stockfish's pool, not on the human scale: the
// engine regime measured against `UCI_Elo` anchors is Stockfish against itself
// and holds by construction; what this really measures is the sampled regime
// and the ladder's continuity. Its human calibration comes later, from the
// students' games.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parsePgn } from "chessops/pgn";
import {
  BOT_HASH_MB,
  skillLevelFor,
  strengthFor,
  type BotStrength,
  type EngineStrength,
} from "../lib/chess/bots/bot-strength";
import { chooseBotMove } from "../lib/chess/bots/choose-bot-move";
import { mulberry32, seedOf } from "../lib/chess/bots/rng";
import { BOT_ROSTER } from "../lib/chess/bots/roster";
import { createEngineClient, type EngineClient } from "../lib/chess/engine/engine-client";
import { gameEnd } from "../lib/chess/game-end";
import { legalUciMoves } from "../lib/chess/legal-moves";
import { currentFen, playSan, uciMoves, type LiveGame } from "../lib/chess/live-game";
import { uciLineToSan } from "../lib/chess/replay";
import { createProcessTransport, ENGINE_SCRIPT } from "./lib/engine-process-transport";

const OPENINGS_FILE = resolve(process.cwd(), "lib/chess/__fixtures__/calibration-openings.pgn");
const REPORT_FILE = resolve(process.cwd(), "lib/chess/bots/calibration.json");
const ENGINE_WASM = resolve(process.cwd(), "public/engine/stockfish.wasm");

const ANCHORS = [1320, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000];
const WINDOW = 300;
const MAX_PLIES = 400;
const BOOTSTRAP_ROUNDS = 200;
/**
 * An opening is balanced when its final position is within this many
 * centipawns at depth 16. Not 30: the main lines of 1.e4 and 1.d4 keep White's
 * first-move edge of 30–50 cp at that depth, and each opening is played twice
 * with the colours swapped, which cancels it.
 */
const OPENING_TOLERANCE_CP = 50;

// --- The report -------------------------------------------------------------

export interface CalibrationEntry {
  /** The label the bot had when it was measured. */
  label: number;
  /** Its Elo in the pool of the anchors. */
  measured: number;
  /** ± at 95 %. */
  margin: number;
  games: number;
  measuredAt: string;
}

export interface CalibrationReport {
  /** The engine measured: a new build makes the whole report stale. */
  engineBuild: string;
  anchors: number[];
  bots: Record<string, CalibrationEntry>;
}

function engineBuild(): string {
  return `sha256:${createHash("sha256").update(readFileSync(ENGINE_WASM)).digest("hex").slice(0, 16)}`;
}

function readReport(): CalibrationReport | null {
  if (!existsSync(REPORT_FILE)) return null;
  return JSON.parse(readFileSync(REPORT_FILE, "utf8")) as CalibrationReport;
}

// --- Players ------------------------------------------------------------------

interface Player {
  id: string;
  /** The label: the bot's Elo, or the anchor's `UCI_Elo`. */
  label: number;
  anchor: boolean;
  strength: BotStrength;
}

function anchorStrength(elo: number): EngineStrength {
  return {
    regime: "engine",
    engine: { hash: BOT_HASH_MB, limitStrength: true, uciElo: elo, multiPv: 1 },
    uciElo: elo,
    search: { depth: 1 + Math.floor(skillLevelFor(elo)) },
    browserNodeCap: null,
    delayMs: [0, 0],
  };
}

const anchorPlayers: Player[] = ANCHORS.map((elo) => ({
  id: `anchor-${elo}`,
  label: elo,
  anchor: true,
  strength: anchorStrength(elo),
}));

function botPlayer(slug: string): Player {
  const seed = BOT_ROSTER.find((bot) => bot.slug === slug);
  if (!seed) throw new Error(`No bot «${slug}» in the roster`);
  return { id: slug, label: seed.elo, anchor: false, strength: strengthFor(seed.elo) };
}

// --- Openings -----------------------------------------------------------------

function readOpenings(): { name: string; sans: string[] }[] {
  return parsePgn(readFileSync(OPENINGS_FILE, "utf8"))
    .map((game) => ({
      name: game.headers.get("Event") ?? "?",
      sans: [...game.moves.mainline()].map((node) => node.san),
    }))
    .filter((opening) => opening.sans.length > 0);
}

// --- Playing a game -------------------------------------------------------------

interface GameResult {
  white: string;
  black: string;
  /** White's score. */
  score: 1 | 0.5 | 0;
  plies: number;
  reason: string;
}

type Engines = [EngineClient, EngineClient];

function createEngines(): Engines {
  return [createEngineClient(createProcessTransport()), createEngineClient(createProcessTransport())];
}

async function playGame(
  engines: Engines,
  white: Player,
  black: Player,
  opening: string[],
  seed: string,
): Promise<GameResult> {
  for (const [client, player] of [
    [engines[0], white],
    [engines[1], black],
  ] as const) {
    await client.ready();
    await client.setOptions(player.strength.engine);
    await client.newGame();
  }

  let game: LiveGame = { initialFen: null, sans: opening };
  for (;;) {
    const end = gameEnd(null, game.sans);
    if (end) {
      const score = end.winner === "white" ? 1 : end.winner === "black" ? 0 : 0.5;
      return { white: white.id, black: black.id, score, plies: game.sans.length, reason: end.kind };
    }
    if (game.sans.length >= MAX_PLIES) {
      return { white: white.id, black: black.id, score: 0.5, plies: game.sans.length, reason: "max-plies" };
    }

    const whiteToMove = game.sans.length % 2 === 0;
    const player = whiteToMove ? white : black;
    const client = whiteToMove ? engines[0] : engines[1];
    const fen = currentFen(game)!;
    const reply = await client.bestMove({ fen: null, moves: uciMoves(game), search: player.strength.search });

    let uci: string | null;
    if (player.strength.regime === "sampled") {
      const rng = mulberry32(seedOf(seed, game.sans.length));
      uci = chooseBotMove(reply.candidates, player.strength, legalUciMoves(fen), rng)?.uci ?? null;
    } else {
      uci = reply.bestMove;
    }
    const san = uci ? uciLineToSan(fen, [uci])[0] : undefined;
    const next = san ? playSan(game, san) : null;
    if (!next) throw new Error(`${player.id} had no playable move at ${fen} (${uci ?? "none"})`);
    game = next;
  }
}

// --- The schedule ---------------------------------------------------------------

interface Pairing {
  a: Player;
  b: Player;
  games: number;
}

function schedule(targets: Player[], gamesPerBot: number): { players: Player[]; pairings: Pairing[] } {
  const bots = new Map(targets.map((player) => [player.id, player]));
  // Every sampled bot between a sampled target and the engine's floor joins as a rung.
  for (const target of targets) {
    if (target.strength.regime !== "sampled") continue;
    for (const seed of BOT_ROSTER) {
      if (seed.elo >= target.label && seed.elo <= 1319 && !bots.has(seed.slug))
        bots.set(seed.slug, botPlayer(seed.slug));
    }
  }

  const sampledBots = [...bots.values()].filter((player) => player.strength.regime === "sampled");
  const wanted = new Map<string, Pairing>();
  for (const bot of bots.values()) {
    const pool = bot.strength.regime === "sampled" ? [...sampledBots, ...anchorPlayers] : anchorPlayers;
    const opponents = pool.filter((other) => other.id !== bot.id && Math.abs(other.label - bot.label) <= WINDOW);
    if (opponents.length === 0) throw new Error(`${bot.id} has no opponent within ±${WINDOW}`);
    const each = Math.ceil(gamesPerBot / opponents.length / 2) * 2;
    for (const opponent of opponents) {
      const key = [bot.id, opponent.id].sort().join(" vs ");
      const known = wanted.get(key);
      if (!known || known.games < each) wanted.set(key, { a: bot, b: opponent, games: each });
    }
  }

  const players = [
    ...bots.values(),
    ...anchorPlayers.filter((anchor) => [...wanted.values()].some((p) => p.b.id === anchor.id)),
  ];
  return { players, pairings: [...wanted.values()] };
}

// --- The fit ----------------------------------------------------------------------

const LN10_400 = Math.LN10 / 400;

/** Elo ratings by maximum likelihood, the anchors fixed, with one virtual draw per distinct opponent. */
export function fitRatings(players: Player[], games: GameResult[]): Map<string, number> {
  const ratings = new Map(players.map((player) => [player.id, player.label]));
  const fixed = new Set(players.filter((player) => player.anchor).map((player) => player.id));
  const opponentsOf = new Map<string, Set<string>>();
  for (const game of games) {
    if (!opponentsOf.has(game.white)) opponentsOf.set(game.white, new Set());
    if (!opponentsOf.has(game.black)) opponentsOf.set(game.black, new Set());
    opponentsOf.get(game.white)!.add(game.black);
    opponentsOf.get(game.black)!.add(game.white);
  }

  for (let iteration = 0; iteration < 500; iteration++) {
    let largest = 0;
    for (const player of players) {
      if (fixed.has(player.id)) continue;
      let gradient = 0;
      let curvature = 0;
      const add = (opponent: string, score: number) => {
        const expected = 1 / (1 + 10 ** ((ratings.get(opponent)! - ratings.get(player.id)!) / 400));
        gradient += score - expected;
        curvature += expected * (1 - expected);
      };
      for (const game of games) {
        if (game.white === player.id) add(game.black, game.score);
        else if (game.black === player.id) add(game.white, 1 - game.score);
      }
      for (const opponent of opponentsOf.get(player.id) ?? []) add(opponent, 0.5);
      if (curvature === 0) continue;
      const step = Math.max(-200, Math.min(200, gradient / (LN10_400 * curvature)));
      ratings.set(player.id, ratings.get(player.id)! + step);
      largest = Math.max(largest, Math.abs(step));
    }
    if (largest < 0.01) break;
  }
  return ratings;
}

function bootstrapMargins(players: Player[], games: GameResult[], seed: number): Map<string, number> {
  const rng = mulberry32(seed);
  const samples = new Map<string, number[]>(players.map((player) => [player.id, []]));
  for (let round = 0; round < BOOTSTRAP_ROUNDS; round++) {
    const resampled = games.map(() => games[Math.floor(rng() * games.length)]!);
    const ratings = fitRatings(players, resampled);
    for (const [id, rating] of ratings) samples.get(id)!.push(rating);
  }
  const margins = new Map<string, number>();
  for (const [id, values] of samples) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, values.length - 1);
    margins.set(id, Math.round(1.96 * Math.sqrt(variance)));
  }
  return margins;
}

// --- Commands -----------------------------------------------------------------------

function argument(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}

const flag = (name: string) => process.argv.includes(`--${name}`);

async function calibrate(): Promise<void> {
  const slugs = argument("bots")?.split(",").filter(Boolean) ?? BOT_ROSTER.map((bot) => bot.slug);
  const gamesPerBot = Number(argument("games") ?? 120);
  const workers = Number(argument("workers") ?? 6);
  const seed = Number(argument("seed") ?? 7);

  const targets = slugs.map(botPlayer);
  const { players, pairings } = schedule(targets, gamesPerBot);
  const openings = readOpenings();

  const jobs: { white: Player; black: Player; opening: string[]; seed: string }[] = [];
  for (const pairing of pairings) {
    for (let index = 0; index < pairing.games; index++) {
      const opening = openings[Math.floor(index / 2) % openings.length]!;
      const [white, black] = index % 2 === 0 ? [pairing.a, pairing.b] : [pairing.b, pairing.a];
      jobs.push({ white, black, opening: opening.sans, seed: `${seed}:${pairing.a.id}:${pairing.b.id}:${index}` });
    }
  }

  console.log(
    `Calibrating ${targets.map((t) => t.id).join(", ")} — ${players.length} players, ${pairings.length} pairings, ${jobs.length} games on ${workers} workers.`,
  );
  const started = Date.now();
  const results: GameResult[] = [];
  let next = 0;

  await Promise.all(
    Array.from({ length: workers }, async () => {
      let engines = createEngines();
      while (next < jobs.length) {
        const job = jobs[next++]!;
        try {
          results.push(await playGame(engines, job.white, job.black, job.opening, job.seed));
        } catch (error) {
          // A dead engine is replaced and the game played once more.
          console.warn(`  retrying ${job.white.id}–${job.black.id}: ${(error as Error).message}`);
          for (const engine of engines) engine.terminate();
          engines = createEngines();
          results.push(await playGame(engines, job.white, job.black, job.opening, job.seed));
        }
        if (results.length % 10 === 0 || results.length === jobs.length) {
          const seconds = Math.round((Date.now() - started) / 1000);
          console.log(`  ${results.length}/${jobs.length} games · ${seconds} s`);
        }
      }
      for (const engine of engines) engine.terminate();
    }),
  );

  const ratings = fitRatings(players, results);
  const margins = bootstrapMargins(players, results, seed);
  const today = new Date().toISOString().slice(0, 10);
  const previous = readReport();
  const build = engineBuild();
  const report: CalibrationReport = {
    engineBuild: build,
    anchors: ANCHORS,
    // A report of another engine build is dropped whole: its figures no longer hold.
    bots: previous?.engineBuild === build ? { ...previous.bots } : {},
  };

  console.log("\nslug                 label  measured   ±     games");
  for (const player of players) {
    if (player.anchor) continue;
    const games = results.filter((game) => game.white === player.id || game.black === player.id).length;
    const measured = Math.round(ratings.get(player.id)!);
    const margin = margins.get(player.id)!;
    report.bots[player.id] = { label: player.label, measured, margin, games, measuredAt: today };
    console.log(
      `${player.id.padEnd(20)} ${String(player.label).padStart(5)}  ${String(measured).padStart(8)}  ${String(margin).padStart(4)}  ${String(games).padStart(6)}`,
    );
  }

  const ordered = Object.fromEntries(
    BOT_ROSTER.filter((bot) => report.bots[bot.slug]).map((bot) => [bot.slug, report.bots[bot.slug]!]),
  );
  writeFileSync(REPORT_FILE, `${JSON.stringify({ ...report, bots: ordered }, null, 2)}\n`);
  console.log(`\nWritten ${REPORT_FILE} after ${Math.round((Date.now() - started) / 1000)} s.`);
}

function check(): void {
  const report = readReport();
  if (!report) {
    console.log("No calibration report yet: run `npm run bots:calibrate`.");
    return;
  }
  const build = engineBuild();
  if (report.engineBuild !== build) {
    console.log(
      `The engine changed since the report (${report.engineBuild} → ${build}): every bot needs measuring again.`,
    );
  }
  const missing = BOT_ROSTER.filter((bot) => !report.bots[bot.slug]).map((bot) => bot.slug);
  const relabelled = BOT_ROSTER.filter((bot) => report.bots[bot.slug] && report.bots[bot.slug]!.label !== bot.elo).map(
    (bot) => bot.slug,
  );
  console.log(`${BOT_ROSTER.length - missing.length} of ${BOT_ROSTER.length} bots measured.`);
  if (missing.length > 0) console.log(`Not measured: ${missing.join(", ")}`);
  if (relabelled.length > 0) console.log(`Label changed since measured: ${relabelled.join(", ")}`);
}

async function verifyOpenings(): Promise<void> {
  const client = createEngineClient(createProcessTransport());
  await client.ready();
  await client.setOptions({ hash: BOT_HASH_MB, skillLevel: 20, limitStrength: false, multiPv: 1 });
  let unbalanced = 0;
  for (const opening of readOpenings()) {
    await client.newGame();
    const game: LiveGame = { initialFen: null, sans: opening.sans };
    const { candidates } = await client.bestMove({ fen: null, moves: uciMoves(game), search: { depth: 16 } });
    const best = candidates[0];
    // The mover's centipawns, read from White's side: four moves each, so White is to move.
    const cp = best?.cp ?? (best?.mateIn ? Math.sign(best.mateIn) * 10_000 : 0);
    const balanced = Math.abs(cp) <= OPENING_TOLERANCE_CP;
    if (!balanced) unbalanced++;
    console.log(
      `${balanced ? "ok " : "OFF"} ${opening.name.padEnd(18)} ${String(cp).padStart(5)} cp  ${opening.sans.join(" ")}`,
    );
  }
  client.terminate();
  if (unbalanced > 0) {
    console.log(`${unbalanced} opening(s) beyond ±${OPENING_TOLERANCE_CP} cp: replace them in ${OPENINGS_FILE}.`);
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  if (!existsSync(ENGINE_SCRIPT)) throw new Error(`No engine at ${ENGINE_SCRIPT}`);
  if (flag("check")) return check();
  if (flag("verify-openings")) return verifyOpenings();
  return calibrate();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
