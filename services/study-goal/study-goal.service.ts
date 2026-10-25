import { cache } from "react";
import { DEFAULT_GOAL_MINUTES } from "@/constants/platform/study-goal.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import { dayAfter, daysBetween, daysInMonthOf, monthStartOf, previousMonthStartOf } from "@/lib/study-minutes";
import { activityLevel, dayKey, longestStreak, mondayOf, startOfDay, streakOf, weeksUpTo } from "@/lib/study-streak";
import type {
  StreakOverview,
  StreakSummary,
  StudyGoal,
  StudyMinutesDay,
  StudyMonth,
  StudyMonthComparison,
  StudyStreak,
} from "./study-goal.types";

// Streak and daily goal: the two figures of the day. The dashboard shows both;
// "Mis cursos", the streak.
//
// Neither of the two is stored as such. The streak is DERIVED from the activity
// and today's minutes from the lessons finished today; the only thing stored is
// the goal, which is a decision of the student's and not a computation.

/** How far back to look for the streak. */
const STREAK_WINDOW_DAYS = 400;

/** Weeks the activity grid of «Mis cursos» shows: about four months. */
const OVERVIEW_WEEKS = 16;

/**
 * Days with activity, most recent to oldest, within the window.
 *
 * It counts ANY activity — a lesson, a class, an exercise, a game analysed —
 * not only lessons: the streak rewards having studied, and whoever spent the
 * afternoon analysing their games studied.
 *
 * The window exists so the query does not grow with the years. A streak longer
 * than that would still be counted whole only up to the edge, which is a problem
 * one would be glad to have.
 */
async function activeDaysOf(userId: string, now: Date): Promise<Set<string>> {
  return new Set((await activityByDayOf(userId, now)).keys());
}

/** How many things were done each day within the window, by day key. */
async function activityByDayOf(userId: string, now: Date): Promise<Map<string, number>> {
  const since = new Date(now.getTime() - STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await getPlatformDb().userActivity.findMany({
    where: { userId, occurredAt: { gte: since } },
    select: { occurredAt: true },
    orderBy: { occurredAt: "desc" },
  });
  const counts = new Map<string, number>();
  for (const row of rows) {
    const day = dayKey(row.occurredAt, STUDY_DAY_TIMEZONE);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

/**
 * Minutes studied since the start of a day: the estimated duration of the
 * lessons finished since then (today's, or this week's from its Monday).
 * Those without a duration count as zero, as in the course's progress.
 */
async function minutesSince(userId: string, fromDay: string): Promise<number> {
  const rows = await getPlatformDb().lessonProgress.findMany({
    where: { userId, completedAt: { gte: startOfDay(fromDay, STUDY_DAY_TIMEZONE) } },
    select: { lesson: { select: { estimatedDuration: true } } },
  });
  return rows.reduce((total, row) => total + (row.lesson.estimatedDuration ?? 0), 0);
}

/** The streak alone, for the page that shows it without the goal. */
export const getStudyStreak = cache(async (): Promise<StudyStreak> => {
  const user = await getCurrentUser();
  const now = new Date();
  return streakOf(await activeDaysOf(user.id, now), dayKey(now, STUDY_DAY_TIMEZONE));
});

export const getStudyGoal = cache(async (): Promise<StudyGoal> => {
  const user = await getCurrentUser();
  const today = dayKey(new Date(), STUDY_DAY_TIMEZONE);

  const [streak, minutesToday, row] = await Promise.all([
    getStudyStreak(),
    minutesSince(user.id, today),
    getPlatformDb().user.findUnique({ where: { id: user.id }, select: { dailyGoalMinutes: true } }),
  ]);

  const goalMinutes = row?.dailyGoalMinutes ?? DEFAULT_GOAL_MINUTES;

  return {
    streak,
    minutesToday,
    goalMinutes,
    // Capped at the top: the bar cannot overflow and "120 %" says nothing that
    // "45 of 30 minutes" does not already say.
    percent: goalMinutes === 0 ? 0 : Math.min(100, Math.round((minutesToday / goalMinutes) * 100)),
  };
});

/**
 * The streak column of «Mis cursos»: the streak, sixteen weeks of activity
 * day by day, and the figures under them. One read of the activity log (the
 * same window as the streak's) and one of this week's finished lessons.
 */
export const getStreakOverview = cache(async (): Promise<StreakOverview> =>
  streakOverviewOf((await getCurrentUser()).id),
);

/**
 * The same overview for anyone, by their id: the profile draws its sixteen
 * weeks for whoever it shows (its owner, their teacher, the staff). It only
 * READS the activity, which playing never writes (no-activity.test.ts).
 */
export async function streakOverviewOf(userId: string): Promise<StreakOverview> {
  const now = new Date();
  const today = dayKey(now, STUDY_DAY_TIMEZONE);
  const monday = mondayOf(today);
  const [counts, minutesThisWeek] = await Promise.all([activityByDayOf(userId, now), minutesSince(userId, monday)]);

  const weeks = weeksUpTo(today, OVERVIEW_WEEKS).map((week) =>
    week.map((day) => {
      const count = counts.get(day) ?? 0;
      return { day, count, level: activityLevel(count), isToday: day === today, isFuture: day > today };
    }),
  );
  const days = weeks.flat();

  return {
    streak: streakOf(counts.keys(), today),
    weeks,
    daysStudied: days.filter((day) => day.count > 0).length,
    bestStreak: longestStreak(counts.keys()),
    daysThisWeek: days.filter((day) => day.day >= monday && day.count > 0).length,
    minutesThisWeek,
  };
}

/**
 * The minutes studied each day from `from` to `to` (both "yyyy-mm-dd" keys,
 * both included), the days of nothing as zeros: the estimated duration of
 * the lessons finished on each, as today's minutes are counted. One read of
 * the finished lessons, by anyone's id — the profile reads it for whoever it
 * shows. It never reads the games: playing is not studying.
 */
export async function studyMinutesByDayOf(userId: string, from: string, to: string): Promise<StudyMinutesDay[]> {
  const rows = await getPlatformDb().lessonProgress.findMany({
    where: {
      userId,
      completedAt: {
        gte: startOfDay(from, STUDY_DAY_TIMEZONE),
        lt: startOfDay(dayAfter(to), STUDY_DAY_TIMEZONE),
      },
    },
    select: { completedAt: true, lesson: { select: { estimatedDuration: true } } },
  });
  const byDay = new Map<string, number>();
  for (const row of rows) {
    if (!row.completedAt) continue;
    const day = dayKey(row.completedAt, STUDY_DAY_TIMEZONE);
    byDay.set(day, (byDay.get(day) ?? 0) + (row.lesson.estimatedDuration ?? 0));
  }
  return daysBetween(from, to).map((day) => ({ day, minutes: byDay.get(day) ?? 0 }));
}

/** A month of `days`, named and measured from its first day. */
function studyMonth(start: string, days: StudyMinutesDay[]): StudyMonth {
  return { start, name: MONTHS_ES[Number(start.slice(5, 7)) - 1] ?? "", length: daysInMonthOf(start), days };
}

/**
 * This month up to today against the whole of the last one, day by day: the
 * profile's «Minutos de estudio». One read (`studyMinutesByDayOf`) from the
 * first of last month to today, split at the turn of the month.
 */
export async function studyMonthComparisonOf(userId: string): Promise<StudyMonthComparison> {
  const today = dayKey(new Date(), STUDY_DAY_TIMEZONE);
  const currentStart = monthStartOf(today);
  const previousStart = previousMonthStartOf(today);
  const days = await studyMinutesByDayOf(userId, previousStart, today);
  return {
    today,
    previous: studyMonth(
      previousStart,
      days.filter((day) => day.day < currentStart),
    ),
    current: studyMonth(
      currentStart,
      days.filter((day) => day.day >= currentStart),
    ),
  };
}

/**
 * Anyone's streak and this week's figures, by their id: the profile reads it
 * for whoever it shows (its owner, their teacher, the staff), so it takes the
 * id instead of the session. It only READS the activity: playing never writes
 * it (no-activity.test.ts), so a profile's games never move these figures.
 */
export async function streakSummaryOf(userId: string): Promise<StreakSummary> {
  const now = new Date();
  const today = dayKey(now, STUDY_DAY_TIMEZONE);
  const monday = mondayOf(today);
  const [counts, minutesThisWeek] = await Promise.all([activityByDayOf(userId, now), minutesSince(userId, monday)]);
  return {
    streak: streakOf(counts.keys(), today),
    daysThisWeek: [...counts].filter(([day, count]) => day >= monday && day <= today && count > 0).length,
    minutesThisWeek,
  };
}
