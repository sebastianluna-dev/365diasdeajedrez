export interface StudyGoal {
  /** Consecutive days studying, counting backwards from today. */
  streakDays: number;
  /** Minutes studied today, adding up the duration of the finished lessons. */
  minutesToday: number;
  /** The ones the student sets themselves per day. */
  goalMinutes: number;
  /** How much of the goal is done, 0–100 and capped at the top: overshooting is not a 140 %. */
  percent: number;
}
