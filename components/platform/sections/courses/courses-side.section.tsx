import { getCourseCatalog, getUserCourses, listCourseLevels } from "@/services/courses/courses.service";
import { coursesNavGroups } from "./courses-nav.const";
import { CoursesSideNav } from "./courses-side-nav.comp";
import { resumeCourseOf } from "./my-courses/my-courses-filter.const";

/**
 * The side column's data: the student's courses, the catalog and the levels
 * (cached per request, so the page under it reads them again for free),
 * counted into the groups, and the course to go on with. It is the one part
 * of the frame that waits for the database, so `CoursesWorkspace` streams it
 * behind its own skeleton: the frame — and the bar's three bars with it —
 * is on screen from the first paint.
 */
export async function CoursesSideSection() {
  const [mine, catalog, levels] = await Promise.all([getUserCourses(), getCourseCatalog(), listCourseLevels()]);
  return (
    <CoursesSideNav groups={coursesNavGroups(mine, catalog, levels)} resumeHref={resumeCourseOf(mine)?.learnHref} />
  );
}
