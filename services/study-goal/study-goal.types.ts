import type { StudyStreak } from "@/lib/study-streak";

export type { StudyStreak };

export interface StudyGoal {
  /** Days in a row studying, and whether today is one of them already. */
  streak: StudyStreak;
  /** Minutes studied today, adding up the duration of the finished lessons. */
  minutesToday: number;
  /** The ones the student sets themselves per day. */
  goalMinutes: number;
  /** How much of the goal is done, 0–100 and capped at the top: overshooting is not a 140 %. */
  percent: number;
}

/** A day of the activity grid of «Mis cursos». */
export interface StreakDay {
  /** "yyyy-mm-dd", in the study day's time zone. */
  day: string;
  /** Things done that day: lessons, exercises, games analysed, classes. */
  count: number;
  /** How much the day weighs in the grid (`activityLevel`): 0 nothing … 3 four things or more. */
  level: 0 | 1 | 2 | 3;
  isToday: boolean;
  /** A day of this week still to come: the grid keeps its place, empty. */
  isFuture: boolean;
}

/**
 * The streak column of «Mis cursos» (2026-10-07, «S4»): the streak, the last
 * sixteen weeks of activity day by day, and the figures under them. All of it
 * derived from the activity log and the lessons finished; nothing is stored.
 */
export interface StreakOverview {
  streak: StudyStreak;
  /** Sixteen weeks, oldest first, each Monday to Sunday: the grid's columns. */
  weeks: StreakDay[][];
  /** Days with activity inside those sixteen weeks. */
  daysStudied: number;
  /** The longest run of days studying, within the streak's window (400 days). */
  bestStreak: number;
  /** Days with activity this week, Monday to today. */
  daysThisWeek: number;
  /** The duration of the lessons finished this week, as today's minutes are counted. */
  minutesThisWeek: number;
}
