"use client";

import Link from "next/link";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { ClockDial } from "@/components/sections/chess-clock/clock-dial.comp";
import { useCountdownTimer } from "@/hooks/use-countdown-timer.hook";
import "./cta.section.css";

const STICKY_CTA_DURATION_SECONDS = 900;

export function CtaSection() {
  const { time, seconds, hands } = useCountdownTimer(STICKY_CTA_DURATION_SECONDS);

  return (
    <section className="sticky-cta">
      <div className="sticky-cta__inner">
        <div className="sticky-cta__clock">
          <ClockDial compact hands={hands} active flagged={false} lowTime={seconds <= 60} />
          <span className="sticky-cta__clock-time">{time}</span>
        </div>
        <div className="sticky-cta__copy">
          <p className="sticky-cta__title">Se acaba el tiempo.</p>
          <p className="sticky-cta__subtitle">No te quedes sin tu lugar en la academia.</p>
        </div>
        <div className="sticky-cta__actions">
          <Link
            className="sticky-cta__link sticky-cta__link_variant_primary"
            href="https://wa.me/522291348338?text=Hola%2C+me+gustar%C3%ADa+recibir+informaci%C3%B3n+sobre+la+Academia+365+D%C3%ADas+de+Ajedrez.+Quisiera+conocer+m%C3%A1s+sobre+las+clases+y+los+planes.+%C2%A1Gracias%21"
            target="_blank"
          >
            <WhatsappIcon className="sticky-cta__link-icon" />
            Habla con el maestro
          </Link>
        </div>
      </div>
    </section>
  );
}
