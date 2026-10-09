import { BOT_RING, isBotRingCode, type BotGroupCode } from "@/constants/platform/play-codes.const";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { BotView } from "./bots.types";

// Rows of `Bot` → what «Jugar» shows. Pure: the queries live in bots.service.ts.

export const BOT_VIEW_SELECT = {
  id: true,
  slug: true,
  name: true,
  elo: true,
  bio: true,
  openings: true,
  fideElo: true,
  fideTitle: true,
  country: true,
  ratingAsOf: true,
  group: { select: { code: true, ring: true } },
} satisfies Prisma.BotSelect;

export type BotRow = Prisma.BotGetPayload<{ select: typeof BOT_VIEW_SELECT }>;

/** The favourite openings, as a list of strings whatever the JSON holds. */
function openingsOf(value: Prisma.JsonValue | null): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function botView(row: BotRow): BotView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    elo: row.elo,
    bio: row.bio,
    openings: openingsOf(row.openings),
    fideElo: row.fideElo,
    fideTitle: row.fideTitle,
    country: row.country,
    ratingAsOfLabel: row.ratingAsOf ? formatSpanishDate(row.ratingAsOf) : null,
    groupCode: row.group.code as BotGroupCode,
    avatar: {
      initials: initialsOf(row.name),
      tone: avatarToneOf(row.slug),
      ring: isBotRingCode(row.group.ring) ? row.group.ring : BOT_RING.NONE,
      country: row.country,
    },
  };
}
