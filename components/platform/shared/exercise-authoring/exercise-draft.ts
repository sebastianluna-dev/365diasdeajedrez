import { INITIAL_FEN } from "chessops/fen";
import { parsePgn } from "chessops/pgn";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import {
  EXERCISE_ERROR_MESSAGES,
  SETUP_PROBLEM_MESSAGES,
  solutionProblemText,
} from "@/constants/platform/exercise-messages.const";
import { MATE_IN_MAX, emptySolutionPgn, readSolutionStart } from "@/lib/chess/exercise-format";
import { defaultExercisePrompt } from "@/lib/chess/exercise-labels";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { normalizeSetup, setupOfFen, validateSetup, type SetupInput } from "@/lib/chess/position-setup";
import type { ExerciseFormTab } from "@/services/shared/exercise-form";
import { exerciseReadiness } from "@/services/shared/exercise-status-transitions";
import type { ExerciseAuthoringExercise } from "./exercise-authoring.types";

// The exercise editor's state and its rules, pure (PLAN.md §4.2): every value
// the author edits lives here, outside the tabs, so switching tabs loses
// nothing; the save is built from it, and the same rules the server applies
// (`EXERCISE_FORM_SCHEMA`, `exerciseReadiness`) are checked on it before
// anything is sent, each problem with the tab and the field it belongs to.

/** Everything the author edits, as the controls hold it: numbers as the text typed. */
export interface ExerciseDraft {
  /** «Colocar piezas»: the board, the side to move, castling and en passant. */
  setup: SetupInput;
  /** The source; its `[FEN]` is the start, which always agrees with `setup` once that is valid. */
  solutionPgn: string;
  title: string;
  prompt: string;
  kind: ExerciseKindCode;
  /** «1»–«5», or «» for a sequence. */
  mateIn: string;
  difficulty: string;
  topics: string[];
  /** Always three: the three «Pista» inputs. */
  hints: [string, string, string];
  explanation: string;
  sourceWhite: string;
  sourceBlack: string;
  sourceEvent: string;
  sourceYear: string;
  sourceGameId: string | null;
}

/** The standard start, for a new exercise. */
export const INITIAL_SETUP: SetupInput = setupOfFen(INITIAL_FEN) ?? {
  placement: "",
  turn: "white",
  castling: { K: false, Q: false, k: false, q: false },
  epSquare: null,
};

/** The start position of a solution, or null when it does not read. */
export function startFenOf(solutionPgn: string): string | null {
  const start = readSolutionStart(solutionPgn);
  return start.ok ? start.startFen : null;
}

/** Whether the solution has moves: changing its position then takes them away, and asks first. */
export function solutionHasMoves(solutionPgn: string): boolean {
  return (parsePgnTree(solutionPgn)?.children.length ?? 0) > 0;
}

/** The draft an exercise opens with. A solution without a start (a new one) starts on the standard position. */
export function initialDraft(exercise: ExerciseAuthoringExercise): ExerciseDraft {
  const start = startFenOf(exercise.solutionPgn);
  const setup = (start && setupOfFen(start)) || INITIAL_SETUP;
  const hints = [...exercise.hints, "", "", ""].slice(0, 3) as [string, string, string];
  return {
    setup,
    solutionPgn: start ? exercise.solutionPgn : emptySolutionPgn(INITIAL_FEN),
    title: exercise.title,
    prompt: exercise.prompt ?? "",
    kind: exercise.kind,
    mateIn: exercise.mateIn === null ? "" : String(exercise.mateIn),
    difficulty: String(exercise.difficulty),
    topics: [...exercise.topicCodes],
    hints,
    explanation: exercise.explanation ?? "",
    sourceWhite: exercise.sourceWhite ?? "",
    sourceBlack: exercise.sourceBlack ?? "",
    sourceEvent: exercise.sourceEvent ?? "",
    sourceYear: exercise.sourceYear === null ? "" : String(exercise.sourceYear),
    sourceGameId: exercise.sourceGameId,
  };
}

/**
 * A setup the author changed on the board, with what it no longer allows
 * dropped (`normalizeSetup`), and the start it makes: its FEN, or null while
 * the setup is refused (the solution then stays as it was).
 */
export function startOfSetup(setup: SetupInput): { setup: SetupInput; startFen: string | null } {
  const normalized = normalizeSetup(setup);
  const checked = validateSetup(normalized);
  return { setup: normalized, startFen: checked.ok ? checked.fen : null };
}

/** The source of a game, from its headers: the four «Origen» fields, «» when absent or unknown. */
export function sourceOfPgn(
  pgn: string,
): Pick<ExerciseDraft, "sourceWhite" | "sourceBlack" | "sourceEvent" | "sourceYear"> {
  let headers = new Map<string, string>();
  try {
    headers = parsePgn(pgn)[0]?.headers ?? headers;
  } catch {
    // A PGN that does not read has no source.
  }
  const known = (name: string, max: number) => {
    const value = (headers.get(name) ?? "").trim();
    return value === "?" || value === "-" ? "" : value.slice(0, max);
  };
  const year = /^(\d{4})/.exec(headers.get("Date") ?? "")?.[1] ?? "";
  const yearNumber = Number(year);
  return {
    sourceWhite: known("White", EXERCISE_LIMITS.sourcePlayer),
    sourceBlack: known("Black", EXERCISE_LIMITS.sourcePlayer),
    sourceEvent: known("Event", EXERCISE_LIMITS.sourceEvent),
    sourceYear:
      year && yearNumber >= EXERCISE_LIMITS.sourceYearMin && yearNumber <= EXERCISE_LIMITS.sourceYearMax ? year : "",
  };
}

/** Fills the empty «Origen» fields from a source, never over what the author wrote. */
export function withSource(draft: ExerciseDraft, source: ReturnType<typeof sourceOfPgn>): ExerciseDraft {
  return {
    ...draft,
    sourceWhite: draft.sourceWhite || source.sourceWhite,
    sourceBlack: draft.sourceBlack || source.sourceBlack,
    sourceEvent: draft.sourceEvent || source.sourceEvent,
    sourceYear: draft.sourceYear || source.sourceYear,
  };
}

/**
 * «Pegar FEN o PGN», once `readPositionInput` accepted it: the start of that
 * PGN and, if wanted and it has any, its moves as the solution; otherwise an
 * empty solution on that start. Null when its start does not read.
 */
export function solutionFromPasted(pgn: string, useMoves: boolean): string | null {
  const start = readSolutionStart(pgn);
  if (!start.ok) return null;
  return useMoves && start.solutionPlies > 0 ? start.normalizedPgn : emptySolutionPgn(start.startFen);
}

/** What the prompt says when the author leaves it empty: the side to move, and the mate's length. */
export function defaultPrompt(turn: SetupInput["turn"], kind: ExerciseKindCode, mateIn: string): string {
  return defaultExercisePrompt(turn, kind, mateIn ? Number.parseInt(mateIn, 10) || null : null);
}

/** The save's fields, by name, from the draft: what the hidden inputs carry (`EXERCISE_FORM_SCHEMA`). */
export function draftFields(draft: ExerciseDraft): [name: string, value: string][] {
  return [
    ["solutionPgn", draft.solutionPgn],
    ["title", draft.title],
    ["prompt", draft.prompt],
    ["kind", draft.kind],
    ...(draft.kind === EXERCISE_KIND.MATE_IN ? ([["mateIn", draft.mateIn]] as [string, string][]) : []),
    ["difficulty", draft.difficulty],
    ...draft.topics.map((topic): [string, string] => ["topics", topic]),
    ...draft.hints.map((hint): [string, string] => ["hints", hint]),
    ["explanation", draft.explanation],
    ["sourceWhite", draft.sourceWhite],
    ["sourceBlack", draft.sourceBlack],
    ["sourceEvent", draft.sourceEvent],
    ["sourceYear", draft.sourceYear],
    ["sourceGameId", draft.sourceGameId ?? ""],
  ];
}

/** The tab a field of the save belongs to. */
export function tabOfField(field: string): ExerciseFormTab {
  if (field === "position") return "position";
  if (field === "solutionPgn") return "solution";
  return "data";
}

/** A problem the save would refuse, where it is shown. */
export interface DraftIssue {
  tab: ExerciseFormTab;
  /** The field it is said under: a save field's name, or «position». */
  field: string;
  message: string;
}

const isInteger = (value: string) => /^-?\d+$/.test(value.trim());

/**
 * What the server would refuse, checked on the draft before sending, in the
 * order of the tabs: the position, then «Datos»' fields, then — when the
 * button asks for the exercise complete — the solution's rules and a topic.
 * Empty when the save may go.
 */
export function draftIssues(draft: ExerciseDraft, needsReadiness: boolean): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const setup = validateSetup(draft.setup);
  if (!setup.ok) {
    issues.push({ tab: "position", field: "position", message: SETUP_PROBLEM_MESSAGES[setup.problem] });
  } else if (startFenOf(draft.solutionPgn) === null) {
    issues.push({ tab: "position", field: "position", message: EXERCISE_ERROR_MESSAGES.badPosition ?? "" });
  }

  const data = (field: string) => issues.push({ tab: "data", field, message: EXERCISE_ERROR_MESSAGES[field] ?? "" });
  if (draft.title.trim().length === 0) data("title");
  if (draft.kind === EXERCISE_KIND.MATE_IN) {
    const mateIn = Number(draft.mateIn);
    if (!isInteger(draft.mateIn) || mateIn < 1 || mateIn > MATE_IN_MAX) data("mateIn");
  }
  const difficulty = Number(draft.difficulty);
  if (
    !isInteger(draft.difficulty) ||
    difficulty < EXERCISE_LIMITS.difficultyMin ||
    difficulty > EXERCISE_LIMITS.difficultyMax ||
    difficulty % EXERCISE_LIMITS.difficultyStep !== 0
  ) {
    data("difficulty");
  }
  if (draft.sourceYear.trim()) {
    const year = Number(draft.sourceYear);
    if (!isInteger(draft.sourceYear) || year < EXERCISE_LIMITS.sourceYearMin || year > EXERCISE_LIMITS.sourceYearMax) {
      data("sourceYear");
    }
  }

  const positionBroken = issues.some((issue) => issue.tab === "position");
  if (needsReadiness && !positionBroken) {
    const mateIn = draft.kind === EXERCISE_KIND.MATE_IN ? Number(draft.mateIn) : null;
    const readiness = exerciseReadiness({
      title: draft.title,
      solutionPgn: draft.solutionPgn,
      kind: draft.kind,
      mateIn,
      topicCount: draft.topics.length,
      explanation: draft.explanation || null,
    });
    const [problem] = readiness.solution;
    if (problem) {
      issues.push({
        tab: "solution",
        field: "solutionPgn",
        message: solutionProblemText(problem, draft.solutionPgn, mateIn),
      });
    }
    if (readiness.missing.includes("topic")) data("topics");
  }
  // In the order of the tabs, so the first is where the editor goes.
  const order: ExerciseFormTab[] = ["position", "solution", "data"];
  return issues.sort((left, right) => order.indexOf(left.tab) - order.indexOf(right.tab));
}
