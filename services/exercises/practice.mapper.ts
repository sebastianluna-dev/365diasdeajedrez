import type { Prisma } from "@/lib/platform-db/generated/client";
import { isSameStudyDay } from "@/services/shared/exercise-attempt.service";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import { buildLibraryExercisesWhere } from "@/services/shared/exercise-visibility-rules";

// «Práctica libre» (D18, D32; PLAN.md §5.6), the pure part: which library
// exercises a topic and a level ask for, and which one of them is served
// next. The service reads the rows; the choice is here, tested with explicit
// ids and a given random number.

/** A topic as the practice reads the catalog: its code, its label and its parent's code. */
export interface PracticeTopic {
  code: string;
  label: string;
  parentCode: string | null;
}

/**
 * The topic and its children (the plan's «the topic or a child of it»): a
 * student who picks «Táctica» gets every tactical motif. An unknown code
 * gives nothing, so the `where` matches nothing.
 */
export function practiceTopicCodes(topics: readonly PracticeTopic[], code: string): string[] {
  if (!topics.some((topic) => topic.code === code)) return [];
  return [code, ...topics.filter((topic) => topic.parentCode === code).map((topic) => topic.code)];
}

/**
 * The library's exercises of these topics in the level's Elo range (D32:
 * only the library is practised). With no topic code, nothing.
 */
export function buildPracticeWhere(
  topicCodes: readonly string[],
  level: Pick<DifficultyLevel, "eloMin" | "eloMax">,
): Prisma.ExerciseWhereInput {
  if (topicCodes.length === 0) return { id: { in: [] } };
  return {
    AND: [
      buildLibraryExercisesWhere(),
      { topics: { some: { topic: { code: { in: [...topicCodes] } } } } },
      { difficulty: { gte: level.eloMin, ...(level.eloMax === null ? {} : { lte: level.eloMax }) } },
    ],
  };
}

/** A candidate as the pick reads it. */
export interface PracticeCandidate {
  id: string;
}

/** The student's standing with a candidate (its family's row), as the pick reads it. */
export interface PracticeState {
  exerciseId: string;
  firstSolvedAt: Date | null;
  lastAttemptAt: Date | null;
}

export interface PracticePick<T extends PracticeCandidate> {
  exercise: T;
  /** Every candidate was solved already: the pick repeats one, and the page says so. */
  exhausted: boolean;
  /** The exercise's family was attempted this study day: it opens unscored (§2.7). */
  triedToday: boolean;
}

/**
 * Which exercise to serve, at random among the best tier (§5.6): the ones
 * never solved and not tried today, then the never solved, then the ones not
 * tried today, then any. The one just solved (`after`) is skipped while
 * another is left, so «Siguiente» never deals the same position twice in a
 * row. `random` is in [0, 1): the service passes `Math.random()`, the tests a
 * number. Null with no candidate.
 */
export function pickPracticeExercise<T extends PracticeCandidate>(
  candidates: readonly T[],
  states: readonly PracticeState[],
  after: string | null,
  now: Date,
  random: number,
): PracticePick<T> | null {
  const byId = new Map(states.map((state) => [state.exerciseId, state]));
  const solved = (candidate: T) => byId.get(candidate.id)?.firstSolvedAt != null;
  const tried = (candidate: T) => {
    const last = byId.get(candidate.id)?.lastAttemptAt;
    return last != null && isSameStudyDay(last, now);
  };
  const pool = candidates.length > 1 ? candidates.filter((candidate) => candidate.id !== after) : candidates;
  if (pool.length === 0) return null;
  const tiers = [
    pool.filter((candidate) => !solved(candidate) && !tried(candidate)),
    pool.filter((candidate) => !solved(candidate)),
    pool.filter((candidate) => !tried(candidate)),
    pool,
  ];
  const tier = tiers.find((candidates) => candidates.length > 0) ?? pool;
  const index = Math.min(tier.length - 1, Math.max(0, Math.floor(random * tier.length)));
  const exercise = tier[index] ?? pool[0];
  if (!exercise) return null;
  return { exercise, exhausted: pool.every(solved), triedToday: tried(exercise) };
}
