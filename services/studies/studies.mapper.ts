import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { studyPermissionsOf } from "./study-rules";
import type { GameView, StudyDetail, StudyGameItem, StudyShareItem, StudySummary } from "./studies.types";

export const studySummaryInclude = {
  kind: true,
  course: { select: { name: true } },
  // Quién repartió la colección, para poder decir de dónde viene. `take: 1`
  // porque al alumno sólo le toca UNA fila —la suya— y al dueño no le hace
  // falta ninguna aquí: la lista de a quién se la repartió es de la ficha.
  shares: { take: 1, select: { teacher: { select: { displayName: true } } } },
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
  shares: {
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      user: { select: { id: true, displayName: true, email: true } },
      teacher: { select: { displayName: true } },
    },
  },
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
  database: { select: { id: true, name: true, userId: true, kind: { select: { code: true } } } },
  _count: { select: { classBlocks: true } },
} satisfies Prisma.GameInclude;

export type GameViewRow = Prisma.GameGetPayload<{ include: typeof gameViewInclude }>;

/**
 * @param viewerId id de quien mira, o `null` cuando la vista es de sólo lectura
 *   por su propia naturaleza (el profesor revisando a un alumno). La propiedad
 *   es lo único que separa una colección que se REPARTE de una que se RECIBE,
 *   así que sin esto no se puede decidir qué se le ofrece.
 */
export function mapStudySummary(row: StudySummaryRow, viewerId: string | null): StudySummary {
  const isOwner = row.userId === viewerId;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    kindCode: row.kind.code,
    gameCount: row._count.games,
    updatedAtLabel: formatSpanishDate(row.updatedAt),
    courseName: row.course?.name,
    isCourseStudy: row.courseId !== null,
    sharedByName: isOwner ? undefined : (row.shares[0]?.teacher?.displayName ?? undefined),
    permissions: studyPermissionsOf({ kindCode: row.kind.code, isOwner }),
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

function mapStudyShare(share: StudyDetailRow["shares"][number]): StudyShareItem {
  return {
    userId: share.user.id,
    displayName: share.user.displayName,
    email: share.user.email,
    sharedAtLabel: formatSpanishDate(share.createdAt),
  };
}

/** @param viewerId id de quien mira, o `null`; ver `mapStudySummary`. */
export function mapStudyDetail(row: StudyDetailRow, viewerId: string | null): StudyDetail {
  // Fuera del bucle: dentro se recalcularía una vez por partida.
  const events = eventCounts(row);
  const isOwner = row.userId === viewerId;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    kindCode: row.kind.code,
    createdAtLabel: formatSpanishDate(row.createdAt),
    isCourseStudy: row.courseId !== null,
    courseName: row.course?.name,
    // A quien la recibe se le dice de quién viene; a quien la reparte, a quién
    // se la dio. Nunca las dos cosas: son las dos caras de la misma fila.
    sharedByName: isOwner
      ? undefined
      : (row.shares.find((share) => share.user.id === viewerId)?.teacher?.displayName ?? undefined),
    permissions: studyPermissionsOf({ kindCode: row.kind.code, isOwner }),
    shares: isOwner ? row.shares.map(mapStudyShare) : [],
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
    // pero anotarlas es cosa del dueño; y lo mismo el alumno con una colección
    // que le repartieron. Sale de la misma tabla que el resto de la sección
    // para que no haya dos versiones de la regla.
    canEdit:
      viewerId !== null &&
      studyPermissionsOf({ kindCode: row.database.kind.code, isOwner: row.database.userId === viewerId })
        .canEditGames,
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
