import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import type { CourseDetail } from "@/services/courses/courses.types";
import { LearnMode } from "./learn-mode.comp";
import { ResetProgress } from "./reset-progress.comp";
import "./course-study-frame.comp.css";

interface CourseStudyFrameProps {
  course: CourseDetail;
  /**
   * The chapter the page is of, to say so under the course's name. Absent on
   * the course's own page, which is the list of its chapters.
   */
  chapter?: { order: number; name: string };
  /** The page being drawn, where a failed setting is reported. */
  returnTo: string;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
  /** The page's own column: the chapters, or the lessons of one. */
  children: ReactNode;
}

/** The cover is a thumbnail here: 280px wide, and the full width on a phone. */
const COVER_SIZES = "(max-width: 620px) 100vw, 280px";

/**
 * What is around every page of a course being studied: above, the course
 * with its two buttons — «Aprender», the next lesson, and «Repasar», the
 * exercises of what was already learned —; on the right, the student's
 * progress, the course's options and its one setting. The page puts its
 * column in the middle.
 *
 * A button is only drawn when it leads somewhere: a course with every lesson
 * learned has no «Aprender», and one without exercises learned no «Repasar».
 */
export function CourseStudyFrame({ course, chapter, returnTo, errorCode, children }: CourseStudyFrameProps) {
  const errorMessage = studentErrorMessage(errorCode);
  const { progress } = course;
  const hasProgress = progress.completedLessons > 0 || course.ctaLabel !== "Empezar";

  return (
    <div className="course-study-frame">
      <header className="course-study-frame__head">
        <div className="course-study-frame__cover">
          {course.cover && (
            <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="course-study-frame__cover-image" />
          )}
        </div>

        <div className="course-study-frame__heading">
          <h1 className="course-study-frame__name">{course.name}</h1>

          {chapter ? (
            <p className="course-study-frame__place">
              <Link href={course.studyHref} className="course-study-frame__place-link">
                Capítulos
              </Link>
              <span aria-hidden="true">›</span>
              <span className="course-study-frame__place-here">
                {chapter.order}. {chapter.name}
              </span>
            </p>
          ) : (
            <p className="course-study-frame__place course-study-frame__place_kind_home">Capítulos</p>
          )}
        </div>

        {(course.learnHref || course.reviewCount > 0) && (
          <div className="course-study-frame__actions">
            {course.learnHref && (
              <Link href={course.learnHref} className="course-study-frame__learn">
                Aprender
              </Link>
            )}
            {course.reviewCount > 0 && (
              <Link href={course.reviewHref} className="course-study-frame__review">
                Repasar
                <span
                  className="course-study-frame__review-count"
                  aria-label={`${course.reviewCount} ${course.reviewCount === 1 ? "ejercicio" : "ejercicios"}`}
                >
                  {course.reviewCount}
                </span>
              </Link>
            )}
          </div>
        )}
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="course-study-frame__layout">
        <div className="course-study-frame__main">{children}</div>

        <aside className="course-study-frame__aside">
          <section className="course-study-frame__card course-study-frame__card_kind_progress">
            <p className="course-study-frame__progress-head">
              <span className="course-study-frame__card-title">Tu progreso</span>
              <span className="course-study-frame__progress-ratio">
                {progress.completedLessons}/{progress.totalLessons}
              </span>
            </p>
            <p className="course-study-frame__percent">{progress.percent}%</p>
            <div className="course-study-frame__track">
              <div className="course-study-frame__fill" style={{ width: `${progress.percent}%` }} />
            </div>
          </section>

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
              {/* Only when there is something to erase. */}
              {hasProgress && (
                <li>
                  <ResetProgress
                    courseId={course.id}
                    courseName={course.name}
                    completedLessons={progress.completedLessons}
                  />
                </li>
              )}
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
