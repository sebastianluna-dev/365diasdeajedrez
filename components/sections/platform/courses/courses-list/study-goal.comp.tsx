import { FlameIcon } from "@/components/icons/flame-icon.comp";
import { GOAL_OPTIONS } from "@/constants/platform/study-goal.const";
import { updateDailyGoal } from "@/services/study-goal/study-goal.actions";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import "./study-goal.comp.css";

interface StudyGoalAsideProps {
  goal: StudyGoal;
}

/**
 * La columna de la derecha de «Mis cursos»: cuántos días seguidos lleva
 * estudiando y cuánto ha estudiado hoy.
 *
 * Ninguna de las dos cifras está guardada: la racha se cuenta hacia atrás desde
 * la actividad (lib/study-streak) y los minutos de hoy salen de las lecciones
 * terminadas hoy. Lo único que se almacena es el objetivo, porque es una
 * decisión y no un cálculo.
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

        {/* `<details>` en vez de un modal: cambiar el objetivo es elegir de una
            lista corta, y así el formulario no necesita JavaScript propio. */}
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
