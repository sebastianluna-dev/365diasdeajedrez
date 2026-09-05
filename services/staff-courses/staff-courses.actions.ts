"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import {
  AUTHOR_ROLE,
  COURSE_STATUS,
  COURSE_TYPE,
} from "@/constants/platform/course-codes.const";
import { CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { syncLessonTrainingExercise } from "@/services/shared/lesson-training.service";
import { numericId } from "@/lib/numeric-id";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readBoolean, readClampedInt, readOptionalText, readText, readUrl } from "@/services/shared/form-data";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_SOURCE } from "@/constants/platform/study-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import {
  lessonHasContent,
  lessonPgnOf,
  lessonPgnSelect,
  lessonStartFenOf,
} from "@/services/shared/lesson-pgn";
import { parseImportedGames } from "@/services/shared/pgn-import";
import {
  nextOrder,
  planDenseRenumber,
  planFullReorder,
  planSwap,
  type MoveDirection,
} from "@/services/shared/reorder";

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
  if (!(await allowAction(`${staff.user.id}:course-create`, 20, 3_600_000))) fail(staffRoutes.newCourse, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:course-update`, 60, 60_000))) fail(detailPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:course-publish`, 60, 60_000))) fail(detailPath, "throttled");

  const db = getPlatformDb();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { publishedAt: true, chapters: { select: { lessons: { select: lessonPgnSelect } } } },
  });
  if (!course) fail(detailPath, "courseMissing");

  // Mínimo publicable: un capítulo con una lección con PGN. Sin esto el alumno
  // se encontraría un curso con lecciones en blanco.
  const hasContent = course.chapters.some((chapter) => chapter.lessons.some(lessonHasContent));
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
  if (!(await allowAction(`${staff.user.id}:course-archive`, 60, 60_000))) fail(detailPath, "throttled");

  await getPlatformDb().course.update({
    where: { id: courseId },
    data: { status: { connect: { code: COURSE_STATUS.ARCHIVED } } },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
  revalidatePath(platformRoutes.courses);
}

/**
 * La derivación falló al marcar la lección como entrenable.
 *
 * Se lanza para abortar la transacción —`fail` redirige y no serviría dentro de
 * ella— y se traduce a un mensaje concreto al salir.
 */
class TrainingSyncError extends Error {
  constructor(readonly errorCode: string) {
    super(errorCode);
  }
}

// --- Colección de partidas de un capítulo ---------------------------------
//
// Las partidas viven en el CAPÍTULO: cada uno junta las que usan sus lecciones,
// y una lección referencia la que le toca (`setLessonGame`). Corregir la
// partida arregla de una vez todas las lecciones que la usan. Éste es el único
// sitio donde se pega un PGN; en la lección sólo se elige.
//
// La ficha del curso las lista todas juntas, pero no se importa desde ahí: una
// partida sin capítulo no tendría colección a la que ir.

/**
 * La colección del capítulo, creándola la primera vez.
 *
 * No se crea con el capítulo porque la mayoría empiezan sin ninguna partida y
 * una base vacía por capítulo sería ruido. Aparece cuando hace falta, que es al
 * importar la primera.
 */
async function chapterGamesDatabase(
  tx: Prisma.TransactionClient,
  chapter: { id: string; name: string; courseId: string },
) {
  const existing = await tx.gameDatabase.findUnique({
    where: { chapterId: chapter.id },
    select: { id: true },
  });
  if (existing) return existing;

  return tx.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.COURSE } },
      course: { connect: { id: chapter.courseId } },
      chapter: { connect: { id: chapter.id } },
      kind: { connect: { code: DATABASE_KIND.COLLECTION } },
      name: `Partidas de ${chapter.name}`,
      description: "Las partidas que usan las lecciones de este capítulo.",
    },
    select: { id: true },
  });
}

/** Importa a la colección del capítulo una o varias partidas de un PGN pegado. */
export async function importChapterGames(
  courseId: string,
  chapterId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  // El formulario vive en la pestaña de partidas, así que los avisos vuelven
  // ahí y no a la ficha del capítulo.
  const chapterPath = staffRoutes.chapterGames(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:chapter-games-import`, 20, 60_000))) fail(chapterPath, "throttled");

  const pgnText = readText(formData, "pgn");
  if (pgnText.length === 0 || pgnText.length > PGN_MAX_LENGTH) fail(chapterPath, "pgnTooLong");

  const games = parseImportedGames(pgnText);
  if (games.length === 0) fail(chapterPath, "pgn");

  const db = getPlatformDb();
  // El capítulo tiene que ser de este curso: el id llega de la URL.
  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { id: true, name: true, courseId: true },
  });
  if (!chapter) fail(chapterPath, "courseMissing");

  // El índice de posiciones se escribe DENTRO de la misma transacción: una
  // partida guardada sin indexar sería invisible para el buscador por posición
  // y nadie se enteraría hasta buscarla.
  await db.$transaction(async (tx) => {
    const database = await chapterGamesDatabase(tx, chapter);
    const last = await tx.game.aggregate({ where: { databaseId: database.id }, _max: { order: true } });
    let order = (last._max.order ?? 0) + 1;

    for (const game of games) {
      const created = await tx.game.create({
        data: {
          database: { connect: { id: database.id } },
          order: order++,
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          whiteTitle: game.whiteTitle,
          blackTitle: game.blackTitle,
          whiteCountry: game.whiteCountry,
          blackCountry: game.blackCountry,
          result: { connect: { code: game.resultCode } },
          playedAt: game.playedAt,
          event: game.event,
          site: game.site,
          round: game.round,
          eco: game.eco,
          initialFen: game.initialFen,
          pgn: game.pgn,
          source: { connect: { code: GAME_SOURCE.PGN_IMPORT } },
          isOwnGame: false,
        },
        select: { id: true },
      });
      await indexGamePositions(tx, { gameId: created.id, databaseId: database.id, pgn: game.pgn });
    }
  });

  revalidatePath(chapterPath);
  // La pestaña de la ficha enseña el número, y la del curso la lista entera.
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
  revalidatePath(staffRoutes.courseDetail(courseId));
  revalidatePath(staffRoutes.courseGames(courseId));
}

/**
 * Quita una partida de la colección del capítulo.
 *
 * Sólo si NINGUNA lección la usa: borrarla dejaría esas lecciones sin
 * contenido —la clave ajena es `SET NULL`, así que no fallaría, se vaciarían en
 * silencio, que es peor—.
 */
export async function deleteChapterGame(
  courseId: string,
  chapterId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterGames(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:chapter-games-delete`, 60, 60_000))) fail(chapterPath, "throttled");

  const gameId = readText(formData, "gameId");
  const db = getPlatformDb();

  const game = await db.game.findFirst({
    where: { id: gameId, database: { chapterId, courseId } },
    select: { id: true, _count: { select: { lessons: true } } },
  });
  if (!game) fail(chapterPath, "courseMissing");
  if (game._count.lessons > 0) fail(chapterPath, "gameInUse");

  await db.game.delete({ where: { id: game.id } });

  revalidatePath(chapterPath);
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
  revalidatePath(staffRoutes.courseDetail(courseId));
  revalidatePath(staffRoutes.courseGames(courseId));
}

// --- Capítulos ------------------------------------------------------------

export async function createChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:chapter-create`, 60, 60_000))) fail(detailPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:chapter-update`, 60, 60_000))) fail(chapterPath, "throttled");

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

/**
 * Recoloca los capítulos en el orden que llega del navegador (arrastrar).
 *
 * Llega la lista ENTERA, no un «sube uno»: arrastrar el quinto al primer sitio
 * corre los cuatro de en medio. `planFullReorder` es quien evita el choque con
 * el índice único `[courseId, order]` —media lista quiere el orden que la otra
 * media todavía ocupa— y quien descarta una lista que no sea exactamente la de
 * este curso, porque viene del cliente.
 *
 * No usa `fail()` con redirect como el resto: la llama una transición desde el
 * navegador, que ya tiene la lista pintada en su sitio. Si algo no cuadra, la
 * revalidación devuelve el orden bueno y la fila vuelve sola.
 */
export async function reorderChapters(courseId: string, orderedIds: string[]): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:chapter-move`, 120, 60_000))) return;

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const chapters = await tx.chapter.findMany({ where: { courseId }, select: { id: true, order: true } });
    for (const update of planFullReorder(chapters, orderedIds)) {
      await tx.chapter.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(staffRoutes.courseDetail(courseId));
}

/** Lo mismo para las lecciones de un capítulo; ver `reorderChapters`. */
export async function reorderLessons(courseId: string, chapterId: string, orderedIds: string[]): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:lesson-move`, 120, 60_000))) return;

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    // El capítulo tiene que ser de este curso: el id llega del cliente y sin
    // esto se podrían reordenar las lecciones de otro.
    const chapter = await tx.chapter.findFirst({ where: { id: chapterId, courseId }, select: { id: true } });
    if (!chapter) return;

    const lessons = await tx.lesson.findMany({ where: { chapterId }, select: { id: true, order: true } });
    for (const update of planFullReorder(lessons, orderedIds)) {
      await tx.lesson.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
}

/**
 * Borra un capítulo SÓLO si el curso está en borrador y nadie tiene progreso
 * sobre él. En cualquier otro caso el historial de progreso manda: se archiva
 * el curso, no se desmonta.
 */
export async function deleteChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:chapter-delete`, 60, 60_000))) fail(detailPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:lesson-create`, 60, 60_000))) fail(chapterPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:lesson-update`, 60, 60_000))) fail(lessonPath, "throttled");

  const name = readText(formData, "name").slice(0, NAME_MAX_LENGTH);
  const orientationCode = readText(formData, "orientationCode");

  if (name.length === 0 || !(CONTENT_ORIENTATIONS as readonly string[]).includes(orientationCode)) {
    fail(lessonPath, "invalid");
  }

  const topicIds = formData
    .getAll("topicIds")
    .filter((value): value is string => typeof value === "string")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value));

  const isTrainable = readBoolean(formData, "isTrainable");
  // Vacío = «el que mueva primero». Cualquier otra cosa que no sea del catálogo
  // de contenido se trata igual, para no guardar un bando inventado.
  const trainingColorInput = readText(formData, "trainingColorCode");
  const trainingColor = (CONTENT_ORIENTATIONS as readonly string[]).includes(trainingColorInput)
    ? (trainingColorInput as "WHITE" | "BLACK")
    : null;

  const db = getPlatformDb();
  // Con `lessonPgnSelect`: el ejercicio derivado se entrena contra el contenido
  // que ve el alumno, que puede venir de la partida vinculada y no de `pgn`.
  const current = await db.lesson.findFirst({
    where: { id: lessonId, chapterId },
    select: { id: true, ...lessonPgnSelect },
  });
  if (!current) fail(lessonPath, "courseMissing");
  const lesson = current;

  try {
    await db.$transaction(async (tx) => {
    await tx.lesson.update({
      where: { id: lesson.id },
      data: {
        name,
        description: readOptionalText(formData, "description", DESCRIPTION_MAX_LENGTH),
        isPriority: readBoolean(formData, "isPriority"),
        estimatedDuration: readClampedInt(formData, "estimatedDuration", 0, DURATION_MAX),
        orientation: { connect: { code: orientationCode } },
        isTrainable,
        trainingColor: trainingColor ? { connect: { code: trainingColor } } : { disconnect: true },
      },
    });

    // El ejercicio derivado se mantiene aquí, dentro de la misma transacción:
    // marcar la lección como entrenable y no dejarle línea que entrenar sería
    // un estado a medias.
    const sync = await syncLessonTrainingExercise(tx, {
      lessonId: lesson.id,
      pgn: lessonPgnOf(current),
      isTrainable,
      trainingColor,
    });
    if (isTrainable && !sync.ok) throw new TrainingSyncError(sync.reason);

    await tx.lessonTopic.deleteMany({ where: { lessonId: lesson.id } });
    for (const topicId of topicIds) {
      const topic = await tx.topic.findUnique({ where: { id: topicId }, select: { id: true } });
      if (topic) await tx.lessonTopic.create({ data: { lessonId: lesson.id, topicId: topic.id } });
    }
    });
  } catch (error) {
    if (error instanceof TrainingSyncError) fail(lessonPath, error.errorCode);
    throw error;
  }

  revalidatePath(lessonPath);
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
}

/**
 * Vincula la lección a una partida de la colección del curso, o la desvincula.
 *
 * A partir de aquí el contenido de la lección ES el de esa partida
 * (`lessonPgnOf`), así que corregirla arregla todas las lecciones que la usan.
 * El `pgn` propio NO se borra: queda dormido y vuelve al desvincular, que es lo
 * que hace que vincular no sea una decisión irreversible.
 *
 * La partida tiene que ser de la colección de ESTE curso. El id llega del
 * navegador y sin la comprobación se podría enganchar la partida de cualquier
 * otro, incluida la base privada de un alumno.
 *
 * Al cambiar el contenido cambia también la línea que se entrena, así que el
 * ejercicio derivado se rehace en la misma transacción y se sella
 * `pgnUpdatedAt`: es lo que marca como desactualizados los ejercicios que se
 * congelaron contra el contenido anterior.
 */
export async function setLessonGame(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!(await allowAction(`${staff.user.id}:lesson-game`, 60, 60_000))) fail(lessonPath, "throttled");

  const gameId = readText(formData, "gameId");
  const db = getPlatformDb();

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, chapterId, chapter: { courseId } },
    select: { id: true, pgn: true, isTrainable: true, trainingColor: { select: { code: true } } },
  });
  if (!lesson) fail(lessonPath, "courseMissing");

  // Vacío = desvincular; entonces vuelve a mandar el PGN propio de la lección.
  let nextPgn = lesson.pgn;
  if (gameId.length > 0) {
    const game = await db.game.findFirst({
      where: { id: gameId, database: { courseId } },
      select: { id: true, pgn: true },
    });
    if (!game) fail(lessonPath, "courseMissing");
    nextPgn = game.pgn;
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.lesson.update({
        where: { id: lesson.id },
        data: {
          game: gameId.length > 0 ? { connect: { id: gameId } } : { disconnect: true },
          pgnUpdatedAt: new Date(),
        },
      });

      const sync = await syncLessonTrainingExercise(tx, {
        lessonId: lesson.id,
        pgn: nextPgn,
        isTrainable: lesson.isTrainable,
        trainingColor: (lesson.trainingColor?.code as "WHITE" | "BLACK" | undefined) ?? null,
      });
      if (lesson.isTrainable && !sync.ok) throw new TrainingSyncError(sync.reason);
    });
  } catch (error) {
    if (error instanceof TrainingSyncError) fail(lessonPath, error.errorCode);
    throw error;
  }

  revalidatePath(lessonPath);
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
  revalidatePath(platformRoutes.lessonDetail(lessonId));
}

/** Misma regla que el capítulo: sólo en borrador y sin progreso de nadie. */
export async function deleteLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:lesson-delete`, 60, 60_000))) fail(chapterPath, "throttled");

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
 * Deriva la copia congelada con el MISMO módulo que usa el seed, sobre la
 * posición desde la que arranca el CONTENIDO EFECTIVO de la lección —el de su
 * partida vinculada, si la tiene—.
 *
 * Antes salía de `Lesson.initialFen`, que era una segunda copia del mismo dato
 * y quedó desalineada al vincular partidas: congelaba las jugadas contra un
 * tablero que el alumno no llega a ver. Ahora sale del PGN, como en
 * `syncLessonTrainingExercise`.
 *
 * Si alguna jugada es ilegal se aborta sin escribir: es mejor rechazar aquí que
 * dejar un ejercicio que el entrenador no puede reproducir.
 */
async function deriveForLesson(lessonId: string, input: ExerciseInput, failPath: string) {
  const lesson = await getPlatformDb().lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, ...lessonPgnSelect },
  });
  if (!lesson) fail(failPath, "courseMissing");

  try {
    return deriveExerciseData({
      initialFen: lessonStartFenOf(lesson),
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
  if (!(await allowAction(`${staff.user.id}:exercise-create`, 60, 60_000))) fail(lessonPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:exercise-update`, 60, 60_000))) fail(lessonPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:exercise-delete`, 60, 60_000))) fail(lessonPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:exercise-move`, 120, 60_000))) fail(lessonPath, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:author-create`, 20, 3_600_000))) fail(staffRoutes.authors, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:author-update`, 60, 60_000))) fail(staffRoutes.authors, "throttled");

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
  if (!(await allowAction(`${staff.user.id}:course-authors`, 60, 60_000))) fail(detailPath, "throttled");

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
