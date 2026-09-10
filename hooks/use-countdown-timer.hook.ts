import { useEffect, useRef, useState } from "react";
import { formatTime, handAngles } from "./use-chess-clock.hook";

interface CountdownTimer {
  time: string;
  seconds: number;
  hands: { hour: number; min: number; sec: number };
}

/**
 * Countdown that starts over when it reaches zero.
 *
 * `tickMs` is how often it re-renders, not the precision: the remaining time
 * is always computed with `Date.now()`, so a slow tick does not make the
 * clock lag. A clock showing `mm:ss` needs no more than one tick per second;
 * at 100 ms it would re-render ten times a second for the whole visit.
 */
export function useCountdownTimer(durationSeconds: number, tickMs = 100): CountdownTimer {
  const [remaining, setRemaining] = useState(durationSeconds);
  // Initialised inside the effect: Date.now() during render is impure.
  const lastTick = useRef(0);

  useEffect(() => {
    lastTick.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setRemaining((current) => {
        const next = current - dt;
        return next <= 0 ? durationSeconds : next;
      });
    }, tickMs);
    return () => clearInterval(timer);
  }, [durationSeconds, tickMs]);

  return { time: formatTime(remaining), seconds: remaining, hands: handAngles(remaining) };
}
