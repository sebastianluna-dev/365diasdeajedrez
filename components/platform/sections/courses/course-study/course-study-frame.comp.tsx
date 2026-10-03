import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CaretRightIcon } from "@/components/icons/caret-right-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import type { CourseDetail } from "@/services/courses/courses.types";
import { LearnMode } from "./learn-mode.comp";
import { RemoveCourse } from "./remove-course.comp";
import { ResetProgress } from "./reset-progress.comp";
import "./course-study-frame.comp.css";

interface CourseStudyFrameProps {
  course: CourseDetail;
  /**
   * The chapter the page is of, to say so under the course's name and to offer
   * erasing its progress. Absent on the course's own page, which is the list of
   * its chapters.
   */
  chapter?: { id: string; name: string; completedLessons: number };
  /** The page being drawn, where a failed setting is reported. */
  returnTo: string;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
  /** The page's own column: the chapters, or the lessons of one. */
  children: ReactNode;
}

/** The square image at the head, at the size the row of «Mis cursos» draws it. */
const COVER_SIZES = "96px";

/**
 * What is around every page of a course being studied: on top, the course
 * with its two buttons — «Aprender», the next lesson, and «Repasar», the
 * exercises of what was already learned whose review is due today —; on the
 * right, the course's options and its one setting. The page puts its column
 * in the middle.
 *
 * No figure of the course is drawn here: what a chapter's card says is how
 * far that chapter is, and the course's own progress is read in «Mis
 * cursos», where a course is chosen.
 *
 * Nothing here goes back: the menu leads to «Mis cursos» and the browser
 * does the rest.
 *
 * A button is only drawn when it leads somewhere: a course without lessons
 * has no «Aprender», and one without exercises learned no «Repasar». The
 * exception is a course with exercises learned and none due today: its
 * «Repasar» stays, switched off, and says «Al día», so the student reads
 * that the review is done rather than wondering where it went. A finished
 * course keeps its «Aprender», which starts it over.
 * While the Move Trainer is off (`MOVE_TRAINER_ENABLED`) no course has
 * anything to review — the service counts none and is never up to date —,
 * so «Repasar» is not drawn.
 */
export function CourseStudyFrame({ course, chapter, returnTo, errorCode, children }: CourseStudyFrameProps) {
  const errorMessage = studentErrorMessage(errorCode);
  const { progress } = course;
  const hasProgress = progress.completedLessons > 0 || course.ctaLabel !== "Empezar";

  return (
    <div className="course-study-frame">
      <header className="course-study-frame__head">
        <div className="course-study-frame__cover">
          {course.thumbnail && (
            <Image src={course.thumbnail} alt="" fill sizes={COVER_SIZES} className="course-study-frame__cover-image" />
          )}
        </div>

        <div className="course-study-frame__heading">
          <h1 className="course-study-frame__name">{course.name}</h1>

          {/* Where one is in the course, as a trail: «Capítulos» and, on a
              chapter's page, the chapter. On a chapter's page the first half
              leads back to the list; on the list itself it is the page one is
              already on, so it is only read. */}
          <p className="course-study-frame__place">
            {chapter ? (
              <>
                <Link href={course.studyHref} className="course-study-frame__place-link">
                  Capítulos
                </Link>
                <CaretRightIcon className="course-study-frame__place-step" />
                {chapter.name}
              </>
            ) : (
              "Capítulos"
            )}
          </p>
        </div>

        {(course.learnHref || course.reviewCount > 0 || course.isReviewUpToDate) && (
          <div className="course-study-frame__actions">
            {course.learnHref && (
              <Link
                href={course.learnHref}
                className="platform-button platform-button_variant_accent course-study-frame__learn"
              >
                Aprender
              </Link>
            )}
            {course.reviewCount > 0 ? (
              <Link href={course.reviewHref} className="course-study-frame__review">
                Repasar
                <span
                  className="course-study-frame__review-count"
                  aria-label={`${course.reviewCount} ${course.reviewCount === 1 ? "ejercicio" : "ejercicios"}`}
                >
                  {course.reviewCount}
                </span>
              </Link>
            ) : (
              course.isReviewUpToDate && (
                <span className="course-study-frame__review course-study-frame__review_state_off" aria-disabled="true">
                  Repasar
                  <span className="course-study-frame__review-status">Al día</span>
                </span>
              )
            )}
          </div>
        )}
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="course-study-frame__layout">
        <div className="course-study-frame__main">{children}</div>

        <aside className="course-study-frame__aside">
          <section className="course-study-frame__card">
            <h2 className="course-study-frame__card-title course-study-frame__card-title_kind_head">
              Opciones del curso
            </h2>
            <ul className="course-study-frame__options">
              <li>
                <Link href={course.infoHref} className="course-study-frame__option">
                  Información del curso
                </Link>
              </li>
              {/* Only when there is something to erase. On a chapter's page the
                  two scopes are offered, the narrow one first: it is the page's
                  own, and the course's is the bigger step. */}
              {chapter && chapter.completedLessons > 0 && (
                <li>
                  <ResetProgress
                    courseId={course.id}
                    chapterId={chapter.id}
                    name={chapter.name}
                    completedLessons={chapter.completedLessons}
                  />
                </li>
              )}
              {hasProgress && (
                <li>
                  <ResetProgress courseId={course.id} name={course.name} completedLessons={progress.completedLessons} />
                </li>
              )}
              {/* Last, and on both pages: it is the heaviest of the three. */}
              <li>
                <RemoveCourse
                  courseId={course.id}
                  courseName={course.name}
                  completedLessons={progress.completedLessons}
                />
              </li>
            </ul>
          </section>

          <section className="course-study-frame__card">
            <h2 className="course-study-frame__card-title course-study-frame__card-title_kind_head">Configuración</h2>
            <div className="course-study-frame__setting">
              <LearnMode
                courseId={course.id}
                onlyPriority={course.onlyPriorityLessons}
                hiddenLessons={course.hiddenLessons}
                returnTo={returnTo}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
