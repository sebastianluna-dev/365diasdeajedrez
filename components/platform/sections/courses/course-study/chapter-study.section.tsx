import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { mdIconButton, mdTab, mdTabs } from "@/lib/material/material-classes";
import { formatDuration } from "@/services/courses/course-rules";
import type { ChapterLessonItem, ChapterView } from "@/services/courses/courses.types";
import { CourseSide } from "./course-side.comp";
import "./chapter-study.section.css";

/** Which of the chapter's lessons are listed, by the value `?lecciones=` carries; «Todas» carries none. */
export type ChapterLessonsView = "por-aprender" | "aprendidas" | undefined;

/** The view an address asks for; anything else is «Todas». */
export function chapterLessonsViewOf(value: string | undefined): ChapterLessonsView {
  return value === "por-aprender" || value === "aprendidas" ? value : undefined;
}

interface ChapterStudySectionProps {
  chapter: ChapterView;
  /** The tab on screen (`?lecciones=`). */
  view: ChapterLessonsView;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
}

const isLearned = (lesson: ChapterLessonItem) => lesson.statusCode === PROGRESS_STATUS.COMPLETED;

/**
 * A chapter of a course being studied, in the new design system (2026-10-22,
 * «M4» of the owner's canvas): the course's side column (`CourseSide`) with
 * this chapter lit, and a panel with a toolbar — back to the course, the
 * trail, «Capítulo N de M» and the arrows to the chapters beside it —,
 * Material's tabs («Todas», «Por aprender», «Aprendidas», with their counts),
 * the chapter's name and description, and its lessons as rows, as Gmail
 * lists mail: an icon that says where the lesson is (learned, next, still to
 * come), its name — «Siguiente» on the one «Aprender» opens —, the moves of
 * its game with how it ended, and its labels. At the foot, the chapters
 * before and after by name.
 *
 * The whole row is the link to the lesson. With only the priority lessons
 * asked for, the list is shorter, and the side column says how many it hides.
 */
export function ChapterStudySection({ chapter, view, errorCode }: ChapterStudySectionProps) {
  const { course } = chapter;
  const errorMessage = studentErrorMessage(errorCode);
  const item = course.chapters.find((one) => one.id === chapter.id);
  const href = item?.href ?? course.studyHref;
  const learned = chapter.lessons.filter(isLearned);
  const toLearn = chapter.lessons.filter((lesson) => !isLearned(lesson));
  const shown = view === "aprendidas" ? learned : view === "por-aprender" ? toLearn : chapter.lessons;

  const tabs = [
    { value: undefined, label: "Todas", count: chapter.lessons.length },
    { value: "por-aprender", label: "Por aprender", count: toLearn.length },
    { value: "aprendidas", label: "Aprendidas", count: learned.length },
  ] as const;

  return (
    <div className="platform-workspace">
      <div className="platform-workspace__side">
        <CourseSide
          course={course}
          chapter={{ id: chapter.id, name: chapter.name, completedLessons: chapter.completedLessons }}
        />
      </div>

      <section className="platform-workspace__panel chapter-study" aria-labelledby="chapter-study-name">
        <div className="chapter-study__toolbar">
          <nav className="chapter-study__trail" aria-label="Dónde estás">
            <Link href={course.studyHref} className={mdIconButton("standard", "sm")} aria-label="Volver al curso">
              <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
            </Link>
            <Link href={course.studyHref} className="chapter-study__crumb">
              {course.name}
            </Link>
            <ChevronRightIcon variant="classic-solid" className="chapter-study__crumb-step" />
            <span className="chapter-study__crumb-here" aria-current="page">
              Capítulo {chapter.order} · {chapter.name}
            </span>
          </nav>

          <nav className="chapter-study__steps" aria-label="Capítulos vecinos">
            <span className="chapter-study__position">
              Capítulo {chapter.order} de {course.chapters.length}
            </span>
            <Neighbour link={chapter.previous} direction="previous" />
            <Neighbour link={chapter.next} direction="next" />
          </nav>
        </div>

        {errorMessage && <PlatformNotice message={errorMessage} />}

        <nav className={`${mdTabs()} chapter-study__tabs`} aria-label="Lecciones">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `${href}?lecciones=${tab.value}` : href}
              className={mdTab(tab.value === view)}
              aria-current={tab.value === view ? "page" : undefined}
            >
              {tab.label}
              <span className="chapter-study__tab-count">{tab.count}</span>
            </Link>
          ))}
        </nav>

        <header className="chapter-study__head">
          <h1 id="chapter-study-name" className="chapter-study__name">
            {chapter.name}
          </h1>
          {item?.description && <p className="chapter-study__about">{item.description}</p>}
        </header>

        {shown.length === 0 ? (
          <p className="chapter-study__empty">
            {chapter.lessons.length === 0
              ? course.onlyPriorityLessons
                ? `Este capítulo no tiene ninguna lección marcada como prioridad. Elige «Todas las lecciones» para ver las ${chapter.hiddenLessons} que tiene.`
                : "Este capítulo todavía no tiene lecciones."
              : view === "aprendidas"
                ? "Todavía no aprendes ninguna lección de este capítulo."
                : "Ya aprendiste todas las lecciones de este capítulo."}
          </p>
        ) : (
          <ol className="chapter-study__lessons">
            {shown.map((lesson) => {
              const state = isLearned(lesson) ? "done" : lesson.isNext ? "next" : "later";
              return (
                <li key={lesson.id}>
                  <Link href={lesson.href} className={`chapter-study__lesson chapter-study__lesson_state_${state}`}>
                    <span className="chapter-study__status">
                      {state === "done" ? (
                        <CircleCheckIcon variant="duotone-solid" className="chapter-study__status-icon" />
                      ) : state === "next" ? (
                        <PlayIcon variant="classic-solid" className="chapter-study__status-icon" />
                      ) : (
                        <ClockIcon variant="duotone-light" className="chapter-study__status-icon" />
                      )}
                      <span className="chapter-study__status-label">
                        {state === "done" ? "Aprendida" : state === "next" ? "Siguiente" : "Por aprender"}
                      </span>
                    </span>

                    <span className="chapter-study__lesson-name">
                      {lesson.name}
                      {state === "next" && (
                        <span className="chapter-study__next" aria-hidden="true">
                          Siguiente
                        </span>
                      )}
                    </span>

                    {/* The game whole, not how it opens: it is read through here.
                        A lesson without moves is a diagram, told by its description. */}
                    <span className="chapter-study__moves">
                      {lesson.moves
                        ? `${lesson.moves}${lesson.result ? ` · ${lesson.result}` : ""}`
                        : (lesson.description ?? "")}
                    </span>

                    <span className="chapter-study__labels">
                      {lesson.isPriority && <span className="chapter-study__label">Prioritaria</span>}
                      {lesson.estimatedDuration ? (
                        <span className="chapter-study__label">{formatDuration(lesson.estimatedDuration)}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        {(chapter.previous || chapter.next) && (
          <nav className="chapter-study__pager" aria-label="Capítulos vecinos, al final de la lista">
            {chapter.previous ? (
              <Link href={chapter.previous.href} className="chapter-study__pager-link">
                <ChevronLeftIcon variant="classic-solid" className="chapter-study__pager-icon" />
                {chapter.previous.name}
              </Link>
            ) : (
              <span />
            )}
            {chapter.next && (
              <Link href={chapter.next.href} className="chapter-study__pager-link">
                {chapter.next.name}
                <ChevronRightIcon variant="classic-solid" className="chapter-study__pager-icon" />
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

/** An arrow of the toolbar to the chapter before or after, named after it; switched off at either end. */
function Neighbour({ link, direction }: { link?: { name: string; href: string }; direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon;
  const label = `${direction === "previous" ? "Capítulo anterior" : "Capítulo siguiente"}${link ? `: ${link.name}` : ""}`;
  if (!link) {
    return (
      <span className={`${mdIconButton("standard", "sm")} chapter-study__step_state_off`} aria-hidden="true">
        <Icon variant="classic-solid" className="platform-md-icon" />
      </span>
    );
  }
  return (
    <Link href={link.href} className={mdIconButton("standard", "sm")} aria-label={label}>
      <Icon variant="classic-solid" className="platform-md-icon" />
    </Link>
  );
}
