import {
  BOT_RING,
  GAME_TERMINATION,
  isBotRingCode,
  type GameTerminationCode,
  type TimeControlCode,
} from "@/constants/platform/play-codes.const";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import type { GameEnd, GameEndKind } from "@/lib/chess/game-end";
import { extractMainline } from "@/lib/chess/mainline";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { adventureEncounterOfBot } from "@/lib/adventure/adventures";
import { isOpen, outcomeFor, seatOf } from "./play-rules";
import type { PlayedGameAdventure, PlayedGameCard, PlayedGameView, PlayedSeat } from "./play.types";

// Rows of `PlayedGame` → what the screens read. Pure: the queries live in
// play.service.ts and select exactly `PLAYED_GAME_SELECT`.

const USER_SELECT = { id: true, displayName: true, slug: true, country: true } as const;
const BOT_SELECT = {
  id: true,
  slug: true,
  name: true,
  elo: true,
  country: true,
  fideTitle: true,
  group: { select: { code: true, ring: true } },
} as const;

export const PLAYED_GAME_SELECT = {
  id: true,
  whiteUserId: true,
  blackUserId: true,
  whiteBotId: true,
  blackBotId: true,
  whiteElo: true,
  blackElo: true,
  initialFen: true,
  pgn: true,
  plyCount: true,
  finalFen: true,
  startedAt: true,
  lastMoveAt: true,
  finishedAt: true,
  whiteUser: { select: USER_SELECT },
  blackUser: { select: USER_SELECT },
  whiteBot: { select: BOT_SELECT },
  blackBot: { select: BOT_SELECT },
  timeControl: { select: { code: true, label: true } },
  result: { select: { code: true } },
  termination: { select: { code: true, label: true } },
} satisfies Prisma.PlayedGameSelect;

export type PlayedGameRow = Prisma.PlayedGameGetPayload<{ select: typeof PLAYED_GAME_SELECT }>;

type UserRow = NonNullable<PlayedGameRow["whiteUser"]>;
type BotRow = NonNullable<PlayedGameRow["whiteBot"]>;

/** One seat, a person or a bot, with the strength it had in this game. */
export function seatView(user: UserRow | null, bot: BotRow | null, elo: number | null): PlayedSeat {
  if (bot) {
    return {
      kind: "bot",
      botId: bot.id,
      name: bot.name,
      slug: bot.slug,
      elo: elo ?? bot.elo,
      title: bot.fideTitle,
      avatar: {
        initials: initialsOf(bot.name),
        tone: avatarToneOf(bot.slug),
        ring: isBotRingCode(bot.group.ring) ? bot.group.ring : BOT_RING.NONE,
        country: bot.country,
      },
    };
  }
  const name = user?.displayName ?? "Desconocido";
  const slug = user?.slug ?? "";
  return {
    kind: "user",
    botId: null,
    name,
    slug,
    elo,
    title: null,
    avatar: {
      initials: initialsOf(name),
      tone: avatarToneOf(slug),
      ring: BOT_RING.NONE,
      country: user?.country ?? null,
    },
  };
}

/** What the scoreboard and the level need of each game against a bot. */
export const SCORE_SELECT = {
  whiteUserId: true,
  blackUserId: true,
  whiteBotId: true,
  blackBotId: true,
  whiteElo: true,
  blackElo: true,
  finishedAt: true,
  result: { select: { code: true } },
} satisfies Prisma.PlayedGameSelect;

export type ScoreRow = Prisma.PlayedGameGetPayload<{ select: typeof SCORE_SELECT }>;

/** The bot across the board from `userId`, and the strength it had then. */
export function botSideOf(
  row: ScoreRow,
  userId: string,
): { botId: number; botElo: number | null; seat: "white" | "black" } | null {
  const seat = seatOf(row, userId);
  if (seat === "white" && row.blackBotId !== null) return { botId: row.blackBotId, botElo: row.blackElo, seat };
  if (seat === "black" && row.whiteBotId !== null) return { botId: row.whiteBotId, botElo: row.whiteElo, seat };
  return null;
}

const KIND_OF_TERMINATION: Record<GameTerminationCode, GameEndKind> = {
  [GAME_TERMINATION.CHECKMATE]: "checkmate",
  [GAME_TERMINATION.STALEMATE]: "stalemate",
  [GAME_TERMINATION.INSUFFICIENT_MATERIAL]: "insufficient-material",
  [GAME_TERMINATION.THREEFOLD_REPETITION]: "threefold",
  [GAME_TERMINATION.FIFTY_MOVES]: "fifty-moves",
  [GAME_TERMINATION.RESIGNATION]: "resignation",
  [GAME_TERMINATION.ABANDONED]: "abandoned",
  [GAME_TERMINATION.ABORTED]: "aborted",
  [GAME_TERMINATION.TIMEOUT]: "timeout",
  [GAME_TERMINATION.DRAW_AGREED]: "draw-agreed",
};

/** How a stored game ended, read back from its two codes. Null while it is open. */
export function gameEndOfCodes(resultCode: GameResultCode, terminationCode: string | null): GameEnd | null {
  if (!terminationCode) return null;
  const code = terminationCode as GameTerminationCode;
  const winner =
    resultCode === GAME_RESULT.WHITE_WINS ? "white" : resultCode === GAME_RESULT.BLACK_WINS ? "black" : null;
  return { kind: KIND_OF_TERMINATION[code] ?? "aborted", winner, resultCode, terminationCode: code };
}

/**
 * The adventure a game belongs to: the one whose hidden group its bot is in.
 * Null for a game against a gallery bot or between people.
 */
export function adventureOfGame(row: Pick<PlayedGameRow, "whiteBot" | "blackBot">): PlayedGameAdventure | null {
  const bot = row.whiteBot ?? row.blackBot;
  const found = bot ? adventureEncounterOfBot(bot.group.code, bot.slug) : null;
  if (!found) return null;
  const { adventure, encounter } = found;
  return {
    slug: adventure.slug,
    title: adventure.title,
    encounter: {
      order: encounter.order,
      name: encounter.name,
      role: encounter.role,
      place: encounter.place,
      zoneName: adventure.zones.find((zone) => zone.slug === encounter.zone)?.name ?? "",
      isFinal: encounter.isFinal === true,
    },
  };
}

export function playedGameView(row: PlayedGameRow, viewerSeat: "white" | "black" | null): PlayedGameView {
  const resultCode = row.result.code as GameResultCode;
  return {
    id: row.id,
    white: seatView(row.whiteUser, row.whiteBot, row.whiteElo),
    black: seatView(row.blackUser, row.blackBot, row.blackElo),
    initialFen: row.initialFen,
    sans: extractMainline(row.pgn)?.sans ?? [],
    plyCount: row.plyCount,
    pgn: row.pgn,
    resultCode,
    end: gameEndOfCodes(resultCode, row.termination?.code ?? null),
    terminationLabel: row.termination?.label ?? null,
    timeControlCode: row.timeControl.code as TimeControlCode,
    timeControlLabel: row.timeControl.label,
    startedAt: row.startedAt,
    lastMoveAt: row.lastMoveAt,
    finishedAt: row.finishedAt,
    viewerSeat,
    adventure: adventureOfGame(row),
  };
}

/** A game in a list, from the side of `userId` (who must hold a seat in it). */
export function playedGameCard(row: PlayedGameRow, userId: string): PlayedGameCard {
  const color = row.blackUserId === userId ? "black" : "white";
  const resultCode = row.result.code as GameResultCode;
  const rival =
    color === "white"
      ? seatView(row.blackUser, row.blackBot, row.blackElo)
      : seatView(row.whiteUser, row.whiteBot, row.whiteElo);
  return {
    id: row.id,
    rival,
    color,
    outcome: outcomeFor(resultCode, color),
    isOpen: isOpen(row),
    terminationLabel: row.termination?.label ?? null,
    moves: Math.ceil(row.plyCount / 2),
    finalFen: row.finalFen,
    at: row.lastMoveAt ?? row.startedAt,
  };
}
