import { GameSkeleton } from "./game-skeleton.comp";
import "./study-skeleton.comp.css";

// NOTHING here may import a Client Component, however indirectly: a
// `loading.tsx` renders this (see the note in `game-skeleton.comp.tsx`).

/** As many games as the side column usually shows before it scrolls. */
const ROWS = 7;

/**
 * Arriving at a study, in the new design system (2026-10-23): the whole
 * workspace with the shape of what is coming — the study's name and chip,
 * «Nueva partida»'s FAB and the rows of its games in the side column; the
 * board in the panel —, softly pulsing. From one
 * game to the next the wait is the page's alone (`GameSkeleton`), since the
 * layout stays.
 */
export function StudySkeleton() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace study-skeleton">
        <span className="platform-workspace__side study-skeleton__side" aria-hidden="true">
          <span className="study-skeleton__shape study-skeleton__name" />
          <span className="study-skeleton__shape study-skeleton__chip" />
          <span className="study-skeleton__shape study-skeleton__fab" />
          {Array.from({ length: ROWS }, (_, row) => (
            <span key={row} className="study-skeleton__row">
              <span className="study-skeleton__shape study-skeleton__line" />
              <span className="study-skeleton__shape study-skeleton__line study-skeleton__line_width_short" />
            </span>
          ))}
        </span>

        <section className="platform-workspace__panel study-skeleton__panel">
          <GameSkeleton />
        </section>
      </div>
    </div>
  );
}
