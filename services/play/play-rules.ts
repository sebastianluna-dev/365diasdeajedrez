import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// The rules of the played games, as pure functions: who may see one, which
// seat a person holds, whether it is open or counts, and the «nivel contra
// bots». No Prisma call here — only the `where` fragments the services put
// INSIDE their queries, so a game nobody may see is never even read.

/** Who is looking: the person, the teacher record they hold (if any) and whether they are staff. */
export interface Viewer {
  userId: string;
  /** `Teacher.id`, the one assignments reference; null for whoever is not an active teacher. */
  teacherId: string | null;
  isStaff: boolean;
}

/**
 * The played games a viewer may read: the staff, all; anyone else, those
 * where they hold a seat, and — for a teacher — those of their students under
 * an active assignment. Reading only: writing needs a seat (`seatOf`).
 */
export function playedGameVisibleWhere(viewer: Viewer): Prisma.PlayedGameWhereInput {
  if (viewer.isStaff) return {};
  const seats: Prisma.PlayedGameWhereInput[] = [{ whiteUserId: viewer.userId }, { blackUserId: viewer.userId }];
  if (viewer.teacherId) {
    const assigned = { studentAssignments: { some: { teacherId: viewer.teacherId, endedAt: null } } };
    seats.push({ whiteUser: assigned }, { blackUser: assigned });
  }
  return { OR: seats };
}

/** The seat a person holds in a game, or null when they hold none (they may only read). */
export function seatOf(
  game: { whiteUserId: string | null; blackUserId: string | null },
  userId: string,
): "white" | "black" | null {
  if (game.whiteUserId === userId) return "white";
  if (game.blackUserId === userId) return "black";
  return null;
}

/** A game still being played. */
export function isOpen(game: { finishedAt: Date | null }): boolean {
  return game.finishedAt === null;
}

/**
 * A game that counts for the scoreboard and the level: closed, and with a
 * result. An aborted game is closed but keeps `ONGOING`: it counts for nothing.
 */
export function countsForScore(game: { finishedAt: Date | null; resultCode: GameResultCode }): boolean {
  return game.finishedAt !== null && game.resultCode !== GAME_RESULT.ONGOING;
}

/** A person's outcome from the result and the seat they held. */
export function outcomeFor(resultCode: GameResultCode, seat: "white" | "black"): "win" | "loss" | "draw" | null {
  if (resultCode === GAME_RESULT.DRAW) return "draw";
  if (resultCode === GAME_RESULT.WHITE_WINS) return seat === "white" ? "win" : "loss";
  if (resultCode === GAME_RESULT.BLACK_WINS) return seat === "black" ? "win" : "loss";
  return null;
}

// --- «Nivel contra bots» (research/puntuacion.md §5) --------------------------

/** The games the level is computed over, the most recent first. */
export const BOT_LEVEL_WINDOW = 10;
/** Fewer finished games than this and there is no level to show. */
export const BOT_LEVEL_MIN_GAMES = 5;

export interface BotLevelInput {
  /** The bot's strength when the game was played (`whiteElo`/`blackElo`). */
  botElo: number;
  outcome: "win" | "loss" | "draw";
  finishedAt: Date;
}

const LEVEL_FLOOR = 400;
const LEVEL_CEILING = 2800;

/** The level over these games: the average of the bots, plus 400 per net win spread over the games. */
function levelOver(games: readonly BotLevelInput[]): number {
  const average = games.reduce((sum, game) => sum + game.botElo, 0) / games.length;
  const wins = games.filter((game) => game.outcome === "win").length;
  const losses = games.filter((game) => game.outcome === "loss").length;
  const level = Math.round((average + (400 * (wins - losses)) / games.length) / 25) * 25;
  return Math.min(LEVEL_CEILING, Math.max(LEVEL_FLOOR, level));
}

/**
 * «Nivel contra bots ≈ 850»: over the last ten finished games against bots
 * (a resignation is a loss; an unfinished game does not count), with at least
 * five to show anything. Rounded to 25 and kept within 400–2800. Computed when
 * it is read, never stored.
 */
export function botLevelOf(games: readonly BotLevelInput[]): { level: number | null; sampleSize: number } {
  const recent = [...games].sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime()).slice(0, BOT_LEVEL_WINDOW);
  return { level: recent.length >= BOT_LEVEL_MIN_GAMES ? levelOver(recent) : null, sampleSize: recent.length };
}

/** The level after each finished game, each over the ten up to it: the profile's sparkline. */
export function levelSeries(games: readonly BotLevelInput[]): { at: Date; level: number }[] {
  const ordered = [...games].sort((a, b) => a.finishedAt.getTime() - b.finishedAt.getTime());
  return ordered.flatMap((game, index) => {
    const window = ordered.slice(Math.max(0, index + 1 - BOT_LEVEL_WINDOW), index + 1);
    return window.length >= BOT_LEVEL_MIN_GAMES ? [{ at: game.finishedAt, level: levelOver(window) }] : [];
  });
}
