import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorSection } from "@/components/platform/sections/staff/courses/course-editor.section";
import {
  getCourseAdminDetail,
  listAuthorRoles,
  listAuthors,
  listContentTypes,
  listLevels,
} from "@/services/staff-courses/staff-courses.service";
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

  const [contentTypes, levels, authors, authorRoles, sourceTypes, { error }] = await Promise.all([
    listContentTypes(),
    listLevels(),
    listAuthors(),
    listAuthorRoles(),
    listSourceTypes(),
    searchParams,
  ]);

  // The name, the status and the tabs are the record's layout: they are the
  // same on the three pages.
  return (
    <CourseEditorSection
      course={course}
      contentTypes={contentTypes}
      levels={levels}
      authors={authors}
      authorRoles={authorRoles}
      sourceTypes={sourceTypes}
      errorCode={error}
    />
  );
}
