import { describe, expect, it } from "vitest";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { mapActivityItems, mapDashboardStats, type ActivityRow, type StatLabels } from "./dashboard.mapper";

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
