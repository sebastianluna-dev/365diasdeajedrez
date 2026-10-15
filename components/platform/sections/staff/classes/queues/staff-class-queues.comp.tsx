import Link from "next/link";
import type { MeetingLinkPopupProps } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.comp";
import { MeetingLinkButton } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.comp";
import type { RegisterPaymentPopupProps } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import type { ScheduleSeatPopupProps } from "@/components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp";
import { ScheduleSeatPopup } from "@/components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp";
import type { StaffQueuesView } from "@/services/staff-classes/staff-classes.types";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import "./staff-class-queues.comp.css";

export interface StaffClassQueuesProps {
  queues: StaffQueuesView;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  timeZone: string;
  nowIso: string;
  /** The server actions the rows' launchers need; stubs in Storybook. */
  actions: {
    scheduleSeat: ScheduleSeatPopupProps["scheduleSeat"];
    setMeeting: MeetingLinkPopupProps["setMeeting"];
    registerPayment: RegisterPaymentPopupProps["registerPayment"];
    loadPaymentContext: RegisterPaymentPopupProps["loadPaymentContext"];
    loadTeacherBusy: RegisterPaymentPopupProps["loadTeacherBusy"];
  };
}

/**
 * What needs the staff's attention, beside the agenda (ADM-1): the paid
 * classes without a date, the classes nobody finalized, the ones without a
 * link, the seats without a payment, the classes of a deactivated teacher,
 * and the students with one class or none left. Each row's action opens its
 * popup in place. Three cards that fold, open by default.
 */
export function StaffClassQueues({ queues, teachers, groupClasses, timeZone, nowIso, actions }: StaffClassQueuesProps) {
  const payment = {
    teachers,
    groupClasses,
    timeZone,
    nowIso,
    registerPayment: actions.registerPayment,
    loadPaymentContext: actions.loadPaymentContext,
    loadTeacherBusy: actions.loadTeacherBusy,
  };
  const attention =
    queues.toFinalize.length + queues.noLink.length + queues.unpaid.length + queues.inactiveTeacher.length;
  const toScheduleCount = queues.toSchedule.reduce((total, seat) => total + seat.count, 0);

  return (
    <div className="staff-class-queues">
      <details className="staff-class-queues__card" open>
        <summary className="staff-class-queues__summary">
          <span className="staff-class-queues__title">Por programar</span>
          <span className="staff-class-queues__meta">
            {toScheduleCount === 0
              ? "Ninguna clase pagada sin fecha"
              : `${toScheduleCount} clase${toScheduleCount === 1 ? "" : "s"} pagada${toScheduleCount === 1 ? "" : "s"} sin fecha`}
          </span>
        </summary>
        {queues.toSchedule.length > 0 && (
          <ul className="staff-class-queues__rows">
            {queues.toSchedule.map((seat) => (
              <li key={seat.paymentId} className="staff-class-queues__row">
                <span className="staff-class-queues__text">
                  <Link href={seat.href} className="staff-class-queues__name">
                    {seat.studentName}
                  </Link>
                  <span className="staff-class-queues__line">{seat.label}</span>
                </span>
                <ScheduleSeatPopup
                  paymentId={seat.paymentId}
                  studentName={seat.studentName}
                  seatLabel={seat.seatLabel}
                  teachers={teachers}
                  rhythm={seat.rhythm}
                  groupClasses={groupClasses}
                  timeZone={timeZone}
                  nowIso={nowIso}
                  scheduleSeat={actions.scheduleSeat}
                  launcherClassName="platform-row-action"
                />
              </li>
            ))}
          </ul>
        )}
      </details>

      <details className="staff-class-queues__card" open>
        <summary className="staff-class-queues__summary">
          <span className="staff-class-queues__title">Necesitan atención</span>
          <span className="staff-class-queues__meta">{attention === 0 ? "Nada pendiente" : attention}</span>
        </summary>
        {queues.toFinalize.length > 0 && (
          <Group label="Por finalizar:">
            {queues.toFinalize.map((item) => (
              <li
                key={item.classId}
                className={`staff-class-queues__row${item.warning ? " staff-class-queues__row_tone_warning" : ""}`}
              >
                <span className="staff-class-queues__text">
                  <Link href={item.href} className="staff-class-queues__name">
                    {item.title}
                  </Link>
                  <span className="staff-class-queues__line">{item.line}</span>
                </span>
                <Link href={item.href} className="platform-row-action">
                  Ver
                </Link>
              </li>
            ))}
          </Group>
        )}
        {queues.noLink.length > 0 && (
          <Group label="Sin enlace:">
            {queues.noLink.map((item) => (
              <li key={item.classId} className="staff-class-queues__row">
                <span className="staff-class-queues__text">
                  <Link href={item.href} className="staff-class-queues__name">
                    {item.title}
                  </Link>
                  <span className="staff-class-queues__line">{item.line}</span>
                </span>
                <MeetingLinkButton
                  label="Agregar"
                  classId={item.classId}
                  classTitle={item.title}
                  current={item.current}
                  timeZone={timeZone}
                  nowIso={nowIso}
                  setMeeting={actions.setMeeting}
                />
              </li>
            ))}
          </Group>
        )}
        {queues.unpaid.length > 0 && (
          <Group label="Sin pago:">
            {queues.unpaid.map((item) => (
              <li key={`${item.classId}:${item.student.id}`} className="staff-class-queues__row">
                <span className="staff-class-queues__text">
                  <span className="staff-class-queues__name">
                    {item.student.displayName} en{" "}
                    <Link href={item.href} className="staff-class-queues__name">
                      {item.title}
                    </Link>
                  </span>
                  <span className="staff-class-queues__line">{item.line}</span>
                </span>
                <RegisterPaymentButton
                  variant="row"
                  label="Registrar"
                  fixedStudent={item.student}
                  preset={{ cover: [item.classId] }}
                  {...payment}
                />
              </li>
            ))}
          </Group>
        )}
        {queues.inactiveTeacher.length > 0 && (
          <Group label="Profesor desactivado:">
            {queues.inactiveTeacher.map((item) => (
              <li key={item.classId} className="staff-class-queues__row staff-class-queues__row_tone_warning">
                <span className="staff-class-queues__text">
                  <Link href={item.href} className="staff-class-queues__name">
                    {item.title}
                  </Link>
                  <span className="staff-class-queues__line">{item.line}</span>
                </span>
                <Link href={item.href} className="platform-row-action">
                  Ver
                </Link>
              </li>
            ))}
          </Group>
        )}
      </details>

      <details className="staff-class-queues__card" open>
        <summary className="staff-class-queues__summary">
          <span className="staff-class-queues__title">Por renovar</span>
          <span className="staff-class-queues__meta">
            {queues.toRenew.length === 0 ? "A nadie le falta renovar" : "Les queda 1 clase o ninguna"}
          </span>
        </summary>
        {queues.toRenew.length > 0 && (
          <ul className="staff-class-queues__rows">
            {queues.toRenew.map((item) => (
              <li key={item.student.id} className="staff-class-queues__row">
                <span className="staff-class-queues__text">
                  <Link href={item.href} className="staff-class-queues__name">
                    {item.student.displayName}
                  </Link>
                  <span className="staff-class-queues__line">{item.line}</span>
                </span>
                <RegisterPaymentButton variant="row" label="Registrar" fixedStudent={item.student} {...payment} />
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="staff-class-queues__group">
      <p className="staff-class-queues__group-label">{label}</p>
      <ul className="staff-class-queues__rows">{children}</ul>
    </div>
  );
}
