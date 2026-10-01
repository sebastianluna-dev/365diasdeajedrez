import { describe, expect, it } from "vitest";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { parseImportedGames } from "./pgn-import";
import { GAME_FIELDS_SCHEMA, resultCodeOf, sameMoves, writeGameRecord } from "./game-record";

const GAME = `[Event "?"]
[White "Robert James Fischer"]
[Black "James Sherwin"]
[Result "1-0"]

1. e4 c5 2. Nf3 e6 { Mi jugada favorita. } (2... d6 3. d4) 3. d3 1-0`;

describe("sameMoves", () => {
  it("holds when only a comment changes", () => {
    expect(sameMoves(GAME, GAME.replace("Mi jugada favorita.", "Corregido."))).toBe(true);
  });

  it("holds when a comment, a glyph or an arrow is added", () => {
    expect(sameMoves(GAME, GAME.replace("1. e4 c5", "1. e4! { [%cal Ge2e4] Al centro. } c5"))).toBe(true);
  });

  it("holds when only the headers change", () => {
    expect(sameMoves(GAME, GAME.replace('[Event "?"]', '[Event "Campeonato de Estados Unidos"]'))).toBe(true);
  });

  it("fails when a move of the main line changes", () => {
    expect(sameMoves(GAME, GAME.replace("3. d3", "3. d4"))).toBe(false);
  });

  it("fails when a move is added at the end", () => {
    expect(sameMoves(GAME, GAME.replace("3. d3 1-0", "3. d3 Nc6 1-0"))).toBe(false);
  });

  it("fails when a variation is added, removed or changed", () => {
    expect(sameMoves(GAME, GAME.replace(" (2... d6 3. d4)", ""))).toBe(false);
    expect(sameMoves(GAME, GAME.replace("(2... d6 3. d4)", "(2... d6 3. c3)"))).toBe(false);
    expect(sameMoves(GAME, GAME.replace("3. d3 1-0", "3. d3 (3. d4) 1-0"))).toBe(false);
  });

  it("fails when the game starts from another position", () => {
    const fromPosition = `[FEN "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"]\n[SetUp "1"]\n\n2. Nf3 e6 *`;
    expect(sameMoves(fromPosition, "2. Nf3 e6 *")).toBe(false);
  });

  it("never calls two texts the same when one of them is not a game", () => {
    expect(sameMoves("", "")).toBe(false);
  });
});

describe("writeGameRecord", () => {
  const fields = (values: Record<string, string>) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(values)) form.set(key, value);
    return GAME_FIELDS_SCHEMA.parse(Object.fromEntries(form));
  };

  it("writes the record into the columns and into the PGN's headers, which say the same", () => {
    const { columns } = writeGameRecord(
      fields({
        white: "Robert Byrne",
        black: "Robert James Fischer",
        event: "Campeonato de Estados Unidos",
        eco: "E60",
      }),
      GAME,
      "0-1",
    );
    const [read] = parseImportedGames(columns.pgn);

    expect(columns).toMatchObject({ white: "Robert Byrne", black: "Robert James Fischer", eco: "E60" });
    expect(read).toMatchObject({
      white: "Robert Byrne",
      black: "Robert James Fischer",
      event: "Campeonato de Estados Unidos",
      eco: "E60",
      resultCode: GAME_RESULT.BLACK_WINS,
    });
  });

  it("does not touch the moves, the variations or the comments", () => {
    const { columns } = writeGameRecord(fields({ white: "Otro", black: "Rival" }), GAME, "1-0");

    expect(sameMoves(GAME, columns.pgn)).toBe(true);
    expect(columns.pgn).toContain("Mi jugada favorita.");
  });

  it("names the player nobody named, instead of leaving the column empty", () => {
    const { columns } = writeGameRecord(fields({}), GAME, "*");
    expect(columns).toMatchObject({ white: "Desconocido", black: "Desconocido" });
  });

  it("discards an Elo that is a typo and a date that does not exist", () => {
    const { columns } = writeGameRecord(fields({ whiteElo: "27", playedAt: "1963-02-31" }), GAME, "*");
    expect(columns.whiteElo).toBeNull();
    expect(columns.playedAt).toBeNull();
  });
});

describe("resultCodeOf", () => {
  it("answers «in play» for a result that is not in the catalog", () => {
    expect(resultCodeOf({ resultCode: "WHITE_WINS" })).toBe(GAME_RESULT.WHITE_WINS);
    expect(resultCodeOf({ resultCode: "GANA_EL_MEJOR" })).toBe(GAME_RESULT.ONGOING);
    expect(resultCodeOf({})).toBe(GAME_RESULT.ONGOING);
  });
});
