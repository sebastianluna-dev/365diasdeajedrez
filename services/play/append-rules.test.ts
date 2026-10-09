import { describe, expect, it } from "vitest";
import { checkAppend } from "./append-rules";

const open = (sans: string[]) => ({ initialFen: null, sans, plyCount: sans.length, finishedAt: null });

describe("checkAppend", () => {
  it("accepts a legal move at the ply the caller saw, in its canonical form", () => {
    expect(checkAppend(open(["e4"]), { expectedPly: 1, san: "e5" })).toEqual({
      kind: "ok",
      sans: ["e4", "e5"],
      san: "e5",
    });
    expect(
      checkAppend(
        { initialFen: "8/4P3/8/8/8/8/k7/4K3 w - - 0 1", sans: [], plyCount: 0, finishedAt: null },
        { expectedPly: 0, san: "e8=Q+" },
      ),
    ).toMatchObject({ kind: "ok", san: "e8=Q" });
  });

  it("refuses an illegal move", () => {
    expect(checkAppend(open([]), { expectedPly: 0, san: "e5" })).toEqual({ kind: "invalid" });
    expect(checkAppend(open([]), { expectedPly: 0, san: "Zz9" })).toEqual({ kind: "invalid" });
  });

  it("is stale when another tab moved first", () => {
    expect(checkAppend(open(["e4", "e5"]), { expectedPly: 0, san: "d4" })).toEqual({ kind: "stale" });
  });

  it("answers a retry of the stored move as written", () => {
    expect(checkAppend(open(["e4", "e5"]), { expectedPly: 1, san: "e5" })).toEqual({ kind: "retry" });
    // A different move at that ply is not a retry: the caller is behind.
    expect(checkAppend(open(["e4", "e5"]), { expectedPly: 1, san: "c5" })).toEqual({ kind: "stale" });
  });

  it("refuses any move in a finished game, but still recognises the retry of the one that finished it", () => {
    const finished = { initialFen: null, sans: ["f3", "e5", "g4", "Qh4#"], plyCount: 4, finishedAt: new Date() };
    expect(checkAppend(finished, { expectedPly: 4, san: "a3" })).toEqual({ kind: "finished" });
    expect(checkAppend(finished, { expectedPly: 3, san: "Qh4#" })).toEqual({ kind: "retry" });
  });
});
