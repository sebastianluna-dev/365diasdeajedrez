import "./studies-skeleton.comp.css";

/** The rows of «Tipos» and «Ordenar», as many as the column usually has. */
const GROUPS = [5, 3];

/** As many cards as two rows of the panel hold on a laptop. */
const CARDS = 6;

/**
 * «Mis estudios» while the library loads, in the new design system
 * (2026-10-23): the workspace with the shape of what is coming — the FAB and
 * the two groups of the side column, «Sigue donde ibas» and two rows of
 * cards in the panel —, in the containers' greys, softly pulsing, so nothing
 * jumps when the page arrives.
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function StudiesSkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace studies-skeleton" role="status" aria-live="polite">
        <span className="studies-skeleton__label">Cargando tus estudios…</span>

        <span className="platform-workspace__side studies-skeleton__side" aria-hidden="true">
          <span className="studies-skeleton__shape studies-skeleton__fab" />
          {GROUPS.map((rows, group) => (
            <span key={group} className="studies-skeleton__group">
              <span className="studies-skeleton__shape studies-skeleton__title" />
              {Array.from({ length: rows }, (_, row) => (
                <span key={row} className="studies-skeleton__row">
                  <span className="studies-skeleton__shape studies-skeleton__icon" />
                  <span className="studies-skeleton__shape studies-skeleton__text" />
                </span>
              ))}
            </span>
          ))}
        </span>

        <span className="platform-workspace__panel studies-skeleton__panel" aria-hidden="true">
          <span className="studies-skeleton__resume">
            <span className="studies-skeleton__shape studies-skeleton__board studies-skeleton__board_size_lg" />
            <span className="studies-skeleton__stack">
              <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_width_third" />
              <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_size_title" />
              <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_width_half" />
            </span>
          </span>
          <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_size_heading" />
          <span className="studies-skeleton__grid">
            {Array.from({ length: CARDS }, (_, card) => (
              <span key={card} className="studies-skeleton__card">
                <span className="studies-skeleton__shape studies-skeleton__board" />
                <span className="studies-skeleton__stack">
                  <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_width_third" />
                  <span className="studies-skeleton__shape studies-skeleton__bar" />
                  <span className="studies-skeleton__shape studies-skeleton__bar studies-skeleton__bar_width_half" />
                </span>
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
