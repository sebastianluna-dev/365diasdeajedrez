import { ExercisesPanelSkeleton } from "@/components/platform/sections/exercises/exercises-panel-skeleton.comp";

// «De tu profesor» and «Series de la academia»: the series as rows.
export default function ExerciseSeriesListLoading() {
  return <ExercisesPanelSkeleton view="list" label="Cargando tus series…" />;
}
