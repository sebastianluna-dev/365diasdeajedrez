import { getStudentExercisesHome } from "@/services/exercises/exercises.service";
import { getPracticeFilters } from "@/services/exercises/practice.service";
import { ExercisesSideNav } from "./exercises-side-nav.comp";

/**
 * The side column's data: the topics with a library exercise and the series
 * the student may open, the teacher's and the academy's (both cached per
 * request, so the page under it reads them again for free). It is the one
 * part of the frame that waits for the database, so `ExercisesWorkspace`
 * streams it behind its own skeleton.
 */
export async function ExercisesSideSection() {
  const [filters, home] = await Promise.all([getPracticeFilters(), getStudentExercisesHome()]);
  return (
    <ExercisesSideNav
      data={{
        topics: filters.topics,
        teacherSeriesIds: home.series.map((series) => series.id),
        academySeriesIds: home.academySeries.map((series) => series.id),
      }}
    />
  );
}
