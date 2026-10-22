import type { Metadata } from "next";
import { MyCoursesSection } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { myCoursesFilterOf } from "@/components/platform/sections/courses/my-courses/my-courses-filter.const";
import { getUserCourses } from "@/services/courses/courses.service";
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
  // layout reads the same courses, cached for the request; the frame is its.
  const [courses, streak, { estado }] = await Promise.all([getUserCourses(), getStreakOverview(), searchParams]);

  return <MyCoursesSection courses={courses} filter={myCoursesFilterOf(estado)} streak={streak} />;
}
