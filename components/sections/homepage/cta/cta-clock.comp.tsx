"use client";

import { ClockDial } from "@/components/sections/chess-clock/clock-dial.comp";
import { useCountdownTimer } from "@/hooks/use-countdown-timer.hook";
import "./cta-clock.comp.css";

const STICKY_CTA_DURATION_SECONDS = 900;
/** Shows `mm:ss`: one tick per second is enough, and it is on screen for the whole visit. */
const STICKY_CTA_TICK_MS = 1000;

export function CtaClock() {
  const { time, seconds, hands } = useCountdownTimer(STICKY_CTA_DURATION_SECONDS, STICKY_CTA_TICK_MS);

  return (
    <div className="sticky-cta__clock">
      <ClockDial compact hands={hands} active flagged={false} lowTime={seconds <= 60} />
      <span className="sticky-cta__clock-time">{time}</span>
    </div>
  );
}
