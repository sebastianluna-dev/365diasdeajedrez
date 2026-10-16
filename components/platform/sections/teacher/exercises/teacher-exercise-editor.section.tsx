import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  duplicateTeacherExercise,
  fetchTeacherGamePgn,
  saveTeacherExercise,
} from "@/services/teacher-exercises/teacher-exercises.actions";
import type { TeacherExerciseEditor } from "@/services/teacher-exercises/teacher-exercises.types";

interface TeacherExerciseEditorSectionProps {
  editor: TeacherExerciseEditor;
  notice?: string;
  errorMessage?: string;
}

/**
 * The editor of a teacher's exercise, new or saved: `ExerciseAuthoring` with
 * the teacher's actions bound to the exercise here, on the server, so the
 * editor imports none. Mounted again on every save (`version`), so the board
 * and the fields open on what was stored.
 */
export function TeacherExerciseEditorSection({ editor, notice, errorMessage }: TeacherExerciseEditorSectionProps) {
  const id = editor.exercise.id;
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
        save={saveTeacherExercise.bind(null, id)}
        fetchGamePgn={fetchTeacherGamePgn}
        duplicate={id ? duplicateTeacherExercise.bind(null, id) : undefined}
        initialTab={editor.initialTab}
      />
    </>
  );
}
