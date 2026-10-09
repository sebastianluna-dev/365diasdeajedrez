import { describe, expect, it } from "vitest";
import {
  SAMPLED_REGIME_MAX_ELO,
  skillLevelFor,
  strengthFor,
  type EngineStrength,
  type SampledStrength,
} from "./bot-strength";

describe("skillLevelFor", () => {
  it("converts UCI_Elo as Stockfish 18 does (research/bot-strength.md §1)", () => {
    expect(skillLevelFor(1400)).toBeCloseTo(0.6, 1);
    expect(skillLevelFor(2000)).toBeCloseTo(4.2, 1);
    expect(skillLevelFor(2800)).toBeCloseTo(10.2, 1);
    expect(skillLevelFor(3190)).toBeCloseTo(18.4, 1);
  });

  it("stays within 0–19", () => {
    expect(skillLevelFor(1320)).toBe(0);
    expect(skillLevelFor(4000)).toBe(19);
  });
});

describe("strengthFor", () => {
  const elos = Array.from({ length: 2401 }, (_, index) => 400 + index);
  const sampled = elos.filter((elo) => elo <= SAMPLED_REGIME_MAX_ELO).map((elo) => strengthFor(elo) as SampledStrength);
  const engine = elos.filter((elo) => elo > SAMPLED_REGIME_MAX_ELO).map((elo) => strengthFor(elo) as EngineStrength);

  it("splits at the engine's floor: 1319 is sampled, 1320 the engine's own", () => {
    expect(strengthFor(1319).regime).toBe("sampled");
    expect(strengthFor(1320).regime).toBe("engine");
    expect(sampled.every((strength) => strength.regime === "sampled")).toBe(true);
    expect(engine.every((strength) => strength.regime === "engine")).toBe(true);
  });

  it("follows the table at its rows", () => {
    expect(strengthFor(400)).toMatchObject({
      search: { nodes: 400 },
      multiPv: 8,
      temperature: 300,
      blunderRate: 0.3,
      blunder: "legal",
    });
    expect(strengthFor(1000)).toMatchObject({
      search: { nodes: 1_500 },
      multiPv: 8,
      temperature: 150,
      blunderRate: 0.13,
      blunder: "legal",
    });
    expect(strengthFor(1400)).toMatchObject({ uciElo: 1400, search: { depth: 1 } });
    expect(strengthFor(1600)).toMatchObject({ search: { depth: 3 } });
    expect(strengthFor(2800)).toMatchObject({
      uciElo: 2800,
      search: { depth: 11 },
      browserNodeCap: 400_000,
      delayMs: [1_500, 6_000],
    });
  });

  it("asks the engine at full strength below the floor, and to limit itself above it", () => {
    expect(strengthFor(783).engine).toEqual({ hash: 16, skillLevel: 20, limitStrength: false, multiPv: 8 });
    expect(strengthFor(1447).engine).toEqual({ hash: 16, limitStrength: true, uciElo: 1447, multiPv: 1 });
  });

  it("never weakens as the Elo grows, inside each regime", () => {
    for (let index = 1; index < sampled.length; index++) {
      const [before, after] = [sampled[index - 1]!, sampled[index]!];
      expect(after.temperature).toBeLessThanOrEqual(before.temperature);
      expect(after.blunderRate).toBeLessThanOrEqual(before.blunderRate);
      expect(after.search.nodes).toBeGreaterThanOrEqual(before.search.nodes);
    }
    for (let index = 1; index < engine.length; index++) {
      const [before, after] = [engine[index - 1]!, engine[index]!];
      expect(after.uciElo).toBeGreaterThanOrEqual(before.uciElo);
      expect(after.search.depth).toBeGreaterThanOrEqual(before.search.depth);
    }
  });

  it("searches by nodes or depth, never by time", () => {
    for (const strength of [...sampled, ...engine]) expect("movetime" in strength.search).toBe(false);
  });

  it("keeps the extrapolation past 1200 within its limits", () => {
    const top = strengthFor(1319) as SampledStrength;
    expect(top.search.nodes).toBeLessThanOrEqual(20_000);
    expect(top.temperature).toBeGreaterThanOrEqual(30);
    expect(top.blunderRate).toBeGreaterThanOrEqual(0.01);
    expect(top.delayMs[1]).toBeLessThanOrEqual(4_000);
  });
});
