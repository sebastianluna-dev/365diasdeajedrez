import { makePgn, parsePgn, type Game, type PgnNodeData } from "chessops/pgn";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import {
  analyzeSolution,
  dropMistakeVariants,
  MATE_IN_MAX,
  readSolutionStart,
  type SolutionInput,
  type SolutionProblem,
  type SolutionWarning,
} from "@/lib/chess/exercise-format";
import { numberedMoveLabel } from "@/lib/chess/notation";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { createPositionHash } from "@/lib/chess/position-hash";
import { foldForSearch } from "@/lib/fold-for-search";
import type { ExerciseContent } from "./exercise-record.service";
import { exerciseReadiness } from "./exercise-status-transitions";

// The PGN import of exercises (D12; PLAN.md §4.5), the pure part: a file with
// several games becomes one exercise per game, and each game gets a row of
// the report the author reads before anything is written — what will be
// imported, what as a draft and why, what will not and why. The actions
// (the teacher's and the staff's) read the file with this on «Revisar» and
// again on «Importar», and write only what this accepts, each through
// `createExerciseRecord`. The conventions of the file are in docs → Platform
// → Exercises → Import.
//
// Pure module: chessops and the exercise's own pure rules, no Prisma and no
// session. Whoever calls it says whose exercises the duplicates are checked
// against and what the accepted ones become.

/** The headers of ours a game may carry, besides the PGN's own. */
export const EXERCISE_PGN_HEADERS = {
  title: "Title",
  prompt: "Prompt",
  difficulty: "Difficulty",
  topics: "Topics",
  mateIn: "MateIn",
  hints: ["Hint1", "Hint2", "Hint3"],
  explanation: "Explanation",
} as const;

/** What the author chose for what the headers do not say. */
export interface ExerciseImportDefaults {
  /** 400–3000, a multiple of 50: for a game without `[Difficulty]`, or with one that does not read. */
  difficulty: number;
  /** The kind of a game without `[MateIn]`; with the header, the game is «Mate en N» whatever this says. */
  kind: ExerciseKindCode;
  /** The N of a «Mate en N» by default (1–5); null with a sequence. */
  mateIn: number | null;
  /** For a game without `[Topics]` (or whose topics are all unknown). */
  topicCodes: string[];
  /** «Eliminar las variantes marcadas como error»: a player variant carrying ?, ?? or ?! is dropped before reading. */
  dropMistakeVariants: boolean;
  /**
   * What the accepted ones become: a draft, or the author's «ready» — READY
   * for a teacher («Listo»), PUBLISHED for the staff («En la biblioteca»),
   * which also asks for the explanation — when the exercise passes the
   * readiness gate; the rest go in as drafts, and the row says why.
   */
  target: "draft" | "ready" | "library";
}

/** A topic as the import matches `[Topics]`: by code or by label, case and accents aside. */
export interface ExerciseImportTopic {
  code: string;
  label: string;
}

/** What «Ya está en tus ejercicios» compares against: the author's exercises, by start and first move. */
export interface ExistingExerciseKey {
  startPositionHash: string;
  /** The first move of the solution as stored, or null for a draft without moves. */
  firstSan: string | null;
}

/** Why a game is left out. */
export type ExerciseImportRefusal =
  | { code: "noFen" }
  | { code: "unreadable" }
  | { code: "badPosition" }
  | { code: "unsupportedVariant" }
  | { code: "duplicate" }
  | { code: "repeated" }
  | { code: "overLimit" }
  /** A problem `analyzeSolution` found: the row says it in words. */
  | { code: "solution"; problem: SolutionProblem };

/** What a row says besides its outcome. */
export type ExerciseImportNote =
  /** A variant marked as a mistake was dropped before reading (`path` in the game as it came). */
  | { code: "droppedVariant"; label: string }
  /** Several player moves are accepted at some point: the author should know. */
  | { code: "alternatives"; sans: string[] }
  /** `[MateIn]` did not read as 1–5: the game is read with the default kind. */
  | { code: "mateInIgnored" }
  /** `[Difficulty]` did not read as 400–3000: the default is used. */
  | { code: "difficultyIgnored" }
  /** A topic of `[Topics]` is nobody's: it was skipped. */
  | { code: "unknownTopics"; names: string[] };

/** What the accepted row becomes: the solution and the content, as the writers take them. */
export interface ExerciseImportRecord {
  solution: SolutionInput;
  content: ExerciseContent;
}

export type ExerciseImportRow = {
  /** Its place in the file, from 1. */
  index: number;
  title: string;
  notes: ExerciseImportNote[];
} & (
  | {
      /** It will be imported with the status the author asked for. */
      outcome: "ready";
      record: ExerciseImportRecord;
    }
  | {
      /** It will be imported as a draft: the author asked for more, and it lacks these. */
      outcome: "draft";
      record: ExerciseImportRecord;
      missing: ("topic" | "explanation")[];
    }
  | { outcome: "skipped"; refusal: ExerciseImportRefusal }
);

export interface ExerciseImportReading {
  rows: ExerciseImportRow[];
  counts: { ready: number; draft: number; skipped: number };
  /** The accepted rows, in the file's order: what «Importar» writes. */
  accepted: Extract<ExerciseImportRow, { outcome: "ready" | "draft" }>[];
}

const UNKNOWN = "?";

function header(game: Game<PgnNodeData>, name: string): string | null {
  const value = game.headers.get(name)?.trim();
  return value && value !== UNKNOWN ? value : null;
}

/** A header cut to its column's size. */
function text(game: Game<PgnNodeData>, name: string, max: number): string | null {
  const value = header(game, name);
  return value ? value.slice(0, max) : null;
}

/** `[Date "1895.??.??"]`: the year, when it is one the column takes. */
function yearOf(game: Game<PgnNodeData>): number | null {
  const match = /^(\d{4})/.exec(header(game, "Date") ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  return year >= EXERCISE_LIMITS.sourceYearMin && year <= EXERCISE_LIMITS.sourceYearMax ? year : null;
}

/** «Blancas – Negras, 1895», the game's own title, or «Ejercicio N». */
function titleOf(game: Game<PgnNodeData>, index: number): string {
  const own = text(game, EXERCISE_PGN_HEADERS.title, EXERCISE_LIMITS.title);
  if (own) return own;
  const white = header(game, "White");
  const black = header(game, "Black");
  if (white || black) {
    const players = `${white ?? "Blancas"} – ${black ?? "Negras"}`;
    const year = yearOf(game);
    return (year ? `${players}, ${year}` : players).slice(0, EXERCISE_LIMITS.title);
  }
  return `Ejercicio ${index}`;
}

/** `[Difficulty "1400"]`: an integer snapped to the editor's step and inside the CHECK, or null. */
function difficultyOf(game: Game<PgnNodeData>): number | null | "ignored" {
  const raw = header(game, EXERCISE_PGN_HEADERS.difficulty);
  if (raw === null) return null;
  if (!/^\d+$/.test(raw)) return "ignored";
  const { difficultyMin, difficultyMax, difficultyStep } = EXERCISE_LIMITS;
  const snapped = Math.round(Number(raw) / difficultyStep) * difficultyStep;
  return snapped >= difficultyMin && snapped <= difficultyMax ? snapped : "ignored";
}

/** `[MateIn "2"]`: 1–5, or `"ignored"` for a header that does not read as one; null without it. */
function mateInOf(game: Game<PgnNodeData>): number | null | "ignored" {
  const raw = header(game, EXERCISE_PGN_HEADERS.mateIn);
  if (raw === null) return null;
  const value = /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
  return Number.isInteger(value) && value >= 1 && value <= MATE_IN_MAX ? value : "ignored";
}

/** `[Topics "FORK, Clavada"]`: the codes found by code or label, and the names nobody has. */
function topicsOf(
  game: Game<PgnNodeData>,
  topics: readonly ExerciseImportTopic[],
): { codes: string[]; unknown: string[] } {
  const raw = header(game, EXERCISE_PGN_HEADERS.topics);
  if (raw === null) return { codes: [], unknown: [] };
  const byKey = new Map<string, string>();
  for (const topic of topics) {
    byKey.set(foldForSearch(topic.code), topic.code);
    byKey.set(foldForSearch(topic.label), topic.code);
  }
  const codes: string[] = [];
  const unknown: string[] = [];
  for (const name of raw.split(/[,;]/)) {
    const key = foldForSearch(name);
    if (!key) continue;
    const code = byKey.get(key);
    if (code === undefined) unknown.push(name.trim());
    else if (!codes.includes(code)) codes.push(code);
  }
  return { codes, unknown };
}

/** The first move of a solution as its tree reads it, for the duplicate check. */
export function firstSanOf(solutionPgn: string): string | null {
  return parsePgnTree(solutionPgn)?.children[0]?.san ?? null;
}

/** «14. Cxe5»: the move at a path of the game as it came, in Spanish, to name a dropped variant. */
function moveLabel(pgn: string, path: string): string {
  const node = parsePgnTree(pgn)?.nodesByPath.get(path);
  return node ? numberedMoveLabel(node.ply, node.san) : `la jugada ${path.split(".").length}`;
}

function alternativesOf(warnings: readonly SolutionWarning[]): ExerciseImportNote[] {
  return warnings.flatMap((warning) =>
    warning.code === "playerAlternatives" ? [{ code: "alternatives" as const, sans: warning.sans }] : [],
  );
}

function readEntries(pgnText: string): Game<PgnNodeData>[] {
  try {
    return parsePgn(pgnText);
  } catch {
    return [];
  }
}

/**
 * Whether an entry is a game somebody wrote and not loose text around one: a
 * `[FEN]`, moves, or a header that says something besides the result.
 */
function namesAGame(game: Game<PgnNodeData>): boolean {
  if (game.moves.children.length > 0) return true;
  return [...game.headers].some(([name, value]) => name !== "Result" && /[^?.\s]/.test(value));
}

/**
 * Reads a PGN as exercises, one per game, and says of each what will happen
 * to it. Nothing is written here: the actions write the `accepted` rows.
 *
 * - `[FEN]` is required: the start position. A game without it is left out.
 * - The movetext is the solution with its variants (accepted alternatives,
 *   D02) and comments. With `dropMistakeVariants`, a player variant marked
 *   ?, ?? or ?! is dropped first and the row says so; without it, such a
 *   variant is what `analyzeSolution` refuses.
 * - A solution the readiness gate refuses — no moves, an illegal move, a
 *   «Mate en N» that does not mate — is left out with the problem in words,
 *   because an exercise that cannot be ready is not worth a draft nobody can
 *   finish from the file.
 * - A game whose start and first move match one of the author's exercises
 *   (`existing`) is left out as a duplicate; a second copy in the same file,
 *   as repeated.
 * - Past `PGN_MAX_GAMES`, the rest are left out as over the limit.
 * - What the author asked for (`defaults.target`) is given to each accepted
 *   game that passes the gate; the ones that lack a topic (or, for the
 *   library, an explanation) go in as drafts, and the row says what they lack.
 */
export function readExerciseImport(
  pgnText: string,
  defaults: ExerciseImportDefaults,
  topics: readonly ExerciseImportTopic[],
  existing: readonly ExistingExerciseKey[],
): ExerciseImportReading {
  const rows: ExerciseImportRow[] = [];
  const seen = new Set(existing.map((key) => `${key.startPositionHash} ${key.firstSan ?? ""}`));
  const inFile = new Set<string>();
  let index = 0;

  for (const game of readEntries(pgnText)) {
    if (!namesAGame(game)) continue;
    index += 1;
    const notes: ExerciseImportNote[] = [];
    const title = titleOf(game, index);
    const skip = (refusal: ExerciseImportRefusal): ExerciseImportRow => ({
      index,
      title,
      notes,
      outcome: "skipped",
      refusal,
    });

    if (index > PGN_MAX_GAMES) {
      rows.push(skip({ code: "overLimit" }));
      continue;
    }
    if (!game.headers.has("FEN")) {
      rows.push(skip({ code: "noFen" }));
      continue;
    }

    // The kind and the N: the header wins over the default.
    const mateIn = mateInOf(game);
    if (mateIn === "ignored") notes.push({ code: "mateInIgnored" });
    const kind: ExerciseKindCode = typeof mateIn === "number" ? EXERCISE_KIND.MATE_IN : defaults.kind;
    const n = typeof mateIn === "number" ? mateIn : kind === EXERCISE_KIND.MATE_IN ? defaults.mateIn : null;

    // The solution as it came, then without its marked mistakes if asked.
    const asCame = makePgn(game);
    let solutionPgn = asCame;
    if (defaults.dropMistakeVariants) {
      const before = analyzeSolution({ solutionPgn: asCame, kind, mateIn: n });
      if (!before.ok) {
        for (const problem of before.problems) {
          if (problem.code === "mistakeVariant")
            notes.push({ code: "droppedVariant", label: moveLabel(asCame, problem.path) });
        }
      }
      solutionPgn = dropMistakeVariants(asCame);
    }

    const start = readSolutionStart(solutionPgn);
    if (!start.ok) {
      rows.push(skip({ code: start.problem }));
      continue;
    }
    const analysis = analyzeSolution({ solutionPgn, kind, mateIn: n });
    if (!analysis.ok) {
      const [problem] = analysis.problems;
      rows.push(skip(problem ? { code: "solution", problem } : { code: "unreadable" }));
      continue;
    }
    notes.push(...alternativesOf(analysis.warnings));

    // The duplicate check: the author's, then the file's own.
    const key = `${createPositionHash(start.startFen)} ${firstSanOf(start.normalizedPgn) ?? ""}`;
    if (seen.has(key)) {
      rows.push(skip({ code: "duplicate" }));
      continue;
    }
    if (inFile.has(key)) {
      rows.push(skip({ code: "repeated" }));
      continue;
    }
    inFile.add(key);

    // The content: the headers, the defaults for what they do not say.
    const difficulty = difficultyOf(game);
    if (difficulty === "ignored") notes.push({ code: "difficultyIgnored" });
    const { codes, unknown } = topicsOf(game, topics);
    if (unknown.length > 0) notes.push({ code: "unknownTopics", names: unknown });
    const hints = EXERCISE_PGN_HEADERS.hints.flatMap((name) => {
      const hint = text(game, name, EXERCISE_LIMITS.hint);
      return hint ? [hint] : [];
    });
    const record: ExerciseImportRecord = {
      solution: { solutionPgn: start.normalizedPgn, kind, mateIn: n },
      content: {
        title,
        prompt: text(game, EXERCISE_PGN_HEADERS.prompt, EXERCISE_LIMITS.prompt),
        difficulty: typeof difficulty === "number" ? difficulty : defaults.difficulty,
        hints,
        explanation: text(game, EXERCISE_PGN_HEADERS.explanation, EXERCISE_LIMITS.explanation),
        sourceWhite: text(game, "White", EXERCISE_LIMITS.sourcePlayer),
        sourceBlack: text(game, "Black", EXERCISE_LIMITS.sourcePlayer),
        sourceEvent: text(game, "Event", EXERCISE_LIMITS.sourceEvent),
        sourceYear: yearOf(game),
        topicCodes: codes.length > 0 ? codes : [...defaults.topicCodes],
      },
    };

    if (defaults.target === "draft") {
      rows.push({ index, title, notes, outcome: "ready", record });
      continue;
    }
    const readiness = exerciseReadiness(
      {
        title,
        solutionPgn: record.solution.solutionPgn,
        kind,
        mateIn: n,
        topicCount: record.content.topicCodes.length,
        explanation: record.content.explanation,
      },
      { explanation: defaults.target === "library" },
    );
    const missing = readiness.missing.filter((item): item is "topic" | "explanation" => item !== "title");
    if (readiness.ok) rows.push({ index, title, notes, outcome: "ready", record });
    else rows.push({ index, title, notes, outcome: "draft", record, missing });
  }

  const accepted = rows.filter(
    (row): row is Extract<ExerciseImportRow, { outcome: "ready" | "draft" }> => row.outcome !== "skipped",
  );
  return {
    rows,
    counts: {
      ready: rows.filter((row) => row.outcome === "ready").length,
      draft: rows.filter((row) => row.outcome === "draft").length,
      skipped: rows.filter((row) => row.outcome === "skipped").length,
    },
    accepted,
  };
}
