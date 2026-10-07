import Image from "next/image";
import Link from "next/link";
import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import { OutlineList } from "./outline-list.comp";
import { PriorityLessonsFilter } from "./priority-lessons-filter.comp";
import type { CourseOutline } from "@/services/courses/courses.types";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  /** The course, its chapters and their lessons: everything the column lists. */
  outline: CourseOutline;
}

/** The square image is drawn at 72px, at twice that for a dense screen. */
const THUMBNAIL_SIZES = "144px";

/**
 * Where the lesson stands: the course and every chapter of it with its
 * lessons, the one open marked — a table of contents one scrolls through, so
 * moving to the next lesson, or the next chapter, does not mean going back.
 *
 * It belongs to the chapter's layout and not to the lesson's page: that is
 * what keeps it from being fetched and drawn again on every move, and it is
 * also why it does not know which lesson is open — the list does, in the
 * browser (see `OutlineList`).
 */
export function LessonOutline({ outline }: LessonOutlineProps) {
  const { courseId, courseName, courseHref, courseThumbnail, onlyPriorityLessons, chapters } = outline;

  return (
    <nav className="lesson-outline" aria-label="Lecciones del curso">
      {/* The course's head: its image, its name and what of it is being
          learned. The name is the head's one link, to the course; the filter
          is a form, so it cannot live inside that link. */}
      <div className="lesson-outline__course">
        {/* The image is not a link: the title beside it is the head's one. */}
        {courseThumbnail && (
          <Image
            src={courseThumbnail}
            alt=""
            width={144}
            height={144}
            sizes={THUMBNAIL_SIZES}
            className="lesson-outline__cover"
          />
        )}

        <div className="lesson-outline__course-text">
          <Link href={courseHref} className="lesson-outline__course-name">
            {courseName}
          </Link>

          {/* Under the name, beside the image, as a small switch: a setting
              of the column, not one more thing to read. */}
          <PriorityLessonsFilter
            action={setOnlyPriorityLessons.bind(null, courseId, !onlyPriorityLessons)}
            enabled={onlyPriorityLessons}
          />
        </div>
      </div>

      {/* What scrolls: the chapters and their lessons. The course's head stays
          out of it, because where one is should not scroll away. */}
      <div className="lesson-outline__body">
        <OutlineList chapters={chapters} />
      </div>
    </nav>
  );
}
