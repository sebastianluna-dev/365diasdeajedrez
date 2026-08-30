import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";

export interface TrainerChapterItem {
  chapterId: string;
  chapterName: string;
  courseName: string;
  exerciseCount: number;
  inTrainer: boolean;
  chapterHref: string;
}

export interface TrainerData {
  /** Capítulos que el usuario agregó al entrenamiento. */
  myChapters: TrainerChapterItem[];
  /** Capítulos entrenables aún no agregados. */
  availableChapters: TrainerChapterItem[];
}

export interface TrainerExercise {
  id: string;
  modeCode: ExerciseModeCode;
  promptText?: string;
  /** Posición congelada desde la que arranca el ejercicio. */
  startFen: string;
  /** Línea congelada en SAN; el alumno juega los plies de su color. */
  lineSans: string[];
  lessonName: string;
  chapterName: string;
  /** Color que mueve en startFen: el que juega el alumno. */
  userColor: "white" | "black";
}
