import { cache } from "react";
import { DEFAULT_GOAL_MINUTES } from "@/constants/platform/study-goal.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { activityLevel, dayKey, longestStreak, mondayOf, startOfDay, streakOf, weeksUpTo } from "@/lib/study-streak";
import type { StreakOverview, StreakSummary, StudyGoal, StudyStreak } from "./study-goal.types";

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
export const getStreakOverview = cache(async (): Promise<StreakOverview> => {
  const user = await getCurrentUser();
  const now = new Date();
  const today = dayKey(now, STUDY_DAY_TIMEZONE);
  const monday = mondayOf(today);
  const [counts, minutesThisWeek] = await Promise.all([activityByDayOf(user.id, now), minutesSince(user.id, monday)]);

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
});

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
