// Idempotent seed of the platform: catalogs by upsert(code) — the levels by
// slug —, domain rows by upsert(fixed id) or natural key. Running it several times never duplicates.
// It runs with `npm run db:seed` (prisma db seed → tsx, outside Next, which is
// why it does not reuse lib/platform-db/get-platform-db.ts, which is server-only).

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { startFenOf } from "../lib/chess/mainline";
import { isLocalDatabase } from "../lib/database-target";
import { deriveExerciseData } from "../lib/chess/exercise-derivation";
import { PrismaClient, type Prisma } from "../lib/platform-db/generated/client";
import { hashPassword } from "../lib/platform-auth/password";
import { indexGamePositions } from "../services/game-positions/game-positions.service";
import { syncChapterDuration } from "../services/shared/chapter-duration.service";
import type { OrderUpdate, ReorderRow } from "../services/shared/reorder";
import { rebuildDailyStats } from "../services/shared/daily-stats";
import {
  ACTIVITIES,
  AUTHOR,
  buildAttempts,
  buildClasses,
  buildProgress,
  CATALOG_VALUES,
  CONTENT_TYPE_VALUES,
  CLASS_BLOCKS,
  CLASS_TRANSCRIPT,
  COURSES,
  GAME_DATABASES,
  STUDY_SHARES,
  GAMES,
  IDS,
  LEVEL_VALUES,
  STAFF,
  TEACHER,
  TEACHER_STUDENT,
  TOPIC_VALUES,
  USERS,
} from "./seed-data";
import { nextClassAfter, planSeededOrders, resolveCollectionIds, seedReferenceDate } from "./seed-rules";
import { proposeUserSlug } from "../services/shared/user-slug.service";
import { seedPlay } from "./seed-play";
import { AUTHOR_ROLE } from "../constants/platform/course-codes.const";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

/** Password of the demo accounts. Overridable by the environment. */
const DEMO_PASSWORD = process.env.PLATFORM_DEMO_PASSWORD ?? "ajedrez365";

// The demo accounts — one of them with an administration role — are born with a
// password that is written in this repository. Against a database that is not
// local that is an open door, so outside local it only seeds if the password is
// set by the environment or if it is expressly requested.
const usesRepoPassword = !process.env.PLATFORM_DEMO_PASSWORD;
const looksRemote = process.env.NODE_ENV === "production" || !isLocalDatabase(connectionString);
if (looksRemote && usesRepoPassword && process.env.ALLOW_DEMO_SEED !== "1") {
  throw new Error(
    "El seed crea cuentas demo con la contraseña por defecto del repositorio y la base no es local. " +
      "Define PLATFORM_DEMO_PASSWORD con una contraseña propia o, si de verdad es una base de pruebas, ALLOW_DEMO_SEED=1.",
  );
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DAY_MS = 24 * 60 * 60 * 1000;

interface CatalogRow {
  id: number;
  code: string;
}

interface CatalogDelegate {
  upsert(args: {
    where: { code: string };
    update: { label: string; order: number };
    create: { code: string; label: string; order: number };
  }): Promise<CatalogRow>;
}

async function seedCatalog(delegate: CatalogDelegate, values: [code: string, label: string][]) {
  const byCode = new Map<string, number>();
  for (const [index, [code, label]] of values.entries()) {
    const row = await delegate.upsert({
      where: { code },
      update: { label, order: index },
      create: { code, label, order: index },
    });
    byCode.set(code, row.id);
  }
  return byCode;
}

/** A catalog whose rows carry more than a label: every extra column is upserted too. */
interface RichCatalogRow {
  code: string;
  label: string;
  [column: string]: string;
}

/** `unknown` args: Prisma's generated `upsert` is generic and does not fit a loose record. */
interface RichCatalogDelegate {
  upsert(args: unknown): Promise<CatalogRow>;
}

async function seedCatalogRows(delegate: RichCatalogDelegate, rows: RichCatalogRow[]) {
  const byCode = new Map<string, number>();
  for (const [index, { code, ...columns }] of rows.entries()) {
    const row = await delegate.upsert({
      where: { code },
      update: { ...columns, order: index },
      create: { code, ...columns, order: index },
    });
    byCode.set(code, row.id);
  }
  return byCode;
}

/**
 * The levels go by slug and carry a description and an Elo range, so they are
 * rows of their own and not `[code, label]` pairs. Nobody edits them from the
 * interface: what is written here is what they are.
 */
async function seedLevels() {
  const bySlug = new Map<string, number>();
  for (const [index, { slug, ...columns }] of LEVEL_VALUES.entries()) {
    const row = await db.level.upsert({
      where: { slug },
      update: { ...columns, order: index + 1 },
      create: { slug, ...columns, order: index + 1 },
      select: { id: true },
    });
    bySlug.set(slug, row.id);
  }
  return bySlug;
}

function idOf(map: Map<string, number>, code: string): number {
  const id = map.get(code);
  if (id === undefined) throw new Error(`Code de catálogo no sembrado: ${code}`);
  return id;
}

/**
 * Clears the way for the orders the seed is about to write under one parent,
 * whose list is unique by `[parent, order]`: `planSeededOrders`
 * (prisma/seed-rules.ts) decides the moves, and they run in one transaction,
 * as the panel's reorders do, so a seed that stops never leaves a row at a
 * temporary order. With nothing seeded under the parent the plan moves
 * nothing, so the parent is not even read.
 */
async function clearSeededOrders(
  seeded: readonly ReorderRow[],
  readCurrent: () => Promise<ReorderRow[]>,
  move: (tx: Prisma.TransactionClient, update: OrderUpdate) => Promise<unknown>,
): Promise<void> {
  if (seeded.length === 0) return;
  const updates = planSeededOrders(await readCurrent(), seeded);
  if (updates.length === 0) return;
  await db.$transaction(async (tx) => {
    for (const update of updates) await move(tx, update);
  });
}

async function main() {
  // Every date of the seed hangs from this one instant: today at 18:00 UTC, or
  // `SEED_NOW` (`seedReferenceDate`, prisma/seed-rules.ts).
  const now = seedReferenceDate(process.env.SEED_NOW, new Date());

  // --- Catalogs ------------------------------------------------------------
  const contentType = await seedCatalogRows(db.contentType, CONTENT_TYPE_VALUES);
  const courseStatus = await seedCatalog(db.courseStatus, CATALOG_VALUES.courseStatus);
  const authorRole = await seedCatalog(db.authorRole, CATALOG_VALUES.authorRole);
  const sourceType = await seedCatalog(db.sourceType, CATALOG_VALUES.sourceType);
  const level = await seedLevels();
  const boardOrientation = await seedCatalog(db.boardOrientation, CATALOG_VALUES.boardOrientation);
  const exerciseMode = await seedCatalog(db.exerciseMode, CATALOG_VALUES.exerciseMode);
  const progressStatus = await seedCatalog(db.progressStatus, CATALOG_VALUES.progressStatus);
  const attemptResult = await seedCatalog(db.attemptResult, CATALOG_VALUES.attemptResult);
  const attemptContext = await seedCatalog(db.attemptContext, CATALOG_VALUES.attemptContext);
  const ownerType = await seedCatalog(db.ownerType, CATALOG_VALUES.ownerType);
  await seedCatalog(db.contentRole, CATALOG_VALUES.contentRole);
  const databaseKind = await seedCatalog(db.databaseKind, CATALOG_VALUES.databaseKind);
  await seedCatalog(db.gameAnalysisMode, CATALOG_VALUES.gameAnalysisMode);
  const gameSource = await seedCatalog(db.gameSource, CATALOG_VALUES.gameSource);
  const gameResult = await seedCatalog(db.gameResult, CATALOG_VALUES.gameResult);
  const classStatus = await seedCatalog(db.classStatus, CATALOG_VALUES.classStatus);
  const meetingProvider = await seedCatalog(db.meetingProvider, CATALOG_VALUES.meetingProvider);
  const classBlockKind = await seedCatalog(db.classBlockKind, CATALOG_VALUES.classBlockKind);
  const transcriptStatus = await seedCatalog(db.transcriptStatus, CATALOG_VALUES.transcriptStatus);
  const activityType = await seedCatalog(db.activityType, CATALOG_VALUES.activityType);
  const subjectType = await seedCatalog(db.subjectType, CATALOG_VALUES.subjectType);
  await seedCatalog(db.statMetric, CATALOG_VALUES.statMetric);

  const topic = new Map<string, number>();
  for (const [index, [code, label]] of TOPIC_VALUES.entries()) {
    const row = await db.topic.upsert({
      where: { code },
      update: { label, order: index },
      create: { code, label, order: index },
    });
    topic.set(code, row.id);
  }

  // --- Users, author, teacher ----------------------------------------------
  // The password is only set when the account has none yet: that way a re-seed
  // does not revert one that was changed with `npm run user:password`.
  for (const user of USERS) {
    const existing = await db.user.findUnique({
      where: { email: user.email },
      select: { passwordHash: true },
    });
    // The user name only reaches a new account (`create`): an existing one
    // keeps whatever its person chose.
    const credential = existing?.passwordHash
      ? {}
      : { passwordHash: await hashPassword(DEMO_PASSWORD), passwordUpdatedAt: new Date() };

    await db.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName, ...credential },
      create: { ...user, slug: await proposeUserSlug(db, user.displayName), ...credential },
    });
  }

  await db.author.upsert({
    where: { slug: AUTHOR.slug },
    update: { name: AUTHOR.name, bio: AUTHOR.bio },
    create: AUTHOR,
  });

  await db.teacher.upsert({
    where: { userId: TEACHER.userId },
    update: { displayName: TEACHER.displayName, title: TEACHER.title, bio: TEACHER.bio, timezone: TEACHER.timezone },
    create: TEACHER,
  });

  // Platform Administrator/Editor role: the row exists = they have the role.
  await db.staff.upsert({
    where: { userId: STAFF.userId },
    update: {},
    create: STAFF,
  });

  // Example teacher↔student assignment. The update does NOT touch endedAt on
  // purpose: if it was closed from the panel, the re-seed does not reopen it (and
  // the partial index teacher_student_one_active would reject a second active one).
  await db.teacherStudent.upsert({
    where: { id: TEACHER_STUDENT.id },
    update: {
      teacherId: TEACHER_STUDENT.teacherId,
      studentId: TEACHER_STUDENT.studentId,
      assignedBy: TEACHER_STUDENT.assignedBy,
      note: TEACHER_STUDENT.note,
    },
    create: TEACHER_STUDENT,
  });

  // --- Courses → chapters → lessons → exercises ----------------------------
  for (const course of COURSES) {
    const courseData = {
      name: course.name,
      slug: course.slug,
      description: course.description,
      statusId: idOf(courseStatus, course.status),
      publishedAt: new Date(now.getTime() - 30 * DAY_MS),
    };
    await db.course.upsert({
      where: { id: course.id },
      update: courseData,
      create: { id: course.id, ...courseData },
    });

    // The course's syllabus is replaced whole: what is no longer in the data is
    // deleted BEFORE seeding the new content. Without this, a withdrawn lesson and a
    // newly arrived one would fight over the same (chapterId, order), which is
    // unique. The deletion is limited to THIS course's chapters: courses created
    // from the panel are not touched. The rows hanging from a lesson (exercises,
    // progress, topics) fall by cascade; the external references — class block,
    // "last lesson seen" — are left null.
    const seededChapterIds = course.chapters.map((chapter) => chapter.id);
    const seededLessonIds = course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id));
    await db.lesson.deleteMany({
      where: { chapter: { courseId: course.id }, id: { notIn: seededLessonIds } },
    });
    await db.chapter.deleteMany({
      where: { courseId: course.id, id: { notIn: seededChapterIds } },
    });

    const authorRoleId = idOf(authorRole, course.authorRole ?? AUTHOR_ROLE.CONTENT_AUTHOR);
    await db.courseAuthor.upsert({
      where: { courseId_authorId: { courseId: course.id, authorId: AUTHOR.id } },
      update: { roleId: authorRoleId, order: 0 },
      create: { courseId: course.id, authorId: AUTHOR.id, roleId: authorRoleId, order: 0 },
    });

    for (const levelSlug of course.levels) {
      await db.courseLevel.upsert({
        where: { courseId_levelId: { courseId: course.id, levelId: idOf(level, levelSlug) } },
        update: {},
        create: { courseId: course.id, levelId: idOf(level, levelSlug) },
      });
    }

    for (const contentTypeCode of course.contentTypes) {
      const contentTypeId = idOf(contentType, contentTypeCode);
      await db.courseContentType.upsert({
        where: { courseId_contentTypeId: { courseId: course.id, contentTypeId } },
        update: {},
        create: { courseId: course.id, contentTypeId },
      });
    }

    // «Procedencia del recurso». Like the syllabus, the seeded rows replace
    // this course's whole list: a source withdrawn from the data disappears.
    // The deletion is limited to the ids the seed owns, so a source the panel
    // added to a course the seed does not describe is never touched.
    const sources = course.sources ?? [];
    await db.courseSource.deleteMany({
      where: { courseId: course.id, id: { notIn: sources.map((source) => source.id) } },
    });

    for (const source of sources) {
      const sourceData = {
        courseId: course.id,
        sourceTypeId: idOf(sourceType, source.sourceType),
        order: source.order,
        originalTitle: source.originalTitle,
        authors: source.authors,
        url: source.url ?? null,
        publicationYear: source.publicationYear,
        edition: source.edition,
        specificReference: source.specificReference,
        notes: source.notes,
      };
      await db.courseSource.upsert({
        where: { id: source.id },
        update: sourceData,
        create: { id: source.id, ...sourceData },
      });
    }

    // The panel may have reordered this course's chapters, or deleted one of
    // a draft and moved the rest up: a sibling may hold the order a seeded
    // chapter comes back to. After the deletions above, so only what the seed
    // keeps is moved.
    await clearSeededOrders(
      course.chapters,
      () => db.chapter.findMany({ where: { courseId: course.id }, select: { id: true, order: true } }),
      (tx, update) => tx.chapter.update({ where: { id: update.id }, data: { order: update.order } }),
    );

    for (const chapter of course.chapters) {
      const chapterData = {
        courseId: course.id,
        name: chapter.name,
        description: chapter.description,
        order: chapter.order,
      };
      await db.chapter.upsert({
        where: { id: chapter.id },
        update: chapterData,
        create: { id: chapter.id, ...chapterData },
      });

      await clearSeededOrders(
        chapter.lessons,
        () => db.lesson.findMany({ where: { chapterId: chapter.id }, select: { id: true, order: true } }),
        (tx, update) => tx.lesson.update({ where: { id: update.id }, data: { order: update.order } }),
      );

      for (const lesson of chapter.lessons) {
        const lessonData = {
          chapterId: chapter.id,
          name: lesson.name,
          description: lesson.description,
          order: lesson.order,
          isPriority: lesson.isPriority,
          estimatedDuration: lesson.estimatedDuration,
          orientationId: idOf(boardOrientation, lesson.orientation),
          pgn: lesson.pgn,
          pgnUpdatedAt: new Date(now.getTime() - 30 * DAY_MS),
        };
        await db.lesson.upsert({
          where: { id: lesson.id },
          update: lessonData,
          create: { id: lesson.id, ...lessonData },
        });

        for (const topicCode of lesson.topics) {
          await db.lessonTopic.upsert({
            where: { lessonId_topicId: { lessonId: lesson.id, topicId: idOf(topic, topicCode) } },
            update: {},
            create: { lessonId: lesson.id, topicId: idOf(topic, topicCode) },
          });
        }

        // The exercises the seed does not own (made by hand in the panel, or
        // the derived one) are never deleted: the plan only moves them out of
        // the way when they stand in it.
        await clearSeededOrders(
          lesson.exercises,
          () => db.trainingExercise.findMany({ where: { lessonId: lesson.id }, select: { id: true, order: true } }),
          (tx, update) => tx.trainingExercise.update({ where: { id: update.id }, data: { order: update.order } }),
        );

        for (const exercise of lesson.exercises) {
          // The frozen copy (startFen, line, path) is computed by the same module the
          // staff editor uses: if they diverged, the seeded exercises and the hand-made
          // ones would behave differently.
          const derived = deriveExerciseData({
            // From the PGN, which is the only source of the position since there is no
            // `Lesson.initialFen`. Without this, the Lucena and Philidor exercises would be
            // derived from the starting position and the seed would break when validating
            // their moves.
            initialFen: startFenOf(lesson.pgn),
            afterSans: exercise.afterSans,
            lineSans: exercise.lineSans,
          });
          const exerciseData = {
            lessonId: lesson.id,
            order: exercise.order,
            modeId: idOf(exerciseMode, exercise.mode),
            ...derived,
            // Frozen at the same time as the lesson's PGN: it is not born stale.
            frozenAt: new Date(now.getTime() - 30 * DAY_MS),
            promptText: exercise.promptText,
          };
          await db.trainingExercise.upsert({
            where: { id: exercise.id },
            update: exerciseData,
            create: { id: exercise.id, ...exerciseData },
          });
        }
      }

      // The chapter's duration is derived: the same function the panel uses
      // writes it, so a seeded chapter and one built by hand cannot differ.
      await syncChapterDuration(db, chapter.id);
    }
  }

  // --- Studies and games ---------------------------------------------------
  //
  // The row a seeded collection lands on is not always the one carrying its id.
  // Two of these collections are also created by the APP, under ids of its own,
  // and each is unique by something that is not the id:
  //
  //   · a chapter's collection (`@@unique([chapterId])`), by the staff panel's
  //     `importChapterGames` or by `npm run collections:by-chapter`, which the
  //     docs tell you to run right after a seed;
  //   · a user's default study (`game_database_one_default_per_user`), by
  //     `createDefaultStudy` when the account is enrolled.
  //
  // Inserting ours next to one of them would break its index and stop the seed
  // halfway. So `resolveCollectionIds` (prisma/seed-rules.ts) looks each one up
  // by that key and adopts the existing row, and what the seed knows as
  // `database.id` is translated into the real one for everything pointing at it.
  const databaseIdOf = await resolveCollectionIds(GAME_DATABASES, (key) =>
    db.gameDatabase.findFirst({ where: key, select: { id: true } }),
  );

  /** The collection's real id: the adopted one, or the seed's when it was created here. */
  const realDatabaseId = (seedId: string): string => databaseIdOf.get(seedId) ?? seedId;

  for (const database of GAME_DATABASES) {
    const databaseData = {
      ownerTypeId: idOf(ownerType, database.ownerType),
      userId: database.userId,
      courseId: database.courseId,
      chapterId: database.chapterId,
      name: database.name,
      description: database.description,
      kindId: idOf(databaseKind, database.kind),
      isDefault: database.isDefault,
      order: database.order,
    };

    const id = realDatabaseId(database.id);
    await db.gameDatabase.upsert({
      where: { id },
      update: databaseData,
      create: { id, ...databaseData },
    });
  }

  // The share goes AFTER the databases and before the games: the row points at
  // the collection, which has to exist already.
  for (const share of STUDY_SHARES) {
    const databaseId = realDatabaseId(share.databaseId);
    await db.studyShare.upsert({
      where: { databaseId_userId: { databaseId, userId: share.userId } },
      update: { teacherId: share.teacherId },
      create: { ...share, databaseId },
    });
  }

  for (const game of GAMES) {
    const databaseId = realDatabaseId(game.databaseId);
    const gameData = {
      databaseId,
      white: game.white,
      black: game.black,
      whiteElo: game.whiteElo,
      blackElo: game.blackElo,
      resultId: idOf(gameResult, game.result),
      playedAt: game.playedAt,
      event: game.event,
      site: game.site,
      eco: game.eco,
      pgn: game.pgn,
      sourceId: idOf(gameSource, game.source),
      isOwnGame: false,
    };
    await db.game.upsert({
      where: { id: game.id },
      update: gameData,
      create: { id: game.id, ...gameData },
    });
    // Indexing here and not in a separate step leaves the seed self-sufficient:
    // after seeding, the position search already finds these games.
    // `indexGamePositions` deletes and regenerates, so a re-seed does not duplicate.
    await indexGamePositions(db, {
      gameId: game.id,
      databaseId,
      pgn: game.pgn,
    });
  }

  // --- Classes -------------------------------------------------------------
  const classes = buildClasses(now);
  for (const cls of classes) {
    const classData = {
      teacherId: cls.teacherId,
      title: cls.title,
      description: cls.description,
      scheduledAt: cls.scheduledAt,
      durationMin: cls.durationMin,
      statusId: idOf(classStatus, cls.status),
      meetingProviderId: idOf(meetingProvider, cls.meetingProvider),
      meetingUrl: cls.meetingUrl,
      meetingUrlVisibleFrom: cls.meetingUrlVisibleFrom,
      recordingUrl: cls.recordingUrl,
      summary: cls.summary,
    };
    await db.class.upsert({
      where: { id: cls.id },
      update: classData,
      create: { id: cls.id, ...classData },
    });

    const isPast = cls.scheduledAt < now;
    const participantData = {
      paidAt: new Date(cls.scheduledAt.getTime() - 5 * DAY_MS),
      amount: 350,
      currency: "MXN",
      attended: isPast,
      joinedAt: isPast ? cls.scheduledAt : null,
    };
    await db.classParticipant.upsert({
      where: { classId_userId: { classId: cls.id, userId: IDS.demoUser } },
      update: participantData,
      create: { classId: cls.id, userId: IDS.demoUser, ...participantData },
    });
  }

  // The teacher may have reordered, added or deleted the blocks of a seeded
  // class; the ones the seed does not own are kept, as with the exercises.
  for (const classId of new Set(CLASS_BLOCKS.map((block) => block.classId))) {
    await clearSeededOrders(
      CLASS_BLOCKS.filter((block) => block.classId === classId),
      () => db.classBlock.findMany({ where: { classId }, select: { id: true, order: true } }),
      (tx, update) => tx.classBlock.update({ where: { id: update.id }, data: { order: update.order } }),
    );
  }

  for (const block of CLASS_BLOCKS) {
    const blockData = {
      classId: block.classId,
      order: block.order,
      kindId: idOf(classBlockKind, block.kind),
      text: block.text,
      videoUrl: block.videoUrl,
      gameId: block.gameId,
      lessonId: block.lessonId,
      positionId: block.positionId,
      movePath: block.movePath,
      caption: block.caption,
    };
    await db.classBlock.upsert({
      where: { id: block.id },
      update: blockData,
      create: { id: block.id, ...blockData },
    });
  }

  const transcriptData = {
    provider: CLASS_TRANSCRIPT.provider,
    language: CLASS_TRANSCRIPT.language,
    statusId: idOf(transcriptStatus, CLASS_TRANSCRIPT.status),
    text: CLASS_TRANSCRIPT.text,
    segments: CLASS_TRANSCRIPT.segments,
    durationMs: CLASS_TRANSCRIPT.durationMs,
  };
  await db.classTranscript.upsert({
    where: { classId: CLASS_TRANSCRIPT.classId },
    update: transcriptData,
    create: { classId: CLASS_TRANSCRIPT.classId, ...transcriptData },
  });

  // --- Progress, training and activity -------------------------------------
  const progress = buildProgress(now);

  for (const row of progress.courseProgress) {
    const data = {
      statusId: idOf(progressStatus, row.status),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      lastLessonId: row.lastLessonId,
    };
    await db.courseProgress.upsert({
      where: { userId_courseId: { userId: row.userId, courseId: row.courseId } },
      update: data,
      create: { userId: row.userId, courseId: row.courseId, ...data },
    });
  }

  for (const row of progress.chapterProgress) {
    const data = { statusId: idOf(progressStatus, row.status), startedAt: row.startedAt, completedAt: row.completedAt };
    await db.chapterProgress.upsert({
      where: { userId_chapterId: { userId: row.userId, chapterId: row.chapterId } },
      update: data,
      create: { userId: row.userId, chapterId: row.chapterId, ...data },
    });
  }

  for (const row of progress.lessonProgress) {
    const data = { statusId: idOf(progressStatus, row.status), startedAt: row.startedAt, completedAt: row.completedAt };
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: row.userId, lessonId: row.lessonId } },
      update: data,
      create: { userId: row.userId, lessonId: row.lessonId, ...data },
    });
  }

  for (const row of progress.trainerChapters) {
    await db.userTrainerChapter.upsert({
      where: { userId_chapterId: { userId: row.userId, chapterId: row.chapterId } },
      update: {},
      create: { userId: row.userId, chapterId: row.chapterId },
    });
  }

  for (const attempt of buildAttempts(now)) {
    const data = {
      userId: attempt.userId,
      exerciseId: attempt.exerciseId,
      resultId: idOf(attemptResult, attempt.result),
      mistakes: attempt.mistakes,
      durationMs: attempt.durationMs,
      contextId: idOf(attemptContext, attempt.context),
      createdAt: attempt.createdAt,
    };
    await db.trainingAttempt.upsert({
      where: { id: attempt.id },
      update: data,
      create: { id: attempt.id, ...data },
    });
  }

  for (const activity of ACTIVITIES) {
    const data = {
      userId: IDS.demoUser,
      typeId: idOf(activityType, activity.type),
      subjectTypeId: idOf(subjectType, activity.subjectType),
      subjectId: activity.subjectId,
      topicId: activity.topic ? idOf(topic, activity.topic) : null,
      occurredAt: new Date(now.getTime() - activity.daysAgo * DAY_MS),
      meta: activity.meta ?? undefined,
    };
    await db.userActivity.upsert({
      where: { id: activity.id },
      update: data,
      create: { id: activity.id, ...data },
    });
  }

  // «Jugar»: its catalogs, the bots and the demo student's games. Playing
  // writes no activity, so it goes apart from what the stats are rebuilt from.
  await seedPlay(
    db,
    USERS.find((user) => user.id === IDS.demoUser)!,
    now,
  );

  // UserStatDaily is derived: it is rebuilt whole from UserActivity so that the
  // aggregate and the source of truth cannot drift apart.
  await rebuildDailyStats(db, IDS.demoUser);

  console.log("Seed de la plataforma completado.");

  // The dates follow the day of the seed, and the clock keeps moving: weeks
  // later every class is behind and the student's «Próxima clase» is empty.
  // Said here, against the real clock, so it is not found out during a demo.
  const nextClass = nextClassAfter(classes, new Date());
  console.log(
    nextClass
      ? `La próxima clase de la demo es el ${nextClass.toISOString().slice(0, 10)}: después, «Próxima clase» queda vacía hasta volver a sembrar.`
      : "Ninguna clase de la demo queda por delante y «Próxima clase» está vacía: siembra sin SEED_NOW, o con el día de la demo.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
