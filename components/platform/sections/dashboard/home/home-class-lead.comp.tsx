"use client";

import { useMeetingNow } from "@/components/platform/shared/meeting-countdown/use-meeting-countdown.hook";
import { useRefreshAtInstants } from "@/components/platform/shared/meeting-countdown/use-refresh-at-instants.hook";
import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";

/** Under an hour to go, the words count the minutes and the ring shows them (`HomeClassRing`). */
export const HOME_RING_WINDOW_MIN = 60;

/** Whole minutes until the class starts, rounded up: «en 8 minutos» until the minute it starts. */
export function minutesUntil(startIso: string, now: Date): number {
  return Math.ceil((Date.parse(startIso) - now.getTime()) / 60_000);
}

/** What today's class is doing, in the words of the focus's line: «tu clase empieza en 8 minutos». */
export function homeClassLeadWords(join: Pick<MeetingJoinData, "startIso" | "endIso">, startHour: string, now: Date) {
  if (now.getTime() >= Date.parse(join.endIso)) return "tu clase terminó";
  if (now.getTime() >= Date.parse(join.startIso)) return "tu clase ya empezó";
  const minutes = minutesUntil(join.startIso, now);
  if (minutes > HOME_RING_WINDOW_MIN) return `tu clase es hoy a las ${startHour}`;
  return `tu clase empieza en ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

interface HomeClassLeadProps {
  join: MeetingJoinData;
  /** «18:00», in the class's time zone. */
  startHour: string;
}

/**
 * The words after «Lo siguiente ·» for today's class, following the clock,
 * and the page asked for again at each instant the class changes phase —
 * when the link opens, when it starts and ends —, which is how «Entrar a la
 * clase» appears without the link travelling ahead of time
 * (`useRefreshAtInstants`, as `MeetingCountdown` does). The only ticking
 * words of the focus; it starts at the instant the page was read, so the
 * server and the browser draw the same.
 */
export function HomeClassLead({ join, startHour }: HomeClassLeadProps) {
  const now = useMeetingNow(join.nowIso);
  const instants = [join.visibleFromIso, join.startIso, join.endIso, join.untilIso].filter(
    (iso): iso is string => iso !== null,
  );
  const live = now.getTime() >= Date.parse(join.startIso) && now.getTime() < Date.parse(join.endIso);
  useRefreshAtInstants(instants, { live });
  return <>{homeClassLeadWords(join, startHour, now)}</>;
}
