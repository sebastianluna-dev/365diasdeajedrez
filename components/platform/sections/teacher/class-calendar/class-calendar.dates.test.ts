import { describe, expect, it } from "vitest";
import {
  addMonths,
  clock,
  daysOf,
  placeInLanes,
  startOfWeek,
  stepDay,
  viewTitle,
  zonedMoment,
} from "./class-calendar.dates";

describe("zonedMoment", () => {
  it("reads an instant on the teacher's clock, not the browser's", () => {
    // 00:30 UTC on the 20th is 18:30 of the 19th in Mexico City.
    expect(zonedMoment("2026-10-20T00:30:00Z", "America/Mexico_City")).toEqual({ day: "2026-10-19", minute: 1110 });
    expect(zonedMoment("2026-10-20T00:30:00Z", "Europe/Madrid")).toEqual({ day: "2026-10-20", minute: 150 });
  });
});

describe("the days of a view", () => {
  it("starts the week on Monday", () => {
    expect(startOfWeek("2026-10-25")).toBe("2026-10-19");
    expect(daysOf("week", "2026-10-21")).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });

  it("shows a month as the six weeks that hold it", () => {
    const days = daysOf("month", "2026-10-19");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-09-28");
    expect(days).toContain("2026-10-31");
  });

  it("steps a day, a week or a month, keeping the day within a shorter month", () => {
    expect(stepDay("day", "2026-10-31", 1)).toBe("2026-11-01");
    expect(stepDay("week", "2026-10-19", -1)).toBe("2026-10-12");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
  });
});

describe("viewTitle", () => {
  it("names a day, a week inside a month, a week across two and a month", () => {
    expect(viewTitle("day", "2026-10-19")).toBe("lunes, 19 de octubre de 2026");
    expect(viewTitle("week", "2026-10-21")).toBe("19 – 25 de octubre de 2026");
    expect(viewTitle("week", "2026-10-01")).toMatch(/^28 (de )?sept?\.? – 4 (de )?oct\.? (de )?2026$/);
    expect(viewTitle("month", "2026-10-19")).toBe("octubre de 2026");
  });
});

describe("placeInLanes", () => {
  it("gives overlapping classes lanes side by side, and a free class the whole width", () => {
    const placed = placeInLanes([
      { item: "a", start: 600, end: 660 },
      { item: "b", start: 630, end: 690 },
      { item: "c", start: 720, end: 780 },
    ]);
    const byItem = Object.fromEntries(placed.map((entry) => [entry.item, [entry.lane, entry.lanes]]));
    expect(byItem).toEqual({ a: [0, 2], b: [1, 2], c: [0, 1] });
  });
});

describe("clock", () => {
  it("writes a minute of the day on the 24-hour clock", () => {
    expect(clock(1110)).toBe("18:30");
    expect(clock(65)).toBe("01:05");
  });
});
