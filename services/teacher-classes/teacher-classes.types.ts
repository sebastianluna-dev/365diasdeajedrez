import type { AttendanceMarkView } from "@/components/platform/shared/attendance-row/attendance-row.types";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import type { FinalizeClassData } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.types";
import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import type {
  ClassBlockKindCode,
  ClassBlockVisibilityCode,
  ClassFormatCode,
  ClassPhaseCode,
} from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
import type { ClassEditable } from "@/services/shared/class-rules";

// What the teacher's class screens read. Never a payment: the teacher sees
// who is in the class and whether they came, and nothing about money.

export type TeacherClassesTab = "proximas" | "por-finalizar" | "pasadas" | "canceladas";

export interface TeacherClassesFilters {
  vista: TeacherClassesTab;
  q?: string;
  /** 1-based; «Ver más» adds a page. */
  pagina: number;
}

/** A class in the teacher's list: the row's data plus the table's own columns. */
export interface TeacherClassRow extends ClassRowData {
  /** «Diego Salas», «4 alumnos». */
  studentsLabel: string;
  /** «1 de 1», «—» before the list was passed. */
  attendanceLabel: string;
  /** «3 bloques», «Sin contenido». */
  materialLabel: string;
}

export interface TeacherClassesView {
  filters: TeacherClassesFilters;
  /** The zone the teacher reads in, and whether it fell back to the academy's. */
  timeZone: string;
  timeZoneMissing: boolean;
  nowIso: string;
  rows: TeacherClassRow[];
  total: number;
  page: number;
  pageSize: number;
  /** For the pill «Por finalizar · 1». */
  awaitingCloseCount: number;
}

export interface TeacherSeatView {
  userId: string;
  displayName: string;
  /** Their record, only when they are the teacher's student. */
  href: string | null;
  isAssigned: boolean;
  attended: boolean | null;
  mark: AttendanceMarkView;
}

/** A block exactly as the teacher edits it: raw data, not the student's render. */
export interface TeacherClassBlock {
  id: string;
  order: number;
  kind: ClassBlockKindCode;
  visibility: ClassBlockVisibilityCode;
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
  /** The topic, or «Clase de <alumno>» when it has none. */
  title: string;
  /** The topic as stored, for the form; "" when there is none. */
  topic: string;
  description: string | null;
  phase: ClassPhaseCode;
  formatCode: ClassFormatCode;
  isGroup: boolean;
  startIso: string;
  endIso: string;
  durationMin: number;
  timeZone: string;
  timeZoneMissing: boolean;
  nowIso: string;
  /** How the class is joined; the teacher always sees the link. */
  join: MeetingJoinData;
  /** «Alumno Demo lo ve desde las 11:30.», null without a link. */
  meetingVisibleLine: string | null;
  students: TeacherSeatView[];
  /** The blocks to edit. */
  blocks: TeacherClassBlock[];
  /** The same blocks as the student's renderer draws them, every visibility. */
  views: ClassBlockView[];
  afterNotes: {
    summary: string | null;
    recordingUrl: string | null;
    closedAtLabel: string | null;
    closedByName: string | null;
  };
  /** «Individual · 60 min · creada por Staff Demo el jue 1 oct». */
  adminLine: string;
  cancellation: { reason: string | null; note: string | null } | null;
  editable: ClassEditable;
  /** Whether the teacher may finalize now (the phase), and the popup's data. */
  canFinalize: boolean;
  finalize: FinalizeClassData;
  /** Whether any mark may still be changed by the teacher (a finished class, a seat not locked). */
  canChangeAttendance: boolean;
  whatsappHref: string;
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

/** A class ahead with a given student, where a game of theirs can be used. */
export interface UpcomingClassWith {
  id: string;
  title: string;
  /** «mié 21 oct · 12:00–13:00». */
  whenLabel: string;
  href: string;
}

/**
 * `fetchReferencePgn` of the teacher's actions, handed down as a prop: the PGN
 * of a game or lesson block's reference, for its position picker.
 */
export type FetchReferencePgn = (
  kind: Extract<ClassBlockKindCode, "GAME_REF" | "LESSON_REF">,
  id: string,
) => Promise<string | null>;
