import { describe, expect, it } from "vitest";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { canTransitionClassStatus } from "./class-status-transitions";

const ALL = Object.values(CLASS_STATUS) as ClassStatusCode[];

describe("canTransitionClassStatus", () => {
  it("el profesor finaliza, y nada más", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.COMPLETED, "teacher")).toBe(true);
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.CANCELLED, "teacher")).toBe(false);
  });

  it("administración finaliza en nombre del profesor o cancela", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.COMPLETED, "staff")).toBe(true);
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.CANCELLED, "staff")).toBe(true);
  });

  it("una fila LIVE vieja sale como una programada, y LIVE nunca es destino", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.LIVE, CLASS_STATUS.COMPLETED, "teacher")).toBe(true);
    expect(canTransitionClassStatus(CLASS_STATUS.LIVE, CLASS_STATUS.CANCELLED, "staff")).toBe(true);
    for (const role of ["teacher", "staff"] as const) {
      expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.LIVE, role)).toBe(false);
    }
  });

  it("terminada y cancelada son historia: no salen de ahí", () => {
    for (const from of [CLASS_STATUS.COMPLETED, CLASS_STATUS.CANCELLED]) {
      for (const to of ALL) {
        expect(canTransitionClassStatus(from, to, "staff"), `${from} → ${to}`).toBe(false);
      }
    }
  });
});
