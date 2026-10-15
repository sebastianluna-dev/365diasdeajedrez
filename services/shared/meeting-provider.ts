import { MEETING_PROVIDER, type MeetingProviderCode } from "@/constants/platform/class-codes.const";

// Which platform a meeting link belongs to, read from the link itself: nobody
// picks «Zoom» in a form any more, so a class can no longer say «Zoom» with
// no link or carry a link under the wrong name. The migration that filled
// `Class.meetingProviderId` from the old rows uses these same patterns in SQL.
//
// `Class.meetingProviderId` is computed only here (through
// `classMeetingColumns`); the catalog's `isActive` is read by whoever writes.

const ZOOM = /^https?:\/\/([a-z0-9-]+\.)*zoom\.us(\/|$)/i;
const MEET = /^https?:\/\/meet\.google\.com(\/|$)/i;

/** The provider of a link, OTHER for any other link, null without one. */
export function storedMeetingProvider(meetingUrl: string | null | undefined): MeetingProviderCode | null {
  const url = meetingUrl?.trim() ?? "";
  if (url.length === 0) return null;
  if (ZOOM.test(url)) return MEETING_PROVIDER.ZOOM;
  if (MEET.test(url)) return MEETING_PROVIDER.MEET;
  return MEETING_PROVIDER.OTHER;
}
