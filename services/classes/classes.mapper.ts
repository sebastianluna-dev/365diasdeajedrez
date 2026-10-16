import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import {
  CLASS_BLOCK_KIND,
  CLASS_FORMAT,
  CLASS_PHASE,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassPhaseCode,
  type ClassStatusCode,
  type TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import { GAME_ANALYSIS_MODE } from "@/constants/platform/study-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { endPathOf, nodeAtPath, parsePgnTree } from "@/lib/chess/pgn-tree";
import { formatClassDay } from "@/lib/format-class-when";
import { MONTHS_ES } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { dayKeyIn } from "@/lib/timezone";
import { classPhase, studentClassView } from "@/services/shared/class-phase";
import {
  classDisplayTitle,
  isBlockVisibleToStudent,
  isNewClassBlock,
  joinSpanish,
  type ClassAudience,
} from "@/services/shared/class-rules";
import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { meetingVisibleFrom, meetingVisibleUntil } from "@/services/shared/meeting-visible-from";
import type {
  ClassBlockView,
  ClassCardData,
  ClassDetailView,
  PastClassBoard,
  PastMonth,
  StudentBalanceView,
} from "./classes.types";

// The student's reading of a class. Pure: the service feeds it from Prisma
// and the tests by hand. It never sees an amount — a payment reaches it as a
// day and a count of classes — nor a classmate's email. And it never says
// which payment a class belongs to: the student reads their classes by date
// and their balance as counts, never as «Clase 2 de 4 de tu pago del …».

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
      // The game's record around the board: its players, the result, how the
      // study shows it, and whose study it is, for «Abrir la partida».
      game: {
        select: {
          id: true,
          white: true,
          black: true,
          whiteElo: true,
          blackElo: true,
          whiteTitle: true,
          blackTitle: true,
          whiteCountry: true,
          blackCountry: true,
          pgn: true,
          pinnedComment: true,
          databaseId: true,
          result: { select: { label: true } },
          orientation: { select: { code: true } },
          analysisMode: { select: { code: true } },
          database: { select: { userId: true } },
        },
      },
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

const orientationOf = (code: string | undefined) => (code === BOARD_ORIENTATION.BLACK ? "black" : "white");

function playerOf(name: string, elo: number | null, title: string | null, country: string | null) {
  return {
    name,
    elo: elo ?? undefined,
    title: title ?? undefined,
    country: country ?? undefined,
  };
}

function mapBlock(block: ClassDetailRow["blocks"][number], reader: BlockReader): ClassBlockView | null {
  const base = {
    id: block.id,
    caption: block.caption ?? undefined,
    visibility: block.visibility.code as ClassBlockVisibilityCode,
    isNew: reader.now && reader.scheduledAt ? isNewClassBlock(block.createdAt, reader.scheduledAt, reader.now) : false,
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
      if (!block.game) return null;
      const { game } = block;
      // The link to the study only for whoever owns it: a classmate's or the
      // teacher's study is not the reader's to open.
      const owned = reader.viewerId !== undefined && game.database.userId === reader.viewerId;
      return {
        ...base,
        kind: "GAME_REF",
        game: {
          id: game.id,
          label: `${game.white} – ${game.black}`,
          pgn: game.pgn,
          href: owned ? platformRoutes.gameDetail(game.databaseId, game.id) : undefined,
          movePath: block.movePath ?? undefined,
          players: {
            white: playerOf(game.white, game.whiteElo, game.whiteTitle, game.whiteCountry),
            black: playerOf(game.black, game.blackElo, game.blackTitle, game.blackCountry),
          },
          result: game.result.label,
          orientation: orientationOf(game.orientation?.code),
          conceal: game.analysisMode?.code === GAME_ANALYSIS_MODE.CONCEAL,
          pinnedComment: game.pinnedComment ?? undefined,
        },
      };
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
              orientation: orientationOf(block.lesson.orientation.code),
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
              orientation: orientationOf(block.position.orientation.code),
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

export interface BlockReader {
  audience: ClassAudience;
  phase: ClassPhaseCode;
  /** With `scheduledAt`, marks «Nuevo» the blocks added after the class started. */
  now?: Date;
  scheduledAt?: Date;
  /** Whose studies may be opened from a game block. */
  viewerId?: string;
}

/**
 * The blocks a reader sees, in order. The student sees what their phase lets
 * them see (`isBlockVisibleToStudent`); the teacher and the staff see every
 * block, each with its visibility, so their sheets can split them.
 */
export function mapClassBlocks(rows: ClassDetailRow["blocks"], reader: BlockReader): ClassBlockView[] {
  return rows
    .map((row) => mapBlock(row, reader))
    .filter((block): block is ClassBlockView => block !== null)
    .filter((block) => reader.audience !== "student" || isBlockVisibleToStudent(block.visibility, reader.phase));
}

/**
 * What the list reads of each block of a class: its visibility, to count
 * what the student may see, and the chess material it carries, for the
 * board of a past class's card. The PGNs travel only for that board.
 */
export const studentBlockSelect = {
  caption: true,
  pgn: true,
  movePath: true,
  kind: { select: { code: true } },
  visibility: { select: { code: true } },
  position: { select: { fen: true, title: true, orientation: { select: { code: true } } } },
  game: { select: { white: true, black: true, pgn: true, orientation: { select: { code: true } } } },
  lesson: { select: { name: true, ...lessonPgnSelect, orientation: { select: { code: true } } } },
} satisfies Prisma.ClassBlockSelect;

export type StudentBlockRow = Prisma.ClassBlockGetPayload<{ select: typeof studentBlockSelect }>;

/**
 * The position a block draws, or null when it carries no chess: a
 * position's FEN as it is; a game's or a lesson's at the move the block
 * points at, or at the end of its main line. The PGN transcribed in a game
 * block rules over the referenced game, as in `mapBlock`.
 */
export function blockBoardOf(block: StudentBlockRow): PastClassBoard | null {
  switch (block.kind.code) {
    case CLASS_BLOCK_KIND.POSITION_REF:
      return block.position
        ? {
            fen: block.position.fen,
            orientation: orientationOf(block.position.orientation.code),
            label: block.position.title ?? block.caption ?? "Posición de la clase",
          }
        : null;
    case CLASS_BLOCK_KIND.GAME_REF: {
      if (block.pgn && block.pgn.trim().length > 0) {
        return boardOfPgn(block.pgn, block.movePath, "white", block.caption ?? "Partida de la clase");
      }
      return block.game
        ? boardOfPgn(
            block.game.pgn,
            block.movePath,
            orientationOf(block.game.orientation?.code),
            block.caption ?? `${block.game.white} – ${block.game.black}`,
          )
        : null;
    }
    case CLASS_BLOCK_KIND.LESSON_REF:
      return block.lesson
        ? boardOfPgn(
            lessonPgnOf(block.lesson),
            block.movePath,
            orientationOf(block.lesson.orientation.code),
            block.caption ?? block.lesson.name,
          )
        : null;
    default:
      return null;
  }
}

const STARTING_PLACEMENT = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

function boardOfPgn(
  pgn: string,
  movePath: string | null,
  orientation: "white" | "black",
  label: string,
): PastClassBoard | null {
  const tree = pgn.trim().length > 0 ? parsePgnTree(pgn) : null;
  // Without a move or a position of its own, a PGN is the starting position: nothing of the class's to show.
  if (!tree || (tree.children.length === 0 && tree.initialFen.split(" ")[0] === STARTING_PLACEMENT)) return null;
  const pointed = movePath ? nodeAtPath(tree, movePath) : undefined;
  const node = pointed ?? nodeAtPath(tree, endPathOf(tree, ""));
  return { fen: node?.fen ?? tree.initialFen, orientation, label };
}

/** The board of a past class's card: the first block with chess the student may see now. */
export function pastBoardOf(blocks: readonly StudentBlockRow[], phase: ClassPhaseCode): PastClassBoard | null {
  for (const block of blocks) {
    if (!isBlockVisibleToStudent(block.visibility.code as ClassBlockVisibilityCode, phase)) continue;
    const board = blockBoardOf(block);
    if (board) return board;
  }
  return null;
}

/** A payment as the student reads it: its day and how many classes it bought. Never its amount. */
export interface StudentPaymentSource {
  id: string;
  paidOn: Date;
  classCount: number;
}

/** The student's own seat in a class. */
export interface StudentSeatSource {
  payment: StudentPaymentSource | null;
  isFree: boolean;
  attended: boolean | null;
  seatMovedAt: Date | null;
  /** Where the staff moved this seat; null when it went back to the payment. */
  seatMovedToClass: { id: string; scheduledAt: Date } | null;
  /** The class this seat replaces: a no-show the staff gave this date, and the note it came with. */
  replaces: { scheduledAt: Date; note: string | null } | null;
}

/** A class as the student's readers feed the mapper. */
export interface StudentClassSource {
  id: string;
  title: string | null;
  description: string | null;
  scheduledAt: Date;
  endsAt: Date;
  durationMin: number;
  statusCode: ClassStatusCode;
  formatCode: ClassFormatCode;
  teacherName: string;
  meetingUrl: string | null;
  meetingUrlVisibleFrom: Date | null;
  providerLabel: string | null;
  recordingUrl: string | null;
  summary: string | null;
  previousScheduledAt: Date | null;
  rescheduleNote: string | null;
  cancelNote: string | null;
  /** The other students seated (not moved), by name. */
  classmates: string[];
  /** Every block, in order: its visibility, to count what the student may see, and its chess, for the board. */
  blocks: StudentBlockRow[];
  seat: StudentSeatSource;
}

export interface StudentContext {
  now: Date;
  timeZone: string;
  whatsappHref: string;
}

export function studentPhaseOf(row: StudentClassSource, now: Date): ClassPhaseCode {
  return classPhaseOf({ status: { code: row.statusCode }, ...row }, now);
}

/** «Clase con GM Profesor Demo», or the topic. */
export function studentClassTitle(row: StudentClassSource): string {
  return classDisplayTitle(
    { title: row.title, formatCode: row.formatCode, teacherName: row.teacherName, studentNames: [] },
    "student",
  );
}

/** «con GM Profesor Demo», «con GM Profesor Demo · Grupal, con Mateo Ríos y Diego Salas». */
export function peopleLineOf(row: Pick<StudentClassSource, "teacherName" | "formatCode" | "classmates">): string {
  const teacher = `con ${row.teacherName}`;
  if (row.formatCode !== CLASS_FORMAT.GROUP) return teacher;
  return row.classmates.length > 0 ? `${teacher} · Grupal, con ${joinSpanish(row.classmates)}` : `${teacher} · Grupal`;
}

/**
 * The join card's data for the student: the link only while it is open —
 * from the instant it becomes visible to half an hour after the class ends.
 * Before that, only the instant it opens at, so the countdown asks for the
 * page again then. That instant belongs to the link: a class without one
 * gets no countdown whatever the row stores.
 */
export function studentJoinData(
  row: StudentClassSource,
  phase: ClassPhaseCode,
  context: StudentContext,
): MeetingJoinData {
  const visibleFrom = meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom);
  const until = meetingVisibleUntil(row.endsAt);
  const open =
    row.meetingUrl !== null &&
    visibleFrom !== null &&
    context.now >= visibleFrom &&
    context.now < until &&
    phase !== CLASS_PHASE.CANCELLED;
  return {
    phase,
    meetingUrl: open ? row.meetingUrl : null,
    hasLink: row.meetingUrl !== null,
    providerLabel: row.providerLabel,
    startIso: row.scheduledAt.toISOString(),
    endIso: row.endsAt.toISOString(),
    visibleFromIso: visibleFrom?.toISOString() ?? null,
    untilIso: row.meetingUrl ? until.toISOString() : null,
    nowIso: context.now.toISOString(),
    timeZone: context.timeZone,
    whatsappHref: context.whatsappHref,
  };
}

/** Whether the seat spends a class of a payment: paid, not free. */
function isPaidSeat(seat: StudentSeatSource): seat is StudentSeatSource & { payment: StudentPaymentSource } {
  return seat.payment !== null && !seat.isFree;
}

/** «Esta clase es gratis.», or nothing: which payment a paid class belongs to is never said. */
export function coverageLineOf(seat: StudentSeatSource): string | null {
  return seat.isFree ? "Esta clase es gratis." : null;
}

/** The old class of a moved seat: «No asististe · tu clase pasó al vie 16 oct», or where it went back to. */
export function movedLineOf(seat: StudentSeatSource, context: StudentContext): ClassCardData["moved"] {
  if (seat.seatMovedAt === null) return null;
  if (seat.seatMovedToClass) {
    return {
      label: `No asististe · tu clase pasó al ${formatClassDay(seat.seatMovedToClass.scheduledAt, context.timeZone, context.now)}`,
      href: platformRoutes.classDetail(seat.seatMovedToClass.id),
    };
  }
  return {
    label: isPaidSeat(seat) ? "No asististe · tu clase queda por programar" : "No asististe · se te dará otra fecha",
    href: null,
  };
}

/** «Es la reposición de tu clase del mié 14 oct.» */
export function makeUpLabelOf(seat: StudentSeatSource, context: StudentContext): string | null {
  return seat.replaces
    ? `Es la reposición de tu clase del ${formatClassDay(seat.replaces.scheduledAt, context.timeZone, context.now)}.`
    : null;
}

export function mapClassCard(row: StudentClassSource, context: StudentContext): ClassCardData {
  const phase = studentPhaseOf(row, context.now);
  const cancelled = phase === CLASS_PHASE.CANCELLED;
  const over = studentClassView(phase, row.endsAt, context.now) === "review";
  return {
    id: row.id,
    href: platformRoutes.classDetail(row.id),
    title: studentClassTitle(row),
    phase,
    startIso: row.scheduledAt.toISOString(),
    durationMin: row.durationMin,
    timeZone: context.timeZone,
    nowIso: context.now.toISOString(),
    people: peopleLineOf(row),
    teacherName: row.teacherName,
    isGroup: row.formatCode === CLASS_FORMAT.GROUP,
    classmates: row.classmates,
    visibleBlocks: row.blocks.filter((block) =>
      isBlockVisibleToStudent(block.visibility.code as ClassBlockVisibilityCode, phase),
    ).length,
    join: cancelled ? null : studentJoinData(row, phase, context),
    // The class's content shows only once it is over: a ticket never carries it.
    past:
      over && !cancelled
        ? {
            attended: row.seat.attended,
            hasRecording: row.recordingUrl !== null,
            summary: row.summary,
            board: pastBoardOf(row.blocks, phase),
          }
        : null,
    moved: movedLineOf(row.seat, context),
    makeUpLabel: makeUpLabelOf(row.seat, context),
    cancelled,
    isFree: row.seat.isFree,
  };
}

/** The detail row as the student's reader feeds it: the class with its blocks and transcript. */
export interface StudentDetailSource extends StudentClassSource {
  row: ClassDetailRow;
  viewerId: string;
  balanceLine: string | null;
}

export function mapStudentClassDetail(source: StudentDetailSource, context: StudentContext): ClassDetailView {
  const phase = studentPhaseOf(source, context.now);
  const { seat } = source;
  const cancelled = phase === CLASS_PHASE.CANCELLED;
  return {
    id: source.id,
    title: studentClassTitle(source),
    view: studentClassView(phase, source.endsAt, context.now),
    phase,
    description: source.description,
    teacherName: source.teacherName,
    startIso: source.scheduledAt.toISOString(),
    endIso: source.endsAt.toISOString(),
    durationMin: source.durationMin,
    timeZone: context.timeZone,
    nowIso: context.now.toISOString(),
    people: peopleLineOf(source),
    classmates: source.classmates,
    join: studentJoinData(source, phase, context),
    coverage: coverageLineOf(seat),
    attended: seat.attended,
    moved: movedLineOf(seat, context),
    makeUp: seat.replaces ? { label: makeUpLabelOf(seat, context) ?? "", note: seat.replaces.note } : null,
    rescheduled:
      source.previousScheduledAt && !cancelled
        ? {
            previousLabel: formatClassDay(source.previousScheduledAt, context.timeZone, context.now),
            note: source.rescheduleNote,
          }
        : null,
    cancelled: cancelled ? { note: source.cancelNote, returnedToPayment: isPaidSeat(seat) } : null,
    summary: source.summary,
    recordingUrl: source.recordingUrl,
    blocks: mapClassBlocks(source.row.blocks, {
      audience: "student",
      phase,
      now: context.now,
      scheduledAt: source.scheduledAt,
      viewerId: source.viewerId,
    }),
    transcript: source.row.transcript
      ? {
          statusCode: source.row.transcript.status.code as TranscriptStatusCode,
          statusLabel: source.row.transcript.status.label,
          text: source.row.transcript.text ?? undefined,
        }
      : null,
    balanceLine: source.balanceLine,
    whatsappHref: context.whatsappHref,
    href: platformRoutes.classDetail(source.id),
  };
}

/** A payment's count, as the balance reads it (`paymentSeats`). */
export interface StudentPaymentCount extends StudentPaymentSource {
  taken: number;
  scheduled: number;
  toSchedule: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The payments still open, or the last one when every one is spent: what the balance counts. */
function countedPayments(payments: readonly StudentPaymentCount[]): readonly StudentPaymentCount[] {
  const open = payments.filter((payment) => payment.scheduled + payment.toSchedule > 0);
  return open.length > 0 ? open : payments.slice(-1);
}

/**
 * «Te quedan 3 clases: 2 programadas y 1 por programar.», or «Ya tomaste
 * tus clases pagadas.» Counts only: never which payment they come from.
 */
export function balanceLineOf(payments: readonly StudentPaymentCount[]): string | null {
  if (payments.length === 0) return null;
  const counted = countedPayments(payments);
  const scheduled = counted.reduce((sum, payment) => sum + payment.scheduled, 0);
  const toSchedule = counted.reduce((sum, payment) => sum + payment.toSchedule, 0);
  const left = scheduled + toSchedule;
  if (left === 0) return "Ya tomaste tus clases pagadas.";
  const parts = [
    ...(scheduled > 0 ? [plural(scheduled, "programada", "programadas")] : []),
    ...(toSchedule > 0 ? [`${toSchedule} por programar`] : []),
  ];
  return `Te ${left === 1 ? "queda" : "quedan"} ${plural(left, "clase", "clases")}: ${parts.join(" y ")}.`;
}

/**
 * What the student has, counted from their payments. Null without a payment.
 * The counts are of the payments still open — a spent payment of last year
 * would otherwise fill the bar with its classes; with none open, of the last.
 */
export function mapStudentBalance(
  payments: readonly StudentPaymentCount[],
  context: Pick<StudentContext, "now" | "whatsappHref">,
): StudentBalanceView | null {
  const line = balanceLineOf(payments);
  if (line === null) return null;
  const counted = countedPayments(payments);
  const sum = (pick: (payment: StudentPaymentCount) => number) =>
    counted.reduce((total, payment) => total + pick(payment), 0);
  return {
    left: sum((p) => p.scheduled + p.toSchedule),
    taken: sum((p) => p.taken),
    scheduled: sum((p) => p.scheduled),
    toSchedule: sum((p) => p.toSchedule),
    line,
    whatsappHref: context.whatsappHref,
  };
}

/** The month heading of a past class: «Octubre 2026». */
export function pastMonthLabel(key: string): string {
  const [year = "", month = "01"] = key.split("-");
  const name = MONTHS_ES[Number(month) - 1] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** The past classes by month, newest first: months, never payments. */
export function groupPastByMonth(cards: readonly ClassCardData[], timeZone: string): PastMonth[] {
  const months = new Map<string, ClassCardData[]>();
  for (const card of cards) {
    const key = dayKeyIn(new Date(card.startIso), timeZone).slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), card]);
  }
  return [...months.entries()].map(([key, own]) => ({ key, label: pastMonthLabel(key), cards: own }));
}
