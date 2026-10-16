import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";

// Under the series: its page, and each of its exercises — the way from one to
// the next («Siguiente ejercicio») waits here too.
export default function ExerciseSeriesLoading() {
  return <BoardLoading label="Cargando la serie…" />;
}
