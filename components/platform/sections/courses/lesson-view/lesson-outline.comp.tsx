import type { CourseOutline } from "@/services/courses/courses.types";
import { OutlineList } from "./outline-list.comp";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  /** The chapter the lesson is in and its lessons: everything the column lists. */
  outline: CourseOutline;
}

/**
 * The lesson's side column in the new design system: the lessons of the
 * chapter the lesson is in (`OutlineList`), the one being read lit. Only that
 * chapter since 2026-10-23, and no switch for the priority lessons: that
 * setting is the course's settings panel's. Nothing above the list since the
 * same day: the course and the chapter are the panel's trail's to name.
 *
 * It belongs to the chapter's layout and not to the lesson's page: that is
 * what keeps it from being fetched and drawn again on every move, and it is
 * also why it does not know which lesson is open — the list does, in the
 * browser.
 */
export function LessonOutline({ outline }: LessonOutlineProps) {
  return (
    <nav className="lesson-outline" aria-label="Lecciones del capítulo">
      <OutlineList chapter={outline.chapter} />
    </nav>
  );
}
