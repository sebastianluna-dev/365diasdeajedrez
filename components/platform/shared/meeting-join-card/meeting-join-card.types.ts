import type { ClassPhaseCode } from "@/constants/platform/class-codes.const";

// What a join card is about, as data: the services map a class to it for
// the student, the teacher and the staff, and the card decides what to draw.

export interface MeetingJoinData {
  phase: ClassPhaseCode;
  /** The link as the reader may see it: null until the server lets it through (the student) or when there is none. */
  meetingUrl: string | null;
  /** The class has a link, whether or not the reader may see it yet. */
  hasLink: boolean;
  providerLabel: string | null;
  startIso: string;
  endIso: string;
  /** When the link opens and when it stops being offered; null without a link. */
  visibleFromIso: string | null;
  untilIso: string | null;
  nowIso: string;
  timeZone: string;
  /** «Escríbenos»: the academy's WhatsApp with the message written. */
  whatsappHref?: string;
}
