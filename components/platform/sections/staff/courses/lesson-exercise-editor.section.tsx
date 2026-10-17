import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { fetchChapterGamePgn, saveLessonExercise } from "@/services/staff-courses/lesson-exercises.actions";
import type { LessonExerciseEditor } from "@/services/staff-courses/staff-courses.types";

interface LessonExerciseEditorSectionProps {
  editor: LessonExerciseEditor;
  notice?: string;
  errorMessage?: string;
}

/**
 * The editor of a lesson's exercise, new or saved: `ExerciseAuthoring` with
 * the staff's actions bound to the lesson and the exercise here, on the
 * server, so the editor imports none. Mounted again on every save
 * (`version`), so the board and the fields open on what was stored. «Desde
 * una partida» offers the chapter's collection, where the lesson's content
 * comes from.
 */
export function LessonExerciseEditorSection({ editor, notice, errorMessage }: LessonExerciseEditorSectionProps) {
  const { courseId, chapterId, lessonId } = editor;
  return (
    <>
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <ExerciseAuthoring
        key={editor.version}
        exercise={editor.exercise}
        catalogs={editor.catalogs}
        games={editor.games}
        permissions={editor.permissions}
        buttons={editor.buttons}
        save={saveLessonExercise.bind(null, courseId, chapterId, lessonId, editor.exercise.id)}
        fetchGamePgn={fetchChapterGamePgn.bind(null, courseId, chapterId)}
      />
    </>
  );
}
