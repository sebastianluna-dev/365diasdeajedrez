import type { PlayerAvatarData } from "@/lib/avatar-tone";
import type { BotLevelSummary, PlayedGameCard } from "@/services/play/play.types";
import type { StreakOverview, StudyMonthComparison } from "@/services/study-goal/study-goal.types";

/** A person as a side of a scoreboard or a strip: the name and the portrait. */
export interface PlayerCard {
  name: string;
  avatar: PlayerAvatarData;
}

/** A profile's head (N5): what both of its pages draw above their tabs. */
export interface ProfileHead {
  userId: string;
  slug: string;
  displayName: string;
  avatar: PlayerAvatarData;
  statusLine: string | null;
  country: string | null;
  badge: "Alumno" | "Profesor";
  /** «19 de marzo, 2026». */
  joinedLabel: string;
  /** «Editar perfil» is only for the person themselves. */
  isOwn: boolean;
  counts: { courses: number; studies: number; games: number };
  botLevel: BotLevelSummary;
  /** A platform rating arrives with the games between people; it exists in the type from day one. */
  rating: null;
}

/** The record against one bot, named: a column of «Contra cada bot». */
export interface ProfileBotRecord {
  botId: number;
  slug: string;
  name: string;
  /** Its label today, «≈» as the gallery shows it. */
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  /** Games against it still open (at most one). */
  open: number;
}

/**
 * A person's profile as «Visión general» reads it (2026-10-25, the owner's
 * «Perfil E2»): the head, the study — this month's minutes against the last
 * one's and the streak's sixteen weeks —, the play — the record, the level and
 * the record against each bot — and the last games.
 */
export interface ProfileView extends ProfileHead {
  /** The record against every bot together. */
  record: { wins: number; losses: number; draws: number; open: number };
  /** The record against each bot, weakest first. */
  botRecords: ProfileBotRecord[];
  streak: StreakOverview;
  studyMonths: StudyMonthComparison;
  recentGames: PlayedGameCard[];
}
