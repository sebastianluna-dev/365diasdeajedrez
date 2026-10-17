import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  approveLibraryExercise,
  fetchStaffGamePgn,
  removeExerciseFromLibrary,
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
 * A bank's exercise as the staff reads it (PLAN.md §8): `ExerciseAuthoring`
 * — read-only for a teacher's, with «Probar» to solve it — and, under it, the
 * review bar with the decisions bound here, on the server, so neither
 * component imports an action.
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
        initialTab="try"
      />
      {id && (
        <ExerciseReviewBar
          title={editor.exercise.title}
          review={editor.review}
          actions={{
            approve: approveLibraryExercise.bind(null, id),
            returnWithNote: returnLibraryExercise.bind(null, id),
            remove: removeExerciseFromLibrary.bind(null, id),
          }}
        />
      )}
    </div>
  );
}
