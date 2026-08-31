import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorSection } from "@/components/sections/platform/staff/courses/course-editor.section";
import {
  getCourseAdminDetail,
  listAuthorRoles,
  listAuthors,
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
  // El servicio abre con requireStaff(): es la frontera del panel.
  const course = await getCourseAdminDetail(courseId);
  if (!course) notFound();

  const [types, levels, authors, authorRoles, { error }] = await Promise.all([
    listCourseTypes(),
    listLevels(),
    listAuthors(),
    listAuthorRoles(),
    searchParams,
  ]);

  return (
    <div className="platform-page staff-course-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{course.name}</h1>
        <p className="platform-page__subtitle">
          {course.statusLabel} · {course.slug}
        </p>
      </header>

      <CourseEditorSection
        course={course}
        types={types}
        levels={levels}
        authors={authors}
        authorRoles={authorRoles}
        errorCode={error}
      />
    </div>
  );
}
