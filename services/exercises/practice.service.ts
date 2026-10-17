import "server-only";
import { cache } from "react";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { formatEloRange } from "@/services/courses/level-rules";
import { exerciseFamiliesOf, isSameStudyDay } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { buildLibraryExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { mapSolverExercise } from "./exercises.mapper";
import { buildPracticeWhere, pickPracticeExercise, practiceTopicCodes, type PracticeState } from "./practice.mapper";
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

/** What a served exercise is read with. */
const SERVED_SELECT = {
  id: true,
  title: true,
  prompt: true,
  kind: { select: { code: true } },
  mateIn: true,
  solutionPgn: true,
  hints: true,
  explanation: true,
  difficulty: true,
} as const;

/** The student's standing with each candidate's family (§2.7): a library exercise solved through a lesson's copy counts as solved. */
async function familyStatesOf(
  db: ReturnType<typeof getPlatformDb>,
  userId: string,
  candidates: { id: string; copiedFromId: string | null; lessonId: string | null }[],
): Promise<PracticeState[]> {
  const families = await exerciseFamiliesOf(db, candidates);
  const familyIds = [...new Set([...families.values()].flat())];
  const states = await db.userExerciseState.findMany({
    where: { userId, exerciseId: { in: familyIds } },
    select: { exerciseId: true, firstSolvedAt: true, lastAttemptAt: true },
  });
  const byId = new Map(states.map((state) => [state.exerciseId, state]));
  return candidates.map((candidate) => {
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
}

/**
 * The exercise served for a choice (`?tema=&nivel=`), with `after` the one
 * just solved so «Siguiente» deals another: random among the best tier
 * (never solved and not tried today first). On «Práctica libre» nothing
 * chosen, or a choice not in the catalogs, asks to choose. `open` is
 * «Ejercicios» itself: no topic is any topic and no level any level, and
 * «Siguiente» stays there. A choice with no library exercise says so.
 */
export async function getPracticeExercise(
  choice: PracticeChoice,
  after: string | null,
  { open = false }: { open?: boolean } = {},
): Promise<PracticeServing> {
  if (!EXERCISES_ENABLED) return { kind: "choose" };
  const viewer = await getExerciseViewer();
  const filters = await getPracticeFilters();
  const topic = filters.topics.find((candidate) => candidate.code === choice.topicCode);
  const level = filters.levels.find((candidate) => candidate.slug === choice.levelSlug);
  if ((!topic && (!open || choice.topicCode)) || (!level && (!open || choice.levelSlug))) return { kind: "choose" };
  const choiceLabel = [topic?.label ?? "Todos los temas", level?.name].filter(Boolean).join(" · ");

  const db = getPlatformDb();
  const levelRow = level
    ? await db.level.findUnique({ where: { slug: level.slug }, select: { eloMin: true, eloMax: true } })
    : null;
  if (level && !levelRow) return { kind: "choose" };
  // The pick reads ids alone — a library of hundreds would carry every solution otherwise; the chosen row is read after.
  const candidates = await db.exercise.findMany({
    where: buildPracticeWhere(topic ? practiceTopicCodes(filters.topics, topic.code) : null, levelRow),
    select: { id: true, copiedFromId: true, lessonId: true },
  });
  if (candidates.length === 0) return { kind: "empty", choiceLabel };

  const now = new Date();
  const familyStates = await familyStatesOf(db, viewer.userId, candidates);
  const pick = pickPracticeExercise(candidates, familyStates, after, now, Math.random());
  if (!pick) return { kind: "empty", choiceLabel };
  const exercise = await db.exercise.findUnique({ where: { id: pick.exercise.id }, select: SERVED_SELECT });
  // Taken out of the library between the two reads: the choice is asked again.
  if (!exercise) return { kind: "empty", choiceLabel };

  const query = { ...(topic && { tema: topic.code }), ...(level && { nivel: level.slug }), tras: pick.exercise.id };
  return {
    kind: "exercise",
    exercise: mapSolverExercise(exercise),
    mode: pick.triedToday ? "unscored" : "solve",
    context: { attempt: { kind: ATTEMPT_CONTEXT.PRACTICE }, position: choiceLabel },
    next: {
      href: open ? platformRoutes.exerciseTrainer(query) : platformRoutes.exercisePractice(query),
      label: "Siguiente ejercicio",
    },
    back: { href: platformRoutes.exercises, label: "Volver a Ejercicios" },
    exhausted: pick.exhausted,
    choiceLabel,
  };
}

/**
 * One library exercise by its id, to solve again from «Esta sesión» (its
 * pill's page), with the context PRACTICE: unscored when its family was
 * tried today, as it was. Null when it is not in the library.
 */
export async function getLibraryExerciseToSolve(exerciseId: string): Promise<PracticeServing | null> {
  if (!EXERCISES_ENABLED) return null;
  const viewer = await getExerciseViewer();
  const db = getPlatformDb();
  const row = await db.exercise.findFirst({
    where: { AND: [{ id: exerciseId }, buildLibraryExercisesWhere()] },
    select: { ...SERVED_SELECT, copiedFromId: true, lessonId: true },
  });
  if (!row) return null;
  const now = new Date();
  const [state] = await familyStatesOf(db, viewer.userId, [row]);
  const triedToday = state?.lastAttemptAt != null && isSameStudyDay(state.lastAttemptAt, now);
  return {
    kind: "exercise",
    exercise: mapSolverExercise(row),
    mode: triedToday ? "unscored" : "solve",
    context: { attempt: { kind: ATTEMPT_CONTEXT.PRACTICE } },
    next: { href: platformRoutes.exerciseTrainer({ tras: row.id }), label: "Siguiente ejercicio" },
    back: { href: platformRoutes.exercises, label: "Volver a Ejercicios" },
    exhausted: false,
    choiceLabel: "Todos los temas",
  };
}
