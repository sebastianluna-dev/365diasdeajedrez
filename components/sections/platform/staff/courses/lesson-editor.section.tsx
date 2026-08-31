import Link from "next/link";
import { FormField, FormFieldset } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { staffRoutes } from "@/lib/platform-routes";
import { updateLesson, updateLessonPgn } from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption, LessonAdminDetail, TopicOption } from "@/services/staff-courses/staff-courses.types";
import { ExerciseEditor } from "./exercise-editor.comp";
import { LessonPgnEditor } from "./lesson-pgn-editor.comp";
import "./lesson-editor.section.css";

interface LessonEditorSectionProps {
  lesson: LessonAdminDetail;
  presentationModes: CatalogOption[];
  initialPositionTypes: CatalogOption[];
  exerciseModes: CatalogOption[];
  topics: TopicOption[];
  errorCode?: string;
}

const ORIENTATION_LABELS: Record<string, string> = { WHITE: "Blancas", BLACK: "Negras" };

/**
 * La lección se edita en tres tarjetas independientes —metadatos, PGN y
 * ejercicios— porque son tres decisiones distintas y guardar una no debería
 * arrastrar a las otras.
 */
export function LessonEditorSection({
  lesson,
  presentationModes,
  initialPositionTypes,
  exerciseModes,
  topics,
  errorCode,
}: LessonEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="lesson-editor">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <p className="lesson-editor__breadcrumb">
        <Link href={staffRoutes.courses}>Cursos</Link>
        {" › "}
        <Link href={staffRoutes.courseDetail(lesson.courseId)}>{lesson.courseName}</Link>
        {" › "}
        <Link href={staffRoutes.chapterDetail(lesson.courseId, lesson.chapterId)}>{lesson.chapterName}</Link>
      </p>

      <section className="platform-card">
        <h2 className="platform-card__title">Metadatos</h2>

        <form
          className="lesson-editor__form"
          action={updateLesson.bind(null, lesson.courseId, lesson.chapterId, lesson.id)}
        >
          <FormField label="Nombre">
            <input type="text" name="name" defaultValue={lesson.name} maxLength={160} required />
          </FormField>

          <FormField label="Descripción (opcional)">
            <textarea name="description" defaultValue={lesson.description ?? ""} maxLength={1000} />
          </FormField>

          <div className="lesson-editor__row">
            <FormField label="Modo de presentación">
              <select name="presentationModeCode" defaultValue={lesson.presentationModeCode}>
                {presentationModes.map((mode) => (
                  <option key={mode.code} value={mode.code}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Orientación del tablero">
              <select name="orientationCode" defaultValue={lesson.orientationCode}>
                {CONTENT_ORIENTATIONS.map((code) => (
                  <option key={code} value={code}>
                    {ORIENTATION_LABELS[code] ?? code}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="lesson-editor__row">
            <FormField
              label="Posición inicial"
              hint="Con «FEN» hay que indicar la posición; con «posición de partida» se deja vacía."
            >
              <select name="initialPositionTypeCode" defaultValue={lesson.initialPositionTypeCode}>
                {initialPositionTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="FEN inicial">
              <input type="text" name="initialFen" defaultValue={lesson.initialFen ?? ""} maxLength={120} />
            </FormField>
          </div>

          <div className="lesson-editor__row">
            <FormField label="Duración estimada (minutos, opcional)">
              <input type="number" name="estimatedDuration" min={0} defaultValue={lesson.estimatedDuration ?? ""} />
            </FormField>

            <FormField label="Prioridad">
              <label className="lesson-editor__check">
                <input type="checkbox" name="isPriority" defaultChecked={lesson.isPriority} />
                Lección imprescindible del curso
              </label>
            </FormField>
          </div>

          <FormFieldset legend="Temas">
            {topics.map((topic) => (
              <label key={topic.id}>
                <input
                  type="checkbox"
                  name="topicIds"
                  value={topic.id}
                  defaultChecked={lesson.topicIds.includes(topic.id)}
                />
                {topic.label}
              </label>
            ))}
          </FormFieldset>

          <button type="submit" className="platform-button">
            Guardar metadatos
          </button>
        </form>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Contenido (PGN)</h2>
        <LessonPgnEditor
          action={updateLessonPgn.bind(null, lesson.courseId, lesson.chapterId, lesson.id)}
          pgn={lesson.pgn}
          pgnUpdatedAtLabel={lesson.pgnUpdatedAtLabel}
        />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Ejercicios</h2>
        <ExerciseEditor
          courseId={lesson.courseId}
          chapterId={lesson.chapterId}
          lessonId={lesson.id}
          exercises={lesson.exercises}
          modes={exerciseModes}
        />
      </section>
    </div>
  );
}
