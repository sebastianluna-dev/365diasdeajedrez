import type {
  ClassBlockVisibilityCode,
  ClassPhaseCode,
  ClassStatusCode,
  TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";

export interface ClassSummary {
  id: string;
  title: string;
  teacherName: string;
  /** Instant in UTC; the interface reformats it in the student's zone. */
  scheduledAtIso: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  href: string;
}

export interface ClassesView {
  upcoming: ClassSummary[];
  past: ClassSummary[];
}

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
 * never: the teacher's script), and, filled by the mapper of phase 7 and
 * optional until then, its own title and whether it is new.
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
      /** `href` only when the game lives in a study; the transcribed one has nowhere to open. */
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

export interface ClassDetail {
  id: string;
  /** The topic, or «Clase con <profesor>» when it has none. */
  title: string;
  /** What the clock makes of the status (`classPhase`), at the instant the page was read. */
  phase: ClassPhaseCode;
  /** The other students of the class, by name only. */
  classmates: string[];
  description?: string;
  teacherName: string;
  teacherTitle?: string;
  /** Instant in UTC; the interface reformats it in the student's zone. */
  scheduledAtIso: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  summary?: string;
  recordingUrl?: string;
  meetingProviderLabel?: string;
  /** Only present when now >= meetingUrlVisibleFrom: the link never reaches the client earlier. */
  meetingUrl?: string;
  /**
   * ISO of when the link will become visible, for the countdown. Only present
   * while the class HAS a link that is not visible yet: never without a link,
   * never after the instant.
   */
  meetingVisibleFromIso?: string;
  blocks: ClassBlockView[];
  transcript?: ClassTranscriptView;
}
