import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";

// The study's segment and the game page under it: opening a study is opening
// its first game, so what is waited for here is a board, and the line says so.
export default function StudyLoading() {
  return <BoardLoading label="Preparando el tablero…" />;
}
