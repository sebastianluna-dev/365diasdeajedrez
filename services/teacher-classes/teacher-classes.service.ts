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
  LessonRefOption,
  PositionOption,
  ReferenceableGameGroup,
  TeacherClassDetail,
  TeacherClassSummary,
} from "./teacher-classes.types";

// Clases QUE IMPARTE el profesor. `teacherId` va dentro del `where` en todas
// las lecturas: pedir la clase de otro profesor por URL no devuelve nada que
// haya que descartar después.

/** Zona horaria del profesor para pintar y leer los `datetime-local`. */
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

/** Catálogo de plataformas de reunión para el formulario de clase. */
export async function listMeetingProviders(): Promise<{ code: string; label: string }[]> {
  await requireTeacher();
  const rows = await getPlatformDb().meetingProvider.findMany({
    orderBy: { order: "asc" },
    select: { code: true, label: true },
  });
  return rows;
}

/**
 * Los bloques TAL Y COMO los verá el alumno. Se reutiliza el mapper del alumno
 * a propósito: si la previsualización usara su propia lógica, el profesor
 * podría estar viendo algo distinto de lo que se publica.
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
 * Partidas que el profesor puede referenciar en un bloque: las de sus propios
 * estudios y las de los alumnos con asignación activa. Devuelve sólo id y
 * etiqueta — los PGN completos no viajan a un selector (se piden uno a uno con
 * `getPgnForReference` cuando hace falta previsualizar).
 */
export async function listReferenceableGames(): Promise<ReferenceableGameGroup[]> {
  const { teacher, user } = await requireTeacher();

  const databases = await getPlatformDb().gameDatabase.findMany({
    where: {
      OR: [
        { userId: user.id },
        { user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } } },
      ],
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
      ownerLabel: database.userId === user.id ? "Mis estudios" : (database.user?.displayName ?? "Alumno"),
      studyName: database.name,
      games: database.games.map((game) => ({ id: game.id, label: `${game.white} – ${game.black}` })),
    }));
}

/**
 * Lecciones referenciables: sólo de cursos PUBLICADOS, porque el bloque le
 * ofrece al alumno un enlace para abrir la lección y en un curso en borrador
 * ese enlace no lleva a ninguna parte.
 */
export async function listPublishedLessons(): Promise<LessonRefOption[]> {
  await requireTeacher();

  const lessons = await getPlatformDb().lesson.findMany({
    where: { chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } } },
    select: {
      id: true,
      name: true,
      chapter: { select: { name: true, order: true, course: { select: { name: true } } } },
      order: true,
    },
    orderBy: [{ chapter: { course: { name: "asc" } } }, { chapter: { order: "asc" } }, { order: "asc" }],
  });

  return lessons.map((lesson) => ({
    id: lesson.id,
    label: `${lesson.chapter.course.name} › ${lesson.chapter.name} › ${lesson.name}`,
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
 * PGN de un recurso para el selector de posición del editor de bloques.
 * Autoriza igual que el alta del bloque: partida propia o de alumno asignado
 * activo, lección de curso publicado.
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
    select: { pgn: true },
  });
  return lesson?.pgn ?? null;
}
