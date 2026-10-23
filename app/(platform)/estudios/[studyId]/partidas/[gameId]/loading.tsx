import { GameRecordSkeleton, GameSkeleton } from "@/components/platform/sections/studies/game-view/game-skeleton.comp";

/**
 * From one game of the study to another only the page is waited for — the
 * study's column is the layout's and stays on screen —, so what stands in is
 * the page's own shape, empty: the board in its place with a ring turning
 * over it and the record's card blank, as between two lessons of a chapter.
 * The knight is for arriving at the study, which is the layout's wait
 * (`[studyId]/loading.tsx`).
 */
export default function GameLoading() {
  return (
    <>
      <GameRecordSkeleton />
      <GameSkeleton />
    </>
  );
}
