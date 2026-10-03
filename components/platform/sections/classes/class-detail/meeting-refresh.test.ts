import { describe, expect, it } from "vitest";
import { meetingRefreshDelay } from "./meeting-refresh";

/** When, counted from the instant, the page is asked for during the first `windowMs` if the link never comes. */
function refreshesWithin(windowMs: number): number[] {
  const at: number[] = [];
  for (let attempt = 0, time = 0; time <= windowMs; time += meetingRefreshDelay(attempt), attempt += 1) at.push(time);
  return at;
}

describe("meetingRefreshDelay", () => {
  it("waits longer after each refresh that came back without the link: 1 s, 2 s, 5 s, 10 s", () => {
    expect([0, 1, 2, 3].map(meetingRefreshDelay)).toEqual([1_000, 2_000, 5_000, 10_000]);
  });

  it("then settles at half a minute, for as long as the server's clock takes", () => {
    expect([4, 5, 50, 5_000].map(meetingRefreshDelay)).toEqual([30_000, 30_000, 30_000, 30_000]);
  });

  it("never asks again in under a second", () => {
    for (let attempt = -1; attempt < 20; attempt += 1)
      expect(meetingRefreshDelay(attempt)).toBeGreaterThanOrEqual(1_000);
  });

  // A page refreshed every second asked for 600 server renders in those ten minutes.
  it("asks for the page some two dozen times in the ten minutes after the instant, not six hundred", () => {
    const times = refreshesWithin(10 * 60_000);
    expect(times.slice(0, 6)).toEqual([0, 1_000, 3_000, 8_000, 18_000, 48_000]);
    expect(times.length).toBeLessThan(25);
  });
});
