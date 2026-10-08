import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import type { StreakDay, StreakOverview } from "@/services/study-goal/study-goal.types";
import "./streak-panel.comp.css";

interface StreakPanelProps {
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

/**
 * The streak beside «Mis cursos», as a whole column (2026-10-07, «S4», the
 * owner's choice among four): the streak in the platform's flame and whether
 * today already counts; the last sixteen weeks day by day, a square each,
 * deeper the more was done, as GitHub draws a year of contributions; and four
 * figures under them. What is constant is seen at a glance.
 *
 * All of it derived (`getStreakOverview`): the activity log — lessons,
 * exercises, games analysed, classes — and the lessons finished this week.
 * The grid is one image to a screen reader, named by its count; its days say
 * themselves under the pointer. There is one panel to a page, so its title's
 * id is written out.
 */
export function StreakPanel({ overview }: StreakPanelProps) {
  const { streak } = overview;

  return (
    <aside className="streak-panel" aria-labelledby="streak-panel-title">
      <div className="streak-panel__head">
        <p className={`streak-panel__figure${streak.days === 0 ? " streak-panel__figure_state_unlit" : ""}`}>
          <FireIcon variant="duotone-solid" className="streak-panel__flame" coreClassName="streak-panel__flame-core" />
          {streak.days}
        </p>
        <h2 id="streak-panel-title" className="streak-panel__caption">
          {streak.days === 1 ? "día seguido estudiando" : "días seguidos estudiando"}
        </h2>
        {streak.studiedToday ? (
          <p className="streak-panel__state streak-panel__state_done">
            <CircleCheckIcon variant="classic-solid" className="streak-panel__state-icon" />
            Hoy ya estudiaste
          </p>
        ) : (
          <p className="streak-panel__state streak-panel__state_todo">
            {streak.days > 0 ? "Estudia hoy para mantenerla" : "Estudia hoy para empezarla"}
          </p>
        )}
      </div>

      <div className="streak-panel__activity">
        <p className="streak-panel__title">Últimos 4 meses</p>
        <div
          className="streak-panel__grid"
          role="img"
          aria-label={`Actividad de las últimas 16 semanas: ${overview.daysStudied} ${overview.daysStudied === 1 ? "día" : "días"} con estudio.`}
        >
          {overview.weeks.flat().map((day) => (
            <span
              key={day.day}
              className={[
                "streak-panel__day",
                day.isFuture ? "streak-panel__day_state_future" : `streak-panel__day_level_${day.level}`,
                day.isToday && "streak-panel__day_state_today",
              ]
                .filter(Boolean)
                .join(" ")}
              title={day.isFuture ? undefined : cellTitle(day)}
            />
          ))}
        </div>
        <p className="streak-panel__legend" aria-hidden="true">
          Menos
          <span className="streak-panel__day streak-panel__day_level_0" />
          <span className="streak-panel__day streak-panel__day_level_1" />
          <span className="streak-panel__day streak-panel__day_level_2" />
          <span className="streak-panel__day streak-panel__day_level_3" />
          Más
        </p>
      </div>

      <dl className="streak-panel__figures">
        <div className="streak-panel__stat">
          <dt>Días estudiados</dt>
          <dd>{overview.daysStudied}</dd>
        </div>
        <div className="streak-panel__stat">
          <dt>Mejor racha</dt>
          <dd>{overview.bestStreak}</dd>
        </div>
        <div className="streak-panel__stat">
          <dt>Días esta semana</dt>
          <dd>{overview.daysThisWeek}</dd>
        </div>
        <div className="streak-panel__stat">
          <dt>Minutos esta semana</dt>
          <dd>{overview.minutesThisWeek}</dd>
        </div>
      </dl>
    </aside>
  );
}
