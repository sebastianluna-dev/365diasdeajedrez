import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
} from "@/constants/platform/class-codes.const";

// What a game block is made of: the game transcribed in it, or a game of a
// study it cites. The transcription rules when both come; neither is a block
// without a game. And what an exercise block holds (D29, D30): one to ten
// exercises, each once, for the student — never the teacher's script, since
// the block IS the task. Pure module.

export type GameBlockSource =
  { kind: "pgn"; pgn: string } | { kind: "game"; gameId: string } | { error: "blockPgnEmpty" };

/** The source of a game block from what the form sent: the PGN wins over the cited game. */
export function gameBlockSource(input: { pgn?: string | null; gameId?: string | null }): GameBlockSource {
  const pgn = input.pgn?.trim() ?? "";
  if (pgn.length > 0) return { kind: "pgn", pgn };
  const gameId = input.gameId?.trim() ?? "";
  if (gameId.length > 0) return { kind: "game", gameId };
  return { error: "blockPgnEmpty" };
}

/** How many exercises an EXERCISE block holds: a class's task, not a bank. */
export const EXERCISE_BLOCK_LIMITS = { min: 1, max: 10 } as const;

export type ExerciseBlockError = "blockExercises" | "blockExercisesRepeated" | "blockExerciseVisibility";

/**
 * Why a block of this kind cannot be in this section, or null: an EXERCISE
 * block in the teacher's script (D30). The one rule behind the «+» buttons,
 * the row's «Pasar a …» and the two writers (the block's save and the reorder
 * that crosses a section), so no path puts a task where nobody solves it.
 */
export function blockVisibilityError(input: {
  kind: ClassBlockKindCode;
  visibility: ClassBlockVisibilityCode;
}): "blockExerciseVisibility" | null {
  return input.kind === CLASS_BLOCK_KIND.EXERCISE && input.visibility === CLASS_BLOCK_VISIBILITY.TEACHER
    ? "blockExerciseVisibility"
    : null;
}

/**
 * Why an exercise block cannot be saved as sent, or null: fewer than one or
 * more than ten exercises, one repeated (the primary key would refuse it
 * anyway, but with the wrong words), or the teacher's script as its
 * visibility (D30: the AFTER block is the task; a script of exercises is
 * nobody's to solve).
 */
export function exerciseBlockError(input: {
  exerciseIds: readonly string[];
  visibility: ClassBlockVisibilityCode;
}): ExerciseBlockError | null {
  const misplaced = blockVisibilityError({ kind: CLASS_BLOCK_KIND.EXERCISE, visibility: input.visibility });
  if (misplaced) return misplaced;
  const ids = input.exerciseIds.map((id) => id.trim()).filter((id) => id.length > 0);
  if (ids.length < EXERCISE_BLOCK_LIMITS.min || ids.length > EXERCISE_BLOCK_LIMITS.max) return "blockExercises";
  if (new Set(ids).size !== ids.length) return "blockExercisesRepeated";
  return null;
}
