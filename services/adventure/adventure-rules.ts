import type { GameResultCode } from "@/constants/platform/study-codes.const";
import { countsForScore, outcomeFor } from "@/services/play/play-rules";
import type { AdventureProgressView, EncounterProgress, EncounterStars } from "./adventure.types";

// How far a person is in an adventure, as pure functions of their games: no
// table holds it, so it can never disagree with the games. The story waits:
// only a win opens the next page; a draw or a loss is tried again without
// limit. Nothing here touches Prisma, nor the activity log (playing never
// counts toward the streak).

/** A game of a person against an adventure's rival, as the rules read it. */
export interface AdventureGame {
  /** The encounter it was played against, 1 to 12. */
  order: number;
  finishedAt: Date | null;
  resultCode: GameResultCode;
  /** The seat the person held. */
  seat: "white" | "black";
  /** Half-moves played; the map says «Ganaste en 24 jugadas» from it. */
  plyCount?: number;
}

/** An encounter as the rules see it: its place in the story, and whether it closes the story. */
export interface EncounterSlot {
  order: number;
  isFinal?: boolean;
}

/** Stars by attempts: the first try gives 3, the second or third 2, any later 1. */
export function starsForAttempts(attempts: number): EncounterStars {
  if (attempts < 1) return 0;
  if (attempts === 1) return 3;
  if (attempts <= 3) return 2;
  return 1;
}

/**
 * The attempts against one rival: the games that count (closed, with a result;
 * an aborted one has none, a resignation or an abandoned game is a loss), in
 * the order they ended, up to the first win inclusive. A win after the first
 * changes nothing, and neither does anything that comes after it.
 */
export function attemptsOf(games: readonly Pick<AdventureGame, "finishedAt" | "resultCode" | "seat">[]): {
  attempts: number;
  isBeaten: boolean;
} {
  const counted = games
    .filter((game) => countsForScore(game))
    .sort((a, b) => a.finishedAt!.getTime() - b.finishedAt!.getTime());
  const firstWin = counted.findIndex((game) => outcomeFor(game.resultCode, game.seat) === "win");
  return firstWin === -1 ? { attempts: counted.length, isBeaten: false } : { attempts: firstWin + 1, isBeaten: true };
}

/** The game that beat the rival: the first win among the games that count, in the order they ended; null if none. */
export function firstWinOf<T extends Pick<AdventureGame, "finishedAt" | "resultCode" | "seat">>(
  games: readonly T[],
): T | null {
  return (
    games
      .filter((game) => countsForScore(game))
      .sort((a, b) => a.finishedAt!.getTime() - b.finishedAt!.getTime())
      .find((game) => outcomeFor(game.resultCode, game.seat) === "win") ?? null
  );
}

/**
 * Every encounter's state, attempts and stars: beaten once won; the first not
 * beaten is the available one, and every one after it is locked. The final
 * page opens only after all the others are beaten.
 */
export function encounterStatesOf(
  encounters: readonly EncounterSlot[],
  games: readonly AdventureGame[],
): EncounterProgress[] {
  const byOrder = new Map<number, AdventureGame[]>();
  for (const game of games) byOrder.set(game.order, [...(byOrder.get(game.order) ?? []), game]);

  const ordered = [...encounters].sort((a, b) => a.order - b.order);
  const attempts = new Map(
    ordered.map((encounter) => [encounter.order, attemptsOf(byOrder.get(encounter.order) ?? [])]),
  );
  const othersBeaten = ordered.filter((encounter) => !encounter.isFinal).every((e) => attempts.get(e.order)!.isBeaten);

  let open = true;
  return ordered.map((encounter) => {
    const { attempts: tries, isBeaten } = attempts.get(encounter.order)!;
    if (isBeaten) return { order: encounter.order, state: "beaten", attempts: tries, stars: starsForAttempts(tries) };
    const isOpen = open && (!encounter.isFinal || othersBeaten);
    open = false;
    return { order: encounter.order, state: isOpen ? "available" : "locked", attempts: tries, stars: 0 };
  });
}

/** The encounter available to play next, or null when none is (the adventure is complete). */
export function nextEncounterOf(states: readonly EncounterProgress[]): EncounterProgress | null {
  return states.find((progress) => progress.state === "available") ?? null;
}

/** Whether a person may start an encounter: the available one, or a beaten one to challenge again. */
export function canStartEncounter(states: readonly EncounterProgress[], order: number): boolean {
  const progress = states.find((candidate) => candidate.order === order);
  return progress !== undefined && progress.state !== "locked";
}

/** How many encounters are beaten and how many stars they earned. */
export function totalsOf(states: readonly EncounterProgress[]): { beaten: number; stars: number } {
  return {
    beaten: states.filter((progress) => progress.state === "beaten").length,
    stars: states.reduce((sum, progress) => sum + progress.stars, 0),
  };
}

/**
 * Whether the map can play the victory over encounter `order`: it is beaten,
 * and what the win opened is still as it opened — the next rival is the one to
 * play and has not been tried (or there is none: it was the last page). An old
 * or made-up address plays nothing.
 */
export function isVictoryPlayable(progress: AdventureProgressView, order: number): boolean {
  const won = progress.encounters.find((encounter) => encounter.order === order);
  if (won?.state !== "beaten") return false;
  const next = progress.encounters.find((encounter) => encounter.order === order + 1);
  return next === undefined || (next.state === "available" && next.attempts === 0);
}

/**
 * The adventure as it was the moment before encounter `order` was won, so the
 * victory can be played from there: the rival is the one to play again, with
 * the attempts it had before the winning game and no stars, no postmark and no
 * keepsake yet; the next one is locked; and the count is one rival and its
 * stars short. Pure: the map derives it from the progress it was given.
 */
export function progressBeforeVictory(progress: AdventureProgressView, order: number): AdventureProgressView {
  const won = progress.encounters.find((encounter) => encounter.order === order);
  if (won?.state !== "beaten") return progress;
  const encounters = progress.encounters.map((encounter) => {
    if (encounter.order === order)
      return {
        ...encounter,
        state: "available" as const,
        attempts: Math.max(0, encounter.attempts - 1),
        stars: 0 as const,
        beatenAt: null,
        winPlies: null,
      };
    if (encounter.order === order + 1 && encounter.state === "available")
      return { ...encounter, state: "locked" as const };
    return encounter;
  });
  return {
    ...progress,
    encounters,
    current: encounters.find((encounter) => encounter.order === order) ?? null,
    beaten: progress.beaten - 1,
    stars: progress.stars - won.stars,
    isComplete: false,
  };
}
