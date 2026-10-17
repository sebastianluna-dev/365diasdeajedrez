import { z } from "zod";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { TOPIC } from "@/constants/platform/shared-codes.const";
import { MATE_IN_MAX } from "@/lib/chess/exercise-format";
import type { ExerciseImportDefaults, ExerciseImportRow } from "./exercise-import";
import { formCheckbox, formCode, formCodeList, formInt, parseForm } from "./form-schema";
import type { PopupFormState } from "./form-state";

// The import page's form (D12; PLAN.md §4.5), read the same way for the
// teacher and the staff: the PGN, the defaults for what the headers do not
// say, what the accepted ones become, the series they join, and which of the
// two steps the button asked for. Pure module (zod only): the actions read
// the `FormData` with it, and the page's state carries the report back.

/** The two steps: «Revisar» writes nothing and answers the report; «Importar» writes what the report accepted. */
export type ExerciseImportIntent = "preview" | "import";

/** The status the accepted ones get: «Borrador», or the author's «ready» («Listo» for a teacher, «En la biblioteca» for the staff). */
export type ExerciseImportStatusChoice = "draft" | "ready";

export const EXERCISE_IMPORT_SCHEMA = z.object({
  pgn: z.string().min(1).max(PGN_MAX_LENGTH),
  difficulty: formInt(EXERCISE_LIMITS.difficultyMin, EXERCISE_LIMITS.difficultyMax),
  kind: formCode([EXERCISE_KIND.SEQUENCE, EXERCISE_KIND.MATE_IN]),
  /** Read only for «Mate en N»; a sequence ignores it. */
  mateIn: z.string().trim().max(2).optional(),
  topics: formCodeList(Object.values(TOPIC)),
  status: formCode(["draft", "ready"]),
  /** The series the imported ones join, at its end; empty for none. */
  seriesId: z.string().trim().max(64).optional(),
  dropMistakeVariants: formCheckbox(),
  intent: formCode(["preview", "import"]),
});

/** The names handed back on a refusal, so the form opens again with them (the PGN included: it is what the author pasted). */
export const EXERCISE_IMPORT_FIELDS = Object.keys(
  EXERCISE_IMPORT_SCHEMA.shape,
) as (keyof typeof EXERCISE_IMPORT_SCHEMA.shape)[];

export interface ExerciseImportFormValues {
  pgn: string;
  intent: ExerciseImportIntent;
  status: ExerciseImportStatusChoice;
  seriesId: string | null;
  /** What `readExerciseImport` needs, with the target still to be named by the author's role. */
  defaults: Omit<ExerciseImportDefaults, "target">;
}

export type ExerciseImportFormRead =
  | { ok: true; values: ExerciseImportFormValues }
  /** The first field that failed and zod's code for it. */
  | { ok: false; field: string; code: string };

/** Reads the import form. The N of «Mate en N» is required with that kind and dropped with a sequence. */
export function readExerciseImportForm(formData: FormData): ExerciseImportFormRead {
  const parsed = parseForm(EXERCISE_IMPORT_SCHEMA, formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  if (data.difficulty % EXERCISE_LIMITS.difficultyStep !== 0) return { ok: false, field: "difficulty", code: "step" };
  const kind: ExerciseKindCode = data.kind;
  let mateIn: number | null = null;
  if (kind === EXERCISE_KIND.MATE_IN) {
    const value = data.mateIn && /^\d+$/.test(data.mateIn) ? Number.parseInt(data.mateIn, 10) : Number.NaN;
    if (!Number.isInteger(value) || value < 1 || value > MATE_IN_MAX) {
      return { ok: false, field: "mateIn", code: "invalid_value" };
    }
    mateIn = value;
  }
  return {
    ok: true,
    values: {
      pgn: data.pgn,
      intent: data.intent,
      status: data.status,
      seriesId: data.seriesId ? data.seriesId : null,
      defaults: {
        difficulty: data.difficulty,
        kind,
        mateIn,
        topicCodes: [...new Set(data.topics)],
        dropMistakeVariants: data.dropMistakeVariants,
      },
    },
  };
}

/** One row of the report as the page draws it: words, never chess. */
export interface ExerciseImportReportRow {
  index: number;
  title: string;
  outcome: ExerciseImportRow["outcome"];
  /** «Se importará», «Se importará como borrador: le faltan temas», «No se importará: …». */
  status: string;
  /** «Se quitó la variante 14. Cxe5 (marcada como error)», «Se aceptan varias jugadas: Tb8#, Da8#». */
  notes: string[];
}

export interface ExerciseImportReport {
  rows: ExerciseImportReportRow[];
  counts: { ready: number; draft: number; skipped: number };
}

/**
 * The state the import form gets back: the popup form's — a refusal with its
 * fields, or the done notice —, plus the report «Revisar» answers, which the
 * page keeps on screen while the author decides.
 */
export interface ExerciseImportFormState extends PopupFormState {
  report?: ExerciseImportReport;
}

export const EXERCISE_IMPORT_IDLE: ExerciseImportFormState = { status: "idle" };
