import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CourseRecordHead } from "@/components/platform/sections/staff/courses/course-record-head.comp";
import {
  countCollectionGames,
  getCourseAdminDetail,
  listCourseStatuses,
} from "@/services/staff-courses/staff-courses.service";

interface CourseRecordLayoutProps {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}

/**
 * The frame of a course record: its name, its status and the tabs, above
 * whichever of the three pages one is on — «Curso», «Temario», «Partidas».
 *
 * It is a layout and not a piece each page draws for two reasons: the three
 * cannot drift apart, and Next does not render a layout again when one moves
 * between its children, so the header does not blink on the way. The pages
 * that hang FROM the record (a lesson, a game on the board) are outside this
 * group and keep their own header.
 *
 * The course read here is the same one the page reads: `getCourseAdminDetail`
 * is wrapped in React's `cache`, so both share one query.
 */
export default async function CourseRecordLayout({ children, params }: CourseRecordLayoutProps) {
  const { courseId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const course = await getCourseAdminDetail(courseId);
  if (!course) notFound();

  const [statuses, gameCount] = await Promise.all([listCourseStatuses(), countCollectionGames({ courseId })]);

  return (
    <div className="platform-page staff-course-record">
      <CourseRecordHead course={course} statuses={statuses} gameCount={gameCount} />
      {children}
    </div>
  );
}
