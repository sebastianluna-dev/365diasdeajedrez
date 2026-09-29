import { cache } from "react";
import { DEFAULT_GOAL_MINUTES } from "@/constants/platform/study-goal.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { dayKey, startOfDay, streakOf } from "@/lib/study-streak";
import type { StudyGoal, StudyStreak } from "./study-goal.types";

// Streak and daily goal: the two figures of the day. The dashboard shows both;
// "Mis cursos", the streak.
//
// Neither of the two is stored as such. The streak is DERIVED from the activity
// and today's minutes from the lessons finished today; the only thing stored is
// the goal, which is a decision of the student's and not a computation.

/** How far back to look for the streak. */
const STREAK_WINDOW_DAYS = 400;

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
  const since = new Date(now.getTime() - STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await getPlatformDb().userActivity.findMany({
    where: { userId, occurredAt: { gte: since } },
    select: { occurredAt: true },
    orderBy: { occurredAt: "desc" },
  });
  return new Set(rows.map((row) => dayKey(row.occurredAt, STUDY_DAY_TIMEZONE)));
}

/**
 * Minutes studied today: the estimated duration of the lessons they finished
 * today. Those without a duration count as zero, as in the course's progress.
 */
async function minutesTodayOf(userId: string, today: string): Promise<number> {
  const rows = await getPlatformDb().lessonProgress.findMany({
    where: { userId, completedAt: { gte: startOfDay(today, STUDY_DAY_TIMEZONE) } },
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
    minutesTodayOf(user.id, today),
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
