import { FireIcon } from "@/components/icons/fire-icon.comp";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import type { StreakDay, StreakOverview } from "@/services/study-goal/study-goal.types";
import "./streak-band.comp.css";

interface StreakBandProps {
  overview: StreakOverview;
}

/** «7 de octubre», from a day key: the grid's cells say their day under the pointer. */
function dayLabel(day: string): string {
  return `${Number(day.slice(8, 10))} de ${MONTHS_ES[Number(day.slice(5, 7)) - 1]}`;
}

function cellTitle(day: StreakDay): string {
  const done = day.count === 0 ? "sin actividad" : `${day.count} ${day.count === 1 ? "actividad" : "actividades"}`;
  return `${dayLabel(day.day)}: ${done}`;
}

/** What to do today, by whether today already counts. */
function todayLine({ streak }: StreakOverview): string {
  if (streak.studiedToday) return "Hoy ya estudiaste.";
  return streak.days > 0 ? "Estudia hoy para mantener tu racha." : "Estudia hoy para empezar tu racha.";
}

/**
 * The streak across «Mis cursos» (2026-10-22, the new design system): the
 * flame and the days in a row, what to do today with the days studied and
 * the best streak, and at the right the last sixteen weeks day by day, a
 * square each, deeper the more was done, as GitHub draws a year.
 *
 * All of it derived (`getStreakOverview`). The grid is one image to a screen
 * reader, named by its count; its days say themselves under the pointer.
 */
export function StreakBand({ overview }: StreakBandProps) {
  const { streak } = overview;
  const days = (count: number) => `${count} ${count === 1 ? "día" : "días"}`;

  return (
    <section className="streak-band" aria-labelledby="streak-band-title">
      <span className="streak-band__flame" aria-hidden="true">
        <FireIcon variant="duotone-solid" className="streak-band__flame-icon" coreClassName="streak-band__flame-core" />
      </span>

      <div className="streak-band__text">
        <h2 id="streak-band-title" className="streak-band__title">
          {streak.days === 1 ? "1 día seguido" : `${streak.days} días seguidos`}
        </h2>
        <p className="streak-band__line">
          {todayLine(overview)} Llevas {days(overview.daysStudied)} estudiados en los últimos 4 meses; tu mejor racha
          fue de {days(overview.bestStreak)}.
        </p>
      </div>

      <div
        className="streak-band__grid"
        role="img"
        aria-label={`Actividad de las últimas 16 semanas: ${days(overview.daysStudied)} con estudio.`}
      >
        {overview.weeks.flat().map((day) => (
          <span
            key={day.day}
            className={[
              "streak-band__day",
              day.isFuture ? "streak-band__day_state_future" : `streak-band__day_level_${day.level}`,
              day.isToday && "streak-band__day_state_today",
            ]
              .filter(Boolean)
              .join(" ")}
            title={day.isFuture ? undefined : cellTitle(day)}
          />
        ))}
      </div>
    </section>
  );
}
