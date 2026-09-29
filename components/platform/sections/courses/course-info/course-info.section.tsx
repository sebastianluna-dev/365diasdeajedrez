import Image from "next/image";
import Link from "next/link";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { countChapters, countLessons, formatDuration } from "@/services/courses/course-rules";
import { addCourse } from "@/services/courses/courses.actions";
import type { CourseDetail, CourseLevelItem } from "@/services/courses/courses.types";
import { LevelScale } from "./level-scale.comp";
import "./course-info.section.css";

interface CourseInfoSectionProps {
  course: CourseDetail;
  /** Every level of the catalog, for the scale the course is placed on. */
  levels: CourseLevelItem[];
  /** What adding the course bounced back with, in `?error=`. */
  errorCode?: string;
}

/** The cover spans the page, which the shell caps at 1040px. */
const COVER_SIZES = "(max-width: 1040px) 100vw, 1040px";

/** What the button says of a course the student already has. */
const STUDY_LABELS = { Empezar: "Empezar curso", Continuar: "Continuar curso", Repasar: "Repasar curso" } as const;

/**
 * What a course is, for whoever has not added it: what it teaches, who it is
 * for, how long it is, what its chapters are and where its material comes
 * from. Nothing here is the student's — there is no progress on this page —
 * except the button, which adds the course or, once added, leads to it.
 *
 * The title is the cover's: the staff's covers carry the course's name drawn
 * on them, so the heading is there for whoever does not see the picture and
 * is only SHOWN when the course has none.
 */
export function CourseInfoSection({ course, levels, errorCode }: CourseInfoSectionProps) {
  const errorMessage = studentErrorMessage(errorCode);

  return (
    <section className="course-info">
      <div className="course-info__hero">
        {course.cover ? (
          <div className="course-info__cover">
            <Image src={course.cover} alt="" fill priority sizes={COVER_SIZES} className="course-info__cover-image" />
          </div>
        ) : (
          <div className="course-info__cover course-info__cover_kind_blank" aria-hidden="true">
            <span className="course-info__cover-name">{course.name}</span>
          </div>
        )}

        <div className="course-info__card">
          <div className="course-info__about">
            {course.contentTypes.length > 0 && (
              <ul className="course-info__contents">
                {course.contentTypes.map((contentType) => (
                  <li key={contentType.code} className="course-info__content" title={contentType.description}>
                    {contentType.label}
                  </li>
                ))}
              </ul>
            )}

            <h1 className="course-info__name">{course.name}</h1>
            {course.description && <p className="course-info__description">{course.description}</p>}

            {course.levels.length > 0 && (
              <div className="course-info__scale">
                <LevelScale scale={levels} levels={course.levels} />
              </div>
            )}

            {course.authors.length > 0 && (
              <p className="course-info__authors">
                {course.authors.map((author) => `${author.name} · ${author.roleLabel}`).join(" — ")}
              </p>
            )}
          </div>

          <div className="course-info__side">
            <dl className="course-info__stats">
              <div className="course-info__stat">
                <dd className="course-info__stat-value">{course.chapters.length}</dd>
                <dt className="course-info__stat-label">{course.chapters.length === 1 ? "capítulo" : "capítulos"}</dt>
              </div>
              <div className="course-info__stat">
                <dd className="course-info__stat-value">{course.lessonCount}</dd>
                <dt className="course-info__stat-label">{course.lessonCount === 1 ? "lección" : "lecciones"}</dt>
              </div>
              {course.totalMinutes > 0 && (
                <div className="course-info__stat">
                  <dd className="course-info__stat-value">{formatDuration(course.totalMinutes)}</dd>
                  <dt className="course-info__stat-label">en total</dt>
                </div>
              )}
            </dl>

            {errorMessage && <PlatformNotice message={errorMessage} />}

            {course.isAdded ? (
              <Link href={course.studyHref} className="course-info__cta">
                {STUDY_LABELS[course.ctaLabel]}
              </Link>
            ) : (
              <form action={addCourse.bind(null, course.id)} className="course-info__add">
                <SubmitButton className="course-info__cta" pendingLabel="Agregando…">
                  Agregar a mis cursos
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>

      {course.chapters.length > 0 && (
        <section className="course-info__chapters" aria-labelledby="course-info-chapters">
          <header className="course-info__section-head">
            <h2 id="course-info-chapters" className="course-info__section-title">
              Capítulos
            </h2>
            <p className="course-info__section-note">
              {countChapters(course.chapters.length)} · {countLessons(course.lessonCount)}
            </p>
          </header>

          <ol className="course-info__chapter-list">
            {course.chapters.map((chapter) => (
              <li key={chapter.id} className="course-info__chapter">
                <div className="course-info__chapter-head">
                  <h3 className="course-info__chapter-title">{chapter.name}</h3>
                  {chapter.isPriority && <span className="course-info__chapter-tag">Prioridad</span>}
                </div>

                {chapter.description && <p className="course-info__chapter-text">{chapter.description}</p>}

                <p className="course-info__chapter-foot">
                  {countLessons(chapter.lessonCount)}
                  {chapter.durationMin ? ` · ${chapter.durationMin} min` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Where the material comes from, when the staff recorded it: one line
          per source, the title linked to the resource when there is a URL.
          The staff's notes never reach here. */}
      {course.sources.length > 0 && (
        <section className="course-info__sources" aria-labelledby="course-info-sources">
          <h2 id="course-info-sources" className="course-info__sources-title">
            Procedencia
          </h2>

          <ul className="course-info__source-list">
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
                    className="course-info__source-link"
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
                <li key={source.id} className="course-info__source">
                  <strong className="course-info__source-type">{source.typeLabel}</strong>
                  {facts.map((fact, index) => (
                    <span key={index}> · {fact}</span>
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
