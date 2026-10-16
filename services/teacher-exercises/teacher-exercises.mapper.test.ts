import { describe, expect, it } from "vitest";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { readSolutionStart } from "@/lib/chess/exercise-format";
import {
  exerciseFacts,
  exercisePrefillFromGame,
  mapAuthoringExercise,
  mapExerciseCard,
  mapSeriesCard,
  mapSeriesItem,
  mapSeriesPickOption,
  mapSeriesShare,
  newExercisePrefill,
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

describe("the series", () => {
  const item = (teacherId: string | null, status: string) => ({
    order: 1,
    exercise: {
      id: "ex000001",
      title: "Mate del pasillo",
      teacherId,
      difficulty: 1300,
      mateIn: 1,
      kind: { code: "MATE_IN" },
      status: { code: status },
    },
  });

  it("dicen de cada ejercicio su tipo, su dificultad y su nivel", () => {
    expect(exerciseFacts({ kind: { code: "MATE_IN" }, mateIn: 2, difficulty: 1400 }, LEVELS)).toBe(
      "Mate en 2 · 1400 · Intermedio",
    );
    expect(exerciseFacts({ kind: { code: "SEQUENCE" }, mateIn: null, difficulty: 2000 }, LEVELS)).toBe(
      "Secuencia · 2000",
    );
  });

  it("abren el ejercicio propio en el editor y avisan del que los alumnos ya no ven", () => {
    expect(mapSeriesItem(item("t1", "READY"), "t1", LEVELS)).toMatchObject({
      href: "/profesor/ejercicios/ex000001",
      availability: "available",
    });
    expect(mapSeriesItem(item("t1", "ARCHIVED"), "t1", LEVELS).availability).toBe("archived");
    // Another teacher's exercise taken out of the library: no page of this teacher's, and gone for the students.
    expect(mapSeriesItem(item("t2", "READY"), "t1", LEVELS)).toMatchObject({ href: null, availability: "unavailable" });
    expect(mapSeriesItem(item(null, "PUBLISHED"), "t1", LEVELS)).toMatchObject({
      href: null,
      availability: "available",
    });
  });

  it("cuentan en el banco lo que tienen, quién la tiene y lo que ya no se ve", () => {
    const card = mapSeriesCard(
      {
        id: "se000001",
        title: "Táctica de la semana",
        description: null,
        items: [item("t1", "READY").exercise, item("t1", "ARCHIVED").exercise, item("t2", "DRAFT").exercise],
        shareCount: 2,
      },
      "t1",
    );
    expect(card).toEqual({
      id: "se000001",
      href: "/profesor/ejercicios/series/se000001",
      title: "Táctica de la semana",
      description: null,
      itemCount: 3,
      studentCount: 2,
      unavailableCount: 2,
    });
  });

  it("ofrecen al agregar el título, los datos y los temas en el orden del catálogo", () => {
    expect(mapSeriesPickOption(ROW)).toEqual({
      id: "ex000001",
      title: "Mate del pasillo",
      facts: "Mate en 1 · 1300",
      topics: "Táctica, Mate del pasillo",
    });
  });

  it("dicen desde cuándo la tiene cada alumno", () => {
    expect(
      mapSeriesShare({
        createdAt: new Date("2026-10-12T18:00:00Z"),
        user: { id: "u1", displayName: "Alumno Demo", email: "alumno.demo@365diasdeajedrez.com" },
      }),
    ).toMatchObject({ userId: "u1", displayName: "Alumno Demo", sharedAtLabel: expect.stringContaining("octubre") });
  });
});

describe("exercisePrefillFromGame («Crear ejercicio desde aquí», D11)", () => {
  const GAME = {
    id: "game-1",
    title: null,
    white: "Morphy, Paul",
    black: "Duke Karl / Count Isouard",
    event: "Paris",
    playedAt: new Date("1858-11-02T00:00:00.000Z"),
    pgn: "1. e4 e5 *",
  };
  const SEED = { solutionPgn: '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *' };

  it("es un ejercicio nuevo con la solución de la semilla, el título «Blancas – Negras, año» y la fuente de la partida", () => {
    const prefill = exercisePrefillFromGame(GAME, SEED);
    expect(prefill).toMatchObject({
      id: null,
      statusCode: null,
      solutionPgn: SEED.solutionPgn,
      title: "Morphy, Paul – Duke Karl / Count Isouard, 1858",
      sourceWhite: "Morphy, Paul",
      sourceBlack: "Duke Karl / Count Isouard",
      sourceEvent: "Paris",
      sourceYear: 1858,
      sourceGameId: "game-1",
      kind: "SEQUENCE",
      mateIn: null,
      topicCodes: [],
    });
  });

  it("prefiere el título de la partida, y sin fecha no inventa un año", () => {
    const prefill = exercisePrefillFromGame({ ...GAME, title: "La partida de la ópera", playedAt: null }, SEED);
    expect(prefill.title).toBe("La partida de la ópera");
    expect(prefill.sourceYear).toBeNull();
    expect(exercisePrefillFromGame({ ...GAME, playedAt: null }, SEED).title).toBe(
      "Morphy, Paul – Duke Karl / Count Isouard",
    );
  });

  it("un «?» en los jugadores no es un nombre, y el título los llama por su color", () => {
    const prefill = exercisePrefillFromGame({ ...GAME, white: "?", black: " ", event: "-", playedAt: null }, SEED);
    expect(prefill.title).toBe("Blancas – Negras");
    expect(prefill.sourceWhite).toBeNull();
    expect(prefill.sourceBlack).toBeNull();
    expect(prefill.sourceEvent).toBeNull();
  });

  it("recorta lo que no cabe en sus columnas", () => {
    const long = "x".repeat(200);
    const prefill = exercisePrefillFromGame({ ...GAME, white: long, black: long, event: long, playedAt: null }, SEED);
    expect(prefill.title).toHaveLength(120);
    expect(prefill.sourceWhite).toHaveLength(120);
    expect(prefill.sourceEvent).toHaveLength(160);
  });
});
