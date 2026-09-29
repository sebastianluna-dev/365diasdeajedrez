/** What «Ajustes» shows and changes: the person, and the one thing they set. */
export interface AccountSettings {
  displayName: string;
  email: string;
  /** The day they joined, already written out in Spanish. */
  memberSinceLabel: string;
  /** Minutes a day they set themselves (`User.dailyGoalMinutes`). */
  goalMinutes: number;
}
