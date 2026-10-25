import { describe, expect, it } from "vitest";
import { bucketColumns, parseStatsPeriod, rangeLabel, shortRangeLabel, statsPeriodOf } from "@/lib/stats-period";

const OPENED = "2026-03-19";

describe("the periods of the statistics", () => {
  it("read the address, falling back to the month", () => {
    expect(parseStatsPeriod("semana")).toBe("semana");
    expect(parseStatsPeriod("todo")).toBe("todo");
    expect(parseStatsPeriod(undefined)).toBe("mes");
    expect(parseStatsPeriod("siempre")).toBe("mes");
  });

  it("run the week from Monday and compare it with the last one up to the same weekday", () => {
    const week = statsPeriodOf("semana", "2026-10-22", OPENED);
    expect(week.range).toEqual({ from: "2026-10-19", to: "2026-10-22" });
    expect(week.previous?.whole).toEqual({ from: "2026-10-12", to: "2026-10-18" });
    expect(week.previous?.sameSoFar).toEqual({ from: "2026-10-12", to: "2026-10-15" });
    expect(week.label).toBe("Del 19 al 22 de octubre");
  });

  it("compare the month with the last one, whose short end caps «a estas alturas»", () => {
    const month = statsPeriodOf("mes", "2026-10-25", OPENED);
    expect(month.range).toEqual({ from: "2026-10-01", to: "2026-10-25" });
    expect(month.previous?.whole).toEqual({ from: "2026-09-01", to: "2026-09-30" });
    expect(month.previous?.name).toBe("septiembre");
    expect(month.shortLabel).toBe("1–25 oct");
    expect(statsPeriodOf("mes", "2026-03-31", "2025-01-01").previous?.sameSoFar.to).toBe("2026-02-28");
    expect(statsPeriodOf("mes", "2026-01-10", "2025-01-01").previous?.whole).toEqual({
      from: "2025-12-01",
      to: "2025-12-31",
    });
  });

  it("group the year by month and compare it with the year before", () => {
    const year = statsPeriodOf("anio", "2028-02-29", "2020-01-01");
    expect(year.bucket).toBe("month");
    expect(year.previous?.sameSoFar).toEqual({ from: "2027-01-01", to: "2027-02-28" });
    expect(year.previous?.name).toBe("2027");
  });

  it("start every period at the account's first day at the earliest", () => {
    expect(statsPeriodOf("anio", "2026-10-25", OPENED).range.from).toBe(OPENED);
    const all = statsPeriodOf("todo", "2026-10-25", OPENED);
    expect(all.range).toEqual({ from: OPENED, to: "2026-10-25" });
    expect(all.previous).toBeNull();
    expect(all.label).toBe("Desde el 19 de marzo de 2026");
    expect(statsPeriodOf("todo", "2026-10-25", "2023-05-02").bucket).toBe("year");
  });

  it("name their ranges across a month and a year", () => {
    expect(rangeLabel({ from: "2026-09-28", to: "2026-10-04" })).toBe("Del 28 de septiembre al 4 de octubre");
    expect(rangeLabel({ from: "2025-12-29", to: "2026-01-04" })).toBe("Del 29 de diciembre de 2025 al 4 de enero");
    expect(shortRangeLabel({ from: "2026-09-28", to: "2026-10-04" })).toBe("28 sep–4 oct");
  });

  it("fold the days into the columns of the chart, the empty ones as zeros", () => {
    const week = statsPeriodOf("semana", "2026-10-21", OPENED);
    const days = bucketColumns(week, [{ day: "2026-10-20", value: 25 }]);
    expect(days.map((column) => [column.axis, column.value])).toEqual([
      ["L", 0],
      ["M", 25],
      ["M", 0],
    ]);
    expect(days[1]?.long).toBe("martes 20");

    const year = statsPeriodOf("anio", "2026-10-25", OPENED);
    const months = bucketColumns(year, [
      { day: "2026-03-20", value: 10 },
      { day: "2026-03-30", value: 5 },
      { day: "2026-10-25", value: 20 },
    ]);
    expect(months).toHaveLength(8);
    expect(months[0]).toMatchObject({ axis: "mar", long: "marzo de 2026", value: 15 });
    expect(months.at(-1)).toMatchObject({ axis: "oct", value: 20 });
  });
});
