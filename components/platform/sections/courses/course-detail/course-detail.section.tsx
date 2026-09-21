import { PriorityFilter } from "@/components/platform/shared/priority-filter.comp";
import Image from "next/image";
import Link from "next/link";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseDetail } from "@/services/courses/courses.types";
import { ChapterList } from "./chapter-list.comp";
import "./course-detail.section.css";

interface CourseDetailSectionProps {
  course: CourseDetail;
  /** What the essential-lessons switch bounced back with, in `?error=`. */
  errorCode?: string;
}

/** The cover takes a fixed 470px column, and the full width when stacked. */
const COVER_SIZES = "(max-width: 980px) 100vw, 470px";

export function CourseDetailSection({ course, errorCode }: CourseDetailSectionProps) {
  const chapterCount = course.chapters.length;
  const errorMessage = studentErrorMessage(errorCode);
  const { totalLessons } = course.progress;

  return (
    <section className="course-detail">
      <div className="course-detail__hero">
        <div className="course-detail__intro">
          <div className="course-detail__tags">
            <span className="platform-tag platform-tag_variant_accent">{course.typeLabel}</span>
            {course.levelLabels.map((level) => (
              <span key={level} className="platform-tag">
                {level}
              </span>
            ))}
          </div>

          <h1 className="course-detail__name">{course.name}</h1>
          {course.description && <p className="course-detail__description">{course.description}</p>}

          {course.authors.length > 0 && (
            <p className="course-detail__authors">
              {course.authors.map((author, index) => (
                <span key={`${author.name}-${author.roleLabel}`}>
                  {index > 0 && <span className="course-detail__dot"> · </span>}
                  {author.name}
                  <span className="course-detail__dot"> · </span>
                  {author.roleLabel}
                </span>
              ))}
            </p>
          )}

          <div className="course-detail__resume">
            <div className="course-detail__progress">
              <ProgressIndicator
                layout="stacked"
                percent={course.progress.percent}
                detail={`${course.progress.completedLessons} de ${totalLessons} lecciones completadas`}
              />
            </div>

            <Link href={course.continueHref} className="platform-button course-detail__cta">
              {course.ctaLabel} curso
            </Link>
          </div>
        </div>

        {/* The cover and, hanging from it, the filter: it rests on the foot of the
            column to land at the height of the progress bar next to it. */}
        <div className="course-detail__aside">
          {/* Same destination as "Continuar curso", which already names it: out of
              the tab order so the same link is not announced twice. */}
          <Link href={course.continueHref} className="course-detail__cover" tabIndex={-1} aria-hidden="true">
            {course.cover && (
              <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="course-detail__cover-image" />
            )}
          </Link>

          <div className="course-detail__filter">
            {errorMessage && <PlatformNotice message={errorMessage} />}
            <PriorityFilter
              courseId={course.id}
              enabled={course.onlyPriorityLessons}
              hiddenLessons={course.hiddenLessons}
              returnTo={platformRoutes.courseDetail(course.id)}
            />

            {course.onlyPriorityLessons && totalLessons === 0 && (
              <p className="course-detail__warning">
                Ninguna lección de este curso está marcada como imprescindible. Quita el filtro para verlas todas.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="course-detail__chapters">
        <header className="course-detail__chapters-head">
          <h2 className="course-detail__chapters-title">Capítulos</h2>
          <p className="course-detail__chapters-count">
            {chapterCount} {chapterCount === 1 ? "capítulo" : "capítulos"}
            <span className="course-detail__dot"> · </span>
            {totalLessons} {totalLessons === 1 ? "lección" : "lecciones"}
          </p>
        </header>

        <ChapterList chapters={course.chapters} />
      </div>
    </section>
  );
}
