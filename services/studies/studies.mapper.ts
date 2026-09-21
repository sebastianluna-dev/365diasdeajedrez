import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { studyPermissionsOf } from "./study-rules";
import type { GameView, StudyDetail, StudyGameItem, StudyShareItem, StudySummary } from "./studies.types";

export const studySummaryInclude = {
  kind: true,
  course: { select: { name: true } },
  // Who shared the collection, so it can be said where it comes from. `take: 1`
  // because the student only gets ONE row — theirs — and the owner needs none
  // here: the list of who it was shared with belongs to the detail page.
  shares: { take: 1, select: { teacher: { select: { displayName: true } } } },
  _count: { select: { games: true } },
  // Only those cited in some class, so a warning can be given before deleting:
  // those blocks would be left without a game. The ids are brought instead of
  // counting them separately because there are few and it avoids a second query
  // per study.
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
    // The order the student set rules. The date is left as a tie-breaker for those
    // not yet placed by hand — `createdAt` ASC so the chapters read 1, 2, 3: they
    // have no game date, so the descending order showed them backwards.
    orderBy: [{ order: "asc" }, { playedAt: "desc" }, { createdAt: "asc" }],
    // `select` and not `include`: the list shows neither the PGN nor the tags, and
    // with five hundred games per import those two columns were almost everything
    // that travelled from the database to render a table.
    select: {
      id: true,
      title: true,
      white: true,
      black: true,
      round: true,
      eco: true,
      event: true,
      playedAt: true,
      result: { select: { label: true } },
      // So a warning can be given before deleting the study: these games are cited in
      // classes and those blocks would be left empty.
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
 * @param viewerId id of whoever is looking, or `null` when the view is read-only
 *   by its own nature (the teacher reviewing a student). Ownership is the only
 *   thing that separates a collection that is SHARED from one that is RECEIVED,
 *   so without this what to offer them cannot be decided.
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
 * What a game is called within its study. The column cannot be left blank, so it
 * goes down a ladder:
 *
 * 1. the title, which is what someone decided to call it;
 * 2. the PGN's round, which is how a tournament's games are named;
 * 3. the event, BUT only if it distinguishes — "La Inmortal" serves, "Material
 *    del curso" repeated in thirteen games does not say which is which;
 * 4. the position, which is at least a stable handle.
 */
function gameLabel(game: StudyDetailRow["games"][number], index: number, eventCounts: Map<string, number>): string {
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

/** How many times each event repeats within the study. */
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

/** @param viewerId id of whoever is looking, or `null`; see `mapStudySummary`. */
export function mapStudyDetail(row: StudyDetailRow, viewerId: string | null): StudyDetail {
  // Outside the loop: inside, it would be recomputed once per game.
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
    // Whoever receives it is told who it comes from; whoever shares it, who it was
    // given to. Never both: they are the two faces of the same row.
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
 * @param viewerId id of whoever is looking, or `null` when the view is read-only
 *   by its own nature (the teacher reviewing a student).
 */
export function mapGameView(row: GameViewRow, viewerId: string | null): GameView {
  return {
    // A teacher SEES their students' games so they can cite them in class, but
    // annotating them is the owner's business; and the same for a student with a
    // collection someone shared with them. It comes from the same table as the rest
    // of the section so there are no two versions of the rule.
    canEdit:
      viewerId !== null &&
      studyPermissionsOf({ kindCode: row.database.kind.code, isOwner: row.database.userId === viewerId }).canEditGames,
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
