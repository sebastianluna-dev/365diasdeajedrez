import { describe, expect, it } from "vitest";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { readSolutionStart } from "@/lib/chess/exercise-format";
import {
  exerciseKindLabel,
  mapAuthoringExercise,
  mapExerciseCard,
  newExercisePrefill,
  sideToMove,
  teacherExerciseAllowed,
  teacherExercisePermissions,
  teacherSaveButtons,
} from "./teacher-exercises.mapper";
import type { TeacherExerciseRow } from "./teacher-exercises.types";

const LEVELS = [
  { slug: "principiante", name: "Principiante", order: 1, eloMin: 800, eloMax: 1199, isActive: true },
  { slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true },
];

const ROW: TeacherExerciseRow = {
  id: "ex000001",
  title: "Mate del pasillo",
  prompt: null,
  difficulty: 1300,
  hints: ["Mira la última fila."],
  explanation: null,
  mateIn: 1,
  solutionPgn: '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 b - - 0 1"]\n\n*',
  startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 b - - 0 1",
  playerMoves: 1,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  sourceGameId: null,
  kind: { code: "MATE_IN" },
  status: { code: "READY", label: "Listo" },
  topics: [
    { topic: { code: "BACK_RANK_MATE", label: "Mate del pasillo", order: 27 } },
    { topic: { code: "TACTICS", label: "Táctica", order: 0 } },
  ],
  updatedAt: new Date("2026-10-16T12:00:00Z"),
  _count: { attempts: 0 },
};

describe("the bank's cards", () => {
  it("dibujan el tipo, el nivel, el lado que juega y los temas en el orden del catálogo", () => {
    const card = mapExerciseCard(ROW, LEVELS);
    expect(card.kindLabel).toBe("Mate en 1");
    expect(card.levelName).toBe("Intermedio");
    expect(card.orientation).toBe("black");
    expect(card.topicLabels).toEqual(["Táctica", "Mate del pasillo"]);
    expect(card.href).toBe("/profesor/ejercicios/ex000001");
  });

  it("nombran una secuencia como tal", () => {
    expect(exerciseKindLabel("SEQUENCE", null)).toBe("Secuencia");
    expect(sideToMove("8/8/8/8/8/8/8/8 w - - 0 1")).toBe("white");
  });

  it("ofrecen archivar lo propio, restaurar lo archivado y eliminar sólo lo que nadie intentó", () => {
    expect(teacherExerciseAllowed(EXERCISE_STATUS.DRAFT, 0)).toEqual({
      duplicate: true,
      archive: true,
      restore: false,
      delete: true,
    });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.READY, 3).delete).toBe(false);
    expect(teacherExerciseAllowed(EXERCISE_STATUS.ARCHIVED, 0)).toMatchObject({ archive: false, restore: true });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.PUBLISHED, 0)).toMatchObject({ archive: false, delete: false });
  });
});

describe("the editor", () => {
  it("bloquea el contenido en revisión o en la biblioteca, con su motivo", () => {
    expect(teacherExercisePermissions(EXERCISE_STATUS.IN_REVIEW).contentLocked).toBe("inReview");
    expect(teacherExercisePermissions(EXERCISE_STATUS.PUBLISHED).contentLocked).toBe("inLibrary");
    expect(teacherExercisePermissions(EXERCISE_STATUS.READY).contentLocked).toBeNull();
    expect(teacherExercisePermissions(null).canDuplicate).toBe(false);
  });

  it("ofrece borrador y «listo» a lo nuevo y a un borrador, y sólo «Guardar» a uno listo", () => {
    expect(teacherSaveButtons(null).map((button) => button.intent)).toEqual(["draft", "ready"]);
    expect(teacherSaveButtons(EXERCISE_STATUS.DRAFT).filter((button) => button.accent)).toHaveLength(1);
    expect(teacherSaveButtons(EXERCISE_STATUS.READY)).toEqual([
      expect.objectContaining({ intent: "save", accent: true, needsReadiness: true }),
    ]);
    expect(teacherSaveButtons(EXERCISE_STATUS.ARCHIVED)[0]?.needsReadiness).toBe(false);
    expect(teacherSaveButtons(EXERCISE_STATUS.PUBLISHED)).toEqual([]);
  });

  it("abre un ejercicio guardado con sus temas por código, y uno nuevo en la posición inicial", () => {
    expect(mapAuthoringExercise(ROW).topicCodes).toEqual(["TACTICS", "BACK_RANK_MATE"]);
    const prefill = newExercisePrefill();
    expect(prefill.id).toBeNull();
    expect(readSolutionStart(prefill.solutionPgn)).toMatchObject({
      ok: true,
      startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    });
  });
});
