import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { exerciseKindLabel } from "@/lib/chess/exercise-labels";
import { levelOfDifficulty, type DifficultyLevel } from "./exercise-level";

// What an exercise says of itself in a row, the one way: «Mate en 2 · 1400 ·
// Intermedio», the level only when the levels are at hand. Shared by the
// student's series and lessons, the class blocks and the teacher's series.
// Pure module.

/** «Mate en 2 · 1400 · Intermedio». */
export function exerciseFacts(
  exercise: { kind: { code: string }; mateIn: number | null; difficulty: number },
  levels: readonly DifficultyLevel[] = [],
): string {
  const level = levelOfDifficulty(exercise.difficulty, levels)?.name;
  return [exerciseKindLabel(exercise.kind.code as ExerciseKindCode, exercise.mateIn), exercise.difficulty, level]
    .filter((part) => part !== undefined)
    .join(" · ");
}
