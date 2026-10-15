import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { MeetingLinkButton } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { CLASS_FORMAT, CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { formatClassStamp, formatClassWhen, formatClassHours, formatClassDay } from "@/lib/format-class-when";
import {
  changeAttendanceAsStaff,
  removeClassParticipant,
  rescheduleClass,
  rescheduleStudentSeat,
  setClassMeeting,
  setClassTeacher,
} from "@/services/staff-classes/staff-classes.actions";
import type { StaffClassDetail } from "@/services/staff-classes/staff-classes.types";
import { loadPaymentContext, loadTeacherBusy, registerPayment } from "@/services/staff-payments/staff-payments.actions";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import { ChangeTeacherButton } from "./change-teacher-popup/change-teacher-popup.comp";
import { ClassHistory } from "./class-history.comp";
import { ClassSeatRow } from "./class-seat-row/class-seat-row.comp";
import { RescheduleClassButton } from "./reschedule-class-popup/reschedule-class-popup.comp";
import "./staff-class-detail.section.css";

interface StaffClassDetailSectionProps {
  classDetail: StaffClassDetail;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  staffName: string;
  /** The success the address says, already in words, or the error's message. */
  notice?: string;
  errorMessage?: string;
}

/**
 * The record of a class for the staff (ADM-4; ADM-8 once it is finished):
 * the students with their seats and marks, what the teacher wrote after the
 * class, the content as the students will see it, and the lane with when,
 * who, how it is joined and what happened. A Server Component: it imports
 * the actions and hands them down as props.
 */
export function StaffClassDetailSection({
  classDetail,
  teachers,
  groupClasses,
  staffName,
  notice,
  errorMessage,
}: StaffClassDetailSectionProps) {
  const { timeZone, nowIso, editable, counts, phase } = classDetail;
  const now = new Date(nowIso);
  const start = new Date(classDetail.startIso);
  const seated = classDetail.seats.filter((seat) => !seat.moved);
  const moved = classDetail.seats.filter((seat) => seat.moved);
  const isGroup = classDetail.formatCode === CLASS_FORMAT.GROUP;
  const isDone = phase === CLASS_PHASE.DONE;
  const seatsLine = isDone
    ? `Asistencia: ${counts.attended} de ${counts.seated}`
    : isGroup
      ? [
          `${counts.seated} de ${classDetail.capacity ?? counts.seated} plazas`,
          ...(counts.unpaid > 0 ? [`${counts.unpaid} sin pago`] : []),
          ...(counts.free > 0 ? [`${counts.free} gratis`] : []),
        ].join(" · ")
      : counts.unpaid > 0
        ? "Sin pago"
        : counts.free > 0
          ? "Gratis"
          : null;
  const seatActions = {
    removeClassParticipant,
    changeAttendanceAsStaff,
    rescheduleStudentSeat,
    registerPayment,
    loadPaymentContext,
    loadTeacherBusy,
  };
  const hasNoShow = isDone && seated.some((seat) => seat.attended === false && seat.can.moveSeat);

  return (
    <div className="staff-class">
      <div className="staff-class__main">
        {errorMessage && <PlatformNotice message={errorMessage} />}
        {notice && <PlatformNotice message={notice} variant="success" />}
        {classDetail.cancellation && (
          <PlatformNotice
            variant="info"
            message={`Cancelada por ${classDetail.cancellation.byName ?? "administración"} el ${formatClassStamp(new Date(classDetail.cancellation.atIso), timeZone, now)}${classDetail.cancellation.reason ? ` · «${classDetail.cancellation.reason}»` : ""}${classDetail.cancellation.note ? ` · Mensaje para los alumnos: «${classDetail.cancellation.note}»` : ""}`}
          />
        )}
        {classDetail.reschedule && !classDetail.cancellation && (
          <PlatformNotice
            variant="info"
            message={`Reprogramada del ${formatClassDay(new Date(classDetail.reschedule.previousStartIso), timeZone, now)} por ${classDetail.reschedule.byName ?? "administración"}${classDetail.reschedule.note ? ` · «${classDetail.reschedule.note}»` : ""}`}
          />
        )}

        <section className="platform-card" aria-labelledby="alumnos">
          <div className="staff-class__card-head">
            <h2 id="alumnos" className="platform-card__title">
              {isGroup ? "Alumnos" : "Alumno"}
            </h2>
            {seatsLine && <p className="staff-class__card-meta">{seatsLine}</p>}
          </div>
          {classDetail.seats.length === 0 ? (
            <p className="staff-class__empty">Sin alumnos todavía.</p>
          ) : (
            <div className="staff-class__seats">
              {[...seated, ...moved].map((seat) => (
                <ClassSeatRow
                  key={seat.userId}
                  seat={seat}
                  classDetail={classDetail}
                  teachers={teachers}
                  groupClasses={groupClasses}
                  staffName={staffName}
                  actions={seatActions}
                />
              ))}
            </div>
          )}
          {hasNoShow && (
            <p className="staff-class__note">
              Una falta gasta la clase pagada. Si hay un reporte, cambia la asistencia; si quieres que la recupere, dale
              otra fecha con «Reprogramar».
            </p>
          )}
        </section>

        {classDetail.afterNotes && (
          <section className="platform-card" aria-labelledby="despues">
            <h2 id="despues" className="platform-card__title">
              Después de la clase
            </h2>
            <p className="staff-class__closed">
              Finalizada por {classDetail.afterNotes.closedByName ?? "administración"} el{" "}
              {formatClassStamp(new Date(classDetail.afterNotes.closedAtIso), timeZone, now).replace(", ", " a las ")}
            </p>
            <dl className="staff-class__after">
              <div className="staff-class__after-item">
                <dt>Resumen</dt>
                <dd>{classDetail.afterNotes.summary ?? "Sin resumen"}</dd>
              </div>
              <div className="staff-class__after-item">
                <dt>Grabación</dt>
                <dd>
                  {classDetail.afterNotes.recordingUrl ? (
                    <a href={classDetail.afterNotes.recordingUrl} target="_blank" rel="noreferrer">
                      {classDetail.afterNotes.recordingUrl.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "Sin grabación"
                  )}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="platform-card" aria-labelledby="contenido">
          <div className="staff-class__card-head">
            <h2 id="contenido" className="platform-card__title">
              Contenido
            </h2>
            <p className="staff-class__card-meta">
              Lo prepara {classDetail.teacher.displayName}. Lo ves como lo verán los alumnos.
            </p>
          </div>
          {classDetail.blocks.length > 0 ? (
            <ClassContentRenderer blocks={classDetail.blocks} groups="byVisibility" />
          ) : (
            <EmptyState title="Esta clase no tiene contenido" description="El profesor lo prepara desde su panel." />
          )}
        </section>
      </div>

      <aside className="staff-class__lane" aria-label="Datos de la clase">
        <section className="staff-class__fact">
          <div className="staff-class__fact-head">
            <h2 className="staff-class__fact-label">Horario</h2>
            {editable.reschedule && (
              <RescheduleClassButton
                variant="row"
                classId={classDetail.id}
                classTitle={classDetail.title}
                startIso={classDetail.startIso}
                durationMin={classDetail.durationMin}
                teacherId={classDetail.teacher.id}
                teacherName={classDetail.teacher.displayName}
                timeZone={timeZone}
                nowIso={nowIso}
                rescheduleClass={rescheduleClass}
                loadTeacherBusy={loadTeacherBusy}
              />
            )}
          </div>
          <p className="staff-class__fact-value">
            {formatClassWhen({ start, durationMin: classDetail.durationMin, timeZone, now })} ·{" "}
            {classDetail.durationMin} min
          </p>
        </section>
        <section className="staff-class__fact">
          <div className="staff-class__fact-head">
            <h2 className="staff-class__fact-label">Profesor</h2>
            {editable.changeTeacher && (
              <ChangeTeacherButton
                classId={classDetail.id}
                classTitle={classDetail.title}
                current={classDetail.teacher}
                teachers={teachers}
                setClassTeacher={setClassTeacher}
              />
            )}
          </div>
          <p className="staff-class__fact-value">
            {classDetail.teacher.displayName}
            {!classDetail.teacher.isActive && (
              <span className="platform-tag platform-tag_variant_warning">Desactivado</span>
            )}
          </p>
        </section>
        <section className="staff-class__fact">
          <div className="staff-class__fact-head">
            <h2 className="staff-class__fact-label">Reunión</h2>
            {editable.changeMeeting && (
              <MeetingLinkButton
                classId={classDetail.id}
                classTitle={classDetail.title}
                current={classDetail.meeting}
                timeZone={timeZone}
                nowIso={nowIso}
                setMeeting={setClassMeeting}
              />
            )}
          </div>
          {classDetail.meeting.meetingUrl ? (
            <>
              <p className="staff-class__fact-value">
                {classDetail.meeting.providerLabel ? `${classDetail.meeting.providerLabel} · ` : ""}
                <a href={classDetail.meeting.meetingUrl} target="_blank" rel="noreferrer" className="staff-class__link">
                  {classDetail.meeting.meetingUrl.replace(/^https?:\/\//, "")}
                </a>
              </p>
              {classDetail.meeting.effectiveVisibleFromIso && (
                <p className="staff-class__fact-line">
                  Los alumnos lo ven desde las{" "}
                  {formatClassHours(new Date(classDetail.meeting.effectiveVisibleFromIso), 0, timeZone).split("–")[0]}
                  {formatClassDay(new Date(classDetail.meeting.effectiveVisibleFromIso), timeZone, now) !==
                  formatClassDay(start, timeZone, now)
                    ? ` del ${formatClassDay(new Date(classDetail.meeting.effectiveVisibleFromIso), timeZone, now)}`
                    : ""}
                  .
                </p>
              )}
            </>
          ) : (
            <p className="staff-class__fact-value staff-class__fact-value_tone_muted">Sin enlace</p>
          )}
        </section>
        <section className="staff-class__fact">
          <h2 className="staff-class__fact-label">Historial</h2>
          <ClassHistory entries={classDetail.history} />
        </section>
      </aside>
    </div>
  );
}
