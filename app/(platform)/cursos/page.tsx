import type { Metadata } from "next";
import type { MyCoursesCatalog } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { MyCoursesSection } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { myCoursesFilterOf } from "@/components/platform/sections/courses/my-courses/my-courses-filter.const";
import { getCourseCatalog, getUserCourses, listCourseLevels } from "@/services/courses/courses.service";
import { getStreakOverview } from "@/services/study-goal/study-goal.service";

export const metadata: Metadata = {
  title: "Mis cursos",
};

interface CoursesPageProps {
  /** `estado`: the view of the student's courses (`en-curso`, `completados`, `sin-empezar`). */
  searchParams: Promise<{ estado?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  // Border of the private area: the reads go through getCurrentUser, so this
  // first await acts as the session check as well as fetching the data. The
  // catalog and «Mis cursos» share one cached read of the published courses.
  const [courses, streak, catalog, levels, { estado }] = await Promise.all([
    getUserCourses(),
    getStreakOverview(),
    getCourseCatalog(),
    listCourseLevels(),
    searchParams,
  ]);

  const counts: MyCoursesCatalog = {
    total: catalog.length,
    levels: levels.map((level) => ({
      slug: level.slug,
      name: level.name,
      count: catalog.filter((course) => course.levels.some((one) => one.slug === level.slug)).length,
    })),
  };

  return (
    <div className="platform-page platform-page_frame_bleed courses-page">
      <MyCoursesSection courses={courses} filter={myCoursesFilterOf(estado)} streak={streak} catalog={counts} />
    </div>
  );
}
