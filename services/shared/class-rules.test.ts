import { describe, expect, it } from "vitest";
import {
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_PHASE,
  type ClassPhaseCode,
} from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, FIXTURE_TEACHER_NAME, cdmx } from "@/lib/testing/fixtures/classes";
import {
  attendanceEditableBy,
  blockOrderAfterDrop,
  canAddParticipants,
  canFinalizeClass,
  canMoveSeat,
  classDisplayTitle,
  classShapeError,
  editableClassFields,
  isBlockVisibleToStudent,
  isNewClassBlock,
  joinSpanish,
  planCancellation,
} from "./class-rules";

const PHASES = Object.values(CLASS_PHASE) as ClassPhaseCode[];

describe("canAddParticipants", () => {
  it("una individual admite un alumno; una grupal, hasta su capacidad", () => {
    expect(canAddParticipants(CLASS_FORMAT.INDIVIDUAL, null, 0, 1)).toBe(true);
    expect(canAddParticipants(CLASS_FORMAT.INDIVIDUAL, null, 1, 1)).toBe(false);
    expect(canAddParticipants(CLASS_FORMAT.GROUP, 6, 4, 2)).toBe(true);
    expect(canAddParticipants(CLASS_FORMAT.GROUP, 6, 4, 3)).toBe(false);
    expect(canAddParticipants(CLASS_FORMAT.GROUP, null, 0, 1)).toBe(false);
    expect(canAddParticipants(CLASS_FORMAT.GROUP, 6, 0, 0)).toBe(false);
  });
});

describe("classShapeError", () => {
  it("una grupal necesita título y de 2 a 12 plazas; una individual no tiene plazas", () => {
    expect(classShapeError({ format: CLASS_FORMAT.GROUP, capacity: 6, title: "Taller" })).toBeNull();
    expect(classShapeError({ format: CLASS_FORMAT.GROUP, capacity: 6, title: "  " })).toBe("groupNeedsTitle");
    expect(classShapeError({ format: CLASS_FORMAT.GROUP, capacity: 1, title: "Taller" })).toBe("groupCapacityRange");
    expect(classShapeError({ format: CLASS_FORMAT.GROUP, capacity: 13, title: "Taller" })).toBe("groupCapacityRange");
    expect(classShapeError({ format: CLASS_FORMAT.GROUP, capacity: null, title: "Taller" })).toBe("groupCapacityRange");
    expect(classShapeError({ format: CLASS_FORMAT.INDIVIDUAL, capacity: null, title: null })).toBeNull();
    expect(classShapeError({ format: CLASS_FORMAT.INDIVIDUAL, capacity: 2, title: null })).toBe(
      "individualHasCapacity",
    );
  });
});

describe("canFinalizeClass", () => {
  it("sólo en curso o por finalizar", () => {
    expect(PHASES.filter(canFinalizeClass)).toEqual([CLASS_PHASE.IN_PROGRESS, CLASS_PHASE.AWAITING_CLOSE]);
  });
});

describe("editableClassFields", () => {
  it("antes de abrir el enlace se puede todo; abierto, ya no se mueve ni se cambian los alumnos", () => {
    expect(editableClassFields(CLASS_PHASE.UPCOMING)).toMatchObject({
      reschedule: true,
      addStudents: true,
      removeStudents: true,
      cancel: true,
    });
    expect(editableClassFields(CLASS_PHASE.OPEN)).toMatchObject({
      reschedule: false,
      addStudents: false,
      removeStudents: false,
      cancel: true,
      changeMeeting: true,
    });
    expect(editableClassFields(CLASS_PHASE.IN_PROGRESS)).toMatchObject({ finalize: true, reschedule: false });
  });

  it("terminada: sólo la asistencia, la plaza de quien faltó, el contenido y lo de después", () => {
    expect(editableClassFields(CLASS_PHASE.DONE)).toMatchObject({
      changeAttendance: true,
      moveSeat: true,
      content: true,
      afterNotes: true,
      reschedule: false,
      cancel: false,
      finalize: false,
    });
  });

  it("cancelada: nada, salvo duplicarla", () => {
    const editable = editableClassFields(CLASS_PHASE.CANCELLED);
    expect(Object.entries(editable).filter(([, allowed]) => allowed)).toEqual([["duplicate", true]]);
  });
});

describe("attendanceEditableBy", () => {
  it("el profesor pasa lista al finalizar y cambia sus marcas de una clase terminada", () => {
    expect(
      attendanceEditableBy({ role: "teacher", phase: CLASS_PHASE.IN_PROGRESS, lastChange: null, seatMoved: false }),
    ).toBe("finalize");
    expect(
      attendanceEditableBy({ role: "teacher", phase: CLASS_PHASE.AWAITING_CLOSE, lastChange: null, seatMoved: false }),
    ).toBe("finalize");
    expect(
      attendanceEditableBy({
        role: "teacher",
        phase: CLASS_PHASE.DONE,
        lastChange: { isOverride: false },
        seatMoved: false,
      }),
    ).toBe("change");
    expect(
      attendanceEditableBy({ role: "teacher", phase: CLASS_PHASE.UPCOMING, lastChange: null, seatMoved: false }),
    ).toBeNull();
  });

  it("una marca que administración cambió tras un reporte queda cerrada para el profesor; una de «finalizar en su nombre», no", () => {
    expect(
      attendanceEditableBy({
        role: "teacher",
        phase: CLASS_PHASE.DONE,
        lastChange: { isOverride: true },
        seatMoved: false,
      }),
    ).toBeNull();
    expect(
      attendanceEditableBy({
        role: "teacher",
        phase: CLASS_PHASE.DONE,
        lastChange: { isOverride: false },
        seatMoved: false,
      }),
    ).toBe("change");
  });

  it("administración finaliza en nombre sólo cuando la clase terminó, y cambia una marca sólo en una terminada", () => {
    expect(
      attendanceEditableBy({ role: "staff", phase: CLASS_PHASE.AWAITING_CLOSE, lastChange: null, seatMoved: false }),
    ).toBe("finalize");
    expect(
      attendanceEditableBy({ role: "staff", phase: CLASS_PHASE.IN_PROGRESS, lastChange: null, seatMoved: false }),
    ).toBeNull();
    expect(
      attendanceEditableBy({
        role: "staff",
        phase: CLASS_PHASE.DONE,
        lastChange: { isOverride: false },
        seatMoved: false,
      }),
    ).toBe("override");
    expect(
      attendanceEditableBy({
        role: "staff",
        phase: CLASS_PHASE.DONE,
        lastChange: { isOverride: true },
        seatMoved: false,
      }),
    ).toBe("override");
  });

  it("una plaza ya movida es historial: nadie la toca", () => {
    expect(
      attendanceEditableBy({ role: "teacher", phase: CLASS_PHASE.DONE, lastChange: null, seatMoved: true }),
    ).toBeNull();
    expect(
      attendanceEditableBy({ role: "staff", phase: CLASS_PHASE.DONE, lastChange: null, seatMoved: true }),
    ).toBeNull();
  });
});

describe("canMoveSeat", () => {
  it("sólo la falta de una clase terminada, y una sola vez", () => {
    expect(canMoveSeat({ attended: false, seatMovedAt: null }, CLASS_PHASE.DONE)).toBe(true);
    expect(canMoveSeat({ attended: true, seatMovedAt: null }, CLASS_PHASE.DONE)).toBe(false);
    expect(canMoveSeat({ attended: null, seatMovedAt: null }, CLASS_PHASE.DONE)).toBe(false);
    expect(canMoveSeat({ attended: false, seatMovedAt: CLASSES_NOW }, CLASS_PHASE.DONE)).toBe(false);
    expect(canMoveSeat({ attended: false, seatMovedAt: null }, CLASS_PHASE.AWAITING_CLOSE)).toBe(false);
  });
});

describe("classDisplayTitle", () => {
  const untitled = {
    title: null,
    formatCode: CLASS_FORMAT.INDIVIDUAL,
    teacherName: FIXTURE_TEACHER_NAME,
    studentNames: ["Valentina Cruz"],
  };

  it("con tema, el tema; sin él, con quién es", () => {
    expect(classDisplayTitle({ ...untitled, title: "Repaso de la Najdorf" }, "student")).toBe("Repaso de la Najdorf");
    expect(classDisplayTitle(untitled, "student")).toBe("Clase con GM Profesor Demo");
    expect(classDisplayTitle(untitled, "teacher")).toBe("Clase de Valentina Cruz");
    expect(classDisplayTitle(untitled, "staff")).toBe("Clase de Valentina Cruz");
  });

  it("una grupal sin tema y una clase sin alumno tienen un nombre", () => {
    expect(classDisplayTitle({ ...untitled, formatCode: CLASS_FORMAT.GROUP, studentNames: [] }, "staff")).toBe(
      "Clase grupal",
    );
    expect(classDisplayTitle({ ...untitled, studentNames: [] }, "staff")).toBe("Clase sin alumno");
    expect(classDisplayTitle({ ...untitled, studentNames: ["Ana", "Bea"] }, "staff")).toBe("Clase de Ana y Bea");
  });
});

describe("joinSpanish", () => {
  it("une con comas y una «y»", () => {
    expect(joinSpanish([])).toBe("");
    expect(joinSpanish(["Ana"])).toBe("Ana");
    expect(joinSpanish(["Ana", "Bea"])).toBe("Ana y Bea");
    expect(joinSpanish(["Ana", "Bea", "Cris"])).toBe("Ana, Bea y Cris");
  });
});

describe("isBlockVisibleToStudent", () => {
  it("«para preparar» siempre, «después» desde el fin, el guion nunca, y nada en una cancelada", () => {
    for (const phase of PHASES) {
      const cancelled = phase === CLASS_PHASE.CANCELLED;
      const ended = phase === CLASS_PHASE.AWAITING_CLOSE || phase === CLASS_PHASE.DONE;
      expect(isBlockVisibleToStudent(CLASS_BLOCK_VISIBILITY.BEFORE, phase), phase).toBe(!cancelled);
      expect(isBlockVisibleToStudent(CLASS_BLOCK_VISIBILITY.AFTER, phase), phase).toBe(ended);
      expect(isBlockVisibleToStudent(CLASS_BLOCK_VISIBILITY.TEACHER, phase), phase).toBe(false);
    }
  });
});

describe("isNewClassBlock", () => {
  const scheduledAt = cdmx("2026-10-14", "12:00");

  it("es nuevo lo agregado después de empezar y hace menos de una semana", () => {
    expect(isNewClassBlock(cdmx("2026-10-14", "12:20"), scheduledAt, cdmx("2026-10-15", "09:00"))).toBe(true);
    expect(isNewClassBlock(cdmx("2026-10-13", "12:20"), scheduledAt, cdmx("2026-10-15", "09:00"))).toBe(false);
    expect(isNewClassBlock(cdmx("2026-10-14", "12:20"), scheduledAt, cdmx("2026-10-22", "09:00"))).toBe(false);
  });
});

describe("planCancellation", () => {
  it("dice qué pasa con cada plaza según su cobertura, y con el profesor", () => {
    expect(
      planCancellation({
        phase: CLASS_PHASE.UPCOMING,
        teacherName: FIXTURE_TEACHER_NAME,
        seats: [
          { studentName: "Alumno Demo", coverage: "paid" },
          { studentName: "Mateo Ríos", coverage: "paid" },
          { studentName: "Diego Salas", coverage: "paid" },
          { studentName: "Lucía Herrera", coverage: "unpaid" },
        ],
      }),
    ).toEqual([
      "Alumno Demo, Mateo Ríos y Diego Salas recuperan su clase: vuelve a su pago y queda por programar.",
      "Lucía Herrera no tenía pago: no recupera nada.",
      "GM Profesor Demo deja de verla en su agenda; el contenido que preparó se conserva.",
    ]);
  });

  it("concuerda en singular, nombra la gratis y avisa cuando la clase ya terminó", () => {
    expect(
      planCancellation({
        phase: CLASS_PHASE.AWAITING_CLOSE,
        teacherName: FIXTURE_TEACHER_NAME,
        seats: [
          { studentName: "Valentina Cruz", coverage: "paid" },
          { studentName: "Andrea López", coverage: "free" },
        ],
      }),
    ).toEqual([
      "Valentina Cruz recupera su clase: vuelve a su pago y queda por programar.",
      "Andrea López tenía la clase gratis: no se le descuenta nada.",
      "GM Profesor Demo deja de verla en su agenda; el contenido que preparó se conserva.",
      "La clase ya terminó: si se dio, finalízala en lugar de cancelarla.",
    ]);
  });
});

describe("blockOrderAfterDrop", () => {
  const sections = { BEFORE: ["b1", "b2"], AFTER: ["a1"], TEACHER: ["t1"] };

  it("devuelve la lista completa con el bloque en su sitio nuevo", () => {
    expect(blockOrderAfterDrop(sections, "b2", CLASS_BLOCK_VISIBILITY.BEFORE, 0)).toEqual(["b2", "b1", "a1", "t1"]);
    expect(blockOrderAfterDrop(sections, "b1", CLASS_BLOCK_VISIBILITY.AFTER, 1)).toEqual(["b2", "a1", "b1", "t1"]);
    expect(blockOrderAfterDrop(sections, "t1", CLASS_BLOCK_VISIBILITY.BEFORE, 99)).toEqual(["b1", "b2", "t1", "a1"]);
  });

  it("no pierde ni duplica ningún bloque", () => {
    const result = blockOrderAfterDrop(sections, "a1", CLASS_BLOCK_VISIBILITY.TEACHER, 0);
    expect([...result].sort()).toEqual(["a1", "b1", "b2", "t1"]);
  });
});
