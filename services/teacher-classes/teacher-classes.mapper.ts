import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import {
  CLASS_BLOCK_KIND,
  type ClassBlockKindCode,
  type ClassStatusCode,
  type MeetingProviderCode,
  type TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { teacherRoutes } from "@/lib/platform-routes";
import { formatDateTimeLocal } from "@/lib/timezone";
import type { TeacherClassBlock, TeacherClassDetail, TeacherClassSummary } from "./teacher-classes.types";

// Mapper PROPIO del profesor, separado del de `services/classes/` a propósito:
// aquel oculta `meetingUrl` hasta `meetingUrlVisibleFrom` porque es la vista del
// alumno; el profesor es quien pone ese enlace y tiene que verlo siempre. Tocar
// el mapper del alumno para reutilizarlo aquí filtraría el enlace antes de
// tiempo a toda la clase.

export const teacherClassSummaryInclude = {
  status: true,
  _count: { select: { participants: true } },
  participants: { where: { attended: true }, select: { userId: true } },
} satisfies Prisma.ClassInclude;

export type TeacherClassSummaryRow = Prisma.ClassGetPayload<{ include: typeof teacherClassSummaryInclude }>;

export const teacherClassDetailInclude = {
  status: true,
  meetingProvider: true,
  transcript: { include: { status: true } },
  participants: {
    include: { user: { select: { id: true, displayName: true, email: true } } },
    orderBy: { user: { displayName: "asc" } },
  },
  blocks: {
    orderBy: { order: "asc" },
    include: {
      kind: true,
      game: { select: { id: true, white: true, black: true, pgn: true } },
      lesson: { select: { id: true, name: true, ...lessonPgnSelect, chapter: { select: { name: true } } } },
      position: { select: { id: true, title: true, fen: true } },
    },
  },
} satisfies Prisma.ClassInclude;

export type TeacherClassDetailRow = Prisma.ClassGetPayload<{ include: typeof teacherClassDetailInclude }>;

export function mapTeacherClassSummary(row: TeacherClassSummaryRow): TeacherClassSummary {
  return {
    id: row.id,
    title: row.title,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    participantCount: row._count.participants,
    attendedCount: row.participants.length,
    href: teacherRoutes.classDetail(row.id),
  };
}

/**
 * Un `movePath` guardado apunta a un nodo por índices, y el PGN referenciado
 * puede haber cambiado después (el alumno editó su partida, el staff editó la
 * lección). Se comprueba aquí para poder avisar en el editor; el visor ya
 * degrada a la posición inicial por su cuenta, así que nada se rompe.
 */
function isMovePathBroken(movePath: string | null, pgn: string | null): boolean {
  if (!movePath || !pgn) return false;
  const tree = parsePgnTree(pgn);
  return tree === null || !tree.nodesByPath.has(movePath);
}

function mapBlock(block: TeacherClassDetailRow["blocks"][number]): TeacherClassBlock {
  const kind = block.kind.code as ClassBlockKindCode;

  const referencedPgn =
    kind === CLASS_BLOCK_KIND.GAME_REF
      ? (block.game?.pgn ?? null)
      : kind === CLASS_BLOCK_KIND.LESSON_REF
        ? (block.lesson ? lessonPgnOf(block.lesson) : null)
        : null;

  const referenceLabel = block.game
    ? `${block.game.white} – ${block.game.black}`
    : block.lesson
      ? `${block.lesson.chapter.name} › ${block.lesson.name}`
      : block.position
        ? (block.position.title ?? "Posición guardada")
        : undefined;

  return {
    id: block.id,
    order: block.order,
    kind,
    text: block.text ?? undefined,
    videoUrl: block.videoUrl ?? undefined,
    caption: block.caption ?? undefined,
    movePath: block.movePath ?? undefined,
    referenceLabel,
    gameId: block.gameId ?? undefined,
    pgn: block.pgn ?? undefined,
    lessonId: block.lessonId ?? undefined,
    positionId: block.positionId ?? undefined,
    isMovePathBroken: isMovePathBroken(block.movePath, referencedPgn),
  };
}

export function mapTeacherClassDetail(row: TeacherClassDetailRow, timeZone: string): TeacherClassDetail {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    scheduledAtIso: row.scheduledAt.toISOString(),
    scheduledAtInput: formatDateTimeLocal(row.scheduledAt, timeZone),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    meetingProviderCode: (row.meetingProvider?.code as MeetingProviderCode | undefined) ?? undefined,
    meetingProviderLabel: row.meetingProvider?.label,
    meetingUrl: row.meetingUrl ?? undefined,
    meetingUrlVisibleFromIso: row.meetingUrlVisibleFrom?.toISOString(),
    recordingUrl: row.recordingUrl ?? undefined,
    summary: row.summary ?? undefined,
    participants: row.participants.map((participant) => ({
      userId: participant.userId,
      displayName: participant.user.displayName,
      email: participant.user.email,
      attended: participant.attended,
      joinedAtIso: participant.joinedAt?.toISOString(),
      hasPayment: participant.paidAt !== null,
    })),
    blocks: row.blocks.map(mapBlock),
    transcript: row.transcript
      ? {
          statusCode: row.transcript.status.code as TranscriptStatusCode,
          statusLabel: row.transcript.status.label,
          hasText: (row.transcript.text ?? "").length > 0,
        }
      : undefined,
    href: teacherRoutes.classDetail(row.id),
  };
}
