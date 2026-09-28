import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorSection } from "@/components/platform/sections/staff/courses/course-editor.section";
import {
  getCourseAdminDetail,
  listAuthorRoles,
  listAuthors,
  countCollectionGames,
  listContentTypes,
  listCourseStatuses,
} from "@/services/staff-courses/staff-courses.service";
import { listLevelOptions } from "@/services/staff-levels/staff-levels.service";
import { listSourceTypes } from "@/services/staff-sources/staff-sources.service";

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

  const [contentTypes, levels, authors, authorRoles, statuses, sourceTypes, gameCount, { error }] = await Promise.all([
    listContentTypes(),
    listLevelOptions(),
    listAuthors(),
    listAuthorRoles(),
    listCourseStatuses(),
    listSourceTypes(),
    countCollectionGames({ courseId }),
    searchParams,
  ]);

  // The header goes INSIDE the section: it carries the name and the status,
  // which are data of the course and not of the page.
  return (
    <div className="platform-page staff-course-page">
      <CourseEditorSection
        course={course}
        contentTypes={contentTypes}
        levels={levels}
        authors={authors}
        authorRoles={authorRoles}
        statuses={statuses}
        sourceTypes={sourceTypes}
        gameCount={gameCount}
        errorCode={error}
      />
    </div>
  );
}
