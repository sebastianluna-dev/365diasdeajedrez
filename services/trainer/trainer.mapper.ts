import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";
import { turnColor } from "@/lib/chess/replay";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import type { TrainerChapterItem, TrainerExercise } from "./trainer.types";

export const trainerExerciseInclude = {
  mode: { select: { code: true } },
  lesson: { select: { name: true, pgnUpdatedAt: true, chapter: { select: { name: true } } } },
} satisfies Prisma.TrainingExerciseInclude;

export type TrainerExerciseRow = Prisma.TrainingExerciseGetPayload<{ include: typeof trainerExerciseInclude }>;

/**
 * Un ejercicio queda obsoleto cuando el PGN de su lección se editó después de
 * congelar startFen/line. Sin fecha de congelado se asume obsoleto: son
 * ejercicios anteriores a que existiera el campo.
 */
export function isExerciseStale(frozenAt: Date | null, pgnUpdatedAt: Date | null): boolean {
  if (!pgnUpdatedAt) return false;
  if (!frozenAt) return true;
  return pgnUpdatedAt > frozenAt;
}

export function mapTrainerExercise(row: TrainerExerciseRow): TrainerExercise {
  return {
    id: row.id,
    modeCode: row.mode.code as ExerciseModeCode,
    promptText: row.promptText ?? undefined,
    startFen: row.startFen,
    lineSans: row.line.split(" ").filter(Boolean),
    lessonName: row.lesson.name,
    chapterName: row.lesson.chapter.name,
    userColor: turnColor(row.startFen),
    isStale: isExerciseStale(row.frozenAt, row.lesson.pgnUpdatedAt),
  };
}

export interface TrainerChapterRow {
  id: string;
  name: string;
  courseId: string;
  course: { name: string };
  exerciseCount: number;
}

export function mapTrainerChapter(row: TrainerChapterRow, inTrainer: boolean): TrainerChapterItem {
  return {
    chapterId: row.id,
    chapterName: row.name,
    courseName: row.course.name,
    exerciseCount: row.exerciseCount,
    inTrainer,
    chapterHref: platformRoutes.chapterDetail(row.courseId, row.id),
  };
}
