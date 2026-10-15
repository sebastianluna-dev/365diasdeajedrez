import {
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_PHASE,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassPhaseCode,
} from "@/constants/platform/class-codes.const";

// The rules of a class that do not depend on the database: what each phase
// allows, who may write an attendance mark, how a class is named when it has
// no topic, which blocks a student sees and what cancelling one does. The
// actions check them before writing and the screens draw with them, so a
// button never offers what the server would refuse.
//
// Pure module: everything receives `now` or a phase, never reads the clock.

/** Who is acting: the teacher of the class or the staff. */
export type ClassActorRole = "teacher" | "staff";

/** Who reads a class, for the words that change with the reader. */
export type ClassAudience = "student" | "teacher" | "staff";

export const GROUP_CAPACITY_MIN = 2;
export const GROUP_CAPACITY_MAX = 12;

/** An individual class seats one student; a group one, up to its capacity. */
export function canAddParticipants(
  format: ClassFormatCode,
  capacity: number | null,
  current: number,
  adding: number,
): boolean {
  if (adding <= 0) return false;
  if (format === CLASS_FORMAT.INDIVIDUAL) return current + adding <= 1;
  return capacity !== null && current + adding <= capacity;
}

export type ClassShapeError = "groupNeedsTitle" | "groupCapacityRange" | "individualHasCapacity";

/** A group class needs a title and a capacity in range; an individual one has no capacity. */
export function classShapeError(input: {
  format: ClassFormatCode;
  capacity: number | null;
  title: string | null;
}): ClassShapeError | null {
  if (input.format === CLASS_FORMAT.INDIVIDUAL) return input.capacity === null ? null : "individualHasCapacity";
  if ((input.title ?? "").trim().length === 0) return "groupNeedsTitle";
  if (input.capacity === null || !Number.isInteger(input.capacity)) return "groupCapacityRange";
  if (input.capacity < GROUP_CAPACITY_MIN || input.capacity > GROUP_CAPACITY_MAX) return "groupCapacityRange";
  return null;
}

/** A class is finalized while it runs or after it ended, never before it starts. */
export function canFinalizeClass(phase: ClassPhaseCode): boolean {
  return phase === CLASS_PHASE.IN_PROGRESS || phase === CLASS_PHASE.AWAITING_CLOSE;
}

/** What can be done to a class in a phase. */
export interface ClassEditable {
  reschedule: boolean;
  changeTeacher: boolean;
  changeMeeting: boolean;
  addStudents: boolean;
  removeStudents: boolean;
  cancel: boolean;
  content: boolean;
  topic: boolean;
  finalize: boolean;
  changeAttendance: boolean;
  moveSeat: boolean;
  afterNotes: boolean;
  duplicate: boolean;
}

const NOTHING: ClassEditable = {
  reschedule: false,
  changeTeacher: false,
  changeMeeting: false,
  addStudents: false,
  removeStudents: false,
  cancel: false,
  content: false,
  topic: false,
  finalize: false,
  changeAttendance: false,
  moveSeat: false,
  afterNotes: false,
  duplicate: true,
};

const EDITABLE: Record<ClassPhaseCode, ClassEditable> = {
  [CLASS_PHASE.UPCOMING]: {
    ...NOTHING,
    reschedule: true,
    changeTeacher: true,
    changeMeeting: true,
    addStudents: true,
    removeStudents: true,
    cancel: true,
    content: true,
    topic: true,
  },
  // Once the link is open nobody is added, removed or moved: somebody may be joining.
  [CLASS_PHASE.OPEN]: {
    ...NOTHING,
    changeTeacher: true,
    changeMeeting: true,
    cancel: true,
    content: true,
    topic: true,
  },
  [CLASS_PHASE.IN_PROGRESS]: {
    ...NOTHING,
    changeTeacher: true,
    changeMeeting: true,
    cancel: true,
    content: true,
    topic: true,
    finalize: true,
  },
  [CLASS_PHASE.AWAITING_CLOSE]: { ...NOTHING, changeTeacher: true, cancel: true, content: true, finalize: true },
  // «Registrar pago» for an unpaid seat stays available in DONE: it belongs to the payment, not to the class.
  [CLASS_PHASE.DONE]: { ...NOTHING, content: true, changeAttendance: true, moveSeat: true, afterNotes: true },
  [CLASS_PHASE.CANCELLED]: { ...NOTHING },
};

export function editableClassFields(phase: ClassPhaseCode): ClassEditable {
  return EDITABLE[phase];
}

export type AttendanceEdit = "finalize" | "change" | "override";

export interface AttendanceEditInput {
  role: ClassActorRole;
  phase: ClassPhaseCode;
  /** The last mark written for this seat, or null when nobody passed the list. */
  lastChange: { isOverride: boolean } | null;
  /** The seat was given another date: its mark is history. */
  seatMoved: boolean;
}

/**
 * How the actor may write this seat's mark, or null. The teacher passes the
 * list when finalizing and may change their own marks of a finished class;
 * the staff finalizes on the teacher's behalf only once the class ended, and
 * overrides a mark after a report. A mark the staff overrode is closed to the
 * teacher; one the staff wrote while finalizing on their behalf is not: the
 * teacher was in the call and may change it.
 */
export function attendanceEditableBy(input: AttendanceEditInput): AttendanceEdit | null {
  if (input.seatMoved) return null;
  if (input.role === "teacher") {
    if (canFinalizeClass(input.phase)) return "finalize";
    if (input.phase === CLASS_PHASE.DONE && !(input.lastChange?.isOverride ?? false)) return "change";
    return null;
  }
  if (input.phase === CLASS_PHASE.AWAITING_CLOSE) return "finalize";
  if (input.phase === CLASS_PHASE.DONE) return "override";
  return null;
}

/** A no-show's seat can be given another date: once, from a finished class. */
export function canMoveSeat(
  seat: { attended: boolean | null; seatMovedAt: Date | null },
  phase: ClassPhaseCode,
): boolean {
  return phase === CLASS_PHASE.DONE && seat.attended === false && seat.seatMovedAt === null;
}

/** "a, b y c" as Spanish lists it. */
export function joinSpanish(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/**
 * The title a class is shown with: its topic, or, without one, who it is with
 * — «Clase con GM Profesor Demo» for the student, «Clase de Valentina Cruz»
 * for the teacher and the staff.
 */
export function classDisplayTitle(
  input: { title: string | null; formatCode: ClassFormatCode; teacherName: string; studentNames: readonly string[] },
  audience: ClassAudience,
): string {
  const title = input.title?.trim() ?? "";
  if (title.length > 0) return title;
  if (audience === "student") return `Clase con ${input.teacherName}`;
  if (input.studentNames.length === 0)
    return input.formatCode === CLASS_FORMAT.GROUP ? "Clase grupal" : "Clase sin alumno";
  return `Clase de ${joinSpanish(input.studentNames)}`;
}

/**
 * Whether a block reaches the student: what is «para preparar» from the moment
 * it is added, what is «después de la clase» once the class ended, and the
 * teacher's script never. A cancelled class shows nothing.
 */
export function isBlockVisibleToStudent(visibility: ClassBlockVisibilityCode, phase: ClassPhaseCode): boolean {
  if (phase === CLASS_PHASE.CANCELLED) return false;
  if (visibility === CLASS_BLOCK_VISIBILITY.TEACHER) return false;
  if (visibility === CLASS_BLOCK_VISIBILITY.BEFORE) return true;
  return phase === CLASS_PHASE.AWAITING_CLOSE || phase === CLASS_PHASE.DONE;
}

const NEW_BLOCK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** «Nuevo»: a block added once the class had started, in the last week. */
export function isNewClassBlock(createdAt: Date, scheduledAt: Date, now: Date): boolean {
  return createdAt.getTime() > scheduledAt.getTime() && now.getTime() - createdAt.getTime() < NEW_BLOCK_WINDOW_MS;
}

export type SeatCoverage = "paid" | "free" | "unpaid";

export interface CancellationSeat {
  studentName: string;
  coverage: SeatCoverage;
}

/**
 * What cancelling the class does, as the lines the confirmation reads out:
 * one per coverage, the teacher's, and the warning when the class already
 * ended.
 */
export function planCancellation(input: {
  phase: ClassPhaseCode;
  teacherName: string;
  seats: readonly CancellationSeat[];
}): string[] {
  const lines: string[] = [];
  const paid = input.seats.filter((seat) => seat.coverage === "paid").map((seat) => seat.studentName);
  const unpaid = input.seats.filter((seat) => seat.coverage === "unpaid").map((seat) => seat.studentName);
  const free = input.seats.filter((seat) => seat.coverage === "free").map((seat) => seat.studentName);

  if (paid.length > 0) {
    lines.push(
      `${joinSpanish(paid)} ${paid.length === 1 ? "recupera" : "recuperan"} su clase: vuelve a su pago y queda por programar.`,
    );
  }
  if (unpaid.length > 0) {
    lines.push(
      `${joinSpanish(unpaid)} no ${unpaid.length === 1 ? "tenía" : "tenían"} pago: no ${unpaid.length === 1 ? "recupera" : "recuperan"} nada.`,
    );
  }
  if (free.length > 0) {
    lines.push(
      `${joinSpanish(free)} ${free.length === 1 ? "tenía" : "tenían"} la clase gratis: no se ${free.length === 1 ? "le" : "les"} descuenta nada.`,
    );
  }
  lines.push(`${input.teacherName} deja de verla en su agenda; el contenido que preparó se conserva.`);
  if (input.phase === CLASS_PHASE.AWAITING_CLOSE) {
    lines.push("La clase ya terminó: si se dio, finalízala en lugar de cancelarla.");
  }
  return lines;
}

/** The block ids of a class, by section, as the editor draws them. */
export type BlockSections = Record<ClassBlockVisibilityCode, readonly string[]>;

const SECTION_ORDER: readonly ClassBlockVisibilityCode[] = [
  CLASS_BLOCK_VISIBILITY.BEFORE,
  CLASS_BLOCK_VISIBILITY.AFTER,
  CLASS_BLOCK_VISIBILITY.TEACHER,
];

/**
 * The COMPLETE order of a class's blocks after a drop: the moved block taken
 * out of its section and put at `toIndex` of `toSection`, then the three
 * sections concatenated (to prepare, after, script). The class has a single
 * order, however the screen splits it; `planFullReorder` discards an incomplete
 * list, so this returns every id. Whether the drop also changed the block's
 * visibility is the caller's: it knows `toSection`.
 */
export function blockOrderAfterDrop(
  sections: BlockSections,
  movedId: string,
  toSection: ClassBlockVisibilityCode,
  toIndex: number,
): string[] {
  const without: Record<ClassBlockVisibilityCode, string[]> = {
    BEFORE: sections.BEFORE.filter((id) => id !== movedId),
    AFTER: sections.AFTER.filter((id) => id !== movedId),
    TEACHER: sections.TEACHER.filter((id) => id !== movedId),
  };
  const target = without[toSection];
  const index = Math.max(0, Math.min(toIndex, target.length));
  target.splice(index, 0, movedId);
  return SECTION_ORDER.flatMap((section) => without[section]);
}
