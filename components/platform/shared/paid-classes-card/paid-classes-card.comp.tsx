import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import type { StudentBalanceView } from "@/services/classes/classes.types";
import "./paid-classes-card.comp.css";

interface PaidClassesCardProps {
  /** What the student has, counted from their payments; null without a payment. */
  balance: StudentBalanceView | null;
  /** «Escríbenos», with the message written. */
  whatsappHref: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * «Tus clases pagadas»: how many classes the student still has, the
 * sentence that says of which payment and how they stand, the bar of the
 * taken, the scheduled and the ones to schedule, and the way to ask for
 * more. Never an amount: a payment is a day and a count of classes.
 */
export function PaidClassesCard({ balance, whatsappHref }: PaidClassesCardProps) {
  const total = balance ? balance.taken + balance.scheduled + balance.toSchedule : 0;
  const share = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return (
    <section className="platform-card paid-classes" aria-labelledby="clases-pagadas">
      <h2 id="clases-pagadas" className="platform-card__title">
        Tus clases pagadas
      </h2>
      {balance ? (
        <>
          <p className="paid-classes__figure">
            {balance.left === 0 ? "Sin clases por tomar" : `${plural(balance.left, "clase", "clases")} por tomar`}
          </p>
          <p className="paid-classes__line">{balance.line}</p>
          <div
            className="paid-classes__bar"
            role="img"
            aria-label={`${plural(balance.taken, "tomada", "tomadas")}, ${plural(balance.scheduled, "programada", "programadas")} y ${balance.toSchedule} por programar`}
          >
            <span
              className="paid-classes__segment paid-classes__segment_kind_taken"
              style={{ width: `${share(balance.taken)}%` }}
            />
            <span
              className="paid-classes__segment paid-classes__segment_kind_scheduled"
              style={{ width: `${share(balance.scheduled)}%` }}
            />
          </div>
          <ul className="paid-classes__legend" aria-hidden="true">
            <li className="paid-classes__key paid-classes__key_kind_taken">
              {plural(balance.taken, "tomada", "tomadas")}
            </li>
            <li className="paid-classes__key paid-classes__key_kind_scheduled">
              {plural(balance.scheduled, "programada", "programadas")}
            </li>
            <li className="paid-classes__key paid-classes__key_kind_to-schedule">{balance.toSchedule} por programar</li>
          </ul>
          <p className="paid-classes__note">
            {balance.toSchedule > 0
              ? `${balance.toSchedule === 1 ? "La que falta la programa" : "Las que faltan las programa"} administración contigo. `
              : ""}
            Tus clases pagadas no caducan.
          </p>
        </>
      ) : (
        <p className="paid-classes__line">Todavía no tienes clases pagadas.</p>
      )}
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="paid-classes__ask">
        <WhatsappIcon className="paid-classes__ask-icon" />
        {balance ? "¿Quieres más clases? Escríbenos" : "¿Quieres clases? Escríbenos"}
        <span className="paid-classes__sr">(se abre en una pestaña nueva)</span>
      </a>
    </section>
  );
}
