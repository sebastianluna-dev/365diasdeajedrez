import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { teacherRoutes } from "@/lib/platform-routes";

interface StudentPageTabsProps {
  studentId: string;
  current: "resumen" | "ejercicios";
}

/**
 * The two views of a student's page for their teacher, as pills: «Resumen»
 * (the page itself) and «Ejercicios» (their attempts, D24). Drawn only with
 * the exercises on: without them the page has one view and no pills.
 */
export function StudentPageTabs({ studentId, current }: StudentPageTabsProps) {
  if (!EXERCISES_ENABLED) return null;
  return (
    <FilterPills
      label="Vista"
      pills={[
        { label: "Resumen", href: teacherRoutes.studentDetail(studentId), active: current === "resumen" },
        { label: "Ejercicios", href: teacherRoutes.studentExercises(studentId), active: current === "ejercicios" },
      ]}
    />
  );
}
