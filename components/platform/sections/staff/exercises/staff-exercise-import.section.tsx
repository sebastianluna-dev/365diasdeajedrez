import { ExerciseImportForm } from "@/components/platform/shared/exercise-import-form/exercise-import-form.comp";
import { EXERCISES_PERSISTENCE_ENABLED } from "@/constants/platform/features.const";
import { staffRoutes } from "@/lib/platform-routes";
import { importStaffExercises } from "@/services/staff-exercises/staff-exercises.actions";
import { listAcademySeriesOptions } from "@/services/staff-exercises/staff-exercises.service";
import { getExerciseCatalogs } from "@/services/teacher-exercises/teacher-exercises.service";

/** The series offered while nothing persists: a sample, to try the control. */
const SAMPLE_SERIES = [{ id: "demo-series", title: "Mates y golpes tácticos (muestra)" }];

/**
 * «Importar PGN» for the academy's bank (D12): the import form with the
 * catalogs, the academy's series and the staff's two-step action bound
 * here, on the server; «En la biblioteca» publishes what passes the gate.
 * Without `EXERCISES_PERSISTENCE_ENABLED` the form gets no action and
 * reviews the file in the browser.
 */
export async function StaffExerciseImportSection() {
  const [catalogs, series] = await Promise.all([
    getExerciseCatalogs(),
    EXERCISES_PERSISTENCE_ENABLED ? listAcademySeriesOptions() : SAMPLE_SERIES,
  ]);
  return (
    <ExerciseImportForm
      audience="academy"
      kinds={catalogs.kinds}
      topics={catalogs.topics}
      series={series}
      action={EXERCISES_PERSISTENCE_ENABLED ? importStaffExercises : undefined}
      backHref={staffRoutes.exercises}
    />
  );
}
