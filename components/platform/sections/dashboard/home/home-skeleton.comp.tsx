import "./home-skeleton.comp.css";

/**
 * «Inicio» while it loads, in the new design system (2026-10-23): the panel
 * with the shape of what is coming — the greeting, the focus's block of the
 * primary as a pale container, two tiles of «Después» and the day at the
 * foot —, in the containers' greys, softly pulsing, so nothing jumps when the
 * page arrives.
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function HomeSkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace platform-workspace_side_none home-skeleton" role="status" aria-live="polite">
        <span className="home-skeleton__label">Cargando tu inicio…</span>

        <span className="platform-workspace__panel home-skeleton__panel" aria-hidden="true">
          <span className="home-skeleton__column">
            <span className="home-skeleton__shape home-skeleton__bar home-skeleton__bar_size_title" />
            <span className="home-skeleton__shape home-skeleton__bar home-skeleton__bar_width_half" />
            <span className="home-skeleton__shape home-skeleton__focus" />
            <span className="home-skeleton__shape home-skeleton__bar home-skeleton__bar_width_tenth" />
            <span className="home-skeleton__tiles">
              <span className="home-skeleton__shape home-skeleton__tile" />
              <span className="home-skeleton__shape home-skeleton__tile" />
            </span>
            <span className="home-skeleton__day">
              <span className="home-skeleton__shape home-skeleton__bar home-skeleton__bar_width_fifth" />
              <span className="home-skeleton__shape home-skeleton__bar home-skeleton__bar_size_track" />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
