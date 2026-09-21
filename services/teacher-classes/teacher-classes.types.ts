import type {
  ClassBlockKindCode,
  ClassStatusCode,
  MeetingProviderCode,
  TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";

export interface TeacherClassSummary {
  id: string;
  title: string;
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

export interface TeacherClassParticipant {
  userId: string;
  displayName: string;
  email: string;
  attended: boolean;
  joinedAtIso?: string;
  /** The teacher does not manage payments at this stage; they only see whether one is recorded. */
  hasPayment: boolean;
}

/** Block exactly as the teacher edits it: raw data, not the student's render. */
export interface TeacherClassBlock {
  id: string;
  order: number;
  kind: ClassBlockKindCode;
  text?: string;
  videoUrl?: string;
  caption?: string;
  movePath?: string;
  /** Readable label of the referenced resource, if the block references something. */
  referenceLabel?: string;
  gameId?: string;
  /** Game transcribed in the block itself, if there is one. */
  pgn?: string;
  lessonId?: string;
  positionId?: string;
  /** The stored movePath no longer resolves against the resource's current PGN. */
  isMovePathBroken: boolean;
}

export interface TeacherClassDetail {
  id: string;
  title: string;
  description?: string;
  scheduledAtIso: string;
  /** Value for `<input type="datetime-local">`, in the teacher's zone. */
  scheduledAtInput: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  meetingProviderCode?: MeetingProviderCode;
  meetingProviderLabel?: string;
  /** The teacher ALWAYS sees the link: the hiding is a student rule. */
  meetingUrl?: string;
  meetingUrlVisibleFromIso?: string;
  recordingUrl?: string;
  summary?: string;
  participants: TeacherClassParticipant[];
  blocks: TeacherClassBlock[];
  transcript?: { statusCode: TranscriptStatusCode; statusLabel: string; hasText: boolean };
  href: string;
}

export interface ReferenceableGame {
  id: string;
  label: string;
}

export interface ReferenceableGameGroup {
  studyId: string;
  /** The database is the teacher's: they can annotate its games, not only cite them. */
  isOwn: boolean;
  /** "Mis estudios" or the name of the student who owns the database. */
  ownerLabel: string;
  studyName: string;
  games: ReferenceableGame[];
}

export interface PositionOption {
  id: string;
  label: string;
  fen: string;
}
