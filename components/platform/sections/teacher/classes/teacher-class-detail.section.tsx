import Link from "next/link";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer.comp";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import type { ClassStatusCode } from "@/constants/platform/class-codes.const";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { teacherRoutes } from "@/lib/platform-routes";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { addParticipant, setClassStatus } from "@/services/teacher-classes/teacher-classes.actions";
import { nextClassStatuses } from "@/services/teacher-classes/class-status-transitions";
import type { TeacherClassDetail } from "@/services/teacher-classes/teacher-classes.types";
import type { AssignedStudentSummary } from "@/services/teacher-students/teacher-students.types";
import { AttendanceForm } from "./attendance-form.comp";
import { ClassBlockEditor } from "./class-block-editor/class-block-editor.comp";
import type { BlockFormOptions } from "./class-block-editor/block-form.comp";
import "./teacher-class-detail.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface TeacherClassDetailSectionProps {
  classDetail: TeacherClassDetail;
  /** The blocks mapped as the student will see them. */
  previewBlocks: ClassBlockView[];
  /** Students with an active assignment: candidates to enrol. */
  students: AssignedStudentSummary[];
  blockOptions: BlockFormOptions;
  /** Game preselected when arriving from "Usar en una clase". */
  initialGameId?: string;
  errorCode?: string;
}

const STATUS_ACTION_LABELS: Record<ClassStatusCode, string> = {
  [CLASS_STATUS.SCHEDULED]: "Volver a programada",
  [CLASS_STATUS.LIVE]: "Empezar la clase",
  [CLASS_STATUS.COMPLETED]: "Marcar como terminada",
  [CLASS_STATUS.CANCELLED]: "Cancelar la clase",
};

export function TeacherClassDetailSection({
  classDetail,
  previewBlocks,
  students,
  blockOptions,
  initialGameId,
  errorCode,
}: TeacherClassDetailSectionProps) {
  const errorMessage = errorCode ? (TEACHER_ERROR_MESSAGES[errorCode] ?? TEACHER_ERROR_MESSAGES.invalid) : undefined;
  const enrolledIds = new Set(classDetail.participants.map((participant) => participant.userId));
  const enrollable = students.filter((student) => !enrolledIds.has(student.id));
  return (
    <div className="teacher-class">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <div className="teacher-class__head">
          <h2 className="platform-card__title">Datos de la clase</h2>
          <Link
            href={teacherRoutes.classEdit(classDetail.id)}
            className="platform-button platform-button_variant_secondary"
          >
            Editar
          </Link>
        </div>

        <dl className="teacher-class__facts">
          <div className="teacher-class__fact">
            <dt className="teacher-class__fact-label">Cuándo</dt>
            <dd className="teacher-class__fact-value">
              <LocalDateTime
                iso={classDetail.scheduledAtIso}
                fallback={`${classDetail.dateLabel} · ${classDetail.timeLabel}`}
              />
              {` · ${classDetail.durationMin} min`}
            </dd>
          </div>
          <div className="teacher-class__fact">
            <dt className="teacher-class__fact-label">Estado</dt>
            <dd className="teacher-class__fact-value">
              <span className="platform-tag">{classDetail.statusLabel}</span>
            </dd>
          </div>
          {classDetail.meetingProviderLabel && (
            <div className="teacher-class__fact">
              <dt className="teacher-class__fact-label">Reunión</dt>
              <dd className="teacher-class__fact-value">
                {/* The teacher always sees the link: they are the one who sets it. The
                    student is shown it only from meetingUrlVisibleFrom. */}
                {classDetail.meetingUrl ? (
                  <a href={classDetail.meetingUrl} target="_blank" rel="noreferrer">
                    {classDetail.meetingProviderLabel}
                  </a>
                ) : (
                  classDetail.meetingProviderLabel
                )}
              </dd>
            </div>
          )}
          {classDetail.meetingUrlVisibleFromIso && (
            <div className="teacher-class__fact">
              <dt className="teacher-class__fact-label">Enlace visible desde</dt>
              <dd className="teacher-class__fact-value">
                <LocalDateTime iso={classDetail.meetingUrlVisibleFromIso} fallback="" />
              </dd>
            </div>
          )}
          {classDetail.recordingUrl && (
            <div className="teacher-class__fact">
              <dt className="teacher-class__fact-label">Grabación</dt>
              <dd className="teacher-class__fact-value">
                <a href={classDetail.recordingUrl} target="_blank" rel="noreferrer">
                  Ver grabación
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="teacher-class__status-actions">
          {/* The valid transitions are decided by a pure function, and the action
              checks them again on the server. */}
          {nextClassStatuses(classDetail.statusCode).map((status) => (
            <form key={status} action={setClassStatus.bind(null, classDetail.id)}>
              <input type="hidden" name="statusCode" value={status} />
              <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Actualizando…">
                {STATUS_ACTION_LABELS[status]}
              </SubmitButton>
            </form>
          ))}
        </div>

        {classDetail.description && <p className="teacher-class__description">{classDetail.description}</p>}
        {classDetail.summary && (
          <div className="teacher-class__summary">
            <h3 className="teacher-class__summary-title">Resumen</h3>
            <p className="teacher-class__summary-text">{classDetail.summary}</p>
          </div>
        )}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Alumnos y asistencia</h2>
        <AttendanceForm classId={classDetail.id} participants={classDetail.participants} />

        {enrollable.length > 0 && (
          <form className="teacher-class__enroll" action={addParticipant.bind(null, classDetail.id)}>
            <FormField label="Inscribir a un alumno">
              <select name="studentId" required defaultValue="">
                <option value="" disabled>
                  Elige un alumno…
                </option>
                {enrollable.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.displayName}
                  </option>
                ))}
              </select>
            </FormField>
            <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Inscribiendo…">
              Inscribir
            </SubmitButton>
          </form>
        )}
      </section>

      {classDetail.transcript && (
        <section className="platform-card">
          <h2 className="platform-card__title">Transcripción</h2>
          <p className="teacher-class__transcript">
            {classDetail.transcript.statusLabel}
            {classDetail.transcript.hasText ? " · texto disponible" : " · sin texto todavía"}
          </p>
        </section>
      )}

      <section className="platform-card">
        <h2 className="platform-card__title">Editor de contenido</h2>
        <ClassBlockEditor
          classId={classDetail.id}
          blocks={classDetail.blocks}
          options={blockOptions}
          initialGameId={initialGameId}
        />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Vista previa</h2>
        <p className="teacher-class__preview-hint">Así lo verá el alumno.</p>
        {previewBlocks.length > 0 ? (
          <ClassContentRenderer blocks={previewBlocks} />
        ) : (
          <EmptyState
            title="Esta clase todavía no tiene contenido"
            description="Añade textos, videos, partidas, lecciones o posiciones para preparar la sesión."
          />
        )}
      </section>
    </div>
  );
}
