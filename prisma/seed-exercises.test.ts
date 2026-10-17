import { describe, expect, it } from "vitest";
import { EXERCISE_KIND } from "@/constants/platform/exercise-codes.const";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { deriveExerciseData } from "@/lib/chess/exercise-derivation";
import { analyzeSolution, solutionPgnFromLine } from "@/lib/chess/exercise-format";
import { startFenOf } from "@/lib/chess/mainline";
import { exerciseReadiness } from "@/services/shared/exercise-status-transitions";
import { buildAttempts, COURSES, IDS } from "./seed-data";
import {
  DEMO_EXERCISE_ATTEMPTS,
  DEMO_EXERCISES,
  DEMO_SERIES,
  EXERCISE_IDS,
  demoAttemptOutcome,
} from "./seed-exercises";

// The exercises demo is seeded as data, so nothing on the way checks it: a
// solution the editor would refuse, or an attempt the server would not
// replay, would only show as a broken screen during a demo. This holds the
// seed to the writers' own rules.

describe("DEMO_EXERCISES", () => {
  it("are five, each with a solution `analyzeSolution` accepts and everything READY asks for", () => {
    expect(DEMO_EXERCISES).toHaveLength(5);
    for (const exercise of DEMO_EXERCISES) {
      const analysis = analyzeSolution(exercise);
      expect(analysis.ok ? [] : analysis.problems, exercise.id).toEqual([]);
      expect(exerciseReadiness({ ...exercise, topicCount: exercise.topics.length }).ok, exercise.id).toBe(true);
      expect(exercise.hints.length).toBeLessThanOrEqual(EXERCISE_LIMITS.hints);
      expect(exercise.difficulty % EXERCISE_LIMITS.difficultyStep, exercise.id).toBe(0);
    }
  });

  it("hold what the demo shows: a mate in 2, a black mate, a variant and one with two hints and an explanation", () => {
    const byId = new Map(DEMO_EXERCISES.map((exercise) => [exercise.id, exercise]));
    expect(byId.get(EXERCISE_IDS.smothered)).toMatchObject({ kind: "MATE_IN", mateIn: 2 });
    expect(analyzeSolution(byId.get(EXERCISE_IDS.blackBackRank)!)).toMatchObject({ ok: true });
    expect(byId.get(EXERCISE_IDS.blackBackRank)!.solutionPgn).toContain(" b - - 0 1");
    expect(byId.get(EXERCISE_IDS.knightFork)!.solutionPgn).toContain("(");
    const skewer = byId.get(EXERCISE_IDS.skewer)!;
    expect(skewer.hints).toHaveLength(2);
    expect(skewer.explanation).toBeTruthy();
  });

  it("go by distinct ids of an exercise's length", () => {
    const ids = DEMO_EXERCISES.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toHaveLength(8);
  });
});

describe("the lesson exercises of the seed data (COURSES)", () => {
  const seeded = COURSES.flatMap((course) =>
    course.chapters.flatMap((chapter) =>
      chapter.lessons.flatMap((lesson) =>
        lesson.exercises.map((exercise) => ({
          lesson,
          exercise,
          solutionPgn: solutionPgnFromLine(
            deriveExerciseData({
              initialFen: startFenOf(lesson.pgn),
              afterSans: exercise.afterSans,
              lineSans: exercise.lineSans,
            }).startFen,
            exercise.lineSans,
          ),
        })),
      ),
    ),
  );

  it("are the four the migration moved, each a sequence `analyzeSolution` accepts and everything PUBLISHED asks for", () => {
    expect(seeded.map(({ exercise }) => exercise.id).sort()).toEqual(
      [IDS.exNajdorfLine, IDS.exPoisonedPawn, IDS.exLucenaBridge, IDS.exPhilidorDefense].sort(),
    );
    for (const { exercise, solutionPgn } of seeded) {
      const solution = { solutionPgn, kind: EXERCISE_KIND.SEQUENCE, mateIn: null };
      const analysis = analyzeSolution(solution);
      expect(analysis.ok ? [] : analysis.problems, exercise.id).toEqual([]);
      expect(
        exerciseReadiness({ ...solution, title: exercise.title, topicCount: exercise.topics.length, explanation: null })
          .ok,
        exercise.id,
      ).toBe(true);
      expect(exercise.difficulty % EXERCISE_LIMITS.difficultyStep, exercise.id).toBe(0);
      expect(exercise.title.length).toBeLessThanOrEqual(EXERCISE_LIMITS.title);
      expect(exercise.promptText.length).toBeLessThanOrEqual(EXERCISE_LIMITS.prompt);
    }
  });

  it("start at order 1 in their lesson, as the panel's nextOrder gives a new one", () => {
    for (const { exercise } of seeded) expect(exercise.order, exercise.id).toBe(1);
  });

  it("the legacy attempts point at seeded lesson exercises, on earlier days", () => {
    const now = new Date("2026-10-16T18:00:00.000Z");
    const ids = new Set(seeded.map(({ exercise }) => exercise.id));
    for (const attempt of buildAttempts(now)) {
      expect(ids.has(attempt.exerciseId), attempt.id).toBe(true);
      expect(attempt.createdAt.getTime()).toBeLessThan(now.getTime());
    }
  });
});

describe("DEMO_SERIES", () => {
  it("holds the five in order", () => {
    expect([...DEMO_SERIES.items]).toEqual(DEMO_EXERCISES.map((exercise) => exercise.id));
  });
});

describe("DEMO_EXERCISE_ATTEMPTS", () => {
  const outcomes = DEMO_EXERCISE_ATTEMPTS.map((attempt) => ({ attempt, outcome: demoAttemptOutcome(attempt) }));

  it("replay on the server as one clean pass, one failure at the first move and one pass with a hint", () => {
    const [clean, failed, hinted] = outcomes;
    expect(clean?.outcome).toMatchObject({ result: "PASSED", isPerfect: true, review: "clean" });
    expect(failed?.outcome).toMatchObject({ result: "FAILED", review: "failed" });
    expect(failed?.outcome?.mistake).toMatchObject({ ply: 1, playedSan: "Nf7+", expectedSan: "Qg8+" });
    expect(hinted?.outcome).toMatchObject({ result: "PASSED", isPerfect: false, review: "hinted", hintsUsed: 1 });
  });

  it("cover three exercises of the series, so two of them are still untried", () => {
    const tried = new Set(DEMO_EXERCISE_ATTEMPTS.map((attempt) => attempt.exerciseId));
    expect(tried.size).toBe(3);
    expect(DEMO_SERIES.items.filter((id) => !tried.has(id))).toHaveLength(2);
  });

  it("are on earlier study days, one each, so today's first attempt of any of them is scored", () => {
    const days = DEMO_EXERCISE_ATTEMPTS.map((attempt) => attempt.daysAgo);
    expect(days.every((days) => days >= 1)).toBe(true);
    expect(new Set(days).size).toBe(days.length);
  });

  it("carry a mistake id exactly when they failed, and an activity id exactly on a first pass", () => {
    for (const { attempt, outcome } of outcomes) {
      expect(Boolean(attempt.mistakeId), attempt.id).toBe(outcome?.mistake !== null);
      expect(Boolean(attempt.activityId), attempt.id).toBe(outcome?.result === "PASSED");
    }
  });
});
