import { describe, expect, it } from "vitest";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { studentCard, studentCardAt } from "@/lib/testing/fixtures/student-classes";
import type { ContinueStudyingCard } from "@/services/dashboard/dashboard.types";
import { homePlanOf, isClassToday } from "./home-plan";

const COURSE: ContinueStudyingCard = {
  courseName: "La Najdorf",
  lessonName: "6.Ae3",
  percent: 40,
  completedLessons: 4,
  totalLessons: 10,
  href: "/cursos/12345678/1/abc",
};

const EXERCISES = { classTitle: "Finales de torres", href: "/clases/c2/ejercicios/b1/2", done: 1, total: 3 };

/** The example day is Wednesday 14 October 2026; this class is on Saturday. */
const SATURDAY = studentCardAt("2026-10-17", "10:00", 90, CLASS_PHASE.UPCOMING, { id: "c5" });

describe("homePlanOf", () => {
  it("pone primero la clase del día, y el curso y los ejercicios después", () => {
    const plan = homePlanOf({ nextClass: studentCard(), continueStudying: COURSE, classExercises: EXERCISES });
    expect(plan.focus).toEqual({ kind: "class", card: studentCard(), isToday: true });
    expect(plan.later.map((item) => item.kind)).toEqual(["course", "exercises"]);
  });

  it("otro día, el curso en progreso va primero y la próxima clase después", () => {
    const plan = homePlanOf({ nextClass: SATURDAY, continueStudying: COURSE, classExercises: null });
    expect(plan.focus).toEqual({ kind: "course", course: COURSE });
    expect(plan.later).toEqual([{ kind: "class", card: SATURDAY }]);
  });

  it("sin curso en progreso, la próxima clase es lo siguiente aunque no sea hoy", () => {
    const plan = homePlanOf({ nextClass: SATURDAY, classExercises: null });
    expect(plan.focus).toEqual({ kind: "class", card: SATURDAY, isToday: false });
    expect(plan.later).toEqual([]);
  });

  it("sin nada, lo siguiente es elegir qué estudiar", () => {
    expect(homePlanOf({ nextClass: null, classExercises: null })).toEqual({ focus: { kind: "start" }, later: [] });
  });
});

describe("isClassToday", () => {
  it("lee el día en la zona de la clase", () => {
    expect(isClassToday(studentCard())).toBe(true);
    expect(isClassToday(SATURDAY)).toBe(false);
  });
});
