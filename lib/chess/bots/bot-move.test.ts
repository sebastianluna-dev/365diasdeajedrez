import { describe, expect, it } from "vitest";
import type { Candidate } from "@/lib/chess/engine-protocol";
import { strengthFor } from "./bot-strength";
import { botSearchOf, pickBotMove } from "./bot-move";
import { mulberry32 } from "./rng";

const candidate = (uci: string, cp: number): Candidate => ({
  multipv: 1,
  depth: 10,
  uci,
  cp,
  mateIn: null,
  bound: null,
});

describe("botSearchOf", () => {
  it("searches a weak bot by its nodes, anywhere", () => {
    expect(botSearchOf(strengthFor(412), true)).toEqual(strengthFor(412).search);
  });

  it("caps the nodes of the strongest bots in the browser only", () => {
    const carlsen = strengthFor(2798);
    if (carlsen.regime !== "engine") throw new Error("regime");
    expect(botSearchOf(carlsen, true)).toEqual({ depth: carlsen.search.depth, nodes: 400_000 });
    expect(botSearchOf(carlsen, false)).toEqual(carlsen.search);
    expect(botSearchOf(strengthFor(1600), true)).toEqual(strengthFor(1600).search);
  });
});

describe("pickBotMove", () => {
  it("plays the engine's own move for a bot of the engine regime", () => {
    const reply = { bestMove: "e2e4", candidates: [candidate("d2d4", 30)] };
    expect(pickBotMove(strengthFor(1868), reply, ["e2e4", "d2d4"], mulberry32(1))).toBe("e2e4");
  });

  it("picks among the candidates for a weak bot, reproducibly from its seed", () => {
    const reply = {
      bestMove: "e2e4",
      candidates: [candidate("e2e4", 40), candidate("d2d4", 35), candidate("g1f3", 30)],
    };
    const legal = ["e2e4", "d2d4", "g1f3", "a2a3"];
    const first = pickBotMove(strengthFor(783), reply, legal, mulberry32(7));
    expect(legal).toContain(first);
    expect(pickBotMove(strengthFor(783), reply, legal, mulberry32(7))).toBe(first);
  });
});
