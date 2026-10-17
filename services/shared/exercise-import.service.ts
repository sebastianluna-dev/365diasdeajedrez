import { SERIES_LIMITS } from "@/constants/platform/exercise.const";
import { nextOrder } from "./reorder";
import { createExerciseRecord, type ExerciseRecordWriter } from "./exercise-record.service";
import type { ExerciseImportReading } from "./exercise-import";
import type { ExerciseTransitionResult } from "./exercise-status.service";

// The write of a PGN import (D12; PLAN.md §4.5), shared by the teacher's and
// the staff's actions: each accepted row goes in through
// `createExerciseRecord` (always a draft), the ones the author asked to be
// ready are moved by the status writer the caller hands over — the owner's
// rows of the transitions table for a teacher, the staff's for the academy —,
// and all of them join the chosen series at its end. One transaction, the
// caller's: a refused move throws, so nothing of the import stays.
//
// It receives the client first, like every shared writer; no "server-only".

/** The minimum of Prisma the import writes with: the record writer's, plus the series' items. */
export interface ExerciseImportWriter extends ExerciseRecordWriter {
  exerciseSeriesItem: {
    findMany(args: unknown): Promise<{ order: number }[]>;
    createMany(args: unknown): Promise<unknown>;
  };
  exerciseSeries: { update(args: unknown): Promise<unknown> };
}

export interface WriteExerciseImportInput {
  accepted: ExerciseImportReading["accepted"];
  /** The owner: the teacher's id, or null for the academy's; and who imported. */
  teacherId: string | null;
  authorUserId: string;
  /**
   * The status move for a row that passed the gate («Listo», «En la
   * biblioteca»), or null when everything stays a draft. A refusal throws
   * `ExerciseImportRefused`, and the transaction rolls back.
   */
  move: ((db: ExerciseImportWriter, exerciseId: string) => Promise<ExerciseTransitionResult>) | null;
  /** The series the imported ones join, already checked to be the author's; null for none. */
  seriesId: string | null;
}

export interface WriteExerciseImportResult {
  ids: string[];
  ready: number;
  drafts: number;
}

/** A status move the writer refused for an imported row: the whole import is rolled back. */
export class ExerciseImportRefused extends Error {
  constructor(
    readonly index: number,
    readonly result: Exclude<ExerciseTransitionResult, { ok: true }>,
  ) {
    super(`The imported exercise ${index} could not take its status: ${result.code}`);
  }
}

/** The series cannot take that many: the whole import is rolled back, and the author imports without a series or in parts. */
export class ExerciseImportSeriesFull extends Error {
  constructor() {
    super(`A series holds at most ${SERIES_LIMITS.items} exercises`);
  }
}

export async function writeExerciseImport(
  db: ExerciseImportWriter,
  input: WriteExerciseImportInput,
): Promise<WriteExerciseImportResult> {
  const ids: string[] = [];
  let ready = 0;
  for (const row of input.accepted) {
    const created = await createExerciseRecord(db, {
      teacherId: input.teacherId,
      authorUserId: input.authorUserId,
      solution: row.record.solution,
      content: row.record.content,
    });
    if (!created.ok) throw new Error(`The checked solution was refused: ${created.code}`);
    ids.push(created.id);
    if (row.outcome === "ready" && input.move) {
      const moved = await input.move(db, created.id);
      if (!moved.ok) throw new ExerciseImportRefused(row.index, moved);
      ready += 1;
    }
  }

  if (input.seriesId && ids.length > 0) {
    const items = await db.exerciseSeriesItem.findMany({
      where: { seriesId: input.seriesId },
      select: { order: true },
    });
    if (items.length + ids.length > SERIES_LIMITS.items) throw new ExerciseImportSeriesFull();
    // After the last one: a deleted exercise leaves a gap, so the count is not where the list ends.
    const last = items.reduce((max, item) => Math.max(max, item.order), 0);
    await db.exerciseSeriesItem.createMany({
      data: ids.map((exerciseId, index) => ({ seriesId: input.seriesId, exerciseId, order: nextOrder(last + index) })),
    });
    await db.exerciseSeries.update({ where: { id: input.seriesId }, data: { updatedAt: new Date() } });
  }

  return { ids, ready, drafts: ids.length - ready };
}
