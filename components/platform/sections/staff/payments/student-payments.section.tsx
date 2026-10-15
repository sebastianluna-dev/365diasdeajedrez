import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { ScheduleSeatPopup } from "@/components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { scheduleSeat } from "@/services/staff-classes/staff-classes.actions";
import {
  deletePayment,
  loadPaymentContext,
  loadTeacherBusy,
  registerPayment,
  updatePayment,
} from "@/services/staff-payments/staff-payments.actions";
import type {
  OpenGroupClassOption,
  RhythmDefaults,
  StudentPaymentsView,
  TeacherOption,
} from "@/services/staff-payments/staff-payments.types";
import { PaymentCard } from "./payment-card/payment-card.comp";
import "./student-payments.section.css";

interface StudentPaymentsSectionProps {
  view: StudentPaymentsView;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  rhythm: RhythmDefaults;
  /** The success the address says, already in words, or the error's code. */
  notice?: string;
  errorCode?: string;
}

/**
 * «Pagos y clases» of a student (ADM-7): the balance in three figures, each
 * payment with its classes, and the classes that wait for a payment. The
 * section is a Server Component: it imports the actions and hands them to
 * the client pieces as props.
 */
export function StudentPaymentsSection({
  view,
  teachers,
  groupClasses,
  rhythm,
  notice,
  errorCode,
}: StudentPaymentsSectionProps) {
  const { balance, student, payments, unpaidSeats, timeZone, nowIso } = view;
  const actions = { scheduleSeat, deletePayment, updatePayment, registerPayment, loadPaymentContext, loadTeacherBusy };
  const popup = {
    teachers,
    groupClasses,
    timeZone,
    nowIso,
    registerPayment,
    updatePayment,
    loadPaymentContext,
    loadTeacherBusy,
  };
  const oldestToSchedule = [...payments].reverse().find((payment) => payment.toSchedule > 0);
  const left = balance.left;

  return (
    <div className="student-payments">
      {errorCode && <PlatformNotice message={STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid!} />}
      {notice && <PlatformNotice message={notice} variant="success" />}

      <section className="platform-card student-payments__balance" aria-labelledby="saldo">
        <h2 id="saldo" className="platform-card__title">
          Saldo
        </h2>
        <dl className="student-payments__figures">
          <div className="student-payments__figure">
            <dt className="student-payments__figure-label">por programar</dt>
            <dd className="student-payments__figure-value">{balance.toSchedule}</dd>
            {oldestToSchedule && (
              <dd className="student-payments__figure-action">
                <ScheduleSeatPopup
                  paymentId={oldestToSchedule.id}
                  studentName={student.displayName}
                  seatLabel={`Clase ${oldestToSchedule.seats.filter((seat) => seat.ordinal > 0).length + 1} de ${oldestToSchedule.classCount} del pago del ${oldestToSchedule.paidOnLabel}${student.teacherName ? ` · Profesor: ${student.teacherName}` : ""}`}
                  teachers={teachers}
                  rhythm={rhythm}
                  groupClasses={groupClasses}
                  timeZone={timeZone}
                  nowIso={nowIso}
                  scheduleSeat={scheduleSeat}
                />
              </dd>
            )}
          </div>
          <div className="student-payments__figure">
            <dt className="student-payments__figure-label">programadas</dt>
            <dd className="student-payments__figure-value">{balance.scheduled}</dd>
          </div>
          <div className="student-payments__figure">
            <dt className="student-payments__figure-label">tomadas</dt>
            <dd className="student-payments__figure-value">{balance.taken}</dd>
          </div>
        </dl>
        <p className="student-payments__balance-line">
          {left === 0
            ? "No le quedan clases pagadas."
            : `Le queda${left === 1 ? "" : "n"} ${left} clase${left === 1 ? "" : "s"}: ${balance.scheduled} programada${balance.scheduled === 1 ? "" : "s"} y ${balance.toSchedule} por programar.`}{" "}
          Las clases pagadas no caducan.
        </p>
      </section>

      {payments.length === 0 ? (
        <section className="platform-card">
          <h2 className="platform-card__title">Pagos</h2>
          <p className="student-payments__empty">Este alumno no tiene pagos registrados.</p>
        </section>
      ) : (
        <section className="student-payments__list" aria-label="Pagos">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              student={student}
              teachers={teachers}
              groupClasses={groupClasses}
              rhythm={rhythm}
              timeZone={timeZone}
              nowIso={nowIso}
              actions={actions}
            />
          ))}
        </section>
      )}

      {unpaidSeats.length > 0 && (
        <section className="platform-card student-payments__unpaid" aria-labelledby="sin-pago">
          <h2 id="sin-pago" className="platform-card__title">
            Clases sin pago
          </h2>
          <ul className="student-payments__unpaid-list">
            {unpaidSeats.map((seat) => (
              <li key={seat.classId} className="student-payments__unpaid-row">
                <span className="student-payments__unpaid-when">
                  <ClassWhen
                    startIso={seat.startIso}
                    durationMin={seat.durationMin}
                    timeZone={timeZone}
                    nowIso={nowIso}
                  />
                </span>
                <span className="student-payments__unpaid-title">{seat.title}</span>
                <ClassStatusTag phase={seat.phase} audience="staff" />
                <RegisterPaymentButton
                  variant="row"
                  label="Registrar"
                  preset={{ cover: [seat.classId] }}
                  fixedStudent={student}
                  {...popup}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
