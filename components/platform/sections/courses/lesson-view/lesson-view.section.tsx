import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { completeLesson } from "@/services/courses/courses.actions";
import type { LessonView } from "@/services/courses/courses.types";
import { LessonOutline } from "./lesson-outline.comp";
import { LessonTracker } from "./lesson-tracker.comp";
import "./lesson-view.section.css";

interface LessonViewSectionProps {
  lesson: LessonView;
  /** What `completeLesson` bounced back with, in `?error=`. */
  errorCode?: string;
}

export function LessonViewSection({ lesson, errorCode }: LessonViewSectionProps) {
  const errorMessage = studentErrorMessage(errorCode);

  return (
    <section className="lesson-view">
      <LessonTracker lessonId={lesson.id} />

      <LessonOutline
        courseId={lesson.courseId}
        courseName={lesson.courseName}
        courseHref={lesson.courseHref}
        courseThumbnail={lesson.courseThumbnail}
        chapterName={lesson.chapterName}
        chapterHref={lesson.chapterHref}
        lessons={lesson.chapterLessons}
        currentLessonId={lesson.id}
        onlyPriority={lesson.onlyPriorityLessons}
        returnTo={lesson.href}
      />

      <div className="lesson-view__main">
        <GameViewer
          pgn={lesson.pgn}
          orientation={lesson.orientation}
          // The lesson is READ: the running text accompanies the narrative, whereas
          // the table is for consulting a game move by move.
          moveList="flow"
          // The head carries the lesson's name and whether it is a priority,
          // and nothing else: where it falls in the course is the column's
          // job, and what it explains is written move by move below.
          title={lesson.name}
          badge={lesson.isPriority ? "Prioridad" : undefined}
          // Under the board, the way through the lesson and nothing else:
          // no turning the board around, no settings menu.
          boardTools={false}
          // And the way through is ONE button: it lets you out while there
          // are moves left, and at the last one it is what gives the lesson
          // for read and opens the next — which is why the screen needs no
          // row of buttons under the board.
          onwards={{
            skipHref: lesson.nextLessonHref,
            skipLabel: "Saltar",
            skipTitle: "Pasar a la siguiente lección sin marcar esta",
            finishLabel: "Continuar",
            finish: completeLesson.bind(null, lesson.id),
          }}
        />

        {errorMessage && <PlatformNotice message={errorMessage} />}
      </div>
    </section>
  );
}
