import { describe, expect, it } from "vitest";
import { mapStaffExerciseCard, staffExerciseReview, submittedLabelOf } from "./staff-exercises.mapper";
import type { StaffExerciseRow } from "./staff-exercises.types";

const ROW: StaffExerciseRow = {
  id: "ex000009",
  teacherId: "t-1",
  teacher: { displayName: "Profesor Demo" },
  title: "La dama que se entrega",
  prompt: null,
  difficulty: 1400,
  hints: [],
  explanation: "La dama se entrega en g8.",
  mateIn: 2,
  solutionPgn: `[SetUp "1"]\n[FEN "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1"]\n\n1. Qg8+ Rxg8 2. Nf7# *`,
  startFen: "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1",
  playerMoves: 2,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  sourceGameId: null,
  kind: { code: "MATE_IN" },
  status: { code: "IN_REVIEW", label: "En revisión" },
  topics: [{ topic: { code: "MATING_ATTACK", label: "Ataque de mate", order: 2 } }],
  submittedAt: new Date("2026-10-14T15:00:00.000Z"),
  reviewedAt: null,
  reviewedBy: null,
  reviewNote: null,
  publishedAt: null,
  updatedAt: new Date("2026-10-14T15:00:00.000Z"),
  _count: { attempts: 0 },
};

const LEVELS = [{ slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true }];

describe("staffExerciseReview", () => {
  it("una propuesta de un profesor se aprueba o se devuelve, nunca se quita", () => {
    const review = staffExerciseReview(ROW);
    expect(review).toMatchObject({
      owner: "teacher",
      authorLabel: "Profesor Demo",
      canApprove: true,
      canReturn: true,
      canRemove: false,
      reviewedLabel: null,
    });
    expect(review.submittedLabel).toBe("Propuesto el 14 de octubre, 2026");
  });

  it("una del profesor en la biblioteca sólo se quita; una de la academia también (al archivo)", () => {
    const published = { ...ROW, status: { code: "PUBLISHED", label: "En la biblioteca" } };
    expect(staffExerciseReview(published)).toMatchObject({ canApprove: false, canReturn: false, canRemove: true });
    expect(staffExerciseReview({ ...published, teacherId: null, teacher: null })).toMatchObject({
      owner: "academy",
      authorLabel: "Academia",
      canRemove: true,
    });
  });

  it("una devuelta no ofrece nada y dice quién la devolvió y qué anotó", () => {
    const review = staffExerciseReview({
      ...ROW,
      status: { code: "READY", label: "Listo" },
      reviewedAt: new Date("2026-10-15T15:00:00.000Z"),
      reviewedBy: { displayName: "Staff Demo" },
      reviewNote: "Falta la explicación.",
    });
    expect(review).toMatchObject({
      canApprove: false,
      canReturn: false,
      canRemove: false,
      reviewNote: "Falta la explicación.",
    });
    expect(review.reviewedLabel).toBe("Devuelto el 15 de octubre, 2026 por Staff Demo");
  });
});

describe("mapStaffExerciseCard y submittedLabelOf", () => {
  it("la tarjeta abre el editor del staff y nombra al autor; la cola dice cuándo se propuso", () => {
    const card = mapStaffExerciseCard(ROW, LEVELS);
    expect(card).toMatchObject({
      href: "/administracion/ejercicios/ex000009",
      authorLabel: "Profesor Demo",
      levelName: "Intermedio",
      kindLabel: "Mate en 2",
      allowed: { duplicate: false, archive: false, restore: false, delete: false },
    });
    expect(submittedLabelOf(ROW)).toBe("Propuesto el 14 de octubre, 2026 por Profesor Demo");
    expect(submittedLabelOf({ ...ROW, submittedAt: null, teacherId: null, teacher: null })).toBe(
      "Propuesto por Academia",
    );
  });
});
