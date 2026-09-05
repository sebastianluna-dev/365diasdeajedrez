import { FormField, FormFieldset } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { BOARD_ORIENTATION, CONTENT_ORIENTATIONS } from "@/constants/platform/shared-codes.const";
import { staffRoutes } from "@/lib/platform-routes";
import { deleteLesson, updateLesson } from "@/services/staff-courses/staff-courses.actions";
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

interface LessonEditorSectionProps {
  lesson: LessonAdminDetail;
  exerciseModes: CatalogOption[];
  topics: TopicOption[];
  /** Partidas de la colección del curso que casan con la búsqueda. */
  courseGames: CourseGameRow[];
  /** Lo que se buscó en la colección; viaja en la URL. */
  gameQuery?: string;
  errorCode?: string;
}

const ORIENTATION_LABELS: Record<string, string> = { WHITE: "Blancas", BLACK: "Negras" };

/** Ata los controles de «Opciones» al formulario de metadatos de la otra columna. */
const METADATA_FORM_ID = "lesson-metadata";

/**
 * La lección se edita en tarjetas independientes —contenido, metadatos y
 * ejercicios— porque son decisiones distintas y guardar una no debería
 * arrastrar a las otras.
 *
 * El PGN va PRIMERO y no en su orden alfabético: es el contenido de la lección;
 * el resto son ajustes sobre él.
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
        crumbs={[
          { label: "Cursos", href: staffRoutes.courses },
          { label: lesson.courseName, href: staffRoutes.courseDetail(lesson.courseId) },
          { label: lesson.chapterName, href: staffRoutes.chapterDetail(lesson.courseId, lesson.chapterId) },
        ]}
        title={lesson.name}
        meta={
          <>
            <span>Lección {lesson.order}</span>
            <span>{lesson.pgn ? "Con contenido" : "Sin contenido"}</span>
            {lesson.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioritaria</span>}
          </>
        }
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Opciones">
              {/* Estos controles NO están dentro de ningún <form>: el atributo
                  `form` los ata al de metadatos de la otra columna. Es la única
                  forma honesta de repartir un formulario en dos sitios; dos
                  formularios contra la misma action se pisarían los campos
                  —`updateLesson` lee TODOS y guardar aquí borraría lo de allí—. */}
              <div className="lesson-editor__stack">
                <label className="lesson-editor__check">
                  <input
                    type="checkbox"
                    name="isPriority"
                    form={METADATA_FORM_ID}
                    defaultChecked={lesson.isPriority}
                  />
                  <span>
                    Lección imprescindible del curso
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
                  <select
                    name="trainingColorCode"
                    form={METADATA_FORM_ID}
                    defaultValue={lesson.trainingColorCode ?? ""}
                  >
                    <option value="">El que mueva primero</option>
                    <option value={BOARD_ORIENTATION.WHITE}>Blancas</option>
                    <option value={BOARD_ORIENTATION.BLACK}>Negras</option>
                  </select>
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

              {/* Sólo donde el servidor lo permitiría: curso en borrador y sin
                  progreso de ningún alumno. En cuanto alguien ha estudiado la
                  lección manda su historial y el curso se archiva, no se
                  desmonta. */}
              {lesson.canDelete && (
                <form
                  className="lesson-editor__danger"
                  action={deleteLesson.bind(null, lesson.courseId, lesson.chapterId)}
                >
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <button type="submit" className="lesson-editor__delete">
                    Eliminar lección
                  </button>
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

            {/* La posición desde la que arranca la lección NO se teclea: sale
                de la cabecera [FEN] de la partida vinculada, que es la única
                fuente de su contenido. */}
            <div className="lesson-editor__pair">
              <FormField label="Orientación del tablero">
                <select name="orientationCode" defaultValue={lesson.orientationCode}>
                  {CONTENT_ORIENTATIONS.map((code) => (
                    <option key={code} value={code}>
                      {ORIENTATION_LABELS[code] ?? code}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Duración estimada (minutos, opcional)">
                <input
                  type="number"
                  name="estimatedDuration"
                  min={0}
                  defaultValue={lesson.estimatedDuration ?? ""}
                />
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

            <div className="lesson-editor__submit">
              <button type="submit" className="platform-button">
                Guardar metadatos
              </button>
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
