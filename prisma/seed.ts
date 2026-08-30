// Seed idempotente de la plataforma: catálogos por upsert(code), dominio por
// upsert(id fijo) o clave natural. Ejecutarlo varias veces nunca duplica.
// Se ejecuta con `npm run db:seed` (prisma db seed → tsx, fuera de Next, por
// eso no reutiliza lib/platform-db/get-platform-db.ts, que es server-only).

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { parseSan } from "chessops/san";
import { PrismaClient } from "../lib/platform-db/generated/client";
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
  GAMES,
  IDS,
  mainlinePath,
  TEACHER,
  TOPIC_VALUES,
  USERS,
} from "./seed-data";
import { AUTHOR_ROLE } from "../constants/platform/course-codes.const";
import { STAT_METRIC_BY_ACTIVITY_TYPE, type ActivityTypeCode } from "../constants/platform/activity-codes.const";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DAY_MS = 24 * 60 * 60 * 1000;

/** Replica jugadas SAN con chessops para congelar posiciones siempre legales. */
function positionAfter(initialFen: string | null, sans: string[]): Chess {
  const pos = initialFen
    ? Chess.fromSetup(parseFen(initialFen).unwrap()).unwrap()
    : Chess.default();
  for (const san of sans) {
    const move = parseSan(pos, san);
    if (!move) throw new Error(`SAN ilegal en el seed: "${san}" tras [${sans.join(" ")}]`);
    pos.play(move);
  }
  return pos;
}

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

/**
 * Recalcula el agregado diario de un usuario desde cero: una fila por
 * (día, métrica, tema) más la fila total con topicId nulo.
 */
async function rebuildDailyStats(userId: string) {
  const activities = await db.userActivity.findMany({
    where: { userId },
    select: { occurredAt: true, topicId: true, type: { select: { code: true } } },
  });
  const metrics = await db.statMetric.findMany({ select: { id: true, code: true } });
  const metricIdByCode = new Map(metrics.map((metric) => [metric.code, metric.id]));

  const buckets = new Map<string, { day: Date; metricId: number; topicId: number | null; value: number }>();
  for (const activity of activities) {
    const metricCode = STAT_METRIC_BY_ACTIVITY_TYPE[activity.type.code as ActivityTypeCode];
    const metricId = metricCode ? metricIdByCode.get(metricCode) : undefined;
    if (metricId === undefined) continue;

    const day = new Date(
      Date.UTC(activity.occurredAt.getUTCFullYear(), activity.occurredAt.getUTCMonth(), activity.occurredAt.getUTCDate()),
    );
    // Cada hecho suma en el total de su métrica y, si tiene tema, en su desglose.
    for (const topicId of activity.topicId === null ? [null] : [null, activity.topicId]) {
      const key = `${day.toISOString()}|${metricId}|${topicId ?? "null"}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.value += 1;
      else buckets.set(key, { day, metricId, topicId, value: 1 });
    }
  }

  await db.userStatDaily.deleteMany({ where: { userId } });
  for (const bucket of buckets.values()) {
    await db.userStatDaily.create({ data: { userId, ...bucket } });
  }
}

async function main() {
  const now = new Date();

  // --- Catálogos -----------------------------------------------------------
  const courseType = await seedCatalog(db.courseType, CATALOG_VALUES.courseType);
  const courseStatus = await seedCatalog(db.courseStatus, CATALOG_VALUES.courseStatus);
  const authorRole = await seedCatalog(db.authorRole, CATALOG_VALUES.authorRole);
  const level = await seedCatalog(db.level, CATALOG_VALUES.level);
  const presentationMode = await seedCatalog(db.presentationMode, CATALOG_VALUES.presentationMode);
  const initialPositionType = await seedCatalog(db.initialPositionType, CATALOG_VALUES.initialPositionType);
  const boardOrientation = await seedCatalog(db.boardOrientation, CATALOG_VALUES.boardOrientation);
  const exerciseMode = await seedCatalog(db.exerciseMode, CATALOG_VALUES.exerciseMode);
  const progressStatus = await seedCatalog(db.progressStatus, CATALOG_VALUES.progressStatus);
  const attemptResult = await seedCatalog(db.attemptResult, CATALOG_VALUES.attemptResult);
  const attemptContext = await seedCatalog(db.attemptContext, CATALOG_VALUES.attemptContext);
  const ownerType = await seedCatalog(db.ownerType, CATALOG_VALUES.ownerType);
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

  // --- Usuarios, autor, profesor ------------------------------------------
  for (const user of USERS) {
    await db.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName },
      create: user,
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

  // --- Cursos → capítulos → lecciones → ejercicios -------------------------
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

    await db.courseAuthor.upsert({
      where: { courseId_authorId: { courseId: course.id, authorId: AUTHOR.id } },
      update: { roleId: idOf(authorRole, AUTHOR_ROLE.CONTENT_AUTHOR), order: 0 },
      create: { courseId: course.id, authorId: AUTHOR.id, roleId: idOf(authorRole, AUTHOR_ROLE.CONTENT_AUTHOR), order: 0 },
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
          presentationModeId: idOf(presentationMode, lesson.presentationMode),
          initialPositionTypeId: idOf(initialPositionType, lesson.initialPositionType),
          initialFen: lesson.initialFen,
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
          // startFen congelado: se calcula replicando las jugadas previas, y la
          // línea se valida entera para que el entrenador nunca reciba SAN ilegal.
          const startPos = positionAfter(lesson.initialFen, exercise.afterSans);
          positionAfter(makeFen(startPos.toSetup()), exercise.lineSans);
          const startPly = exercise.afterSans.length + 1;
          const exerciseData = {
            lessonId: lesson.id,
            order: exercise.order,
            modeId: idOf(exerciseMode, exercise.mode),
            path: mainlinePath(startPly),
            startPly,
            endPly: exercise.afterSans.length + exercise.lineSans.length,
            startFen: makeFen(startPos.toSetup()),
            line: exercise.lineSans.join(" "),
            // Congelado a la vez que el PGN de la lección: no nace stale.
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

  // --- Estudios y partidas -------------------------------------------------
  for (const database of GAME_DATABASES) {
    const databaseData = {
      ownerTypeId: idOf(ownerType, database.ownerType),
      userId: database.userId,
      courseId: database.courseId,
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
  }

  // --- Clases --------------------------------------------------------------
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

  // --- Progreso, entrenamiento y actividad ---------------------------------
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

  // UserStatDaily es derivada: se reconstruye entera desde UserActivity para
  // que el agregado y la fuente de verdad no puedan desincronizarse.
  await rebuildDailyStats(IDS.demoUser);

  console.log("Seed de la plataforma completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
