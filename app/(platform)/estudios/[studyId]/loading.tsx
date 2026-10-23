import { StudySkeleton } from "@/components/platform/sections/studies/game-view/study-skeleton.comp";

// The study's segment: opening a study is opening a game of it, so what is
// waited for here is the whole workspace — the study's column and a board
// (the new design system, 2026-10-23). It covers the arrival — the layout of
// the game pages and the first game —; from one game to the next the wait is
// the game's own (`partidas/[gameId]/loading.tsx`).
export default function StudyLoading() {
  return <StudySkeleton />;
}
