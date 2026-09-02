import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { extractMainline } from "@/lib/chess/mainline";

// Mantiene sincronizado el ejercicio derivado de una lección entrenable.
//
// Una lección entrenable tiene UN ejercicio, que es su línea principal. No se
// duplica el PGN: el ejercicio guarda una copia congelada (FEN de partida y SAN)
// porque es lo que permite que el entrenador siga funcionando si el PGN cambia
// después, con el aviso de desactualizado que ya existe.
//
// Se llama desde el panel de staff: al marcar la lección como entrenable y al
// guardar su PGN. Recibe el cliente como parámetro para poder ejecutarse dentro
// de la misma transacción que la escritura que lo provoca.

/** El mínimo de Prisma que necesita este servicio, para aceptar también una transacción. */
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
}

export type SyncTrainingResult =
  | { ok: true; moves: number }
  | { ok: false; reason: "notTrainable" | "noMainline" | "illegalLine" };

/** Enunciado del ejercicio derivado. */
const DERIVED_EXERCISE_PROMPT = "Reproduce la línea principal de memoria.";

/**
 * Orden del derivado. Va en 0 porque los manuales empiezan en 1 (`nextOrder`),
 * así que abre la lista sin desplazarlos; quien manda para reconocerlo es
 * `isDerived`, no este número.
 */
const DERIVED_EXERCISE_ORDER = 0;

/**
 * Deja el ejercicio derivado acorde con el PGN y con la marca de entrenable.
 *
 * Si la lección deja de ser entrenable, se borra: dejarlo vivo lo mantendría en
 * las sesiones del entrenador aunque el staff ya no quiera que se entrene.
 *
 * Sólo toca el ejercicio DERIVADO. Los que el staff haya creado a mano en el
 * editor se quedan como están, porque responden a otra intención.
 */
export async function syncLessonTrainingExercise(
  db: TrainingWriter,
  { lessonId, pgn, isTrainable }: SyncTrainingInput,
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

  let derived;
  try {
    // La línea ya salió del árbol, así que es legal por construcción; se vuelve
    // a validar aquí porque es la función que congela el FEN y no queremos que
    // el entrenador reciba nunca un SAN que no se pueda jugar.
    derived = deriveExerciseData({
      initialFen: mainline.initialFen,
      afterSans: [],
      lineSans: mainline.sans,
    });
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

  return { ok: true, moves: mainline.sans.length };
}
