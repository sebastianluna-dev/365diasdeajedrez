import type { StatsBucketColumn, StatsPeriod } from "@/lib/stats-period";
import type { BotLevelSummary } from "@/services/play/play.types";
import type { StreakOverview } from "@/services/study-goal/study-goal.types";

/** A slice of a breakdown: a topic with how many things of it were done. */
export interface StatSlice {
  label: string;
  value: number;
}

/** One figure of «Lo que hiciste»: this period and the whole one before it (null for all the time). */
export interface StatComparison {
  key: "lessons" | "exercises" | "classes" | "analyzed";
  label: string;
  current: number;
  previous: number | null;
}

/** «Estudio»: minutes, streak, topics and what was done, from the activity log and the lessons finished. */
export interface StudyStatistics {
  /** The minutes of the lessons finished in the period. */
  minutes: number;
  /** The period before, up to the same point («a estas alturas»); null for all the time. */
  previousSoFar: number | null;
  /** The period's minutes as its chart's columns: a day each for a week or a month, a month or a year each beyond. */
  columns: StatsBucketColumn[];
  /** The daily goal today (it is not kept per day, so the chart reads today's). */
  goalMinutes: number;
  /** Days of the period that reached the goal; only when the columns are days. */
  goalDays: number | null;
  /** The minutes of each of the last eight weeks, oldest first: the tab's sparkline. */
  weekly: number[];
  /** The last sixteen weeks of activity: it does not change with the period. */
  streak: StreakOverview;
  /** What the period's activity was about, by topic, the largest first (the rest as «Otros»). */
  topics: StatSlice[];
  did: StatComparison[];
  /** Courses finished in the period. */
  coursesCompleted: number;
}

/** How the period's scored attempts went (class blocks left out, D49). */
export interface ExerciseOutcomes {
  /** Passed without a hint. */
  clean: number;
  /** Passed with a hint: it still counts as passed. */
  hinted: number;
  /** Failed by a wrong move. */
  wrong: number;
  /** Failed by «Ver la solución». */
  shown: number;
}

/** A topic of the exercises tried in the period. */
export interface ExerciseTheme {
  label: string;
  tried: number;
  solved: number;
}

/** «Ejercicios»: what was passed, how the attempts went, by topic, and what is due. */
export interface ExerciseStatistics {
  /** Exercises passed for the first time in the period («Ejercicios superados»). */
  passed: number;
  /** The same, each of the last eight weeks, oldest first. */
  weeklyPassed: number[];
  outcomes: ExerciseOutcomes;
  /** The four topics most tried, the most tried first. */
  themes: ExerciseTheme[];
  /** Exercises whose review comes back today or before (`nextReviewAt`), among those the student may still solve. */
  reviewDue: number;
}

/** «Jugar»: the level and the period's record against the bots. Never part of the streak, minutes or topics. */
export interface PlayStatistics {
  level: BotLevelSummary;
  /** The games against the bots started in the period. */
  record: { wins: number; losses: number; draws: number; open: number };
}

/** The student's «Estadísticas» for one period: each section, or null when its feature is off. */
export interface StudentStatistics {
  period: StatsPeriod;
  /** The study day it was read on. */
  today: string;
  study: StudyStatistics;
  exercises: ExerciseStatistics | null;
  play: PlayStatistics | null;
}
