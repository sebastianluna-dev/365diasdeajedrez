import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import {
  exerciseReadiness,
  exerciseTransition,
  type ExerciseOwnerKind,
  type ExerciseReadiness,
  type ExerciseTransitionRule,
} from "./exercise-status-transitions";

// The ONLY writer of an exercise's status and of the review's columns
// (`submittedAt`, `reviewedAt`, `reviewedById`, `reviewNote`, `publishedAt`).
// An insert starts DRAFT through a spread of `initialExerciseStatusData`
// (createExerciseRecord spreads it); every other status is reached here, after
// `exerciseTransition` (exercise-status-transitions.ts) says the actor may and
// the readiness gate passes. Two functions, by who asks: the owner teacher
// (`transitionOwnExercise`) and the staff (`reviewLibraryExercise`).
//
// It receives the client as its first parameter so it runs inside the
// caller's transaction, like every shared writer; no "server-only", so the
// seed and the tests drive it with their own client.

/** The minimum of Prisma that reads the status catalog, so it also accepts a transaction. */
export interface ExerciseStatusReader {
  exerciseStatus: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
}

/** What a transition reads of an exercise. */
interface TransitionRow {
  statusId: number;
  teacherId: string | null;
  lessonId: string | null;
  kindId: number;
  mateIn: number | null;
  title: string;
  solutionPgn: string;
  explanation: string | null;
  publishedAt: Date | null;
}

export interface ExerciseStatusWriter extends ExerciseStatusReader {
  exerciseKind: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  exercise: {
    findUnique(args: unknown): Promise<TransitionRow | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  exerciseTopic: { count(args: unknown): Promise<number> };
}

/** The ids of the status catalog, by code and back. */
export interface ExerciseStatusIds {
  byCode: ReadonlyMap<ExerciseStatusCode, number>;
  codeOf: ReadonlyMap<number, ExerciseStatusCode>;
}

export async function exerciseStatusIds(db: ExerciseStatusReader): Promise<ExerciseStatusIds> {
  const rows = await db.exerciseStatus.findMany({ select: { id: true, code: true } });
  const byCode = new Map<ExerciseStatusCode, number>();
  const codeOf = new Map<number, ExerciseStatusCode>();
  for (const row of rows) {
    byCode.set(row.code as ExerciseStatusCode, row.id);
    codeOf.set(row.id, row.code as ExerciseStatusCode);
  }
  return { byCode, codeOf };
}

/** The status an exercise is created with: DRAFT, always. */
export function initialExerciseStatusData(ids: ExerciseStatusIds): { statusId: number } {
  const statusId = ids.byCode.get(EXERCISE_STATUS.DRAFT);
  if (statusId === undefined) throw new Error("ExerciseStatus DRAFT is not seeded");
  return { statusId };
}

/** Why a move was not written. */
export type ExerciseTransitionRefusal =
  /** No such exercise, or not the asking teacher's. */
  | "notFound"
  /** The table has no such move for this actor and owner. */
  | "notAllowed"
  /** The staff's note is required and came empty. */
  | "noteRequired"
  /** The readiness gate failed: see `readiness`. */
  | "notReady"
  /** Somebody moved it meanwhile: it is no longer in the status the move started from. */
  | "changed";

export type ExerciseTransitionResult =
  | { ok: true; from: ExerciseStatusCode }
  | { ok: false; code: Exclude<ExerciseTransitionRefusal, "notReady"> }
  | { ok: false; code: "notReady"; readiness: ExerciseReadiness };

/** Who owns a row: the lesson, the teacher, or the academy (neither). */
function ownerOf(row: Pick<TransitionRow, "teacherId" | "lessonId">): ExerciseOwnerKind {
  if (row.lessonId !== null) return "lesson";
  return row.teacherId === null ? "academy" : "teacher";
}

/** The review columns a move writes beside the status. */
function transitionStamps(
  rule: ExerciseTransitionRule,
  row: TransitionRow,
  actorUserId: string,
  note: string | null,
  now: Date,
): Record<string, Date | string | null> {
  const stamps: Record<string, Date | string | null> = {};
  // A fresh proposal: the note of an earlier return no longer applies.
  if (rule.to === EXERCISE_STATUS.IN_REVIEW) Object.assign(stamps, { submittedAt: now, reviewNote: null });
  // An archived lesson exercise leaves the lesson's order (CHECK exercise_lesson_order_needs_lesson lets it stay
  // without one): the panel lists it apart, and a new one takes the place.
  if (rule.to === EXERCISE_STATUS.ARCHIVED && rule.owners.includes("lesson") && row.lessonId !== null) {
    stamps.lessonOrder = null;
  }
  // Every move of the staff is a decision of the review, with its note.
  if (rule.role === "staff") Object.assign(stamps, { reviewedAt: now, reviewedById: actorUserId, reviewNote: note });
  // The FIRST publication is kept: «was ever in the library» is what lets a teacher keep seeing its attempts.
  if (rule.to === EXERCISE_STATUS.PUBLISHED) stamps.publishedAt = row.publishedAt ?? now;
  return stamps;
}

interface MoveInput {
  exerciseId: string;
  to: ExerciseStatusCode;
  actorUserId: string;
  note: string | null;
  now: Date;
}

async function move(
  db: ExerciseStatusWriter,
  input: MoveInput,
  role: ExerciseTransitionRule["role"],
  ownerTeacherId: string | null,
): Promise<ExerciseTransitionResult> {
  const [ids, kinds, row] = await Promise.all([
    exerciseStatusIds(db),
    db.exerciseKind.findMany({ select: { id: true, code: true } }),
    db.exercise.findUnique({
      where: { id: input.exerciseId },
      select: {
        statusId: true,
        teacherId: true,
        lessonId: true,
        kindId: true,
        mateIn: true,
        title: true,
        solutionPgn: true,
        explanation: true,
        publishedAt: true,
      },
    }),
  ]);
  if (!row) return { ok: false, code: "notFound" };
  if (role === "ownerTeacher" && (row.teacherId === null || row.teacherId !== ownerTeacherId)) {
    return { ok: false, code: "notFound" };
  }
  const from = ids.codeOf.get(row.statusId);
  const toId = ids.byCode.get(input.to);
  const rule = from ? exerciseTransition(from, input.to, role, ownerOf(row)) : null;
  if (!from || !rule || toId === undefined) return { ok: false, code: "notAllowed" };

  const note = input.note?.trim() || null;
  if (rule.note && note === null) return { ok: false, code: "noteRequired" };

  if (rule.readiness) {
    const kind = kinds.find((candidate) => candidate.id === row.kindId)?.code as ExerciseKindCode | undefined;
    if (!kind) throw new Error(`ExerciseKind ${row.kindId} is not seeded`);
    const topicCount = await db.exerciseTopic.count({ where: { exerciseId: input.exerciseId } });
    const readiness = exerciseReadiness(
      {
        title: row.title,
        solutionPgn: row.solutionPgn,
        kind,
        mateIn: row.mateIn,
        topicCount,
        explanation: row.explanation,
      },
      { explanation: rule.explanation },
    );
    if (!readiness.ok) return { ok: false, code: "notReady", readiness };
  }

  // Conditioned on the status it started from: two moves that overlap write once.
  const result = await db.exercise.updateMany({
    where: { id: input.exerciseId, statusId: row.statusId },
    data: { statusId: toId, ...transitionStamps(rule, row, input.actorUserId, note, input.now) },
  });
  return result.count > 0 ? { ok: true, from } : { ok: false, code: "changed" };
}

export interface TransitionOwnExerciseInput {
  exerciseId: string;
  /** The asking teacher: the exercise must be theirs. */
  teacherId: string;
  actorUserId: string;
  to: ExerciseStatusCode;
  now: Date;
}

/**
 * The owner teacher's moves: mark ready, propose to the library, withdraw the
 * proposal, archive and restore. Another teacher's exercise, or the
 * academy's, answers `notFound`.
 */
export async function transitionOwnExercise(
  db: ExerciseStatusWriter,
  input: TransitionOwnExerciseInput,
): Promise<ExerciseTransitionResult> {
  return move(db, { ...input, note: null }, "ownerTeacher", input.teacherId);
}

export interface ReviewLibraryExerciseInput {
  exerciseId: string;
  reviewerUserId: string;
  to: ExerciseStatusCode;
  /** «Devolver» and «Quitar de la biblioteca» require it; elsewhere it is optional. */
  note: string | null;
  now: Date;
}

/**
 * The staff's moves: approve or return a proposal, take an exercise out of
 * the library, publish, archive or restore the academy's, and publish, take
 * back to draft or archive a lesson's (an archived one loses its
 * `lessonOrder`). Each one stamps who decided, when, and the note.
 */
export async function reviewLibraryExercise(
  db: ExerciseStatusWriter,
  input: ReviewLibraryExerciseInput,
): Promise<ExerciseTransitionResult> {
  return move(db, { ...input, actorUserId: input.reviewerUserId }, "staff", null);
}
