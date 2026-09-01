import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailSection } from "@/components/sections/platform/courses/course-detail/course-detail.section";
import { getCourseBySlug } from "@/services/courses/courses.service";
import "./course-page.css";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  return course ? { title: course.name } : {};
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  return (
    <div className="platform-page course-page">
      <CourseDetailSection course={course} />
    </div>
  );
}
