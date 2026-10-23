import { ExercisesPanelSkeleton } from "@/components/platform/sections/exercises/exercises-panel-skeleton.comp";

// «Historial»: the attempts as rows.
export default function ExerciseHistoryLoading() {
  return <ExercisesPanelSkeleton view="list" label="Cargando tu historial…" />;
}
