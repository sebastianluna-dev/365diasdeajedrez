import { describe, expect, it } from "vitest";
import { rangeStart, type StatsRangeKey } from "@/lib/date-ranges";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import {
  STATS_RANGES,
  bucketStatRangeSums,
  mapActivityItems,
  mapDashboardStats,
  statRangeSumsQuery,
  type ActivityRow,
  type StatLabels,
  type StatRangeSumsRow,
  type StatTotalRow,
} from "./dashboard.mapper";

const labels: StatLabels = {
  metrics: [
    { id: 1, label: "Lecciones" },
    { id: 2, label: "Clases" },
  ],
  topics: new Map([
    [10, "Táctica"],
    [11, "Finales"],
  ]),
};

const empty = { week: [], month: [], year: [], all: [] };

describe("mapDashboardStats", () => {
  it("siempre lista todas las métricas del catálogo, en su orden y aunque valgan cero", () => {
    const stats = mapDashboardStats({ ...empty, week: [{ metricId: 2, topicId: null, total: 3 }] }, labels);
    expect(stats.week.totals).toEqual([
      { label: "Lecciones", count: 0 },
      { label: "Clases", count: 3 },
    ]);
    expect(stats.all.totals).toEqual([
      { label: "Lecciones", count: 0 },
      { label: "Clases", count: 0 },
    ]);
  });

  it("separa el total (tema nulo) del desglose por tema, ordenado de mayor a menor", () => {
    const rows = [
      { metricId: 1, topicId: null, total: 5 },
      { metricId: 1, topicId: 11, total: 1 },
      { metricId: 1, topicId: 10, total: 4 },
      { metricId: 2, topicId: 10, total: 2 },
    ];
    const { month } = mapDashboardStats({ ...empty, month: rows }, labels);
    expect(month.totals).toEqual([
      { label: "Lecciones", count: 5 },
      { label: "Clases", count: 0 },
    ]);
    expect(month.topics).toEqual([
      { label: "Táctica", count: 6 },
      { label: "Finales", count: 1 },
    ]);
  });

  it("ignora un tema que ya no está en el catálogo", () => {
    const { year } = mapDashboardStats({ ...empty, year: [{ metricId: 1, topicId: 99, total: 7 }] }, labels);
    expect(year.topics).toEqual([]);
  });
});

/** A row of `UserStatDaily` as the tests need it: the day is the study day at UTC midnight. */
interface DailyRow {
  day: string;
  metricId: number;
  topicId: number | null;
  value: number;
}

const dayOf = (row: DailyRow) => new Date(`${row.day}T00:00:00.000Z`);
const isoDay = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);
const byGroup = (a: StatTotalRow, b: StatTotalRow) => a.metricId - b.metricId || (a.topicId ?? -1) - (b.topicId ?? -1);

/**
 * What the dashboard computed before the single query: one `groupBy` per range
 * over `[metricId, topicId]` with `day >= rangeStart(range)` (no filter for
 * "all"). A group only exists in a range where it has rows.
 */
function perRangeGroupBy(rows: DailyRow[], now: Date): Record<StatsRangeKey, StatTotalRow[]> {
  const totals = { week: [], month: [], year: [], all: [] } as Record<StatsRangeKey, StatTotalRow[]>;
  for (const key of STATS_RANGES) {
    const start = rangeStart(key, now);
    const groups = new Map<string, StatTotalRow>();
    for (const row of rows) {
      if (start && dayOf(row) < start) continue;
      const id = `${row.metricId}|${row.topicId}`;
      const group = groups.get(id) ?? { metricId: row.metricId, topicId: row.topicId, total: 0 };
      group.total += row.value;
      groups.set(id, group);
    }
    totals[key] = [...groups.values()].sort(byGroup);
  }
  return totals;
}

/**
 * What PostgreSQL answers to `statRangeSumsQuery`: every group of the student,
 * and per range `SUM(value) FILTER (WHERE day >= start)`, which is NULL when no
 * row of the group passes the filter.
 */
function filteredSums(rows: DailyRow[], now: Date): StatRangeSumsRow[] {
  const groups = new Map<string, { metricId: number; topicId: number | null; rows: DailyRow[] }>();
  for (const row of rows) {
    const id = `${row.metricId}|${row.topicId}`;
    const group = groups.get(id) ?? { metricId: row.metricId, topicId: row.topicId, rows: [] };
    group.rows.push(row);
    groups.set(id, group);
  }
  return [...groups.values()].map(({ metricId, topicId, rows: groupRows }) => {
    const sums = Object.fromEntries(
      STATS_RANGES.map((key) => {
        const start = rangeStart(key, now);
        const passing = groupRows.filter((row) => !start || dayOf(row) >= start);
        return [key, passing.length > 0 ? passing.reduce((sum, row) => sum + row.value, 0) : null];
      }),
    ) as Record<StatsRangeKey, number | null>;
    return { metricId, topicId, ...sums };
  });
}

function sortedRanges(totals: Record<StatsRangeKey, StatTotalRow[]>): Record<StatsRangeKey, StatTotalRow[]> {
  return {
    week: [...totals.week].sort(byGroup),
    month: [...totals.month].sort(byGroup),
    year: [...totals.year].sort(byGroup),
    all: [...totals.all].sort(byGroup),
  };
}

describe("statRangeSumsQuery", () => {
  it("corta cada rango donde lo corta rangeStart: lunes, día 1 y 1 de enero, y «todo» sin filtro", () => {
    const query = statRangeSumsQuery("u-1", new Date("2026-09-09T15:00:00Z"));
    expect(query.values.map(isoDay)).toEqual(["2026-09-07", "2026-09-01", "2026-01-01", "u-1"]);
    expect(query.text).toContain(`(SUM("value") FILTER (WHERE "day" >= $1::date))::int AS "week"`);
    expect(query.text).toContain(`(SUM("value") FILTER (WHERE "day" >= $2::date))::int AS "month"`);
    expect(query.text).toContain(`(SUM("value") FILTER (WHERE "day" >= $3::date))::int AS "year"`);
    expect(query.text).toContain(`SUM("value")::int AS "all"`);
    expect(query.text).toContain(`WHERE "userId" = $4`);
    expect(query.text).toContain(`GROUP BY "metricId", "topicId"`);
  });

  it("la noche del domingo en México sigue en la semana que acaba, aunque en UTC ya sea lunes", () => {
    const query = statRangeSumsQuery("u-1", new Date("2026-09-14T04:00:00Z"));
    expect(query.values.map(isoDay)).toEqual(["2026-09-07", "2026-09-01", "2026-01-01", "u-1"]);
  });

  it("una semana que empezó el año anterior empieza antes que el año", () => {
    const query = statRangeSumsQuery("u-1", new Date("2026-01-01T12:00:00Z"));
    expect(query.values.map(isoDay)).toEqual(["2025-12-29", "2026-01-01", "2026-01-01", "u-1"]);
  });
});

describe("bucketStatRangeSums", () => {
  it("reparte cada grupo en los rangos donde tiene filas", () => {
    const rows: StatRangeSumsRow[] = [
      { metricId: 1, topicId: null, week: 2, month: 5, year: 9, all: 12 },
      { metricId: 1, topicId: 10, week: null, month: 3, year: 3, all: 4 },
    ];
    expect(bucketStatRangeSums(rows)).toEqual({
      week: [{ metricId: 1, topicId: null, total: 2 }],
      month: [
        { metricId: 1, topicId: null, total: 5 },
        { metricId: 1, topicId: 10, total: 3 },
      ],
      year: [
        { metricId: 1, topicId: null, total: 9 },
        { metricId: 1, topicId: 10, total: 3 },
      ],
      all: [
        { metricId: 1, topicId: null, total: 12 },
        { metricId: 1, topicId: 10, total: 4 },
      ],
    });
  });

  it("una suma nula deja el grupo fuera del rango; una suma cero lo deja dentro, como hacía el groupBy", () => {
    const { week, all } = bucketStatRangeSums([{ metricId: 2, topicId: 11, week: 0, month: 0, year: 0, all: 0 }]);
    expect(week).toEqual([{ metricId: 2, topicId: 11, total: 0 }]);
    expect(all).toEqual([{ metricId: 2, topicId: 11, total: 0 }]);
    expect(bucketStatRangeSums([{ metricId: 2, topicId: 11, week: null, month: null, year: null, all: 3 }])).toEqual({
      week: [],
      month: [],
      year: [],
      all: [{ metricId: 2, topicId: 11, total: 3 }],
    });
  });

  it("sin filas, los cuatro rangos vacíos", () => {
    expect(bucketStatRangeSums([])).toEqual({ week: [], month: [], year: [], all: [] });
  });

  describe("da lo mismo que los cuatro groupBy por rango que sustituye", () => {
    // Each boundary on both sides: the Monday and the Sunday before it, the
    // first of the month and the day before, the first of January and the
    // last day of the year before, and a day of another year.
    const rows: DailyRow[] = [
      { day: "2026-09-13", metricId: 1, topicId: null, value: 2 },
      { day: "2026-09-13", metricId: 1, topicId: 10, value: 2 },
      { day: "2026-09-07", metricId: 1, topicId: null, value: 1 },
      { day: "2026-09-07", metricId: 1, topicId: 11, value: 1 },
      { day: "2026-09-06", metricId: 2, topicId: null, value: 3 },
      { day: "2026-09-01", metricId: 2, topicId: null, value: 1 },
      { day: "2026-09-01", metricId: 2, topicId: 10, value: 1 },
      { day: "2026-08-31", metricId: 1, topicId: null, value: 4 },
      { day: "2026-08-31", metricId: 1, topicId: 11, value: 4 },
      { day: "2026-01-01", metricId: 3, topicId: null, value: 1 },
      { day: "2025-12-31", metricId: 3, topicId: null, value: 5 },
      { day: "2025-12-31", metricId: 3, topicId: 12, value: 5 },
      { day: "2025-12-29", metricId: 4, topicId: null, value: 6 },
      { day: "2025-12-28", metricId: 4, topicId: null, value: 2 },
      { day: "2024-05-05", metricId: 1, topicId: null, value: 7 },
    ];

    it.each([
      ["un miércoles de septiembre", "2026-09-09T15:00:00Z"],
      ["la noche del domingo en México (lunes en UTC)", "2026-09-14T04:00:00Z"],
      ["el primer lunes de la semana, a primera hora en México", "2026-09-07T06:30:00Z"],
      ["el 1 de enero, con la semana empezada el año anterior", "2026-01-01T12:00:00Z"],
      ["la última noche del año en México (1 de enero en UTC)", "2026-01-01T03:00:00Z"],
    ])("%s", (_, instant) => {
      const now = new Date(instant);
      expect(sortedRanges(bucketStatRangeSums(filteredSums(rows, now)))).toEqual(perRangeGroupBy(rows, now));
    });
  });
});

describe("mapActivityItems", () => {
  it("pone nombre al sujeto cuando se conoce y fecha en español", () => {
    const when = new Date(Date.UTC(2026, 8, 21, 12));
    const rows = [
      {
        id: "a1",
        subjectId: "00000001",
        occurredAt: when,
        type: { label: "Lección completada" },
        topic: { label: "Finales" },
      },
      { id: "a2", subjectId: "missing", occurredAt: when, type: { label: "Clase" }, topic: null },
    ] as unknown as ActivityRow[];

    const items = mapActivityItems(rows, new Map([["00000001", "Torre activa"]]));
    expect(items).toEqual([
      {
        id: "a1",
        typeLabel: "Lección completada",
        subjectName: "Torre activa",
        topicLabel: "Finales",
        dateLabel: formatSpanishDate(when),
      },
      {
        id: "a2",
        typeLabel: "Clase",
        subjectName: undefined,
        topicLabel: undefined,
        dateLabel: formatSpanishDate(when),
      },
    ]);
  });
});
