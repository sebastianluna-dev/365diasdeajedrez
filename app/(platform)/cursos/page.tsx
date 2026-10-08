import type { Metadata } from "next";
import { MyCoursesSection } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { getUserCourses } from "@/services/courses/courses.service";
import { getStreakOverview } from "@/services/study-goal/study-goal.service";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default async function CoursesPage() {
  // Border of the private area: both go through getCurrentUser, so this first
  // await acts as the session check as well as fetching the data.
  const [courses, streak] = await Promise.all([getUserCourses(), getStreakOverview()]);

  return (
    <div className="platform-page platform-page_width_wide courses-page">
      <MyCoursesSection courses={courses} streak={streak} />
    </div>
  );
}
