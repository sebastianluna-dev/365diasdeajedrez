import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { platformRoutes } from "@/lib/platform-routes";
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
  chapter?: { name: string };
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
 * What is around every page of a course being studied: on top, the way back
 * one step — from the chapters to «Mis cursos», from a chapter to the
 * chapters —; under it, the course with its two buttons — «Aprender», the
 * next lesson, and «Repasar», the exercises of what was already learned —; on
 * the right, the course's options and its one setting. The page puts its
 * column in the middle.
 *
 * The course's progress is on a chapter's page only. The page that lists the
 * chapters says how far each one is, and that is the progress it shows.
 *
 * A button is only drawn when it leads somewhere: a course without lessons
 * has no «Aprender», and one without exercises learned no «Repasar». A
 * finished course keeps its «Aprender», which starts it over.
 * While the Move Trainer is off (`MOVE_TRAINER_ENABLED`) no course has
 * anything to review — the service counts none —, so «Repasar» is not drawn.
 */
export function CourseStudyFrame({ course, chapter, returnTo, errorCode, children }: CourseStudyFrameProps) {
  const errorMessage = studentErrorMessage(errorCode);
  const { progress } = course;
  const hasProgress = progress.completedLessons > 0 || course.ctaLabel !== "Empezar";

  return (
    <div className="course-study-frame">
      <Link href={chapter ? course.studyHref : platformRoutes.courses} className="course-study-frame__back">
        <ArrowLeftIcon className="course-study-frame__back-icon" />
        {chapter ? "Capítulos" : "Mis cursos"}
      </Link>

      <header className="course-study-frame__head">
        <div className="course-study-frame__cover">
          {course.thumbnail && (
            <Image src={course.thumbnail} alt="" fill sizes={COVER_SIZES} className="course-study-frame__cover-image" />
          )}
        </div>

        <div className="course-study-frame__heading">
          <h1 className="course-study-frame__name">{course.name}</h1>

          <p className="course-study-frame__place">{chapter ? chapter.name : "Capítulos"}</p>
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
          {chapter && (
            <section className="course-study-frame__card course-study-frame__card_kind_progress">
              <p className="course-study-frame__progress-head">
                <span className="course-study-frame__card-title">Tu progreso</span>
                <span className="course-study-frame__progress-ratio">
                  {progress.completedLessons}/{progress.totalLessons}
                </span>
              </p>
              <p className="course-study-frame__percent">
                {progress.percent}%
                {course.isCompleted && (
                  <span className="course-study-frame__done" role="img" aria-label="Curso completo">
                    <CircleCheckSolidIcon className="course-study-frame__done-icon" />
                  </span>
                )}
              </p>
              <div className="course-study-frame__track">
                <div className="course-study-frame__fill" style={{ width: `${progress.percent}%` }} />
              </div>
            </section>
          )}

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
