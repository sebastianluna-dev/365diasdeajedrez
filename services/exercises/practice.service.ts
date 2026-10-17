import "server-only";
import { cache } from "react";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { formatEloRange } from "@/services/courses/level-rules";
import { exerciseFamiliesOf } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { buildLibraryExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { mapSolverExercise } from "./exercises.mapper";
import { buildPracticeWhere, pickPracticeExercise, practiceTopicCodes } from "./practice.mapper";
import type { PracticeChoice, PracticeFilters, PracticeServing } from "./practice.types";

// «Práctica libre» (D18, D32; PLAN.md §5.6): a random library exercise of a
// topic and a level, preferring the ones the student never solved, with the
// context PRACTICE. The student is the DAL's (`getExerciseViewer`), and only
// the library is read (`buildLibraryExercisesWhere`: PUBLISHED, nobody's
// lesson's) — the same `where` the submit checks for the context PRACTICE.
// The choice is the pure picker's (practice.mapper.ts). The flag is the
// pages' to check.

const LEVEL_SELECT = { slug: true, name: true, order: true, eloMin: true, eloMax: true, isActive: true } as const;

/**
 * What the home's card and the practice page offer: the topics with at
 * least one library exercise (a parent counts its children's), in the
 * catalog's order, and the active levels. Memoised per request.
 */
export const getPracticeFilters = cache(async (): Promise<PracticeFilters> => {
  if (!EXERCISES_ENABLED) return { topics: [], levels: [], libraryEmpty: true };
  await getExerciseViewer();
  const db = getPlatformDb();
  const [topics, levels, withExercises] = await Promise.all([
    db.topic.findMany({
      select: { code: true, label: true, parent: { select: { code: true } } },
      orderBy: { order: "asc" },
    }),
    db.level.findMany({ where: { isActive: true }, select: LEVEL_SELECT, orderBy: { order: "asc" } }),
    db.exerciseTopic.findMany({
      where: { exercise: buildLibraryExercisesWhere() },
      select: { topic: { select: { code: true } } },
      distinct: ["topicId"],
    }),
  ]);
  const held = new Set(withExercises.map((row) => row.topic.code));
  const all = topics.map((topic) => ({ code: topic.code, label: topic.label, parentCode: topic.parent?.code ?? null }));
  // A parent with a child that has exercises is offered too: picking it practises the whole branch.
  const offered = all.filter(
    (topic) => held.has(topic.code) || all.some((child) => child.parentCode === topic.code && held.has(child.code)),
  );
  return {
    topics: offered,
    levels: levels.map((level) => ({ slug: level.slug, name: level.name, range: formatEloRange(level) })),
    libraryEmpty: held.size === 0,
  };
});

/**
 * The exercise served for a choice (`?tema=&nivel=`), with `after` the one
 * just solved so «Siguiente» deals another: random among the best tier
 * (never solved and not tried today first). Nothing chosen, or a choice not
 * in the catalogs, asks to choose; a choice with no library exercise says so.
 */
export async function getPracticeExercise(choice: PracticeChoice, after: string | null): Promise<PracticeServing> {
  if (!EXERCISES_ENABLED) return { kind: "choose" };
  const viewer = await getExerciseViewer();
  const filters = await getPracticeFilters();
  const topic = filters.topics.find((candidate) => candidate.code === choice.topicCode);
  const level = filters.levels.find((candidate) => candidate.slug === choice.levelSlug);
  if (!topic || !level) return { kind: "choose" };
  const choiceLabel = `${topic.label} · ${level.name}`;

  const db = getPlatformDb();
  const levelRow = await db.level.findUnique({ where: { slug: level.slug }, select: { eloMin: true, eloMax: true } });
  if (!levelRow) return { kind: "choose" };
  const candidates = await db.exercise.findMany({
    where: buildPracticeWhere(practiceTopicCodes(filters.topics, topic.code), levelRow),
    select: {
      id: true,
      title: true,
      prompt: true,
      kind: { select: { code: true } },
      mateIn: true,
      solutionPgn: true,
      hints: true,
      explanation: true,
      difficulty: true,
      copiedFromId: true,
      lessonId: true,
    },
  });
  if (candidates.length === 0) return { kind: "empty", choiceLabel };

  // The student's standing by family (§2.7): a library exercise solved through a lesson's copy counts as solved.
  const now = new Date();
  const families = await exerciseFamiliesOf(db, candidates);
  const familyIds = [...new Set([...families.values()].flat())];
  const states = await db.userExerciseState.findMany({
    where: { userId: viewer.userId, exerciseId: { in: familyIds } },
    select: { exerciseId: true, firstSolvedAt: true, lastAttemptAt: true },
  });
  const byId = new Map(states.map((state) => [state.exerciseId, state]));
  const familyStates = candidates.map((candidate) => {
    const rows = (families.get(candidate.id) ?? [candidate.id]).map((id) => byId.get(id)).filter((row) => !!row);
    return {
      exerciseId: candidate.id,
      firstSolvedAt: rows.find((row) => row.firstSolvedAt !== null)?.firstSolvedAt ?? null,
      lastAttemptAt: rows.reduce<Date | null>(
        (latest, row) => (row.lastAttemptAt && (!latest || row.lastAttemptAt > latest) ? row.lastAttemptAt : latest),
        null,
      ),
    };
  });
  const pick = pickPracticeExercise(candidates, familyStates, after, now, Math.random());
  if (!pick) return { kind: "empty", choiceLabel };

  const query = { tema: topic.code, nivel: level.slug };
  return {
    kind: "exercise",
    exercise: mapSolverExercise(pick.exercise),
    mode: pick.triedToday ? "unscored" : "solve",
    context: { attempt: { kind: ATTEMPT_CONTEXT.PRACTICE }, position: choiceLabel },
    next: { href: platformRoutes.exercisePractice({ ...query, tras: pick.exercise.id }), label: "Siguiente" },
    back: { href: platformRoutes.exercises, label: "Volver a Ejercicios" },
    exhausted: pick.exhausted,
    choiceLabel,
  };
}
