import { BOT_RING } from "@/constants/platform/play-codes.const";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { BotLevelSummary, BotScore, PlayedGameCard } from "@/services/play/play.types";
import type { StreakSummary } from "@/services/study-goal/study-goal.types";
import type { ProfileView } from "./profile.types";

// A `User` row and what its profile gathers → `ProfileView`. Pure.

export const PROFILE_SELECT = {
  id: true,
  slug: true,
  displayName: true,
  statusLine: true,
  country: true,
  createdAt: true,
  teacher: { select: { isActive: true } },
  _count: {
    select: { courseProgresses: true, gameDatabases: true, playedGamesAsWhite: true, playedGamesAsBlack: true },
  },
} satisfies Prisma.UserSelect;

export type ProfileRow = Prisma.UserGetPayload<{ select: typeof PROFILE_SELECT }>;

export function profileView(
  row: ProfileRow,
  parts: {
    viewerId: string;
    botLevel: BotLevelSummary;
    scoreboard: BotScore[];
    streak: StreakSummary;
    recentGames: PlayedGameCard[];
  },
): ProfileView {
  const record = parts.scoreboard.reduce(
    (total, score) => ({
      wins: total.wins + score.wins,
      losses: total.losses + score.losses,
      draws: total.draws + score.draws,
      open: total.open + score.open,
    }),
    { wins: 0, losses: 0, draws: 0, open: 0 },
  );
  return {
    userId: row.id,
    slug: row.slug,
    displayName: row.displayName,
    avatar: {
      initials: initialsOf(row.displayName),
      tone: avatarToneOf(row.slug),
      ring: BOT_RING.NONE,
      country: row.country,
    },
    statusLine: row.statusLine,
    country: row.country,
    badge: row.teacher?.isActive ? "Profesor" : "Alumno",
    joinedLabel: formatSpanishDate(row.createdAt),
    isOwn: row.id === parts.viewerId,
    counts: {
      courses: row._count.courseProgresses,
      studies: row._count.gameDatabases,
      games: row._count.playedGamesAsWhite + row._count.playedGamesAsBlack,
    },
    botLevel: parts.botLevel,
    record,
    streak: parts.streak,
    recentGames: parts.recentGames,
    rating: null,
  };
}
