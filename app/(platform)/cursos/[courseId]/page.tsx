import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailSection } from "@/components/platform/sections/courses/course-detail/course-detail.section";
import { getCourseById } from "@/services/courses/courses.service";
import "./course-page.css";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  return course ? { title: course.name } : {};
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { courseId } = await params;
  const [course, { error }] = await Promise.all([getCourseById(courseId), searchParams]);
  if (!course) notFound();

  return (
    <div className="platform-page course-page">
      <CourseDetailSection course={course} errorCode={error} />
    </div>
  );
}
