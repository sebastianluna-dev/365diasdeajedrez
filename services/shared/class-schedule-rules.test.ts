import { describe, expect, it } from "vitest";
import { CLASS_DURATIONS } from "@/constants/platform/class-slots.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  durationOptions,
  slotInstant,
  suggestRhythm,
  validateClassSchedule,
  weeklyDates,
} from "./class-schedule-rules";

const base = {
  scheduledAt: cdmx("2026-10-21", "19:00"),
  durationMin: 60,
  meetingVisibleFrom: null,
  now: CLASSES_NOW,
  teacherBusy: [],
  studentBusy: [],
};

describe("validateClassSchedule", () => {
  it("una clase limpia no tiene error ni avisos", () => {
    expect(validateClassSchedule(base)).toEqual({ error: null, warnings: [] });
  });

  it("rechaza un enlace que se abriría después de empezar", () => {
    expect(validateClassSchedule({ ...base, meetingVisibleFrom: cdmx("2026-10-21", "19:05") }).error).toBe(
      "meetingOpensLate",
    );
    expect(validateClassSchedule({ ...base, meetingVisibleFrom: cdmx("2026-10-21", "19:00") }).error).toBeNull();
  });

  it("avisa de un solape del profesor y de un alumno, sin bloquear", () => {
    const check = validateClassSchedule({
      ...base,
      teacherBusy: [
        {
          title: "Plan de aperturas con blancas",
          start: cdmx("2026-10-21", "18:30"),
          end: cdmx("2026-10-21", "19:30"),
        },
      ],
      studentBusy: [
        {
          studentName: "Valentina Cruz",
          title: "Taller",
          start: cdmx("2026-10-21", "19:30"),
          end: cdmx("2026-10-21", "20:30"),
        },
        {
          studentName: "Mateo Ríos",
          title: "Otra",
          start: cdmx("2026-10-21", "20:00"),
          end: cdmx("2026-10-21", "21:00"),
        },
      ],
    });
    expect(check.error).toBeNull();
    expect(check.warnings).toEqual([
      { kind: "teacherOverlap", classTitle: "Plan de aperturas con blancas" },
      { kind: "studentOverlap", studentName: "Valentina Cruz", classTitle: "Taller" },
    ]);
  });

  it("una clase que termina justo cuando empieza otra no se solapa", () => {
    const check = validateClassSchedule({
      ...base,
      teacherBusy: [{ title: "Antes", start: cdmx("2026-10-21", "18:00"), end: cdmx("2026-10-21", "19:00") }],
    });
    expect(check.warnings).toEqual([]);
  });

  it("avisa de una fecha pasada: documentar después es legítimo", () => {
    expect(validateClassSchedule({ ...base, scheduledAt: cdmx("2026-10-12", "17:00") }).warnings).toEqual([
      { kind: "past" },
    ]);
  });
});

describe("weeklyDates", () => {
  it("una fecha cada siete días, cruzando el mes", () => {
    expect(weeklyDates("2026-10-21", 4)).toEqual(["2026-10-21", "2026-10-28", "2026-11-04", "2026-11-11"]);
    expect(weeklyDates("2026-10-21", 0)).toEqual([]);
  });
});

describe("suggestRhythm", () => {
  it("repite el día de la semana, la hora y la duración de la última clase, en su siguiente fecha", () => {
    expect(
      suggestRhythm({ scheduledAt: cdmx("2026-10-14", "19:00"), durationMin: 60 }, CLASSES_NOW, CLASSES_TIME_ZONE),
    ).toEqual({
      firstDate: "2026-10-21",
      time: "19:00",
      durationMin: 60,
      repeat: "weekly",
    });
  });

  it("una última clase de hace semanas salta hasta después de hoy", () => {
    expect(
      suggestRhythm({ scheduledAt: cdmx("2026-09-15", "12:30"), durationMin: 90 }, CLASSES_NOW, CLASSES_TIME_ZONE)
        .firstDate,
    ).toBe("2026-10-20");
  });

  it("sin última clase, mañana a mediodía durante una hora", () => {
    expect(suggestRhythm(null, CLASSES_NOW, CLASSES_TIME_ZONE)).toEqual({
      firstDate: "2026-10-15",
      time: "12:00",
      durationMin: 60,
      repeat: "weekly",
    });
  });
});

describe("slotInstant", () => {
  it("convierte la fecha y la hora de pared en el instante", () => {
    expect(slotInstant("2026-10-21", "19:00", CLASSES_TIME_ZONE)).toEqual(cdmx("2026-10-21", "19:00"));
    expect(slotInstant("2026-02-31", "19:00", CLASSES_TIME_ZONE)).toBeNull();
  });
});

describe("durationOptions", () => {
  it("ofrece las de la lista y conserva una duración vieja que no está en ella", () => {
    expect(durationOptions()).toEqual([...CLASS_DURATIONS]);
    expect(durationOptions(60)).toEqual([...CLASS_DURATIONS]);
    expect(durationOptions(50)).toEqual([30, 45, 50, 60, 90, 120]);
    expect(durationOptions(null)).toEqual([...CLASS_DURATIONS]);
  });
});
