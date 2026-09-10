import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseGamesSection } from "@/components/sections/platform/staff/courses/course-games.section";
import { getCourseAdminDetail, listCollectionGames } from "@/services/staff-courses/staff-courses.service";

interface CourseGamesPageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: CourseGamesPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseAdminDetail(courseId);
  return course ? { title: `Partidas · ${course.name}` } : {};
}

export default async function CourseGamesPage({ params }: CourseGamesPageProps) {
  const { courseId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const course = await getCourseAdminDetail(courseId);
  if (!course) notFound();

  const games = await listCollectionGames({ courseId });

  return (
    <div className="platform-page staff-course-games-page">
      <CourseGamesSection course={course} games={games} />
    </div>
  );
}
