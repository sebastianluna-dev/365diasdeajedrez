import { describe, expect, it } from "vitest";
import { gameBlockSource } from "./block-rules";

describe("gameBlockSource", () => {
  it("la partida transcrita manda sobre la citada", () => {
    expect(gameBlockSource({ pgn: "1. e4 *", gameId: "g1" })).toEqual({ kind: "pgn", pgn: "1. e4 *" });
    expect(gameBlockSource({ pgn: "  ", gameId: "g1" })).toEqual({ kind: "game", gameId: "g1" });
    expect(gameBlockSource({ pgn: null, gameId: null })).toEqual({ error: "blockPgnEmpty" });
    expect(gameBlockSource({ pgn: undefined, gameId: "" })).toEqual({ error: "blockPgnEmpty" });
  });
});
