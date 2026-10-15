import type { PopupFormState } from "@/services/shared/form-state";

// What the meeting-link popup is about, as data: the sections map a class to
// it, a row carries it in its action, and the popup draws its fields from it.

/** A class's link as it stands, and when the class is, for the «visible from» choices. */
export interface MeetingLinkCurrent {
  meetingUrl: string | null;
  /** The instant the staff CHOSE for the link to open, or null for the default (half an hour before). */
  visibleFromIso: string | null;
  startIso: string;
  durationMin: number;
}

/** `setClassMeeting` of the staff's actions, bound by the popup to its class. */
export type SetMeetingAction = (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
