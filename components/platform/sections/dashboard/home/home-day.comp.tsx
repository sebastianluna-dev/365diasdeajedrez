import { FireIcon } from "@/components/icons/fire-icon.comp";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import "./home-day.comp.css";

interface HomeDayProps {
  goal: StudyGoal;
  /** The id of the statistics below, where «Ver tus estadísticas» leads. */
  statsId: string;
}

/**
 * The foot of the home page's first screen, «Tu día de estudio»: the streak,
 * today's minutes against the daily goal with their bar, and «Ver tus
 * estadísticas», which goes down the page to them. Neither figure is stored:
 * the streak is counted back from the activity and the minutes are the
 * lessons finished today (`getStudyGoal`); the goal is set in «Ajustes».
 */
export function HomeDay({ goal, statsId }: HomeDayProps) {
  const { days } = goal.streak;
  return (
    <section className="home-day" aria-label="Tu día de estudio">
      <p className="home-day__streak">
        <FireIcon variant="duotone-solid" className="home-day__flame" coreClassName="home-day__flame-core" />
        {days > 0 ? (
          <span>
            <b>
              {days} {days === 1 ? "día" : "días"}
            </b>{" "}
            de racha
          </span>
        ) : (
          <span>Empieza tu racha hoy</span>
        )}
      </p>
      <p className="home-day__goal">
        <span className="home-day__minutes">
          Hoy {goal.minutesToday} de {goal.goalMinutes} min
        </span>
        <span className="home-day__track" aria-hidden="true">
          <span className="home-day__fill" style={{ width: `${goal.percent}%` }} />
        </span>
      </p>
      <a href={`#${statsId}`} className="home-day__link">
        Ver tus estadísticas
      </a>
    </section>
  );
}
