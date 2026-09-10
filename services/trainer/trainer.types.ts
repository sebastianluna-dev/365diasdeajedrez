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
  /** Chapters the user added to the training. */
  myChapters: TrainerChapterItem[];
  /** Trainable chapters not added yet. */
  availableChapters: TrainerChapterItem[];
}

export interface TrainerExercise {
  id: string;
  modeCode: ExerciseModeCode;
  promptText?: string;
  /** Frozen position the exercise starts from. */
  startFen: string;
  /** Line frozen in SAN; the student plays the plies of their colour. */
  lineSans: string[];
  lessonName: string;
  chapterName: string;
  /** Colour that moves in startFen: the one the student plays. */
  userColor: "white" | "black";
  /**
   * The lesson's PGN was edited after the exercise was frozen: the line is still
   * playable but it may no longer match the lesson.
   */
  isStale: boolean;
}
