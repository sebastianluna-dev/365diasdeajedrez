import { ATTEMPT_RESULT } from "@/constants/platform/training-codes.const";

// «2 de 3 lo resolvieron» (D29): how many of a class's students solved each
// exercise of an EXERCISE block, from the attempts made THERE (`classBlockId`)
// by the students who hold a seat not moved. The one count the teacher's
// record and the staff's sheet read, so the two cannot disagree. Pure module.

/** An attempt as the count reads it: who, from which block, at what, and how it went. */
export interface ClassExerciseAttemptRow {
  userId: string;
  classBlockId: string | null;
  exerciseId: string | null;
  result: { code: string };
}

/**
 * The students among `seatIds` with a PASSED attempt at each exercise of each
 * block, by block id and exercise id. An attempt from a seat moved since, or
 * from nobody seated, counts for nothing.
 */
export function classExerciseSolvedCounts(
  attempts: readonly ClassExerciseAttemptRow[],
  seatIds: readonly string[],
): Map<string, Map<string, number>> {
  const seated = new Set(seatIds);
  const solvers = new Map<string, Map<string, Set<string>>>();
  for (const attempt of attempts) {
    if (attempt.classBlockId === null || attempt.exerciseId === null) continue;
    if (!seated.has(attempt.userId) || attempt.result.code !== ATTEMPT_RESULT.PASSED) continue;
    const block = solvers.get(attempt.classBlockId) ?? new Map<string, Set<string>>();
    const who = block.get(attempt.exerciseId) ?? new Set<string>();
    who.add(attempt.userId);
    block.set(attempt.exerciseId, who);
    solvers.set(attempt.classBlockId, block);
  }
  return new Map(
    [...solvers].map(([blockId, block]) => [
      blockId,
      new Map([...block].map(([exerciseId, who]) => [exerciseId, who.size])),
    ]),
  );
}

/** «2 de 3 lo resolvieron», «1 de 3 lo resolvió»; «Sin alumnos» with nobody seated. */
export function solvedCountLabel(solved: number, of: number): string {
  if (of === 0) return "Sin alumnos";
  return `${solved} de ${of} lo ${solved === 1 ? "resolvió" : "resolvieron"}`;
}

/**
 * The label of every exercise of every EXERCISE block, by block id and
 * exercise id, over the seats not moved: what the renderer's rows say to the
 * teacher and the staff (`BlockReader.solvedLabels`).
 */
export function classSolvedLabels(
  blocks: readonly { id: string; exerciseIds: readonly string[] }[],
  attempts: readonly ClassExerciseAttemptRow[],
  seatIds: readonly string[],
): Map<string, Map<string, string>> {
  const counts = classExerciseSolvedCounts(attempts, seatIds);
  return new Map(
    blocks.map((block) => [
      block.id,
      new Map(
        block.exerciseIds.map((exerciseId) => [
          exerciseId,
          solvedCountLabel(counts.get(block.id)?.get(exerciseId) ?? 0, seatIds.length),
        ]),
      ),
    ]),
  );
}
