// It stands in the frame's own place, so it brings the sheet that draws it:
// a stylesheet only travels with the component that imports it.
import "./lesson-frame.comp.css";
import "./lesson-skeleton.comp.css";

/**
 * What the lesson's segment shows while the next lesson arrives: its own
 * shape, empty. An empty board with a spinner over it and the panel of text
 * blank.
 *
 * It takes the frame's second column and only that: the column of lessons
 * belongs to the chapter's layout and stays where it is, lit row and all. So
 * the board sits exactly where it will sit and nothing jumps when the lesson
 * lands.
 */
export function LessonSkeleton() {
  return (
    <div className="lesson-frame__main lesson-skeleton" aria-busy="true">
      <div className="lesson-skeleton__board" role="status" aria-label="Cargando la lección">
        <span className="lesson-skeleton__spinner" aria-hidden="true" />
      </div>

      <div className="lesson-skeleton__panel" aria-hidden="true" />
    </div>
  );
}
