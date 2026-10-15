"use client";

import { useRef } from "react";
import { BanIcon } from "@/components/icons/ban-icon.comp";
import { FinalizeClassButton } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.comp";
import type { FinalizeClassAction } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.types";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import type { RegisterPaymentPopupProps } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { CLASS_FORMAT, CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { formatClassWhen } from "@/lib/format-class-when";
import { staffRoutes } from "@/lib/platform-routes";
import { planCancellation } from "@/services/shared/class-rules";
import type { PopupFormState } from "@/services/shared/form-state";
import type { SchedulableStudent, StaffClassDetail } from "@/services/staff-classes/staff-classes.types";
import type { BusySlotView, OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import { AddStudentsButton } from "./add-students-popup/add-students-popup.comp";
import { RescheduleClassButton } from "./reschedule-class-popup/reschedule-class-popup.comp";
import { RescheduleSeatButton } from "./reschedule-seat-popup/reschedule-seat-popup.comp";

export interface ClassHeaderActionsProps {
  classDetail: StaffClassDetail;
  teachers: TeacherOption[];
  students: SchedulableStudent[];
  groupClasses: OpenGroupClassOption[];
  /** The server actions, as functions; stubs in Storybook. */
  actions: {
    addClassParticipants: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
    rescheduleClass: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
    cancelClass: (classId: string, formData: FormData) => Promise<void>;
    rescheduleStudentSeat: (
      classId: string,
      studentId: string,
      prev: PopupFormState,
      formData: FormData,
    ) => Promise<PopupFormState>;
    loadTeacherBusy: (teacherId: string) => Promise<BusySlotView[]>;
    registerPayment: RegisterPaymentPopupProps["registerPayment"];
    loadPaymentContext: RegisterPaymentPopupProps["loadPaymentContext"];
    finalizeClassAsStaff: FinalizeClassAction;
  };
}

/**
 * The actions in the head of a class's record, by phase (§2.4 of the plan):
 * ahead of time, «Agregar alumnos» (the accent, in a group class with a
 * seat free), «Reprogramar» and «Cancelar la clase»; once it ended and
 * waits, «Finalizar la clase en nombre de …» (D1) beside the cancellation;
 * finished, the accent
 * is «Reprogramar» when exactly one student missed and was not moved, or
 * «Registrar pago» when a seat has none. The «…» always offers «Duplicar».
 * The cancellation (ADM-5) is a confirmation mounted as a sibling, with the
 * reason and the note the students read.
 */
export function ClassHeaderActions({
  classDetail,
  teachers,
  students,
  groupClasses,
  actions,
}: ClassHeaderActionsProps) {
  const cancel = useRef<PlatformConfirmPopupHandle>(null);
  const { editable, counts, seats, teacher, timeZone, nowIso } = classDetail;
  const seated = seats.filter((seat) => !seat.moved);
  const seatsFree =
    classDetail.formatCode === CLASS_FORMAT.GROUP
      ? Math.max(0, (classDetail.capacity ?? 0) - counts.seated)
      : counts.seated === 0
        ? 1
        : 0;
  const noShows = seated.filter((seat) => seat.can.moveSeat);
  const unpaid = seated.find((seat) => seat.can.register);
  const when = formatClassWhen({
    start: new Date(classDetail.startIso),
    durationMin: classDetail.durationMin,
    timeZone,
    now: new Date(nowIso),
  });
  const consequences = planCancellation({
    phase: classDetail.phase,
    teacherName: teacher.displayName,
    seats: seated.map((seat) => ({ studentName: seat.displayName, coverage: seat.coverage.kind })),
  });

  return (
    <>
      {editable.addStudents && seatsFree > 0 && (
        <AddStudentsButton
          classId={classDetail.id}
          classTitle={classDetail.title}
          seatsFree={seatsFree}
          seatedIds={seated.map((seat) => seat.userId)}
          students={students}
          teacher={teacher}
          addClassParticipants={actions.addClassParticipants}
        />
      )}
      {editable.reschedule && (
        <RescheduleClassButton
          classId={classDetail.id}
          classTitle={classDetail.title}
          startIso={classDetail.startIso}
          durationMin={classDetail.durationMin}
          teacherId={teacher.id}
          teacherName={teacher.displayName}
          timeZone={timeZone}
          nowIso={nowIso}
          rescheduleClass={actions.rescheduleClass}
          loadTeacherBusy={actions.loadTeacherBusy}
        />
      )}
      {editable.finalize && classDetail.phase === CLASS_PHASE.AWAITING_CLOSE && (
        <FinalizeClassButton
          variant="accent"
          mode="staff"
          label={`Finalizar en nombre de ${teacher.displayName}`}
          action={actions.finalizeClassAsStaff}
          {...classDetail.finalize}
        />
      )}
      {editable.moveSeat && noShows.length === 1 && noShows[0] && (
        <RescheduleSeatButton
          variant="accent"
          classId={classDetail.id}
          student={{ id: noShows[0].userId, displayName: noShows[0].displayName }}
          context={noShows[0].moveContext}
          startIso={classDetail.startIso}
          durationMin={classDetail.durationMin}
          teacher={teacher}
          teachers={teachers}
          groupClasses={groupClasses}
          hasPayment={noShows[0].coverage.kind === "paid"}
          timeZone={timeZone}
          nowIso={nowIso}
          rescheduleStudentSeat={actions.rescheduleStudentSeat}
        />
      )}
      {editable.moveSeat && noShows.length !== 1 && unpaid && (
        <RegisterPaymentButton
          variant="accent"
          fixedStudent={{ id: unpaid.userId, displayName: unpaid.displayName, email: unpaid.email }}
          preset={{ cover: [classDetail.id] }}
          teachers={teachers}
          groupClasses={groupClasses}
          timeZone={timeZone}
          nowIso={nowIso}
          registerPayment={actions.registerPayment}
          loadPaymentContext={actions.loadPaymentContext}
          loadTeacherBusy={actions.loadTeacherBusy}
        />
      )}
      {editable.cancel && (
        <button
          type="button"
          className="platform-button platform-button_variant_danger"
          onClick={(event) => cancel.current?.open(event)}
        >
          <BanIcon variant="classic-solid" className="platform-button__icon" />
          Cancelar la clase
        </button>
      )}
      <PlatformActionsMenu
        label="Más acciones"
        items={[{ label: "Duplicar", href: staffRoutes.newClass({ duplicar: classDetail.id }) }]}
      />
      {editable.cancel && (
        <PlatformConfirmPopup
          ref={cancel}
          verb="Cancelar"
          subject={classDetail.title}
          description={`La clase del ${when} con ${teacher.displayName} sale de la agenda. Sus alumnos la verán como cancelada.`}
          consequences={consequences}
          fields={[
            {
              name: "reason",
              label: "Motivo",
              required: true,
              maxLength: 300,
              hint: "Lo ven administración y el profesor.",
            },
            { name: "note", label: "Mensaje para los alumnos", maxLength: 300, hint: "Lo leen en la clase cancelada." },
          ]}
          action={actions.cancelClass.bind(null, classDetail.id)}
          confirmLabel="Cancelar la clase"
        />
      )}
    </>
  );
}
