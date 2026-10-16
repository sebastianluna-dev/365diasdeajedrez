import { describe, expect, it } from "vitest";
import { emptySolutionPgn } from "@/lib/chess/exercise-format";
import type { ExerciseAuthoringExercise } from "./exercise-authoring.types";
import {
  defaultPrompt,
  draftFields,
  draftIssues,
  initialDraft,
  solutionFromPasted,
  solutionHasMoves,
  sourceOfPgn,
  startOfSetup,
  withSource,
} from "./exercise-draft";

const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";

const EXERCISE: ExerciseAuthoringExercise = {
  id: "ex000001",
  statusCode: "DRAFT",
  solutionPgn: `[SetUp "1"]\n[FEN "${BACK_RANK}"]\n\n1. Rd8# *`,
  kind: "SEQUENCE",
  mateIn: null,
  title: "Mate del pasillo",
  prompt: null,
  difficulty: 1000,
  topicCodes: ["BACK_RANK_MATE"],
  hints: ["Mira la última fila."],
  explanation: null,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  sourceGameId: null,
};

describe("initialDraft", () => {
  it("abre la colocación en la posición de la solución, con tres pistas", () => {
    const draft = initialDraft(EXERCISE);
    expect(draft.setup.placement).toBe("6k1/5ppp/8/8/8/8/5PPP/3R2K1");
    expect(draft.setup.turn).toBe("white");
    expect(draft.hints).toEqual(["Mira la última fila.", "", ""]);
    expect(draft.difficulty).toBe("1000");
  });

  it("empieza en la posición inicial cuando la solución no tiene una", () => {
    const draft = initialDraft({ ...EXERCISE, solutionPgn: "" });
    expect(draft.setup.placement).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    expect(solutionHasMoves(draft.solutionPgn)).toBe(false);
  });
});

describe("draftIssues", () => {
  it("no encuentra nada en un borrador completo", () => {
    expect(draftIssues(initialDraft(EXERCISE), true)).toEqual([]);
  });

  it("refiere una posición rechazada a «Posición», con su mensaje", () => {
    const draft = {
      ...initialDraft(EXERCISE),
      setup: { ...initialDraft(EXERCISE).setup, placement: "8/8/8/8/8/8/8/8" },
    };
    expect(draftIssues(draft, false)).toEqual([
      { tab: "position", field: "position", message: "Coloca al menos los dos reyes." },
    ]);
  });

  it("pide título y una dificultad de la escala, de 50 en 50", () => {
    const draft = { ...initialDraft(EXERCISE), title: " ", difficulty: "1234" };
    expect(draftIssues(draft, false).map((issue) => issue.field)).toEqual(["title", "difficulty"]);
  });

  it("para «listo» pide un tema y una solución que cumpla las reglas, cada uno en su pestaña", () => {
    const draft = { ...initialDraft(EXERCISE), topics: [], solutionPgn: emptySolutionPgn(BACK_RANK) };
    const issues = draftIssues(draft, true);
    expect(issues.map((issue) => [issue.tab, issue.field])).toEqual([
      ["solution", "solutionPgn"],
      ["data", "topics"],
    ]);
    expect(draftIssues(draft, false)).toEqual([]);
  });

  it("pide el número de un «Mate en N»", () => {
    const draft = { ...initialDraft(EXERCISE), kind: "MATE_IN" as const, mateIn: "" };
    expect(draftIssues(draft, false).map((issue) => issue.field)).toEqual(["mateIn"]);
  });
});

describe("the ways in", () => {
  it("quita lo que la colocación ya no permite y da la salida que forma", () => {
    const result = startOfSetup({
      placement: "4k3/8/8/8/8/8/8/4K3",
      turn: "black",
      castling: { K: true, Q: false, k: false, q: false },
      epSquare: null,
    });
    expect(result.setup.castling.K).toBe(false);
    expect(result.startFen).toBe("4k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(startOfSetup({ ...result.setup, placement: "8/8/8/8/8/8/8/8" }).startFen).toBeNull();
  });

  it("toma de un PGN pegado su posición y, si se quiere, sus jugadas", () => {
    const pgn = `[FEN "${BACK_RANK}"]\n\n1. Rd8# *`;
    expect(solutionHasMoves(solutionFromPasted(pgn, true) ?? "")).toBe(true);
    expect(solutionFromPasted(pgn, false)).toBe(emptySolutionPgn(BACK_RANK));
    expect(solutionFromPasted('[FEN "no"]\n\n*', true)).toBeNull();
  });

  it("lee el origen de las cabeceras y no pisa lo que escribió el autor", () => {
    const source = sourceOfPgn('[White "Morphy"]\n[Black "?"]\n[Event "París"]\n[Date "1858.??.??"]\n\n1. e4 *');
    expect(source).toEqual({ sourceWhite: "Morphy", sourceBlack: "", sourceEvent: "París", sourceYear: "1858" });
    const draft = withSource({ ...initialDraft(EXERCISE), sourceWhite: "Anderssen" }, source);
    expect([draft.sourceWhite, draft.sourceYear]).toEqual(["Anderssen", "1858"]);
  });
});

describe("the save", () => {
  it("manda cada campo por su nombre, las tres pistas y el N sólo con «Mate en N»", () => {
    const fields = draftFields(initialDraft(EXERCISE));
    expect(fields.filter(([name]) => name === "hints")).toHaveLength(3);
    expect(fields.some(([name]) => name === "mateIn")).toBe(false);
    const mate = draftFields({ ...initialDraft(EXERCISE), kind: "MATE_IN", mateIn: "1" });
    expect(mate).toContainEqual(["mateIn", "1"]);
  });

  it("dice quién juega cuando el enunciado queda vacío", () => {
    expect(defaultPrompt("black", "SEQUENCE", "")).toBe("Juegan negras");
    expect(defaultPrompt("white", "MATE_IN", "2")).toBe("Juegan blancas y dan mate en 2");
  });
});
