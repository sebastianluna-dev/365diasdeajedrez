import "./class-skeleton.comp.css";

/** The entries of the class's index, as many as a class usually has. */
const INDEX = 4;

/** The article's paragraphs. */
const LINES = ["full", "full", "mid", "full", "short"] as const;

/**
 * A class's notebook while it loads, in the new design system (2026-10-23):
 * the workspace with the shape of what is coming — the FAB, the progress
 * and the index in the side column; the trail, the title, the byline, the
 * paragraphs and a position's card in the panel —, in the containers'
 * greys, softly pulsing, so nothing jumps when the page arrives.
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function ClassSkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace class-skeleton" role="status" aria-live="polite">
        <span className="class-skeleton__label">Cargando la clase…</span>

        <span className="platform-workspace__side class-skeleton__side" aria-hidden="true">
          <span className="class-skeleton__shape class-skeleton__fab" />
          <span className="class-skeleton__shape class-skeleton__bar class-skeleton__bar_width_half" />
          <span className="class-skeleton__shape class-skeleton__track" />
          {Array.from({ length: INDEX }, (_, row) => (
            <span key={row} className="class-skeleton__row">
              <span className="class-skeleton__shape class-skeleton__icon" />
              <span className="class-skeleton__shape class-skeleton__text" />
            </span>
          ))}
        </span>

        <span className="platform-workspace__panel class-skeleton__panel" aria-hidden="true">
          <span className="class-skeleton__trail">
            <span className="class-skeleton__shape class-skeleton__dot" />
            <span className="class-skeleton__shape class-skeleton__bar class-skeleton__bar_size_trail" />
          </span>
          <span className="class-skeleton__article">
            <span className="class-skeleton__shape class-skeleton__bar class-skeleton__bar_width_third" />
            <span className="class-skeleton__shape class-skeleton__bar class-skeleton__bar_size_title" />
            <span className="class-skeleton__shape class-skeleton__bar class-skeleton__bar_width_half" />
            {LINES.map((width, line) => (
              <span
                key={line}
                className={`class-skeleton__shape class-skeleton__bar class-skeleton__bar_width_${width}`}
              />
            ))}
            <span className="class-skeleton__figure">
              <span className="class-skeleton__shape class-skeleton__board" />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
