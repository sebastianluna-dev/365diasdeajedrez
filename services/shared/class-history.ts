import { formatClassDay, formatClassStamp } from "@/lib/format-class-when";
import { joinSpanish } from "./class-rules";

// The history of a class, as the staff's record lists it: who created it and
// with what, who was added, each reschedule, the cancellation, the close with
// its marks, every change of a mark the staff made, and every seat given
// another date. Read from the columns the writers keep (who and when), never
// from a log of its own. Pure module: receives the rows and `now`.

export interface HistorySeat {
  studentName: string;
  addedAt: Date;
  addedByName: string | null;
  /** «pago del jue 1 oct» when the seat spends one; null when free or unpaid. */
  paymentLabel: string | null;
  isFree: boolean;
}

export interface HistoryMark {
  studentName: string;
  attended: boolean;
}

export interface HistoryChange {
  at: Date;
  byName: string | null;
  studentName: string;
  from: boolean | null;
  to: boolean;
  reason: string | null;
  isOverride: boolean;
}

export interface HistoryMove {
  at: Date;
  byName: string | null;
  studentName: string;
  /** When the seat went to, or null when it went back to its payment. */
  toStart: Date | null;
}

export interface ClassHistoryInput {
  createdAt: Date;
  createdByName: string | null;
  seats: HistorySeat[];
  reschedule: { at: Date; byName: string | null; previous: Date; current: Date; note: string | null } | null;
  cancel: { at: Date; byName: string | null; reason: string | null } | null;
  close: { at: Date; byName: string | null; marks: HistoryMark[] } | null;
  changes: HistoryChange[];
  moves: HistoryMove[];
}

export interface ClassHistoryEntry {
  atIso: string;
  /** «lun 12 oct, 18:05». */
  stamp: string;
  text: string;
}

const SOMEBODY = "Administración";
const minute = (date: Date) => Math.floor(date.getTime() / 60_000);
const word = (attended: boolean) => (attended ? "asistió" : "faltó");
const quoted = (attended: boolean | null) => (attended === null ? "«Sin marca»" : attended ? "«Asistió»" : "«Faltó»");

/**
 * The entries in the order they happened. Seats added by the same person in
 * the same minute make one line; one seat added in the minute the class was
 * created is said with the creation («creó la clase con el pago de …»).
 */
export function buildClassHistory(input: ClassHistoryInput, timeZone: string, now: Date): ClassHistoryEntry[] {
  const entries: { at: Date; text: string }[] = [];
  const creator = input.createdByName ?? SOMEBODY;
  const createdMinute = minute(input.createdAt);
  const atCreation = input.seats.filter((seat) => minute(seat.addedAt) === createdMinute);

  if (atCreation.length === 1 && atCreation[0]) {
    const seat = atCreation[0];
    const how = seat.paymentLabel
      ? `con el ${seat.paymentLabel} de ${seat.studentName}`
      : seat.isFree
        ? `gratis para ${seat.studentName}`
        : `para ${seat.studentName}, sin pago`;
    entries.push({ at: input.createdAt, text: `${creator} creó la clase ${how}` });
  } else {
    entries.push({ at: input.createdAt, text: `${creator} creó la clase` });
  }

  const groups = new Map<string, HistorySeat[]>();
  for (const seat of input.seats) {
    if (atCreation.length === 1 && seat === atCreation[0]) continue;
    const key = `${minute(seat.addedAt)}:${seat.addedByName ?? ""}`;
    groups.set(key, [...(groups.get(key) ?? []), seat]);
  }
  for (const seats of groups.values()) {
    const first = seats[0];
    if (!first) continue;
    entries.push({
      at: first.addedAt,
      text: `${first.addedByName ?? SOMEBODY} agregó a ${joinSpanish(seats.map((seat) => seat.studentName))}`,
    });
  }

  if (input.reschedule) {
    const { at, byName, previous, current, note } = input.reschedule;
    entries.push({
      at,
      text: `${byName ?? SOMEBODY} reprogramó la clase del ${formatClassDay(previous, timeZone, now)} al ${formatClassDay(current, timeZone, now)}${note ? ` · «${note}»` : ""}`,
    });
  }

  if (input.close) {
    const marks = input.close.marks.map((mark) => `${mark.studentName}: ${word(mark.attended)}`);
    entries.push({
      at: input.close.at,
      text: `${input.close.byName ?? SOMEBODY} finalizó la clase${marks.length > 0 ? ` · ${marks.join(" · ")}` : ""}`,
    });
  }

  for (const change of input.changes) {
    entries.push({
      at: change.at,
      text: `${change.byName ?? SOMEBODY} cambió la asistencia de ${change.studentName}: ${quoted(change.from)} → ${quoted(change.to)}${change.reason ? ` · «${change.reason}»` : ""}`,
    });
  }

  for (const move of input.moves) {
    entries.push({
      at: move.at,
      text: move.toStart
        ? `${move.byName ?? SOMEBODY} reprogramó la clase de ${move.studentName} al ${formatClassDay(move.toStart, timeZone, now)}`
        : `${move.byName ?? SOMEBODY} devolvió la clase de ${move.studentName} a su pago`,
    });
  }

  if (input.cancel) {
    entries.push({
      at: input.cancel.at,
      text: `${input.cancel.byName ?? SOMEBODY} canceló la clase${input.cancel.reason ? ` · «${input.cancel.reason}»` : ""}`,
    });
  }

  return entries
    .sort((left, right) => left.at.getTime() - right.at.getTime())
    .map((entry) => ({
      atIso: entry.at.toISOString(),
      stamp: formatClassStamp(entry.at, timeZone, now),
      text: entry.text,
    }));
}
