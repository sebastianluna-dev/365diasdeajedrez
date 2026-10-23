import type { SolverResult } from "./exercise-solver-session";
import type { ExerciseSolverMode } from "./exercise-solver.types";
import { submitsAttempt, type SolverSaveState } from "./use-exercise-solver.hook";

// How a finished exercise is told, the same in both views of the solver (the
// board and its panel, and the full page of «Ejercicios»): pure, so the two
// cannot tell one result in two ways.

export const isPassed = (result: SolverResult) => result.kind === "clean" || result.kind === "hinted";

/** What a class block's solve says on a day the exercise was already scored (D49): it marks the block, nothing else. */
export const BLOCK_NOTE = "Ya lo intentaste hoy: este intento cuenta para la clase, no para tu racha.";

export const SAVE_NOTES: Partial<Record<SolverSaveState, { message: string; variant: "error" | "info" }>> = {
  failed: { message: "No se guardó el intento.", variant: "error" },
  notScored: { message: "Ya lo intentaste hoy: este intento no cuenta.", variant: "info" },
  stored: { message: BLOCK_NOTE, variant: "info" },
};

/**
 * The note under the result about the save: only in a mode that submits, and
 * not what the head already says (a `block` page knows its attempt is stored
 * for the block alone).
 */
export function saveNoteOf(mode: ExerciseSolverMode, save: SolverSaveState) {
  if (!submitsAttempt(mode)) return undefined;
  if (mode === "block" && save === "stored") return undefined;
  return SAVE_NOTES[save];
}

/**
 * The mode the result is told in: the server's answer wins over the page's
 * (a stale page, a second tab): an attempt that did not count never says
 * «¡Resuelto!» (§2.7), and one kept for its class block says so (D49).
 */
export function resultModeOf(mode: ExerciseSolverMode, save: SolverSaveState): ExerciseSolverMode {
  if (mode !== "solve") return mode;
  if (save === "notScored") return "unscored";
  if (save === "stored") return "block";
  return mode;
}

// A retry or a preview says how it went this time, never «¡Resuelto!» (§2.7). A class
// block's solve on a day already scored (`block`, D49) is «¡Resuelto!»: it marks the block.
export const AGAIN_TITLES: Record<SolverResult["kind"], string> = {
  clean: "Esta vez, sin errores",
  hinted: "Esta vez, con pista",
  failed: "Esta vez, con un error",
  shown: "Esta vez viste la solución",
};

/** How it went, told to the student: the title, the line under it, and the tone of its mark. */
export function resultTextOf(
  result: SolverResult,
  misses: number,
  solutionShown: boolean,
  counts: boolean,
): { title: string; line: string | null; tone: "ok" | "late" | "error" } {
  if (!counts) {
    return { title: AGAIN_TITLES[result.kind], line: null, tone: isPassed(result) ? "ok" : "error" };
  }
  if (result.kind === "clean") return { title: "¡Resuelto!", line: "Sin errores.", tone: "ok" };
  if (result.kind === "hinted") return { title: "Resuelto con pista", line: "Cuenta como resuelto.", tone: "ok" };
  if (solutionShown) return { title: "Viste la solución", line: "Cuenta como fallado.", tone: "error" };
  return {
    title: misses === 1 ? "Resuelto, después de un error" : `Resuelto, después de ${misses} errores`,
    line: "Cuenta como fallado: lo decide la primera jugada.",
    tone: "late",
  };
}
