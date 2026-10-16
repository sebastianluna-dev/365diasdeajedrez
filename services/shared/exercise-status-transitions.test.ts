import { describe, expect, it } from "vitest";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import {
  EXERCISE_TRANSITIONS,
  exerciseReadiness,
  exerciseTransition,
  exerciseTransitionsFrom,
  isExerciseContentLocked,
  type ExerciseActorRole,
  type ExerciseOwnerKind,
} from "./exercise-status-transitions";

const { DRAFT, READY, IN_REVIEW, PUBLISHED, ARCHIVED } = EXERCISE_STATUS;

// The table of PLAN.md §8, row by row: [from, to, who, owner, readiness, explanation, note].
const TABLE: [
  ExerciseStatusCode,
  ExerciseStatusCode,
  ExerciseActorRole,
  ExerciseOwnerKind,
  boolean,
  boolean,
  boolean,
][] = [
  [DRAFT, READY, "ownerTeacher", "teacher", true, false, false],
  [READY, IN_REVIEW, "ownerTeacher", "teacher", true, true, false],
  [IN_REVIEW, READY, "ownerTeacher", "teacher", false, false, false],
  [IN_REVIEW, READY, "staff", "teacher", false, false, true],
  [IN_REVIEW, PUBLISHED, "staff", "teacher", true, true, false],
  [PUBLISHED, READY, "staff", "teacher", false, false, true],
  [DRAFT, PUBLISHED, "staff", "academy", true, false, false],
  [DRAFT, PUBLISHED, "staff", "lesson", true, false, false],
  [PUBLISHED, DRAFT, "staff", "lesson", false, false, false],
  [PUBLISHED, ARCHIVED, "staff", "academy", false, false, false],
  [PUBLISHED, ARCHIVED, "staff", "lesson", false, false, false],
  [DRAFT, ARCHIVED, "staff", "lesson", false, false, false],
  [DRAFT, ARCHIVED, "ownerTeacher", "teacher", false, false, false],
  [READY, ARCHIVED, "ownerTeacher", "teacher", false, false, false],
  [ARCHIVED, READY, "ownerTeacher", "teacher", true, false, false],
  [ARCHIVED, DRAFT, "staff", "academy", false, false, false],
];

const STATUSES = Object.values(EXERCISE_STATUS);
const ROLES: ExerciseActorRole[] = ["ownerTeacher", "staff"];
const OWNERS: ExerciseOwnerKind[] = ["teacher", "academy", "lesson"];

const BACK_RANK = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *';

describe("exerciseTransition", () => {
  it.each(TABLE)("%s → %s por %s (%s)", (from, to, role, owner, readiness, explanation, note) => {
    expect(exerciseTransition(from, to, role, owner)).toMatchObject({ readiness, explanation, note });
  });

  it("no permite ningún paso que no esté en la tabla", () => {
    const allowed = new Set(TABLE.map(([from, to, role, owner]) => `${from}>${to}>${role}>${owner}`));
    for (const from of STATUSES)
      for (const to of STATUSES)
        for (const role of ROLES)
          for (const owner of OWNERS) {
            const key = `${from}>${to}>${role}>${owner}`;
            expect(exerciseTransition(from, to, role, owner) !== null, key).toBe(allowed.has(key));
          }
  });

  it("el profesor nunca publica ni devuelve: la biblioteca es del staff", () => {
    const teacherTargets = EXERCISE_TRANSITIONS.filter((rule) => rule.role === "ownerTeacher").map((rule) => rule.to);
    expect(teacherTargets).not.toContain(PUBLISHED);
    expect(EXERCISE_TRANSITIONS.filter((rule) => rule.role === "ownerTeacher" && rule.note)).toEqual([]);
  });

  it("todo lo que entra en listo, en revisión o en la biblioteca pasa por la preparación", () => {
    for (const rule of EXERCISE_TRANSITIONS) {
      if (rule.to === ARCHIVED || rule.to === DRAFT) continue;
      // A withdrawal or a return keeps content that already passed it.
      if (rule.from === IN_REVIEW && rule.to === READY) continue;
      if (rule.from === PUBLISHED && rule.to === READY) continue;
      expect(rule.readiness, `${rule.from} → ${rule.to}`).toBe(true);
    }
  });

  it("exerciseTransitionsFrom da los botones de cada estado", () => {
    expect(exerciseTransitionsFrom(DRAFT, "ownerTeacher", "teacher")).toEqual([READY, ARCHIVED]);
    expect(exerciseTransitionsFrom(READY, "ownerTeacher", "teacher")).toEqual([IN_REVIEW, ARCHIVED]);
    expect(exerciseTransitionsFrom(IN_REVIEW, "staff", "teacher")).toEqual([READY, PUBLISHED]);
    expect(exerciseTransitionsFrom(ARCHIVED, "ownerTeacher", "teacher")).toEqual([READY]);
    expect(exerciseTransitionsFrom(PUBLISHED, "ownerTeacher", "teacher")).toEqual([]);
  });
});

describe("isExerciseContentLocked", () => {
  it("bloquea al profesor su ejercicio en revisión o en la biblioteca, nada más", () => {
    expect(isExerciseContentLocked(IN_REVIEW, "teacher")).toBe(true);
    expect(isExerciseContentLocked(PUBLISHED, "teacher")).toBe(true);
    for (const status of [DRAFT, READY, ARCHIVED]) expect(isExerciseContentLocked(status, "teacher")).toBe(false);
    expect(isExerciseContentLocked(PUBLISHED, "academy")).toBe(false);
  });
});

describe("exerciseReadiness", () => {
  const ready = { title: "Mate del pasillo", solutionPgn: BACK_RANK, kind: "SEQUENCE" as const, mateIn: null };

  it("acepta una solución buena con título y un tema", () => {
    expect(exerciseReadiness({ ...ready, topicCount: 1, explanation: null })).toEqual({
      ok: true,
      solution: [],
      missing: [],
    });
  });

  it("pide un tema y un título", () => {
    expect(exerciseReadiness({ ...ready, title: "  ", topicCount: 0, explanation: null })).toMatchObject({
      ok: false,
      missing: ["title", "topic"],
    });
  });

  it("pide la explicación sólo cuando el paso la necesita", () => {
    expect(exerciseReadiness({ ...ready, topicCount: 1, explanation: " " }, { explanation: true })).toMatchObject({
      ok: false,
      missing: ["explanation"],
    });
    expect(
      exerciseReadiness({ ...ready, topicCount: 1, explanation: "Ab8 no existe." }, { explanation: true }).ok,
    ).toBe(true);
  });

  it("devuelve los problemas de la solución: un «Mate en 2» que mata en 1", () => {
    const readiness = exerciseReadiness({ ...ready, kind: "MATE_IN", mateIn: 2, topicCount: 1, explanation: null });
    expect(readiness.ok).toBe(false);
    expect(readiness.solution).toContainEqual({ code: "mateLengthMismatch" });
  });

  it("una solución sin jugadas no está lista", () => {
    const empty = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n*';
    expect(
      exerciseReadiness({ ...ready, solutionPgn: empty, topicCount: 1, explanation: null }).solution,
    ).toContainEqual({ code: "noMoves" });
  });
});
