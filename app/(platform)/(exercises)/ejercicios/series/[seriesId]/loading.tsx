import { ExercisesPanelSkeleton } from "@/components/platform/sections/exercises/exercises-panel-skeleton.comp";

// A series' page: its exercises as rows. Each exercise of it waits in its own segment, on the board.
export default function ExerciseSeriesLoading() {
  return <ExercisesPanelSkeleton view="list" label="Cargando la serie…" />;
}
