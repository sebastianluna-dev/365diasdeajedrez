import { describe, expect, it } from "vitest";
import { meetingVisibleFrom } from "./meeting-visible-from";

const SCHEDULED_AT = new Date("2026-09-15T17:00:00.000Z");
const CHOSEN = new Date("2026-09-15T16:50:00.000Z");
const URL = "https://zoom.us/j/99999999999";

describe("meetingVisibleFrom", () => {
  it("with a link and no instant chosen, opens it half an hour before the class", () => {
    expect(meetingVisibleFrom(URL, SCHEDULED_AT, null)).toEqual(new Date("2026-09-15T16:30:00.000Z"));
  });

  it("with a link, keeps the instant the teacher chose", () => {
    expect(meetingVisibleFrom(URL, SCHEDULED_AT, CHOSEN)).toEqual(CHOSEN);
  });

  // An instant without a link promised the student a link that did not exist,
  // and the teacher's page said «Enlace visible desde …» about nothing.
  it("without a link, stores no instant, chosen or not", () => {
    expect(meetingVisibleFrom(null, SCHEDULED_AT, null)).toBeNull();
    expect(meetingVisibleFrom(null, SCHEDULED_AT, CHOSEN)).toBeNull();
  });
});
