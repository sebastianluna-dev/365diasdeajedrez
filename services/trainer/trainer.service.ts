import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { publishedCourseWhere, publishedLessonWhere } from "@/services/shared/published-content";
import { mapTrainerChapter, mapTrainerExercise, trainerExerciseInclude } from "./trainer.mapper";
import type { TrainerData, TrainerExercise } from "./trainer.types";

export async function getTrainerData(): Promise<TrainerData> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [chapters, trainerRows] = await Promise.all([
    db.chapter.findMany({
      where: {
        course: publishedCourseWhere,
        lessons: { some: { exercises: { some: {} } } },
      },
      orderBy: [{ course: { name: "asc" } }, { order: "asc" }],
      select: { id: true, name: true, order: true, courseId: true, course: { select: { name: true } } },
    }),
    db.userTrainerChapter.findMany({ where: { userId: user.id }, select: { chapterId: true } }),
  ]);

  const exerciseCounts = await db.trainingExercise.groupBy({
    by: ["lessonId"],
    _count: { _all: true },
    where: { lesson: { chapterId: { in: chapters.map((chapter) => chapter.id) } } },
  });
  const lessonChapter = await db.lesson.findMany({
    where: { id: { in: exerciseCounts.map((row) => row.lessonId) } },
    select: { id: true, chapterId: true },
  });
  const chapterByLesson = new Map(lessonChapter.map((row) => [row.id, row.chapterId]));
  const countByChapter = new Map<string, number>();
  for (const row of exerciseCounts) {
    const chapterId = chapterByLesson.get(row.lessonId);
    if (!chapterId) continue;
    countByChapter.set(chapterId, (countByChapter.get(chapterId) ?? 0) + row._count._all);
  }

  const inTrainer = new Set(trainerRows.map((row) => row.chapterId));
  const items = chapters.map((chapter) =>
    mapTrainerChapter(
      { ...chapter, exerciseCount: countByChapter.get(chapter.id) ?? 0 },
      inTrainer.has(chapter.id),
    ),
  );

  return {
    myChapters: items.filter((item) => item.inTrainer),
    availableChapters: items.filter((item) => !item.inTrainer),
  };
}

export interface TrainerSessionParams {
  lessonId?: string;
  chapterId?: string;
}

/**
 * Ejercicios de la sesión: los de la lección o capítulo pedidos, o los de
 * todos los capítulos que el usuario agregó al Move Trainer.
 *
 * Los ids de lección y capítulo llegan por la URL, así que el filtro de curso
 * publicado va encadenado en el `where`: sin él, `/entrenador?chapter=<id>`
 * servía los ejercicios de un curso en borrador o archivado.
 */
export async function getTrainerSession(params: TrainerSessionParams): Promise<TrainerExercise[]> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  let where: Prisma.TrainingExerciseWhereInput;
  if (params.lessonId) {
    where = { lessonId: params.lessonId, lesson: publishedLessonWhere };
  } else if (params.chapterId) {
    where = { lesson: { chapterId: params.chapterId, ...publishedLessonWhere } };
  } else {
    const trainerRows = await db.userTrainerChapter.findMany({ where: { userId: user.id }, select: { chapterId: true } });
    if (trainerRows.length === 0) return [];
    where = { lesson: { chapterId: { in: trainerRows.map((row) => row.chapterId) }, ...publishedLessonWhere } };
  }

  const rows = await db.trainingExercise.findMany({
    where,
    orderBy: [{ lesson: { chapter: { order: "asc" } } }, { lesson: { order: "asc" } }, { order: "asc" }],
    include: trainerExerciseInclude,
  });
  return rows.map(mapTrainerExercise);
}
