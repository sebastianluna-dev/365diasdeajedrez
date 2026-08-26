"use client";

import { ClockDial } from "@/components/sections/chess-clock/clock-dial.comp";
import { useCountdownTimer } from "@/hooks/use-countdown-timer.hook";
import "./cta-clock.comp.css";

const STICKY_CTA_DURATION_SECONDS = 900;

export function CtaClock() {
  const { time, seconds, hands } = useCountdownTimer(STICKY_CTA_DURATION_SECONDS);

  return (
    <div className="sticky-cta__clock">
      <ClockDial compact hands={hands} active flagged={false} lowTime={seconds <= 60} />
      <span className="sticky-cta__clock-time">{time}</span>
    </div>
  );
}
