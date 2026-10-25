import "server-only";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { BOT_VIEW_SELECT, botView } from "./bots.mapper";
import type { BotView } from "./bots.types";

// The bots, read: a catalog seeded from lib/chess/bots/roster.ts and never
// edited from the interface. Since 2026-10-25 there is no gallery to list them
// in — every game against a bot is an encounter of an adventure, opened by
// `startAdventureEncounter` —, so what is left is naming the rivals of games
// already played.

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
