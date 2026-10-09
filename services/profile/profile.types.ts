import type { PlayerAvatarData } from "@/lib/avatar-tone";
import type { BotLevelSummary, PlayedGameCard } from "@/services/play/play.types";
import type { StreakSummary } from "@/services/study-goal/study-goal.types";

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

/** A person's profile, as its head, its three cards and its last games read it («Visión general»). */
export interface ProfileView extends ProfileHead {
  /** The record against every bot together. */
  record: { wins: number; losses: number; draws: number; open: number };
  streak: StreakSummary;
  recentGames: PlayedGameCard[];
}
