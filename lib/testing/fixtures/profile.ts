import {
  SAMPLE_LEVEL_POINTS,
  SAMPLE_OCTOBER_MINUTES,
  SAMPLE_SEPTEMBER_MINUTES,
  SAMPLE_STREAK,
  SAMPLE_STREAK_WEEKS,
} from "@/constants/platform/chart-samples.const";
import type { ProfileView } from "@/services/profile/profile.types";
import { FIXTURE_STUDENT, fixturePlayedGames } from "./bots";

// A student's whole profile (`ProfileView`) on Sunday 25 October 2026, for
// the stories and tests of «Visión general»: the charts' sample data, an
// invented student and the games of «Jugar»'s fixtures.

export const PROFILE_FIXTURE_NOW = new Date("2026-10-25T18:00:00Z");

const day = (month: string, index: number) => `2026-${month}-${String(index + 1).padStart(2, "0")}`;

/** The profile as its owner sees it; `overrides` changes any part of it. */
export function fixtureProfileView(overrides: Partial<ProfileView> = {}): ProfileView {
  return {
    userId: "user-ana",
    slug: "ana-torres",
    displayName: FIXTURE_STUDENT.name,
    avatar: { ...FIXTURE_STUDENT.avatar, country: "MEX" },
    statusLine: "Preparando la Siciliana para el torneo de diciembre",
    country: "MEX",
    badge: "Alumno",
    joinedLabel: "19 de marzo, 2026",
    isOwn: true,
    counts: { courses: 3, studies: 2, games: 24 },
    botLevel: {
      level: 850,
      sampleSize: 10,
      series: SAMPLE_LEVEL_POINTS.map((point, index) => ({
        at: new Date(Date.UTC(2026, 9, 13 + Math.round(index * 1.3), 18)),
        level: point.value,
      })),
    },
    rating: null,
    record: { wins: 13, losses: 8, draws: 2, open: 1 },
    botRecords: [
      { botId: 1, slug: "beto", name: "Beto", elo: 547, wins: 4, losses: 0, draws: 0, open: 0 },
      { botId: 2, slug: "lupita", name: "Lupita", elo: 668, wins: 4, losses: 1, draws: 0, open: 0 },
      { botId: 3, slug: "don-chuy", name: "Don Chuy", elo: 783, wins: 3, losses: 2, draws: 1, open: 0 },
      { botId: 4, slug: "mariana", name: "Mariana", elo: 891, wins: 2, losses: 3, draws: 1, open: 1 },
      { botId: 5, slug: "profe-ramirez", name: "Profe Ramírez", elo: 1036, wins: 0, losses: 2, draws: 0, open: 0 },
    ],
    streak: {
      streak: SAMPLE_STREAK,
      weeks: SAMPLE_STREAK_WEEKS,
      daysStudied: SAMPLE_STREAK_WEEKS.flat().filter((entry) => entry.count > 0).length,
      bestStreak: 19,
      daysThisWeek: 7,
      minutesThisWeek: 190,
    },
    studyMonths: {
      today: "2026-10-25",
      current: {
        start: "2026-10-01",
        name: "octubre",
        length: 31,
        days: SAMPLE_OCTOBER_MINUTES.map((minutes, index) => ({ day: day("10", index), minutes })),
      },
      previous: {
        start: "2026-09-01",
        name: "septiembre",
        length: 30,
        days: SAMPLE_SEPTEMBER_MINUTES.map((minutes, index) => ({ day: day("09", index), minutes })),
      },
    },
    recentGames: fixturePlayedGames(PROFILE_FIXTURE_NOW),
    ...overrides,
  };
}
