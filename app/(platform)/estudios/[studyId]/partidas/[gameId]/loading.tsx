import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";

// From one game to another only the page is waited for: the study's column is
// the layout's and stays on screen, so the knight hops where the board is
// about to appear and nowhere else.
export default function GameLoading() {
  return <BoardLoading label="Preparando el tablero…" />;
}
