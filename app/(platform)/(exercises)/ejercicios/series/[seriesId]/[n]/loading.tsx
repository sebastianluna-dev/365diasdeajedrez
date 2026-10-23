import { ExercisesPanelSkeleton } from "@/components/platform/sections/exercises/exercises-panel-skeleton.comp";

// An exercise of a series — the way from one to the next («Siguiente ejercicio») waits here too.
export default function ExerciseSeriesItemLoading() {
  return <ExercisesPanelSkeleton view="board" label="Cargando el ejercicio…" />;
}
