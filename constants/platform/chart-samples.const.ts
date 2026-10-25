import { cumulative } from "@/lib/study-minutes";
import { activityLevel } from "@/lib/study-streak";
import type { StreakDay } from "@/services/study-goal/study-goal.types";

// The sample data of the charts' stories and of the overview sheet: Andrea's
// profile as the owner's «Gráficas del perfil» draws it (2026-10-25), on
// Sunday 25 October 2026. Made up, deterministic, and the same shapes the
// services return.

const DAY_MS = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 6, 6);
const TODAY = 111;

/** Sixteen weeks, Monday 6 July to Sunday 25 October 2026, as `StreakOverview.weeks`. */
export const SAMPLE_STREAK_WEEKS: StreakDay[][] = Array.from({ length: 16 }, (_, week) =>
  Array.from({ length: 7 }, (_, weekday) => {
    const index = week * 7 + weekday;
    const studied =
      (index >= 30 && index <= 48) || index >= 100
        ? true
        : index === 29 || index === 49 || index === 99
          ? false
          : (index * 37 + 11) % 17 < 10;
    const count = studied ? 1 + ((index * 13 + 5) % 6) : 0;
    return {
      day: new Date(START + index * DAY_MS).toISOString().slice(0, 10),
      count,
      level: activityLevel(count),
      isToday: index === TODAY,
      isFuture: index > TODAY,
    };
  }),
);

/** The sample's streak: twelve days, today among them. */
export const SAMPLE_STREAK = { days: 12, studiedToday: true };

/** The minutes of the lessons finished each day: 1–30 September, and 1–25 October. */
const minutesOf = (index: number, studied: boolean) =>
  studied ? [15, 20, 25, 30, 35, 20, 10, 25][(index * 7 + 3) % 8]! : 0;
const SAMPLE_DAYS = SAMPLE_STREAK_WEEKS.flat();
export const SAMPLE_SEPTEMBER_MINUTES = SAMPLE_DAYS.slice(57, 87).map((day, index) =>
  minutesOf(57 + index, day.count > 0),
);
export const SAMPLE_OCTOBER_MINUTES = SAMPLE_DAYS.slice(87, 112).map((day, index) =>
  minutesOf(87 + index, day.count > 0),
);
export const SAMPLE_SEPTEMBER_TOTALS = cumulative(SAMPLE_SEPTEMBER_MINUTES);
export const SAMPLE_OCTOBER_TOTALS = cumulative(SAMPLE_OCTOBER_MINUTES);

/** The level against bots after each of the last ten finished games. */
export const SAMPLE_LEVEL_POINTS = [
  { label: "13 oct", value: 796 },
  { label: "15 oct", value: 789 },
  { label: "17 oct", value: 803 },
  { label: "19 oct", value: 812 },
  { label: "20 oct", value: 801 },
  { label: "21 oct", value: 820 },
  { label: "22 oct", value: 829 },
  { label: "24 oct", value: 838 },
  { label: "24 oct", value: 832 },
  { label: "25 oct", value: 850 },
];

/** The record against each bot, as comparison bars; Mariana's has a game still open. */
export const SAMPLE_BOT_BARS = [
  { key: "beto", name: "Beto", caption: "547", value: 4, detail: "4–0–0" },
  { key: "lupita", name: "Lupita", caption: "668", value: 5, detail: "4–1–0" },
  { key: "don-chuy", name: "Don Chuy", caption: "783", value: 6, detail: "3–2–1" },
  { key: "mariana", name: "Mariana", caption: "891", value: 7, detail: "2–3–1", highlighted: true },
  { key: "profe-ramirez", name: "Profe Ramírez", caption: "1036", value: 2, detail: "0–2–0" },
];
