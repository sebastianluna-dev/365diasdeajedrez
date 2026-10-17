import { BookArrowUpIcon } from "@/components/icons/book-arrow-up-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import {
  duplicateTeacherExercise,
  fetchTeacherGamePgn,
  proposeTeacherExercise,
  saveTeacherExercise,
  withdrawTeacherExercise,
} from "@/services/teacher-exercises/teacher-exercises.actions";
import type {
  TeacherExerciseEditor,
  TeacherExerciseReview,
} from "@/services/teacher-exercises/teacher-exercises.types";

interface TeacherExerciseEditorSectionProps {
  editor: TeacherExerciseEditor;
  notice?: string;
  errorMessage?: string;
}

/**
 * The editor of a teacher's exercise, new or saved: `ExerciseAuthoring` with
 * the teacher's actions bound to the exercise here, on the server, so the
 * editor imports none. Mounted again on every save (`version`), so the board
 * and the fields open on what was stored. The staff's note on a returned
 * exercise («Devuelto: …», D16) is said above the editor.
 */
export function TeacherExerciseEditorSection({ editor, notice, errorMessage }: TeacherExerciseEditorSectionProps) {
  const id = editor.exercise.id;
  return (
    <>
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}
      {editor.review.note && (
        <PlatformNotice message={`Devuelto por el equipo: ${editor.review.note}`} variant="info" />
      )}
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

interface TeacherExerciseReviewActionsProps {
  exerciseId: string;
  review: TeacherExerciseReview;
}

/**
 * The library's review from the exercise's page head (D07, D16): «Proponer a
 * la biblioteca» on a ready exercise, «Retirar la propuesta» on one in review.
 * Each is a form bound here, with `origin=editor` so the move comes back to
 * this page. Nothing on a draft, an archived one or one in the library.
 */
export function TeacherExerciseReviewActions({ exerciseId, review }: TeacherExerciseReviewActionsProps) {
  if (!review.canPropose && !review.canWithdraw) return null;
  return (
    <div className="platform-page__actions">
      {review.canPropose && (
        <form action={proposeTeacherExercise.bind(null, exerciseId)}>
          <input type="hidden" name="origin" value="editor" />
          <SubmitButton className="platform-button" pendingLabel="Proponiendo…">
            <BookArrowUpIcon variant="classic-solid" className="platform-button__icon" />
            Proponer a la biblioteca
          </SubmitButton>
        </form>
      )}
      {review.canWithdraw && (
        <form action={withdrawTeacherExercise.bind(null, exerciseId)}>
          <input type="hidden" name="origin" value="editor" />
          <SubmitButton className="platform-button" pendingLabel="Retirando…">
            <RotateLeftIcon variant="classic-solid" className="platform-button__icon" />
            Retirar la propuesta
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
