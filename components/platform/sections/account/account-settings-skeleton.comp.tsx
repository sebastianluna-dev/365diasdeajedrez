import "./account-settings-skeleton.comp.css";

/** The cards of each column, by how many rows of lines each holds. */
const COLUMNS = [
  [3, 2],
  [2, 2],
] as const;

/**
 * «Ajustes» while it loads, in the new design system (2026-10-25): the
 * workspace with the shape of what is coming — the FAB and the four anchors
 * in the side column, the heading and the four outlined cards in the panel —,
 * in the containers' greys, softly pulsing, so nothing jumps when the page
 * arrives.
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function AccountSettingsSkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace account-settings-skeleton" role="status" aria-live="polite">
        <span className="account-settings-skeleton__label">Cargando tus ajustes…</span>

        <span className="platform-workspace__side account-settings-skeleton__side" aria-hidden="true">
          <span className="account-settings-skeleton__shape account-settings-skeleton__fab" />
          {[0, 1, 2, 3].map((row) => (
            <span key={row} className="account-settings-skeleton__row">
              <span className="account-settings-skeleton__shape account-settings-skeleton__icon" />
              <span className="account-settings-skeleton__shape account-settings-skeleton__text" />
            </span>
          ))}
        </span>

        <span className="platform-workspace__panel account-settings-skeleton__panel" aria-hidden="true">
          <span className="account-settings-skeleton__shape account-settings-skeleton__bar account-settings-skeleton__bar_size_heading" />
          <span className="account-settings-skeleton__grid">
            {COLUMNS.map((cards, column) => (
              <span key={column} className="account-settings-skeleton__column">
                {cards.map((rows, card) => (
                  <span key={card} className="account-settings-skeleton__card">
                    <span className="account-settings-skeleton__card-head">
                      <span className="account-settings-skeleton__shape account-settings-skeleton__disc" />
                      <span className="account-settings-skeleton__shape account-settings-skeleton__bar account-settings-skeleton__bar_size_title" />
                    </span>
                    {Array.from({ length: rows }, (_, row) => (
                      <span key={row} className="account-settings-skeleton__shape account-settings-skeleton__field" />
                    ))}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
