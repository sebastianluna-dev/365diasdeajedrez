import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { BOT_RING } from "@/constants/platform/play-codes.const";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import { botLevelSummaryOf, botScoreboardOf, currentViewer, recentPlayedGamesOf } from "@/services/play/play.service";
import { streakSummaryOf } from "@/services/study-goal/study-goal.service";
import { PROFILE_SELECT, profileView } from "./profile.mapper";
import { profileVisibleWhere } from "./profile-rules";
import type { PlayerCard, ProfileView } from "./profile.types";

// A person's profile, read: only what the viewer may see (`profileVisibleWhere`
// inside the `where`). Six queries besides the session — the profile with its
// counts, the last games, the level, the scoreboard, the activity by day and
// this week's minutes — and none of them writes.

export const getProfileOf = cache(async (slug: string): Promise<ProfileView | null> => {
  const viewer = await currentViewer();
  const row = await getPlatformDb().user.findFirst({
    where: { AND: [{ slug }, profileVisibleWhere(viewer)] },
    select: PROFILE_SELECT,
  });
  if (!row) return null;

  const [recentGames, botLevel, scoreboard, streak] = await Promise.all([
    recentPlayedGamesOf(row.id),
    botLevelSummaryOf(row.id),
    botScoreboardOf(row.id),
    streakSummaryOf(row.id),
  ]);
  return profileView(row, { viewerId: viewer.userId, botLevel, scoreboard, streak, recentGames });
});

/** The current person's user name, for `/perfil` to redirect to their own profile. */
export const getOwnSlug = cache(async (): Promise<string> => {
  const user = await getCurrentUser();
  const row = await getPlatformDb().user.findUniqueOrThrow({ where: { id: user.id }, select: { slug: true } });
  return row.slug;
});

/** The current person as a side of a scoreboard: their name and their portrait. */
export const getOwnPlayerCard = cache(async (): Promise<PlayerCard> => {
  const user = await getCurrentUser();
  const row = await getPlatformDb().user.findUniqueOrThrow({
    where: { id: user.id },
    select: { slug: true, displayName: true, country: true },
  });
  return {
    name: row.displayName,
    avatar: {
      initials: initialsOf(row.displayName),
      tone: avatarToneOf(row.slug),
      ring: BOT_RING.NONE,
      country: row.country,
    },
  };
});
