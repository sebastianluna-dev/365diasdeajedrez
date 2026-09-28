import type { Metadata } from "next";
import { MyCoursesSection } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { getUserCourses, listCourseLevels } from "@/services/courses/courses.service";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default async function CoursesPage() {
  // Border of the private area: both go through getCurrentUser, so this first
  // await acts as the session check as well as fetching the data.
  const [courses, levels] = await Promise.all([getUserCourses(), listCourseLevels()]);

  return (
    <div className="platform-page courses-page">
      <MyCoursesSection courses={courses} levels={levels} />
    </div>
  );
}
