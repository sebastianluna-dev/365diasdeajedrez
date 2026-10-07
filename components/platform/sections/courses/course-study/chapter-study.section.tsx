import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { ChapterView } from "@/services/courses/courses.types";
import { CourseStudyFrame } from "./course-study-frame.comp";
import "./chapter-study.section.css";

interface ChapterStudySectionProps {
  chapter: ChapterView;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * The lessons of a chapter, one card each: the name on a band, the moves of
 * its game from the first to the last with how it ended, and at the foot its
 * tags and the button that opens it.
 *
 * The chapter itself is not repeated here — its name is already at the head
 * of the page, in the frame —, and neither it nor a lesson says a figure: no
 * page of the course draws one (how far a chapter is, is the count on its
 * card), and what a lesson is worth is read by opening it.
 *
 * The button is the same on every card, quiet: outlined in grey, with no
 * fill. The next lesson to learn is told by its band and its «Siguiente»,
 * and «Aprender», the filled button, is the course's, at the head of the page.
 *
 * A lesson is not numbered: it is its name. With the filter on the list is
 * shorter, and it is the frame's setting that says how many it hides.
 */
export function ChapterStudySection({ chapter, errorCode }: ChapterStudySectionProps) {
  const { course } = chapter;

  return (
    <CourseStudyFrame
      course={course}
      chapter={{ id: chapter.id, name: chapter.name, completedLessons: chapter.completedLessons }}
      returnTo={course.chapters.find((item) => item.id === chapter.id)?.href ?? course.studyHref}
      errorCode={errorCode}
    >
      <div className="chapter-study">
        {/* Before the list too, so a long chapter can be left without going
            down to its last lesson (2026-10-07). Not over the empty notice:
            there the two would sit one right above the other. */}
        {chapter.lessons.length > 0 && <Neighbours chapter={chapter} label="Capítulos vecinos, antes de la lista" />}

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

              return (
                <li
                  key={lesson.id}
                  className={`chapter-study__lesson${lesson.isNext ? " chapter-study__lesson_state_next" : ""}`}
                >
                  <div className="chapter-study__lesson-head">
                    <h3 className="chapter-study__name" title={lesson.name}>
                      {lesson.name}
                    </h3>
                    {isDone && (
                      <span className="chapter-study__done" role="img" aria-label="Aprendida">
                        <CircleCheckIcon variant="duotone-solid" className="chapter-study__done-icon" />
                      </span>
                    )}
                  </div>

                  <div className="chapter-study__lesson-body">
                    {/* The game whole, not how it opens: it is read through here. A
                        lesson without moves is a diagram, told by its description. */}
                    {lesson.moves ? (
                      <p className="chapter-study__moves">
                        {lesson.moves}
                        {lesson.result && <span className="chapter-study__result"> {lesson.result}</span>}
                      </p>
                    ) : (
                      lesson.description && <p className="chapter-study__description-text">{lesson.description}</p>
                    )}

                    {/* Only the staff's mark, right under what it is about, and
                        not beside the button: where the lesson is for the student
                        is told by its check and by the band of the one that comes
                        next, not by a word. */}
                    {lesson.isPriority && (
                      <p className="chapter-study__tags">
                        <span className="chapter-study__tag chapter-study__tag_tone_accent">Prioridad</span>
                      </p>
                    )}

                    <div className="chapter-study__lesson-foot">
                      <Link href={lesson.href} className="chapter-study__open" aria-label={`Ver «${lesson.name}»`}>
                        Ver
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <Neighbours chapter={chapter} label="Capítulos vecinos, al final de la lista" />
      </div>
    </CourseStudyFrame>
  );
}

/**
 * The chapters before and after this one, each a button named after where it
 * leads. Drawn before and after the list of lessons: each `<nav>` carries a
 * name of its own, since two landmarks of one name cannot be told apart.
 */
function Neighbours({ chapter, label }: { chapter: ChapterView; label: string }) {
  if (!chapter.previous && !chapter.next) return null;

  return (
    <nav className="chapter-study__neighbours" aria-label={label}>
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
  );
}
