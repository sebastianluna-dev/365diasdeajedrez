/** What «Ajustes» shows and changes: the person, and the one thing they set. */
export interface AccountSettings {
  displayName: string;
  email: string;
  /** The day they joined, already written out in Spanish. */
  memberSinceLabel: string;
  /** Minutes a day they set themselves (`User.dailyGoalMinutes`). */
  goalMinutes: number;
  /** Their user name: the address of their profile. */
  slug: string;
  /** The line under their name on the profile; null when they wrote none. */
  statusLine: string | null;
  /** A FIDE federation code, for the profile's flag; null for none. */
  country: string | null;
}
