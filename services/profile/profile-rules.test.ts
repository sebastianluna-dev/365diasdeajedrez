import { describe, expect, it } from "vitest";
import { profileVisibleWhere } from "./profile-rules";

describe("profileVisibleWhere", () => {
  it("lets the staff open any profile", () => {
    expect(profileVisibleWhere({ userId: "s", teacherId: null, isStaff: true })).toEqual({});
  });

  it("lets a person open only their own", () => {
    expect(profileVisibleWhere({ userId: "ana", teacherId: null, isStaff: false })).toEqual({ OR: [{ id: "ana" }] });
  });

  it("lets a teacher open their students' under an active assignment", () => {
    expect(profileVisibleWhere({ userId: "luis", teacherId: "t1", isStaff: false })).toEqual({
      OR: [{ id: "luis" }, { studentAssignments: { some: { teacherId: "t1", endedAt: null } } }],
    });
  });
});
