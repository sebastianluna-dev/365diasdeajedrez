import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView, StudyDetail, StudyGameItem, StudySummary } from "./studies.types";

export const studySummaryInclude = {
  kind: true,
  course: { select: { name: true } },
  _count: { select: { games: true } },
  // Sólo las citadas en alguna clase, para poder avisar antes de borrar: esos
  // bloques se quedarían sin partida. Se traen los ids en vez de contarlos
  // aparte porque son pocos y evita una segunda consulta por estudio.
  games: { where: { classBlocks: { some: {} } }, select: { id: true } },
} satisfies Prisma.GameDatabaseInclude;

export type StudySummaryRow = Prisma.GameDatabaseGetPayload<{ include: typeof studySummaryInclude }>;

export const studyDetailInclude = {
  kind: true,
  course: { select: { name: true } },
  games: {
    // El orden que puso el alumno manda. La fecha queda de desempate para las
    // que aún no se han colocado a mano —`createdAt` ASC para que los capítulos
    // se lean 1, 2, 3: no tienen fecha de partida, así que el descendente los
    // mostraba al revés.
    orderBy: [{ order: "asc" }, { playedAt: "desc" }, { createdAt: "asc" }],
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
    canDelete: row.courseId === null && !row.isDefault,
    citedGameCount: row.games.length,
    href: platformRoutes.studyDetail(row.id),
  };
}

/**
 * Cómo se llama una partida dentro de su estudio. La columna no puede quedarse
 * en blanco, así que baja por una escalera:
 *
 * 1. el título, que es lo que alguien decidió llamarla;
 * 2. la ronda del PGN, que es como se nombran las de un torneo;
 * 3. el evento, PERO sólo si distingue —«La Inmortal» sirve, «Material del
 *    curso» repetido en trece partidas no dice cuál es cuál—;
 * 4. la posición, que al menos es un asidero estable.
 */
function gameLabel(
  game: StudyDetailRow["games"][number],
  index: number,
  eventCounts: Map<string, number>,
): string {
  if (game.title) return game.title;
  if (game.round) return `Ronda ${game.round}`;
  if (game.event && eventCounts.get(game.event) === 1) return game.event;
  return `Partida ${index + 1}`;
}

function mapStudyGameItem(
  studyId: string,
  game: StudyDetailRow["games"][number],
  index: number,
  eventCounts: Map<string, number>,
): StudyGameItem {
  return {
    id: game.id,
    title: game.title ?? undefined,
    label: gameLabel(game, index, eventCounts),
    citedInClass: game._count.classBlocks > 0,
    white: game.white,
    black: game.black,
    resultLabel: game.result.label,
    round: game.round ?? undefined,
    eco: game.eco ?? undefined,
    event: game.event ?? undefined,
    playedAtLabel: game.playedAt ? formatSpanishDate(game.playedAt) : undefined,
    href: platformRoutes.gameDetail(studyId, game.id),
  };
}

/** Cuántas veces se repite cada evento dentro del estudio. */
function eventCounts(row: StudyDetailRow): Map<string, number> {
  const counts = new Map<string, number>();
  for (const game of row.games) {
    if (game.event) counts.set(game.event, (counts.get(game.event) ?? 0) + 1);
  }
  return counts;
}

export function mapStudyDetail(row: StudyDetailRow): StudyDetail {
  // Fuera del bucle: dentro se recalcularía una vez por partida.
  const events = eventCounts(row);

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    kindCode: row.kind.code,
    createdAtLabel: formatSpanishDate(row.createdAt),
    isCourseStudy: row.courseId !== null,
    courseName: row.course?.name,
    citedGameCount: row.games.filter((game) => game._count.classBlocks > 0).length,
    games: row.games.map((game, index) => mapStudyGameItem(row.id, game, index, events)),
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
    whiteTitle: row.whiteTitle ?? undefined,
    blackTitle: row.blackTitle ?? undefined,
    whiteCountry: row.whiteCountry ?? undefined,
    blackCountry: row.blackCountry ?? undefined,
    resultLabel: row.result.label,
    event: row.event ?? undefined,
    site: row.site ?? undefined,
    eco: row.eco ?? undefined,
    playedAtLabel: row.playedAt ? formatSpanishDate(row.playedAt) : undefined,
    sourceLabel: row.source.label,
    pgn: row.pgn,
  };
}
