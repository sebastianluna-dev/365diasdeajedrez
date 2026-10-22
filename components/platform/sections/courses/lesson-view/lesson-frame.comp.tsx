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
 * The lesson's screen in the new design system (2026-10-22, «M4» of the
 * owner's canvas): a workspace that IS the window
 * (`.platform-workspace_height_screen`), the course's chapters and lessons
 * in its side column, and the lesson on its panel.
 *
 * It is a container, which is why it takes `children`: the chapter's layout
 * mounts it and the lesson's page fills the panel, so moving to another
 * lesson changes what is inside and leaves the column alone — not drawn
 * again, not fetched again, not scrolled back to the top.
 */
export function LessonFrame({ outline, children }: LessonFrameProps) {
  return (
    <div className="platform-workspace platform-workspace_height_screen">
      <div className="platform-workspace__side">
        <LessonOutline outline={outline} />
      </div>
      <section className="platform-workspace__panel lesson-frame" aria-label="Lección">
        {children}
      </section>
    </div>
  );
}
