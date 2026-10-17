import type { ExerciseKindCode, ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import type { PopupFormState } from "@/services/shared/form-state";
import type { TopicChoice } from "@/services/shared/topic-groups";

// The data `ExerciseAuthoring` opens with: the exercise (or a new one's
// prefill), the catalogs, the author's games and what the author may do. A
// separate module so the services that map into it import no component.

/** The exercise as the editor opens it: a saved one, or the prefill of a new one (`id` null). */
export interface ExerciseAuthoringExercise {
  id: string | null;
  /** Null for a new one, which the save creates as a draft. */
  statusCode: ExerciseStatusCode | null;
  /** The source: `[SetUp]`/`[FEN]` and the moves. Its `[FEN]` is the start position. */
  solutionPgn: string;
  kind: ExerciseKindCode;
  mateIn: number | null;
  title: string;
  prompt: string | null;
  difficulty: number;
  topicCodes: string[];
  hints: string[];
  explanation: string | null;
  sourceWhite: string | null;
  sourceBlack: string | null;
  sourceEvent: string | null;
  sourceYear: number | null;
  /** The study game it came from («Desde una partida», D11). */
  sourceGameId: string | null;
}

/** The catalogs the editor draws its choices from. */
export interface ExerciseAuthoringCatalogs {
  /** `ExerciseKind`, by code with its label. */
  kinds: { code: ExerciseKindCode; label: string }[];
  /** The Topic catalog with each topic's parent, in its order. */
  topics: TopicChoice[];
  /** The levels, for the line under «Dificultad» (`levelOfDifficulty`). */
  levels: DifficultyLevel[];
}

/** A game of the author's studies, for «Desde una partida». */
export interface ExerciseAuthoringGame {
  id: string;
  label: string;
  studyName: string;
}

/** Why the content cannot be changed: in review (the proposal is withdrawn first) or in the library (it is duplicated). */
export type ExerciseLockReason = "inReview" | "inLibrary";

/** What the author may do with this exercise (`exercise-status-transitions.ts` decides it on the server). */
export interface ExerciseAuthoringPermissions {
  /** Null: the content can be edited. */
  contentLocked: ExerciseLockReason | null;
  /** «Duplicar» is offered (with a locked content, it is the way to change it). */
  canDuplicate: boolean;
}

/** What a save button asks for: a draft kept, made ready (a teacher's), published (a lesson's), or saved as it is. */
export type ExerciseSaveIntent = "draft" | "ready" | "publish" | "save";

/** A button of the save bar: what it asks for, its words and whether it needs the exercise complete. */
export interface ExerciseSaveButton {
  intent: ExerciseSaveIntent;
  label: string;
  pendingLabel: string;
  /** The screen's one accent. */
  accent: boolean;
  /** The readiness gate must pass: the solution's rules, a title and a topic. */
  needsReadiness: boolean;
}

/** The editor's save, bound to its exercise on the server: `useActionState`'s action. */
export type ExerciseSaveAction = (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
