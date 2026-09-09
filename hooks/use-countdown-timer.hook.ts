import { useEffect, useRef, useState } from "react";
import { formatTime, handAngles } from "./use-chess-clock.hook";

interface CountdownTimer {
  time: string;
  seconds: number;
  hands: { hour: number; min: number; sec: number };
}

/**
 * Cuenta atrás que vuelve a empezar al llegar a cero.
 *
 * `tickMs` es cada cuánto se re-renderiza, no la precisión: el tiempo restante
 * se calcula siempre con `Date.now()`, así que un tick lento no atrasa el
 * reloj. Un reloj que muestra `mm:ss` no necesita más de un tick por segundo;
 * a 100 ms se re-renderizaría diez veces por segundo durante toda la visita.
 */
export function useCountdownTimer(durationSeconds: number, tickMs = 100): CountdownTimer {
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
    }, tickMs);
    return () => clearInterval(timer);
  }, [durationSeconds, tickMs]);

  return { time: formatTime(remaining), seconds: remaining, hands: handAngles(remaining) };
}
