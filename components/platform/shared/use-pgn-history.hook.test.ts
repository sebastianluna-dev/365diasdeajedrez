import { describe, expect, it } from "vitest";

import { HISTORY_LIMIT, pgnReducer, type PgnHistory } from "./use-pgn-history.hook";

const initial: PgnHistory = { pgn: "1. e4", past: [] };

describe("el historial del PGN", () => {
  it("un cambio guarda el estado anterior y deshacer lo devuelve", () => {
    const edited = pgnReducer(initial, { type: "edit", pgn: "1. e4 e5" });
    expect(edited).toEqual({ pgn: "1. e4 e5", past: ["1. e4"] });
    expect(pgnReducer(edited, { type: "undo" })).toEqual(initial);
  });

  it("el mismo PGN dos veces no gasta un paso de deshacer", () => {
    expect(pgnReducer(initial, { type: "edit", pgn: "1. e4" })).toBe(initial);
  });

  it("deshacer sin pasado deja el estado como está", () => {
    expect(pgnReducer(initial, { type: "undo" })).toBe(initial);
  });

  it("recuerda como mucho los últimos pasos", () => {
    let state = initial;
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) state = pgnReducer(state, { type: "edit", pgn: `move ${i}` });
    expect(state.past).toHaveLength(HISTORY_LIMIT);
    expect(state.past[0]).toBe("move 9");
  });
});
