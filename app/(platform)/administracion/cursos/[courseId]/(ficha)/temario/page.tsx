import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseSyllabus } from "@/components/platform/sections/staff/courses/course-syllabus/course-syllabus.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { getCourseAdminDetail } from "@/services/staff-courses/staff-courses.service";

interface CourseChaptersPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: CourseChaptersPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseAdminDetail(courseId);
  return course ? { title: `Temario · ${course.name}` } : {};
}

export default async function CourseChaptersPage({ params, searchParams }: CourseChaptersPageProps) {
  const { courseId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const course = await getCourseAdminDetail(courseId);
  if (!course) notFound();

  const { error } = await searchParams;

  return (
    <CourseSyllabus
      courseId={course.id}
      chapters={course.chapters}
      isDraft={course.statusCode === COURSE_STATUS.DRAFT}
      errorCode={error}
    />
  );
}
