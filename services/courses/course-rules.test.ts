import { describe, expect, it } from "vitest";
import { countChapters, countLessons, formatDuration, isCourseId, isReservedCourseSlug } from "./course-rules";

describe("isCourseId", () => {
  it("tells the id of a course from its slug", () => {
    expect(isCourseId("10000004")).toBe(true);
    expect(isCourseId("mis-60-memorables-partidas")).toBe(false);
  });

  it("asks for the eight digits, no more and no less", () => {
    expect(isCourseId("1000004")).toBe(false);
    expect(isCourseId("100000045")).toBe(false);
    expect(isCourseId("1000000a")).toBe(false);
    expect(isCourseId("")).toBe(false);
  });
});

describe("isReservedCourseSlug", () => {
  it("refuses the slug a page of /cursos already answers to", () => {
    expect(isReservedCourseSlug("explorar")).toBe(true);
  });

  it("refuses one that would be read as an id", () => {
    expect(isReservedCourseSlug("20260928")).toBe(true);
  });

  it("lets through every other one, the ones that only look alike too", () => {
    expect(isReservedCourseSlug("explorar-aperturas")).toBe(false);
    expect(isReservedCourseSlug("2026")).toBe(false);
    expect(isReservedCourseSlug("finales-de-torre-esenciales")).toBe(false);
  });
});

describe("formatDuration", () => {
  it("says the minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(0)).toBe("0 min");
  });

  it("says hours and quarters up to ten hours", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30 min");
    expect(formatDuration(340)).toBe("5 h 45 min");
    expect(formatDuration(118)).toBe("2 h");
  });

  it("says only the hours from ten on", () => {
    expect(formatDuration(1220)).toBe("20 h");
    expect(formatDuration(620)).toBe("10 h");
  });
});

describe("the counts", () => {
  it("drop the accent in the plural of «lección»", () => {
    expect(countLessons(1)).toBe("1 lección");
    expect(countLessons(61)).toBe("61 lecciones");
    expect(countLessons(0)).toBe("0 lecciones");
  });

  it("say «capítulo» in the singular for one", () => {
    expect(countChapters(1)).toBe("1 capítulo");
    expect(countChapters(3)).toBe("3 capítulos");
  });
});
