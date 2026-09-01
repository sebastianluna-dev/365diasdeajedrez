"use server";

import { parseFen } from "chessops/fen";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import {
  AUTHOR_ROLE,
  COURSE_STATUS,
  COURSE_TYPE,
  INITIAL_POSITION_TYPE,
  PRESENTATION_MODE,
} from "@/constants/platform/course-codes.const";
import { CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { numericId } from "@/lib/numeric-id";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readBoolean, readClampedInt, readOptionalText, readText, readUrl } from "@/services/shared/form-data";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { nextOrder, planDenseRenumber, planSwap, type MoveDirection } from "@/services/shared/reorder";

// Editor de cursos. Reglas que no se negocian:
// - Toda action abre con requireStaff() (son alcanzables por POST directo).
// - Los catálogos se conectan por `code`, jamás por id.
// - No se borra estructura con historial: capítulos y lecciones sólo se pueden
//   borrar en un curso en BORRADOR y sin progreso de ningún alumno. Un curso
//   publicado se archiva, no se desmonta.
// - Reordenar pasa siempre por services/shared/reorder.ts (índice único
//   compuesto: un intercambio directo lanza P2002).

const NAME_MAX_LENGTH = 160;
const SLUG_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 1000;
const PROMPT_MAX_LENGTH = 500;
const DURATION_MAX = 100_000;
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(path: string, code: string): never {
  redirect(`${path}?error=${code}`);
}

function isCode(value: string, catalog: Record<string, string>): boolean {
  return (Object.values(catalog) as string[]).includes(value);
}

/** Jugadas SAN separadas por espacios, como en `prisma/seed-data.ts`. */
function readSans(formData: FormData, field: string): string[] {
  return readText(formData, field).split(/\s+/).filter(Boolean);
}

// --- Cursos ---------------------------------------------------------------

export async function createCourse(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!allowAction(`${staff.user.id}:course-create`, 20, 3_600_000)) fail(staffRoutes.newCourse, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const slug = readText(formData, "slug").toLowerCase().slice(0, SLUG_MAX_LENGTH);
  const typeCode = readText(formData, "typeCode");
  if (name.length === 0 || !SLUG_SHAPE.test(slug) || !isCode(typeCode, COURSE_TYPE)) {
    fail(staffRoutes.newCourse, "invalid");
  }

  let courseId: string;
  try {
    const created = await getPlatformDb().course.create({
      // Nace en BORRADOR: publicar es una decisión aparte y con requisitos.
      data: {
        // El id va en la URL del alumno, así que lo pone la aplicación. Un
        // choque entre dos números lo canta la clave primaria, y se ve como un
        // error de creación en vez de pisar un curso existente.
        id: numericId(),
        name,
        slug,
        type: { connect: { code: typeCode } },
        status: { connect: { code: COURSE_STATUS.DRAFT } },
      },
      select: { id: true },
    });
    courseId = created.id;
  } catch (error) {
    if (isUniqueConstraintError(error, "Course_slug_key", "slug")) fail(staffRoutes.newCourse, "courseSlug");
    throw error;
  }

  revalidatePath(staffRoutes.courses);
  redirect(staffRoutes.courseDetail(courseId));
}

export async function updateCourse(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:course-update`, 60, 60_000)) fail(detailPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const slug = readText(formData, "slug").toLowerCase().slice(0, SLUG_MAX_LENGTH);
  const typeCode = readText(formData, "typeCode");
  if (name.length === 0 || !SLUG_SHAPE.test(slug) || !isCode(typeCode, COURSE_TYPE)) fail(detailPath, "invalid");

  const coverRaw = readText(formData, "cover");
  const cover = coverRaw.length > 0 ? readUrl(formData, "cover") : null;
  if (coverRaw.length > 0 && cover === null) fail(detailPath, "invalid");

  const levelCodes = formData.getAll("levelCodes").filter((value): value is string => typeof value === "string");
  const db = getPlatformDb();

  try {
    await db.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: courseId },
        data: {
          name,
          slug,
          description: readOptionalText(formData, "description", DESCRIPTION_MAX_LENGTH),
          cover,
          type: { connect: { code: typeCode } },
        },
      });

      // Los niveles son una lista de casillas: se reemplaza el conjunto entero
      // en la misma transacción para no dejar un estado a medias.
      await tx.courseLevel.deleteMany({ where: { courseId } });
      for (const code of levelCodes) {
        const level = await tx.level.findUnique({ where: { code }, select: { id: true } });
        if (level) await tx.courseLevel.create({ data: { courseId, levelId: level.id } });
      }
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "Course_slug_key", "slug")) fail(detailPath, "courseSlug");
    throw error;
  }

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
}

export async function publishCourse(courseId: string): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:course-publish`, 60, 60_000)) fail(detailPath, "throttled");

  const db = getPlatformDb();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { publishedAt: true, chapters: { select: { lessons: { select: { pgn: true } } } } },
  });
  if (!course) fail(detailPath, "courseMissing");

  // Mínimo publicable: un capítulo con una lección con PGN. Sin esto el alumno
  // se encontraría un curso con lecciones en blanco.
  const hasContent = course.chapters.some((chapter) => chapter.lessons.some((lesson) => lesson.pgn.trim().length > 0));
  if (!hasContent) fail(detailPath, "publishRequirements");

  await db.course.update({
    where: { id: courseId },
    data: {
      status: { connect: { code: COURSE_STATUS.PUBLISHED } },
      // publishedAt se sella la primera vez y no se reescribe: es la fecha de
      // publicación, no la del último cambio de estado.
      publishedAt: course.publishedAt ?? new Date(),
    },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
  revalidatePath(platformRoutes.courses);
}

/** Archivar es la baja de un curso: deja de listarse, pero nada se borra. */
export async function archiveCourse(courseId: string): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:course-archive`, 60, 60_000)) fail(detailPath, "throttled");

  await getPlatformDb().course.update({
    where: { id: courseId },
    data: { status: { connect: { code: COURSE_STATUS.ARCHIVED } } },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
  revalidatePath(platformRoutes.courses);
}

// --- Capítulos ------------------------------------------------------------

export async function createChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:chapter-create`, 60, 60_000)) fail(detailPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  if (name.length === 0) fail(detailPath, "invalid");

  const db = getPlatformDb();
  const count = await db.chapter.count({ where: { courseId } });
  await db.chapter.create({ data: { courseId, name, order: nextOrder(count) } });

  revalidatePath(detailPath);
}

export async function updateChapter(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!allowAction(`${staff.user.id}:chapter-update`, 60, 60_000)) fail(chapterPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  if (name.length === 0) fail(chapterPath, "invalid");

  const updated = await getPlatformDb().chapter.updateMany({
    where: { id: chapterId, courseId },
    data: {
      name,
      description: readOptionalText(formData, "description", DESCRIPTION_MAX_LENGTH),
      estimatedDuration: readClampedInt(formData, "estimatedDuration", 0, DURATION_MAX),
    },
  });
  if (updated.count === 0) fail(chapterPath, "courseMissing");

  revalidatePath(chapterPath);
  revalidatePath(staffRoutes.courseDetail(courseId));
}

export async function moveChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:chapter-move`, 120, 60_000)) fail(detailPath, "throttled");

  const chapterId = readText(formData, "chapterId");
  const direction = readText(formData, "direction");
  if (direction !== "up" && direction !== "down") fail(detailPath, "order");

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const chapters = await tx.chapter.findMany({ where: { courseId }, select: { id: true, order: true } });
    for (const update of planSwap(chapters, chapterId, direction as MoveDirection)) {
      await tx.chapter.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(detailPath);
}

/**
 * Borra un capítulo SÓLO si el curso está en borrador y nadie tiene progreso
 * sobre él. En cualquier otro caso el historial de progreso manda: se archiva
 * el curso, no se desmonta.
 */
export async function deleteChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:chapter-delete`, 60, 60_000)) fail(detailPath, "throttled");

  const chapterId = readText(formData, "chapterId");
  const db = getPlatformDb();

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId, course: { status: { code: COURSE_STATUS.DRAFT } } },
    select: {
      id: true,
      _count: { select: { progresses: true } },
      lessons: { select: { _count: { select: { progresses: true } } } },
    },
  });
  const hasProgress =
    chapter !== null &&
    (chapter._count.progresses > 0 || chapter.lessons.some((lesson) => lesson._count.progresses > 0));
  if (!chapter || hasProgress) fail(detailPath, "deleteBlocked");

  await db.$transaction(async (tx) => {
    await tx.chapter.delete({ where: { id: chapter.id } });
    const remaining = await tx.chapter.findMany({ where: { courseId }, select: { id: true, order: true } });
    for (const update of planDenseRenumber(remaining)) {
      await tx.chapter.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(detailPath);
}

// --- Lecciones ------------------------------------------------------------

export async function createLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!allowAction(`${staff.user.id}:lesson-create`, 60, 60_000)) fail(chapterPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  if (name.length === 0) fail(chapterPath, "invalid");

  const db = getPlatformDb();
  const chapter = await db.chapter.findFirst({ where: { id: chapterId, courseId }, select: { id: true } });
  if (!chapter) fail(chapterPath, "courseMissing");

  const count = await db.lesson.count({ where: { chapterId } });
  // Valores de arranque razonables: el resto se edita dentro de la lección.
  await db.lesson.create({
    data: {
      id: numericId(),
      chapter: { connect: { id: chapter.id } },
      name,
      order: nextOrder(count),
      presentationMode: { connect: { code: PRESENTATION_MODE.MOVE_SEQUENCE } },
      initialPositionType: { connect: { code: INITIAL_POSITION_TYPE.STARTING_POSITION } },
      orientation: { connect: { code: CONTENT_ORIENTATIONS[0] } },
      pgn: "",
    },
  });

  revalidatePath(chapterPath);
}

export async function updateLesson(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:lesson-update`, 60, 60_000)) fail(lessonPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const presentationModeCode = readText(formData, "presentationModeCode");
  const initialPositionTypeCode = readText(formData, "initialPositionTypeCode");
  const orientationCode = readText(formData, "orientationCode");

  if (
    name.length === 0 ||
    !isCode(presentationModeCode, PRESENTATION_MODE) ||
    !isCode(initialPositionTypeCode, INITIAL_POSITION_TYPE) ||
    !(CONTENT_ORIENTATIONS as readonly string[]).includes(orientationCode)
  ) {
    fail(lessonPath, "invalid");
  }

  // Coherencia documentada en el schema: initialFen sólo cuando el tipo es FEN,
  // y obligatorio en ese caso.
  const initialFenRaw = readText(formData, "initialFen");
  const usesFen = initialPositionTypeCode === INITIAL_POSITION_TYPE.FEN;
  if (usesFen && (initialFenRaw.length === 0 || parseFen(initialFenRaw).isErr)) fail(lessonPath, "fen");
  const initialFen = usesFen ? initialFenRaw : null;

  const topicIds = formData
    .getAll("topicIds")
    .filter((value): value is string => typeof value === "string")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value));

  const db = getPlatformDb();
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, chapterId }, select: { id: true } });
  if (!lesson) fail(lessonPath, "courseMissing");

  await db.$transaction(async (tx) => {
    await tx.lesson.update({
      where: { id: lesson.id },
      data: {
        name,
        description: readOptionalText(formData, "description", DESCRIPTION_MAX_LENGTH),
        isPriority: readBoolean(formData, "isPriority"),
        estimatedDuration: readClampedInt(formData, "estimatedDuration", 0, DURATION_MAX),
        presentationMode: { connect: { code: presentationModeCode } },
        initialPositionType: { connect: { code: initialPositionTypeCode } },
        initialFen,
        orientation: { connect: { code: orientationCode } },
      },
    });

    await tx.lessonTopic.deleteMany({ where: { lessonId: lesson.id } });
    for (const topicId of topicIds) {
      const topic = await tx.topic.findUnique({ where: { id: topicId }, select: { id: true } });
      if (topic) await tx.lessonTopic.create({ data: { lessonId: lesson.id, topicId: topic.id } });
    }
  });

  revalidatePath(lessonPath);
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
}

/**
 * Guarda el PGN de la lección. El servidor SIEMPRE re-valida (la
 * previsualización del editor es una comodidad, no una garantía) y sella
 * `pgnUpdatedAt`: eso es lo que marca como desactualizados los ejercicios
 * congelados antes del cambio.
 */
export async function updateLessonPgn(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:lesson-pgn`, 60, 60_000)) fail(lessonPath, "throttled");

  const pgn = readText(formData, "pgn");
  if (pgn.length > PGN_MAX_LENGTH) fail(lessonPath, "pgnTooLong");
  if (pgn.length > 0 && parsePgnTree(pgn) === null) fail(lessonPath, "pgn");

  const db = getPlatformDb();
  const updated = await db.lesson.updateMany({
    where: { id: lessonId, chapterId },
    data: { pgn, pgnUpdatedAt: new Date() },
  });
  if (updated.count === 0) fail(lessonPath, "courseMissing");

  revalidatePath(lessonPath);

  // La lección se direcciona sola en la zona del alumno, así que aquí ya no
  // hace falta resolver curso ni capítulo para revalidar su página.
  revalidatePath(platformRoutes.lessonDetail(lessonId));
}

export async function moveLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!allowAction(`${staff.user.id}:lesson-move`, 120, 60_000)) fail(chapterPath, "throttled");

  const lessonId = readText(formData, "lessonId");
  const direction = readText(formData, "direction");
  if (direction !== "up" && direction !== "down") fail(chapterPath, "order");

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const lessons = await tx.lesson.findMany({ where: { chapterId }, select: { id: true, order: true } });
    for (const update of planSwap(lessons, lessonId, direction as MoveDirection)) {
      await tx.lesson.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(chapterPath);
}

/** Misma regla que el capítulo: sólo en borrador y sin progreso de nadie. */
export async function deleteLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!allowAction(`${staff.user.id}:lesson-delete`, 60, 60_000)) fail(chapterPath, "throttled");

  const lessonId = readText(formData, "lessonId");
  const db = getPlatformDb();

  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      chapterId,
      chapter: { courseId, course: { status: { code: COURSE_STATUS.DRAFT } } },
    },
    select: { id: true, _count: { select: { progresses: true } } },
  });
  if (!lesson || lesson._count.progresses > 0) fail(chapterPath, "deleteBlocked");

  await db.$transaction(async (tx) => {
    await tx.lesson.delete({ where: { id: lesson.id } });
    const remaining = await tx.lesson.findMany({ where: { chapterId }, select: { id: true, order: true } });
    for (const update of planDenseRenumber(remaining)) {
      await tx.lesson.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(chapterPath);
}

// --- Ejercicios -----------------------------------------------------------

interface ExerciseInput {
  modeCode: string;
  promptText: string | null;
  afterSans: string[];
  lineSans: string[];
}

function readExerciseInput(formData: FormData, failPath: string): ExerciseInput {
  const modeCode = readText(formData, "modeCode");
  if (!isCode(modeCode, EXERCISE_MODE)) fail(failPath, "invalid");

  const lineSans = readSans(formData, "lineSans");
  if (lineSans.length === 0) fail(failPath, "sans");

  return {
    modeCode,
    promptText: readOptionalText(formData, "promptText", PROMPT_MAX_LENGTH),
    // Jugadas previas hasta el punto de arranque; vacío = desde la posición
    // inicial de la lección. Mismo formato SAN separado por espacios que el seed.
    afterSans: readSans(formData, "afterSans"),
    lineSans,
  };
}

/**
 * Deriva la copia congelada con el MISMO módulo que usa el seed, sobre el
 * `initialFen` actual de la lección. Si alguna jugada es ilegal se aborta sin
 * escribir: es mejor rechazar aquí que dejar un ejercicio que el entrenador no
 * puede reproducir.
 */
async function deriveForLesson(lessonId: string, input: ExerciseInput, failPath: string) {
  const lesson = await getPlatformDb().lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, initialFen: true },
  });
  if (!lesson) fail(failPath, "courseMissing");

  try {
    return deriveExerciseData({
      initialFen: lesson.initialFen,
      afterSans: input.afterSans,
      lineSans: input.lineSans,
    });
  } catch {
    fail(failPath, "sans");
  }
}

export async function createExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:exercise-create`, 60, 60_000)) fail(lessonPath, "throttled");

  const input = readExerciseInput(formData, lessonPath);
  const derived = await deriveForLesson(lessonId, input, lessonPath);

  const db = getPlatformDb();
  const count = await db.trainingExercise.count({ where: { lessonId } });

  await db.trainingExercise.create({
    data: {
      lesson: { connect: { id: lessonId } },
      order: nextOrder(count),
      mode: { connect: { code: input.modeCode } },
      promptText: input.promptText,
      ...derived,
      // Congelado ahora: nace al día con el PGN actual, no desactualizado.
      frozenAt: new Date(),
    },
  });

  revalidatePath(lessonPath);
}

export async function updateExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:exercise-update`, 60, 60_000)) fail(lessonPath, "throttled");

  const input = readExerciseInput(formData, lessonPath);
  const derived = await deriveForLesson(lessonId, input, lessonPath);

  const db = getPlatformDb();
  const exercise = await db.trainingExercise.findFirst({ where: { id: exerciseId, lessonId }, select: { id: true } });
  if (!exercise) fail(lessonPath, "courseMissing");

  await db.trainingExercise.update({
    where: { id: exercise.id },
    data: {
      mode: { connect: { code: input.modeCode } },
      promptText: input.promptText,
      ...derived,
      frozenAt: new Date(),
    },
  });

  revalidatePath(lessonPath);
}

/**
 * Vuelve a congelar un ejercicio desactualizado contra el PGN actual. Pide las
 * jugadas otra vez porque `afterSans` no se puede reconstruir con fiabilidad a
 * partir de lo guardado (sólo se conserva la posición congelada, no el camino).
 */
export async function refreezeExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  return updateExercise(courseId, chapterId, lessonId, exerciseId, formData);
}

export async function deleteExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:exercise-delete`, 60, 60_000)) fail(lessonPath, "throttled");

  const exerciseId = readText(formData, "exerciseId");
  const db = getPlatformDb();

  await db.$transaction(async (tx) => {
    const deleted = await tx.trainingExercise.deleteMany({ where: { id: exerciseId, lessonId } });
    if (deleted.count === 0) return;

    const remaining = await tx.trainingExercise.findMany({ where: { lessonId }, select: { id: true, order: true } });
    for (const update of planDenseRenumber(remaining)) {
      await tx.trainingExercise.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(lessonPath);
}

export async function moveExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!allowAction(`${staff.user.id}:exercise-move`, 120, 60_000)) fail(lessonPath, "throttled");

  const exerciseId = readText(formData, "exerciseId");
  const direction = readText(formData, "direction");
  if (direction !== "up" && direction !== "down") fail(lessonPath, "order");

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const exercises = await tx.trainingExercise.findMany({ where: { lessonId }, select: { id: true, order: true } });
    for (const update of planSwap(exercises, exerciseId, direction as MoveDirection)) {
      await tx.trainingExercise.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(lessonPath);
}

// --- Autores --------------------------------------------------------------
// Author es el ÚNICO catálogo con CRUD: es contenido editorial, no un dominio
// restringido cuyo código compare la lógica.

export async function createAuthor(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!allowAction(`${staff.user.id}:author-create`, 20, 3_600_000)) fail(staffRoutes.authors, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const slug = readText(formData, "slug").toLowerCase().slice(0, SLUG_MAX_LENGTH);
  if (name.length === 0 || !SLUG_SHAPE.test(slug)) fail(staffRoutes.authors, "invalid");

  const photoRaw = readText(formData, "photo");
  const photo = photoRaw.length > 0 ? readUrl(formData, "photo") : null;
  if (photoRaw.length > 0 && photo === null) fail(staffRoutes.authors, "invalid");

  try {
    await getPlatformDb().author.create({
      data: { name, slug, bio: readOptionalText(formData, "bio", DESCRIPTION_MAX_LENGTH), photo },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "Author_slug_key", "slug")) fail(staffRoutes.authors, "courseSlug");
    throw error;
  }

  revalidatePath(staffRoutes.authors);
}

export async function updateAuthor(authorId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!allowAction(`${staff.user.id}:author-update`, 60, 60_000)) fail(staffRoutes.authors, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const slug = readText(formData, "slug").toLowerCase().slice(0, SLUG_MAX_LENGTH);
  if (name.length === 0 || !SLUG_SHAPE.test(slug)) fail(staffRoutes.authors, "invalid");

  const photoRaw = readText(formData, "photo");
  const photo = photoRaw.length > 0 ? readUrl(formData, "photo") : null;
  if (photoRaw.length > 0 && photo === null) fail(staffRoutes.authors, "invalid");

  try {
    await getPlatformDb().author.update({
      where: { id: authorId },
      data: { name, slug, bio: readOptionalText(formData, "bio", DESCRIPTION_MAX_LENGTH), photo },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "Author_slug_key", "slug")) fail(staffRoutes.authors, "courseSlug");
    throw error;
  }

  revalidatePath(staffRoutes.authors);
}

/** Añade, quita o reordena los autores de un curso según la operación pedida. */
export async function manageCourseAuthors(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!allowAction(`${staff.user.id}:course-authors`, 60, 60_000)) fail(detailPath, "throttled");

  const operation = readText(formData, "operation");
  const authorId = readText(formData, "authorId");
  const db = getPlatformDb();

  if (operation === "add") {
    const roleCode = readText(formData, "roleCode");
    if (!isCode(roleCode, AUTHOR_ROLE)) fail(detailPath, "invalid");

    const author = await db.author.findUnique({ where: { id: authorId }, select: { id: true } });
    if (!author) fail(detailPath, "invalid");

    const count = await db.courseAuthor.count({ where: { courseId } });
    await db.courseAuthor.upsert({
      where: { courseId_authorId: { courseId, authorId: author.id } },
      update: { role: { connect: { code: roleCode } } },
      create: {
        course: { connect: { id: courseId } },
        author: { connect: { id: author.id } },
        role: { connect: { code: roleCode } },
        order: nextOrder(count) - 1,
      },
    });
  } else if (operation === "remove") {
    await db.courseAuthor.deleteMany({ where: { courseId, authorId } });
  } else if (operation === "up" || operation === "down") {
    // CourseAuthor no tiene id propio (PK compuesta): se usa el authorId como
    // identidad para el plan de reordenación.
    await db.$transaction(async (tx) => {
      const rows = await tx.courseAuthor.findMany({ where: { courseId }, select: { authorId: true, order: true } });
      const plan = planSwap(
        rows.map((row) => ({ id: row.authorId, order: row.order })),
        authorId,
        operation as MoveDirection,
      );
      for (const update of plan) {
        await tx.courseAuthor.update({
          where: { courseId_authorId: { courseId, authorId: update.id } },
          data: { order: update.order },
        });
      }
    });
  } else {
    fail(detailPath, "invalid");
  }

  revalidatePath(detailPath);
}
