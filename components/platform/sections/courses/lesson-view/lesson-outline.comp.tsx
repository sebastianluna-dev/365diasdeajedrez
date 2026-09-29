import Image from "next/image";
import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import type { LessonSibling } from "@/services/courses/courses.types";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  courseId: string;
  courseName: string;
  courseHref: string;
  courseThumbnail?: string;
  /** The student asked to see only the priority lines of this course. */
  onlyPriority: boolean;
  /** Where the filter's form comes back to: the lesson being read. */
  returnTo: string;
  chapterName: string;
  chapterHref: string;
  /** The chapter's lessons, in reading order. */
  lessons: LessonSibling[];
  /** Which one is being read: the only row that is not a link. */
  currentLessonId: string;
}

/** The square image is drawn at 72px, at twice that for a dense screen. */
const THUMBNAIL_SIZES = "144px";

/** The gauge is drawn on a 36-unit box; the ring's radius leaves room for its stroke. */
const GAUGE_RADIUS = 15;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS;

/**
 * Every lesson carries its stop on the thread: the filled check once it is
 * done, an empty ring while it is not. The ring is drawn by the stylesheet,
 * since it is a circle and not a drawing.
 */
function mark(isCompleted: boolean) {
  return isCompleted ? (
    <CircleCheckSolidIcon className="lesson-outline__done" />
  ) : (
    <span className="lesson-outline__pending" aria-hidden="true" />
  );
}

/**
 * Where the lesson stands: the course, the chapter and its lessons, with the
 * one open marked. It is the chapter's page condensed into a column, so
 * moving to the next lesson does not mean going back twice.
 */
export function LessonOutline({
  courseId,
  courseName,
  courseHref,
  courseThumbnail,
  onlyPriority,
  returnTo,
  chapterName,
  chapterHref,
  lessons,
  currentLessonId,
}: LessonOutlineProps) {
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
              nor JavaScript to send. */}
          <form action={setOnlyPriorityLessons.bind(null, courseId, !onlyPriority)} className="lesson-outline__filter">
            <input type="hidden" name="returnTo" value={returnTo} />
            <button type="submit" aria-pressed={onlyPriority} className="lesson-outline__filter-button">
              <span className="lesson-outline__filter-box" aria-hidden="true">
                {onlyPriority && <CheckIcon className="lesson-outline__filter-check" />}
              </span>
              Sólo lecciones de prioridad
            </button>
          </form>
        </div>
      </div>

      {/* What scrolls when the chapter is long. The course's head stays out of
          it, because where one is should not scroll away. */}
      <div className="lesson-outline__body">
        <div className="lesson-outline__chapter">
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

        <ol className="lesson-outline__list">
          {lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

            return (
              <li key={lesson.id} className="lesson-outline__item">
                {/* The lesson being read is not a link: it leads where one already
                  is, and `aria-current` is what says so to a screen reader. */}
                {isCurrent ? (
                  <span className="lesson-outline__lesson lesson-outline__lesson_state_current" aria-current="page">
                    <span className="lesson-outline__name">{lesson.name}</span>
                    {mark(isCompleted)}
                  </span>
                ) : (
                  <Link href={lesson.href} className="lesson-outline__lesson">
                    <span className="lesson-outline__name">{lesson.name}</span>
                    {mark(isCompleted)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
