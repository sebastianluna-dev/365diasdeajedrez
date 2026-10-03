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
// Pure module: the teacher's actions write with it, and both the student's
// and the teacher's mappers read with it.

/** The link opens half an hour early by default. */
const MEETING_VISIBLE_LEAD_MS = 30 * 60 * 1000;

/**
 * What `Class.meetingUrlVisibleFrom` stores, its only writer: the instant the
 * teacher chose, or null for the default — and null, chosen or not, for a
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
