import "./board-skeleton.comp.css";

interface BoardSkeletonProps {
  /** What is on its way, for a screen reader: «Cargando la lección», «Cargando la partida». */
  label: string;
}

/**
 * A board before its game: the eight by eight painted in the board's own two
 * greens, with one ring turning in the middle. It is what a screen shows in
 * the board's place while the next game of the SAME screen arrives — the next
 * lesson of a chapter, the next game of a study —, so that what lands are the
 * pieces and not a new page.
 *
 * It fills the width it is given and is square, as the viewer's board is; the
 * skeleton around it (the lesson's, the study game's) is what puts it in the
 * board's track.
 */
export function BoardSkeleton({ label }: BoardSkeletonProps) {
  return (
    <div className="board-skeleton" role="status" aria-label={label}>
      <span className="board-skeleton__spinner" aria-hidden="true" />
    </div>
  );
}
