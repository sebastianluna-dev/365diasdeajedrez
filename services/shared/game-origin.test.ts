import { describe, expect, it } from "vitest";

import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { GAME_ORIGIN, gameOriginOf } from "@/services/shared/game-origin";

const student = { isTeacher: false, isStaff: false };

describe("gameOriginOf", () => {
  it("clasifica como curso lo que cuelga de un curso", () => {
    expect(gameOriginOf({ ownerTypeCode: OWNER_TYPE.COURSE, owner: null })).toBe(GAME_ORIGIN.COURSE);
  });

  it("clasifica como estudio de alumno la base personal de un alumno", () => {
    expect(gameOriginOf({ ownerTypeCode: OWNER_TYPE.USER, owner: student })).toBe(GAME_ORIGIN.STUDENT_STUDY);
  });

  it("clasifica como profesorado la base personal de un profesor o de un editor", () => {
    const teacher = { isTeacher: true, isStaff: false };
    const staff = { isTeacher: false, isStaff: true };

    expect(gameOriginOf({ ownerTypeCode: OWNER_TYPE.USER, owner: teacher })).toBe(GAME_ORIGIN.EDITOR);
    expect(gameOriginOf({ ownerTypeCode: OWNER_TYPE.USER, owner: staff })).toBe(GAME_ORIGIN.EDITOR);
  });

  it("la base de un curso es del curso aunque la creara un editor", () => {
    const staff = { isTeacher: false, isStaff: true };

    expect(gameOriginOf({ ownerTypeCode: OWNER_TYPE.COURSE, owner: staff })).toBe(GAME_ORIGIN.COURSE);
  });
});
