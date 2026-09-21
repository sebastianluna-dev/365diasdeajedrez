// Idempotent seed of the platform: catalogs by upsert(code), domain rows by
// upsert(fixed id) or natural key. Running it several times never duplicates.
// It runs with `npm run db:seed` (prisma db seed → tsx, outside Next, which is
// why it does not reuse lib/platform-db/get-platform-db.ts, which is server-only).

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { startFenOf } from "../lib/chess/mainline";
import { deriveExerciseData } from "../lib/chess/exercise-derivation";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { hashPassword } from "../lib/platform-auth/password";
import { indexGamePositions } from "../services/game-positions/game-positions.service";
import { rebuildDailyStats } from "../services/shared/daily-stats";
import {
  ACTIVITIES,
  AUTHOR,
  buildAttempts,
  buildClasses,
  buildProgress,
  CATALOG_VALUES,
  CLASS_BLOCKS,
  CLASS_TRANSCRIPT,
  COURSES,
  GAME_DATABASES,
  STUDY_SHARES,
  GAMES,
  IDS,
  STAFF,
  TEACHER,
  TEACHER_STUDENT,
  TOPIC_VALUES,
  USERS,
} from "./seed-data";
import { AUTHOR_ROLE } from "../constants/platform/course-codes.const";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

/** Password of the demo accounts. Overridable by the environment. */
const DEMO_PASSWORD = process.env.PLATFORM_DEMO_PASSWORD ?? "ajedrez365";

// The demo accounts — one of them with an administration role — are born with a
// password that is written in this repository. Against a database that is not
// local that is an open door, so outside local it only seeds if the password is
// set by the environment or if it is expressly requested.
function isLocalDatabase(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
  } catch {
    return false;
  }
}
const usesRepoPassword = !process.env.PLATFORM_DEMO_PASSWORD;
const looksRemote = process.env.NODE_ENV === "production" || !isLocalDatabase(connectionString);
if (looksRemote && usesRepoPassword && process.env.ALLOW_DEMO_SEED !== "1") {
  throw new Error(
    "El seed crea cuentas demo con la contraseña por defecto del repositorio y la base no es local. " +
      "Define PLATFORM_DEMO_PASSWORD con una contraseña propia o, si de verdad es una base de pruebas, ALLOW_DEMO_SEED=1.",
  );
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * The instant ALL the seed's dates hang from.
 *
 * It is not `new Date()` for two reasons that pulled in different directions:
 *
 * - Two consecutive runs wrote different values even when nothing had changed
 *   (`frozenAt`, `pgnUpdatedAt`, the activity…), so the seed was idempotent in
 *   content but not in rows. Rounding to the day, two passes on the same day
 *   give exactly the same thing.
 * - And at the same time the dates have to follow the calendar: with a fixed
 *   constant, the demo's "next class" is born in the past.
 *
 * `SEED_NOW` (ISO) fixes the instant by hand when a database has to be
 * reproduced byte for byte, for a test or a screenshot.
 *
 * The time is mid-afternoon in UTC and not midnight because class times come
 * out of it: at 00:00 the demo reads like a mistake.
 */
function seedReferenceDate(): Date {
  const pinned = process.env.SEED_NOW;
  if (pinned) {
    const fixed = new Date(pinned);
    if (Number.isNaN(fixed.getTime())) throw new Error(`SEED_NOW no es una fecha válida: "${pinned}".`);
    return fixed;
  }

  const today = new Date();
  today.setUTCHours(18, 0, 0, 0);
  return today;
}

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

function idOf(map: Map<string, number>, code: string): number {
  const id = map.get(code);
  if (id === undefined) throw new Error(`Code de catálogo no sembrado: ${code}`);
  return id;
}

async function main() {
  const now = seedReferenceDate();

  // --- Catalogs ------------------------------------------------------------
  const courseType = await seedCatalog(db.courseType, CATALOG_VALUES.courseType);
  const courseStatus = await seedCatalog(db.courseStatus, CATALOG_VALUES.courseStatus);
  const authorRole = await seedCatalog(db.authorRole, CATALOG_VALUES.authorRole);
  const level = await seedCatalog(db.level, CATALOG_VALUES.level);
  const boardOrientation = await seedCatalog(db.boardOrientation, CATALOG_VALUES.boardOrientation);
  const exerciseMode = await seedCatalog(db.exerciseMode, CATALOG_VALUES.exerciseMode);
  const progressStatus = await seedCatalog(db.progressStatus, CATALOG_VALUES.progressStatus);
  const attemptResult = await seedCatalog(db.attemptResult, CATALOG_VALUES.attemptResult);
  const attemptContext = await seedCatalog(db.attemptContext, CATALOG_VALUES.attemptContext);
  const ownerType = await seedCatalog(db.ownerType, CATALOG_VALUES.ownerType);
  await seedCatalog(db.contentRole, CATALOG_VALUES.contentRole);
  const databaseKind = await seedCatalog(db.databaseKind, CATALOG_VALUES.databaseKind);
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
    const credential = existing?.passwordHash
      ? {}
      : { passwordHash: await hashPassword(DEMO_PASSWORD), passwordUpdatedAt: new Date() };

    await db.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName, ...credential },
      create: { ...user, ...credential },
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
      typeId: idOf(courseType, course.type),
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

    await db.courseAuthor.upsert({
      where: { courseId_authorId: { courseId: course.id, authorId: AUTHOR.id } },
      update: { roleId: idOf(authorRole, AUTHOR_ROLE.CONTENT_AUTHOR), order: 0 },
      create: {
        courseId: course.id,
        authorId: AUTHOR.id,
        roleId: idOf(authorRole, AUTHOR_ROLE.CONTENT_AUTHOR),
        order: 0,
      },
    });

    for (const levelCode of course.levels) {
      await db.courseLevel.upsert({
        where: { courseId_levelId: { courseId: course.id, levelId: idOf(level, levelCode) } },
        update: {},
        create: { courseId: course.id, levelId: idOf(level, levelCode) },
      });
    }

    for (const chapter of course.chapters) {
      const chapterData = {
        courseId: course.id,
        name: chapter.name,
        description: chapter.description,
        order: chapter.order,
        estimatedDuration: chapter.estimatedDuration,
      };
      await db.chapter.upsert({
        where: { id: chapter.id },
        update: chapterData,
        create: { id: chapter.id, ...chapterData },
      });

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
    }
  }

  // --- Studies and games ---------------------------------------------------
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
    await db.gameDatabase.upsert({
      where: { id: database.id },
      update: databaseData,
      create: { id: database.id, ...databaseData },
    });
  }

  // The share goes AFTER the databases and before the games: the row points at
  // the collection, which has to exist already.
  for (const share of STUDY_SHARES) {
    await db.studyShare.upsert({
      where: { databaseId_userId: { databaseId: share.databaseId, userId: share.userId } },
      update: { teacherId: share.teacherId },
      create: share,
    });
  }

  for (const game of GAMES) {
    const gameData = {
      databaseId: game.databaseId,
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
      databaseId: game.databaseId,
      pgn: game.pgn,
    });
  }

  // --- Classes -------------------------------------------------------------
  for (const cls of buildClasses(now)) {
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

  // UserStatDaily is derived: it is rebuilt whole from UserActivity so that the
  // aggregate and the source of truth cannot drift apart.
  await rebuildDailyStats(db, IDS.demoUser);

  console.log("Seed de la plataforma completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
