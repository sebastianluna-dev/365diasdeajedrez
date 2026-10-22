import Image from "next/image";
import Link from "next/link";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import type { CourseOutline } from "@/services/courses/courses.types";
import { OutlineList } from "./outline-list.comp";
import { PriorityLessonsFilter } from "./priority-lessons-filter.comp";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  /** The course, its chapters and their lessons: everything the column lists. */
  outline: CourseOutline;
}

/**
 * The lesson's side column in the new design system (2026-10-22): the course
 * at the top — its picture, its name (the way back to it) and how far it is
 * —, the switch for the priority lessons, and its chapters, the lesson's open
 * with its lessons (`OutlineList`).
 *
 * It belongs to the chapter's layout and not to the lesson's page: that is
 * what keeps it from being fetched and drawn again on every move, and it is
 * also why it does not know which lesson is open — the list does, in the
 * browser.
 */
export function LessonOutline({ outline }: LessonOutlineProps) {
  const { courseId, courseName, courseHref, courseThumbnail, onlyPriorityLessons, chapters } = outline;
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const done = lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length;
  const percent = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <nav className="lesson-outline" aria-label="Lecciones del curso">
      <div className="lesson-outline__course">
        <span className="lesson-outline__thumb">
          {courseThumbnail && (
            <Image src={courseThumbnail} alt="" fill sizes="40px" className="lesson-outline__thumb-image" />
          )}
        </span>
        <span className="lesson-outline__about">
          <Link href={courseHref} className="lesson-outline__course-name">
            {courseName}
          </Link>
          <span className="lesson-outline__figures">
            {percent} % · {done} de {lessons.length} {lessons.length === 1 ? "lección" : "lecciones"}
          </span>
        </span>
      </div>

      <PriorityLessonsFilter
        action={setOnlyPriorityLessons.bind(null, courseId, !onlyPriorityLessons)}
        enabled={onlyPriorityLessons}
      />

      <OutlineList chapters={chapters} />
    </nav>
  );
}
