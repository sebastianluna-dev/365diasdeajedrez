import "server-only";
import { cache } from "react";
import type { BotGroupCode } from "@/constants/platform/play-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { BOT_VIEW_SELECT, botView } from "./bots.mapper";
import type { BotGroupView, BotView } from "./bots.types";

// The bots, read: a catalog seeded from lib/chess/bots/roster.ts and never
// edited from the interface. Only the active ones.

/** Every group with its active bots, in the order «Jugar» shows them. */
export const listBotGroups = cache(async (): Promise<BotGroupView[]> => {
  const groups = await getPlatformDb().botGroup.findMany({
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

/** An active bot by its slug. */
export const getBotBySlug = cache(async (slug: string): Promise<BotView | null> => {
  const row = await getPlatformDb().bot.findFirst({ where: { slug, isActive: true }, select: BOT_VIEW_SELECT });
  return row ? botView(row) : null;
});
