import { ExerciseImportForm } from "@/components/platform/shared/exercise-import-form/exercise-import-form.comp";
import { EXERCISES_PERSISTENCE_ENABLED } from "@/constants/platform/features.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { importTeacherExercises } from "@/services/teacher-exercises/teacher-exercises.actions";
import { getExerciseCatalogs, listTeacherSeriesOptions } from "@/services/teacher-exercises/teacher-exercises.service";

/** The series offered while nothing persists: a sample, to try the control. */
const SAMPLE_SERIES = [{ id: "demo-series", title: "Táctica de la semana (muestra)" }];

/**
 * «Importar PGN» for the teacher's bank (D12): the import form with the
 * catalogs, the teacher's series and the two-step action bound here, on the
 * server, so the form imports no action. Without `EXERCISES_PERSISTENCE_ENABLED`
 * the form gets no action and reviews the file in the browser.
 */
export async function TeacherExerciseImportSection() {
  const [catalogs, series] = await Promise.all([
    getExerciseCatalogs(),
    EXERCISES_PERSISTENCE_ENABLED ? listTeacherSeriesOptions() : SAMPLE_SERIES,
  ]);
  return (
    <ExerciseImportForm
      audience="teacher"
      kinds={catalogs.kinds}
      topics={catalogs.topics}
      series={series}
      action={EXERCISES_PERSISTENCE_ENABLED ? importTeacherExercises : undefined}
      backHref={teacherRoutes.exercises}
    />
  );
}
