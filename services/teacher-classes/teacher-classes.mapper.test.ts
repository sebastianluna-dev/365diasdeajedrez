import { describe, expect, it } from "vitest";
import { CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  adminLineOf,
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
