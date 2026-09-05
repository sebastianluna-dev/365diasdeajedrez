import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorSection } from "@/components/sections/platform/staff/courses/course-editor.section";
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
  // El servicio abre con requireStaff(): es la frontera del panel.
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

  // La cabecera va DENTRO de la sección: lleva las migas y el estado, que son
  // datos del curso y no de la página.
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
