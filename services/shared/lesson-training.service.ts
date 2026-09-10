import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { extractMainline } from "@/lib/chess/mainline";
import { turnColor } from "@/lib/chess/replay";

// Keeps the exercise derived from a trainable lesson in sync.
//
// A trainable lesson has ONE exercise, which is its main line. The PGN is not
// duplicated: the exercise stores a frozen copy (starting FEN and SANs) because
// that is what lets the trainer go on working if the PGN changes afterwards,
// with the stale warning that already exists.
//
// It is called from the staff panel: when marking the lesson as trainable and
// when saving its PGN. It receives the client as a parameter so it can run
// within the same transaction as the write that triggers it.

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
interface TrainingWriter {
  trainingExercise: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
    deleteMany(args: unknown): Promise<unknown>;
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
}

export interface SyncTrainingInput {
  lessonId: string;
  pgn: string;
  isTrainable: boolean;
  /**
   * Side the student plays. `null` = whoever moves first in the line, which is
   * how it behaved before this existed.
   */
  trainingColor?: "WHITE" | "BLACK" | null;
}

export type SyncTrainingResult =
  | { ok: true; moves: number }
  | { ok: false; reason: "notTrainable" | "noMainline" | "illegalLine" | "colorHasNoMoves" };

/** Prompt of the derived exercise. */
const DERIVED_EXERCISE_PROMPT = "Reproduce la línea principal de memoria.";

/**
 * Order of the derived one. It goes at 0 because the manual ones start at 1
 * (`nextOrder`), so it opens the list without displacing them; what identifies
 * it is `isDerived`, not this number.
 */
const DERIVED_EXERCISE_ORDER = 0;

/**
 * Brings the derived exercise in line with the PGN and with the trainable flag.
 *
 * If the lesson stops being trainable, it is deleted: leaving it alive would
 * keep it in the trainer's sessions even though the staff no longer wants it
 * trained.
 *
 * It only touches the DERIVED exercise. Those the staff created by hand in the
 * editor stay as they are, because they answer another intent.
 */
export async function syncLessonTrainingExercise(
  db: TrainingWriter,
  { lessonId, pgn, isTrainable, trainingColor = null }: SyncTrainingInput,
): Promise<SyncTrainingResult> {
  const existing = (await db.trainingExercise.findFirst({
    where: { lessonId, isDerived: true },
    select: { id: true },
  })) as { id: string } | null;

  if (!isTrainable) {
    if (existing) await db.trainingExercise.deleteMany({ where: { id: existing.id } });
    return { ok: false, reason: "notTrainable" };
  }

  const mainline = extractMainline(pgn);
  if (!mainline) return { ok: false, reason: "noMainline" };

  // Who moves at the start of the line. Without a starting FEN, White.
  const opensWith = mainline.initialFen ? turnColor(mainline.initialFen) : "white";
  const trains = trainingColor === BOARD_ORIENTATION.BLACK ? "black" : trainingColor === BOARD_ORIENTATION.WHITE ? "white" : opensWith;

  // If the student is NOT the one who opens, the first move is the opponent's: it
  // is pre-played and the line starts at the reply. The trainer deduces the
  // colour from `startFen`'s turn, so with this it asks for the right side
  // without touching it.
  const shift = trains === opensWith ? 0 : 1;
  const afterSans = mainline.sans.slice(0, shift);
  const lineSans = mainline.sans.slice(shift);
  if (lineSans.length === 0) return { ok: false, reason: "colorHasNoMoves" };

  let derived;
  try {
    // The line already came from the tree, so it is legal by construction; it is
    // validated again here because this is the function that freezes the FEN and we
    // never want the trainer to receive a SAN that cannot be played.
    derived = deriveExerciseData({ initialFen: mainline.initialFen, afterSans, lineSans });
  } catch {
    return { ok: false, reason: "illegalLine" };
  }

  const data = {
    order: DERIVED_EXERCISE_ORDER,
    path: derived.path,
    startPly: derived.startPly,
    endPly: derived.endPly,
    startFen: derived.startFen,
    line: derived.line,
    frozenAt: new Date(),
    promptText: DERIVED_EXERCISE_PROMPT,
    isDerived: true,
  };

  if (existing) {
    await db.trainingExercise.update({ where: { id: existing.id }, data });
  } else {
    await db.trainingExercise.create({
      data: {
        ...data,
        lesson: { connect: { id: lessonId } },
        mode: { connect: { code: EXERCISE_MODE.REPRODUCE_LINE } },
      },
    });
  }

  return { ok: true, moves: lineSans.length };
}
