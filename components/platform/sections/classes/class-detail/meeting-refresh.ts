// When MeetingAccess asks the server for the class's page again.
//
// The meeting link never reaches the browser ahead of time: at the instant it
// opens, the countdown asks the router for a refresh, and the page comes back
// from the server with the link. A page that comes back WITHOUT it means the
// browser's clock is ahead of the server's, and the server hands the link over
// once its own clock gets there. Asking again every second until then was one
// full server render of the page per second; so each refresh that comes back
// without the link waits longer for the next, up to half a minute, which is
// also the longest a student waits for a link that is already there.

/** The wait after each refresh that came back without the link; the last one repeats. */
const RETRY_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000] as const;

const LONGEST_DELAY_MS = RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1] ?? 30_000;

/** How long to wait after the refresh numbered `attempt` (0 is the one at the instant) before the next one. */
export function meetingRefreshDelay(attempt: number): number {
  return RETRY_DELAYS_MS[Math.max(0, attempt)] ?? LONGEST_DELAY_MS;
}
