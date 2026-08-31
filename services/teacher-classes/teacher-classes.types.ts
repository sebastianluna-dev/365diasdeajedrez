import type { ClassBlockKindCode, ClassStatusCode, MeetingProviderCode, TranscriptStatusCode } from "@/constants/platform/class-codes.const";

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
  /** El profesor no gestiona pagos en esta fase; sólo ve si hay uno registrado. */
  hasPayment: boolean;
}

/** Bloque tal y como lo edita el profesor: datos crudos, no el render del alumno. */
export interface TeacherClassBlock {
  id: string;
  order: number;
  kind: ClassBlockKindCode;
  text?: string;
  videoUrl?: string;
  caption?: string;
  movePath?: string;
  /** Etiqueta legible del recurso referenciado, si el bloque referencia algo. */
  referenceLabel?: string;
  gameId?: string;
  lessonId?: string;
  positionId?: string;
  /** El movePath guardado ya no resuelve contra el PGN actual del recurso. */
  isMovePathBroken: boolean;
}

export interface TeacherClassDetail {
  id: string;
  title: string;
  description?: string;
  scheduledAtIso: string;
  /** Valor para `<input type="datetime-local">`, en la zona del profesor. */
  scheduledAtInput: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  meetingProviderCode?: MeetingProviderCode;
  meetingProviderLabel?: string;
  /** El profesor ve SIEMPRE el enlace: la ocultación es una regla del alumno. */
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
  /** «Mis estudios» o el nombre del alumno dueño de la base. */
  ownerLabel: string;
  studyName: string;
  games: ReferenceableGame[];
}

export interface LessonRefOption {
  id: string;
  /** Curso › Capítulo › Lección. */
  label: string;
}

export interface PositionOption {
  id: string;
  label: string;
  fen: string;
}
