import { FlameIcon } from "@/components/icons/flame-icon.comp";
import { GOAL_OPTIONS } from "@/constants/platform/study-goal.const";
import { updateDailyGoal } from "@/services/study-goal/study-goal.actions";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import "./study-goal.comp.css";

interface StudyGoalAsideProps {
  goal: StudyGoal;
}

/**
 * The right column of "Mis cursos": how many days in a row the student has
 * been studying and how much they have studied today.
 *
 * Neither figure is stored: the streak is counted backwards from the
 * activity (lib/study-streak) and today's minutes come from the lessons
 * finished today. The only thing stored is the goal, because it is a
 * decision and not a computation.
 */
export function StudyGoalAside({ goal }: StudyGoalAsideProps) {
  return (
    <aside className="study-goal">
      <section className="study-goal__card">
        <h2 className="study-goal__title">Racha diaria</h2>

        <p className="study-goal__streak">
          <FlameIcon className="study-goal__flame" />
          <span className="study-goal__streak-value">{goal.streakDays}</span>
        </p>

        <p className="study-goal__streak-note">
          {goal.streakDays === 0
            ? "Estudia hoy para empezar una racha."
            : `${goal.streakDays} ${goal.streakDays === 1 ? "día seguido" : "días seguidos"} estudiando.`}
        </p>
      </section>

      <section className="study-goal__card">
        <h2 className="study-goal__title">Objetivo diario</h2>

        <p className="study-goal__amount">
          <span className="study-goal__amount-value">{goal.minutesToday}</span>
          <span className="study-goal__amount-total"> / {goal.goalMinutes} min</span>
        </p>

        <p className="study-goal__legend">
          <span className="study-goal__legend-label">Minutos hoy</span>
          <span className="study-goal__legend-percent">{goal.percent}%</span>
        </p>

        <div className="study-goal__track">
          <div className="study-goal__fill" style={{ width: `${goal.percent}%` }} />
        </div>

        <p className="study-goal__hint">Los alumnos que se marcan un objetivo terminan más cursos.</p>

        {/* `<details>` instead of a modal: changing the goal is choosing from a
            short list, and this way the form needs no JavaScript of its own. */}
        <details className="study-goal__editor">
          <summary className="study-goal__editor-button">Cambiar objetivo</summary>

          <form action={updateDailyGoal} className="study-goal__form">
            <label className="study-goal__field">
              <span className="study-goal__field-label">Minutos al día</span>
              <select className="study-goal__select" name="goalMinutes" defaultValue={goal.goalMinutes}>
                {GOAL_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutos
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="platform-button">
              Guardar
            </button>
          </form>
        </details>
      </section>
    </aside>
  );
}
