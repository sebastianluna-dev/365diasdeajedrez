import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";

// The solver is not on the new design system yet: it keeps the board's
// loading instead of the class notebook's skeleton above it.
export default function ClassExerciseLoading() {
  return <BoardLoading label="Cargando el ejercicio…" />;
}
