import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
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
    );
  }

  return (
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
