import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import type {
  ClassBlockVisibilityCode,
  ClassPhaseCode,
  TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import type { StudentClassView } from "@/services/shared/class-phase";
import type { ExerciseMark } from "@/services/shared/exercise-marks";

// What the student's screens read. Never an amount, never a classmate's
// email, and never which payment a class belongs to: a class says who gives
// it, who else is in it by name, whether it is free, and what there is to
// prepare or to review; the balance is counts of classes.

/** A player of a game seen in class, for the strips around the board. */
export interface ClassGamePlayer {
  name: string;
  elo?: number;
  title?: string;
  /** FIDE's three-letter federation code. */
  country?: string;
}

/** How the student stands with an exercise of a class block, in THAT block (`exerciseMarksBy`); null untried. */
export type ClassExerciseMark = ExerciseMark | null;

/** An exercise of an EXERCISE block (D29), as the renderer lists it. */
export interface ClassBlockExerciseView {
  id: string;
  /** 1-based, among the exercises of the block the reader sees. */
  n: number;
  title: string;
  /** «Mate en 2 · 1400». */
  facts: string;
  startFen: string;
  orientation: "white" | "black";
  /** The student's mark in this block; null for a reader who does not solve (the teacher, the staff) or untried. */
  mark: ClassExerciseMark;
  /** Where «Resolver» leads: the student's, while they hold a seat not moved; absent for the teacher and the staff. */
  href?: string;
  /** «2 de 3 lo resolvieron»: the teacher's and the staff's count, never the student's. */
  solvedLabel?: string;
  /**
   * The exercise no longer reaches the students (archived, or taken out of the
   * library): the teacher and the staff see it marked; the student never sees it.
   */
  unavailable?: boolean;
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
  | (ClassBlockBase & { kind: "FILE" })
  /** One to ten exercises the student solves from the class (D29); a block none of whose exercises the reader sees is dropped. */
  | (ClassBlockBase & { kind: "EXERCISE"; exercises: ClassBlockExerciseView[] });

export interface ClassTranscriptView {
  statusCode: TranscriptStatusCode;
  statusLabel: string;
  text?: string;
}

/** The board of a past class's card: the position of its first chess block. */
export interface PastClassBoard {
  fen: string;
  orientation: "white" | "black";
  /** What the board shows, for its accessible name: the position's title, the game's players, the lesson. */
  label: string;
}

/** A class as the student's lists draw it: a ticket ahead of time, a card once it is over. */
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
  /** The ticket's fields: who gives it, whether it is a group class and who else is in it. */
  teacherName: string;
  isGroup: boolean;
  classmates: string[];
  /** Blocks the student may see now: «2 para preparar» ahead, «4 bloques» after. */
  visibleBlocks: number;
  /** How to join; the ticket draws it. */
  join: MeetingJoinData | null;
  /**
   * Once the class is over and counts as finished: whether they came, the
   * recording, the summary and the board of its first chess block (null
   * when the class has no position, game or lesson to show). Ahead of time
   * there is none of it: a ticket never shows the class's content.
   */
  past: {
    attended: boolean | null;
    hasRecording: boolean;
    summary: string | null;
    board: PastClassBoard | null;
  } | null;
  /** «No asististe · tu clase pasó al vie 9 oct», with the new class, or «… tu clase queda por programar». */
  moved: { label: string; href: string | null } | null;
  /** «Es la reposición de tu clase del vie 2 oct.» */
  makeUpLabel: string | null;
  cancelled: boolean;
  /** «Gratis», the only thing a card says about how a class is paid. */
  isFree: boolean;
}

export interface PastMonth {
  key: string;
  /** «Octubre 2026». */
  label: string;
  cards: ClassCardData[];
}

/** What the student has, counted from their payments; never an amount. */
export interface StudentBalanceView {
  left: number;
  taken: number;
  scheduled: number;
  toSchedule: number;
  /** «Te quedan 3 clases: 2 programadas y 1 por programar.» */
  line: string;
  whatsappHref: string;
}

export interface StudentClassesView {
  timeZone: string;
  nowIso: string;
  today: ClassCardData[];
  upcoming: ClassCardData[];
  /** Classes paid and without a date yet: the notice says how many, never of which payment. */
  toSchedule: number;
  past: PastMonth[];
  pastTotal: number;
  pastShown: number;
  balance: StudentBalanceView | null;
  /** Today's class whose link is open, for the fixed bar. */
  joinOpen: MeetingJoinData | null;
  /** «Escríbenos»: the academy's WhatsApp with the message written. */
  whatsappHref: string;
}

/**
 * «Ejercicios de tu clase» on the home page: the exercises of a class's
 * EXERCISE blocks the student may solve now, and how many of them they have
 * done there (a mark, solved or failed: the first decided attempt). Counts,
 * derived from the class page's own read; nothing is stored.
 */
export interface ClassExercisesToDo {
  classTitle: string;
  /** The first exercise still undone: where «Ejercicios de tu clase» leads. */
  href: string;
  done: number;
  total: number;
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
  /** «Esta clase es gratis.», or null: which payment a paid class belongs to is never said. */
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
  /** «Te quedan 3 clases: 2 programadas y 1 por programar.», for the foot of the review. */
  balanceLine: string | null;
  whatsappHref: string;
  href: string;
}
