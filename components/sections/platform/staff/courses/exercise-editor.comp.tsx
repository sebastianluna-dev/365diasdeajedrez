"use client";

import { useState } from "react";
import { FormField } from "@/components/common/form-field.comp";
import {
  createExercise,
  deleteExercise,
  moveExercise,
  updateExercise,
} from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption, ExerciseAdminRow } from "@/services/staff-courses/staff-courses.types";
import "./exercise-editor.comp.css";

interface ExerciseEditorProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  exercises: ExerciseAdminRow[];
  modes: CatalogOption[];
}

interface ExerciseFieldsProps {
  action: (formData: FormData) => void;
  modes: CatalogOption[];
  exercise?: ExerciseAdminRow;
  submitLabel: string;
  onCancel?: () => void;
}

function ExerciseFields({ action, modes, exercise, submitLabel, onCancel }: ExerciseFieldsProps) {
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
        {/* No se precarga: la copia congelada guarda la posición, no el camino
            que llevó hasta ella, así que reconstruirlo no sería fiable. */}
        <input type="text" name="afterSans" placeholder="e4 c5 Nf3" autoComplete="off" />
      </FormField>

      <FormField label="Línea a entrenar (SAN, separadas por espacios)">
        <input type="text" name="lineSans" defaultValue={exercise?.line ?? ""} required autoComplete="off" />
      </FormField>

      <div className="exercise-editor__actions">
        <button type="submit" className="platform-button">
          {submitLabel}
        </button>
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
 * Ejercicios de la lección. Se describen con jugadas SAN (el mismo formato que
 * usa el seed) y el servidor deriva de ahí la posición congelada; un picker
 * visual sobre el PGN sería más cómodo y está anotado como mejora.
 */
export function ExerciseEditor({ courseId, chapterId, lessonId, exercises, modes }: ExerciseEditorProps) {
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
              {exercise.isStale && (
                <span className="platform-tag platform-tag_variant_accent">Desactualizado</span>
              )}

              <div className="exercise-editor__controls">
                <form action={moveExercise.bind(null, courseId, chapterId, lessonId)}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="exercise-editor__control" aria-label="Subir ejercicio" disabled={index === 0}>
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
                  <button type="submit" className="exercise-editor__control exercise-editor__control_variant_danger">
                    Eliminar
                  </button>
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
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button type="button" className="platform-button platform-button_variant_secondary" onClick={() => setIsAdding(true)}>
          Añadir ejercicio
        </button>
      )}
    </div>
  );
}
