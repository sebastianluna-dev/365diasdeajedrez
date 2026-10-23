import "./exercises-side-skeleton.comp.css";

/** The rows of «Temas» (every topic and the five first-level ones) and of «Tuyo». */
const GROUPS = [6, 3];

/**
 * The side column of «Ejercicios» while its topics and series load: «Puzzle
 * Rush»'s place and the two groups of rows, in the canvas's container grey,
 * softly pulsing. Markup and CSS only. The column's place in the frame is
 * already there, so nothing in the bar or the panel moves when the links arrive.
 */
export function ExercisesSideSkeleton() {
  return (
    <div className="exercises-side-skeleton" role="status" aria-live="polite">
      <span className="exercises-side-skeleton__label">Cargando los temas…</span>
      <span className="exercises-side-skeleton__shape exercises-side-skeleton__action" aria-hidden="true" />
      {GROUPS.map((rows, group) => (
        <span key={group} className="exercises-side-skeleton__group" aria-hidden="true">
          <span className="exercises-side-skeleton__shape exercises-side-skeleton__title" />
          {Array.from({ length: rows }, (_, row) => (
            <span key={row} className="exercises-side-skeleton__row">
              <span className="exercises-side-skeleton__shape exercises-side-skeleton__icon" />
              <span className="exercises-side-skeleton__shape exercises-side-skeleton__text" />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
