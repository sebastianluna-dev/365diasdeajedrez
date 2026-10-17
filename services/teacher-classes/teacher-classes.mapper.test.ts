import { describe, expect, it } from "vitest";
import { CLASS_BLOCK_KIND, CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  adminLineOf,
  mapClassExerciseProgress,
  mapTeacherBlock,
  mapTeacherClassRow,
  meetingVisibleLine,
  teacherCanChangeMark,
  teacherJoinData,
  teacherSeatMark,
  type TeacherClassSource,
  type TeacherSeatSource,
} from "./teacher-classes.mapper";

const zone = CLASSES_TIME_ZONE;
const context = { now: CLASSES_NOW, timeZone: zone, teacherName: "GM Profesor Demo" };

function source(extra: Partial<TeacherClassSource> = {}): TeacherClassSource {
  return {
    id: "c2",
    title: "Repaso de la Najdorf: tus dudas",
    scheduledAt: cdmx("2026-10-14", "12:00"),
    endsAt: cdmx("2026-10-14", "13:00"),
    durationMin: 60,
    statusCode: CLASS_STATUS.SCHEDULED,
    formatCode: CLASS_FORMAT.INDIVIDUAL,
    meetingUrl: "https://zoom.us/j/11111111111",
    meetingUrlVisibleFrom: null,
    teacherName: "GM Profesor Demo",
    seats: [{ userId: "u-d", displayName: "Alumno Demo", attended: null }],
    blocks: [{ visibility: "BEFORE" }, { visibility: "BEFORE" }, { visibility: "AFTER" }, { visibility: "TEACHER" }],
    ...extra,
  };
}

describe("mapTeacherClassRow", () => {
  it("the class ahead: what there is to prepare, and «Preparar»; never a word about money", () => {
    const row = mapTeacherClassRow(source(), context);
    expect(row.phase).toBe(CLASS_PHASE.OPEN);
    expect(row.people).toBe("Alumno Demo · Individual");
    expect(row.chips.map((chip) => chip.label)).toEqual(["2 para preparar", "1 para después", "1 en tu guion"]);
    expect(row.action).toEqual({ kind: "link", label: "Preparar", href: "/profesor/clases/c2" });
    expect(row.studentsLabel).toBe("Alumno Demo");
    expect(row.attendanceLabel).toBe("—");
    expect(row.materialLabel).toBe("4 bloques");
    expect(JSON.stringify(row)).not.toMatch(/pago|\$/i);
  });

  it("a class that ended and waits: «Finalizar» opens the popup with its students", () => {
    const row = mapTeacherClassRow(
      source({
        id: "c6",
        title: "Defensa Caro-Kann: ideas",
        scheduledAt: cdmx("2026-10-12", "17:00"),
        endsAt: cdmx("2026-10-12", "18:00"),
        seats: [{ userId: "u-s", displayName: "Diego Salas", attended: null }],
        blocks: [],
      }),
      context,
    );
    expect(row.phase).toBe(CLASS_PHASE.AWAITING_CLOSE);
    expect(row.chips.map((chip) => chip.label)).toEqual(["Sin contenido"]);
    expect(row.action).toMatchObject({
      kind: "finalize",
      label: "Finalizar",
      finalize: { classId: "c6", whenLine: "lun 12 oct · 17:00–18:00 · Diego Salas", isGroup: false },
    });
  });

  it("a group class without a topic nor a link says so", () => {
    const row = mapTeacherClassRow(
      source({
        title: null,
        meetingUrl: null,
        formatCode: CLASS_FORMAT.GROUP,
        scheduledAt: cdmx("2026-10-17", "10:00"),
        endsAt: cdmx("2026-10-17", "11:30"),
        seats: [
          { userId: "a", displayName: "Alumno Demo", attended: true },
          { userId: "b", displayName: "Mateo Ríos", attended: false },
        ],
      }),
      context,
    );
    expect(row.title).toBe("Clase de Alumno Demo y Mateo Ríos");
    expect(row.people).toBe("Grupal · 2 alumnos");
    expect(row.chips.map((chip) => chip.label)).toEqual([
      "2 para preparar",
      "1 para después",
      "1 en tu guion",
      "Sin tema",
      "Sin enlace · lo agrega administración",
    ]);
    expect(row.attendanceLabel).toBe("1 de 2");
  });
});

describe("the seat's mark for the teacher", () => {
  const seat: TeacherSeatSource = {
    userId: "u-v",
    displayName: "Valentina Cruz",
    isAssigned: true,
    attended: true,
    seatMovedAt: null,
    seatMovedToClassId: null,
    replaces: null,
    changes: [
      {
        changedAt: cdmx("2026-10-14", "20:12"),
        byName: "GM Profesor Demo",
        fromAttended: null,
        toAttended: false,
        reason: null,
        isOverride: false,
      },
      {
        changedAt: cdmx("2026-10-15", "10:05"),
        byName: "Staff Demo",
        fromAttended: false,
        toAttended: true,
        reason: "Se le cayó el audio.",
        isOverride: true,
      },
    ],
  };

  it("a staff change shows with its reason and locks the mark (D3)", () => {
    const mark = teacherSeatMark(seat, zone, CLASSES_NOW);
    expect(mark.markedLine).toBe("Marcó GM Profesor Demo · mié 14 oct, 20:12");
    expect(mark.changedLine).toBe(
      "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Se le cayó el audio.»",
    );
    expect(mark.locked).toBe(true);
    expect(teacherCanChangeMark(seat, CLASS_PHASE.DONE)).toBe(false);
  });

  it("the teacher's own mark can be changed once the class is done, and a moved seat says it got another date", () => {
    const own: TeacherSeatSource = { ...seat, changes: [seat.changes[0]!] };
    expect(teacherCanChangeMark(own, CLASS_PHASE.DONE)).toBe(true);
    expect(teacherCanChangeMark(own, CLASS_PHASE.AWAITING_CLOSE)).toBe(false);
    const moved = teacherSeatMark(
      { ...own, seatMovedAt: cdmx("2026-10-15", "08:00"), seatMovedToClassId: "c-new" },
      zone,
      CLASSES_NOW,
    );
    expect(moved.moved).toEqual({ label: "Faltó · se le dará otra fecha", href: "/profesor/clases/c-new" });
    expect(moved.locked).toBeUndefined();
  });
});

describe("the join card and the lane", () => {
  it("the teacher always gets the link, with when it opens and closes", () => {
    const join = teacherJoinData({ ...source(), providerLabel: "Zoom" }, CLASS_PHASE.OPEN, {
      now: CLASSES_NOW,
      timeZone: zone,
      whatsappHref: "https://wa.me/1",
    });
    expect(join.meetingUrl).toBe("https://zoom.us/j/11111111111");
    expect(join.visibleFromIso).toBe(cdmx("2026-10-14", "11:30").toISOString());
    expect(join.untilIso).toBe(cdmx("2026-10-14", "13:30").toISOString());
    expect(meetingVisibleLine(source(), zone)).toBe("Alumno Demo lo ve desde las 11:30. Lo gestiona administración.");
    expect(meetingVisibleLine(source({ meetingUrl: null }), zone)).toBeNull();
  });

  it("the admin line", () => {
    expect(
      adminLineOf(
        {
          formatCode: CLASS_FORMAT.INDIVIDUAL,
          durationMin: 60,
          createdAt: cdmx("2026-10-01", "10:00"),
          createdByName: "Staff Demo",
        },
        zone,
        CLASSES_NOW,
      ),
    ).toBe("Individual · 60 min · creada por Staff Demo el jue 1 oct");
  });
});

describe("mapTeacherBlock", () => {
  const base = {
    id: "b5",
    order: 5,
    visibility: { code: "BEFORE" },
    text: null,
    videoUrl: null,
    caption: null,
    movePath: null,
    gameId: null,
    pgn: null,
    lessonId: null,
    positionId: null,
    game: null,
    lesson: null,
    position: null,
  };

  const exercise = (id: string, title: string, extra: Partial<{ teacherId: string | null; status: string }> = {}) => ({
    exerciseId: id,
    exercise: {
      id,
      title,
      kind: { code: "MATE_IN" },
      mateIn: 2,
      difficulty: 1400,
      teacherId: "t-1",
      status: { code: "READY" },
      topics: [{ topic: { code: "TACTICS", label: "Táctica", order: 1 } }],
      ...(extra.teacherId !== undefined ? { teacherId: extra.teacherId } : {}),
      ...(extra.status ? { status: { code: extra.status } } : {}),
    },
  });

  it("an exercise block carries its exercises in order and is named by how many it holds (D29)", () => {
    const block = mapTeacherBlock(
      {
        ...base,
        kind: { code: CLASS_BLOCK_KIND.EXERCISE },
        exercises: [exercise("dmEjer02", "El mate de Philidor"), exercise("dmEjer01", "El pasillo abierto")],
      },
      "t-1",
    );
    expect(block).toMatchObject({
      kind: CLASS_BLOCK_KIND.EXERCISE,
      exerciseIds: ["dmEjer02", "dmEjer01"],
      unavailableExercises: [],
      referenceLabel: "2 ejercicios",
      isMovePathBroken: false,
    });
    const one = mapTeacherBlock(
      { ...base, kind: { code: CLASS_BLOCK_KIND.EXERCISE }, exercises: [exercise("dmEjer02", "El mate de Philidor")] },
      "t-1",
    );
    expect(one.referenceLabel).toBe("El mate de Philidor");
  });

  it("the exercises the teacher could no longer pick come as cards for the popup: archived, or out of the library", () => {
    const block = mapTeacherBlock(
      {
        ...base,
        kind: { code: CLASS_BLOCK_KIND.EXERCISE },
        exercises: [
          exercise("own", "El pasillo abierto"),
          exercise("archived", "La clavada", { status: "ARCHIVED" }),
          exercise("library", "Desviación", { teacherId: "t-2", status: "PUBLISHED" }),
          exercise("withdrawn", "El molino", { teacherId: "t-2", status: "READY" }),
        ],
      },
      "t-1",
    );
    expect(block.exerciseIds).toEqual(["own", "archived", "library", "withdrawn"]);
    expect(block.unavailableExercises).toEqual([
      { id: "archived", title: "La clavada", facts: "Mate en 2 · 1400", topics: "Táctica" },
      { id: "withdrawn", title: "El molino", facts: "Mate en 2 · 1400", topics: "Táctica" },
    ]);
  });

  it("any other kind carries no exercises", () => {
    const block = mapTeacherBlock(
      { ...base, kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "Hola", exercises: [] },
      "t-1",
    );
    expect(block.exerciseIds).toBeUndefined();
    expect(block.unavailableExercises).toBeUndefined();
    expect(block.referenceLabel).toBeUndefined();
  });
});

describe("mapClassExerciseProgress (D29)", () => {
  const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
  const blocks = [
    {
      id: "b5",
      exercises: [
        {
          exerciseId: "e1",
          exercise: {
            title: "El pasillo abierto",
            kind: { code: "MATE_IN" },
            mateIn: 1,
            difficulty: 900,
            teacherId: "t-1",
            status: { code: "READY" },
          },
        },
        {
          exerciseId: "e2",
          exercise: {
            title: "El mate de Philidor",
            kind: { code: "MATE_IN" },
            mateIn: 2,
            difficulty: 1400,
            // Archived since: the students no longer get it, and the teacher's row says so.
            teacherId: "t-1",
            status: { code: "ARCHIVED" },
          },
        },
      ],
    },
  ];
  const seats = [
    { userId: "u-d", displayName: "Alumno Demo", isAssigned: true },
    { userId: "u-m", displayName: "Mateo Ríos", isAssigned: true },
    { userId: "u-l", displayName: "Lucía Herrera", isAssigned: false },
  ];
  const attempt = (id: string, userId: string, exerciseId: string, result: string, at: string, mistake = false) => ({
    id,
    userId,
    classBlockId: "b5",
    exerciseId,
    seriesId: null,
    createdAt: new Date(at),
    durationMs: 30_000,
    hintsUsed: 0,
    solutionShown: false,
    result: { code: result },
    context: { code: "CLASS", label: "Clase" },
    exercise: { id: exerciseId, title: "x", teacherId: "t-1", startFen: BACK_RANK },
    series: null,
    classBlock: { class: { title: "La Najdorf", scheduledAt: new Date("2026-10-14T18:00:00.000Z") } },
    mistakeDetails: mistake ? [{ fen: BACK_RANK, expectedSan: "Rd8#", playedSan: "Rd7" }] : [],
    user: { displayName: seats.find((seat) => seat.userId === userId)?.displayName ?? "Alguien" },
  });

  it("counts who solved each exercise from the block over the seats, lists their attempts newest first and names the rest", () => {
    const [progress] = mapClassExerciseProgress(
      blocks,
      [
        attempt("a-1", "u-d", "e1", "FAILED", "2026-10-13T18:00:00.000Z", true),
        attempt("a-2", "u-d", "e1", "PASSED", "2026-10-14T18:00:00.000Z"),
        attempt("a-3", "u-l", "e1", "PASSED", "2026-10-14T19:00:00.000Z"),
        attempt("a-4", "u-moved", "e1", "PASSED", "2026-10-14T19:30:00.000Z"),
        attempt("a-5", "u-m", "e2", "FAILED", "2026-10-14T20:00:00.000Z", true),
      ],
      seats,
      "t-1",
      CLASSES_NOW,
    );
    expect(progress).toMatchObject({ blockId: "b5", seatCount: 3 });
    const [first, second] = progress!.exercises;
    expect(first).toMatchObject({
      n: 1,
      title: "El pasillo abierto",
      facts: "Mate en 1 · 900",
      solvedCount: 2,
      label: "2 de 3 lo resolvieron",
    });
    expect(first!.unavailable).toBeUndefined();
    expect(first!.attempts.map((row) => [row.id, row.title, row.href, row.outcome, row.whereLabel])).toEqual([
      ["a-3", "Lucía Herrera", null, "solved", "Desde la clase"],
      ["a-2", "Alumno Demo", "/profesor/alumnos/u-d/ejercicios", "solved", "Desde la clase"],
      ["a-1", "Alumno Demo", "/profesor/alumnos/u-d/ejercicios", "failed", "Desde la clase"],
    ]);
    expect(first!.attempts[2]?.mistake).toMatchObject({ playedLabel: "Td7", expectedLabel: "Td8#" });
    expect(first!.untried).toEqual(["Mateo Ríos"]);
    expect(second).toMatchObject({
      n: 2,
      solvedCount: 0,
      label: "0 de 3 lo resolvieron",
      unavailable: true,
      untried: ["Alumno Demo", "Lucía Herrera"],
    });
    expect(second!.attempts).toHaveLength(1);
  });

  it("with no seat, «Sin alumnos» and nothing to list", () => {
    const [progress] = mapClassExerciseProgress(blocks, [], [], "t-1", CLASSES_NOW);
    expect(progress!.exercises.map((item) => [item.label, item.attempts.length, item.untried])).toEqual([
      ["Sin alumnos", 0, []],
      ["Sin alumnos", 0, []],
    ]);
  });
});
