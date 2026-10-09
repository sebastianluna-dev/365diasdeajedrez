import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { BOT_RING } from "@/constants/platform/play-codes.const";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import { botLevelSummaryOf, botScoreboardOf, currentViewer, recentPlayedGamesOf } from "@/services/play/play.service";
import { streakSummaryOf } from "@/services/study-goal/study-goal.service";
import { PROFILE_SELECT, profileHead, profileView } from "./profile.mapper";
import { profileVisibleWhere } from "./profile-rules";
import type { PlayerCard, ProfileHead, ProfileView } from "./profile.types";

// A person's profile, read: only what the viewer may see (`profileVisibleWhere`
// inside the `where`). «Visión general» makes six queries besides the session —
// the profile with its counts, the last games, the level, the scoreboard, the
// activity by day and this week's minutes —; «Partidas» draws only the head, so
// it reads two of them, the profile and the level. None of them writes.

/** The row of the profile at `slug`, if the viewer may see it: one query, shared by both pages' reads. */
const visibleProfileRow = cache(async (slug: string) => {
  const viewer = await currentViewer();
  const row = await getPlatformDb().user.findFirst({
    where: { AND: [{ slug }, profileVisibleWhere(viewer)] },
    select: PROFILE_SELECT,
  });
  return row ? { row, viewerId: viewer.userId } : null;
});

/** A profile's head only — who, the figures and the level —: what «Partidas» draws above its list. */
export const getProfileHeadOf = cache(async (slug: string): Promise<ProfileHead | null> => {
  const found = await visibleProfileRow(slug);
  if (!found) return null;
  return profileHead(found.row, { viewerId: found.viewerId, botLevel: await botLevelSummaryOf(found.row.id) });
});

/** The whole profile: «Visión general». */
export const getProfileOf = cache(async (slug: string): Promise<ProfileView | null> => {
  const found = await visibleProfileRow(slug);
  if (!found) return null;
  const [recentGames, botLevel, scoreboard, streak] = await Promise.all([
    recentPlayedGamesOf(found.row.id),
    botLevelSummaryOf(found.row.id),
    botScoreboardOf(found.row.id),
    streakSummaryOf(found.row.id),
  ]);
  return profileView(found.row, { viewerId: found.viewerId, botLevel, scoreboard, streak, recentGames });
});

/** The current person's user name, for `/perfil` to redirect to their own profile: the session carries it. */
export const getOwnSlug = cache(async (): Promise<string> => (await getCurrentUser()).slug);

/** The current person as a side of a scoreboard: their name and their portrait, from the session. */
export const getOwnPlayerCard = cache(async (): Promise<PlayerCard> => {
  const user = await getCurrentUser();
  return {
    name: user.displayName,
    avatar: {
      initials: initialsOf(user.displayName),
      tone: avatarToneOf(user.slug),
      ring: BOT_RING.NONE,
      country: user.country,
    },
  };
});
