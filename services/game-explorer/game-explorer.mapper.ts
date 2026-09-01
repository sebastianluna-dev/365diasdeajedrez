import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes, teacherRoutes } from "@/lib/platform-routes";
import { GAME_ORIGIN_LABEL, gameOriginOf } from "@/services/shared/game-origin";
import type { ExplorerGame } from "./game-explorer.types";

/**
 * Lo que hace falta para pintar una partida del buscador y para decidir a
 * dónde lleva. El bloque de clase se filtra por el usuario que mira: sólo
 * cuenta como «vista en clase» si estuvo en ESA clase.
 */
export function explorerGameInclude(viewerId: string) {
  return {
    result: { select: { label: true } },
    database: {
      select: {
        id: true,
        userId: true,
        ownerType: { select: { code: true } },
        user: {
          select: {
            teacher: { select: { id: true } },
            staff: { select: { id: true } },
          },
        },
      },
    },
    classBlocks: {
      where: { class: { participants: { some: { userId: viewerId } } } },
      select: { classId: true },
      take: 1,
    },
  } satisfies Prisma.GameInclude;
}

export type ExplorerGameRow = Prisma.GameGetPayload<{
  include: ReturnType<typeof explorerGameInclude>;
}>;

export interface ExplorerViewer {
  userId: string;
  /** Alumnos con asignación activa; vacío si quien mira no es profesor. */
  assignedStudentIds: ReadonlySet<string>;
}

/**
 * Dónde puede abrir esta partida quien busca.
 *
 * El orden importa y va de la vista más directa a la más indirecta. Una partida
 * puede ser visible por varios caminos a la vez (la partida de un alumno, que
 * además es su profesor quien mira, comentada en clase), y conviene mandarle a
 * la vista donde el contexto es mayor. Si ningún camino aplica devuelve
 * undefined: la partida se lista sin enlace antes que llevar a un 404.
 */
function explorerGameHref(row: ExplorerGameRow, viewer: ExplorerViewer): string | undefined {
  const database = row.database;

  if (database.userId === viewer.userId) return platformRoutes.gameDetail(database.id, row.id);
  if (database.ownerType.code === OWNER_TYPE.COURSE) return platformRoutes.gameDetail(database.id, row.id);
  if (database.userId && viewer.assignedStudentIds.has(database.userId)) {
    return teacherRoutes.studentGame(database.userId, database.id, row.id);
  }
  // Vista en clase: la partida vive en la base de otro, así que el alumno la
  // abre en la clase donde se comentó y no en un estudio que no es suyo.
  const classBlock = row.classBlocks[0];
  if (classBlock) return platformRoutes.classDetail(classBlock.classId);

  return undefined;
}

export function mapExplorerGame(row: ExplorerGameRow, viewer: ExplorerViewer): ExplorerGame {
  const owner = row.database.user;
  const origin = gameOriginOf({
    ownerTypeCode: row.database.ownerType.code,
    owner: owner ? { isTeacher: owner.teacher !== null, isStaff: owner.staff !== null } : null,
  });

  return {
    id: row.id,
    white: row.white,
    black: row.black,
    whiteElo: row.whiteElo ?? undefined,
    blackElo: row.blackElo ?? undefined,
    resultLabel: row.result.label,
    playedAtLabel: row.playedAt ? formatSpanishDate(row.playedAt) : undefined,
    event: row.event ?? undefined,
    origin,
    originLabel: GAME_ORIGIN_LABEL[origin],
    seenInClass: row.classBlocks.length > 0,
    href: explorerGameHref(row, viewer),
  };
}
