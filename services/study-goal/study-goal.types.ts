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
