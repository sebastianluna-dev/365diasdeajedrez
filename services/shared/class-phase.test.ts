import { describe, expect, it } from "vitest";
import { CLASS_PHASE, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, FIXTURE_CLASSES, cdmx } from "@/lib/testing/fixtures/classes";
import { classEndsAt, classPhase, classPhaseInstants, studentClassView } from "./class-phase";

const open = FIXTURE_CLASSES.open;

describe("classPhase", () => {
  it("da una fase a cada clase de la demo a las 11:40", () => {
    for (const fixture of Object.values(FIXTURE_CLASSES)) {
      expect(classPhase(fixture, CLASSES_NOW), fixture.id).toBe(fixture.phaseAtNow);
    }
  });

  it("cambia de fase justo en los bordes: 11:30 abre, 12:00 empieza, 13:00 termina", () => {
    expect(classPhase(open, cdmx("2026-10-14", "11:29"))).toBe(CLASS_PHASE.UPCOMING);
    expect(classPhase(open, cdmx("2026-10-14", "11:30"))).toBe(CLASS_PHASE.OPEN);
    expect(classPhase(open, cdmx("2026-10-14", "11:59"))).toBe(CLASS_PHASE.OPEN);
    expect(classPhase(open, cdmx("2026-10-14", "12:00"))).toBe(CLASS_PHASE.IN_PROGRESS);
    expect(classPhase(open, cdmx("2026-10-14", "12:59"))).toBe(CLASS_PHASE.IN_PROGRESS);
    expect(classPhase(open, cdmx("2026-10-14", "13:00"))).toBe(CLASS_PHASE.AWAITING_CLOSE);
  });

  it("sin enlace nunca está «abierta»: pasa de próxima a en curso", () => {
    const noLink = { ...open, hasLink: false, visibleFrom: null };
    expect(classPhase(noLink, cdmx("2026-10-14", "11:45"))).toBe(CLASS_PHASE.UPCOMING);
    expect(classPhase(noLink, cdmx("2026-10-14", "12:00"))).toBe(CLASS_PHASE.IN_PROGRESS);
  });

  it("una fila LIVE vieja se lee como programada: la hora decide", () => {
    expect(
      classPhase(
        {
          ...FIXTURE_CLASSES.staleLive,
          scheduledAt: cdmx("2026-10-14", "18:00"),
          endsAt: cdmx("2026-10-14", "19:00"),
          visibleFrom: cdmx("2026-10-14", "17:30"),
        },
        CLASSES_NOW,
      ),
    ).toBe(CLASS_PHASE.UPCOMING);
  });

  it("terminada y cancelada no miran el reloj", () => {
    expect(classPhase({ ...open, statusCode: CLASS_STATUS.COMPLETED }, cdmx("2026-10-14", "11:00"))).toBe(
      CLASS_PHASE.DONE,
    );
    expect(classPhase({ ...open, statusCode: CLASS_STATUS.CANCELLED }, cdmx("2026-10-14", "12:30"))).toBe(
      CLASS_PHASE.CANCELLED,
    );
  });
});

describe("classEndsAt", () => {
  it("suma la duración", () => {
    expect(classEndsAt(cdmx("2026-10-14", "12:00"), 90)).toEqual(cdmx("2026-10-14", "13:30"));
  });
});

describe("classPhaseInstants", () => {
  it("lista cuándo se abre el enlace, cuándo empieza y cuándo termina, en orden", () => {
    expect(classPhaseInstants(open)).toEqual([
      cdmx("2026-10-14", "11:30"),
      cdmx("2026-10-14", "12:00"),
      cdmx("2026-10-14", "13:00"),
    ]);
  });

  it("sin enlace, sólo el inicio y el fin; terminada o cancelada, nada", () => {
    expect(classPhaseInstants(FIXTURE_CLASSES.upcoming)).toEqual([
      cdmx("2026-10-14", "17:00"),
      cdmx("2026-10-14", "18:00"),
    ]);
    expect(classPhaseInstants(FIXTURE_CLASSES.done)).toEqual([]);
    expect(classPhaseInstants(FIXTURE_CLASSES.cancelled)).toEqual([]);
  });
});

describe("studentClassView", () => {
  const endsAt = cdmx("2026-10-14", "13:00");

  it("mira hacia delante antes y durante la clase, y en una cancelada", () => {
    for (const phase of [CLASS_PHASE.UPCOMING, CLASS_PHASE.OPEN, CLASS_PHASE.IN_PROGRESS, CLASS_PHASE.CANCELLED]) {
      expect(studentClassView(phase, endsAt, cdmx("2026-10-14", "12:30")), phase).toBe("ahead");
    }
  });

  it("recién terminada sigue hacia delante mientras el enlace se ofrece, y repasa después", () => {
    expect(studentClassView(CLASS_PHASE.AWAITING_CLOSE, endsAt, cdmx("2026-10-14", "13:10"))).toBe("ahead");
    expect(studentClassView(CLASS_PHASE.AWAITING_CLOSE, endsAt, cdmx("2026-10-14", "13:31"))).toBe("review");
    expect(studentClassView(CLASS_PHASE.DONE, endsAt, cdmx("2026-10-14", "13:05"))).toBe("ahead");
    expect(studentClassView(CLASS_PHASE.DONE, endsAt, cdmx("2026-10-15", "09:00"))).toBe("review");
  });
});
