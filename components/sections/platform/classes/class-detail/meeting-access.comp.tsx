"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./meeting-access.comp.css";

interface MeetingAccessProps {
  /** Presente sólo cuando el servidor ya autorizó mostrar el enlace. */
  meetingUrl?: string;
  /** ISO de cuándo se hace visible el enlace (para la cuenta atrás). */
  meetingVisibleFromIso?: string;
  providerLabel?: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days} d ${hours} h ${minutes} min`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min ${seconds.toString().padStart(2, "0")} s`;
}

/**
 * Acceso a la videollamada. El enlace NUNCA llega al cliente antes de tiempo:
 * aquí sólo se pinta la cuenta atrás y, al llegar a cero, se refresca para que
 * el servidor lo entregue.
 */
export function MeetingAccess({ meetingUrl, meetingVisibleFromIso, providerLabel }: MeetingAccessProps) {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!meetingVisibleFromIso) return;
    const target = new Date(meetingVisibleFromIso).getTime();
    const tick = () => {
      const remaining = target - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) router.refresh();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [meetingVisibleFromIso, router]);

  return (
    <div className="meeting-access">
      {meetingUrl ? (
        <a href={meetingUrl} target="_blank" rel="noreferrer" className="platform-button">
          Entrar a la clase{providerLabel ? ` (${providerLabel})` : ""}
        </a>
      ) : meetingVisibleFromIso ? (
        <p className="meeting-access__countdown">
          El enlace estará disponible en {remainingMs === null ? "…" : formatRemaining(remainingMs)}
        </p>
      ) : (
        <p className="meeting-access__pending">El enlace de la videollamada aún no está disponible.</p>
      )}
    </div>
  );
}
