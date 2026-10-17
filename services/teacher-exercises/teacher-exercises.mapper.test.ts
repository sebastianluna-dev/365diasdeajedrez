import { describe, expect, it } from "vitest";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { readSolutionStart } from "@/lib/chess/exercise-format";
import {
  attemptOutcomeOf,
  attemptWhereLabel,
  exerciseFacts,
  exercisePrefillFromGame,
  formatAttemptDuration,
  mapAuthoringExercise,
  mapExerciseAttemptRow,
  mapSeriesProgress,
  mapExerciseCard,
  mapSeriesCard,
  mapSeriesItem,
  mapSeriesPickOption,
  mapSeriesShare,
  newExercisePrefill,
  mapLibraryExerciseCard,
  teacherExerciseAllowed,
  teacherExerciseReview,
  teacherExercisePermissions,
  teacherSaveButtons,
} from "./teacher-exercises.mapper";
import type { TeacherAttemptRow, TeacherExerciseRow } from "./teacher-exercises.types";

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
  reviewNote: null,
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
      propose: false,
      withdraw: false,
    });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.READY, 3).delete).toBe(false);
    expect(teacherExerciseAllowed(EXERCISE_STATUS.ARCHIVED, 0)).toMatchObject({ archive: false, restore: true });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.PUBLISHED, 0)).toMatchObject({ archive: false, delete: false });
  });

  it("proponen a la biblioteca lo listo y retiran lo que está en revisión, nada más (D07, D16)", () => {
    expect(teacherExerciseAllowed(EXERCISE_STATUS.READY, 0)).toMatchObject({ propose: true, withdraw: false });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.IN_REVIEW, 0)).toMatchObject({
      propose: false,
      withdraw: true,
      archive: false,
      delete: false,
    });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.PUBLISHED, 0)).toMatchObject({ propose: false, withdraw: false });
    expect(teacherExerciseAllowed(EXERCISE_STATUS.DRAFT, 0).propose).toBe(false);
  });

  it("la nota del staff se muestra sólo mientras el ejercicio vuelve a ser del profesor (listo)", () => {
    const returned = { ...ROW, status: { code: "READY", label: "Listo" }, reviewNote: "Falta la explicación." };
    expect(mapExerciseCard(returned, LEVELS).note).toBe("Falta la explicación.");
    expect(
      mapExerciseCard({ ...returned, status: { code: "IN_REVIEW", label: "En revisión" } }, LEVELS).note,
    ).toBeNull();
    expect(teacherExerciseReview(EXERCISE_STATUS.READY, "Falta la explicación.")).toEqual({
      canPropose: true,
      canWithdraw: false,
      note: "Falta la explicación.",
    });
    expect(teacherExerciseReview(EXERCISE_STATUS.IN_REVIEW, "Falta la explicación.")).toEqual({
      canPropose: false,
      canWithdraw: true,
      note: null,
    });
  });

  it("una tarjeta de la biblioteca no abre ninguna página del profesor y nombra al autor (D08)", () => {
    const card = mapLibraryExerciseCard(
      { ...ROW, teacherId: null, teacher: null, status: { code: "PUBLISHED", label: "En la biblioteca" } },
      LEVELS,
    );
    expect(card).toMatchObject({ href: null, authorLabel: "Academia", statusCode: "PUBLISHED" });
    expect(card.allowed).toEqual({ duplicate: false, archive: false, restore: false, delete: false });
    expect(
      mapLibraryExerciseCard(
        { ...ROW, teacherId: "t-2", teacher: { displayName: "Ana Ruiz" }, status: { code: "PUBLISHED", label: "" } },
        LEVELS,
      ).authorLabel,
    ).toBe("Ana Ruiz");
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

describe("the teacher's view of an attempt (D24, D45)", () => {
  const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
  const NOW = new Date("2026-10-16T12:00:00.000Z");
  const ATTEMPT: TeacherAttemptRow = {
    id: "a-1",
    exerciseId: "ex000001",
    seriesId: "s-1",
    createdAt: new Date("2026-10-15T20:12:00.000Z"),
    durationMs: 42_000,
    hintsUsed: 0,
    solutionShown: false,
    result: { code: "FAILED" },
    context: { code: "SERIES", label: "Serie" },
    exercise: { id: "ex000001", title: "Mate del pasillo", teacherId: "t-1", startFen: BACK_RANK },
    series: { title: "Táctica de la semana" },
    classBlock: null,
    mistakeDetails: [{ fen: BACK_RANK, expectedSan: "Rd8#", playedSan: "Rd7" }],
  };

  it("dice cómo fue con las cuatro palabras del alumno; «Ver la solución» es fallado aunque las jugadas fueran bien", () => {
    expect(attemptOutcomeOf({ result: { code: "PASSED" }, hintsUsed: 0, solutionShown: false })).toBe("solved");
    expect(attemptOutcomeOf({ result: { code: "PASSED" }, hintsUsed: 1, solutionShown: false })).toBe("hinted");
    expect(attemptOutcomeOf({ result: { code: "FAILED" }, hintsUsed: 0, solutionShown: false })).toBe("failed");
    expect(attemptOutcomeOf({ result: { code: "FAILED" }, hintsUsed: 2, solutionShown: true })).toBe("solutionShown");
  });

  it("dice dónde: la serie por su título, «De una serie eliminada» sin ella (D45), o el contexto", () => {
    expect(attemptWhereLabel(ATTEMPT, NOW)).toBe("Serie: Táctica de la semana");
    expect(attemptWhereLabel({ ...ATTEMPT, series: null }, NOW)).toBe("De una serie eliminada");
    expect(
      attemptWhereLabel({ ...ATTEMPT, context: { code: "PRACTICE", label: "Práctica libre" }, series: null }, NOW),
    ).toBe("Práctica libre");
  });

  it("dice la clase: por su tema, por su día sin tema, o «De un bloque de clase eliminado» (fase 3)", () => {
    const inClass = { ...ATTEMPT, context: { code: "CLASS", label: "Clase" }, series: null };
    const scheduledAt = new Date("2026-10-14T18:00:00.000Z");
    expect(
      attemptWhereLabel({ ...inClass, classBlock: { class: { title: "Repaso de la Najdorf", scheduledAt } } }, NOW),
    ).toBe("Clase: Repaso de la Najdorf");
    expect(attemptWhereLabel({ ...inClass, classBlock: { class: { title: null, scheduledAt } } }, NOW)).toBe(
      "Clase del mié 14 oct",
    );
    // The block is what went (deleted, or turned into another kind); the class may still be there.
    expect(attemptWhereLabel({ ...inClass, classBlock: null }, NOW)).toBe("De un bloque de clase eliminado");
  });

  it("una clase de otro año dice su año: la fila se lee mucho después", () => {
    const inClass = { ...ATTEMPT, context: { code: "CLASS", label: "Clase" }, series: null };
    const lastYear = { class: { title: null, scheduledAt: new Date("2025-10-14T18:00:00.000Z") } };
    expect(attemptWhereLabel({ ...inClass, classBlock: lastYear }, NOW)).toBe("Clase del mar 14 oct 2025");
    expect(attemptWhereLabel({ ...inClass, classBlock: lastYear }, new Date("2025-10-20T12:00:00.000Z"))).toBe(
      "Clase del mar 14 oct",
    );
  });

  it("escribe el tiempo en segundos o en minutos, y nada sin tiempo", () => {
    expect(formatAttemptDuration(400)).toBe("menos de 1 s");
    expect(formatAttemptDuration(42_000)).toBe("42 s");
    expect(formatAttemptDuration(65_000)).toBe("1 min 5 s");
    expect(formatAttemptDuration(120_000)).toBe("2 min");
    expect(formatAttemptDuration(null)).toBeNull();
  });

  it("un fallo trae su error en español, con la flecha de lo jugado en rojo y la de lo esperado en verde", () => {
    const row = mapExerciseAttemptRow(ATTEMPT, "t-1", NOW);
    expect(row).toMatchObject({
      id: "a-1",
      title: "Mate del pasillo",
      href: "/profesor/ejercicios/ex000001",
      atIso: "2026-10-15T20:12:00.000Z",
      outcome: "failed",
      outcomeLabel: "Fallado",
      whereLabel: "Serie: Táctica de la semana",
      durationLabel: "42 s",
    });
    expect(row.mistake).toEqual({
      fen: BACK_RANK,
      orientation: "white",
      playedLabel: "Td7",
      expectedLabel: "Td8#",
      // The expected move first, the played one last: it draws on top.
      arrows: [
        { from: "d1", to: "d8", tone: "success" },
        { from: "d1", to: "d7", tone: "danger" },
      ],
    });
  });

  it("el ejercicio de otro no se abre; un acierto, o «Ver la solución», no tiene error que enseñar", () => {
    const library = mapExerciseAttemptRow(
      {
        ...ATTEMPT,
        result: { code: "PASSED" },
        mistakeDetails: [],
        exercise: { ...ATTEMPT.exercise!, teacherId: null },
      },
      "t-1",
      NOW,
    );
    expect(library.href).toBeNull();
    expect(library.outcome).toBe("solved");
    expect(library.mistake).toBeNull();
    const shown = mapExerciseAttemptRow({ ...ATTEMPT, solutionShown: true }, "t-1", NOW);
    expect(shown.outcome).toBe("solutionShown");
    expect(shown.mistake).toBeNull();
  });
});

describe("mapSeriesProgress (D24)", () => {
  const ITEMS = [
    { exerciseId: "e1", title: "Uno" },
    { exerciseId: "e2", title: "Dos" },
  ];
  const STUDENTS = [
    { id: "u-a", displayName: "Ana" },
    { id: "u-b", displayName: "Bruno" },
  ];
  const attempt = (userId: string, exerciseId: string | null, code: "PASSED" | "FAILED") => ({
    userId,
    exerciseId,
    result: { code },
  });

  it("una celda por alumno y ejercicio: resuelto con un acierto, fallado con intentos sin acierto, sin intentar sin nada", () => {
    const progress = mapSeriesProgress(ITEMS, STUDENTS, [
      attempt("u-a", "e1", "FAILED"),
      attempt("u-a", "e1", "PASSED"),
      attempt("u-a", "e2", "FAILED"),
      attempt("u-a", "e2", "FAILED"),
      attempt("u-b", "e1", "PASSED"),
      attempt("u-b", "e2", "PASSED"),
      attempt("u-b", null, "PASSED"),
    ]);
    expect(progress.items).toEqual([
      { exerciseId: "e1", n: 1, title: "Uno" },
      { exerciseId: "e2", n: 2, title: "Dos" },
    ]);
    expect(progress.students[0]).toMatchObject({
      userId: "u-a",
      href: "/profesor/alumnos/u-a/ejercicios",
      cells: [
        { state: "solved", attempts: 2 },
        { state: "failed", attempts: 2 },
      ],
      solved: 1,
    });
    expect(progress.students[1]).toMatchObject({ solved: 2 });
    expect(progress.completed).toBe(1);
  });

  it("sin intentos, todo sin intentar y nadie la resolvió; sin ejercicios, nadie la resolvió tampoco", () => {
    const progress = mapSeriesProgress(ITEMS, STUDENTS, []);
    expect(progress.students.every((student) => student.cells.every((cell) => cell.state === "untried"))).toBe(true);
    expect(progress.completed).toBe(0);
    expect(mapSeriesProgress([], STUDENTS, []).completed).toBe(0);
  });
});
