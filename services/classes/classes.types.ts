import type { ClassStatusCode, TranscriptStatusCode } from "@/constants/platform/class-codes.const";

export interface ClassSummary {
  id: string;
  title: string;
  teacherName: string;
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
      game: { id: string; label: string; pgn: string; href: string; movePath?: string };
    }
  | { id: string; kind: "LESSON_REF"; caption?: string; lesson: { id: string; name: string; href: string } }
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
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  summary?: string;
  recordingUrl?: string;
  meetingProviderLabel?: string;
  /** Sólo presente cuando now >= meetingUrlVisibleFrom: el enlace nunca llega antes al cliente. */
  meetingUrl?: string;
  /** ISO de cuándo se hará visible el enlace, para la cuenta atrás. */
  meetingVisibleFromIso?: string;
  blocks: ClassBlockView[];
  transcript?: ClassTranscriptView;
}
