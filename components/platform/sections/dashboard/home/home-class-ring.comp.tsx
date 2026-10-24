"use client";

import { useMeetingNow } from "@/components/platform/shared/meeting-countdown/use-meeting-countdown.hook";
import { HOME_RING_WINDOW_MIN, minutesUntil } from "./home-class-lead.comp";
import "./home-class-ring.comp.css";

/** The ring's radius and its length, in the 140-unit square it is drawn in. */
const RADIUS = 58;
const LENGTH = 2 * Math.PI * RADIUS;

interface HomeClassRingProps {
  startIso: string;
  /** The instant the page was read, so the server and the browser draw the same. */
  nowIso: string;
}

/**
 * The countdown of today's class, in the focus (the owner's «Inicio»): in
 * the last hour before it starts, a ring that empties as the minutes go and
 * the minutes left in large figures in its middle. Before that hour and once
 * the class has started there is no ring: the line above says when. A leaf
 * of its own, because it follows the clock.
 */
export function HomeClassRing({ startIso, nowIso }: HomeClassRingProps) {
  const now = useMeetingNow(nowIso);
  const minutes = minutesUntil(startIso, now);
  if (minutes < 1 || minutes > HOME_RING_WINDOW_MIN) return null;
  const share = minutes / HOME_RING_WINDOW_MIN;
  const label = `Faltan ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;

  return (
    <div className="home-class-ring" role="img" aria-label={label}>
      <svg className="home-class-ring__svg" viewBox="0 0 140 140" aria-hidden="true">
        <circle className="home-class-ring__track" cx="70" cy="70" r={RADIUS} />
        <circle
          className="home-class-ring__arc"
          cx="70"
          cy="70"
          r={RADIUS}
          strokeDasharray={`${share * LENGTH} ${LENGTH}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <span className="home-class-ring__figure" aria-hidden="true">
        <b className="home-class-ring__minutes">{minutes}</b>
        <span className="home-class-ring__unit">{minutes === 1 ? "minuto" : "minutos"}</span>
      </span>
    </div>
  );
}
