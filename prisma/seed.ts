// Seed idempotente de la plataforma: catálogos por upsert(code), dominio por
// upsert(id fijo) o clave natural. Ejecutarlo varias veces nunca duplica.
// Se ejecuta con `npm run db:seed` (prisma db seed → tsx, fuera de Next, por
// eso no reutiliza lib/platform-db/get-platform-db.ts, que es server-only).

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { deriveExerciseData } from "../lib/chess/exercise-derivation";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { hashPassword } from "../lib/platform-auth/password";
import { indexGamePositions } from "../services/game-positions/game-positions.service";
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
import { STAT_METRIC_BY_ACTIVITY_TYPE, type ActivityTypeCode } from "../constants/platform/activity-codes.const";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * El instante del que cuelgan TODAS las fechas del seed.
 *
 * No es `new Date()` por dos razones que tiraban en direcciones distintas:
 *
 * - Dos ejecuciones seguidas escribían valores distintos aunque no hubiera
 *   cambiado nada (`frozenAt`, `pgnUpdatedAt`, la actividad…), así que el seed
 *   era idempotente de contenido pero no de fila. Redondeando al día, dos
 *   pasadas del mismo día dan exactamente lo mismo.
 * - Y a la vez las fechas tienen que seguir al calendario: con una constante
 *   fija, la «próxima clase» de la demo nace en el pasado.
 *
 * `SEED_NOW` (ISO) fija el instante a mano cuando hace falta reproducir una
 * base igual byte a byte, para una prueba o una captura.
 *
 * La hora es media tarde en UTC y no medianoche porque de aquí salen horas de
 * clase: a las 00:00 la demo se lee como un error.
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

/** Contraseña de las cuentas demo. Sobreescribible por entorno. */
const DEMO_PASSWORD = process.env.PLATFORM_DEMO_PASSWORD ?? "ajedrez365";

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
  const now = seedReferenceDate();

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
  // La contraseña sólo se pone cuando la cuenta aún no tiene ninguna: así un
  // re-seed no revierte la que se haya cambiado con `npm run user:password`.
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

  // Rol Administrador/Editor de la plataforma: la fila existe = tiene el rol.
  await db.staff.upsert({
    where: { userId: STAFF.userId },
    update: {},
    create: STAFF,
  });

  // Asignación profesor↔alumno de ejemplo. El update NO toca endedAt a
  // propósito: si se cerró desde el panel, el re-seed no la reabre (y el índice
  // parcial teacher_student_one_active rechazaría una segunda activa).
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

    // El temario del curso se reemplaza entero: lo que ya no está en los datos
    // se borra ANTES de sembrar lo nuevo. Sin esto, una lección retirada y otra
    // recién llegada se pelearían por el mismo (chapterId, order), que es
    // único. El borrado se limita a los capítulos de ESTE curso: los cursos
    // creados desde el panel no se tocan. Las filas que cuelgan de una lección
    // (ejercicios, progreso, temas) caen por cascada; las referencias externas
    // —bloque de clase, «última lección vista»— quedan a null.
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
          // La copia congelada (startFen, línea, ruta) la calcula el mismo
          // módulo que usa el editor del staff: si divergieran, los ejercicios
          // sembrados y los creados a mano se comportarían distinto.
          const derived = deriveExerciseData({
            initialFen: lesson.initialFen,
            afterSans: exercise.afterSans,
            lineSans: exercise.lineSans,
          });
          const exerciseData = {
            lessonId: lesson.id,
            order: exercise.order,
            modeId: idOf(exerciseMode, exercise.mode),
            ...derived,
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

  // El reparto va DESPUÉS de las bases y antes que las partidas: la fila apunta
  // a la colección, que ya tiene que existir.
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
    // Indexar aquí y no en un paso aparte deja el seed autosuficiente: tras
    // sembrar, el buscador por posición ya encuentra estas partidas.
    // `indexGamePositions` borra y regenera, así que un re-seed no duplica.
    await indexGamePositions(db, {
      gameId: game.id,
      databaseId: game.databaseId,
      pgn: game.pgn,
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
