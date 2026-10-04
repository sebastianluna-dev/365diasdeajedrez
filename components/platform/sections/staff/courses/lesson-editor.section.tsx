import { FormField, FormFieldset } from "@/components/platform/shared/form-field/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { BOARD_ORIENTATION, CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { deleteLesson, fileLessonPgnAsGame, updateLesson } from "@/services/staff-courses/staff-courses.actions";
import type {
  CatalogOption,
  CourseGameRow,
  LessonAdminDetail,
  TopicOption,
} from "@/services/staff-courses/staff-courses.types";
import { ExerciseEditor } from "./exercise-editor.comp";
import { LessonGamePicker } from "./lesson-game-picker.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./lesson-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";

interface LessonEditorSectionProps {
  lesson: LessonAdminDetail;
  exerciseModes: CatalogOption[];
  topics: TopicOption[];
  /** Games of the chapter's collection that match the search. */
  courseGames: CourseGameRow[];
  /** What was searched in the collection; travels in the URL. */
  gameQuery?: string;
  errorCode?: string;
}

const ORIENTATION_LABELS: Record<string, string> = { WHITE: "Blancas", BLACK: "Negras" };

/** Ties the "Opciones" controls to the metadata form in the other column. */
const METADATA_FORM_ID = "lesson-metadata";

/**
 * The lesson is edited in independent cards — content, metadata and
 * exercises — because they are different decisions and saving one should
 * not drag the others along.
 *
 * The PGN goes FIRST and not in its alphabetical order: it is the lesson's
 * content; the rest are settings on top of it.
 */
export function LessonEditorSection({
  lesson,
  exerciseModes,
  topics,
  courseGames,
  gameQuery,
  errorCode,
}: LessonEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const saveLesson = updateLesson.bind(null, lesson.courseId, lesson.chapterId, lesson.id);

  return (
    <div className="lesson-editor">
      <StaffEditorHead
        title={lesson.name}
        meta={
          <>
            <span>Lección {lesson.order}</span>
            <span>{lesson.pgn ? "Con contenido" : "Sin contenido"}</span>
            {lesson.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioridad</span>}
          </>
        }
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Opciones">
              {/* These controls are NOT inside any <form>: the `form` attribute ties
                  them to the metadata form in the other column. It is the only honest
                  way to split a form across two places; two forms against the same
                  action would trample each other's fields — `updateLesson` reads ALL of
                  them and saving here would erase what is there. */}
              <div className="lesson-editor__stack">
                <label className="lesson-editor__check">
                  <input type="checkbox" name="isPriority" form={METADATA_FORM_ID} defaultChecked={lesson.isPriority} />
                  <span>
                    Lección de prioridad
                    <span className="lesson-editor__check-hint">
                      Entra en el recorrido corto de quien estudia con poco tiempo.
                    </span>
                  </span>
                </label>

                <label className="lesson-editor__check">
                  <input
                    type="checkbox"
                    name="isTrainable"
                    form={METADATA_FORM_ID}
                    defaultChecked={lesson.isTrainable}
                  />
                  <span>
                    Se puede entrenar de memoria
                    <span className="lesson-editor__check-hint">
                      Se entrena la línea principal del PGN; las variantes siguen en el modo estudiar.
                    </span>
                  </span>
                </label>

                <FormField label="Bando que entrena el alumno">
                  <PlatformSelect
                    name="trainingColorCode"
                    form={METADATA_FORM_ID}
                    defaultValue={lesson.trainingColorCode ?? ""}
                    emptyOption="El que mueva primero"
                    options={[
                      { value: BOARD_ORIENTATION.WHITE, label: "Blancas" },
                      { value: BOARD_ORIENTATION.BLACK, label: "Negras" },
                    ]}
                    size="compact"
                  />
                </FormField>

                <p className="lesson-editor__note">Se guardan con «Guardar metadatos».</p>
              </div>
            </StaffPanel>

            <StaffPanel title="Estado">
              <dl className="lesson-editor__facts">
                <div className="lesson-editor__fact">
                  <dt>PGN actualizado</dt>
                  <dd>{lesson.pgnUpdatedAtLabel ?? "—"}</dd>
                </div>
                <div className="lesson-editor__fact">
                  <dt>Ejercicios</dt>
                  <dd>{lesson.exercises.length}</dd>
                </div>
                <div className="lesson-editor__fact">
                  <dt>Duración</dt>
                  <dd>{lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : "—"}</dd>
                </div>
              </dl>

              {/* Only where the server would allow it: draft course and no progress
                  from any student. As soon as someone has studied the lesson their
                  history rules and the course is archived, not dismantled. */}
              {lesson.canDelete && (
                <form
                  className="lesson-editor__danger"
                  action={deleteLesson.bind(null, lesson.courseId, lesson.chapterId)}
                >
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <SubmitButton className="lesson-editor__delete" pendingLabel="Eliminando…">
                    Eliminar lección
                  </SubmitButton>
                </form>
              )}
            </StaffPanel>
          </>
        }
      >
        <StaffPanel
          title="Partida de la lección"
          description="El contenido sale de una partida de la colección del curso; aquí sólo se elige cuál. El PGN se pega en el curso, y así una corrección vale para todas las lecciones que la usan."
        >
          {/* A lesson that references nothing keeps its content in its own PGN,
              where no board can reach it. Filing it in the collection is what
              returns it to a place where it is read and edited. */}
          {!lesson.game && lesson.pgn.trim().length > 0 && (
            <form
              className="lesson-editor__adopt"
              action={fileLessonPgnAsGame.bind(null, lesson.courseId, lesson.chapterId)}
            >
              <input type="hidden" name="lessonId" value={lesson.id} />
              <p className="lesson-editor__adopt-note">
                Esta lección guarda su propio PGN y no lee ninguna partida, así que su contenido no se puede abrir en el
                tablero. Archívalo en la colección del capítulo y quedará enlazado a esta lección, con su nombre.
              </p>
              <SubmitButton className="platform-button" pendingLabel="Archivando…">
                Archivar el PGN en la colección
              </SubmitButton>
            </form>
          )}

          <LessonGamePicker
            courseId={lesson.courseId}
            chapterId={lesson.chapterId}
            lessonId={lesson.id}
            game={lesson.game}
            candidates={courseGames}
            query={gameQuery}
          />
        </StaffPanel>

        <StaffPanel title="Metadatos">
          <form id={METADATA_FORM_ID} className="lesson-editor__form" action={saveLesson}>
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={lesson.name} maxLength={160} required />
            </FormField>

            <FormField label="Descripción (opcional)">
              <textarea name="description" defaultValue={lesson.description ?? ""} maxLength={1000} />
            </FormField>

            {/* The position the lesson starts from is NOT typed: it comes from the
                [FEN] header of the linked game, which is the only source of its content. */}
            <div className="lesson-editor__pair">
              <FormField label="Orientación del tablero">
                <PlatformSelect
                  name="orientationCode"
                  defaultValue={lesson.orientationCode}
                  options={CONTENT_ORIENTATIONS.map((code) => ({
                    value: code,
                    label: ORIENTATION_LABELS[code] ?? code,
                  }))}
                  size="compact"
                />
              </FormField>

              <FormField label="Duración estimada (minutos, opcional)">
                <input type="number" name="estimatedDuration" min={0} defaultValue={lesson.estimatedDuration ?? ""} />
              </FormField>
            </div>

            <FormFieldset legend="Temas">
              <PlatformCheckCards
                name="topicCodes"
                defaultValue={lesson.topicCodes}
                aria-label="Temas"
                layout="line"
                options={topics.map((topic) => ({ value: topic.code, label: topic.label }))}
              />
            </FormFieldset>

            <div className="lesson-editor__submit">
              <SubmitButton className="platform-button">Guardar metadatos</SubmitButton>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel title="Ejercicios" meta={`${lesson.exercises.length}`}>
          <ExerciseEditor
            courseId={lesson.courseId}
            chapterId={lesson.chapterId}
            lessonId={lesson.id}
            exercises={lesson.exercises}
            modes={exerciseModes}
            lessonPgn={lesson.pgn}
          />
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
