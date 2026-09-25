import { BoardLoading } from "@/components/platform/shared/board-loading.comp";

// The study's segment and the game page under it: opening a study is opening
// its first game, so what is waited for here is always a board.
export default function StudyLoading() {
  return <BoardLoading />;
}
