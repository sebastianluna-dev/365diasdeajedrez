import { describe, expect, it } from "vitest";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import {
  attemptsOf,
  canStartEncounter,
  encounterStatesOf,
  firstWinOf,
  nextEncounterOf,
  starsForAttempts,
  totalsOf,
  type AdventureGame,
} from "./adventure-rules";

const ENCOUNTERS = Array.from({ length: 12 }, (_, index) => ({ order: index + 1, isFinal: index === 11 }));

let clock = 0;
/** A game that ended `clock` minutes after the epoch: each call is later than the one before. */
function game(order: number, kind: "win" | "loss" | "draw" | "aborted" | "open", seat: "white" | "black" = "white") {
  clock += 1;
  const win: GameResultCode = seat === "white" ? GAME_RESULT.WHITE_WINS : GAME_RESULT.BLACK_WINS;
  const loss: GameResultCode = seat === "white" ? GAME_RESULT.BLACK_WINS : GAME_RESULT.WHITE_WINS;
  const resultCode = { win, loss, draw: GAME_RESULT.DRAW, aborted: GAME_RESULT.ONGOING, open: GAME_RESULT.ONGOING }[
    kind
  ];
  return {
    order,
    seat,
    resultCode,
    finishedAt: kind === "open" ? null : new Date(clock * 60_000),
  } satisfies AdventureGame;
}

/** `wins` consecutive first-try wins from the first encounter. */
const winsFrom = (count: number) => Array.from({ length: count }, (_, index) => game(index + 1, "win"));

describe("starsForAttempts", () => {
  it("gives 3 at the first try, 2 at the second or third and 1 after", () => {
    expect([1, 2, 3, 4, 5, 40].map(starsForAttempts)).toEqual([3, 2, 2, 1, 1, 1]);
  });

  it("gives none to someone who has not played", () => {
    expect(starsForAttempts(0)).toBe(0);
  });
});

describe("attemptsOf", () => {
  it("counts a loss, a draw and a win up to the first win", () => {
    expect(attemptsOf([game(1, "loss"), game(1, "draw"), game(1, "win")])).toEqual({ attempts: 3, isBeaten: true });
  });

  it("is a win at the first try when the first game is won", () => {
    expect(attemptsOf([game(1, "win")])).toEqual({ attempts: 1, isBeaten: true });
  });

  it("counts a draw as an attempt and does not beat the rival", () => {
    expect(attemptsOf([game(1, "draw")])).toEqual({ attempts: 1, isBeaten: false });
  });

  it("counts a resignation or an abandoned game as a loss: both are closed with a result", () => {
    expect(attemptsOf([game(1, "loss", "black"), game(1, "loss", "white")])).toEqual({ attempts: 2, isBeaten: false });
  });

  it("does not count an aborted game nor one still open", () => {
    expect(attemptsOf([game(1, "aborted"), game(1, "open"), game(1, "loss")])).toEqual({
      attempts: 1,
      isBeaten: false,
    });
    expect(attemptsOf([game(1, "aborted"), game(1, "win")])).toEqual({ attempts: 1, isBeaten: true });
  });

  it("orders by the end of the games and not by the order they come in", () => {
    const first = game(1, "loss");
    const second = game(1, "win");
    expect(attemptsOf([second, first])).toEqual({ attempts: 2, isBeaten: true });
  });

  it("is not changed by a second win, nor by anything after the first", () => {
    const games = [game(1, "loss"), game(1, "win"), game(1, "loss"), game(1, "win")];
    expect(attemptsOf(games)).toEqual({ attempts: 2, isBeaten: true });
  });

  it("reads the outcome from the seat the person held", () => {
    expect(attemptsOf([game(1, "win", "black")])).toEqual({ attempts: 1, isBeaten: true });
    expect(attemptsOf([{ ...game(1, "win", "black"), seat: "white" }])).toEqual({ attempts: 1, isBeaten: false });
  });

  it("starts at zero", () => {
    expect(attemptsOf([])).toEqual({ attempts: 0, isBeaten: false });
  });
});

describe("firstWinOf", () => {
  it("is the first win in the order the games ended, and none when there is not one", () => {
    const loss = game(1, "loss");
    const first = game(1, "win");
    const second = game(1, "win");
    expect(firstWinOf([second, loss, first])).toBe(first);
    expect(firstWinOf([loss, game(1, "draw"), game(1, "aborted"), game(1, "open")])).toBeNull();
    expect(firstWinOf([])).toBeNull();
  });

  it("reads the win from the seat the person held", () => {
    const win = game(1, "win", "black");
    expect(firstWinOf([win])).toBe(win);
    expect(firstWinOf([{ ...win, seat: "white" }])).toBeNull();
  });
});

describe("encounterStatesOf", () => {
  it("opens only the first when nothing has been played", () => {
    const states = encounterStatesOf(ENCOUNTERS, []);
    expect(states.map((progress) => progress.state)).toEqual(["available", ...Array(11).fill("locked")]);
    expect(states.every((progress) => progress.attempts === 0 && progress.stars === 0)).toBe(true);
  });

  it("opens the next page only after a win", () => {
    const states = encounterStatesOf(ENCOUNTERS, [game(1, "loss"), game(1, "draw")]);
    expect(states[0]).toMatchObject({ state: "available", attempts: 2, stars: 0 });
    expect(states[1]!.state).toBe("locked");
  });

  it("gives 3, 2, 2 and 1 stars at the first, second, third and fourth try", () => {
    const games = [
      game(1, "win"),
      game(2, "loss"),
      game(2, "win"),
      game(3, "loss"),
      game(3, "draw"),
      game(3, "win"),
      game(4, "loss"),
      game(4, "loss"),
      game(4, "loss"),
      game(4, "win"),
    ];
    const states = encounterStatesOf(ENCOUNTERS, games);
    expect(states.slice(0, 4).map((progress) => [progress.attempts, progress.stars])).toEqual([
      [1, 3],
      [2, 2],
      [3, 2],
      [4, 1],
    ]);
    expect(states.slice(0, 4).every((progress) => progress.state === "beaten")).toBe(true);
    expect(states[4]!.state).toBe("available");
  });

  it("leaves the stars of a beaten rival as they were after a second win", () => {
    const before = encounterStatesOf(ENCOUNTERS, [game(1, "loss"), game(1, "win")]);
    const after = encounterStatesOf(ENCOUNTERS, [game(1, "loss"), game(1, "win"), game(1, "win"), game(1, "loss")]);
    expect(after).toEqual(before);
    expect(after[0]).toMatchObject({ state: "beaten", attempts: 2, stars: 2 });
  });

  it("does not open a page for a win against a rival that is still locked", () => {
    const states = encounterStatesOf(ENCOUNTERS, [game(3, "win")]);
    expect(states[0]!.state).toBe("available");
    expect(states[1]!.state).toBe("locked");
    expect(states[2]!.state).toBe("beaten");
    expect(states[3]!.state).toBe("locked");
  });

  it("opens the final only after the eleven", () => {
    const eleven = encounterStatesOf(ENCOUNTERS, winsFrom(11));
    expect(eleven[10]!.state).toBe("beaten");
    expect(eleven[11]!.state).toBe("available");

    const ten = encounterStatesOf(ENCOUNTERS, winsFrom(10));
    expect(ten[10]!.state).toBe("available");
    expect(ten[11]!.state).toBe("locked");
  });

  it("completes the adventure with the twelfth win", () => {
    const states = encounterStatesOf(ENCOUNTERS, winsFrom(12));
    expect(states.every((progress) => progress.state === "beaten")).toBe(true);
    expect(nextEncounterOf(states)).toBeNull();
  });

  it("answers in story order whatever order it is given", () => {
    const states = encounterStatesOf([...ENCOUNTERS].reverse(), winsFrom(2));
    expect(states.map((progress) => progress.order)).toEqual(ENCOUNTERS.map((encounter) => encounter.order));
  });

  it("leaves the demo student at 4 of 12: three stars, two, one and three, and a lost first try at the fifth", () => {
    const games = [
      game(1, "win"),
      game(2, "loss"),
      game(2, "win"),
      game(3, "loss"),
      game(3, "loss"),
      game(3, "loss"),
      game(3, "win"),
      game(4, "win"),
      game(5, "loss"),
    ];
    const states = encounterStatesOf(ENCOUNTERS, games);
    expect(states.slice(0, 4).map((progress) => progress.stars)).toEqual([3, 2, 1, 3]);
    expect(states[4]).toMatchObject({ state: "available", attempts: 1, stars: 0 });
    expect(states.slice(5).every((progress) => progress.state === "locked")).toBe(true);
    expect(totalsOf(states)).toEqual({ beaten: 4, stars: 9 });
  });
});

describe("nextEncounterOf and canStartEncounter", () => {
  const states = encounterStatesOf(ENCOUNTERS, winsFrom(4));

  it("names the available encounter", () => {
    expect(nextEncounterOf(states)?.order).toBe(5);
  });

  it("lets a person start the available encounter or challenge a beaten one again, never a locked one", () => {
    expect(canStartEncounter(states, 5)).toBe(true);
    expect(canStartEncounter(states, 1)).toBe(true);
    expect(canStartEncounter(states, 6)).toBe(false);
    expect(canStartEncounter(states, 12)).toBe(false);
    expect(canStartEncounter(states, 13)).toBe(false);
    expect(canStartEncounter(states, 0)).toBe(false);
  });
});
