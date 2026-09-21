import { cache } from "react";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { getVisibleDatabasesWhere } from "@/services/shared/game-visibility";
import {
  gameViewInclude,
  mapGameView,
  mapStudyDetail,
  mapStudySummary,
  STUDY_GAMES_PAGE_SIZE,
  studyDetailInclude,
  studySummaryInclude,
} from "./studies.mapper";
import { creatableKinds, studyPermissionsOf } from "./study-rules";
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
// only) and a derived collection with the games they have seen in class.
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

export async function getUserStudies(): Promise<StudySummary[]> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const rows = await db.gameDatabase.findMany({
    where,
    // "Mis partidas" first: it is the only one that is always there and where what
    // is recorded in a hurry ends up.
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: studySummaryInclude,
  });

  const studies = rows.map((row) => mapStudySummary(row, user.id));
  const classGames = await getClassGamesSummary();
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
 * One page of the study's games (`STUDY_GAMES_PAGE_SIZE`). A page beyond the
 * last one answers the last: a stale link must not show an empty study. The
 * totals and the event counts — which name the games — are asked of the whole
 * study, so a label on page three reads the same as it would on a single page.
 */
export async function getStudyById(studyId: string, requestedPage = 1): Promise<StudyDetail | null> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const studyWhere = { AND: [{ id: studyId }, where] };

  const gameCount = await db.game.count({ where: { database: studyWhere } });
  const pageCount = Math.max(1, Math.ceil(gameCount / STUDY_GAMES_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);

  const [row, citedGameCount, events] = await Promise.all([
    db.gameDatabase.findFirst({
      where: studyWhere,
      include: {
        ...studyDetailInclude,
        games: { ...studyDetailInclude.games, skip: (page - 1) * STUDY_GAMES_PAGE_SIZE, take: STUDY_GAMES_PAGE_SIZE },
      },
    }),
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

  return mapStudyDetail(row, user.id, { gameCount, citedGameCount, eventCounts, page });
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
    select: {
      classId: true,
      class: { select: { title: true, scheduledAt: true } },
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
      className: block.class.title,
      classDateLabel: formatSpanishDate(block.class.scheduledAt),
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

  return {
    id: CLASS_GAMES_ID,
    name: "Partidas de mis clases",
    description: "Las partidas que se han visto en las clases a las que asististe.",
    kindLabel: "Colección",
    kindCode: DATABASE_KIND.COLLECTION,
    gameCount: items.length,
    updatedAtLabel: latest.classDateLabel,
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
