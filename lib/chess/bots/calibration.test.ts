import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SAMPLED_REGIME_MAX_ELO } from "./bot-strength";
import { BOT_ROSTER } from "./roster";

// The calibration report (`npm run bots:calibrate`) against the roster.
//
// Only the bots the report holds are checked: it grows from a first three to
// all of them. Whether the report is RECENT — every bot measured, the engine
// unchanged — is not CI's business: `npm run bots:calibrate -- --check` says it.

interface Entry {
  label: number;
  measured: number;
  margin: number;
  games: number;
  measuredAt: string;
}

const REPORT = new URL("./calibration.json", import.meta.url);
const report = existsSync(REPORT)
  ? (JSON.parse(readFileSync(REPORT, "utf8")) as {
      engineBuild: string;
      anchors: number[];
      bots: Record<string, Entry>;
    })
  : null;

/** How far a label may sit from its measure: tighter where the engine weakens itself. */
const toleranceFor = (elo: number) => (elo > SAMPLED_REGIME_MAX_ELO ? 100 : 150);

describe.runIf(report)("the calibration report", () => {
  const entries = Object.entries(report?.bots ?? {});

  it("names the engine it measured and its anchors", () => {
    expect(report!.engineBuild).toMatch(/^sha256:[0-9a-f]{16}$/);
    expect(report!.anchors.length).toBeGreaterThan(0);
  });

  it("only holds bots of the roster, each with its figures", () => {
    for (const [slug, entry] of entries) {
      expect(
        BOT_ROSTER.some((bot) => bot.slug === slug),
        slug,
      ).toBe(true);
      expect(entry.games, slug).toBeGreaterThan(0);
      expect(entry.margin, slug).toBeGreaterThanOrEqual(0);
      expect(entry.measuredAt, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("finds every bot's label within the tolerance of its measure", () => {
    for (const [slug, entry] of entries) {
      const elo = BOT_ROSTER.find((bot) => bot.slug === slug)!.elo;
      expect(
        Math.abs(entry.measured - elo),
        `${slug}: label ${elo}, measured ${entry.measured} ± ${entry.margin}`,
      ).toBeLessThanOrEqual(toleranceFor(elo));
    }
  });

  it("keeps the ladder in order: a stronger label never measures clearly weaker", () => {
    const ladder = entries
      .map(([slug, entry]) => ({ slug, elo: BOT_ROSTER.find((bot) => bot.slug === slug)!.elo, ...entry }))
      .sort((a, b) => a.elo - b.elo);
    for (let index = 1; index < ladder.length; index++) {
      const [lower, higher] = [ladder[index - 1]!, ladder[index]!];
      expect(higher.measured + higher.margin, `${higher.slug} under ${lower.slug}`).toBeGreaterThanOrEqual(
        lower.measured - lower.margin,
      );
    }
  });
});
