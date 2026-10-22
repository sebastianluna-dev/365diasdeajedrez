import "./courses-panel-skeleton.comp.css";

interface CoursesPanelSkeletonProps {
  /** Which page is loading: «Mis cursos» or the catalog. Each draws its own shape. */
  view: "mine" | "catalog";
}

/** As many cards as a row of the panel holds on a laptop: one row on «Mis cursos», two on the catalog. */
const CARDS = { mine: 4, catalog: 8 } as const;

/** The catalog's chips, at widths of the topics they stand for. */
const CHIP_WIDTHS = ["wide", "wide", "narrow", "wide"] as const;

/**
 * What the panel of «Cursos» shows while a view loads (2026-10-22): the
 * layout keeps the side column and the bar's search in place, and the panel
 * draws the shape of the page that is coming, softly pulsing, so nothing
 * jumps when it arrives.
 *
 * «Mis cursos»: «Sigue donde ibas» (the cover beside the eyebrow, the name,
 * the figures, the progress and «Continuar»), the streak's band (the flame,
 * two lines and the sixteen weeks), the heading with its count and a row of
 * the student's cards (cover, name, figures, progress, the button at the
 * right). The catalog: the heading — its title and the count; the level's
 * dot is left out, since «Todo el catálogo» has none —, the
 * row of filter chips, and two rows of its cards (cover, name, the line
 * about it, its length and «Agregar»).
 *
 * It is a `loading.tsx`'s, so it is markup and CSS only, with no Client
 * Component behind it. To a screen reader it is one status.
 */
export function CoursesPanelSkeleton({ view }: CoursesPanelSkeletonProps) {
  const cards = Array.from({ length: CARDS[view] }, (_, index) => index);

  return (
    <section className="platform-workspace__panel courses-panel-skeleton" role="status" aria-live="polite">
      <span className="courses-panel-skeleton__label">
        {view === "mine" ? "Cargando tus cursos…" : "Cargando el catálogo…"}
      </span>

      <span className="courses-panel-skeleton__shapes" aria-hidden="true">
        {view === "mine" ? (
          <>
            <span className="courses-panel-skeleton__resume">
              <span className="courses-panel-skeleton__resume-cover courses-panel-skeleton__shape" />
              <span className="courses-panel-skeleton__stack">
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_eyebrow" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_title" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_half" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_meter" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__pill courses-panel-skeleton__pill_size_cta" />
              </span>
            </span>

            <span className="courses-panel-skeleton__streak">
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__flame" />
              <span className="courses-panel-skeleton__stack courses-panel-skeleton__stack_grow">
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_title courses-panel-skeleton__bar_width_third" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_wide" />
              </span>
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__weeks" />
            </span>

            <span className="courses-panel-skeleton__heading">
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_heading" />
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_count" />
            </span>
          </>
        ) : (
          <>
            <span className="courses-panel-skeleton__heading courses-panel-skeleton__heading_align_start">
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_title courses-panel-skeleton__bar_width_level" />
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_count" />
            </span>

            <span className="courses-panel-skeleton__chips">
              {CHIP_WIDTHS.map((width, index) => (
                <span
                  key={index}
                  className={`courses-panel-skeleton__shape courses-panel-skeleton__pill courses-panel-skeleton__pill_width_${width}`}
                />
              ))}
              <span className="courses-panel-skeleton__divider" />
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__pill courses-panel-skeleton__pill_width_wider" />
            </span>
          </>
        )}

        <span className="courses-panel-skeleton__grid">
          {cards.map((card) => (
            <span key={card} className="courses-panel-skeleton__card">
              <span className="courses-panel-skeleton__shape courses-panel-skeleton__cover" />
              <span className="courses-panel-skeleton__card-body">
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar" />
                <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_half" />
                {view === "mine" && (
                  <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_size_meter" />
                )}
                <span className="courses-panel-skeleton__foot">
                  {view === "catalog" && (
                    <span className="courses-panel-skeleton__shape courses-panel-skeleton__bar courses-panel-skeleton__bar_width_count" />
                  )}
                  <span
                    className={`courses-panel-skeleton__shape courses-panel-skeleton__pill ${view === "mine" ? "courses-panel-skeleton__pill_size_text" : "courses-panel-skeleton__pill_size_tonal"}`}
                  />
                </span>
              </span>
            </span>
          ))}
        </span>
      </span>
    </section>
  );
}
