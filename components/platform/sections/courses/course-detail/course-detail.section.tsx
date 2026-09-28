import { PriorityFilter } from "@/components/platform/shared/priority-filter.comp";
import Image from "next/image";
import Link from "next/link";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator.comp";
import { ELO_DISCLAIMER } from "@/constants/platform/course-levels.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseDetail } from "@/services/courses/courses.types";
import { labelEloRange } from "@/services/courses/level-rules";
import { ChapterList } from "./chapter-list.comp";
import "./course-detail.section.css";

interface CourseDetailSectionProps {
  course: CourseDetail;
  /** What the essential-lessons switch bounced back with, in `?error=`. */
  errorCode?: string;
}

/** The block the level tags of the hero lead to. */
const AUDIENCE_ID = "course-detail-audience";

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
            {/* What it teaches, by the long names, each with what it covers on hover. */}
            {course.contentTypes.map((contentType) => (
              <span
                key={contentType.code}
                className="platform-tag platform-tag_variant_accent"
                title={contentType.description}
              >
                {contentType.label}
              </span>
            ))}
            {/* Who it is aimed at, with the orientative range; the tag leads to
                the block that explains it, further down. */}
            {course.levels.map((level) => (
              <a
                key={level.slug}
                href={`#${AUDIENCE_ID}`}
                className="platform-tag course-detail__level-tag"
                title={level.description}
              >
                {level.name} · {level.eloRange}
              </a>
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

      {/* Who the course is aimed at: its levels in order of difficulty, each
          with its orientative Elo range. It informs whoever is choosing; it
          closes the course to nobody. */}
      {course.levels.length > 0 && (
        <section id={AUDIENCE_ID} className="course-detail__audience" aria-labelledby="course-detail-audience-title">
          <h2 id="course-detail-audience-title" className="course-detail__audience-title">
            A quién va dirigido
          </h2>

          <ul className="course-detail__levels">
            {course.levels.map((level) => (
              <li key={level.slug} className="course-detail__level">
                <span className="course-detail__level-name">{level.name}</span>
                <span className="course-detail__level-range">{labelEloRange(level.eloRange)}</span>
                <span className="course-detail__level-description">{level.description}</span>
              </li>
            ))}
          </ul>

          <p className="course-detail__audience-note">{ELO_DISCLAIMER}.</p>
        </section>
      )}

      {/* Where the material comes from, when the staff recorded it: one line
          per source, the title linked to the resource when there is a URL.
          The staff's notes never reach here. */}
      {course.sources.length > 0 && (
        <section className="course-detail__sources" aria-labelledby="course-detail-sources-title">
          <h2 id="course-detail-sources-title" className="course-detail__sources-title">
            Procedencia
          </h2>
          <ul className="course-detail__source-list">
            {course.sources.map((source) => {
              const edition = [source.publicationYear, source.edition].filter(Boolean).join(", ");
              const title = source.originalTitle && <em>{source.originalTitle}</em>;
              const facts = [
                source.url ? (
                  <a
                    key="title"
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="course-detail__source-link"
                  >
                    {title || "Ver recurso"}
                  </a>
                ) : (
                  title && <span key="title">{title}</span>
                ),
                source.authors,
                edition || undefined,
                source.specificReference,
              ].filter(Boolean);
              return (
                <li key={source.id} className="course-detail__source">
                  <span className="course-detail__source-type">{source.typeLabel}</span>
                  {facts.map((fact, index) => (
                    <span key={index}>
                      <span className="course-detail__dot"> · </span>
                      {fact}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
