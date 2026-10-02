import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { GOAL_OPTIONS } from "@/constants/platform/study-goal.const";
import { updateDailyGoal } from "@/services/study-goal/study-goal.actions";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import "./study-goal.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { StudyStreak } from "@/components/platform/shared/study-streak/study-streak.comp";

interface StudyGoalSectionProps {
  goal: StudyGoal;
  /** What `updateDailyGoal` bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * The day, on the dashboard: how many days in a row the student has been
 * studying and how much they have studied today, side by side. The streak
 * is the card "Mis cursos" shows too (`StudyStreak`); the goal is looked at
 * here alone.
 *
 * Neither figure is stored: the streak is counted backwards from the
 * activity (lib/study-streak) and today's minutes come from the lessons
 * finished today. The only thing stored is the goal, because it is a
 * decision and not a computation.
 */
export function StudyGoalSection({ goal, errorCode }: StudyGoalSectionProps) {
  const errorMessage = studentErrorMessage(errorCode);

  return (
    <section className="study-goal" aria-label="Tu día de estudio">
      <StudyStreak streak={goal.streak} />

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
        <details className="study-goal__editor" open={errorMessage !== undefined}>
          <summary className="platform-button study-goal__editor-button">Cambiar objetivo</summary>

          {errorMessage && (
            <div className="study-goal__notice">
              <PlatformNotice message={errorMessage} />
            </div>
          )}

          <form action={updateDailyGoal} className="study-goal__form">
            <label className="study-goal__field">
              <span className="study-goal__field-label">Minutos al día</span>
              <PlatformSelect
                name="goalMinutes"
                defaultValue={String(goal.goalMinutes)}
                options={GOAL_OPTIONS.map((minutes) => ({ value: String(minutes), label: `${minutes} minutos` }))}
                size="compact"
              />
            </label>

            <SubmitButton>Guardar</SubmitButton>
          </form>
        </details>
      </section>
    </section>
  );
}
