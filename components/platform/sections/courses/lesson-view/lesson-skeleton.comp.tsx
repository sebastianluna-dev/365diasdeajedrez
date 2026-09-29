// The skeleton borrows the lesson's own layout, so it has to bring the two
// sheets that draw it: a stylesheet only travels with the component that
// imports it, and neither of those components is mounted here.
import "./lesson-view.section.css";
import "./lesson-outline.comp.css";
import "./lesson-skeleton.comp.css";

/**
 * What the lesson's page shows while the next one arrives: its own layout,
 * empty. An empty board with a spinner over it and the panel of text blank.
 *
 * It borrows `.lesson-view` and `.lesson-outline` rather than drawing boxes
 * of its own, so the board sits exactly where it will sit and nothing jumps
 * when the lesson lands. The column is left blank on purpose: what goes in it
 * is the very thing being waited for.
 */
export function LessonSkeleton() {
  return (
    <section className="lesson-view lesson-skeleton" aria-busy="true">
      <div className="lesson-outline" />

      <div className="lesson-view__main">
        <div className="lesson-skeleton__board" role="status" aria-label="Cargando la lección">
          <span className="lesson-skeleton__spinner" aria-hidden="true" />
        </div>

        <div className="lesson-skeleton__panel" aria-hidden="true" />
      </div>
    </section>
  );
}
