import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { mdButton } from "@/lib/material/material-classes";
import type { StudentBalanceView } from "@/services/classes/classes.types";
import "./paid-classes-card.comp.css";

interface PaidClassesCardProps {
  /** What the student has, counted from their payments; null without a payment. */
  balance: StudentBalanceView | null;
  /** «Escríbenos», with the message written. */
  whatsappHref: string;
}

/** Up to this many classes are drawn one square each; more read as the counts alone. */
const MAX_SQUARES = 16;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * «Tus clases pagadas» as counts, in the new design system (2026-10-23, the
 * side column of «Mis clases»): how many classes the student still has, one
 * small square per class — taken, scheduled, to schedule, without dates or
 * titles —, the same counts in words, that they do not expire, and the way
 * to ask for more. Never an amount, and never which payment a class belongs
 * to: the student reads classes, not packages. Its heading names it; it is
 * no landmark, so it can sit on a page twice (the overview) without two
 * regions of one name.
 */
export function PaidClassesCard({ balance, whatsappHref }: PaidClassesCardProps) {
  const total = balance ? balance.taken + balance.scheduled + balance.toSchedule : 0;
  const squares = balance && total > 0 && total <= MAX_SQUARES;
  const counts = balance
    ? [
        ...(balance.scheduled > 0 ? [plural(balance.scheduled, "programada", "programadas")] : []),
        ...(balance.toSchedule > 0 ? [`${balance.toSchedule} por programar`] : []),
      ]
    : [];

  return (
    <div className="paid-classes">
      <h2 className="paid-classes__title">Tus clases pagadas</h2>
      {balance ? (
        <>
          <p className="paid-classes__figure">
            {balance.left === 0 ? (
              "Sin clases por tomar"
            ) : (
              <>
                <b className="paid-classes__number">{balance.left}</b>
                {balance.left === 1 ? "clase por tomar" : "clases por tomar"}
              </>
            )}
          </p>
          {squares && (
            <ol className="paid-classes__squares" aria-label="Tus clases pagadas, una casilla por clase">
              {Array.from({ length: balance.taken }, (_, index) => (
                <li key={`t${index}`} className="paid-classes__square paid-classes__square_kind_taken">
                  <CheckIcon variant="classic-solid" className="paid-classes__square-icon" />
                  <span className="paid-classes__sr">Tomada</span>
                </li>
              ))}
              {Array.from({ length: balance.scheduled }, (_, index) => (
                <li key={`s${index}`} className="paid-classes__square paid-classes__square_kind_scheduled">
                  <CalendarIcon variant="classic-solid" className="paid-classes__square-icon" />
                  <span className="paid-classes__sr">Programada</span>
                </li>
              ))}
              {Array.from({ length: balance.toSchedule }, (_, index) => (
                <li key={`o${index}`} className="paid-classes__square paid-classes__square_kind_to-schedule">
                  <CalendarClockIcon variant="classic-solid" className="paid-classes__square-icon" />
                  <span className="paid-classes__sr">Por programar</span>
                </li>
              ))}
            </ol>
          )}
          {counts.length > 0 && <p className="paid-classes__counts">{counts.join(" · ")}</p>}
          <p className="paid-classes__note">Tus clases pagadas no caducan.</p>
        </>
      ) : (
        <p className="paid-classes__note">Todavía no tienes clases pagadas.</p>
      )}
      <a href={whatsappHref} target="_blank" rel="noreferrer" className={`${mdButton("text", "sm")} paid-classes__ask`}>
        <WhatsappIcon className="platform-md-icon" />
        {balance ? "¿Quieres más clases? Escríbenos" : "¿Quieres clases? Escríbenos"}
        <span className="paid-classes__sr">(se abre en una pestaña nueva)</span>
      </a>
    </div>
  );
}
