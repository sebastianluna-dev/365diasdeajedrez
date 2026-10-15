import type { ClassStatusCode, TranscriptStatusCode } from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";

export interface StaffClassSummary {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  scheduledAtIso: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  participantCount: number;
  attendedCount: number;
  href: string;
}

export interface StaffClassFilters {
  teacherId?: string;
  statusCode?: ClassStatusCode;
  from?: Date;
  to?: Date;
  q?: string;
}

export interface StaffClassParticipant {
  userId: string;
  displayName: string;
  email: string;
  /** Null is «Sin pasar lista». */
  attended: boolean | null;
  /** How the seat is covered: «Pago del … · $… MXN[ · referencia]», «Gratis» or «Sin pago». */
  seatLabel: string;
}

export interface StaffClassDetail {
  id: string;
  title: string;
  description?: string;
  teacherName: string;
  scheduledAtIso: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  meetingProviderLabel?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  summary?: string;
  participants: StaffClassParticipant[];
  /** Every block, with the student's renderer, each carrying when the student sees it. */
  blocks: ClassBlockView[];
  transcript?: { statusLabel: string; statusCode: TranscriptStatusCode; text?: string };
}
