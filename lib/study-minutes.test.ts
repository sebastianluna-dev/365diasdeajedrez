import { describe, expect, it } from "vitest";
import {
  cumulative,
  dayAfter,
  daysBetween,
  daysInMonthOf,
  monthEndOf,
  monthStartOf,
  previousMonthStartOf,
} from "@/lib/study-minutes";

describe("the months of the study minutes", () => {
  it("start on the first and end on their last day", () => {
    expect(monthStartOf("2026-10-25")).toBe("2026-10-01");
    expect(monthEndOf("2026-10-25")).toBe("2026-10-31");
    expect(monthEndOf("2026-09-03")).toBe("2026-09-30");
  });

  it("count February's days, leap years included", () => {
    expect(daysInMonthOf("2026-02-10")).toBe(28);
    expect(daysInMonthOf("2028-02-10")).toBe(29);
  });

  it("go back across the turn of the year", () => {
    expect(previousMonthStartOf("2026-01-14")).toBe("2025-12-01");
    expect(previousMonthStartOf("2026-03-31")).toBe("2026-02-01");
  });
});

describe("daysBetween", () => {
  it("lists both ends and every day between", () => {
    expect(daysBetween("2026-02-27", "2026-03-02")).toEqual(["2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"]);
  });

  it("ends a range on the day after its last", () => {
    expect(dayAfter("2026-12-31")).toBe("2027-01-01");
  });

  it("is empty when the end comes first", () => {
    expect(daysBetween("2026-03-02", "2026-03-01")).toEqual([]);
  });
});

describe("cumulative", () => {
  it("adds up as it goes", () => {
    expect(cumulative([10, 0, 5])).toEqual([10, 10, 15]);
    expect(cumulative([])).toEqual([]);
  });
});
