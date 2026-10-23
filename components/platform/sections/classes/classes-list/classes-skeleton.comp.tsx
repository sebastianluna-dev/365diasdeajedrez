import "./classes-skeleton.comp.css";

/** The later days of the agenda, as many as a week usually has. */
const ROWS = 2;

/**
 * «Mis clases» while it loads, in the new design system (2026-10-23): the
 * workspace with the shape of what is coming — the two views and «Tus clases
 * pagadas» in the side column, a day's heading, today's band and the rows
 * of the later days in the panel —, in the containers' greys, softly
 * pulsing, so nothing jumps when the page arrives.
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function ClassesSkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace classes-skeleton" role="status" aria-live="polite">
        <span className="classes-skeleton__label">Cargando tus clases…</span>

        <span className="platform-workspace__side classes-skeleton__side" aria-hidden="true">
          {[0, 1].map((row) => (
            <span key={row} className="classes-skeleton__row">
              <span className="classes-skeleton__shape classes-skeleton__icon" />
              <span className="classes-skeleton__shape classes-skeleton__text" />
            </span>
          ))}
          <span className="classes-skeleton__balance">
            <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_width_half" />
            <span className="classes-skeleton__shape classes-skeleton__figure" />
            <span className="classes-skeleton__shape classes-skeleton__bar" />
          </span>
        </span>

        <span className="platform-workspace__panel classes-skeleton__panel" aria-hidden="true">
          <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_size_heading" />
          <span className="classes-skeleton__today">
            <span className="classes-skeleton__stub" />
            <span className="classes-skeleton__stack">
              <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_width_third" />
              <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_size_title" />
              <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_width_half" />
            </span>
          </span>
          {Array.from({ length: ROWS }, (_, row) => (
            <span key={row} className="classes-skeleton__day">
              <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_size_heading" />
              <span className="classes-skeleton__ticket">
                <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_size_time" />
                <span className="classes-skeleton__stack">
                  <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_width_half" />
                  <span className="classes-skeleton__shape classes-skeleton__bar classes-skeleton__bar_width_third" />
                </span>
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
