import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import type { CourseDetail } from "@/services/courses/courses.types";

interface CourseSideProps {
  course: CourseDetail;
  /** The chapter on screen, on a chapter's page: its link is lit. */
  chapterId?: string;
}

/**
 * The side column of a course being studied, in the new design system
 * (2026-10-22, «M4» of the owner's canvas): «Aprender» as the extended FAB,
 * and the course's chapters as the column's links, each with its number (a
 * check once it is learned) and its lessons; on a chapter's page that
 * chapter is lit. The course itself is no longer at its top (2026-10-23):
 * the page already names it, in its trail and its title. What to learn and
 * the course's options are its settings panel (`CourseSettings`).
 */
export function CourseSide({ course, chapterId }: CourseSideProps) {
  return (
    <PlatformSideNav
      label="El curso"
      action={course.learnHref ? { label: "Aprender", href: course.learnHref } : undefined}
      groups={
        course.chapters.length === 0
          ? []
          : [
              {
                title: "Capítulos",
                links: course.chapters.map((item) => ({
                  label: item.name,
                  href: item.href,
                  count: `${item.completedLessons}/${item.totalLessons}`,
                  badge: { text: String(item.order), done: item.isCompleted },
                  current: item.id === chapterId,
                })),
              },
            ]
      }
    />
  );
}
