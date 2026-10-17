import { cache } from "react";
import { academyWhatsappHref } from "@/constants/platform/academy-contact.const";
import {
  CLASS_BLOCK_KIND,
  CLASS_FORMAT,
  CLASS_PHASE,
  CLASS_STATUS,
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { formatClassStamp, formatClassWhen } from "@/lib/format-class-when";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { teacherRoutes } from "@/lib/platform-routes";
import { classTimeZone, dayRangeIn } from "@/lib/timezone";
import { classDetailInclude, mapClassBlocks } from "@/services/classes/classes.mapper";
import { classSolvedLabels } from "@/services/shared/class-exercise-progress";
import { canFinalizeClass, editableClassFields } from "@/services/shared/class-rules";
import { buildPickableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { mapSeriesPickOption } from "@/services/teacher-exercises/teacher-exercises.mapper";
import {
  adminLineOf,
  mapClassExerciseProgress,
  mapTeacherBlock,
  mapTeacherClassRow,
  mapTeacherSeat,
  meetingVisibleLine,
  teacherCanChangeMark,
  teacherClassTitle,
  teacherJoinData,
  teacherPhaseOf,
  type TeacherClassSource,
  type TeacherSeatSource,
} from "./teacher-classes.mapper";
import type {
  PickableExercise,
  ReferenceableGameGroup,
  TeacherClassDetail,
  TeacherClassesFilters,
  TeacherClassesView,
  UpcomingClassWith,
} from "./teacher-classes.types";

// Classes the teacher GIVES. `teacherId` goes inside the `where` in every
// read: asking for another teacher's class by URL returns nothing that has to
// be discarded afterwards. The teacher reads in THEIR zone
// (`classTimeZone`, D7), never a payment, and the link always.

const PAGE_SIZE = 20;

/** The zone the teacher reads in, and whether it fell back to the academy's. */
export async function teacherZone(teacherId: string): Promise<{ timeZone: string; missing: boolean }> {
  const row = await getPlatformDb().teacher.findUnique({ where: { id: teacherId }, select: { timezone: true } });
  return classTimeZone(row?.timezone);
}

export const teacherClassSelect = {
  id: true,
  title: true,
  scheduledAt: true,
  endsAt: true,
  durationMin: true,
  meetingUrl: true,
  meetingUrlVisibleFrom: true,
  status: { select: { code: true } },
  format: { select: { code: true } },
  teacher: { select: { displayName: true } },
  participants: {
    where: { seatMovedAt: null },
    select: { userId: true, attended: true, user: { select: { displayName: true } } },
    orderBy: { user: { displayName: "asc" } },
  },
  blocks: { select: { visibility: { select: { code: true } } } },
} satisfies Prisma.ClassSelect;

export type TeacherClassDbRow = Prisma.ClassGetPayload<{ select: typeof teacherClassSelect }>;

export function toTeacherSource(row: TeacherClassDbRow): TeacherClassSource {
  return {
    id: row.id,
    title: row.title,
    scheduledAt: row.scheduledAt,
    endsAt: row.endsAt,
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    formatCode: row.format.code as ClassFormatCode,
    meetingUrl: row.meetingUrl,
    meetingUrlVisibleFrom: row.meetingUrlVisibleFrom,
    teacherName: row.teacher.displayName,
    seats: row.participants.map((seat) => ({
      userId: seat.userId,
      displayName: seat.user.displayName,
      attended: seat.attended,
    })),
    blocks: row.blocks.map((block) => ({ visibility: block.visibility.code as ClassBlockVisibilityCode })),
  };
}

/** «Clases que imparto»: a view at a time, twenty rows per page. */
export async function getTeacherClasses(filters: TeacherClassesFilters): Promise<TeacherClassesView> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const now = new Date();
  const zone = await teacherZone(teacher.id);
  const q = filters.q?.trim();
  const base: Prisma.ClassWhereInput = {
    teacherId: teacher.id,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { participants: { some: { user: { displayName: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };
  const notCancelled = { status: { code: { not: CLASS_STATUS.CANCELLED } } } as const;
  const awaiting: Prisma.ClassWhereInput = {
    teacherId: teacher.id,
    status: { code: CLASS_STATUS.SCHEDULED },
    endsAt: { lt: now },
  };
  const where: Prisma.ClassWhereInput =
    filters.vista === "proximas"
      ? { ...base, ...notCancelled, endsAt: { gte: now } }
      : filters.vista === "por-finalizar"
        ? { ...base, ...awaiting }
        : filters.vista === "pasadas"
          ? { ...base, ...notCancelled, endsAt: { lt: now } }
          : { ...base, status: { code: CLASS_STATUS.CANCELLED } };
  const ascending = filters.vista === "proximas";

  const [total, awaitingCloseCount, rows] = await Promise.all([
    db.class.count({ where }),
    db.class.count({ where: awaiting }),
    db.class.findMany({
      where,
      select: teacherClassSelect,
      orderBy: { scheduledAt: ascending ? "asc" : "desc" },
      // «Ver más» adds a page: every row up to the page asked for.
      take: PAGE_SIZE * Math.max(1, filters.pagina),
    }),
  ]);
  const context = { now, timeZone: zone.timeZone, teacherName: teacher.displayName };
  return {
    filters,
    timeZone: zone.timeZone,
    timeZoneMissing: zone.missing,
    nowIso: now.toISOString(),
    rows: rows.map((row) => mapTeacherClassRow(toTeacherSource(row), context)),
    total,
    page: Math.max(1, filters.pagina),
    pageSize: PAGE_SIZE,
    awaitingCloseCount,
  };
}

const detailSelect = {
  ...teacherClassSelect,
  description: true,
  recordingUrl: true,
  summary: true,
  createdAt: true,
  closedAt: true,
  cancelReason: true,
  cancelNote: true,
  meetingProvider: { select: { label: true } },
  createdBy: { select: { displayName: true } },
  closedBy: { select: { displayName: true } },
  participants: {
    select: {
      userId: true,
      attended: true,
      seatMovedAt: true,
      seatMovedToClassId: true,
      user: { select: { displayName: true } },
      attendanceChanges: {
        orderBy: { changedAt: "asc" },
        select: {
          changedAt: true,
          fromAttended: true,
          toAttended: true,
          reason: true,
          isOverride: true,
          changedBy: { select: { displayName: true } },
        },
      },
    },
    orderBy: [{ seatMovedAt: { sort: "asc", nulls: "first" } }, { user: { displayName: "asc" } }],
  },
  seatsMovedIn: { select: { userId: true, class: { select: { scheduledAt: true } } } },
  blocks: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      text: true,
      videoUrl: true,
      caption: true,
      movePath: true,
      gameId: true,
      pgn: true,
      lessonId: true,
      positionId: true,
      kind: { select: { code: true } },
      visibility: { select: { code: true } },
      game: { select: { id: true, white: true, black: true, pgn: true } },
      lesson: { select: { id: true, name: true, ...lessonPgnSelect, chapter: { select: { name: true } } } },
      position: { select: { id: true, title: true, fen: true } },
      exercises: {
        orderBy: { order: "asc" },
        select: {
          exerciseId: true,
          // The card the popup draws for one the teacher could no longer pick, and what says whether they could.
          exercise: {
            select: {
              id: true,
              title: true,
              kind: { select: { code: true } },
              mateIn: true,
              difficulty: true,
              teacherId: true,
              status: { select: { code: true } },
              topics: { select: { topic: { select: { code: true, label: true, order: true } } } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ClassSelect;

/** An attempt from one of the class's EXERCISE blocks, as «2 de 3 lo resolvieron» and its popup read it. */
const blockAttemptSelect = {
  id: true,
  userId: true,
  classBlockId: true,
  exerciseId: true,
  seriesId: true,
  createdAt: true,
  durationMs: true,
  hintsUsed: true,
  solutionShown: true,
  result: { select: { code: true } },
  context: { select: { code: true, label: true } },
  exercise: { select: { id: true, title: true, teacherId: true, startFen: true } },
  series: { select: { title: true } },
  classBlock: { select: { class: { select: { title: true, scheduledAt: true } } } },
  mistakeDetails: { select: { fen: true, expectedSan: true, playedSan: true }, take: 1 },
  user: { select: { displayName: true } },
} satisfies Prisma.TrainingAttemptSelect;

/**
 * The teacher's record of a class (PROF-2): the blocks to edit and as the
 * student sees them, the students with their marks and the staff's changes,
 * the meeting, what was written after, the staff's facts and, per EXERCISE
 * block, who solved what from it (D29: the attempts with that `classBlockId`
 * by the seats not moved). Cached per request: the page and its metadata
 * read it once.
 */
export const getTeacherClassDetail = cache(async (classId: string): Promise<TeacherClassDetail | null> => {
  const { teacher, user } = await requireTeacher();
  const db = getPlatformDb();
  const now = new Date();
  const [zone, row, viewRow, assigned] = await Promise.all([
    teacherZone(teacher.id),
    db.class.findFirst({ where: { id: classId, teacherId: teacher.id }, select: detailSelect }),
    db.class.findFirst({ where: { id: classId, teacherId: teacher.id }, include: classDetailInclude }),
    db.teacherStudent.findMany({ where: { teacherId: teacher.id, endedAt: null }, select: { studentId: true } }),
  ]);
  if (!row || !viewRow) return null;
  void user;

  const timeZone = zone.timeZone;
  const assignedIds = new Set(assigned.map((item) => item.studentId));
  const source: TeacherClassSource = toTeacherSource({
    ...row,
    participants: row.participants
      .filter((seat) => seat.seatMovedAt === null)
      .map((seat) => ({ userId: seat.userId, attended: seat.attended, user: seat.user })),
  });
  const phase = teacherPhaseOf(source, now);
  const title = teacherClassTitle(source);
  const movedInBy = new Map(row.seatsMovedIn.map((seat) => [seat.userId, seat.class]));
  const seatSources: TeacherSeatSource[] = row.participants.map((seat) => ({
    userId: seat.userId,
    displayName: seat.user.displayName,
    isAssigned: assignedIds.has(seat.userId),
    attended: seat.attended,
    seatMovedAt: seat.seatMovedAt,
    seatMovedToClassId: seat.seatMovedToClassId,
    replaces: movedInBy.get(seat.userId) ?? null,
    changes: seat.attendanceChanges.map((change) => ({
      changedAt: change.changedAt,
      byName: change.changedBy?.displayName ?? null,
      fromAttended: change.fromAttended,
      toAttended: change.toAttended,
      reason: change.reason,
      isOverride: change.isOverride,
    })),
  }));
  const whatsappHref = academyWhatsappHref(`Hola, soy ${teacher.displayName}. Sobre la clase «${title}»:`);
  const isGroup = source.formatCode === CLASS_FORMAT.GROUP;
  const students = seatSources.map((seat) => mapTeacherSeat(seat, timeZone, now));

  // The EXERCISE blocks' attempts, from the seats not moved: «2 de 3 lo resolvieron» and its popup.
  const exerciseBlocks = row.blocks.filter((block) => block.kind.code === CLASS_BLOCK_KIND.EXERCISE);
  const seated = seatSources.filter((seat) => seat.seatMovedAt === null);
  const attempts =
    exerciseBlocks.length > 0 && seated.length > 0
      ? await db.trainingAttempt.findMany({
          where: {
            classBlockId: { in: exerciseBlocks.map((block) => block.id) },
            userId: { in: seated.map((seat) => seat.userId) },
            exerciseId: { not: null },
          },
          select: blockAttemptSelect,
        })
      : [];
  const seatIds = seated.map((seat) => seat.userId);
  const solvedLabels = classSolvedLabels(
    exerciseBlocks.map((block) => ({ id: block.id, exerciseIds: block.exercises.map((item) => item.exerciseId) })),
    attempts,
    seatIds,
  );
  const whenLine = formatClassWhen({ start: row.scheduledAt, durationMin: row.durationMin, timeZone, now });

  return {
    id: row.id,
    title,
    topic: row.title ?? "",
    description: row.description,
    phase,
    formatCode: source.formatCode,
    isGroup,
    startIso: row.scheduledAt.toISOString(),
    endIso: row.endsAt.toISOString(),
    durationMin: row.durationMin,
    timeZone,
    timeZoneMissing: zone.missing,
    nowIso: now.toISOString(),
    join: teacherJoinData({ ...source, providerLabel: row.meetingProvider?.label ?? null }, phase, {
      now,
      timeZone,
      whatsappHref,
    }),
    meetingVisibleLine: meetingVisibleLine(source, timeZone),
    students,
    blocks: row.blocks.map((block) => mapTeacherBlock(block, teacher.id)),
    views: mapClassBlocks(viewRow.blocks, { audience: "teacher", phase, solvedLabels }),
    exerciseProgress: mapClassExerciseProgress(
      exerciseBlocks,
      attempts,
      seated.map((seat) => ({ userId: seat.userId, displayName: seat.displayName, isAssigned: seat.isAssigned })),
      teacher.id,
      now,
    ),
    afterNotes: {
      summary: row.summary,
      recordingUrl: row.recordingUrl,
      closedAtLabel: row.closedAt ? formatClassStamp(row.closedAt, timeZone, now) : null,
      closedByName: row.closedBy?.displayName ?? null,
    },
    adminLine: adminLineOf(
      {
        formatCode: source.formatCode,
        durationMin: row.durationMin,
        createdAt: row.createdAt,
        createdByName: row.createdBy?.displayName ?? null,
      },
      timeZone,
      now,
    ),
    cancellation: phase === CLASS_PHASE.CANCELLED ? { reason: row.cancelReason, note: row.cancelNote } : null,
    editable: editableClassFields(phase),
    canFinalize: canFinalizeClass(phase),
    finalize: {
      classId: row.id,
      classTitle: title,
      whenLine: `${whenLine} · ${isGroup ? `${source.seats.length} alumnos` : (source.seats[0]?.displayName ?? "")}`,
      isGroup,
      teacherName: teacher.displayName,
      students: seatSources
        .filter((seat) => seat.seatMovedAt === null || phase === CLASS_PHASE.DONE)
        .map((seat) => ({
          id: seat.userId,
          displayName: seat.displayName,
          details: assignedIds.has(seat.userId) ? undefined : ["No es tu alumno: ve su nombre, no su ficha"],
          mark: students.find((student) => student.userId === seat.userId)?.mark ?? { attended: seat.attended },
        })),
      summary: row.summary,
      recordingUrl: row.recordingUrl,
    },
    canChangeAttendance: seatSources.some((seat) => teacherCanChangeMark(seat, phase)),
    whatsappHref,
    href: teacherRoutes.classDetail(row.id),
  };
});

/** The classes ahead of this teacher with the given student: where «Usar en una clase» may put a game. */
export async function listUpcomingClassesWith(studentId: string): Promise<UpcomingClassWith[]> {
  const { teacher } = await requireTeacher();
  const now = new Date();
  const zone = await teacherZone(teacher.id);
  const rows = await getPlatformDb().class.findMany({
    where: {
      teacherId: teacher.id,
      status: { code: CLASS_STATUS.SCHEDULED },
      endsAt: { gte: now },
      participants: { some: { userId: studentId, seatMovedAt: null } },
    },
    select: teacherClassSelect,
    orderBy: { scheduledAt: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    title: teacherClassTitle(toTeacherSource(row)),
    whenLabel: formatClassWhen({ start: row.scheduledAt, durationMin: row.durationMin, timeZone: zone.timeZone, now }),
    href: teacherRoutes.classDetail(row.id),
  }));
}

/** The bounds of the teacher's day, in their zone. */
export async function teacherDayRange(teacherId: string, now: Date) {
  const zone = await teacherZone(teacherId);
  return { zone, range: dayRangeIn(now, zone.timeZone) };
}

/**
 * Games the teacher can reference in a block: those of their own studies and
 * those of the students with an active assignment. It returns only id and
 * label — full PGNs do not travel to a selector (they are requested one at a
 * time with `getPgnForReference` when a preview is needed).
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

/**
 * The exercises the teacher may put in an EXERCISE block (D08, D29): what
 * they may put in a series — their own usable ones and the library's —, the
 * last changed first. Empty with the flag off, when the kind is not offered.
 */
export async function listPickableExercises(): Promise<PickableExercise[]> {
  const { teacher } = await requireTeacher();
  if (!EXERCISES_ENABLED) return [];
  const rows = await getPlatformDb().exercise.findMany({
    where: buildPickableExercisesWhere({ teacherId: teacher.id }),
    select: {
      id: true,
      title: true,
      difficulty: true,
      mateIn: true,
      kind: { select: { code: true } },
      topics: { select: { topic: { select: { code: true, label: true, order: true } } } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
  });
  return rows.map(mapSeriesPickOption);
}

/**
 * PGN of a resource for the position picker of the block editor. It
 * authorises like creating the block: an own game or one of an actively
 * assigned student, a lesson of a published course.
 */
export async function getPgnForReference(kind: ClassBlockKindCode, id: string): Promise<string | null> {
  const { teacher, user } = await requireTeacher();
  const db = getPlatformDb();

  if (kind === "GAME_REF") {
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
  if (kind !== "LESSON_REF") return null;

  const lesson = await db.lesson.findFirst({
    where: { id, chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } } },
    select: lessonPgnSelect,
  });
  return lesson ? lessonPgnOf(lesson) : null;
}
