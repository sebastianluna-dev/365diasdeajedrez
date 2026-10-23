import Link from "next/link";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
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

  if (lesson.isPracticeOnly && lesson.practice) {
    return (
      <>
        <LessonTrail lesson={lesson} />
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
      <LessonTrail lesson={lesson} />
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
          // The way back to the chapter: the panel has no toolbar of its own
          // (2026-10-23), the column of lessons is where one moves.
          subtitle={{ label: `Capítulo ${lesson.chapterOrder} · ${lesson.chapterName}`, href: lesson.chapterHref }}
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
 * The panel's trail (2026-10-23, back after a day without it): back to the
 * chapter, and the course, the chapter and the lesson. No arrows to the
 * lessons beside it at its right: the column of the chapter and the board's
 * «Saltar»/«Continuar» already lead there.
 */
function LessonTrail({ lesson }: { lesson: LessonView }) {
  return (
    <nav className="lesson-frame__toolbar lesson-frame__trail" aria-label="Dónde estás">
      <Link href={lesson.chapterHref} className={mdIconButton("standard", "sm")} aria-label="Volver al capítulo">
        <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
      </Link>
      <Link
        href={platformRoutes.courseDetail(lesson.courseId)}
        className="lesson-frame__crumb lesson-frame__crumb_kind_course"
      >
        {lesson.courseName}
      </Link>
      <ChevronRightIcon
        variant="classic-solid"
        className="lesson-frame__crumb-step lesson-frame__crumb-step_kind_course"
      />
      <Link href={lesson.chapterHref} className="lesson-frame__crumb">
        {lesson.chapterName}
      </Link>
      <ChevronRightIcon variant="classic-solid" className="lesson-frame__crumb-step" />
      <span className="lesson-frame__crumb-here" aria-current="page">
        {lesson.name}
      </span>
    </nav>
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
