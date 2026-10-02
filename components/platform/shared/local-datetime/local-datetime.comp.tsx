"use client";

import { useSyncExternalStore } from "react";

interface LocalDateTimeProps {
  /** Instant in ISO (UTC) exactly as stored. */
  iso: string;
  /** Text already formatted on the server: it is what is rendered until hydration. */
  fallback: string;
  /** With `false` only the date is shown, without the time. */
  withTime?: boolean;
}

// Empty subscription: the value only changes between server and client, never afterwards.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Date and time in the browser's time zone. Classes are stored in UTC and
 * the server does not know the student's zone, so the server's text is
 * rendered and replaced on hydration: no hydration mismatches and a correct
 * date even if the JavaScript never runs.
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
