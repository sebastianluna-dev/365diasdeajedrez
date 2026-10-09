import { describe, expect, it } from "vitest";
import { BOT_GROUP, BOT_GROUP_RING, isBotRingCode } from "@/constants/platform/play-codes.const";
import { federationFlag, FIDE_TITLES } from "@/lib/chess/federations";
import { BOT_ROSTER, botSeedOf } from "./roster";

describe("BOT_ROSTER", () => {
  it("has 45 bots with unique slugs that can go in a URL", () => {
    expect(BOT_ROSTER).toHaveLength(45);
    const slugs = BOT_ROSTER.map((bot) => bot.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("keeps every label between 400 and 2800 and never round", () => {
    for (const bot of BOT_ROSTER) {
      expect(bot.elo, bot.slug).toBeGreaterThanOrEqual(400);
      expect(bot.elo, bot.slug).toBeLessThanOrEqual(2800);
      expect(bot.elo % 100, bot.slug).not.toBe(0);
    }
  });

  it("makes Carlsen the only strongest one", () => {
    const top = Math.max(...BOT_ROSTER.map((bot) => bot.elo));
    expect(BOT_ROSTER.filter((bot) => bot.elo === top).map((bot) => bot.slug)).toEqual(["carlsen"]);
  });

  it("covers every group, each with its ring, in order", () => {
    expect(new Set(BOT_ROSTER.map((bot) => bot.group))).toEqual(new Set(Object.values(BOT_GROUP)));
    for (const ring of Object.values(BOT_GROUP_RING)) expect(isBotRingCode(ring)).toBe(true);
    for (const code of Object.values(BOT_GROUP)) {
      const orders = BOT_ROSTER.filter((bot) => bot.group === code).map((bot) => bot.order);
      expect(orders).toEqual(orders.map((_, index) => index));
    }
  });

  it("gives a flag only for a federation the platform knows, and titles only FIDE's", () => {
    for (const bot of BOT_ROSTER) {
      if (bot.country !== null) expect(federationFlag(bot.country), bot.slug).not.toBeNull();
      if (bot.fideTitle !== null) expect(FIDE_TITLES as readonly string[]).toContain(bot.fideTitle);
    }
  });

  it("dates every FIDE rating it states", () => {
    for (const bot of BOT_ROSTER) {
      if (bot.fideElo !== null) expect(bot.ratingAsOf, bot.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("finds a bot by its slug", () => {
    expect(botSeedOf("don-chuy")?.elo).toBe(783);
    expect(botSeedOf("nadie")).toBeUndefined();
  });
});
