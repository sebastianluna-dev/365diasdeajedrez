import type { AttendanceMarkView } from "@/components/platform/shared/attendance-row/attendance-row.types";
import type { ClassExerciseProgressData } from "@/components/platform/sections/teacher/classes/class-exercise-progress/class-exercise-progress.types";
import type { ClassRowChip } from "@/components/platform/shared/class-row/class-row.types";
import type { FinalizeClassData } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.types";
import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_PHASE,
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassPhaseCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { formatClassDay, formatClassHours, formatClassStamp, formatClassWhen } from "@/lib/format-class-when";
import { teacherRoutes } from "@/lib/platform-routes";
import { classPhase } from "@/services/shared/class-phase";
import {
  attendanceEditableBy,
  canFinalizeClass,
  classDisplayTitle,
  editableClassFields,
} from "@/services/shared/class-rules";
import { classExerciseSolvedCounts, solvedCountLabel } from "@/services/shared/class-exercise-progress";
import { exerciseFacts } from "@/services/shared/exercise-facts";
import { lessonPgnOf } from "@/services/shared/lesson-pgn";
import { mapExerciseAttemptRow } from "@/services/teacher-exercises/teacher-exercises.mapper";
import type { TeacherAttemptRow } from "@/services/teacher-exercises/teacher-exercises.types";
import { meetingVisibleFrom, meetingVisibleUntil } from "@/services/shared/meeting-visible-from";
import type { TeacherClassBlock, TeacherClassRow, TeacherSeatView } from "./teacher-classes.types";

// Pure: receives the rows the service read and `now`, never the clock. The
// teacher's own mapper, apart from the student's: the student's hides the
// link until it opens, and the teacher has to see it always.

/** A class as the teacher's lists read it. */
export interface TeacherClassSource {
  id: string;
  title: string | null;
  scheduledAt: Date;
  endsAt: Date;
  durationMin: number;
  statusCode: ClassStatusCode;
  formatCode: ClassFormatCode;
  meetingUrl: string | null;
  meetingUrlVisibleFrom: Date | null;
  teacherName: string;
  /** The seats that count: not moved. */
  seats: { userId: string; displayName: string; attended: boolean | null }[];
  blocks: { visibility: ClassBlockVisibilityCode }[];
}

export function teacherPhaseOf(
  row: Pick<TeacherClassSource, "statusCode" | "scheduledAt" | "endsAt" | "meetingUrl" | "meetingUrlVisibleFrom">,
  now: Date,
): ClassPhaseCode {
  return classPhase(
    {
      statusCode: row.statusCode,
      scheduledAt: row.scheduledAt,
      endsAt: row.endsAt,
      visibleFrom: meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom),
      hasLink: row.meetingUrl !== null,
    },
    now,
  );
}

export function teacherClassTitle(
  row: Pick<TeacherClassSource, "title" | "formatCode" | "teacherName" | "seats">,
): string {
  return classDisplayTitle(
    {
      title: row.title,
      formatCode: row.formatCode,
      teacherName: row.teacherName,
      studentNames: row.seats.map((s) => s.displayName),
    },
    "teacher",
  );
}

/** «Alumno Demo · Individual», «Grupal · 4 alumnos». */
export function teacherClassPeople(row: Pick<TeacherClassSource, "formatCode" | "seats">): string {
  if (row.formatCode === CLASS_FORMAT.GROUP)
    return `Grupal · ${row.seats.length} alumno${row.seats.length === 1 ? "" : "s"}`;
  return `${row.seats[0]?.displayName ?? "Sin alumno"} · Individual`;
}

/** What there is to prepare, and what is missing; never a word about money. */
export function teacherClassChips(row: TeacherClassSource, phase: ClassPhaseCode): ClassRowChip[] {
  const chips: ClassRowChip[] = [];
  const count = (visibility: ClassBlockVisibilityCode) => row.blocks.filter((b) => b.visibility === visibility).length;
  const before = count(CLASS_BLOCK_VISIBILITY.BEFORE);
  const after = count(CLASS_BLOCK_VISIBILITY.AFTER);
  const script = count(CLASS_BLOCK_VISIBILITY.TEACHER);
  if (before > 0) chips.push({ icon: "prepare", label: `${before} para preparar` });
  if (after > 0) chips.push({ icon: "after", label: `${after} para después` });
  if (script > 0) chips.push({ icon: "script", label: `${script} en tu guion` });
  if (row.blocks.length === 0 && phase !== CLASS_PHASE.CANCELLED)
    chips.push({ icon: "no-content", label: "Sin contenido" });
  if (row.title === null) chips.push({ icon: "no-topic", label: "Sin tema" });
  if (row.meetingUrl === null && (phase === CLASS_PHASE.UPCOMING || phase === CLASS_PHASE.OPEN)) {
    chips.push({ icon: "no-link", label: "Sin enlace · lo agrega administración" });
  }
  return chips;
}

export interface TeacherRowContext {
  now: Date;
  timeZone: string;
  teacherName: string;
}

/** One row of the teacher's lists, with «Finalizar» on a class that waits for it and «Preparar» on one ahead. */
export function mapTeacherClassRow(row: TeacherClassSource, context: TeacherRowContext): TeacherClassRow {
  const phase = teacherPhaseOf(row, context.now);
  const title = teacherClassTitle(row);
  const href = teacherRoutes.classDetail(row.id);
  const marked = row.seats.filter((seat) => seat.attended !== null).length;
  const attended = row.seats.filter((seat) => seat.attended === true).length;
  return {
    id: row.id,
    href,
    title,
    phase,
    startIso: row.scheduledAt.toISOString(),
    durationMin: row.durationMin,
    timeZone: context.timeZone,
    nowIso: context.now.toISOString(),
    people: teacherClassPeople(row),
    chips: teacherClassChips(row, phase),
    ...(canFinalizeClass(phase)
      ? {
          action: {
            kind: "finalize" as const,
            label: "Finalizar",
            finalize: finalizeDataOf(row, { ...context, title, phase }),
          },
        }
      : phase === CLASS_PHASE.UPCOMING || phase === CLASS_PHASE.OPEN
        ? { action: { kind: "link" as const, label: "Preparar", href } }
        : {}),
    studentsLabel:
      row.formatCode === CLASS_FORMAT.GROUP
        ? `${row.seats.length} alumno${row.seats.length === 1 ? "" : "s"}`
        : (row.seats[0]?.displayName ?? "Sin alumno"),
    attendanceLabel: marked === 0 ? "—" : `${attended} de ${row.seats.length}`,
    materialLabel:
      row.blocks.length === 0 ? "Sin contenido" : `${row.blocks.length} bloque${row.blocks.length === 1 ? "" : "s"}`,
  };
}

/** What the finalizing popup needs of a row: the students without a mark yet. */
function finalizeDataOf(
  row: TeacherClassSource,
  context: TeacherRowContext & { title: string; phase: ClassPhaseCode },
): FinalizeClassData {
  return {
    classId: row.id,
    classTitle: context.title,
    whenLine: `${formatClassWhen({ start: row.scheduledAt, durationMin: row.durationMin, timeZone: context.timeZone, now: context.now })} · ${
      row.formatCode === CLASS_FORMAT.GROUP ? `${row.seats.length} alumnos` : (row.seats[0]?.displayName ?? "")
    }`,
    isGroup: row.formatCode === CLASS_FORMAT.GROUP,
    teacherName: context.teacherName,
    students: row.seats.map((seat) => ({
      id: seat.userId,
      displayName: seat.displayName,
      mark: { attended: seat.attended },
    })),
    summary: null,
    recordingUrl: null,
  };
}

/** A seat as the teacher's record reads it. */
export interface TeacherSeatSource {
  userId: string;
  displayName: string;
  isAssigned: boolean;
  attended: boolean | null;
  seatMovedAt: Date | null;
  /** Where the seat went: a class the teacher may have; null for «se le dará otra fecha». */
  seatMovedToClassId: string | null;
  /** The class this seat replaces (a moved seat came here). */
  replaces: { scheduledAt: Date } | null;
  changes: {
    changedAt: Date;
    byName: string | null;
    fromAttended: boolean | null;
    toAttended: boolean;
    reason: string | null;
    isOverride: boolean;
  }[];
}

const quoted = (attended: boolean | null) => (attended === null ? "«Sin marca»" : attended ? "«Asistió»" : "«Faltó»");

/** The mark with its lines, as the teacher reads it: a staff change locks it (D3); a moved seat says it got another date. */
export function teacherSeatMark(seat: TeacherSeatSource, timeZone: string, now: Date): AttendanceMarkView {
  const first = seat.changes[0];
  const override = [...seat.changes].reverse().find((change) => change.isOverride);
  const mark: AttendanceMarkView = { attended: seat.attended };
  if (first)
    mark.markedLine = `Marcó ${first.byName ?? "Administración"} · ${formatClassStamp(first.changedAt, timeZone, now)}`;
  if (override) {
    mark.changedLine = `Cambió ${override.byName ?? "Administración"} · ${formatClassStamp(override.changedAt, timeZone, now)} · ${quoted(override.fromAttended)} → ${quoted(override.toAttended)}${override.reason ? `: «${override.reason}»` : ""}`;
    mark.locked = true;
  }
  if (seat.seatMovedAt) {
    mark.moved = seat.seatMovedToClassId
      ? { label: "Faltó · se le dará otra fecha", href: teacherRoutes.classDetail(seat.seatMovedToClassId) }
      : { label: "Faltó · se le dará otra fecha" };
  }
  if (seat.replaces)
    mark.replacesLabel = `Reposición de su clase del ${formatClassDay(seat.replaces.scheduledAt, timeZone, now)}`;
  return mark;
}

export function mapTeacherSeat(seat: TeacherSeatSource, timeZone: string, now: Date): TeacherSeatView {
  return {
    userId: seat.userId,
    displayName: seat.displayName,
    href: seat.isAssigned ? teacherRoutes.studentDetail(seat.userId) : null,
    isAssigned: seat.isAssigned,
    attended: seat.attended,
    mark: teacherSeatMark(seat, timeZone, now),
  };
}

/** Whether the teacher may still change this seat's mark in this phase (D3). */
export function teacherCanChangeMark(seat: TeacherSeatSource, phase: ClassPhaseCode): boolean {
  const last = seat.changes[seat.changes.length - 1];
  return (
    attendanceEditableBy({
      role: "teacher",
      phase,
      lastChange: last ? { isOverride: last.isOverride } : null,
      seatMoved: seat.seatMovedAt !== null,
    }) === "change"
  );
}

/** The join card's data for the teacher: the link always, and when the students get it. */
export function teacherJoinData(
  row: Pick<TeacherClassSource, "scheduledAt" | "endsAt" | "meetingUrl" | "meetingUrlVisibleFrom"> & {
    providerLabel: string | null;
  },
  phase: ClassPhaseCode,
  context: { now: Date; timeZone: string; whatsappHref: string },
): MeetingJoinData {
  const visibleFrom = meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom);
  return {
    phase,
    meetingUrl: row.meetingUrl,
    hasLink: row.meetingUrl !== null,
    providerLabel: row.providerLabel,
    startIso: row.scheduledAt.toISOString(),
    endIso: row.endsAt.toISOString(),
    visibleFromIso: visibleFrom?.toISOString() ?? null,
    untilIso: row.meetingUrl ? meetingVisibleUntil(row.endsAt).toISOString() : null,
    nowIso: context.now.toISOString(),
    timeZone: context.timeZone,
    whatsappHref: context.whatsappHref,
  };
}

/** «Alumno Demo lo ve desde las 11:30.», «Tus alumnos lo ven desde las 9:30.» */
export function meetingVisibleLine(
  row: Pick<TeacherClassSource, "scheduledAt" | "meetingUrl" | "meetingUrlVisibleFrom" | "formatCode" | "seats">,
  timeZone: string,
): string | null {
  const visibleFrom = meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom);
  if (!visibleFrom) return null;
  const hour = formatClassHours(visibleFrom, 0, timeZone).split("–")[0] ?? "";
  const who =
    row.formatCode === CLASS_FORMAT.GROUP ? "Tus alumnos lo ven" : `${row.seats[0]?.displayName ?? "El alumno"} lo ve`;
  return `${who} desde las ${hour}. Lo gestiona administración.`;
}

/** A block row as the detail query reads it, for the edit data. */
export interface TeacherBlockSource {
  id: string;
  order: number;
  kind: { code: string };
  visibility: { code: string };
  text: string | null;
  videoUrl: string | null;
  caption: string | null;
  movePath: string | null;
  gameId: string | null;
  pgn: string | null;
  lessonId: string | null;
  positionId: string | null;
  /** An EXERCISE block's rows, in order. */
  exercises?: { exerciseId: string; exercise: { title: string } }[];
  game: { id: string; white: string; black: string; pgn: string } | null;
  lesson: ({ id: string; name: string; chapter: { name: string } } & Parameters<typeof lessonPgnOf>[0]) | null;
  position: { id: string; title: string | null; fen: string } | null;
}

/**
 * A stored `movePath` points at a node by indexes, and the referenced PGN may
 * have changed afterwards (the student edited their game, the staff edited
 * the lesson). Checked here so the editor can warn; the viewer degrades to
 * the initial position on its own.
 */
function isMovePathBroken(movePath: string | null, pgn: string | null): boolean {
  if (!movePath || !pgn) return false;
  const tree = parsePgnTree(pgn);
  return tree === null || !tree.nodesByPath.has(movePath);
}

export function mapTeacherBlock(block: TeacherBlockSource): TeacherClassBlock {
  const kind = block.kind.code as ClassBlockKindCode;
  const referencedPgn =
    kind === CLASS_BLOCK_KIND.GAME_REF
      ? (block.game?.pgn ?? null)
      : kind === CLASS_BLOCK_KIND.LESSON_REF
        ? block.lesson
          ? lessonPgnOf(block.lesson)
          : null
        : null;
  const exercises = block.exercises ?? [];
  const referenceLabel = block.game
    ? `${block.game.white} – ${block.game.black}`
    : block.lesson
      ? `${block.lesson.chapter.name} › ${block.lesson.name}`
      : block.position
        ? (block.position.title ?? "Posición guardada")
        : kind === CLASS_BLOCK_KIND.EXERCISE
          ? exercises.length === 1
            ? (exercises[0]?.exercise.title ?? "1 ejercicio")
            : `${exercises.length} ejercicios`
          : undefined;
  return {
    id: block.id,
    order: block.order,
    kind,
    visibility: block.visibility.code as ClassBlockVisibilityCode,
    text: block.text ?? undefined,
    videoUrl: block.videoUrl ?? undefined,
    caption: block.caption ?? undefined,
    movePath: block.movePath ?? undefined,
    referenceLabel,
    gameId: block.gameId ?? undefined,
    pgn: block.pgn ?? undefined,
    lessonId: block.lessonId ?? undefined,
    positionId: block.positionId ?? undefined,
    exerciseIds: kind === CLASS_BLOCK_KIND.EXERCISE ? exercises.map((item) => item.exerciseId) : undefined,
    isMovePathBroken: isMovePathBroken(block.movePath, referencedPgn),
  };
}

/** An attempt from a class block as the progress reads it: the row's data plus who made it. */
export interface ClassBlockAttemptRow extends TeacherAttemptRow {
  userId: string;
  classBlockId: string | null;
  user: { displayName: string };
}

/** An EXERCISE block as the progress reads it: its exercises in order. */
export interface ClassBlockExerciseSource {
  id: string;
  exercises: {
    exerciseId: string;
    exercise: { title: string; kind: { code: string }; mateIn: number | null; difficulty: number };
  }[];
}

/**
 * «2 de 3 lo resolvieron» per exercise of each EXERCISE block (D29), from the
 * attempts made from the block by the students seated now (the count is the
 * shared fold's, `classExerciseSolvedCounts`), with every one of those
 * attempts as a row whose title is the student — their tab when they are the
 * teacher's, a name alone when they are not — and who has not tried it.
 */
export function mapClassExerciseProgress(
  blocks: readonly ClassBlockExerciseSource[],
  attempts: readonly ClassBlockAttemptRow[],
  seats: readonly { userId: string; displayName: string; isAssigned: boolean }[],
  teacherId: string,
): ClassExerciseProgressData[] {
  const seatIds = seats.map((seat) => seat.userId);
  const seated = new Set(seatIds);
  const counts = classExerciseSolvedCounts(attempts, seatIds);
  const byTime = [...attempts]
    .filter((attempt) => seated.has(attempt.userId))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime() || left.id.localeCompare(right.id));
  return blocks.map((block) => ({
    blockId: block.id,
    seatCount: seatIds.length,
    exercises: block.exercises.map((item, index) => {
      const own = byTime.filter(
        (attempt) => attempt.classBlockId === block.id && attempt.exerciseId === item.exerciseId,
      );
      const tried = new Set(own.map((attempt) => attempt.userId));
      const solvedCount = counts.get(block.id)?.get(item.exerciseId) ?? 0;
      return {
        exerciseId: item.exerciseId,
        n: index + 1,
        title: item.exercise.title,
        facts: exerciseFacts(item.exercise),
        solvedCount,
        label: solvedCountLabel(solvedCount, seatIds.length),
        attempts: own.map((attempt) => {
          const seat = seats.find((candidate) => candidate.userId === attempt.userId);
          return {
            ...mapExerciseAttemptRow(attempt, teacherId),
            title: attempt.user.displayName,
            href: seat?.isAssigned ? teacherRoutes.studentExercises(attempt.userId) : null,
            whereLabel: "Desde la clase",
          };
        }),
        untried: seats.filter((seat) => !tried.has(seat.userId)).map((seat) => seat.displayName),
      };
    }),
  }));
}

/** «Individual · 60 min · creada por Staff Demo el jue 1 oct». */
export function adminLineOf(
  row: { formatCode: ClassFormatCode; durationMin: number; createdAt: Date; createdByName: string | null },
  timeZone: string,
  now: Date,
): string {
  return `${row.formatCode === CLASS_FORMAT.GROUP ? "Grupal" : "Individual"} · ${row.durationMin} min · creada${row.createdByName ? ` por ${row.createdByName}` : ""} el ${formatClassDay(row.createdAt, timeZone, now)}`;
}

export { editableClassFields };
