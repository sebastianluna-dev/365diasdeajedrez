import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CourseInfoSection } from "@/components/platform/sections/courses/course-info/course-info.section";
import { CourseStudySection } from "@/components/platform/sections/courses/course-study/course-study.section";
import { listCourseLevels, resolveCourseReference } from "@/services/courses/courses.service";

interface CoursePageProps {
  /**
   * An id or a slug, and the page is a different one for each:
   * `/cursos/10000004` is the course to STUDY and
   * `/cursos/mis-60-memorables-partidas` what the course IS, where it is added.
   * One segment cannot be two folders, so it is told apart here.
   */
  params: Promise<{ courseRef: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseRef } = await params;
  const found = await resolveCourseReference(courseRef);
  return found ? { title: found.course.name } : {};
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { courseRef } = await params;
  const [found, { error }] = await Promise.all([resolveCourseReference(courseRef), searchParams]);
  if (!found) notFound();
  const { course } = found;

  if (found.kind === "study") {
    // A course is studied once it is added, and it is added on its
    // information page: whoever arrives here without it is taken there.
    if (!course.isAdded) redirect(course.infoHref);

    return (
      <div className="platform-page course-page">
        <CourseStudySection course={course} errorCode={error} />
      </div>
    );
  }

  const levels = await listCourseLevels();

  return (
    <div className="platform-page course-page">
      <CourseInfoSection course={course} levels={levels} errorCode={error} />
    </div>
  );
}
