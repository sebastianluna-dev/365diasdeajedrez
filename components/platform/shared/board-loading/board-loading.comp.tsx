import "./board-loading.comp.css";

interface BoardLoadingProps {
  label?: string;
}

/**
 * What a `loading.tsx` of the platform shows while one ARRIVES at a screen: a
 * knight that hops over its shadow, and one line. The line is generic by
 * default; the study's segment, where what is waited for is a board, says so.
 * Moving inside a screen whose frame stays — the next lesson of a chapter,
 * the next game of a study — is another wait, with the board in its place
 * (`BoardSkeleton`).
 */
export function BoardLoading({ label = "Cargando…" }: BoardLoadingProps) {
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
