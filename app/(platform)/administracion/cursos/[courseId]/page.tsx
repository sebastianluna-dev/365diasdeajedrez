import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorSection } from "@/components/platform/sections/staff/courses/course-editor.section";
import {
  getCourseAdminDetail,
  listAuthorRoles,
  listAuthors,
  countCollectionGames,
  listCourseTypes,
  listLevels,
} from "@/services/staff-courses/staff-courses.service";

interface StaffCoursePageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffCoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseAdminDetail(courseId);
  return course ? { title: course.name } : {};
}

export default async function StaffCoursePage({ params, searchParams }: StaffCoursePageProps) {
  const { courseId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const course = await getCourseAdminDetail(courseId);
  if (!course) notFound();

  const [types, levels, authors, authorRoles, gameCount, { error }] = await Promise.all([
    listCourseTypes(),
    listLevels(),
    listAuthors(),
    listAuthorRoles(),
    countCollectionGames({ courseId }),
    searchParams,
  ]);

  // The header goes INSIDE the section: it carries the breadcrumbs and the
  // status, which are data of the course and not of the page.
  return (
    <div className="platform-page staff-course-page">
      <CourseEditorSection
        course={course}
        types={types}
        levels={levels}
        authors={authors}
        authorRoles={authorRoles}
        gameCount={gameCount}
        errorCode={error}
      />
    </div>
  );
}
