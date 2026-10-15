import {
  CLASS_BLOCK_KIND,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassPhaseCode,
  type ClassStatusCode,
  type TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { classPhase } from "@/services/shared/class-phase";
import { classDisplayTitle, isBlockVisibleToStudent, type ClassAudience } from "@/services/shared/class-rules";
import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { meetingVisibleFrom, meetingVisibleUntil } from "@/services/shared/meeting-visible-from";
import type { ClassBlockView, ClassDetail, ClassSummary } from "./classes.types";

/** What a reader needs of a class row to name it (`classDisplayTitle`). */
export interface ClassTitleRow {
  title: string | null;
  format: { code: string };
  teacher: { displayName: string };
  /** The seated students, for «Clase de …»; a student's reader may leave them out. */
  participants?: { user: { displayName: string } }[];
}

/** The title a class is shown with: its topic, or who it is with when it has none. */
export function classTitleOf(row: ClassTitleRow, audience: ClassAudience): string {
  return classDisplayTitle(
    {
      title: row.title,
      formatCode: row.format.code as ClassFormatCode,
      teacherName: row.teacher.displayName,
      studentNames: (row.participants ?? []).map((seat) => seat.user.displayName),
    },
    audience,
  );
}

/** The phase a row is in, from its clock columns. */
export function classPhaseOf(
  row: {
    status: { code: string };
    scheduledAt: Date;
    endsAt: Date;
    meetingUrl: string | null;
    meetingUrlVisibleFrom: Date | null;
  },
  now: Date,
): ClassPhaseCode {
  return classPhase(
    {
      statusCode: row.status.code as ClassStatusCode,
      scheduledAt: row.scheduledAt,
      endsAt: row.endsAt,
      visibleFrom: meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom),
      hasLink: row.meetingUrl !== null,
    },
    now,
  );
}

export const classSummaryInclude = {
  status: true,
  format: { select: { code: true } },
  teacher: { select: { displayName: true } },
} satisfies Prisma.ClassInclude;

export type ClassSummaryRow = Prisma.ClassGetPayload<{ include: typeof classSummaryInclude }>;

export const classDetailInclude = {
  status: true,
  format: { select: { code: true } },
  meetingProvider: true,
  teacher: { select: { displayName: true, title: true } },
  transcript: { include: { status: true } },
  // The seated students, for the classmates' names: never their emails or payments.
  participants: {
    where: { seatMovedAt: null },
    select: { userId: true, user: { select: { displayName: true } } },
    orderBy: { user: { displayName: "asc" } },
  },
  blocks: {
    orderBy: { order: "asc" },
    include: {
      kind: true,
      visibility: { select: { code: true } },
      game: { select: { id: true, white: true, black: true, pgn: true, databaseId: true } },
      // The PGN and the orientation are for rendering the lesson INSIDE the class,
      // not just linking it: the student should not have to leave to see it.
      // Its chapter comes along because the lesson's URL hangs from it.
      lesson: {
        select: {
          id: true,
          name: true,
          ...lessonPgnSelect,
          orientation: { select: { code: true } },
          chapter: { select: { order: true, courseId: true } },
        },
      },
      position: { select: { fen: true, title: true, orientation: { select: { code: true } } } },
    },
  },
} satisfies Prisma.ClassInclude;

export type ClassDetailRow = Prisma.ClassGetPayload<{ include: typeof classDetailInclude }>;

export function mapClassSummary(row: ClassSummaryRow): ClassSummary {
  return {
    id: row.id,
    title: classTitleOf(row, "student"),
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
  const base = {
    id: block.id,
    caption: block.caption ?? undefined,
    visibility: block.visibility.code as ClassBlockVisibilityCode,
  };

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
              href: platformRoutes.lessonDetail(
                block.lesson.chapter.courseId,
                block.lesson.chapter.order,
                block.lesson.id,
              ),
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

/**
 * The blocks a reader sees, in order. The student sees what their phase lets
 * them see (`isBlockVisibleToStudent`); the teacher and the staff see every
 * block, each with its visibility, so their sheets can split them.
 */
export function mapClassBlocks(
  rows: ClassDetailRow["blocks"],
  reader: { audience: ClassAudience; phase: ClassPhaseCode },
): ClassBlockView[] {
  return rows
    .map(mapBlock)
    .filter((block): block is ClassBlockView => block !== null)
    .filter((block) => reader.audience !== "student" || isBlockVisibleToStudent(block.visibility, reader.phase));
}

export function mapClassDetail(row: ClassDetailRow, now: Date, viewerId: string | null = null): ClassDetail {
  // The meeting link is only exposed while it is open: from the instant it
  // becomes visible to half an hour after the class ends. Before that, the
  // client receives only the instant it opens at, to render the countdown. That
  // instant belongs to the link: a class without one gets no countdown whatever
  // the row stores, since it would promise a link that does not exist and, past
  // the instant, it would keep asking the server for the page.
  const { meetingUrl } = row;
  const visibleFrom = meetingVisibleFrom(meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom);
  const opensLater = visibleFrom !== null && now < visibleFrom;
  const closed = now >= meetingVisibleUntil(row.endsAt);
  const phase = classPhaseOf(row, now);

  return {
    id: row.id,
    title: classTitleOf(row, "student"),
    phase,
    classmates: row.participants.filter((seat) => seat.userId !== viewerId).map((seat) => seat.user.displayName),
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
    meetingUrl: meetingUrl !== null && !opensLater && !closed ? meetingUrl : undefined,
    meetingVisibleFromIso: opensLater ? visibleFrom?.toISOString() : undefined,
    blocks: mapClassBlocks(row.blocks, { audience: "student", phase }),
    transcript: row.transcript
      ? {
          statusCode: row.transcript.status.code as TranscriptStatusCode,
          statusLabel: row.transcript.status.label,
          text: row.transcript.text ?? undefined,
        }
      : undefined,
  };
}
