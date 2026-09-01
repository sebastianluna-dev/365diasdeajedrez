import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView, StudyDetail, StudyGameItem, StudySummary } from "./studies.types";

export const studySummaryInclude = {
  kind: true,
  course: { select: { name: true } },
  _count: { select: { games: true } },
} satisfies Prisma.GameDatabaseInclude;

export type StudySummaryRow = Prisma.GameDatabaseGetPayload<{ include: typeof studySummaryInclude }>;

export const studyDetailInclude = {
  kind: true,
  course: { select: { name: true } },
  games: {
    // `createdAt` ASC para que los capítulos se lean 1, 2, 3: no tienen fecha
    // de partida, así que el orden descendente los mostraba al revés.
    orderBy: [{ playedAt: "desc" }, { createdAt: "asc" }],
    include: {
      result: { select: { label: true } },
      // Para poder avisar antes de borrar el estudio: estas partidas están
      // citadas en clases y esos bloques se quedarían vacíos.
      _count: { select: { classBlocks: true } },
    },
  },
} satisfies Prisma.GameDatabaseInclude;

export type StudyDetailRow = Prisma.GameDatabaseGetPayload<{ include: typeof studyDetailInclude }>;

export const gameViewInclude = {
  result: { select: { label: true, code: true } },
  source: { select: { label: true } },
  database: { select: { id: true, name: true, userId: true } },
  _count: { select: { classBlocks: true } },
} satisfies Prisma.GameInclude;

export type GameViewRow = Prisma.GameGetPayload<{ include: typeof gameViewInclude }>;

export function mapStudySummary(row: StudySummaryRow): StudySummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    gameCount: row._count.games,
    updatedAtLabel: formatSpanishDate(row.updatedAt),
    courseName: row.course?.name,
    isCourseStudy: row.courseId !== null,
    href: platformRoutes.studyDetail(row.id),
  };
}

function mapStudyGameItem(studyId: string, game: StudyDetailRow["games"][number]): StudyGameItem {
  return {
    id: game.id,
    title: game.title ?? undefined,
    white: game.white,
    black: game.black,
    resultLabel: game.result.label,
    eco: game.eco ?? undefined,
    event: game.event ?? undefined,
    playedAtLabel: game.playedAt ? formatSpanishDate(game.playedAt) : undefined,
    href: platformRoutes.gameDetail(studyId, game.id),
  };
}

export function mapStudyDetail(row: StudyDetailRow): StudyDetail {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    isCourseStudy: row.courseId !== null,
    courseName: row.course?.name,
    citedGameCount: row.games.filter((game) => game._count.classBlocks > 0).length,
    games: row.games.map((game) => mapStudyGameItem(row.id, game)),
  };
}

/**
 * @param viewerId id de quien mira, o `null` cuando la vista es de sólo lectura
 *   por su propia naturaleza (el profesor revisando a un alumno).
 */
export function mapGameView(row: GameViewRow, viewerId: string | null): GameView {
  return {
    // Un profesor VE las partidas de sus alumnos para poder citarlas en clase,
    // pero anotarlas es cosa del dueño.
    canEdit: viewerId !== null && row.database.userId === viewerId,
    id: row.id,
    title: row.title ?? undefined,
    resultCode: row.result.code,
    playedAtValue: row.playedAt ? row.playedAt.toISOString().slice(0, 10) : undefined,
    round: row.round ?? undefined,
    initialFen: row.initialFen ?? undefined,
    classBlockCount: row._count.classBlocks,
    studyId: row.database.id,
    studyName: row.database.name,
    studyHref: platformRoutes.studyDetail(row.database.id),
    white: row.white,
    black: row.black,
    whiteElo: row.whiteElo ?? undefined,
    blackElo: row.blackElo ?? undefined,
    resultLabel: row.result.label,
    event: row.event ?? undefined,
    site: row.site ?? undefined,
    eco: row.eco ?? undefined,
    playedAtLabel: row.playedAt ? formatSpanishDate(row.playedAt) : undefined,
    sourceLabel: row.source.label,
    pgn: row.pgn,
  };
}
