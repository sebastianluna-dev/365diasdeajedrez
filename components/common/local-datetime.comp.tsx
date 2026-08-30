"use client";

import { useSyncExternalStore } from "react";

interface LocalDateTimeProps {
  /** Instante en ISO (UTC) tal y como se guardó. */
  iso: string;
  /** Texto ya formateado en el servidor: es lo que se pinta hasta hidratar. */
  fallback: string;
  /** Con `false` se muestra sólo la fecha, sin la hora. */
  withTime?: boolean;
}

// Suscripción vacía: el valor sólo cambia entre servidor y cliente, nunca después.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Fecha y hora en la zona horaria del navegador. Las clases se guardan en UTC
 * y el servidor no conoce la zona del alumno, así que se pinta el texto del
 * servidor y se sustituye al hidratar: sin desajustes de hidratación y con una
 * fecha correcta aunque el JavaScript no llegue a ejecutarse.
 */
export function LocalDateTime({ iso, fallback, withTime = true }: LocalDateTimeProps) {
  const isHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const date = new Date(iso);
  const canFormat = isHydrated && !Number.isNaN(date.getTime());
  const label = canFormat
    ? new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(date)
    : fallback;

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
