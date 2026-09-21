"use client";

import { useState } from "react";
import { FormField } from "@/components/platform/shared/form-field.comp";
import {
  createExercise,
  deleteExercise,
  moveExercise,
  updateExercise,
} from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption, ExerciseAdminRow } from "@/services/staff-courses/staff-courses.types";
import { ExerciseMovePicker } from "./exercise-move-picker.comp";
import "./exercise-editor.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface ExerciseEditorProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  exercises: ExerciseAdminRow[];
  modes: CatalogOption[];
  /** The lesson's PGN, so the moves can be chosen on the board. */
  lessonPgn: string;
}

interface ExerciseFieldsProps {
  action: (formData: FormData) => void;
  modes: CatalogOption[];
  exercise?: ExerciseAdminRow;
  submitLabel: string;
  lessonPgn: string;
  onCancel?: () => void;
}

function ExerciseFields({ action, modes, exercise, submitLabel, lessonPgn, onCancel }: ExerciseFieldsProps) {
  // The two move fields are controlled because the board writes them too.
  // They can still be typed: the picker fills in, it does not replace.
  const [afterSans, setAfterSans] = useState("");
  const [lineSans, setLineSans] = useState(exercise?.line ?? "");

  return (
    <form className="exercise-editor__form" action={action}>
      <FormField label="Modo">
        <select name="modeCode" defaultValue={exercise?.modeCode ?? modes[0]?.code}>
          {modes.map((mode) => (
            <option key={mode.code} value={mode.code}>
              {mode.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Enunciado (opcional)">
        <input type="text" name="promptText" defaultValue={exercise?.promptText ?? ""} maxLength={500} />
      </FormField>

      <FormField
        label="Jugadas previas (SAN, separadas por espacios)"
        hint="Desde la posición inicial de la lección hasta donde arranca el ejercicio. Vacío = desde el principio."
      >
        {/* Not preloaded when editing: the frozen copy stores the position, not
            the path that led to it, so rebuilding it would not be reliable.
            The board below can fill it in. */}
        <input
          type="text"
          name="afterSans"
          value={afterSans}
          onChange={(event) => setAfterSans(event.target.value)}
          placeholder="e4 c5 Nf3"
          autoComplete="off"
        />
      </FormField>

      <FormField label="Línea a entrenar (SAN, separadas por espacios)">
        <input
          type="text"
          name="lineSans"
          value={lineSans}
          onChange={(event) => setLineSans(event.target.value)}
          required
          autoComplete="off"
        />
      </FormField>

      <ExerciseMovePicker
        pgn={lessonPgn}
        onPick={(values) => {
          if (values.afterSans !== undefined) setAfterSans(values.afterSans);
          if (values.lineSans !== undefined) setLineSans(values.lineSans);
        }}
      />

      <div className="exercise-editor__actions">
        <SubmitButton>{submitLabel}</SubmitButton>
        {onCancel && (
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Exercises of the lesson. They are described with SAN moves (the same format
 * the seed uses) and the server derives the frozen position from there; to
 * avoid typing them, the form brings a board that takes them from the lesson's PGN.
 */
export function ExerciseEditor({ courseId, chapterId, lessonId, exercises, modes, lessonPgn }: ExerciseEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="exercise-editor">
      <ol className="exercise-editor__list">
        {exercises.map((exercise, index) => (
          <li key={exercise.id} className="exercise-editor__item">
            <div className="exercise-editor__row">
              <span className="platform-tag">{exercise.modeLabel}</span>
              <span className="exercise-editor__summary">{exercise.promptText ?? exercise.line}</span>
              {exercise.isStale && <span className="platform-tag platform-tag_variant_accent">Desactualizado</span>}

              <div className="exercise-editor__controls">
                <form action={moveExercise.bind(null, courseId, chapterId, lessonId)}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className="exercise-editor__control"
                    aria-label="Subir ejercicio"
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                </form>
                <form action={moveExercise.bind(null, courseId, chapterId, lessonId)}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    className="exercise-editor__control"
                    aria-label="Bajar ejercicio"
                    disabled={index === exercises.length - 1}
                  >
                    ↓
                  </button>
                </form>
                <button
                  type="button"
                  className="exercise-editor__control"
                  onClick={() => setEditingId(editingId === exercise.id ? null : exercise.id)}
                >
                  {editingId === exercise.id ? "Cerrar" : exercise.isStale ? "Volver a congelar" : "Editar"}
                </button>
                <form action={deleteExercise.bind(null, courseId, chapterId, lessonId)}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <SubmitButton
                    className="exercise-editor__control exercise-editor__control_variant_danger"
                    pendingLabel="Eliminando…"
                  >
                    Eliminar
                  </SubmitButton>
                </form>
              </div>
            </div>

            <p className="exercise-editor__meta">
              Jugadas {exercise.startPly}–{exercise.endPly} · línea: {exercise.line}
            </p>

            {exercise.isStale && editingId !== exercise.id && (
              <p className="exercise-editor__warning" role="alert">
                El PGN de la lección cambió después de congelar este ejercicio. Vuelve a introducir sus jugadas para
                dejarlo al día.
              </p>
            )}

            {editingId === exercise.id && (
              <ExerciseFields
                action={updateExercise.bind(null, courseId, chapterId, lessonId, exercise.id)}
                modes={modes}
                exercise={exercise}
                submitLabel="Guardar ejercicio"
                lessonPgn={lessonPgn}
                onCancel={() => setEditingId(null)}
              />
            )}
          </li>
        ))}
      </ol>

      {isAdding ? (
        <ExerciseFields
          action={createExercise.bind(null, courseId, chapterId, lessonId)}
          modes={modes}
          submitLabel="Crear ejercicio"
          lessonPgn={lessonPgn}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          type="button"
          className="platform-button platform-button_variant_secondary"
          onClick={() => setIsAdding(true)}
        >
          Añadir ejercicio
        </button>
      )}
    </div>
  );
}
