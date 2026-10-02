import "./board-loading.comp.css";

interface BoardLoadingProps {
  label?: string;
}

/**
 * What every `loading.tsx` of the platform shows while a segment streams: a
 * knight that hops over its shadow, and one line. The line is generic by
 * default; the study's segment, where what is waited for is a board, says so.
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
