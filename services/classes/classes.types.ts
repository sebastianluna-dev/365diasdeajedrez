import type { ClassStatusCode, TranscriptStatusCode } from "@/constants/platform/class-codes.const";

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

export type ClassBlockView =
  | { id: string; kind: "TEXT"; caption?: string; text: string }
  | { id: string; kind: "VIDEO"; caption?: string; videoUrl: string }
  | {
      id: string;
      kind: "GAME_REF";
      caption?: string;
      /** `href` only when the game lives in a study; the transcribed one has nowhere to open. */
      game: { id: string; label: string; pgn: string; href?: string; movePath?: string };
    }
  | {
      id: string;
      kind: "LESSON_REF";
      caption?: string;
      lesson: {
        id: string;
        name: string;
        /** The lesson's content, to see it inside the class. */
        pgn: string;
        orientation: "white" | "black";
        href: string;
        movePath?: string;
      };
    }
  | {
      id: string;
      kind: "POSITION_REF";
      caption?: string;
      position: { fen: string; orientation: "white" | "black"; title?: string };
    }
  | { id: string; kind: "FILE"; caption?: string };

export interface ClassTranscriptView {
  statusCode: TranscriptStatusCode;
  statusLabel: string;
  text?: string;
}

export interface ClassDetail {
  id: string;
  title: string;
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
  /** ISO of when the link will become visible, for the countdown. */
  meetingVisibleFromIso?: string;
  blocks: ClassBlockView[];
  transcript?: ClassTranscriptView;
}
