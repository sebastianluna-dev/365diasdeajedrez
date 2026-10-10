import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BOT_GROUP, BOT_GROUP_LISTED } from "@/constants/platform/play-codes.const";
import { BOT_ROSTER, botSeedOf } from "@/lib/chess/bots/roster";
import { allBotSeeds, adventureBotSeeds } from "./adventure-bots";
import {
  ADVENTURE_ART,
  ADVENTURES,
  adventureBotSlug,
  adventureEncounterOfBot,
  adventureOf,
  COMING_ADVENTURES,
} from "./adventures";

// The adventures are content in code: these tests keep it whole (twelve
// contiguous encounters, two to a zone), keep the strengths it borrows in
// step with the calibrated gallery, and keep the art's paths in step with the
// story.

const CALIBRATION = JSON.parse(readFileSync(new URL("../chess/bots/calibration.json", import.meta.url), "utf8")) as {
  bots: Record<string, { label: number }>;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe.each(ADVENTURES)("the adventure «$title»", (adventure) => {
  const orders = adventure.encounters.map((encounter) => encounter.order);

  it("has twelve encounters with contiguous orders, listed in order", () => {
    expect(orders).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it("puts two encounters in each of its zones, zones in story order", () => {
    const zones = adventure.zones.map((zone) => zone.slug);
    expect(new Set(zones).size).toBe(zones.length);
    expect(adventure.encounters.map((encounter) => encounter.zone)).toEqual(zones.flatMap((zone) => [zone, zone]));
  });

  it("ends in one final encounter, the strongest, at the top of 1309", () => {
    const finals = adventure.encounters.filter((encounter) => encounter.isFinal);
    expect(finals.map((encounter) => encounter.order)).toEqual([12]);
    const strengths = adventure.encounters.map((encounter) => botSeedOf(encounter.strengthOf)!.elo);
    expect(Math.max(...strengths)).toBe(1309);
    expect(botSeedOf(finals[0]!.strengthOf)!.elo).toBe(1309);
  });

  it("borrows the strength of a calibrated bot of the gallery's characters", () => {
    for (const encounter of adventure.encounters) {
      const borrowed = botSeedOf(encounter.strengthOf);
      expect(borrowed, encounter.slug).toBeDefined();
      expect(borrowed!.group, encounter.slug).toBe(BOT_GROUP.CHARACTERS);
      expect(CALIBRATION.bots[encounter.strengthOf], `${encounter.slug}: no entry in calibration.json`).toBeDefined();
    }
  });

  it("gives each rival the label the calibration measured for the bot it borrows from", () => {
    for (const bot of adventureBotSeeds(adventure)) {
      const encounter = adventure.encounters[bot.order]!;
      expect(bot.elo, bot.slug).toBe(CALIBRATION.bots[encounter.strengthOf]!.label);
      expect(bot.elo, bot.slug).toBe(botSeedOf(encounter.strengthOf)!.elo);
    }
  });

  it("keeps its rivals in a hidden group, with slugs that go in a URL and collide with nothing", () => {
    expect(BOT_GROUP_LISTED[adventure.botGroup]).toBe(false);
    const bots = adventureBotSeeds(adventure);
    expect(bots).toHaveLength(12);
    const slugs = bots.map((bot) => bot.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG);
      expect(slug.startsWith(`${adventure.slug}-`)).toBe(true);
      expect(botSeedOf(slug), slug).toBeUndefined();
    }
    expect(bots.map((bot) => bot.order)).toEqual(bots.map((_, index) => index));
    for (const bot of bots) expect(bot.group).toBe(adventure.botGroup);
  });

  it("keeps every encounter inside a zone and its difficulty between 1 and 5", () => {
    const zones = new Set(adventure.zones.map((zone) => zone.slug));
    const encounterSlugs = adventure.encounters.map((encounter) => encounter.slug);
    expect(new Set(encounterSlugs).size).toBe(encounterSlugs.length);
    for (const encounter of adventure.encounters) {
      expect(zones.has(encounter.zone), encounter.slug).toBe(true);
      expect(encounter.difficulty, encounter.slug).toBeGreaterThanOrEqual(1);
      expect(encounter.difficulty, encounter.slug).toBeLessThanOrEqual(5);
      expect(adventure.difficultyLabels[encounter.difficulty], encounter.slug).toBeTruthy();
    }
  });

  describe("its art", () => {
    const art = ADVENTURE_ART[adventure.slug];

    it("exists", () => {
      expect(art).toBeDefined();
    });

    it("has a waypoint for every encounter, in order, on each path", () => {
      const paths = {
        desktop: art!.desktop.path,
        tablet: art!.tablet.path,
        mobile: art!.mobile.path,
        "tall miniature": art!.miniature.tall.path,
        "wide miniature": art!.miniature.wide.path,
      };
      for (const [name, path] of Object.entries(paths)) {
        expect(
          path.flatMap((stop) => (stop[2] === undefined ? [] : [stop[2]])),
          name,
        ).toEqual(orders);
      }
    });

    it("places a page for every zone, and a keepsake and a hint for every encounter", () => {
      for (const layout of [art!.desktop, art!.tablet, art!.mobile]) {
        expect(Object.keys(layout.pages).sort()).toEqual(adventure.zones.map((zone) => zone.slug).sort());
        expect(layout.zones.map((band) => band.zone).sort()).toEqual(adventure.zones.map((zone) => zone.slug).sort());
        expect(
          Object.keys(layout.keepsakes)
            .map(Number)
            .sort((a, b) => a - b),
        ).toEqual(orders);
        expect(
          Object.keys(layout.hints)
            .map(Number)
            .sort((a, b) => a - b),
        ).toEqual(orders);
        for (const key of Object.keys(layout.token.byOrder)) expect(orders).toContain(Number(key));
        for (const key of Object.keys(layout.tilt)) expect(orders).toContain(Number(key));
        expect(Object.keys(layout.tilt)).toHaveLength(12);
      }
    });
  });
});

describe("the adventures as a whole", () => {
  it("have slugs that go in a URL and are found by it", () => {
    const slugs = ADVENTURES.map((adventure) => adventure.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const adventure of ADVENTURES) {
      expect(adventure.slug).toMatch(SLUG);
      expect(adventureOf(adventure.slug)).toBe(adventure);
    }
    expect(adventureOf("nunca")).toBeUndefined();
  });

  it("each have a group of their own", () => {
    const groups = ADVENTURES.map((adventure) => adventure.botGroup);
    expect(new Set(groups).size).toBe(groups.length);
  });

  it("shelve six more notebooks that are not open yet, none of them an adventure to play", () => {
    expect(COMING_ADVENTURES.map((coming) => coming.slug)).toEqual([
      "veracruz",
      "chihuahua",
      "yucatan",
      "cdmx",
      "puebla",
      "tlaxcala",
    ]);
    for (const coming of COMING_ADVENTURES) expect(adventureOf(coming.slug)).toBeUndefined();
  });

  it("find the encounter a bot plays, and none for a gallery bot", () => {
    const adventure = adventureOf("cuaderno-del-viajero")!;
    const found = adventureEncounterOfBot(adventure.botGroup, adventureBotSlug(adventure.slug, "ines-cardenas"));
    expect(found?.encounter.order).toBe(6);
    expect(found?.adventure).toBe(adventure);
    expect(adventureEncounterOfBot(adventure.botGroup, "tere")).toBeNull();
    expect(adventureEncounterOfBot(BOT_GROUP.CHARACTERS, "tere")).toBeNull();
    expect(adventureEncounterOfBot(BOT_GROUP.CHARACTERS, adventureBotSlug(adventure.slug, "ines-cardenas"))).toBeNull();
  });

  it("add their bots after the roster's in allBotSeeds, with unique slugs", () => {
    const all = allBotSeeds();
    expect(all.slice(0, BOT_ROSTER.length)).toEqual([...BOT_ROSTER]);
    expect(all).toHaveLength(BOT_ROSTER.length + 12 * ADVENTURES.length);
    expect(new Set(all.map((bot) => bot.slug)).size).toBe(all.length);
  });
});
