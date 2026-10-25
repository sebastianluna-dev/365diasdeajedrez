import "server-only";
import { cache } from "react";
import type { BotGroupCode } from "@/constants/platform/play-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { BOT_VIEW_SELECT, botView } from "./bots.mapper";
import type { BotGroupView, BotView } from "./bots.types";

// The bots, read: a catalog seeded from lib/chess/bots/roster.ts and never
// edited from the interface. Only the active ones, and only those of a listed
// group: the rivals of an adventure (`BOT_GROUP_LISTED`) are not in the gallery.

/** Every listed group with its active bots, in the order «Jugar» shows them. */
export const listBotGroups = cache(async (): Promise<BotGroupView[]> => {
  const groups = await getPlatformDb().botGroup.findMany({
    where: { isListed: true },
    orderBy: { order: "asc" },
    select: {
      code: true,
      label: true,
      bots: { where: { isActive: true }, orderBy: { order: "asc" }, select: BOT_VIEW_SELECT },
    },
  });
  return groups
    .map((group) => ({ code: group.code as BotGroupCode, label: group.label, bots: group.bots.map(botView) }))
    .filter((group) => group.bots.length > 0);
});

/** An active bot of the gallery by its slug: an adventure's rival is not found by it. */
export const getBotBySlug = cache(async (slug: string): Promise<BotView | null> => {
  const row = await getPlatformDb().bot.findFirst({
    where: { slug, isActive: true, group: { isListed: true } },
    select: BOT_VIEW_SELECT,
  });
  return row ? botView(row) : null;
});

/**
 * The bots of these ids, whatever their group or whether they are still
 * active, weakest first: a profile names the rivals of games already played,
 * an adventure's among them.
 */
export async function listBotsById(ids: readonly number[]): Promise<BotView[]> {
  if (ids.length === 0) return [];
  const rows = await getPlatformDb().bot.findMany({
    where: { id: { in: [...ids] } },
    orderBy: { elo: "asc" },
    select: BOT_VIEW_SELECT,
  });
  return rows.map(botView);
}
