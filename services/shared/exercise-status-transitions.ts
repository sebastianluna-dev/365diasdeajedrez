import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { analyzeSolution, type SolutionProblem } from "@/lib/chess/exercise-format";

// Which status an exercise may move to, who may move it, and what the move
// needs (D07, D16; docs → Platform → Data model). Pure module: the status
// writer (exercise-status.service.ts) consults it before writing, and the
// editor and the bank draw their buttons from the same table, so a button
// never offers what the save would refuse.
//
// A teacher's exercise: DRAFT → READY (its teacher's students may get it),
// READY → IN_REVIEW («Proponer a la biblioteca»), back to READY («Retirar la
// propuesta», or the staff's «Devolver»), IN_REVIEW → PUBLISHED (the staff
// approves), PUBLISHED → READY (the staff's «Quitar de la biblioteca»), and
// DRAFT/READY ⇄ ARCHIVED. The academy's (no teacher): DRAFT → PUBLISHED with
// no review — the staff is the reviewer — and PUBLISHED → ARCHIVED →
// DRAFT. A lesson's (phase 2): DRAFT ⇄ PUBLISHED, ARCHIVED from either, and
// back to DRAFT («Restaurar», at the end of the lesson).

/** Who owns the exercise: a teacher, the academy (`teacherId` null), or a lesson (phase 2). */
export type ExerciseOwnerKind = "teacher" | "academy" | "lesson";

/** Who asks for the move: the owner teacher, or the staff. */
export type ExerciseActorRole = "ownerTeacher" | "staff";

/** What a move needs before it is written. */
export interface ExerciseTransitionRule {
  from: ExerciseStatusCode;
  to: ExerciseStatusCode;
  role: ExerciseActorRole;
  owners: readonly ExerciseOwnerKind[];
  /** `exerciseReadiness` must pass: the solution, a title and a topic. */
  readiness: boolean;
  /** A library exercise is solved by students with no teacher to ask: it needs an explanation too. */
  explanation: boolean;
  /** The staff's note is required (a returned or withdrawn exercise says why). */
  note: boolean;
}

const { DRAFT, READY, IN_REVIEW, PUBLISHED, ARCHIVED } = EXERCISE_STATUS;

const rule = (
  from: ExerciseStatusCode,
  to: ExerciseStatusCode,
  role: ExerciseActorRole,
  owners: readonly ExerciseOwnerKind[],
  needs: Partial<Pick<ExerciseTransitionRule, "readiness" | "explanation" | "note">> = {},
): ExerciseTransitionRule => ({
  from,
  to,
  role,
  owners,
  readiness: needs.readiness ?? false,
  explanation: needs.explanation ?? false,
  note: needs.note ?? false,
});

/** The whole table (PLAN.md §8). A move that is not here is refused. */
export const EXERCISE_TRANSITIONS: readonly ExerciseTransitionRule[] = [
  rule(DRAFT, READY, "ownerTeacher", ["teacher"], { readiness: true }),
  rule(READY, IN_REVIEW, "ownerTeacher", ["teacher"], { readiness: true, explanation: true }),
  rule(IN_REVIEW, READY, "ownerTeacher", ["teacher"]),
  rule(IN_REVIEW, READY, "staff", ["teacher"], { note: true }),
  rule(IN_REVIEW, PUBLISHED, "staff", ["teacher"], { readiness: true, explanation: true }),
  rule(PUBLISHED, READY, "staff", ["teacher"], { note: true }),
  rule(DRAFT, PUBLISHED, "staff", ["academy", "lesson"], { readiness: true }),
  rule(PUBLISHED, DRAFT, "staff", ["lesson"]),
  rule(PUBLISHED, ARCHIVED, "staff", ["academy", "lesson"]),
  rule(DRAFT, ARCHIVED, "staff", ["lesson"]),
  rule(DRAFT, ARCHIVED, "ownerTeacher", ["teacher"]),
  rule(READY, ARCHIVED, "ownerTeacher", ["teacher"]),
  rule(ARCHIVED, READY, "ownerTeacher", ["teacher"], { readiness: true }),
  rule(ARCHIVED, DRAFT, "staff", ["academy", "lesson"]),
];

/** The rule that lets `role` move an exercise of `owner` from `from` to `to`, or null. */
export function exerciseTransition(
  from: ExerciseStatusCode,
  to: ExerciseStatusCode,
  role: ExerciseActorRole,
  owner: ExerciseOwnerKind,
): ExerciseTransitionRule | null {
  return (
    EXERCISE_TRANSITIONS.find(
      (candidate) =>
        candidate.from === from && candidate.to === to && candidate.role === role && candidate.owners.includes(owner),
    ) ?? null
  );
}

/** The statuses `role` may move an exercise of `owner` to from `from`, in the table's order. */
export function exerciseTransitionsFrom(
  from: ExerciseStatusCode,
  role: ExerciseActorRole,
  owner: ExerciseOwnerKind,
): ExerciseStatusCode[] {
  return EXERCISE_TRANSITIONS.filter(
    (candidate) => candidate.from === from && candidate.role === role && candidate.owners.includes(owner),
  ).map((candidate) => candidate.to);
}

/**
 * Whose content is locked for its owner teacher: one in review or in the
 * library is edited only by the staff; the teacher withdraws the proposal or
 * duplicates it (D07, PLAN.md §8 default).
 */
export function isExerciseContentLocked(status: ExerciseStatusCode, owner: ExerciseOwnerKind): boolean {
  return owner === "teacher" && (status === IN_REVIEW || status === PUBLISHED);
}

/** What the readiness gate reads of an exercise. */
export interface ExerciseReadinessInput {
  title: string;
  solutionPgn: string;
  kind: ExerciseKindCode;
  mateIn: number | null;
  topicCount: number;
  explanation: string | null;
}

/** Why an exercise is not ready: its solution's problems and the data it lacks. */
export interface ExerciseReadiness {
  ok: boolean;
  solution: SolutionProblem[];
  missing: ("title" | "topic" | "explanation")[];
}

/**
 * The readiness gate (READY, IN_REVIEW, PUBLISHED, an import as ready): the
 * solution passes `analyzeSolution` (every rule of «Mate en N» included), and
 * it has a title and at least one topic; with `explanation`, an explanation
 * too. The difficulty is a NOT NULL column with its CHECK, so it is always
 * there.
 */
export function exerciseReadiness(
  exercise: ExerciseReadinessInput,
  needs: { explanation: boolean } = { explanation: false },
): ExerciseReadiness {
  const analysis = analyzeSolution({ solutionPgn: exercise.solutionPgn, kind: exercise.kind, mateIn: exercise.mateIn });
  const solution = analysis.ok ? [] : analysis.problems;
  const missing: ExerciseReadiness["missing"] = [];
  if (exercise.title.trim().length === 0) missing.push("title");
  if (exercise.topicCount === 0) missing.push("topic");
  if (needs.explanation && (exercise.explanation ?? "").trim().length === 0) missing.push("explanation");
  return { ok: solution.length === 0 && missing.length === 0, solution, missing };
}
