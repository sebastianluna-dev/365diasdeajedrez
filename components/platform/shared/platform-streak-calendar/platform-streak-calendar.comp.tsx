import { useId } from "react";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import { capsule, dot, f1, percentOf } from "@/lib/charts/chart-geometry";
import type { StreakDay, StudyStreak } from "@/services/study-goal/study-goal.types";
import "./platform-streak-calendar.comp.css";

interface PlatformStreakCalendarProps {
  /** The weeks, oldest first, each Monday to Sunday (`StreakOverview.weeks`). */
  weeks: readonly (readonly StreakDay[])[];
  /** The current streak: its days are hatched, back from today (or from yesterday, if today is still to study). */
  streak: StudyStreak;
  /** The calendar in words: the span, the days studied, the streak and the best one. */
  label: string;
  /** The pill over this week's column: «12 días». */
  tag?: string;
}

const PILL = 14;
const GAP = 8;
const ROW = 15;
const TOP = 26;
const LEFT = 16;
const DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * The streak's calendar (2026-10-25, the owner's «Gráficas del perfil»,
 * chart 8): a pill per week, Monday on top, a dot per day as deep a blue as
 * what was done that day (`activityLevel`), a grey speck for a day of
 * nothing, the current streak hatched across the weeks it spans, today
 * ringed, the months over their first week and every other day's letter at
 * the left. Days still to come this week are left empty. One image, named
 * by `label`; `PlatformStreakLegend` says the four blues.
 */
export function PlatformStreakCalendar({ weeks, streak, label, tag }: PlatformStreakCalendarProps) {
  const hatch = `streak-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const days = weeks.flat();
  const todayIndex = days.findIndex((day) => day.isToday);
  const end = todayIndex < 0 ? -1 : streak.studiedToday ? todayIndex : todayIndex - 1;
  const start = streak.days > 0 && end >= 0 ? Math.max(0, end - streak.days + 1) : end + 1;

  const width = LEFT + weeks.length * (PILL + GAP) - GAP;
  const height = TOP + 7 * ROW;
  const columnX = (week: number) => LEFT + week * (PILL + GAP);
  const centre = (index: number) => ({
    cx: columnX(Math.floor(index / 7)) + PILL / 2,
    cy: TOP + ROW / 2 + (index % 7) * ROW,
  });

  const pills = weeks.map((_, week) => capsule(columnX(week), TOP, PILL, 7 * ROW)).join("");
  const streakPills = weeks
    .map((_, week) => {
      const first = Math.max(start, week * 7);
      const last = Math.min(end, week * 7 + 6);
      return first > last ? "" : capsule(columnX(week), TOP + (first % 7) * ROW, PILL, (last - first + 1) * ROW);
    })
    .join("");
  const levels: [string, string, string, string] = ["", "", "", ""];
  days.forEach((day, index) => {
    if (day.isFuture) return;
    const { cx, cy } = centre(index);
    levels[day.level] += dot(cx, cy, day.level === 0 ? 1.5 : PILL / 2 - 1.5);
  });
  const today = todayIndex >= 0 ? centre(todayIndex) : null;
  const months = weeks.flatMap((week, index) => {
    const first = index === 0 ? week[0] : week.find((day) => day.day.endsWith("-01"));
    if (!first) return [];
    return [{ x: columnX(index), text: (MONTHS_ES[Number(first.day.slice(5, 7)) - 1] ?? "").slice(0, 3) }];
  });
  // A month whose first falls a week after the calendar's start would sit on top of it.
  const shownMonths = months.filter(
    (month, index) => index === 0 || month.x - (months[index - 1]?.x ?? 0) >= 2 * (PILL + GAP),
  );
  const last = weeks.length - 1;

  return (
    <div className="platform-streak-calendar">
      <svg
        className="platform-streak-calendar__svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
      >
        <defs>
          <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect className="platform-streak-calendar__hatch-ground" width="5" height="5" />
            <rect className="platform-streak-calendar__hatch-stripe" width="2" height="5" />
          </pattern>
        </defs>
        {shownMonths.map((month) => (
          <text key={month.x} className="platform-streak-calendar__text" x={month.x} y={12}>
            {month.text}
          </text>
        ))}
        {DAY_LETTERS.map((letter, row) =>
          row % 2 === 0 ? (
            <text key={row} className="platform-streak-calendar__text" x={0} y={f1(TOP + row * ROW + ROW / 2 + 4)}>
              {letter}
            </text>
          ) : null,
        )}
        <path className="platform-streak-calendar__pill" d={pills} />
        {streakPills && <path className="platform-streak-calendar__streak" d={streakPills} fill={`url(#${hatch})`} />}
        {levels.map((path, level) => (
          <path
            key={level}
            className={`platform-streak-calendar__day platform-streak-calendar__day_level_${level}`}
            d={path}
          />
        ))}
        {today && <path className="platform-streak-calendar__today" d={dot(today.cx, today.cy, PILL / 2 + 1)} />}
      </svg>
      {tag && (
        <span
          className="platform-streak-calendar__tag"
          style={{ left: percentOf(columnX(last) + PILL / 2, width), top: percentOf(TOP - 6, height) }}
          aria-hidden="true"
        >
          {tag}
        </span>
      )}
    </div>
  );
}
