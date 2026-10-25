// The sample of «Estadísticas»' story and of its tile on the overview
// sheet: made up, deterministic, the shapes `getStudentStatistics` returns.

import {
  SAMPLE_LEVEL_POINTS,
  SAMPLE_OCTOBER_MINUTES,
  SAMPLE_STREAK,
  SAMPLE_STREAK_WEEKS,
} from "@/constants/platform/chart-samples.const";
import { bucketColumns, statsPeriodOf, type StatsPeriodKey } from "@/lib/stats-period";
import type { StudentStatistics } from "@/services/stats/stats.types";

const TODAY = "2026-10-25";
const OPENED = "2026-03-19";

/** Andrea's statistics on Sunday 25 October 2026, as the owner's «Estadísticas · C» draws them. */
export function sampleStatistics(key: StatsPeriodKey): StudentStatistics {
  const period = statsPeriodOf(key, TODAY, OPENED);
  const minutes = SAMPLE_OCTOBER_MINUTES.map((value, index) => ({
    day: `2026-10-${String(index + 1).padStart(2, "0")}`,
    value,
  }));
  const columns = bucketColumns(period, minutes);
  return {
    period,
    today: TODAY,
    study: {
      minutes: columns.reduce((total, column) => total + column.value, 0),
      previousSoFar: period.previous ? 420 : null,
      columns,
      goalMinutes: 20,
      goalDays: period.bucket === "day" ? columns.filter((column) => column.value >= 20).length : null,
      weekly: [80, 120, 95, 150, 140, 165, 175, 190],
      streak: {
        streak: SAMPLE_STREAK,
        weeks: SAMPLE_STREAK_WEEKS,
        daysStudied: SAMPLE_STREAK_WEEKS.flat().filter((day) => day.count > 0).length,
        bestStreak: 19,
        daysThisWeek: 7,
        minutesThisWeek: 190,
      },
      topics: [
        { label: "Táctica", value: 41 },
        { label: "Aperturas", value: 18 },
        { label: "Finales", value: 7 },
        { label: "Estructuras de peones", value: 4 },
        { label: "Otros", value: 3 },
      ],
      did: [
        { key: "lessons", label: "Lecciones", current: 26, previous: period.previous ? 22 : null },
        { key: "exercises", label: "Ejercicios", current: 41, previous: period.previous ? 38 : null },
        { key: "classes", label: "Clases", current: 2, previous: period.previous ? 2 : null },
        { key: "analyzed", label: "Partidas analizadas", current: 2, previous: period.previous ? 0 : null },
      ],
      coursesCompleted: 1,
    },
    exercises: {
      passed: 41,
      weeklyPassed: [9, 11, 10, 13, 12, 10, 11, 12],
      outcomes: { clean: 34, hinted: 7, wrong: 9, shown: 3 },
      themes: [
        { label: "Táctica", tried: 30, solved: 26 },
        { label: "Finales", tried: 11, solved: 9 },
        { label: "Aperturas", tried: 9, solved: 9 },
        { label: "Estrategia", tried: 10, solved: 5 },
      ],
      reviewDue: 4,
    },
    play: {
      level: {
        level: 850,
        sampleSize: SAMPLE_LEVEL_POINTS.length,
        series: SAMPLE_LEVEL_POINTS.map((point) => ({
          at: new Date(`2026-10-${point.label.slice(0, 2).trim().padStart(2, "0")}T18:00:00.000Z`),
          level: point.value,
        })),
      },
      record: { wins: 6, losses: 3, draws: 1, open: 1 },
    },
  };
}
