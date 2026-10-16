import { describe, expect, it } from "vitest";

import {
  activityLevel,
  dayKey,
  longestStreak,
  mondayOf,
  startOfDay,
  streakLength,
  streakOf,
  weeksUpTo,
} from "@/lib/study-streak";

const MX = "America/Mexico_City";

describe("dayKey", () => {
  it("da el día de la zona, no el de UTC", () => {
    // 00:10 UTC on the 16th is still 18:10 on the 15th in Mexico: that
    // afternoon's streak has to count as the 15th's.
    expect(dayKey(new Date("2026-03-16T00:10:00.000Z"), MX)).toBe("2026-03-15");
    expect(dayKey(new Date("2026-03-16T06:10:00.000Z"), MX)).toBe("2026-03-16");
  });

  it("en UTC es el día de UTC", () => {
    expect(dayKey(new Date("2026-03-15T23:30:00.000Z"), "UTC")).toBe("2026-03-15");
  });
});

describe("startOfDay", () => {
  it("es la medianoche local expresada en UTC", () => {
    expect(startOfDay("2026-03-15", MX).toISOString()).toBe("2026-03-15T06:00:00.000Z");
    expect(startOfDay("2026-03-15", "UTC").toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });

  it("es la vuelta de dayKey: el primer instante del día pertenece a ese día", () => {
    for (const key of ["2026-01-01", "2026-03-15", "2026-07-04", "2026-11-02", "2026-12-31"]) {
      expect(dayKey(startOfDay(key, MX), MX)).toBe(key);
      // And a millisecond earlier belongs to the previous day, which is what keeps
      // bounding a query with `gte` from eating part of yesterday.
      expect(dayKey(new Date(startOfDay(key, MX).getTime() - 1), MX)).not.toBe(key);
    }
  });

  it("sigue al horario de verano en lugar de suponer un desfase fijo", () => {
    // Spain changes the clock on the last Sunday of March: before it is +1, after +2.
    expect(startOfDay("2026-03-01", "Europe/Madrid").toISOString()).toBe("2026-02-28T23:00:00.000Z");
    expect(startOfDay("2026-04-01", "Europe/Madrid").toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });

  it("acierta también el mismo día del cambio, que empieza con el desfase de antes", () => {
    // Madrid moves forward at 02:00 on 29 March 2026: that day started at 00:00 CET.
    expect(startOfDay("2026-03-29", "Europe/Madrid").toISOString()).toBe("2026-03-28T23:00:00.000Z");
    // Mexico City last moved back at 02:00 on 30 October 2022: that day started at 00:00 CDT.
    expect(startOfDay("2022-10-30", MX).toISOString()).toBe("2022-10-30T05:00:00.000Z");
    // Santiago skips midnight on 6 September 2026: that day starts at 01:00.
    expect(startOfDay("2026-09-06", "America/Santiago").toISOString()).toBe("2026-09-06T04:00:00.000Z");
    for (const [key, zone] of [
      ["2026-03-29", "Europe/Madrid"],
      ["2022-10-30", MX],
      ["2026-09-06", "America/Santiago"],
      ["2026-11-01", "America/New_York"],
    ] as const) {
      expect(dayKey(startOfDay(key, zone), zone)).toBe(key);
      expect(dayKey(new Date(startOfDay(key, zone).getTime() - 1), zone)).not.toBe(key);
    }
  });
});

describe("streakLength", () => {
  it("sin actividad no hay racha", () => {
    expect(streakLength([], "2026-03-15")).toBe(0);
  });

  it("cuenta los días seguidos que terminan hoy", () => {
    const days = ["2026-03-13", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("el día de hoy todavía en blanco NO rompe la racha", () => {
    // It is nine in the morning and they have not studied yet: yesterday, the day
    // before and the one before that still count.
    const days = ["2026-03-12", "2026-03-13", "2026-03-14"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("pero dos días en blanco sí la rompen", () => {
    expect(streakLength(["2026-03-12", "2026-03-13"], "2026-03-15")).toBe(0);
  });

  it("un hueco corta la cuenta ahí, no antes", () => {
    // The 13th is missing: only the 14th and the 15th count.
    const days = ["2026-03-10", "2026-03-11", "2026-03-12", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(2);
  });

  it("los días repetidos son un solo día", () => {
    const days = ["2026-03-15", "2026-03-15", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(2);
  });

  it("no le importa el orden en que lleguen", () => {
    const days = ["2026-03-15", "2026-03-13", "2026-03-14"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("cruza el cambio de mes", () => {
    const days = ["2026-02-27", "2026-02-28", "2026-03-01"];
    expect(streakLength(days, "2026-03-01")).toBe(3);
  });

  it("cruza el 29 de febrero de un año bisiesto", () => {
    const days = ["2024-02-28", "2024-02-29", "2024-03-01"];
    expect(streakLength(days, "2024-03-01")).toBe(3);
  });

  it("cruza el fin de año", () => {
    const days = ["2025-12-30", "2025-12-31", "2026-01-01"];
    expect(streakLength(days, "2026-01-01")).toBe(3);
  });

  it("la actividad futura no infla la racha de hoy", () => {
    // A clock skew could leave a row dated tomorrow; counting it would hand over a
    // day that has not been studied.
    const days = ["2026-03-15", "2026-03-16"];
    expect(streakLength(days, "2026-03-15")).toBe(1);
  });

  it("una racha de un solo día es 1", () => {
    expect(streakLength(["2026-03-15"], "2026-03-15")).toBe(1);
  });
});

describe("streakOf", () => {
  it("dice si hoy ya cuenta en la racha", () => {
    expect(streakOf(["2026-03-15", "2026-03-14"], "2026-03-15")).toEqual({ days: 2, studiedToday: true });
  });

  it("sin actividad hoy la racha sigue en pie, pero está por mantenerse", () => {
    expect(streakOf(["2026-03-14", "2026-03-13"], "2026-03-15")).toEqual({ days: 2, studiedToday: false });
  });

  it("sin actividad ayer ni hoy no hay racha", () => {
    expect(streakOf(["2026-03-12"], "2026-03-15")).toEqual({ days: 0, studiedToday: false });
    expect(streakOf([], "2026-03-15")).toEqual({ days: 0, studiedToday: false });
  });
});

describe("longestStreak", () => {
  it("is the longest run of consecutive days, wherever it falls", () => {
    expect(longestStreak(["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-05", "2026-10-06"])).toBe(4);
  });

  it("crosses the end of a month and ignores repeated days", () => {
    expect(longestStreak(["2026-09-30", "2026-10-01", "2026-10-01", "2026-10-02"])).toBe(3);
  });

  it("is 0 without days", () => {
    expect(longestStreak([])).toBe(0);
  });
});

describe("mondayOf", () => {
  it("is the Monday of the week, Sunday being its last day", () => {
    expect(mondayOf("2026-10-07")).toBe("2026-10-05");
    expect(mondayOf("2026-10-05")).toBe("2026-10-05");
    expect(mondayOf("2026-10-11")).toBe("2026-10-05");
    expect(mondayOf("2026-11-01")).toBe("2026-10-26");
  });
});

describe("weeksUpTo", () => {
  it("gives whole weeks, Monday to Sunday, the one of today last", () => {
    const weeks = weeksUpTo("2026-10-07", 2);
    expect(weeks).toEqual([
      ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"],
      ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"],
    ]);
  });
});

describe("activityLevel", () => {
  it("weighs a day by how much was done in it", () => {
    expect([0, 1, 2, 3, 4, 9].map(activityLevel)).toEqual([0, 1, 2, 2, 3, 3]);
  });
});
