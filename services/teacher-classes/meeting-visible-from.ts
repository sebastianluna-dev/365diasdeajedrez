/** The link opens half an hour early by default. */
const MEETING_VISIBLE_LEAD_MS = 30 * 60 * 1000;

/**
 * The instant a class's meeting link becomes visible to its students, as it is
 * stored: the one the teacher chose (`chosen`), or half an hour before the
 * class. The instant belongs to the link, so a class without one stores none,
 * chosen or not: an instant without a link promised the student a link that
 * did not exist, and the teacher's page said «Enlace visible desde …» about
 * nothing. Adding the link later, from the edit form, sets the instant then.
 */
export function meetingVisibleFrom(meetingUrl: string | null, scheduledAt: Date, chosen: Date | null): Date | null {
  if (meetingUrl === null) return null;
  return chosen ?? new Date(scheduledAt.getTime() - MEETING_VISIBLE_LEAD_MS);
}
