import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { CLASS_BLOCK_KIND, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { safeTimeZone } from "@/lib/timezone";
import { classDetailInclude, mapClassDetail } from "@/services/classes/classes.mapper";
import type { ClassBlockView } from "@/services/classes/classes.types";
import {
  mapTeacherClassDetail,
  mapTeacherClassSummary,
  teacherClassDetailInclude,
  teacherClassSummaryInclude,
} from "./teacher-classes.mapper";
import type {
  PositionOption,
  ReferenceableGameGroup,
  TeacherClassDetail,
  TeacherClassSummary,
} from "./teacher-classes.types";

// Classes the teacher GIVES. `teacherId` goes inside the `where` in every read:
// asking for another teacher's class by URL returns nothing that has to be
// discarded afterwards.

/** The teacher's time zone, to render and read the `datetime-local` fields. */
async function teacherTimeZone(teacherId: string): Promise<string> {
  const row = await getPlatformDb().teacher.findUnique({ where: { id: teacherId }, select: { timezone: true } });
  return safeTimeZone(row?.timezone);
}

export async function getTeacherClasses(statusCode?: ClassStatusCode): Promise<TeacherClassSummary[]> {
  const { teacher } = await requireTeacher();

  const rows = await getPlatformDb().class.findMany({
    where: { teacherId: teacher.id, ...(statusCode ? { status: { code: statusCode } } : {}) },
    include: teacherClassSummaryInclude,
    orderBy: { scheduledAt: "desc" },
  });
  return rows.map(mapTeacherClassSummary);
}

export async function getTeacherClassDetail(classId: string): Promise<TeacherClassDetail | null> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();

  const [row, timeZone] = await Promise.all([
    db.class.findFirst({ where: { id: classId, teacherId: teacher.id }, include: teacherClassDetailInclude }),
    teacherTimeZone(teacher.id),
  ]);
  return row ? mapTeacherClassDetail(row, timeZone) : null;
}

/** Catalog of meeting platforms for the class form. */
export async function listMeetingProviders(): Promise<{ code: string; label: string }[]> {
  await requireTeacher();
  const rows = await getPlatformDb().meetingProvider.findMany({
    orderBy: { order: "asc" },
    select: { code: true, label: true },
  });
  return rows;
}

/**
 * The blocks EXACTLY as the student will see them. The student's mapper is
 * reused on purpose: if the preview used its own logic, the teacher could be
 * seeing something different from what is published.
 */
export async function getTeacherClassPreview(classId: string): Promise<ClassBlockView[]> {
  const { teacher } = await requireTeacher();

  const row = await getPlatformDb().class.findFirst({
    where: { id: classId, teacherId: teacher.id },
    include: classDetailInclude,
  });
  return row ? mapClassDetail(row, new Date()).blocks : [];
}

/**
 * Games the teacher can reference in a block: those of their own studies and
 * those of the students with an active assignment. It returns only id and label —
 * full PGNs do not travel to a selector (they are requested one at a time with
 * `getPgnForReference` when a preview is needed).
 */
export async function listReferenceableGames(): Promise<ReferenceableGameGroup[]> {
  const { teacher, user } = await requireTeacher();

  const databases = await getPlatformDb().gameDatabase.findMany({
    where: {
      OR: [{ userId: user.id }, { user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } } }],
    },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { displayName: true } },
      games: { select: { id: true, white: true, black: true }, orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }] },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return databases
    .filter((database) => database.games.length > 0)
    .map((database) => ({
      studyId: database.id,
      // Only their own can be annotated: the student's are seen in order to cite them.
      isOwn: database.userId === user.id,
      ownerLabel: database.userId === user.id ? "Mis estudios" : (database.user?.displayName ?? "Alumno"),
      studyName: database.name,
      games: database.games.map((game) => ({ id: game.id, label: `${game.white} – ${game.black}` })),
    }));
}

export async function listTeacherPositions(): Promise<PositionOption[]> {
  const { user } = await requireTeacher();

  const positions = await getPlatformDb().position.findMany({
    where: { userId: user.id, ownerType: { code: OWNER_TYPE.TEACHER } },
    select: { id: true, title: true, fen: true },
    orderBy: { createdAt: "desc" },
  });

  return positions.map((position) => ({
    id: position.id,
    label: position.title ?? "Posición sin título",
    fen: position.fen,
  }));
}

/**
 * PGN of a resource for the position picker of the block editor. It authorises
 * like creating the block: an own game or one of an actively assigned student, a
 * lesson of a published course.
 */
export async function getPgnForReference(
  kind: typeof CLASS_BLOCK_KIND.GAME_REF | typeof CLASS_BLOCK_KIND.LESSON_REF,
  id: string,
): Promise<string | null> {
  const { teacher, user } = await requireTeacher();
  const db = getPlatformDb();

  if (kind === CLASS_BLOCK_KIND.GAME_REF) {
    const game = await db.game.findFirst({
      where: {
        id,
        database: {
          OR: [
            { userId: user.id },
            { user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } } },
          ],
        },
      },
      select: { pgn: true },
    });
    return game?.pgn ?? null;
  }

  const lesson = await db.lesson.findFirst({
    where: { id, chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } } },
    select: lessonPgnSelect,
  });
  return lesson ? lessonPgnOf(lesson) : null;
}
