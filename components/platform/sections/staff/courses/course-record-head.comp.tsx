import Link from "next/link";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CatalogOption, CourseAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { CourseStatusMenu } from "./course-status/course-status-menu.comp";
import { StaffEditorHead } from "./staff-editor.comp";
import { StaffTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.comp";
import { courseTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.const";

interface CourseRecordHeadProps {
  course: CourseAdminDetail;
  /** The statuses on offer, for the pill that changes it. */
  statuses: CatalogOption[];
  /** How many games the course has; the «Partidas» tab says it. */
  gameCount: number;
}

/**
 * How a course names itself on its three pages: its name, its status and the
 * tabs. It is drawn by the record's LAYOUT and not by each page, so the three
 * cannot drift apart — and so the header does not blink when one moves from
 * «Curso» to «Temario»: the layout is not rendered again.
 */
export function CourseRecordHead({ course, statuses, gameCount }: CourseRecordHeadProps) {
  return (
    <>
      <StaffEditorHead
        title={course.name}
        badge={
          <CourseStatusMenu
            courseId={course.id}
            statusCode={course.statusCode}
            statuses={statuses}
            canPublish={course.canPublish}
          />
        }
        actions={
          course.statusCode === COURSE_STATUS.PUBLISHED && (
            <Link
              // The information page, by the slug: it is what a student sees
              // of the course before adding it, and it needs nothing added.
              href={platformRoutes.courseInfo(course.slug)}
              className="platform-button"
            >
              Ver en la plataforma
            </Link>
          )
        }
      />

      <StaffTabs tabs={courseTabs({ courseId: course.id, chapterCount: course.chapters.length, gameCount })} />
    </>
  );
}
