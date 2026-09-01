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

// Buscador por POSICIÓN: qué partidas pasaron por aquí y qué se jugó después.
// Lee el índice de services/game-positions; no reproduce ningún PGN ni recorre
// partidas en memoria, así que el coste no crece con el tamaño de la base sino
// con el número de coincidencias.

/** Partidas listadas por búsqueda; el total va aparte y sí es completo. */
const GAME_LIMIT = 20;

const EMPTY_RESULT: PositionSearchResult = { totalGames: 0, nextMoves: [], games: [] };

/**
 * El FEN llega del cliente, así que se valida antes de tocar la base: no basta
 * con que parsee, la posición tiene que ser legal. Una entrada inválida sale
 * como «sin resultados» y nunca como excepción.
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

/** Quién busca: su id y, si es profesor, sus alumnos con asignación activa. */
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
 * Traduce el filtro de origen a condiciones sobre la base propietaria. El
 * origen no es una columna: se deduce de quién es el dueño y de sus roles (ver
 * services/shared/game-origin), así que el filtro replica esa misma regla.
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
  // Las filas sin continuación son partidas que terminaron en esta posición:
  // cuentan como partida encontrada, pero no son una jugada que listar.
  const moves = groups
    .filter((group) => group.nextMoveSan !== null && group.nextMoveUci !== null)
    .map((group) => ({ san: group.nextMoveSan as string, uci: group.nextMoveUci as string, count: group._count._all }))
    .sort((a, b) => b.count - a.count || a.san.localeCompare(b.san));

  const total = moves.reduce((sum, move) => sum + move.count, 0);
  return moves.map((move) => ({
    ...move,
    // Sobre el total de continuaciones, no sobre las partidas: así los
    // porcentajes de la lista suman 100 (salvo el redondeo a un decimal).
    percentage: total === 0 ? 0 : Math.round((move.count / total) * 1000) / 10,
  }));
}

/**
 * Busca una posición entre las partidas que quien pregunta puede ver.
 *
 * La igualdad es por posición y no por secuencia de jugadas: dos partidas que
 * llegan aquí por órdenes distintos cuentan las dos.
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
    // Cuenta PARTIDAS, no filas del índice: una posición repetida dentro de la
    // misma partida da varias filas y contarlas la duplicaría.
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
