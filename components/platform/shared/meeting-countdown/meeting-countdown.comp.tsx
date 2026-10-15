"use client";

import { formatClassHours } from "@/lib/format-class-when";
import { formatLead, useMeetingNow } from "./use-meeting-countdown.hook";
import { useRefreshAtInstants } from "./use-refresh-at-instants.hook";
import "./meeting-countdown.comp.css";

export interface MeetingCountdownProps {
  startIso: string;
  endIso: string;
  /** When the link opens; null without a link. */
  visibleFromIso: string | null;
  /** When the link stops being offered; null without a link. */
  untilIso: string | null;
  /** The page was read with the link at hand. */
  hasLink: boolean;
  nowIso: string;
  timeZone: string;
}

/** The words for an instant between the class's moments. */
export function meetingCountdownWords(
  input: Omit<MeetingCountdownProps, "nowIso" | "timeZone"> & { now: Date; timeZone: string },
): { line: string; live: string | null } {
  const now = input.now.getTime();
  const start = Date.parse(input.startIso);
  const end = Date.parse(input.endIso);
  const visibleFrom = input.visibleFromIso ? Date.parse(input.visibleFromIso) : null;
  const endHour = formatClassHours(new Date(input.endIso), 0, input.timeZone).split("–")[0] ?? "";
  if (now >= end) return { line: `La clase terminó a las ${endHour}.`, live: null };
  if (now >= start) return { line: `La clase ya empezó · termina a las ${endHour}`, live: "La clase ya empezó" };
  const lead = formatLead(start - now);
  if (visibleFrom !== null && now < visibleFrom) {
    return { line: `Empieza en ${lead} · el enlace se abre en ${formatLead(visibleFrom - now)}`, live: null };
  }
  const minutes = Math.ceil((start - now) / 60_000);
  return {
    line: `Empieza en ${lead}`,
    live:
      minutes <= 5
        ? `Faltan ${minutes} minuto${minutes === 1 ? "" : "s"}`
        : input.hasLink
          ? "El enlace ya está disponible"
          : null,
  };
}

/**
 * How long until the class, said in words that follow the clock: «Empieza
 * en 20 min», «La clase ya empezó», «La clase terminó a las 13:00.». The
 * only client leaf of a join card: it ticks, says the changes that matter
 * out loud in a live region, and asks the server for the page again at the
 * instants the class changes phase, which is how the link's button appears
 * without the link ever travelling ahead of time.
 */
export function MeetingCountdown({ nowIso, timeZone, ...input }: MeetingCountdownProps) {
  const now = useMeetingNow(nowIso);
  const instants = [input.visibleFromIso, input.startIso, input.endIso, input.untilIso].filter(
    (iso): iso is string => iso !== null,
  );
  const visibleFrom = input.visibleFromIso ? Date.parse(input.visibleFromIso) : null;
  const live = now.getTime() >= Date.parse(input.startIso) && now.getTime() < Date.parse(input.endIso);
  const linkOverdue =
    !input.hasLink && visibleFrom !== null && now.getTime() >= visibleFrom && now.getTime() < Date.parse(input.endIso);
  useRefreshAtInstants(instants, { live, retry: linkOverdue });

  const words = meetingCountdownWords({ ...input, now, timeZone });
  return (
    <span className="meeting-countdown">
      <span className="meeting-countdown__line">{words.line}</span>
      <span className="meeting-countdown__live" role="status" aria-live="polite">
        {words.live}
      </span>
    </span>
  );
}
