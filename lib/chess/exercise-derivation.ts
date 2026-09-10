import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { parseSan } from "chessops/san";

// Derivation of the frozen data of a training exercise from SAN moves. Pure
// module (only chessops, no Prisma) so it can be shared by the seed, the
// course editor's server actions and the tests: if the editor derived
// differently from the seed, exercises created by the staff would behave
// differently in the trainer.
//
// The exercise stores a frozen COPY of the position (`startFen`) and of the
// line (`line`), plus the dotted path within the lesson's PGN. That is why
// `frozenAt` exists: if the PGN changes afterwards, the exercise is marked
// stale instead of breaking.

/** Dotted path of the mainline up to the given ply ("0", "0.0", ...). */
export function mainlinePath(ply: number): string {
  return Array.from({ length: ply }, () => "0").join(".");
}

/**
 * Replays SAN moves over the initial position and returns the resulting
 * position. Throws with the SAN and its index if any is illegal: better to fail
 * on save than to leave an exercise the trainer will reject later.
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
  /** Initial FEN of the lesson, or null when it starts at the standard position. */
  initialFen: string | null;
  /** Previous moves up to the point where the exercise begins. */
  afterSans: string[];
  /** The segment the student has to find. */
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
 * Frozen data of the exercise. It validates the legality of the previous moves
 * and also that of the line over the already frozen position, so the trainer
 * never receives a SAN that cannot be played.
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
