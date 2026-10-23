import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ArrowRotateLeftIcon } from "@/components/icons/arrow-rotate-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSettingsToggle } from "@/components/platform/shared/platform-settings-toggle/platform-settings-toggle.comp";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { mdButton, mdCard, mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { countLessons } from "@/services/courses/course-rules";
import type { CourseChapterItem, CourseDetail } from "@/services/courses/courses.types";
import { levelSpan } from "../course-card.comp";
import { WavyProgress } from "../my-courses/wavy-progress.comp";
import { CourseSettings } from "./course-settings.comp";
import { CourseSide } from "./course-side.comp";
import "./course-study.section.css";

interface CourseStudySectionProps {
  course: CourseDetail;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
}

/** Where a chapter is for the student: what its card says, and what its action reads. */
type ChapterState = "done" | "next" | "begun" | "later";

const STATE_LABEL: Record<ChapterState, string> = {
  done: "Aprendido",
  next: "Siguiente",
  begun: "En curso",
  later: "Por empezar",
};

const STATE_ACTION: Record<ChapterState, string> = {
  done: "Repasar",
  next: "Seguir",
  begun: "Seguir",
  later: "Empezar",
};

/**
 * Each chapter's state: learned, the next one — the first not learned, which
 * is where «Aprender» leads —, begun, or still to start.
 */
function chapterStates(chapters: CourseChapterItem[]): Map<string, ChapterState> {
  const next = chapters.find((chapter) => !chapter.isCompleted && chapter.totalLessons > 0);
  return new Map(
    chapters.map((chapter) => [
      chapter.id,
      chapter.isCompleted
        ? "done"
        : chapter.id === next?.id
          ? "next"
          : chapter.completedLessons > 0
            ? "begun"
            : "later",
    ]),
  );
}

/**
 * The course to study, in the new design system (2026-10-22, «M4» of the
 * owner's canvas): a workspace whose side column is the course's
 * (`CourseSide`: «Aprender» and its chapters) and whose panel
 * holds, under a toolbar back to «Tus cursos», the course — its picture, its
 * name, who wrote it and what it is about, how far it is, «Aprender» and
 * «Repasar» — and its chapters as cards: their number and state, their
 * name and description, how far each is and what pressing it does.
 *
 * A chapter's count is of the lessons the student SEES: with only the
 * priority ones asked for, it is over those, which is the list that opens
 * when the card is pressed. «Repasar» is the Move Trainer's: drawn only while
 * it is on, and switched off as «Al día» when nothing is due.
 */
export function CourseStudySection({ course, errorCode }: CourseStudySectionProps) {
  const errorMessage = studentErrorMessage(errorCode);
  const { progress } = course;
  const image = course.cover ?? course.thumbnail;
  const states = chapterStates(course.chapters);
  const about = [
    course.authors.map((author) => author.name).join(", "),
    levelSpan(course.levels),
    ...course.contentTypes.map((contentType) => contentType.shortLabel),
    course.chapters.length === 1 ? "1 capítulo" : `${course.chapters.length} capítulos`,
  ]
    .filter(Boolean)
    .join(" · ");
  const exercises = course.reviewCount === 1 ? "ejercicio" : "ejercicios";

  return (
    <div className="platform-workspace">
      {/* The gear in the bar, which opens the course's settings at the right. */}
      <PlatformHeaderContext>
        <PlatformSettingsToggle />
      </PlatformHeaderContext>
      <div className="platform-workspace__side">
        <CourseSide course={course} />
      </div>

      <section className="platform-workspace__panel course-study" aria-labelledby="course-study-name">
        <nav className="course-study__toolbar" aria-label="Dónde estás">
          <Link
            href={platformRoutes.courses}
            className={mdIconButton("standard", "sm")}
            aria-label="Volver a tus cursos"
          >
            <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
          </Link>
          <Link href={platformRoutes.courses} className="course-study__crumb">
            Tus cursos
          </Link>
          <ChevronRightIcon variant="classic-solid" className="course-study__crumb-step" />
          <span className="course-study__crumb-here" aria-current="page">
            {course.name}
          </span>
        </nav>

        {errorMessage && <PlatformNotice message={errorMessage} />}

        <header className="course-study__hero">
          <div className="course-study__cover">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 280px"
                className="course-study__cover-image"
              />
            )}
          </div>

          <div className="course-study__heading">
            <h1 id="course-study-name" className="course-study__name">
              {course.name}
            </h1>
            {about && <p className="course-study__about">{about}</p>}

            {progress.totalLessons > 0 && (
              <div className="course-study__meter">
                <WavyProgress percent={progress.percent} isDone={course.isCompleted} size="lg" />
                <span className="course-study__percent">{progress.percent} %</span>
              </div>
            )}

            {(course.learnHref || course.reviewCount > 0 || course.isReviewUpToDate) && (
              <div className="course-study__actions">
                {course.learnHref && (
                  <Link href={course.learnHref} className={mdButton("filled", "md")}>
                    <PlayIcon variant="classic-solid" className="platform-md-icon" />
                    {course.ctaLabel}
                  </Link>
                )}
                {course.reviewCount > 0 ? (
                  <Link
                    href={course.reviewHref}
                    className={mdButton("outlined", "md")}
                    aria-label={`Repasar ${course.reviewCount} ${exercises}`}
                  >
                    <ArrowRotateLeftIcon variant="classic-solid" className="platform-md-icon" />
                    Repasar {course.reviewCount}
                  </Link>
                ) : (
                  course.isReviewUpToDate && (
                    <button type="button" className={mdButton("outlined", "md")} disabled>
                      Repasar · Al día
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </header>

        {course.chapters.length === 0 ? (
          <EmptyState
            title="Este curso todavía no tiene capítulos"
            description="Vuelve cuando la academia los publique."
          />
        ) : (
          <div className="course-study__list">
            <div className="course-study__list-head">
              <h2 className="course-study__list-title">Capítulos</h2>
              <p className="course-study__count">
                {progress.completedLessons} de {countLessons(progress.totalLessons)} aprendidas
              </p>
            </div>

            <ol className="course-study__chapters">
              {course.chapters.map((chapter) => {
                const state = states.get(chapter.id) ?? "later";
                return (
                  <li key={chapter.id} className="course-study__item">
                    <Link
                      href={chapter.href}
                      className={`${mdCard("outlined")} course-study__chapter course-study__chapter_state_${state}`}
                    >
                      <span className="course-study__chapter-head">
                        <span className="course-study__eyebrow">Capítulo {chapter.order}</span>
                        {chapter.isPriority && <span className="course-study__tag">Prioridad</span>}
                        <span className={`course-study__state course-study__state_${state}`}>{STATE_LABEL[state]}</span>
                      </span>
                      <span className="course-study__chapter-name">{chapter.name}</span>
                      {chapter.description && (
                        <span className="course-study__chapter-about">{chapter.description}</span>
                      )}
                      <span className="course-study__chapter-meter">
                        <WavyProgress
                          percent={
                            chapter.totalLessons === 0
                              ? 0
                              : Math.round((chapter.completedLessons / chapter.totalLessons) * 100)
                          }
                          isDone={chapter.isCompleted}
                        />
                      </span>
                      <span className="course-study__chapter-foot">
                        <span>
                          {chapter.completedLessons} de {countLessons(chapter.totalLessons)}
                        </span>
                        <span className="course-study__chapter-action">
                          {STATE_ACTION[state]}
                          <ChevronRightIcon variant="classic-solid" className="course-study__chapter-chevron" />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      <CourseSettings course={course} />
    </div>
  );
}
