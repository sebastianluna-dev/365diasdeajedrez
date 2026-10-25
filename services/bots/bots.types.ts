import type { BotGroupCode } from "@/constants/platform/play-codes.const";
import type { PlayerAvatarData } from "@/lib/avatar-tone";

/** A bot as a profile names it: who it is, its label and its portrait. */
export interface BotView {
  id: number;
  slug: string;
  name: string;
  /** The label: approximate until calibrated, shown with «≈». */
  elo: number;
  bio: string;
  openings: string[];
  /** Facts about a real player, with the date they were true. */
  fideElo: number | null;
  fideTitle: string | null;
  country: string | null;
  ratingAsOfLabel: string | null;
  groupCode: BotGroupCode;
  avatar: PlayerAvatarData;
}
