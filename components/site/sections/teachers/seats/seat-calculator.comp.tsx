"use client";

import { useId, useState, type FormEvent } from "react";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { seatPriceMessage } from "../teachers-messages";
import "./seat-calculator.comp.css";

/** Seats drawn one by one; past it, the rest is said in words. */
const MAX_DRAWN = 100;
/** Seats of the other teacher drawn in their box. */
const MAX_OTHERS = 10;

const LIMITS = { individual: 40, group: 60 } as const;

interface SeatCalculatorProps {
  /** The academy's WhatsApp, country code first (`site-settings`). */
  whatsappNumber: string;
}

const seatsWord = (count: number) => (count === 1 ? "asiento" : "asientos");

/**
 * The seats calculator (the owner's «Asientos · calculadora A»). Seats are
 * not built yet (docs → Platform → Pending decisions): one seat per active
 * teacher–student relation, so a group of six uses six and a student shared
 * with another teacher uses one of each. There is no public price: «Pide tu
 * precio» opens WhatsApp with the numbers, and the form says so.
 */
export function SeatCalculator({ whatsappNumber }: SeatCalculatorProps) {
  const id = useId();
  const [individual, setIndividual] = useState(8);
  const [group, setGroup] = useState(10);
  const [sharedChoice, setSharedChoice] = useState(3);
  const [asked, setAsked] = useState(false);

  const total = individual + group;
  const shared = Math.min(sharedChoice, total);
  const drawn = Math.min(total, MAX_DRAWN);
  const others = Math.min(shared, MAX_OTHERS);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(buildWhatsappUrl(whatsappNumber, seatPriceMessage(individual, group)), "_blank", "noopener");
    setAsked(true);
  }

  return (
    <form className="seat-calculator" aria-labelledby={`${id}-title`} onSubmit={handleSubmit}>
      <div className="seat-calculator__inputs">
        <h3 className="seat-calculator__heading" id={`${id}-title`}>
          Tus alumnos activos
        </h3>
        <div className="seat-calculator__field">
          <label className="seat-calculator__label" htmlFor={`${id}-individual`}>
            Sólo en clases individuales
            <output className="seat-calculator__value" htmlFor={`${id}-individual`}>
              {individual}
            </output>
          </label>
          <input
            className="seat-calculator__range"
            id={`${id}-individual`}
            type="range"
            min={0}
            max={LIMITS.individual}
            value={individual}
            onChange={(event) => setIndividual(Number(event.target.value))}
            aria-describedby={`${id}-individual-help`}
          />
          <p className="seat-calculator__help" id={`${id}-individual-help`}>
            Los que toman clase contigo, uno a uno.
          </p>
        </div>
        <div className="seat-calculator__field">
          <label className="seat-calculator__label" htmlFor={`${id}-group`}>
            En tus grupales
            <output className="seat-calculator__value" htmlFor={`${id}-group`}>
              {group}
            </output>
          </label>
          <input
            className="seat-calculator__range"
            id={`${id}-group`}
            type="range"
            min={0}
            max={LIMITS.group}
            value={group}
            onChange={(event) => setGroup(Number(event.target.value))}
            aria-describedby={`${id}-group-help`}
          />
          <p className="seat-calculator__help" id={`${id}-group-help`}>
            Si uno toma individual y grupal contigo, cuéntalo una vez.
          </p>
        </div>
        <div className="seat-calculator__field">
          <label className="seat-calculator__label" htmlFor={`${id}-shared`}>
            De todos, con otro profesor también
            <output className="seat-calculator__value" htmlFor={`${id}-shared`}>
              {shared}
            </output>
          </label>
          <input
            className="seat-calculator__range"
            id={`${id}-shared`}
            type="range"
            min={0}
            max={total}
            value={shared}
            disabled={total === 0}
            onChange={(event) => setSharedChoice(Number(event.target.value))}
            aria-describedby={`${id}-shared-help`}
          />
          <p className="seat-calculator__help" id={`${id}-shared-help`}>
            No cambia tu cuenta: usan uno tuyo y uno del otro profesor.
          </p>
        </div>
      </div>

      <div className="seat-calculator__map">
        <div className="seat-calculator__map-head">
          <h3 className="seat-calculator__heading">Tus asientos</h3>
          <span className="seat-calculator__concept">Dibujo de ejemplo</span>
        </div>
        <ul className="seat-calculator__legend" aria-hidden="true">
          <li className="seat-calculator__legend-item">
            <i className="seat-calculator__seat seat-calculator__seat_kind_individual seat-calculator__seat_size_legend" />
            Individual
          </li>
          <li className="seat-calculator__legend-item">
            <i className="seat-calculator__seat seat-calculator__seat_kind_group seat-calculator__seat_size_legend" />
            Grupal
          </li>
          <li className="seat-calculator__legend-item">
            <i className="seat-calculator__shared-dot" />
            También con otro profesor
          </li>
        </ul>
        <div
          className="seat-calculator__seats"
          role="img"
          aria-label={`${total} ${seatsWord(total)} tuyos: ${individual} de clases individuales y ${group} de grupales; ${shared} de ellos también tienen otro profesor`}
        >
          {Array.from({ length: drawn }, (_, index) => (
            <i
              key={index}
              className={`seat-calculator__seat seat-calculator__seat_kind_${index < individual ? "individual" : "group"}${index >= total - shared ? " seat-calculator__seat_shared" : ""}`}
            />
          ))}
        </div>
        <p className="seat-calculator__more">
          {total > MAX_DRAWN ? `Y ${total - MAX_DRAWN} más.` : total === 0 ? "Sin alumnos, sin asientos." : ""}
        </p>
        <div className="seat-calculator__other">
          <div className="seat-calculator__other-copy">
            <strong className="seat-calculator__other-title">Del otro profesor</strong>
            <span className="seat-calculator__other-text">
              {shared === 0
                ? "Ninguno de tus alumnos tiene otro profesor."
                : `${shared} ${shared === 1 ? "asiento suyo, que no te cuenta a ti." : "asientos suyos, que no te cuentan a ti."}`}
            </span>
          </div>
          <div
            className="seat-calculator__seats seat-calculator__seats_size_small"
            role="img"
            aria-label={`${shared} ${seatsWord(shared)} del otro profesor`}
          >
            {Array.from({ length: others }, (_, index) => (
              <i key={index} className="seat-calculator__seat seat-calculator__seat_kind_other" />
            ))}
          </div>
        </div>
      </div>

      <div className="seat-calculator__result">
        <div aria-live="polite">
          <span className="seat-calculator__need">Necesitas</span>
          <strong className="seat-calculator__total">{total}</strong>
          <span className="seat-calculator__total-word">{seatsWord(total)}</span>
        </div>
        <p className="seat-calculator__price">
          <strong className="seat-calculator__price-title">Precio por asiento, por definir</strong>
          Te lo damos por WhatsApp, con tus números.
        </p>
        <p className="seat-calculator__note">
          Tú llevas el control de lo que te pagan; la plataforma no cobra a tus alumnos.
        </p>
        <div className="seat-calculator__actions">
          <button type="submit" className="seat-calculator__ask">
            <WhatsappIcon className="seat-calculator__ask-icon" />
            Pide tu precio
          </button>
          <a className="seat-calculator__demo" href="#demo">
            <CalendarIcon className="seat-calculator__demo-icon" variant="classic-solid" />
            Agenda una demo
          </a>
          <p className="seat-calculator__asked" aria-live="polite">
            {asked
              ? `Abrimos WhatsApp con tus números (${total} ${seatsWord(total)}): envía el mensaje y te contestamos con tu precio.`
              : "Se abre WhatsApp con tus números, listo para enviar."}
          </p>
        </div>
      </div>
    </form>
  );
}
