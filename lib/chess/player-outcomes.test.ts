import { describe, expect, it } from "vitest";
import { playerOutcomes } from "./player-outcomes";

describe("playerOutcomes", () => {
  it("gives each colour its side of a decisive result", () => {
    expect(playerOutcomes("1-0")).toEqual({ white: "win", black: "loss" });
    expect(playerOutcomes("0-1")).toEqual({ white: "loss", black: "win" });
  });

  it("reads a draw as the PGN writes it and as the platform shows it", () => {
    expect(playerOutcomes("1/2-1/2")).toEqual({ white: "draw", black: "draw" });
    expect(playerOutcomes("½-½")).toEqual({ white: "draw", black: "draw" });
    expect(playerOutcomes(" 1/2-1/2 ")).toEqual({ white: "draw", black: "draw" });
  });

  it("says nothing for a game that has not ended or a token that is not a result", () => {
    expect(playerOutcomes("*")).toBeNull();
    expect(playerOutcomes("")).toBeNull();
    expect(playerOutcomes(undefined)).toBeNull();
    expect(playerOutcomes(null)).toBeNull();
    expect(playerOutcomes("2-0")).toBeNull();
  });
});
