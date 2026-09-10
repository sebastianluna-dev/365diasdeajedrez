// Daily study goal, in minutes.
//
// In a file apart from the service because both sides need it: the server
// to validate what comes from the form and the browser's selector to render
// the options. Importing the service from the client would drag the data
// access into the browser.

/** The same as the `@default` of `User.dailyGoalMinutes`. */
export const DEFAULT_GOAL_MINUTES = 30;

/**
 * What can be chosen. Half an hour in the middle and nothing above two
 * hours: past that it is no longer a DAILY goal, it is a weekend plan, and a
 * goal that is never met discourages instead of encouraging.
 */
export const GOAL_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120] as const;

export function isGoalOption(value: number): boolean {
  return (GOAL_OPTIONS as readonly number[]).includes(value);
}
