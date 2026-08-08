"use client";

import Link from "next/link";
import { Footer } from "@/components/sections/common/footer.section";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { EmailIcon } from "@/components/icons/email-icon.comp";
import { ClockDial } from "@/components/sections/chess-clock/clock-dial.comp";
import { useCountdownTimer } from "@/hooks/use-countdown-timer.hook";
import "./cta.section.css";

const STICKY_CTA_DURATION_SECONDS = 900;

export function CtaSection() {
  const { time, seconds, hands } = useCountdownTimer(STICKY_CTA_DURATION_SECONDS);

  return (
    <>
      <div className="sticky-cta">
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
            <Link className="sticky-cta__link" href="https://w.app/365diasdeajedrez">
              <WhatsappIcon className="sticky-cta__link-icon" />
              WhatsApp
            </Link>
            <Link className="sticky-cta__link" href="mailto:contacto@365diasdeajedrez.com">
              <EmailIcon className="sticky-cta__link-icon" />
              Email
            </Link>
            <Link href="/#planes" className="sticky-cta__link sticky-cta__link_variant_primary">
              Únete a la academia
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
