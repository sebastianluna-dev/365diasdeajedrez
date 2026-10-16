import { Chess } from "chessops/chess";
import { INITIAL_BOARD_FEN, INITIAL_FEN, parseFen } from "chessops/fen";
import { describe, expect, it } from "vitest";
import {
  availableCastling,
  enPassantOptions,
  positionPlausibility,
  setupFen,
  validateSetup,
  type SetupInput,
} from "./position-setup";

const NONE = { K: false, Q: false, k: false, q: false };
const ALL = { K: true, Q: true, k: true, q: true };

function input(placement: string, overrides: Partial<SetupInput> = {}): SetupInput {
  return { placement, turn: "white", castling: NONE, epSquare: null, ...overrides };
}

function positionOf(fen: string): Chess {
  return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/** After 1. e4: the board and the square the pawn passed over. */
const AFTER_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR";
/** After 1. e4 Nf6 2. e5 d5: White may take on d6 en passant. */
const AFTER_D5 = "rnbqkb1r/ppp1pppp/5n2/3pP3/8/8/PPPP1PPP/RNBQKBNR";

describe("setupFen", () => {
  it("escribe el FEN de la posición con su turno, enroques y al paso", () => {
    expect(setupFen(input(INITIAL_BOARD_FEN, { castling: ALL }))).toBe(INITIAL_FEN);
    expect(setupFen(input("4k3/8/8/8/8/8/8/4K3", { turn: "black" }))).toBe("4k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(setupFen(input(AFTER_D5, { castling: { K: true, Q: false, k: false, q: true }, epSquare: "d6" }))).toBe(
      `${AFTER_D5} w Kq d6 0 1`,
    );
  });
});

describe("validateSetup", () => {
  it("devuelve la posición inicial tal cual", () => {
    expect(validateSetup(input(INITIAL_BOARD_FEN, { castling: ALL }))).toEqual({ ok: true, fen: INITIAL_FEN });
  });

  it("da cada problema de chessops con su nombre", () => {
    expect(validateSetup(input("8/8/8/8/8/8/8/8"))).toEqual({ ok: false, problem: "empty" });
    expect(validateSetup(input("4k3/8/8/8/8/8/8/8"))).toEqual({ ok: false, problem: "kings" });
    expect(validateSetup(input("4k3/8/8/8/8/8/8/3KK3"))).toEqual({ ok: false, problem: "kings" });
    expect(validateSetup(input("P3k3/8/8/8/8/8/8/4K3"))).toEqual({ ok: false, problem: "pawnsOnBackrank" });
    // White to move, and Black's king is in check from the rook.
    expect(validateSetup(input("4k3/8/8/8/8/8/8/4RK2"))).toEqual({
      ok: false,
      problem: "oppositeCheck",
    });
  });

  it("rechaza un enroque sin el rey y la torre en su casilla", () => {
    expect(validateSetup(input("4k3/8/8/8/8/8/8/4K3", { castling: { ...NONE, K: true } }))).toEqual({
      ok: false,
      problem: "castling",
    });
    expect(validateSetup(input("r3k3/8/8/8/8/8/8/4K2R", { castling: { ...NONE, K: true, q: true } }))).toMatchObject({
      ok: true,
      fen: "r3k3/8/8/8/8/8/8/4K2R w Kq - 0 1",
    });
  });

  it("acepta el al paso tras e2e4 y rechaza sus gemelos imposibles", () => {
    // After 1. e4 no black pawn can take on e3: the square means nothing and is refused.
    expect(validateSetup(input(AFTER_E4, { turn: "black", castling: ALL, epSquare: "e3" }))).toEqual({
      ok: false,
      problem: "enPassant",
    });
    // With a black pawn on d4 it can.
    const withTaker = "rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR";
    expect(validateSetup(input(withTaker, { turn: "black", castling: ALL, epSquare: "e3" }))).toEqual({
      ok: true,
      fen: `${withTaker} b KQkq e3 0 1`,
    });
    // The wrong side to move, the wrong rank, a square nobody passed over.
    expect(validateSetup(input(withTaker, { turn: "white", epSquare: "e3" }))).toMatchObject({ problem: "enPassant" });
    expect(validateSetup(input(withTaker, { turn: "black", epSquare: "e4" }))).toMatchObject({ problem: "enPassant" });
    expect(validateSetup(input(withTaker, { turn: "black", epSquare: "c3" }))).toMatchObject({ problem: "enPassant" });
  });

  it("rechaza un jaque imposible y más material del que cabe", () => {
    expect(validateSetup(input("4k3/8/8/8/8/3n1n2/8/4K3"))).toEqual({ ok: false, problem: "impossibleCheck" });
    // Nine white pawns.
    expect(validateSetup(input("4k3/8/8/P7/8/8/PPPPPPPP/4K3"))).toEqual({ ok: false, problem: "impossibleMaterial" });
    // Three white queens with seven pawns: two promoted pieces, one missing pawn.
    expect(validateSetup(input("4k3/8/8/8/8/QQQ5/PPPPPPP1/4K3"))).toEqual({ ok: false, problem: "impossibleMaterial" });
    // Two queens with seven pawns is possible.
    expect(validateSetup(input("4k3/8/8/8/8/QQ6/PPPPPPP1/4K3")).ok).toBe(true);
  });
});

describe("availableCastling", () => {
  it("ofrece cada enroque sólo con el rey y esa torre en su casilla", () => {
    const rooks = ["a1", "h1", "a8", "h8"] as const;
    // Every combination of the four rooks, both kings at home.
    const collapse = (rank: string) => rank.replace(/1+/g, (run) => String(run.length));
    for (let mask = 0; mask < 16; mask++) {
      const present = rooks.filter((_, index) => mask & (1 << index));
      const has = (square: (typeof rooks)[number]) => present.includes(square);
      const eighth = collapse(`${has("a8") ? "r" : "1"}111k11${has("h8") ? "r" : "1"}`);
      const first = collapse(`${has("a1") ? "R" : "1"}111K11${has("h1") ? "R" : "1"}`);
      const placement = `${eighth}/8/8/8/8/8/8/${first}`;

      expect(availableCastling(placement)).toEqual({
        Q: present.includes("a1"),
        K: present.includes("h1"),
        q: present.includes("a8"),
        k: present.includes("h8"),
      });
    }
  });

  it("no ofrece nada con el rey fuera de su casilla, o con una torre del otro color", () => {
    expect(availableCastling("r3k2r/8/8/8/8/8/8/R2K3R")).toEqual({ K: false, Q: false, k: true, q: true });
    expect(availableCastling("4k3/8/8/8/8/8/8/r3K2R")).toEqual({ K: true, Q: false, k: false, q: false });
  });
});

describe("enPassantOptions", () => {
  it("da la casilla que un doble paso acaba de dejar, si hay un peón para tomar", () => {
    expect(enPassantOptions(AFTER_D5, "white")).toEqual(["d6"]);
    expect(enPassantOptions(AFTER_D5, "black")).toEqual([]);
    expect(enPassantOptions(AFTER_E4, "black")).toEqual([]);
    expect(enPassantOptions("4k3/8/8/8/2pPp3/8/8/4K3", "black")).toEqual(["d3"]);
  });
});

describe("positionPlausibility", () => {
  it("no tiene nada que decir de la posición inicial", () => {
    expect(positionPlausibility(Chess.default())).toBeNull();
    expect(positionPlausibility(positionOf("4k3/8/8/8/8/3n1n2/8/4K3 w - - 0 1"))).toBe("impossibleCheck");
  });
});
