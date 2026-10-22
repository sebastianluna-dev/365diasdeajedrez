import "./courses-side-skeleton.comp.css";

/** The rows of «Tus cursos» and of «Catálogo», as many as the column usually has. */
const GROUPS = [4, 5];

/**
 * The side column of «Cursos» while its counts load: «Seguir donde iba»'s
 * place and the two groups of rows, in the canvas's container grey, softly
 * pulsing. Markup and CSS only. The column's place in the frame is already
 * there, so nothing in the bar or the panel moves when the links arrive.
 */
export function CoursesSideSkeleton() {
  return (
    <div className="courses-side-skeleton" role="status" aria-live="polite">
      <span className="courses-side-skeleton__label">Cargando tus cursos…</span>
      <span className="courses-side-skeleton__shape courses-side-skeleton__action" aria-hidden="true" />
      {GROUPS.map((rows, group) => (
        <span key={group} className="courses-side-skeleton__group" aria-hidden="true">
          <span className="courses-side-skeleton__shape courses-side-skeleton__title" />
          {Array.from({ length: rows }, (_, row) => (
            <span key={row} className="courses-side-skeleton__row">
              <span className="courses-side-skeleton__shape courses-side-skeleton__icon" />
              <span className="courses-side-skeleton__shape courses-side-skeleton__text" />
              <span className="courses-side-skeleton__shape courses-side-skeleton__count" />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
