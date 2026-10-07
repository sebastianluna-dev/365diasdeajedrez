import type { CourseOutline } from "@/services/courses/courses.types";
import { LessonOutline } from "./lesson-outline.comp";
import "./lesson-frame.comp.css";

interface LessonFrameProps {
  /** The course around the lesson: what the column lists. */
  outline: CourseOutline;
  /** The lesson itself, which is what changes underneath. */
  children: React.ReactNode;
}

/**
 * The lesson's screen: the column of lessons and, beside it, the lesson.
 *
 * It is a container, which is why it takes `children`: the chapter's layout
 * mounts it and the lesson's page fills it, so moving to another lesson
 * changes what is inside and leaves the column alone — not drawn again, not
 * fetched again, not scrolled back to the top.
 */
export function LessonFrame({ outline, children }: LessonFrameProps) {
  return (
    <div className="lesson-frame">
      <LessonOutline outline={outline} />
      {children}
    </div>
  );
}
