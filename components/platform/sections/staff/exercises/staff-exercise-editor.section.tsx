import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  approveLibraryExercise,
  fetchStaffGamePgn,
  removeExerciseFromLibrary,
  restoreAcademyExercise,
  returnLibraryExercise,
  saveStaffExercise,
} from "@/services/staff-exercises/staff-exercises.actions";
import type { StaffExerciseEditor } from "@/services/staff-exercises/staff-exercises.types";
import { ExerciseReviewBar } from "./exercise-review-bar/exercise-review-bar.comp";
import "./staff-exercise-editor.section.css";

interface StaffExerciseEditorSectionProps {
  editor: StaffExerciseEditor;
  notice?: string;
  errorMessage?: string;
}

/**
 * A bank's exercise in the staff editor (PLAN.md §8): `ExerciseAuthoring` —
 * the academy's to write and publish, a teacher's in the library to edit
 * (D48), a teacher's proposal read-only with «Probar» to solve it — and,
 * under a saved one, the review bar with the decisions bound here, on the
 * server, so neither component imports an action. «Desde una partida» offers
 * the staff member's own studies.
 */
export function StaffExerciseEditorSection({ editor, notice, errorMessage }: StaffExerciseEditorSectionProps) {
  const id = editor.exercise.id;
  return (
    <div className="staff-exercise-editor">
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <ExerciseAuthoring
        key={editor.version}
        exercise={editor.exercise}
        catalogs={editor.catalogs}
        games={editor.games}
        permissions={editor.permissions}
        buttons={editor.buttons}
        save={saveStaffExercise.bind(null, id)}
        fetchGamePgn={fetchStaffGamePgn}
        initialTab={editor.initialTab}
      />
      {id && editor.review && (
        <ExerciseReviewBar
          title={editor.exercise.title}
          review={editor.review}
          actions={{
            approve: approveLibraryExercise.bind(null, id),
            returnWithNote: returnLibraryExercise.bind(null, id),
            remove: removeExerciseFromLibrary.bind(null, id),
            restore: restoreAcademyExercise.bind(null, id),
          }}
        />
      )}
    </div>
  );
}
