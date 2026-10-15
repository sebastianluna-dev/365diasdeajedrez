import { describe, expect, it } from "vitest";
import { CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  agendaHeadline,
  agoLabel,
  groupAgendaDays,
  mapAgendaRow,
  mapPastRow,
  mapStaffSeat,
  type StaffAgendaClassRow,
  type StaffSeatContext,
  type StaffSeatRow,
} from "./staff-classes.mapper";

const TEACHER = { id: "t-1", displayName: "GM Profesor Demo", isActive: true };
const zone = CLASSES_TIME_ZONE;

function row(extra: Partial<StaffAgendaClassRow> = {}): StaffAgendaClassRow {
  return {
    id: "c3",
    title: "Plan de aperturas con blancas",
    scheduledAt: cdmx("2026-10-14", "17:00"),
    endsAt: cdmx("2026-10-14", "18:00"),
    durationMin: 60,
    statusCode: CLASS_STATUS.SCHEDULED,
    formatCode: CLASS_FORMAT.INDIVIDUAL,
    capacity: null,
    meetingUrl: null,
    meetingUrlVisibleFrom: null,
    teacher: TEACHER,
    seats: [
      { userId: "u-m", displayName: "Mateo Ríos", isFree: false, paymentId: "p-m", seatMovedAt: null, attended: null },
    ],
    ...extra,
  };
}

describe("mapAgendaRow", () => {
  it("names the people, warns of the missing link and offers to add it", () => {
    const mapped = mapAgendaRow(row(), CLASSES_NOW, zone);
    expect(mapped.title).toBe("Plan de aperturas con blancas");
    expect(mapped.people).toBe("GM Profesor Demo · Mateo Ríos · Individual");
    expect(mapped.phase).toBe(CLASS_PHASE.UPCOMING);
    expect(mapped.chips).toEqual([{ icon: "no-link", label: "Sin enlace", tone: "warning" }]);
    expect(mapped.action).toMatchObject({ kind: "meeting", label: "Agregar", classId: "c3" });
    expect(mapped.href).toBe("/administracion/clases/c3");
  });

  it("a group class says its seats and counts the ones without a payment; a free class says so", () => {
    const group = mapAgendaRow(
      row({
        id: "c5",
        title: "Taller de finales de torre",
        formatCode: CLASS_FORMAT.GROUP,
        capacity: 6,
        meetingUrl: "https://zoom.us/j/22222222222",
        scheduledAt: cdmx("2026-10-17", "10:00"),
        endsAt: cdmx("2026-10-17", "11:30"),
        seats: [
          {
            userId: "u-d",
            displayName: "Alumno Demo",
            isFree: false,
            paymentId: "p-d",
            seatMovedAt: null,
            attended: null,
          },
          {
            userId: "u-l",
            displayName: "Lucía Herrera",
            isFree: false,
            paymentId: null,
            seatMovedAt: null,
            attended: null,
          },
          {
            userId: "u-x",
            displayName: "Se fue",
            isFree: false,
            paymentId: null,
            seatMovedAt: cdmx("2026-10-10", "10:00"),
            attended: false,
          },
        ],
      }),
      CLASSES_NOW,
      zone,
    );
    expect(group.people).toBe("GM Profesor Demo · Grupal · 2 de 6 plazas");
    expect(group.chips).toEqual([{ icon: "unpaid", label: "1 sin pago", tone: "warning" }]);
    expect(group.action).toBeUndefined();

    const free = mapAgendaRow(
      row({
        title: "Clase de diagnóstico",
        meetingUrl: "https://zoom.us/j/1",
        seats: [
          {
            userId: "u-a",
            displayName: "Andrea López",
            isFree: true,
            paymentId: null,
            seatMovedAt: null,
            attended: null,
          },
        ],
      }),
      CLASSES_NOW,
      zone,
    );
    expect(free.chips).toEqual([{ icon: "free", label: "Gratis" }]);
  });

  it("a class without a topic is «Clase de …», and a deactivated teacher is a chip", () => {
    const mapped = mapAgendaRow(
      row({ title: null, meetingUrl: "https://zoom.us/j/3", teacher: { ...TEACHER, isActive: false } }),
      CLASSES_NOW,
      zone,
    );
    expect(mapped.title).toBe("Clase de Mateo Ríos");
    expect(mapped.chips).toEqual([{ icon: "teacher-inactive", label: "Profesor desactivado", tone: "warning" }]);
  });

  it("a past row counts who came", () => {
    const past = mapPastRow(
      row({
        scheduledAt: cdmx("2026-10-07", "12:00"),
        endsAt: cdmx("2026-10-07", "13:00"),
        statusCode: CLASS_STATUS.COMPLETED,
        meetingUrl: "https://zoom.us/j/1",
        seats: [
          {
            userId: "u-d",
            displayName: "Alumno Demo",
            isFree: false,
            paymentId: "p-d",
            seatMovedAt: null,
            attended: true,
          },
        ],
      }),
      CLASSES_NOW,
      zone,
    );
    expect(past.phase).toBe(CLASS_PHASE.DONE);
    expect(past.teacherName).toBe("GM Profesor Demo");
    expect(past.participantCount).toBe(1);
    expect(past.attendedCount).toBe(1);
    expect(past.chips).toEqual([]);
  });
});

describe("groupAgendaDays and the headline", () => {
  it("groups by day in the zone, today first and named", () => {
    const rows = [
      mapAgendaRow(
        row({ id: "b", scheduledAt: cdmx("2026-10-17", "10:00"), endsAt: cdmx("2026-10-17", "11:30") }),
        CLASSES_NOW,
        zone,
      ),
      mapAgendaRow(
        row({ id: "a", scheduledAt: cdmx("2026-10-14", "19:00"), endsAt: cdmx("2026-10-14", "20:00") }),
        CLASSES_NOW,
        zone,
      ),
      mapAgendaRow(
        row({ id: "c", scheduledAt: cdmx("2026-10-14", "12:00"), endsAt: cdmx("2026-10-14", "13:00") }),
        CLASSES_NOW,
        zone,
      ),
    ];
    const days = groupAgendaDays(rows, zone, CLASSES_NOW);
    expect(days.map((day) => [day.label, day.isToday, day.rows.map((item) => item.id)])).toEqual([
      ["Hoy · miércoles 14 de octubre", true, ["c", "a"]],
      ["Sábado 17 de octubre", false, ["b"]],
    ]);
  });

  it("says the day and the counts", () => {
    expect(agendaHeadline("2026-10-14", 3, 5)).toBe("Hoy es miércoles 14 de octubre · 3 clases hoy y 5 esta semana");
    expect(agendaHeadline("2026-10-14", 1, 1)).toBe("Hoy es miércoles 14 de octubre · 1 clase hoy y 1 esta semana");
    expect(agendaHeadline("2026-10-14", 0, 2)).toBe("Hoy es miércoles 14 de octubre · sin clases hoy y 2 esta semana");
  });

  it("says how long ago", () => {
    expect(agoLabel(cdmx("2026-10-14", "11:20"), CLASSES_NOW)).toBe("hace 20 min");
    expect(agoLabel(cdmx("2026-10-14", "08:00"), CLASSES_NOW)).toBe("hace 3 h");
    expect(agoLabel(cdmx("2026-10-12", "18:00"), CLASSES_NOW)).toBe("hace 1 día");
    expect(agoLabel(cdmx("2026-10-11", "18:00"), CLASSES_NOW)).toBe("hace 2 días");
  });
});

describe("mapStaffSeat", () => {
  const context: StaffSeatContext = {
    phase: CLASS_PHASE.DONE,
    statusCode: CLASS_STATUS.COMPLETED,
    scheduledAt: cdmx("2026-10-14", "19:00"),
    teacherName: "GM Profesor Demo",
    assignedIds: new Set(["u-v"]),
    ordinalOf: () => 4,
    timeZone: zone,
    now: new Date("2026-10-15T18:00:00.000Z"),
  };
  const valentina: StaffSeatRow = {
    userId: "u-v",
    displayName: "Valentina Cruz",
    email: "valentina.demo@365diasdeajedrez.com",
    isFree: false,
    payment: { id: "p-v", paidOn: new Date("2026-09-15T00:00:00.000Z"), classCount: 4 },
    attended: false,
    seatMovedAt: null,
    seatMovedToClass: null,
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
    ],
  };

  it("a no-show of a finished class: the seat, the mark, and what the staff may do", () => {
    const seat = mapStaffSeat(valentina, context);
    expect(seat.coverage).toEqual({ kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep · clase 4 de 4" });
    expect(seat.mark).toEqual({ attended: false, markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12" });
    expect(seat.markedByName).toBe("GM Profesor Demo");
    expect(seat.isAssigned).toBe(true);
    expect(seat.can).toEqual({ remove: false, register: false, changeAttendance: true, moveSeat: true });
    expect(seat.moveContext).toBe(
      "Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo",
    );
  });

  it("a staff change is a second line, and a moved seat is history", () => {
    const changed = mapStaffSeat(
      {
        ...valentina,
        attended: true,
        changes: [
          ...valentina.changes,
          {
            changedAt: cdmx("2026-10-15", "10:05"),
            byName: "Staff Demo",
            fromAttended: false,
            toAttended: true,
            reason: "Estuvo conectada; se le cayó el audio.",
            isOverride: true,
          },
        ],
      },
      context,
    );
    expect(changed.mark.changedLine).toBe(
      "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Estuvo conectada; se le cayó el audio.»",
    );
    expect(changed.markedByName).toBe("Staff Demo");
    expect(changed.can.moveSeat).toBe(false);

    const moved = mapStaffSeat(
      {
        ...valentina,
        seatMovedAt: cdmx("2026-10-15", "08:00"),
        seatMovedToClass: { id: "c-new", scheduledAt: cdmx("2026-10-16", "19:00") },
      },
      context,
    );
    expect(moved.moved).toBe(true);
    expect(moved.coverage).toEqual({ kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep" });
    expect(moved.mark.moved).toEqual({
      label: "Faltó · reprogramada al vie 16 oct",
      href: "/administracion/clases/c-new",
    });
    expect(moved.can).toEqual({ remove: false, register: false, changeAttendance: false, moveSeat: false });

    const returned = mapStaffSeat({ ...valentina, seatMovedAt: cdmx("2026-10-15", "08:00") }, context);
    expect(returned.mark.moved).toEqual({ label: "Faltó · devuelta a su pago" });
  });

  it("an unpaid seat of a class ahead can be registered or taken out; a free one neither", () => {
    const ahead: StaffSeatContext = {
      ...context,
      phase: CLASS_PHASE.UPCOMING,
      statusCode: CLASS_STATUS.SCHEDULED,
      assignedIds: new Set(),
    };
    const unpaid = mapStaffSeat({ ...valentina, payment: null, attended: null, changes: [] }, ahead);
    expect(unpaid.coverage).toEqual({ kind: "unpaid", label: "Sin pago" });
    expect(unpaid.isAssigned).toBe(false);
    expect(unpaid.can).toEqual({ remove: true, register: true, changeAttendance: false, moveSeat: false });
    expect(unpaid.moveContext).toBe("Faltó el mié 14 oct · la clase estaba sin pago · Profesor: GM Profesor Demo");

    const free = mapStaffSeat({ ...valentina, payment: null, isFree: true, attended: null, changes: [] }, ahead);
    expect(free.coverage).toEqual({ kind: "free", label: "Gratis" });
    expect(free.can.register).toBe(false);
    expect(free.mark).toEqual({ attended: null });
  });

  it("the seat a moved one went to says what it replaces", () => {
    const seat = mapStaffSeat({ ...valentina, replaces: { scheduledAt: cdmx("2026-10-02", "19:00") } }, context);
    expect(seat.mark.replacesLabel).toBe("Reposición de su clase del vie 2 oct");
  });
});
