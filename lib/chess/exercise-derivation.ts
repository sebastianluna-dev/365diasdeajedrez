import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { parseSan } from "chessops/san";

// Derivación de los datos congelados de un ejercicio de entrenamiento a partir
// de jugadas SAN. Módulo puro (sólo chessops, sin Prisma) para que lo compartan
// el seed, las server actions del editor de cursos y los tests: si el editor
// derivara de otra forma que el seed, los ejercicios creados por el staff se
// comportarían distinto en el entrenador.
//
// El ejercicio guarda una COPIA congelada de la posición (`startFen`) y de la
// línea (`line`), más la ruta punteada dentro del PGN de la lección. Por eso
// existe `frozenAt`: si el PGN cambia después, el ejercicio se marca
// desactualizado en vez de romperse.

/** Ruta punteada del mainline hasta el ply indicado ("0", "0.0", ...). */
export function mainlinePath(ply: number): string {
  return Array.from({ length: ply }, () => "0").join(".");
}

/**
 * Replica jugadas SAN sobre la posición inicial y devuelve la posición
 * resultante. Lanza con el SAN y su índice si alguna es ilegal: es mejor fallar
 * al guardar que dejar un ejercicio que el entrenador rechazará después.
 */
export function positionAfter(initialFen: string | null, sans: string[]): Chess {
  const pos = initialFen ? Chess.fromSetup(parseFen(initialFen).unwrap()).unwrap() : Chess.default();

  for (const [index, san] of sans.entries()) {
    const move = parseSan(pos, san);
    if (!move) throw new Error(`Jugada ilegal "${san}" (posición ${index + 1} de [${sans.join(" ")}])`);
    pos.play(move);
  }

  return pos;
}

export interface ExerciseDerivationInput {
  /** FEN inicial de la lección, o null si empieza en la posición de partida. */
  initialFen: string | null;
  /** Jugadas previas hasta el punto donde arranca el ejercicio. */
  afterSans: string[];
  /** Tramo que el alumno debe encontrar. */
  lineSans: string[];
}

export interface DerivedExerciseData {
  startFen: string;
  startPly: number;
  endPly: number;
  line: string;
  path: string;
}

/**
 * Datos congelados del ejercicio. Valida la legalidad de las jugadas previas y
 * también la de la línea sobre la posición ya congelada, de modo que el
 * entrenador nunca reciba un SAN que no se puede jugar.
 */
export function deriveExerciseData(input: ExerciseDerivationInput): DerivedExerciseData {
  const startPos = positionAfter(input.initialFen, input.afterSans);
  const startFen = makeFen(startPos.toSetup());

  positionAfter(startFen, input.lineSans);

  const startPly = input.afterSans.length + 1;

  return {
    startFen,
    startPly,
    endPly: input.afterSans.length + input.lineSans.length,
    line: input.lineSans.join(" "),
    path: mainlinePath(startPly),
  };
}
