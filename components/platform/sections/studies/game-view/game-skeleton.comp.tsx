import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
// The blank record is drawn with the record's own block, so it brings that
// sheet: a stylesheet only travels with the component that imports it.
import "./game-record.comp.css";
import "./game-skeleton.comp.css";

// NOTHING here may import a Client Component, however indirectly. A
// `loading.tsx` renders these, and Next writes the scripts of a loading
// boundary's client code into the page WITHOUT the nonce of the content
// security policy: the browser blocks them. The blank record lived in
// `game-record.comp.tsx` for an hour on 2026-10-05, and that file's edit
// dialog went along (`components/loading-boundaries.test.ts` watches it now).

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

/**
 * The record's card, blank, while the next game of the study arrives: it
 * keeps the record's place under the study, so the column does not close up
 * and open again from one game to the next. Here and not beside `GameRecord`,
 * whose file brings a Client Component (see the note at the top).
 */
export function GameRecordSkeleton() {
  return <div className="game-record game-record_state_loading" aria-hidden="true" />;
}
