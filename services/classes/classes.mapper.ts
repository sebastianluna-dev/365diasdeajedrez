import { CLASS_BLOCK_KIND, type ClassStatusCode, type TranscriptStatusCode } from "@/constants/platform/class-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import type { ClassBlockView, ClassDetail, ClassSummary } from "./classes.types";

export const classSummaryInclude = {
  status: true,
  teacher: { select: { displayName: true } },
} satisfies Prisma.ClassInclude;

export type ClassSummaryRow = Prisma.ClassGetPayload<{ include: typeof classSummaryInclude }>;

export const classDetailInclude = {
  status: true,
  meetingProvider: true,
  teacher: { select: { displayName: true, title: true } },
  transcript: { include: { status: true } },
  blocks: {
    orderBy: { order: "asc" },
    include: {
      kind: true,
      game: { select: { id: true, white: true, black: true, pgn: true, databaseId: true } },
      // The PGN and the orientation are for rendering the lesson INSIDE the class,
      // not just linking it: the student should not have to leave to see it.
      lesson: {
        select: { id: true, name: true, ...lessonPgnSelect, orientation: { select: { code: true } } },
      },
      position: { select: { fen: true, title: true, orientation: { select: { code: true } } } },
    },
  },
} satisfies Prisma.ClassInclude;

export type ClassDetailRow = Prisma.ClassGetPayload<{ include: typeof classDetailInclude }>;

export function mapClassSummary(row: ClassSummaryRow): ClassSummary {
  return {
    id: row.id,
    title: row.title,
    teacherName: row.teacher.displayName,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    href: platformRoutes.classDetail(row.id),
  };
}

function mapBlock(block: ClassDetailRow["blocks"][number]): ClassBlockView | null {
  const base = { id: block.id, caption: block.caption ?? undefined };

  switch (block.kind.code) {
    case CLASS_BLOCK_KIND.TEXT:
      return block.text ? { ...base, kind: "TEXT", text: block.text } : null;
    case CLASS_BLOCK_KIND.VIDEO:
      return block.videoUrl ? { ...base, kind: "VIDEO", videoUrl: block.videoUrl } : null;
    case CLASS_BLOCK_KIND.GAME_REF: {
      // The PGN transcribed in the block rules; the referenced game is the fallback.
      // The rule lives HERE and in one single place: spreading it through the
      // interface would leave two sources of truth for the same block.
      if (block.pgn && block.pgn.trim().length > 0) {
        return {
          ...base,
          kind: "GAME_REF",
          game: {
            id: block.id,
            label: block.caption ?? "Partida de la clase",
            pgn: block.pgn,
            movePath: block.movePath ?? undefined,
          },
        };
      }
      return block.game
        ? {
            ...base,
            kind: "GAME_REF",
            game: {
              id: block.game.id,
              label: `${block.game.white} – ${block.game.black}`,
              pgn: block.game.pgn,
              href: platformRoutes.gameDetail(block.game.databaseId, block.game.id),
              movePath: block.movePath ?? undefined,
            },
          }
        : null;
    }
    case CLASS_BLOCK_KIND.LESSON_REF:
      return block.lesson
        ? {
            ...base,
            kind: "LESSON_REF",
            lesson: {
              id: block.lesson.id,
              name: block.lesson.name,
              pgn: lessonPgnOf(block.lesson),
              orientation: block.lesson.orientation.code === BOARD_ORIENTATION.BLACK ? "black" : "white",
              href: platformRoutes.lessonDetail(block.lesson.id),
              movePath: block.movePath ?? undefined,
            },
          }
        : null;
    case CLASS_BLOCK_KIND.POSITION_REF:
      return block.position
        ? {
            ...base,
            kind: "POSITION_REF",
            position: {
              fen: block.position.fen,
              orientation: block.position.orientation.code === BOARD_ORIENTATION.BLACK ? "black" : "white",
              title: block.position.title ?? undefined,
            },
          }
        : null;
    case CLASS_BLOCK_KIND.FILE:
      return { ...base, kind: "FILE" };
    default:
      return null;
  }
}

export function mapClassDetail(row: ClassDetailRow, now: Date): ClassDetail {
  // The meeting link is only exposed once it is visible; before that, the client
  // receives only the date to render the countdown.
  const visibleFrom = row.meetingUrlVisibleFrom;
  const meetingVisible = row.meetingUrl !== null && (visibleFrom === null || now >= visibleFrom);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    teacherName: row.teacher.displayName,
    teacherTitle: row.teacher.title ?? undefined,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    summary: row.summary ?? undefined,
    recordingUrl: row.recordingUrl ?? undefined,
    meetingProviderLabel: row.meetingProvider?.label,
    meetingUrl: meetingVisible ? (row.meetingUrl ?? undefined) : undefined,
    meetingVisibleFromIso: !meetingVisible && visibleFrom ? visibleFrom.toISOString() : undefined,
    blocks: row.blocks.map(mapBlock).filter((block): block is ClassBlockView => block !== null),
    transcript: row.transcript
      ? {
          statusCode: row.transcript.status.code as TranscriptStatusCode,
          statusLabel: row.transcript.status.label,
          text: row.transcript.text ?? undefined,
        }
      : undefined,
  };
}
