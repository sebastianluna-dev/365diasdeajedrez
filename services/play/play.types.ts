import type { TimeControlCode } from "@/constants/platform/play-codes.const";
import type { GameResultCode } from "@/constants/platform/study-codes.const";
import type { PlayerAvatarData } from "@/lib/avatar-tone";
import type { GameEnd } from "@/lib/chess/game-end";

/** What `appendPlayedMove` and `abandonPlayedGame` answer the live game with. */
export type AppendMoveResult =
  | { ok: true; plyCount: number; end: GameEnd | null }
  | { ok: false; reason: "stale" | "invalid" | "denied" | "throttled" | "finished" | "disabled" };

/** One side of a played game: a person or a bot. */
export interface PlayedSeat {
  kind: "user" | "bot";
  name: string;
  /** The person's user name or the bot's slug: where its page is. */
  slug: string;
  /** The strength the seat had when the game was played; null for a person without a rating. */
  elo: number | null;
  avatar: PlayerAvatarData;
  /** FIDE title of a real player behind a bot. */
  title: string | null;
}

/** A played game, whole: the live screen and the finished one read it. */
export interface PlayedGameView {
  id: string;
  white: PlayedSeat;
  black: PlayedSeat;
  initialFen: string | null;
  /** The main line, in canonical SAN. */
  sans: string[];
  plyCount: number;
  pgn: string;
  resultCode: GameResultCode;
  /** How it ended, when it has: the board's facts or a person's decision. */
  end: GameEnd | null;
  terminationLabel: string | null;
  timeControlCode: TimeControlCode;
  timeControlLabel: string;
  startedAt: Date;
  lastMoveAt: Date | null;
  finishedAt: Date | null;
  /** The seat the viewer holds; null when they only read it (their teacher, the staff). */
  viewerSeat: "white" | "black" | null;
}

/** A played game in a list, from one person's side. */
export interface PlayedGameCard {
  id: string;
  rival: PlayedSeat;
  /** The colour the person played. */
  color: "white" | "black";
  /** Null while open, and for an aborted game. */
  outcome: "win" | "loss" | "draw" | null;
  isOpen: boolean;
  terminationLabel: string | null;
  /** Moves as a person counts them: two plies, one move. */
  moves: number;
  finalFen: string;
  /** The last thing that happened: its last move, or when it started. */
  at: Date;
}

export interface PlayedGamesPage {
  games: PlayedGameCard[];
  page: number;
  pageCount: number;
  total: number;
}

/** What `/jugar/partidas/<id>` asks a list to filter by. */
export type PlayedGameResultFilter = "win" | "loss" | "draw" | "open";

/** A person's record against one bot. */
export interface BotScore {
  botId: number;
  wins: number;
  losses: number;
  draws: number;
  /** Open games against it (at most one). */
  open: number;
}

/** The open game against a bot, for «Continuar». */
export interface OpenGameSummary {
  id: string;
  rival: PlayedSeat;
  color: "white" | "black";
  plyCount: number;
}

/** A point of the «nivel contra bots» sparkline. */
export interface LevelPoint {
  at: Date;
  level: number;
}

export interface BotLevelSummary {
  level: number | null;
  sampleSize: number;
  series: LevelPoint[];
}
