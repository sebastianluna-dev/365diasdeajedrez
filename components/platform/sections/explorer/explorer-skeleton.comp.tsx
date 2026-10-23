// The explorer's stylesheet comes too: the skeleton takes its toolbar's and
// its body's places, and a stylesheet only travels with the component that
// imports it.
import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
import "./game-explorer.comp.css";
import "./explorer-skeleton.comp.css";

/** «Todas las partidas» and the three origins of «Buscar en». */
const VIEW_ROWS = 4;

/**
 * What `/explorador` shows while it arrives: the explorer's own workspace,
 * empty — the side column's box of moves and its rows, the panel's toolbar
 * and the blue board with a ring turning on it, and the two cards beside it
 * —, so what lands are the figures and not a new page. Markup and CSS only:
 * a `loading.tsx` reaches no Client Component.
 */
export function ExplorerSkeleton() {
  return (
    <div className="platform-workspace game-explorer explorer-skeleton">
      <div className="platform-workspace__side game-explorer__side" aria-hidden="true">
        <span className="explorer-skeleton__shape explorer-skeleton__title" />
        <span className="explorer-skeleton__shape explorer-skeleton__line" />
        <span className="explorer-skeleton__shape explorer-skeleton__title" />
        {Array.from({ length: VIEW_ROWS }, (_, row) => (
          <span key={row} className="explorer-skeleton__row">
            <span className="explorer-skeleton__shape explorer-skeleton__icon" />
            <span className="explorer-skeleton__shape explorer-skeleton__text" />
          </span>
        ))}
      </div>

      <div className="platform-workspace__panel game-explorer__panel">
        <div className="game-explorer__toolbar" aria-hidden="true">
          <span className="explorer-skeleton__shape explorer-skeleton__text" />
        </div>
        <div className="game-explorer__body">
          <div className="game-explorer__board">
            <BoardSkeleton label="Cargando el explorador" />
          </div>
          <div className="game-explorer__results" aria-hidden="true">
            <span className="explorer-skeleton__shape explorer-skeleton__card" />
            <span className="explorer-skeleton__shape explorer-skeleton__card explorer-skeleton__card_size_tall" />
          </div>
        </div>
      </div>
    </div>
  );
}
