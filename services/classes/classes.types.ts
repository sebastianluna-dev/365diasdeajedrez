import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import type {
  ClassBlockVisibilityCode,
  ClassPhaseCode,
  TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import type { StudentClassView } from "@/services/shared/class-phase";

// What the student's screens read. Never an amount, never a classmate's
// email: a class says who gives it, who else is in it by name, how the seat
// is covered in classes («Clase 2 de 4 de tu pago del 1 de octubre»), and
// what there is to prepare or to review.

/** A player of a game seen in class, for the strips around the board. */
export interface ClassGamePlayer {
  name: string;
  elo?: number;
  title?: string;
  /** FIDE's three-letter federation code. */
  country?: string;
}

/**
 * What every block carries: its visibility (to prepare, after the class, or
 * never: the teacher's script), its own title and whether it is new.
 */
interface ClassBlockBase {
  id: string;
  caption?: string;
  visibility: ClassBlockVisibilityCode;
  /** The block's heading; without one, the kind's own word or the material's name. */
  title?: string;
  /** Added after the class started and less than a week ago (`isNewClassBlock`): the «Nuevo» mark. */
  isNew?: boolean;
}

export type ClassBlockView =
  | (ClassBlockBase & { kind: "TEXT"; text: string })
  | (ClassBlockBase & { kind: "VIDEO"; videoUrl: string })
  | (ClassBlockBase & {
      kind: "GAME_REF";
      /** `href` only when the game lives in a study of the reader's; the transcribed one has nowhere to open. */
      game: {
        id: string;
        label: string;
        pgn: string;
        href?: string;
        movePath?: string;
        /** The strips around the board and the result, when the game's record has them. */
        players?: { white: ClassGamePlayer; black: ClassGamePlayer };
        result?: string;
        orientation?: "white" | "black";
        /** The study's «Ocultar los siguientes movimientos»: the next moves come out as the reader steps. */
        conceal?: boolean;
        pinnedComment?: string;
      };
    })
  | (ClassBlockBase & {
      kind: "LESSON_REF";
      lesson: {
        id: string;
        name: string;
        /** The lesson's content, to see it inside the class. */
        pgn: string;
        orientation: "white" | "black";
        href: string;
        movePath?: string;
        /** The lesson the block cited is gone: the block says so instead of drawing it. */
        missing?: boolean;
      };
    })
  | (ClassBlockBase & {
      kind: "POSITION_REF";
      position: { fen: string; orientation: "white" | "black"; title?: string };
    })
  | (ClassBlockBase & { kind: "FILE" });

export interface ClassTranscriptView {
  statusCode: TranscriptStatusCode;
  statusLabel: string;
  text?: string;
}

/** A class as the student's cards draw it: the featured one, a compact one, a past one. */
export interface ClassCardData {
  id: string;
  href: string;
  title: string;
  phase: ClassPhaseCode;
  startIso: string;
  durationMin: number;
  timeZone: string;
  nowIso: string;
  /** «con GM Profesor Demo», «con GM Profesor Demo · Grupal, con Mateo Ríos, Diego Salas y Lucía Herrera». */
  people: string;
  /** Blocks the student may see now: «2 para preparar» ahead, «4 bloques» after. */
  visibleBlocks: number;
  /** How to join; the featured card draws it. */
  join: MeetingJoinData | null;
  /** Once the class ended: whether they came and whether there is a recording. */
  past: { attended: boolean | null; hasRecording: boolean } | null;
  /** «No asististe · tu clase pasó al vie 9 oct», with the new class, or «… tu clase volvió a tu pago». */
  moved: { label: string; href: string | null } | null;
  /** «Es la reposición de tu clase del vie 2 oct.» */
  makeUpLabel: string | null;
  cancelled: boolean;
}

/** A paid class without a date yet. */
export interface UnscheduledClassData {
  paymentId: string;
  /** «de tu pago del 1 de octubre». */
  label: string;
}

export interface PastMonth {
  key: string;
  /** «Octubre 2026». */
  label: string;
  cards: ClassCardData[];
  /** The whole month is one payment, every class taken: «Las cuatro clases de tu pago del 3 de septiembre.» */
  foldedLabel: string | null;
}

/** What the student has, counted from their payments; never an amount. */
export interface StudentBalanceView {
  left: number;
  taken: number;
  scheduled: number;
  toSchedule: number;
  /** «Te quedan 3 clases de tu pago del 1 de octubre: 2 programadas y 1 por programar.» */
  line: string;
  whatsappHref: string;
}

export interface StudentClassesView {
  timeZone: string;
  nowIso: string;
  today: ClassCardData[];
  upcoming: ClassCardData[];
  unscheduled: UnscheduledClassData[];
  past: PastMonth[];
  pastTotal: number;
  pastShown: number;
  balance: StudentBalanceView | null;
  /** Today's class whose link is open, for the fixed bar. */
  joinOpen: MeetingJoinData | null;
}

export interface ClassDetailView {
  id: string;
  title: string;
  /** Ahead of time (the access card) or afterwards (the review). */
  view: StudentClassView;
  phase: ClassPhaseCode;
  description: string | null;
  teacherName: string;
  startIso: string;
  endIso: string;
  durationMin: number;
  timeZone: string;
  nowIso: string;
  people: string;
  classmates: string[];
  join: MeetingJoinData;
  /** «Clase 2 de 4 de tu pago del 1 de octubre · Individual», «Esta clase es gratis.», or null without a payment. */
  coverage: string | null;
  attended: boolean | null;
  moved: { label: string; href: string | null } | null;
  makeUp: { label: string; note: string | null } | null;
  /** «Reprogramada desde el mar 13 oct», with the staff's note. */
  rescheduled: { previousLabel: string; note: string | null } | null;
  /** The class was cancelled: the note the staff wrote, and whether the class went back to a payment. */
  cancelled: { note: string | null; returnedToPayment: boolean } | null;
  summary: string | null;
  recordingUrl: string | null;
  blocks: ClassBlockView[];
  transcript: ClassTranscriptView | null;
  /** «Te quedan 3 clases», for the foot of the review. */
  balanceLine: string | null;
  whatsappHref: string;
  href: string;
}
