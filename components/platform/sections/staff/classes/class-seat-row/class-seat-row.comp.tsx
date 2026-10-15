import { AttendanceRow } from "@/components/platform/shared/attendance-row/attendance-row.comp";
import type { RegisterPaymentPopupProps } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { formatClassWhen } from "@/lib/format-class-when";
import type { PopupFormState } from "@/services/shared/form-state";
import type { StaffClassDetail, StaffSeatView } from "@/services/staff-classes/staff-classes.types";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import { ChangeAttendanceButton } from "../change-attendance-popup/change-attendance-popup.comp";
import { RescheduleSeatButton } from "../reschedule-seat-popup/reschedule-seat-popup.comp";
import { RemoveSeatButton } from "./remove-seat-button.comp";
import "./class-seat-row.comp.css";

export interface ClassSeatRowProps {
  seat: StaffSeatView;
  classDetail: Pick<StaffClassDetail, "id" | "title" | "startIso" | "durationMin" | "timeZone" | "nowIso" | "teacher">;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  /** Who is acting, for «por Staff Demo» in ADM-9. */
  staffName: string;
  /** The server actions, as functions; stubs in Storybook. */
  actions: {
    removeClassParticipant: (classId: string, studentId: string, formData: FormData) => Promise<void>;
    changeAttendanceAsStaff: (
      classId: string,
      studentId: string,
      prev: PopupFormState,
      formData: FormData,
    ) => Promise<PopupFormState>;
    rescheduleStudentSeat: (
      classId: string,
      studentId: string,
      prev: PopupFormState,
      formData: FormData,
    ) => Promise<PopupFormState>;
    registerPayment: RegisterPaymentPopupProps["registerPayment"];
    loadPaymentContext: RegisterPaymentPopupProps["loadPaymentContext"];
    loadTeacherBusy: RegisterPaymentPopupProps["loadTeacherBusy"];
  };
}

/**
 * One seat of a class in the staff's record: the student, their email and
 * how the seat is covered, their mark as `AttendanceRow` reads it, and the
 * words at the end — «Registrar» for a seat without a payment, «Quitar»
 * while the class has not started, and after it «Cambiar» (the mark) and
 * «Reprogramar» (a no-show's seat). A Server Component; the words are
 * client leaves with their popups.
 */
export function ClassSeatRow({ seat, classDetail, teachers, groupClasses, staffName, actions }: ClassSeatRowProps) {
  const when = formatClassWhen({
    start: new Date(classDetail.startIso),
    durationMin: classDetail.durationMin,
    timeZone: classDetail.timeZone,
    now: new Date(classDetail.nowIso),
  });
  const consequence =
    seat.coverage.kind === "paid"
      ? `Su clase vuelve a su ${seat.coverage.label.split(" · ")[0]?.replace(/^Pago/, "pago")}.`
      : seat.coverage.kind === "free"
        ? "Tenía la clase gratis."
        : "No tenía pago.";
  const markedBy = seat.markedByName
    ? `${seat.markedByName} marcó ${seat.attended === null ? "«Sin marca»" : seat.attended ? "«Asistió»" : "«Faltó»"}`
    : "sin pasar lista";

  return (
    <div className={`class-seat-row${seat.moved ? " class-seat-row_state_moved" : ""}`}>
      <AttendanceRow
        student={{ id: seat.userId, displayName: seat.displayName }}
        details={[seat.email, seat.coverage.label]}
        mark={seat.mark}
        mode="read"
      />
      {(seat.can.register || seat.can.remove || seat.can.changeAttendance || seat.can.moveSeat) && (
        <div className="class-seat-row__actions">
          {seat.can.register && (
            <RegisterPaymentButton
              variant="row"
              label="Registrar"
              fixedStudent={{ id: seat.userId, displayName: seat.displayName, email: seat.email }}
              preset={{ cover: [classDetail.id] }}
              teachers={teachers}
              groupClasses={groupClasses}
              timeZone={classDetail.timeZone}
              nowIso={classDetail.nowIso}
              registerPayment={actions.registerPayment}
              loadPaymentContext={actions.loadPaymentContext}
              loadTeacherBusy={actions.loadTeacherBusy}
            />
          )}
          {seat.can.changeAttendance && (
            <ChangeAttendanceButton
              classId={classDetail.id}
              student={{ id: seat.userId, displayName: seat.displayName }}
              context={`${classDetail.title} · ${when} · ${markedBy}`}
              attended={seat.attended}
              teacherName={classDetail.teacher.displayName}
              staffName={staffName}
              changeAttendance={actions.changeAttendanceAsStaff}
            />
          )}
          {seat.can.moveSeat && (
            <RescheduleSeatButton
              classId={classDetail.id}
              student={{ id: seat.userId, displayName: seat.displayName }}
              context={seat.moveContext}
              startIso={classDetail.startIso}
              durationMin={classDetail.durationMin}
              teacher={classDetail.teacher}
              teachers={teachers}
              groupClasses={groupClasses}
              hasPayment={seat.coverage.kind === "paid"}
              timeZone={classDetail.timeZone}
              nowIso={classDetail.nowIso}
              rescheduleStudentSeat={actions.rescheduleStudentSeat}
            />
          )}
          {seat.can.remove && (
            <RemoveSeatButton
              studentName={seat.displayName}
              classTitle={classDetail.title}
              whenLabel={when}
              consequence={consequence}
              action={actions.removeClassParticipant.bind(null, classDetail.id, seat.userId)}
            />
          )}
        </div>
      )}
    </div>
  );
}
