import Link from "next/link";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { ChapterLessonItem, ChapterView } from "@/services/courses/courses.types";
import { CourseStudyFrame } from "./course-study-frame.comp";
import "./chapter-study.section.css";

interface ChapterStudySectionProps {
  chapter: ChapterView;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * Where a lesson is for the student, in a word. «Siguiente» is one alone in
 * the whole course — the one «Aprender» opens — and wins over the rest: a
 * lesson left halfway that is also the next one is, above all, the next one.
 */
function statusOf(lesson: ChapterLessonItem): string {
  if (lesson.statusCode === PROGRESS_STATUS.COMPLETED) return "Aprendida";
  if (lesson.isNext) return "Siguiente";
  if (lesson.statusCode === PROGRESS_STATUS.IN_PROGRESS) return "Empezada";
  return "Pendiente";
}

/**
 * A chapter to study: what it is and how much of it is learned, and under
 * that its lessons, one card each, with how the lesson opens — its first
 * moves — so a game is recognised before opening it.
 *
 * The number of a lesson is its REAL one, with the filter on too: 01, 04, 07.
 * Renumbering would hide that lessons are missing.
 */
export function ChapterStudySection({ chapter, errorCode }: ChapterStudySectionProps) {
  const { course } = chapter;

  return (
    <CourseStudyFrame
      course={course}
      chapter={{ name: chapter.name }}
      returnTo={course.chapters.find((item) => item.id === chapter.id)?.href ?? course.studyHref}
      errorCode={errorCode}
    >
      <div className="chapter-study">
        <header className="chapter-study__summary">
          <div className="chapter-study__about">
            <div className="chapter-study__heading">
              <h2 className="chapter-study__title">{chapter.name}</h2>
              {chapter.isPriority && (
                <span className="chapter-study__tag chapter-study__tag_tone_accent">Prioridad</span>
              )}
            </div>
            {chapter.description && <p className="chapter-study__description">{chapter.description}</p>}
          </div>

          {/* A count and, once whole, a check: the bar is the course's. */}
          <p className="chapter-study__progress">
            {chapter.isCompleted && (
              <span className="chapter-study__complete" role="img" aria-label="Capítulo completo">
                <CircleCheckSolidIcon className="chapter-study__complete-icon" />
              </span>
            )}
            <span className="chapter-study__ratio">
              <span className="chapter-study__ratio-value">
                {chapter.completedLessons}/{chapter.totalLessons}
              </span>{" "}
              {chapter.totalLessons === 1 ? "lección" : "lecciones"}
            </span>
          </p>
        </header>

        {chapter.lessons.length === 0 ? (
          <p className="chapter-study__empty">
            {course.onlyPriorityLessons
              ? `Este capítulo no tiene ninguna lección marcada como prioridad. Elige «Todo» para ver las ${chapter.hiddenLessons} que tiene.`
              : "Este capítulo todavía no tiene lecciones."}
          </p>
        ) : (
          <ol className="chapter-study__lessons">
            {chapter.lessons.map((lesson) => {
              const isDone = lesson.statusCode === PROGRESS_STATUS.COMPLETED;
              const summary = lesson.preview ?? lesson.description;

              return (
                <li
                  key={lesson.id}
                  className={`chapter-study__lesson${lesson.isNext ? " chapter-study__lesson_state_next" : ""}`}
                >
                  <div className="chapter-study__lesson-head">
                    <span className="chapter-study__number">{String(lesson.order).padStart(2, "0")}</span>
                    <h3 className="chapter-study__name" title={lesson.name}>
                      {lesson.name}
                    </h3>
                    {isDone && (
                      <span className="chapter-study__done" role="img" aria-label="Aprendida">
                        <CircleCheckSolidIcon className="chapter-study__done-icon" />
                      </span>
                    )}
                    {lesson.estimatedDuration ? (
                      <span className="chapter-study__minutes">{lesson.estimatedDuration} min</span>
                    ) : null}
                  </div>

                  <div className="chapter-study__lesson-body">
                    <div className="chapter-study__lesson-text">
                      {summary && (
                        <p
                          className={`chapter-study__opening${lesson.preview ? " chapter-study__opening_kind_moves" : ""}`}
                        >
                          {summary}
                        </p>
                      )}
                      <p className="chapter-study__tags">
                        {lesson.isPriority && (
                          <span className="chapter-study__tag chapter-study__tag_tone_accent">Prioridad</span>
                        )}
                        <span className="chapter-study__tag">{statusOf(lesson)}</span>
                      </p>
                    </div>

                    <Link
                      href={lesson.href}
                      className={`chapter-study__open${lesson.isNext ? " chapter-study__open_emphasis_strong" : ""}`}
                      aria-label={`${lesson.isNext ? "Aprender" : "Ver"} «${lesson.name}»`}
                    >
                      {lesson.isNext ? "Aprender" : isDone ? "Ver ✓" : "Ver"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {(chapter.previous || chapter.next) && (
          <nav className="chapter-study__neighbours" aria-label="Capítulos vecinos">
            {chapter.previous ? (
              <Link href={chapter.previous.href} className="chapter-study__neighbour">
                <span aria-hidden="true">←</span>
                <span className="chapter-study__neighbour-name">{chapter.previous.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {chapter.next && (
              <Link href={chapter.next.href} className="chapter-study__neighbour">
                <span className="chapter-study__neighbour-name">{chapter.next.name}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </CourseStudyFrame>
  );
}
