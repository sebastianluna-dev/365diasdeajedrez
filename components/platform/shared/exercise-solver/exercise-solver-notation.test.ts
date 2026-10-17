import { describe, expect, it } from "vitest";
import { readSolution, type Solution } from "@/lib/chess/exercise-solver";
import { reduceSession, startSession, type SolverAction, type SolverSession } from "./exercise-solver-session";
import { linePaths, notationRows } from "./exercise-solver-notation";

const SMOTHERED = `[SetUp "1"]
[FEN "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 26"]

26. Qg8+ Rxg8 27. Nf7# *`;
const BLACK_MATE = `[SetUp "1"]
[FEN "3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 24"]

24... Rd1# *`;

function solutionOf(pgn: string): Solution {
  const solution = readSolution({ solutionPgn: pgn, kind: "MATE_IN", mateIn: null, hints: [] });
  if (!solution) throw new Error("unreadable");
  return solution;
}

const run = (session: SolverSession, ...actions: SolverAction[]) => actions.reduce(reduceSession, session);

describe("the solve panel's notation", () => {
  it("numbers the line from the start's move and marks the player's moves", () => {
    const solution = solutionOf(SMOTHERED);
    expect(notationRows(solution, "0.0.0", [])).toEqual([
      {
        kind: "moves",
        number: 26,
        white: { path: "0", san: "Dg8+", byPlayer: true },
        black: { path: "0.0", san: "Txg8", byPlayer: false },
      },
      { kind: "moves", number: 27, white: { path: "0.0.0", san: "Cf7#", byPlayer: true }, black: null },
    ]);
  });

  it("writes each wrong try under the row of the move it stood for, the first marked as the student's", () => {
    const solution = solutionOf(SMOTHERED);
    const session = run(
      startSession(solution, "solve"),
      { type: "move", san: "Nf7+" },
      { type: "flashOver" },
      { type: "move", san: "Qf7" },
      { type: "flashOver" },
      { type: "move", san: "Qg8+" },
      { type: "replyShown" },
      { type: "move", san: "Nf7#" },
    );
    expect(session.misses).toEqual([
      { path: "", san: "Nf7+" },
      { path: "", san: "Qf7" },
    ]);
    expect(notationRows(solution, session.solve.path, session.misses).map((row) => row.kind)).toEqual([
      "moves",
      "miss",
      "miss",
      "moves",
    ]);
    expect(notationRows(solution, session.solve.path, session.misses)[1]).toEqual({
      kind: "miss",
      label: "26. Cf7+",
      first: true,
    });
  });

  it("puts a try at a move not yet found at the foot, and starts Black's line with «…»", () => {
    const solution = solutionOf(BLACK_MATE);
    const rows = notationRows(solution, "", [{ path: "", san: "Rd2" }]);
    expect(rows).toEqual([{ kind: "miss", label: "24… Td2", first: true }]);
    expect(notationRows(solution, "0", [])).toEqual([
      { kind: "moves", number: 24, white: null, black: { path: "0", san: "Td1#", byPlayer: true } },
    ]);
  });

  it("lists the paths of a line from its first move", () => {
    expect(linePaths("")).toEqual([]);
    expect(linePaths("0.1.0")).toEqual(["0", "0.1", "0.1.0"]);
  });
});
