import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
import "./exercises-panel-skeleton.comp.css";

interface ExercisesPanelSkeletonProps {
  /** What is coming: an exercise on the board, or a list (the series, a series, the history). */
  view: "board" | "list";
  /** Said to a screen reader: «Cargando el ejercicio…». */
  label: string;
}

/** The rows a list usually shows above the fold. */
const ROWS = 6;

/**
 * What the panel of «Ejercicios» shows while a page loads (2026-10-23): the
 * layout keeps the side column in place, and the panel draws the shape of
 * the page that is coming, softly pulsing — the toolbar's line and, for an
 * exercise, the blue board with its keys and the column's cards beside it;
 * for a list, its rows —, so nothing jumps when it arrives. It is a
 * `loading.tsx`'s, so it is markup and CSS only, with no Client Component
 * behind it. To a screen reader it is one status.
 */
export function ExercisesPanelSkeleton({ view, label }: ExercisesPanelSkeletonProps) {
  return (
    <section className="platform-workspace__panel exercises-panel-skeleton" aria-label={label}>
      <div className="exercises-panel-skeleton__toolbar" aria-hidden="true">
        <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__end" />
      </div>

      {view === "board" ? (
        <div className="exercises-panel-skeleton__body">
          <div className="exercises-panel-skeleton__stage">
            <BoardSkeleton label={label} />
            <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__keys" aria-hidden="true" />
          </div>
          <div className="exercises-panel-skeleton__column" aria-hidden="true">
            <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__card exercises-panel-skeleton__card_size_tall" />
            <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__card" />
            <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__card" />
          </div>
        </div>
      ) : (
        <div className="exercises-panel-skeleton__list" role="status" aria-live="polite">
          <span className="exercises-panel-skeleton__label">{label}</span>
          {Array.from({ length: ROWS }, (_, row) => (
            <span key={row} className="exercises-panel-skeleton__row" aria-hidden="true">
              <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__text" />
              <span className="exercises-panel-skeleton__shape exercises-panel-skeleton__meta" />
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
