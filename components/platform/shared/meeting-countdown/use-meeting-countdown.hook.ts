"use client";

import { useEffect, useState } from "react";

/** How often the countdown looks at the clock: every quarter minute is enough for words in minutes. */
const TICK_MS = 15_000;

/**
 * The instant «now», ticking: it starts at the instant the page was read
 * (`nowIso`), so the server and the browser draw the same words, and moves
 * to the browser's clock once mounted, every fifteen seconds.
 */
export function useMeetingNow(nowIso: string): Date {
  const [now, setNow] = useState(() => new Date(nowIso));
  useEffect(() => {
    // The first tick comes soon after mounting, not in the effect itself, so
    // the browser's words appear without a second render in the same pass.
    const first = setTimeout(() => setNow(new Date()), 1_000);
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return now;
}

/** «20 min», «1 h 5 min», «2 días». */
export function formatLead(ms: number): string {
  const minutes = Math.max(0, Math.ceil(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h${minutes % 60 > 0 ? ` ${minutes % 60} min` : ""}`;
  const days = Math.floor(hours / 24);
  return `${days} día${days === 1 ? "" : "s"}`;
}
