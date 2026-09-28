"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PGN_IMPORT_TRANSACTION, PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import {
  AUTHOR_ROLE,
  CONTENT_TYPE_CODES,
  COURSE_STATUS,
  isContentRoleCode,
} from "@/constants/platform/course-codes.const";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { syncLessonTrainingExercise } from "@/services/shared/lesson-training.service";
import { numericId } from "@/lib/numeric-id";
import { isDisplayableImage } from "@/lib/remote-image";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { z } from "zod";
import {
  formCheckbox,
  formCodeList,
  formLenientInt,
  formOptionalText,
  formOptionalUrl,
  formSlugList,
  formText,
  parseForm,
  readIds,
} from "@/services/shared/form-schema";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { isReservedCourseSlug } from "@/services/courses/course-rules";
import { authorSlugFor } from "./author-rules";
import type { AuthorFormState } from "./staff-courses.types";
import type { ImageSaveResult } from "@/services/media/media.types";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_SOURCE } from "@/constants/platform/study-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { lessonHasContent, lessonPgnOf, lessonPgnSelect, lessonStartFenOf } from "@/services/shared/lesson-pgn";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import {
  GAME_FIELDS_SCHEMA,
  resultCodeOf,
  sameMoves,
  writeGameRecord,
  type AutosaveResult,
} from "@/services/shared/game-record";
import { parseImportedGames } from "@/services/shared/pgn-import";
import { nextOrder, planDenseRenumber, planFullReorder, planSwap, type MoveDirection } from "@/services/shared/reorder";

// Course editor. Rules that are not negotiable:
// - Every action opens with requireStaff() (they are reachable by direct POST).
// - Catalogs are connected by `code`, never by id.
// - Structure with history is not deleted: chapters and lessons can only be
//   deleted in a DRAFT course and without progress from any student. A published
//   course is archived, not dismantled.
// - Reordering always goes through services/shared/reorder.ts (composite unique
//   index: a direct swap throws P2002).

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

/** SAN moves separated by spaces, as in `prisma/seed-data.ts`. */
function formSans() {
  return z
    .string()
    .trim()
    .max(20_000)
    .optional()
    .transform((value) => (value ?? "").split(/\s+/).filter(Boolean));
}

// A slug is how the student reaches the course's information page
// (`/cursos/<slug>`), so one that page would never answer to is refused: the
// name of another page of `/cursos`, or eight digits, which are read as an id.
const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .max(SLUG_MAX_LENGTH)
  .regex(SLUG_SHAPE)
  .refine((slug) => !isReservedCourseSlug(slug));
const COURSE_SCHEMA = z.object({
  name: formText(NAME_MAX_LENGTH),
  slug: slugField,
  // At least one: a course that teaches nothing has no place in the catalog.
  contentTypeCodes: formCodeList(CONTENT_TYPE_CODES, 1),
});
const COURSE_UPDATE_SCHEMA = COURSE_SCHEMA.extend({
  description: formOptionalText(DESCRIPTION_MAX_LENGTH),
  // The levels go by slug and there is no list of them in the constants to
  // check against: the write skips the slugs the catalog does not have.
  levelSlugs: formSlugList(),
});

/** The failure code a bad course form answers with: the one field with words of its own, or the generic one. */
function courseFormError(field: string): string {
  return field === "contentTypeCodes" ? "contentTypeRequired" : "invalid";
}
const PGN_SCHEMA = z.object({ pgn: z.string().trim().min(1).max(PGN_MAX_LENGTH) });
const NAMED_SCHEMA = z.object({ name: formText(NAME_MAX_LENGTH), role: z.string().trim().max(32).optional() });
const CHAPTER_UPDATE_SCHEMA = z.object({
  name: formText(NAME_MAX_LENGTH),
  description: formOptionalText(DESCRIPTION_MAX_LENGTH),
  estimatedDuration: formLenientInt(0, DURATION_MAX),
});
const LESSON_UPDATE_SCHEMA = z.object({
  name: formText(NAME_MAX_LENGTH),
  orientationCode: formText(16).refine((value) => (CONTENT_ORIENTATIONS as readonly string[]).includes(value)),
  topicIds: z.array(z.string().trim()),
  isTrainable: formCheckbox(),
  // Empty = "whoever moves first". Anything else that is not from the content
  // catalog is treated the same, so as not to store a made-up side.
  trainingColorCode: z.string().trim().max(16).optional(),
  description: formOptionalText(DESCRIPTION_MAX_LENGTH),
  isPriority: formCheckbox(),
  estimatedDuration: formLenientInt(0, DURATION_MAX),
});
const EXERCISE_SCHEMA = z.object({
  modeCode: formText(32).refine((value) => isCode(value, EXERCISE_MODE)),
  lineSans: formSans().refine((sans) => sans.length > 0),
  // Previous moves up to the starting point; empty = from the lesson's initial
  // position. Same space-separated SAN format as the seed.
  afterSans: formSans(),
  promptText: formOptionalText(PROMPT_MAX_LENGTH),
});

// --- Courses --------------------------------------------------------------

// A failure goes back to the catalog, where the "Nuevo curso" dialog lives:
// there is no page of its own for creating a course.
export async function createCourse(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:course-create`, 20, 3_600_000))) fail(staffRoutes.courses, "throttled");

  const parsed = parseForm(COURSE_SCHEMA, formData);
  if (!parsed.ok) fail(staffRoutes.courses, courseFormError(parsed.field));
  const { name, slug, contentTypeCodes } = parsed.data;

  let courseId: string;
  try {
    const created = await getPlatformDb().course.create({
      // It is born as a DRAFT: publishing is a separate decision and has requirements.
      data: {
        // The id goes in the student's URL, so the application sets it. A clash between
        // two numbers is announced by the primary key, and is seen as a creation error
        // instead of overwriting an existing course.
        id: numericId(),
        name,
        slug,
        status: { connect: { code: COURSE_STATUS.DRAFT } },
        courseContentTypes: {
          create: [...new Set(contentTypeCodes)].map((code) => ({ contentType: { connect: { code } } })),
        },
      },
      select: { id: true },
    });
    courseId = created.id;
  } catch (error) {
    if (isUniqueConstraintError(error, "Course_slug_key", "slug")) fail(staffRoutes.courses, "courseSlug");
    throw error;
  }

  revalidatePath(staffRoutes.courses);
  redirect(staffRoutes.courseDetail(courseId));
}

export async function updateCourse(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:course-update`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(COURSE_UPDATE_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, courseFormError(parsed.field));
  const { name, slug, contentTypeCodes, description, levelSlugs } = parsed.data;
  const db = getPlatformDb();

  try {
    await db.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: courseId },
        // The cover is not here: it saves itself when it is uploaded
        // (`updateCourseCover`). A form that does not carry it must not erase it.
        data: { name, slug, description },
      });

      // Content types and levels are checkbox groups: each whole set is replaced
      // in the same transaction so as not to leave a halfway state.
      await syncCatalogJoin(tx.courseContentType, tx.contentType, {
        parent: { courseId },
        catalogColumn: "contentTypeId",
        codes: contentTypeCodes,
      });
      await syncCatalogJoin(tx.courseLevel, tx.level, {
        parent: { courseId },
        catalogColumn: "levelId",
        catalogKey: "slug",
        codes: levelSlugs,
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "Course_slug_key", "slug")) fail(detailPath, "courseSlug");
    throw error;
  }

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
  // The levels are read on the student's side too.
  revalidatePath(platformRoutes.courses);
  revalidatePath(platformRoutes.courseDetail(courseId));
}

const COVER_MAX_LENGTH = 2000;

/**
 * Stores the course's cover, or takes it away when the URL is empty. It is
 * what `ImageUpload` calls the moment an upload ends, so it answers instead of
 * redirecting: the card stays where it is and says how it went.
 *
 * Only an image `next/image` can render is accepted (`isDisplayableImage`):
 * one from another host does not degrade, it answers 400 and takes down every
 * page that shows the cover, the students' catalog included.
 */
export async function updateCourseCover(courseId: string, url: string): Promise<ImageSaveResult> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:course-cover`, 30, 60_000))) return { ok: false };

  const cover = url.trim();
  if (cover.length > COVER_MAX_LENGTH) return { ok: false };
  if (cover.length > 0 && !isDisplayableImage(cover)) return { ok: false };

  const db = getPlatformDb();
  const { count } = await db.course.updateMany({
    where: { id: courseId },
    data: { cover: cover.length > 0 ? cover : null },
  });
  if (count === 0) return { ok: false };

  revalidatePath(staffRoutes.courseDetail(courseId));
  revalidatePath(staffRoutes.courses);
  // The cover is what the student sees of a course before opening it.
  revalidatePath(platformRoutes.courses);
  revalidatePath(platformRoutes.courseDetail(courseId));
  return { ok: true };
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

  // Minimum publishable: a chapter with a lesson with a PGN. Without this the
  // student would find a course with blank lessons.
  const hasContent = course.chapters.some((chapter) => chapter.lessons.some(lessonHasContent));
  if (!hasContent) fail(detailPath, "publishRequirements");

  await db.course.update({
    where: { id: courseId },
    data: {
      status: { connect: { code: COURSE_STATUS.PUBLISHED } },
      // publishedAt is stamped the first time and is not rewritten: it is the
      // publication date, not that of the last status change.
      publishedAt: course.publishedAt ?? new Date(),
    },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.courses);
  revalidatePath(platformRoutes.courses);
}

/** Archiving is a course's retirement: it stops being listed, but nothing is deleted. */
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
 * The derivation failed when marking the lesson as trainable.
 *
 * It is thrown to abort the transaction — `fail` redirects and would be no use
 * inside it — and is translated into a specific message on the way out.
 */
class TrainingSyncError extends Error {
  constructor(readonly errorCode: string) {
    super(errorCode);
  }
}

// --- A chapter's game collection ------------------------------------------
//
// The games live in the CHAPTER: each one gathers those its lessons use, and a
// lesson references the one it needs (`setLessonGame`). Fixing the game fixes at
// once every lesson that uses it. This is the only place where a PGN is pasted;
// in the lesson it is only chosen.
//
// The course page lists them all together, but importing is not done from there:
// a game without a chapter would have no collection to go to.

/**
 * The chapter's collection, creating it the first time.
 *
 * It is not created with the chapter because most of them start without a single
 * game and an empty database per chapter would be noise. It appears when it is
 * needed, which is when the first one is imported.
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

/** Imports one or several games from a pasted PGN into the chapter's collection. */
export async function importChapterGames(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  // The form lives in the games tab, so the warnings go back there and not to the
  // chapter's page.
  const chapterPath = staffRoutes.chapterGames(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:chapter-games-import`, 20, 60_000))) fail(chapterPath, "throttled");

  const parsed = parseForm(PGN_SCHEMA, formData);
  if (!parsed.ok) fail(chapterPath, "pgnTooLong");

  const games = parseImportedGames(parsed.data.pgn);
  if (games.length === 0) fail(chapterPath, "pgn");

  const db = getPlatformDb();
  // The chapter has to belong to this course: the id comes from the URL.
  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { id: true, name: true, courseId: true },
  });
  if (!chapter) fail(chapterPath, "courseMissing");

  // The position index is written WITHIN the same transaction: a game stored
  // without indexing would be invisible to the position search and nobody would
  // find out until they looked for it.
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
  }, PGN_IMPORT_TRANSACTION);

  revalidatePath(chapterPath);
  // The page's tab shows the number, and the course's the whole list.
  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
  revalidatePath(staffRoutes.courseDetail(courseId));
  revalidatePath(staffRoutes.courseGames(courseId));
}

/**
 * Removes a game from the chapter's collection.
 *
 * Only if NO lesson uses it: deleting it would leave those lessons without
 * content — the foreign key is `SET NULL`, so it would not fail, they would be
 * emptied silently, which is worse.
 */
export async function deleteChapterGame(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterGames(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:chapter-games-delete`, 60, 60_000))) fail(chapterPath, "throttled");

  const { gameId } = readIds(formData, "gameId");
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

/** The lessons a game's change reaches, with what their derived exercise needs. */
const gameLessonSelect = {
  id: true,
  isTrainable: true,
  trainingColor: { select: { code: true } },
} as const;

/**
 * Saves the PGN of a game of the chapter as it is annotated on the board,
 * reporting what happened: the autosave cannot fail silently.
 *
 * A game of a course is NOT a private analysis: it is the content of every
 * lesson that uses it. So when the MOVES change — not a comment, not an
 * arrow (`sameMoves`) — each of those lessons is stamped (`pgnUpdatedAt`,
 * which is what marks as stale the exercises frozen against the previous
 * moves) and its derived exercise is remade, all in the same transaction as
 * the game. If a trainable lesson were left without a line to train, nothing
 * is saved: it is the same halfway state `updateLesson` refuses.
 */
export async function autosaveChapterGamePgn(
  courseId: string,
  chapterId: string,
  gameId: string,
  pgn: string,
): Promise<AutosaveResult> {
  if (pgn.length === 0 || pgn.length > PGN_MAX_LENGTH) return { ok: false, reason: "invalid" };

  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:chapter-game-autosave`, 240, 60_000))) {
    return { ok: false, reason: "throttled" };
  }
  if (parsePgnTree(pgn) === null) return { ok: false, reason: "invalid" };

  const db = getPlatformDb();
  // Through the three ids of the URL: a game of another chapter, of another
  // course or of a student's study is not this screen's to write.
  const game = await db.game.findFirst({
    where: { id: gameId, database: { chapterId, courseId } },
    select: { id: true, pgn: true, databaseId: true, lessons: { select: gameLessonSelect } },
  });
  if (!game) return { ok: false, reason: "denied" };

  const movesChanged = !sameMoves(game.pgn, pgn);

  try {
    await db.$transaction(async (tx) => {
      await tx.game.update({ where: { id: game.id }, data: { pgn } });
      await indexGamePositions(tx, { gameId: game.id, databaseId: game.databaseId, pgn });
      if (!movesChanged) return;

      for (const lesson of game.lessons) {
        await tx.lesson.update({ where: { id: lesson.id }, data: { pgnUpdatedAt: new Date() } });
        const sync = await syncLessonTrainingExercise(tx, {
          lessonId: lesson.id,
          pgn,
          isTrainable: lesson.isTrainable,
          trainingColor: (lesson.trainingColor?.code as "WHITE" | "BLACK" | undefined) ?? null,
        });
        if (lesson.isTrainable && !sync.ok) throw new TrainingSyncError(sync.reason);
      }
    }, PGN_IMPORT_TRANSACTION);
  } catch (error) {
    if (error instanceof TrainingSyncError) return { ok: false, reason: "training" };
    throw error;
  }

  // Not the game's own page: it is the one being edited, and revalidating it on
  // every autosave would reload it under the feet of whoever is writing. The
  // lists do show the number of moves, and the lessons show the game itself.
  revalidatePath(staffRoutes.chapterGames(courseId, chapterId));
  revalidatePath(staffRoutes.courseGames(courseId));
  for (const lesson of game.lessons) {
    revalidatePath(staffRoutes.lessonDetail(courseId, chapterId, lesson.id));
    revalidatePath(platformRoutes.lessonDetail(lesson.id));
  }
  return { ok: true };
}

/**
 * Edits the record of a game of the chapter: players, Elos, event, date,
 * result… and its name in the collection. The same fields, and the same
 * writing of the PGN's headers, as the student's studies (`writeGameRecord`).
 *
 * The moves are not touched, so no lesson is stamped.
 */
export async function updateChapterGameDetails(
  courseId: string,
  chapterId: string,
  gameId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const gamePath = staffRoutes.chapterGame(courseId, chapterId, gameId);
  if (!(await allowAction(`${staff.user.id}:chapter-game-details`, 60, 60_000))) fail(gamePath, "throttled");

  const db = getPlatformDb();
  const game = await db.game.findFirst({
    where: { id: gameId, database: { chapterId, courseId } },
    select: { id: true, pgn: true, lessons: { select: { id: true } } },
  });
  if (!game) fail(staffRoutes.chapterGames(courseId, chapterId), "gameMissing");

  const form = parseForm(GAME_FIELDS_SCHEMA, formData);
  if (!form.ok) fail(gamePath, "invalid");
  const result = resultCodeOf(form.data);

  // The result's token lives in the catalog's label ("1-0", "*"…), which is
  // exactly what the PGN expects in its Result header.
  const resultRow = await db.gameResult.findUnique({ where: { code: result }, select: { label: true } });
  const { columns } = writeGameRecord(form.data, game.pgn, resultRow?.label ?? "*");

  await db.game.update({
    where: { id: game.id },
    data: { ...columns, result: { connect: { code: result } } },
  });

  revalidatePath(gamePath);
  revalidatePath(staffRoutes.chapterGames(courseId, chapterId));
  revalidatePath(staffRoutes.courseGames(courseId));
  for (const lesson of game.lessons) {
    revalidatePath(staffRoutes.lessonDetail(courseId, chapterId, lesson.id));
    revalidatePath(platformRoutes.lessonDetail(lesson.id));
  }
}

// --- Chapters -------------------------------------------------------------

export async function createChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:chapter-create`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(NAMED_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { name } = parsed.data;

  // Optional role: without it, it is a normal chapter, which is what almost all of
  // them are. The place the introduction and the closing take does not come from
  // `order` but from their role (see services/shared/content-order), so here they
  // are numbered at the end like any other.
  const roleCode = parsed.data.role ?? "";
  const role = isContentRoleCode(roleCode) ? roleCode : null;

  const db = getPlatformDb();
  const count = await db.chapter.count({ where: { courseId } });

  try {
    await db.chapter.create({
      data: {
        course: { connect: { id: courseId } },
        name,
        order: nextOrder(count),
        ...(role ? { role: { connect: { code: role } } } : {}),
      },
    });
  } catch (error) {
    // The unique index (course, role) is what prevents the second one: the interface
    // does not offer the button when one already exists, but two open tabs do get through.
    if (isUniqueConstraintError(error, "Chapter_courseId_roleId_key", "roleId")) fail(detailPath, "roleTaken");
    throw error;
  }

  revalidatePath(detailPath);
}

export async function updateChapter(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:chapter-update`, 60, 60_000))) fail(chapterPath, "throttled");

  const parsed = parseForm(CHAPTER_UPDATE_SCHEMA, formData);
  if (!parsed.ok) fail(chapterPath, "invalid");

  const updated = await getPlatformDb().chapter.updateMany({
    where: { id: chapterId, courseId },
    data: parsed.data,
  });
  if (updated.count === 0) fail(chapterPath, "courseMissing");

  revalidatePath(chapterPath);
  revalidatePath(staffRoutes.courseDetail(courseId));
}

/**
 * Repositions the chapters in the order that arrives from the browser (dragging).
 *
 * The WHOLE list arrives, not a "move one up": dragging the fifth to the first
 * place shifts the four in between. `planFullReorder` is what avoids the clash
 * with the unique index `[courseId, order]` — half the list wants the order the
 * other half still occupies — and what discards a list that is not exactly this
 * course's, because it comes from the client.
 *
 * It does not use `fail()` with a redirect like the rest: it is called by a
 * transition from the browser, which already has the list rendered in place. If
 * something does not add up, the revalidation returns the good order and the row
 * goes back on its own.
 */
export async function reorderChapters(courseId: string, orderedIds: string[]): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:chapter-move`, 120, 60_000))) return;

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    // Only normal content is reordered: the introduction and the closing have their
    // place by role, not by `order`, and dragging them means nothing.
    const chapters = await tx.chapter.findMany({
      where: { courseId, roleId: null },
      select: { id: true, order: true },
    });
    for (const update of planFullReorder(chapters, orderedIds)) {
      await tx.chapter.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(staffRoutes.courseDetail(courseId));
}

/** The same for a chapter's lessons; see `reorderChapters`. */
export async function reorderLessons(courseId: string, chapterId: string, orderedIds: string[]): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:lesson-move`, 120, 60_000))) return;

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    // The chapter has to belong to this course: the id comes from the client and
    // without this another course's lessons could be reordered.
    const chapter = await tx.chapter.findFirst({ where: { id: chapterId, courseId }, select: { id: true } });
    if (!chapter) return;

    // See `reorderChapters`: the introduction and the closing are left out.
    const lessons = await tx.lesson.findMany({
      where: { chapterId, roleId: null },
      select: { id: true, order: true },
    });
    for (const update of planFullReorder(lessons, orderedIds)) {
      await tx.lesson.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(staffRoutes.chapterDetail(courseId, chapterId));
}

/**
 * Deletes a chapter ONLY if the course is a draft and nobody has progress over
 * it. In any other case the progress history rules: the course is archived, not
 * dismantled.
 */
export async function deleteChapter(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:chapter-delete`, 60, 60_000))) fail(detailPath, "throttled");

  const { chapterId } = readIds(formData, "chapterId");
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

// --- Lessons --------------------------------------------------------------

export async function createLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:lesson-create`, 60, 60_000))) fail(chapterPath, "throttled");

  const parsed = parseForm(NAMED_SCHEMA, formData);
  if (!parsed.ok) fail(chapterPath, "invalid");
  const { name } = parsed.data;

  const db = getPlatformDb();
  const chapter = await db.chapter.findFirst({ where: { id: chapterId, courseId }, select: { id: true } });
  if (!chapter) fail(chapterPath, "courseMissing");

  const roleCode = parsed.data.role ?? "";
  const role = isContentRoleCode(roleCode) ? roleCode : null;

  const count = await db.lesson.count({ where: { chapterId } });
  // Reasonable starting values: the rest is edited inside the lesson.
  await db.lesson.create({
    data: {
      id: numericId(),
      chapter: { connect: { id: chapter.id } },
      name,
      order: nextOrder(count),
      ...(role ? { role: { connect: { code: role } } } : {}),
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

  const parsed = parseForm(LESSON_UPDATE_SCHEMA, formData);
  if (!parsed.ok) fail(lessonPath, "invalid");
  const { name, orientationCode, isTrainable, description, isPriority, estimatedDuration } = parsed.data;

  const topicIds = parsed.data.topicIds
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value));

  const trainingColorInput = parsed.data.trainingColorCode ?? "";
  const trainingColor = (CONTENT_ORIENTATIONS as readonly string[]).includes(trainingColorInput)
    ? (trainingColorInput as "WHITE" | "BLACK")
    : null;

  const db = getPlatformDb();
  // With `lessonPgnSelect`: the derived exercise is trained against the content
  // the student sees, which may come from the linked game and not from `pgn`.
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
          description,
          isPriority,
          estimatedDuration,
          orientation: { connect: { code: orientationCode } },
          isTrainable,
          trainingColor: trainingColor ? { connect: { code: trainingColor } } : { disconnect: true },
        },
      });

      // The derived exercise is maintained here, within the same transaction: marking
      // the lesson as trainable and leaving it with no line to train would be a
      // halfway state.
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
 * Links the lesson to a game of the course collection, or unlinks it.
 *
 * From here on the lesson's content IS that game's (`lessonPgnOf`), so fixing it
 * fixes every lesson that uses it. The own `pgn` is NOT deleted: it goes dormant
 * and comes back on unlinking, which is what makes linking not an irreversible
 * decision.
 *
 * The game has to belong to THIS course's collection. The id comes from the
 * browser and without the check any other course's game could be hooked up,
 * including a student's private database.
 *
 * Changing the content also changes the line that is trained, so the derived
 * exercise is remade in the same transaction and `pgnUpdatedAt` is stamped: it
 * is what marks as stale the exercises that were frozen against the previous
 * content.
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

  const { gameId } = readIds(formData, "gameId");
  const db = getPlatformDb();

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, chapterId, chapter: { courseId } },
    select: { id: true, pgn: true, isTrainable: true, trainingColor: { select: { code: true } } },
  });
  if (!lesson) fail(lessonPath, "courseMissing");

  // Empty = unlink; then the lesson's own PGN rules again.
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

/** Same rule as the chapter: only in a draft and without progress from anyone. */
export async function deleteLesson(courseId: string, chapterId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const chapterPath = staffRoutes.chapterDetail(courseId, chapterId);
  if (!(await allowAction(`${staff.user.id}:lesson-delete`, 60, 60_000))) fail(chapterPath, "throttled");

  const { lessonId } = readIds(formData, "lessonId");
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

// --- Exercises ------------------------------------------------------------

interface ExerciseInput {
  modeCode: string;
  promptText: string | null;
  afterSans: string[];
  lineSans: string[];
}

function readExerciseInput(formData: FormData, failPath: string): ExerciseInput {
  const parsed = parseForm(EXERCISE_SCHEMA, formData);
  if (!parsed.ok) fail(failPath, parsed.field === "lineSans" ? "sans" : "invalid");
  return parsed.data;
}

/**
 * Derives the frozen copy with the SAME module the seed uses, over the position
 * the lesson's EFFECTIVE CONTENT starts from — its linked game's, if it has one.
 *
 * It used to come from `Lesson.initialFen`, which was a second copy of the same
 * data and got out of line when games were linked: it froze the moves against a
 * board the student never gets to see. Now it comes from the PGN, as in
 * `syncLessonTrainingExercise`.
 *
 * If any move is illegal it aborts without writing: it is better to reject here
 * than to leave an exercise the trainer cannot replay.
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
      // Frozen now: it is born up to date with the current PGN, not stale.
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

export async function deleteExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const staff = await requireStaff();
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!(await allowAction(`${staff.user.id}:exercise-delete`, 60, 60_000))) fail(lessonPath, "throttled");

  const { exerciseId } = readIds(formData, "exerciseId");
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

  const { exerciseId, direction } = readIds(formData, "exerciseId", "direction");
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

// --- Authors --------------------------------------------------------------
// Author is editorial content, not a restricted domain whose code the logic
// compares, so it is created and edited from the interface: in the «Autores»
// dialog of the courses catalog and of the course editor.
//
// These two RETURN their outcome (`useActionState`) instead of redirecting
// with `?error=`: the dialog stays open over the page, and an error rendered
// by the page would be read by nobody. The slug is never typed: it is the
// name's (`authorSlugFor`), with a number behind when another author has it.

const AUTHOR_SCHEMA = z.object({
  name: formText(NAME_MAX_LENGTH),
  photo: formOptionalUrl(2000),
  bio: formOptionalText(DESCRIPTION_MAX_LENGTH),
});

function authorFailure(errorCode: string): AuthorFormState {
  return { status: "error", errorCode };
}

/** The failure code a bad author form answers with. */
function authorFormError(field: string): string {
  if (field === "name") return "authorName";
  if (field === "photo") return "authorPhoto";
  return "invalid";
}

/** Every page that lists authors: the catalog and the editors under it, and the student's courses. */
function revalidateAuthorPaths() {
  revalidatePath(staffRoutes.courses, "layout");
  revalidatePath(platformRoutes.courses, "layout");
}

/** The slugs an author's new slug must not repeat: everybody's but their own. */
async function authorSlugsTaken(exceptAuthorId?: string): Promise<string[]> {
  const rows = await getPlatformDb().author.findMany({
    where: exceptAuthorId ? { id: { not: exceptAuthorId } } : {},
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export async function createAuthor(_previous: AuthorFormState, formData: FormData): Promise<AuthorFormState> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:author-create`, 20, 3_600_000))) return authorFailure("throttled");

  const parsed = parseForm(AUTHOR_SCHEMA, formData);
  if (!parsed.ok) return authorFailure(authorFormError(parsed.field));
  const { name, photo, bio } = parsed.data;

  const slug = authorSlugFor(name, await authorSlugsTaken());
  if (!slug) return authorFailure("authorName");

  try {
    await getPlatformDb().author.create({ data: { name, slug, bio, photo }, select: { id: true } });
  } catch (error) {
    // Two saves at once landed on the same slug: asking again solves it.
    if (isUniqueConstraintError(error, "Author_slug_key", "slug")) return authorFailure("authorSlug");
    throw error;
  }

  revalidateAuthorPaths();
  return { status: "saved", savedAt: Date.now() };
}

export async function updateAuthor(
  authorId: string,
  _previous: AuthorFormState,
  formData: FormData,
): Promise<AuthorFormState> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:author-update`, 60, 60_000))) return authorFailure("throttled");

  const parsed = parseForm(AUTHOR_SCHEMA, formData);
  if (!parsed.ok) return authorFailure(authorFormError(parsed.field));
  const { name, photo, bio } = parsed.data;
  const db = getPlatformDb();

  const existing = await db.author.findUnique({ where: { id: authorId }, select: { name: true, slug: true } });
  if (!existing) return authorFailure("authorMissing");

  // The slug follows the name; an author who keeps their name keeps their slug.
  const slug = name === existing.name ? existing.slug : authorSlugFor(name, await authorSlugsTaken(authorId));
  if (!slug) return authorFailure("authorName");

  try {
    await db.author.update({ where: { id: authorId }, data: { name, slug, bio, photo }, select: { id: true } });
  } catch (error) {
    if (isUniqueConstraintError(error, "Author_slug_key", "slug")) return authorFailure("authorSlug");
    throw error;
  }

  revalidateAuthorPaths();
  return { status: "saved", savedAt: Date.now() };
}

/**
 * Adds an author to the course, takes one out or changes the role of one,
 * according to the requested operation. The order is the one they were added
 * in: the card has no arrows.
 */
export async function manageCourseAuthors(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:course-authors`, 60, 60_000))) fail(detailPath, "throttled");

  const { operation, authorId, roleCode } = readIds(formData, "operation", "authorId", "roleCode");
  const db = getPlatformDb();

  if (operation === "add") {
    if (!isCode(roleCode, AUTHOR_ROLE)) fail(detailPath, "invalid");

    const author = await db.author.findUnique({ where: { id: authorId }, select: { id: true } });
    if (!author) fail(detailPath, "authorMissing");

    const last = await db.courseAuthor.aggregate({ where: { courseId }, _max: { order: true } });
    await db.courseAuthor.upsert({
      where: { courseId_authorId: { courseId, authorId: author.id } },
      update: { role: { connect: { code: roleCode } } },
      create: {
        course: { connect: { id: courseId } },
        author: { connect: { id: author.id } },
        role: { connect: { code: roleCode } },
        // After the last one, whatever gaps the removed ones left.
        order: (last._max.order ?? -1) + 1,
      },
    });
  } else if (operation === "role") {
    if (!isCode(roleCode, AUTHOR_ROLE)) fail(detailPath, "invalid");

    const role = await db.authorRole.findUnique({ where: { code: roleCode }, select: { id: true } });
    if (!role) fail(detailPath, "invalid");
    // Scoped to the course: an author who is not in it changes nothing.
    const { count } = await db.courseAuthor.updateMany({ where: { courseId, authorId }, data: { roleId: role.id } });
    if (count === 0) fail(detailPath, "authorMissing");
  } else if (operation === "remove") {
    await db.courseAuthor.deleteMany({ where: { courseId, authorId } });
  } else {
    fail(detailPath, "invalid");
  }

  revalidatePath(detailPath);
  // The student reads who signs the course.
  revalidatePath(platformRoutes.courseDetail(courseId));
  revalidatePath(platformRoutes.courses);
}
