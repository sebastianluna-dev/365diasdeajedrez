import type { Metadata } from "next";
import { MyCoursesSection } from "@/components/platform/sections/courses/my-courses/my-courses.section";
import { getUserCourses } from "@/services/courses/courses.service";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default async function CoursesPage() {
  // Border of the private area: it goes through getCurrentUser, so this await
  // acts as the session check as well as fetching the data.
  const courses = await getUserCourses();

  return (
    <div className="platform-page courses-page">
      <MyCoursesSection courses={courses} />
    </div>
  );
}
