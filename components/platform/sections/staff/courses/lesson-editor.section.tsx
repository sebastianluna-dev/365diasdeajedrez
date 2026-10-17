import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { BOARD_ORIENTATION, CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { isPracticeOnlyLesson } from "@/services/staff-courses/lesson-exercises.mapper";
import { deleteLesson, fileLessonPgnAsGame, updateLesson } from "@/services/staff-courses/staff-courses.actions";
import type { CourseGameRow, LessonAdminDetail, TopicOption } from "@/services/staff-courses/staff-courses.types";
import { LessonExercises } from "./lesson-exercises.comp";
import { LessonGamePicker } from "./lesson-game-picker.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./lesson-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { topicCardGroups } from "@/services/shared/topic-groups";

interface LessonEditorSectionProps {
  lesson: LessonAdminDetail;
  topics: TopicOption[];
  /** Games of the chapter's collection that match the search. */
  courseGames: CourseGameRow[];
  /** What was searched in the collection; travels in the URL. */
  gameQuery?: string;
  /** What `?aviso=` said: an exercise archived or deleted. */
  notice?: string;
  errorCode?: string;
}

const ORIENTATION_LABELS: Record<string, string> = { WHITE: "Blancas", BLACK: "Negras" };

/** Ties the "Opciones" controls to the metadata form in the other column. */
const METADATA_FORM_ID = "lesson-metadata";
/** The training colour's select, named by its label across the aside. */
const TRAINING_COLOR_ID = "lesson-training-color";

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
  topics,
  courseGames,
  gameQuery,
  notice,
  errorCode,
}: LessonEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const saveLesson = updateLesson.bind(null, lesson.courseId, lesson.chapterId, lesson.id);
  // The one rule of «content» (`lessonHasContent`, read into `hasContent`), and «practice-only» as the student
  // and `courseHasContent` see it: a PUBLISHED exercise in play, and only while the flag shows it.
  const { hasContent } = lesson;
  const inPlay = lesson.exercises.filter((exercise) => exercise.lessonOrder !== null).length;
  const practiceOnly = EXERCISES_ENABLED && isPracticeOnlyLesson(hasContent, lesson.exercises);

  return (
    <div className="lesson-editor">
      <StaffEditorHead
        title={lesson.name}
        meta={
          <>
            <span>Lección {lesson.order}</span>
            <span>{hasContent ? "Con partida" : practiceOnly ? "Sólo de práctica" : "Sin contenido"}</span>
            {lesson.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioridad</span>}
          </>
        }
      />

      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Opciones">
              {/* These controls are NOT inside any <form>: the `form` attribute ties
                  them to the metadata form in the other column. It is the only honest
                  way to split a form across two places; two forms against the same
                  action would trample each other's fields — `updateLesson` reads ALL of
                  them and saving here would erase what is there. Outside that form
                  there is no `PlatformForm` to hold a `PlatformFormField`, so the
                  select is named by a plain label pointing at its trigger. */}
              <div className="lesson-editor__stack">
                <PlatformCheckbox
                  name="isPriority"
                  form={METADATA_FORM_ID}
                  defaultChecked={lesson.isPriority}
                  label="Lección de prioridad"
                  hint="Entra en el recorrido corto de quien estudia con poco tiempo."
                />

                <PlatformCheckbox
                  name="isTrainable"
                  form={METADATA_FORM_ID}
                  defaultChecked={lesson.isTrainable}
                  label="Se puede entrenar de memoria"
                  hint="Se entrena la línea principal del PGN; las variantes siguen en el modo estudiar."
                />

                <div className="lesson-editor__select">
                  <label className="lesson-editor__label" htmlFor={TRAINING_COLOR_ID}>
                    Bando que entrena el alumno
                  </label>
                  <PlatformSelect
                    id={TRAINING_COLOR_ID}
                    name="trainingColorCode"
                    form={METADATA_FORM_ID}
                    defaultValue={lesson.trainingColorCode ?? ""}
                    emptyOption="El que mueva primero"
                    options={[
                      { value: BOARD_ORIENTATION.WHITE, label: "Blancas" },
                      { value: BOARD_ORIENTATION.BLACK, label: "Negras" },
                    ]}
                  />
                </div>

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
                  <dd>{inPlay}</dd>
                </div>
                <div className="lesson-editor__fact">
                  <dt>Duración</dt>
                  <dd>{lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : "—"}</dd>
                </div>
              </dl>

              {/* Only where the server would allow it: draft course, no progress
                  from any student and no exercise anyone tried. As soon as someone
                  has studied the lesson their history rules and the course is
                  archived, not dismantled. */}
              {lesson.canDelete && (
                <form
                  className="lesson-editor__danger"
                  action={deleteLesson.bind(null, lesson.courseId, lesson.chapterId)}
                >
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <SubmitButton
                    className="platform-button platform-button_variant_danger lesson-editor__delete"
                    pendingLabel="Eliminando…"
                  >
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

          {/* A lesson may have no game at all (D25): with exercises it is practice,
              and the student sees their list where the board would be. Said here,
              under the picker, so nobody looks for a missing PGN. */}
          {!hasContent && (
            <p className="lesson-editor__practice-note">
              {practiceOnly
                ? "Sin partida: la lección será sólo de práctica, y los alumnos verán sus ejercicios en lugar del tablero."
                : "Sin partida: la lección será sólo de práctica si le agregas ejercicios; sin ellos no tiene contenido."}
            </p>
          )}
        </StaffPanel>

        <StaffPanel title="Metadatos">
          <PlatformForm id={METADATA_FORM_ID} action={saveLesson}>
            <PlatformFormField name="name" label="Nombre">
              <input type="text" defaultValue={lesson.name} maxLength={160} required />
            </PlatformFormField>

            <PlatformFormField name="description" label="Descripción">
              <textarea defaultValue={lesson.description ?? ""} maxLength={1000} />
            </PlatformFormField>

            {/* The position the lesson starts from is NOT typed: it comes from the
                [FEN] header of the linked game, which is the only source of its content. */}
            <div className="lesson-editor__pair">
              <PlatformFormField name="orientationCode" label="Orientación del tablero">
                <PlatformSelect
                  defaultValue={lesson.orientationCode}
                  options={CONTENT_ORIENTATIONS.map((code) => ({
                    value: code,
                    label: ORIENTATION_LABELS[code] ?? code,
                  }))}
                />
              </PlatformFormField>

              <PlatformFormField name="estimatedDuration" label="Duración estimada (minutos)">
                <input type="number" min={0} defaultValue={lesson.estimatedDuration ?? ""} />
              </PlatformFormField>
            </div>

            {/* The group's label names the cards; a parent's topics go under its heading. */}
            <PlatformFormGroup label="Temas" optional>
              <PlatformCheckCards
                name="topicCodes"
                defaultValue={lesson.topicCodes}
                layout="line"
                {...topicCardGroups(topics)}
              />
            </PlatformFormGroup>

            <div className="lesson-editor__submit">
              <SubmitButton className="platform-button">Guardar metadatos</SubmitButton>
            </div>
          </PlatformForm>
        </StaffPanel>

        <StaffPanel
          title="Ejercicios"
          meta={`${inPlay}`}
          description="Los alumnos los practican después de la partida, en su orden. Un ejercicio se escribe en el editor y se publica; uno que alguien ya intentó se archiva en vez de eliminarse."
        >
          <LessonExercises
            courseId={lesson.courseId}
            chapterId={lesson.chapterId}
            lessonId={lesson.id}
            exercises={lesson.exercises}
          />
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
