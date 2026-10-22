import "./courses-panel-skeleton.comp.css";

/** Four cards, as many as a row of the panel holds on a laptop. */
const CARDS = [0, 1, 2, 3];

/**
 * What the panel of «Cursos» shows while a view loads (2026-10-22): the
 * layout keeps the side column and the bar's search in place, and the panel
 * draws the shape of what is coming in the container's grey — a block where
 * «Sigue donde ibas» or a heading goes, a line, and a row of cards —, softly
 * pulsing. It is the `loading.tsx` of the views, so it is markup and CSS
 * only, with no Client Component behind it. To a screen reader it is one
 * status, «Cargando cursos…».
 */
export function CoursesPanelSkeleton() {
  return (
    <section className="platform-workspace__panel courses-panel-skeleton" role="status" aria-live="polite">
      <span className="courses-panel-skeleton__label">Cargando cursos…</span>
      <span className="courses-panel-skeleton__block" aria-hidden="true" />
      <span className="courses-panel-skeleton__line" aria-hidden="true" />
      <span className="courses-panel-skeleton__grid" aria-hidden="true">
        {CARDS.map((card) => (
          <span key={card} className="courses-panel-skeleton__card">
            <span className="courses-panel-skeleton__cover" />
            <span className="courses-panel-skeleton__text" />
            <span className="courses-panel-skeleton__text courses-panel-skeleton__text_size_short" />
          </span>
        ))}
      </span>
    </section>
  );
}
