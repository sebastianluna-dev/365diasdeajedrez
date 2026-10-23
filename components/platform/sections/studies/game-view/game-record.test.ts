import { describe, expect, it } from "vitest";
import type { GameView } from "@/services/studies/studies.types";
import { gameRecordOf } from "./game-record";

/** A game with only what each case gives it. */
const game = (fields: Partial<GameView>) => ({ moveCount: 0, ...fields }) as GameView;

describe("gameRecordOf", () => {
  it("titles the record with the event and puts where and when in one line", () => {
    const record = gameRecordOf(
      game({ event: "Nacional Abierto", round: "3", playedAtLabel: "12 oct 2026", site: "CDMX" }),
    );
    expect(record.title).toBe("Nacional Abierto");
    expect(record.context).toBe("Ronda 3 · 12 oct 2026 · CDMX");
  });

  it("gives the opening by its code and name, and the moves, as facts", () => {
    const record = gameRecordOf(game({ eco: "B90", moveCount: 1 }));
    expect(record.facts.map((fact) => [fact.kind, fact.text])).toEqual([
      ["opening", "B90"],
      ["moves", "1 jugada"],
    ]);
    expect(record.facts[0]?.detail).toBeTruthy();
  });

  it("says the game has nothing yet only when it has nothing", () => {
    expect(gameRecordOf(game({})).empty).toBe("Esta partida aún no tiene datos.");
    expect(gameRecordOf(game({ moveCount: 12 })).empty).toBeUndefined();
  });
});
