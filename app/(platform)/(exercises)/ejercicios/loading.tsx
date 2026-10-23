import { ExercisesPanelSkeleton } from "@/components/platform/sections/exercises/exercises-panel-skeleton.comp";

// The layout keeps the side column: only the panel waits, in the shape of an exercise on the board.
export default function ExercisesLoading() {
  return <ExercisesPanelSkeleton view="board" label="Cargando el ejercicio…" />;
}
