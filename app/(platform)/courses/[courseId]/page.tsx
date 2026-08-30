import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailSection } from "@/components/sections/platform/courses/course-detail/course-detail.section";
import { getCourseById } from "@/services/courses/courses.service";
import "./course-page.css";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  return course ? { title: course.name } : {};
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  return (
    <div className="platform-page course-page">
      <CourseDetailSection course={course} />
    </div>
  );
}
