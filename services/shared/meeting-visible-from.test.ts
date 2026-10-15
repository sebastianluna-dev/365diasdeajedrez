import { describe, expect, it } from "vitest";
import { meetingVisibleFrom, meetingVisibleUntil, storedMeetingVisibleFrom } from "./meeting-visible-from";

const SCHEDULED_AT = new Date("2026-09-15T17:00:00.000Z");
const CHOSEN = new Date("2026-09-15T16:00:00.000Z");
const URL = "https://zoom.us/j/99999999999";

describe("storedMeetingVisibleFrom", () => {
  it("guarda la hora que eligió el profesor", () => {
    expect(storedMeetingVisibleFrom(URL, CHOSEN)).toEqual(CHOSEN);
  });

  it("no guarda la hora por defecto: vacío es «media hora antes»", () => {
    expect(storedMeetingVisibleFrom(URL, null)).toBeNull();
  });

  // An instant without a link promised the student a link that did not exist,
  // and the teacher's page said «Enlace visible desde …» about nothing.
  it("sin enlace no guarda ninguna, elegida o no", () => {
    expect(storedMeetingVisibleFrom(null, CHOSEN)).toBeNull();
    expect(storedMeetingVisibleFrom(null, null)).toBeNull();
  });
});

describe("meetingVisibleFrom", () => {
  it("sin hora elegida, abre el enlace media hora antes de la clase", () => {
    expect(meetingVisibleFrom(URL, SCHEDULED_AT, null)).toEqual(new Date("2026-09-15T16:30:00.000Z"));
  });

  it("la hora por defecto se mueve con la clase", () => {
    const moved = new Date("2026-09-16T10:00:00.000Z");
    expect(meetingVisibleFrom(URL, moved, null)).toEqual(new Date("2026-09-16T09:30:00.000Z"));
  });

  it("con una hora elegida, abre el enlace a esa hora aunque la clase cambie de hora", () => {
    expect(meetingVisibleFrom(URL, SCHEDULED_AT, CHOSEN)).toEqual(CHOSEN);
    expect(meetingVisibleFrom(URL, new Date("2026-09-16T10:00:00.000Z"), CHOSEN)).toEqual(CHOSEN);
  });

  it("sin enlace no hay hora, guarde lo que guarde la fila", () => {
    expect(meetingVisibleFrom(null, SCHEDULED_AT, null)).toBeNull();
    expect(meetingVisibleFrom(null, SCHEDULED_AT, CHOSEN)).toBeNull();
  });

  it("es lo que se guarda, leído de vuelta", () => {
    for (const chosen of [CHOSEN, null]) {
      const stored = storedMeetingVisibleFrom(URL, chosen);
      expect(meetingVisibleFrom(URL, SCHEDULED_AT, stored)).toEqual(chosen ?? new Date("2026-09-15T16:30:00.000Z"));
    }
  });
});

describe("meetingVisibleUntil", () => {
  it("cierra el enlace media hora después del fin de la clase", () => {
    expect(meetingVisibleUntil(new Date("2026-10-14T19:00:00.000Z"))).toEqual(new Date("2026-10-14T19:30:00.000Z"));
  });
});
