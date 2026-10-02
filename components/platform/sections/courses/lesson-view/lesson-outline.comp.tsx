import Image from "next/image";
import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CurrentPathField } from "@/components/platform/shared/current-path-field/current-path-field.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import { OutlineList } from "./outline-list.comp";
import type { ChapterOutline } from "@/services/courses/courses.types";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  /** The course, the chapter and its lessons: everything the column lists. */
  outline: ChapterOutline;
}

/** The square image is drawn at 72px, at twice that for a dense screen. */
const THUMBNAIL_SIZES = "144px";

/** The gauge is drawn on a 36-unit box; the ring's radius leaves room for its stroke. */
const GAUGE_RADIUS = 15;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS;

/**
 * Where the lesson stands: the course, the chapter and its lessons, with the
 * one open marked. It is the chapter's page condensed into a column, so
 * moving to the next lesson does not mean going back twice.
 *
 * It belongs to the chapter's layout and not to the lesson's page: that is
 * what keeps it from being fetched and drawn again on every move, and it is
 * also why it does not know which lesson is open — the list does, in the
 * browser (see `OutlineList`).
 */
export function LessonOutline({ outline }: LessonOutlineProps) {
  const { courseId, courseName, courseHref, courseThumbnail, onlyPriorityLessons, chapterName, chapterHref, lessons } =
    outline;

  // The chapter's progress is counted from the very list the column draws, so
  // what the ring says and what the marks say can never differ.
  const completed = lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length;
  const percent = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <nav className="lesson-outline" aria-label="Lecciones del capítulo">
      {/* The course's head: its image, its name and what of it is being
          learned. The image and the name lead to the course; the filter is a
          form, so it cannot live inside that link. */}
      <div className="lesson-outline__course">
        {courseThumbnail && (
          <Link href={courseHref} className="lesson-outline__cover-link" aria-hidden="true" tabIndex={-1}>
            <Image
              src={courseThumbnail}
              alt=""
              width={144}
              height={144}
              sizes={THUMBNAIL_SIZES}
              className="lesson-outline__cover"
            />
          </Link>
        )}

        <div className="lesson-outline__course-text">
          <Link href={courseHref} className="lesson-outline__course-name">
            {courseName}
          </Link>

          {/* A form and not a checkbox with an onChange: the preference is
              saved and the page is drawn again, so there is no state to keep
              nor JavaScript to send. Where it comes back to is the lesson
              being read, which only the browser knows here. */}
          <form
            action={setOnlyPriorityLessons.bind(null, courseId, !onlyPriorityLessons)}
            className="lesson-outline__filter"
          >
            <CurrentPathField name="returnTo" />
            <button type="submit" aria-pressed={onlyPriorityLessons} className="lesson-outline__filter-button">
              <span className="lesson-outline__filter-box" aria-hidden="true">
                {onlyPriorityLessons && <CheckIcon className="lesson-outline__filter-check" />}
              </span>
              Sólo lecciones de prioridad
            </button>
          </form>
        </div>
      </div>

      {/* What scrolls when the chapter is long. The course's head stays out of
          it, because where one is should not scroll away. */}
      <div className="lesson-outline__body">
        {/* `data-sticky-head`: what `OutlineList` measures to know how much of
            the top of the list this covers. */}
        <div data-sticky-head="" className="lesson-outline__chapter">
          <Link href={chapterHref} className="lesson-outline__chapter-name">
            {chapterName}
          </Link>

          {/* How much of the chapter is done, on the ring. The arc is drawn by
              holding back part of the circle's own length. */}
          <span className="lesson-outline__gauge">
            <svg className="lesson-outline__gauge-ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle className="lesson-outline__gauge-track" cx="18" cy="18" r={GAUGE_RADIUS} />
              {percent > 0 && (
                <circle
                  className="lesson-outline__gauge-fill"
                  cx="18"
                  cy="18"
                  r={GAUGE_RADIUS}
                  style={{ strokeDasharray: GAUGE_LENGTH, strokeDashoffset: GAUGE_LENGTH * (1 - percent / 100) }}
                />
              )}
            </svg>
            <span className="lesson-outline__gauge-value">{percent}%</span>
          </span>
        </div>

        <OutlineList lessons={lessons} />
      </div>
    </nav>
  );
}
