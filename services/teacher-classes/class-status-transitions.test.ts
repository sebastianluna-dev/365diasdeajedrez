import { describe, expect, it } from "vitest";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { canTransitionClassStatus, nextClassStatuses } from "./class-status-transitions";

const ALL_STATUSES = Object.values(CLASS_STATUS) as ClassStatusCode[];

describe("canTransitionClassStatus", () => {
  it("permite el ciclo normal de una clase", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.LIVE)).toBe(true);
    expect(canTransitionClassStatus(CLASS_STATUS.LIVE, CLASS_STATUS.COMPLETED)).toBe(true);
  });

  it("permite cancelar mientras la clase no haya terminado", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.CANCELLED)).toBe(true);
    expect(canTransitionClassStatus(CLASS_STATUS.LIVE, CLASS_STATUS.CANCELLED)).toBe(true);
  });

  it("permite documentar a posteriori una clase programada", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.SCHEDULED, CLASS_STATUS.COMPLETED)).toBe(true);
  });

  it("no deja salir de un estado final: terminada y cancelada son historia", () => {
    for (const to of ALL_STATUSES) {
      expect(canTransitionClassStatus(CLASS_STATUS.COMPLETED, to), `COMPLETED → ${to}`).toBe(false);
      expect(canTransitionClassStatus(CLASS_STATUS.CANCELLED, to), `CANCELLED → ${to}`).toBe(false);
    }
  });

  it("no permite volver atrás ni quedarse en el mismo estado", () => {
    expect(canTransitionClassStatus(CLASS_STATUS.LIVE, CLASS_STATUS.SCHEDULED)).toBe(false);
    for (const status of ALL_STATUSES) {
      expect(canTransitionClassStatus(status, status), `${status} → ${status}`).toBe(false);
    }
  });
});

describe("nextClassStatuses", () => {
  it("lista los destinos posibles de cada estado", () => {
    expect([...nextClassStatuses(CLASS_STATUS.SCHEDULED)]).toEqual([
      CLASS_STATUS.LIVE,
      CLASS_STATUS.CANCELLED,
      CLASS_STATUS.COMPLETED,
    ]);
    expect([...nextClassStatuses(CLASS_STATUS.COMPLETED)]).toEqual([]);
  });
});
