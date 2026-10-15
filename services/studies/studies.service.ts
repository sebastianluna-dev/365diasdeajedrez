import { cache } from "react";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import { finalFenOf } from "@/lib/chess/replay";
import { foldForSearch } from "@/lib/fold-for-search";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import { formatRelativeSpanish } from "@/lib/format-relative-spanish";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { classTitleOf } from "@/services/classes/classes.mapper";
import { platformRoutes } from "@/lib/platform-routes";
import { getListedDatabasesWhere, getVisibleDatabasesWhere } from "@/services/shared/game-visibility";
import {
  gameViewInclude,
  mapGameView,
  mapStudyDetail,
  mapStudySummary,
  studyDetailInclude,
  studySummaryInclude,
} from "./studies.mapper";
import { creatableKinds, STUDY_GAMES_PAGE_SIZE, studyPermissionsOf } from "./study-rules";
import type {
  ClassGameItem,
  GameView,
  StudentOption,
  StudyDetail,
  StudyKindOption,
  StudySummary,
} from "./studies.types";

// "Mis estudios" in the interface; GameDatabase in the domain. The student sees
// their own databases (editable), those of the courses they have started (read-
// only) and a derived collection with the games they have seen in class. The
// list leaves the courses' out: their pages still open and the position search
// still finds their games, but a course's games are met in the course.
//
// The visibility filter lives in services/shared/game-visibility so that the
// position search uses exactly the same one.
const getVisibleStudiesWhere = getVisibleDatabasesWhere;

/**
 * Identifier of the class-games card. It is not a database id: it exists only so
 * the list has a stable key, and that is why it is 11 characters long when the
 * ids are 8 — mistaking it for one is visible at a glance.
 */
const CLASS_GAMES_ID = "class-games";

/**
 * The game the viewer last left a study on (`StudyVisit`), for the study's own
 * URL to open there; null when they never opened one, or it was deleted.
 */
export async function getLastOpenedGameId(studyId: string): Promise<string | null> {
  const user = await getCurrentUser();
  const visit = await getPlatformDb().studyVisit.findUnique({
    where: { userId_databaseId: { userId: user.id, databaseId: studyId } },
    select: { gameId: true },
  });
  return visit?.gameId ?? null;
}

export async function getUserStudies(): Promise<StudySummary[]> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getListedDatabasesWhere(), getCurrentUser()]);

  // The five reads are independent, so they travel together: the totals and the
  // games' names are scoped by the same visibility `where` instead of by the ids
  // of the first query, and the visits and the class games only need the viewer.
  const [rows, totals, gameNames, visits, classGames] = await Promise.all([
    db.gameDatabase.findMany({
      where,
      // "Mis partidas" first: it is the only one that is always there and where what
      // is recorded in a hurry ends up.
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      include: studySummaryInclude,
      // One round trip for the five included relations instead of six.
      relationLoadStrategy: "join",
    }),
    // The totals, in one query for every study: the include's own count is taken
    // by the cited games (a relation is counted once per include).
    db.game.groupBy({
      by: ["databaseId"],
      where: { database: where },
      _count: { _all: true },
    }),
    // What the list's search matches inside a study: every game's names, a few
    // short columns per game, never its PGN.
    db.game.findMany({
      where: { database: where },
      select: { databaseId: true, title: true, white: true, black: true, event: true },
    }),
    // The game each study was last left on, by this viewer: where its card
    // opens, its board, and its place in «Recientes».
    db.studyVisit.findMany({
      where: { userId: user.id },
      select: {
        databaseId: true,
        openedAt: true,
        game: { select: { id: true, pgn: true, orientation: { select: { code: true } } } },
      },
    }),
    getClassGamesSummary(),
  ]);
  const visitOf = new Map(visits.map((visit) => [visit.databaseId, visit]));
  const totalOf = new Map(totals.map((total) => [total.databaseId, total._count._all]));
  const termsOf = new Map<string, string[]>();
  for (const game of gameNames) {
    const terms = termsOf.get(game.databaseId) ?? [];
    for (const term of [game.title, game.white, game.black, game.event]) if (term) terms.push(term);
    termsOf.set(game.databaseId, terms);
  }

  const now = new Date();
  const studies = rows.map((row) =>
    mapStudySummary(row, user.id, totalOf.get(row.id) ?? 0, {
      now,
      gameTerms: [...new Set(termsOf.get(row.id))],
      visit: visitOf.get(row.id),
    }),
  );
  // At the end of the list and only if there is something: an empty "class games"
  // card would be noise for whoever has not been to one yet.
  return classGames ? [...studies, classGames] : studies;
}

/**
 * Study kinds whoever is looking CAN create. The labels live in the database,
 * but the rule of who creates what is domain and is in `study-rules`.
 *
 * "Mis partidas" is always left out, as it is born with the account.
 * "Colección" is only seen by a teacher: the student receives it shared, they
 * never make one.
 *
 * The list is informative, not the defence: `createStudy` asks `study-rules`
 * again before writing, because a server action is reachable by direct POST and
 * there no dropdown counts.
 */
export const getStudyKinds = cache(async (): Promise<StudyKindOption[]> => {
  const db = getPlatformDb();
  const teacher = await getTeacherContext();
  const rows = await db.databaseKind.findMany({
    where: { code: { in: [...creatableKinds(teacher !== null)] } },
    orderBy: { order: "asc" },
    select: { code: true, label: true },
  });
  return rows.map((row) => ({ code: row.code, label: row.label }));
});

/** Results from the catalog. The label IS the PGN token ("1-0", "*"…). */
export const getGameResultOptions = cache(async (): Promise<StudyKindOption[]> => {
  const rows = await getPlatformDb().gameResult.findMany({
    orderBy: { order: "asc" },
    select: { code: true, label: true },
  });
  return rows.map((row) => ({ code: row.code, label: row.label }));
});

/**
 * The study with its first games (`STUDY_GAMES_PAGE_SIZE`): what its own URL
 * needs, which only sends on to the first of them or, without any, shows the
 * empty study. The totals and the event counts — which name the games — are
 * asked of the whole study, so a label reads the same as it does on the game
 * page, which carries every game (`getStudyWithGames`).
 */
export async function getStudyById(studyId: string): Promise<StudyDetail | null> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const studyWhere = { AND: [{ id: studyId }, where] };

  const [row, gameCount, citedGameCount, events] = await Promise.all([
    db.gameDatabase.findFirst({
      where: studyWhere,
      include: {
        ...studyDetailInclude,
        games: { ...studyDetailInclude.games, take: STUDY_GAMES_PAGE_SIZE },
      },
      relationLoadStrategy: "join",
    }),
    db.game.count({ where: { database: studyWhere } }),
    db.game.count({ where: { database: studyWhere, classBlocks: { some: {} } } }),
    db.game.groupBy({
      by: ["event"],
      where: { database: studyWhere, event: { not: null } },
      _count: { _all: true },
    }),
  ]);
  if (!row) return null;

  const eventCounts = new Map<string, number>();
  for (const group of events) if (group.event) eventCounts.set(group.event, group._count._all);

  return mapStudyDetail(row, user.id, { gameCount, citedGameCount, eventCounts });
}

/**
 * The study with EVERY game, for the layout of its game pages: the list stays
 * on screen while one goes from game to game, so it cannot be the page of
 * games around the current one — the layout does not know which one that is,
 * and is not rendered again when it changes. The rows are light (no PGN, no
 * tags), a few hundred at most; which hundred of them is shown is decided in
 * the browser (`StudyGames`).
 */
export async function getStudyWithGames(studyId: string): Promise<StudyDetail | null> {
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const row = await getPlatformDb().gameDatabase.findFirst({
    where: { AND: [{ id: studyId }, where] },
    include: studyDetailInclude,
    // Not the join every other read here uses: joined, the games of a study
    // come as ONE JSON array built in the database, and this list has no
    // `take`. A query of their own brings them as plain rows.
    relationLoadStrategy: "query",
  });
  // Without totals of its own the mapper counts the row's games, which here are all of them.
  return row ? mapStudyDetail(row, user.id) : null;
}

/**
 * Students this teacher can share a collection with: those with an ACTIVE
 * assignment to them, the same criterion as the rest of their panel.
 *
 * It returns the empty list if whoever is looking is not a teacher. It is the
 * same condition `shareStudyWithStudent` checks again against the database
 * before writing: this only decides who is OFFERED the share.
 */
export async function getShareableStudents(): Promise<StudentOption[]> {
  const teacher = await getTeacherContext();
  if (!teacher) return [];

  const assignments = await getPlatformDb().teacherStudent.findMany({
    where: { teacherId: teacher.teacher.id, endedAt: null },
    select: { student: { select: { id: true, displayName: true, email: true } } },
    orderBy: { student: { displayName: "asc" } },
  });
  return assignments.map((assignment) => assignment.student);
}

export async function getGameById(studyId: string, gameId: string): Promise<GameView | null> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const row = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: where },
    include: gameViewInclude,
    relationLoadStrategy: "join",
  });
  return row ? mapGameView(row, user.id) : null;
}

// --- Games seen in class ---------------------------------------------------
//
// They are not a database: they are pointers from the blocks of the classes the
// student attended (ClassBlock.gameId), and the game may live in their teacher's
// database. That is why the link leads to the CLASS where it was seen and not to
// the studies viewer: there they already have access and the context is kept,
// and it avoids showing them the name of someone else's private database.

/** Class games, memoised: the list and the summary card share it. */
const getClassGameItems = cache(async (): Promise<ClassGameItem[]> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const blocks = await db.classBlock.findMany({
    where: {
      gameId: { not: null },
      class: { participants: { some: { userId: user.id } } },
    },
    orderBy: [{ class: { scheduledAt: "desc" } }, { order: "asc" }],
    relationLoadStrategy: "join",
    select: {
      classId: true,
      class: {
        select: {
          title: true,
          scheduledAt: true,
          format: { select: { code: true } },
          teacher: { select: { displayName: true } },
        },
      },
      game: {
        select: {
          id: true,
          white: true,
          black: true,
          eco: true,
          playedAt: true,
          result: { select: { label: true } },
        },
      },
    },
  });

  // The same game can appear in several classes: the most recent one is kept,
  // which is the first by the query's order.
  const seen = new Set<string>();
  const items: ClassGameItem[] = [];
  for (const block of blocks) {
    if (!block.game || seen.has(block.game.id)) continue;
    seen.add(block.game.id);
    items.push({
      id: block.game.id,
      white: block.game.white,
      black: block.game.black,
      resultLabel: block.game.result.label,
      eco: block.game.eco ?? undefined,
      playedAtLabel: block.game.playedAt ? formatSpanishDate(block.game.playedAt) : undefined,
      className: classTitleOf(block.class, "student"),
      classDate: block.class.scheduledAt.toISOString(),
      classDateLabel: formatSpanishDate(block.class.scheduledAt),
      classDateAgoLabel: formatRelativeSpanish(block.class.scheduledAt),
      href: platformRoutes.classDetail(block.classId),
    });
  }
  return items;
});

/** Card of the collection in "Mis estudios", or null when there is none. */
async function getClassGamesSummary(): Promise<StudySummary | null> {
  const items = await getClassGameItems();
  const [latest] = items;
  if (!latest) return null;
  // The board of the card: where the latest class's game ends, as a study's
  // card shows its first game.
  const game = await getPlatformDb().game.findUnique({
    where: { id: latest.id },
    select: { pgn: true, orientation: { select: { code: true } } },
  });

  return {
    id: CLASS_GAMES_ID,
    name: "Partidas de mis clases",
    description: "Las partidas que se han visto en las clases a las que asististe.",
    kindLabel: "Colección",
    kindCode: DATABASE_KIND.COLLECTION,
    gameCount: items.length,
    updatedAtLabel: latest.classDateLabel,
    updatedAgoLabel: latest.classDateAgoLabel,
    recentAt: latest.classDate,
    boardFen: finalFenOf(game?.pgn ?? ""),
    boardOrientation: game?.orientation?.code === BOARD_ORIENTATION.BLACK ? "black" : "white",
    searchText: foldForSearch(
      [
        "Partidas de mis clases",
        "Tus clases",
        ...items.flatMap((item) => [item.white, item.black, item.className]),
      ].join(" "),
    ),
    origin: { code: "CLASSES", label: "Tus clases" },
    isCourseStudy: false,
    // It is not a database: there is nothing to edit or delete.
    permissions: studyPermissionsOf({ kindCode: DATABASE_KIND.COLLECTION, isOwner: false }),
    citedGameCount: 0,
    href: platformRoutes.classGames,
  };
}

/** Content of the collection for its own page. */
export async function getClassGames(): Promise<ClassGameItem[]> {
  return getClassGameItems();
}

/** The studies the person owns, by name: where a game from elsewhere can be saved («Guardar en un estudio»). */
export async function getOwnStudyOptions(): Promise<{ id: string; name: string }[]> {
  const user = await getCurrentUser();
  return getPlatformDb().gameDatabase.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
