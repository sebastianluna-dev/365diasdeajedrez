import { describe, expect, it } from "vitest";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { groupTeacherWeek, teacherGreeting } from "./teacher.mapper";

function row(id: string, date: string, time: string): ClassRowData {
  return {
    id,
    href: `/profesor/clases/${id}`,
    title: id,
    phase: CLASS_PHASE.UPCOMING,
    startIso: cdmx(date, time).toISOString(),
    durationMin: 60,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    people: "Alumno Demo · Individual",
    chips: [],
  };
}

describe("groupTeacherWeek", () => {
  it("agrupa por día en la zona del profesor, hoy primero y con su nombre", () => {
    const days = groupTeacherWeek(
      [row("b", "2026-10-17", "10:00"), row("a", "2026-10-14", "19:00"), row("c", "2026-10-14", "12:00")],
      CLASSES_TIME_ZONE,
      CLASSES_NOW,
    );
    expect(days.map((day) => [day.label, day.isToday, day.rows.map((item) => item.id)])).toEqual([
      ["Hoy · miércoles 14 de octubre", true, ["c", "a"]],
      ["Sábado 17 de octubre", false, ["b"]],
    ]);
  });

  it("una zona distinta parte el día en otro sitio", () => {
    // 23:30 in Mexico City is already the next day in Madrid.
    const days = groupTeacherWeek([row("x", "2026-10-14", "23:30")], "Europe/Madrid", CLASSES_NOW);
    expect(days[0]?.key).toBe("2026-10-15");
  });
});

describe("teacherGreeting", () => {
  it("cuenta las clases de hoy", () => {
    expect(teacherGreeting("GM Profesor Demo", 3)).toBe("Hola, GM Profesor Demo. Hoy tienes 3 clases.");
    expect(teacherGreeting("GM Profesor Demo", 1)).toBe("Hola, GM Profesor Demo. Hoy tienes 1 clase.");
    expect(teacherGreeting("GM Profesor Demo", 0)).toBe("Hola, GM Profesor Demo. Hoy no tienes clases.");
  });
});
