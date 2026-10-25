import { STAT_METRIC, type StatMetricCode } from "@/constants/platform/activity-codes.const";
import { inRange, type DayRange } from "@/lib/stats-period";
import type { ExerciseTheme, StatComparison, StatSlice } from "./stats.types";

// The pure folds of «Estadísticas»: the rows the service reads, turned into
// what the page draws. No database here, so each rule has its test.

/** A value on a study day: a day's minutes, or a day's sum of a metric. */
export interface DayValue {
  day: string;
  value: number;
}

/** The sum of the values inside a range. */
export function sumIn(values: readonly DayValue[], range: DayRange): number {
  return values.reduce((total, entry) => (inRange(entry.day, range) ? total + entry.value : total), 0);
}

/** The sum of each week, in the order the weeks come (each a list of its days). */
export function weeklySums(values: readonly DayValue[], weeks: readonly (readonly string[])[]): number[] {
  const byDay = new Map(values.map((entry) => [entry.day, entry.value]));
  return weeks.map((week) => week.reduce((total, day) => total + (byDay.get(day) ?? 0), 0));
}

/** A topic of the catalog, with its parent. */
export interface TopicRow {
  id: number;
  label: string;
  parentId: number | null;
}

/**
 * Each topic's label at the top of its tree: «Clavada» counts as «Táctica»,
 * so a breakdown has a handful of slices and not the whole catalog. A loop in
 * the catalog stops at the topic it would revisit.
 */
export function rootLabels(topics: readonly TopicRow[]): Map<number, string> {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const labels = new Map<number, string>();
  for (const topic of topics) {
    let root = topic;
    const seen = new Set<number>([root.id]);
    while (root.parentId !== null) {
      const parent = byId.get(root.parentId);
      if (!parent || seen.has(parent.id)) break;
      seen.add(parent.id);
      root = parent;
    }
    labels.set(topic.id, root.label);
  }
  return labels;
}

/** «Otros»: the topics past the first ones, together. */
export const OTHER_TOPICS = "Otros";

/**
 * The period's activity by topic, the largest first, its first `max` slices
 * and the rest as one «Otros»; ties go by name, so the order does not dance.
 * Rows of a topic no longer in the catalog are left out.
 */
export function topicSlices(
  rows: readonly { topicId: number; value: number }[],
  labels: ReadonlyMap<number, string>,
  max = 4,
): StatSlice[] {
  const byLabel = new Map<string, number>();
  for (const row of rows) {
    const label = labels.get(row.topicId);
    if (!label || row.value <= 0) continue;
    byLabel.set(label, (byLabel.get(label) ?? 0) + row.value);
  }
  const sorted = [...byLabel]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "es"));
  if (sorted.length <= max + 1) return sorted;
  const rest = sorted.slice(max).reduce((total, slice) => total + slice.value, 0);
  return [...sorted.slice(0, max), { label: OTHER_TOPICS, value: rest }];
}

/** The figures of «Lo que hiciste», in its order, with the words under each. */
const DID: readonly { key: StatComparison["key"]; metric: StatMetricCode; label: string }[] = [
  { key: "lessons", metric: STAT_METRIC.LESSONS_COMPLETED, label: "Lecciones" },
  { key: "exercises", metric: STAT_METRIC.EXERCISES_PASSED, label: "Ejercicios" },
  { key: "classes", metric: STAT_METRIC.CLASSES_ATTENDED, label: "Clases" },
  { key: "analyzed", metric: STAT_METRIC.GAMES_ANALYZED, label: "Partidas analizadas" },
];

/**
 * «Lo que hiciste»: lessons, exercises, classes and games analysed in the
 * period, each beside the whole period before (none for all the time).
 * Without the exercises (`withExercises` false) their column is left out.
 */
export function didComparisons(
  current: ReadonlyMap<string, number>,
  previous: ReadonlyMap<string, number> | null,
  withExercises: boolean,
): StatComparison[] {
  return DID.filter((entry) => withExercises || entry.key !== "exercises").map((entry) => ({
    key: entry.key,
    label: entry.label,
    current: current.get(entry.metric) ?? 0,
    previous: previous ? (previous.get(entry.metric) ?? 0) : null,
  }));
}

/** The attempts at one exercise in the period, and how many of them passed. */
export interface ExerciseAttemptCount {
  exerciseId: string;
  tried: number;
  solved: number;
}

/**
 * The period's attempts by topic (each exercise under the root of each of
 * its topics, once per root), the `max` most tried first, ties by name. An
 * exercise without a topic is in none.
 */
export function exerciseThemes(
  attempts: readonly ExerciseAttemptCount[],
  topicsOf: ReadonlyMap<string, readonly string[]>,
  max = 4,
): ExerciseTheme[] {
  const byLabel = new Map<string, ExerciseTheme>();
  for (const attempt of attempts) {
    for (const label of new Set(topicsOf.get(attempt.exerciseId) ?? [])) {
      const theme = byLabel.get(label) ?? { label, tried: 0, solved: 0 };
      theme.tried += attempt.tried;
      theme.solved += attempt.solved;
      byLabel.set(label, theme);
    }
  }
  return [...byLabel.values()]
    .sort((left, right) => right.tried - left.tried || left.label.localeCompare(right.label, "es"))
    .slice(0, max);
}
