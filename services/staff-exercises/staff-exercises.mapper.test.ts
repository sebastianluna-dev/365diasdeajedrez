import { describe, expect, it } from "vitest";
import {
  mapStaffExerciseCard,
  mapStaffSeriesCard,
  mapStaffSeriesItem,
  staffExercisePermissions,
  staffExerciseReview,
  staffSaveButtons,
  submittedLabelOf,
} from "./staff-exercises.mapper";
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

describe("staffExercisePermissions y staffSaveButtons", () => {
  it("la academia escribe lo suyo: borrador o publicar; publicado y archivado sólo se guardan", () => {
    expect(staffExercisePermissions("academy", null).contentLocked).toBeNull();
    expect(staffSaveButtons("academy", null).map((button) => button.intent)).toEqual(["draft", "publish"]);
    expect(staffSaveButtons("academy", "DRAFT").map((button) => button.intent)).toEqual(["draft", "publish"]);
    expect(staffSaveButtons("academy", "PUBLISHED").map((button) => button.intent)).toEqual(["save"]);
    expect(staffSaveButtons("academy", "ARCHIVED")).toMatchObject([{ intent: "save", needsReadiness: false }]);
  });

  it("del profesor, el staff edita sólo lo que está en la biblioteca (D48); una propuesta o una devuelta se lee", () => {
    expect(staffExercisePermissions("teacher", "PUBLISHED").contentLocked).toBeNull();
    expect(staffSaveButtons("teacher", "PUBLISHED").map((button) => button.intent)).toEqual(["save"]);
    expect(staffExercisePermissions("teacher", "IN_REVIEW").contentLocked).toBe("staffReview");
    expect(staffExercisePermissions("teacher", "READY").contentLocked).toBe("staffReview");
    expect(staffSaveButtons("teacher", "IN_REVIEW")).toEqual([]);
    expect(staffSaveButtons("teacher", "READY")).toEqual([]);
    // Never «Duplicar»: a copy is the teacher's way.
    expect(staffExercisePermissions("academy", "PUBLISHED").canDuplicate).toBe(false);
  });

  it("un ejercicio archivado de la academia se restaura; uno del profesor, nunca desde aquí", () => {
    const archived = { ...ROW, teacherId: null, teacher: null, status: { code: "ARCHIVED", label: "Archivado" } };
    expect(staffExerciseReview(archived)).toMatchObject({ canRestore: true, canRemove: false });
    expect(staffExerciseReview({ ...ROW, status: { code: "ARCHIVED", label: "Archivado" } }).canRestore).toBe(false);
  });
});

describe("the academy's series", () => {
  const LEVELS_ALL = [
    { slug: "principiante", name: "Principiante", order: 1, eloMin: 800, eloMax: 1199, isActive: true },
    ...LEVELS,
  ];
  const item = (id: string, teacherId: string | null, status: string) => ({
    order: 1,
    exercise: {
      id,
      title: `Ejercicio ${id}`,
      teacherId,
      difficulty: 1000,
      mateIn: null,
      kind: { code: "SEQUENCE" },
      status: { code: status },
    },
  });

  it("sólo lo que está en la biblioteca sigue disponible: lo demás ya no lo ven los alumnos (D32)", () => {
    expect(mapStaffSeriesItem(item("a", null, "PUBLISHED"), LEVELS_ALL)).toMatchObject({
      href: "/administracion/ejercicios/a",
      availability: "available",
      facts: "Secuencia · 1000 · Principiante",
    });
    expect(mapStaffSeriesItem(item("b", "t-1", "PUBLISHED"), LEVELS_ALL).availability).toBe("available");
    expect(mapStaffSeriesItem(item("c", "t-1", "READY"), LEVELS_ALL).availability).toBe("unavailable");
    expect(mapStaffSeriesItem(item("d", null, "ARCHIVED"), LEVELS_ALL).availability).toBe("unavailable");
  });

  it("la tarjeta dice si está publicada y cuántos ejercicios ya no ven los alumnos", () => {
    const card = mapStaffSeriesCard({
      id: "s-9",
      title: "Mates",
      description: null,
      publishedAt: new Date("2026-10-12T15:00:00.000Z"),
      items: [item("a", null, "PUBLISHED"), item("c", "t-1", "READY")],
    });
    expect(card).toMatchObject({
      href: "/administracion/ejercicios/series/s-9",
      itemCount: 2,
      isPublished: true,
      unavailableCount: 1,
    });
    expect(
      mapStaffSeriesCard({ id: "s-8", title: "Vacía", description: null, publishedAt: null, items: [] }),
    ).toMatchObject({
      isPublished: false,
      unavailableCount: 0,
    });
  });
});
