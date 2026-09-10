import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { cache } from "react";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { createPositionHash } from "@/lib/chess/position-hash";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { GAME_ORIGIN, type GameOriginCode } from "@/services/shared/game-origin";
import { getVisibleGamesWhere } from "@/services/shared/game-visibility";
import { explorerGameInclude, mapExplorerGame, type ExplorerViewer } from "./game-explorer.mapper";
import type { ExplorerNextMove, PositionSearchFilters, PositionSearchResult } from "./game-explorer.types";

// Search by POSITION: which games went through here and what was played
// afterwards. It reads the index of services/game-positions; it replays no PGN
// and walks no games in memory, so the cost does not grow with the size of the
// database but with the number of matches.

/** Games listed per search; the total goes separately and is complete. */
const GAME_LIMIT = 20;

const EMPTY_RESULT: PositionSearchResult = { totalGames: 0, nextMoves: [], games: [] };

/**
 * The FEN comes from the client, so it is validated before touching the
 * database: it is not enough that it parses, the position has to be legal. An
 * invalid input comes out as "no results" and never as an exception.
 */
function isLegalPosition(fen: string): boolean {
  const setup = parseFen(fen).unwrap(
    (value) => value,
    () => null,
  );
  if (!setup) return false;

  return Chess.fromSetup(setup).unwrap(
    () => true,
    () => false,
  );
}

/**
 * Who is searching: their id and, if they are a teacher, their students with an
 * active assignment.
 */
const getExplorerViewer = cache(async (): Promise<ExplorerViewer> => {
  const user = await getCurrentUser();
  const teacherContext = await getTeacherContext();
  if (!teacherContext) return { userId: user.id, assignedStudentIds: new Set() };

  const assignments = await getPlatformDb().teacherStudent.findMany({
    where: { teacherId: teacherContext.teacher.id, endedAt: null },
    select: { studentId: true },
  });
  return { userId: user.id, assignedStudentIds: new Set(assignments.map((row) => row.studentId)) };
});

/**
 * Translates the origin filter into conditions over the owning database. The
 * origin is not a column: it is deduced from who the owner is and from their
 * roles (see services/shared/game-origin), so the filter replicates that same rule.
 */
function originWhere(origins: GameOriginCode[] | undefined): Prisma.GameWhereInput | null {
  if (!origins || origins.length === 0) return null;

  const clauses = origins.map((origin): Prisma.GameWhereInput => {
    if (origin === GAME_ORIGIN.COURSE) {
      return { database: { ownerType: { code: OWNER_TYPE.COURSE } } };
    }
    if (origin === GAME_ORIGIN.EDITOR) {
      return {
        database: {
          ownerType: { code: OWNER_TYPE.USER },
          user: { OR: [{ teacher: { isNot: null } }, { staff: { isNot: null } }] },
        },
      };
    }
    return {
      database: {
        ownerType: { code: OWNER_TYPE.USER },
        user: { teacher: { is: null }, staff: { is: null } },
      },
    };
  });

  return { OR: clauses };
}

function toNextMoves(
  groups: { nextMoveSan: string | null; nextMoveUci: string | null; _count: { _all: number } }[],
): ExplorerNextMove[] {
  // The rows without a continuation are games that ended in this position: they
  // count as a game found, but they are not a move to list.
  const moves = groups
    .filter((group) => group.nextMoveSan !== null && group.nextMoveUci !== null)
    .map((group) => ({ san: group.nextMoveSan as string, uci: group.nextMoveUci as string, count: group._count._all }))
    .sort((a, b) => b.count - a.count || a.san.localeCompare(b.san));

  const total = moves.reduce((sum, move) => sum + move.count, 0);
  return moves.map((move) => ({
    ...move,
    // Over the total of continuations, not over the games: that way the list's
    // percentages add up to 100 (bar the rounding to one decimal).
    percentage: total === 0 ? 0 : Math.round((move.count / total) * 1000) / 10,
  }));
}

/**
 * Searches for a position among the games whoever asks can see.
 *
 * Equality is by position and not by sequence of moves: two games that get here
 * through different orders both count.
 */
export async function searchGamesByPosition(
  fen: string,
  filters: PositionSearchFilters = {},
): Promise<PositionSearchResult> {
  if (!isLegalPosition(fen)) return EMPTY_RESULT;

  const db = getPlatformDb();
  const positionHash = createPositionHash(fen);
  const viewer = await getExplorerViewer();
  const visibleGames = await getVisibleGamesWhere();

  const origin = originWhere(filters.origins);
  const gameConditions: Prisma.GameWhereInput[] = origin ? [visibleGames, origin] : [visibleGames];

  const [totalGames, moveGroups, gameRows] = await Promise.all([
    // It counts GAMES, not index rows: a position repeated within the same game
    // gives several rows and counting them would double it.
    db.game.count({
      where: { AND: [...gameConditions, { positions: { some: { positionHash } } }] },
    }),
    db.gamePosition.groupBy({
      by: ["nextMoveSan", "nextMoveUci"],
      where: { positionHash, game: { AND: gameConditions } },
      _count: { _all: true },
    }),
    db.game.findMany({
      where: { AND: [...gameConditions, { positions: { some: { positionHash } } }] },
      include: explorerGameInclude(viewer.userId),
      orderBy: [{ playedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: GAME_LIMIT,
    }),
  ]);

  return {
    totalGames,
    nextMoves: toNextMoves(moveGroups),
    games: gameRows.map((row) => mapExplorerGame(row, viewer)),
  };
}
