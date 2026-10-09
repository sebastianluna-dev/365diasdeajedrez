import "server-only";
import { cache } from "react";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles, getTeacherContext } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { PLAYED_GAME_SELECT, playedGameCard, playedGameView } from "./play.mapper";
import {
  botLevelOf,
  countsForScore,
  levelSeries,
  outcomeFor,
  playedGameVisibleWhere,
  seatOf,
  type BotLevelInput,
  type Viewer,
} from "./play-rules";
import type {
  BotLevelSummary,
  BotScore,
  OpenGameSummary,
  PlayedGameCard,
  PlayedGameResultFilter,
  PlayedGamesPage,
  PlayedGameView,
} from "./play.types";

// The played games, read. Every query carries the viewer's visibility INSIDE
// its `where` (`playedGameVisibleWhere`): a game the viewer may not see is
// never even read. Nothing here writes, and nothing touches the activity log:
// playing never counts toward the streak (see no-activity.test.ts).

/** The games of the profile's list, a page at a time: open first, then by last move. */
export const PLAYED_GAMES_PAGE_SIZE = 20;

/** How many games the profile shows before «Ver todas» (planning decision §I). */
export const PROFILE_RECENT_GAMES = 8;

/** Finished games the level's sparkline looks back over. */
const LEVEL_HISTORY = 60;

/** Open first, then the most recent move, then the most recent start. */
const LIST_ORDER = [
  { finishedAt: { sort: "desc", nulls: "first" } },
  { lastMoveAt: { sort: "desc", nulls: "last" } },
  { startedAt: "desc" },
] satisfies Prisma.PlayedGameOrderByWithRelationInput[];

/** Who is looking, from the session: the DAL, never the client. */
export const currentViewer = cache(async (): Promise<Viewer> => {
  const [user, teacher, roles] = await Promise.all([getCurrentUser(), getTeacherContext(), getSessionRoles()]);
  return { userId: user.id, teacherId: teacher?.teacher.id ?? null, isStaff: roles.isStaff };
});

/** The games where `userId` holds a seat. */
const seatedWhere = (userId: string): Prisma.PlayedGameWhereInput => ({
  OR: [{ whiteUserId: userId }, { blackUserId: userId }],
});

/** The games of `userId` against a bot, in either colour. */
const againstBotsWhere = (userId: string): Prisma.PlayedGameWhereInput => ({
  OR: [
    { whiteUserId: userId, blackBotId: { not: null } },
    { blackUserId: userId, whiteBotId: { not: null } },
  ],
});

/** The current person's open game against a bot, for «Continuar»: there is at most one. */
export const getOpenPlayedGame = cache(async (): Promise<OpenGameSummary | null> => {
  const user = await getCurrentUser();
  const row = await getPlatformDb().playedGame.findFirst({
    where: { finishedAt: null, ...againstBotsWhere(user.id) },
    orderBy: { startedAt: "desc" },
    select: PLAYED_GAME_SELECT,
  });
  if (!row) return null;
  const card = playedGameCard(row, user.id);
  return { id: row.id, rival: card.rival, color: card.color, plyCount: row.plyCount };
});

/** One played game, if the viewer may see it, with the seat they hold in it (or none). */
export const getPlayedGame = cache(async (gameId: string): Promise<PlayedGameView | null> => {
  const viewer = await currentViewer();
  const row = await getPlatformDb().playedGame.findFirst({
    where: { AND: [{ id: gameId }, playedGameVisibleWhere(viewer)] },
    select: PLAYED_GAME_SELECT,
  });
  return row ? playedGameView(row, seatOf(row, viewer.userId)) : null;
});

/** The results a filter keeps, from `userId`'s side. */
function resultWhere(userId: string, filter: PlayedGameResultFilter | undefined): Prisma.PlayedGameWhereInput {
  if (!filter) return {};
  if (filter === "open") return { finishedAt: null };
  if (filter === "draw") return { result: { code: GAME_RESULT.DRAW } };
  const [mine, theirs] =
    filter === "win"
      ? [GAME_RESULT.WHITE_WINS, GAME_RESULT.BLACK_WINS]
      : [GAME_RESULT.BLACK_WINS, GAME_RESULT.WHITE_WINS];
  return {
    OR: [
      { whiteUserId: userId, result: { code: mine } },
      { blackUserId: userId, result: { code: theirs } },
    ],
  };
}

/** The rival a filter keeps: a bot's slug, in either seat. */
function rivalWhere(rival: string | undefined): Prisma.PlayedGameWhereInput {
  if (!rival) return {};
  return { OR: [{ whiteBot: { slug: rival } }, { blackBot: { slug: rival } }] };
}

/**
 * The games of `userId`, a page at a time, filtered by rival and result: the
 * timeline of `/perfil/<slug>/partidas`. Paginated on the server from the
 * start, so a long history never travels whole.
 */
export async function listPlayedGamesOf(
  userId: string,
  query: { page: number; rival?: string; result?: PlayedGameResultFilter },
): Promise<PlayedGamesPage> {
  const viewer = await currentViewer();
  const where: Prisma.PlayedGameWhereInput = {
    AND: [
      seatedWhere(userId),
      playedGameVisibleWhere(viewer),
      rivalWhere(query.rival),
      resultWhere(userId, query.result),
    ],
  };
  const db = getPlatformDb();
  const total = await db.playedGame.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PLAYED_GAMES_PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const rows = await db.playedGame.findMany({
    where,
    orderBy: LIST_ORDER,
    skip: (page - 1) * PLAYED_GAMES_PAGE_SIZE,
    take: PLAYED_GAMES_PAGE_SIZE,
    select: PLAYED_GAME_SELECT,
  });
  return { games: rows.map((row) => playedGameCard(row, userId)), page, pageCount, total };
}

/** The last games of `userId`, for the profile's cards. */
export async function recentPlayedGamesOf(userId: string, take = PROFILE_RECENT_GAMES): Promise<PlayedGameCard[]> {
  const viewer = await currentViewer();
  const rows = await getPlatformDb().playedGame.findMany({
    where: { AND: [seatedWhere(userId), playedGameVisibleWhere(viewer)] },
    orderBy: LIST_ORDER,
    take,
    select: PLAYED_GAME_SELECT,
  });
  return rows.map((row) => playedGameCard(row, userId));
}

/** What the scoreboard and the level need of each game against a bot. */
const SCORE_SELECT = {
  whiteUserId: true,
  blackUserId: true,
  whiteBotId: true,
  blackBotId: true,
  whiteElo: true,
  blackElo: true,
  finishedAt: true,
  result: { select: { code: true } },
} satisfies Prisma.PlayedGameSelect;

type ScoreRow = Prisma.PlayedGameGetPayload<{ select: typeof SCORE_SELECT }>;

/** The bot across the board from `userId`, and the strength it had then. */
function botSideOf(
  row: ScoreRow,
  userId: string,
): { botId: number; botElo: number | null; seat: "white" | "black" } | null {
  const seat = seatOf(row, userId);
  if (seat === "white" && row.blackBotId !== null) return { botId: row.blackBotId, botElo: row.blackElo, seat };
  if (seat === "black" && row.whiteBotId !== null) return { botId: row.whiteBotId, botElo: row.whiteElo, seat };
  return null;
}

/** `userId`'s record against every bot they have played. */
export async function botScoreboardOf(userId: string): Promise<BotScore[]> {
  const viewer = await currentViewer();
  const rows = await getPlatformDb().playedGame.findMany({
    where: { AND: [againstBotsWhere(userId), playedGameVisibleWhere(viewer)] },
    select: SCORE_SELECT,
  });
  const byBot = new Map<number, BotScore>();
  for (const row of rows) {
    const side = botSideOf(row, userId);
    if (!side) continue;
    const score = byBot.get(side.botId) ?? { botId: side.botId, wins: 0, losses: 0, draws: 0, open: 0 };
    const resultCode = row.result.code as GameResultCode;
    if (row.finishedAt === null) score.open += 1;
    else if (countsForScore({ finishedAt: row.finishedAt, resultCode })) {
      const outcome = outcomeFor(resultCode, side.seat);
      if (outcome === "win") score.wins += 1;
      else if (outcome === "loss") score.losses += 1;
      else if (outcome === "draw") score.draws += 1;
    }
    byBot.set(side.botId, score);
  }
  return [...byBot.values()];
}

/** `userId`'s record against one bot. */
export async function botScoreAgainst(userId: string, botId: number): Promise<BotScore> {
  const scores = await botScoreboardOf(userId);
  return scores.find((score) => score.botId === botId) ?? { botId, wins: 0, losses: 0, draws: 0, open: 0 };
}

/** «Nivel contra bots ≈ 850» and its sparkline (research/puntuacion.md §5). */
export async function botLevelSummaryOf(userId: string): Promise<BotLevelSummary> {
  const viewer = await currentViewer();
  const rows = await getPlatformDb().playedGame.findMany({
    where: { AND: [againstBotsWhere(userId), playedGameVisibleWhere(viewer), { finishedAt: { not: null } }] },
    orderBy: { finishedAt: "desc" },
    take: LEVEL_HISTORY,
    select: SCORE_SELECT,
  });
  const games: BotLevelInput[] = rows.flatMap((row) => {
    const side = botSideOf(row, userId);
    const resultCode = row.result.code as GameResultCode;
    if (!side || side.botElo === null || !countsForScore({ finishedAt: row.finishedAt, resultCode })) return [];
    const outcome = outcomeFor(resultCode, side.seat);
    return outcome ? [{ botElo: side.botElo, outcome, finishedAt: row.finishedAt! }] : [];
  });
  return { ...botLevelOf(games), series: levelSeries(games) };
}
