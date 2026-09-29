import Image from "next/image";
import Link from "next/link";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { LessonSibling } from "@/services/courses/courses.types";
import "./lesson-outline.comp.css";

interface LessonOutlineProps {
  courseName: string;
  courseHref: string;
  courseThumbnail?: string;
  chapterName: string;
  chapterHref: string;
  /** The chapter's lessons, in reading order. */
  lessons: LessonSibling[];
  /** Which one is being read: the only row that is not a link. */
  currentLessonId: string;
}

/** The square image is drawn at 56px, at twice that for a dense screen. */
const THUMBNAIL_SIZES = "112px";

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
  courseName,
  courseHref,
  courseThumbnail,
  chapterName,
  chapterHref,
  lessons,
  currentLessonId,
}: LessonOutlineProps) {
  return (
    <nav className="lesson-outline" aria-label="Lecciones del capítulo">
      <Link href={courseHref} className="lesson-outline__course">
        {courseThumbnail && (
          <Image
            src={courseThumbnail}
            alt=""
            width={112}
            height={112}
            sizes={THUMBNAIL_SIZES}
            className="lesson-outline__cover"
          />
        )}
        <span className="lesson-outline__course-name">{courseName}</span>
      </Link>

      {/* What scrolls when the chapter is long. The course's head stays out of
          it, because where one is should not scroll away. */}
      <div className="lesson-outline__body">
        <Link href={chapterHref} className="lesson-outline__chapter">
          {chapterName}
        </Link>

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
