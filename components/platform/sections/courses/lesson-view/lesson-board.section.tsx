import Link from "next/link";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { mdIconButton } from "@/lib/material/material-classes";
import { completeLesson } from "@/services/courses/courses.actions";
import type { LessonView } from "@/services/courses/courses.types";
import type { LessonPractice } from "@/services/exercises/lesson-practice.types";
import { LessonPracticeList } from "./lesson-practice-list.comp";
import { LessonTracker } from "./lesson-tracker.comp";

interface LessonBoardSectionProps {
  lesson: LessonView;
  /** What `completeLesson` bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * The lesson itself: the board and what is said about the position, and,
 * at the foot of the panel, its exercises («Ahora practica», D25). A lesson with no
 * game and exercises to solve shows their list where the board would be.
 * Where it falls in the course is the column's, which belongs to the
 * chapter's layout and outlives this — so this is what a move to another
 * lesson fetches, and the PGN is its weight.
 */
export function LessonBoardSection({ lesson, errorCode }: LessonBoardSectionProps) {
  const errorMessage = studentErrorMessage(errorCode);
  const onwards = {
    skipHref: lesson.nextLessonHref,
    skipLabel: "Saltar",
    skipTitle: "Pasar a la siguiente lección sin marcar esta",
    finishLabel: "Continuar",
    finish: completeLesson.bind(null, lesson.id),
  };

  const toolbar = <LessonToolbar lesson={lesson} />;

  if (lesson.isPracticeOnly && lesson.practice) {
    return (
      <>
        {toolbar}
        <div className="lesson-frame__main lesson-frame__main_kind_practice">
          <LessonTracker lessonId={lesson.id} />
          <LessonPracticeList
            title={lesson.name}
            badge={lesson.isPriority ? "Prioritaria" : undefined}
            description={lesson.description}
            practice={lesson.practice}
            onwards={onwards}
          />
          {errorMessage && <PlatformNotice message={errorMessage} />}
        </div>
      </>
    );
  }

  return (
    <>
      {toolbar}
      <div className="lesson-frame__main">
        <LessonTracker lessonId={lesson.id} />

        <GameViewer
          pgn={lesson.pgn}
          orientation={lesson.orientation}
          // Read one move at a time (the new design system, 2026-10-22): the
          // line as pills, the note on the move on the board, the way on.
          moveList="notes"
          // The head: whether it is a priority and its chapter, its name,
          // and how far through the line.
          title={lesson.name}
          subtitle={`Capítulo ${lesson.chapterOrder} · ${lesson.chapterName}`}
          badge={lesson.isPriority ? "Prioritaria" : undefined}
          // The exercises are optional (D26): the panel's card invites, the
          // board's button completes.
          practice={lesson.practice ? practiceCard(lesson.practice) : undefined}
          // Under the board, the way through the lesson and nothing else:
          // no turning the board around, no settings menu.
          boardTools={false}
          // The new design system's board, keys and notation (2026-10-22).
          look="material"
          // And the way through is ONE button: it lets you out while there
          // are moves left, and at the last one it is what gives the lesson
          // for read and opens the next — which is why the screen needs no
          // row of buttons under the board.
          onwards={onwards}
        />

        {errorMessage && <PlatformNotice message={errorMessage} />}
      </div>
    </>
  );
}

/**
 * «Ahora practica» (D25, D26) for the viewer's panel: how many exercises the
 * lesson has, how many the student solved — by solve key, so a copy of a
 * library exercise solved elsewhere counts — and the way in: «Empezar» or
 * «Continuar», or «Repasar» once nothing is left to start.
 */
function practiceCard(practice: LessonPractice) {
  const count = `${practice.total} ${practice.total === 1 ? "ejercicio" : "ejercicios"}`;
  const standing =
    practice.solved === practice.total
      ? practice.total === 1
        ? "resuelto"
        : "todos resueltos"
      : `${practice.solved} de ${practice.total} ${practice.total === 1 ? "resuelto" : "resueltos"}`;
  const first = practice.items[0];
  return {
    title: "Ahora practica",
    detail: `${count} · ${standing}`,
    action: practice.start
      ? { href: practice.start.href, label: practice.start.label }
      : first && { href: first.href, label: "Repasar" },
  };
}

/**
 * The panel's toolbar (2026-10-22, the new design system): back to the
 * chapter, the trail — the course, the chapter, the lesson —, and at the
 * right the arrows to the lessons before and after, switched off at either
 * end of the course.
 */
function LessonToolbar({ lesson }: { lesson: LessonView }) {
  return (
    <div className="lesson-frame__toolbar">
      <nav className="lesson-frame__trail" aria-label="Dónde estás">
        <Link href={lesson.chapterHref} className={mdIconButton("standard", "sm")} aria-label="Volver al capítulo">
          <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
        </Link>
        <span className="lesson-frame__crumb lesson-frame__crumb_kind_course">{lesson.courseName}</span>
        <ChevronRightIcon variant="classic-solid" className="lesson-frame__crumb-step" />
        <Link href={lesson.chapterHref} className="lesson-frame__crumb">
          {lesson.chapterName}
        </Link>
        <ChevronRightIcon variant="classic-solid" className="lesson-frame__crumb-step" />
        <span className="lesson-frame__crumb-here" aria-current="page">
          {lesson.name}
        </span>
      </nav>

      <nav className="lesson-frame__steps" aria-label="Lecciones vecinas">
        <Step href={lesson.prevLessonHref} label="Lección anterior" direction="previous" />
        <Step href={lesson.nextLessonHref} label="Lección siguiente" direction="next" />
      </nav>
    </div>
  );
}

/** An arrow to the lesson before or after; switched off at either end. */
function Step({ href, label, direction }: { href?: string; label: string; direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon;
  if (!href) {
    return (
      <span className={`${mdIconButton("standard", "sm")} lesson-frame__step_state_off`} aria-hidden="true">
        <Icon variant="classic-solid" className="platform-md-icon" />
      </span>
    );
  }
  return (
    <Link href={href} className={mdIconButton("standard", "sm")} aria-label={label}>
      <Icon variant="classic-solid" className="platform-md-icon" />
    </Link>
  );
}
