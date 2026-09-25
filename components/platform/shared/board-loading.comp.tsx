import "./board-loading.comp.css";

interface BoardLoadingProps {
  label?: string;
}

/**
 * What a study's segment shows while its game streams: a knight that hops
 * over its shadow, and one line. It replaces the generic spinner of
 * `LoadingPanel` where what is being waited for is a board.
 */
export function BoardLoading({ label = "Preparando el tablero…" }: BoardLoadingProps) {
  return (
    <div className="board-loading" role="status" aria-live="polite">
      <span className="board-loading__figure" aria-hidden="true">
        <span className="board-loading__knight">♞</span>
        <span className="board-loading__shadow" />
      </span>
      <span className="board-loading__label">{label}</span>
    </div>
  );
}
