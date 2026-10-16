import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";

// How an exercise is named on screen, the same for the teacher's bank, the
// editor and the student's screens: its kind («Secuencia», «Mate en 2»), who
// plays it, and what it asks when its author wrote no prompt — the editor
// shows that as the prompt's placeholder and the solve screen as the prompt,
// so the two say the same.

/** «Secuencia», «Mate en 2». */
export function exerciseKindLabel(kind: ExerciseKindCode, mateIn: number | null): string {
  return kind === EXERCISE_KIND.MATE_IN ? `Mate en ${mateIn ?? "N"}` : "Secuencia";
}

/** Who plays an exercise: the side to move of its start, which the board puts at the bottom. */
export function playerOfStart(startFen: string): "white" | "black" {
  return startFen.split(" ")[1] === "b" ? "black" : "white";
}

/** «Juegan blancas», or «Juegan negras y dan mate en 2». */
export function defaultExercisePrompt(
  player: "white" | "black",
  kind: ExerciseKindCode,
  mateIn: number | null,
): string {
  const side = player === "white" ? "Juegan blancas" : "Juegan negras";
  if (kind !== EXERCISE_KIND.MATE_IN || !mateIn) return side;
  return `${side} y dan mate en ${mateIn}`;
}
