import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { MATE_IN_MAX, readSolutionStart, type SolutionInput } from "@/lib/chess/exercise-format";
import { createPositionHash } from "@/lib/chess/position-hash";
import { syncCatalogJoin } from "./catalog-join.service";
import { exerciseStatusIds, initialExerciseStatusData, type ExerciseStatusReader } from "./exercise-status.service";

// Creating an exercise, and the ONLY writers of its solution (docs → Platform
// → Data model, «Exercises»).
//
// `solutionPgn` is the source (D02, D10); `kindId` and `mateIn` are inputs of
// its validity («Mate en N» lines must mate within N); `startFen`,
// `startPositionHash`, `solutionPlies` and `playerMoves` are frozen from it so
// lists draw an exercise without parsing. The seven are computed together by
// ONE pure function here (`exerciseSolutionColumns`) that the two writers —
// create and change — spread into their `data`, and that the seed spreads
// too, so a stored start never disagrees with its PGN.
//
// EVERY insert of an exercise goes through `createExerciseRecord`: the
// editor's save, «Duplicar», a library exercise copied to a lesson and the
// PGN import. It starts DRAFT (the status writer's `initialExerciseStatusData`
// spread); a button that asks for READY or PUBLISHED then calls the status
// writer in the same transaction. services/shared/exercise-writers.test.ts
// reads every write of the app and holds both rules.
//
// They receive the client as their first parameter so they run inside the
// caller's transaction, like every shared writer; no "server-only".

/** Why a solution cannot be stored, even as a draft. */
export type ExerciseSolutionProblem =
  | "unreadable"
  | "badPosition"
  | "unsupportedVariant"
  /** «Mate en N» without an N of 1–5. */
  | "mateInMissing"
  /** A sequence that carries an N. */
  | "mateInOnSequence";

/**
 * What stops a solution from being stored at all: a start that does not read
 * (`readSolutionStart`) or a kind and N that do not go together. A draft needs
 * only this; whether it is READY is `exerciseReadiness`'s question.
 */
export function exerciseSolutionProblem(input: SolutionInput): ExerciseSolutionProblem | null {
  if (input.kind === EXERCISE_KIND.MATE_IN) {
    if (input.mateIn === null || !Number.isInteger(input.mateIn) || input.mateIn < 1 || input.mateIn > MATE_IN_MAX) {
      return "mateInMissing";
    }
  } else if (input.mateIn !== null) {
    return "mateInOnSequence";
  }
  const start = readSolutionStart(input.solutionPgn);
  return start.ok ? null : start.problem;
}

/** The seven columns of a solution. */
export interface ExerciseSolutionColumns {
  solutionPgn: string;
  kindId: number;
  mateIn: number | null;
  startFen: string;
  startPositionHash: string;
  solutionPlies: number;
  playerMoves: number;
}

/**
 * The seven columns that say what an exercise asks, always together: the
 * normalised PGN (`readSolutionStart`), its start, the start's hash, the
 * plies and player moves of its main line, and the kind with its N. The
 * writers check `exerciseSolutionProblem` first; a solution that would not
 * store is a bug of the caller, so it throws.
 */
export function exerciseSolutionColumns(
  input: SolutionInput,
  kindIds: ReadonlyMap<ExerciseKindCode, number>,
): ExerciseSolutionColumns {
  const problem = exerciseSolutionProblem(input);
  const start = readSolutionStart(input.solutionPgn);
  if (problem !== null || !start.ok) throw new Error(`The solution cannot be stored: ${problem ?? "unreadable"}`);
  const kindId = kindIds.get(input.kind);
  if (kindId === undefined) throw new Error(`ExerciseKind ${input.kind} is not seeded`);
  return {
    solutionPgn: start.normalizedPgn,
    kindId,
    mateIn: input.kind === EXERCISE_KIND.MATE_IN ? input.mateIn : null,
    startFen: start.startFen,
    startPositionHash: createPositionHash(start.startFen),
    solutionPlies: start.solutionPlies,
    playerMoves: start.playerMoves,
  };
}

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
export interface ExerciseRecordWriter extends ExerciseStatusReader {
  exerciseKind: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  exercise: {
    create(args: unknown): Promise<{ id: string }>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  exerciseTopic: { deleteMany(args: unknown): Promise<unknown>; createMany(args: unknown): Promise<unknown> };
  topic: { findMany(args: unknown): Promise<{ id: number }[]> };
}

/** The kind catalog, by code. */
export async function exerciseKindIds(
  db: Pick<ExerciseRecordWriter, "exerciseKind">,
): Promise<ReadonlyMap<ExerciseKindCode, number>> {
  const rows = await db.exerciseKind.findMany({ select: { id: true, code: true } });
  return new Map(rows.map((row) => [row.code as ExerciseKindCode, row.id]));
}

/** What an exercise says besides its solution: the content an author writes and a copy carries. */
export interface ExerciseContent {
  title: string;
  prompt: string | null;
  difficulty: number;
  hints: string[];
  explanation: string | null;
  sourceWhite: string | null;
  sourceBlack: string | null;
  sourceEvent: string | null;
  sourceYear: number | null;
  /** Topic codes (`TOPIC`), the whole set. */
  topicCodes: string[];
}

export interface CreateExerciseRecordInput {
  /** Fixed by the seed; otherwise Prisma generates it. */
  id?: string;
  /** The owner: the teacher's id, or null for the academy's (D07) or a lesson's. */
  teacherId: string | null;
  /**
   * The lesson that owns it (D04, D05), with its place in the lesson; never
   * with a `teacherId` (CHECK exercise_single_owner). A taken order throws
   * P2002 on `Exercise_lessonId_lessonOrder_key`, which the caller reads with
   * `isUniqueConstraintError`.
   */
  lesson?: { lessonId: string; lessonOrder: number } | null;
  authorUserId: string | null;
  solution: SolutionInput;
  content: ExerciseContent;
  /** «Crear ejercicio desde aquí» (D11): the study game it came from. Never set by a copy. */
  sourceGameId?: string | null;
  /** «Duplicar» and a lesson copy (D28): the exercise it was copied from. */
  copiedFromId?: string | null;
}

/** The author's hints as stored: trimmed, the empty ones dropped (the column's CHECK allows three). */
function storedHints(hints: readonly string[]): string[] {
  return hints.map((hint) => hint.trim()).filter((hint) => hint.length > 0);
}

/**
 * Creates an exercise, DRAFT, with its solution's columns computed here and
 * its topics written with `syncCatalogJoin` in the same transaction. A
 * solution that cannot be stored answers its problem and writes nothing.
 */
export async function createExerciseRecord(
  db: ExerciseRecordWriter,
  input: CreateExerciseRecordInput,
): Promise<{ ok: true; id: string } | { ok: false; code: ExerciseSolutionProblem }> {
  const problem = exerciseSolutionProblem(input.solution);
  if (problem !== null) return { ok: false, code: problem };

  const [kindIds, statusIds] = await Promise.all([exerciseKindIds(db), exerciseStatusIds(db)]);
  const { content } = input;
  const created = await db.exercise.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      teacherId: input.teacherId,
      authorUserId: input.authorUserId,
      title: content.title.trim(),
      prompt: content.prompt,
      difficulty: content.difficulty,
      hints: storedHints(content.hints),
      explanation: content.explanation,
      sourceWhite: content.sourceWhite,
      sourceBlack: content.sourceBlack,
      sourceEvent: content.sourceEvent,
      sourceYear: content.sourceYear,
      sourceGameId: input.sourceGameId ?? null,
      copiedFromId: input.copiedFromId ?? null,
      lessonId: input.lesson?.lessonId ?? null,
      lessonOrder: input.lesson?.lessonOrder ?? null,
      ...exerciseSolutionColumns(input.solution, kindIds),
      ...initialExerciseStatusData(statusIds),
    },
    select: { id: true },
  });
  await syncCatalogJoin(db.exerciseTopic, db.topic, {
    parent: { exerciseId: created.id },
    catalogColumn: "topicId",
    codes: content.topicCodes,
  });
  return { ok: true, id: created.id };
}

/**
 * Rewrites an exercise's solution and the six columns that go with it. A
 * solution that cannot be stored answers its problem and writes nothing.
 * Whether the author may change it (a teacher's exercise in review or in the
 * library is locked, `isExerciseContentLocked`) is the caller's to check.
 */
export async function syncExerciseSolution(
  db: ExerciseRecordWriter,
  exerciseId: string,
  input: SolutionInput,
): Promise<{ ok: true; written: boolean } | { ok: false; code: ExerciseSolutionProblem }> {
  const problem = exerciseSolutionProblem(input);
  if (problem !== null) return { ok: false, code: problem };
  const kindIds = await exerciseKindIds(db);
  const result = await db.exercise.updateMany({
    where: { id: exerciseId },
    data: { ...exerciseSolutionColumns(input, kindIds) },
  });
  return { ok: true, written: result.count > 0 };
}

/** What a copy reads of the exercise it copies. */
export interface ExerciseCopySource {
  id: string;
  solutionPgn: string;
  kind: ExerciseKindCode;
  mateIn: number | null;
  title: string;
  prompt: string | null;
  difficulty: number;
  hints: string[];
  explanation: string | null;
  sourceWhite: string | null;
  sourceBlack: string | null;
  sourceEvent: string | null;
  sourceYear: number | null;
  topicCodes: string[];
}

/**
 * What a copy carries — «Duplicar» (`duplicateTeacherExercise`) and a library
 * exercise copied to a lesson (`copyLibraryExerciseToLesson`, D28) — as an
 * explicit whitelist: the content, the solution and `copiedFromId`. Never the
 * review stamps (a copy has not been reviewed) nor `sourceGameId`; the frozen
 * columns are derived again from the PGN by `createExerciseRecord`, never
 * copied. The caller adds the owner and the author.
 */
export function exerciseCopyInput(
  source: ExerciseCopySource,
): Pick<CreateExerciseRecordInput, "solution" | "content" | "copiedFromId"> {
  return {
    solution: { solutionPgn: source.solutionPgn, kind: source.kind, mateIn: source.mateIn },
    content: {
      title: source.title,
      prompt: source.prompt,
      difficulty: source.difficulty,
      hints: [...source.hints],
      explanation: source.explanation,
      sourceWhite: source.sourceWhite,
      sourceBlack: source.sourceBlack,
      sourceEvent: source.sourceEvent,
      sourceYear: source.sourceYear,
      topicCodes: [...source.topicCodes],
    },
    copiedFromId: source.id,
  };
}
