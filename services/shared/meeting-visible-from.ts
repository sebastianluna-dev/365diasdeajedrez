// When a class's meeting link becomes visible to its students.
//
// The teacher may choose the instant; if they do not, the link opens half an
// hour before the class. Only a CHOSEN instant is stored
// (`Class.meetingUrlVisibleFrom`): null with a link means the default, worked
// out whenever the class is read, so it moves with the class when the class
// moves, and the edit form can open on the instant the teacher chose — and
// stay empty when they chose none — instead of always empty, which replaced a
// chosen instant with the default on every save (until 2026-10-03).
//
// The instant belongs to the link: a class without one stores none and opens
// nothing, since an instant without a link promised the student a link that
// did not exist.
//
// The link also CLOSES: half an hour after the class ends nobody is coming
// back in, and a class that nobody finalized must not keep offering «Entrar a
// la clase» a day later (`meetingVisibleUntil`).
//
// Pure module: the staff's actions write with it (through
// `classMeetingColumns`), and the mappers of the student, the teacher and the
// staff read with it.

/** The link opens half an hour early by default, and stays half an hour after the end. */
const MEETING_VISIBLE_LEAD_MS = 30 * 60 * 1000;
const MEETING_VISIBLE_TAIL_MS = 30 * 60 * 1000;

/**
 * What `Class.meetingUrlVisibleFrom` stores, its only computation: the instant
 * the staff chose, or null for the default — and null, chosen or not, for a
 * class without a link.
 */
export function storedMeetingVisibleFrom(meetingUrl: string | null, chosen: Date | null): Date | null {
  return meetingUrl === null ? null : chosen;
}

/**
 * When the link opens: the stored instant, or half an hour before the class;
 * null for a class without a link, whatever the row stores (rows written
 * before 2026-10-02 may keep one).
 */
export function meetingVisibleFrom(meetingUrl: string | null, scheduledAt: Date, stored: Date | null): Date | null {
  if (meetingUrl === null) return null;
  return stored ?? new Date(scheduledAt.getTime() - MEETING_VISIBLE_LEAD_MS);
}

/**
 * When the link stops being offered: half an hour after the class ends. Past
 * it, the mappers send no link whatever the status says, and the student's
 * page turns to the review of the class.
 */
export function meetingVisibleUntil(endsAt: Date): Date {
  return new Date(endsAt.getTime() + MEETING_VISIBLE_TAIL_MS);
}

/**
 * The field «Los alumnos ven el enlace», as the forms offer it: minutes
 * before the start; «now» opens it at once; «keep» leaves what is chosen.
 */
export const MEETING_VISIBLE_OPTIONS = [
  { value: "30", label: "30 minutos antes de empezar" },
  { value: "60", label: "1 hora antes" },
  { value: "180", label: "3 horas antes" },
  { value: "1440", label: "El día anterior" },
  { value: "now", label: "Desde ahora" },
] as const;

/** The option a chosen instant matches, «30» for the default, «keep» when it is none of them. */
export function meetingVisibleOptionOf(chosen: Date | null, scheduledAt: Date): string {
  if (chosen === null) return "30";
  const minutes = Math.round((scheduledAt.getTime() - chosen.getTime()) / 60_000);
  return MEETING_VISIBLE_OPTIONS.some((option) => option.value === String(minutes)) ? String(minutes) : "keep";
}

/**
 * The instant to STORE for a form's choice: null for the default, `now` for
 * «Desde ahora», the minutes before the start otherwise, and what was chosen
 * for «keep». Null for a value that is none of those.
 */
export function meetingVisibleChoice(
  value: string,
  scheduledAt: Date,
  now: Date,
  kept: Date | null,
): { ok: true; chosen: Date | null } | { ok: false } {
  if (value === "30") return { ok: true, chosen: null };
  if (value === "now") return { ok: true, chosen: now };
  if (value === "keep") return { ok: true, chosen: kept };
  const option = MEETING_VISIBLE_OPTIONS.find((item) => item.value === value);
  if (!option) return { ok: false };
  return { ok: true, chosen: new Date(scheduledAt.getTime() - Number(value) * 60_000) };
}
