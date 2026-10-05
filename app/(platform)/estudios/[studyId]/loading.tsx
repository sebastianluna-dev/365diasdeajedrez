import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";

// The study's segment: opening a study is opening its first game, so what is
// waited for here is a board, and the line says so. It covers the arrival —
// the layout of the game pages and the first game —; from one game to the
// next the wait is the game's own (`partidas/[gameId]/loading.tsx`).
export default function StudyLoading() {
  return <BoardLoading label="Preparando el tablero…" />;
}
