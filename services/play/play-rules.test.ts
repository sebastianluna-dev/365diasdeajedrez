import { describe, expect, it } from "vitest";
import {
  botLevelOf,
  countsForScore,
  isOpen,
  levelSeries,
  outcomeFor,
  playedGameVisibleWhere,
  seatOf,
  type BotLevelInput,
} from "./play-rules";

describe("playedGameVisibleWhere", () => {
  it("lets the staff read every game", () => {
    expect(playedGameVisibleWhere({ userId: "s", teacherId: null, isStaff: true })).toEqual({});
  });

  it("lets a person read the games where they hold a seat", () => {
    expect(playedGameVisibleWhere({ userId: "ana", teacherId: null, isStaff: false })).toEqual({
      OR: [{ whiteUserId: "ana" }, { blackUserId: "ana" }],
    });
  });

  it("lets a teacher read their students' games too, under an active assignment", () => {
    const where = playedGameVisibleWhere({ userId: "luis", teacherId: "t1", isStaff: false });
    const assigned = { studentAssignments: { some: { teacherId: "t1", endedAt: null } } };
    expect(where).toEqual({
      OR: [{ whiteUserId: "luis" }, { blackUserId: "luis" }, { whiteUser: assigned }, { blackUser: assigned }],
    });
  });
});

describe("seats, states and outcomes", () => {
  it("knows the seat a person holds, and none for whoever only reads", () => {
    expect(seatOf({ whiteUserId: "ana", blackUserId: null }, "ana")).toBe("white");
    expect(seatOf({ whiteUserId: null, blackUserId: "ana" }, "ana")).toBe("black");
    expect(seatOf({ whiteUserId: "ana", blackUserId: null }, "luis")).toBeNull();
  });

  it("tells an open game, and counts only a closed one with a result", () => {
    const now = new Date();
    expect(isOpen({ finishedAt: null })).toBe(true);
    expect(countsForScore({ finishedAt: now, resultCode: "WHITE_WINS" })).toBe(true);
    expect(countsForScore({ finishedAt: now, resultCode: "ONGOING" })).toBe(false); // aborted
    expect(countsForScore({ finishedAt: null, resultCode: "ONGOING" })).toBe(false);
  });

  it("reads the outcome from the result and the seat", () => {
    expect(outcomeFor("WHITE_WINS", "white")).toBe("win");
    expect(outcomeFor("WHITE_WINS", "black")).toBe("loss");
    expect(outcomeFor("DRAW", "black")).toBe("draw");
    expect(outcomeFor("ONGOING", "white")).toBeNull();
  });
});

describe("botLevelOf", () => {
  const day = (n: number) => new Date(Date.UTC(2026, 9, n));
  // research/puntuacion.md §5: the worked example.
  const EXAMPLE: BotLevelInput[] = [
    { botElo: 412, outcome: "win", finishedAt: day(1) },
    { botElo: 547, outcome: "win", finishedAt: day(2) },
    { botElo: 668, outcome: "win", finishedAt: day(3) },
    { botElo: 783, outcome: "draw", finishedAt: day(4) },
    { botElo: 891, outcome: "loss", finishedAt: day(5) },
    { botElo: 1036, outcome: "loss", finishedAt: day(6) },
    { botElo: 783, outcome: "win", finishedAt: day(7) },
    { botElo: 891, outcome: "draw", finishedAt: day(8) },
  ];

  it("is the worked example's ≈ 850: the bots' average plus 400 per net win, to the nearest 25", () => {
    expect(botLevelOf(EXAMPLE)).toEqual({ level: 850, sampleSize: 8 });
  });

  it("says nothing under five games", () => {
    expect(botLevelOf(EXAMPLE.slice(0, 4))).toEqual({ level: null, sampleSize: 4 });
  });

  it("looks at the last ten only, and stays within 400–2800", () => {
    const old = Array.from({ length: 10 }, (_, index) => ({
      botElo: 2700,
      outcome: "win" as const,
      finishedAt: day(index + 1),
    }));
    const recent = Array.from({ length: 10 }, (_, index) => ({
      botElo: 450,
      outcome: "loss" as const,
      finishedAt: day(index + 15),
    }));
    expect(botLevelOf([...old, ...recent])).toEqual({ level: 400, sampleSize: 10 });
    expect(botLevelOf(old).level).toBe(2800);
  });

  it("draws a sparkline point per game from the fifth on", () => {
    const series = levelSeries(EXAMPLE);
    expect(series).toHaveLength(4);
    expect(series.at(-1)).toEqual({ at: day(8), level: 850 });
  });
});
