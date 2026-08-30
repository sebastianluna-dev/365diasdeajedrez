import { useEffect, useRef, useState } from "react";
import { formatTime, handAngles } from "./use-chess-clock.hook";

interface CountdownTimer {
  time: string;
  seconds: number;
  hands: { hour: number; min: number; sec: number };
}

export function useCountdownTimer(durationSeconds: number): CountdownTimer {
  const [remaining, setRemaining] = useState(durationSeconds);
  // Se inicializa dentro del efecto: Date.now() durante el render es impuro.
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
    }, 100);
    return () => clearInterval(timer);
  }, [durationSeconds]);

  return { time: formatTime(remaining), seconds: remaining, hands: handAngles(remaining) };
}
