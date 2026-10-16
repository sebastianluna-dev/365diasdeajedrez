import type { SolutionProblem, SolutionWarning } from "@/lib/chess/exercise-format";
import { numberedMoveLabel, sanToSpanish } from "@/lib/chess/notation";
import { parsePgnTree, type PgnTree } from "@/lib/chess/pgn-tree";
import type { SetupProblem } from "@/lib/chess/position-setup";
import { SERIES_LIMITS } from "@/constants/platform/exercise.const";

// What the exercise editor says, in one place (docs → Chess → Library for the
// position setup and the solution's rules). «Ejercicio» is masculine: every
// message about one agrees with it. Pure module, no "server-only": the
// editor, the actions and the pages share it.

/** Why «Colocar piezas» refuses a position, under the board (`validateSetup`). */
export const SETUP_PROBLEM_MESSAGES: Record<SetupProblem, string> = {
  empty: "Coloca al menos los dos reyes.",
  kings: "Cada bando necesita exactamente un rey.",
  pawnsOnBackrank: "Hay peones en la primera o la última fila.",
  oppositeCheck: "El bando que no juega está en jaque: esa posición no puede darse.",
  castling: "Ese enroque necesita el rey y la torre en su casilla.",
  enPassant: "Esa casilla al paso no es posible en esta posición.",
  impossibleCheck: "Ese jaque no puede darse en una partida.",
  impossibleMaterial: "Hay más piezas de las que puede tener un bando.",
};

/**
 * What a field or the whole save says when the server refuses it, by the
 * code the save returns (`PopupFormState`) or a row action redirects with
 * (`?error=`).
 */
export const EXERCISE_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  disabled: "Los ejercicios todavía no están disponibles.",
  throttled: "Has hecho demasiados cambios seguidos. Espera un momento y vuelve a intentarlo.",
  notFound: "Ese ejercicio ya no existe o no es tuyo.",
  locked: "Este ejercicio no se puede editar ahora: duplícalo para hacer tu versión.",
  changed: "Alguien cambió este ejercicio mientras lo editabas. Recarga la página y vuelve a intentarlo.",
  notReady: "Le falta algo para estar listo: ábrelo, complétalo y vuelve a intentarlo.",
  notAllowed: "Ese cambio no se puede hacer en este momento.",
  deleteBlocked: "Este ejercicio ya tiene intentos: archívalo en vez de eliminarlo.",
  title: "Escribe un título.",
  prompt: "El enunciado es demasiado largo.",
  kind: "Elige el tipo de ejercicio.",
  mateIn: "Elige en cuántas jugadas es el mate.",
  difficulty: "La dificultad va de 400 a 3000, de 50 en 50.",
  topics: "Elige al menos un tema para marcarlo como listo.",
  hints: "Cada pista tiene como máximo 300 caracteres.",
  explanation: "La explicación es demasiado larga.",
  sourceWhite: "El nombre es demasiado largo.",
  sourceBlack: "El nombre es demasiado largo.",
  sourceEvent: "El evento es demasiado largo.",
  sourceYear: "El año va de 1400 a 2100.",
  solutionPgn: "La solución es demasiado larga.",
  unreadable: "No se pudo leer la solución.",
  badPosition: "La posición inicial no es válida.",
  unsupportedVariant: "Sólo se admite el ajedrez estándar.",
  mateInMissing: "Elige en cuántas jugadas es el mate.",
  mateInOnSequence: "Una secuencia no lleva número de jugadas de mate.",
  seriesTitle: "Escribe un título para la serie.",
  seriesDescription: "La descripción es demasiado larga.",
  seriesNotFound: "Esa serie ya no existe o no es tuya.",
  seriesChanged: "La serie cambió mientras tanto: vuelve a intentarlo.",
  seriesExercises: "Elige al menos un ejercicio.",
  seriesNotPickable: "Alguno de esos ejercicios ya no se puede agregar: cierra la ventana y vuelve a abrirla.",
  seriesFull: `Una serie tiene como máximo ${SERIES_LIMITS.items} ejercicios.`,
  notAssigned: "Ese alumno ya no está asignado contigo.",
};

/** What the address's `?aviso=` says on the exercise pages. */
export const EXERCISE_NOTICES = {
  exerciseSaved: "Ejercicio guardado.",
  exerciseReady: "Ejercicio guardado y listo: ya puedes dárselo a tus alumnos.",
  exerciseDuplicated: "Ejercicio duplicado: esta es tu copia, como borrador.",
  exerciseArchived: "Ejercicio archivado.",
  exerciseRestored: "Ejercicio restaurado: vuelve a estar listo.",
  exerciseDeleted: "Ejercicio eliminado.",
  seriesCreated: "Serie creada: agrégale ejercicios y dásela a tus alumnos.",
  seriesSaved: "Serie guardada.",
  seriesExercisesAdded: "Ejercicios agregados a la serie.",
  seriesExerciseRemoved: "Ejercicio quitado de la serie: sigue en tu banco.",
  seriesDeleted: "Serie eliminada. Sus ejercicios siguen en tu banco.",
  seriesShared: "Listo: la verá en «Ejercicios».",
  seriesUnshared: "Ese alumno ya no tiene la serie.",
} as const satisfies Record<string, string>;

export type ExerciseNoticeCode = keyof typeof EXERCISE_NOTICES;

/** The notice of a `?aviso=` value, or null for anything `withNoticeParam` could not have written here. */
export function readExerciseNotice(raw: string | string[] | undefined): string | null {
  if (typeof raw !== "string" || !Object.hasOwn(EXERCISE_NOTICES, raw)) return null;
  return EXERCISE_NOTICES[raw as ExerciseNoticeCode];
}

/** «14. Cxe5»: the move at a path, numbered, in Spanish; the bare path's depth when the tree lacks it. */
function moveAt(tree: PgnTree | null, path: string): string {
  const node = tree?.nodesByPath.get(path);
  return node ? numberedMoveLabel(node.ply, node.san) : `la jugada ${path.split(".").length}`;
}

/**
 * A problem of the solution in words, as the «Solución» tab lists it under
 * the board. `pgn` is the solution the problem was found in, to name the
 * moves; `mateIn` the N of «Mate en N».
 */
export function solutionProblemText(problem: SolutionProblem, pgn: string, mateIn: number | null): string {
  const tree = "path" in problem ? parsePgnTree(pgn) : null;
  const n = mateIn ?? 0;
  switch (problem.code) {
    case "unreadable":
    case "badPosition":
    case "unsupportedVariant":
    case "mateInMissing":
    case "mateInOnSequence":
      return EXERCISE_ERROR_MESSAGES[problem.code] ?? EXERCISE_ERROR_MESSAGES.invalid ?? "";
    case "noMoves":
      return "Juega la solución en el tablero: todavía no tiene jugadas.";
    case "illegalMove":
      return "Una variante tiene una jugada ilegal y se cortó ahí.";
    case "notMate":
      return `La línea de ${moveAt(tree, problem.path)} no termina en mate.`;
    case "mateTooLong":
      return `La línea de ${moveAt(tree, problem.path)} da mate en más de ${n} ${n === 1 ? "jugada" : "jugadas"}.`;
    case "mateLengthMismatch":
      return `La línea principal da mate antes de ${n} jugadas: cambia el número o la solución.`;
    case "notForced":
      return `Hay una defensa que la solución no cubre y que evita el mate en ${n}.`;
    case "mistakeVariant":
      return `La variante ${moveAt(tree, problem.path)} está marcada como error y se aceptaría como solución.`;
  }
}

/** A warning of the solution in words: it never stops a save. */
export function solutionWarningText(warning: SolutionWarning, pgn: string): string {
  switch (warning.code) {
    case "opponentVariant":
      return "La respuesta del rival siempre es la línea principal; las otras se ven al mostrar la solución.";
    case "playerAlternatives":
      return `Se aceptan: ${warning.sans.map(sanToSpanish).join(", ")}.`;
    case "shortAlternative":
      return `La variante de ${moveAt(parsePgnTree(pgn), warning.path)} termina antes que la línea principal.`;
  }
}
