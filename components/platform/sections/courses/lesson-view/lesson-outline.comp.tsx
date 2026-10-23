import Image from "next/image";
import Link from "next/link";
import type { CourseOutline } from "@/services/courses/courses.types";
import { OutlineList } from "./outline-list.comp";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  /** The course, its chapters and their lessons: everything the column lists. */
  outline: CourseOutline;
}

/**
 * The lesson's side column in the new design system: the course at the top —
 * its picture and its name (the way back to it; how far it is went on
 * 2026-10-23, the course's page says it) —, and the
 * chapter the lesson is in with its lessons (`OutlineList`), the one being
 * read lit. Only that chapter since 2026-10-23, and no switch for the
 * priority lessons: that setting is the course's settings panel's.
 *
 * It belongs to the chapter's layout and not to the lesson's page: that is
 * what keeps it from being fetched and drawn again on every move, and it is
 * also why it does not know which lesson is open — the list does, in the
 * browser.
 */
export function LessonOutline({ outline }: LessonOutlineProps) {
  const { courseName, courseHref, courseThumbnail, chapter } = outline;

  return (
    <nav className="lesson-outline" aria-label="Lecciones del capítulo">
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
        </span>
      </div>

      <OutlineList chapter={chapter} />
    </nav>
  );
}
