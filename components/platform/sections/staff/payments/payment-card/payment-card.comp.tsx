import Link from "next/link";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import type { RegisterPaymentPopupProps } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import {
  ScheduleSeatPopup,
  type ScheduleSeatPopupProps,
} from "@/components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp";
import type { PopupFormState } from "@/services/shared/form-state";
import type {
  OpenGroupClassOption,
  RhythmDefaults,
  StaffPaymentView,
  TeacherOption,
} from "@/services/staff-payments/staff-payments.types";
import { PaymentCardMenu } from "./payment-card-menu.comp";
import "./payment-card.comp.css";

export interface PaymentCardProps {
  payment: StaffPaymentView;
  student: { id: string; displayName: string; teacherName: string | null };
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  rhythm: RhythmDefaults;
  timeZone: string;
  nowIso: string;
  /** The server actions, as functions: the section imports them, the stories pass stubs. */
  actions: {
    scheduleSeat: ScheduleSeatPopupProps["scheduleSeat"];
    deletePayment: (paymentId: string, formData: FormData) => Promise<void>;
    updatePayment: (paymentId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
    registerPayment: RegisterPaymentPopupProps["registerPayment"];
    loadPaymentContext: RegisterPaymentPopupProps["loadPaymentContext"];
    loadTeacherBusy: RegisterPaymentPopupProps["loadTeacherBusy"];
  };
}

function attendanceLabel(attended: boolean | null): string | null {
  if (attended === null) return null;
  return attended ? "Asistió" : "Faltó";
}

/**
 * One payment of a student: what it was, and every class it covers in
 * order — «clase n de m» —, with the ones still to date as rows that offer
 * «Programar». A payment every class of which was given opens folded. The
 * «…» menu edits it or deletes it.
 */
export function PaymentCard({
  payment,
  student,
  teachers,
  groupClasses,
  rhythm,
  timeZone,
  nowIso,
  actions,
}: PaymentCardProps) {
  const seatLabel = (ordinal: number) =>
    `Clase ${ordinal} de ${payment.classCount} del pago del ${payment.paidOnLabel}${student.teacherName ? ` · Profesor: ${student.teacherName}` : ""}`;
  const facts = [
    payment.perClassLabel,
    payment.reference,
    payment.recordedByName ? `Registrado por ${payment.recordedByName}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const body = (
    <ol className="payment-card__seats">
      {payment.seats.map((seat) => (
        <li key={seat.classId} className={`payment-card__seat${seat.moved ? " payment-card__seat_state_moved" : ""}`}>
          <span className="payment-card__ordinal" aria-hidden="true">
            {seat.ordinal > 0 ? seat.ordinal : "·"}
          </span>
          <span className="payment-card__seat-when">
            <ClassWhen startIso={seat.startIso} durationMin={seat.durationMin} timeZone={timeZone} nowIso={nowIso} />
            {seat.replacesLabel && <span className="payment-card__seat-note"> · {seat.replacesLabel}</span>}
          </span>
          <Link href={seat.href} className="payment-card__seat-title">
            {seat.title}
          </Link>
          <span className="payment-card__seat-tags">
            <ClassStatusTag phase={seat.phase} audience="staff" />
            {seat.moved ? (
              <span className="platform-tag">{seat.moved.label}</span>
            ) : (
              attendanceLabel(seat.attended) && (
                <span className={`platform-tag${seat.attended ? " platform-tag_variant_success" : ""}`}>
                  {attendanceLabel(seat.attended)}
                </span>
              )
            )}
            {seat.isGroup && <span className="platform-tag">Grupal</span>}
          </span>
        </li>
      ))}
      {Array.from({ length: payment.toSchedule }, (_, index) => {
        const ordinal = payment.seats.filter((seat) => seat.ordinal > 0).length + index + 1;
        return (
          <li key={`later-${index}`} className="payment-card__seat payment-card__seat_state_later">
            <span className="payment-card__ordinal" aria-hidden="true">
              {ordinal}
            </span>
            <span className="payment-card__seat-when">Por programar</span>
            <span className="payment-card__seat-title">
              Clase {ordinal} de {payment.classCount}
            </span>
            <span className="payment-card__seat-tags">
              <ScheduleSeatPopup
                paymentId={payment.id}
                studentName={student.displayName}
                seatLabel={seatLabel(ordinal)}
                teachers={teachers}
                rhythm={rhythm}
                groupClasses={groupClasses}
                timeZone={timeZone}
                nowIso={nowIso}
                scheduleSeat={actions.scheduleSeat}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );

  return (
    <article className="payment-card" aria-label={`Pago del ${payment.paidOnLabel}`}>
      <header className="payment-card__head">
        <div className="payment-card__heading">
          <h3 className="payment-card__title">
            {payment.paidOnLabel} · {payment.amountLabel} · {payment.classCount} clase
            {payment.classCount === 1 ? "" : "s"}
          </h3>
          <p className="payment-card__facts">{facts}</p>
        </div>
        <PaymentCardMenu
          payment={payment}
          studentName={student.displayName}
          deletePayment={actions.deletePayment.bind(null, payment.id)}
          popup={{
            teachers,
            groupClasses,
            timeZone,
            nowIso,
            registerPayment: actions.registerPayment,
            updatePayment: actions.updatePayment,
            loadPaymentContext: actions.loadPaymentContext,
            loadTeacherBusy: actions.loadTeacherBusy,
          }}
        />
      </header>
      {payment.allTaken ? (
        <details className="payment-card__folded">
          <summary className="payment-card__summary">
            <span className="platform-tag platform-tag_variant_success">Todas tomadas</span>
            <span className="payment-card__summary-link">Ver sus {payment.classCount} clases</span>
          </summary>
          {body}
        </details>
      ) : (
        body
      )}
    </article>
  );
}
