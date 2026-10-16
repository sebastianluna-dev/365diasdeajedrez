import { z } from "zod";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { TOPIC } from "@/constants/platform/shared-codes.const";
import type { SolutionInput, SolutionProblem } from "@/lib/chess/exercise-format";
import { MATE_IN_MAX } from "@/lib/chess/exercise-format";
import type { ExerciseContent, ExerciseSolutionProblem } from "./exercise-record.service";
import { formCode, formCodeList, formInt, formOptionalText, formText, parseForm } from "./form-schema";

// The exercise editor's form, read the same way for every author (the
// teacher's bank, the staff's library, a lesson's exercises): one zod schema,
// so a field the teacher may leave empty is the one the staff may too. Pure
// module (zod only): the actions read the `FormData` with it, and the editor
// checks the same rules before submitting and maps each error to its tab.

/** The editor's tabs, where an error is shown (PLAN.md §4.2). */
export type ExerciseFormTab = "position" | "solution" | "data";

/** An optional integer within [min, max]: empty is null, anything else must be one. */
function formOptionalInt(min: number, max: number) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value, context) => {
      if (!value) return null;
      const parsed = /^-?\d+$/.test(value) ? Number.parseInt(value, 10) : Number.NaN;
      if (Number.isInteger(parsed) && parsed >= min && parsed <= max) return parsed;
      context.addIssue({ code: "custom", message: `Se esperaba un entero entre ${min} y ${max}.` });
      return z.NEVER;
    });
}

/** Every field the editor's save sends, by its name. */
export const EXERCISE_FORM_SCHEMA = z.object({
  title: formText(EXERCISE_LIMITS.title),
  prompt: formOptionalText(EXERCISE_LIMITS.prompt),
  kind: formCode([EXERCISE_KIND.SEQUENCE, EXERCISE_KIND.MATE_IN]),
  /** Read only for «Mate en N»; a sequence ignores it. */
  mateIn: z.string().trim().max(2).optional(),
  difficulty: formInt(EXERCISE_LIMITS.difficultyMin, EXERCISE_LIMITS.difficultyMax),
  /** Topic codes; at least one is a readiness rule, said by the save's error, not by this schema (a draft may have none). */
  topics: formCodeList(Object.values(TOPIC)),
  /** The three «Pistas» inputs share the name; the empty ones are dropped. */
  hints: z.array(z.string().max(EXERCISE_LIMITS.hint)).max(EXERCISE_LIMITS.hints),
  explanation: formOptionalText(EXERCISE_LIMITS.explanation),
  sourceWhite: formOptionalText(EXERCISE_LIMITS.sourcePlayer),
  sourceBlack: formOptionalText(EXERCISE_LIMITS.sourcePlayer),
  sourceEvent: formOptionalText(EXERCISE_LIMITS.sourceEvent),
  sourceYear: formOptionalInt(EXERCISE_LIMITS.sourceYearMin, EXERCISE_LIMITS.sourceYearMax),
  solutionPgn: z.string().trim().min(1).max(EXERCISE_LIMITS.solutionPgn),
});

/** The names `readFormValues` hands back on a refused save, so the editor reopens with them. */
export const EXERCISE_FORM_FIELDS = Object.keys(
  EXERCISE_FORM_SCHEMA.shape,
) as (keyof typeof EXERCISE_FORM_SCHEMA.shape)[];

/** An exercise as the editor sends it: the solution and the content, ready for the writers. */
export interface ExerciseFormValues {
  solution: SolutionInput;
  content: ExerciseContent;
}

export type ExerciseFormRead =
  | { ok: true; values: ExerciseFormValues }
  /** The first field that failed (`mateIn` when «Mate en N» has no N) and zod's code for it. */
  | { ok: false; field: string; code: string };

/** Reads the editor's save. The N of «Mate en N» is required with that kind and dropped with a sequence. */
export function readExerciseForm(formData: FormData): ExerciseFormRead {
  const parsed = parseForm(EXERCISE_FORM_SCHEMA, formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
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
      solution: { solutionPgn: data.solutionPgn, kind, mateIn },
      content: {
        title: data.title,
        prompt: data.prompt,
        difficulty: data.difficulty,
        hints: data.hints.map((hint) => hint.trim()).filter((hint) => hint.length > 0),
        explanation: data.explanation,
        sourceWhite: data.sourceWhite,
        sourceBlack: data.sourceBlack,
        sourceEvent: data.sourceEvent,
        sourceYear: data.sourceYear,
        topicCodes: [...new Set(data.topics)],
      },
    },
  };
}

/** The problems of the start position: they belong to «Posición». */
const POSITION_PROBLEMS = new Set<string>(["badPosition", "unsupportedVariant"]);
/** The kind and its N are «Datos» fields. */
const DATA_PROBLEMS = new Set<string>(["mateInMissing", "mateInOnSequence"]);

/**
 * The tab an error is shown on: a field of «Datos» by its name, the start's
 * problems on «Posición», and the rest of the solution's on «Solución».
 */
export function exerciseErrorTab(
  error: { field: string } | { problem: SolutionProblem["code"] | ExerciseSolutionProblem },
): ExerciseFormTab {
  if ("field" in error) return error.field === "solutionPgn" ? "solution" : "data";
  if (POSITION_PROBLEMS.has(error.problem)) return "position";
  if (DATA_PROBLEMS.has(error.problem)) return "data";
  return "solution";
}
