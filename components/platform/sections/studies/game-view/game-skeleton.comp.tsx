import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
import "./game-skeleton.comp.css";

/**
 * What the game's segment shows while the next game of the study arrives: the
 * game's own shape, empty. The two player strips blank with the empty board
 * between them and a ring turning over it, the notation's card blank beside
 * it, and the tools' card blank under it.
 *
 * It takes the place of `GameViewSection` and only that: the study's column
 * is the layout's and stays where it is, the row of the game being opened
 * already lit. So the board sits exactly where it will sit and what lands are
 * the pieces and the moves, as between two lessons of a chapter
 * (`LessonSkeleton`). Arriving at the study from elsewhere is another wait —
 * the layout's, with the knight (`[studyId]/loading.tsx`).
 */
export function GameSkeleton() {
  return (
    <div className="game-skeleton" aria-busy="true">
      <div className="game-skeleton__board">
        <span className="game-skeleton__strip game-skeleton__strip_side_top" aria-hidden="true" />
        <BoardSkeleton label="Cargando la partida" />
        <span className="game-skeleton__strip game-skeleton__strip_side_bottom" aria-hidden="true" />
      </div>

      <div className="game-skeleton__panel" aria-hidden="true" />
      <div className="game-skeleton__tools" aria-hidden="true" />
    </div>
  );
}
