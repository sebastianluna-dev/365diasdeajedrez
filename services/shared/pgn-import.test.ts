import { describe, expect, it } from "vitest";

import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { parseImportedGames, readImportedGames } from "@/services/shared/pgn-import";

const OPERA = `[Event "Partida de la Ópera"]
[Site "París"]
[Date "1858.11.02"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duque de Brunswick"]
[Result "1-0"]
[WhiteElo "2500"]
[BlackTeam "FRA"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 1-0`;

describe("parseImportedGames", () => {
  it("pasa las cabeceras a columnas", () => {
    const game = parseImportedGames(OPERA)[0]!;
    expect(game.white).toBe("Paul Morphy");
    expect(game.black).toBe("Duque de Brunswick");
    expect(game.resultCode).toBe(GAME_RESULT.WHITE_WINS);
    expect(game.event).toBe("Partida de la Ópera");
    expect(game.eco).toBe("C41");
    expect(game.whiteElo).toBe(2500);
    expect(game.playedAt?.toISOString().slice(0, 10)).toBe("1858-11-02");
  });

  it("trata «?» como dato ausente, que es lo que significa en un PGN", () => {
    const game = parseImportedGames(OPERA)[0]!;
    expect(game.round).toBeNull();
  });

  it("la federación viene de WhiteTeam/BlackTeam, que es donde la pone Lichess", () => {
    const game = parseImportedGames(OPERA)[0]!;
    expect(game.blackCountry).toBe("FRA");
    expect(game.whiteCountry).toBeNull();
  });

  it("un Elo que no es un número no se guarda", () => {
    const game = parseImportedGames(OPERA.replace('[WhiteElo "2500"]', '[WhiteElo "sin dato"]'))[0]!;
    expect(game.whiteElo).toBeNull();
  });

  it("una fecha incompleta o imposible no se guarda", () => {
    for (const date of ["????.??.??", "2024.??.??", "2024.02.31"]) {
      const game = parseImportedGames(OPERA.replace('[Date "1858.11.02"]', `[Date "${date}"]`))[0]!;
      expect(game.playedAt).toBeNull();
    }
  });

  it("sin resultado reconocible, la partida queda en curso", () => {
    // The result has to be removed from the end of the movetext too: chessops fills
    // the `Result` header from there, so changing only the header does not erase it.
    const sinResultado = OPERA.replace('[Result "1-0"]', '[Result "*"]').replace(/1-0$/, "*");
    expect(parseImportedGames(sinResultado)[0]?.resultCode).toBe(GAME_RESULT.ONGOING);
  });

  it("lee varias partidas de un mismo texto", () => {
    expect(parseImportedGames(`${OPERA}\n\n${OPERA}`)).toHaveLength(2);
  });

  it("descarta lo que no tiene ni jugadas ni posición de partida", () => {
    expect(parseImportedGames('[Event "Vacía"]\n[White "A"]\n[Black "B"]\n\n*')).toEqual([]);
  });

  it("conserva una partida que empieza en un FEN aunque no tenga jugadas", () => {
    const fen = "8/8/8/8/8/5k2/6q1/7K b - - 0 1";
    const games = parseImportedGames(`[FEN "${fen}"]\n[White "A"]\n[Black "B"]\n\n*`);
    expect(games).toHaveLength(1);
    expect(games[0]?.initialFen).toBe(fen);
  });

  it("con basura devuelve lista vacía en vez de estallar", () => {
    expect(parseImportedGames("esto no es un pgn")).toEqual([]);
    expect(parseImportedGames("")).toEqual([]);
  });

  it("el PGN que devuelve conserva las jugadas", () => {
    const game = parseImportedGames(OPERA)[0]!;
    expect(game.pgn).toContain("1. e4 e5");
    expect(game.pgn).toContain("Paul Morphy");
  });
});

describe("readImportedGames", () => {
  const VACIA = '[Event "Vacía"]\n[White "A"]\n[Black "B"]\n\n*';
  const partidas = (count: number) => Array.from({ length: count }, () => OPERA).join("\n\n");

  it("sin nada que dejar fuera, los dos contadores son cero", () => {
    const reading = readImportedGames(partidas(3));
    expect(reading.games).toHaveLength(3);
    expect(reading).toMatchObject({ skippedEmpty: 0, overLimit: 0 });
  });

  it("cuenta las entradas sin jugadas que descarta", () => {
    const reading = readImportedGames(`${OPERA}\n\n${VACIA}\n\n${OPERA}`);
    expect(reading.games).toHaveLength(2);
    expect(reading).toMatchObject({ skippedEmpty: 1, overLimit: 0 });
  });

  it("corta en el límite y dice cuántas quedaron fuera", () => {
    const reading = readImportedGames(partidas(PGN_MAX_GAMES + 7));
    expect(reading.games).toHaveLength(PGN_MAX_GAMES);
    expect(reading).toMatchObject({ skippedEmpty: 0, overLimit: 7 });
  });

  it("una entrada vacía no le quita el sitio a una partida", () => {
    // The empty one comes first: cut before being discarded, it would leave
    // the import one game short of the limit.
    const reading = readImportedGames(`${VACIA}\n\n${partidas(PGN_MAX_GAMES)}`);
    expect(reading.games).toHaveLength(PGN_MAX_GAMES);
    expect(reading).toMatchObject({ skippedEmpty: 1, overLimit: 0 });
  });

  it("con basura no hay partidas ni estalla", () => {
    expect(readImportedGames("esto no es un pgn").games).toEqual([]);
    expect(readImportedGames("")).toEqual({ games: [], skippedEmpty: 0, overLimit: 0 });
  });
});
