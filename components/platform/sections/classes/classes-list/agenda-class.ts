import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { formatClassDay, formatClassHours, formatClassLength } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData } from "@/services/classes/classes.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** What the agenda draws of an upcoming class: its hours, how it is joined and where. */
export interface AgendaClass {
  startHour: string;
  endHour: string;
  /** «1 h», «45 min». */
  length: string;
  /** «Hoy · jue 22 oct», «Mañana · vie 23 oct», «Dom 25 oct». */
  stubDay: string;
  isToday: boolean;
  join: ClassCardData["join"];
  state: ReturnType<typeof meetingJoinState>;
  /** The link is open and the student may see it: «Entrar a la clase». */
  entering: boolean;
  /** «16:50»: when the link opens. */
  opensAt: string;
  /** «Zoom», «En línea», «Por confirmar». */
  room: string;
}

/** An upcoming class as the agenda reads it, in the class's time zone. */
export function agendaClass(card: ClassCardData): AgendaClass {
  const start = new Date(card.startIso);
  const now = new Date(card.nowIso);
  const [startHour = "", endHour = ""] = formatClassHours(start, card.durationMin, card.timeZone).split("–");
  const key = dayKeyIn(start, card.timeZone);
  const day = formatClassDay(start, card.timeZone, now);
  const isToday = key === dayKeyIn(now, card.timeZone);
  const isTomorrow = key === dayKeyIn(new Date(now.getTime() + DAY_MS), card.timeZone);
  const join = card.cancelled ? null : card.join;
  const state = join ? meetingJoinState(join) : "closed";
  return {
    startHour,
    endHour,
    length: formatClassLength(card.durationMin),
    stubDay: isToday ? `Hoy · ${day}` : isTomorrow ? `Mañana · ${day}` : capitalize(day),
    isToday,
    join,
    state,
    entering: join !== null && join.meetingUrl !== null && (state === "open" || state === "live" || state === "tail"),
    opensAt: join?.visibleFromIso
      ? (formatClassHours(new Date(join.visibleFromIso), 0, card.timeZone).split("–")[0] ?? "")
      : "",
    room: join?.providerLabel ?? (join?.hasLink ? "En línea" : "Por confirmar"),
  };
}
